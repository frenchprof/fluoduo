#!/usr/bin/env python3
"""
Cohort reset check (2026-08-11) — "a filter, not a deletion".

What it asserts (the things a screenshot cannot, and the teacher page needs
admin sign-in so a screenshot cannot cover it at all):

  1  The marker exists: src/lib/term.ts defines CURRENT_TERM, LEGACY_TERM,
     TERM_START_MS, isCurrentTerm.
  2  The stamp travels: Progress carries `term`, defaultProgress stamps
     CURRENT_TERM, and mergeProgress's whitelist literal includes it —
     mergeProgress reconstructs the object from a fixed key list, so a
     forgotten key is silently dropped on every sign-in.
  3  Legacy detection: a remote progress doc without the field, or a board
     row with no progress doc, stamps LEGACY_TERM (startProgressSync).
  4  The board is scoped: publishLeaderboard writes `term`, and the
     firestore.rules create allowlist includes 'term' — without the rules
     half, every NEW student's first publish is denied and the client's
     excluded-user fallback deletes their row.
  5  The readers default to the current cohort: LeaderboardList filters by
     isCurrentTerm; the teacher page filters !hidden && currentTerm with an
     "all cohorts" toggle; buildRoster computes currentTerm from the board
     term or a post-reset firstSeen.
  6  NOTHING deletes prior data: no deleteDoc/delete call was added to any
     of the touched files beyond the two that existed before the reset
     (publishLeaderboard's excluded-user cleanup, teacher onDelete for
     user decks is elsewhere).

Run from the repo root:  python3 verify/verify21.py
"""
import os, re, sys

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

# ── 1 · the marker ─────────────────────────────────────────────────────────
term = strip_comments(read("src/lib/term.ts"))
check(bool(term), "src/lib/term.ts exists", "src/lib/term.ts is missing")
for sym in ("CURRENT_TERM", "LEGACY_TERM", "TERM_START_MS", "isCurrentTerm"):
    check(f"export const {sym}" in term or f"export function {sym}" in term,
          f"term.ts exports {sym}", f"term.ts does not export {sym}")

# ── 2 · the stamp travels through the whitelists ───────────────────────────
progress = strip_comments(read("src/lib/progress.ts"))
check("term?: string" in progress,
      "Progress carries the term field",
      "Progress has no term field")
check("term: CURRENT_TERM" in progress,
      "defaultProgress stamps CURRENT_TERM",
      "defaultProgress does not stamp the term")

sync = strip_comments(read("src/lib/firebase/progressSync.ts"))
# 2026-08-17: the merge is a pure module now (progressMerge.ts, run by verify27).
merge = strip_comments(read("src/lib/progressMerge.ts"))
check("term: remote.term ?? local.term" in merge,
      "mergeProgress's whitelist literal carries the term through sign-in",
      "mergeProgress DROPS the term — it rebuilds Progress from a fixed key list")

# ── 3 · legacy detection ───────────────────────────────────────────────────
check("LEGACY_TERM" in sync and "snap.exists() && !(snap.data() as Partial<Progress>).term" in sync,
      "a pre-reset progress doc (no term field) is stamped legacy",
      "startProgressSync does not mark pre-reset progress docs as legacy")
check("!snap.exists() && oldRow.exists()" in sync,
      "a board row with no progress doc is stamped legacy, not freshman",
      "startProgressSync misses the board-row-without-progress-doc legacy case")

# ── 4 · the board is scoped, and the rules allow it ────────────────────────
check("term: p.term ?? CURRENT_TERM" in sync,
      "publishLeaderboard writes the term onto the row",
      "publishLeaderboard does not write a term")
rules = read("firestore.rules")
# The allowlist grew weekXp/weekKey with the weekly board (retention,
# 2026-08-22) — the pin follows the schema; 'term' is what this suite guards.
check("'term'" in rules and re.search(
        r"hasOnly\(\s*\['name',\s*'xp',\s*'level',\s*'gems',\s*'streak',\s*'weekXp',\s*'weekKey',\s*'term',\s*'updatedAt'\]", rules),
      "the leaderboard create allowlist includes 'term'",
      "firestore.rules create allowlist lacks 'term' — new students' first "
      "publish would be denied and their row deleted by the client fallback")
check("request.resource.data.term is string" in rules,
      "the term is type-checked when present",
      "the rules accept a non-string term")

# ── 5 · readers default to the current cohort ──────────────────────────────
board_list = strip_comments(read("src/components/LeaderboardList.tsx"))
check("isCurrentTerm(r.term)" in board_list,
      "the learner leaderboard shows the current cohort only",
      "LeaderboardList does not filter by term")

data = strip_comments(read("src/app/teacher/data.ts"))
check("currentTerm" in data and "TERM_START_MS" in data and "isCurrentTerm(l.board?.term)" in data,
      "buildRoster derives currentTerm from board term or post-reset firstSeen",
      "buildRoster does not compute currentTerm")
check("term: str(d.term)" in data,
      "fetchLeaderboard carries the term to the teacher side",
      "the teacher's board map drops the term")

page = strip_comments(read("src/app/teacher/page.tsx"))
check("allCohorts || l.currentTerm" in page,
      "the teacher page defaults to the current cohort",
      "the teacher page does not filter by cohort")
check("all cohorts (research)" in page,
      "prior cohorts stay reachable behind the research toggle",
      "there is no all-cohorts toggle — the filter would amount to hiding data")

# ── 6 · a filter, not a deletion ───────────────────────────────────────────
# The only client-side deleteDoc on cohort-touched files must remain the ONE
# pre-existing excluded-user cleanup in publishLeaderboard.
check(sync.count("deleteDoc") == 2,  # the import + the one call
      "no new delete path — prior-term data stays in Firestore",
      "progressSync gained a delete path — the reset must be a filter, not a deletion")
for p in ("src/components/LeaderboardList.tsx", "src/app/teacher/data.ts", "src/app/teacher/page.tsx"):
    src = strip_comments(read(p))
    check("deleteDoc" not in src,
          f"{os.path.basename(p)} deletes nothing",
          f"{p} deletes documents — the reset must be a filter, not a deletion")

print("\ncohort reset check\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
