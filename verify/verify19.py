#!/usr/bin/env python3
"""
Patch 19's check. Exits non-zero on any failure, so CI can gate on it.

It asserts the things a screenshot cannot:

  1  every activity has exactly ONE name and ONE emoji across every surface
  2  EtuDice's flap gate matches the decks that can actually run it
  3  the bottom bar is the five families minus User, derived not hand-kept
  4  no `1100` breakpoint survives in the rail
  5  no flap subtitles anywhere
  6  every href in the registry resolves to a route that exists

Run from the repo root:  python3 verify/verify19.py
"""
import json, os, re, sys, glob

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

reg = read("src/content/activities.ts")
shell = read("src/components/CahierShell.tsx")
tabs = read("src/components/siteTabs.ts")
nav = read("src/content/nav.ts")
css = read("src/app/globals.css")

# ── 1 · one name, one emoji ────────────────────────────────────────────────
# Match ACTIVITIES rows only. FAMILIES rows have the same {key,name,emoji}
# shape, so an unanchored regex counted 5 families as activities and reported
# 25 where there are 20 (caught by this check's own first run, 2026-08-10).
entries = re.findall(r'\{ key: "([a-z]+)", name: "([^"]+)", emoji: "([^"]+)"[^}]*family:', reg)
check(len(entries) >= 17, f"registry has {len(entries)} activities",
      f"registry has only {len(entries)} activities — expected >=17")

names = {k: n for k, n, _ in entries}
emojis = {k: e for k, _, e in entries}
dupe_names = [n for n in names.values() if list(names.values()).count(n) > 1]
check(not dupe_names, "no activity name is used twice",
      f"name used twice: {sorted(set(dupe_names))}")

# The old spellings must be gone from every surface that renders a flap.
STALE = {
    # Dan, 2026-08-23: rename xPlain → Memo, approved surface #3 — the
    # registry name for key "lesson" is now "Memo".
    '"Lesson"': "Memo", '"Flip It"': "4Mémoire",
    '"Compose It"': "ComposeIt", '"Say It"': "WorDrill",
}
for lit, should in STALE.items():
    hit = [f for f in ("src/components/CahierShell.tsx", "src/components/siteTabs.ts")
           if f"label: {lit}" in read(f)]
    check(not hit, f"no surface hardcodes label {lit} (registry says {should})",
          f"{', '.join(hit)} still hardcodes label {lit} — should read the registry")

check("registryTab(" in shell, "deckActivityTabs reads the registry",
      "deckActivityTabs does not use registryTab() — names can still drift")

# ── 2 · EtuDice's gate ─────────────────────────────────────────────────────
check("toPracticeSet(curatedDeck)" in shell, "EtuDice's flap is gated on toPracticeSet",
      "EtuDice's flap is NOT gated — it will dead-end on decks with no practice set")

capable = 0
total = 0
for f in glob.glob("src/content/collections/*.json"):
    try:
        c = json.load(open(f, encoding="utf-8"))
    except Exception:
        continue
    if not isinstance(c, dict) or "items" not in c:
        continue
    total += 1
    cols = ((c.get("gameConfig") or {}).get("letris") or {}).get("columns") or []
    if len(cols) >= 2:
        capable += 1
check(0 < capable < total,
      f"EtuDice runs on {capable} of {total} decks — the gate is doing real work",
      f"EtuDice gate is pointless: {capable} of {total} decks")

check('registryTab("complete"' in shell, "iComplete has a flap on every deck",
      "iComplete has no flap — its route is still orphaned")

# ── 3 · the bottom bar ─────────────────────────────────────────────────────
# Index lost its own slot on 2026-08-22 (Dan: "Goals and Index to merge later
# on as one") and the Index itself was retired on 2026-08-29 ("we shouldn't
# have to land on the index page at all. the maps should still be the front
# door for everything"). The RULE is unchanged and is what this checks: the
# Practice family's destination must not be orphaned. It is now the map.
check("/map" in open("src/content/activities.ts", encoding="utf-8").read().split("export const FAMILIES")[-1],
      "the Practice family reaches the map (the front door for choosing a stop)",
      "no bottom-bar slot reaches /map — the Practice family is orphaned")
