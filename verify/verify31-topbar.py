#!/usr/bin/env python3
"""
The top icon row must never leave the screen.

Dan, 2026-08-21: "the top most row of icons still exist. and must not go
hiding into the overspill off the screen."

Measured before this pin, on a stock phone viewport:

    320px   4 of 6 icons reachable — the ☰ menu and the account button
            sat 67px past the right edge, with no way to scroll to them
    360px   5 of 6 — the ☰ was 28px off
    390px   6 of 6, with 0.8px to spare

390 passing by less than a pixel is the real finding: ANY addition — a live
score on /reviser, the daily-goal chip, a streak flame — pushed navigation off
the screen. /reviser already did, at 320.

The fix has three parts and this file pins all three, because each one alone
regresses silently:

  1. `topRight` is page-supplied and variable-width, so it lives OUTSIDE the
     icon strip in .cahier-topslot, where it truncates.
  2. The wordmark yields second — min-w-0 + truncate. It is a door home that
     the ← already signals, so "Flu…" still works.
  3. The strip itself is shrink-0 (never squeezed by the wordmark) AND
     max-w-full + flex-wrap (so content that genuinely does not fit makes the
     row TALLER rather than pushing an icon off the edge). A second line is a
     visible compromise; an unreachable ☰ is a broken one.

This is a structural pin. To re-measure the real layout:
    npx next dev -p 3111 &
    node verify/topbar-measure.mjs

Run from the repo root:  python3 verify/verify31-topbar.py
"""
import os, re, sys

PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# WHERE THE BAR LIVES CHANGED ON 2026-08-31, and section 0 below is why the
# move is checked rather than just followed. Dan: "many pages are missing that
# menu and other links in the area above the colored header strip. can you
# reinstate them so that those are accessible at all times". The bar was written
# inside CahierShell, so only CahierShell pages had it; every drill runs in
# DrillShell, which never drew one. It is now SiteTopBar, mounted by both.
#
# So this file reads SiteTopBar. Not CahierShell-or-SiteTopBar, and not the two
# concatenated: a check satisfied by whichever file still carries the markup is
# how a stale second copy survives, which is the failure mode section 0 exists
# to catch.
bar = open("src/components/SiteTopBar.tsx", encoding="utf-8").read()
cahier = open("src/components/CahierShell.tsx", encoding="utf-8").read()
drill = open("src/components/DrillShell.tsx", encoding="utf-8").read()
css = open("src/app/globals.css", encoding="utf-8").read()
nocom_shell = re.sub(r"\{/\*[\s\S]*?\*/\}", "", bar)
nocom_css = re.sub(r"/\*[\s\S]*?\*/", "", css)

# ── 0 · ONE bar, mounted twice ────────────────────────────────────────────
# Everything below pins the bar's internals in ONE file. That only protects
# the app while there is one file: a second copy pasted into a shell would
# keep this suite green and drift on its own, which is precisely what this
# repo did for eleven days with the ☰ dropdown and the desk rail (STATUS,
# 19 Aug). So both mounts are named, and neither shell may carry the markup.
# GameFrame is the one deliberate omission: it is `height: 100dvh; overflow:
# hidden` and hands the leftover box to a board that must fit exactly, and it
# already carries a ✕ and a ⋯ sheet. A bar of unknown height there would take
# rows off every board. Named here so the gap reads as a decision.
frame = open("src/app/practice/flip-it/CahierFrame.tsx", encoding="utf-8").read()
for name, src in (("CahierShell", cahier), ("DrillShell", drill), ("CahierFrame", frame)):
    ok("<SiteTopBar" in src,
       f"{name} mounts SiteTopBar",
       f"{name} does not mount SiteTopBar — its pages have no ☰ and no way out but one link")
    ok("cahier-topbar" not in re.sub(r"\{/\*[\s\S]*?\*/\}", "", src),
       f"{name} has no icon strip of its own",
       f"{name} carries its own copy of the icon strip — two bars will drift apart")


m = re.search(r'className="(cahier-topbar[^"]*)"', nocom_shell)
strip = m.group(1) if m else ""
ok(bool(m), "the icon strip is still there", "no .cahier-topbar found in SiteTopBar")

# ── 1 · the strip is never squeezed, and never overflows ───────────────────
ok("shrink-0" in strip,
   "the icon strip is shrink-0 — the wordmark cannot squeeze it",
   "the icon strip lost shrink-0: the wordmark will squeeze it into wrapping")
ok("max-w-full" in strip,
   "the icon strip is capped at the row width, so overflow becomes a wrap",
   "the icon strip lost max-w-full — content past the edge will simply overflow")
