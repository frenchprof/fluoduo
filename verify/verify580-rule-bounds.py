#!/usr/bin/env python3
"""A Firestore rule's bounds must admit the values the app actually writes.

WHAT HAPPENED, 2026-09-13. Dan asked why the leaderboard was empty. The first
answer given to him was that HE is on the admin allowlist and teachers are
excluded from the student board — true of his own row, and not the reason. He
settled it the only way it could be settled: signed in on a non-admin account,
earned XP, and watched nothing appear.

    app     publishLeaderboard writes { level: levelForXp(xp).level, … }
    code    levelForXp starts at 0; LEVEL_SPANS[0] is 2000
            -> every learner is level 0 until 2000 XP
    rule    request.resource.data.level >= 1
            -> DENIED for every beginner, i.e. for a whole cohort in week one
    client  a denied write is read as "teacher / opted out" and DELETES the row

So the board did not merely fail to list new learners. It erased them, and the
page said « Nobody yet — be the first 💎! », which reads as an empty term rather
than a broken write.

WHY NO EXISTING CHECK COULD HAVE CAUGHT IT. The rules are not TypeScript and
are not exercised by the build; nothing in `verify/` had ever read them. And
neither side is wrong on its own — level 0 is a correct level, and a lower
bound on a public write is correct caution. The fault only exists in the
relationship between the two files, which is exactly what this check reads.

WHAT IS PINNED. For each numeric bound below: the smallest value the APP can
produce must satisfy the rule. Only the lower bounds are tested, because that
is where the fault was and where it is cheap to be certain — an upper bound of
10,000,000 XP is a cap on abuse, not a value the app computes.

THIS CHECKS THE FILE, NOT THE DEPLOYED RULES. `firestore.rules` is deployed by
hand from the Firebase console; a green check here means the file is right, and
says nothing about what is live. That gap is real and this check cannot close
it — which is itself worth knowing.

Run from the repo root:  python3 verify/verify580-rule-bounds.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

rules = read("firestore.rules")
econ = read("src/lib/economy.ts")
sync = read("src/lib/firebase/progressSync.ts")

ok(bool(rules) and bool(econ), "firestore.rules and economy.ts are both present",
   "firestore.rules or src/lib/economy.ts is missing")

# ── the app's floor for `level` ─────────────────────────────────────────────
# Read out of economy.ts rather than assumed: `let level = 0` is the seed of
# the loop in levelForXp, and it is what a learner below the first span gets.
body = econ[econ.find("export function levelForXp("):]
body = body[: body.find("\n}\n") + 3]
m = re.search(r"let level\s*=\s*(\d+)", body)
app_min_level = int(m.group(1)) if m else None
ok(app_min_level is not None,
   f"the app's lowest level is {app_min_level}",
   "levelForXp no longer seeds its level with a literal — re-point this read "
   "rather than assuming a floor here, or the check goes back to guessing.")

# ── every `level >= N` bound in the rules ───────────────────────────────────
bounds = [int(x) for x in re.findall(r"resource\.data\.level\s*>=\s*(\d+)", rules)]
ok(bool(bounds),
   f"{len(bounds)} rule(s) put a lower bound on `level`",
   "no `level >= N` bound found in firestore.rules — either the field is gone "
   "or this check has stopped reading the file it is named for.")
for b in bounds:
    ok(app_min_level is not None and b <= app_min_level,
       f"a rule admits level {b} and up — the app's floor is {app_min_level}",
       f"A RULE DEMANDS level >= {b} AND THE APP WRITES {app_min_level}. Every "
       "learner below the first level span is denied, and progressSync reads a "
       "denied leaderboard write as 'excluded' and DELETES their row. This is "
       "the 13 Sep bug exactly: the board erases beginners and reports itself "
       "empty.")

# ── the same shape for the other two the app computes ───────────────────────
# xp, gems and streak are all counters that legitimately start at zero.
for field in ("xp", "gems", "streak"):
    got = [int(x) for x in re.findall(rf"resource\.data\.{field}\s*>=\s*(\d+)", rules)]
    ok(all(b == 0 for b in got),
       f"`{field}` is admitted from 0 up ({len(got)} bound(s))",
       f"a rule demands {field} >= {[b for b in got if b]} — {field} is a counter "
       "that starts at zero for every new learner, so any floor above 0 denies "
       "their first write.")

# ── and the deletion-on-denial behaviour that makes this dangerous ──────────
ok("deleteDoc" in sync,
   "a denied leaderboard write still deletes the row (the excluded-user path)",
   "the delete-on-denial fallback is gone from progressSync. That is not "
   "necessarily wrong — but this check's failure text above describes it, so "
   "either restore it or rewrite the explanation to match what happens now.")

print("\nrule bounds admit what the app writes (13 Sep)\n" + "-" * 70)
print(f"  app's lowest level: {app_min_level}   ·   rule bounds found: {bounds}")
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
