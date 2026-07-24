"use client";

/**
 * Lexicalator — the syllable key/keyhole game (the design thread, 2026-07-02).
 * You PICK a locked chest (English shown in full); its lock is a row of
 * keyholes sized to each French syllable. You forge the French from syllable
 * keys drifting on the belt (real ones + near-miss decoys); the right key in
 * the right slot advances, a wrong one rattles back (a life). Complete the word
 * and the whole gold box descends into the trésor, spoken aloud.
 *
 * The belt is FROZEN until the first word is done, then eases from a crawl to
 * real time-pressure as levels rise. Hard mode hides the syllable count. Levels
 * escalate by syllable length: level 1 lets monosyllables in, higher levels
 * demand longer words. Syllables are hand-authored (see lib/syllabify.ts).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logEvent } from "@/lib/firebase/usage";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import SoundControl from "@/components/SoundControl";
import { recordItemResult } from "@/lib/progress";

export type LexEntry = { id: string; fr: string; en: string; syllables: string[]; say?: string };

const START_LIVES = 3;
const LANE = 3; // chests on the lane at once
const QUOTA = 6; // words to clear a level
const minSylForLevel = (l: number) => (l <= 1 ? 1 : l <= 2 ? 2 : 3);

// ── The breakdown ladder (Dan, 2026-07-08) ──────────────────────────────────
// Level 1: ENTIRE words and phrases — one key, no breakdown (recognise the
//          written word for its gloss).
// Levels 2–3: syllables (the hand-authored joints).
// Level 4+: spelling mode — random 2–4 letter chunks, pure ORTHOGRAPHE,
//          syllabation not a concern; re-rolled every deal so the same word
//          spells differently each time.
const SPELL_LEVEL = 4;
function gearEntry<E extends { fr: string; syllables: string[] }>(level: number, e: E): E {
  if (level >= SPELL_LEVEL) return { ...e, syllables: chunkSpelling(e.fr) };
  if (level <= 1) return { ...e, syllables: [e.fr.trim()] };
  return e;
}
function chunkSpelling(fr: string): string[] {
  // Per-WORD chunking (Dan, 2026-07-21: « à côté » must never yield « àc » —
  // a fragment never straddles a space). Deterministic per word (seeded by
  // the word itself) so the same word always cuts the same way, deal after
  // deal — no more « ran » here and « range » there for one spelling.
  const out: string[] = [];
  for (const word of fr.trim().split(/\s+/)) {
    let h = [...word].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);
    const rnd = () => ((h = (Math.imul(h, 1103515245) + 12345) | 0), ((h >>> 16) & 0x7fff) / 0x8000);
    let i = 0;
    while (i < word.length) {
      let size = 2 + Math.floor(rnd() * 3); // 2..4
      const left = word.length - i;
      if (left - size === 1) size += size < 4 ? 1 : -1; // never strand 1 letter
      size = Math.min(size, left);
      out.push(word.slice(i, i + size));
      i += size;
    }
  }
  return out;
}
// Chunk decoys: a real chunk with one vowel swapped (or reversed when it has
// none) — plausible spellings only a reader of the word rejects.
const VOWEL_SWAP: Record<string, string> = { a: "e", e: "a", i: "y", o: "au", u: "ou", é: "è", è: "é" };
function mutateChunk(c: string): string | null {
  for (let i = 0; i < c.length; i++) {
    const sub = VOWEL_SWAP[c[i]];
    if (sub) return c.slice(0, i) + sub + c.slice(i + 1);
  }
  const rev = [...c].reverse().join("");
  return rev === c ? null : rev;
}
// Belt loop time in seconds — gentle acceleration (Dan, 2026-07-03: "go easy on
// the acceleration"): a slow ~60s at level 1, easing by 5s a level to a calm
// 20s floor, so it never jumps to a frantic pace.
const beltSecsFor = (l: number) => Math.max(20, 60 - (l - 1) * 5);
const keyW = (s: string) => Math.max(40, 24 + s.length * 15);

// Five clearly-distinct chest liveries (Dan, 2026-07-09: "the chests can
// appear in slightly different colors because it's hard to see if we brought
// down the chests desired"). A chest keeps its livery from the lane through
// the drag ghost into the assembly bay, and no two lane chests share one.
type ChestTint = { body: string; lid: string; edge: string };
const CHEST_TINTS: ChestTint[] = [
  { body: "linear-gradient(180deg,#ffe08a,#eaa61c)", lid: "linear-gradient(180deg,#c8860f,#96600c)", edge: "#7a4e0a" }, // or
  { body: "linear-gradient(180deg,#ffd3de,#e56a8f)", lid: "linear-gradient(180deg,#c04a6e,#8f2d4c)", edge: "#7a2438" }, // rose
  { body: "linear-gradient(180deg,#cdeaff,#57a6dc)", lid: "linear-gradient(180deg,#3d7fb0,#2a5c82)", edge: "#1e4f70" }, // bleu
  { body: "linear-gradient(180deg,#d9f2c4,#83c04f)", lid: "linear-gradient(180deg,#5c9433,#446e24)", edge: "#33591b" }, // vert
  { body: "linear-gradient(180deg,#e9dcff,#a284de)", lid: "linear-gradient(180deg,#7a58b8,#5a3f8c)", edge: "#4b2f7a" }, // violet
];

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

// `filled` is per-slot, not a count: syllables can be dropped in ANY order
// (Dan, 2026-07-03), so we track which keyholes are done, not how many.
// `tint` is the chest's livery index into CHEST_TINTS — it belongs to the
// physical chest, so a sibling-form morph keeps the colour in place.
type Chest = { entry: LexEntry; filled: boolean[]; tint: number };
const blankFill = (e: LexEntry): boolean[] => e.syllables.map(() => false);

// Colour decks (Dan, 2026-07-20, corrected spec): chest tints are IDENTITY —
// players track which chest they brought down — so they must stay distinct
// at every level. On decks whose WORDS are colours, distinct-but-arbitrary
// liveries create a Stroop conflict (a blue chest holding « rouge »). The
// fix: at levels 0–1 each chest wears ITS OWN word's colour (distinct AND
// truthful); from level 2 the arbitrary liveries return as a deliberate
// challenge, announced by the ⚠️ line exactly when it starts.
const COLOR_LIVERIES: Record<string, ChestTint> = {
  rouge:  { body: "linear-gradient(180deg,#ffb3b3,#e03131)", lid: "linear-gradient(180deg,#b02525,#7f1a1a)", edge: "#6b1414" },
  bleu:   { body: "linear-gradient(180deg,#b3d9ff,#2f7fd4)", lid: "linear-gradient(180deg,#2361a8,#194a80)", edge: "#123a66" },
  vert:   { body: "linear-gradient(180deg,#c2f0c2,#3fae3f)", lid: "linear-gradient(180deg,#2f8a2f,#226622)", edge: "#1a521a" },
  jaune:  { body: "linear-gradient(180deg,#fff3b3,#f2cc0c)", lid: "linear-gradient(180deg,#c7a50a,#967c07)", edge: "#7a6506" },
  violet: { body: "linear-gradient(180deg,#e0ccff,#8a4fd6)", lid: "linear-gradient(180deg,#6c3aae,#502b84)", edge: "#3f2268" },
  rose:   { body: "linear-gradient(180deg,#ffd6e8,#f06ba8)", lid: "linear-gradient(180deg,#c74f87,#984069)", edge: "#7a3355" },
  orange: { body: "linear-gradient(180deg,#ffd9b3,#f28c1b)", lid: "linear-gradient(180deg,#c26f13,#94550e)", edge: "#78450b" },
  noir:   { body: "linear-gradient(180deg,#9aa0a6,#3c4043)", lid: "linear-gradient(180deg,#2b2e30,#1b1d1f)", edge: "#111213" },
  blanc:  { body: "linear-gradient(180deg,#ffffff,#e8e8e8)", lid: "linear-gradient(180deg,#cfcfcf,#b0b0b0)", edge: "#8f8f8f" },
  gris:   { body: "linear-gradient(180deg,#e0e0e0,#9e9e9e)", lid: "linear-gradient(180deg,#7d7d7d,#5f5f5f)", edge: "#4a4a4a" },
  marron: { body: "linear-gradient(180deg,#e0c3a3,#8d5a2b)", lid: "linear-gradient(180deg,#6e4521,#523318)", edge: "#402713" },
};
const LIVERY_COLOR_WORDS = Object.keys(COLOR_LIVERIES);
/** Livery for a chest: its word's own colour at levels 0–1 on colour decks;
 *  the arbitrary rolling livery otherwise. */
