"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildSentence, speak } from "./speech";
import { resolveBoard } from "./resolve";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import GameFrame, { useBoardSize } from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import { reviewItemByFrench } from "@/lib/reviser";
import { logEvent } from "@/lib/firebase/usage";
import { shuffle } from "@/lib/shuffle";
import { buildEvidence } from "@/lib/evidence";

export type LetrisCategory = {
  key: string;
  label: string;
  /** Literal prefix prepended when building the target sentence (e.g. "Il fait ", "Le ", "L'", ""). */
  prefix?: string;
};
export type LetrisTile = {
  text: string;
  category: string;
  /** Proper-cased form used in sentences / TTS (e.g. "beau", "Japon"). Defaults to text.toLowerCase(). */
  displayName?: string;
  meaning?: string;
  emoji?: string;
  /** Other columns that are ALSO right for this tile.
   *
   *  Dan, 5 Sep: "if ever we include le/les prix in the vocabularin, it
   *  should be allowed to fall into un or into des (unless we specify that we
   *  mean prix (sg.) or prix (pl.)". « prix » is invariable — un prix, des
   *  prix — so a single correct column would mark a right answer wrong. Any
   *  invariable noun (prix, temps, fois, bras) is the same case, as is a word
   *  that genuinely takes two articles.
   *
   *  The tile still BELONGS to `category` — that is where it is listed and
   *  what a miss is told to aim for; `also` only widens what counts as right.
   *  Nothing uses it yet: prix is not in the commerces rain today.
   *
   *  NOT FOR « IL FAIT DU SOLEIL ». It is the obvious candidate and it has now
   *  been ruled out twice — 24 Aug ("« Il fait du soleil » stays WRONG — the
   *  Atelier corrigé is the examined standard") and again on 5 Sep, when a tile
   *  audit reopened it: "I want to DROP il fait du soleil and il fait du vent —
   *  instead teach il y a du soleil il y a du vent". Widely said is not the
   *  test; what the examined standard accepts is. `also` is for a form the
   *  course TEACHES in two columns, not for a colloquialism it declines to
   *  teach. */
  also?: string[];
};
export type LetrisSet = {
  id: string;
  title: string;
  subtitle?: string;
  language?: string;
  categories: LetrisCategory[];
  tiles: LetrisTile[];
};

type Cell = LetrisTile | null;
type Active = { tile: LetrisTile; row: number; col: number };

const ROWS = 10;
const INITIAL_TICK_MS = 800;
const MIN_TICK_MS = 260;
const SPEEDUP_EVERY = 6;
/* Nightfall (Dan, 2026-07-03): the sky darkens and a FEW letters on each
 * falling word go unclear, so the learner recalls the word from knowledge
 * rather than reading it. It only falls once every word has been correctly
 * categorised MORE than twice, and then the rain + music slow dramatically. */
const NIGHT_CORRECT_EACH = 2; // day→night: each word sorted correctly > this many times
const NIGHT_RAIN_SLOW = 3.2; // tiles fall this many× slower at night (storm = normal speed)
const NIGHT_MUSIC_SLOW = 2.2; // music tempo scale at night (storm = normal tempo)
/* The weather CYCLE (Dan, 2026-07-04): ☀️ day → 🌙 night (slow + blurred, the
 * crutch) → ⛈️ storm (normal speed, still blurred — memory at full tempo) →
 * 🌅 dawn (= day again; tallies reset, fanfare, the cycle can repeat).
 * night→storm and storm→dawn each require every word sorted correctly ONCE
 * more within that phase. Mercy: 3 misses during the storm → back to night. */
const PHASE_CORRECT_EACH = 1;
const STORM_MERCY_MISSES = 3;
/* Each session plays a random hand of at most this many tiles per category
 * (Dan, 2026-07-04) — big sets stay fresh across replays, and the pre-game
 * study table shows exactly the hand that will fall. */
const MAX_PER_CATEGORY = 4;
type Phase = "day" | "night" | "storm";
type PhaseMsg = "night" | "storm" | "dawn" | "mercy";

/** Which letter positions the dark hides — deterministic per word (the same
 *  word is always unclear in the same places), never the first letter. At most
 *  20% of the word's letters are obscured (Dan: ≥80% must stay legible — 1 in 5
 *  at most), so a 5-letter word loses one, a 4-letter word none. */
function nightMask(text: string): Set<number> {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  const letters: number[] = [];
  let totalLetters = 0;
  for (let i = 0; i < text.length; i++) {
    if (!/\p{L}/u.test(text[i])) continue;
    totalLetters++;
    if (i > 0) letters.push(i); // never the first letter
  }
  const want = Math.min(letters.length, Math.floor(totalLetters * 0.2));
  const out = new Set<number>();
  for (let k = 0; out.size < want && k < letters.length * 3; k++) {
    out.add(letters[(h + k * 7) % letters.length]);
  }
  return out;
}

