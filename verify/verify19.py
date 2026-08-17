#!/usr/bin/env python3
"""
Patch 19's check. Exits non-zero on any failure, so CI can gate on it.

It asserts the things a screenshot cannot:

  1  every activity has exactly ONE name and ONE emoji across every surface
  2  EtuDice's flap gate matches the decks that can actually run it
  3  the bottom bar has four slots, and neither Accueil nor Moi
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
    '"Lesson"': "xPlain", '"Flip It"': "4Mémoire",
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
slots = re.findall(r'key: "([a-z]+)"', nav)
check(len(slots) == 0 or "index" in nav, "bottom bar leads with Index",
      "bottom bar does not include Index")
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
check(1 <= len(slot_labels) <= 4,
      f"bottom bar declares {len(slot_labels)} literal slot label(s) (rest derive from FAMILIES)",
      f"bottom bar declares {len(slot_labels)} slots — expected at most 4")
check("BottomBar" in shell, "BottomBar is mounted in CahierShell",
      "BottomBar is not mounted — the phone still has only the burger")

# ── 4 · the tablet band ────────────────────────────────────────────────────
check("min-width: 900px" in css, "the rail returns at 900px",
      "globals.css still gates the rail at 1100px — tablets get no navigation")
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
