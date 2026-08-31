#!/usr/bin/env python3
"""
Patch 22 — the lesson pager (2026-08-11).

The audit called the lesson "the worst page in the app": 44 tappable controls
before the first answer, the difficulty picker rendered twice with identical
labels, three 🎲 roll buttons, a drill that never ended, no progress bar, no
completion screen. The pager replaces all of it: min(3, memoCards) rule cards
→ a fixed 12-card ramp
(4 MCQ → 4 gap → 3 build → 1 translate) → an end card with XP/accuracy/time
and the SIO write that finally makes the Home path react.

What this asserts:

  1  The old surfaces are GONE: LessonFlow, NativeLessonView, DicedPractice,
     DiceTrainer, both difficulty pickers, every 🎲 New-question button.
  2  The pager exists and is the DrillShell mold: shell import, exit href,
     select-then-commit (no onNext double-Enter), once-ending run.
  3  buildCards: 3 rule cards max, the 12-card ramp with the 4/4/3/1 split,
     wrong answers re-queue once.
     2026-08-25: the entry die is GONE (Dan: "drop the shortcuts, learning
     should not allow that") — its face sliced the queue, so a high roll
     meant fewer cards. Asserted below as an absence.
  4  The end card writes the SIO (markSioDone with accuracy) and progress.ts
     announces every save — the "path never reacts" fix.
  5  The lesson routes render the pager; SioModal no longer embeds a lesson.
  6  Both pretest engines route through the shared runner (one judge+ledger).

Run from the repo root:  python3 verify/verify22.py
"""
import json, os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# 1 · the old surfaces are gone
for dead in (
    "src/app/lessons/LessonFlow.tsx",
    "src/app/lessons/NativeLessonView.tsx",
    "src/games/dice/DicedPractice.tsx",
    "src/games/dice/DiceTrainer.tsx",
    "src/app/UnitActivityPage.tsx",
):
    check(not os.path.isfile(dead),
          f"{os.path.basename(dead)} is gone",
          f"{dead} still exists — the pager was meant to replace it")

roll_buttons = 0
pickers = 0
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            src = strip_comments(read(os.path.join(root, f)))
            roll_buttons += src.count("🎲 New question")
            pickers += src.count("★★★ Difficile")
check(roll_buttons == 0,
      "every 🎲 New-question button is gone",
      f"{roll_buttons} 🎲 New-question button(s) survive")
check(pickers == 0,
      "both difficulty pickers are gone (no ★★★ Difficile anywhere)",
      f"a difficulty picker survives ({pickers} ★★★ label(s))")

# 2 · the pager is the DrillShell mold
pager = strip_comments(read("src/app/lessons/pager/LessonPager.tsx"))
cards = strip_comments(read("src/app/lessons/pager/buildCards.tsx"))
check(bool(pager) and bool(cards),
      "the pager exists (LessonPager + buildCards)",
      "the pager files are missing")
check("DrillShell" in pager and "drillExitHref" in pager,
      "the pager is a DrillShell body with the standard exit rule",
      "the pager does not use DrillShell/drillExitHref")
check("onNext" not in pager,
      "no onNext handler — the shell's Enter binding is the only advance",
      "the pager binds its own onNext (Enter would advance twice)")

# 3 · buildCards structure
# A Mémo is ONE card since 2026-08-27. The old 3-way slice keyed on child
# COUNT, which does not predict height: it chopped `alphabet` (8 children,
# 449px) into three while leaving `nationalities` and `salutations` (1 child,
# taller) whole — backwards where it mattered — and cloning the wrapper
# stamped the heading onto every slice, so card one claimed "7 familles de
# sons" above three of them. Assert the MEANING (a memo is not sliced), not
# the number: a check that only reads "= 1" would pass on a file that still
# slices.
check("RULE_CARDS_MAX = 1" in cards, "a Mémo is one rule card", "RULE_CARDS_MAX is not 1")
_split = re.search(r"export function splitMemo.*?\n\}", cards, re.S)
check(bool(_split) and "cloneElement" not in (_split.group(0) if _split else ""),
      "splitMemo does not slice the memo (no cloneElement)",
      "splitMemo is slicing the Mémo again — the heading will repeat on every card")
check("cloneElement" not in cards,
      "buildCards clones no memo element at all",
      "buildCards still clones a memo element")
