/**
 * The family band and its door tiles — one definition, two surfaces.
 *
 * Dan, 2026-09-12, having seen the goal card take the ☰ menu's arrangement:
 * *"the idea is correct but make sure everything including font is
 * identical"*, and *"Truncation with "..." is perfect!"*.
 *
 * "Identical" is not something to achieve by copying a class list and hoping;
 * the first cut of the goal card did exactly that and drifted immediately —
 * its names came out in the body face at `--fs-micro` where the menu sets the
 * FluOLinGo hand at 16px, which is the single most visible difference between
 * the two screens. So the strings live here and both files import them, the
 * same reason `.fluo-tilegrid` holds one grid floor for five surfaces and
 * `optionGrid.ts` holds one threshold for four drills.
 *
 * WHAT EACH PIECE IS FOR, since a reader meeting a class string has no way to
 * tell which ruling it carries:
 *
 *   BAND       one family's row. Solid, in the family's BRIGHT shade — Dan,
 *              2026-09-11: *"the background needs to be brighter like this"*,
 *              after a 15%-alpha wash (8 Sep) and then the darkest rung were
 *              both sent back. The caller supplies the colour.
 *   BAND_NAME  the family's name, set sideways down the left in the HOUSE INK
 *              — Dan, same day: *"black font instead of white font over these
 *              background for the leftmost cat names"*. Not white, and not the
 *              family's dark rung.
 *   TILE       the door: raised paper, outlined in the family's darkest rung,
 *              which the caller supplies as `borderColor`.
 *   TILE_EMOJI the glyph above the name. Half of a door's identity, and the
 *              half that survives when the other half truncates.
 *   TILE_NAME  the door's name, TRUNCATED rather than wrapped. Dan chose that
 *              trade for the menu on 2026-09-11 (*"It is OK to truncate some
 *              long names"*) and confirmed it for the goal card on 12 Sep.
 *              16px in the hand face: it was 13px and "hardly legible", and
 *              the face is already at its heaviest weight, so size is what
 *              makes a hand face's strokes thicker.
 *
 * The ROW GRID is three columns after the label, fixed rather than counted.
 * That is safe here and not an oversight: no family has more than three
 * activities in the registry, so a band never needs a second line. If one ever
 * does, the label needs `grid-row: 1 / -1` before the count changes, or it
 * will sit beside the first row only.
 */

/** One family's row. The caller sets `background` to the family's bright shade.
 *
 *  THE TILE TRACK IS CAPPED, NOT `1fr`. Dan, 2026-09-12, looking at the goal
 *  card on a desktop: *"the tiles are looking distorted in your desktop view
 *  (as compared to what is on the menu). why can't you maintain aspect ratio
 *  proportions?"* — and he was right. `1fr` fills whatever box the band is
 *  given, so the same tile came out 95px wide in the ☰ and 227px on a
 *  full-width goal card, both still 64px tall: the menu's neat near-square
 *  stretched into a letterbox.
 *
 *  5.958rem is not a taste; it is the menu's own width, derived from it:
 *
 *      dropdown            20.6rem  = 329.6px
 *      less p-1.5 x2                = -12
 *      less gap-1.5 x3              = -18
 *      less the sideways label      = -13.6
 *      -------------------------------------
 *      three tiles share             286.0  ->  95.3px  =  5.958rem
 *
 *  and 95.3px is exactly what the ☰ measured at before this change. So the cap
 *  is a NO-OP for the menu — its three tracks already resolve to that — and a
 *  fix for every other surface. One string, both right, which is the whole
 *  reason this file exists.
 *
 *  The caller is responsible for not stretching the band itself: a band in a
 *  box wider than its content should be `w-fit`, or it will sit as a wide
 *  coloured strip with the tiles bunched at one end. */
/*  THE TILE TRACK FILLS THE ROW AGAIN — `1fr`, not a cap.
 *
 *  Dan, 2026-09-12, pointing at the ☰ on a desktop: *"why is space between the
 *  category and the tiles?? wasn't it to expand the tiles to fit the name (but
 *  ONLY on desktop)??"*
 *
 *  HE IS DESCRIBING A GAP THIS LANE OPENED, by landing two correct changes
 *  together. One widened the dropdown so its names would stop clipping
 *  (`w-[calc(20.6rem + var(--fs-step)*21)]`); the other capped each tile track
 *  at 5.958rem so the GOAL CARD's tiles would stop stretching into letterboxes.
 *  Each was right about its own surface. Together, on a desktop, the dropdown
 *  grew and the tiles did not, and the difference came out as dead coloured
 *  band between the sideways label and the first tile.
 *
 *  THE CAP'S REASON IS GONE, WHICH IS WHY THIS IS A REVERT AND NOT A
 *  COMPROMISE. It existed for the goal card, and the goal card no longer draws
 *  a band at all — its doors flow on `.fluo-tilegrid` now, and it imports only
 *  TILE from this file. The ☰ is the last caller, and in the ☰ filling IS the
 *  behaviour Dan asked for: the tile grows with the room, so the name has
 *  somewhere to go.
 *
 *  "ONLY ON DESKTOP" falls out rather than being coded: `--fs-step` is zero on
 *  a phone, so the dropdown is its old 20.6rem there and three equal tiles
 *  across it are exactly what they were. Nothing is keyed on a breakpoint. */
export const BAND =
  "grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-1.5 p-1.5";

/** The family's name, sideways down the left, in the house ink. */
export const BAND_NAME =
  "self-center [writing-mode:vertical-rl] rotate-180 text-[10px] font-black " +
  "uppercase tracking-[0.12em] leading-none text-[color:var(--cahier-ink)]";

/** A door. The caller sets `borderColor` to the family's darkest rung.
 *
 *  ITS HEIGHT IS ON THE RAMP, NOT NAILED TO 64px. Dan, 2026-09-12, after a
 *  goal-card row that hard-coded its tile width: ***"PLEASE NEVER EVER HARD
 *  CODE FONT SIZES AND BUTTON SIZES !!!"***
 *
 *  `min-h-[64px]` was the last number in this file that ignored the screen. It
 *  is the same fault as a hard font size and it fails the same way round: the
 *  name inside rides the ramp and grows about a third on a desktop, so a box
 *  frozen at 64px squeezes text that did not agree to stay still. 4rem is the
 *  same 64px on a phone, where the step is zero, and grows with everything
 *  else above it. */
export const TILE =
  "flex fluo-row-tall flex-col items-center justify-center gap-0.5 rounded-xl border-2 " +
  "bg-[color:var(--cahier-paper-raised)] px-1 py-1.5 text-center no-underline " +
  "fluo-tile-key";

/** The glyph above the name. */
export const TILE_EMOJI = "text-lg leading-none";

/** The door's name — truncated, never wrapped. */
export const TILE_NAME =
  "fluo-btn-hand block w-full truncate text-[16px] leading-tight text-[color:var(--cahier-ink)]";
