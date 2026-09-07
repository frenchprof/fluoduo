#!/usr/bin/env python3
"""
Level 0-4, exponential, rank-free (2026-09-07) — Dan's recut of the level
system, handed down across one morning: "In reality we only need ... Level
(0 to 4 for French 1)", "the XP needed for each level to get harder as they
level up (exponential)", and, of the ten French rank names, "i don't know
why we need them".

What this check holds, and what silently regresses without it:

  1  THE CURVE, EXECUTED.  Five levels (0-4), spans that DOUBLE (2k / 4k /
     8k / 16k, cumulative thresholds 2k / 6k / 14k / 30k). An edit that
     flattens the doubling or adds a sixth level changes what "level 4"
     means for every learner at once.
  2  ONE XP FIGURE ON THE CARD.  The account card shows the level NUMBER and
     lifetime ⭐ only — never an into/span figure. Two XP numbers on one
     card is the exact confusion that started this recut ("WHY IS THE STAR
     AND XP VALUE DIFFERENT AH?").
  3  THE RANKS STAY GONE.  No RankBadge component, no rank names in the
     economy, no rank pill on board rows. They were removed on Dan's word;
     a nostalgic revert should have to argue with a red build.

Run from the repo root:  python3 verify/verify114-level-curve.py
"""
import json, os, re, shutil, subprocess, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── A · the curve, executed (verify109's compile technique) ────────────────
TMP = ".tmp-verify-levels"
shutil.rmtree(TMP, ignore_errors=True)
os.makedirs(TMP, exist_ok=True)
open(os.path.join(TMP, "tsconfig.json"), "w", encoding="utf-8").write(json.dumps({
    "compilerOptions": {
        "outDir": ".", "rootDir": "../src", "module": "commonjs", "target": "es2020",
        "skipLibCheck": True, "noEmitOnError": False,
        "baseUrl": "..", "paths": {"@/*": ["src/*"]},
    },
    "files": ["../src/lib/economy.ts"],
}))
subprocess.run(["npx", "tsc", "-p", os.path.join(TMP, "tsconfig.json")],
               capture_output=True, text=True)
built = os.path.abspath(os.path.join(TMP, "lib", "economy.js")).replace(os.sep, "/")
check(os.path.isfile(os.path.join(TMP, "lib", "economy.js")),
      "economy.ts compiles standalone",
      "economy.ts did not emit — the curve could not be executed")

if os.path.isfile(os.path.join(TMP, "lib", "economy.js")):
    CASES = 'const e = require("%s");\n' % built + """
const probe = [0, 1999, 2000, 5999, 6000, 13999, 14000, 29999, 30000, 250000];
const out = probe.map((xp) => ({ xp, ...e.levelForXp(xp) }));
console.log(JSON.stringify(out));
"""
    r = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    try:
        got = {row["xp"]: row for row in json.loads(r.stdout.strip())}
    except Exception:
        got = None
    check(got is not None, "the curve executed",
          f"executing levelForXp failed: {r.stderr.strip()[:200]}")
    if got:
        expect = [(0, 0), (1999, 0), (2000, 1), (5999, 1), (6000, 2),
                  (13999, 2), (14000, 3), (29999, 3), (30000, 4), (250000, 4)]
        for xp, lvl in expect:
            check(got[xp]["level"] == lvl, f"{xp} XP is level {lvl}",
                  f"{xp} XP reads level {got[xp]['level']}, expected {lvl} — a "
                  "threshold moved and every learner's level moved with it")
        spans = [got[0]["span"], got[2000]["span"], got[6000]["span"], got[14000]["span"]]
        check(all(spans[i + 1] == spans[i] * 2 for i in range(3)),
              "each level's span doubles the last (exponential, as ruled)",
              f"the spans are {spans} — the doubling is broken")
        check(got[30000]["span"] == 0 and got[250000]["level"] == 4,
              "level 4 is the top — nothing above it to grind toward",
              "the ladder grew past 4 — French 1 is five levels, 0-4")

# ── B · one XP figure on the card ──────────────────────────────────────────
acct = read("src/components/AccountButton.tsx")
check(".level" in acct and ".into" not in acct and ".span" not in acct,
      "the card shows the level number and never an into/span figure",
      "an into/span XP figure is back on the account card — two XP numbers "
      "on one card is the confusion this recut exists to end")

# ── C · the ranks stay gone ────────────────────────────────────────────────
check(not os.path.isfile("src/components/RankBadge.tsx"),
      "RankBadge is gone", "RankBadge.tsx is back")
eco = read("src/lib/economy.ts")
banned = [w for w in ['"Débutant"', '"Apprenti"', '"Bavard"', '"Virtuose"']
          if w in eco]
check(not banned, "no rank names in the economy",
      f"rank names returned to economy.ts ({', '.join(banned)})")
board = read("src/components/LeaderboardList.tsx")
check("RankBadge" not in board, "board rows carry no rank pill",
      "the rank pill is back on leaderboard rows")

shutil.rmtree(TMP, ignore_errors=True)
print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
