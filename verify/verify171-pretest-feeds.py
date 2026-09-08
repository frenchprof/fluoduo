#!/usr/bin/env python3
"""verify171 — no pre-test stacks its questions down one page.

Dan, 2026-09-08, on the last of three flagged items: a moved pre-test gives
each question the whole screen, but **Unit 0 stacks every question down one
long page — and it is a beginner's first contact with the app**; the picture
runner *"mostly has nothing to run"*.

Both were measured on the built export rather than assumed:

    /pretests/unit0/SIO-001      document 2602px on an 844px phone
    /pretests/picture/*          32 of the 50 pages said "No picture pretest
                                 available" and nothing else
    nothing under src/ linked to either                (they were orphans)

Both addresses now forward to the goal's merged SpecuLearn, which serves the
same questions one per screen. Nothing is lost in the forward: `speculearnPool`
drops only `multi` questions, and Unit 0 has none left — Dan rewrote SIO-010's
three himself the same day.

WHY THIS IS DRIVEN. The forward is a client-side `location.replace`, so where a
learner actually LANDS, and what shape that page is, exist in no file. A static
check could pin the word `Forward` in two pages and pass while the run it
forwards to had gone back to one long page — which is the fault itself. Two
goal pages ride along as the control, so this goes red if the merged run ever
stops being a feed.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` step the road scan
and the strip scan use.
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/pretests/unit0/SIO-001.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no Unit-0 pre-test page — build first: "
          "NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/pretest-scan.mjs"]).returncode)
