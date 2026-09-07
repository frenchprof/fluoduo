#!/usr/bin/env python3
"""
The lucky find (2026-09-06) — Dan, after a breakdown of variable-ratio reward:
"Craving — add surprise".

Before this, nothing in the app could surprise a learner. Every payout was a
constant: 60 for a right answer, 20 for a wrong one, 300 for an objective,
badges at 1 / 10 / 25 / 50. A learner who had used the app for a week could
predict every number it would ever show them.

The find is the one unpredictable thing — and unguarded variable reward is a
slot machine, so this check exists to hold the four guards that stop it being
one. All four are BEHAVIOURAL: economy.ts is compiled and luckyFind is run for
real, thousands of times, because every one of these properties is arithmetic
that a plausible-looking edit can invert without changing a single identifier.

  1  IT PAYS GEMS, NOT XP.  XP drives the level, the rank and the leaderboard,
     and this app's rule is that a receipt states the EXACT amount an answer
     pays. Random XP breaks both. Gems buy cosmetics and gate nothing.
  2  SEEDED, NOT ROLLED.  The outcome is a hash of (item, day), so re-answering
     the same item cannot reroll it — otherwise a learner fishes for drops by
     repeating one card, and the SRS records the fishing as study.
  3  A PITY FLOOR AND A DAILY CAP.  A find is guaranteed by the FIND_PITY-th
     dry answer (the surprise is in WHEN, never in WHETHER), and finds stop
     paying past FIND_DAILY_CAP gems a day so the loop cannot become the reason
     to practise.
  4  NEVER NEGATIVE.  No loss, no near-miss. Hearts were removed from this app
     for punishing errors; a find that could take something away would walk
     that back in a new costume.

Run from the repo root:  python3 verify/verify109-lucky-find.py
"""
import json, os, re, shutil, subprocess, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── A · behaviour: compile economy.ts and run luckyFind for real ───────────
# economy.ts's only import is `import type { Progress }`, which erases, so the
# emitted module has no requires and can be loaded straight into node. The
# generated tsconfig exists only to resolve the "@/*" path alias for the
# typechecker; nothing in the emitted JS depends on it.
TMP = ".tmp-verify-find"
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
      "economy.ts did not emit — luckyFind could not be executed")

CASES = r"""
const e = require("%s");
const out = [];
const t = (name, got, want) => out.push([name, got, want, got === want]);

const S = e.FIND_SMALL, B = e.FIND_BIG, CAP = e.FIND_DAILY_CAP, PITY = e.FIND_PITY;
const seeds = [];
for (let i = 0; i < 5000; i++) seeds.push("SIO-" + i + ":2026-09-06");

// -- the shape of a find: only ever nothing, small or big, never negative ---
const sizes = new Set(seeds.map((s) => e.luckyFind(s, 0, 0)));
t("a find is 0, FIND_SMALL or FIND_BIG and nothing else",
  [...sizes].every((v) => v === 0 || v === S || v === B), true);
t("no find is ever negative", [...sizes].every((v) => v >= 0), true);
t("FIND_SMALL and FIND_BIG both pay something", S > 0 && B > S, true);

// -- guard 2: seeded, not rolled ------------------------------------------
// The same answer, asked a hundred times, must answer the same way. A reload,
// a re-render or a second call in the same tick cannot reroll it.
const once = e.luckyFind("SIO-007:2026-09-06", 3, 4);
let stable = true;
for (let i = 0; i < 100; i++) if (e.luckyFind("SIO-007:2026-09-06", 3, 4) !== once) stable = false;
t("the same seed always gives the same find", stable, true);
// ...and different seeds must NOT all agree, or the find is a constant.
t("different seeds give different finds", new Set(seeds.slice(0, 200).map((s) => e.luckyFind(s, 0, 0))).size > 1, true);

// -- the rate: surprising, not constant -----------------------------------
const hits = seeds.filter((s) => e.luckyFind(s, 0, 0) > 0).length;
const rate = hits / seeds.length;
t("a fresh answer finds something sometimes, not always (5-25%%)",
  rate > 0.05 && rate < 0.25, true);
const big = seeds.filter((s) => e.luckyFind(s, 0, 0) === B).length;
t("the big find is the rare one", big > 0 && big < hits / 3, true);

// -- guard 3a: the pity floor ---------------------------------------------
// One dry answer short of the floor, EVERY seed pays. The surprise is in when.
t("the pity floor pays every seed", seeds.every((s) => e.luckyFind(s, PITY - 1, 0) > 0), true);
t("one answer earlier, not every seed pays",
  seeds.some((s) => e.luckyFind(s, PITY - 2, 0) === 0), true);

// -- guard 3b: the daily cap ----------------------------------------------
t("nothing is found once the cap is reached",
  seeds.every((s) => e.luckyFind(s, PITY - 1, CAP) === 0), true);
t("past the cap is still nothing, never a refund",
  seeds.every((s) => e.luckyFind(s, PITY - 1, CAP + 500) === 0), true);
const room = seeds.map((s) => e.luckyFind(s, PITY - 1, CAP - 1));
t("a find is clipped to the room left under the cap",
  room.every((v) => v <= 1) && room.some((v) => v === 1), true);
t("a day's finds can never exceed the cap",
  seeds.every((s) => { let got = 0; for (let i = 0; i < 400; i++) got += e.luckyFind(s + ":" + i, PITY - 1, got); return got <= CAP; }), true);

// -- the guards are set to sane values, not disabled ----------------------
t("the cap is a real ceiling, not a formality", CAP > 0 && CAP < 200, true);
t("the pity floor is reachable in a sitting", PITY > 1 && PITY <= 40, true);

console.log(JSON.stringify(out));
""" % os.path.abspath(built)

