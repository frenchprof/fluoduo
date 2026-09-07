#!/usr/bin/env python3
"""
The SIO popup is the outcome and ONE list of links. Nothing else.

Dan, 2026-08-31: "collapse the interfaces to ONLY reveal the SIO spelled out
fully, then the links to the relevant items within the stop. THAT IS IT."

WHAT IT WAS. A stop stacked the same activity list THREE times — a numbered
path in the body, flaps off the popup's right edge on wide screens, and the
same flaps again as a row under the header on narrow ones. And four of those
activities (WorDrill, iComplete, Sorting, GramMarathon) RENDERED INSIDE the
popup while every other row navigated away, so two identical-looking rows did
two different things depending which one you tapped. The popup was a menu and
a container at once.

WHY THE CHECKS BELOW ARE STRUCTURAL RATHER THAN COSMETIC. Each of the three
surfaces was individually reasonable when it was added; the fault was only
visible in the total. A future change that re-adds any one of them would look
like a small improvement in its own diff, which is exactly the kind of
regression a suite has to catch instead of a reviewer.

WHAT IS PINNED

  1  ONE list, rendered once. No flap markup, no second map over the tabs.
  2  Nothing renders inside the popup — no lazily-imported drill bodies, no
     in-body view state, no embeddable set. Every row navigates.
  3  The list is DERIVED per stop (popupActivityTabs -> deckActivityTabs), not
     a roster written down here. This is what made the Sorting cut (#93) free:
     an activity leaves the list by leaving the registry.
  4  The body does not carry what the links already say, and does not answer
     its own pre-test: no inline questions, no model dialogue, no lesson chips.
  5  Every Unit-0 pre-test opens its PAGE (#98). `inline` is dead.
  6  The stale `dice` roster is gone with the numbered path.
  7  SioDetail — the popup's body — is the STATEMENT AND NOTHING ELSE, and the
     component that printed the ateliers' dialogue is deleted rather than left
     unmounted.

WHERE THIS SUITE WAS WRONG, AND WHY IT MATTERS (2026-08-31, second pass).

Check 4 asserted "the popup body does not render DialoguePlayer" — of
UnitSection and Unit0Panel, the two files the collapse edited. The body those
two MOUNT is SioDetail, which this suite never opened. SioDetail had four
branches; the collapse emptied three, and the fourth fired only when
`sio.isProduction`. So the six ATELIER stops went on printing their entire
model dialogue, six to ten lines of French and English with play buttons,
directly above the link list — for eight days, through a review and a deploy,
with a green check on a file whose whole subject is that duplication.

The lesson is not "test harder", it is WHERE to point: the two files named
were the ones the diff touched, and the file that actually renders was one
import away. Dan found it by looking at the screen.

It also was not merely duplication. The model dialogue IS the atelier
pre-test's answer key — `content/pretests/ateliers.gen.ts` builds each question
from one line and offers three more lines of the SAME dialogue as the wrong
options — so every option was on screen above the button that starts it. The
one thing a pre-test measures could not be measured. Dan, 2026-08-31: "i would
rather the SIO and the items (however few) not be lumped into the same space
anymore." 

Run from the repo root:  python3 verify/verify66-popup-collapse.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped.

    Every file here EXPLAINS in a comment what it no longer does — the words
    'flap', 'EMBEDDABLE' and 'inline' all appear in prose describing the
    collapse. Scanning raw text would fail on the documentation, and worse,
    would let a real re-introduction hide behind the words that excuse it.
    """
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

MODAL = "src/app/SioModal.tsx"
UNIT = "src/app/UnitSection.tsx"
U0 = "src/app/Unit0Panel.tsx"
# The body the two panels MOUNT — the file this suite failed to open for eight
# days. Named here so check 4 below scans what renders, not only what the
# collapse's diff happened to touch.
DETAIL = "src/app/SioDetail.tsx"

modal, unit, u0, detail = read(MODAL), read(UNIT), read(U0), read(DETAIL)
cm, cu, c0, cd = code(modal), code(unit), code(u0), code(detail)

ok(bool(modal), f"{MODAL} exists", f"{MODAL} is missing")

# ---- 1 · ONE list, rendered once -----------------------------------------
ok("cahier-tab" not in cm,
   "the popup draws no flaps",
   "flap markup is back in the popup — that is the second copy of the list")
# Count maps over the RENDER list, not every .map in the file: popupActivityTabs
# legitimately maps deckActivityTabs to build the list in the first place. The
# first version of this check counted both and failed on the honest one.
renders = len(re.findall(r"\blinks\.map\(", cm))
ok(renders == 1,
   "the popup renders its list exactly once",
   f"the popup renders the list {renders} times — that is the duplication being removed")
ok("sm:hidden" not in cm and "hidden sm:flex" not in cm,
   "there is no separate narrow-screen copy of the list",
   "a width-switched second list is back — that was the third copy")

# ---- 2 · nothing renders inside the popup --------------------------------
ok("dynamic(" not in cm,
   "the popup lazily imports no drill body — every row navigates",
   "the popup imports a drill body again: an activity would open INSIDE it")
