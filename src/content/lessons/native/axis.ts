/**
 * Honouring a pinned axis — the two lines every steerable generator needs.
 *
 * Dan, 2026-08-27: "both — dropdowns and dice". A learner pins the axes they
 * want to drill; whatever they leave free is still rolled. The reference
 * implementation (conjugaison-u1) wrote that logic inline, and fourteen more
 * lessons hand-copying it is fourteen chances to get "free" subtly wrong — a
 * pin that matches nothing must ROLL, not throw and not return the first item,
 * or the dropdown silently becomes a filter that empties the lesson.
 *
 * So the fallback lives here, once, and verify41 executes every lesson through
 * every pin combination to prove each generator actually honours it. That last
 * part is the point: a generator that ignores its `pinned` argument looks in
 * source exactly like one that honours it.
 */

/** Roll one at random. Never called during render — see each lesson's header. */
export const roll = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/**
 * The pinned member of `list`, or a random one.
 *
 * `key` says what the dropdown's `value` means for this list, so the axis and
 * the generator agree on identity rather than on position — reordering a data
 * array must not silently re-point every saved pin.
 */
export function pinned1<T>(
  list: readonly T[],
  pin: string | undefined,
  key: (x: T) => string,
): T {
  const hit = pin ? list.find((x) => key(x) === pin) : undefined;
  return hit ?? roll(list);
}

/**
 * Narrow `list` to the members matching a pin, or leave it whole.
 *
 * For axes that select a GROUP rather than a member — "give me a place that
 * takes à la". An empty result falls back to the whole list: a pin that
 * matches nothing must never empty the lesson.
 */
export function pinnedGroup<T>(
  list: readonly T[],
  pin: string | undefined,
  key: (x: T) => string,
): readonly T[] {
  if (!pin) return list;
  const hits = list.filter((x) => key(x) === pin);
  return hits.length ? hits : list;
}

/**
 * A pinned affirmative/negative, or a roll at `negChance`.
 *
 * The per-lesson chance is kept because it is authored: faire leans negative
 * 40% of the time, aller 35%, and flattening them to a coin toss would change
 * every unsteered run.
 */
export function pinnedNeg(pin: string | undefined, negChance: number): boolean {
  if (pin === "neg") return true;
  if (pin === "aff") return false;
  return Math.random() < negChance;
}

/** The affirmative/negative axis, worded the same way in every lesson. */
export const POLARITY_AXIS = {
  key: "polarity",
  label: "Forme",
  options: [
    { value: "aff", label: "affirmatif" },
    { value: "neg", label: "négatif" },
  ],
};
