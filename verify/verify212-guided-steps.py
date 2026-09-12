#!/usr/bin/env python3
"""verify212 — a guided step points at something that exists.

Dan, 2026-09-11: *"For each of the activity, can we take users on a
step-by-step what needs to be done before they are left on their own? We need
to hold their hand and guide them towards completing the task at the first
isntance."*

A step in `content/hints.ts` may carry a `selector`. When it does, the first
run lights that control, says the line beside it, and waits for the learner to
really use it. The words were already there since 2 Sep; the selector is what
moves them from a card onto the screen.

WHAT GOES WRONG, AND WHY NOTHING REPORTS IT. A selector is a string in a
content file and a `data-tour` attribute in a component, and nothing joins
them. Rename the attribute, move the markup, drop the wrapper in a tidy-up —
every file still compiles, every test still passes, and the guide points at
nothing. The learner does not get an error: they get a step that sits there
saying "Finding it…" on the one run that was supposed to teach them the
activity. That is the worst place in the app for a silent failure.

So every `data-tour="…"` a hint names must exist somewhere under `src/`.

WHAT THIS DOES NOT CHECK, on purpose: that the selector matches at the MOMENT
the step runs. A step's control is usually born of the previous step —
MémoiRecall's ✓ / ↺ do not exist until the card is turned over — so "is it in
the DOM right now" is the wrong question, and GuidedSteps waits rather than
failing. Only a driven run can answer the timing, and this cannot stand in for
driving a new activity before authoring its steps.

Break-tested: renaming `data-tour="flip-card"` in FlipItContent.tsx goes red
naming the hint row, the step and the attribute it cannot find.

Run from the repo root:  python3 verify/verify212-guided-steps.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

hints = open(os.path.join(ROOT, "src/content/hints.ts"), encoding="utf-8").read()

# Every selector a step names, with the row it belongs to, so a failure says
# which activity's guide is broken rather than just which string is missing.
rows = re.findall(r"^  (\w+):\s*\{(.*?)^  \},", hints, flags=re.S | re.M)
named = []
for key, body in rows:
    for sel in re.findall(r"selector:\s*'([^']+)'", body):
        named.append((key, sel))

# Every anchor the app actually offers — and NOT the file that names them.
#
# The first version of this check scanned all of src/ for `data-tour="…"`, and
# hints.ts lives under src/: the selector string satisfied itself, so renaming
# the real attribute in FlipItContent.tsx left the check green. It passed its
# own break test, which is the only reason it was caught. A check that reads
# its own question as an answer is worse than no check — it reports safety.
HINTS = "src/content/hints.ts"
present = set()
for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, "src")):
    dirnames[:] = [d for d in dirnames if d not in {"node_modules", ".next"}]
    for name in filenames:
        if not name.endswith((".ts", ".tsx")):
            continue
        full = os.path.join(dirpath, name)
        if os.path.relpath(full, ROOT).replace(os.sep, "/") == HINTS:
            continue
        # BOTH FORMS OF THE ANCHOR. An attribute may be conditional — Home's map
        # gives `data-tour="map-stop"` to the CURRENT stop only, written
        # `data-tour={active ? "map-stop" : undefined}` — and a search for the
        # literal reports a hook that renders perfectly as missing. verify44 hit
        # this first; the same blindness was here.
        text = open(full, encoding="utf-8").read()
        present.update(re.findall(r'data-tour="([^"]+)"', text))
        for expr in re.findall(r"data-tour=\{([^}]*)\}", text):
            present.update(re.findall(r"""['"]([^'"]+)['"]""", expr))

# A STEP MAY NAME MORE THAN ONE ANCHOR, and every one of them is checked.
#
# GramMarathon types above `sm` and offers word-bank tiles below it, so its
# step reads `[data-tour="gap-input"], [data-tour="gap-bank"]` and GuidedSteps
# lights whichever is visible. The first version of this loop matched the whole
# selector against ONE anchor pattern, so a comma made it fall through to the
# "not a data-tour anchor" note — and the run then still printed "every one
# points at a data-tour anchor that exists", about a step it had not looked at.
# Renaming either half left it green. Splitting on the comma is the fix; the
# lesson is that the skip path must never reach the all-clear.
missing = []
checked = 0
for key, sel in named:
    parts = [p.strip() for p in sel.split(",")]
    anchors = [re.fullmatch(r'\[data-tour="([^"]+)"\]', p) for p in parts]
    if not all(anchors):
        # A selector that is not a data-tour anchor is allowed, but it is a
        # class or a tag and those move without anyone noticing. Say so.
        print(f"  note {key}: '{sel}' is not a data-tour anchor — it will break "
              "silently the next time that markup is tidied")
        continue
    checked += 1
    for m in anchors:
        if m.group(1) not in present:
            missing.append(f"{key}: step points at [data-tour=\"{m.group(1)}\"], which exists nowhere under src/")

if missing:
    print(f"  FAIL {len(missing)} guided step(s) point at nothing:\n")
    for m in missing:
        print(f"       {m}")
    print("\n  The guide will not error. It will sit on that step saying \"Finding it…\"")
    print("  during the one run that was meant to teach the activity.")
    sys.exit(1)

if not named:
    print("  ok   no activity carries guided steps yet — nothing to point at")
else:
    keys = sorted({k for k, _ in named})
    print(f"  ok   {len(named)} guided step(s) across {len(keys)} activity(ies): {', '.join(keys)}")
    # The count is of what was CHECKED, never of what was found. A step that
    # took the note path above is not covered by this line, and saying so is
    # the difference between a report and a reassurance.
    print(f"  ok   {checked} of them name data-tour anchors, and every one of those exists")
print("\nverify212: no guided step points at nothing.")