/* One colour per category (the base + every tile that belongs to it). Revealed
 * only when a tile lands — while falling, a tile is a neutral RAINDROP (the
 * Vocabularain story: words rain from the sky, you steer each drop into the
 * right puddle). Darkened so white tile text meets WCAG AA (>=4.5:1). */
const PALETTE = [
  "#c62828", // red
  "#0d6aa8", // blue
  "#2e7d0f", // green
  "#7b3fb5", // purple
  "#a85b00", // orange
  "#0e7c72", // teal
  "#b03a5f", // pink
];


/** This session's hand: at most MAX_PER_CATEGORY random tiles per category. */
function sampleTiles(tiles: LetrisTile[]): LetrisTile[] {
  const byCat = new Map<string, LetrisTile[]>();
  for (const t of tiles) {
    const arr = byCat.get(t.category) ?? [];
    arr.push(t);
    byCat.set(t.category, arr);
  }
  const pool: LetrisTile[] = [];
  for (const arr of byCat.values()) pool.push(...shuffle(arr).slice(0, MAX_PER_CATEGORY));
  return pool;
}
function emptyBoard(cols: number): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(cols).fill(null));
}

/** The falling word at night: its masked letters are smudged into the dark —
 *  still occupying their space, no longer readable — so the learner completes
 *  the word from memory. */
