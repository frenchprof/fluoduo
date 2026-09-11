#!/usr/bin/env python3
"""
Home carries the REAL map, never the postcard.

THIS CHECK HAS BEEN RETARGETED THREE TIMES, and the trail matters more than
the assertions, because each turn superseded the last:

  verify80-home-view-switch   Home had a 2D/3D switch (Dan, 1 Sep).
  verify80-home-postcard      The switch went; a pinned 2D postcard under an
                              « Enter the map » band took its place (7 Sep:
                              *"it should be the tightened 2D … Across it we
                              can have the CTA 'Enter the map'"*).
  (8 Sep)                     The postcard went too — and the check was
                              inverted to "Home renders NO map at all".
  THIS                        Dan, 9 Sep, asked where ENTER should land now
                              that there is no course picker, and answered
                              himself: *"Home, and put the 3D map on it"* —
                              then, before a line was written, *"not the
                              postcard pls"*.

SO THE SUBJECT WAS NEVER "a map on Home". Read the three rulings together and
the constant is the POSTCARD: a cropped 2D grid, dressed with a glassmorphic
« Enter the map » band that is `pointer-events-none` by design. That is the
"unresponsive" in Dan's own word for it — a button that ignores you — and on
a desktop the band laid its words across stop 23. The 8 Sep inversion read
that as "no map", which is why the check had to be told the difference the
moment Dan asked for the map back.

WHAT THIS PINS NOW:
  · the real 3D scene is on Home, wired to open a stop (`onOpenSio`);
  · none of the postcard's parts are — no 2D grid, no view switch, no
    « Enter the map » band, no `still` frozen picture, no `fill`;
  · the map still has a door somewhere outside itself.

It says nothing about /map or /welcome — those are verify25b/c, 151 and 152.

Run from the repo root:  python3 verify/verify80-home-postcard.py
"""
import os, re, sys

OK, FAIL = [], []
def ok(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

home = open("src/app/HomeDashboard.tsx", encoding="utf-8").read()
# Comments stripped before every code-shape scan (verify19b's lesson): the
# comment that RECORDS the retirement legitimately names Map2DGrid and
# « Enter the map », and a check that cannot tell code from prose would
# report its own documentation as the defect.
code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", home)
code = re.sub(r"(?m)^\s*//.*$", "", code)

# ---- the map IS there, and it is the live one -------------------------------

ok("<HomeMap3D" in code,
   "Home renders the 3D scene",
   "the 3D map is gone from Home — Dan, 9 Sep: 'Home, and put the 3D map on it'")

# A map you cannot tap is a picture of a map. This is the single line that
# separates what Dan asked for from what he threw out.
scene = re.search(r"<HomeMap3D[^>]*>", code)
attrs = scene.group(0) if scene else ""
ok("onOpenSio=" in attrs,
   "its stops open the goal's page — the scene is a control, not a picture",
   "the scene on Home has no onOpenSio: its stops go nowhere, which is the "
   "'unresponsive' Dan retired on 8 Sep wearing a new coat")

ok("still" not in attrs,
   "the scene is not frozen — no `still`",
   "the scene on Home is `still`: frozen is what /welcome's PICTURE of the "
   "map is for, not the map itself")

ok("fill" not in attrs,
   "the scene keeps its own height — no `fill`",
   "the scene on Home is `fill`ed to the window; that is /welcome's shape")

# ---- and none of the postcard came back with it ------------------------------

ok("Map2DGrid" not in code,
   "no 2D grid on Home — the postcard's body stays retired",
   "the 2D map postcard is back on Home — Dan, 8 Sep: 'we don't need this "
   "anymore'")

ok("Enter the map" not in code,
   "no « Enter the map » band",
   "the retired CTA band is back on Home — it is pointer-events-none, which "
   "is exactly the dead button Dan called unresponsive")

ok("PillSwitch" not in code,
   "no view switch on Home — the choice lives on /map",
   "the home view switch is back; its subject was retired on 7 Sep")

# AND THE MODE ITSELF IS GONE, not merely unused (Dan, 9 Sep: *"please throw
# that postcard away forever"*). HomeMap carried a `postcard` prop that
# stripped it to a bare 280px snapshot for exactly this purpose. Nothing had
# passed it since 8 Sep — which is the state a check has to catch, because a
# dormant mode reads as a feature to the next session that finds it.
hm = open("src/components/HomeMap.tsx", encoding="utf-8").read()
hm_code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", hm)
hm_code = re.sub(r"(?m)^\s*//.*$", "", hm_code)
ok("postcard" not in hm_code,
   "HomeMap has no `postcard` mode left to revive",
   "the `postcard` prop is back in HomeMap.tsx — Dan, 9 Sep: 'please throw "
   "that postcard away forever'")

# ---- the map is still reachable the ordinary way -----------------------------
# Home showing the scene does not excuse stranding /map: the zoom, the legend
# and the 2D view all live there and nowhere else.
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
   "NOTHING links to /map any more — the zoom, the legend and the 2D view "
   "are reachable only by typing the address")

print("\n".join("  ok    " + s for s in OK))
if FAIL: print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
