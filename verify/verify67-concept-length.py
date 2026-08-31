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

# AMENDED AT THE #100 x #105 MERGE (31 Aug). #100 wrapped the flow in a raw
# <details>; #105 landed `Section` the same day — the ONE component that
# implements the collapse rule, whose fold names its count ("4 steps"). The
# merge kept Section, so the flow's disclosure now lives inside the component,
# not at the use site, and `wrapping_details` cannot see it. The claim being
# guarded is unchanged — the tree renders closed, with a labelled control —
# it is just guarded in two halves: the use site defers to Section, and
# Section itself is a closed <details> with a labelled <summary>.

def wrapping_section(needle):
    """The <Section …> opening tag whose block contains `needle` — same
    closed-before-the-needle rejection as `wrapping_details`, for the same
    break-tested reason."""
    i = code.find(needle)
    if i < 0:
        return None
    start = code.rfind("<Section", 0, i)
    if start < 0:
        return None
    if "</Section>" in code[start:i]:
        return None
    return code[start:code.find(">", start) + 1]

flow = wrapping_section("{c.flow.map(")
ok(flow is not None,
   "the decision tree sits inside a <Section> fold",
   "`How to decide` is rendered outside any <Section>. It is a tree a learner "
   "CONSULTS, not reads; open by default it costs every visitor its full "
   "height on every visit.")
if flow is not None:
    ok("open" not in flow,
       "the decision tree's fold is closed on arrival",
       "the flow's <Section> passes `open`, so it renders expanded and the "
       "collapse buys nothing.")
    ok("folds={false}" not in flow.replace(" ", ""),
       "the decision tree's fold actually folds",
       "the flow's <Section> passes folds={false}, which renders a plain "
       "heading — the collapse is gone in all but name.")
    ok("note=" in flow,
       "the fold names what is behind it",
       "the flow's <Section> has no `note` — a closed section that does not "
       "say what is behind it is a section nobody opens (AGENTS.md).")

# The half Section owes: a real <details>, closed by default, with its own
# <summary>. If Section ever becomes a useState div or ships `open` as its
# default, every fold in the app breaks at once — this is where that fails.
sec_at = code.find("function Section(")
sec_body = code[sec_at:code.find("\nfunction ", sec_at + 1)] if sec_at >= 0 else ""
ok(sec_at >= 0 and "<details" in sec_body and "<summary" in sec_body,
   "Section renders a native, labelled <details>",
   "Section no longer renders a <details> with a <summary> — the collapse "
   "rule's one implementation has lost its mechanism.")
ok("open = false" in sec_body or "open=false" in sec_body,
   "Section is closed by default",
   "Section's `open` no longer defaults to false, so every fold in the app "
   "renders expanded and the 27% cut this check was written for is undone.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
