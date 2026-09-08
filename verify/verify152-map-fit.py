#!/usr/bin/env python3
"""verify152 — the map fits its notebook, and fills it.

Dan asked for a QC pass on the 2D map on 8 Sep. Driving `/map` at four widths
and both views turned up four faults, none of which is visible in the source
and three of which are invisible on a phone. He then said: *"the background
should not be white but the actual page lined background"*, *"fix 1"*, and
*"then proceed until 5 without me asking"*.

  1  THE MAP IGNORED THE DESKTOP. On a 1440 screen it was a 421px block with
     452px of blank paper on either side, and zooming could not fix it — zoom
     grows the discs, not the layout. The cause was `mx-auto` on the frame's
     wrapper: the frame's <body> is `flex flex-col`, and auto side margins on a
     flex item OVERRIDE the default cross-axis stretch, so the box shrink-
     wrapped to five 44px discs and `max-w-3xl` never came into it. Measured
     after: the stops span 65% of the frame instead of 33%, and Home's postcard
     shows six rows of the journey in the same height Dan chose, instead of
     three.

  2  THE ZOOM WELL CUT ITS OWN LEADING DIGIT. « 100 » needed 58px of content in
     a 52px field, so a desktop read « 00 » at 100% and « ?00 » at 200%. A
     phone was fine, which is exactly why it survived: the mono face is set
     from a smaller step there.

  3  THE KIND LEGEND WAS DRAWN TWICE IN 3D. MapBody draws one under the map for
     both views and HomeMap3D drew its own inside the scene, so the 3D view
     printed the four kinds twice, one row under the other. You only meet the
     pair by flipping the switch, which is why nobody had.

  4  THE FRAME SCROLLED SIDEWAYS ON A SMALL PHONE. At 320px the notebook leaves
     the frame 247px, and two things did not fit: the control row (switch +
     bookmark + zoom, 308px on one line — it wraps now) and the intro sentence,
     whose `clamp(13px, 4.3vw, 19px)` was tuned before this page ran in an
     iframe. Inside one, `vw` is the FRAME's width, and the 13px floor put
     252px of nowrap text in 201px.

AND THE PAPER, which is the fault Dan named himself. Every other framed station
renders a shell inside its frame, so what survives `html[data-embed]` is the
ruled, family-tinted paper. This frame rendered a bare `<div>`, so nothing
inside it painted paper and the browser's own white body showed through the
transparent iframe — over a notebook that was drawing pale-green ruled paper
the whole time. `cahier-surface fam-goals cahier-foolscap` puts that back.
NOT `.cahier-page`: that was tried first and drags the notebook's form theme
with it, which blew the zoom well from 52px to 63px and clipped it harder.

WHY A BROWSER SCAN. Every one of the five is a measurement. The markup for
fault 1 asks for 768px and reads perfectly; the markup for fault 4 asks for a
13px floor, which is right on a page and wrong in a frame. A grep sees the
intention, and the intention was never the problem.

Break-tested all four at once — `w-full`/cap reverted, well back to 52px,
legend restored inside the scene, clamp back to 13px/4.3vw — and each
assertion named its own failure: fill 21%, « 100 » CLIPPED on two rows,
2 legends in 3D, 31px of sideways scroll at 320.

A FIFTH ASSERTION EXISTS BECAUSE THE CHECK LIED ONCE. The 3D row was reached
by clicking the switch inside the frame, and the click silently did nothing —
so that row measured the 2D plan and reported a clean pass on the very fault it
was there to catch. It now seeds `fluo.homeMapView` before load and FAILS if
the scene is not on screen: a check that goes blind rather than red is worse
than no check.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` step the road scan,
the night sweep and the landing scan use.

Run from the repo root:  python3 verify/verify152-map-fit.py
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

fail = []
embed_raw = open(os.path.join(ROOT, "src/app/map/embed/page.tsx"), encoding="utf-8").read()
# COMMENTS OUT FIRST. The docstring of that file explains at length why
# `.cahier-page` is the wrong class here, and the first version of this check
# matched its own explanation and failed a correct file.
embed = re.sub(r"/\*.*?\*/", "", embed_raw, flags=re.S)
embed = re.sub(r"^\s*//.*$", "", embed, flags=re.M)

# THE PAPER. Dan named this one, and it is a class list rather than a geometry,
# so it is the one thing here a grep guards better than a browser: a white
# frame over ruled paper photographs as "slightly different white".
if "cahier-foolscap" not in embed:
    fail.append("the framed map no longer paints the notebook's ruled paper — it renders "
                "over the browser's own white body, and the pale ruled page the notebook "
                "is drawing outside the frame stops at the frame's edge")
if "cahier-surface" not in embed or "fam-goals" not in embed:
    fail.append("the framed map has lost the family-tinted ground (`cahier-surface fam-goals`), "
                "so the paper inside the frame no longer matches the page around it")
if re.search(r"\bcahier-page\b", embed):
    fail.append("the framed map is using `.cahier-page` again. It paints the right paper and "
                "brings the notebook's FORM THEME with it — `.cahier-page input` sets "
                "padding .55rem/.75rem, font-size .95rem and width 100% — which is what blew "
                "the zoom well out to 63px and clipped its leading digit harder than before")

for m in fail:
    print(f"  FAIL {m}")
if fail:
    print(f"\n{len(fail)} failed")
    sys.exit(1)
print("  ok   the framed map paints the notebook's own ruled, tinted paper")

probe = os.path.join(ROOT, "out/map/embed.html")
if not os.path.isfile(probe):
    probe = os.path.join(ROOT, "out/map/embed/index.html")
if not os.path.isfile(probe):
    print("FAIL  out/ has no map embed — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/map-fit-scan.mjs"], cwd=ROOT).returncode)
