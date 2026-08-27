#!/usr/bin/env python3
"""
Patch 25, first rows — the hero shrink (2026-08-11).

Dan's reference standard: the DrillShell header bar — thin, static,
information-only. "Anywhere a progress bar or related header is oversized
relative to that standard, shrink it to match." The audit measured one
offender: the Home hero at 303px. It is now a ~99px card (measured at
390x844): chip row + two 3px hairlines + the paired actions.

Amended the same day: Dan brought the brand animation BACK, compact ("i
would rather you reduce the size of par Daniel Chan than remove it; the
ink blob must come back even if you make it smaller"): the animated
FluOlinGo + a smaller « par Dr Chan », the whole show ~3.5 s (was 5.5 s),
once per browser session.

REVERSED 2026-08-19 by Dan, from Design's "FluOlinGo Home standalone"
reference shown twice: "the dashboard that wouldn't have a status bar,
that is minimalist and that is a bit like a report card but
horizontally". So the two hairline bars are GONE (no status bar), the
chip rail is gone, the « Bienvenue sur FluOlinGo » heading is BACK, and
the counters are now one horizontal strip of marks — value over label,
hairline dividers between — read across like a report card.
The shrink assertions below are inverted accordingly; the brand
animation, the grouping rule and the counter census are unchanged,
because none of those was what Dan reversed.

What this asserts (the height itself is a screenshot's job):

  1  The heading greets again ("Bienvenue sur"), and the brand animation
     is intact: wave letters, ink blob, byline strokes, the
     once-per-session gate, and the compressed timings.
  2  There is NO status bar — no progress-bar tracks, no progressbar
     roles anywhere in the hero.
  3  The marks are a horizontal row: a <dl> of value-over-label cells,
     each labelled, all sharing one line (the list itself never wraps —
     on a phone the actions drop below it instead).
  4  One glyph, one job (2026-08-21). No ▶ anywhere in HomeDashboard and
     no 🔁: the triangle means "a voice is about to speak" everywhere else
     in the app. The three round actions — › Continue · 🔖 Review · ▦ Menu
     — share ONE five-cell row with the two marks (Dan: the big CTA "was
     occupying so much space"), and › is the single "this leaves the page"
     mark, shared with the Map postcard.
  5  Every progress counter survives (litmus: learner feedback stays).

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

# 1 · the heading greets again, brand animation intact
check("Bienvenue sur" in home,
      "the hero greets again — 'Bienvenue sur FluOlinGo' is back (19 Aug reversal)",
      "the hero heading prose is missing — the 19 Aug reversal is undone")
check("fluo-brand-letter" in home and "fluo-byline" in home and "BYLINE_STROKES" in home,
      "the compact brand animation is back: wave letters, ink blob, byline",
      "the brand animation is missing a piece (letters / ink / byline)")
check("heroPlayed" in home,
      "the once-per-session gate survives (full show once, finished look after)",
      "the once-per-session gate is gone — the show would replay every visit")
check("<h1" in home and "text-2xl" in home,
      "the greeting is a real h1 at text-2xl — the page has its heading back",
      "the greeting is not an h1 at text-2xl (the 19 Aug reversal is half-applied)")

css = read("src/app/globals.css")
check("fluo-brand-hl 1s" in css and "0.95s forwards" in css,
      "the highlighter is compressed (1s from 0.95s, was 1.3s from 1.45s)",
      "the highlighter still runs the original 5.5-second-era timings")
check("2.0 + i * 0.08" in home,
      "the byline strokes start at 2.0s with 0.08s stagger (~3.5s total)",
      "the byline strokes still run the original 2.8s + 0.17s pacing")

# 2 · no status bar (Dan, 19 Aug: "wouldn't have status bar")
check(home.count("h-[3px]") == 0,
      "no hairline tracks remain — the status bar is gone",
      "a hairline progress track is still in the hero — Dan asked for no status bar")
check(home.count('role="progressbar"') == 0,
      "no progressbar roles remain in the hero",
      "a progressbar role is still in the hero — the status bar is not gone")

# 2b · SUPERSEDED, 2026-08-26 — the report card became soft 3D.
# Dan drew the replacement himself ("FluOlinGo Home Header") and asked for it
# built: the two readings are WELLS pressed into the paper, the three actions
# are PILLOWS standing out of it. So the checks below no longer look for a
# five-cell row of worded buttons — that design is gone on purpose, not by
# accident. What SURVIVES the restyle is what these checks now hold: the two
# essential marks, the three destinations, the due badge, the glyph rule, and
# the ban on a full-width CTA. verify37-home.py pins the new surfaces.
check("<dl" in home and "<dt" in home and "<dd" in home,
      "the readings are still a description list — each figure carries its label",
      "the readings are not a <dl> of value/label pairs")

sec_start = home.find("<section")
sec_end = home.rfind("</section>")
hero = home[sec_start:sec_end]

# 3 · one glyph, one job (2026-08-21). The three actions are now SVG shapes
# inside coloured keys, not emoji — so the transport-glyph rule is untouched:
# no ▶ or 🔁 CHARACTER appears, which is what the rule was ever about.
# ── THE GLYPH RULE, NARROWED HONESTLY (Dan, 2026-08-27: "glyphs stay") ──────
# The 21 Aug rule said ▶ means SOUND and nothing else. Dan's own Home draft
# then drew Play as a filled triangle, and I built it — so two of his rulings
# collided. A parallel session (Peers) caught that the check here only asserted
# the CHARACTER was absent, and that the comment defending it ("what the rule
# was ever about") was a rationalisation: a learner cannot tell an SVG triangle
# from a ▶, so the shape says the same thing either way. That was a fair hit.
#
# Dan ruled: the draft wins. So the rule is not "no triangles" — it is:
#
#   A TYPED ▶ / 🔁 IS AUDIO. Those characters sit inline with text, where a
#   learner reads them as "this will speak". They stay banned on Home.
#   THE DRAWN KEY IS NAVIGATION. Home's three SVG keys are Dan's own design
#   and are the approved form. They must not be "restored" to words by a later
#   session reading only the 21 Aug note.
#
# Both halves are asserted, so neither can drift: the ban AND the approval.
check("▶" not in home and "⏸" not in home and "⏹" not in home,
      "no typed transport character on Home — inline, those read as audio",
      "a typed ▶/⏸/⏹ is back on Home, where it reads as 'this will speak'")
check('d="M6 3.5 L22 13 L6 22.5 Z"' in home,
      "Play is the DRAWN key from Dan's draft — the approved form, 27 Aug",
      "Home's drawn Play key is gone; a later session reverted Dan's own design")
check("🔁" not in home,
      "no 🔁 on Home — the Review tab carries that destination",
      "the 🔁 is back, duplicating the Review tab and ÉcouTexte's 'again'")

# The three destinations survive the restyle, whatever shape they wear.
check('href="/reviser"' in home,
      "Rewind points at /reviser — repeat your errors",
      "Rewind lost its /reviser destination")
check("activeSio.unit}#${activeSio.id}" in home,
      "Play continues the course at the current stop (old Continue's job)",
      "Play no longer opens the current stop")
check("dueCount > 0" in home,
      "Rewind carries the due count — the one deadline on Home",
      "the due badge left Rewind; the deadline is invisible again")
# The third action changed MEANING on 26 Aug, and that is the point of the
# rebuild: it opened the stop-less Menu, it now opens the current stop's own
# activities. "One must first choose the stop before they can access the
# activity." verify37 holds the rest of that rule.
check("StopSheet" in home and "MenuSplash" not in home,
      "the third key opens THIS STOP's activities, not the stop-less Menu",
      "Home still opens a stop-less activity menu")

# Dan, 2026-08-21 and again 22 Aug: no huge CONTINUER, no full-width CTA.
# Still true, and still a CI failure rather than a matter of taste.
check("fluo-btn-lg" not in home and 'className="fluo-btn' not in home,
      "no full-width CTA under the card — the actions are the keys",
      "a full-width button is back under the hero (Dan, twice: do not)")

# 4 · the TWO essential marks (Dan, 2026-08-21, decluttering). The FORM
# changed — the course fraction is now the stop number over fifty, which is
# the same fact in the map's own units — but both marks and the multiplier
# still have to be on the page.
for marker, what in (
    ("SIOS.length", "the course mark (a figure over fifty)"),
    ("progress.streak", "the streak"),
    ("mult > 1", "the visible ×XP multiplier on the streak"),
):
    check(marker in home,
          f"{what} survives the restyle",
          f"{what} was lost — the two essential marks are the hero's floor")
check("progress.xp" not in home and "progress.gems" not in home and "lvl.into" not in home,
      "level / XP / gems stay off Home (derived marks live on /moi, /profil)",
      "a derived mark crept back into the hero row")

print("\npatch 25 check (hero rows)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
