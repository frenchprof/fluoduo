/**
 * The highlighter marks — one geometry, thirty-six dresses.
 *
 * NOT THE SHIPPED LOGO. FluOLinGo's mark is `src/app/icon.svg` and
 * `public/icons/*.png` — Dan's own drawing, a notebook carrying an F and a g,
 * landed by Peers on 5 Sep and guarded by verify95-icons.py. This file is the
 * six-pen exploration from the same day, KEPT FOR POSTERITY (Dan: *"can we put
 * the logo and 24 colors in the repo for posterity"*) and rendered by nothing.
 *
 * The two arrived within hours of each other from opposite directions and
 * neither session knew about the other until a merge. Names were separated at
 * that merge rather than left to be untangled later — a repo with two things
 * both called "the mark" ships the wrong one eventually.
 *
 * WHAT THE MARK IS. A spiral notebook whose page is cut into three blocks:
 *
 *      ┌───────┬──────┐     block  the L — left column plus the bottom band
 *      │       │ tint │     tint   top-right, a second shade of the SAME hue
 *      │ block ├──────┤     mouth  middle-right, the complement (hue + 180°)
 *      │       │mouth │
 *      │       ├──────┤     Block and tint share a hue, so the eye fuses them
 *      │              │     into one stroke: left + bottom + top = a C, and
 *      └──────────────┘     the mouth is the gap the C opens onto.
 *
 * The C is deliberate and unfinished. Dan, same day: *"this is to attempt to
 * bring back the letter G (although we land on a C first) - we will add
 * something to the C to make it a G but only later on."* The move, when it is
 * wanted, is to let the block reach up into the mouth from below — one extra
 * rect in the same grid, no new colour, and the gap becomes a G's crossbar.
 *
 * THREE TONES, ALL KEPT. `pale` lightens the tint above the block; `deep` darkens
 * it below. They are not a draft and a fix — they are different marks, and Dan
 * asked for both. The numbers say why the second exists: in the pale set the top
 * stroke of the C measures 1.09–1.48 against the Cahier paper, i.e. it is the
 * faintest thing in every mark while doing structural work. In the deep set the
 * same stroke measures 1.85–4.60, and the block-to-tint step actually TIGHTENS
 * (1.49–1.72), so the two blocks fuse better rather than worse. But a deep top
 * bar reads as a drawn stroke that changes tone, where a pale one reads as a
 * page with a highlight across it — a different object, not a better one.
 *
 * THE COLOURS. `block` and `mouth` are the six highlighter hues proposed for
 * the family palette and their complements; only twelve of the twenty-four
 * blocks (the reversals) introduce hues the app does not otherwise use. Every
 * `ring` was walked down in OKLCH lightness until it cleared 5.1 : 1 against
 * the paper ground, so the binding hardware is legible on paper in all 24.
 * `verify96-brand-marks.py` pins every value and re-derives the contrast.
 */

/** The three tone treatments. */
export type MarkTone = "pale" | "deep" | "mono";

export type Mark = {
  /** Stable key. Never renamed — the display name may change, this does not. */
  key: string;
  /** What to call it in a picker. */
  name: string;
  /** OKLCH hue of the block, degrees. The mouth sits at hue + 180. */
  hue: number;
  /** The other mark built from the same pair of hues, with the roles swapped. */
  reverseOf: string;
  /** The L — left column and bottom band. */
  block: string;
  /** Top-right. Same hue as the block, a second shade of it. */
  tint: string;
  /** Middle-right. The complement — the only block that leaves the family. */
  mouth: string;
  /** The four ring binds. The block hue walked down to clear 5.1 : 1 on paper. */
  ring: string;
};

/**
 * Geometry, in the mark's own 100 × 100 box.
 *
 * The corner radius is not a free choice. Dan asked for squarer corners AND for
 * the rounding to *"end before the first ring bind and start after the last"*.
 * At radius 9 the top-left arc finishes at y 17 and the first ring starts at
 * 18.4; the last ring ends at 76.6 and the bottom-left arc begins at 83. So the
 * left edge is straight through the whole ring run, and one number satisfies
 * both requests. Move the radius and you must re-check the ring run — which is
 * what verify96 does.
 */
