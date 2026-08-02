#!/usr/bin/env python3.12
"""Builds FluOlinGo Hand (.otf) from scripts/font/glyphs.json.

glyphs.json is produced by export-glyphs.mjs from the single source of
truth, src/lib/handwriting/glyphs.ts. Each glyph there is a list of pen
strokes (SVG "M/L/C" paths, monoline, meant to be drawn with a round-cap,
round-join pen at strokeWidth) plus the advance width already baked in
(ink width + letter gap, or the word-space width for "space").

This script turns each stroke into an *open* contour, then uses
FontForge's circular pen stroker (glyph.stroke("circular", ...)) to expand
it into a filled outline with the same round caps/joins the SVG renderer
uses, then unions overlapping strokes (e.g. the crossing stem+bowl of "a",
"b", "d", ...) with removeOverlap() so the fill is clean.

Run with FontForge's own Python (its module isn't installable in a plain
venv): `fontforge -script build_font.py`. See README.md.
"""
import json
import os
import re

import fontforge

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "..", "public", "fonts")

with open(os.path.join(HERE, "glyphs.json"), encoding="utf-8") as fh:
    DATA = json.load(fh)

META = DATA["meta"]
BASELINE = META["baseline"]
UPM = 1000
SCALE = UPM / BASELINE  # SVG units -> font units
STROKE_WIDTH = META["strokeWidth"] * SCALE

_NUM_RE = re.compile(r"-?\d+\.?\d*(?:[eE]-?\d+)?")
_CMD_RE = re.compile(r"([MLC])([^MLC]*)")


def fx(x):
    return x * SCALE


def fy(y):
    return (BASELINE - y) * SCALE


def parse_path(d):
    """Absolute-only M/L/C SVG path (this dataset never uses relative
    commands or other segment types) -> [(cmd, [(x,y), ...]), ...]."""
    segments = []
    for cmd, argstr in _CMD_RE.findall(d):
        nums = [float(n) for n in _NUM_RE.findall(argstr)]
        pts = [(nums[i], nums[i + 1]) for i in range(0, len(nums), 2)]
        segments.append((cmd, pts))
    return segments


def draw_stroke(pen, d):
    for cmd, pts in parse_path(d):
        if cmd == "M":
            x, y = pts[0]
            pen.moveTo((fx(x), fy(y)))
        elif cmd == "L":
            for x, y in pts:
                pen.lineTo((fx(x), fy(y)))
        elif cmd == "C":
            # SVG allows chained cubic segments after one "C"; consume in
            # groups of three points (ctrl1, ctrl2, end) per segment.
            for i in range(0, len(pts), 3):
                c1, c2, end = pts[i], pts[i + 1], pts[i + 2]
                pen.curveTo((fx(c1[0]), fy(c1[1])), (fx(c2[0]), fy(c2[1])), (fx(end[0]), fy(end[1])))
    pen.endPath()


def ink_extent_svg():
    """Min/max y (SVG units, baseline-relative not yet applied) across every
    point *and* control point of every stroke. A cubic Bezier always lies
    within the convex hull of its four points, so this is a safe bound on
    the raw path before the stroke width is added on top."""
    ys = []
    for gd in DATA["glyphs"]:
        for d in gd["strokes"]:
            for _cmd, pts in parse_path(d):
                ys.extend(y for _x, y in pts)
    return min(ys), max(ys)


def build_notdef(font):
    """A conventional hollow-box .notdef — UnicodeFull encoding starts with
    no glyphs at all (unlike the default Latin-1 encoding), so this has to
    be added explicitly rather than inheriting FontForge's built-in one."""
    glyph = font.createChar(-1, ".notdef")
    pen = glyph.glyphPen()
    x0, x1, y0, y1, inset = 80, 420, 0, 660, 40
    pen.moveTo((x0, y0))
    pen.lineTo((x1, y0))
    pen.lineTo((x1, y1))
    pen.lineTo((x0, y1))
    pen.closePath()
    pen.moveTo((x0 + inset, y0 + inset))
    pen.lineTo((x0 + inset, y1 - inset))
    pen.lineTo((x1 - inset, y1 - inset))
    pen.lineTo((x1 - inset, y0 + inset))
    pen.closePath()
    glyph.round()
    glyph.width = round(0.5 * UPM)


def build_glyph(font, gd):
    glyph = font.createChar(gd["codepoint"], gd["name"])
    if gd["strokes"]:
        pen = glyph.glyphPen()
        for d in gd["strokes"]:
            draw_stroke(pen, d)
        glyph.stroke(
            "circular", STROKE_WIDTH,
            cap="round", join="round",
            removeinternal=False, removeexternal=False, simplify=True,
        )
        glyph.removeOverlap()
        glyph.round()
    # Must be set *after* drawing: glyphPen() resets width to the font's em
    # once a contour is committed, silently clobbering any earlier value.
    glyph.width = round(gd["advance"] * SCALE)
    return glyph


def main():
    # Vertical metrics have to be nailed down *before* any glyph is drawn:
    # FontForge treats font.em as derived from ascent+descent, so assigning
    # font.ascent/font.descent after glyphs already exist at a fixed SCALE
    # silently changes unitsPerEm without rescaling their coordinates,
    # shrinking every glyph relative to the new em. Computing the box from
    # the raw path data up front and setting it once, before createChar,
    # sidesteps that entirely.
    ymin_svg, ymax_svg = ink_extent_svg()
    half_stroke = META["strokeWidth"] / 2
    design_ascent = BASELINE - META["ascender"]
    design_descent = META["descender"] - BASELINE
    ink_ascent = BASELINE - (ymin_svg - half_stroke)
    ink_descent = (ymax_svg + half_stroke) - BASELINE
    pad_svg = 2  # a little breathing room, in SVG units
    ascent = round((max(design_ascent, ink_ascent) + pad_svg) * SCALE)
    descent = round((max(design_descent, ink_descent) + pad_svg) * SCALE)

    font = fontforge.font()
    font.encoding = "UnicodeFull"
    font.ascent = ascent
    font.descent = descent
    font.familyname = "FluOlinGo Hand"
    font.fontname = "FluOlinGoHand-Regular"
    font.fullname = "FluOlinGo Hand Regular"
    font.weight = "Regular"
    font.version = "1.000"
    font.copyright = "FluOlinGo"
    font.os2_vendor = "FLUO"

    build_notdef(font)
    for gd in DATA["glyphs"]:
        build_glyph(font, gd)

    font.hhea_ascent, font.hhea_descent, font.hhea_linegap = ascent, -descent, 0
    font.hhea_ascent_add = font.hhea_descent_add = False
    font.os2_typoascent, font.os2_typodescent, font.os2_typolinegap = ascent, -descent, 0
    font.os2_typoascent_add = font.os2_typodescent_add = False
    font.os2_winascent, font.os2_windescent = ascent, descent
    font.os2_winascent_add = font.os2_windescent_add = False

    os.makedirs(OUT_DIR, exist_ok=True)
    otf_path = os.path.join(OUT_DIR, "FluOlinGoHand-Regular.otf")
    font.generate(otf_path)
    print(f"{len(DATA['glyphs'])} glyphs -> {otf_path}")


if __name__ == "__main__":
    main()
