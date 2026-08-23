#!/usr/bin/env python3
"""
Patch 30 — the profile as ONE learner model (2026-08-22).

Dan designed this in Claude Design across a long iteration; the decisions the
build has to keep are the ones he made against earlier drafts, and each of them
is a thing a screenshot cannot check.

What this asserts (static, over source):

  1  ONE page, two routes. /moi and /profil both render ProfileContent; the old
     MoiContent and the old economy page are gone; neither route redirects.
  2  The shape: two always-visible act-on things (pinned goal, one next
     action), then FIVE collapsible rows in Dan's rhyming order with their
     bracketed glosses in lower case.
  3  What Dan REMOVED stays removed: CEFR labels, the weekly commitment, the
     N-level ring/XP bar, progress bars in the record, full-width buttons,
     the "→ SHOP" chip, DUE·WEAK tags on the re-drill tiles.
  4  The learner model is derived, not invented: coverage off the spine's
     `skill` field, the next action from a TEMPLATE (no AI), the goal storing
     only which outcome and by when.
  5  Tokens only — section accents from .fluo-h-*, accuracy on --tier-*, so
     "weak" never matches a section's identity.
  6  The bottom bar is the five families minus User.
  7  The footer's three doors, including the full history page.

Run from the repo root:  python3 verify/verify30-profile.py
"""
import os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

passed = failed = 0
def check(cond, ok, bad):
    global passed, failed
    if cond:
        passed += 1
        print(f"  ok    {ok}")
    else:
        failed += 1
        print(f"  FAIL  {bad}")

def read(p):
    try:
        with open(p, encoding="utf-8") as fh:
            return fh.read()
    except FileNotFoundError:
        return ""

def strip_comments(s):
    """Grep the CODE, not the file. Every one of these files explains in prose
    what Dan removed and why, so a bare `"A2" in source` fails on the sentence
    saying A2 is gone — the exact false positive verify27 hit with 'Accueil'."""
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return re.sub(r"^\s*//.*$", "", s, flags=re.M)

PROFILE = strip_comments(read("src/components/ProfileContent.tsx"))
REWARDS = strip_comments(read("src/components/Rewards.tsx"))
MODEL = read("src/lib/learnerModel.ts")
MOI = read("src/app/moi/page.tsx")
PROFIL = read("src/app/profil/page.tsx")
NAV = read("src/content/nav.ts")
HIST = read("src/app/moi/historique/HistoryContent.tsx")
PROGRESS = read("src/lib/progress.ts")

print("\n1 · one page, two routes")
check("<ProfileContent" in MOI and "<ProfileContent" in PROFIL,
      "/moi and /profil both render ProfileContent",
      "the two routes do not share one component")
check(not os.path.exists("src/app/moi/MoiContent.tsx"),
      "the old MoiContent is gone", "MoiContent.tsx is still there")
check("redirect(" not in MOI and "redirect(" not in PROFIL,
      "neither route redirects — both are live doors",
      "a route redirects; old links should land, not hop")
check("levelForXp" not in PROFILE and "levelForXp" not in REWARDS,
      "no N-level ring anywhere on the profile (Dan: 'we don't need levels lah')",
      "the level ring is back on the profile")

print("\n2 · the shape")
rows = re.findall(r'label: "([A-Z-]+)"', PROFILE[PROFILE.find("const ROWS"):PROFILE.find("] as const")])
check(rows == ["RE-DRILLS", "SKILLS", "FRILLS", "ILLS", "THRILLS"],
      f"five rows in Dan's order: {' · '.join(rows)}",
      f"rows are {rows}, expected RE-DRILLS · SKILLS · FRILLS · ILLS · THRILLS")
glosses = re.findall(r'gloss: "([^"]+)"', PROFILE)
check(glosses == ["showcase", "problems noted", "rewards"],
      "the three glosses are in lower case, in brackets after the rhyme",
      f"glosses are {glosses}")
check("DO THIS NEXT" in PROFILE and 'setWhy' in PROFILE and "Why this?" in PROFILE,
      "the one next action, with its 'Why this?' behind a button",
      "the next action or its WHY is missing")
check(PROFILE.count("setOpen((cur) => (cur === k ? null : k))") == 1,
      "one section open at a time",
      "the accordion does not close its siblings")

print("\n3 · what Dan removed stays removed")
for banned, why in (
    ("A2", "CEFR self-placement — nobody credibly reaches A2 in a 12-week A1 course"),
    ("DEVELOPING", "the CEFR band label"),
    ("role=\"progressbar\"", "the space-occupying progress bars"),
    ("→ SHOP", "the redundant shop chip"),
    ("DUE · WEAK", "the re-drill tags — SIO number, title, coloured % and nothing else"),
    ("this week", "the weekly commitment ('2/3'), dropped as unreadable"),
):
    check(banned not in PROFILE, f"no {banned!r} on the profile ({why})",
          f"{banned!r} is back on the profile — {why}")
check("w-full" not in PROFILE.split("const ROWS")[-1] or "min-h-[44px] rounded" in PROFILE,
      "actions are sized to their text, not full-width",
      "a full-width action button is back")

print("\n4 · the model is derived, not invented")
check('s.skill === skill' in MODEL,
      "skill coverage is counted off the spine's own `skill` field",
      "coverage invents its own skill taxonomy")
check("TEMPLATES[s.skill](" in MODEL and "fetch(" not in MODEL and "await " not in MODEL,
      "the next action is a template filled from SIO data — no model call, no network",
      "the next action is not template-driven, or it reaches the network")
check(re.search(r"goal\?:\s*\{\s*sio: string; by: string \| null\s*\}", PROGRESS) is not None,
      "the goal stores only WHICH outcome and BY WHEN",
      "the goal stores more than the commitment")
check("canDo" in PROFILE and "GoalPicker" in PROFILE,
      "the verbatim can-do appears when you open the goal, not on the pin",
      "the can-do sentence is not behind the goal picker")
check("weak: boolean" in MODEL and "due: boolean" in MODEL,
      "one queue, tagged with BOTH reasons (weak = accuracy, due = interval)",
      "the queue does not separate weak from due")

print("\n5 · tokens only")
hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", PROFILE) + re.findall(r"#[0-9a-fA-F]{3,8}\b", REWARDS)
check(not hexes, "no raw hex in the profile components", f"raw hex: {hexes}")
check("fluo-h-1" in PROFILE and "fluo-h-3" in PROFILE and "fluo-h-4" in PROFILE and "fluo-h-2" in PROFILE,
      "section accents come from the globals.css .fluo-h-* cards",
      "section accents are not the app's own card accents")
check("tierToken(" in PROFILE,
      "accuracy stays on --tier-* — a different scale from the section accents",
      "accuracy no longer uses the tier tokens")

print("\n6 · the bottom bar")
check("FAMILIES.filter" in NAV and 'f.key !== "user"' in NAV,
      "the bar is the five families minus User",
      "the bar is not the five families minus User")

print("\n7 · the footer's doors")
check("/activities" in PROFILE and "exportCsv" in PROFILE and "/moi/historique" in PROFILE,
      "DETAILS · EXPORT · HISTORY all resolve",
      "a footer door is missing")
check("SortableTable" in HIST and "CAP" not in HIST,
      "the history page is uncapped — completeness is its whole point",
      "the history page caps its lists")

print("-" * 66)
print(f"  {passed} passed · {failed} failed")
sys.exit(1 if failed else 0)
