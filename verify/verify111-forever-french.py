#!/usr/bin/env python3
"""
The course ends; the French doesn't (2026-09-07) — the second of the three
retention builds Dan kept in-house ("take 2 and pass 2 to peers", then "take
back those two items from peers").

The fault this fixes: at 50/50 `nextSioId` returns undefined, so Home's
Continue key — the app's loudest door — simply VANISHED on the day a learner
finished the course. Diplôme is a real ending (LAF1201 is a semester course),
so the fix does not invent a 51st goal: the key stays, wears the same win hue,
and points at revision — which spaced repetition makes the genuine forever
game, because words keep coming due for as long as a learner wants them.

Held here, each against a specific regression:

  1  THE BRANCH EXISTS AND FIRES ONLY AT THE END — `!activeSio` alone would
     also match a broken SIOS import; the guard must pair it with
     `doneTotal >= SIOS.length` so a data fault cannot congratulate anyone.
  2  IT POINTS AT /reviser — the forever-game claim is the destination; a
     key that celebrates and goes nowhere is a firework, not a door.
  3  GAIN-FRAMED — the copy says what continues, never what is over in loss
     words. verify32 bans the phrases app-wide; this pins the new surface.

Run from the repo root:  python3 verify/verify111-forever-french.py
"""
import os, re, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

src = open("src/app/HomeDashboard.tsx", encoding="utf-8").read()

check("!activeSio && doneTotal >= SIOS.length" in src,
      "the forever key fires only when all fifty are genuinely done",
      "the end-of-course guard is gone or loosened — either the key vanished "
      "again at 50/50, or a data fault could congratulate a fresh learner")

m = re.search(r"!activeSio && doneTotal >= SIOS\.length[\s\S]{0,900}?</Link>", src)
block = m.group(0) if m else ""
check('href="/reviser"' in block,
      "the key points at revision — the forever game has a door",
      "the end-of-course key no longer points at /reviser — a celebration "
      "with no destination")
check("Diplômé" in block,
      "the key names the achievement in the app's own French",
      "« Diplômé » is gone from the key — the rank/badge vocabulary and the "
      "ending no longer tell one story")
check("dopa-win" in block,
      "the key keeps the win hue — it is still the journey",
      "the end-of-course key lost the win hue Continue wears")
banned = [w for w in ["don't lose", "you'll lose", "losing", "streak dies",
                      "last chance", "hurry", "nothing left", "it's over"]
          if w in block.lower()]
check(not banned, "the ending is said by what continues, not by loss words",
      f"loss-framing on the forever key ({', '.join(banned)})")

print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