ok("flex-wrap" in strip,
   "the icon strip wraps rather than overflowing",
   "the icon strip lost flex-wrap: an extra icon would go off the screen")
ok("sm:flex-nowrap" in strip,
   "the strip stays one line from sm up, where there is always room",
   "the strip no longer pins to one line at sm+")
ok(re.search(r"\.cahier-topbar\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0", nocom_css) is not None,
   "strip children never shrink — they wrap intact instead of squashing",
   "strip children may shrink: icons will squash before the row wraps")

# ── 2 · page-supplied content is outside the strip ─────────────────────────
strip_start = nocom_shell.find('className="cahier-topbar')
strip_body = nocom_shell[strip_start:strip_start + 3000] if strip_start >= 0 else ""
ok("{topRight}" not in strip_body[:strip_body.find("cahier-menu")] if "cahier-menu" in strip_body else True,
   "topRight is not inside the icon strip",
   "topRight is back inside the icon strip — a long score will push ☰ off the screen")
ok("cahier-topslot" in nocom_shell,
   "topRight has its own shrinkable slot (.cahier-topslot)",
   "the .cahier-topslot yield slot is gone — page content has nowhere safe to go")
slot = re.search(r'className="(cahier-topslot[^"]*)"', nocom_shell)
ok(slot is not None and "truncate" in slot.group(1) and "min-w-0" in slot.group(1),
   "the topRight slot truncates before anything else yields",
   "the topRight slot no longer truncates — it will push the icons")

# ── 3 · the wordmark yields before the icons ──────────────────────────────
# ANCHORED ON THE LINK, NOT ON A FONT CLASS. This searched for
# `className="cahier-display…"`, which was the wordmark's display face until
# 1 Sep, when Dan moved it to FluOLinGo Hand with the Kallang wave. The check
# then failed for a font change while the behaviour it guards — yielding before
# the icons — was untouched. A check that breaks on a restyle is a check people
# learn to edit rather than read.
#
# The anchor is now the home link itself, which is what the rule is about: it
# is the bar's yield slot at any width, in any face.
#
# AND THE HOME LINK MOVED ON 2026-09-09, from `/` to `/home`, when the welcome
# page took the root (Dan: "the first i see must be the one with Welcome to
# FluOLinGo in the horizon"). This is the second time this anchor has gone
# stale for a reason that has nothing to do with truncation — the first was a
# font change on 1 Sep, recorded above — so it matches EITHER address rather
# than being re-pinned to today's. The rule is about the wordmark yielding, and
# it should not go red the next time the app's front door is renamed.
mark = re.search(r'<Link href="/(?:home)?" className="([^"]*)"', nocom_shell)
mk = mark.group(1) if mark else ""
ok("min-w-0" in mk and "truncate" in mk and "shrink" in mk,
   "the wordmark truncates rather than pushing the icons off",
   "the wordmark no longer truncates: at 320px it alone costs 112px and the ☰ goes off-screen")

# ── 3b · the streak is a READING, not a destination (1 Sep) ───────────────
# Dan docked the streak in this strip, between ⌛ and the account button. Every
# other item here is somewhere you can go — that is the strip's whole meaning,
# and verify31 exists because things that push the icons off screen keep being
# added. So the streak is pinned as text: not a <Link>, not a <button>, and
# shrink-0 like its neighbours so it cannot be the thing that squeezes ☰ out.
# THE WELL'S TENANT CHANGED, ITS RULES DID NOT (Dan, 7 Sep: "replace the
# streak info with the stop info (and make that editable)"). StopMark took
# StreakMark's slot; every structural claim transfers: it must hold the
# strip's width, and render nothing before hydration. The one licensed
# difference: its number is an INPUT (the editable bookmark) — a one-field
# form, not a door, so the destinations-only rule is kept in spirit: no
# <Link> and no navigation from the well.
stop = re.search(r"function StopMark\(\)[\s\S]*?\n\}", nocom_shell)
sm = stop.group(0) if stop else ""
ok(bool(sm), "the stop mark exists in the bar", "StopMark is gone from the top bar")
ok("<Link" not in sm,
   "the stop mark navigates nowhere — the strip stays destinations-or-readings only",
   "the stop mark became a link; the icon strip's one meaning is that everything else in it goes somewhere")
ok("shrink-0" in sm,
   "the stop mark cannot be squeezed out of the strip",
   "the stop mark is shrinkable: on a narrow phone it would collapse or push ☰ off, which is this file's whole subject")
ok("stopNo === null" in sm or "stopNo == null" in sm,
   "the stop mark renders nothing until it is read — no hydration mismatch on 28 pages",
   "the stop mark renders a value on the server; localStorage does not exist there and the mismatch would blame the whole bar")

