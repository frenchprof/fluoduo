# FluOlinGo Hand

Builds `public/fonts/FluOlinGoHand-Regular.{otf,woff2}` from the pen-stroke
data in `src/lib/handwriting/glyphs.ts` — the same source used to draw the
"par Dr Chan" byline on the home page, extended to the full French
character set.

Each glyph is a list of monoline SVG pen strokes. The build turns every
stroke into an open contour, expands it with FontForge's circular
(round-cap, round-join) pen stroker at the source's stroke width, and
unions overlapping strokes (e.g. the stem+bowl of "a", "b", "d") into a
clean fill. Advance widths come straight from the source's per-glyph ink
width + letter gap (or the word-space width, for the space glyph) — no
separate font-metrics tuning.

## Requirements

- FontForge with Python scripting (`apt install fontforge python3-fontforge`)
- `fonttools` + `brotli` for the woff2 step (`pip install fonttools brotli`)

## Usage

```
npm run build:font
```

Runs, in order:

1. `export-glyphs.mjs` — dumps `GLYPHS`/metrics from `glyphs.ts` to
   `glyphs.json` (Node's native TS type-stripping loads the source
   directly; FontForge's bundled Python can't).
2. `build_font.py` — FontForge script, `glyphs.json` → the `.otf`.
3. `to-woff2.py` — plain `fonttools`, `.otf` → `.woff2`.

Re-run after any edit to `glyphs.ts`.
