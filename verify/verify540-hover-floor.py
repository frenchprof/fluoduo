#!/usr/bin/env python3
"""Every control answers the pointer — measured in a browser, not grepped.

Dan, 2026-09-13: *"The mouseover effects are not everywhere. are they. they
should be"*. It was the third time he had asked. On 12 Sep: *"those hero buttons
have a mouseover behaviours though that we want to replicate throughout the
site"*, and then *"even for depressed spaces (e.g. buttons in the depressed
states) there needs to be some mouseover effect and activating effect"*.

WHY A GREP WOULD HAVE SAID YES. globals.css holds thirty-two `:hover` rules
covering .cahier-btn, .neo-key, .neo-well, .fluo-tile-key, .conjuga-tts, the
map's cap and more. Reading the file, the app looks covered. Driving it,
**122 of 264 controls changed nothing at all**: the profile's fifty heat-map
cells, the deck table's row tick boxes and its Reviewed switch, and every plain
text link — « about », « MAP », « EXPORT », the FluOLinGo wordmark on the site
bar. None of them matched any of the thirty-two rules, and no amount of reading
CSS says which rule wins on a given element.

WHAT THE SCAN DOES DIFFERENTLY FROM A MOUSE. The first version moved a real
pointer to each control's centre and reported 377 of 541 dead. That was wrong,
and wrong in the direction that invents work: hovering the centre of a control
that sits under something else lands on the cover. `scripts/hover-scan.mjs`
forces :hover through the browser's own engine (CDP `CSS.forcePseudoState`), so
occlusion, scroll and z-order cannot change the answer. It also reads each
control twice at rest and sets aside the ones that move by themselves —
`.fluo-edge-beat` pulses on a 4s loop and was scoring the pointer for its own
animation.

WHAT IS PINNED

  1  ZERO dead controls across sixteen routes. Not a ratchet: the app is at
     zero today, and a ratchet would let the next one through.
  2  A FLOOR ON THE CENSUS. If the scan finds fewer than 150 controls it fails
     rather than passing, because a wall build or a route that stopped
     rendering would otherwise report "all clear" over an empty page — the
     mistake verify79 and verify126 both record.

THE EXPORT MUST BE OPEN, for that same reason: a sign-in-walled build renders
the stub where the activity should be, and its controls are not the app's.

Numbered 540 and not 530: the frontier was at 520 and a number next to it gets
claimed again while CI runs (AGENTS.md, 7 Sep).

Run from the repo root:  python3 verify/verify540-hover-floor.py
"""
import os
import subprocess
import sys

if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

probe = "out/decks/salutations.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no /decks/salutations — build first: "
          "NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/hover-scan.mjs"]).returncode)
