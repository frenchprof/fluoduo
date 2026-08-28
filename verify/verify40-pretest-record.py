#!/usr/bin/env python3
"""
A pretest is remembered, never scored (2026-08-28).

WHY THIS EXISTS. Dan's ruling on the pre-test (2026-08-27) was two-sided, and
each side had a hole:

  "Remember it"    — a miss on a pre-lesson question must reach the learner's
                     "Bring to class" gap report.
  "Don't score it" — and it must not dent accuracy, cost XP, or enter the
                     review queue. The learner has not been taught this yet;
                     charging them for not knowing it is the whole mistake.

THREE engines put pre-lesson questions in front of a learner, and only one of
the two halves was true across them:

  PretestQuiz.tsx            popup stack     records (via the runner)
  pretests/[id]              one at a time   records (via the runner)
  pretests/picture/[id]      word<->picture  logged to Firestore, NEVER to the
                                             gap record — so the teacher's
                                             dashboard saw these and the
                                             learner's own list stayed empty
  Unit0Panel.tsx             Unit 0 popup    recorded NOTHING at all, while
                                             gating the lesson button on being
                                             answered ("pretest first")

The runner's own header already named the Unit-0 hole ("it grades but never
records") and the picture engine's header already claimed a gap report it did
not feed. Both are wired to `recordPretestAnswer` now.

The "don't score it" half held everywhere by accident — no pretest surface
ever called `recordItemResult` — and nothing stopped one from starting to.
That is the assertion worth having: it is the half that silently punishes a
learner if it breaks, and the half no one would notice breaking.

What this asserts:

  1  All four engines write the gap record, so a miss anywhere reaches
     "Bring to class".
  2  NO pretest surface reaches the scoring machinery — not recordItemResult,
     not addXp/awardXp, not queueForReview. This is the load-bearing one.
  3  The gap store itself stays independent of progress.ts: if it ever
     imports the XP/SRS module, "remember" and "score" have been welded
     together and assertion 2 becomes bypassable.
  4  The picture engine resolves its SIO through the shared `sioForDeck`
     rather than a private map (curriculum.ts exists precisely because three
     modules had each built their own).
  5  Unit-0 records under a content-derived id — its bank is shuffled on
     every open and its questions carry no `id`, so an index-based key would
     attach a saved miss to whichever question landed in that slot next.

Run from the repo root:  python3 verify/verify40-pretest-record.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

def code(src):
    """Source with comments removed.

    The "never scored" assertions below are absence checks, and every one of
    these files EXPLAINS in a comment that it deliberately does not call
    recordItemResult. Scanning raw text made the check fail on its own
    documentation — and, worse, would let a real call hide behind the words
    that excuse it. Assert against code only.
    """
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

RUNNER  = "src/lib/pretests/runner.ts"
STORE   = "src/lib/pretestRecord.ts"
POPUP   = "src/app/PretestQuiz.tsx"
SOLO    = "src/app/pretests/[id]/PretestContent.tsx"
PICTURE = "src/app/pretests/picture/[collectionId]/PicturePretestContent.tsx"
UNIT0   = "src/app/Unit0Panel.tsx"
BANK    = "src/content/sios/unit0-questions.ts"

for p in (RUNNER, STORE, POPUP, SOLO, PICTURE, UNIT0, BANK):
    check(os.path.isfile(p), f"{p} present", f"MISSING {p}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

runner, store = read(RUNNER), read(STORE)
popup, solo, picture, unit0, bank = read(POPUP), read(SOLO), read(PICTURE), read(UNIT0), read(BANK)

# ---- 1 · every engine feeds the gap report ---------------------------------
# Assert the CALL, not the mention: `"recordPretestAnswer" in src` is satisfied
# by the import line alone, so it stays green on a file that imports the
# recorder and never invokes it. Proved by deleting the call and watching the
# first version of this check pass anyway.
def calls(src, fn):
    return re.search(re.escape(fn) + r"\s*\(", code(src)) is not None

check(calls(runner, "recordPretestAnswer"),
      "runner writes the gap record",
      "the runner no longer records — the two text engines have gone silent")
for name, src in (("PretestQuiz", popup), ("/pretests/[id]", solo)):
    check(calls(src, "judgePretestAnswer"),
          f"{name} routes through the runner",
          f"{name} grades on its own again — that is how the two ledgers drifted")
check(calls(picture, "recordPretestAnswer"),
      "the picture pretest writes the gap record",
      "the picture pretest records nothing — its misses never reach 'Bring to class'")
check(calls(unit0, "recordPretestAnswer"),
      "the Unit-0 quiz writes the gap record",
      "the Unit-0 quiz grades but never records — Unit 0 has no gap report")

# ---- 2 · nothing pre-lesson is ever scored ---------------------------------
# The load-bearing assertion. A pretest that reaches any of these is charging
# the learner for material the course has not taught them yet.
SCORING = ("recordItemResult", "queueForReview", "awardXp", "addXp", "awardConversationXp")
for name, src in (("the runner", runner), ("PretestQuiz", popup), ("/pretests/[id]", solo),
                  ("the picture pretest", picture)):
    src = code(src)
    for sym in SCORING:
        check(sym not in src,
              f"{name} does not call {sym}",
              f"{name} calls {sym} — a pre-lesson miss now costs XP / accuracy / review")

# Unit0Panel hosts practice games in its popup tabs, so it may legitimately
# reach progress.ts for those. What it must never do is score a QUESTION: the
# pick handler is the surface under test, not the whole file.
pick = unit0[unit0.find("function doPick("):]
pick = pick[: pick.find("\n  const scrollToActive")] if "\n  const scrollToActive" in pick else pick
pick = code(pick)
# Anchor the slice on something doPick certainly contains, not on its length:
# a length threshold sat within a dozen characters of tripping, so an ordinary
# edit inside doPick would have reported "could not isolate" instead of the
# thing being tested.
check("setPicked" in pick and "sfx." in pick,
      "Unit-0 doPick located",
      "could not isolate Unit-0's doPick — rewrite this slice")
for sym in SCORING:
    check(sym not in pick,
          f"Unit-0's doPick does not call {sym}",
          f"Unit-0's doPick calls {sym} — a pre-lesson miss now costs XP / accuracy / review")

# ---- 3 · the store stays independent of the scoring module -----------------
check("@/lib/progress" not in store,
      "the gap store is independent of progress.ts",
      "pretestRecord imports progress.ts — 'remember' and 'score' are now welded together")
check("localStorage" in store,
      "the gap store is local",
      "the gap store no longer writes localStorage")

# ---- 4 · one deck->SIO resolver, not a private map -------------------------
check("sioForDeck" in picture,
      "the picture pretest resolves its SIO through the shared map",
      "the picture pretest resolves its SIO some other way — see curriculum.ts on private maps")

# ---- 5 · Unit-0 keys on content, not on position ---------------------------
check("unit0QuestionId" in bank and "export function unit0QuestionId" in bank,
      "the Unit-0 question id is derived in the bank",
      "unit0QuestionId is gone from the bank")
check("unit0QuestionId" in unit0,
      "Unit-0 records under the derived id",
      "Unit-0 keys its records some other way — the bank is shuffled, so position cannot key it")
check("options.find" in bank[bank.find("export function unit0QuestionId"):],
      "the Unit-0 id includes the correct answer, not just the prompt",
      "the Unit-0 id no longer distinguishes questions sharing a prompt")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
