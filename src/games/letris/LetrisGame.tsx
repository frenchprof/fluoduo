"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildSentence, speak } from "./speech";
import { resolveBoard } from "./resolve";
import { chiptune } from "@/games/audio/chiptune";

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
/* Night falls after this many landed drops (Dan, 2026-07-03): the sky darkens
 * and some letters on each falling word become unclear, so the learner has to
 * recall the word from knowledge rather than read it. */
const NIGHT_AFTER = 10;

/** Which letter positions the dark hides — deterministic per word (the same
 *  word is always unclear in the same places), never the first letter. */
function nightMask(text: string): Set<number> {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  const letters: number[] = [];
  for (let i = 1; i < text.length; i++) if (/\p{L}/u.test(text[i])) letters.push(i);
  const want = Math.min(letters.length, 1 + Math.floor(text.length / 5));
  const out = new Set<number>();
  for (let k = 0; out.size < want && k < letters.length * 3; k++) {
    out.add(letters[(h + k * 7) % letters.length]);
  }
  return out;
}

/* One colour per category (the base + every tile that belongs to it). Revealed
 * only when a tile lands — while falling, a tile is a neutral RAINDROP (the
 * Vocabularain story: words rain from the sky, you steer each drop into the
 * right puddle). Duolingo-bright hues, all legible under white text. */
const PALETTE = [
  "#ff4b4b", // red
  "#1cb0f6", // sky blue
  "#58cc02", // green
  "#ce82ff", // purple
  "#ff9600", // orange
  "#2ec4b6", // teal
  "#e0567f", // pink
];

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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

