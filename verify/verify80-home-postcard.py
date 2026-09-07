#!/usr/bin/env python3
"""
Home's postcard: pinned 2D, one bare door, the CTA said on the picture.

THIS FILE WAS verify80-home-view-switch until 7 Sep — a check whose whole
subject was Home's 2D/3D switch. Dan retired the subject: *"on the home page
we are seeing the wrong map. it should be the tightened 2D or the 2D ones.
Across it we can have the CTA 'Enter the map'"*. That supersedes his 1 Sep
switch spec (label-in-track, promise-keeping navigation), which lives on
where the choice still exists — /map's PillSwitch, pinned by verify25b/c.

What is pinned now, and why each would regress silently:

  1  THE POSTCARD IS THE 2D GRID, unconditionally — no HomeMap3D import, no
     view state. A "helpful" re-adding of the flip quietly reintroduces the
     wrong-map complaint this rewrite answers.
  2  ONE BARE DOOR. The stretched link says /map with NO view param, so the
     map opens in the learner's own saved view. A ?view spelled here is the
     silent view-reset Dan killed on 1 Sep, reborn.
  3  THE CTA RIDES THE PICTURE and presses nothing itself: pointer-events
     none, aria-hidden, content-sized (never a full-width control). Two
     tappable layers on one card is how ghost-tap bugs are born; the pill
     is caption, the card is the button.
  4  NO SWITCH ON HOME. PillSwitch stays a /map (and Réglages) control.

Run from the repo root:  python3 verify/verify80-home-postcard.py
"""
import os, re, sys

OK, FAIL = [], []
def ok(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

home = open("src/app/HomeDashboard.tsx", encoding="utf-8").read()
# Comments stripped for the code-shape scans (verify19b's lesson: a check
# that cannot tell code from prose reports the documentation as the defect —
# the comment recording the switch's retirement legitimately names it).
code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", home)
code = re.sub(r"(?m)^\s*//.*$", "", code)

ok("HomeMap3D" not in code and "view3d" not in code,
   "the postcard is 2D unconditionally — no flip, no view state",
   "a 3D flip is back on Home — Dan, 7 Sep: 'it should be the tightened 2D'")
ok('href="/map"' in home and "?view" not in home,
   "the one door is bare /map — the learner's saved view survives the trip",
   "Home spells a view onto the map link — the 1 Sep silent-reset defect reborn")
ok("Enter the map" in home,
   "the CTA is said on the picture",
   "the 'Enter the map' CTA is gone from the postcard")
m = re.search(r"<span[^>]*aria-hidden[^>]*pointer-events-none[^>]*>\s*Enter the map|pointer-events-none[\s\S]{0,400}Enter the map", home)
ok(m is not None,
   "the CTA presses nothing — the card stays the one button",
   "the CTA is tappable in its own right — two layers on one card is how ghost taps begin")
ok("PillSwitch" not in code,
   "no view switch on Home — the choice lives on /map",
   "the home view switch is back — its subject was retired on 7 Sep")

print("\n".join("  ok    " + s for s in OK))
if FAIL: print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
