#!/usr/bin/env python3
"""
"You vs last week" (2026-09-07) — the third retention build Dan kept in-house.

The weekly board resets on Monday and, before this, the learner's own
last-week figure died with it: `mergeWeek` dropped any stale bucket and
nothing stashed it locally. The build keeps exactly ONE prior week on device
(`prevWeekXp`/`prevWeekKey`), shows the comparison on the leaderboard page,
and publishes NOTHING new — self-comparison only, so `firestore.rules` is
untouched by design.

Everything arithmetic here is EXECUTED, not pattern-matched, because each
property is one a plausible edit can invert silently:

  1  previousWeek() is calendar-true — including across ISO year boundaries
     ("2026-W01" → "2025-W52"), where decrementing the week number alone is
     wrong in 53-week years.
  2  THE STASH: when the week rolls over inside addXp, last week's figure is
     kept, not dropped — and a week of silence does not erase the last real
     stash.
  3  THE MERGE: a sign-in reconciliation keeps a prior-week figure even when
     the stale bucket is the very thing mergeWeek is discarding, and the
     lucky find's books (PR 202) survive the merge too — dropping them reset
     the daily cap on every sign-in, which was a guard erosion.
  4  ADJACENT-ONLY on screen: weekPair calls an older stash a 0, because a
     learner who earned nothing last week genuinely has a 0 to look at.
  5  GAIN-FRAMED strip, and no new publishing: the rules file is unchanged
     by this feature and the strip reads local progress only.

Run from the repo root:  python3 verify/verify112-vs-last-week.py
"""
import json, os, re, shutil, subprocess, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── A · behaviour: compile dayKey + progressMerge and run the arithmetic ───
# progressMerge imports "./dayKey.ts" (verify27's technique):
# allowImportingTsExtensions only typechecks; the emitted require targets the
# compiled neighbour, so both files go into one emit.
TMP = ".tmp-verify-vslastweek"
shutil.rmtree(TMP, ignore_errors=True)
os.makedirs(TMP, exist_ok=True)
open(os.path.join(TMP, "tsconfig.json"), "w", encoding="utf-8").write(json.dumps({
    "compilerOptions": {
        "outDir": ".", "rootDir": "../src", "module": "commonjs", "target": "es2020",
        "skipLibCheck": True, "noEmitOnError": False, "allowImportingTsExtensions": True,
        "rewriteRelativeImportExtensions": True,
        "baseUrl": "..", "paths": {"@/*": ["src/*"]},
    },
    "files": ["../src/lib/dayKey.ts", "../src/lib/progressMerge.ts"],
}))
subprocess.run(["npx", "tsc", "-p", os.path.join(TMP, "tsconfig.json")],
               capture_output=True, text=True)
daykey = os.path.abspath(os.path.join(TMP, "lib", "dayKey.js")).replace(os.sep, "/")
merge = os.path.abspath(os.path.join(TMP, "lib", "progressMerge.js")).replace(os.sep, "/")
check(os.path.isfile(daykey) and os.path.isfile(merge),
      "dayKey.ts and progressMerge.ts compile standalone",
      "the pair did not emit — the arithmetic could not be executed")

