/**
 * The family band and its door tiles — one definition, two surfaces.
 *
 * Dan, 2026-09-12: *"make sure everything including font is identical"*, then,
 * when the desktop tiles came out stretched and the fix used a magic number:
 * *"PLEASE NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES !!!"*
 *
 * These are class NAMES only. Every measurement behind them lives in
 * globals.css under `.fam-*`, in `em` against a band whose font-size is
 * `var(--fs-body)` — so the box and the words it holds grow by the same factor
 * at every width, and the tile's proportion is a consequence rather than a
 * constant somebody has to keep true.
 *
 * WHAT THIS FILE IS FOR. "Identical" is not a thing to achieve by copying a
 * class list: the first cut of the goal card did exactly that and drifted at
 * once, its names in the body face where the ☰ sets the FluOLinGo hand. One
 * import, two surfaces, no drift — the same reason `.fluo-tilegrid` holds one
 * grid floor for five surfaces and `optionGrid.ts` one threshold for four
 * drills.
 *
 * THREE FIXED SIZES ARE GONE FROM HERE, and it is worth naming them because
 * each looked harmless:
 *   min-h-[64px]   the tile's height, while its name rode the ramp — so the
 *                  words grew 36% on a desktop and the box did not;
 *   5.958rem       the tile's width, derived from the menu's 20.6rem
 *                  dropdown. It made the two surfaces agree by freezing the
 *                  other axis, which is not the same as making them scale;
 *   text-[16px]    on the ramp via globals, so it did adapt — but it reads as
 *   text-[10px]    a pixel, and a size that must be looked up elsewhere to
 *                  know whether it is fixed is a size worth not writing.
 *
 * The ROW GRID is three doors after the label, fixed rather than counted: no
 * family has more than three activities in the registry, so a band never needs
 * a second line. If one ever does, the label needs `grid-row: 1 / -1` before
 * the count changes, or it will sit beside the first row only.
 */

/** The wrapper the bands stack inside. Carries the em basis (from the ramp)
 *  and the stack's width, because both fail on the children: see the note in
 *  globals.css about a fit-content dropdown collapsing every tile to 12px. */
export const BAND_STACK = "fam-bandstack";

/** One family's row. The caller sets `background` to the family's bright
 *  shade — or gives the element a `fam-<key>` class, which defines it. */
export const BAND = "fam-band";

/** The family's name, sideways down the left, in the house ink. */
export const BAND_NAME = "fam-band-name";

/** A door. Takes its outline from the band's `--fam-ink`. */
export const TILE = "fam-tile";

/** The glyph above the name — the half of a door's identity that survives
 *  when the other half truncates. */
export const TILE_EMOJI = "fam-tile-emoji";

/** The door's name — truncated with an ellipsis, never wrapped. */
export const TILE_NAME = "fam-tile-name";
