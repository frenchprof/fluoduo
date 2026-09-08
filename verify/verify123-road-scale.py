#!/usr/bin/env python3
"""
The road is drawn in the units it will be painted in, not the ones it was
measured in.

Dan reported this fault THREE times. On 2 Sep: *"WHEN DRAGGING THE MAP THE
LINE JOINING UP THE STOPS GET DETACHED FROM THE STOPS"*. Then, narrowing it:
*"NOT A SCROLLER BUT PINCH GESTURE"*. Then on 7 Sep, after it had been
declared fixed: *"the pinching issue is not resolved: the stops get detached
from the route"*.

WHY IT SURVIVED A FIX. The first diagnosis was that a pinch changes the
VISUAL viewport without changing layout, so the ResizeObserver never fires and
the polyline keeps pre-pinch coordinates. That is a real browser behaviour and
it is true of a native two-finger pinch on a page — but it is not what this map
does. The map's pinch drives `zoomPct`, which becomes CSS `zoom` on an
ancestor, which DOES change layout. The observer fired every time. The road was
redrawn on every gesture, and redrawn wrong.

THE ACTUAL FAULT. `getBoundingClientRect()` reports the result of that CSS
zoom, but the <svg> holding the polyline sits inside the same zoomed subtree,
so its own coordinate system is in UNZOOMED units — the browser scales the
finished drawing. Feeding zoomed offsets into it stretches the road by exactly
the zoom factor, anchored at the top left, so the gap grows with every stop
along the route.

MEASURED, across all fifty stops — the worst distance between a stop and its
own vertex on the road:

                 before      after
     zoom  60%      38px       0px
     zoom 100%       0px       1px
     zoom 150%     412px       2px
     zoom 200%    1062px       0px

And the proof that the trigger was never the gesture: type 150 into the zoom
field, touch nothing, and it detaches identically. That is how this was
reproduced on a machine with no touchscreen.

WHAT EACH ASSERTION IS FOR:

  1  THE MEASUREMENT IS DIVIDED BY THE ZOOM IN FORCE. The one line that fixes
     it. Without it the road is stretched at any zoom but 100%.

  2  THE ZOOM IS DERIVED, NOT PASSED IN. `offsetWidth` is the same box in
     unzoomed layout pixels, so the ratio to its client rect IS whatever zoom
     is in force — no matter which ancestor set it, or how many did. A version
     that took `zoomPct` as a prop would be right on /map and silently wrong
     anywhere else the grid is mounted, and it would have to be threaded
     through every caller.

  3  BOTH AXES ARE CORRECTED. Dividing x and forgetting y is the obvious
     half-fix, and on a grid that snakes it looks nearly right for the first
     row.

  4  THE ZOOM CONTROL STILL USES CSS `zoom`. This check's arithmetic assumes
     it. If the map ever moves to `transform: scale`, `offsetWidth` stops
     tracking it the same way and this needs rethinking rather than silently
     drifting.

  5  THE WRONG DIAGNOSIS IS NOT LEFT LYING AROUND. The visualViewport comment
     described a cause that was not the cause, and it is why the same fault
     was reported twice. The correction has to stay next to it.

Run from the repo root:  python3 verify/verify123-road-scale.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


grid_raw = read("src/components/Map2DGrid.tsx")
grid = strip_comments(grid_raw)
body = strip_comments(read("src/app/map/MapBody.tsx"))

# 1 + 2 ── the scale is derived from the box itself and applied.
# HOW the zoom is read is not the point; that it IS read and divided out is.
# This pinned one spelling — `b.width / box.offsetWidth` — and main landed a
# better one that asks the browser directly (`currentCSSZoom`, Chrome 128+)
# and keeps the width ratio as the fallback for older engines. A check that
# fails a strictly better fix is a check that fights its own purpose. So it
# accepts either source, and still insists the result is APPLIED to every
# measured point (assertion 3 below), which is where the bug actually lived.
scale = re.search(r"currentCSSZoom", grid) or re.search(
    r"b\.width / box\.offsetWidth", grid)
check(scale is not None,
      "the zoom in force is read from the box and divided out",
      "the road no longer divides out the zoom. `getBoundingClientRect` "
      "reports zoomed pixels and the <svg> is in unzoomed ones, so the road is "
      "stretched by the zoom factor — measured at 200%, the worst stop sat "
      "1062px from its own point on the road")

# 3 ── both axes.
pts = re.search(r"pts\.push\(\{(.*?)\}\);", grid, flags=re.S)
xy = pts.group(1) if pts else ""
check(xy.count("/ scale") == 2 and re.search(r"x:.*?/ scale", xy, flags=re.S)
      and re.search(r"y:.*?/ scale", xy, flags=re.S),
      "both axes are divided by the zoom",
      "only one axis is corrected — on a grid that snakes, dividing x alone "
      "looks nearly right along the first row and wrong everywhere after it")

# 4 ── the arithmetic above assumes CSS zoom, so pin that.
check(re.search(r"zoom: zoomPct / 100", body) is not None,
      "the map still scales with CSS `zoom`, which is what this arithmetic assumes",
      "the map has moved off CSS `zoom` (to `transform: scale`, most likely). "
      "`offsetWidth` no longer tracks the scale the same way, so the road's "
      "correction needs rethinking rather than being left to drift")

# 5 ── the wrong diagnosis is corrected in place, not silently deleted.
check("A CORRECTION FOR THE NEXT READER" in grid_raw
      and "visualViewport" in grid_raw,
      "the earlier, wrong diagnosis is corrected where it was written",
      "the note explaining that the visualViewport theory was NOT the cause "
      "has gone. That theory is plausible, it is written up convincingly, and "
      "it cost Dan two rounds of reporting the same fault — the next reader "
      "needs to find the correction attached to it")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
