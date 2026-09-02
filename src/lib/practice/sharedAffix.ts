/**
 * FACTOR OUT WHAT EVERY OPTION SAYS, AND ASK ONLY WHAT DIFFERS.
 *
 * Dan, 2026-09-01, looking at a transport card whose four options were
 *
 *     Nous y allons à vélo.      Nous y allons en métro.
 *     Nous y allons en avion.    Nous y allons à avion.
 *
 * *"if the MCQ answers are going to be nearly identical except for one part,
 * then put the identical parts in the question and just separate out the
 * choice parts!"*
 *
 * « Nous y allons » is printed four times and read four times, and none of
 * those readings can tell a learner anything — it is the same words in every
 * option, which is Dan's litmus test exactly: text whose removal does not stop
 * the learner finding the answer. Lifted into the frame it is read ONCE, and
 * the four options become « à vélo », « en métro », « en avion », « à avion » —
 * the question the card is actually asking, and nothing else.
 *
 * WHAT THIS DELIBERATELY WILL NOT DO.
 *
 *   · It never splits inside a word. « métro. » and « bistro. » share "tro."
 *     and a card reading « Nous allons au ? tro. » is worse than no split at
 *     all, so a shared tail must either be pure punctuation or begin at a
 *     space.
 *   · It never leaves an option empty, and never makes two options identical.
 *     Either would silently destroy the card.
 *   · It does nothing unless the shared text is worth lifting. Hoisting a
 *     single letter buys no space and costs the learner a frame to parse.
 */

/** What a split produced: the frame either side, and the reduced options. */
export type Split = {
  /** Text before the blank, e.g. "Nous y allons ". */
  before: string;
  /** Text after the blank, e.g. ".". */
  after: string;
  /** Reduced options, in the SAME order as the input. */
  parts: string[];
};

/** A tail may be lifted if it is punctuation, or if it starts a new word. */
const tailIsClean = (s: string): boolean => /^[\s.?!;:,»)]*$/.test(s) || /^\s/.test(s);

/** Letters only — the measure of whether shared text is worth hoisting. */
const meat = (s: string): number => (s.match(/[\p{L}\p{N}]/gu) ?? []).length;

/**
 * Split a set of options into a shared frame and the parts that differ.
 * Returns null when there is nothing worth lifting, and the caller then
 * renders the options exactly as it always did.
 */
export function sharedAffix(options: readonly string[]): Split | null {
  if (options.length < 2) return null;
  if (new Set(options).size !== options.length) return null;

  const first = options[0];

  // Longest common prefix, then back up to the last space so the split lands
  // between words. Without this « en métro » and « en moto » would share
  // "en m" and the card would ask for "étro" against "oto".
  let p = 0;
  while (p < first.length && options.every((o) => o[p] === first[p])) p++;
  let before = first.slice(0, p);
  const lastSpace = before.lastIndexOf(" ");
  before = lastSpace >= 0 ? before.slice(0, lastSpace + 1) : "";

  // Longest common suffix over what is left, under the same word rule.
  const rest = options.map((o) => o.slice(before.length));
  const shortest = Math.min(...rest.map((r) => r.length));
  let s = 0;
  while (s < shortest && rest.every((r) => r[r.length - 1 - s] === rest[0][rest[0].length - 1 - s])) s++;
  let after = s ? rest[0].slice(rest[0].length - s) : "";
  while (after && !tailIsClean(after)) after = after.slice(1);

  const parts = rest.map((r) => r.slice(0, r.length - after.length));

  // Every guard below has a card behind it that would otherwise ship broken.
  if (!parts.every((x) => x.trim().length > 0)) return null;   // an empty option
  if (new Set(parts).size !== parts.length) return null;       // two the same
  if (meat(before) + meat(after) < 3) return null;             // not worth a frame

  return { before, after, parts };
}
