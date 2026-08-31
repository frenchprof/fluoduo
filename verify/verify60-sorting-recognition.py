#!/usr/bin/env python3
"""
Sorting is recognition — and the six-step pathway is untouched by saying so.

THE CONFUSION THIS CLOSES. `evidence.ts` had four prefixes filed as
`constrained` whose names all contain "dice": `dice:`, `dice-practice`,
`/practice/dice/`, `lesson-dice:`. That made the question look like a question
about the lesson's dice roll, which is the exercise stage of the pathway Dan
settled — and retagging THAT would have been a real pedagogical change.

It never was. `normalizePath()` folds all four into `dice-practice:`, which
`labels.ts` names **Sorting**: the standalone tile that shows every column and
asks which one. Its own code says so, building `hintsFor("mcq", …)` over the
visible choices, and the activity band has called it recognition since 26 Aug.
The pathway's dice reports as `lesson:` and is a different row entirely.

Dan, 2026-08-31: *"the dice is meant to be part of the 6-step pedagogy that we
have settled in the learning path."* It is. This check exists to keep the two
apart, so nobody has to re-derive the distinction from four confusing names.

WHAT IS ASSERTED, AND THE ONE THAT MATTERS MOST. Not that Sorting became
recognition — that a reader could see. **That `lesson:` did not move.** A change
to the Sorting tag that also shifted the exercise stage would be the exact
mistake this whole thread was about, and it would be invisible in a diff that
looks like it only touched Sorting.

STATIC, AND SAYING SO. `evidence.ts` imports `@/content`, so bare node cannot
load it — the same constraint `verify53` works around. The table is parsed and
the longest-prefix rule reimplemented, exactly as verify53 does. That means this
checks the TABLE, not the running function; `verify53` covers the other half.

Run from the repo root:  python3 verify/verify60-sorting-recognition.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

EV = open("src/lib/evidence.ts", encoding="utf-8").read()
body = re.search(r"ACTIVITY_EVIDENCE[^=]*=\s*\[(.*?)\n\];", EV, re.S)
check(body is not None, "ACTIVITY_EVIDENCE parsed",
      "ACTIVITY_EVIDENCE is unreadable — has its shape changed?")
if not body:
    print("\n".join(f"  FAIL {m}" for m in FAIL)); sys.exit(1)

PREFIXES = re.findall(r'\["([^"]+)",\s*"([a-z]+)"\]', body.group(1))
check(len(PREFIXES) >= 20, f"{len(PREFIXES)} prefixes in the table",
      f"only {len(PREFIXES)} parsed — the regex has stopped matching, so every "
      "assertion below is vacuous")

def resolve(tag):
    """Longest prefix wins — the rule evidenceTypeFor() applies."""
    best, bl = None, -1
    for p, t in PREFIXES:
        if tag.startswith(p) and len(p) > bl:
            best, bl = t, len(p)
    return best

# ── 1 · the pathway, first, because it is the thing that must NOT move ──────
check(resolve("lesson:aimer") == "constrained",
      "the exercise stage is still `constrained` — the pathway is untouched",
      f"`lesson:` now resolves to {resolve('lesson:aimer')!r}. That is the six-step "
      "pathway's own exercise, where the learner produces a target into a blank. "
      "Retagging Sorting must never reach it.")

check(resolve("mcq:lesson:aimer") == "recognition",
      "the pathway's MCQ card is still recognition",
      f"`mcq:lesson:` resolves to {resolve('mcq:lesson:aimer')!r}")

check(resolve("complete-it:partitifs") == "constrained",
      "iComplete is still `constrained` — a different prefix, untouched",
      f"iComplete resolves to {resolve('complete-it:partitifs')!r}; it types a "
      "target from nothing and is the contrast case for Sorting")

# ── 2 · every name Sorting has ever been emitted under ──────────────────────
ALIASES = ["sorting:alphabet", "dice:alphabet", "dice-practice:alphabet",
           "/practice/dice/alphabet", "lesson-dice:alphabet"]
wrong = [(a, resolve(a)) for a in ALIASES if resolve(a) != "recognition"]
check(not wrong,
      "all five Sorting names resolve to `recognition`",
      "these Sorting tags do not read as recognition, so an answer banked under "
      "them still claims the learner produced a target from memory: " +
      "; ".join(f"{a} -> {t}" for a, t in wrong))

# ── 3 · the surface emits the truthful name, and the old one still resolves ─
SURF = "src/app/practice/dice/[collectionId]/PracticeContent.tsx"
src = open(SURF, encoding="utf-8").read()
code = re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", src, flags=re.S))
check("`sorting:${set.collectionId}`" in code,
      "the Sorting surface emits `sorting:`",
      f"{SURF} no longer emits `sorting:` — new answers go back to being filed "
      "under a name that means the lesson's dice")
check("`dice:${set.collectionId}`" not in code,
      "and no longer emits `dice:`",
      f"{SURF} still emits `dice:`, so the rename is half-done and the two names "
      "are both live")

# ── 4 · the legacy names must keep folding into one activity ────────────────
LB = open("src/lib/labels.ts", encoding="utf-8").read()
for pat in ('/^sorting:/, "dice-practice:"', '/^dice:/, "dice-practice:"'):
    check(pat in LB,
          f"normalizePath folds {pat.split('/')[1]} into dice-practice:",
          f"labels.ts no longer folds {pat.split('/')[1]} — the activity ledger "
          "and every display label resolve through normalizePath, so answers "
          "under that name would stop being counted as Sorting at all")

# ── 5 · the activity is off navigation, and the record survives it ─────────
# Dan cut Sorting on 2026-08-31. Off navigation the way Match It went: the
# registry row is gone so nothing offers it, and the route, the ledger prefixes
# and the evidence tags stay — they describe answers already given, not a
# surface still offered. A cut that also deleted the tags would orphan every
# banked Sorting answer, which is the failure this asserts against.
ACT = open("src/content/activities.ts", encoding="utf-8").read()
check('{ key: "dice", name: "Sorting"' not in ACT,
      "Sorting is off the activity registry — nothing offers it",
      "activities.ts still registers Sorting as an activity, but Dan cut it on "
      "2026-08-31")
check('dice: "recog"' in ACT,
      "its BAND row stays, so banked answers keep a colour",
      "the `dice` BAND row went with the registry row. Match It kept its band "
      "for exactly this reason: answers already given still need a label, and "
      "verify62 reads this row.")

SHELL = open("src/components/CahierShell.tsx", encoding="utf-8").read()
check('registryTab("dice"' not in SHELL,
      "and no deck builds a flap for it",
      "CahierShell still tabs `dice` — a cut activity with a live link")

# The read-time correction that used to be asserted here is GONE, on purpose.
# It rewrote a stored `constrained` from Sorting into `recognition` for display.
# Dan, 2026-08-31: "The student list has been reset, so no worries" — there are
# no old Sorting records left for it to correct, so it was dead weight solving a
# problem that had left the data. Asserted as absent so it does not creep back
# without the reasoning.
EVSRC = open("src/lib/evidence.ts", encoding="utf-8").read()
check("readEvidenceType" not in EVSRC,
      "no read-time correction — the reset removed what it corrected",
      "readEvidenceType is back in evidence.ts. It corrected pre-31-Aug Sorting "
      "records, and the student list was reset, so there is nothing for it to "
      "do. If records are being kept again, say so here.")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
