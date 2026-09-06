#!/usr/bin/env python3
"""
The bottom bar is the learner's to fill — and to empty (2026-09-05).

Dan: "we said that the bottom bar is optional and users can opt to remove it
or to replace the items there (but there should be some defaults)."

So the bar's slots are a preference now (`uiPrefs.bottomNav`), picked in
Réglages from all SIX families — 👤 User included, opt-in — with today's five
as the default. This supersedes the fixed five-slot reading of verify19 §3 and
verify52 §6; both still hold for the DEFAULT, which is why neither needed
loosening: BOTTOM_NAV stays FAMILIES minus User, and the pref picks from
ALL_NAV on top of it.

What this pins, each of which was got wrong at least once on the way in:

  1  the pref exists, typed to the families, defaulting to FAMILIES minus
     User — derived, not a hand-kept five-string list that drifts
  2  an empty selection renders NO bar (return null), and the measured
     --bottombar-floor is withdrawn with it, so pages get the space back
  3  Réglages offers all six families as checkboxes wearing their wash
     colour, rebuilt from FAMILIES so ticking can never reorder the bar
  4  the Revise due count is not lost with its slot: SiteTopBar's ☰ shows
     it whenever "review" is off the bar
  5  the LIVE BUG shipped alongside: .cahier-bottombar's unlayered
     `display:flex` beat the Tailwind-layered `sm:hidden`, so the phone bar
     rendered on DESKTOP — an unlayered @media rule must hide it from 640px
  6  the two hard-coded clearances (DrillShell's 58px spacer, .cahier-page's
     56px padding) read the floor variable instead, or a hidden bar leaves
     a bar-sized hole at the foot of every page

Run from the repo root:  python3 verify/verify99-bottombar-pref.py
"""
import os, re, sys

PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

def read(rel):
    return open(rel, encoding="utf-8").read() if os.path.isfile(rel) else ""

def nocomment(src):
    """A rule a comment can satisfy is not a rule."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

prefs = nocomment(read("src/lib/uiPrefs.ts"))
bar = nocomment(read("src/components/BottomBar.tsx"))
nav = nocomment(read("src/content/nav.ts"))
reglages = nocomment(read("src/app/reglages/page.tsx"))
topbar = nocomment(read("src/components/SiteTopBar.tsx"))
drill = nocomment(read("src/components/DrillShell.tsx"))
css = read("src/app/globals.css")

# ── 1 · the pref, with the five-family default ──────────────────────────────
ok("bottomNav: FamilyKey[]" in prefs,
   "uiPrefs carries bottomNav, typed to the family keys",
   "uiPrefs has no `bottomNav: FamilyKey[]` — the bar is not a preference")
# SUPERSEDED 6 Sep (Dan: "can we remove the bottom nav menu") — the default
# is EMPTY now; the bar is opt-in at Réglages. The claim flips: the default
# must be [], so no learner sees a bar they did not ask for.
ok(re.search(r'bottomNav:\s*\[\]', prefs) is not None,
   "the default is DERIVED: FAMILIES minus User, same as the bar always was",
   "the default bottomNav is not derived from FAMILIES minus User — a "
   "hand-kept list will drift the moment a family is renamed or added")

# ── 2 · empty selection = no bar, and no floor either ───────────────────────
ok("ALL_NAV" in nav and "FAMILIES.map(slotFor)" in nav,
   "nav.ts exports ALL_NAV — all six families as slots for the pref to pick from",
   "nav.ts no longer exports ALL_NAV mapped from all of FAMILIES — 👤 User "
   "cannot be opted in without it")
ok("if (hidden) return null;" in bar,
   "BottomBar renders null when every slot is unticked",
   "BottomBar no longer bails out on an empty selection — an empty <nav> "
   "strip would still paint its border and hold its floor")
ok(re.search(r'if \(!el\) \{ root\.style\.removeProperty\("--bottombar-floor"\); return; \}', bar) is not None,
   "a hidden bar withdraws --bottombar-floor, so floats and trays drop down",
   "BottomBar does not remove --bottombar-floor when it renders nothing — "
   "every page keeps a bar-sized dead strip at the bottom")
ok("keys.includes(slot.key)" in bar and "fluolingo:uiprefs" in bar,
   "the rendered slots are the pref's picks, live via the uiprefs event",
   "BottomBar does not filter its slots by the pref (or dropped the "
   "fluolingo:uiprefs subscription that makes Réglages take effect instantly)")

# ── 3 · Réglages: six checkboxes, wash-coloured, order fixed ────────────────
ok("FAMILIES.map((f)" in reglages and 'type="checkbox"' in reglages,
   "Réglages lists every family as a checkbox — six rows, User included",
   "Réglages no longer maps FAMILIES to checkboxes — the six rows are gone "
   "or hand-kept")
ok("var(--fam-${f.key}-wash)" in reglages,
   "each row wears its family's wash colour, off the same tokens as the flaps",
   "the Réglages rows dropped the --fam-<key>-wash background — the colour "
   "is the recognition hook the ☰ flaps already taught")
ok(re.search(r'"bottomNav",\s*FAMILIES\.filter', reglages) is not None,
   "a tick rebuilds the pref FROM FAMILIES, so the bar can never reorder",
   "Réglages no longer rebuilds bottomNav from FAMILIES order — appending "
   "on tick would order the bar by click history")

# ── 4 · the due count survives losing its slot ──────────────────────────────
ok('bottomNav.includes("review")' in topbar and "dueForReview" in topbar,
   "SiteTopBar shows the due count on ☰ when Revise is off the bar",
   "SiteTopBar no longer computes the due badge from the pref — remove "
   "Revise from the bar and the due count vanishes from the app")
ok("fluolingo:uiprefs" in topbar and "fluolingo:progress-updated" in topbar,
   "the ☰ badge tracks both the pref and progress, live",
   "the ☰ due badge misses one of its two events — it will show a stale "
   "count (or none) until a reload")
ok("--dopa-streak" in topbar,
   "the ☰ badge wears the same --dopa-streak tokens as the bar's pill",
   "the ☰ due badge dropped the --dopa-streak token pair — same count, "
   "second colour")

# ── 5 · the desktop leak, fixed unlayered ───────────────────────────────────
m = re.search(r"@media \(min-width: 640px\) \{\s*\.cahier-bottombar \{ display: none; \}", css)
ok(m is not None,
   "an unlayered @media rule hides .cahier-bottombar from 640px up",
   "the desktop fix is gone: .cahier-bottombar's unlayered display:flex "
   "outranks the @layer'd sm:hidden utility, so the phone bar renders on "
   "desktop again")

# ── 6 · the clearances read the floor, not a number ─────────────────────────
ok('height: "var(--bottombar-floor, 0px)"' in drill and "58px" not in drill,
   "DrillShell's spacer is floor-driven — it collapses with the bar",
   "DrillShell's spacer restates the bar height (58px) — hide the bar and "
   "every drill keeps a blank strip above its footer")
ok(re.search(r"\.cahier-page \{ padding-bottom: max\(env\(safe-area-inset-bottom, 0px\), var\(--bottombar-floor, 0px\)\); \}", css) is not None,
   ".cahier-page's phone padding is floor-driven — it collapses with the bar",
   ".cahier-page no longer reads --bottombar-floor for its phone padding — "
   "either the 56px constant is back (a hole under a hidden bar) or the "
   "padding is gone (the last line sits under a visible bar)")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
