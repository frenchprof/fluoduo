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
  4  RETIRED 2026-09-09 with its subject. This described MenuSplash — the
     twenty-tile popup Help used to open. Dan: "help should open to a 'How to
     use' manuel, not another grid menu. We can retire the older grid menu
     that it opens to." The file is gone, so the assertions about its shape
     went with it rather than being kept alive against nothing. In their place,
     at the top: MenuSplash must STAY gone, and both help doors — the ☰ tile
     and HelpDot — must point at /guide.
  5  Nothing hand-keeps a second list — the RAIL reads the registry through
     the shared order helper. (The Menu's half of this went with 4: the ☰ grid
     that replaced it lists Dan's seven rows by hand, from his own drawing.)

Run from the repo root:  python3 verify/verify29-rail.py
"""
import os, re, sys

FAIL, OK = [], []
def check(c, ok, bad): (OK if c else FAIL).append(ok if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

reg   = read("src/content/activities.ts")
# RailGroups retired 2026-09-09 too — see the second inverted check below.
# MenuSplash retired 2026-09-09 — see the inverted check below.
shell = read("src/components/CahierShell.tsx")
# The ☰ dropdown left CahierShell on 2026-08-31 — Dan wanted the menu reachable
# from a drill too, and the way to give DrillShell the same bar without a second
# copy of it was to make the bar its own component. So the dropdown's rules are
# unchanged; only the file holding them moved. Read it from ONE place, not from
# both concatenated: a check that passes off whichever file still has the markup
# is exactly how a stale duplicate survives.
topbar = read("src/components/SiteTopBar.tsx")

# INVERTED 2026-09-09, for the same reason as MenuSplash below and by the same
# ruling that retired it. RailGroups was the SIX coloured flaps Dan asked for on
# 3 Sep; his 3x5 grid replaced them in the ☰ on 7 Sep ("replace the burger menu
# that comes down like this with this 3x5 grid instead"), and this file's own
# comment then kept the component on disk "for MenuSplash until that surface is
# re-judged". MenuSplash was judged on 9 Sep and retired, which spent the last
# reason to keep RailGroups.
#
# It was not inert while it sat there. It still spoke the SIX-family world —
# its `owningFamily` maps "goals", a family renamed Lesson when the menu became
# seven — so a session reading it would have found a confident, obsolete account
# of an architecture that had already changed twice under it.
check(not os.path.isfile("src/components/RailGroups.tsx"),
      "RailGroups is gone — the ☰ grid is the menu",
      "src/components/RailGroups.tsx is back; Dan replaced the flaps with the "
      "3x5 grid on 7 Sep and MenuSplash, its last caller, retired on 9 Sep")
# INVERTED 2026-09-09. This asserted "MenuSplash exists" — the twenty-tile
# grid the Help button opened. Dan retired it: *"help should open to a 'How to
# use' manuel, not another grid menu. We can retire the older grid menu that it
# opens to."*
#
# The claim flips rather than disappearing, because the failure this file now
# has to catch is the opposite one: a second grid menu growing back behind Help
# while the ☰ grid is already the way to go somewhere. MenuSplash's own header
# recorded that it had replaced a quick-guide popup on the grounds that "what a
# learner reached for that button to do was GO somewhere" — true in August,
# when there was no ☰ grid, and false once there was. Two grids answered the
# going-somewhere question twice and left "how does this app work?" unanswered.
check(not os.path.isfile("src/components/MenuSplash.tsx"),
      "MenuSplash is retired — Help opens the manual, not a second grid",
      "src/components/MenuSplash.tsx is back — Help must open /guide, the "
      "manual, not another grid menu (Dan, 2026-09-09)")
check(not os.path.isfile("src/components/GuideSplash.tsx"),
      "GuideSplash is gone too — /guide is the one manual",
      "GuideSplash.tsx is back — the manual lives at /guide, as a page, and a "
      "popup copy of it is the duplicate this line has guarded since August")
# AND HELP ACTUALLY POINTS AT IT. The two checks above are absences, and an
# absence cannot tell you the door leads anywhere — deleting the splash and
# leaving Help inert would satisfy both. The ☰'s Help tile and HelpDot (the "?"
# on the immersive pages, which have no ☰) must each name /guide.
helpdot = read("src/components/HelpDot.tsx")
grid    = read("src/components/MenuGrid.tsx")
check('href="/guide"' in helpdot and 'href="/guide"' in grid,
      "both help doors — the ☰ tile and HelpDot — open /guide",
      "a help door does not point at /guide: the ☰ tile and HelpDot must both "
      "open the manual (Dan, 2026-09-09)")

# 1 · SEVEN families now (2026-09-09: Skills retired, split into Oral and
# Tools), in Dan's grid-menu row order: Lesson · Practice · Review · Games ·
# Oral · Tools · User.
fams = re.findall(r'\{ key: "([a-z]+)", name: "FluOL?in', reg)
WANT = ["goals", "practice", "review", "svplay", "oral", "tools", "user"]
check(fams == WANT,
      f"seven families in Dan's 9 Sep row order: {' · '.join(fams)}",
      f"family order is {fams}, expected {WANT}")

# 2 · the rail is grouped, not flat
# `<RailGroups`, not "RailGroups": the import line and the comment explaining
# what RailGroups already lists both carry the word, so a substring test stayed
# green with the element deleted. Break-testing caught it — both of these
# assertions were vacuous, in this file's previous home as well as this one.
nocom_bar = re.sub(r"\{/\*[\s\S]*?\*/\}", "", topbar)
# THE DROPDOWN'S TENANT CHANGED AGAIN on 7 Sep (Dan, with a screenshot:
# "replace the burger menu that comes down like this with this 3x5 grid
# instead"). RailGroups retired from the bar; MenuGrid — his picture, tile
# for tile — is the menu, and the grouped-never-flat rule survives as
# family-coloured ROWS instead of family-labelled groups. RailGroups.tsx
# stays on disk for MenuSplash until that surface is re-judged.
check("<MenuGrid" in nocom_bar,
      "the site bar renders the ☰ grid menu",
      "the site bar does not render MenuGrid — Dan's 3x5 menu is gone")
# toolTabs() still legitimately feeds the phone ☰ dropdown and the active-label
# lookup; what must be gone is the flat column INSIDE the rail itself.
# WHERE THE GROUPED RAIL LIVES CHANGED ON 2026-08-30. Dan: the rail "cannot be
# flaps … they have to be drop down like in most interfaces", with "burger menu
# left, flaps right". So RailGroups moved OFF the desk and into the ☰ dropdown,
# which is now the navigation at every width rather than a phone stand-in. The
# rule it must still obey is the same one, in its new home: grouped, never a
# flat column.
menu_start = nocom_bar.find("absolute left-0 top-full")
menu_end = nocom_bar.find("</div>", nocom_bar.find("MenuGrid", menu_start)) if menu_start >= 0 else -1
menu_block = nocom_bar[menu_start:menu_end] if menu_start >= 0 else ""
check(bool(menu_block) and "site.map" not in menu_block,
      "the ☰ dropdown is grouped — no flat site map inside it",
      "the ☰ dropdown maps site flat — it disagrees with the families again")
check("<MenuGrid" in menu_block,
      "the ☰ dropdown renders the grid",
      "the ☰ dropdown does not render MenuGrid — the grouped families are gone")
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
# SUPERSEDED 3 Sep (Dan, 2 Sep: "we do not need children tabs anymore";
# 3 Sep: "i seriously need the fix for the burger menu shortened and plain
# to colored tabs"). The accordion and its children rows are gone — the six
# flaps are LINKS to their family hubs, coloured by family. What the two
# retired assertions guarded (units reachable under Goals, disclosure state
# announced) is now: no disclosure exists to announce, and the units are
# reached through Home/the map — so the claims become: every flap navigates,
# and every flap wears its own family's colour.
# THE THREE FLAP-SHAPE ASSERTIONS RETIRED WITH THEIR SUBJECT (9 Sep). They
# pinned the accordion's absence, each flap's href and family wash, and the
# FluOLinGo Hand on its label — all true of a component nothing renders any
# more. A check that describes deleted code is worse than no check: it passes
# forever, and it blocks whoever finally deletes the file.
#
# What they were really protecting has a live owner. The ☰ grid's colours are
# verify96 (the twelve-swatch palette, exact hexes); its rows and their order
# are section 1 above, which reads Dan's seven families out of FAMILIES.

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
    # BY KEY, NOT BY DISPLAY NAME, since 1 Sep. This listed the names, and on
    # that day Dan renamed two of them (4Mémoire → MémoiRecall, Memo →
    # MneMemo) — so a check about which activities live in which FAMILY failed
    # over a change that moved nothing. The repo's own precedent settles it:
    # "display renames never touch keys or routes" (the Memo rename, 23 Aug).
    # The claim here is membership; the key is what membership is made of.
    # CONJUGAZONE MOVED HERE ON 7 SEP (Dan: "in case you haven't noticed
    # ConjugaZone's placement moved twice on 7 Sep and settled at the QC
    # merge (Dan: "ConjugaZone will henceforth sit in Blue") — the Revise
    # family, where his 3x5 menu screenshot also drew it.
    "practice": {"speculearn", "lesson", "flip"},
    "review":   {"reviser", "grammarathon", "conjugaison"},
    # SKILLS RETIRED 2026-09-09, split into Oral (the three spoken ones) and
    # Tools (the two summonable helpers) — see AGENTS.md and the FAMILIES
    # comment in activities.ts.
    "oral":     {"ecoutexte", "wordrill", "tts"},
    "tools":    {"compose", "tutor"},
    # 31 Aug consolidations, Dan's words: "park NumBus / NumBourse under a
    # hub-tab Numbers … MyProgress should be swallowed by Profile. So that
    # would be 16 (4x4)". Both game routes and /moi survive off-tile.
    "svplay":   {"numbers", "vocabularain", "lexicalator"},
    # SETTINGS JOINED USER 2026-09-09 — the grid menu's third User slot
    # (Réglages had a page but no tile before).
    "user":     {"leaderboard", "profil", "reglages"},
}
rows = re.findall(r'\{ key: "([a-z0-9]+)", name: "[^"]+".*?family: "([a-z]+)"', reg)
for fam, want in EXPECT.items():
    got = {n for n, f in rows if f == fam}
    check(got == want,
          f"{fam} holds exactly its {len(want)} activities",
          f"{fam} holds {sorted(got)}, expected {sorted(want)}")
check(not [f for _, f in rows if f == "goals"],
      "Goals carries no activity rows — its children are the fifty objectives",
      "an activity is still filed under goals — the 19 Aug regrouping is undone")

# 4 · RETIRED WITH THEIR SUBJECT, 2026-09-09 — not relaxed.
#
# Four assertions here described MenuSplash's own shape: four columns, never
# five, a heading reading "Menu", and no "HELP!" left on it. Dan retired the
# whole surface ("we can retire the older grid menu that it opens to"), so
# they no longer describe anything. A check kept alive against a deleted file
# is worse than a deleted check: it reads as coverage while asserting nothing.
#
# What SURVIVES is everything that was never about the popup — the registry
# count below, the HELP! label on the rail and the bar, and the rail's own
# source-of-truth rule. The popup's replacement, the ☰ grid, is pinned by
# verify33-family and by the MenuGrid assertions above; its layout is Dan's
# seven rows, not a 4x4, so re-pointing these at it would have asserted the
# wrong shape in the right file.
check(len(rows) == 17,
      f"the registry holds seventeen activities ({len(rows)}) — Dan's 4x4 plus Settings",
      f"the registry holds {len(rows)} activities, expected 17 — Dan's 4x4 "
      "(31 Aug: Sorting cut, iComplete retired, NumBus+NumBourse under one "
      "Numbers hub, My Progress folded into Profile) plus Settings, added to "
      "the User row 2026-09-09. If a tile is added or "
      "removed, change this number on purpose.")
check("HELP!" not in shell and "HELP!" not in topbar,
      "no HELP! label survives on the rail or the bar",
      "a HELP! label is still on the rail or the bar")

# 5 · one source of truth
# The Menu's half of this rule retired with the Menu (see section 4). The ☰
# grid that replaced it lists Dan's seven rows by hand, tile for tile from his
# own drawing, so "reads the registry through the shared helper" is not a rule
# it was ever built to obey — asserting it here would fail a correct file.
# The rail's half of this rule retired with the rail, 9 Sep — same reasoning as
# the Menu's half directly above: the file it described is deleted.

print("\nthe grouped rail + the Menu (19 Aug)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
