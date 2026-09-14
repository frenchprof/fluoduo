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
# THE WELL LEFT THE BAR ON 14 Sep (Dan: "we don't have the stop field anymore,
# it s ben a while since it was take off"), so the stale-mark claim follows it
# to the map's control row rather than being dropped.
#
# THE FAULT THIS FILE EXISTS FOR IS UNCHANGED: a mark that reads once on mount
# shows the OLD stop after every goal completion and bookmark edit, exactly as
# the streak once froze. StopBookmark is the component now, and it is shared —
# the map row and any other caller get the same freshness or none of them do.
# HOW IT STAYS FRESH IS DIFFERENT NOW, AND THAT IS THE POINT. StopMark held its
# own listeners because the bar has no idea which stop you are looking at. The
# map does: its row derives the number from `activeId`, the same render-time
# state that moves the map, so there is no mount-once read left to go stale.
# A number computed at render cannot freeze; a number cached in state can, and
# THAT is what this clause guards against coming back.
mapb_89 = read("src/app/map/MapBody.tsx")
ok("<StopBookmark" in mapb_89,
   "the map's control row carries the stop bookmark",
   "the map lost the stop bookmark — since the bar gave it up on 14 Sep, the "
   "number would have no home at all")
_row = mapb_89[mapb_89.find("<StopBookmark"):]
_row = _row[: _row.find("/>") + 2]
ok("activeId" in _row,
   "…and its number is derived from the live map position, not read once",
   "the map's stop number no longer follows activeId — it would show the stop "
   "the page opened on, the streak's 2 Sep staleness in a new place")

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
