#!/usr/bin/env python3
"""
The six families are the six highlighter pens, and the ladder still holds.

Dan, 2026-09-05: *"can we align these colors with the six standard highlighter
colors: Pink, Orange, Yellow, Blue, Green, Indigo-Violet-Lilac"*. They now are.

WHY THIS CHECK EXISTS AT ALL. Until today NOTHING pinned the family colours.
`verify30` has held the seven dopamine roles to the value since 21 August, and a
drift there is a CI failure; the six families had the identical shape of risk and
no guard, so a hand-edit to any of twenty-four values would have shipped in
silence. That gap was found while proposing the realignment, and it would have
been the wrong moment to change twenty-four unpinned values and leave them
unpinned. So the recolour and its guard land together.

WHAT IS PINNED, AND WHY EACH PART

  1  THE TWENTY-FOUR VALUES, exactly. Six families x four rungs. A typo in one
     hex is invisible on screen and permanent in the repo.

  2  THE THREE-SURFACE CONTRAST FLOOR, recomputed here rather than trusted from
     the stylesheet comment. Each `-ink` must clear 4.5:1 on THREE surfaces at
     once, because it is used on all three: its own wash (the band label), white
     (the pill), and the paper (body text). This is the rule the previous
     palette's own comment stated, and the realignment was generated to hold it
     — worst case 4.52 / 5.52 / 5.12 against the old set's 4.53 / 5.54 / 5.14.

  3  THE HUE ORDER ROUND THE WHEEL. The mapping's whole justification is that it
     preserves the order the families already sat in, so a learner is not
     re-taught which family is the cool one. Order is a property of the SET, and
     no per-value check can see it — this is the assertion that would catch
     someone "fixing" one family into a nicer hue and silently swapping two.

  4  THAT THE COMMENT DOES NOT LIE ABOUT AAA. The block above the page grounds
     claimed the soft ink cleared "7.1:1 — both AAA". It measures 6.00-6.13, so
     it is AA and the claim was false before this change and after it. Corrected
     5 Sep. A comment that overstates a contrast figure is worse than no comment:
     three sessions read this file and none of them measured.
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


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def hue(h):
    """OKLCH hue in degrees, for the wheel-order assertion."""
    hx = h.lstrip("#")
    r, g, b = (lin(int(hx[i:i + 2], 16)) for i in (0, 2, 4))
    l_ = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m_ = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s_ = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    return math.degrees(math.atan2(bb, a)) % 360


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

CSS = read("src/app/globals.css")
PAPER, WHITE = "#faf6ee", "#ffffff"

# family key -> (pen name, full, ink, wash, page)
EXPECT = {
    "goals":    ("Green",         "#00dd3e", "#007a1e", "#c3f5c3", "#ebfceb"),
    "practice": ("Yellow",        "#fcdf00", "#756700", "#f2e8a5", "#faf7e2"),
    "svplay":   ("Pink",          "#ff4eb2", "#c1007f", "#ffdaea", "#fff2f8"),
    "review":   ("Blue",          "#1ca6ff", "#006baa", "#d0e9ff", "#eff8ff"),
    "skills":   ("Indigo-Violet", "#b17eff", "#9200fe", "#eae0ff", "#f8f4ff"),
    "user":     ("Orange",        "#ff9037", "#9f5100", "#ffdec9", "#fff4ed"),
}


def declared(token):
    m = re.search(r"--" + re.escape(token) + r"\s*:\s*(#[0-9a-fA-F]{6})\s*;", CSS)
    return m.group(1).lower() if m else None


# ---- 1 · the twenty-four values ------------------------------------------
wrong = []
for key, (_pen, full, ink, wash, page) in EXPECT.items():
    for token, want in (
        (f"fam-{key}", full), (f"fam-{key}-ink", ink),
        (f"fam-{key}-wash", wash), (f"fam-{key}-page", page),
    ):
        got = declared(token)
        if got != want:
            wrong.append(f"--{token} is {got or 'missing'}, expected {want}")
ok(not wrong,
   "all 24 family values are the highlighter set, to the hex",
   "the family palette has drifted: " + "; ".join(wrong))

# ---- 2 · the three-surface floor, recomputed ------------------------------
# Skipped rather than faked if a value is missing — check 1 already reports that,
# and measuring a token that is not there would print a second, confusing error.
thin = []
worst = [99.0, 99.0, 99.0]
for key, (_pen, _full, ink, wash, _page) in EXPECT.items():
    if declared(f"fam-{key}-ink") and declared(f"fam-{key}-wash"):
        trio = (ratio(ink, wash), ratio(ink, WHITE), ratio(ink, PAPER))
        worst = [min(w, t) for w, t in zip(worst, trio)]
        if min(trio) < 4.5:
            thin.append(f"{key} {tuple(round(t, 2) for t in trio)}")
ok(not thin,
   f"every family ink clears 4.5:1 on wash, white and paper "
   f"(worst {worst[0]:.2f} / {worst[1]:.2f} / {worst[2]:.2f})",
   "a family ink no longer clears 4.5:1 on all three surfaces it is used on — " +
   "; ".join(thin) + " (wash = the band label, white = the pill, paper = body text)")

# ---- 3 · the wheel order the mapping was chosen to preserve ---------------
WHEEL = ["user", "practice", "goals", "review", "skills", "svplay"]
hues = [(k, hue(declared(f"fam-{k}") or "#000000")) for k in WHEEL]
rising = all(hues[i][1] < hues[i + 1][1] for i in range(len(hues) - 1))
ok(rising,
   "the six sit in rising hue order — " +
   " → ".join(f"{k} {h:.0f}°" for k, h in hues),
   "the families are no longer in rising hue order (" +
   " → ".join(f"{k} {h:.0f}°" for k, h in hues) + "). Order is the whole "
   "justification for this mapping: it is what lets a learner keep 'Revise is "
   "the cool one, Games is the hot one'. Two families have swapped places.")

# Separation matters as much as order: the previous scheme spaced them 60° apart
# for colour-blind readers, and the pens must not undo that.
gaps = [hues[i + 1][1] - hues[i][1] for i in range(len(hues) - 1)]
gaps.append(360 - hues[-1][1] + hues[0][1])
ok(min(gaps) >= 30,
   f"and no two adjacent families sit closer than {min(gaps):.0f}°",
   f"two families are only {min(gaps):.0f}° apart — the palette was spaced for "
   "colour-blind separation and this narrows it below 30°")

# ---- 4 · the comment does not overstate the soft ink ----------------------
ok("7.1:1 — both AAA" not in CSS,
   "the page-ground comment no longer claims 7.1:1 AAA for the soft ink",
   'globals.css claims the soft ink clears "7.1:1 — both AAA" on the family page '
   "grounds. It measures 6.00-6.13, which is AA. Measure before restoring that "
   "sentence.")

# The soft ink is NOT read out of the stylesheet, and that is deliberate.
# `--cahier-ink-soft` is declared twice: #6a6e96 early in the file, then
# `oklch(48% 0.016 60)` in the 10 Aug override block, which is what renders.
# A regex for a six-digit hex finds the first and measures the dead one — this
# check did exactly that on its first run and reported 4.51 instead of 6.00,
# the same trap Finding H in docs/COLOR_REVIEW.md was written about. So the
# resolved value is pinned here, and the override that produces it is asserted.
SOFT_RESOLVED = "#655c55"   # oklch(48% 0.016 60), read out of the running app
ok(re.search(r"--cahier-ink-soft\s*:\s*oklch\(\s*48%", CSS) is not None,
   "the soft ink is still the oklch override this check measures",
   "--cahier-ink-soft is no longer `oklch(48% …)`. The value pinned in this "
   "check (#655c55) came from that declaration; re-resolve it before trusting "
   "the figure below.")
softworst = min(ratio(SOFT_RESOLVED, EXPECT[k][4]) for k in EXPECT)
ok(softworst < 7.0,
   f"and the measurement still agrees ({softworst:.2f}:1 on the faintest ground, "
   "short of AAA's 7.0)",
   f"the soft ink now clears {softworst:.2f}:1 on every family ground, which IS "
   "AAA — the correction in globals.css is stale and should be restored")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
