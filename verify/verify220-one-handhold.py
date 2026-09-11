#!/usr/bin/env python3
"""verify220 — one hand-hold at a time, and a tour that still points at something.

Dan, 2026-09-11, shown the five activities that are not yet walked through:
looking at MneMemo he found TWO offers of help on screen at once — the
activity's own instruction card (« Pick a level, then answer ») and the page
tour's sheet (« ✨ First time here? Quick tour! »). A learner opening a screen
for the first time was asked twice, by two different systems.

AND THE SECOND ONE WAS BROKEN. Driven on the built app the same day:

    [data-tour="entry"] in the document the lesson tour searches:   0
    [data-tour="entry"] in the document it actually lives in:       1

On 7 Sep the lesson moved into a frame — `/lessons/deck/<id>` became
CahierShell + EmbedFrame, and LessonPager went to `/lessons/deck/<id>/embed`.
FirstTour runs in the OUTER document and measures with `querySelectorAll`, so
from that day both of its spotlights skipped and « Quick tour! » opened on
3/3: one sentence in a box, over the top of the activity's card. Nothing
errored. Nothing logged. The selectors were still correct — just in another
document.

THAT IS THE THIRD TOUR IN FirstTour.tsx TO ROT THE SAME WAY (the index tour
pointed at a deleted page; the lesson tour before this one pointed at a screen
patch 22 removed). Each was found by a person eventually noticing. This is the
check that stops the fourth needing one.

WHY IT MUST BE DRIVEN. A skipped step is FirstTour working as designed — a
conditional target that is absent is meant to be stepped over. Only the running
page can tell you that EVERY step skipped, and only a real browser can tell you
that two prompts drawn by two components in two documents share one screen.
grep cannot see either.

Break-tested three ways: restoring the retired `/lessons/` tour branch goes red
naming both faults at once (two prompts, and a tour opening on its last step);
pointing the home tour's first selector at a name nothing uses goes red on the
step counter; and removing the `lesson` row from content/hints.ts leaves the
route with no hand-hold at all, which the companion verify212 covers.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` the other driven
scans use — signed out, the auth wall stands where the activity should be and
every assertion here would pass by finding nothing.

Run from the repo root:  python3 verify/verify220-one-handhold.py
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

fail = []

tour = open(os.path.join(ROOT, "src/components/FirstTour.tsx"), encoding="utf-8").read()
# Comments explaining the rule must not satisfy the rule — the trap verify152
# and verify153 each hit on their first run, and verify211 records.
code = re.sub(r"/\*[\s\S]*?\*/", "", tour)
code = re.sub(r"(?m)^\s*//.*$", "", code)

if re.search(r"/\^\\/lessons", code):
    fail.append("FirstTour still branches on /lessons/. That tour was retired on 2026-09-11: "
                "it runs outside the lesson's frame and cannot see either of its own targets, "
                "so it opens on its last step over the top of the activity's instruction card")

hints = open(os.path.join(ROOT, "src/content/hints.ts"), encoding="utf-8").read()
if 'selector: \'[data-tour="lesson-tabs"]\'' not in hints:
    fail.append("the `lesson` row no longer walks the tab strip. Retiring the page tour moved "
                "that teaching HERE, inside the frame where the anchor is — dropping it leaves "
                "the one thing on that screen a learner cannot work out by looking (four tabs, "
                "and only one of them is where you answer) said nowhere at all")

tabs = open(os.path.join(ROOT, "src/app/lessons/pager/LessonTabs.tsx"), encoding="utf-8").read()
if 'data-tour="lesson-tabs"' not in tabs:
    fail.append("LessonTabs has no `lesson-tabs` anchor — the walk above points at nothing")

for m in fail:
    print(f"  FAIL {m}")
if fail:
    print(f"\n{len(fail)} failed")
    sys.exit(1)
print("  ok   the lesson page tour is retired, and its teaching moved inside the frame")

probe = os.path.join(ROOT, "out/lessons/deck/aliments.html")
if not os.path.isfile(probe):
    probe = os.path.join(ROOT, "out/lessons/deck/aliments/index.html")
if not os.path.isfile(probe):
    print("FAIL  out/ has no /lessons/deck — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/tour-scan.mjs"], cwd=ROOT).returncode)
