#!/usr/bin/env python3
"""
Every coloured token in globals.css sits on one of the twelve palette hues,
or is on a list that says whose decision put it there.

Dan, 2026-09-06: *"whatever it is, every color on the web can only be one of
these"* — the twelve marks in src/content/highlighterMarks.ts.

WHAT THIS IS NOT. It is not a rule that every token IS one of the twelve
hexes. A token may be that hue lighter or darker — that is what
`--fam-review-ink` and `--fam-review-wash` are, and the app would be
unreadable without them: the pens are highlighter strength, so anything
carrying text has to move in lightness. What the rule forbids is a token
sitting on a hue that belongs to no pen. HUE is the axis checked here.

HOW THE SCOPE WAS SETTLED. Shown the survey — 133 colour declarations, of
which 32 are neutral, ~40 already a palette hue tinted, and 52 genuinely
elsewhere — Dan ruled out repainting the feedback colours (option B, *"B is
OUT"*) and, asked directly whether the grammar gender pair moves, answered
*"No"*. So the sweep was the eleven chrome tokens and nothing else:

    --fluo-secondary        #2bb6c2 -> #51adde   Sky
    --fluo-secondary-shadow #1d8b96 -> #3c84ab   Sky
    --fluo-margin           #e08b80 -> #d99363   Orange
    --cahier-t1             #8fd3cd -> #97d3bd   Teal
    --cahier-accent         #2d54a0 -> #015c93   Blue
    --cahier-accent-strong  #123780 -> #004069   Blue
    --neo-accent            #fbbf24 -> #e3cb2a   Yellow
    --fluo-line             #e2caa2 -> #e9c6a5   Amber
    --cahier-gold           #c8a24b -> #b9a94d   Yellow
    --cahier-kraft          #e0caae -> #e3c8b0   Amber
    --fluo-card-accent      #e0567f -> var(--fam-svplay-ink)

EACH KEPT ITS LIGHTNESS AND TOOK THE NEAREST PALETTE HUE, which is why
nothing became unreadable: the largest contrast drift on the cahier paper is
0.15 (--cahier-accent, the link colour, 6.75 -> 6.60:1). Rotating the hue and
leaving the lightness alone is the whole move.

The eleventh is a different shape and a better fix than a hue rotation.
`--fluo-card-accent` is a rotating slot: .fluo-h-1 through .fluo-h-5 already
read family inks, and only .fluo-h-0 still carried a hand-picked hex. The
family missing from that run was svplay — whose pen is Pink, which is what
#e0567f was reaching for. So the set is simply completed.

THE EXEMPTIONS BELOW ARE THE POINT OF THIS FILE. A check that silently
tolerated 41 tokens would be a check nobody trusts. Each exempt token is
listed with the reason and, where there is one, the ruling.
"""

import math
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