export const MARK_GEOMETRY = {
  /** The page: x, y, width, height, corner radius. */
  page: { x: 16, y: 8, w: 76, h: 84, r: 9 },
  /** Where the right column starts. */
  splitX: 57,
  /** The two horizontal cuts in the right column. */
  tintBottomY: 41,
  mouthBottomY: 68,
  /** Ring capsules: x, width, height, and the four top edges. */
  ring: { x: 4, w: 22, h: 7.2, tops: [18.4, 35.4, 52.4, 69.4] },
  /**
   * How far the knockout slot exceeds the ring on every side. Dan: *"the ring
   * binds must eat into the cards"* — without this the rings merely overlap the
   * page edge; with it they cut a scalloped notch through it. Below roughly
   * 24px rendered, 1.6 units is under half a pixel and the scallop closes up.
   */
  bite: 1.6,
} as const;

/** The Cahier paper the ring contrast is measured against (`--cahier-paper`). */
export const MARK_GROUND = "#faf6ee";

/**
 * The twelve marks, pale tone — the top-right block lighter than the block.
 * Order is the hue wheel, each pen followed by its reversal.
 */
export const MARKS_PALE: Mark[] = [
  { key: "pink",       name: "Pink",       hue: 350, reverseOf: "teal",       block: "#ff4eb2", tint: "#ffb9d9", mouth: "#00b28b", ring: "#009d7a" },
  { key: "teal",       name: "Teal",       hue: 170, reverseOf: "pink",       block: "#00c197", tint: "#00fbc6", mouth: "#ff4eb2", ring: "#ff2eac" },
  { key: "orange",     name: "Orange",     hue:  55, reverseOf: "sky",        block: "#ff9037", tint: "#ffddc7", mouth: "#00a5e4", ring: "#0095ce" },
  { key: "sky",        name: "Sky",        hue: 235, reverseOf: "orange",     block: "#00b2f6", tint: "#abe0ff", mouth: "#ff9037", ring: "#d76e00" },
  { key: "yellow",     name: "Yellow",     hue: 100, reverseOf: "periwinkle", block: "#fcdf00", tint: "#ffea6a", mouth: "#8688ff", ring: "#7c7bff" },
  { key: "periwinkle", name: "Periwinkle", hue: 280, reverseOf: "yellow",     block: "#9398ff", tint: "#cfd4ff", mouth: "#fcdf00", ring: "#9e8b00" },
  { key: "green",      name: "Green",      hue: 145, reverseOf: "magenta",    block: "#00dd3e", tint: "#b0ffb2", mouth: "#f005ff", ring: "#f003ff" },
  { key: "magenta",    name: "Magenta",    hue: 325, reverseOf: "green",      block: "#f350ff", tint: "#fcbfff", mouth: "#00dd3e", ring: "#00a22b" },
  { key: "blue",       name: "Blue",       hue: 245, reverseOf: "amber",      block: "#1ca6ff", tint: "#a9d7ff", mouth: "#d78100", ring: "#ca7900" },
  { key: "amber",      name: "Amber",      hue:  65, reverseOf: "blue",       block: "#e88c00", tint: "#ffcd9c", mouth: "#1ca6ff", ring: "#0091e4" },
  { key: "violet",     name: "Violet",     hue: 300, reverseOf: "olive",      block: "#b17eff", tint: "#d9c6ff", mouth: "#8ca600", ring: "#7d9400" },
  { key: "olive",      name: "Olive",      hue: 120, reverseOf: "violet",     block: "#98b300", tint: "#c7ea00", mouth: "#b17eff", ring: "#a869ff" },
];

/**
 * The same twelve, deep tone — the top-right block DARKER than the block
 * (its hue at lightness − 0.12). Block, mouth and ring are identical to the
 * pale set by construction: only the tint moves, which is why a mark can be
 * swapped between the two sets by editing one value.
 */