# The default ramp moved to lib/lessonEntry.ts on 2026-08-28, when entry level
# ★/★★/★★★ arrived: buildCards now holds `RAMP = rampFor(1)` rather than a
# literal, so the old regex over buildCards.tsx matched nothing and reported an
# empty ramp. Same assertion, asked of the module that now owns the answer —
# executed rather than parsed, so it cannot go stale the same way twice.
# (verify41 covers the other two levels and the equal-length invariant.)
import subprocess as _sp
_js = ('import { rampFor } from "./src/lib/lessonEntry.ts";'
       'console.log(JSON.stringify(rampFor(1)));')
_r = _sp.run(["node", "--experimental-strip-types", "--input-type=module", "-e", _js],
             capture_output=True, text=True)
kinds = json.loads(_r.stdout.strip().splitlines()[-1]) if _r.returncode == 0 else []
check(len(kinds) == 12 and kinds.count("mcq") == 4 and kinds.count("gap") == 4
      and kinds.count("build") == 3 and kinds.count("translate") == 1,
      "the default ramp is 12 cards: 4 MCQ → 4 gap → 3 build → 1 translate",
      f"the ramp is wrong: {kinds}" if _r.returncode == 0 else f"ramp run failed: {_r.stderr[-300:]}")
# The entry die is gone and must stay gone: no face→start map, no d12, and
# above all nothing that trims the ramp before the learner walks it.
check("ROLL_ENTRY" not in cards and "ROLL_ENTRY" not in pager,
      "no die face maps to a ramp entry point — the shortcut map is gone",
      "ROLL_ENTRY is back: a die face can skip cards again")
check("DIE_SIDES" not in cards and "DIE_SIDES" not in pager,
      "the entry d12 is gone from both the builder and the pager",
      "DIE_SIDES is back — the ramp has an entry die again")
check(".slice(entry)" not in pager and "q.slice(" not in pager,
      "the pager never slices its queue — every learner walks the whole ramp",
      "the pager slices its queue: the ramp can be shortened before it starts")
check('"roll"' not in pager,
      "the pager has no roll card",
      "a roll card survives in the pager")
check("requeued" in pager,
      "wrong answers re-queue (once — requeued repeats never re-queue again)",
      "no re-queue mechanism in the pager")

# 4 · the end card + the SIO write + the path reacting
check("markSioDone" in pager and "accuracy" in pager,
      "the end card writes the SIO with the run's accuracy",
      "the pager never writes the SIO — the path still would not react")
prog = strip_comments(read("src/lib/progress.ts"))
save = prog[prog.find("function saveProgress"):prog.find("function saveProgress") + 700]
check("fluolingo:progress-updated" in save,
      "saveProgress announces every save — the Home path repaints on the SIO write",
      "saveProgress is silent; the path only reacts to sync pulls")
for metric in ("xpEarned", "⏱", "Try again"):
    check(metric in pager,
          f"the end card carries {metric!r}",
          f"the end card is missing {metric!r}")

# 5 · routes + popup
for route in ("src/app/lessons/[slug]/page.tsx", "src/app/lessons/deck/[collectionId]/page.tsx"):
    check("LessonPager" in strip_comments(read(route)),
          f"{route.split('/')[-2]} route renders the pager",
          f"{route} does not render LessonPager")
# SUPERSEDED 2026-08-31 by the popup collapse (verify66). Patch 22 took the
# LESSON out of SioModal's EMBEDDABLE set so its flap navigated to the pager;
# this asserted that one absence. The collapse removed EMBEDDABLE itself — now
# NOTHING renders inside the popup and every row is a link — so the old check
# would fail on a stronger version of the thing it was protecting. The rule it
# was really defending is the one restated here: the lesson opens as a page.
modal = strip_comments(read("src/app/SioModal.tsx"))
check("dynamic(" not in modal,
      "SioModal embeds nothing at all — the lesson, like every row, is a link",
      "SioModal lazily imports a view again: something renders inside the popup")

# 6 · one pretest runner
runner_ok = os.path.isfile("src/lib/pretests/runner.ts")
quiz = strip_comments(read("src/app/PretestQuiz.tsx"))
standalone = strip_comments(read("src/app/pretests/[id]/PretestContent.tsx"))
check(runner_ok,
      "the shared pretest runner exists",
      "src/lib/pretests/runner.ts is missing")
for name, src in (("PretestQuiz", quiz), ("PretestContent", standalone)):
    check("pretests/runner" in src and "judgePretestAnswer" in src,
          f"{name} routes through the shared runner",
          f"{name} still carries its own judge/ledger")
    check("recordPretestAnswer" not in src,
          f"{name} has no private ledger write",
          f"{name} still writes the gap report directly")

print("\npatch 22 check (the lesson pager)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
