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
# SUPERSEDED IN ITS SIZE, NOT IN ITS SUBSTANCE (Dan, 1 Sep: "the hero to be in
# FluOLinGo font and resized relative to the window"). `text-2xl` was a fixed
# 24px at every width and is now a clamp; asserting the old literal would fail
# the instruction that replaced it. What the check was ever FOR survives and is
# still asserted: the greeting is a real <h1>, so the page has a heading.
# The new half is that the size must scale — a fixed step would be the very
# thing Dan asked to leave behind, and a clamp with no vw term is a fixed step
# wearing a function.
check("<h1" in home, "the greeting is a real h1 — the page has its heading",
      "the greeting is no longer an h1 (the 19 Aug reversal is half-applied)")
h1 = home[home.find("<h1"):home.find(">", home.find("<h1")) + 1]
check("clamp(" in h1 and "vw" in h1,
      "the greeting is sized by a viewport clamp, not a fixed step",
      "the greeting has no vw-based clamp — Dan asked for it resized relative to the window")
check("fluo-band-hand" in h1,
      "the greeting is set in FluOLinGo Hand",
      "the greeting is not in the FluOLinGo Hand face Dan asked for")

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
# THE READINGS LEFT HOME (Dan, 7 Sep: "replace the streak info with the stop
# info ... at the top right ... so we free up the space"). The 1/50 well now
# rides the top bar as the editable StopMark (verify87 follows it there); the
# hero keeps prose and keys only, so the old dl claim inverts: a readings
# row creeping back IS the regression.
check("<dl" not in home,
      "no readings row on the hero — the stop rides the top bar",
      "a readings <dl> is back on Home — the well Dan moved to the bar has returned")

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
# ── THE TRANSPORT ROW IS RETIRED (Dan, 2026-09-12) ────────────────────────
#
# *"is it ok to do without the play, forward and rewind buttons (those
# functions can be accessed easily and directly elsewhere on this page, i.e.
# via the map and the editable goalselector field, right?"* — and, on the one
# that was not obviously covered: *"Rewind = Revise = ErroRevue == they are
# the same thing"*.
#
# Five assertions here lost their subject with it, and they are recorded
# rather than quietly deleted, because each was protecting a real decision and
# the next session should know it was overruled and not lost:
#
#   the DRAWN Continue key (Dan's own draft, 2026-08-31)   gone with the row
#   Continue opening `#${activeSio.id}`                     gone with the row
#   Rewind pointing at /reviser                             gone with the row
#   the due-count badge, "the one deadline on Home"         gone with the row
#   the four-key row wrapping at 320px                      no row to wrap
#
# MEASURED BEFORE REMOVAL, and two of them were worse than what replaced them:
# Continue and Next pointed at `/unit/N#SIO-nnn`, which forwarded to
# `/home?unit=N#SIO-nnn` and opened a StopPopup on the page the learner was
# already standing on. The map's own stops open `/sio/[id]`, the full goal page
# Dan asked for on 7 Sep.
#
# THE DUE COUNT IS A GENUINE LOSS and is flagged as one: nothing on Home says
# how many items are waiting any more. Dan was told, and ruled the door
# sufficient. If a badge ever comes back it belongs on the ☰, not here.
#
# What still holds is everything below — the keys may not RETURN as typed
# characters, no popup may creep back, and `.home-key` must stay fluid,
# because the 🎓 key still wears it.

# `.home-key` OUTLIVED THE ROW. The end-of-course 🎓 key — a FOURTH key Dan did
# not name, which appears only at 50/50 — moved into the map's control row and
# still carries the class, so the rule it depends on is still load-bearing.
# THE SIZE IS NO LONGER TYPED (Dan, 2026-09-12: "PLEASE NEVER EVER HARD CODE
# FONT SIZES AND BUTTON SIZES !!!"). It was `h-[44px] … sm:h-[58px]` — two fixed
# ladders — and is now `.home-key`: one fluid side off `--fs-step` with the
# touch floor pinned by `max(44px, …)`.
_css = open("src/app/globals.css", encoding="utf-8").read()
_rule = re.search(r"\.home-key\s*\{[^}]*\}", _css, re.S)
_body = _rule.group(0) if _rule else ""
_mapbody = open("src/app/map/MapBody.tsx", encoding="utf-8").read()
check("home-key" in _mapbody and "max(44px" in _body.replace(" ", ""),
      "the 🎓 key sizes from .home-key, with the 44px touch floor pinned by max()",
      "the .home-key rule lost its 44px floor, or nothing wears it any more — if the "
      "🎓 end-of-course key has gone too, verify111 is the check that says so")
