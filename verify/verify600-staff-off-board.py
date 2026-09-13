#!/usr/bin/env python3
"""
The teacher is never on the student board (Dan, 2026-09-13: "i need to hide
both legacy roles and my own test accountrs ... like the one i tested with
today").

WHY A CHECK AND NOT JUST A DIFF. Three copies of the same six addresses kept
each other honest by comment — `ADMIN_EMAILS` in the teacher module,
`isAdmin()` in firestore.rules, and the list the leaderboard writer consults.
Two of the three ship with every build; the rules copy is deployed by hand from
the Firebase console (this repo has no rules deploy path), so the live
allowlist can lag the file indefinitely. A test sign-in the LIVE rules do not
know about publishes a leaderboard row exactly like a student's, and the only
symptom is a name on the board.

What it asserts:

  1  ONE list. src/lib/staffAccounts.ts holds the addresses and exports
     isStaffAccount(); the teacher module's ADMIN_EMAILS is that list, not a
     second copy of it.
  2  The two lists that cannot import each other agree: staffAccounts.ts and
     firestore.rules' isAdmin() name the same addresses.
  3  The writer refuses. publishLeaderboard consults isStaffAccount BEFORE the
     setDoc, and a refusal still reaches the delete — so signing in on a test
     account takes its row off the public board with no rules deploy.
  4  The reader filters. LeaderboardList drops pre-reset (legacy) rows and the
     names the teacher roster hides.
  5  It is still a filter and not a deletion: the only delete is the owner
     removing their OWN row (leaderboard/{uid} for the signed-in user).

Run from the repo root:  python3 verify/verify600-staff-off-board.py
"""
import os, re, sys

FAIL, OK = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

STAFF = "src/lib/staffAccounts.ts"
staff = strip_comments(read(STAFF))
data = strip_comments(read("src/app/teacher/data.ts"))
rules = read("firestore.rules")
sync = strip_comments(read("src/lib/firebase/progressSync.ts"))
board = strip_comments(read("src/components/LeaderboardList.tsx"))

# ── 1 · one list ───────────────────────────────────────────────────────────
check("export const STAFF_EMAILS" in staff and "export function isStaffAccount" in staff,
      f"{STAFF} exports STAFF_EMAILS and isStaffAccount",
      f"{STAFF} does not export the list and its predicate")

emails = re.findall(r'"([^"@\s]+@[^"\s]+)"', staff.split("TEST_ACCOUNT_EMAILS", 1)[0])
check(len(emails) >= 4,
      f"the staff list names {len(emails)} addresses",
      f"the staff list looks empty ({len(emails)} addresses) — every account "
      "would be treated as a learner")

check(re.search(r"ADMIN_EMAILS\s*=\s*STAFF_EMAILS", data) is not None,
      "the teacher module's ADMIN_EMAILS *is* the one list",
      "src/app/teacher/data.ts holds its own copy of the staff addresses — "
      "two lists of the same accounts is how one of them ended up on the board")
# ── 2 · the copy rules cannot import ───────────────────────────────────────
def rules_fn(name):
    m = re.search(r"function " + name + r"\(\)\s*\{(.*?)\n    \}", rules, re.S)
    return m, set(e.lower() for e in re.findall(r'"([^"@\s]+@[^"\s]+)"', m.group(1) if m else ""))


m, rules_admin = rules_fn("isAdmin")
check(bool(m), "firestore.rules has an isAdmin() allowlist",
      "firestore.rules has no isAdmin() — could not compare the lists")
staff_set = set(e.lower() for e in emails)
check(rules_admin == staff_set,
      "firestore.rules' isAdmin() names the same accounts as STAFF_EMAILS",
      "STAFF_EMAILS and firestore.rules' isAdmin() DISAGREE — "
      f"rules only: {sorted(rules_admin - staff_set)}, code only: {sorted(staff_set - rules_admin)}")

# The alter-ego test learners are an EXCLUSION, never an admin grant — they
# must appear in isExcludedFromLeaderboard() and must NOT appear in isAdmin().
tests = set(
    e.lower()
    for e in re.findall(r'"([^"@\s]+@[^"\s]+)"', staff.split("TEST_ACCOUNT_EMAILS", 1)[-1])
)
m2, rules_excluded = rules_fn("isExcludedFromLeaderboard")
check(bool(m2), "firestore.rules has an isExcludedFromLeaderboard() list",
      "firestore.rules has no leaderboard opt-out list")
check(tests <= rules_excluded,
      f"all {len(tests)} test identities are in the rules' board opt-out",
      f"these test accounts are not excluded by the rules: {sorted(tests - rules_excluded)}")
check(not (tests & rules_admin),
      "a test identity is not also an admin",
      f"a test learner was granted admin read of every student: {sorted(tests & rules_admin)}")

# ── 3 · the writer refuses, and the refusal still cleans up ────────────────
check("isOffBoardAccount" in sync,
      "publishLeaderboard consults the staff list",
      "progressSync publishes a board row without asking whether the account "
      "is the teacher's — it relies entirely on rules that are deployed by hand")
check("isHiddenRosterName" in sync,
      "…and refuses a hidden display NAME too, for an account whose address "
      "we never had",
      "publishLeaderboard tests only the email — a test account whose address "
      "is unknown or mistyped republishes itself on the next save")
pub = sync.split("async function publishLeaderboard", 1)[-1]
guard, write = pub.find("isOffBoardAccount"), pub.find("setDoc(ref")
check(0 <= guard < write,
      "the staff test comes BEFORE the write, not after it",
      "the staff check does not precede the setDoc — a test account still "
      "publishes and waits to be denied")
check("deleteDoc(ref)" in pub,
      "a refused publish still deletes the account's own row",
      "nothing removes a row a staff account published before being excluded")

# ── 4 · the reader filters ─────────────────────────────────────────────────
check("!isLegacyRow(r)" in board,
      "the board drops pre-reset (legacy) rows",
      "the board still lists the pre-reset cohort")
check("isHiddenRosterName" in board,
      "the board hides the accounts the teacher roster hides",
      "the public board does not filter hidden test accounts")
check("isCurrentTerm" not in board,
      "the board does not filter by cohort (Dan, 5 Sep: no classes)",
      "the board is back to a single-cohort filter — a learner who joins next "
      "term would vanish")

# ── 5 · a filter, not a deletion ───────────────────────────────────────────
# The one delete in the app's leaderboard path is the owner's own row.
deletes = re.findall(r"deleteDoc\(([^)]*)\)", sync)
check(deletes == ["ref"],
      "the only delete is the signed-in user's own row",
      f"progressSync deletes something else: {deletes}")
for p in ("src/components/LeaderboardList.tsx", "src/app/teacher/data.ts"):
    check("deleteDoc" not in strip_comments(read(p)),
          f"{os.path.basename(p)} deletes nothing",
          f"{p} deletes documents — hiding must be a filter, not a deletion")

print("\nstaff accounts off the student board\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
