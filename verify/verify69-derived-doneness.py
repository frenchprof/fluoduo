#!/usr/bin/env python3
"""
A stop is done when it is done — not when someone taps a button.

Dan, 2026-08-31: "I think it should only be marked done if it is really FULLY
done. so we should remove it."

WHAT WAS WRONG. `doneSios` was self-declared. A learner could open a stop, tap
Mark as done having answered nothing, and it counted — the map circle filled,
the n/50 counter moved, Continuer advanced past it, the teacher's heat strip
showed it, and four badges in economy.ts read the length of that list. The
sharpest case was the PRE-TEST page, which offered to mark the stop done the
moment the cold guess was over.

THE RULE (lib/doneness.ts). A stop is complete when every non-game activity it
actually OFFERS has been attempted. Offered, not the registry's seventeen —
Sorting needs Letris columns, iComplete's door moved to Memo — so the list
comes from `deckActivityTabs`, which is the SAME list the popup draws as its
links. What a stop shows you and what it asks of you are one list.

Dan chose the non-game reading on 31 Aug, shown both side by side: every link
put 6-7 activities between a learner and a tick at most stops; excluding the
games leaves 4-6, still every teaching surface.

WHAT IS PINNED

  1  The button is deleted and nothing imports it. A half-removed button that
     still writes doneSios would be the worst of both.
  2  The rule is DERIVED from deckActivityTabs, never a roster written down —
     a culled activity must stop being required the moment it stops being
     offered, which is what made #93 and #99 free.
  3  The games are excluded BY FAMILY, not by a list of game names, so a game
     added tomorrow is an extra without anyone remembering to exempt it.
  4  It fires from `noteAttempt` — the one write path a graded answer takes —
     and NOT from `isSioDone`, which runs inside render loops in 13 files.
  5  GRANDFATHERED: an already-done stop is never re-examined, so nothing can
     un-tick. The rule only ever adds.
  6  Completion still goes through `markSioDone`, so XP, gems, the streak and
     the badges are unchanged — earned now rather than claimed.
  7  ATTEMPTED, not passed. Errors are learning signals here, never a cost.

Run from the repo root:  python3 verify/verify69-derived-doneness.py
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
    """Source with comments stripped — every file here EXPLAINS in prose what
    it no longer does, and an absence check must not pass on its own
    documentation, nor let a real call hide behind the words that excuse it."""
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

RULE = "src/lib/doneness.ts"
LEDGER = "src/lib/activityLedger.ts"
BUTTON = "src/app/sio/[id]/MarkDoneButton.tsx"

rule, ledger = code(read(RULE)), code(read(LEDGER))

# ---- 1 · the button is gone, and nothing imports it -----------------------
ok(not os.path.exists(BUTTON),
   "MarkDoneButton is deleted",
   f"{BUTTON} is back — done-ness is derived; a button that writes doneSios is the old fault")
importers = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            fp = os.path.join(root, f)
            if "MarkDoneButton" in code(read(fp)):
                importers.append(fp)
ok(not importers,
   "nothing imports MarkDoneButton",
   f"still importing the deleted button: {importers[:3]}")

# ---- 2 · the rule is derived, not a roster -------------------------------
ok(bool(rule), f"{RULE} exists", f"{RULE} is missing — there is no rule")
ok("deckActivityTabs" in rule,
   "the requirement comes from deckActivityTabs — the same list the popup draws",
   "the rule no longer reads deckActivityTabs; what a stop shows and what it asks can now disagree")
ok(re.search(r'\bconst\s+\w+\s*=\s*\[\s*"(pretest|speculearn|lesson|flip)"', rule) is None,
   "no hardcoded activity roster in the rule",
   "the rule hardcodes which activities count — a cull would need an edit here")

# ---- 3 · games excluded by family, not by name ---------------------------
ok('=== "svplay"' in rule or '"svplay"' in rule,
   "the games are excluded by FAMILY",
   "the rule no longer exempts the games family — Dan chose the non-game reading on 31 Aug")
named = re.findall(r'"(vocabularain|lexicalator|compose|matching|letris)"', rule)
ok(not named,
   "no game is exempted by name — a new game is an extra automatically",
   f"the rule names individual games ({named[:3]}); a game added tomorrow would silently become required")

# ---- 4 · it fires from the one write path, not from a render read --------
# The CALL inside noteAttempt, not the name anywhere in the file: the helper's
# own definition satisfies a substring test, so deleting the call left this
# green. Break-testing caught it — the fourth assertion of that exact shape
# found today, hence the rule now written into AGENTS.md: assert the construct,
# never the name.
body = ledger[ledger.find("export function noteAttempt("):]
body = body[: body.find("\n}\n") + 3]
ok("maybeCompleteStop(" in body,
   "the check fires from inside noteAttempt, the one path a graded answer takes",
   "noteAttempt does not call the completion check — a stop would never tick itself done")
prog = code(read("src/lib/progress.ts"))
ok("doneness" not in prog,
   "isSioDone stays a plain array read — it runs inside render loops in 13 files",
   "progress.ts now imports the rule; isSioDone would recompute 50 stops per render")

# ---- 5 · grandfathered: nothing can un-tick ------------------------------
ok(re.search(r"isSioDone\([^)]*\)\)?\s*return", ledger) is not None,
   "an already-done stop returns early — the rule only ever adds",
   "the completion path does not skip an already-done stop; it could un-tick or re-award")
ok("unmarkSioDone" not in ledger,
   "the completion path never un-marks",
   "the completion path calls unmarkSioDone — derived done-ness must only add")

# ---- 6 · XP, gems, streak and badges unchanged ---------------------------
ok("markSioDone" in ledger,
   "completion still goes through markSioDone — XP, gems, streak and badges unchanged",
   "completion bypasses markSioDone; a finished stop would pay no XP and earn no badge")
ok("itemsMastery" in ledger,
   "the mastery weighting the button applied is preserved",
   "the mastery weighting is gone — a fully drilled stop now pays the same as a bare one")

# ---- 7 · attempted, not passed -------------------------------------------
ok("accuracyFor" in rule and "!== null" in rule,
   "a stop counts an activity as done once ATTEMPTED, right or wrong",
   "the rule gates on a score — errors are learning signals here, never a cost")
ok(not re.search(r"accuracyFor\([^)]*\)\s*[<>]=?\s*\d", rule),
   "no pass mark is applied",
   "the rule compares accuracy to a threshold — that is a gate, not a record of coverage")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
