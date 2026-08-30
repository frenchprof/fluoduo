#!/usr/bin/env python3
"""
Every direct `recordResponse` caller writes an evidence block (2026-08-30).

THE SPLIT. `verify53` (the colour-review session's) asserts that every activity
TAG the app emits resolves to an evidence type. This one asserts the other
half: that the call actually CARRIES an evidence block at all. The two are
independent, and the gap between them is exactly where eight call sites sat.

Their tags were all fine — `mcq:`, `numbus`, `letris:`, `compose:`,
`compose-solo:`, `numbourse` every one resolves. Nothing read them, because
nothing called `buildEvidence`. A tag-checker stays green through that, so it
needed its own check rather than a wider one.

WHY A CHECK AND NOT A PROMISE. `src/app/decks/[id]/mcq/Content.tsx` carried the
comment

    // MCQ grades outside recordItemResult (it never fed the SRS), so it
    // writes the evidence trail directly.

directly above a call that passed no evidence at all. The comment asserted the
very thing that was missing, which is the most expensive kind of documentation
there is: it answers the question a reader would otherwise go and check.

WHAT "DIRECT CALLER" MEANS. Most surfaces call `recordItemResult`, which builds
the evidence centrally and pays XP. A handful call `recordResponse` straight,
deliberately — a game with its own scoring must not pay twice; Letris says so
in its own comment, and Compose calls `awardConversationXp()` a line above.
Those callers keep `recordResponse`; what they must not do is drop the evidence
on the floor.

HOW IT SCANS, and the trap it is written around. The colour-review session's
note on their own miss: *"a scan reading argument VALUES sees nothing when the
argument is absent."* Eight sites hid from exactly that. So this reads the
call's argument object by balancing parentheses and asserts the `evidence:` KEY
is present — an absence, not a value.

Exempt, with reasons:
  · src/lib/progress.ts        — recordItemResult itself, the central builder
  · src/lib/firebase/responses.ts — the function's own definition
  · src/lib/activityLedger.ts  — mentions it in a comment only

Run from the repo root:  python3 verify/verify54-evidence-writers.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# The central builder and the definition itself are not "callers".
EXEMPT = {
    "src/lib/progress.ts",
    "src/lib/firebase/responses.ts",
    "src/lib/activityLedger.ts",
}

def strip_comments(s: str) -> str:
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return re.sub(r"//[^\n]*", "", s)

def args_of(src: str, open_paren: int) -> str:
    """The text between the call's parentheses, balanced."""
    depth, i = 0, open_paren
    while i < len(src):
        if src[i] == "(":
            depth += 1
        elif src[i] == ")":
            depth -= 1
            if depth == 0:
                return src[open_paren + 1 : i]
        i += 1
    return ""

sites, missing = [], []
for root, ds, files in os.walk("src"):
    ds[:] = [d for d in ds if d != "node_modules"]
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        path = os.path.join(root, f).replace("\\", "/")
        if path in EXEMPT:
            continue
        raw = open(path, encoding="utf-8").read()
        src = strip_comments(raw)
        for m in re.finditer(r"\brecordResponse\s*\(", src):
            # Skip the import/definition forms.
            line_start = src.rfind("\n", 0, m.start()) + 1
            line = src[line_start : src.find("\n", m.start())]
            if "export function" in line or "import" in line:
                continue
            body = args_of(src, m.end() - 1)
            sites.append(path)
            # The KEY, not a value — an absent argument shows up as nothing at
            # all, which is how eight of these hid from the first scan.
            if not re.search(r"\bevidence\s*:", body):
                ln = raw[: m.start()].count("\n") + 1
                missing.append(f"{path}:{ln}")

check(len(sites) >= 8,
      f"{len(sites)} direct recordResponse call sites found",
      f"only {len(sites)} call sites found — has recordResponse been renamed? "
      "A scan that finds nothing passes vacuously.")

check(not missing,
      f"every one of the {len(sites)} direct callers passes an evidence block",
      "these write an answer with NO evidence block — no evidenceType, no "
      "outcomeId, no assistance, so the store cannot say what kind of "
      "performance it was: " + ", ".join(missing))

# The comment that lied. Asserted so it cannot come back without the code.
mcq = "src/app/decks/[id]/mcq/Content.tsx"
if os.path.isfile(mcq):
    s = open(mcq, encoding="utf-8").read()
    claims = "writes the evidence trail directly" in s
    does = re.search(r"\bevidence\s*:", strip_comments(s)) is not None
    check(not claims or does,
          "the MCQ comment claiming an evidence trail is backed by one",
          "src/app/decks/[id]/mcq/Content.tsx still says it 'writes the "
          "evidence trail directly' and does not. A comment asserting the "
          "missing thing is worse than no comment: it answers the question a "
          "reader would otherwise go and check.")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
