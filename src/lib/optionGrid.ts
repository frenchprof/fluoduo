/**
 * The answer-option grid — one function, every drill.
 *
 * Dan, 2026-08-10: "having a button that occupies the entire width when a
 * couple of those could be condensed into a smaller space if they had smaller
 * buttons." The cause was `.cahier-option { display:block; width:100% }` in
 * globals.css plus four containers that each stacked their options in one
 * column. `Il`, `Lui`, `oil`, `milk` were each rendering as a 255px bar.
 *
 * AS MANY COLUMNS AS FIT, not two (Dan, 2026-09-11: *"for desktop why not
 * have mulitple buttons per row? we are NOT dead set on just two columns"*).
 * It was a hard `grid-cols-1` / `grid-cols-2`, calibrated for a 390px phone
 * and carried unchanged onto a 1680px desktop, where four short answers sat
 * in two rows with half the sheet empty beside them.
 *
 * The columns are decided by `repeat(auto-fit, minmax(…))` in globals.css
 * rather than by a breakpoint, and that is deliberate twice over. A breakpoint
 * would only be right at the widths someone remembered to write; and these
 * drills run INSIDE the cahier's iframe, where a media query sees the frame
 * and not the phone — 390px of device is 313px of frame, so every breakpoint
 * would be written in the wrong units and would shift the day the notebook's
 * padding changes.
 *
 * What this function still decides is the MINIMUM a cell may shrink to, which
 * is the old threshold doing the same job from the other side: a long answer
 * asks for a wide floor and therefore gets fewer columns, and on a phone that
 * is still exactly one. The floor lives here and nowhere else, so it cannot
 * drift into four different numbers the way `gapSentence` drifted into five
 * implementations.
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
 *
 * Returns a class string, not a style object, on purpose: four call sites
 * splice this into a `className` template and a second `style` prop at each
 * would be four more places to forget. The three floors are three classes in
 * globals.css, and which one an option list earns is the only decision here.
 */
export function optionGridClass(
  options: readonly string[],
  gap = "gap-2",
  stackAbove: number = STACK_ABOVE,
): string {
  // `stackAbove` is still the whole decision — the 24px callers pass a smaller
  // budget, so the same words turn `wide` sooner for them. What they do NOT
  // get is a wider floor: cells are `1fr` and stretch, so a floor only counts
  // columns, and a larger one would have cost those cards their second column
  // on a phone. Measured, not assumed — see globals.css.
  const wide = options.some((o) => (o ?? "").length > stackAbove);
  return `fluo-optiongrid fluo-optiongrid--${wide ? "wide" : "std"} ${gap}`;
}
