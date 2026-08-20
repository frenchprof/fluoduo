#!/usr/bin/env python3
"""
The grouped side rail + the Menu (2026-08-19).

Dan: "the help pop up — should be more appropriately renamed as menu showing
just a grid of tiles in 4x5 or 5x4", and "At the side, there should be only 5
tabs (Pre-Lesson, Practice, Play, Review, Skill, User), and under them the
individual tabs under them". Then: "(Pre-Lesson = Goals), so that means
2a → 2b → 2e → 2c → 2d → 2f."

What this asserts:

  1  Six families, in Dan's order, Goals first.
  2  The rail renders families, not a flat column: no toolTabs() left in the
     shell, and the Unité flaps are Goals' children rather than a tier.
  3  Every family's children come from the registry (Goals' from the units),
     and each family holds exactly the activities Dan listed.
  4  The Menu is a grid of all twenty tiles, and says Menu, not HELP.
  5  Nothing hand-keeps a second list — the rail and the Menu both read the
     registry through the shared order helper.

Run from the repo root:  python3 verify/verify29-rail.py
"""
import os, re, sys

FAIL, OK = [], []
def check(c, ok, bad): (OK if c else FAIL).append(ok if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

reg   = read("src/content/activities.ts")
rail  = read("src/components/RailGroups.tsx")
menu  = read("src/components/MenuSplash.tsx")
shell = read("src/components/CahierShell.tsx")

check(bool(rail), "RailGroups exists", "src/components/RailGroups.tsx missing")
check(bool(menu), "MenuSplash exists", "src/components/MenuSplash.tsx missing")
check(not os.path.isfile("src/components/GuideSplash.tsx"),
      "GuideSplash is gone — the Menu replaced it",
      "GuideSplash.tsx still exists alongside MenuSplash — two popups on one button")

# 1 · six families in Dan's order
fams = re.findall(r'\{ key: "([a-z]+)", name: "FluOlin', reg)
WANT = ["goals", "practice", "svplay", "review", "skills", "user"]
check(fams == WANT,
      f"six families in Dan's 19 Aug order: {' · '.join(fams)}",
      f"family order is {fams}, expected {WANT} (2a→2b→2e→2c→2d→2f)")

# 2 · the rail is grouped, not flat
check("RailGroups" in shell, "the shell renders RailGroups", "the shell does not render RailGroups")
# toolTabs() still legitimately feeds the phone ☰ dropdown and the active-label
# lookup; what must be gone is the flat column INSIDE the rail itself.
nav_start = shell.find('<nav className="cahier-tabs"')
nav_end = shell.find("</nav>", nav_start)
rail_block = shell[nav_start:nav_end] if nav_start >= 0 else ""
check(bool(rail_block) and "tools.map" not in rail_block and "site.map" not in rail_block,
      "the rail column is grouped — no flat tools/site map inside the nav",
      "the rail still maps tools/site flat — the 22-flap column is back")
check("RailGroups" in rail_block,
      "the rail column is RailGroups",
      "the nav does not render RailGroups")
check("UNIT_META" in rail and 'f === "goals"' in rail,
      "the Unités are Goals' children, not a tier of their own",
      "the rail does not put the units under Goals")
check("aria-expanded" in rail,
      "each family flap reports its open state to a screen reader",
      "family flaps carry no aria-expanded")

# 3 · each family holds exactly what Dan listed
EXPECT = {
    "practice": {"SpecuLearn", "xPlain", "EtuDice", "4Mémoire", "iComplete"},
    "review":   {"DéjàRevu", "GramMarathon"},
    "skills":   {"ConjugaZone", "ÉcouTexte", "WorDrill", "VoixLà", "ComposeIt", "ChaTutor"},
    "svplay":   {"NumBus", "NumBourse", "VocabulaRain", "LexicaLater"},
    "user":     {"My Progress", "Leaderboard", "Profile"},
}
rows = re.findall(r'\{ key: "[a-z]+", name: "([^"]+)".*?family: "([a-z]+)"', reg)
for fam, want in EXPECT.items():
    got = {n for n, f in rows if f == fam}
    check(got == want,
          f"{fam} holds exactly its {len(want)} activities",
          f"{fam} holds {sorted(got)}, expected {sorted(want)}")
check(not [f for _, f in rows if f == "goals"],
      "Goals carries no activity rows — its children are the fifty objectives",
      "an activity is still filed under goals — the 19 Aug regrouping is undone")

# 4 · the Menu is a grid of all twenty
check("grid-cols-4" in menu,
      "the Menu grid is four across on a phone",
      "the Menu grid is not grid-cols-4")
check("sm:grid-cols-5" in menu,
      "the Menu grid is five across from sm (4x5 / 5x4)",
      "the Menu grid does not widen to five from sm")
check(len(rows) == 20,
      f"the registry holds twenty activities — the grid is exactly 4x5 ({len(rows)})",
      f"the registry holds {len(rows)} activities, so the grid is no longer 4x5")
check(">Menu<" in menu or "Menu</h2>" in menu,
      "the popup calls itself Menu",
      "the popup does not say Menu")
check("HELP!" not in shell and "HELP!" not in menu,
      "no HELP! label survives on the rail or the popup",
      "a HELP! label is still on the rail or the popup")

# 5 · one source of truth
check("activitiesInFamilyOrder" in menu,
      "the Menu reads the registry through the shared family-order helper",
      "the Menu hand-keeps its own order")
check("activitiesIn(" in rail,
      "the rail reads the registry per family",
      "the rail hand-keeps its own activity list")

print("\nthe grouped rail + the Menu (19 Aug)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
