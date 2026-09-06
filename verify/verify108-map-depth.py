#!/usr/bin/env python3
"""
The map's stops are objects, they keep their numbers, and the embed is clean.

Dan, 6 Sep, after Malewicz on tactility: "make them really 3D stand out", then
"i do still want the number to remain on the buttons", then "I do want the
buttons to behave like they would really behave in the real world (springy
buttons that bounces back) and switches — pareil".

WHAT EACH ASSERTION IS FOR — every one of them is a fault that shipped, not a
hypothetical:

  1  NO DASHED STOPS. Forty of the fifty stops were a dashed ring on paper. A
     broken outline is a hole, not a thing, so the map's dominant impression
     was absence and nothing on it looked pressable. Reached stops now stand
     out (.fluo-stop--reached), stops ahead are sunk into the band
     (.fluo-stop--ahead), and depth carries progress.

  2  THE NUMBER SURVIVES BEING DONE. The glyph was `done ? "✓" : i + 1`, so a
     stop lost its number the moment it was finished — a learner looking for
     "stop 12" could not find it, and on a full map every number was gone.
     The ✓ is a badge now; the number is unconditional.

  3  THE SPRING IS TWO-SIDED. Pressing must be fast and dead (a bouncy press
     reads as an unsure button); releasing must overshoot. That means the rest
     state carries a cubic-bezier whose third control point is > 1, and
     :active overrides the duration downward. One curve for both directions
     is the fault this catches.

  4  REDUCED MOTION GETS NO TRAVEL. A spring IS motion; someone who asked for
     less of it should not get a shorter bounce.

  5  THE EMBED CARRIES NOTHING OF OURS. /map/embed is meant to be iframed into
     a course page. On its first render it dragged FluOLinGo's footer, feedback
     button and beta notice into the frame — another site's furniture inside
     someone else's page. The body hides everything but the <main>.

  6  THE EMBED IS THE SAME MAP. It mounts Map2DGrid rather than reimplementing
     the grid. Two copies of this repo's navigation drifted for eleven days in
     August; a second map would do it again.

Run from the repo root:  python3 verify/verify108-map-depth.py
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
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


grid = strip_comments(read("src/components/Map2DGrid.tsx"))
css = read("src/app/globals.css")

# --- 1 · stops are objects, raised or sunk, never a dashed hole -------------
# QUOTED, not bare: a bare substring test passed against `fluo-stop--ahead-X`,
# because the old name is still inside the new one. Its own break-test caught it.
# Quoted OR followed by a space: the reached branch now carries a second class
# ("fluo-stop--reached fluo-stop-num"), and requiring the closing quote failed
# on correct code. Matching name-then-boundary keeps the substring guard that
# the earlier break-test exposed without pinning what else rides along.
_cls = lambda n: re.search(r'"' + re.escape(n) + r'(?:[ "])', grid) is not None
check(_cls("fluo-stop--reached") and _cls("fluo-stop--ahead"),
      "a stop is raised when reached and sunk when still ahead",
      "Map2DGrid no longer uses .fluo-stop--reached / --ahead — the stops have "
      "gone back to being flat")
check("dashed" not in grid,
      "no stop is drawn as a dashed outline",
      "a stop is dashed again. A broken outline reads as a hole where an object "
      "should be, and forty of the fifty stops wore it")
for cls in (".fluo-stop--reached", ".fluo-stop--ahead", ".fluo-band"):
    check(cls in css, f"{cls} is defined", f"globals.css has lost {cls}")

# --- 2 · the number is unconditional ----------------------------------------
check('done ? "✓"' not in grid and "done ? '✓'" not in grid,
      "the number is not swapped out for a tick when a stop is done",
      'Map2DGrid is back to `done ? "✓" : i + 1`, so a finished stop loses its '
      "number — Dan asked for the number to remain on every button")
check(re.search(r"\{i \+ 1\}", grid) is not None,
      "every stop renders its number",
      "no `{i + 1}` in Map2DGrid — the stops have stopped being numbered")

# --- 3 · the spring is two-sided --------------------------------------------
rest = re.search(r"\.fluo-spring,\s*\.fluo-stop\s*\{(.*?)\}", css, flags=re.S)
press = re.search(r"\.fluo-spring:active,\s*\.fluo-stop:active\s*\{(.*?)\}", css, flags=re.S)
check(rest is not None and press is not None,
      "the stops declare a rest curve and a separate press curve",
      "the two-sided spring is gone from globals.css")
if rest and press:
    m = re.search(r"cubic-bezier\(\s*[\d.]+\s*,\s*([\d.]+)", rest.group(1))
    check(m is not None and float(m.group(1)) > 1.0,
          f"releasing overshoots (control point {m.group(1) if m else '?'} > 1)",
          "the rest curve does not overshoot, so the button slides back instead "
          "of springing — a spring that does not pass its target is a slide")
    rd = re.search(r"transition-duration:\s*\.?0?(\d+)s", press.group(1))
    check(rd is not None and int(rd.group(1)) <= 10,
          "pressing is short and hard, not bouncy",
          "the press is not overridden to a short duration; a bouncy press "
          "reads as a button that is unsure")

# --- 4 · reduced motion gets no travel --------------------------------------
# globals.css carries SEVERAL reduced-motion blocks (the bob, the wave, the
# credits). Matching the first one tested somebody else's rule and failed on
# code that was correct — so this looks for the block that names the stops.
blocks = re.findall(r"@media \(prefers-reduced-motion: reduce\)\s*\{(.*?)\n\}", css, flags=re.S)
mine = [b for b in blocks if ".fluo-stop" in b]
check(bool(mine) and any("transform: none" in b for b in mine),
      "reduced motion removes the stops' travel entirely",
      "prefers-reduced-motion does not zero the stops' transform — a spring IS "
      "motion, and a shorter bounce is not the accommodation")

# --- 5 + 6 · the embed ------------------------------------------------------
embed_dir = os.path.join(ROOT, "src", "app", "map", "embed")
check(os.path.isdir(embed_dir),
      "/map/embed exists — the map is reachable as a standalone URL",
      "src/app/map/embed is gone; the map can no longer be embedded")
if os.path.isdir(embed_dir):
    body = read("src/app/map/embed/EmbedBody.tsx")
    check("fluo-embed" in body,
          "the embed marks itself so the body can hide our own furniture",
          "EmbedBody has lost the .fluo-embed hook, so FluOLinGo's footer, "
          "feedback button and beta notice appear inside whoever iframes it")
    check("body:has(.fluo-embed)" in css,
          "the body hides everything but the map inside an embed",
          "globals.css no longer hides our chrome for .fluo-embed")
    check("Map2DGrid" in body,
          "the embed mounts the SAME grid the app mounts",
          "EmbedBody does not use Map2DGrid — a second copy of the map will "
          "drift from the first, which is what happened to the nav in August")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