function NightWord({ text }: { text: string }) {
  const masked = nightMask(text);
  return (
    <span aria-label={text.length + " letters"}>
      {text.split("").map((ch, i) =>
        masked.has(i) ? (
          <span key={i} style={{ filter: "blur(3.5px)", opacity: 0.45 }} aria-hidden>
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

export default function LetrisGame({
  set,
  onGameEnd,
  speech = true,
}: {
  set: LetrisSet;
  onGameEnd?: (score: number) => void;
  speech?: boolean;
}) {
  const cols = set.categories.length;
  const catIndex = useMemo(() => {
    const m = new Map<string, number>();
    set.categories.forEach((c, i) => m.set(c.key, i));
    return m;
  }, [set.categories]);

  const catColor = useCallback((i: number) => PALETTE[i % PALETTE.length], []);
  // A tile's TRUE colour = the colour of the column it really belongs to.
  const colorOf = useCallback(
    (t: LetrisTile) => catColor(catIndex.get(t.category) ?? 0),
    [catColor, catIndex],
  );

  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard(cols));
  const [active, setActive] = useState<Active | null>(null);
  const [pool, setPool] = useState<LetrisTile[]>(() => sampleTiles(set.tiles));
  const [queue, setQueue] = useState<LetrisTile[]>(() => shuffle(pool));
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(false);
  // Apply the shared volume (fluolingo:volume) on mount; the slider itself
  // now lives inside the SoundControl popover on the game bar (Dan, 2026-07-10:
  // the game interface was missing the full sound controls).
  useEffect(() => {
    try {
      const v = parseFloat(window.localStorage.getItem("fluolingo:volume") ?? "");
      if (!Number.isNaN(v)) chiptune.setVolume(v);
    } catch {}
  }, []);
  const [tts, setTts] = useState(true);
  const [phase, setPhase] = useState<Phase>("day");
  const [phaseMsg, setPhaseMsg] = useState<PhaseMsg | null>(null);
  const phaseRef = useRef<Phase>("day");
  // eslint-disable-next-line react-hooks/refs -- a LIVE ref: written during render so an async callback reads the current value, not the one captured when it was created.
  phaseRef.current = phase;
  // Lifetime per-word correct tally (drives day→night); per-PHASE tally (each
  // word once more within night / within storm); storm misses for the mercy rule.
  const correctRef = useRef<Map<string, number>>(new Map());
  const phaseCorrectRef = useRef<Map<string, number>>(new Map());
  const stormMissesRef = useRef(0);
  const wordTexts = useMemo(() => [...new Set(pool.map((t) => t.text))], [pool]);
  const musicAutoRef = useRef(false);
  const musicRef = useRef(false);
  // eslint-disable-next-line react-hooks/refs -- a LIVE ref: written during render so an async callback reads the current value, not the one captured when it was created.
  musicRef.current = music;
  const dawnTimerRef = useRef<number | null>(null);
  // First interaction — key OR tap — starts the tune (both are user gestures,
  // so the AudioContext may be created). Keydown-only left tap players silent
  // until it was "too late" (Dan, 2026-07-03).
  const autoMusic = useCallback(() => {
    if (musicAutoRef.current) return;
    musicAutoRef.current = true;
    chiptune.play("letris");
    setMusic(true);
  }, []);
  useEffect(() => () => {
    chiptune.stop();
    if (dawnTimerRef.current) window.clearTimeout(dawnTimerRef.current);
  }, []); // stop on unmount, cancel any pending dawn restart
  const [gameOver, setGameOver] = useState(false);
  // Every drop, for the desktop live record; the wrong ones feed the
  // post-mortem (patch 23).
  const [drops, setDrops] = useState<Array<{ text: string; want: string; got: string; ok: boolean }>>([]);
  // true while the ⋯ sheet holds the rain (not the learner's own pause).
  const [menuAuto, setMenuAuto] = useState(false);
  const onGameEndRef = useRef(onGameEnd);
  // eslint-disable-next-line react-hooks/refs -- a LIVE ref: written during render so an async callback reads the current value, not the one captured when it was created.
  onGameEndRef.current = onGameEnd;
  useEffect(() => {
    if (gameOver) {
      onGameEndRef.current?.(score);
      void logEvent("game.end", { game: "letris", collectionId: set.id, score });
    }
  }, [gameOver]); // eslint-disable-line react-hooks/exhaustive-deps
  const [flash, setFlash] = useState<{ col: number; kind: "ok" | "bad" } | null>(null);
  // The full sentence a correct catch SPEAKS ("Le café.") never appeared as
  // text anywhere — only the bare tile word does, and the article/prefix must
  // stay off the falling tile itself (it would hand the learner the sorting
  // answer). So it's written out here, briefly, synced with the TTS, right
  // after the sort decision is already made (Dan, 2026-08-03).
  const [sentenceFlash, setSentenceFlash] = useState<string | null>(null);
  const [creditsDone, setCreditsDone] = useState(false); // hold tiles until the credits splash clears
  // The play actually begins when the credits clear (Dan, 2026-07-15: the
  // Activities panel showed zero because game events were never wired).
  useEffect(() => {
    if (creditsDone) void logEvent("game.start", { game: "letris", collectionId: set.id });
  }, [creditsDone]); // eslint-disable-line react-hooks/exhaustive-deps
  // Pre-game study table (Dan, 2026-07-04: "always present the table of items
  // at the start of the game for learners to take note") — tiles hold until
  // the learner has seen the full item list and pressed start.
  const [studied, setStudied] = useState(false);

  const tickRef = useRef(INITIAL_TICK_MS);
  const lastDropRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ board, active, queue, paused, gameOver });
  // eslint-disable-next-line react-hooks/refs -- a LIVE ref: written during render so an async callback reads the current value, not the one captured when it was created.
  stateRef.current = { board, active, queue, paused, gameOver };

  const spawnTile = useCallback(() => {
    setQueue((q) => {
      let next = q;
      if (next.length === 0) next = shuffle(pool);
      const tile = next[0];
      const startCol = Math.floor(Math.random() * cols);
      setActive({ tile, row: 0, col: startCol });
      return next.slice(1);
    });
  }, [pool, cols]);

  const restart = useCallback(() => {
    setBoard(emptyBoard(cols));
    setActive(null);
    // New game, new hand — and the study table reopens to show it.
    const fresh = sampleTiles(set.tiles);
    setPool(fresh);
    setQueue(shuffle(fresh));
    setStudied(false);
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setFlash(null);
    setDrops([]);
    // dawn breaks again
    setPhase("day");
    setPhaseMsg(null);
    correctRef.current.clear();
    phaseCorrectRef.current.clear();
    stormMissesRef.current = 0;
    if (dawnTimerRef.current) { window.clearTimeout(dawnTimerRef.current); dawnTimerRef.current = null; }
    if (chiptune.playing() === "storm") chiptune.play("letris");
    else chiptune.setTempoScale(1);
    tickRef.current = INITIAL_TICK_MS;
  }, [cols, set.tiles]);

  const landTile = useCallback(
    (a: Active) => {
      // Right if it landed in its own column OR in one its `also` names.
      const correct = [a.tile.category, ...(a.tile.also ?? [])].some(
        (k) => catIndex.get(k) === a.col,
      );
      // Every drop is a graded sorting answer — record it (Dan, 2026-07-13:
      // "every question, every attempt"). Direct write, NOT recordItemResult:
      // Letris has its own scoring and must not double-pay XP per tile.
      void import("@/lib/firebase/responses")
        .then((m) => m.recordResponse(a.tile.text, correct, {
          given: set.categories[a.col]?.label ?? String(a.col),
          activity: `letris:${set.id}`,
          evidence: buildEvidence(a.tile.text, `letris:${set.id}`),
        }))
        .catch(() => {});
      setFlash({ col: a.col, kind: correct ? "ok" : "bad" });
      window.setTimeout(() => setFlash(null), 220);
      setDrops((d) => [
        ...d,
        {
          text: a.tile.displayName ?? a.tile.text,
          want: set.categories[catIndex.get(a.tile.category) ?? 0]?.label ?? a.tile.category,
          got: set.categories[a.col]?.label ?? String(a.col),
          ok: correct,
        },
      ]);
      // Enter a new weather phase: swap state, reset the per-phase tally, show
      // the explainer (pausing the fall), and match the music tempo to the sky.
      const enterPhase = (next: Phase, msg: PhaseMsg) => {
        setPhase(next);
        phaseCorrectRef.current.clear();
        stormMissesRef.current = 0;
        setPhaseMsg(msg);
        setPaused(true);
        const playing = chiptune.playing();
        if (playing) {
          if (next === "storm") {
            chiptune.play("storm");
          } else if (next === "night") {
            // coming from day or from storm (mercy) → letris at night tempo
            if (playing !== "letris") chiptune.play("letris");
            chiptune.setTempoScale(NIGHT_MUSIC_SLOW);
          }
          // "day" (dawn) is handled in the dawn branch: storm stopped before
          // fanfare fires; letris restarts via dawnTimerRef after ~2.2 s
        }
      };

      // Dawn plays the big fanfare below — the small ta-daa would double it.
      let dawnFanfare = false;
      if (correct) {
        const sentence = buildSentence(set.categories[a.col], a.tile);
        if (speech && tts) speak(
          sentence,
          set.language ? `${set.language}-FR` : "fr-FR",
          { interrupt: false },
        );
        setSentenceFlash(sentence);
        window.setTimeout(() => setSentenceFlash(null), 2000);
        const m = correctRef.current;
        m.set(a.tile.text, (m.get(a.tile.text) ?? 0) + 1);
        const pm = phaseCorrectRef.current;
        pm.set(a.tile.text, (pm.get(a.tile.text) ?? 0) + 1);
        const phaseCleared = wordTexts.every((w) => (pm.get(w) ?? 0) >= PHASE_CORRECT_EACH);
        if (phaseRef.current === "day") {
          // Night falls once EVERY word has been sorted correctly more than twice.
          if (wordTexts.every((w) => (m.get(w) ?? 0) > NIGHT_CORRECT_EACH)) enterPhase("night", "night");
        } else if (phaseRef.current === "night") {
          // Re-proven every word in the dark → the crutch goes: storm at full speed.
          if (phaseCleared) enterPhase("storm", "storm");
        } else if (phaseRef.current === "storm" && phaseCleared) {
          // Survived the storm → dawn breaks; lifetime tallies reset so the
          // whole cycle can be earned again.
          dawnFanfare = true;
          correctRef.current.clear();
          // Stop the storm track first so fanfare plays clean; then after the
          // jingle (~2.2 s), restart letris at normal tempo if music is still on.
          if (chiptune.playing()) chiptune.stop();
          sfx.stage(); // the dawn fanfare, plus the site-wide confetti
          if (dawnTimerRef.current) window.clearTimeout(dawnTimerRef.current);
          dawnTimerRef.current = window.setTimeout(() => {
            dawnTimerRef.current = null;
            if (musicRef.current) chiptune.play("letris");
          }, 2250);
          enterPhase("day", "dawn");
        }
        if (!dawnFanfare) sfx.correct(); // site-wide ta-daa on a correct catch
      } else {
        sfx.wrong(); // site-wide soft buzz on a wrong catch
        if (phaseRef.current === "storm") {
          // Mercy rule: 3 misses in the storm → the clouds part back to night
          // (slow + blurred), not all the way to day.
          stormMissesRef.current += 1;
          if (stormMissesRef.current >= STORM_MERCY_MISSES) enterPhase("night", "mercy");
        }
      }

      setBoard((b) => {
        const nb = b.map((row) => row.slice());
        // place on top of the column's stack (lowest empty row)
        let landRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (nb[r][a.col] === null) {
            landRow = r;
            break;
          }
        }
        if (landRow < 0) {
          setGameOver(true);
          return nb;
        }
        nb[landRow][a.col] = a.tile;

        // resolve match-3 across the whole board — vertical (base-anchored) AND
        // horizontal rows — with gravity + cascade.
        const { board: resolved, cleared } = resolveBoard(nb, ROWS, cols, catColor, colorOf);
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols; c++) nb[r][c] = resolved[r][c];

        if (cleared > 0) {
          setScore((s) => {
            const ns = s + cleared * 10;
            // speed up every SPEEDUP_EVERY clears (≈ every 60 pts)
            if (Math.floor(ns / (SPEEDUP_EVERY * 10)) > Math.floor(s / (SPEEDUP_EVERY * 10))) {
              tickRef.current = Math.max(MIN_TICK_MS, tickRef.current - 50);
            }
            return ns;
          });
        }
        if (nb[0][a.col] !== null) setGameOver(true); // landing column stacked to the top
        return nb;
      });
      setActive(null);
    },
    // cols/set.id/speech/tts deliberately excluded: they are fixed for the
    // life of a round, and a re-created landing callback re-registers into
    // the falling-block loop mid-drop. Reviewed with Dan 2026-08-31: disable, not fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catIndex, catColor, colorOf, set.categories, set.language, wordTexts],
  );

  // Random thunder during storm: irregular noise+kick bursts every 4-12 s
  useEffect(() => {
    if (phase !== "storm" || !music) return;
    let tid: number;
    const scheduleThunder = () => {
      tid = window.setTimeout(() => {
        chiptune.thunder();
        scheduleThunder();
      }, 4000 + Math.random() * 8000);
    };
    scheduleThunder();
    return () => window.clearTimeout(tid);
  }, [phase, music]);

  useEffect(() => {
    if (creditsDone && studied && !active && !gameOver && !paused) {
      const t = window.setTimeout(spawnTile, 250);
      return () => window.clearTimeout(t);
    }
  }, [creditsDone, studied, active, gameOver, paused, spawnTile]);

  useEffect(() => {
    const step = (ts: number) => {
      const s = stateRef.current;
      if (s.paused || s.gameOver || !s.active) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      // Only NIGHT slows the rain — the storm runs at full speed (blur stays).
      const effTick = tickRef.current * (phaseRef.current === "night" ? NIGHT_RAIN_SLOW : 1);
      if (ts - lastDropRef.current >= effTick) {
        lastDropRef.current = ts;
        const a = s.active;
        const nextRow = a.row + 1;
        const blocked =
          nextRow >= ROWS || (s.board[nextRow] && s.board[nextRow][a.col] !== null);
        if (blocked) {
          if (a.row === 0 && s.board[0][a.col] !== null) setGameOver(true);
          else landTile({ ...a, row: Math.max(0, nextRow - 1) });
        } else {
          setActive({ ...a, row: nextRow });
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [landTile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === "Enter" || e.key === " ") restart();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
        return;
      }
      if (paused || !active) return;
      autoMusic();
      if (e.key === "ArrowLeft") {
        const nc = Math.max(0, active.col - 1);
        if (board[active.row][nc] === null) setActive({ ...active, col: nc });
      } else if (e.key === "ArrowRight") {
        const nc = Math.min(cols - 1, active.col + 1);
        if (board[active.row][nc] === null) setActive({ ...active, col: nc });
      } else if (e.key === "ArrowDown") {
        const nr = active.row + 1;
        if (nr >= ROWS || board[nr][active.col] !== null) {
          setActive(null);
          landTile(active);
        } else setActive({ ...active, row: nr });
      } else if (e.key === " ") {
        e.preventDefault();
        let r = active.row;
        while (r + 1 < ROWS && board[r + 1][active.col] === null) r++;
        setActive(null);
        landTile({ ...active, row: r });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, autoMusic, board, cols, gameOver, landTile, paused, restart]);

  const moveTo = (col: number) => {
    if (!active || paused || gameOver) return;
    autoMusic();
    if (board[active.row][col] !== null) return;
    setActive({ ...active, col });
  };

  // Tap a category base (the coloured puddle) to send the falling drop
  // straight into it — steer + hard-drop in one tap (Dan, 2026-07-05:
  // "accept clicking on the base itself"). landTile lands it in the chosen
  // column regardless of where the drop currently sits.
  const dropInto = (col: number) => {
    if (!active || paused || gameOver) return;
    autoMusic();
    landTile({ ...active, col });
  };


  const dismissPhaseMsg = () => {
    setPhaseMsg(null);
    setPaused(false); // resume the fall under the new sky
  };
  const dark = phase !== "day"; // night AND storm keep the veil + blurred letters
  // Rows size to the room the frame gives the board (patch 23) — the puddle
  // row and the frame's padding come off first; 48px was the old fixed row.
  const boardSize = useBoardSize();
  const rowH = boardSize.height > 0 ? Math.max(30, Math.min(56, Math.floor((boardSize.height - 110) / ROWS))) : 48;
  // Ambient dusk (Dan, 2026-07-14: "sky turns dark periodically, e.g. after
  // 30 seconds"): a passing cloud every 30 s of daytime play, ~6 s long —
  // scenery only; the pedagogical night/storm veil always wins.
  const [dusk, setDusk] = useState(false);
  useEffect(() => {
    if (phase !== "day" || paused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the guard clause of an interval effect: clearing dusk IS the synchronisation this effect exists for.
      setDusk(false);
      return;
    }
    const iv = window.setInterval(() => {
      setDusk(true);
      window.setTimeout(() => setDusk(false), 6000);
    }, 30000);
    return () => window.clearInterval(iv);
  }, [phase, paused]);

  const misses: GameMiss[] = drops
    .filter((d) => !d.ok)
    .map((d) => ({
      itemId: reviewItemByFrench(d.text)?.id,
      deckId: set.id,
      prompt: d.text,
      expected: d.want,
      given: d.got,
    }));

  const help = (
    <>
      <ol className="list-inside list-decimal space-y-2">
        <li>A word <b>rains down</b> as a drop — read it.</li>
        <li>Tap a column to steer it into the right puddle.</li>
        <li>Line up <b>3 tiles of the same colour</b> in a column or row to clear them.</li>
      </ol>
      {/* Keyboards live above sm — a phone was rendering five shortcuts it
          cannot press (patch 20–21). */}
      <p className="mt-3 hidden text-xs sm:block">
        <kbd className="rounded border border-[color:var(--cahier-line-strong)] px-1.5 py-0.5">←</kbd>{" "}
        <kbd className="rounded border border-[color:var(--cahier-line-strong)] px-1.5 py-0.5">→</kbd> move
        {"  · "}
        <kbd className="rounded border border-[color:var(--cahier-line-strong)] px-1.5 py-0.5">↓</kbd> soft drop
        {"  · "}
        <kbd className="rounded border border-[color:var(--cahier-line-strong)] px-1.5 py-0.5">Space</kbd> hard drop
        {"  · "}
        <kbd className="rounded border border-[color:var(--cahier-line-strong)] px-1.5 py-0.5">P</kbd> pause
      </p>
    </>
  );

  const record = (
    <ol className="flex flex-col gap-1.5">
      {[...drops].reverse().map((d, i) => (
        <li key={drops.length - i} lang="fr"
          className={`flex items-baseline gap-2 rounded-lg border-2 px-2 py-1 text-sm ${
            d.ok ? "border-[color:var(--dopa-win-ink)] bg-[color:var(--dopa-win-wash)]" : "border-[color:var(--dopa-miss-ink)] bg-[color:var(--dopa-miss-wash)]"
          }`}>
          <span aria-hidden>{d.ok ? "✓" : "✗"}</span>
          <span className="min-w-0 flex-1 truncate font-bold">{d.text}</span>
          <span className="shrink-0 text-xs font-black uppercase tracking-wider">{d.want}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title={`🌧️ ${set.title}`}
      exitHref="/games/vocabularain"
      progress={null}
      score={score}
      help={help}
      hintKey="vocabularain"
      menu={[
        { label: "🎵 Music", active: music, onClick: () => {
          if (chiptune.playing()) { chiptune.stop(); setMusic(false); }
          else { const key = phase === "storm" ? "storm" : "letris"; chiptune.play(key); if (phase === "night") chiptune.setTempoScale(NIGHT_MUSIC_SLOW); setMusic(true); }
        } },
        ...(speech ? [{ label: "🗣️ Voice", active: tts, onClick: () => setTts((v) => !v) }] : []),
        // From the sheet, "Pause" means: stay paused after I close this;
        // "Resume" means: let the rain fall again when I close it.
        { label: paused && !menuAuto ? "▶ Resume" : "⏸ Pause", onClick: () => {
          if (paused && !menuAuto) setMenuAuto(true); else { setMenuAuto(false); setPaused(true); }
        } },
        { label: "↻ Restart", onClick: restart },
      ]}
      onMenuToggle={(open) => {
        // The sheet is up → the rain waits; down → it resumes, unless the
        // learner paused on purpose (before opening it, or from the sheet).
        if (open) { if (!paused) { setMenuAuto(true); setPaused(true); } }
        else if (menuAuto) { setMenuAuto(false); setPaused(false); }
      }}
      record={record}
      recordTitle="🌧️ Drops"
      background="linear-gradient(180deg, var(--region-downtown-band) 0%, var(--cahier-paper) 70%)"
    >
    {/* data-kbnav-off: arrows steer the falling tile here — the site-wide
        arrow navigation (KeyNav) must stand down on this page. */}
    <div data-kbnav-off className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center px-3 py-2 text-sky-950 sm:px-4">
      <CreditsSplash game="Vocabularain" emoji="🌧️" onDone={() => setCreditsDone(true)} />
      {creditsDone && !studied && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-sky-950/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-xl">
            <h2 className="text-xl font-black text-sky-700">📋 {set.title}</h2>
            <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))" }}>
              {set.categories.map((c) => (
                <div key={c.key} className="rounded-xl border-2 border-sky-100 p-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-sky-500">{c.label}</p>
                  <ul className="space-y-0.5">
                    {pool.filter((t) => t.category === c.key).map((t) => (
                      <li key={`${t.text}-${t.category}`} className="text-sm leading-snug">
                        {t.emoji ? <span className="mr-1" aria-hidden>{t.emoji}</span> : null}
                        <span lang="fr" className="font-bold text-sky-900">{t.displayName}</span>
                        {t.meaning && t.meaning !== t.displayName && (
                          <span className="text-sky-900/60"> — {t.meaning}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setStudied(true); autoMusic(); }}
              className="mt-5 w-full rounded-xl border-2 border-b-4 border-sky-300 bg-sky-100 px-4 py-2 text-lg font-black text-sky-800 transition hover:bg-sky-50 active:translate-y-[2px] active:border-b-2"
            >
              ▶ Let&rsquo;s go!
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes vrain{0%{transform:translateY(-60px);opacity:0}10%{opacity:1}100%{transform:translateY(560px);opacity:0}}
        @keyframes vrain-slant{0%{transform:translate(0,-60px) rotate(9deg);opacity:0}10%{opacity:1}100%{transform:translate(64px,560px) rotate(9deg);opacity:0}}
        @keyframes ltrsentence{0%{opacity:0;transform:translateY(-6px) scale(.92)}12%{opacity:1;transform:translateY(0) scale(1)}82%{opacity:1}100%{opacity:0}}
      `}</style>
      {phaseMsg && (() => {
        const M: Record<PhaseMsg, { emoji: string; title: string; body: React.ReactNode; btn: string }> = {
          night: {
            emoji: "🌙", title: "Night falls…",
            body: <>You&rsquo;ve mastered every word — so night falls. In the dark a letter or two on each drop is <b>too faint to read</b>. Trust your memory of the word. The rain and the music <b>slow right down</b> to help you think.</>,
            btn: "Continue in the dark 🌙",
          },
          storm: {
            emoji: "⛈️", title: "The storm is coming!",
            body: <>You read the dark like a pro — so the storm rolls in: <b>full speed again</b>, letters <b>still too faint to read</b>. Memory at full tempo. Sort every word once more to reach the dawn.</>,
            btn: "Face the storm ⛈️",
          },
          dawn: {
            emoji: "🌅", title: "Day breaks!",
            body: <>You read the rain blind, at full speed — <b>bravo !</b> The sun is back, the letters are clear, and the whole cycle starts fresh. Can you bring the night back?</>,
            btn: "Continue in the sun 🌅",
          },
          mercy: {
            emoji: "🌙", title: "The storm passes…",
            body: <>Three drops went astray in the storm, so the clouds part back to a calm night: <b>slow rain again</b>, letters still faint. Re-prove every word in the dark to summon the storm once more.</>,
            btn: "Resume in the dark 🌙",
          },
        };
        const m = M[phaseMsg];
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4">
            <div className="max-w-sm rounded-3xl border-4 border-indigo-400/60 bg-slate-900 p-6 text-center text-indigo-50 shadow-2xl">
              <div className="text-5xl" aria-hidden>{m.emoji}</div>
              <h2 className="mt-2 text-xl font-black text-indigo-100">{m.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-indigo-100/85">{m.body}</p>
              <button
                type="button"
                onClick={dismissPhaseMsg}
                className="mt-4 w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 py-2 text-sm font-black text-white transition hover:brightness-110 active:translate-y-[2px] active:border-b-0"
              >
                {m.btn}
              </button>
            </div>
          </div>
        );
      })()}

      <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-xl">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, ${rowH}px)`,
            background: "linear-gradient(180deg, #59b8f2 0%, #8fd0f8 55%, #c8e9fc 100%)",
          }}
        >
          {/* Ambient rain STREAKS (Dan, 2026-07-14) — deterministic
              positions/timings (no Math.random in render). Two depths: near
              streaks longer/brighter/faster, far ones thinner and slower;
              every third streak falls slightly diagonally, wind-blown. */}
          {Array.from({ length: 20 }).map((_, i) => {
            const near = i % 2 === 0;
            const slant = i % 3 === 0;
            const dur = ((near ? 1.6 : 2.6) + (i % 5) * 0.35) * (phase === "night" ? 3 : 1);
            return (
              <span
                key={`drop-${i}`}
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: `${(i * 53 + 5) % 100}%`,
                  top: 0,
                  width: near ? 3 : 2,
                  height: near ? 44 : 26,
                  background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${near ? 0.8 : 0.45}) 100%)`,
                  animation: `${slant ? "vrain-slant" : "vrain"} ${dur}s linear ${(i * 0.63) % 3}s infinite`,
                }}
              />
            );
          })}
          {/* night falls after a few drops: the sky dims (the falling word sits
              ABOVE this veil, but its masked letters blur) and the moon rises */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: "linear-gradient(180deg, rgba(3,15,36,.85) 0%, rgba(8,28,56,.72) 55%, rgba(14,42,76,.5) 100%)",
              opacity: dark ? 1 : dusk ? 0.4 : 0,
              transition: "opacity 3s ease",
            }}
          />
          <span
            className="pointer-events-none absolute right-3 top-2 z-10 text-3xl"
            style={{ opacity: dark ? 1 : 0, transition: "opacity 3s ease", textShadow: "0 0 14px rgba(255,244,190,.8)" }}
            aria-hidden
          >
            {phase === "storm" ? "⛈️" : "🌙"}
          </span>
          {/* The full form, written — synced with the completion TTS, AFTER
              the sort is already made so it never leaks the answer. */}
          {sentenceFlash && (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center px-2">
              <span
                lang="fr"
                className="rounded-full border-2 border-white bg-[color:var(--dopa-win)] px-3 py-1 text-center text-sm font-black text-[color:var(--dopa-win-on)] shadow-lg"
                style={{ animation: "ltrsentence 2000ms ease-out both" }}
              >
                ✓ {sentenceFlash}
              </span>
            </div>
          )}
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const stacked = board[r][c];
              const isActive = active && active.row === r && active.col === c;
              const tile = isActive ? active!.tile : stacked;
              const isFlashCol = flash && flash.col === c && r === ROWS - 1;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center border-b border-white/20 px-1 text-center ${
                    c < cols - 1 ? "border-r border-white/20" : ""
                  }`}
                  style={isFlashCol ? {
                    background: flash!.kind === "ok"
                      ? "color-mix(in oklab, var(--dopa-win) 40%, transparent)"
                      : "color-mix(in oklab, var(--dopa-miss) 40%, transparent)",
                  } : undefined}
                  onClick={() => moveTo(c)}
                >
                  {tile && (
                    <div
                      className="flex w-[96%] items-center justify-center px-1 text-[11px] font-bold leading-tight shadow-md sm:text-xs"
                      data-tile
                      style={
                        isActive
                          ? {
                              height: rowH - 4,
                              // falling = a neutral raindrop: colour hidden until it lands.
                              // At night it rides ABOVE the dark veil — only its
                              // masked letters are unclear, not the whole word.
                              background: "linear-gradient(180deg, #ffffff 0%, #cdeeff 100%)",
                              color: "#075985",
                              border: "2px solid #9fdcff",
                              borderRadius: "14px 14px 20px 20px",
                              position: "relative",
                              zIndex: 20,
                            }
                          : { height: rowH - 4, background: colorOf(tile), color: "#fff", borderRadius: 10, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.2)" }
                      }
                    >
                      {isActive && dark ? <NightWord text={tile.text} /> : tile.text}
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>

        {/* coloured puddles — the category bases the drops sort into */}
        <div className="grid border-t-4 border-white" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {set.categories.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => dropInto(i)}
              title={`Poser ici : ${c.label}`}
              disabled={!active || paused || gameOver}
              className={`cursor-pointer px-2 py-3 text-center text-sm font-black tracking-wider text-white transition hover:brightness-110 active:translate-y-[2px] disabled:cursor-default sm:text-base ${
                i < cols - 1 ? "border-r-2 border-white/50" : ""
              }`}
              style={{ background: catColor(i), boxShadow: "inset 0 -5px 0 rgba(0,0,0,.18), inset 0 4px 6px rgba(255,255,255,.25)" }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {paused && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
            <h2 className="text-3xl font-black text-sky-800">Paused</h2>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] px-5 py-2 font-black text-sky-950 transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {gameOver && (
        <GameOver
          emoji="🌧️"
          title="Game Over"
          score={score}
          won={false}
          misses={misses}
          onReplay={restart}
          exitHref="/games/vocabularain"
        />
      )}
    </div>
    </GameFrame>
  );
}
