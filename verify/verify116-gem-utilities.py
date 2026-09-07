#!/usr/bin/env python3
"""
The gem utilities (2026-09-07) — Dan's three rulings in one evening:
the Bouclier ("to buy back a streak?" → protection bought in advance),
the expert-game unlocks ("we can unlock difficult parts of the portal" —
GAMES only), and +20 gems per level-up ("yes").

What this check holds, and why each would rot silently:

  1  THE SHIELD'S DECISION, EXECUTED.  `nextStreak` is pure so it runs here:
     a consecutive day climbs; ONE missed day with a shield in hand spends
     the shield and the chain holds; two missed days reset WITHOUT spending
     (a shield cannot bridge a gap, and burning it would charge the learner
     for nothing); no shield means the plain reset. Each of those four arms
     is one careless edit from inverting.
  2  BOUGHT IN ADVANCE, NEVER AT THE MOMENT OF LOSS.  The whole ethical
     difference between our shield and a streak-repair product is WHEN it is
     sold. No surface may offer it after a miss: the only mention around a
     missed day is the morning-after toast, framed as a win.
  3  GAMES ONLY.  Every EXPERT_UNLOCKS id must resolve to a game surface;
     no file on the course spine (lessons, drills, revision, the SIO pages)
     may consult `unlocks` or `hasUnlock`. "Nothing is locked" survives.
  4  THE MERGE CARRIES THE PURCHASES.  A sign-in must not eat a shield or an
     unlock — the lucky find's books were lost this exact way (PR 202).
  5  +20 A LEVEL-UP, IN THE FUNNEL.  The bonus pays inside finalize, once
     per rung crossed, from the same diff that fires the level toast.

Run from the repo root:  python3 verify/verify116-gem-utilities.py
"""
import json, os, re, shutil, subprocess, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── 1 · the shield's decision, executed (dayKey compiles standalone; the
#         pure nextStreak is re-stated here against it, then progress.ts's
#         copy is held to the same shape by source assertions) ─────────────
TMP = ".tmp-verify-gems"
shutil.rmtree(TMP, ignore_errors=True)
os.makedirs(TMP, exist_ok=True)
open(os.path.join(TMP, "tsconfig.json"), "w", encoding="utf-8").write(json.dumps({
    "compilerOptions": {
        "outDir": ".", "rootDir": "../src", "module": "commonjs", "target": "es2020",
        "skipLibCheck": True, "noEmitOnError": False,
        "baseUrl": "..", "paths": {"@/*": ["src/*"]},
    },
    "files": ["../src/lib/dayKey.ts"],
}))
subprocess.run(["npx", "tsc", "-p", os.path.join(TMP, "tsconfig.json")],
               capture_output=True, text=True)
daykey = os.path.abspath(os.path.join(TMP, "lib", "dayKey.js")).replace(os.sep, "/")
check(os.path.isfile(daykey), "dayKey compiles standalone",
      "dayKey did not emit — the shield decision could not be executed")

prog = read("src/lib/progress.ts")
# Extract the body of nextStreak from source and execute it verbatim against
# the compiled previousDay — so the code under test IS the shipped code.
m = re.search(r"export function nextStreak\([\s\S]*?\n\}", prog)
check(m is not None, "nextStreak exists and is exported (pure, testable)",
      "nextStreak is gone — the shield decision moved back inside an impure function")
