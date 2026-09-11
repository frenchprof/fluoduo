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
  4  A number this branch INTRODUCES is claimed nowhere else in flight.

WHY 4 EXISTS (Dan, 2026-09-06: "yes"). Assertion 3 catches a collision only
once both files sit in the same tree — which is to say at the merge, days
after both were written. AGENTS.md therefore asks every session to scan every
remote branch by hand before claiming a number. Sessions do scan, and it has
still failed SEVEN times (31, 52 twice, 60, 43, and 96 and 97 on 6 Sep), for a
reason no amount of care fixes: the scan is a snapshot, and someone else can
claim the number in the hours between your scan and your push.

So the build does the scan, at push time, every time. The rule is narrow on
purpose:

  · only numbers this branch ADDS are checked — a number already on main is
    settled, so main can never go red because of someone else's branch;
  · only branches that are AHEAD of main and touched in the last 45 days
    count as in flight — this repo has had branches rot for weeks, and a dead
    branch must not hold a number hostage;
  · the branch that merges first keeps the number. The other renumbers, which
    is what happened by hand on 6 Sep and cost a merge.

Run from the repo root:  python3 verify/verify-wiring.py
"""
import glob, os, re, subprocess, sys, time

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

# ---- 1b · one run per branch, and MAIN IS NEVER CANCELLED -----------------
# Added 11 Sep, the day the account's Actions minutes ran out mid-morning and
# every run in the repo — main included — died in 2-5 seconds with no logs.
# The concurrency block is what stops a superseded run burning a full 10½
# minutes on a commit nobody will look at again.
#
# THE EXEMPTION IS THE PART THAT NEEDS GUARDING, not the block. `deploy-live`
# reads this workflow's check conclusion for the commit it is about to mirror,
# and a CANCELLED run is not a green one. So `cancel-in-progress: true` written
# flat — the form every tutorial shows, and the form someone will reach for
# while tidying — would make any commit whose main run got superseded
# permanently undeployable. Nothing else in the repo would notice: CI is
# green, the merge is fine, and the deploy simply refuses, weeks later,
# for a reason no one can see in the diff.
conc = re.search(r"^concurrency:\n(?:[ \t]+.*\n)+", wf, re.M)
check(conc is not None,
      "the verify workflow groups its runs, so a superseded run is not paid for",
      "no concurrency: block in the verify workflow — every push to a branch "
      "runs the full suite to the end, including the ones already overtaken")
if conc:
    body = conc.group(0)
    # THE GROUP LINE, not the block. Read over the whole block this passed with
    # the group hard-coded to a constant, because `github.ref` also appears in
    # the cancel-in-progress expression two lines down — the check was reading
    # the exemption and calling it the key. Caught by break-testing it, which
    # is the only reason it is written this way.
    grp = re.search(r"^[ \t]*group:[ \t]*(.+)$", body, re.M)
    check(grp is not None and "github.ref" in grp.group(1),
          "the GROUP is keyed on the ref, so one branch never cancels another",
          "the concurrency group is not keyed on github.ref — every branch "
          "would share one group and each push would cancel another lane's run")
    check("refs/heads/main" in body and "cancel-in-progress" in body,
          "main is exempt from cancellation — deploy-live can still read its check",
          "main is NOT exempt from cancel-in-progress. A cancelled run is not a "
          "green one, so deploy-live would refuse that commit forever: see the "
          "block's own comment in the workflow")

# ---- 2 · the workflow names nothing that is gone --------------------------
missing = [s for s in set(run_lines) if not os.path.isfile(f"verify/{s}")]
check(not missing,
      "the workflow names no script that has been deleted",
      "the workflow runs scripts that no longer exist, so CI fails on a "
      "missing file: " + ", ".join(sorted(missing)))

# ---- 2b · no script is run TWICE ------------------------------------------
# Found on main, 8 Sep: verify140 had two run: lines and every CI run in the
# repo was driving a browser through it twice. It came from the integration
# lane resolving the SAME both-sides-added conflict in this file on two
# branches in a row — the first resolution had already placed the line, the
# second placed it again, and each diff read as correct on its own.
#
# Nothing here was going to catch that. Check 1 asks whether a script is named
# AT ALL and a duplicate satisfies it twice over; check 3 compares files to
# each other, not run lines. A doubled check never fails, so it is invisible
# except in the clock.
dupes = sorted({s for s in run_lines if run_lines.count(s) > 1})
check(not dupes,
      f"no check is named twice — {len(run_lines)} run lines, "
      f"{len(set(run_lines))} distinct",
      "these checks have more than one run: line, so CI executes each of them "
      "twice for no gain: " + ", ".join(dupes))

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

# ---- 4 · a number this branch introduces is claimed nowhere else ----------
IN_CI = bool(os.environ.get("GITHUB_ACTIONS"))
STALE_DAYS = 45


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True, text=True, timeout=90)
    return r.stdout if r.returncode == 0 else None


def number_map(names):
    """Leading number -> filename, lettered families excluded — those are one
    suite split across files, not two claims on a number."""
    got = {}
    for path in names:
        name = os.path.basename(path)
        if not name.endswith(".py") or FAMILY.match(name):
            continue
        m = re.match(r"^verify(\d+)", name)
        if m:
            got.setdefault(m.group(1), name)
    return got


def numbers_in(ref):
    out = git("ls-tree", "--name-only", ref, "verify/")
    return None if out is None else number_map(out.split())


refs = git("for-each-ref", "--format=%(refname:short) %(committerdate:unix)",
           "refs/remotes/origin")
on_main = numbers_in("origin/main") if refs is not None else None

if refs is None or on_main is None:
    # Nothing to compare against. In CI that is a broken checkout and must be
    # loud — a check that quietly guards nothing is the fault this whole file
    # exists to prevent. Locally (a shallow clone, no network) it is normal.
    msg = ("no remote branches to compare against — checkout needs "
           "fetch-depth: 0 for the in-flight number scan")
    if IN_CI:
        FAIL.append(msg)
    else:
        OK.append("in-flight number scan skipped (no origin refs fetched locally)")
else:
    # The WORKING TREE, the same list assertions 1-3 use — not `ls-tree HEAD`.
    # Reading the last commit made this assertion pass against a file that had
    # been renamed but not yet committed, which is exactly the moment someone
    # needs to be told they have picked a taken number. Caught by its own
    # break-tests: all three went green against a number two other branches
    # already hold.
    added = {n: f for n, f in number_map(scripts).items() if n not in on_main}
    own = (os.environ.get("GITHUB_HEAD_REF")
           or os.environ.get("GITHUB_REF_NAME")
           or (git("rev-parse", "--abbrev-ref", "HEAD") or "").strip())
    cutoff = time.time() - STALE_DAYS * 86400
    taken = []
    if added:
        for line in refs.strip().splitlines():
            ref, _, when = line.rpartition(" ")
            short = ref.removeprefix("origin/")
            if short in ("HEAD", "main", own) or not when.isdigit():
                continue
            if int(when) < cutoff:
                continue                      # rotted, not in flight
            if not git("rev-list", "-1", f"origin/main..{ref}"):
                continue                      # nothing main does not have
            theirs = numbers_in(ref) or {}
            for n, filename in sorted(added.items()):
                if n in theirs and theirs[n] != filename:
                    taken.append(f"{n} -> {filename} here, {theirs[n]} on {short}")
    check(not taken,
          f"the {len(added)} number(s) this branch adds are claimed nowhere else in flight"
          if added else "this branch adds no new check numbers",
          "a number this branch adds is already claimed on a branch in flight — "
          "renumber before this reaches the merge, which is where it cost a "
          "rebase on 6 Sep: " + "; ".join(taken))

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
