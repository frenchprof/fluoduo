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
PROFIL = read("src/app/profil/embed/page.tsx")
NAV = read("src/content/nav.ts")
HIST = read("src/app/moi/historique/HistoryContent.tsx")
PROGRESS = read("src/lib/progress.ts")

print("\n1 · one page, two routes")
# STRONGER SINCE 2026-09-11, not weaker. The claim was "/moi and /profil render
# the same component, so the two routes cannot drift". They are now literally
# one page: /moi forwards into the User page's Me tab, and that tab's twin is
# the only thing rendering ProfileContent. Two routes, one page, checked as
# such — a /moi that stopped forwarding, or a Me tab that stopped rendering the
# profile, each fails here.
check('tab="me"' in MOI and "UserTabRedirect" in MOI,
      "/moi forwards into the User page's Me tab",
      "/moi no longer forwards to the one User page — the two routes can drift again")
check("<ProfileContent" in PROFIL,
      "the Me tab's twin renders ProfileContent",
      "the Me tab stopped rendering ProfileContent, so /moi forwards to a panel without the profile in it")
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
# THE BRACKETS ARE GONE (Dan, 2026-09-11): "am trying to explore deleting the
# english in brackets and putting an emoji at the start of the line instead".
# This used to pin the three glosses — FRILLS (showcase), ILLS (problems
# noted), THRILLS (rewards). It now pins what replaced them, and pins it
# harder, because a glyph can fail in a way a word cannot: by meaning two
# things at once.
check("gloss:" not in PROFILE,
      "no bracketed English is left on the rows",
      "a gloss came back — the brackets were deleted on 2026-09-11")
glyphs = re.findall(r'emoji: "([^"]+)"', PROFILE[PROFILE.find("const ROWS"):PROFILE.find("] as const")])
check(len(glyphs) == 5,
      "all five rows lead with a glyph",
      f"{len(glyphs)} of 5 rows have one — a row with no glyph and no gloss is a bare rhyme")
check(len(set(glyphs)) == len(glyphs),
      "the five glyphs are all different",
      f"two rows share a glyph: {[g for g in glyphs if glyphs.count(g) > 1]}")
# The reward MARKS live in this same file (🔥 ⭐ 💎 🏅) and sit on the THRILLS
# row itself. A row glyph that is also a mark puts one symbol on two meanings
# in one line — caught exactly this way on 2026-09-11, when THRILLS led with
# the 🏅 that already counted its badges.
# Compare BARE codepoints: "\N{SPARKLES}\ufe0f" and "\N{SPARKLES}" are the same
# symbol on screen, and a row glyph written with the variation selector would
# never match a mark written without it — which is how this check passed a
# straight reuse of the badge mark the first time it was tried.
bare = lambda t: "".join(c for c in t if c != "\ufe0f")
marks = re.findall(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]', bare(PROFILE[PROFILE.find("function RewardMarks"):]))
clash = sorted({bare(g) for g in glyphs} & set(marks))
check(not clash,
      "no row glyph is also one of the reward marks",
      f"{clash} is both a row's glyph and a mark inside a row — one symbol, two meanings")
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
# THE PINNED GOAL CAME OFF THE PROFILE (Dan, 2026-09-11: "There is no need for
# the black strip and the words above the black strip. Start directly after the
# 4 tabs with REDRILLS"). The black strip WAS the goal pin, and opening it was
# the only way to set a goal-and-a-date, so the picker and the can-do sentence
# behind it went with the strip.
#
# The storage is untouched — `progress.goal` still exists and still holds only
# {sio, by}, asserted above — so nothing a learner already pinned is lost and
# the feature can come back behind any control Dan wants. What this now guards
# is that it stays GONE FROM THE PANEL rather than creeping back onto the top
# of the page, and that no half-removed remnant is left behind.
check("GoalPicker" not in PROFILE and "setPicking" not in PROFILE,
      "the goal pin is off the profile panel, with no remnant left",
      "the goal strip or its picker is back on the panel Dan asked to open on RE-DRILLS")
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
check("/map" in PROFILE and "exportCsv" in PROFILE and "/moi/historique" in PROFILE,
      "MAP · EXPORT · HISTORY all resolve",
      "a footer door is missing")
check("SortableTable" in HIST and "CAP" not in HIST,
      "the history page is uncapped — completeness is its whole point",
      "the history page caps its lists")

print("-" * 66)
print(f"  {passed} passed · {failed} failed")
sys.exit(1 if failed else 0)
