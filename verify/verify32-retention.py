#!/usr/bin/env python3
"""
The retention build, pinned (approved 21 Aug 2026).

Six features, and the things about them that would regress silently:

  1. PWA manifest — the app had NO way back in. No manifest, no icon, so
     returning meant typing a URL on a device built around icons.
  2. Reward events — the pipeline fired on 2 of the 8 moments already tracked,
     and gave all of them the same fanfare. Now eight, on a size ladder.
  3. Floating +XP — XP was awarded on every right answer and shown nowhere at
     the time, so the multiplier was never seen paying out.
  4. Session receipts — most drills just stopped.
  5. Weekly leaderboard — cumulative boards are decided by week three.
  6. The two hero marks take their roles (course, streak).

The ETHICS constraints are checked too, because they are the part most likely
to erode under a "just one more nudge" change: the install prompt asks once
and never re-asks, and nothing in this build is loss-framed.

Run from the repo root:  python3 verify/verify32-retention.py
"""
import json, os, re, sys

PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

def code(p):
    """Source with comments stripped.

    verify19b learned this the hard way: a check that cannot tell code from
    prose reports its own documentation as a defect. The comment explaining
    why --fluo-danger was removed contains the string --fluo-danger.
    """
    s = re.sub(r"/\*[\s\S]*?\*/", "", read(p))
    return re.sub(r"(?m)^\s*//.*$", "", s)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── 1 · installable ────────────────────────────────────────────────────────
man = read("src/app/manifest.ts")
ok(bool(man), "the web app manifest exists", "src/app/manifest.ts is gone — nothing makes the site installable")
ok('display: "standalone"' in man, "the manifest asks for a standalone window",
   "the manifest no longer requests standalone — installing would just bookmark a tab")
ok('export const dynamic = "force-static"' in man,
   "the manifest route is static-export safe",
   "the manifest lost force-static — `next build` with output:export fails on it")
for icon in ["icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png"]:
    ok(os.path.isfile(f"public/icons/{icon}") and os.path.getsize(f"public/icons/{icon}") > 500,
       f"icon present: {icon}", f"MISSING or empty icon: public/icons/{icon}")
ok('purpose: "maskable"' in man, "a maskable icon is declared",
   "no maskable icon — launchers that crop to a circle will clip the binding")
lay = read("src/app/layout.tsx")
ok("apple-touch-icon" in lay, "iOS gets its own icon link (it ignores the manifest's)",
   "the apple-touch-icon link is gone — iOS installs lose the icon")

# ── 2 · the eight reward moments, on a ladder ─────────────────────────────
prog = read("src/lib/progress.ts")
for t in ["level", "badge", "streak", "multiplier", "sio", "unit", "mastery"]:
    ok(f'type: "{t}"' in prog, f"reward moment wired: {t}",
       f"reward moment LOST: {t} no longer fires from progress.finalize()")
ok('type: "perfect"' in read("src/components/SessionReceipt.tsx"),
   "reward moment wired: perfect (from the receipt, which owns the run context)",
   "the perfect-run celebration is gone")
toast = read("src/components/RewardToast.tsx")
ok('size === "full"' in toast and "sfx.stage" in toast,
   "the fanfare is reserved for the largest size",
   "the celebration ladder is gone — every moment would sound the same")
ok('"chime"' in toast, "the chime tier exists (a sound, no banner)",
   "the chime tier is gone — small moments would each raise a banner")

# ── 3 · the multiplier, visible ───────────────────────────────────────────
ok('"fluolingo:xp"' in prog, "every award announces itself on fluolingo:xp",
   "addXp no longer announces awards — the +XP float has nothing to show")
xf = read("src/components/XpFloat.tsx")
ok(bool(xf) and "fluolingo:xp" in xf, "the +XP float listens for awards",
   "XpFloat is missing or no longer listens")
ok("f.mult > 1" in xf, "the float shows the multiplier's arithmetic when one is live",
   "the float no longer shows the multiplier — the streak's value goes invisible again")
ok("XpFloat" in lay, "the +XP float is mounted globally",
   "XpFloat is not mounted — no drill would show it")

# ── 4 · receipts ──────────────────────────────────────────────────────────
rec = read("src/components/SessionReceipt.tsx")
ok(bool(rec), "the session receipt exists", "SessionReceipt.tsx is gone")
ok("useRunXp" in rec, "drills can report exactly what a run paid",
   "useRunXp is gone — receipts would have to re-derive XP and get it wrong")
