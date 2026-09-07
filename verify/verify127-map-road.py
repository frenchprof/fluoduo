#!/usr/bin/env python3
"""verify127 — the map's road lands on its stops, at every zoom.

Dan reported this fault TWICE on 2026-09-07, which is why it now has a check.

  First:  *"WHEN DRAGGING THE MAP THE LINE JOINING UP THE STOPS GET DETACHED
          FROM THE STOPS"*, then *"NOT A SCROLLER BUT PINCH GESTURE"*.
  Fixed by listening to `visualViewport`, the BROWSER's pinch.
  Then:   shown Home's postcard — *"The pinching issue is not solved right?"*

It was not, and the first fix had addressed a case that was never broken. The
browser's own pinch scales the road and the stops together; what breaks them
apart is a CSS `zoom` in the page, because the road is MEASURED with
`getBoundingClientRect` (POST-zoom CSS pixels) and drawn as SVG `points`
(PRE-zoom user units). Under `zoom: z` the road paints at `z x` the stop
positions, compressed toward the top-left corner. Measured on the built export,
Home's postcard at 0.44:

    stop 5's centre        x = 247
    polyline point 4       x = 247      (the same number)
    where it PAINTS        x = 109      (247 x 0.44)

THREE SURFACES CARRY A ZOOM, so "it works on /map" proved nothing: Home's
postcard (`zoom: 0.44`), /map's own - / + control (`zoom: zoomPct/100`), and
/map's pinch, which drives that same number.

WHY THIS IS A BROWSER SCAN. A static check can pin the division in
Map2DGrid — and could be defeated by any new wrapper that introduces a zoom.
More to the point, the obvious runtime check is also wrong: comparing the
polyline's STORED numbers against the stops' measured centres makes a broken
road look perfect, because both read 247. Only the painted position tells the
truth, so this transforms each point through the SVG's own screen matrix
(`getScreenCTM`) and compares it with where the stop actually paints — one
space, no room for the two to agree by coincidence.

Sampled at stops 1, 5, 10 and 20: a scale fault grows with distance from the
origin, so stop 1 alone passes a road that is wrong everywhere else.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` step the jam scan
and the strip scan use.
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/map.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no map page — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/road-scan.mjs"]).returncode)
