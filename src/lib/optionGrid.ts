/**
 * The answer-option grid — one function, every drill.
 *
 * Dan, 2026-08-10: "having a button that occupies the entire width when a
 * couple of those could be condensed into a smaller space if they had smaller
 * buttons." The cause was `.cahier-option { display:block; width:100% }` in
 * globals.css plus four containers that each stacked their options in one
 * column. `Il`, `Lui`, `oil`, `milk` were each rendering as a 255px bar.
 *
 * Two columns, EXCEPT when an option is long enough that two columns would
 * squeeze it — then one column, because a wrapped answer is worse than a wide
 * one. The threshold lives here and nowhere else, so it cannot drift into four
 * different numbers the way `gapSentence` drifted into five implementations.
 */

/** Above this many characters, two columns start wrapping answers at the
 *  drills' usual 18px option type. */
export const STACK_ABOVE = 18;

/**
 * The same budget at 24px, for the cards that set their options as large as
 * the French question above them (Dan, 2026-09-01: "some questions have both
 * the Q and the A in French. In that case they should equally big").
 *
 * A two-column cell on a 390px phone is about 165px wide, and 32px of that is
 * padding — so roughly 133px of text, less the option's numeral. At 24px that
 * is eight characters or so, which is why « en métro » wrapped in a cell that
 * held « à vélo » comfortably. A character count is crude, but it is the same
 * crude measure this file has always used and one threshold beats two rules.
 */
export const STACK_ABOVE_2XL = 7;

/**
 * @param options    the answer strings about to be rendered
 * @param gap        Tailwind gap class, if the caller wants something other than gap-2
 * @param stackAbove character budget per cell; pass STACK_ABOVE_2XL for 24px options
 */
export function optionGridClass(
  options: readonly string[],
  gap = "gap-2",
  stackAbove: number = STACK_ABOVE,
): string {
  const wide = options.some((o) => (o ?? "").length > stackAbove);
  return `grid ${gap} ${wide ? "grid-cols-1" : "grid-cols-2"}`;
}
