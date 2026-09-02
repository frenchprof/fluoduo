#!/usr/bin/env python3
"""The streak works where a learner can see it work (Dan, 2026-09-02:
"the streaks are not working yet?" — driven and confirmed twice over).

The two faults this check exists to keep dead:

  1. THE MARK WENT DEAF. StreakMark read loadProgress().streak once on mount
     and never subscribed to `fluolingo:progress-updated` — so the day's
     first practice bumped the streak in storage while the bar showed
     nothing, and in an SPA a remount never comes. The reading with a
     deadline must LISTEN.
  2. GRADED SURFACES THAT NEVER TOUCHED PROGRESS. MCQ, NumBus and NumBourse
     grade through recordResponse (the evidence trail) and deliberately stay
     outside recordItemResult (no SRS, no XP) — but that starved the streak
     too: a whole MCQ session was a day of practice the fire never counted.
     notePracticeDay() is the narrow door: bump the day, save through
     finalize (so it announces and celebrates), change nothing else.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails: list[str] = []


def ok(cond: bool, what: str, why: str) -> None:
    if not cond:
        fails.append(f"  ✗ {what}\n    {why}")


def read(p: str) -> str:
    return (ROOT / p).read_text(encoding="utf-8")


prog = read("src/lib/progress.ts")
bar = read("src/components/SiteTopBar.tsx")

# ---- 1 · the mark listens ------------------------------------------------
mark = bar[bar.find("function StreakMark") :]
ok('addEventListener("fluolingo:progress-updated"' in mark,
   "StreakMark subscribes to progress saves",
   "the mark reads once on mount again — the day's first practice bumps the "
   "streak in storage and the bar goes on showing nothing until a full reload")
ok('removeEventListener("fluolingo:progress-updated"' in mark,
   "and unsubscribes on unmount",
   "the listener leaks — 28 surfaces mount this bar")

# ---- 2 · the narrow door exists and is the right shape -------------------
ok(re.search(r"export function notePracticeDay\(\)", prog) is not None,
   "notePracticeDay is exported from lib/progress.ts",
   "the evidence-only surfaces have no way to say 'today counts'")
m = re.search(r"export function notePracticeDay\(\)[^}]*\}", prog)
body = m.group(0) if m else ""
ok("bumpStreakToday" in body and "finalize" in body,
   "it bumps the day and saves through finalize",
   "a bump that skips finalize neither persists nor announces — the mark "
   "above would have nothing to hear")
ok("addXp" not in body and "itemSrs" not in body,
   "and it pays nothing and steps no SRS",
   "MCQ stays outside recordItemResult ON PURPOSE (it never fed the SRS, "
   "it pays no XP) — this door must not quietly widen")

# ---- 3 · every evidence-only grading surface counts the day --------------
for p in ("src/app/decks/[id]/mcq/Content.tsx",
          "src/games/numbus/NumBus.tsx",
          "src/games/numbourse/NumBourse.tsx"):
    src = read(p)
    ok("notePracticeDay()" in src,
       f"{p} counts an answered round as a day of practice",
       "it grades through recordResponse only — a session there is a day "
       "of practice the streak never sees, which is fault 2 reborn")

if fails:
    print("verify89-streak-live: FAIL")
    print("\n".join(fails))
    sys.exit(1)
print("verify89-streak-live: ok — the streak bumps on every graded surface and the bar hears it")
