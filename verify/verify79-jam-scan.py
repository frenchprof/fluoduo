#!/usr/bin/env python3
"""verify79 — the jam scan, in CI at last (Dan, 1 Sep).

verify72 states its own limit in its docstring: the static shape catches the
newline case only, "only the rendered page knows", and all twelve of the
31 Aug jams were found by a browser scan that lived in one session's
scratchpad. Dan, 1 Sep: "The jam sweep should be in CI. It's the only
instrument that catches that class" — and its first committed run proved him
right immediately, finding THREE more already shipped on main, two of them
in French a learner reads aloud (« à lagare », « aumusée » in le-chemin, and
"whatyou" in transport). All three had a same-line space in the source that
the compiler dropped anyway.

So the scan is now scripts/jam-scan.mjs, and this check runs it. The scan
serves the static export, drives every lesson route at 390x844, clicks
through all four tabs and every Idea pane (conditional renders are not in
the DOM until clicked; closed <details> are, so they need no clicks), and
flags a letter butted against a letter across an inline element edge — with
the three narrowings that keep bolded conjugation endings, single-letter
highlights and apostrophe junctions out of the net (they are argued in the
scan's own header).

THE EXPORT MUST BE OPEN. The wall build renders "Checking your sign-in…"
where every lesson should be, and a scan of that would pass while guarding
nothing — so a closed or missing export FAILS here rather than skipping.
In verify.yml this runs LAST, after its own `NEXT_PUBLIC_OPEN_APP=1 npm run
build` step: the wall build earlier in the job is the one verify18/18b
audit, and it must not be replaced under them.
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/lessons/tu-vous.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no lesson pages — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
html = open(probe, encoding="utf-8").read()
if "Checking your sign-in" in html:
    print("FAIL  out/ is a WALL build — the lesson pages render the sign-in gate, so the")
    print("      scan would walk a login prompt and pass vacuously.")
    print("      Rebuild open first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

r = subprocess.run(["node", "scripts/jam-scan.mjs"])
sys.exit(r.returncode)
