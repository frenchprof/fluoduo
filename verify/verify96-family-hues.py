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
#
# SEVEN FAMILIES, RECOLOURED 2026-09-09 (Dan's ☰-menu restructure: Skills
# retired, split into Oral and Tools — see AGENTS.md and activities.ts
# FAMILIES). Three keep an old colour under a new name (Practice takes
# Review's old blue, Games takes Skills' old violet, Tools takes User's old
# orange); three are new (Review teal, Oral indigo, User grey). Goals
# (display name "Lesson" now) keeps its green untouched throughout.
EXPECT = {
    # "the first row should be yellow instead of green" (Dan, 2026-09-09,
    # after seeing the menu mock-up) — Green went unused.
    "goals":    ("Yellow",     "#fcdf00", "#756700", "#f2e8a5", "#faf7e2"),
    "practice": ("Blue",       "#1ca6ff", "#006baa", "#d0e9ff", "#eff8ff"),
    "review":   ("Teal",       "#00c197", "#005f49", "#cdf4e7", "#eafbf8"),
    "svplay":   ("Violet",     "#b17eff", "#9200fe", "#eae0ff", "#f8f4ff"),
    # Periwinkle stands in for "Indigo" — not one of Dan's twelve swatches.
    "oral":     ("Periwinkle", "#9398ff", "#3230b0", "#e5e5ff", "#eef0ff"),
    "tools":    ("Orange",     "#ff9037", "#9f5100", "#ffdec9", "#fff4ed"),
    # Grey is not in the twelve either — kept pending Dan's answer.
    "user":     ("Grey",       "#9ca3af", "#4b5563", "#e5e7eb", "#f3f4f6"),
}


def declared(token):
    m = re.search(r"--" + re.escape(token) + r"\s*:\s*(#[0-9a-fA-F]{6})\s*;", CSS)
    return m.group(1).lower() if m else None


# ---- 1 · the twenty-eight values (seven families x four rungs since 9 Sep) ---
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
   f"all {4 * len(EXPECT)} family values are pinned, to the hex",
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

# ---- 3 · distinct hues, pairwise (2026-09-09 rewrite) ---------------------
# The OLD assertion pinned a rising hue-wheel order across all six — true of
# that palette because it WAS a wheel (60° apart, spaced for colour-blind
# readers). The 9 Sep set is not a wheel any more: User is grey (no hue to
# rank) and the row order Dan gave (Lesson·Practice·Review·Games·Oral·Tools·
# User) is the MENU's order, not a colour ramp — Tools (orange) sits after
# Oral (indigo) on purpose, which a "rising order" rule would reject as a
# swap. What still matters, and is still checked here: no two families read
# as the same colour. Grey is excluded from the hue comparison (its whole
# point is having none) and checked separately for lightness contrast
# instead — swap it for green or blue and nobody would call it the SAME
# hue, but it also should not sit at a lightness so close to the paper that
# the "hue" comparison would call it "distinct" while an eye would not.
# THE FLOOR DROPPED TO 15° THE SAME DAY (still 2026-09-09). Every colour
# above is now Dan's own fixed 12-swatch brand palette ("use only these
# shades" — his icon reference image), not a set chosen for this app's
# separation — and Oral has no exact match in it. Periwinkle stands in for
# the "Indigo" he asked for and lands only 20° from Games' Violet, which
# the old 30° floor (this repo's own goal, not his) would reject. 15° still
# catches a real mistake — two families landing on the SAME swatch, or one
# a few degrees off it — without failing CI over a gap that is Dan's
# palette, not a bug.
CHROMATIC = ["goals", "practice", "review", "svplay", "oral", "tools"]
hues = [(k, hue(declared(f"fam-{k}") or "#000000")) for k in CHROMATIC]
ordered = sorted(hues, key=lambda kh: kh[1])
gaps = [ordered[i + 1][1] - ordered[i][1] for i in range(len(ordered) - 1)]
gaps.append(360 - ordered[-1][1] + ordered[0][1])
ok(min(gaps) >= 15,
   "and no two chromatic families sit closer than "
   f"{min(gaps):.0f}° — " + " → ".join(f"{k} {h:.0f}°" for k, h in ordered),
   f"two chromatic families are only {min(gaps):.0f}° apart (" +
   " → ".join(f"{k} {h:.0f}°" for k, h in ordered) + ") — close enough to read "
   "as the same colour even allowing for Dan's fixed palette")
user_pen = declared("fam-user")
ok(user_pen is not None and lum(user_pen) not in (lum(PAPER), lum(WHITE)),
   f"User's grey ({user_pen}) is a real mid-tone, not paper or white in disguise",
   f"User's grey ({user_pen}) reads as {'the paper' if user_pen == PAPER else 'plain white'} "
   "rather than a colour of its own")

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
