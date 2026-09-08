#!/usr/bin/env python3
"""
Every Unit-0 pre-test is a run of its own, one question per screen.

Dan, 2026-08-31: "what i want is for each pre-test to now have its own page
rather just a pop up".

AND ON 2026-09-08 THAT PAGE BECAME A FORWARD, which is why half this file now
looks at a different surface. Dan, flagging Unit 0 as the last of three: a moved
pre-test gives each question the whole screen, but **Unit 0 stacked every
question down one long page — and it is a beginner's first contact with the
app**. Measured on the built export: 2602px on an 844px phone, three screens of
questions, on a route nothing in the app had linked to since the 7 Sep merge
(`unit0PretestHref()` has returned the merged run since then).

So the questions did not move — the RENDERER did. `speculearnPool` folds a
goal's unit-0 bank into the same pool as its authored and generated questions
and `PretestFeed` runs it one question at a time; the old address forwards
there, because printed QR sheets still name it. Every ruling below is kept and
re-aimed at the surface that now carries it, which is the point of the exercise:
a page going away is not a reason for a rule to.

Units 1-4 already had pages — their pre-tests are authored `Pretest` objects on
/pretests/[id]. Unit 0's ten were the exception: MCQ banks of a different shape
(multi-answer picks, a highlighted phrase, SIO-010's three audiences) that
rendered only inside the SIO popup. Measured before the route was built: ALL
TEN, SIO-010 included — not one resolves through `getPretestForSio`.

WHY THIS MATTERS BEYOND THE FEATURE. The popup is about to collapse to a
statement and a list of links. Collapse it before these pages exist and all ten
stops lose their pre-test outright. This suite is the gate on that order.

WHAT IS PINNED

  1  The route still answers, and still one address per Unit-0 stop that HAS a
     bank, derived from the bank rather than from a list written here — and it
     FORWARDS rather than rendering. A stop id is frozen because paper does not
     get re-issued; an old QR must land on the run, not on a 404.
  2  The questions still have ONE home, and neither the popup nor the route
     redefines them. A copy is the mistake this repo has paid for three times
     (the top bar, the ☰ dropdown, the desk rail).
  3  The RUN does not show the model dialogue, the lesson chips or the activity
     list. A pre-test is a COLD guess; on SIO-010 the dialogue IS the answer
     key. Moved here from the page, which no longer renders anything.
  4  A miss is remembered and never scored — recordPretestAnswer, never
     recordItemResult (Dan, 2026-08-27: "remember it, but don't score it"). The
     WRITER is now the merged run: until 8 Sep the only surface that wrote a
     Unit-0 answer was the page nobody could reach, so this had quietly stopped
     happening for every learner. Pinned on both.
  5  Every Unit-0 question can be pooled. `speculearnPool` DROPS a `multi`
     question — graded on the exact set of picks, which is not multiple choice
     — and the merged run is now the only renderer a learner reaches, so a
     dropped question is a question that has silently disappeared. Dan removed
     the last three himself on 8 Sep, rewriting SIO-010's so each has one right
     answer; this holds that none comes back unnoticed.
  6  SIO-010 still sits all three audiences. The tabs were a page control and
     went with the page; what has to survive is that the run serves all three
     situations and that each question says which one it is in — verify70 pins
     the second half, and the driven `pretest-scan` proves no two prompts in
     the flattened bank collide.
  7  Tokens, not raw hex (verify19b's rule).

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
RUN = "src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx"
POOL = "src/lib/speculearn/pool.ts"
SHARED = "src/components/Unit0Pretest.tsx"
PANEL = "src/app/Unit0Panel.tsx"
BANK = "src/content/sios/unit0-questions.ts"

page, run, pool, shared, panel = read(PAGE), read(RUN), read(POOL), read(SHARED), read(PANEL)

# ---- 1 · the route still answers, derived, and forwards -------------------
ok(bool(page), f"{PAGE} exists", f"{PAGE} is missing — an old QR sheet lands on a 404")
ok(bool(run), f"{RUN} exists", f"{RUN} is missing — the merged run has no renderer")
ok("Forward" in page and "speculearnHref" in page,
   "the old Unit-0 address forwards to the goal's merged run",
   "the Unit-0 page renders questions again — it stacked all of them down one\n"
   "        scroll (2602px on an 844px phone), which is what Dan struck out")
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

# ---- 2 · ONE definition of the questions ----------------------------------
# `Unit0Pretest.tsx` is the stacked-page renderer and is mounted by nothing
# since 8 Sep — deliberately kept, because it is the only component that can
# render a `multi` question, and section 5 below is what makes that safe rather
# than theoretical. What must not happen is a SECOND definition appearing.
ok(bool(shared), f"{SHARED} exists — the questions have one home",
   f"{SHARED} is missing; the questions are defined somewhere per-surface")
ok("speculearnPool" in run,
   "the run takes its questions from the one pool",
   "the merged run builds its own question list — a second reading of the same\n"
   "        bank is how two surfaces come to ask different questions")
# NARROWED 2026-08-31 by the popup collapse (verify66). This used to require
# BOTH the page and the popup to mount the shared component, because both
# rendered the questions. The popup no longer renders them at all — it is a
# statement and a list of links, and its pre-test row is a link to the page.
# So the popup is now asserted the other way: it must NOT render them.
ok("Unit0Questions" not in nocom(panel),
   "the popup does not render the questions — its pre-test row is a link to the page",
   "the popup renders the Unit-0 questions again, which the collapse removed")
# Neither surface may define the components itself.
for name, src in (("the run", run), ("the popup panel", panel)):
    ok("function Unit0Questions" not in nocom(src),
       f"{name} does not redefine Unit0Questions",
       f"{name} defines its own Unit0Questions — two copies of the same pre-test")

# ---- 3 · the run must not answer its own questions ------------------------
nb = nocom(run)
for leak, why in (
    ("DialoguePlayer", "the model dialogue IS SIO-010's answer key"),
    ("lessonsForSio", "the lesson would be offered before the cold guess"),
    ("getAtelier", "the atelier dialogue would hand over the answers"),
):
    ok(leak not in nb,
       f"the run does not render {leak} — {why}",
       f"the run renders {leak}: {why}")

# ---- 4 · remembered, never scored -----------------------------------------
# ON BOTH SURFACES. The kept renderer must still be honest, and the run must
# now DO it: from the 7 Sep merge until 8 Sep the only writer was a page nobody
# could reach, so a Unit-0 miss reached no record at all.
# The run does it THROUGH THE RUNNER (verify22: one ledger, one writer), so the
# two surfaces are asserted on the call each of them legitimately makes.
for name, src, writer in (
    ("the kept Unit-0 renderer", shared, "recordPretestAnswer"),
    ("the merged run", run, "judgeUnit0Answer"),
):
    ns = nocom(src)
    ok(writer in ns,
       f"{name} writes a Unit-0 answer to the pre-test record",
       f"{name} records nothing — a Unit-0 miss reaches no gap report")
    ok("recordItemResult" not in ns,
       f"{name} remembers a pre-lesson miss without scoring it",
       f"{name} calls recordItemResult — it is scoring a cold guess")

# ---- 5 · every Unit-0 question can be pooled ------------------------------
# `speculearnPool` drops a `multi` question, and the merged run is the only
# renderer a learner reaches — so a `multi` question authored today simply
# vanishes, with nothing on screen to say it did. Dan removed the last three on
# 8 Sep by rewriting SIO-010's so each has one right answer.
bank_src = read(BANK)
multis = bank_src.count("multi: true")
ok(multis == 0,
   "no Unit-0 question is multi-answer — every one of them reaches the run",
   f"{multis} Unit-0 question(s) are `multi: true`. speculearnPool drops those, and\n"
   "        the merged run is the only door a learner has — so they disappear in\n"
   "        silence. Either give the question one right answer (as Dan did with\n"
   "        SIO-010's three) or teach the pool and the runner to grade a set.")

# ---- 6 · SIO-010 still sits all three audiences ---------------------------
# The three TABS were a control on the stacked page and went with it. What has
# to survive is that the run serves all three situations — the tu/vous contrast
# IS this stop, and a learner who sat one audience never met it.
ok("SIO010_SITUATIONS" in bank_src and "flatMap" in bank_src,
   "SIO-010's bank is all three situations, so the run serves all three",
   "SIO-010's bank no longer flattens its three situations — a learner meets one\n"
   "        audience and never meets the tu/vous contrast this stop exists for")

# ---- 7 · tokens, not hex --------------------------------------------------
# Comments explaining a colour choice legitimately quote hex — the contrast
# figures for the verdict tokens are written out in Unit0Pretest. The rule is
# about what SHIPS, so scan the code with comments stripped, as verify24 does
# for its dead-link scan.
for p in (SHARED,):
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
