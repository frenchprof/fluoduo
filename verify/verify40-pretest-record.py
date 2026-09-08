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
SOLO    = "src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx"
# THE PICTURE ENGINE IS GONE (2026-09-08). `/pretests/picture/<deck>` was a
# second pre-test runner that never got a door — nothing in the app linked to
# it — and 32 of its 50 pages rendered only "No picture pretest available".
# `speculearnPool`'s `fromDeck` builds the same question into the goal's merged
# run, so the address forwards there and the runner is deleted. Its clause below
# is replaced by the one that now carries the same duty: the merged run must
# record a UNIT-0 answer, which was the other engine retired the same day.
# The Unit-0 questions left Unit0Panel on 2026-08-31: they now render on their
# own page as well as in the popup (Dan: "each pre-test to now have its own page
# rather just a pop up"), so they live in one component both surfaces mount.
# Read from ONE file — not this and the panel concatenated: a check satisfied by
# whichever file still has the code is how a stale duplicate survives, which is
# exactly what verify64 forbids here.
UNIT0   = "src/components/Unit0Pretest.tsx"
BANK    = "src/content/sios/unit0-questions.ts"

for p in (RUNNER, STORE, POPUP, SOLO, UNIT0, BANK):
    check(os.path.isfile(p), f"{p} present", f"MISSING {p}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

runner, store = read(RUNNER), read(STORE)
popup, solo, unit0, bank = read(POPUP), read(SOLO), read(UNIT0), read(BANK)

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
# THE MERGED RUN WRITES FOR UNIT 0 NOW, and this replaces the picture engine's
# clause because it is the same duty moved. Dan, 2026-08-27, of a pre-lesson
# guess: *"remember it, but don't score it"*. Until 8 Sep the only surface that
# wrote a Unit-0 answer was `/pretests/unit0/<stop>` — a page nothing had linked
# to since the merge — so the write had quietly stopped happening for anyone
# using the app. `PretestFeed` records it directly for a pooled unit-0 item.
# THROUGH THE RUNNER, like everything else. verify22 forbids an engine from
# calling `recordPretestAnswer` itself — one ledger, one writer — so the run
# calls `judgeUnit0Answer` and the runner does the writing.
check(calls(runner, "recordPretestAnswer"),
      "the runner writes a Unit-0 answer to the gap record",
      "judgeUnit0Answer no longer records — Unit 0 has no gap report")
check(calls(solo, "judgeUnit0Answer"),
      "the merged run routes a Unit-0 answer through the runner",
      "the merged run records nothing for a Unit-0 question — and it is the only\n"
      "        surface a learner can reach one through, so Unit 0 has no gap report")
check("export function judgeUnit0Answer" in runner,
      "the runner owns the Unit-0 judge",
      "judgeUnit0Answer is gone from the runner — the engine is writing its own\n"
      "        ledger again, which is the drift this file exists to catch")
check(calls(unit0, "recordPretestAnswer"),
      "the Unit-0 quiz writes the gap record",
      "the Unit-0 quiz grades but never records — Unit 0 has no gap report")
# THE READER IS GONE ON PURPOSE, AND THIS IS THE ONE LOOSE END.
# Until 5 Sep this pinned that the U1–4 recap mounted BringToClass, so a miss
# had somewhere to be read. Dan dissolved Class bag that day ("dissolve class
# bag as a concept = we dowan that anymore"), which removed the only reader
# fluolingo:pretest.v1 has ever had. The writes above are still pinned, so the
# record survives intact for the reader Dan named on 31 Aug — "it is just for
# them to revise in DéjàRevue".
#
# What CANNOT be done quietly is route a miss into the review queue: section 2
# below bars queueForReview from every pre-test, deliberately, and lifting that
# is Dan's call and not a refactor. So this check now pins the store's shape
# rather than a screen — missesForSio must still exist and still read the key
# the writers write, or the record is unreachable when Réviser comes for it.
record = code(open("src/lib/pretestRecord.ts", encoding="utf-8").read())
check("export function missesForSio" in record,
      "missesForSio survives Class bag — the record is still readable",
      "missesForSio is gone: every miss is now written to a store nothing can read")
check('"fluolingo:pretest.v1"' in record,
      "the gap record still lives under fluolingo:pretest.v1",
      "the gap record's key moved — a learner's existing misses are orphaned")

# ---- 2 · nothing pre-lesson is ever scored ---------------------------------
# The load-bearing assertion. A pretest that reaches any of these is charging
# the learner for material the course has not taught them yet.
SCORING = ("recordItemResult", "queueForReview", "awardXp", "addXp", "awardConversationXp")
for name, src in (("the runner", runner), ("PretestQuiz", popup), ("/pretests/[id]", solo),
                  ("the Unit-0 questions", unit0)):
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

# ---- 2b · MCQ IS WHAT MAKES IT A PRE-TEST ----------------------------------
# Dan's rule (2026-08-28), which decides pre- vs post- by FORM, not intent:
#
#     "pre-tests should only involve MCQ, if it is not an MCQ then it is a
#      post-lesson activity"
#
# It is what settled Unit 0, whose own header called it "post-lesson" while the
# panel gated the lesson button on it. The rule also explains WHY the scoring
# ban above is safe to enforce: picking from four options before you have been
# taught is a guess, and a guess must not be charged for. The moment a surface
# asks a learner to TYPE, it is asking them to produce, which is post-lesson
# work — and post-lesson work is scored. So a typing field appearing on any of
# these screens does not mean "tighten the pretest", it means the screen has
# stopped being a pretest.
for name, src in (("PretestQuiz", popup), ("/pretests/[id]", solo),
                  ("the Unit-0 questions", unit0)):
    body = code(src)
    typed = [t for t in ("<input", "<textarea", "contentEditable") if t in body]
    check(not typed,
          f"{name} is multiple choice only",
          f"{name} now takes typed input ({', '.join(typed)}) — by Dan's rule that "
          "makes it a POST-lesson activity, which must be scored; it cannot stay a pretest")

# The two schemas must stay choice-only: PretestItem carries an answer plus
# distractors, and Unit0Question requires `options`. Either gaining a free-text
# mode would let a typed question be authored INTO a pretest, which the
# per-surface check above cannot see.
schema = read("src/lib/pretests/schema.ts")
check("distractors" in schema,
      "an authored pretest item is answer + distractors (choice-only by construction)",
      "PretestItem no longer carries distractors — pretests can now be free-text")
check(re.search(r"options:\s*Unit0Option\[\];", bank) is not None,
      "a Unit-0 question REQUIRES options — a free-text one cannot be authored",
      "Unit0Question.options is no longer required — a typed question could enter the pretest")

# ---- 3 · the store stays independent of the scoring module -----------------
check("@/lib/progress" not in store,
      "the gap store is independent of progress.ts",
      "pretestRecord imports progress.ts — 'remember' and 'score' are now welded together")
check("localStorage" in store,
      "the gap store is local",
      "the gap store no longer writes localStorage")

# ---- 4 · one deck->SIO resolver, not a private map -------------------------
# This pinned the picture engine, which is retired (see the note at PICTURE
# above). The rule it protected is alive on the surface that replaced it: a
# Unit-0 answer's EVIDENCE is keyed by the DECK id, because `activityLedger`
# resolves a stop by taking the tail after the last colon and asking
# `sioForDeck` — a SIO id there silently no-ops, and a no-op looks identical to
# success from the call site. So the merged run must take that id from the stop
# it was given, never invent one.
check("collectionId" in solo,
      "the merged run keys its Unit-0 evidence by the deck id",
      "the merged run has stopped resolving the deck — the evidence ledger keys on\n"
      "        a deck id, so a SIO id there writes nothing and reports success")

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
