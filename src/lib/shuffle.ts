/**
 * THE shuffle (data-truth backlog, 2026-08-17). Fisher–Yates, unbiased.
 *
 * Twenty-odd sites used to carry their own copy, and five sorted with
 * `sort(() => Math.random() - 0.5)` — a comparator that is not a consistent
 * ordering, so V8's TimSort leaves elements near their starting positions
 * far more often than chance (the first option was still first ~half the
 * time in short arrays — a learner could learn "pick A"). Everything now
 * imports this. `rand` lets a seeded caller (the deck MCQ's stable rounds,
 * the Finale's per-day draw) keep its own generator.
 */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `n` distinct picks from `arr`, in random order. */
export function sample<T>(arr: readonly T[], n: number, rand: () => number = Math.random): T[] {
  return shuffle(arr, rand).slice(0, n);
}
