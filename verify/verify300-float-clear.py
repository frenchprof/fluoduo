#!/usr/bin/env python3
"""verify300 — the floating 🐞 never rests on a control a learner must press.

Dan, 2026-09-12, shown ConjugaZone on a phone: *"fix the ladybird one"*. On
arrival, at two phone sizes, the bug-report button sat on top of things that
have no second copy:

    iPhone SE   over the 🔊 on être's « ils » row
    iPhone 14   over the right third of « Check avoir »

Dragging the floats (Dan, 2026-07-26: *"make the floating buttons movable, they
are blocking the way"*) answers this once the learner has noticed. It cannot
answer the first screenful, which is the one that decides whether they find the
button at all — so `useDragFloat` now measures what is underneath and steps
just clear of it, and this is what keeps that true.

WHY A BROWSER. The fact is geometry between two boxes that never meet in any
one file — and one of them is in a DIFFERENT DOCUMENT. Every station runs in
the cahier in an iframe (Dan, 7 Sep) and the float is rendered by the ROOT
layout, so the collision is the host's fixed button against a frame's control,
and the frame's rect has to be translated before the two can be compared at
all. No grep reaches that, and neither does a check that reads one document.

THAT IS ALSO HOW THE FIRST FIX PASSED WHILE FIXING NOTHING. It called
`document.querySelectorAll` on the host, found a near-empty page, declared
itself clear, and went on covering « Check avoir » by 779px². Scanning
`/conjugaison/embed` directly would have agreed — loaded on its own, that
document has its own controls beside the button. Only the HOST route asks the
real question, which is why scripts/float-scan.mjs scans host routes only.

TWO RULES, and the second is the general one. On the named routes the float
must land CLEAR. On every route it must be clear OR on its anchor — never
stranded between the two. An early cut climbed 208px up VocabulaRain and was
still covering three tiles, which is worse than resting in the corner where a
learner can scroll past it or drag it away. VocabulaRain and LexicaLocker are
listed as DENSE with their reason (unit flaps edge to edge over a 10px-gap
grid: no 44px band exists in that column at any scroll position), not dropped.

THE EXPORT MUST BE OPEN, for the reason verify79, verify126 and verify230 all
give: a wall build renders the sign-in stub where the station should be, and a
scan of that passes while guarding nothing.

Numbered 300, well clear of the 210-270 band that is claimed across branches —
a number next to the frontier gets claimed again while CI runs (AGENTS.md,
2026-09-07).

Run from the repo root:  python3 verify/verify300-float-clear.py
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/conjugaison.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no /conjugaison — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/float-scan.mjs"]).returncode)
