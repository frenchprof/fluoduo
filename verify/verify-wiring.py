#!/usr/bin/env python3
"""
Every check runs, and no two share a number (2026-08-29).

WHY THIS EXISTS. "A check that CI never runs is not a check" is a house rule
in this repo, written into the workflow's own comments. It has been broken
FOUR times, each time the same way: a session ships a verify script, forgets
the workflow line, and the check passes locally forever while guarding
nothing.

  verify31-wordrill    unwired for a fortnight. A numbering collision with
                       verify31-topbar — the workflow named "verify31" once,
                       and nobody noticed the other file never ran.
  verify36 / 37 / 38   shipped with PR #42, none of them wired. 38 guards the
                       sign-in wall, so for days a guard that never ran was
                       the only thing standing between production and an open
                       app.
  verify42-sio-source  shipped with the SIO-spine work. It holds the CSV and
                       sios.json to each other; unwired, they could drift
                       silently.
  verify43-lesson-axes shipped with the lesson selectors, same gap, found
                       while resolving a THIRD numbering collision on 43.

Every one of those was found by a human or an agent noticing in passing. That
is not a control. This is: the wiring is now itself checked, and it is the
cheapest check in the directory.

The numbering half matters because a collision is what CAUSES the unwiring —
two files whose names differ only after the number look interchangeable in a
workflow file, so one line reads as covering both. Deliberate families are
exempt: 18/18b, 19/19b/19c and 25/25b/25c are one suite split across files,
authored that way and wired line by line.

What this asserts:

  1  Every verify/*.py is named in the workflow. No exceptions list — if a
     check should not run, delete it; a check nobody runs is worse than no
     check, because it reads as coverage.
  2  The workflow names no script that has been deleted, which would fail CI
     on a file that no longer exists.
  3  No two scripts share a leading number, outside the lettered families.

Run from the repo root:  python3 verify/verify-wiring.py
"""
import glob, os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

WF = ".github/workflows/verify.yml"
check(os.path.isfile(WF), "the verify workflow exists", f"MISSING {WF}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

wf = open(WF, encoding="utf-8").read()
scripts = sorted(os.path.basename(p) for p in glob.glob("verify/*.py"))
check(len(scripts) > 20, f"{len(scripts)} checks in verify/",
      f"only {len(scripts)} checks found — is this the right directory?")

# ---- 1 · every script is wired --------------------------------------------
# Match the RUN LINE, not a mention: a script named only inside a comment is
# still not being executed, and comments in this workflow do name scripts.
run_lines = re.findall(r"run:\s*python3\s+verify/(\S+\.py)", wf)
unwired = [s for s in scripts if s not in run_lines]
check(not unwired,
      f"all {len(scripts)} checks are named on a run: line in the workflow",
      "these checks exist but CI never runs them — they guard nothing: "
      + ", ".join(unwired))

# ---- 2 · the workflow names nothing that is gone --------------------------
missing = [s for s in set(run_lines) if not os.path.isfile(f"verify/{s}")]
check(not missing,
      "the workflow names no script that has been deleted",
      "the workflow runs scripts that no longer exist, so CI fails on a "
      "missing file: " + ", ".join(sorted(missing)))

# ---- 3 · no two scripts share a number ------------------------------------
# A collision is what causes the unwiring: two files differing only after the
# number read as interchangeable, so one workflow line looks like it covers
# both. 18b/19b/19c/25b/25c are a deliberate lettered family, not a collision —
# they extend one suite and each has its own run: line.
FAMILY = re.compile(r"^verify\d+[a-z]\.py$")
by_number = {}
for s in scripts:
    m = re.match(r"^verify(\d+)", s)
    if not m or FAMILY.match(s):
        continue
    by_number.setdefault(m.group(1), []).append(s)
clashes = {n: v for n, v in by_number.items() if len(v) > 1}
check(not clashes,
      "no two checks share a leading number",
      "two checks share a number, which is how verify31-wordrill went unwired "
      "for a fortnight: "
      + "; ".join(f"{n} -> {', '.join(v)}" for n, v in sorted(clashes.items())))

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
