#!/usr/bin/env python3
"""
Every Unit-0 pre-test has its own page, and the popup shares the questions.

Dan, 2026-08-31: "what i want is for each pre-test to now have its own page
rather just a pop up".

Units 1-4 already had pages — their pre-tests are authored `Pretest` objects on
/pretests/[id]. Unit 0's ten were the exception: MCQ banks of a different shape
(multi-answer picks, a highlighted phrase, SIO-010's three audiences) that
rendered only inside the SIO popup. Measured before the route was built: ALL
TEN, SIO-010 included — not one resolves through `getPretestForSio`.

WHY THIS MATTERS BEYOND THE FEATURE. The popup is about to collapse to a
statement and a list of links. Collapse it before these pages exist and all ten
stops lose their pre-test outright. This suite is the gate on that order.

WHAT IS PINNED

  1  The route exists and builds one page per Unit-0 stop that HAS a bank,
     derived from the bank rather than from a list written here.
  2  The questions live in ONE component that both surfaces mount. A copy in
     the route would drift, which is the mistake this repo has paid for three
     times (the top bar, the ☰ dropdown, the desk rail).
  3  The page does NOT show the model dialogue, the lesson chips or the
     activity list. A pre-test is a COLD guess; on SIO-010 the dialogue IS the
     answer key.
  4  A miss is remembered and never scored — recordPretestAnswer, never
     recordItemResult (Dan, 2026-08-27: "remember it, but don't score it").
  5  SIO-010 keeps its audience control, and the page does not promise a flat
     21. NARROWED 2026-08-31 by verify70: the control became three TABS and a
     learner now sits all three sevens (Dan: "B - but as a choice, 3 side by
     side tabs"), so the shape of the control is verify70's to pin. What stays
     here is that SIO-010 has one at all, and that the count is per situation —
     21 in one number reads as a single very long run.
  6  Tokens, not raw hex (verify19b's rule).

Run from the repo root:  python3 verify/verify64-unit0-pretest-pages.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def nocom(src):
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

PAGE = "src/app/pretests/unit0/[sioId]/page.tsx"
BODY = "src/app/pretests/unit0/[sioId]/Content.tsx"
SHARED = "src/components/Unit0Pretest.tsx"
PANEL = "src/app/Unit0Panel.tsx"
BANK = "src/content/sios/unit0-questions.ts"

page, body, shared, panel = read(PAGE), read(BODY), read(SHARED), read(PANEL)

# ---- 1 · the route exists, and its pages are derived ----------------------
ok(bool(page), f"{PAGE} exists", f"{PAGE} is missing — the ten Unit-0 pre-tests have no page")
ok(bool(body), f"{BODY} exists", f"{BODY} is missing")
ok("generateStaticParams" in page,
   "the route pre-renders one page per stop",
   "the route has no generateStaticParams — a static export would build none of them")
# Derived from the bank, not from a list in the route: a stop that gains or
# loses questions must change what builds with nothing to edit here.
ok("UNIT0_QUESTIONS" in page and re.search(r"SIOS\.filter", page) is not None,
   "the page list is derived from the question bank",
   "the route hardcodes which stops get a page — a new Unit-0 bank would build no page")

# Every Unit-0 stop with a bank must be reachable. Counted from the bank
# itself, so this cannot drift with the content.
banked = set(re.findall(r'^\s{2}"(SIO-0\d+)":', read(BANK), flags=re.M))
ok(len(banked) >= 10,
   f"the Unit-0 bank still holds {len(banked)} stops",
   f"the Unit-0 bank has shrunk to {len(banked)} — expected all ten")

# ---- 2 · ONE definition of the questions, mounted twice -------------------
ok(bool(shared), f"{SHARED} exists — the questions have one home",
   f"{SHARED} is missing; the questions are defined somewhere per-surface")
ok("Unit0Pretest" in body,
   "the page imports the shared questions",
   "the page does not import from Unit0Pretest — it has its own copy, which will drift")
# NARROWED 2026-08-31 by the popup collapse (verify66). This used to require
# BOTH the page and the popup to mount the shared component, because both
# rendered the questions. The popup no longer renders them at all — it is a
# statement and a list of links, and its pre-test row is a link to the page.
# So the popup is now asserted the other way: it must NOT render them.
ok("Unit0Questions" not in nocom(panel),
   "the popup does not render the questions — its pre-test row is a link to the page",
   "the popup renders the Unit-0 questions again, which the collapse removed")
# Neither surface may define the components itself.
for name, src in (("the page body", body), ("the popup panel", panel)):
    ok("function Unit0Questions" not in nocom(src),
       f"{name} does not redefine Unit0Questions",
       f"{name} defines its own Unit0Questions — two copies of the same pre-test")

# ---- 3 · the page must not answer its own questions -----------------------
nb = nocom(body)
for leak, why in (
    ("DialoguePlayer", "the model dialogue IS SIO-010's answer key"),
    ("lessonsForSio", "the lesson would be offered before the cold guess"),
    ("getAtelier", "the atelier dialogue would hand over the answers"),
):
    ok(leak not in nb,
       f"the page does not render {leak} — {why}",
       f"the page renders {leak}: {why}")

# ---- 4 · remembered, never scored -----------------------------------------
ns = nocom(shared)
ok("recordPretestAnswer" in ns,
   "a Unit-0 answer is written to the pre-test record",
   "Unit-0 answers are not recorded — their misses never reach Bring to class")
ok("recordItemResult" not in ns,
   "a pre-lesson miss is remembered, never scored",
   "the Unit-0 pre-test calls recordItemResult — it is scoring a cold guess")

# ---- 5 · SIO-010 keeps its audience control, and its count is honest -----
ok("Sio010Pretest" in body and "SIO010_SITUATIONS" in shared,
   "SIO-010 still settles its audience before answering",
   "SIO-010 lost its audience control — its questions are unanswerable without one")
# The bank flattens all three audiences (21); the page shows one situation's
# seven and says there are three. Printing the flat figure reads as one long
# run rather than three tabs — verify70 pins the other half of that line.
ok("SIO010_SITUATIONS[0].questions.length" in body,
   "the page counts SIO-010's questions per situation, not all three flattened",
   "the page prints SIO-010's flattened bank size — 21 in one number reads as one very long run")

# ---- 6 · tokens, not hex --------------------------------------------------
# Comments explaining a colour choice legitimately quote hex — the contrast
# figures for the verdict tokens are written out in Unit0Pretest. The rule is
# about what SHIPS, so scan the code with comments stripped, as verify24 does
# for its dead-link scan.
for p in (BODY, SHARED):
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", nocom(read(p)))
    ok(not hexes,
       f"{p.split('/')[-1]} uses tokens, no raw hex",
       f"{p} has raw hex {hexes[:3]} — verify19b's rule")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
