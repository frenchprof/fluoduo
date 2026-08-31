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

# ── 5 · the read-time correction ────────────────────────────────────────────
mis = re.search(r"const MISCACHED[^=]*=\s*\[(.*?)\n\];", EV, re.S)
check(mis is not None, "the MISCACHED table parsed",
      "MISCACHED is gone or unreadable — nothing corrects the answers already "
      "banked under the old tag")
rows = re.findall(r'\["([^"]+)",\s*"([a-z]+)",\s*"([a-z]+)"\]', mis.group(1)) if mis else []
covered = {r[0] for r in rows}
missing = [a.split("alphabet")[0] for a in ALIASES
           if not any(a.startswith(p) for p in covered)]
check(not missing,
      f"all {len(covered)} Sorting names are corrected at read time",
      f"these names have no correction row, so answers banked under them still "
      f"READ as constrained: {missing}")

check(all(was == "constrained" for _, was, _ in rows),
      "the correction only rewrites the `constrained` the old table produced",
      "a correction row rewrites something other than `constrained`, which would "
      "clobber a DELIBERATE override — open writing stores `free` and a pre-test "
      "stores `diagnostic`, and neither is a miscache: " + str(rows))

# ── 6 · the dashboard actually reads through it ─────────────────────────────
DT = open("src/app/teacher/data.ts", encoding="utf-8").read()
n = len(re.findall(r"readEvidenceType\(str\(r\.evidenceType\)", DT))
check(n >= 2,
      f"the teacher dashboard reads all {n} response paths through the correction",
      f"only {n} of the dashboard's evidenceType reads go through "
      "readEvidenceType — the rest still show the stored tag, so the same answer "
      "reads two different ways depending on which table it lands in")

check("str(r.evidenceType)," not in DT.replace("readEvidenceType(str(r.evidenceType),", ""),
      "no dashboard path still takes the stored tag raw",
      "a raw `str(r.evidenceType)` survives in data.ts")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
