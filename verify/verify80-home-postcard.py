#!/usr/bin/env python3
"""
Home carries no map postcard — the map is shown properly, elsewhere.

THIS CHECK HAS BEEN INVERTED TWICE, and the trail matters more than the
assertions, because each turn superseded the last:

  verify80-home-view-switch   Home had a 2D/3D switch (Dan, 1 Sep).
  verify80-home-postcard      The switch went; a pinned 2D postcard under an
                              « Enter the map » band took its place (7 Sep:
                              *"it should be the tightened 2D … Across it we
                              can have the CTA 'Enter the map'"*).
  THIS                        The postcard goes too (8 Sep). Shown a
                              screenshot of it, Dan: *"retire the
                              unresponsive 2d map with start here button. we
                              have replaced that with the new landing page
                              that peers has edited"*, then *"we don't need
                              this anymore"*.

WHY IT WENT, so the next session does not helpfully restore it. /welcome now
opens on the 3D map at full height — the map as a picture, done properly. The
postcard was a 0.44-zoom crop of the 2D grid on a page that is about
continuing, and on a desktop the band laid its words across stop 23. It also
READ as broken: the band is `pointer-events-none` by design, so it looks like
a button that ignores you, which is the "unresponsive" in Dan's word for it.

WHAT THIS PINS. Only that Home does not render a map. It says nothing about
/map, /welcome or the 3D scene — those are verify25b/c, 151 and 152. A map on
Home is the specific thing three rulings in a row have now removed.

Run from the repo root:  python3 verify/verify80-home-postcard.py
"""
import os, re, sys

OK, FAIL = [], []
def ok(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

home = open("src/app/HomeDashboard.tsx", encoding="utf-8").read()
# Comments stripped before every code-shape scan (verify19b's lesson): the
# comment that RECORDS this retirement legitimately names Map2DGrid and
# « Enter the map », and a check that cannot tell code from prose would
# report its own documentation as the defect.
code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", home)
code = re.sub(r"(?m)^\s*//.*$", "", code)

ok("Map2DGrid" not in code,
   "Home renders no 2D map grid",
   "the map postcard is back on Home — Dan, 8 Sep: 'we don't need this anymore'")

ok("HomeMap3D" not in code and "HomeMap" not in code,
   "Home renders no map scene either — /welcome is where the map is shown",
   "a map scene is back on Home; the showcase belongs to /welcome")

ok("Enter the map" not in code,
   "no « Enter the map » band",
   "the retired CTA band is back on Home")

ok("PillSwitch" not in code,
   "no view switch on Home — the choice lives on /map",
   "the home view switch is back; its subject was retired on 7 Sep")

# The postcard was Home's ONLY door to /map, so its removal is also the
# moment the map could be stranded. This does not demand a door on Home —
# Dan removed the one that was there — but it does demand that SOME door
# exists somewhere a learner can reach, so the fifty stops never become a
# page only a typed address opens.
doors = []
for root, _dirs, fs in os.walk("src"):
    for f in fs:
        if not f.endswith((".tsx", ".ts")):
            continue
        p = os.path.join(root, f)
        if p.replace(os.sep, "/").startswith("src/app/map/"):
            continue  # the map linking to itself is not a way in
        t = open(p, encoding="utf-8").read()
        if re.search(r'href=(?:"|\{")/map"|href:\s*"/map"|push\("/map"\)', t):
            doors.append(p.replace(os.sep, "/"))
ok(len(doors) >= 1,
   f"the map still has {len(doors)} door(s) outside itself: "
   + ", ".join(sorted(os.path.basename(d) for d in doors)[:4]),
   "NOTHING links to /map any more — the fifty stops are reachable only by "
   "typing the address")

print("\n".join("  ok    " + s for s in OK))
if FAIL: print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
