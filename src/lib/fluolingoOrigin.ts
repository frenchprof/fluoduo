/**
 * Where the name comes from — the animation, as data and arithmetic
 * (Dan's spec, 2026-08-30).
 *
 * The show is one sentence that loses everything it does not need:
 *
 *   Fluency {achieved} on {customisable} linguistic goals
 *     -> Fluency on linguistic goals      (the two variable fields go)
 *     -> Flu on lin go                    (three words are clipped)
 *     -> Flu o lin go                     (`on` is clipped too)
 *     -> Fluolingo                        (the three spaces close)
 *
 * Everything a check can hold this to lives HERE, in plain values, with no
 * DOM anywhere in the file: the two word lists, the five stages, the beat
 * times, and the layout arithmetic that decides where every letter sits.
 * `FluolingoOrigin.tsx` is the renderer and owns nothing but pixels.
 *
 * THE TWO OPERATIONS MUST LOOK DIFFERENT. Stages 1-3 are *reductions*:
 * letters leave and the survivors close up to ONE ORDINARY SPACE — which is
 * why every stage but the last carries `gap: "space"`. Stage 4 is the
 * *merge*: no letter leaves, the three spaces themselves close to nothing.
 * An earlier cut of this animation smeared the two together and sat for a
 * beat on `Flu   o   lin   go` with holes in it. That state is not reachable
 * from this table: a gap is one space or it is zero, never anything between.
 *
 * FONT SIZE NEVER SHRINKS after the sentence settles. `step` counts the
 * growth steps applied so far and only ever goes up; the renderer turns it
 * into `base * (1 + growth) ** step`. The phrase gets shorter at every stage,
 * so the room it frees is spent on size, never taken back.
 */

/** The settled sentence, word by word. Indices are stable everywhere below. */
export const SENTENCE = [
  "Fluency",      // 0  -> Flu
  "achieved",     // 1  -> gone (the first variable field)
  "on",           // 2  -> o
  "customisable", // 3  -> gone (the second variable field)
  "linguistic",   // 4  -> lin
  "goals",        // 5  -> go
] as const;

/** The two slots that cycle. Each list ENDS on the word the sentence settles on. */
export const FIELD_ONE = [
  "built", "developed", "enhanced", "cultivated", "fostered",
  "measured", "assessed", "evaluated", "achieved",
] as const;

export const FIELD_TWO = [
  "your course’s", "named", "structured", "shared", "bespoke",
  "personal", "chosen", "tailored", "customisable",
] as const;

/** Which SENTENCE word each cycling list fills. */
export const FIELD_SLOT = [1, 3] as const;

export type Stage = {
  key: string;
  /** how many LEADING letters of each SENTENCE word survive; 0 = the word goes */
  keep: readonly number[];
  /** one ordinary space between surviving fragments, or none (the merge) */
  gap: "space" | "none";
  /** growth steps applied by the time this stage is reached; monotonic */
  step: number;
};

export const STAGES: readonly Stage[] = [
  // Fluency achieved on customisable linguistic goals
  { key: "sentence", keep: [7, 8, 2, 12, 10, 5], gap: "space", step: 0 },
  // Fluency on linguistic goals
  { key: "unfilled", keep: [7, 0, 2, 0, 10, 5], gap: "space", step: 1 },
  // Flu on lin go
  { key: "clipped", keep: [3, 0, 2, 0, 3, 2], gap: "space", step: 2 },
  // Flu o lin go
  { key: "shortened", keep: [3, 0, 1, 0, 3, 2], gap: "space", step: 3 },
  // Fluolingo
  { key: "merged", keep: [3, 0, 1, 0, 3, 2], gap: "none", step: 4 },
];

/** The text a stage reads as — what a viewer would type if asked to copy it. */
export function stageText(stage: Stage): string {
  const parts: string[] = [];
  SENTENCE.forEach((w, i) => {
    const k = stage.keep[i];
    if (k > 0) parts.push(w.slice(0, k));
  });
  return parts.join(stage.gap === "space" ? " " : "");
}

/* ── the beats ────────────────────────────────────────────────────────────
   Absolute milliseconds from the start. The holds are not padding: each one
   is the time a viewer needs to READ the new phrase before it changes again,
   which is the whole point of showing the steps at all. */
export const BEATS = {
  /** the first field stops on `achieved` */
  cycleOneEnds: 2400,
  /** the second stops on `customisable`; the sentence is complete here */
  cycleTwoEnds: 2900,
  /** ...and is held, with the two field colours still on, so it can be read */
  holdSentenceEnds: 4300,
  /** the fields leave; `Fluency on linguistic goals` closes up */
  reduceFields: [4300, 5200],
  /** the survivors take their colours — before the letters they keep are cut */
  bloom: [5400, 6050],
  holdUnfilledEnds: 6100,
  /** Fluency/linguistic/goals are clipped to Flu/lin/go */
  reduceWords: [6100, 7050],
  holdClippedEnds: 7850,
  /** `on` is clipped to `o` */
  reduceOn: [7850, 8550],
  holdShortenedEnds: 9250,
  /** the three spaces close: Flu o lin go -> Fluolingo */
  merge: [9250, 10400],
  /** the finished word is held longest of all */
  end: 13000,
} as const;

