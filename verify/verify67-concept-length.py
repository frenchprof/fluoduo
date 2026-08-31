#!/usr/bin/env python3
"""verify67 — the concept tab's long blocks stay behind a disclosure.

Dan, 2026-08-31, looking at the salutations concept: *"it is a very long page,
can we make the answer collapsible"*. Measured at 390x844 before the change:
1512px of content in a 561px slot — 2.70 screens. After collapsing the answer
and the decision tree, and dropping a summary line that restated another:
1111px, 1.98 screens. A 27% cut.

Two blocks are disclosures now, and this pins them there:

  THE ANSWER      asked, then available on tap — the same shape as the WHY
                  button Dan settled on 2026-07-02 ("available on demand,
                  never inline by default").
  HOW TO DECIDE   a decision tree is CONSULTED, not read; a learner who knows
                  the rule was scrolling past it on every visit.

Why <details> and not React state: it must render collapsed in the static
export before any hydration, so a learner on a slow phone never sees the
answer flash open and then close. State cannot promise that; <details> is
closed in the markup itself.

This is a SOURCE check — it reads LessonTabs.tsx rather than restating what it
should contain, so deleting the block makes the assertion fail instead of
leaving a stale copy green. The rendered-height claim above was measured in a
browser; this check guards the mechanism that produced it.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src/app/lessons/pager/LessonTabs.tsx"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

if not SRC.exists():
    print("FAIL  src/app/lessons/pager/LessonTabs.tsx is missing — this check "
          "cannot run and must not pass")
    sys.exit(1)
s = SRC.read_text(encoding="utf-8")

# Comment-stripped, so a <details> named only in a comment cannot satisfy it —
# the trap verify29's RailGroups assertions sat in until 31 Aug.
code = re.sub(r"\{?/\*.*?\*/\}?", "", s, flags=re.S)
code = re.sub(r"^\s*//.*$", "", code, flags=re.M)

ok("{c.answer}" in code, "the concept still renders c.answer",
   "c.answer is no longer rendered at all — the concept has lost its answer, "
   "which is a bigger problem than the one this check was written for")
ok("{c.question}" in code, "the concept still renders c.question",
   "c.question is no longer rendered")

def wrapping_details(needle):
    """The <details> …</details> block ACTUALLY containing `needle`.

    The nearest PRECEDING `<details>` is not enough: an earlier disclosure that
    has already closed sits before every later element in the file, so a naive
    rfind reports any block as "wrapped". Break-testing caught this — replacing
    the flow's `<details>` with a `<div>` left the check green, because it had
    found the ANSWER's disclosure further up. So: reject the candidate if a
    `</details>` falls between it and the needle.
    """
    i = code.find(needle)
    if i < 0:
        return None
    start = code.rfind("<details", 0, i)
    if start < 0:
        return None
    if "</details>" in code[start:i]:
        return None          # that disclosure closed before reaching the needle
    end = code.find("</details>", i)
    return code[start:end] if end > 0 else None

ans = wrapping_details("{c.answer}")
ok(ans is not None,
   "the answer sits inside a <details>",
   "the answer is rendered OUTSIDE any <details>, so it is open on arrival "
   "again. Dan asked for it collapsible on 31 Aug and the page measured 2.70 "
   "screens with it open. Put it back behind a disclosure.")
if ans is not None:
    ok("{c.question}" in ans,
       "the question is the disclosure's own summary",
       "the answer collapses but the question is not its summary — the learner "
       "sees a bare 'show' control with nothing to think about first. The "
       "question must be the <summary>.")
    ok("open" not in re.findall(r"<details([^>]*)>", ans)[0] if re.findall(r"<details([^>]*)>", ans) else True,
       "the answer's disclosure is closed on arrival",
       "the answer's <details> carries `open`, so it renders expanded and the "
       "collapse buys nothing.")

flow = wrapping_details("{c.flow.map(")
ok(flow is not None,
   "the decision tree sits inside a <details>",
   "`How to decide` is rendered outside any <details>. It is a tree a learner "
   "CONSULTS, not reads; open by default it costs every visitor its full "
   "height on every visit.")
if flow is not None:
    # A <details> with no <summary> still collapses, but the browser labels it
    # with its own default marker — an untranslated "Details" on a French
    # lesson. Caught by break-testing: deleting the summary left the check
    # green while the control lost its name.
    ok("<summary" in flow,
       "the decision tree's disclosure is labelled",
       "the decision tree's <details> has no <summary>, so the browser supplies "
       "its own default label. Give it words that say what opening it does.")
    ok("open" not in (re.findall(r"<details([^>]*)>", flow) or [""])[0],
       "the decision tree's disclosure is closed on arrival",
       "the decision tree's <details> carries `open`, so it renders expanded "
       "and the collapse buys nothing.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
