#!/usr/bin/env python3
"""
Patch 25, first rows — the hero shrink (2026-08-11).

Dan's reference standard: the DrillShell header bar — thin, static,
information-only. "Anywhere a progress bar or related header is oversized
relative to that standard, shrink it to match." The audit measured one
offender: the Home hero at 303px. It is now a ~99px card (measured at
390x844): chip row + two 3px hairlines + the paired actions.

What this asserts (the height itself is a screenshot's job):

  1  The hero heading and the 5.5-second byline animation are gone — the
     shell's wordmark already brands the page, and the byline kill is its
     own patch-25 row.
  2  The bars are hairlines with real progressbar roles, not bordered
     furniture.
  3  The actions (Continue, DéjàRevu) live INSIDE the hero card, paired
     side by side — the button-grouping rule.
  4  Every progress counter survives (litmus: learner feedback stays).

Run from the repo root:  python3 verify/verify25.py
"""
import os, re, sys

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

home = strip_comments(read("src/app/HomeDashboard.tsx"))
check(bool(home), "HomeDashboard exists", "src/app/HomeDashboard.tsx missing")

# 1 · heading + byline gone
check("Bienvenue sur" not in home,
      "the hero heading is gone (the shell wordmark already brands the page)",
      "the hero still greets — 'Bienvenue sur' is back")
check("fluo-byline" not in home and "BYLINE_STROKES" not in home and "heroPlayed" not in home,
      "the 5.5-second byline animation is gone",
      "the byline animation is back in the hero")

# 2 · hairlines with real roles
check(home.count("h-[3px]") == 2,
      "both progress lines are 3px hairlines",
      "the hero bars are not hairlines (expected exactly two h-[3px] tracks)")
check(home.count('role="progressbar"') == 2,
      "both hairlines carry a real progressbar role",
      "the hero hairlines lack progressbar roles")

# 3 · actions grouped in the card, side by side
sec_start = home.find("<section")
sec_end = home.find("</section>", sec_start)
hero = home[sec_start:sec_end]
check('aria-label="Continue"' in hero and 'aria-label="DéjàRevu"' in hero,
      "Continue and DéjàRevu live inside the hero card they act on",
      "the hero's actions float outside the card (button-grouping rule)")
cont = hero.find('aria-label="Continue"')
revu = hero.find('aria-label="DéjàRevu"')
check(cont >= 0 and revu >= 0 and "</div>" not in "" and abs(revu - cont) < 1400,
      "the two actions are paired, not scattered",
      "the two actions are far apart in the card")

# 4 · every counter survives
for marker, what in (
    ("doneTotal}/{SIOS.length", "the done-count chip"),
    ("progress.streak", "the streak chip"),
    ("progress.xp", "the XP chip"),
    ("progress.gems", "the gems chip"),
    ("{pct}%", "the course-completion percentage"),
    ("lvl.into}/{lvl.span", "the level XP counter"),
):
    check(marker in home,
          f"{what} survives the shrink",
          f"{what} was lost in the shrink — progress counters are learner feedback")

print("\npatch 25 check (hero rows)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
