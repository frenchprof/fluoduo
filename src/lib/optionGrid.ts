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

/** Above this many characters, two columns start wrapping answers. */
export const STACK_ABOVE = 18;

/**
 * @param options the answer strings about to be rendered
 * @param gap     Tailwind gap class, if the caller wants something other than gap-2
 */
export function optionGridClass(options: readonly string[], gap = "gap-2"): string {
  const wide = options.some((o) => (o ?? "").length > STACK_ABOVE);
  return `grid ${gap} ${wide ? "grid-cols-1" : "grid-cols-2"}`;
}