# THE RECEIPT HAS NO HOST, and that is recorded here rather than hidden.
#
# Its only host was iComplete, whose route was deleted on 31 Aug (Dan: "iComplete
# is to be deleted"). But it had already gone dark a week earlier: #99 took away
# iComplete's door and #97 retired the activity, so no learner has been able to
# reach the receipt since — the deletion made an existing orphan visible, it did
# not create one. Re-hosting it is a drill-UX call (which run earns an end
# card?), not a side effect of cutting a route, so it is Dan's, and it is
# reported to him rather than guessed at here.
#
# What survives as a real check is the half that a re-host depends on: the
# component and `useRunXp` must both still be here and still agree, or whoever
# wires it next has to re-derive XP by hand and will get it wrong — which is the
# exact fault useRunXp was written to end.
hosts = []
for _root, _dirs, _files in os.walk("src"):
    for _f in _files:
        if _f.endswith((".ts", ".tsx")) and not _f.startswith("SessionReceipt"):
            if "SessionReceipt" in read(os.path.join(_root, _f)):
                hosts.append(os.path.join(_root, _f).replace(os.sep, "/"))
print(f"  note  the session receipt has {len(hosts)} host(s): {hosts or 'none since iComplete was cut, 31 Aug'}")

# ── 5 · the weekly race ───────────────────────────────────────────────────
ok("weekXp" in prog and "weekKey" in prog, "progress carries a weekly bucket",
   "the weekly XP bucket is gone")
ok("weekKey" in read("src/lib/dayKey.ts"), "week keys are derived the same way as day keys",
   "weekKey() is gone from dayKey — the reset would disagree with the learner's own day")
sync = read("src/lib/firebase/progressSync.ts")
ok("weekXp: p.weekXp" in sync, "the board publishes the weekly figure",
   "the weekly figure is no longer published — the board cannot rank by it")
rules = read("firestore.rules")
ok("'weekXp'" in rules and "'weekKey'" in rules,
   "the leaderboard rules admit the weekly fields",
   "SECURITY RULES would REJECT the write — and a denied write makes the client "
   "DELETE the learner's own board row")
board = read("src/components/LeaderboardList.tsx")
ok("rowWeekXp" in board and "r.weekKey === wk" in board,
   "a stale week reads as zero rather than winning this week's race",
   "the board no longer checks weekKey — last week's total could win this week")
ok("Around you" in board, "the neighbours view is there (position you can act on)",
   "the neighbours view is gone — back to a top-50 list nobody can move in")
ok('"week" | "term"' in board or "'week' | 'term'" in board,
   "both periods are available; the all-term standing is never lost",
   "the two-period toggle is gone")

# ── 6 · the two hero marks ────────────────────────────────────────────────
home = code("src/app/HomeDashboard.tsx")
ok("--fluo-danger" not in home,
   "nothing on the hero borrows the error token",
   "the hero is using --fluo-danger again — either the streak multiplier (the only "
   "coloured reward would be red) or the due-count badge (pending review work framed "
   "as failure, which the ethics constraint forbids)")
# The MARKS array went with the report card on 2026-08-26 (Dan's soft-3D
# draft), so the check is now on the tokens themselves rather than on the
# shape that used to carry them: the streak keeps its own role ink, and the
# three keys wear the roles that mean what they do.
ok("dopa-streak-ink" in home,
   "the streak still takes its own role ink",
   "the streak lost its role colour")
ok(all(t in home for t in ("--dopa-win", "--dopa-focus", "--dopa-reward")),
   "the three keys wear the roles that mean what they do",
   "a key on Home is no longer coloured by its role")

# ── ethics ────────────────────────────────────────────────────────────────
ip = read("src/components/InstallPrompt.tsx")
ok("MIN_VISITS" in ip and re.search(r"MIN_VISITS\s*=\s*[3-9]", ip),
   "the install prompt waits for a third visit",
   "the install prompt asks too early — before anyone has a reason to say yes")
ok("SEEN_KEY" in ip and 'localStorage.setItem(SEEN_KEY' in ip,
   "answering the install prompt is remembered — it asks once",
   "the install prompt no longer records the answer: it would re-ask")
ok("standalone()" in ip, "an installed app is never asked again",
   "the prompt no longer checks standalone — installed users would be nagged")
banned = [w for w in ["don't lose", "you'll lose", "losing your streak", "streak dies",
                      "last chance", "hurry"] if w in (ip + toast + rec).lower()]
ok(not banned, "nothing in the build is loss-framed",
   f"loss-framing found ({', '.join(banned)}) — the ethics constraint forbids it")

print("\n".join("  ok    " + m for m in PASS))
if FAIL: print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
