#!/usr/bin/env python3
"""
The instructions a learner is HANDED stay short enough to be read.

Dan, 5 Sep 2026: *"UI 101 says we don't want to overwhelm users with too much
texts to read. it has be clear yet concise and scannable. redundant sentences
or words should go in the explanations (not referring to the target language of
course)."*

WHAT THIS COVERS, and what it deliberately does not. Two surfaces put English
in front of a learner UNBIDDEN — the first-run popup that opens over an
activity, and the guided tour's callouts. Nobody asks for either; they arrive.
Prose someone chose to open — the ⋯ → Help sheet, /guide, /about and its
citations — is not budgeted here, and neither is anything French: the target
language is the content, not the chrome.

THE BUDGETS, and the reasoning for each number rather than the number itself:

  · a hint TITLE  <= 5 words   it names the action; the band above already
                               names the activity
  · a hint STEP   <= 16 words  one instruction, one line, no second clause
  · steps per hint <= 3        "if it needs four, the screen is the problem"
                               was already the rule in hints.ts; this enforces it
  · a tour callout <= 16 words it sits in a bubble over the thing it describes,
                               and the thing is visible while it is read

These are ceilings, not targets. The 5 Sep pass left the longest step at 14
words and the mean hint at 24, so there is real headroom before this fails —
which is the point: it catches prose creeping back, not a careful edit.

WHY A CHECK AND NOT A STYLE NOTE. Copy grows one helpful clause at a time, and
every clause looks reasonable in its own diff. Before this pass, eleven popups
carried 332 words between them and no single line looked long.

Run from the repo root:  python3 verify/verify104-chrome-concision.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HINTS = os.path.join(ROOT, "src", "content", "hints.ts")
TOUR = os.path.join(ROOT, "src", "components", "FirstTour.tsx")

TITLE_MAX, STEP_MAX, STEPS_MAX, TOUR_MAX = 5, 16, 3, 16

fails = []


def words(text):
    """Words a reader actually reads — a lone emoji or arrow is not one."""
    return [w for w in text.split() if re.search(r"[A-Za-z0-9]", w)]


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


# --- the first-run popups -----------------------------------------------------
src = strip_comments(open(HINTS, encoding="utf-8").read())
rows = re.findall(
    r'(\w+):\s*\{\s*on:\s*"(?:drill|page)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*'
    r'steps:\s*\[(.*?)\],\s*\}', src, flags=re.S)
if not rows:
    fails.append("content/hints.ts: no hint rows parsed — the shape changed and this check went blind.")

for key, title, block in rows:
    if len(words(title)) > TITLE_MAX:
        fails.append(f'hints.ts {key}: title is {len(words(title))} words (max {TITLE_MAX}) — "{title}"')
    steps = [m.group(1) for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', block)]
    if len(steps) > STEPS_MAX:
        fails.append(f"hints.ts {key}: {len(steps)} steps (max {STEPS_MAX}). Four steps means the screen needs the work, not the popup.")
    for step in steps:
        n = len(words(step))
        if n > STEP_MAX:
            fails.append(f'hints.ts {key}: a step is {n} words (max {STEP_MAX}) — "{step[:90]}"')

# --- the guided tour ----------------------------------------------------------
tour = strip_comments(open(TOUR, encoding="utf-8").read())
callouts = [m.group(1) for m in re.finditer(r'text:\s*"((?:[^"\\]|\\.)*)"', tour)]
if not callouts:
    fails.append("FirstTour.tsx: no callouts parsed — the shape changed and this check went blind.")
for text in callouts:
    n = len(words(text))
    if n > TOUR_MAX:
        fails.append(f'FirstTour.tsx: a callout is {n} words (max {TOUR_MAX}) — "{text[:90]}"')

if fails:
    print("verify104-chrome-concision: FAIL")
    for f in fails:
        print("  - " + f)
    sys.exit(1)

longest_step = max((len(words(s)) for _, _, b in rows
                    for s in re.findall(r'"((?:[^"\\]|\\.)*)"', b)), default=0)
longest_tour = max((len(words(t)) for t in callouts), default=0)
print(f"verify104-chrome-concision: {len(rows)} popups (longest step {longest_step}w) "
      f"and {len(callouts)} tour callouts (longest {longest_tour}w) are within budget.")
