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

## Specimen sheets

| File | What it shows |
| --- | --- |
| `specimen-regular.png` | the original inventory sheet — every row of the character set |
| `specimen-weights.png` | the original nine-weight sheet, set in `Hambrgefonstiv` |
| `specimen-weights-fluolingo.png` | the nine weights set in the app's own name |
| `specimen-charset-fluolingo.png` | the character set, headed by the name |
| `specimen-weights-vs-patrick.png` | each weight against **Patrick Hand 400** |
| `specimen-charset-vs-patrick.png` | each character-set row against Patrick Hand 400 |

The two `-vs-patrick` sheets exist because Patrick Hand is what the app
currently loads as `--font-hand`, so it is the face this family would displace.
Two things they settle:

* **Patrick Hand runs ~22% larger at the same `font-size`.** Next's generated
  fallback metrics give `size-adjust:81.43%` for Patrick Hand against
  `66.54%` for `fluoHand`; the ratio is the size gap. Swapping one for the
  other needs either a ~22% size bump or `size-adjust:122%` on the
  `fluoHand` face, or everything set in it shrinks.
* **Coverage diverges only past Latin Extended-A.** Patrick Hand renders every
  letter row here, including the Polish/Czech/German and Vietnamese/Turkish
  lines. It is missing 5 of the punctuation row, 21 of the currency-and-maths
  row and 35 of the fractions/superscript/arrow row — which is the whole
  argument for this family over it.

### Rebuilding the sheets

`specimens-src/` holds the generators: one HTML file per sheet, screenshotted
with headless Chromium, then trimmed by `crop.py` (a dependency-free PNG
cropper — there is no Pillow in the render environment).

```bash
cd specimens-src
chrome --headless --hide-scrollbars --force-device-scale-factor=2 \
       --window-size=1240,1500 --screenshot=raw.png file://$PWD/charset.html
python3 crop.py raw.png ../specimen-charset-vs-patrick.png 46
```

Two things to know before you run it:

* **Render tall, then crop.** Headless Chromium will not paint the last line
  when the viewport hugs the content height — the line is in the DOM and
  simply absent from the image. Give it headroom and trim afterwards.
* **The `-vs-patrick` sheets need Patrick Hand.** They expect
  `specimens-src/fonts/PatrickHand-latin.woff2` and `-latinext.woff2`, which
  are not committed here: lift them from the app's own build output
  (`out/_next/static/media/`, identified by the `@font-face` blocks in the
  built CSS) so the comparison uses the exact subset the app serves. The
  family woff2 files come from `../woff2/`.
