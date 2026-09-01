/**
 * WHERE THE NAME COMES FROM — the animation, as data and arithmetic.
 *
 * Dan's spec of 30 Aug, rebuilt 1 Sep in FluOLinGo Hand (decision 4: "to be
 * REDONE in FluOLinGo Hand"; the two 30 Aug branches are reference, not a
 * base). The show is one sentence that loses everything it does not need:
 *
 *   Fluency {achieved} on {customisable} linguistic goals
 *     -> Fluency on linguistic goals      the two variable fields go
 *     -> Flu on lin go                    three words are clipped
 *     -> Flu o lin go                     `on` is clipped too
 *     -> Fluolingo                        the three spaces close
 *     -> FluOLinGo                        and the four initials rise
 *
 * THE LAST LINE IS NEW, AND IT IS THE POINT. The 30 Aug cut ended on
 * `Fluolingo`, all lowercase — a spelling that stopped existing the next day,
 * when Dan made the names law: *"FluOLinGo (with capitals F,O,L,G) for
 * FluencyOnLinguisticGoals"*. So the old ending does not just look wrong, it
 * contradicts the thing the animation exists to explain.
 *
 * And the fix earns its beat rather than filling one. Up to the merge, the
 * SPACES are what mark the four words. Closing them is what makes the name —
 * and it is also what would throw the four words away. The capitals are what
 * the spaces leave behind: `Fluolingo` is a word, `FluOLinGo` is still four.
 * That is why the brand is spelt with those four capitals and no others, so
 * the animation ends by showing exactly that, one beat after the merge.
 *
 * Everything a check can hold this to lives HERE, in plain values, with no DOM
 * anywhere in the file: the two word lists, the six stages, the beat times, and
 * the layout arithmetic that decides where every letter sits.
 * `FluolingoOrigin.tsx` is the renderer and owns nothing but pixels.
 *
 * THE THREE OPERATIONS MUST LOOK DIFFERENT. Stages 1–3 are *reductions*:
 * letters leave and the survivors close up to ONE ORDINARY SPACE — which is why
 * those stages carry `gap: "space"`. Stage 4 is the *merge*: no letter leaves,
 * the three spaces themselves close to nothing. Stage 5 is the *naming*: no
 * letter leaves and nothing closes, three glyphs simply grow into their
 * capitals. An earlier cut smeared the first two together and sat for a beat on
 * `Flu   o   lin   go` with holes in it. That state is not reachable from this
 * table: a gap is one space or it is zero, never anything between.
 *
 * FONT SIZE NEVER SHRINKS after the sentence settles. `step` counts the growth
 * steps applied so far and only ever goes up; the renderer turns it into
 * `base * ratio ** step`. The phrase gets shorter at every stage, so the room
 * it frees is spent on size, never taken back. (The naming stage does make the
 * phrase a shade WIDER — `O`, `L` and `G` are broader than their lowercase —
 * so it shares stage 4's step rather than claiming another.)
 */

/** The settled sentence, word by word. Indices are stable everywhere below. */
export const SENTENCE = [
  "Fluency",      // 0  -> Flu
  "achieved",     // 1  -> gone (the first variable field)
  "on",           // 2  -> o -> O
  "customisable", // 3  -> gone (the second variable field)
  "linguistic",   // 4  -> lin -> Lin
  "goals",        // 5  -> go -> Go
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

/** The words the two fields SETTLE on — derived from the sentence, never typed
 *  a second time. Both the renderer (once the fields have gone) and every
 *  caller that wants the finished phrase need them, and two places spelling
 *  "achieved" independently is two places to forget to change it. */
export const SETTLED: readonly [string, string] = [SENTENCE[FIELD_SLOT[0]], SENTENCE[FIELD_SLOT[1]]];

export type Stage = {
  key: string;
  /** how many LEADING letters of each SENTENCE word survive; 0 = the word goes */
  keep: readonly number[];
  /** one ordinary space between surviving fragments, or none (the merge) */
  gap: "space" | "none";
  /** growth steps applied by the time this stage is reached; monotonic */
  step: number;
  /** every surviving fragment's first letter is its word's INITIAL, in capital */
  caps: boolean;
};

export const STAGES: readonly Stage[] = [
  // Fluency achieved on customisable linguistic goals
  { key: "sentence",  keep: [7, 8, 2, 12, 10, 5], gap: "space", step: 0, caps: false },
  // Fluency on linguistic goals
  { key: "unfilled",  keep: [7, 0, 2, 0, 10, 5], gap: "space", step: 1, caps: false },
  // Flu on lin go
  { key: "clipped",   keep: [3, 0, 2, 0, 3, 2], gap: "space", step: 2, caps: false },
  // Flu o lin go
  { key: "shortened", keep: [3, 0, 1, 0, 3, 2], gap: "space", step: 3, caps: false },
  // Fluolingo
  { key: "merged",    keep: [3, 0, 1, 0, 3, 2], gap: "none",  step: 4, caps: false },
  // FluOLinGo — the name, and the four words still visible inside it
  { key: "named",     keep: [3, 0, 1, 0, 3, 2], gap: "none",  step: 4, caps: true },
];

/** The six words this stage places, with the cycling fields filled in and the
 *  initials raised if the stage has been named. A fragment's first letter is
 *  its word's initial, which is exactly what the capitals record. */
export function stageWords(stage: Stage, fields: readonly [string, string]): string[] {
  const ws = SENTENCE.map((w, i) =>
    i === FIELD_SLOT[0] ? fields[0] : i === FIELD_SLOT[1] ? fields[1] : w,
  );
  if (!stage.caps) return ws;
  return ws.map((w, i) => (stage.keep[i] > 0 ? w[0].toUpperCase() + w.slice(1) : w));
}

/** The text a stage reads as — what a viewer would type if asked to copy it. */
export function stageText(stage: Stage, fields: readonly [string, string] = SETTLED): string {
  const words = stageWords(stage, fields);
  const parts: string[] = [];
  words.forEach((w, i) => {
    const k = stage.keep[i];
    if (k > 0) parts.push(w.slice(0, k));
  });
  return parts.join(stage.gap === "space" ? " " : "");
}

/* ── the beats ────────────────────────────────────────────────────────────
   Absolute milliseconds from the start. The holds are not padding: each one is
   the time a viewer needs to READ the new phrase before it changes again,
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
  /** ...held just long enough to read as a word before it is read as four */
  holdMergedEnds: 11000,
  /** o, l and g rise into O, L and G — the four words, kept */
  name: [11000, 11800],
  /** the finished name is held longest of all */
  end: 14400,
} as const;