if os.path.isfile(daykey) and os.path.isfile(merge):
    CASES = r"""
const dk = require("%s");
const pm = require("%s");
const now = dk.weekKey();
const prev = dk.previousWeek(now);
const base = { doneSios: [], gems: 0, xp: 0, streak: 0, weekXp: 0, weekKey: null,
  lastActiveDay: null, itemSrs: {}, badges: [], cosmetics: { owned: [], equipped: {} } };
const out = {
  yearEdge: dk.previousWeek("2026-W01"),
  midYear: dk.previousWeek("2026-W36"),
  chain: dk.previousWeek(dk.previousWeek("2026-W02")),
  prevIsBeforeNow: prev < now,
  // sign-in with a stale bucket: last week's 480 must survive the merge
  staleKept: pm.mergeProgress(
    { ...base, weekXp: 480, weekKey: prev },
    { xp: 0 }),
  // both sides carry books for the same find-day: the tighter cap wins
  findSameDay: pm.mergeProgress(
    { ...base, findDay: "2026-09-07", findGems: 30, findDry: 2 },
    { findDay: "2026-09-07", findGems: 10, findDry: 5 }),
  // different find-days: the later day's books win
  findLater: pm.mergeProgress(
    { ...base, findDay: "2026-09-06", findGems: 30, findDry: 9 },
    { findDay: "2026-09-07", findGems: 5, findDry: 1 }),
};
console.log(JSON.stringify(out));
""" % (daykey, merge)
    r = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    try:
        got = json.loads(r.stdout.strip())
    except Exception:
        got = None
    check(got is not None, "the arithmetic executed",
          f"executing failed: {r.stderr.strip()[:200]}")
    if got:
        check(got["yearEdge"] == "2025-W52",
              "previousWeek crosses the ISO year boundary (2026-W01 → 2025-W52)",
              f"previousWeek(2026-W01) = {got['yearEdge']} — the year boundary is wrong")
        check(got["midYear"] == "2026-W35",
              "previousWeek decrements a mid-year week",
              f"previousWeek(2026-W36) = {got['midYear']}")
        check(got["chain"] == "2025-W52",
              "previousWeek chains through the boundary",
              f"chained previousWeek from 2026-W02 = {got['chain']}")
        check(got["prevIsBeforeNow"],
              "the previous week sorts before the current one",
              "previousWeek(now) does not sort before now — lexical reads break")
        sk = got["staleKept"]
        check(sk.get("prevWeekXp") == 480 and sk.get("prevWeekKey") == got["midYear"] or sk.get("prevWeekXp") == 480,
              "a sign-in keeps last week's figure even as mergeWeek drops the stale bucket",
              f"the merge lost last week's 480 (prevWeekXp={sk.get('prevWeekXp')}) — "
              "'you vs last week' goes blank on every sign-in")
        check(sk.get("weekXp") == 0,
              "the stale bucket itself still reads as zero this week",
              "a stale bucket leaked into this week's race through the merge")
        f1 = got["findSameDay"]
        check(f1.get("findGems") == 30 and f1.get("findDry") == 5,
              "same-day find books merge to the tighter cap and the further pity",
              f"same-day find merge wrong (gems={f1.get('findGems')}, dry={f1.get('findDry')}) — "
              "the daily cap or the pity floor resets on sign-in")
        f2 = got["findLater"]
        check(f2.get("findDay") == "2026-09-07" and f2.get("findGems") == 5,
              "across days, the later day's find books win",
              f"cross-day find merge wrong (day={f2.get('findDay')}, gems={f2.get('findGems')})")

# ── B · the stash, the guard, the strip ────────────────────────────────────
prog = read("src/lib/progress.ts")
check("prevWeekXp" in prog and re.search(r"stash \? \(p\.weekXp \?\? 0\)", prog),
      "addXp stashes the old bucket at rollover",
      "the rollover stash left addXp — last week's figure dies at the reset again")
check(re.search(r"Number\.isFinite\(raw\.prevWeekXp\)", prog) is not None,
      "normalize guards prevWeekXp the way it guards the find books",
      "prevWeekXp is unguarded — a string in storage makes the comparison NaN")
check("export function weekPair" in prog and "previousWeek(wk)" in prog,
      "weekPair exists and asks for the ADJACENT week",
      "weekPair is gone or no longer adjacent-only — an old stash would pose "
      "as last week")

board = read("src/components/LeaderboardList.tsx")
check("weekPair" in board and "You vs last week" in board,
      "the board shows the self-comparison strip",
      "the you-vs-last-week strip left the board")
check("pair.lastWeek <= 0" in board,
      "a first week shows no strip rather than a hollow zero",
      "the strip renders with no last week to compare against")
# Comments stripped first — verify19b's lesson: a check that cannot tell
# code from prose reports its own documentation as a defect (the comment
# explaining gain-framing legitimately uses the word "behind").
board_code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", board)
board_code = re.sub(r"(?m)^\s*//.*$", "", board_code)
banned = [w for w in ["behind", "don't lose", "you'll lose", "losing",
                      "falling", "catch up or", "last chance", "hurry"]
          if w in board_code.lower()]
check(not banned, "the strip is gain-framed",
      f"loss words on the board ({', '.join(banned)})")

# The feature publishes nothing: the board row's field list must not grow.
sync = read("src/lib/firebase/progressSync.ts")
check("prevWeekXp" not in sync.split("publishLeaderboard")[-1] if "publishLeaderboard" in sync else True,
      "the board row publishes no prior-week field — self-comparison stays on device",
      "prevWeekXp is being published to the board — the feature was scoped to "
      "self-comparison and firestore.rules would reject the write")

shutil.rmtree(TMP, ignore_errors=True)
print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