if m and os.path.isfile(daykey):
    fn = re.sub(r":\s*\{[^}]*\}\s*\{", " {", re.sub(r":\s*(string \| null|number|string)", "", m.group(0).replace("export ", "")), count=1)
    CASES = r"""
const { previousDay } = require("%s");
%s
const today = "2026-09-07";
const out = {
  consec: nextStreak("2026-09-06", 10, 1, today),
  heldOne: nextStreak("2026-09-05", 10, 1, today),
  gapTwo: nextStreak("2026-09-04", 10, 1, today),
  noShield: nextStreak("2026-09-05", 10, 0, today),
  fresh: nextStreak(null, 0, 2, today),
};
console.log(JSON.stringify(out));
""" % (daykey, fn)
    r = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    try:
        got = json.loads(r.stdout.strip())
    except Exception:
        got = None
    check(got is not None, "the shield decision executed",
          f"executing nextStreak failed: {r.stderr.strip()[:200]}")
    if got:
        check(got["consec"] == {"streak": 11, "shields": 1},
              "a consecutive day climbs and spends nothing",
              f"consecutive day wrong: {got['consec']}")
        check(got["heldOne"] == {"streak": 11, "shields": 0},
              "one missed day with a Bouclier: the shield spends, the chain holds",
              f"the shield does not hold a one-day gap: {got['heldOne']}")
        check(got["gapTwo"] == {"streak": 1, "shields": 1},
              "two missed days: reset, and the shield is NOT wasted on it",
              f"a two-day gap mishandled: {got['gapTwo']} — either the chain "
              "survived a gap a shield cannot bridge, or the learner was "
              "charged a shield for nothing")
        check(got["noShield"] == {"streak": 1, "shields": 0},
              "no shield, missed day: the plain reset",
              f"plain reset wrong: {got['noShield']}")
        check(got["fresh"] == {"streak": 1, "shields": 2},
              "a first day starts at 1 whatever is in the pouch",
              f"first day wrong: {got['fresh']}")

check("nextStreak(p.lastActiveDay, p.streak, p.shields ?? 0, today)" in prog,
      "bumpStreakToday delegates to the same nextStreak this check executed",
      "bumpStreakToday no longer calls nextStreak — the shipped decision and "
      "the tested one have diverged")

# ── 2 · sold in advance only; the one mention after a miss is a win ────────
toast = read("src/components/RewardToast.tsx")
check('"shield"' in prog and 'case "shield"' in toast,
      "the morning-after toast exists",
      "the shield toast is gone — the shield would spend itself and never be seen")
surfaces = toast + read("src/components/Rewards.tsx") + read("src/components/GameGallery.tsx")
banned = [w for w in ["don't lose", "you'll lose", "losing", "streak dies", "about to lose",
                      "last chance", "hurry", "don't break", "before it's too late", "expires"]
          if w in surfaces.lower()]
check(not banned, "no shield surface speaks in loss",
      f"loss words on a shield surface ({', '.join(banned)})")
check("chain held" in toast, "the toast frames the held day as a win",
      "the toast no longer celebrates the held chain")

# ── 3 · games only: the spine never consults an unlock ─────────────────────
eco = read("src/lib/economy.ts")
spine_hits = []
for root, _dirs, files in os.walk("src/app"):
    if os.sep + "games" in root:
        continue
    for f in files:
        if f.endswith((".ts", ".tsx")):
            path = os.path.join(root, f)
            if "hasUnlock" in read(path) or re.search(r"\bunlocks\b", read(path)):
                spine_hits.append(path.replace(os.sep, "/"))
check(not spine_hits, "no page off /games consults an unlock — the spine stays open",
      f"unlock checks found OFF the games routes ({', '.join(spine_hits[:3])}) — "
      "gems may never gate learning")
check(re.search(r'setSlug:\s*"countries-expert"', eco) is not None,
      "the expert registry points at a real game set",
      "EXPERT_UNLOCKS no longer names the countries-expert set")

# ── 4 · the merge carries the purchases ────────────────────────────────────
merge = read("src/lib/progressMerge.ts")
check("shields:" in merge and "unlocks:" in merge,
      "a sign-in keeps shields and unlocks",
      "the merge drops shields or unlocks — a sign-in would eat a purchase, "
      "the exact fault that reset the lucky find's cap (PR 202)")

# ── 5 · the level-up bonus pays in the funnel ──────────────────────────────
check("LEVEL_UP_GEMS * levelsUp" in prog,
      "each level-up pays its gem bonus, once per rung crossed",
      "the +20 level-up bonus left finalize")
check(re.search(r"LEVEL_UP_GEMS = 20", eco) is not None,
      "the bonus is Dan's +20",
      "LEVEL_UP_GEMS is not 20 — Dan approved that number specifically")

shutil.rmtree(TMP, ignore_errors=True)
print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
