#!/usr/bin/env python3
"""verify800 — the hand-hold points at something that is on the screen.

Dan, 2026-09-13: *"The WorDrill and MemoiRecall problem is not solved. I see
Step 1 asking to choose how ong a run but the guide isn't pointing to how or
where it can be done"*.

He was reading a true sentence about a different deck. Both rows open on

    1. First, choose how long a run you want.

and on a long deck that is right — « How many words? » IS the first thing on
screen and the mic does not exist until it is answered. But
`sessionLength.offer()` returns null at 14 items or fewer, so a short deck
never asks; it just starts. Driven across every exported route on the built
app, before the fix:

    chooser on screen   29 routes     step 1 lights the buttons        ✓
    chooser absent      21 routes     step 1 lights NOTHING, forever   ✗

and on those 21 the walk sat on « Finding it… » under a card that had just
promised the step. `GuidedStep.optional` is what tells waiting-for-a-control-
that-is-coming (MémoiRecall's ✓/↺ row, born of the flip) apart from waiting
for one that never will.

WHY THIS IS DRIVEN AND NOT GREPPED, which is the whole reason it exists. The
selector was CORRECT the entire time. `[data-tour="how-many"]` is exactly the
right hook and `HowManyQuestions` carries it; no static reading of hints.ts,
of the component, or of both together can tell you that on this deck the
component is never rendered. Only the deck knows, and only a browser can ask
it. Same lesson as verify540's hover floor and verify220's tour: a rule about
what the app DOES is measured in the app.

AND IT BREAK-TESTS THE MIRROR FAULT, because the first fix shipped it. The
prune was measured once on arrival — but a drill's queue is `useState([])`
filled by a mount shuffle, so on the FIRST commit there is no deck and no
chooser on ANY route. Every card lost the step, and the long decks then showed
« Step 1 of 1 · Tap the mic · Finding it… » over a « How many words? » that
had arrived a tick later. Clause 2 below is that fault: a route where the
chooser IS on screen must still list and walk it.

What it asserts, per route, over every exported WorDrill and MémoiRecall deck:

 1 · No card lists a step whose control is not on the screen.
 2 · A route that HAS the chooser still lists it and walks two steps — the
     prune may not become a deletion.
 3 · No walk is left saying « Finding it… » after a second and a half.
 4 · At least 40 cards were seen at all, so a wall build, a broken route or a
     signed-out export cannot report "all clear" over an empty scan.

THE EXPORT MUST BE OPEN. In verify.yml this runs after the same
`NEXT_PUBLIC_OPEN_APP=1 npm run build` the other driven scans use — signed
out, the auth wall stands where the drill should be and every route would
report no card at all, which clause 4 catches.

Run from the repo root:  python3 verify/verify800-handhold-points.py
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)
if not os.path.isdir(os.path.join(ROOT, "out")):
    print("no out/ — run `NEXT_PUBLIC_OPEN_APP=1 npm run build` first"); sys.exit(2)

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


proc = subprocess.run(
    ["node", os.path.join("scripts", "handhold-scan.mjs")],
    cwd=ROOT, capture_output=True, text=True, timeout=1500,
)
if proc.returncode != 0:
    print("the scan did not run:\n" + (proc.stderr or "")[-2000:]); sys.exit(2)
report = json.loads(proc.stdout)["report"]

# The step whose control is conditional, and the only one in the app today.
# Named rather than inferred: a second conditional step must be added here on
# purpose, the way verify105 and verify760 name their surfaces one by one.
CHOOSER = "choose how long a run"

errors = [r for r in report if r.get("error")]
ok(not errors,
   f"{len(report)} routes driven, none errored",
   "routes that would not load: " + ", ".join(f"{r['route']} ({r['error']})" for r in errors[:5]))

# ── 1 · nothing is listed that is not there ─────────────────────────────────
dead = [r for r in report
        if any(CHOOSER in s for s in r.get("listed", [])) and not r.get("chooser")]
ok(not dead,
   f"no card lists « {CHOOSER} … » on a deck that never asks it",
   f"{len(dead)} cards promise a step with no control on the screen — the walk "
   f"will sit on « Finding it… ». First few: " + ", ".join(r["route"] for r in dead[:6]))

# ── 2 · and nothing is dropped that IS there ────────────────────────────────
have = [r for r in report if r.get("chooser")]
lost = [r for r in have if not any(CHOOSER in s for s in r.get("listed", []))]
ok(have and not lost,
   f"{len(have)} routes DO ask the length, and every one still lists it",
   f"{len(lost)} routes show « How many …? » and no longer mention it — the "
   f"prune has become a deletion (the mount-shuffle trap, see the docstring). "
   f"First few: " + ", ".join(r["route"] for r in lost[:6])
   if lost else "no route asks the length at all — the scan found nothing to test")

short_walk = [r for r in have if (r.get("walk") or {}).get("of", 0) < 2]
ok(not short_walk,
   f"each of those walks {len(have) and (have[0].get('walk') or {}).get('of', 0)} steps, the chooser first",
   f"{len(short_walk)} routes with the chooser on screen walk fewer than two "
   f"steps: " + ", ".join(r["route"] for r in short_walk[:6]))

# ── 3 · no walk is left hunting ─────────────────────────────────────────────
hunting = [r for r in report if (r.get("walk") or {}).get("finding")]
ok(not hunting,
   "no walk is still saying « Finding it… » after 1.5s",
   f"{len(hunting)} walks are hunting for a control that is not there: "
   + ", ".join(r["route"] for r in hunting[:6]))

# ── 4 · the scan actually saw the app ───────────────────────────────────────
ok(len(report) >= 40,
   f"{len(report)} first-run cards seen — the scan reached the real drills",
   f"only {len(report)} cards seen. A signed-out export, a wall build or a "
   f"route that stopped rendering reports 'all clear' over an empty page, "
   f"which is the failure this floor exists to refuse.")

print(__doc__.splitlines()[0])
print("-" * 66)
for p in PASS:
    print(f"  ok    {p}")
for f in FAIL:
    print(f"  FAIL  {f}")
print("-" * 66)
if FAIL:
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print(f"  all {len(PASS)} checks passed")
