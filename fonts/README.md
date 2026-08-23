# FluOlinGo Hand — complete character set, 9 weights

The original `FluOlinGoHandRegular.otf` carried **117 glyphs** (Basic Latin plus
the French accents). This rebuild carries **414 codepoints in 9 weights**, in
OTF, TTF and WOFF2.

## Coverage

| Block | Status |
| --- | --- |
| ASCII `U+0020–007E` | complete (added `# $ % & * + / < = > @ [ \ ] ^ _ \` { \| } ~`) |
| Latin-1 Supplement `U+00A0–00FF` | complete (added `¡¢£¤¥¦§¨©ª¬®¯±²³´¶·¸¹º¼½¾¿×÷ ÁÃÄÅÌÍÐÑÒÓÕÖØÚÝÞß …`) |
| Latin Extended-A `U+0100–017F` | complete — Polish, Czech, Slovak, Hungarian, Baltic, Turkish, Maltese, Esperanto |
| Latin Extended-B | `Ș ș Ț ț ƒ` (Romanian) |
| Spacing modifiers | `´ \` ¨ ˆ ˇ ˘ ˙ ˚ ˛ ˜ ˝ ¯ ¸` |
| Punctuation | `‹ › „ “ ” ‘ ’ • – — … † ‡ ‰ ′ ″ ⁄ § ¶` |
| Currency | `¢ £ ¤ ¥ € ₹ ₽ ₩ ₺ ₴ ₿` |
| Math | `× ÷ ± − ≠ ≤ ≥ ≈ ∞ √ ∑ ∏ ∫ ∂ ∆ ∅ ¬ µ π Ω` |
| Super/subscript | `⁰–⁹  ₀–₉  ª º` |
| Fractions | `¼ ½ ¾ ⅓ ⅔ ⅛ ⅜ ⅝ ⅞` |
| Symbols & arrows | `© ® ™ ◊ ★ ☆ ♥ ✓ ✗ ← ↑ → ↓ ↔ ↕` |

## Weights

`Thin 100 · ExtraLight 200 · Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700 · ExtraBold 800 · Black 900`

## How this works

The source font is strictly **monolinear**: every glyph is a skeleton path
expanded with a round pen of radius **R = 48** (96 units wide) at 1512 UPM.
Verified exactly — re-stroking the skeleton `M20,0 L20,760` reproduces the
original `l` outline to the unit.

That single fact drives everything here:

* **New glyphs** are drawn as skeletons and stroked with the same pen, so they
  are geometrically indistinguishable from the author's own letters.
* **Accents** are the author's own marks, lifted out of `é è ê ë` and reused;
  `caron` is the circumflex flipped, `ring` is the existing `°`. Only `tilde`,
  `breve`, `macron`, `ogonek`, `cedilla` and `hungarumlaut` were newly drawn.
* **Weights** are exact. Since `outline = skeleton ⊕ disk(48)`, a bolder weight
  is `outline ⊕ disk(R−48)` (Minkowski dilation) and a lighter one is the
  matching erosion. No redrawing, no interpolation — every weight is the same
  skeleton at a different pen size. Measured stem widths come out at exactly
  `2R`: 30, 44, 64, 96, 116, 144, 176, 212, 252.
* **Scaled forms** (superscripts, fractions, the letters inside `©`/`®`/`™`)
  use the same identity in reverse: scale the outline, then dilate by
  `48·(1−s)` to restore full stroke weight, so they stay monolinear instead of
  going spindly.

### Spacing

The source font uses one rule: skeleton left edge at `x = 0`, advance =
`skeleton right + 180` — a constant 84-unit gap between all letters. New glyphs
follow it. Per weight the advance grows by `1.5·(R−48)`, which keeps the gap
comfortable at Black and open at Thin.

### Accent seating

Marks are seated by their **bottom** edge (500 lowercase / 760 caps), matching
the source. Heavier weights lift marks further (`1.5×` lowercase, `2.4×` caps)
so they never weld onto the letter — without this, `À É Ê Î Ô` turn into solid
blobs at ExtraBold and Black.

## Using it on the web

Copy `woff2/*` into `public/fonts/` and import `fluolingo-hand.css`, or point
`--font-hand` at the `"FluOlinGo Hand"` family.

## Rebuilding

```bash
pip install fonttools skia-python skia-pathops brotli
cd src && python3 build.py            # writes dist/ — 9 weights × 3 formats
python3 build.py Regular              # single weight
```

`src/` holds the generator: `core.py` (stroking, boolean ops, dilate/erode),
`g_ascii.py`, `g_latin.py`, `g_sym.py` (glyph definitions), `build.py`
(assembly), `proof.py` / `spec.py` (proof sheets).

## Notes

* The original glyphs are carried through **unmodified** in Regular.
* One pre-existing quirk was left alone: `C`, `G` and `S` are ~47 units shorter
  than the other capitals (they top out at 761 rather than 808). New glyphs use
  the majority cap height of 808.
* Accented narrow letters (`Î Ï Ì Í`) keep the source font's advance of 220, so
  the mark overhangs to the left — the author's original choice, preserved.
