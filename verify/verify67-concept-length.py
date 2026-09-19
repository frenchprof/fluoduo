#!/usr/bin/env python3
"""verify67 — the concept tab is panes, and the claim is the one you land on.

Dan, 2026-08-31, offered expand-collapse against a tab strip: *"broken into
side-by-side tabs that allows everything to be visible on the same screen all
at once… between the two, i would prefer the latter."*

That supersedes the folds this check first pinned. The GOAL is unchanged — the
tab must fit one screen — and it is now met properly: measured at 390×844,
**39 of 39 concepts fit**, where with everything open 39 of 39 were over, by
30 to 330px. A fold answers "is it short enough yet?" one section at a time and
still leaves the reader scrolling to learn how many sections there are. A strip
answers it once, because every part is named in a row you can see.

So this asserts the mechanism that achieves the goal, not the old one:

  · the panel is driven by a pane state, not a stack of disclosures
  · every optional block renders behind a pane guard
  · **the claim is the DEFAULT pane** — the argument is on arrival, which is the
    promise verify68 makes, and which a strip could quietly break by opening on
    the pitfall table while still passing a "no <Section>" test
  · the mini-check answers stay `<details>`: an answer hidden until asked for is
    a disclosure, not a change of pane, and conflating the two loses the
    distinction

Heights are measured in a browser, which CI does not run for this route, so the
numbers above live in STATUS. This is the structural proxy for them.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src/app/lessons/pager/LessonTabs.tsx"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

if not SRC.exists():
    print("FAIL  LessonTabs.tsx is missing — this check cannot run and must not pass")
    sys.exit(1)
raw = SRC.read_text(encoding="utf-8")

# Comment-stripped: this file explains its own markup in prose, and counting a
# <details> named only in a comment is how an earlier version of the spacing
# check reported 11 disclosures against 7 summaries.
def strip_comments(t: str) -> str:
    t = re.sub(r"\{/\*.*?\*/\}", "", t, flags=re.S)
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    return re.sub(r"^\s*//.*$", "", t, flags=re.M)

i = raw.find("function Concept({ c }")
ok(i >= 0, "the Concept panel was found",
   "no `function Concept({ c }` in LessonTabs.tsx — the panel has been renamed, "
   "and every assertion below would be vacuous")
if i < 0:
    print("\n".join(f"FAIL  {x}" for x in FAIL)); sys.exit(1)
j = raw.find("\n/**", i + 10)
code = strip_comments(raw[i: j if j > i else len(raw)])

ok("{c.answer}" in code, "the concept still renders c.answer",
   "c.answer is no longer rendered at all — the concept has lost the half of the "
   "argument the learner came for")

ok("setPane" in code, "the panel is driven by a pane state",
   "no pane state in the Concept panel — it has gone back to one stack, which is "
   "what put 39 of 39 concepts over one screen")

# REVERSED 2026-09-19 — Dan's research-agent spec (Merrill's First
# Principles): "Model → optional cue → optional diagnostic contrast →
# retrieve/produce". The MODEL (the worked instance: question then answer) is
# the pane you land on — demonstration before rule. The claim+flow became the
# second pane, "The rule".
ok('useState<"model"' in code, "the Model is the pane you land on (the worked instance, Merrill, 19 Sep)",
   'the default pane is not "model". The demonstration must be what a learner '
   "sees on arrival — the rule follows it, never precedes it.")

# The EXACT pairing, not "a pane guard somewhere in the preceding 800
# characters". That window found `pane === "` belonging to a DIFFERENT pane and
# passed a pitfall table that had escaped its own — the same too-wide-window
# fault verify68's comments warn about two screens further down.
# THE MERRILL REGROUPING (19 Sep): model carries the question AND the answer;
# the cue carries the contrast AND the flow; traps and the retrieval keep
# their guards under the new keys. THE SUM PANE IS GONE — the spec's
# anti-redundancy rule retired it ("a final Sum up pane is normally omitted"),
# so the pin now asserts its ABSENCE, and inShort/remember stay in the data,
# unrendered.
for guard, field, what in (
        ('pane === "model"',              "c.question", "the worked instance's question"),
        ('pane === "model"',              "c.answer",   "the worked instance's answer"),
        ('pane === "cue"',                "c.contrast", "the claim"),
        ('pane === "cue"',                "c.flow",     "the decision flow"),
        ('pane === "traps" && c.pitfall', "c.pitfall",  "the pitfall table"),
        ('pane === "try" && c.check',     "c.check",    "the retrieval")):
    ok(guard in code,
       f"{what} renders behind `{guard}`",
       f"{what} is not behind its pane guard `{guard}`, so it sits on screen with "
       "everything else and the tab is as long as it was before Dan asked for the strip.")
ok('pane === "sum"' not in code,
   "the Sum-up pane is retired (anti-redundancy, 19 Sep)",
   "a Sum-up pane is back — the spec omits it unless it is a genuinely smaller "
   "representation than the cue, and repeating the decision flow is not.")

ok("<details" in code and "{x.a}" in code,
   "the mini-check answers are still a disclosure",
   "the self-check answers are no longer behind <details>. An answer hidden until "
   "asked for is a disclosure, not a pane; pinning them together loses the "
   "distinction Dan drew between the two.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
