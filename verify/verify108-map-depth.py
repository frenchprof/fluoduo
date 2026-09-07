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

# --- 7 · THE 3D MAP'S BUTTONS ARE THE SAME BUTTONS -------------------------
# Dan, 7 Sep: "why are the 3D buttons not on the 3D map?", then "just the
# buttons, not the map" and "i just need visual unity for the buttons".
#
# The tactile pass gave the 2D grid a rule — the pen at full strength when a
# stop is reached, the pen's own WASH when it is still ahead, the pen as the
# ring on both, a white numeral on the pen and page ink on the wash — and the
# 3D map kept its own older answer: a local 55%-with-paper mix for the face
# (a different pale from the 2D one, and a different amount of different per
# hue), a near-black ring, and a white numeral on BOTH, which on a pale face
# all but vanished.
#
# The scene is deliberately NOT asserted here. Dan asked for the buttons and
# not the map, so the road, the pad, the skirt, the camera and the props are
# none of this check's business; widening it into "the 3D map looks like X"
# would be re-deciding something he settled.
three = strip_comments(read("src/components/HomeMap3D.tsx"))

check("KIND_WASH" in three,
      "the 3D face uses the pen's own wash, the same token the 2D grid uses",
      "HomeMap3D no longer uses KIND_WASH — its pale shade has drifted back "
      "to a local mix, so the same stop is two different pales in two views")
check(re.search(r"const\s+reached\s*=\s*done\s*\|\|\s*active", three),
      "the 3D map names 'reached' once and drives face, ring and numeral off it",
      "HomeMap3D has lost its single `reached` test — face, numeral and depth "
      "can now disagree about whether a stop is done")
check(re.search(r"const\s+face\s*=\s*reached\s*\?\s*colour\s*:\s*KIND_WASH\[kind\]", three),
      "reached wears the pen, ahead wears its wash — the 2D rule exactly",
      "the 3D face no longer follows reached->pen / ahead->wash")
check(re.search(r"const\s+rim\s*=\s*colour\s*;", three),
      "the ring is the pen, not a near-black mix",
      "the 3D ring is not the pen — a dark ring is what made these read as "
      "badges rather than as the map's buttons")

# The numeral is the one that a screenshot of a REACHED stop hides: white on a
# pen looks right, and the same white on a wash is the bug. Both branches are
# asserted, so neither can be dropped quietly.
num = re.search(r"style=\{reached\s*\?([\s\S]{0,400}?)\}\}", three)
check(num is not None and "PAPER" in num.group(1),
      "a reached stop's numeral is paper white",
      "the reached numeral is no longer white")
check(num is not None and "--cahier-ink" in three.split("style={reached")[1][:600],
      "an ahead stop's numeral is page ink, not white on a pale wash",
      "the ahead numeral is not page ink — white on the wash is the fault this "
      "was fixed for")

# And they SPRING, like every other key in the app.
check("fluo-spring" in three,
      "the 3D stops carry the spring the 2D stops and .neo-key carry",
      "the 3D stops do not spring — they are drawn as objects and do not "
      "behave as them, which is the whole point of the tactile pass")

# --- 8 · HOVER, AND WHO IS ALLOWED TO HAVE IT ------------------------------
# Dan, 7 Sep: "could those buttons react to user mouseover?" The 2D stops
# already lifted; the 3D ones did not, because they were given `.fluo-spring`,
# which carries the PRESS and not the lift.
#
# THE GUARD IS THE POINT, more than the lift. On a touchscreen :hover is
# applied on TAP and stays applied until something else is tapped — so an
# unguarded lift leaves the last stop a learner opened sitting proud of its
# neighbours for the rest of the session, which on this map reads as "you are
# here". `(hover: hover) and (pointer: fine)` is the pair that means a real
# pointing device; verified in a real browser, a phone context matches
# neither.
hover_blocks = [b for b in re.findall(r"@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}", css)
                if "hover: hover" in b.split("{")[0]]
check(bool(hover_blocks),
      "hover is guarded by (hover: hover) — a tap on a phone cannot leave a "
      "stop stuck in the hovered state",
      "no (hover: hover) guard: on a touchscreen the last stop tapped stays "
      "lifted, which on this map reads as the current stop")
guarded = " ".join(hover_blocks)
check(".fluo-stop:hover" in guarded,
      "the 2D stop's lift lives inside the guard",
      "the 2D stop's :hover lift is outside the pointer guard")
check("home-map3d-node:hover" in guarded,
      "the 3D stop's lift lives inside the guard too",
      "the 3D stop has no guarded :hover — it does not answer the mouse, or "
      "it answers a phone's tap as well")

# The travel is the NODE'S OWN, handed in per node: everything in a
# perspective scene is scaled by the camera, so one constant is a nudge on a
# near stop and a leap on a far one.
check("--n-lift" in css and "--n-lift" in three,
      "the 3D lift is scaled per node, not a constant",
      "the 3D lift is a fixed distance — a far stop will leap and a near one "
      "will barely move")
check(re.search(r"prefers-reduced-motion[\s\S]{0,900}?home-map3d-face", css),
      "reduced motion zeroes the 3D lift as well as the 2D one",
      "prefers-reduced-motion does not zero the 3D face's travel")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
