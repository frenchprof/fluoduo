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

modal, unit, u0 = read(MODAL), read(UNIT), read(U0)
cm, cu, c0 = code(modal), code(unit), code(u0)

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
for name, src in (("UnitSection", cu), ("Unit0Panel", c0)):
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
ok("/pretests/unit0/" in c0,
   "the Unit-0 popup links its pre-test to that stop's page",
   "the Unit-0 popup no longer links to /pretests/unit0 — its questions are inline again")
ok(re.search(r"inline:\s*true", c0) is None and re.search(r"inline:\s*true", cu) is None,
   "no popup asks for an inline pre-test any more",
   "a popup still requests inline:true — a pre-test would render in the body again")

# ---- 6 · the stale Sorting row went with the path ------------------------
ok('"dice"' not in cm,
   "the popup names no cut activity",
   "the popup still names dice/Sorting, which was cut in #93")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