check("--fs-step" in _body,
      "and it grows on the type ramp, not at a breakpoint",
      ".home-key does not read --fs-step — the key is a fixed size again")
check(not re.search(r"h-\[\d+px\] w-\[\d+px\] place-items-center", home),
      "no key on Home names its own pixel size",
      "a key is back to a literal h-[NNpx] w-[NNpx] — it will not shrink on a 360px phone")

check("StopSheet" not in home and "MenuSplash" not in home,
      "Home opens no activity popup — the ☰ grid is the menu",
      "an activity popup is back on Home — the red key Dan removed has a ghost")

# Dan, 2026-08-21 and again 22 Aug: no huge CONTINUER, no full-width CTA.
# Still true, and still a CI failure rather than a matter of taste.
check("fluo-btn-lg" not in home and 'className="fluo-btn' not in home,
      "no full-width CTA under the card — the actions are the keys",
      "a full-width button is back under the hero (Dan, twice: do not)")

# 4 · the TWO essential marks (Dan, 2026-08-21, decluttering). The FORM
# changed — the course fraction is now the stop number over fifty, which is
# the same fact in the map's own units — but both marks and the multiplier
# still have to be on the page.
# THE STREAK MOVED, IT WAS NOT LOST (Dan, 1 Sep: "move the streak value and
# emoji up between History and User"). This block asserted both essential marks
# were ON HOME. One of them is now in the TOP BAR, which is a promotion, not a
# deletion: the one reading with a deadline used to live on the page a learner
# leaves first and now rides all 28 surfaces, the drill included.
#
# So the rule follows it rather than relaxing. Both marks are still asserted —
# the course fraction here, the streak and its multiplier at their new address —
# and the streak is additionally asserted GONE from Home, so it cannot quietly
# come back and be shown twice.
# THE MARK MOVED DOWN ONE ROW (12 Sep). It was the 🎯 well in Home's transport
# row; that row went, and Dan's instruction was explicit about why there is now
# only one: *"there is no need to have the current stop mentioned twice"*. The
# surviving copy is the editable 🧑‍🎓 well in the map's control row — the same
# `StopBookmark`, the same value — so the assertion follows it. Read in
# MapBody, and still asserted ABSENT from Home, so the second copy cannot
# quietly return.
check("SIOS.length" in _mapbody,
      "the course mark (a figure over fifty) survives the restyle",
      "the course mark was lost — a learner can no longer see where they are in the fifty")
check("StopBookmark" not in home,
      "and Home does not draw a second copy of it",
      "Home has its own stop reading again — Dan, 12 Sep: the stop is not mentioned twice")
bar = read("src/components/SiteTopBar.tsx")
check("progress" in bar and "streak" in bar,
      "the streak is in the top bar, where Dan moved it",
      "the streak is on neither Home nor the top bar — the one reading with a deadline is gone")
# The streak moved AGAIN on 7 Sep — bar → account card (its bar slot went to
# the stop) — and the multiplier moved with it, as it did the first time.
acct = read("src/components/AccountButton.tsx")
check("xpMultiplier" in acct,
      "the ×XP multiplier followed the streak onto the account card",
      "the multiplier was dropped in the move — a streak that does not say what it buys is a number")
check("progress.streak" not in home,
      "the streak is not ALSO on Home — it moved, it did not multiply",
      "the streak is on Home as well as the bar; the tile Dan removed is back")
check("progress.xp" not in home and "progress.gems" not in home and "lvl.into" not in home,
      "level / XP / gems stay off Home (derived marks live on /moi, /profil)",
      "a derived mark crept back into the hero row")

print("\npatch 25 check (hero rows)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