export default function LetrisGame({ set }: { set: LetrisSet }) {
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
  const [queue, setQueue] = useState<LetrisTile[]>(() => shuffle(set.tiles));
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(false);
  const [drops, setDrops] = useState(0); // tiles landed — night falls after a few
  const musicAutoRef = useRef(false);
  // First interaction — key OR tap — starts the tune (both are user gestures,
  // so the AudioContext may be created). Keydown-only left tap players silent
  // until it was "too late" (Dan, 2026-07-03).
  const autoMusic = useCallback(() => {
    if (musicAutoRef.current) return;
    musicAutoRef.current = true;
    chiptune.play("letris");
    setMusic(true);
  }, []);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<{ col: number; kind: "ok" | "bad" } | null>(null);

  const tickRef = useRef(INITIAL_TICK_MS);
  const lastDropRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ board, active, queue, paused, gameOver });
  stateRef.current = { board, active, queue, paused, gameOver };

  const spawnTile = useCallback(() => {
    setQueue((q) => {
      let next = q;
      if (next.length === 0) next = shuffle(set.tiles);
      const tile = next[0];
      const startCol = Math.floor(Math.random() * cols);
      setActive({ tile, row: 0, col: startCol });
      return next.slice(1);
    });
  }, [set.tiles, cols]);

  const restart = useCallback(() => {
    setBoard(emptyBoard(cols));
    setActive(null);
    setQueue(shuffle(set.tiles));
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setFlash(null);
    setDrops(0); // dawn breaks again
    tickRef.current = INITIAL_TICK_MS;
  }, [cols, set.tiles]);

  const landTile = useCallback(
    (a: Active) => {
      const correct = catIndex.get(a.tile.category) === a.col;
      setDrops((d) => d + 1);
      setFlash({ col: a.col, kind: correct ? "ok" : "bad" });
      window.setTimeout(() => setFlash(null), 220);
      if (correct) {
        speak(
          buildSentence(set.categories[a.col], a.tile),
          set.language ? `${set.language}-FR` : "fr-FR",
          { interrupt: false },
        );
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
    [catIndex, catColor, colorOf, set.categories, set.language],
  );

  useEffect(() => {
    if (!active && !gameOver && !paused) {
      const t = window.setTimeout(spawnTile, 250);
      return () => window.clearTimeout(t);
    }
  }, [active, gameOver, paused, spawnTile]);

  useEffect(() => {
    const step = (ts: number) => {
      const s = stateRef.current;
      if (s.paused || s.gameOver || !s.active) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (ts - lastDropRef.current >= tickRef.current) {
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

  const pillCls =
    "rounded-xl border-2 border-b-4 border-sky-200 bg-white px-2.5 py-1 font-bold text-sky-800 shadow-sm transition hover:bg-sky-50 active:translate-y-[2px] active:border-b-2";

  const night = drops >= NIGHT_AFTER;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 text-sky-950">
      <style>{`@keyframes vrain{0%{transform:translateY(-24px);opacity:0}12%{opacity:.7}100%{transform:translateY(520px);opacity:0}}`}</style>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-sky-700" style={{ textShadow: "0 2px 0 #fff" }}>
            🌧️ Vocabula<span className="text-sky-400">rain</span>
          </h1>
          <p className="text-sm font-bold text-sky-900/80">
            {set.title}
            {set.subtitle ? <span className="font-medium text-sky-900/60"> — {set.subtitle}</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="rounded-xl border-2 border-sky-200 bg-white px-2.5 py-1 font-bold shadow-sm">
            Score <b className="text-[#58cc02]">{score}</b>
          </span>
          <button type="button" onClick={() => setShowHelp(true)} title="How to play" className={pillCls}>?</button>
          <button type="button" onClick={() => { chiptune.toggle("letris"); setMusic(chiptune.playing() === "letris"); }}
            title="Music" className={pillCls}>{music ? "🔊" : "🎵"}</button>
          <button type="button" onClick={() => setPaused((p) => !p)} className={pillCls}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button type="button" onClick={restart} className={pillCls}>
            Restart
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/50 p-4" onClick={() => setShowHelp(false)}>
          <div className="max-w-sm rounded-3xl border-4 border-sky-200 bg-white p-6 text-sky-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-xl font-black text-sky-700">How to play Vocabularain 🌧️</h2>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>A word <b>rains down</b> as a drop — read it.</li>
              <li>Use <b>← →</b> or tap a column to steer it into the right puddle.</li>
              <li>Press <b>↓</b> to nudge it down, or <b>Space</b> to drop it instantly.</li>
              <li>Line up <b>3 tiles of the same colour</b> in a column or row to clear them.</li>
            </ol>
            <p className="mt-3 text-xs text-sky-900/60">
              The goal is to sort, not just drop — every correct placement reinforces the grammar rule.
            </p>
            <button type="button" onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-2 text-sm font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">
              Got it — play!
            </button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-xl">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, 48px)`,
            background: "linear-gradient(180deg, #59b8f2 0%, #8fd0f8 55%, #c8e9fc 100%)",
          }}
        >
          {/* ambient rain — deterministic positions/timings (no Math.random in render) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`drop-${i}`}
              className="pointer-events-none absolute w-[3px] rounded-full"
              style={{
                left: `${(i * 89 + 7) % 100}%`,
                top: 0,
                height: 16,
                background: "rgba(255,255,255,.55)",
                animation: `vrain ${2.2 + (i % 5) * 0.5}s linear ${(i * 0.63) % 3}s infinite`,
              }}
            />
          ))}
          {/* night falls after a few drops: the sky dims (the falling word sits
              ABOVE this veil, but its masked letters blur) and the moon rises */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: "linear-gradient(180deg, rgba(3,15,36,.85) 0%, rgba(8,28,56,.72) 55%, rgba(14,42,76,.5) 100%)",
              opacity: night ? 1 : 0,
              transition: "opacity 3s ease",
            }}
          />
          <span
            className="pointer-events-none absolute right-3 top-2 z-10 text-3xl"
            style={{ opacity: night ? 1 : 0, transition: "opacity 3s ease", textShadow: "0 0 14px rgba(255,244,190,.8)" }}
            aria-hidden
          >
            🌙
          </span>
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
                  } ${isFlashCol ? (flash!.kind === "ok" ? "bg-lime-300/40" : "bg-rose-400/40") : ""}`}
                  onClick={() => moveTo(c)}
                >
                  {tile && (
                    <div
                      className="flex h-[44px] w-[96%] items-center justify-center px-1 text-[11px] font-bold leading-tight shadow-md sm:text-xs"
                      style={
                        isActive
                          ? {
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
                          : { background: colorOf(tile), color: "#fff", borderRadius: 10, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.2)" }
                      }
                    >
                      {isActive && night ? <NightWord text={tile.text} /> : tile.text}
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
            <div
              key={c.key}
              className={`px-2 py-3 text-center text-sm font-black tracking-wider text-white sm:text-base ${
                i < cols - 1 ? "border-r-2 border-white/50" : ""
              }`}
              style={{ background: catColor(i), boxShadow: "inset 0 -5px 0 rgba(0,0,0,.18), inset 0 4px 6px rgba(255,255,255,.25)" }}
            >
              {c.label}
            </div>
          ))}
        </div>

        {(paused || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
            <h2 className="text-3xl font-black text-sky-800">{gameOver ? "Game Over" : "Paused"}</h2>
            {gameOver && <p className="text-lg font-bold text-sky-900">Final score: <b className="text-[#58cc02]">{score}</b></p>}
            <button
              type="button"
              onClick={gameOver ? restart : () => setPaused(false)}
              className="rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] px-5 py-2 font-black text-sky-950 transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
            >
              {gameOver ? "Play again" : "Resume"}
            </button>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-sky-900/70">
        <div>
          <kbd className="rounded border border-sky-200 bg-white px-1.5 py-0.5">←</kbd>{" "}
          <kbd className="rounded border border-sky-200 bg-white px-1.5 py-0.5">→</kbd> move
          {"  · "}
          <kbd className="rounded border border-sky-200 bg-white px-1.5 py-0.5">↓</kbd> soft drop
          {"  · "}
          <kbd className="rounded border border-sky-200 bg-white px-1.5 py-0.5">Space</kbd> hard drop
          {"  · "}
          <kbd className="rounded border border-sky-200 bg-white px-1.5 py-0.5">P</kbd> pause
        </div>
        <div>Tap a column to move the falling drop.</div>
      </footer>
    </div>
  );
}