export const MARKS_DEEP: Mark[] = MARKS_PALE.map((m) => ({
  ...m,
  tint: {
    pink: "#d7008e", teal: "#009675", orange: "#d36d00", sky: "#008bc1",
    yellow: "#d0b800", periwinkle: "#6d64ff", green: "#00b130", magenta: "#cb00d9",
    blue: "#0080ca", amber: "#b66c00", violet: "#9832ff", olive: "#768c00",
  }[m.key]!,
}));


/**
 * MONO — one hue in three steps, and a grey bind (Dan, 2026-09-05, asking
 * whether such a version existed: *"different shades of the same color (darker
 * L, lighter everything else) and grey ring bound"*. It did not; this is it.)
 *
 * Block at L 0.52, top-right at 0.72, mouth at 0.88, rings a warm near-neutral
 * #8d8a85 walked down until it clears 3.0 : 1 on the tile — the same floor the
 * coloured rings hold. There is no complement anywhere in this tone, which is
 * the whole point of it: it is the quiet set.
 *
 * WHAT IT COSTS, because the trade is real. In `pale` and `deep` the block and
 * the top-right share a hue AND sit close in lightness, so they fuse into one
 * stroke and the eye reads a C. Here they are two lightness steps apart, so the
 * top-right detaches: what you see is a dark L with two pale tabs beside it.
 * Better as a notebook, weaker as the letter that is meant to become a G.
 *
 * AND IT CANNOT SHIP AS THE APP ICON AS THINGS STAND. `verify95-icons` requires
 * at least three distinct saturated hue buckets in every PNG, to catch the
 * starter art and the old single-lime notebook coming back. Rendered at 512 and
 * measured with that check's own function, four of the six pens fail it — yellow
 * with ONE bucket, orange, blue and violet with two; pink and green scrape three
 * only because gamut clipping happens to push their lightness steps across
 * bucket boundaries, which is luck rather than design. Dan was offered an
 * amendment to that rule on 5 Sep and declined it: *"not amendment but add on to
 * the collection of variants"*. So mono lives here as a variant and the guard
 * stands. Anyone wanting to ship one must change verify95-icons first, on
 * purpose, with Peers.
 */
const MONO_HUES: Record<string, { block: string; tint: string; mouth: string }> = {
  pink:         { block: "#ba007a", tint: "#ff61b7", mouth: "#ffc4de" },
  teal:         { block: "#007c60", tint: "#00c197", mouth: "#00fbc6" },
  orange:       { block: "#9f5100", tint: "#f68000", mouth: "#ffcba9" },
  sky:          { block: "#00729f", tint: "#00b2f6", mouth: "#abe0ff" },
  yellow:       { block: "#786900", tint: "#bba500", mouth: "#f4d900" },
  periwinkle:   { block: "#5a32ff", tint: "#9398ff", mouth: "#cfd4ff" },
  green:        { block: "#008020", tint: "#00c737", mouth: "#4cff63" },
  magenta:      { block: "#a800b3", tint: "#f350ff", mouth: "#fcbfff" },
  blue:         { block: "#006eae", tint: "#3bacff", mouth: "#b5ddff" },
  amber:        { block: "#965800", tint: "#e88c00", mouth: "#ffcd9c" },
  violet:       { block: "#8700ec", tint: "#b688ff", mouth: "#deceff" },
  olive:        { block: "#607200", tint: "#98b300", mouth: "#c7ea00" },
};

/** The one grey every mono mark's binds wear. Neutral by construction (chroma 0.008). */
export const MONO_RING = "#8d8a85";

export const MARKS_MONO: Mark[] = MARKS_PALE.map((mk) => ({
  ...mk,
  ...MONO_HUES[mk.key]!,
  ring: MONO_RING,
}));

/** All thirty-six, addressed by tone. */
export const MARKS: Record<MarkTone, Mark[]> = {
  pale: MARKS_PALE,
  deep: MARKS_DEEP,
  mono: MARKS_MONO,
};

/** One mark by key and tone, or undefined if the key is unknown. */
export function markFor(key: string, tone: MarkTone = "pale"): Mark | undefined {
  return MARKS[tone].find((m) => m.key === key);
}