if os.path.isfile(built):
    n = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    check(n.returncode == 0, "luckyFind executed against 5000 seeds",
          f"node run failed: {n.stderr[-400:]}")
    if n.returncode == 0:
        for name, got, want, ok in json.loads(n.stdout.strip().splitlines()[-1]):
            check(ok, f"behaviour: {name}",
                  f"behaviour BROKEN: {name} — got {got!r}, wanted {want!r}")
shutil.rmtree(TMP, ignore_errors=True)

# ── B · guard 1 + the wiring: gems, on the paying attempt, once ────────────
prog = strip_comments(read("src/lib/progress.ts"))

check("luckyFind" in prog, "progress.ts calls luckyFind",
      "nothing calls luckyFind — the find is dead code")

# It rides the SAME `award` gate as the XP. That gate already means "first
# attempt on this item in this run", so a learner cannot answer, undo and
# answer again to fish for a drop. Wire the find outside it and the anti-farm
# guard in economy.ts is bypassed without a line of it changing.
check(re.search(r"const\s+find\s*=\s*award\s*\?\s*luckyFind\(", prog),
      "the find rides the `award` gate — one attempt, one chance",
      "the find is not gated on `award`: a re-attempt can fish for a drop")

# Guard 1, held at the one line that spends it.
check(re.search(r"gems:\s*p\.gems\s*\+\s*find", prog),
      "the find is paid into gems",
      "the find is not added to the gem balance")
check(not re.search(r"(xp|weekXp)\s*:\s*[^,\n]*\bfind\b", prog),
      "the find never touches XP (the rank and the leaderboard stay earned)",
      "the find is being paid into XP — a rank would stop meaning work done")

# The seed carries the day, so the find turns over at the same 04:00 rollover
# as the streak; and it is a hash, never Math.random, or every reload rerolls.
check(re.search(r"luckyFind\(`\$\{itemId\}:\$\{[^}]*findDay[^}]*\}`", prog),
      "the seed is (item, day) — one chance per item per day",
      "the find's seed is not (item, day)")
check("Math.random" not in strip_comments(read("src/lib/economy.ts")),
      "economy.ts rolls nothing at random",
      "economy.ts uses Math.random — a reload would reroll the find")

# The books survive a corrupt blob. `findGems: \"40\"` from a hand-edited save
# or a half-written sync makes `CAP - foundToday` NaN, NaN fails every
# comparison, and the learner's balance is NaN forever. A spread default cannot
# catch it: the key IS there, it just is not a number.
for f in ("findGems", "findDry"):
    check(re.search(r"p\.%s\s*=\s*Number\.isFinite\(" % f, prog),
          f"normalize() guards {f} against a non-number",
          f"normalize() lets a non-number {f} through — the cap goes NaN")

# The daily counter resets with the day; the pity counter does not, or every
# day would start owing the learner a find.
check(re.search(r"findGems:\s*p\.findDay\s*===\s*today\s*\?", prog),
      "the day's found-gems reset when the day turns",
      "the daily find counter does not roll over")
check(re.search(r"findDry:\s*p\.findDry\s*\?\?\s*0", prog),
      "the dry run carries across midnight (the floor is a run, not a date)",
      "the pity counter resets nightly — every day would start owing a find")