# Look at the SLOTS, not the file. The first version grepped the whole module
# and failed on the word "Accueil" inside the comment explaining why Accueil is
# not in the bar (2026-08-10).
slot_labels = re.findall(r'label: "([^"]+)"', nav.split("export const BOTTOM_NAV")[-1])
for banned, why in (("Accueil", "the FluOlinGo wordmark is the home link"),
                    ("Mon progrès", "the account chip is the profile door"),
                    ("My Progress", "the account chip is the profile door"),
                    ("Moi", "the account chip is the profile door")):
    check(banned not in slot_labels, f"bottom bar has no {banned} ({why})",
          f"bottom bar still has {banned} — {why}")
# FIVE SLOTS, FULLY DERIVED (Dan, 2026-08-22 profile design: "minus User, i
# think we should have those 5 emojis as base shortcuts instead"). The bar was
# four with Index hand-written as the one literal; Index merged into Goals, so
# now EVERY slot comes off FAMILIES and there are no literal labels left. That
# is the point of the check: a hand-kept second list is the bug (patch 19c's
# `activitiesInFamilyOrder()` rule), so zero literals is the pass.
check(len(slot_labels) == 0,
      "bottom bar hand-keeps no slot labels — all five derive from FAMILIES",
      f"bottom bar hand-keeps {len(slot_labels)} literal label(s) — derive them from FAMILIES")
check("FAMILIES.filter" in nav and 'f.key !== "user"' in nav,
      "bottom bar is FAMILIES minus User (the account chip is the profile door)",
      "bottom bar no longer derives from FAMILIES minus User")
check("BottomBar" in shell, "BottomBar is mounted in CahierShell",
      "BottomBar is not mounted — the phone still has only the burger")

# ── 4 · navigation exists at EVERY width ───────────────────────────────────
# This used to assert "the rail returns at 900px", because below that width the
# desk rail vanished and the ☰ stood in for it — so a wrong breakpoint left
# tablets with neither. On 2026-08-30 Dan replaced the rail with the dropdown
# outright ("the rail cannot be flaps … they have to be drop down like in most
# interfaces"), so the ☰ IS the navigation now and no breakpoint may hide it.
# That is the same intent, guaranteed more simply: assert nothing turns it off
# rather than that a rule turns it back on.
hides_menu = re.search(r"\.cahier-menu\s*\{[^}]*display:\s*none", css)
check(hides_menu is None,
      "nothing hides the ☰ at any width — it is the navigation everywhere",
      "a rule sets .cahier-menu to display:none — at that width the app has no "
      "navigation at all, because the desk rail it used to fall back to is gone")
check("window.innerWidth < 1100" not in shell, "no 1100px breakpoint left in CahierShell",
      "CahierShell still compares against 1100 — CSS and JS will disagree")
check("min-width: 640px) and (max-width: 899.98px" in css,
      "640-900 renders an icons-only rail",
      "no icons-only rail between 640 and 900 — that band still has no nav")

# ── 5 · no subtitles ───────────────────────────────────────────────────────
hints = len(re.findall(r'\bhint: "', shell)) + len(re.findall(r'\bhint: "', tabs))
check(hints == 0, "no flap carries a subtitle",
      f"{hints} flap subtitle(s) remain — 8 of 12 truncated on a phone")

# ── 6 · every registry href resolves ───────────────────────────────────────
missing = []
for href in re.findall(r'href: "(/[^"]*)"', reg):
    # Patch 24: deck-scoped activities point into the Index with a query
    # (`/activities?activity=flip`) — the route is the path part.
    seg = href.split("?")[0].strip("/")
    if not seg:
        continue
    if not (os.path.isfile(f"src/app/{seg}/page.tsx") or os.path.isdir(f"src/app/{seg}")):
        missing.append(href)
check(not missing, "every registry href has a route",
      f"registry points at routes that do not exist: {missing}")

print("\npatch 19 check\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
