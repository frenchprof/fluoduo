#!/usr/bin/env python3
"""verify230 — one sheet of paper per page, and the coils run up to the band.

Dan, 2026-09-11, sent Profile and ChaTutor: *"Profiles, ChaTutor page looks
doubleframed"*. Then, shown a game's top-left corner: *"coils up to the band
and also the corresponding vertical strip"*. Two faults in the same corner.

THE DOUBLE SHEET. A station runs inside the cahier in an iframe (Dan, 7 Sep).
`/profil/embed` and `/tutor/embed` each rendered a `CahierShell` — the notebook
— while already loaded INSIDE one. `html[data-embed]` hides the shell's
furniture in a framed document, and that was taken for "nothing is left"; what
was left is the paper itself and two rulings, so a second sheet sat on the
page's own, inset 48px, with its lines out of step. Measured at 390px, some
ruled lines stopped dead at the frame's edge.

THE STEPPED EDGE. The binding opened BELOW the band, so a page's left edge was
a 6px family spine beside the bar and the band and a 30px coil strip under it.

WHY A BROWSER SCAN. Both facts are about two boxes on a rendered page and
survive any amount of correct-looking markup. A grep for `import CahierShell`
flags the fifteen framed stations that legitimately draw their page's only
sheet and would miss a station that grew the fault without importing anything —
any opaque full-height root does it. The coil fault is geometric outright.

IT IS A LIST, NOT A SWEEP. Dan asked for Profile and ChaTutor. The other framed
stations still draw their own sheet and were left alone on purpose — widening
is his call. Adding a route is one line in ONE_SHEET.

THE EXPORT MUST BE OPEN, for the reason verify79 and verify126 both state: a
wall build renders the sign-in stub where the activity should be, and a scan of
that would pass while guarding nothing.

Numbered 230 and not 141: 121-127, 140, 150-153, 170-173, 190, 195 and 210-211
are claimed across branches, and a number next to the frontier gets claimed
again while CI runs (AGENTS.md, 7 Sep).
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/profil.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no /profil — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/sheet-scan.mjs"]).returncode)
