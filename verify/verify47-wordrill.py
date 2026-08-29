#!/usr/bin/env python3
"""
Renumbered 31 -> 47 on 2026-08-29. It shared "31" with verify31-topbar.py, and
that collision is exactly why it sat unwired for a fortnight: the workflow
named verify31 once and it read as covering both. verify46 now forbids two
checks sharing a number, and this was the last one left.

Patch 31 — WorDrill redesigned (2026-08-22, from Dan's Claude Design handoff).

The handoff carried four artboards. The sprint clock — a 30/60/120s countdown
with a ring round the mic and a timed report — was ASSESSED AND DROPPED on
Dan's word ("ignore sprint"): it reversed his own 2026-07-03 decision that a
run is a working queue with a natural end, and its core interaction (a fresh
SpeechRecognition per word, ~20 restarts a minute) was never prototyped.
ConjugaZone (artboard 1d) is a separate page and a separate patch.

What this asserts (static, over source) — each one a decision a screenshot
cannot check:

  1  The picker is content-sized chips, not full-width bars in a grid.
  2  The chip dots are DERIVED from itemSrs, not invented session history,
     and they are read through a subscription, not an effect.
  3  The drill stays inside CahierShell — it did NOT move to DrillShell,
     which is h-dvh and would eat the site chrome Dan asked to keep.
  4  The meter reads the microphone. The design drew CSS keyframes; a meter
     that animates while the learner is silent is the one thing it must not
     do, so this asserts the analyser and forbids a keyframe fallback.
  5  What the design dropped that we KEPT: Back (Dan, 2026-07-16) and the
     interim transcript (the only proof the recognizer heard words).
  6  What Dan dropped that STAYS dropped: WHY on the tray, and the prose the
     litmus test kills — the "Say in French:" kicker, "Tap to speak", the
     keyboard legend.
  7  The EN/FR switch changes the PROMPT only; French is always what is
     graded (hence the FR badge on the mic).
  8  WorDrill is on the help ladder now, so hinted words reach ReVue — and
     SioModal's popup is NOT (it has no shell bar to hang rungs off).
  9  Tokens, not raw hex: the session map and the chips paint on --tier-*.
 10  The done screen hands its misses to the Reviser through reviserHref,
     the one path patch 23 already built.

Run from the repo root:  python3 verify/verify47-wordrill.py
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
    """Grep the CODE, not the prose. Every one of these files explains what
    was dropped and why, so a bare `"Tap to speak" in source` would fail on
    the comment saying it is gone."""
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return re.sub(r"^\s*//.*$", "", s, flags=re.M)

PICKER = strip_comments(read("src/app/practice/wordrill/page.tsx"))
SAYIT = strip_comments(read("src/app/practice/say-it/[collectionId]/SayItContent.tsx"))
METER = strip_comments(read("src/components/SpeechMeter.tsx"))
MAP = strip_comments(read("src/components/SessionMap.tsx"))
SIOMODAL = strip_comments(read("src/app/SioModal.tsx"))
CSS = read("src/app/globals.css")

# The litmus-test removals are scoped to the WorDrill branch. SioModal's popup
# shares this file and still carries the "Say in French:" kicker, "Tap to
# speak" and the keyboard legend — that surface was NOT in this handoff, and
# silently restyling the popup would have shipped an unreviewed change. It is
# on the open list in STATUS.md instead.
_start = SAYIT.find("if (isWorDrill) {")
_end = SAYIT.find("return wrap(", _start) if _start != -1 else -1
WORDRILL = SAYIT[_start:_end] if _start != -1 and _end != -1 else ""

print("\n1 · the picker is content-sized")
check("flex flex-wrap" in PICKER,
      "scopes wrap in a row",
      "the scope row is not a wrapping flex row")
check("w-full" not in PICKER and "grid-cols-2" not in PICKER,
      "no full-width bars, no 2-col grid (Dan: 'SUCH MASSIVE BUTTONS')",
      "a full-width button or the old grid survived")
check("cahier-btn" in PICKER,
      "chips use the shared .cahier-btn skin",
      "the chips hand-roll their own button styling")

print("\n2 · the chip dots are derived, not invented")
check("recentMarks" in PICKER and "intervalDays" in PICKER,
      "dots come from itemSrs intervals",
      "the dots are not derived from itemSrs")
check("due - s.intervalDays" in PICKER or "s.due - s.intervalDays" in PICKER,
      "'last asked' is recovered as due - interval",
      "nothing recovers when a word was last answered")
check("useSyncExternalStore" in PICKER and "useEffect" not in PICKER,
      "localStorage is read through a subscription, not an effect",
      "the picker reads storage in an effect (set-state-in-effect)")

print("\n3 · the drill stays in the site chrome")
check("CahierShell" in PICKER,
      "WorDrill still renders inside CahierShell",
      "WorDrill left CahierShell")
check('variant="wordrill"' in PICKER,
      "the drill is asked for by variant, not by overloading `embedded`",
      "the WorDrill layout is not selected by an explicit variant")
check("h-dvh" not in SAYIT,
      "the WorDrill branch does not take the viewport",
      "something in SayItContent claims the whole viewport")

print("\n4 · the meter reads the microphone")
check("getUserMedia" in METER and "createAnalyser" in METER,
      "the meter opens a stream and analyses it",
      "the meter does not read audio")
check("getByteTimeDomainData" in METER,
      "bar heights are real RMS",
      "the bars are not computed from samples")
check("animation" not in METER and "@keyframes" not in METER,
      "no keyframe fallback — flat means flat",
      "the meter can animate without input")
check(".getTracks().forEach" in METER and "t.stop()" in METER,
      "the stream is released when the turn ends",
      "the mic stream is not stopped")

print("\n5 · what the design dropped and we kept")
check(">Back<" in SAYIT,
      "Back survives (Dan, 2026-07-16 — a skipped word must be reachable)",
      "Back was dropped with the design")
check("transcript" in SAYIT and "aria-live" in SAYIT,
      "the interim transcript still shows while listening",
      "the recognizer's own words are no longer shown")

print("\n6 · what stays dropped (the WorDrill branch)")
check(WORDRILL != "",
      "the WorDrill branch is findable to scope these checks",
      "could not locate the WorDrill branch — the checks below are vacuous")
check("Say in French" not in WORDRILL,
      "the kicker is gone (the switch says it)",
      "the 'Say in French:' kicker is back")
check("Tap to speak" not in WORDRILL,
      "'Tap to speak' is gone (the mic says it)",
      "'Tap to speak' is back")
check("Space = " not in WORDRILL,
      "the keyboard legend is gone",
      "the keyboard legend is back")
check("WHY" not in WORDRILL,
      "no WHY on the WorDrill tray (Dan's call — nothing to put behind it)",
      "a WHY button reappeared")

print("\n7 · EN/FR is the prompt, not the grading")
check("promptLang" in SAYIT,
      "the switch names itself as the PROMPT's language",
      "the switch is not scoped to the prompt")
check('rec.lang = "fr-FR"' in SAYIT and "promptLang" not in SAYIT.split("rec.lang")[1][:400],
      "the recognizer is fr-FR regardless of the switch",
      "the switch reaches the recognizer")
check(">\n                      FR\n                    </span>" in SAYIT or ">FR<" in SAYIT or "FR\n" in SAYIT,
      "the mic carries its FR badge",
      "the FR badge is missing from the mic")

print("\n8 · the ladder reaches WorDrill, not the popup")
check("ladderOn" in SAYIT and "!embedded || isWorDrill" in SAYIT,
      "WorDrill joins the standalone page on the help ladder",
      "WorDrill is not on the ladder")
check('variant="wordrill"' not in SIOMODAL,
      "SioModal's popup keeps the old embedded look",
      "the popup was switched to the WorDrill layout")

print("\n9 · tokens, not raw hex")
check("--tier-good" in MAP and "--tier-weak" in MAP,
      "the session map paints on the tier tokens",
      "the session map hard-codes colours")
check(not re.search(r"#[0-9a-fA-F]{6}", MAP + METER),
      "no raw hex in the new components",
      "a raw hex colour crept into the new components")
check("--tier-good" in CSS and "--tier-medium" in CSS and "--tier-weak" in CSS,
      "the tier tokens exist to paint with",
      "a tier token is missing from globals.css")

print("\n10 · misses reach the Reviser the built way")
check("reviserHref" in SAYIT,
      "the done screen uses reviserHref (patch 23's path)",
      "the done screen invents its own review link")
check("SessionMap" in SAYIT and "CAP" in MAP,
      "the session map is capped — 612 dots is a wall, not a signal",
      "the session map is uncapped")

print("-" * 66)
print(f"  {passed} passed · {failed} failed")
sys.exit(1 if failed else 0)