for gone in ("EMBEDDABLE", "CHAIN_KEYS"):
    ok(gone not in cm,
       f"{gone} is gone",
       f"{gone} is back — the popup is deciding again which rows behave differently")
ok('useState("main")' not in cm and "setView" not in cm,
   "the popup holds no in-body view state",
   "the popup switches its own body again — one row would mean two things")
# The rows themselves: links, never buttons that swap the body.
ok("<button" not in cm.split("sio-path")[-1] if "sio-path" in cm else False,
   "every row in the list is a link, not a body-switching button",
   "a row in the list is a button — it does something other than navigate")

# ---- 3 · the list is derived, not written down ---------------------------
ok("deckActivityTabs" in cm,
   "the list comes from deckActivityTabs — derived per stop",
   "the popup no longer derives its list; a culled activity would linger")
ok(re.search(r'\bconst\s+\w+\s*=\s*\[\s*"(pretest|speculearn|lesson|flip)"', cm) is None,
   "no hardcoded activity roster in the popup",
   "the popup hardcodes an activity list again — a cull would need an edit here")

# ---- 4 · the body says the outcome, and answers nothing ------------------
for name, src in (("UnitSection", cu), ("Unit0Panel", c0), ("SioDetail", cd)):
    for leak, why in (
        ("DialoguePlayer", "the model dialogue is an answer key"),
        ("Unit0Questions", "the questions have their own page since #98"),
        ("Sio010Pretest", "SIO-010's questions have their own page since #98"),
        ("lessonsForSio", "the lesson is already one of the links"),
    ):
        ok(leak not in src,
           f"{name}'s popup body does not render {leak} — {why}",
           f"{name}'s popup body renders {leak}: {why}")

# ---- 5 · Unit-0 pre-tests open their page --------------------------------
ok("unit0PretestHref(" in c0,
   "the Unit-0 popup links its pre-test to that stop's page",
   "the Unit-0 popup no longer links to the Unit-0 pre-test — its questions are inline again")
ok(re.search(r"inline:\s*true", c0) is None and re.search(r"inline:\s*true", cu) is None,
   "no popup asks for an inline pre-test any more",
   "a popup still requests inline:true — a pre-test would render in the body again")
# StopSheet / deck flaps go through pretestHrefForDeck, not the popup. That
# helper used to return /unit/0#{id}, which UnitRedirect turns into the map
# popup — the questions never opened. Same route the popup already uses.
#
# It moved out of CahierShell into lib/pretests/routes.ts on 2026-09-07, so the
# swipe rail could ask the same question without a library importing a page
# shell. CahierShell re-exports it; this rule follows the implementation.
SHELL = "src/lib/pretests/routes.ts"
cs = code(read(SHELL))
ok("unit0PretestHref(" in cs,
   "pretestHrefForDeck sends Unit-0 to its page",
   "pretestHrefForDeck no longer returns the Unit-0 pre-test — StopSheet would open the map popup")
ok("/unit/0#" not in cs,
   "the flap helper does not deep-link the map as a pre-test",
   "pretestHrefForDeck still returns /unit/0# — UnitRedirect opens the map popup")

# ---- 6 · the stale Sorting row went with the path ------------------------
ok('"dice"' not in cm,
   "the popup names no cut activity",
   "the popup still names dice/Sorting, which was cut in #93")

# ---- 7 · the body is the statement, and nothing else ---------------------
ok(bool(detail), f"{DETAIL} exists", f"{DETAIL} is missing — the popup has no body")
# Asserted on the RENDER, not on a name: the file's own prose names the four
# things it stopped rendering, which is exactly what a name-scan would pass on.
# One <p>, one <span>, one call to sioStatement — anything else is a second
# thing in the same space.
body = cd[cd.find("export default function SioDetail("):]
body = body[: body.find("\n}\n") + 3]
ok("sioStatement(sio)" in body,
   "the popup body renders the can-do statement",
   "the popup body no longer renders the statement — Dan asked for the SIO spelled out fully")
for tag, why in (
    ("<div", "a wrapper means the body is holding more than one thing"),
    ("<Link", "a link in the body duplicates the list below it"),
    ("map(", "a list in the body is the list below it, twice"),
    ("?", "a branch means some stops get more than the statement — which is how the ateliers kept their dialogue"),
):
    ok(tag not in body,
       f"the body has no {tag!r} — {why}",
       f"the popup body contains {tag!r}: {why}")
# The dialogue's player is DELETED, not merely unmounted: an unmounted
# component is one import from coming back, and its job is done better by the
# atelier deck's Mémo (« Le modèle », content/memos.tsx), which is a LINK in
# the list rather than a panel above it.
ok(not os.path.isfile("src/app/DialoguePlayer.tsx"),
   "DialoguePlayer is deleted — the dialogue is the Mémo, reached by a link",
   "src/app/DialoguePlayer.tsx is back; the atelier popups can print their answer key again")
players = [p for p in ("src/app/UnitSection.tsx", "src/app/Unit0Panel.tsx", DETAIL, MODAL)
           if "DialoguePlayer" in code(read(p))]
ok(not players,
   "no popup surface mounts a dialogue player",
   f"a popup surface mounts DialoguePlayer again: {players}")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
