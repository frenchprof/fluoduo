#!/usr/bin/env python3
"""
The fire ladder past day 7 (2026-09-07) — Dan, splitting the retention reads:
"take 2 and pass 2 to peers", the taken one being the streak ladder.

Before this, xpMultiplier stopped at day 7: day 40 paid exactly what day 7
paid, so the one compounding mechanic the app has went flat just as a learner
got attached to it. The ladder now climbs ×1 → ×1.5 (day 3) → ×2 (day 7) →
×2.5 (day 14) → ×3 (day 30), and the NEXT rung is said out loud wherever the
multiplier already shows — the top-bar well's title and the account popover.

What this check holds, and why each would regress silently:

  1  THE LADDER'S ARITHMETIC, EXECUTED.  economy.ts is compiled and
     xpMultiplier is run day by day: exact values at every rung, monotone
     non-decreasing (a ladder that ever pays LESS for a longer streak is
     loss-framing in arithmetic), and nextFireMilestone agreeing with
     xpMultiplier about where the rungs are — two copies of the same table
     drifting apart is precisely the fault a constants file exists to end.
  2  DAY 30 AGREES WITH THE BADGE.  « Inarrêtable » is earned at streak 30;
     the ladder's top rung sits on the same day so the two systems tell one
     story. An edit that moves one without the other unravels that quietly.
  3  THE NEXT RUNG IS VISIBLE, GAIN-FRAMED.  Both surfaces print what the
     next day PAYS ("day 14 pays ×2,5"). The loss words are verify32's to
     ban app-wide; here we hold the two new surfaces to the same floor so a
     rewrite of either cannot slip into "don't lose your ×2".

Run from the repo root:  python3 verify/verify113-streak-ladder.py
"""
import json, os, re, shutil, subprocess, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── A · behaviour: compile economy.ts and climb the ladder for real ────────
# Same technique as verify109: economy.ts's only import is a type import,
# which erases, so the emitted module loads straight into node.
TMP = ".tmp-verify-ladder"
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
built = os.path.join(TMP, "lib", "economy.js")
check(os.path.isfile(built), "economy.ts compiles standalone",
      "economy.ts did not emit — the ladder could not be executed")

if os.path.isfile(built):
    CASES = r"""
const e = require("%s");
const out = { mults: {}, next: {}, mono: true };
let prev = 0;
for (let d = 0; d <= 60; d++) {
  const m = e.xpMultiplier(d);
  if (m < prev) out.mono = false;
  prev = m;
  out.mults[d] = m;
  out.next[d] = e.nextFireMilestone(d);
}
console.log(JSON.stringify(out));
""" % os.path.abspath(built).replace(os.sep, "/")
    r = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    try:
        got = json.loads(r.stdout.strip())
    except Exception:
        got = None
    check(got is not None, "the ladder executed",
          f"executing the ladder failed: {r.stderr.strip()[:200]}")
    if got:
        m = {int(k): v for k, v in got["mults"].items()}
        expect = [(0, 1), (2, 1), (3, 1.5), (6, 1.5), (7, 2), (13, 2),
                  (14, 2.5), (29, 2.5), (30, 3), (60, 3)]
        for day, want in expect:
            check(m[day] == want, f"day {day} pays ×{want}",
                  f"day {day} pays ×{m[day]}, expected ×{want} — a rung moved or vanished")
        check(got["mono"], "the ladder never pays less for a longer streak",
              "the ladder DECREASES somewhere — a longer streak paying less is "
              "loss-framing done in arithmetic")
        nxt = {int(k): v for k, v in got["next"].items()}
        # nextFireMilestone must agree with xpMultiplier about every rung: from
        # any day, the promised next rung is the first day the multiplier rises.
        agree = True
        for d in range(0, 61):
            n = nxt[d]
            if n is None:
                if any(m[x] > m[d] for x in range(d, 61)):
                    agree = False
            else:
                if not (n["day"] > d and m[n["day"]] == n["mult"] and m[n["day"] - 1] < n["mult"]):
                    agree = False
        check(agree, "nextFireMilestone agrees with xpMultiplier about every rung",
              "nextFireMilestone and xpMultiplier disagree — the app would promise "
              "a rung the ladder does not pay")
        check(nxt[30] is None and nxt[60] is None,
              "past the top rung the ladder stops promising",
              "nextFireMilestone still promises a rung past day 30 — a promise "
              "with no payout behind it")

# ── B · day 30 agrees with the badge ───────────────────────────────────────
eco = read("src/lib/economy.ts")
check(re.search(r'"inarretable"[^}]*p\.streak >= 30', eco) is not None,
      "the « Inarrêtable » badge still sits at streak 30",
      "the 30-day badge moved — the ladder's top rung and the streak's top "
      "badge no longer land on the same day")
check(re.search(r"\{\s*day:\s*30\s*,\s*mult:\s*3\s*\}", eco) is not None,
      "the ladder's top rung sits on day 30 with the badge",
      "the ladder's top rung left day 30 — it must move with the badge or the "
      "two systems tell two stories")

# ── C · the next rung is visible, on both surfaces, gain-framed ────────────
bar = read("src/components/SiteTopBar.tsx")
acct = read("src/components/AccountButton.tsx")
check("nextFireMilestone" in bar,
      "the top-bar well names the next rung",
      "the top bar no longer names the next rung — from day 7 the fire would "
      "again give no reason to look forward")
check("nextFireMilestone" in acct,
      "the account popover names the next rung",
      "the account popover no longer names the next rung")
for name, src in [("SiteTopBar", bar), ("AccountButton", acct)]:
    check("pays" in src,
          f"{name} frames the rung as what the day PAYS",
          f"{name} lost the gain-framing — the rung must be said as a payout")
banned = [w for w in ["don't lose", "you'll lose", "losing your streak",
                      "streak dies", "last chance", "hurry", "don't break"]
          if w in (bar + acct).lower()]
check(not banned, "no loss words on either surface",
      f"loss-framing found ({', '.join(banned)}) — the ethics floor forbids it")

shutil.rmtree(TMP, ignore_errors=True)
print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