# ── 3c · the Kallang wave TRAVELS, and stops when asked (1 Sep) ───────────
# Dan: "the top return link to be in the same FluOLinGo font but with the
# KALLANG wave effect and irregular highlighter movement", then, shown three
# rhythms on one real-time axis: "A still looks like it is best."
#
# The one thing that makes it a wave rather than a bounce is that a letter's
# ARC IS SHORTER THAN THE TIME THE CREST TAKES TO CROSS THE WORD. The first
# draft had a 0.82s arc against a 0.72s crossing, every letter rose together,
# and Dan read it as "no genuine wave" — correctly. So the relationship is
# asserted arithmetically rather than by eye, because it is the difference
# between the effect and its absence, and neither number looks wrong alone.
mark_span = re.search(r'className="fluo-wave"[\s\S]*?</span>\s*</span>', nocom_shell)
ms = mark_span.group(0) if mark_span else ""
ok("fluo-wave-letter" in ms and "animationDelay" in ms,
   "the wordmark animates PER LETTER with a stagger",
   "the wordmark has no per-letter stagger — a word that moves as a block is a bounce, not a wave")
stagger = re.search(r"i \* ([\d.]+)\}s", ms)
per = float(stagger.group(1)) if stagger else 0.0
cross = per * len("FluOLinGo")
dur = re.search(r"animation:\s*fluo-kallang\s+([\d.]+)s", nocom_css)
kf = re.search(r"@keyframes fluo-kallang \{([\s\S]*?)\n\}", nocom_css)
rest = re.search(r"0%,\s*([\d.]+)%", kf.group(1)) if kf else None
arc = (float(rest.group(1)) / 100) * float(dur.group(1)) if (rest and dur) else 99.0
ok(0 < arc < cross,
   f"a letter's arc ({arc:.2f}s) is shorter than the crossing ({cross:.2f}s) — the crest travels",
   f"a letter's arc ({arc:.2f}s) is not shorter than the crossing ({cross:.2f}s): every letter rises together, which is a bounce wearing a stagger")
ok("sr-only" in ms,
   "the name is given once to a screen reader, not nine letters at a time",
   "the wordmark's letters are not aria-hidden behind one readable name")
# ALL of them, not the first: globals.css carries five reduced-motion blocks
# (the hero's, the wave's, a global sweep, the map node's...) and matching only
# the first found the HERO's and reported the wave unguarded. The first pass of
# this very check did exactly that.
rmbs = re.findall(r"@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}", nocom_css)
rmb = next((b for b in rmbs if ".fluo-wave-letter" in b), "")
ok("animation: none" in rmb,
   "the wave stills for prefers-reduced-motion — Dan's own condition",
   "the wave keeps running under prefers-reduced-motion")
ok("display: none" not in rmb and "visibility: hidden" not in rmb,
   "reduced motion stills the wave without hiding the wordmark",
   "reduced motion hides the wordmark instead of stilling it — Dan: the wave stills, the wordmark stays")
ok("fluo-wave--" not in nocom_css,
   "only the chosen rhythm ships — no unapplied variant classes",
   "an unchosen wave variant is still in the stylesheet; Dan picked A, the others are dead CSS")

# ── 4 · the small-screen width budget is still bought ─────────────────────
mq = re.search(r"@media\s*\(max-width:\s*639px\)\s*\{([\s\S]*?)\n\}", nocom_css)
body = mq.group(1) if mq else ""
pad = re.search(r"\.cahier-topbar \.cahier-btn\s*\{[^}]*padding-left:\s*([\d.]+)rem", body)
ok(pad is not None and float(pad.group(1)) <= 0.32,
   f"below sm the icon buttons stay tight ({pad.group(1) if pad else '?'}rem)",
   "the below-sm button padding grew — that budget is what fits six icons on a 320px phone")
gap = re.search(r"\.cahier-topbar\s*\{[^}]*gap:\s*([\d.]+)rem", body)
ok(gap is not None and float(gap.group(1)) <= 0.125,
   f"below sm the strip gap stays tight ({gap.group(1) if gap else '?'}rem)",
   "the below-sm strip gap grew — 6 icons no longer fit a 320px phone")

# ── 5 · nobody has quietly hidden an icon to make room ────────────────────
hidden = re.findall(r"cahier-btn cahier-btn-sm[^\"]*!hidden(?! sm:)", nocom_shell)
ok(len(re.findall(r"!hidden", nocom_shell)) <= 1,
   "no icon has been hidden below sm beyond the one deliberate 🏠",
   "an icon is being hidden on small screens — hiding is what this pin forbids")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