# ---- OKLCH, enough of it to read a hue off a hex --------------------------
def _s2l(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hue_and_chroma(hexv):
    h = hexv.lstrip("#")
    r, g, b = (_s2l(int(h[i:i + 2], 16)) for i in (0, 2, 4))
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    a_ = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return math.degrees(math.atan2(b_, a_)) % 360, math.hypot(a_, b_)


def oklch_to_hex(L, C, H):
    ca, sa = C * math.cos(H), C * math.sin(H)
    l = (L + 0.3963377774 * ca + 0.2158037573 * sa) ** 3
    m = (L - 0.1055613458 * ca - 0.0638541728 * sa) ** 3
    s = (L - 0.0894841775 * ca - 1.2914855480 * sa) ** 3
    out = []
    for v in (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
              -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
              -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s):
        u = 12.92 * v if v <= 0.0031308 else 1.055 * (abs(v) ** (1 / 2.4)) - 0.055
        out.append(max(0, min(255, round(u * 255))))
    return "#%02x%02x%02x" % tuple(out)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

CSS = read("src/app/globals.css")
MARKS = read("src/content/highlighterMarks.ts")

# ---- the twelve, read from the palette file, never retyped ----------------
palette = dict(re.findall(
    r'key: "([a-z]+)",\s+name: "[^"]+",\s+hue:\s*\d+,\s+reverseOf: "[a-z]+",\s+block: "(#[0-9a-fA-F]{6})"',
    MARKS))
ok(len(palette) == 12,
   f"the twelve marks are readable from highlighterMarks.ts ({len(palette)})",
   f"read {len(palette)} marks, expected 12 — this file is the source for every "
   "hue below, so the scrape has to hold before anything else here means "
   "anything")
if len(palette) != 12:
    print("\n".join("  FAIL  " + m for m in FAIL))
    sys.exit(1)
PAL_HUE = {n: hue_and_chroma(h)[0] for n, h in palette.items()}

# ---- what is allowed to sit off the wheel, and on whose word --------------
#
# NEUTRALS are not listed: anything under 0.03 chroma is the notebook itself
# (paper, ink, rules, the greys) and is skipped by measurement, not by name.
EXEMPT = {
    # --- Dan, 2026-09-06, asked directly whether these move: "No". -------
    "--cahier-le": "grammar: masculine « le ». Dan ruled it stays, 6 Sep.",
    "--cahier-la": "grammar: feminine « la ». Dan ruled it stays, 6 Sep.",
    # --- the same logic, applied without a separate ruling ---------------
    "--region-heights": "names a map region — moving it changes what the map says",
    "--region-village": "names a map region — moving it changes what the map says",
    # --- Dan, 2026-09-06: "B is OUT" — feedback keeps its meaning. -------
    #     Red means wrong; the nearest palette hue to that red is Pink, and
    #     Pink is already the Games family. These stay off the wheel so that
    #     a wrong answer never flashes a family colour.
    "--drill-bad": "wrong answer — red means wrong",
    "--drill-bad-ink": "wrong answer",
    "--drill-bad-mid": "wrong answer",
    "--drill-bad-soft": "wrong answer",
    "--drill-ok": "right answer — green means right",
    "--drill-ok-ink": "right answer",
    "--drill-ok-mid": "right answer",
    "--drill-ok-soft": "right answer",
    "--dopa-miss": "a miss", "--dopa-miss-ink": "a miss", "--dopa-miss-wash": "a miss",
    "--dopa-reward": "level-up", "--dopa-reward-ink": "level-up",
    "--dopa-reward-wash": "level-up",
    "--dopa-win": "correct", "--dopa-win-ink": "correct", "--dopa-win-wash": "correct",
    "--dopa-joy": "XP", "--dopa-joy-ink": "XP", "--dopa-joy-wash": "XP",
    "--dopa-streak": "the streak fire", "--dopa-streak-ink": "the streak fire",
    "--dopa-streak-wash": "the streak fire",
    "--dopa-flow": "focus states", "--dopa-flow-ink": "focus states",
    "--dopa-flow-wash": "focus states",
    "--dopa-focus": "primary action", "--dopa-focus-ink": "primary action",
    "--dopa-focus-wash": "primary action",
    "--tier-good": "accuracy tier", "--tier-medium": "accuracy tier",
    "--tier-weak": "accuracy tier",
    "--tier-good-soft": "accuracy tier", "--tier-medium-soft": "accuracy tier",
    "--tier-weak-soft": "accuracy tier",
    "--fluo-danger": "destructive action", "--fluo-danger-shadow": "destructive action",
    "--fluo-warn": "warning", "--fluo-warn-shadow": "warning",
    "--fluo-good": "success", "--fluo-good-shadow": "success",
    "--gram-fem": "grammar: feminine", "--gram-masc": "grammar: masculine",
    # --- dark furniture: a grey with a cast, not a colour ----------------
    #     Forcing these onto a palette hue would tint the page furniture.
    "--neo-bg": "dark panel ground — reads as grey, not as colour",
    "--neo-bg-hi": "dark panel ground",
    "--fluo-ink": "body ink", "--fluo-primary-ink": "primary button ink",
}

TOLERANCE = 6.0   # degrees; a tint of a palette hue drifts a little in gamut


def to_hex(v):
    if v.startswith("#"):
        return v.lower()
    m = re.match(r"oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)", v)
    if not m:
        return None
    return oklch_to_hex(float(m.group(1)) / 100, float(m.group(2)),
                        math.radians(float(m.group(3))))


strays, checked = [], 0
for name, raw in re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6}|oklch\([^)]*\))\s*;", CSS):
    hexv = to_hex(raw)
    if not hexv:
        continue
    hue, chroma = hue_and_chroma(hexv)
    if chroma < 0.03:       # the notebook: paper, ink, rules
        continue
    if name in EXEMPT:
        continue
    checked += 1
    near = min(PAL_HUE, key=lambda n: min(abs(PAL_HUE[n] - hue), 360 - abs(PAL_HUE[n] - hue)))
    off = min(abs(PAL_HUE[near] - hue), 360 - abs(PAL_HUE[near] - hue))
    if off > TOLERANCE:
        strays.append(f"{name} {hexv} is {off:.1f}deg off {near}")

ok(not strays,
   f"all {checked} non-exempt coloured tokens sit on one of the twelve hues "
   f"(within {TOLERANCE:.0f}deg)",
   f"{len(strays)} token(s) sit on a hue belonging to no pen:\n    "
   + "\n    ".join(strays[:10]) +
   '\n  Dan, 6 Sep: "every color on the web can only be one of these" — the twelve '
   "in highlighterMarks.ts. Rotate the hue and KEEP THE LIGHTNESS (that is what "
   "made the eleven-token sweep safe), or, if the colour means something the way "
   "red-means-wrong does, add it to EXEMPT above WITH ITS REASON.")

# The eleven are pinned individually, so a later edit that quietly reverts one
# is named rather than merely counted.
SWEPT = {
    "--fluo-secondary": "#51adde", "--fluo-secondary-shadow": "#3c84ab",
    "--fluo-margin": "#d99363", "--cahier-t1": "#97d3bd",
    "--cahier-accent": "#015c93", "--cahier-accent-strong": "#004069",
    "--neo-accent": "#e3cb2a", "--fluo-line": "#e9c6a5",
    "--cahier-gold": "#b9a94d", "--cahier-kraft": "#e3c8b0",
}
reverted = []
for name, want in SWEPT.items():
    m = re.search(re.escape(name) + r"\s*:\s*(#[0-9a-fA-F]{6})\s*;", CSS)
    if not m or m.group(1).lower() != want:
        reverted.append(f"{name} is {m.group(1) if m else 'gone'}, expected {want}")
ok(not reverted,
   f"the {len(SWEPT)} swept tokens still carry the palette hue they were moved to",
   "these went back to an off-palette value: " + "; ".join(reverted))

ok(".fluo-h-0 { --fluo-card-accent: var(--fam-svplay-ink);" in CSS,
   ".fluo-h-0 reads the svplay family ink, completing the rotating set",
   ".fluo-h-0 has gone back to a hand-picked hex. Its five siblings (.fluo-h-1 "
   "through .fluo-h-5) each read a family ink; svplay was the family missing "
   "from the run, and its pen is the Pink that #e0567f was reaching for.")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
