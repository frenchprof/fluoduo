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
# The ☰ dropdown left CahierShell on 2026-08-31 — Dan wanted the menu reachable
# from a drill too, and the way to give DrillShell the same bar without a second
# copy of it was to make the bar its own component. So the dropdown's rules are
# unchanged; only the file holding them moved. Read it from ONE place, not from
# both concatenated: a check that passes off whichever file still has the markup
# is exactly how a stale duplicate survives.
topbar = read("src/components/SiteTopBar.tsx")

check(bool(rail), "RailGroups exists", "src/components/RailGroups.tsx missing")
check(bool(menu), "MenuSplash exists", "src/components/MenuSplash.tsx missing")
check(not os.path.isfile("src/components/GuideSplash.tsx"),
      "GuideSplash is gone — the Menu replaced it",
      "GuideSplash.tsx still exists alongside MenuSplash — two popups on one button")

# 1 · six families in Dan's order
fams = re.findall(r'\{ key: "([a-z]+)", name: "FluOL?in', reg)
WANT = ["goals", "practice", "svplay", "review", "skills", "user"]
check(fams == WANT,
      f"six families in Dan's 19 Aug order: {' · '.join(fams)}",
      f"family order is {fams}, expected {WANT} (2a→2b→2e→2c→2d→2f)")

# 2 · the rail is grouped, not flat
# `<RailGroups`, not "RailGroups": the import line and the comment explaining
# what RailGroups already lists both carry the word, so a substring test stayed
# green with the element deleted. Break-testing caught it — both of these
# assertions were vacuous, in this file's previous home as well as this one.
nocom_bar = re.sub(r"\{/\*[\s\S]*?\*/\}", "", topbar)
check("<RailGroups" in nocom_bar,
      "the site bar renders RailGroups",
      "the site bar does not render RailGroups")
# toolTabs() still legitimately feeds the phone ☰ dropdown and the active-label
# lookup; what must be gone is the flat column INSIDE the rail itself.
# WHERE THE GROUPED RAIL LIVES CHANGED ON 2026-08-30. Dan: the rail "cannot be
# flaps … they have to be drop down like in most interfaces", with "burger menu
# left, flaps right". So RailGroups moved OFF the desk and into the ☰ dropdown,
# which is now the navigation at every width rather than a phone stand-in. The
# rule it must still obey is the same one, in its new home: grouped, never a
# flat column.
menu_start = nocom_bar.find("absolute left-0 top-full")
menu_end = nocom_bar.find("</div>", nocom_bar.find("tools.filter", menu_start)) if menu_start >= 0 else -1
menu_block = nocom_bar[menu_start:menu_end] if menu_start >= 0 else ""
check(bool(menu_block) and "site.map" not in menu_block,
      "the ☰ dropdown is grouped — no flat site map inside it",
      "the ☰ dropdown maps site flat — it disagrees with the families again")
check("<RailGroups" in menu_block,
      "the ☰ dropdown renders RailGroups",
      "the ☰ dropdown does not render RailGroups — the grouped families are gone")
# tools.map WHOLE would duplicate the families (SpecuLearn and 4Mémoire twice);
# only Carte, which belongs to no family, may come through.
check("tools.map" not in menu_block,
      "the dropdown does not re-list every activity under the families",
      "the dropdown renders tools.map whole — activities appear twice")
# The desk keeps only this page's own flaps, on the right.
nav_start = shell.find('<nav className="cahier-tabs"')
nav_end = shell.find("</nav>", nav_start)
rail_block = shell[nav_start:nav_end] if nav_start >= 0 else ""
check(bool(rail_block) and "RailGroups" not in rail_block,
      "the desk nav holds page flaps only, not the site rail",
      "the six-family rail is back on the desk — it belongs in the ☰")
check("UNIT_META" in rail and 'f === "goals"' in rail,
      "the Unités are Goals' children, not a tier of their own",
      "the rail does not put the units under Goals")
check("aria-expanded" in rail,
      "each family flap reports its open state to a screen reader",
      "family flaps carry no aria-expanded")

# 3 · each family holds exactly what Dan listed
EXPECT = {
    # Dan, 2026-08-23: rename xPlain → Memo, approved surface #3.
    # Sorting was CUT on 2026-08-31 ("sorting is cut") — off navigation the way
    # Match It went, registry row gone and route kept.
    # iComplete RETIRED the same day ("we can retire CompleteIt … it will be
    # part of Memo's activities") — the Memo's Moyen/Difficile tiers are one-
    # and two-piece completion, so `practice` is three.
    # Dan, 2026-08-25: rename EtuDice → Sorting — the tile opened the group
    # sort, not the die. "EtuDice" now names only the d12 in the pager.
    "practice": {"SpecuLearn", "Memo", "4Mémoire"},
    "review":   {"DéjàRevu", "GramMarathon"},
    "skills":   {"ConjugaZone", "ÉcouTexte", "WorDrill", "VoixLà", "ComposeIt", "ChaTutor"},
    # 31 Aug consolidations, Dan's words: "park NumBus / NumBourse under a
    # hub-tab Numbers … MyProgress should be swallowed by Profile. So that
    # would be 16 (4x4)". Both game routes and /moi survive off-tile.
    "svplay":   {"Numbers", "VocabulaRain", "LexicaLater"},
    "user":     {"Leaderboard", "Profile"},
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

# 4 · the Menu is Dan's 4x4
check("grid-cols-4" in menu,
      "the Menu grid is four across",
      "the Menu grid is not grid-cols-4")
check("sm:grid-cols-5" not in menu,
      "the Menu stays 4x4 at every width (Dan, 31 Aug: '16 (4x4)')",
      "the Menu widens to five across again — sixteen tiles leave a hole there")
check(len(rows) == 16,
      f"the registry holds sixteen activities ({len(rows)}) — Dan's 4x4",
      f"the registry holds {len(rows)} activities, expected 16 — Dan's 4x4 "
      "(31 Aug: Sorting cut, iComplete retired, NumBus+NumBourse under one "
      "Numbers hub, My Progress folded into Profile). If a tile is added or "
      "removed, change this number on purpose.")
check(">Menu<" in menu or "Menu</h2>" in menu,
      "the popup calls itself Menu",
      "the popup does not say Menu")
check("HELP!" not in shell and "HELP!" not in topbar and "HELP!" not in menu,
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