/** The chips behind the cycling fields fade as the first reduction begins. */
export const CHIP_FADE = [BEATS.reduceFields[0], BEATS.reduceFields[0] + 400] as const;

/**
 * Tick times for one cycling field. The intervals GROW — that is the whole of
 * the deceleration, and it is arithmetic rather than a separate slow-down
 * pass: the last word is on screen for the longest beat before the field
 * stops on it.
 *
 * `count` is a whole number of passes through the list, so the final tick
 * always lands on the list's last word, which is the one the sentence keeps.
 */
export function cycleTicks(
  duration: number,
  listLength: number,
  passes = 2,
  slowdown = 9,
): number[] {
  const count = listLength * passes;
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = count === 1 ? 1 : i / (count - 1);
    weights.push(1 + (slowdown - 1) * x ** 1.7);
  }
  const total = weights.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < count; i++) {
    out.push((acc / total) * duration);
    acc += weights[i];
  }
  return out;
}

/** Which word a field shows at time `t` (its last word once the ticks run out). */
export function cycleWordAt(t: number, ticks: number[], list: readonly string[]): string {
  let i = 0;
  while (i + 1 < ticks.length && ticks[i + 1] <= t) i++;
  if (t >= ticks[ticks.length - 1]) return list[list.length - 1];
  return list[i % list.length];
}

/* ── layout ───────────────────────────────────────────────────────────────
   All widths are in em, so one measuring pass serves every font size. `adv`
   returns the advance width of one character in em. */

export type Placed = {
  /** stable across the whole show: word index + letter index */
  key: string;
  ch: string;
  /** left edge, in em, from the left edge of the phrase */
  x: number;
  /** which SENTENCE word it belongs to */
  word: number;
  /** its position in that word — a letter survives while index < keep */
  index: number;
  /** a letter that has left the phrase: zero width, sitting on the seam it
      closed, so the survivors can travel through the space it gave up */
  ghost: boolean;
};

export type Layout = { items: Placed[]; width: number };

/**
 * Place every letter of every word for one stage.
 *
 * A letter that does not survive takes NO WIDTH and is parked exactly where
 * the phrase closed over it. That single rule is what makes the reductions
 * read as reductions: the survivors' target positions already have the holes
 * taken out, so interpolating towards them IS the inward travel, and there is
 * no leftover width anywhere to leave a gap behind.
 */
export function layoutStage(
  stage: Stage,
  words: readonly string[],
  adv: (ch: string) => number,
): Layout {
  const gap = stage.gap === "space" ? adv(" ") : 0;
  const items: Placed[] = [];
  let cursor = 0;
  let placedLive = 0;

  words.forEach((w, wi) => {
    const keep = Math.min(stage.keep[wi], w.length);
    if (keep > 0 && placedLive > 0) cursor += gap;
    for (let i = 0; i < w.length; i++) {
      const alive = i < keep;
      items.push({ key: `w${wi}c${i}`, ch: w[i], x: cursor, word: wi, index: i, ghost: !alive });
      if (alive) cursor += adv(w[i]);
    }
    if (keep > 0) placedLive++;
  });

  return { items, width: cursor };
}

/** The widest the phrase ever gets: every field pairing, at stage 0. */
export function widestSentenceEm(adv: (ch: string) => number): number {
  const wordEm = (w: string) => [...w].reduce((s, ch) => s + adv(ch), 0);
  const fixed = SENTENCE.map(wordEm);
  const one = Math.max(...FIELD_ONE.map(wordEm));
  const two = Math.max(...FIELD_TWO.map(wordEm));
  const parts = [fixed[0], one, fixed[2], two, fixed[4], fixed[5]];
  return parts.reduce((a, b) => a + b, 0) + adv(" ") * (parts.length - 1);
}

/* ── easing ───────────────────────────────────────────────────────────────
   Two curves, on purpose. The reductions share one so they read as the same
   kind of event; the merge gets its own, slower off the mark and firmer into
   the stop, so the closing of the spaces feels like a different operation. */
export const easeReduce = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;

export const easeMerge = (x: number) =>
  x < 0.5 ? 8 * x * x * x * x : 1 - (-2 * x + 2) ** 4 / 2;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Progress through a [start, end] window at time t. */
export const span = (t: number, window: readonly [number, number] | readonly number[]) =>
  clamp01((t - window[0]) / (window[1] - window[0]));