# ── C · the learner is told ────────────────────────────────────────────────
toast = strip_comments(read("src/components/RewardToast.tsx"))
check(re.search(r'case\s+"find"', toast),
      "RewardToast shows the find",
      "a find pays silently — the surprise never reaches the learner")
check(re.search(r'type:\s*"find"', prog),
      "progress.ts announces the find on fluolingo:reward",
      "nothing announces the find")

# ONE COLOUR, ONE MEANING (Dan, 6 Sep, sent the find back for wearing amber).
# The find shipped in the `joy` role for a day. Joy is the app's XP colour —
# it is the +20 float and the receipt's XP line — so the banner said "XP"
# while the code paid GEMS. Two currencies, one colour.
#
# This is read from the SOURCE rather than pinned to the string "flow", so it
# still holds if the palette is re-cut or a role renamed: whatever the find
# wears, it must not be the role the XP float wears, the role the streak toast
# wears, or either of the two reds — a find often lands on a WRONG answer, and
# a reward in the failure colour reads worst exactly when it fires most.
def role_of(src, kind):
    # Everything up to the NEXT `case`, then the role inside it. The first
    # version of this stopped at the first ";" — which held only while every
    # arm was a one-line return, and went None the moment the streak arm grew
    # a `const` (7 Sep). A dead role_of makes three colour assertions vacuous
    # rather than loud, so the boundary is now the thing that actually bounds
    # an arm.
    m = re.search(r'case\s+"%s":((?:(?!\bcase\s+")[\s\S]){0,600})' % kind, src)
    if not m:
        return None
    r = re.search(r'role:\s*"([a-z]+)"', m.group(1))
    return r.group(1) if r else None


find_role = role_of(toast, "find")
streak_role = role_of(toast, "streak")
xp_role = re.search(r"--dopa-([a-z]+)-ink", read("src/components/XpFloat.tsx"))
xp_role = xp_role.group(1) if xp_role else None
check(find_role and streak_role and xp_role,
      f"the roles are readable (find={find_role}, streak={streak_role}, xp={xp_role})",
      f"could not read a role (find={find_role}, streak={streak_role}, xp={xp_role})")
check(find_role and find_role != xp_role,
      "the find does not wear the XP colour (gems and XP are different money)",
      f"the find wears {find_role!r}, which is the XP float's colour — one colour, two currencies")
check(find_role and find_role != streak_role,
      "the find does not wear the streak's colour",
      f"the find wears {find_role!r}, which already means the streak fire")
check(find_role not in ("miss", "reward"),
      "the find is not a red — it often lands on a wrong answer",
      f"the find wears {find_role!r}, a red: the reward would flash in the failure colour")

# THE TILE CARRIES THE COLOUR (Dan, 6 Sep: "The 'You found' tile should be in
# color ?!" and "it looks too fade"). The banner was `bg-white` with the role
# reaching only the border and the icon disc, so a badge, a level-up, a streak
# and a find were four white cards that differed by a hairline.
check("bg-white" not in toast,
      "the reward tile is filled with its role, not white",
      "the reward tile is back to bg-white — every celebration looks the same again")
check(re.search(r"background:\s*fill\b", toast),
      "the tile's background IS the role's fill",
      "the tile does not take the role's fill")

# ...and the type asks the role what colour it may be. This is the assertion
# that matters most: on a full fill, ink works for flow/reward/win/joy and
# FAILS for streak/focus/miss (3.19–3.28:1), white does the exact opposite.
# Every role already ships the right answer as --dopa-X-on. A hardcoded ink
# here looks correct in a mock-up and ships the streak banner unreadable.
check(re.search(r"const\s+on\s*=\s*`var\(--dopa-\$\{toast\.role\}-on\)`", toast),
      "the tile reads its text colour from the role's own -on token",
      "the tile does not use --dopa-<role>-on for its text")
titles = re.findall(r"<p className=\"truncate[^\"]*\"[^>]*style=\{\{\s*color:\s*(\w+)\s*\}\}", toast)
check(len(titles) == 2 and set(titles) == {"on"},
      "both lines of the tile take the role's -on colour",
      f"the tile's text is not the role's -on colour (found {titles!r}) — "
      "a constant here fails on half the palette")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} problem(s), {len(OK)} ok")
    sys.exit(1)
print(f"\nall {len(OK)} checks pass")