function liveryOf(fr: string, tint: number, level: number): ChestTint {
  if (level <= 1) {
    const w = LIVERY_COLOR_WORDS.find((k) => fr.toLowerCase().includes(k));
    if (w) return COLOR_LIVERIES[w];
  }
  return CHEST_TINTS[tint % CHEST_TINTS.length];
}

export default function Lexicalator({
  title,
  subtitle,
  entries,
  decoys,
}: {
  title: string;
  subtitle?: string;
  entries: LexEntry[];
  decoys: string[];
}) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [cleared, setCleared] = useState(0);
  // Words needed to clear THIS level — QUOTA, capped at what the deck can
  // actually deal (a 5-word deck can never clear 6).
  const [quota, setQuota] = useState(QUOTA);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [hard, setHard] = useState(false);
  const [over, setOver] = useState(false);
  const [levelDone, setLevelDone] = useState(false);
  useEffect(() => {
    void logEvent("game.start", { game: "lexicalator", collectionId: title });
  }, [title]);

  const [chests, setChests] = useState<Chest[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [queue, setQueue] = useState<LexEntry[]>([]);
  const [done, setDone] = useState<LexEntry[]>([]);
  const [firstDone, setFirstDone] = useState(false);
  const [rattle, setRattle] = useState<string | null>(null);
  const [music, setMusic] = useState(false);
  const musicAutoRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount

  // Auto-advance between levels (Dan, 2026-07-08: no OK tap) — the fanfare
  // gets a beat, then the next level deals itself and taps land in the game.
  useEffect(() => {
    if (!levelDone) return;
    void logEvent("game.end", { game: "lexicalator", collectionId: title, score });
    const t = window.setTimeout(() => setLevel((l) => l + 1), 1800);
    return () => window.clearTimeout(t);
  }, [levelDone]);

  // Apply the shared volume (fluolingo:volume) on mount; the slider itself
  // now lives inside the SoundControl popover in the HUD.
  useEffect(() => {
    try {
      const v = parseFloat(window.localStorage.getItem("fluolingo:volume") ?? "");
      if (!Number.isNaN(v)) chiptune.setVolume(v);
    } catch {}
  }, []);

  // The A-minor swung loop starts with the game itself: the first chest pick
  // (a user gesture, so the AudioContext may be created) — Dan 2026-07-03,
  // "the music is missing". pickChest is idempotent (same id → same state,
  // music guarded by musicAutoRef), so a drag-release AND its trailing click
  // can both fire harmlessly.
  const pickChest = useCallback((id: string) => {
    setSelected(id);
    if (!musicAutoRef.current) {
      musicAutoRef.current = true;
      chiptune.play("conveyor");
      setMusic(true);
    }
  }, []);

  // Drag-to-pick (Dan, 2026-07-03: "allow for both dragging or clicking"). A
  // pointer-down on a chest starts a drag; a ghost chest follows the pointer,
  // and releasing picks that chest. Clicking (no movement) still works via the
  // button's onClick, as does keyboard.
  const dragRef = useRef<{ id: string; sx: number; sy: number; moved: boolean } | null>(null);
  // The board's bounds are the drag's "escape hatch" (audit 2026-07-19: once
  // a drag began, ANY release picked the chest — there was no way to change
  // your mind). Releasing a MOVED drag outside the board now puts it back.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  // Which decoys cost lives — shown on the game-over screen (Dan,
  // 2026-07-21: \"when the game dies, there should be feedback about what
  // went wrong\").
  const missTokens = useRef<string[]>([]);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.moved = true;
      setGhost({ id: d.id, x: e.clientX, y: e.clientY });
    };
    const end = (select: boolean) => {
      const d = dragRef.current;
      dragRef.current = null;
      setGhost(null);
      if (select && d) pickChest(d.id);
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      const r = rootRef.current?.getBoundingClientRect();
      // A tap (no movement) always picks; a drag released off the board is
      // an abort. Anywhere on the board still picks, as before.
      const escaped =
        !!d?.moved && !!r &&
        (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
      end(!escaped);
    };
    const cancel = () => end(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [pickChest]);
  const startDrag = (e: React.PointerEvent, id: string) => {
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const ghostChest = ghost ? chests.find((c) => c.entry.id === ghost.id) : undefined;

  // Rolling livery counter — a replacement chest takes the next colour that
  // is NOT already on the lane, so the lane never shows two alike.
  const tintSeq = useRef(LANE);
  const tintFor = (lane: Chest[]) => {
    const used = new Set(lane.map((c) => c.tint));
    let t = tintSeq.current;
    while (used.has(t % CHEST_TINTS.length)) t++;
    tintSeq.current = t + 1;
    return t % CHEST_TINTS.length;
  };

  // (Re)deal the lane for the current level. Runs on mount and each level.
  useEffect(() => {
    const min = minSylForLevel(level);
    // Prefer level-appropriate (longer) words, but PAD with shorter ones up to
    // the quota — a level must always deal enough words to be completable.
    // (question-words has only three 2-syllable words: level 2 dealt 3 chests,
    // then the lane went dead at 3/6 forever — Dan, 2026-07-07. Ten decks had
    // such levels.) Longer words deal first so the level's intent still leads;
    // tiny decks (frequence: 5 words total) cap the quota itself below.
    const long = shuffle(entries.filter((e) => e.syllables.length >= min));
    const short = shuffle(entries.filter((e) => e.syllables.length < min));
    const pool = long.length >= QUOTA ? long : [...long, ...short].slice(0, QUOTA);
    // Re-gear each word for the level's breakdown (whole word / syllables /
    // spelling chunks — see the ladder above).
    const geared = pool.map((e) => gearEntry(level, e));
    setQuota(Math.min(QUOTA, geared.length));
    setChests(geared.slice(0, LANE).map((entry, i) => ({ entry, filled: blankFill(entry), tint: i % CHEST_TINTS.length })));
    tintSeq.current = LANE;
    setQueue(geared.slice(LANE));
    // No chest sits in the central bay at first — the learner is nudged to
    // pick one to begin (Dan, 2026-07-03).
    setSelected(null);
    setCleared(0);
    setLevelDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const active = chests.find((c) => c.entry.id === selected) ?? null;

  // Belt tokens: every syllable the visible chests need, plus decoys — shuffled,
  // duplicated for a seamless scroll. Recomputed only when the chest set changes.
  // Keyboard shortcuts (Dan, 2026-07-21): number keys 1-9,0 press the
  // belt keys in order; letter keys A,B,C… select/pull the chests. The
  // relevant key ACTIVATES the same code path as a tap — nothing new to
  // learn, one more way to play. Badges on tiles and chests show the
  // mapping. (Declared before beltPool so the effect below can close
  // over it; defined right after it.)
  const beltPool = useMemo(() => {
    const real = new Set<string>();
    const monos: string[] = []; // whole-word keys of monosyllabic answers in play
    for (const c of chests) {
      for (const s of c.entry.syllables) real.add(s);
      if (c.entry.syllables.length === 1) monos.push(c.entry.syllables[0]);
    }
    // A monosyllable's only key is the whole word; a decoy that is a slice of it
    // ("pai" for "pain") invites "but that's part of the answer!" disputes — so
    // never surface a partial-of-a-monosyllable as an option (Dan, 2026-07-03).
    const isPartialOfMono = (d: string) => monos.some((m) => m !== d && m.includes(d));
    // NEVER release a fake that is genuinely part of a lane word (Dan,
    // 2026-07-21: either don't let the wrong-sized fragment out at all, or
    // never penalise it — we do BOTH; tapKey spares the life as backstop).
    const laneWords = chests.map((c) => c.entry.fr.toLowerCase());
    const isPartOfLaneWord = (d: string) => laneWords.some((w) => w.includes(d.toLowerCase()));
    // Fake keys match the level's joints: level 1 (whole words) baits with
    // OTHER words of the deck; spelling mode with mutated real chunks (one
    // vowel off); the syllable levels with the deck's hand-authored decoys.
    const usable =
      level <= 1
        ? shuffle(entries.map((e) => e.fr.trim()).filter((w) => !real.has(w) && !isPartialOfMono(w) && !isPartOfLaneWord(w))).slice(0, 4)
        : level >= SPELL_LEVEL
          ? [...new Set([...real].map(mutateChunk).filter((m): m is string => !!m && !real.has(m) && !isPartOfLaneWord(m)))].slice(0, 6)
          : decoys.filter((d) => !real.has(d) && !isPartialOfMono(d) && !isPartOfLaneWord(d));
    return shuffle([...real, ...usable]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chests.map((c) => c.entry.id).join(","), level]);

  // The keyboard layer itself — attached to the window so no focus is
  // needed; ignores typing surfaces and modifier chords.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over || levelDone || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (/^[1-9]$/.test(e.key) || e.key === "0") {
        const idx = e.key === "0" ? 9 : Number(e.key) - 1;
        const token = beltPool[idx];
        if (token) { e.preventDefault(); tapKey(token); }
        return;
      }
      if (/^[a-z]$/i.test(e.key)) {
        const idx = e.key.toLowerCase().charCodeAt(0) - 97;
        // Letters follow the VISIBLE waiting chests (same order as the badges).
        const visible = chests.filter((c) => c.entry.id !== selected);
        const chest = visible[idx];
        if (chest) { e.preventDefault(); pickChest(chest.entry.id); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function tapKey(token: string) {
    if (over || levelDone) return;
    // No chest in the bay yet? A key that fits a WAITING chest brings that
    // chest down and starts filling it (Dan, 2026-07-10: taps on any word or
    // fragment must count even before a chest has been dragged down). A key
    // that fits nothing on the lane just rattles — nothing was at stake.
    let cur = active;
    if (!cur) {
      const host = chests.find((c) => c.entry.syllables.some((s, i) => !c.filled[i] && s === token));
      if (!host) {
        setRattle(token);
        window.setTimeout(() => setRattle(null), 300);
        return;
      }
      pickChest(host.entry.id);
      cur = host;
    }
    // The state we grade against — may be swapped below when the key fits a
    // sibling FORM of the word instead.
    let entry = cur.entry;
    let filled = cur.filled;
    let lane = chests;
    let laneQueue = queue;
    // Any-order fill: the key fits the FIRST still-empty keyhole that needs
    // this syllable, wherever it sits in the word.
    let slot = entry.syllables.findIndex((s, i) => !filled[i] && s === token);

    if (slot < 0) {
      // ALL FORMS OF THE WORD ARE FAIR (Dan, 2026-07-08: « gués » on the
      // "tired" chest — the plural « fatigués » must count, not rattle).
      // If the key fits a SIBLING entry consistent with everything already
      // forged (same filled syllables + this key), the bay chest MORPHS into
      // that sibling and the sibling's old spot inherits this entry — both
      // words stay buildable, and the looping belt owes nothing.
      const filledTokens = entry.syllables.filter((s, i) => filled[i]);
      const fits = (e: typeof entry) => {
        if (e.id === entry.id) return false;
        const pool = [...e.syllables];
        for (const t of [...filledTokens, token]) {
          const k = pool.indexOf(t);
          if (k < 0) return false;
          pool.splice(k, 1);
        }
        return true;
      };
      // MORPH FENCE (Dan, 2026-07-23: he SAW Grèce and HEARD Turquie —
      // "unforgivable"). Sibling-morph exists for grammatical variants of ONE
      // word (beige→beiges, acteur→actrice), never for different lexemes: an
      // alt only qualifies if it shares the entry's word family — same first
      // three letters of the bare word, or same English gloss. A fragment of
      // another country now rattles (fairness rule) instead of secretly
      // transmuting the chest.
      const bare = (e: { fr: string }) => e.fr.toLowerCase().replace(/^(le |la |les |l'|un |une |des )/, '');
      const sameFamily = (e: { fr: string; en?: string }) =>
        bare(e).slice(0, 3) === bare(entry).slice(0, 3) ||
        (!!e.en && !!entry.en && e.en.toLowerCase() === entry.en.toLowerCase());
      const laneAlt = chests.find((c) => c.entry.id !== entry.id && sameFamily(c.entry) && fits(c.entry));
      const queueIdx = laneAlt ? -1 : queue.findIndex((e) => sameFamily(e) && fits(e));
      const alt = laneAlt?.entry ?? (queueIdx >= 0 ? queue[queueIdx] : undefined);
      if (alt) {
        const marks = blankFill(alt);
        for (const t of filledTokens) {
          const k = alt.syllables.findIndex((s, i) => !marks[i] && s === t);
          if (k >= 0) marks[k] = true;
        }
        if (laneAlt) {
          lane = chests.map((c) =>
            c.entry.id === entry.id ? { ...c, entry: alt, filled: marks }
            : c.entry.id === alt.id ? { ...c, entry, filled: blankFill(entry) }
            : c,
          );
        } else {
          lane = chests.map((c) => (c.entry.id === entry.id ? { ...c, entry: alt, filled: marks } : c));
          laneQueue = queue.map((e, i) => (i === queueIdx ? entry : e));
          setQueue(laneQueue);
        }
        setChests(lane);
        setSelected(alt.id); // the bay chest kept its place, new identity
        entry = alt;
        filled = marks;
        slot = entry.syllables.findIndex((s, i) => !filled[i] && s === token);
      }
    }

    if (slot >= 0) {
      const nextFilled = filled.slice();
      nextFilled[slot] = true;
      const complete = nextFilled.every(Boolean);
      if (complete) {
        recordItemResult(entry.id, true);
        sfx.correct(); // ta-daa BEFORE the word is spoken
        speak(entry.say ?? entry.fr, "fr-FR"); // article/prefix form when the deck has one
        setScore((s) => s + 10 + Math.min(combo, 5) * 2);
        setCombo((c) => c + 1);
        setFirstDone(true);
        // The whole chest descends straight into VOTRE TRÉSOR: add it now and
        // let the trésor tile drop in from the play area (lxland) and land in
        // place — the freed word no longer overshoots past the keyhole.
        setDone((d) => [...d, entry]);
        // Remove the cleared chest and pull a replacement from the queue.
        // Computed purely from the (possibly swapped) lane/queue — not nested
        // state updaters mutating a captured array (that double-ran under
        // Strict Mode and duplicated the replacement chest).
        const rest = lane.filter((c) => c.entry.id !== entry.id);
        const nextUp = laneQueue[0];
        const newChests = nextUp ? [...rest, { entry: nextUp, filled: blankFill(nextUp), tint: tintFor(rest) }] : rest;
        setChests(newChests);
        // Empty the bay — the learner drags down the next chest (same as the
        // opening), so a chest is never auto-placed in the bay AND the lane.
        setSelected(null);
        if (nextUp) setQueue((q) => q.slice(1));
        // Level cleared at the quota — or when the pool is exhausted (backstop:
        // the deal above guarantees pool ≥ quota, so lane+queue running empty
        // means the level's words are simply all done). Jingle stays outside
        // the updater so Strict Mode's double-run can't fire it twice.
        const levelCleared = cleared + 1 >= quota || newChests.length === 0;
        if (levelCleared) sfx.stage();
        setCleared((n) => n + 1);
        if (levelCleared) setLevelDone(true);
      } else {
        setChests((cs) => cs.map((c) => (c.entry.id === entry.id ? { ...c, filled: nextFilled } : c)));
      }
    } else if (chests.some((c) => c.entry.fr.toLowerCase().includes(token.toLowerCase()))) {
      // The key IS part of a word on the lane ("ge" while forging "beige" —
      // or "pain" while "copain" waits) — it just isn't cut at this level's
      // joints. Rattle as feedback, but no life, no combo break (Dan,
      // 2026-07-05, widened 2026-07-21: the user must NEVER be penalised
      // for selecting a genuine part of a real word on screen).
      setRattle(token);
      window.setTimeout(() => setRattle(null), 300);
    } else if (chests.some((c) => c.entry.syllables.includes(token))) {
      // The key is a REAL syllable — of another chest in the lane, not the
      // active word ("de" waiting for joueur de tennis). That's a mix-up, not
      // a fall for a fake: rattle, break the combo, but spare the life (Dan,
      // 2026-07-07). Lives are spent on DECOYS only.
      setRattle(token);
      window.setTimeout(() => setRattle(null), 300);
      setCombo(0);
    } else {
      // decoy — rattle, lose a life (and remember it for the post-mortem)
      missTokens.current = [...missTokens.current.slice(-4), token];
      sfx.wrong();
      setRattle(token);
      window.setTimeout(() => setRattle(null), 300);
      setCombo(0);
      recordItemResult(cur.entry.id, false);
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setOver(true);
        return nl;
      });
    }
  }

  function reset() {
    setLevel(1); setScore(0); setLives(START_LIVES); setCombo(0);
    setOver(false); setDone([]); setFirstDone(false);
    // re-deal via the level effect (setLevel(1) won't refire if already 1)
    const shuffled = shuffle(entries.slice()).map((e) => gearEntry(1, e)); // level 1: whole words
    setQuota(Math.min(QUOTA, shuffled.length));
    setChests(shuffled.slice(0, LANE).map((entry, i) => ({ entry, filled: blankFill(entry), tint: i % CHEST_TINTS.length })));
    tintSeq.current = LANE;
    setQueue(shuffled.slice(LANE));
    setSelected(null);
    setCleared(0); setLevelDone(false);
  }

  // The belt stays dead-still AND fully browsable for the whole FIRST word —
  // not just until a chest is picked (Dan, 2026-07-06: if the belt starts
  // crawling the moment you pick a chest, the syllable you need is off-screen
  // for ~a minute and the learner is stuck). Once the first word is forged the
  // belt scrolls continuously as real time-pressure, easing gently by level.
  const beltFrozen = !firstDone;
  const beltSecs = beltSecsFor(level);

  // Client-only game: the belt shuffles with Math.random, so don't SSR it.
  if (!mounted) return null;

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl px-4 py-4" style={{ color: "#0c4a6e" }}>
      <CreditsSplash game="LexicaLater" emoji="🧰" />
      <style>{`
        @keyframes lxscroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes lxrattle{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
        @keyframes lxland{0%{transform:translateY(-170px) scale(1.06);opacity:0}14%{opacity:1}80%{transform:translateY(7px) scale(1)}100%{transform:translateY(0) scale(1)}}
        @keyframes lxaim{0%,100%{box-shadow:0 0 0 0 rgba(224,134,0,0)}50%{box-shadow:0 0 0 6px rgba(224,134,0,.45)}}
        @keyframes lxblink{0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes lxdrop{0%{transform:translateY(-6px);opacity:.35}50%{transform:translateY(7px);opacity:1}100%{transform:translateY(-6px);opacity:.35}}
        @keyframes lxpointR{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
        @keyframes lxpointL{0%,100%{transform:translateX(4px)}50%{transform:translateX(-4px)}}
        /* The belt IS the game — it must keep scrolling even under the global
           prefers-reduced-motion kill-switch (a .lx-belt class outranks the *
           rule). Decorative motion elsewhere still calms as intended. */
        .lx-belt{animation:lxscroll var(--lx-belt-secs,60s) linear infinite !important}
      `}</style>

      {/* HUD */}
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0c4a6e", textShadow: "0 2px 0 #fff" }}>
            🧰 Lexica<span style={{ color: "#ffc800" }}>Later</span>
          </h1>
          <p className="text-xs font-bold" style={{ color: "#075985" }}>{title}{subtitle ? ` — ${subtitle}` : ""}</p>
          {level >= 2 && entries.some((e) => LIVERY_COLOR_WORDS.some((w) => e.fr.toLowerCase().includes(w))) && (
            <p className="mt-0.5 text-[11px] font-black" style={{ color: "#b45309" }}>
              ⚠️ La couleur des coffres ne correspond pas aux mots !
            </p>
          )}
        </div>
        {/* Status chips: flat white, read-only. Buttons live in the raised
            yellow cluster below — two shapes so tappable is obvious at a
            glance (Dan, 2026-07-05: "i cannot tell which are tappable"). */}
        <span title="Points earned" className="rounded-xl border-2 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">Score <b style={{ color: "#58cc02" }}>{score}</b></span>
        <span title={level <= 1 ? "Whole words — pick the entire word for its meaning" : level >= SPELL_LEVEL ? "Orthographe — the word is cut into 2–4 letter chunks, not syllables" : "Syllables — longer words and a faster belt as levels rise"} className="rounded-xl border-2 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">
          Niveau <b style={{ color: "#1cb0f6" }}>{level}</b>{level >= SPELL_LEVEL && <b style={{ color: "#ff9600" }}> · ✍️ épelle !</b>}
        </span>
        <span title={`Words unlocked this level — ${quota} clears it`} className="rounded-xl border-2 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">Mots <b style={{ color: "#ff9600" }}>{cleared}/{quota}</b></span>
        <span title="Lives — a wrong syllable costs one" className="text-lg" style={{ color: "#ff4b4b" }}>{"♥".repeat(Math.max(0, lives))}<span className="opacity-20">{"♥".repeat(Math.max(0, START_LIVES - lives))}</span></span>
        <span className="flex items-center gap-2 rounded-xl border-2 border-sky-300 bg-sky-100 px-2 py-1">
          <button type="button" onClick={() => { chiptune.toggle("conveyor"); setMusic(chiptune.playing() === "conveyor"); }}
            title={music ? "Turn the music off" : "Turn the music on"}
            className={`rounded-lg border-2 border-b-4 px-2 py-0.5 text-xs font-black transition active:translate-y-0.5 active:border-b-2 ${
              music ? "border-[#3f9c17] bg-[#58cc02] text-white" : "border-[#e08600] bg-[#ffc800] text-[#5a3a08]"
            }`}>
            {music ? "🔊 Musique" : "🎵 Musique"}
          </button>
          {/* Full sound popover — 🗣 voix / 🎵 musique / 🔔 effets + volume —
              in the game itself, not only the site top bar (Dan, 2026-07-10). */}
          <SoundControl />
          <button type="button" onClick={() => setHard((h) => !h)}
            title="Hard mode — hides how many syllables each word has"
            className={`rounded-lg border-2 border-b-4 px-2 py-0.5 text-xs font-black transition active:translate-y-0.5 active:border-b-2 ${
              hard ? "border-rose-700 bg-rose-500 text-white" : "border-[#e08600] bg-[#ffc800] text-[#5a3a08]"
            }`}>
            {hard ? "😤 Hard ✓" : "😤 Hard"}
          </button>
        </span>
      </header>

      <p className="mb-2 text-center text-xs font-semibold" style={{ color: "#075985" }}>
        Drag a chest down — or just tap a key it needs — then fill its syllables in any order to unlock the French word.
        {hard && <b style={{ color: "#c0392b" }}> Hard: the syllable count is hidden.</b>}
      </p>

      {/* Chest lane — the holding area; the picked chest LEAVES it (it has
          moved down into the main area / bay), so it's never in two places. */}
      <div className="rounded-2xl border-4 border-white p-3" style={{ background: "linear-gradient(180deg,#ffe08a,#ffcf5c)" }}>
        <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-3">
          {chests.filter((c) => c.entry.id !== selected).map((c, laneIdx) => (
            // A locked treasure chest waiting in the holding area: gold body,
            // a darker lid band with a clasp, and the syllable-count lock below.
            // onClick is KEYBOARD-ONLY (detail === 0). Touch/mouse taps are fully
            // handled by the pointerup drag path; on iOS the trailing synthetic
            // click hit-tests the CURRENT layout — after the picked chest leaves
            // the lane and its neighbour reflows into the same spot, that click
            // used to pick the neighbour instead (Dan, 2026-07-07: "the chest I
            // tap is not the chest that descends").
            <button key={c.entry.id} type="button"
              onClick={(e) => { if (e.detail === 0) pickChest(c.entry.id); }}
              onPointerDown={(e) => startDrag(e, c.entry.id)}
              className="relative w-36 cursor-grab touch-none overflow-hidden rounded-lg border-2 border-b-4 text-center transition active:cursor-grabbing"
              style={{ borderColor: liveryOf(c.entry.fr, c.tint, level).edge, background: liveryOf(c.entry.fr, c.tint, level).body, boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)", opacity: ghost?.id === c.entry.id ? 0.4 : 1 }}>
              <span className="flex items-center justify-center" style={{ height: 10, background: liveryOf(c.entry.fr, c.tint, level).lid }}>
                <span style={{ width: 12, height: 4, borderRadius: 1, background: "#ffe9a8" }} />
              </span>
              {laneIdx < 26 && <span aria-hidden className="absolute left-1 top-1 grid h-4 w-4 place-items-center rounded bg-white/85 text-[10px] font-black" style={{ color: liveryOf(c.entry.fr, c.tint, level).edge }}>{String.fromCharCode(65 + laneIdx)}</span>}
              <span className="block px-2 pt-1 text-sm font-black" style={{ color: liveryOf(c.entry.fr, c.tint, level).edge }}>{c.entry.en}</span>
              <span className="mb-1.5 mt-1 flex justify-center gap-1">
                {(hard ? [c.entry.syllables.length] : c.entry.syllables).map((s, i) => {
                  const doneSlot = hard ? c.filled.some(Boolean) : c.filled[i];
                  return <span key={i} className="h-2 rounded-full" style={{ width: hard ? 24 : Math.max(8, String(s).length * 5), background: doneSlot ? "#2e7d00" : liveryOf(c.entry.fr, c.tint, level).edge }} />;
                })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assembly bay — the active chest with syllable-sized keyholes */}
      <div className="relative flex min-h-[7rem] items-center justify-center py-5">
        {!active && (
          <div className="flex flex-col items-center gap-2">
            {/* animated down-arrows — the "drag it down here" movement */}
            <div className="flex gap-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="text-2xl leading-none" style={{ color: "#ff2222", animation: `lxdrop 1s ease-in-out ${i * 0.15}s infinite` }}>⬇</span>
              ))}
            </div>
            {/* big red blinking call-to-action, arrows pointing in from each side */}
            <div className="flex items-center gap-2" style={{ animation: "lxblink 1.1s ease-in-out infinite" }}>
              <span className="text-3xl leading-none" style={{ color: "#ff2222", animation: "lxpointR .7s ease-in-out infinite" }} aria-hidden>👉</span>
              <span className="text-2xl font-black tracking-tight" style={{ color: "#ff2222", textShadow: "0 1px 0 #fff" }}>
                Drag down a chest to begin
              </span>
              <span className="text-3xl leading-none" style={{ color: "#ff2222", animation: "lxpointL .7s ease-in-out infinite" }} aria-hidden>👈</span>
            </div>
          </div>
        )}
        {active && (
          <div className="overflow-hidden rounded-xl border-2 text-center" style={{ borderColor: liveryOf(active.entry.fr, active.tint, level).edge, borderBottomWidth: 6, background: liveryOf(active.entry.fr, active.tint, level).body, boxShadow: "0 12px 24px -14px rgba(0,0,0,.5)" }}>
            {/* the opened lid */}
            <div className="flex items-center justify-center" style={{ height: 14, background: liveryOf(active.entry.fr, active.tint, level).lid }}>
              <span style={{ width: 18, height: 6, borderRadius: 2, background: "#ffe9a8" }} />
            </div>
            <div className="px-4 py-3">
            <div className="mb-3 text-lg font-black" style={{ color: liveryOf(active.entry.fr, active.tint, level).edge }}>{active.entry.en}</div>
            {hard ? (
              <div className="mx-auto flex min-h-[3rem] min-w-[8rem] items-center justify-center rounded-xl border-2 border-dashed px-4 text-xl font-black" style={{ borderColor: "#e08600", color: "#0c4a6e" }}>
                {active.entry.syllables.filter((s, i) => active.filled[i]).join("") || <span style={{ color: "#4a7fa6" }}>?</span>}
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                {active.entry.syllables.map((s, i) => {
                  // Any-order: every empty keyhole is a live target, so they all
                  // wear the dashed "ready" ring (no single aim slot anymore).
                  const filled = active.filled[i];
                  return (
                    <span key={i} lang="fr"
                      className="grid h-12 place-items-center whitespace-nowrap rounded-xl border-2 px-2 text-lg font-black"
                      style={{
                        minWidth: keyW(s),
                        borderStyle: filled ? "solid" : "dashed",
                        borderColor: filled ? "#2e7d00" : "#e08600",
                        background: filled ? "#46a302" : "#eef7ff",
                        color: filled ? "#fff" : "#4a7fa6",
                      }}>
                      {filled ? s : "▯"}
                    </span>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Key belt — for the FIRST word it's a static, fully-wrapped set so every
          syllable is on-screen and reachable (no waiting, no off-screen answers);
          after that it becomes a scrolling belt that eases into real
          time-pressure as levels rise. */}
      <div className="relative rounded-2xl border-4 border-white py-3" style={{ background: "linear-gradient(180deg,#bfe6ff,#9fd8fb)", ...(beltFrozen ? { minHeight: "4.5rem" } : { height: "4.5rem", overflow: "hidden" }) }}>
        {/* A key never wraps or shrinks: level-1 keys are whole PHRASES, and a
            fixed-width key let long ones wrap onto the neighbouring key —
            tiles looked "stacked over each other" (Dan, 2026-07-09). */}
        {beltFrozen ? (
          <div className="flex flex-wrap items-center justify-center gap-3 px-4">
            {beltPool.map((t, i) => (
              <button key={i} type="button" onClick={() => tapKey(t)} lang="fr"
                className="relative grid h-12 shrink-0 place-items-center whitespace-nowrap rounded-xl border-2 border-b-4 bg-white px-2 text-lg font-black"
                style={{ minWidth: keyW(t), color: "#0c4a6e", borderColor: "#4a94c4", animation: rattle === t ? "lxrattle 300ms" : undefined }}>
                {i < 10 && <span aria-hidden className="absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: "#4a94c4" }}>{(i + 1) % 10}</span>}
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="lx-belt flex w-max gap-3 px-4" style={{ "--lx-belt-secs": `${beltSecs}s` } as React.CSSProperties}>
            {[...beltPool, ...beltPool].map((t, i) => (
              <button key={i} type="button" onClick={() => tapKey(t)} lang="fr"
                className="relative grid h-12 shrink-0 place-items-center whitespace-nowrap rounded-xl border-2 border-b-4 bg-white px-2 text-lg font-black"
                style={{ minWidth: keyW(t), color: "#0c4a6e", borderColor: "#4a94c4", animation: rattle === t ? "lxrattle 300ms" : undefined }}>
                {i % beltPool.length < 10 && <span aria-hidden className="absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: "#4a94c4" }}>{((i % beltPool.length) + 1) % 10}</span>}
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Votre trésor — the words RELEASED from the chests (no boxes here; the
          chests stay up in the waiting/main areas — Dan, 2026-07-03). */}
      <div className="mt-3 flex min-h-[2.5rem] flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.7rem] font-black uppercase tracking-wider" style={{ color: "#e08600" }}>🧰 Votre trésor :</span>
        {/* Repeats ABSORB into the earlier copy with a ×n count instead of
            stacking (Dan, 2026-07-21) — key by word so the chip persists and
            only its counter updates. */}
        {(() => {
          const grouped: { fr: string; n: number }[] = [];
          for (const d of done) {
            const g = grouped.find((x) => x.fr === d.fr);
            if (g) g.n += 1; else grouped.push({ fr: d.fr, n: 1 });
          }
          return grouped.map((g) => (
            <span
              key={g.fr}
              lang="fr"
              className="inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-sm font-black"
              style={{
                borderColor: "#e0a500",
                background: "#fff8e1",
                color: "#9a6600",
                boxShadow: "0 1px 4px rgba(224,165,0,.4)",
                animation: "lxland 520ms cubic-bezier(.2,.7,.3,1.25) both",
              }}
            >
              <span aria-hidden>✨</span>
              {g.fr}
              {g.n > 1 && <span className="ml-0.5 rounded-full bg-[#e0a500] px-1.5 text-[11px] font-black text-white">×{g.n}</span>}
            </span>
          ));
        })()}
      </div>

      {/* Level-done / out-of-lives: a POPUP in the middle of the screen, not a
          card below the fold (Dan, 2026-07-09). The level banner dismisses
          itself via the auto-advance effect; game over keeps its button. */}
      {(over || levelDone) && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl border-4 border-sky-200 bg-white p-5 text-center shadow-2xl">
            {levelDone ? (
              // No OK tap between levels (Dan, 2026-07-08) — the banner shows
              // while the next level deals itself (see the auto-advance effect).
              <>
                <p className="text-2xl font-black" style={{ color: "#ff9600" }}>Niveau {level} terminé !</p>
                <p className="text-sm font-semibold" style={{ color: "#075985" }}>Score {score} · niveau {level + 1} arrive…</p>
              </>
            ) : (
              <>
                <p className="text-lg font-black">Plus de vies !</p>
                <p className="text-sm" style={{ color: "#075985" }}>Niveau {level} · score {score}</p>
                {/* The post-mortem (Dan, 2026-07-21): SAY what went wrong.
                    Lives are only ever lost to decoys, so the answer is
                    always: these fragments belonged to no word. */}
                {missTokens.current.length > 0 && (
                  <p lang="fr" className="mt-2 text-sm" style={{ color: "#9a3412" }}>
                    Vos vies sont parties sur des <b>leurres</b> — des fragments qui n'appartiennent à aucun mot :{" "}
                    {[...new Set(missTokens.current)].map((t) => `« ${t} »`).join(", ")}. Astuce : chaque touche utile appartient à un coffre visible !
                  </p>
                )}
                <button type="button" onClick={reset}
                  className="mt-3 rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-4 py-2 font-black text-white">Play again</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Drag ghost — the chest that follows the pointer while dragging, in
          the SAME livery as its lane chest so you can see which one you hold. */}
      {ghost && ghostChest && (
        <div
          className="pointer-events-none fixed z-[60] w-36 rounded-xl border-2 border-b-4 p-2 text-center opacity-90 shadow-xl"
          style={{ left: ghost.x, top: ghost.y, transform: "translate(-50%,-50%) rotate(-3deg)", borderColor: CHEST_TINTS[ghostChest.tint].edge, background: CHEST_TINTS[ghostChest.tint].body }}
        >
          <span className="block text-sm font-black" style={{ color: CHEST_TINTS[ghostChest.tint].edge }}>{ghostChest.entry.en}</span>
        </div>
      )}
    </div>
  );
}
