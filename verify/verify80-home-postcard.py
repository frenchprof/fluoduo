#!/usr/bin/env python3
"""
Home carries the REAL map, never the postcard.

THIS CHECK HAS BEEN RETARGETED FOUR TIMES, and the trail matters more than
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
  (12 Sep)                    THE SWITCH CAME BACK — and /map went instead.
                              Dan, with both pages open: *"We have two pages
                              doing the same thing: The Home page + The Map.
                              Can we just keep the Bienvenue one … and move
                              the 3D-2D switch and the zoom control and
                              navigators '> Goal', legend there."* Home
                              renders `MapBody` now; /map forwards here. The
                              "no view switch" line from 1 Sep is therefore
                              INVERTED below rather than deleted: its absence
                              is the regression now.

SO THE SUBJECT WAS NEVER "a map on Home". Read the three rulings together and
the constant is the POSTCARD: a cropped 2D grid, dressed with a glassmorphic
« Enter the map » band that is `pointer-events-none` by design. That is the
"unresponsive" in Dan's own word for it — a button that ignores you — and on
a desktop the band laid its words across stop 23. The 8 Sep inversion read
that as "no map", which is why the check had to be told the difference the
moment Dan asked for the map back.

WHAT THIS PINS NOW:
  · the real 3D scene is on Home, wired to open a stop (`onOpenSio`);
  · none of the postcard's parts are — no `postcard` mode, no « Enter the
    map » band, no `still` frozen picture, no `fill`;
  · the 2D/3D switch IS there (12 Sep);
  · the map still has a door somewhere outside itself.

The 2D GRID is no longer forbidden: it is the 2D view the switch switches to,
which is the thing Dan moved onto Home. What made the postcard a postcard was
the CROP and the dead band, and those are what stay named.

It says nothing about /welcome — that is verify25c, 151 and 152.

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
#
# THROUGH `MapBody` SINCE 2026-09-12, not by naming the scene directly. Dan,
# with /home and /map open side by side: *"We have two pages doing the same
# thing … Can we just keep the Bienvenue one and move the 3D-2D switch and the
# zoom control and navigators '> Goal', legend there."* /map now forwards to
# Home, and Home renders the component /map used to frame.
#
# THE CHECK FOLLOWS THE DELEGATION RATHER THAN RELAXING. "Home carries the real
# map, never a picture of one" is still exactly what is asserted; it is now
# asserted across two files, because that is where the answer lives. Dropping
# to "Home mentions a map somewhere" would have been the easy edit and would
# have stopped testing the thing this file exists for.
mapbody = open("src/app/map/MapBody.tsx", encoding="utf-8").read()
mb_code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", mapbody)
mb_code = re.sub(r"(?m)^\s*//.*$", "", mb_code)

ok("<MapBody" in code,
   "Home renders the map",
   "the map is gone from Home — Dan, 9 Sep: 'Home, and put the 3D map on it', "
   "and 12 Sep: Home is the one map page")

ok("<HomeMap3D" in mb_code,
   "and the map it renders is the 3D scene",
   "MapBody no longer renders the 3D scene, so Home has no map either")

# A map you cannot tap is a picture of a map. This is the single line that
# separates what Dan asked for from what he threw out.
scene = re.search(r"<HomeMap3D[^>]*>", mb_code)
attrs = scene.group(0) if scene else ""
ok("onOpenSio=" in attrs,
   "its stops open the goal's page — the scene is a control, not a picture",
   "the scene Home shows has no onOpenSio: its stops go nowhere, which is the "
   "'unresponsive' Dan retired on 8 Sep wearing a new coat")

ok("still" not in attrs,
   "the scene is not frozen — no `still`",
   "the scene on Home is `still`: frozen is what /welcome's PICTURE of the "
   "map is for, not the map itself")

# `fill` CHANGED MEANING ON 12 SEP, so this assertion changed with it rather
# than being dropped. It used to be forbidden because it meant "/welcome's
# shape": the scene filling the WINDOW, as a hero. It is now how the scene
# takes the height of the shared frame — Dan: *"the frame itself (not the
# content) for both maps must be identical in shape and size"* — and the frame
# is bounded by the 2D grid sitting under it in the page's own flow.
#
# What still has to be true is what the old line was really protecting: the
# scene is bounded by the PAGE, not by the viewport. So the check now asserts
# the construction that bounds it. Without the absolutely-positioned box over a
# sizer, `fill` means `h-full` of an auto-height parent — which is what made the
# scene measure 142,800px tall when this was first built the other way.
ok(re.search(r"absolute inset-0", mb_code) is not None and "<Map2DGrid" in mb_code,
   "the scene fills a frame the page sizes, not the window",
   "the 3D scene is no longer bounded by the 2D grid's box: `fill` then means "
   "`h-full` of an auto-height parent, and the scene's own scroll height is the "
   "road's length — it grows without limit")

# ---- and none of the postcard came back with it ------------------------------

# MAP2DGRID IS NOW LEGITIMATE INSIDE MapBody — it is the 2D VIEW, the one the
# switch switches to, and Dan asked for that switch to come to Home. What stays
# retired is the POSTCARD: a 0.44-zoom CROP of that grid under a dead band. So
# the assertion moves to the two things that made it a postcard and are still
# nobody's feature, and is checked across both files.
both = code + mb_code
ok("postcard" not in both.lower(),
   "no postcard mode anywhere behind Home",
   "a `postcard` prop or mode is back behind Home — Dan, 9 Sep: 'please throw "
   "that postcard away forever'")

ok("Enter the map" not in both,
   "no « Enter the map » band",
   "the retired CTA band is back on Home — it is pointer-events-none, which "
   "is exactly the dead button Dan called unresponsive")

# THE VIEW SWITCH IS BACK ON HOME ON PURPOSE (Dan, 2026-09-12: *"move the
# 3D-2D switch and the zoom control and navigators '> Goal', legend there"*).
# This file's header records three earlier turns on this same question; this is
# the fourth, and it is the only one that also deleted the other page.
#
# So the assertion inverts rather than disappearing: the switch must BE there,
# because a switch that quietly went missing again is the regression now.
ok("mapView" in mb_code and "setMapView" in mb_code,
   "the 2D/3D switch is on Home, where Dan moved it",
   "the view switch is gone from the map Home renders — Dan, 12 Sep, moved it "
   "here from /map and then retired /map")

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
# /map is a REDIRECT since 12 Sep, so these doors are hops rather than
# destinations — and they must keep existing for exactly that reason. Fifty
# stops' worth of `/map#SIO-0nn` deep links, printed QR codes and these six
# in-app links all rely on the forward still being wired to something. A door
# that 404s is the failure this guards; one that forwards is the design.
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