/** The chips behind the cycling fields fade as the first reduction begins. */
export const CHIP_FADE = [BEATS.reduceFields[0], BEATS.reduceFields[0] + 400] as const;

/**
 * Tick times for one cycling field. The intervals GROW — that is the whole of
 * the deceleration, and it is arithmetic rather than a separate slow-down pass:
 * the last word is on screen for the longest beat before the field stops on it.
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
 * A letter that does not survive takes NO WIDTH and is parked exactly where the
 * phrase closed over it. That single rule is what makes the reductions read as
 * reductions: the survivors' target positions already have the holes taken out,
 * so interpolating towards them IS the inward travel, and there is no leftover
 * width anywhere to leave a gap behind.
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
   Three curves, on purpose, one per kind of event. The reductions share one so
   they read as the same operation; the merge gets its own, slower off the mark
   and firmer into the stop, so the closing of the spaces feels different; the
   naming overshoots slightly, because a letter growing into its capital should
   arrive like a stamp rather than settle like a drift. */
export const easeReduce = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;

export const easeMerge = (x: number) =>
  x < 0.5 ? 8 * x * x * x * x : 1 - (-2 * x + 2) ** 4 / 2;

/** Back-out: passes 1 and returns to it. The overshoot is small on purpose —
 *  1.7 puts the peak ~10% past, which reads as weight, not as a bounce. */
export const easeName = (x: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Progress through a [start, end] window at time t. */
export const span = (t: number, window: readonly [number, number] | readonly number[]) =>
  clamp01((t - window[0]) / (window[1] - window[0]));

/**
 * Which stage pair the show is between at time `t`, and how far.
 *
 * ONE function, because the renderer asking "which transition am I in?" in its
 * own `if` ladder is how a beat table and a renderer drift apart — and the
 * symptom of that is the animation resting on a state the table says is
 * impossible, which is exactly the fault the 30 Aug cut had.
 */
export function phaseAt(t: number): { from: number; to: number; p: number; ease: (x: number) => number } {
  if (t < BEATS.reduceFields[0]) return { from: 0, to: 0, p: 0, ease: easeReduce };
  if (t < BEATS.reduceFields[1]) return { from: 0, to: 1, p: span(t, BEATS.reduceFields), ease: easeReduce };
  if (t < BEATS.reduceWords[0]) return { from: 1, to: 1, p: 0, ease: easeReduce };
  if (t < BEATS.reduceWords[1]) return { from: 1, to: 2, p: span(t, BEATS.reduceWords), ease: easeReduce };
  if (t < BEATS.reduceOn[0]) return { from: 2, to: 2, p: 0, ease: easeReduce };
  if (t < BEATS.reduceOn[1]) return { from: 2, to: 3, p: span(t, BEATS.reduceOn), ease: easeReduce };
  if (t < BEATS.merge[0]) return { from: 3, to: 3, p: 0, ease: easeMerge };
  if (t < BEATS.merge[1]) return { from: 3, to: 4, p: span(t, BEATS.merge), ease: easeMerge };
  if (t < BEATS.name[0]) return { from: 4, to: 4, p: 0, ease: easeName };
  if (t < BEATS.name[1]) return { from: 4, to: 5, p: span(t, BEATS.name), ease: easeName };
  return { from: 5, to: 5, p: 0, ease: easeName };
}
