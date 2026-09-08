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

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { logEvent } from "@/lib/firebase/usage";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import GameFrame from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import { recordItemResult } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";

export type LexEntry = {
  id: string;
  fr: string;
  en: string;
  syllables: string[];
  say?: string;
  /**
   * THE JOINTS ARE THE POINT, LEAVE THEM ALONE (8 Sep). A normal chest is
   * re-cut for the level: whole word at 1, hand-authored syllables at 2–3,
   * random spelling chunks at 4+. A PHRASE chest — « Vous tournez » + « à
   * droite » — is not a word broken into pieces, it is two pieces that make a
   * sentence, and its two keyholes ARE the exercise. Re-cutting it at level 1
   * hands the learner the whole sentence as one key, and at level 4 it
   * shatters into letter chunks that cross the joint.
   */
  fixed?: boolean;
};

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
function gearEntry<E extends { fr: string; syllables: string[]; fixed?: boolean }>(level: number, e: E): E {
  if (e.fixed) return e; // a phrase chest: its joints are the exercise
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

/**
 * A DRAWN TREASURE CHEST (Dan, 8 Sep, with a sketch: *"could the chests look
 * more like this"*). The chest used to be a rounded rectangle with a darker
 * strip across the top — a card standing in for a chest. His drawing is the
 * thing itself: a domed lid, cream metal straps down the barrel, a lock plate
 * with a keyhole, plank lines, and a shadow on the paper under it.
 *
 * SVG, NOT AN IMAGE. It is drawn in the chest's own livery — the deck's colour
 * runs through the wood while the straps and the plate stay cream — so the
 * fifteen liveries still tell the chests apart, and it scales from the 96px
 * lane chest to the bay's without a second asset. It costs one inline element
 * per chest, and there are three on screen.
 *
 * `body` and `lid` are CSS gradients, which SVG cannot take as a fill, so the
 * gradient is rebuilt here as a linearGradient from the two stops in the
 * string. A livery that stops being a two-stop gradient falls back to the raw
 * value, which a flat colour already is.
 */
function gradStops(css: string): [string, string] {
  const m = css.match(/(#[0-9a-f]{3,8})[^#]*(#[0-9a-f]{3,8})/i);
  return m ? [m[1], m[2]] : [css, css];
}

function ChestArt({ tint, open = false, className = "" }: { tint: ChestTint; open?: boolean; className?: string }) {
  const id = useId();
  const [b1, b2] = gradStops(tint.body);
  const ink = tint.edge;
  const BAND = "#fdf6e4";
  return (
    <svg viewBox="0 0 104 96" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b1} /><stop offset="1" stopColor={b2} /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b1} /><stop offset="1" stopColor={b2} /></linearGradient>
        {/* THE STRAPS ARE CLIPPED TO THE WOOD. Drawn as plain strokes they
            overshot: a round cap adds half the 8-unit width, so the lid straps
            rose above the dome's own silhouette and the barrel straps hung
            past the base band's rounded foot. Clipping to the two shapes is
            exact at every size, where trimming the endpoints by hand is one
            number that is right for one radius. */}
        <clipPath id={`${id}cl`}><path d="M8 46 V40 A49 49 0 0 1 96 40 V46 z" /></clipPath>
        <clipPath id={`${id}cb`}><path d="M12 38 h80 v40 h2 v6 a3 3 0 0 1 -3 3 H13 a3 3 0 0 1 -3 -3 v-6 h2 z" /></clipPath>
      </defs>
      <ellipse cx="52" cy="90" rx="42" ry="4.5" fill="rgba(0,0,0,0.14)" />

      {/* THE BARREL, and a base band along the foot. */}
      <path d="M12 44 h80 v38 a3 3 0 0 1 -3 3 H15 a3 3 0 0 1 -3 -3 z"
            fill={`url(#${id}b)`} stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 58 H88 M16 70 H88" stroke={ink} strokeWidth="1" opacity="0.25" />
      <path d="M10 78 h84 v6 a3 3 0 0 1 -3 3 H13 a3 3 0 0 1 -3 -3 z"
            fill={`url(#${id}b)`} stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />

      {/* THE LID, and the rail it closes onto. It OVERHANGS the barrel by 4
          units a side and wears the barrel's own colour, only shaded — the
          first draft filled it with the livery's separate dark `lid` value and
          the chest came out as a dark arch standing on a pale box. */}
      <g transform={open ? "rotate(-14 12 44)" : undefined}>
        <path d="M8 44 V40 A49 49 0 0 1 96 40 V44 z"
              fill={`url(#${id}l)`} stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M8 40 A49 49 0 0 1 96 40" fill="rgba(0,0,0,0.16)" stroke="none" opacity="0.45" />
        <rect x="8" y="38" width="88" height="8" rx="2" fill={`url(#${id}b)`} stroke={ink} strokeWidth="2.4" />
        {/* the straps over the lid, with their rivets */}
        <g clipPath={`url(#${id}cl)`}>
          <path d="M30 46 V8 M74 46 V8" stroke={BAND} strokeWidth="8" />
          <path d="M30 46 V8 M74 46 V8" stroke={ink} strokeWidth="1.3" fill="none" opacity="0.5" />
        </g>
        <circle cx="30" cy="26" r="1.6" fill={ink} opacity="0.55" />
        <circle cx="74" cy="26" r="1.6" fill={ink} opacity="0.55" />
      </g>

      {/* and down the barrel, foot to base band */}
      <g clipPath={`url(#${id}cb)`}>
        <path d="M30 40 V92 M74 40 V92" stroke={BAND} strokeWidth="8" />
        <path d="M30 40 V92 M74 40 V92" stroke={ink} strokeWidth="1.3" opacity="0.5" />
      </g>
      <circle cx="30" cy="64" r="1.6" fill={ink} opacity="0.55" />
      <circle cx="74" cy="64" r="1.6" fill={ink} opacity="0.55" />

      {/* the lock plate straddling the rail, and its keyhole */}
      <rect x="43" y="36" width="18" height="22" rx="3" fill={BAND} stroke={ink} strokeWidth="2.2" />
      <circle cx="52" cy="44" r="2.8" fill={ink} />
      <path d="M52 45 l-1.8 7 h3.6 z" fill={ink} />
    </svg>
  );
}
const CHEST_TINTS: ChestTint[] = [
  { body: "linear-gradient(180deg,#ffe08a,#eaa61c)", lid: "linear-gradient(180deg,#c8860f,#96600c)", edge: "#7a4e0a" }, // or
  { body: "linear-gradient(180deg,#ffd3de,#e56a8f)", lid: "linear-gradient(180deg,#c04a6e,#8f2d4c)", edge: "#7a2438" }, // rose
  { body: "linear-gradient(180deg,#cdeaff,#57a6dc)", lid: "linear-gradient(180deg,#3d7fb0,#2a5c82)", edge: "#1e4f70" }, // bleu
  { body: "linear-gradient(180deg,#d9f2c4,#83c04f)", lid: "linear-gradient(180deg,#5c9433,#446e24)", edge: "#33591b" }, // vert
  { body: "linear-gradient(180deg,#e9dcff,#a284de)", lid: "linear-gradient(180deg,#7a58b8,#5a3f8c)", edge: "#4b2f7a" }, // violet
];


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
  // Missing until now (2026-08-02 bug report): colors.json's 12th color had
  // no livery entry, so a "beige" chest fell through to the arbitrary
  // CHEST_TINTS rotation even at levels 0-1, where every color word is
  // supposed to get its own truthful livery — a beige chest could render as
  // any of the 5 rotating tints, including green.
  beige:  { body: "linear-gradient(180deg,#f0e6d2,#d4c19c)", lid: "linear-gradient(180deg,#b8a274,#8f7a52)", edge: "#6b5a3a" },
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
  deckId,
  exitHref = "/games/lexicalater",
}: {
  title: string;
  subtitle?: string;
  entries: LexEntry[];
  decoys: string[];
  /** The curated deck — "where it goes" on the post-mortem. */
  deckId?: string;
  /** Where ✕ leads. */
  exitHref?: string;
}) {
  // `deckId` is optional (the mixed board passes none), so the tag falls back
  // to a stable literal rather than the string "lexicalater:undefined".
  const LEX_ACTIVITY = `lexicalater:${deckId ?? "mixed"}`;
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
  const [popupNudge, setPopupNudge] = useState(false);
  const [music, setMusic] = useState(false);
  const musicAutoRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
  useEffect(() => setMounted(true), []);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount

  // Auto-advance between levels (Dan, 2026-07-08: no OK tap) — the fanfare
  // gets a beat, then the next level deals itself and taps land in the game.
  useEffect(() => {
    if (!levelDone) return;
    void logEvent("game.end", { game: "lexicalator", collectionId: title, score });
    const t = window.setTimeout(() => setLevel((l) => l + 1), 1800);
    return () => window.clearTimeout(t);
  // Fires on levelDone alone, by design: score and title are read at the
  // moment the level completes — listing them would re-log game.end on
  // every scoring tick. Reviewed with Dan 2026-08-31: disable, not fix.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelDone]);

  // Apply the shared volume (fluolingo:volume) on mount; the slider itself
  // now lives inside the SoundControl popover on the game bar.
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
  // The post-mortem's rows (patch 23): the word being forged, its syllables,
  // the decoy that was tapped instead.
  const [misses, setMisses] = useState<GameMiss[]>([]);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
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
    //
    // A FIXED CHEST HAS NO "LEVEL 1" (8 Sep). The level-1 bait is other whole
    // ANSWERS of the deck, which is fair when a chest's one keyhole holds a
    // whole word. A phrase chest's keyholes hold HALVES, so baiting with whole
    // sentences — « Vous sortez de la station de métro » beside a two-hole
    // lock — is not a temptation, it is a give-away: the wrong keys are the
    // only ones too long to fit. Deals like that take the deck's authored
    // halves instead, at every level.
    const fixedLane = chests.some((c) => c.entry.fixed);
    const usable =
      level <= 1 && !fixedLane
        ? shuffle(entries.map((e) => e.fr.trim()).filter((w) => !real.has(w) && !isPartialOfMono(w) && !isPartOfLaneWord(w))).slice(0, 4)
        : fixedLane
        ? decoys.filter((d) => !real.has(d) && !isPartialOfMono(d) && !isPartOfLaneWord(d))
        : level >= SPELL_LEVEL
          ? [...new Set([...real].map(mutateChunk).filter((m): m is string => !!m && !real.has(m) && !isPartOfLaneWord(m)))].slice(0, 6)
          : decoys.filter((d) => !real.has(d) && !isPartialOfMono(d) && !isPartOfLaneWord(d));
    return shuffle([...real, ...usable]);
    // The dep is a JOINED id list on purpose — the board must re-deal when the
    // chests change identity, not when their array does. Both rules object to
    // the same deliberate line; pre-existing, and not this change's to redesign.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
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
        // eslint-disable-next-line react-hooks/immutability -- the key handler closes over the current tapKey — pre-existing
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
    // A tap during the level-clear fanfare or the game-over screen used to do
    // NOTHING — no rattle, no sound, nothing — which reads as "the game
    // didn't respond" (2026-08-02 bug report) even though play is just
    // paused behind the popup. Nudge the popup itself instead of the belt.
    if (over || levelDone) {
      setPopupNudge(true);
      window.setTimeout(() => setPopupNudge(false), 300);
      return;
    }
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
      // fr now carries the full prefixed phrase (2026-08-02), so family
      // matching must strip ALL known prefixes — not just articles — to
      // still compare the underlying word (nageur/nageuse must match through
      // "il est "/"elle est ", not just through "un "/"une ").
      const bare = (e: { fr: string }) =>
        e.fr.toLowerCase().replace(
          /^(ils sont |elles sont |ils ont |elles ont |il est |elle est |à la |à l’|à l'|de la |de l’|de l'|le |la |les |l’|l'|un |une |des |au |aux |en |à |du |ce |cet |cette |ces |mon |ma |mes |ton |ta |tes |son |sa |ses |notre |nos |votre |vos |leur |leurs )/,
          '',
        );
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
        recordItemResult(entry.id, true, undefined, LEX_ACTIVITY);
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
      setMisses((m) => [
        ...m,
        { itemId: cur.entry.id, deckId, prompt: cur.entry.fr, expected: cur.entry.syllables.join(" · "), given: token },
      ]);
      sfx.wrong();
      setRattle(token);
      window.setTimeout(() => setRattle(null), 300);
      setCombo(0);
      recordItemResult(cur.entry.id, false, token, LEX_ACTIVITY);
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
    missTokens.current = []; setMisses([]);
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

  const grouped: { fr: string; n: number }[] = [];
  for (const d of done) {
    const g = grouped.find((x) => x.fr === d.fr);
    if (g) g.n += 1; else grouped.push({ fr: d.fr, n: 1 });
  }
  const tresorChips = grouped.map((g) => (
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

  // THE ONE SENTENCE THAT IS THE GAME, pulled out so the first-run popup and
  // the ⋯ → Help sheet are literally the same node rather than two wordings
  // (Dan, 2026-09-02: the popup "reads long as an arrival card"). The three
  // paragraphs under it are rules a player meets as they go — levels, decoys,
  // hard mode — and none of them is needed to make the first move.
  const howToPlay = (
    <p>Drag a chest down, or tap a key it needs. Fill its syllables in any order.</p>
  );
  // A LIST, NOT THREE PARAGRAPHS (5 Sep language pass). Same three rules, but
  // a player looking for one of them can find it without reading the other two
  // — and "every useful key belongs to a visible chest" went, because "only
  // decoys cost a life" already says it.
  const help = (
    <>
      {howToPlay}
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        <li><b>Levels</b> — 1 deals whole words, 2–3 syllables, {SPELL_LEVEL}+ spelling. Six words clear a level.</li>
        <li><b>Lives</b> — only decoys cost one: fragments belonging to no word on the lane.</li>
        <li><b>Hard</b> hides how many syllables a word has.</li>
      </ul>
      {subtitle && <p className="mt-3 text-xs text-[color:var(--cahier-ink-soft)]">{title} — {subtitle}</p>}
    </>
  );

  return (
    <GameFrame
      title="🧰 LexicaLater"
      exitHref={exitHref}
      progress={{ done: cleared, total: quota }}
      hearts={{ left: lives, total: START_LIVES }}
      score={<>{score} · L{level}{level >= SPELL_LEVEL ? " ✍️" : ""}</>}
      help={help}
      hint={howToPlay}
      hintKey="lexicalater"
      menu={[
        { label: "🎵 Music", active: music, onClick: () => { chiptune.toggle("conveyor"); setMusic(chiptune.playing() === "conveyor"); } },
        { label: "😤 Hard", active: hard, onClick: () => setHard((h) => !h) },
      ]}
      record={<div className="flex flex-wrap gap-2">{tresorChips}</div>}
      recordTitle="🧰 Your treasure"
      background="linear-gradient(180deg, var(--region-heights-band) 0%, var(--cahier-paper) 60%)"
    >
    <div ref={rootRef} className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-3" style={{ color: "#0c4a6e" }}>
      <CreditsSplash game="LexicaLater" emoji="🧰" />
      <style>{`
        @keyframes lxscroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes lxrattle{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
        @keyframes lxland{0%{transform:translateY(-170px) scale(1.06);opacity:0}14%{opacity:1}80%{transform:translateY(7px) scale(1)}100%{transform:translateY(0) scale(1)}}
        @keyframes lxaim{0%,100%{box-shadow:0 0 0 0 rgba(224,134,0,0)}50%{box-shadow:0 0 0 6px rgba(224,134,0,.45)}}
        @keyframes lxdrop{0%{transform:translateY(-6px);opacity:.35}50%{transform:translateY(7px);opacity:1}100%{transform:translateY(-6px);opacity:.35}}
        /* The belt IS the game — it must keep scrolling even under the global
           prefers-reduced-motion kill-switch (a .lx-belt class outranks the *
           rule). Decorative motion elsewhere still calms as intended. */
        .lx-belt{animation:lxscroll var(--lx-belt-secs,60s) linear infinite !important}
      `}</style>

      {level >= 2 && entries.some((e) => LIVERY_COLOR_WORDS.some((w) => e.fr.toLowerCase().includes(w))) && (
        <p className="mb-2 text-center text-[11px] font-black" style={{ color: "#b45309" }}>
          ⚠️ Chest colours don&rsquo;t match the words!
        </p>
      )}

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
              // THE CHEST IS A DRAWING NOW (Dan's sketch, 8 Sep). The card that
              // stood in for it — a rounded rectangle with a darker strip on
              // top — is gone; what is left of the button is a transparent hit
              // area holding the drawing, its label and its lock. Nothing about
              // the drag, the letter key or the slot bars changes.
              className="relative w-36 cursor-grab touch-none rounded-lg text-center transition active:cursor-grabbing"
              style={{ opacity: ghost?.id === c.entry.id ? 0.4 : 1 }}>
              <ChestArt tint={liveryOf(c.entry.fr, c.tint, level)} className="mx-auto block w-[112px]" />
              {laneIdx < 26 && <span aria-hidden className="absolute left-1 top-1 grid h-4 w-4 place-items-center rounded bg-white/85 text-[10px] font-black" style={{ color: liveryOf(c.entry.fr, c.tint, level).edge }}>{String.fromCharCode(65 + laneIdx)}</span>}
              <span className="block px-2 pt-1 text-sm font-black leading-tight" style={{ color: liveryOf(c.entry.fr, c.tint, level).edge }}>{c.entry.en}</span>
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
          // The "drag it down here" movement — arrows only (patch 23): the
          // blinking red sentence and its two pointing hands were four
          // simultaneous infinite animations (a WCAG 2.3.1 flash risk) and,
          // by Dan's litmus test, text the learner can find the answer
          // without.
          <div className="flex gap-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="text-2xl leading-none" style={{ color: "#ff2222", animation: `lxdrop 1s ease-in-out ${i * 0.15}s infinite` }}>⬇</span>
            ))}
          </div>
        )}
        {active && (
          <div className="text-center">
            {/* THE CHEST IN THE BAY, with its lid hinged open — same drawing as
                the lane's, one prop apart, so the chest you dragged down is
                visibly the chest you are now filling. */}
            <ChestArt tint={liveryOf(active.entry.fr, active.tint, level)} open className="mx-auto block w-[162px]" />
            <div className="-mt-2 px-4 py-3">
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

      {/* Votre trésor — the words RELEASED from the chests. On a desktop it
          lives in the frame's record pane; this row is phones only. */}
      <div className="mt-3 flex min-h-[2.5rem] flex-wrap items-center gap-2 lg:hidden">
        {tresorChips}
      </div>

      {/* Vos erreurs — the wrong fragments (decoys) tapped so far, live below
          the trésor (Dan, 2026-08-02, ported 2026-08-20: show what went wrong
          as it happens, not only in the game-over post-mortem). Same grouped-
          chip treatment as the trésor, in the drill-bad palette so it reads
          as "mistake", not "win". Sourced from the same `misses` rows the
          post-mortem shows — one record, two surfaces. */}
      {misses.length > 0 && !over && (
        <div className="mt-2 flex min-h-[2.5rem] flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.7rem] font-black uppercase tracking-wider" style={{ color: "var(--drill-bad)" }}>❌ Vos erreurs :</span>
          {(() => {
            const grouped: { token: string; n: number }[] = [];
            for (const t of misses.map((mi) => mi.given).filter((g): g is string => !!g)) {
              const g = grouped.find((x) => x.token === t);
              if (g) g.n += 1; else grouped.push({ token: t, n: 1 });
            }
            return grouped.map((g) => (
              <span
                key={g.token}
                lang="fr"
                className="inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-sm font-black"
                style={{ borderColor: "var(--drill-bad-soft)", background: "var(--drill-bad-bg)", color: "var(--drill-bad)" }}
              >
                {g.token}
                {g.n > 1 && <span className="ml-0.5 rounded-full px-1.5 text-[11px] font-black text-white" style={{ background: "var(--drill-bad)" }}>×{g.n}</span>}
              </span>
            ));
          })()}
        </div>
      )}

      {/* Level-done: a POPUP in the middle of the screen (Dan, 2026-07-09);
          it dismisses itself via the auto-advance effect. */}
      {levelDone && !over && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div
            className="w-full max-w-sm rounded-3xl border-4 border-sky-200 bg-white p-5 text-center shadow-2xl"
            style={{ animation: popupNudge ? "lxrattle 300ms" : undefined }}
          >
            <p className="text-2xl font-black" style={{ color: "#ff9600" }}>Level {level} complete!</p>
            <p className="text-sm font-semibold" style={{ color: "#075985" }}>Score {score} · level {level + 1} incoming…</p>
          </div>
        </div>
      )}

      {/* Out of lives — the post-mortem (patch 23): each decoy, the word it
          was forged against, and where that word lives on the path. */}
      {over && (
        <GameOver
          emoji="🧰"
          title="Out of lives!"
          score={<>{score} · level {level}</>}
          won={false}
          misses={misses}
          onReplay={reset}
          exitHref={exitHref}
        />
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
    </GameFrame>
  );
}
