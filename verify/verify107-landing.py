#!/usr/bin/env python3
"""
The landing page is for strangers, and only for strangers.

Dan, 6 Sep 2026: "/" shows a landing to a visitor who is not signed in and has
no local progress; a signed-in learner, or any device that already carries
progress, goes straight to today's Home, unchanged. The voice is hybrid —
playful cahier first, one credibility line under the hero — and the offering
is a GRID of course cards (French A1 real today, laid out so A2 and other
languages slot in later).

WHAT THIS PINS, and why each pin:

  1. THE GATE. The root page routes through RootGate; RootGate reads the
     progress blob (`fluolingo:progress`) and sends a progressed device to
     Home, and flips a landing to Home the moment auth answers with a user.
     Lose any of these and either a learner meets marketing or a stranger
     never does.
  2. NO FLASH OF THE WRONG VIEW. The static export prerenders "/" once for
     everyone, so the prerendered HTML must paint NEITHER view — not the
     landing CTA, not Home's welcome strip. (Skipped when out/ is absent;
     CI builds first, so there it always runs.)
  3. THE CREDIBILITY LINE — Dan's hybrid-voice ruling, verbatim.
  4. NO FULL-WIDTH CONTROL. « Start learning » and the course card are single
     controls; the no-full-width rule has no landing exemption.
  5. THE COURSE GRID: a grid, French A1 in it, and AT MOST ONE greyed
     coming-soon card (Dan: no fake promises).
  6. THE PICTURES ARE THE REAL APP, and they stay light: the three screenshots
     exist under public/landing/ and each is <= 150KB.

RETAKING THE SCREENSHOTS. Build open (NEXT_PUBLIC_OPEN_APP=1 npm run build),
serve out/ (any static server that maps /x to x.html), drive Chromium at
390x844 with deviceScaleFactor 2 (playwright-core, executablePath
/opt/pw-browsers/chromium in the dev container), dismiss first-run popups,
shoot /map, /practice/speculearn/commerces and /practice/dice/aliments, then
resize to 440px wide and save as WEBP quality ~82 into public/landing/
as map.webp / game.webp / drill.webp.

Run from the repo root:  python3 verify/verify107-landing.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

fails = []


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


page = read("src/app/page.tsx")
gate = read("src/app/RootGate.tsx")
landing = read("src/app/Landing.tsx")
gate_code = strip_comments(gate)
landing_code = strip_comments(landing)

# ── 1 · the gate ─────────────────────────────────────────────────────────────
if "<RootGate>" not in page:
    fails.append("page.tsx: the root page no longer routes through <RootGate> — "
                 "strangers and learners would see the same view")
if '"fluolingo:progress"' not in gate_code:
    fails.append("RootGate.tsx: the gate no longer reads fluolingo:progress — "
                 "a device with progress must go straight to Home")
if not re.search(r'getItem\("fluolingo:progress"\)[\s\S]{0,200}?return "home"', gate_code):
    fails.append("RootGate.tsx: existing progress no longer resolves to Home")
if not re.search(r"view\s*===\s*\"landing\"\s*&&\s*user\s*\?\s*\"home\"", gate_code):
    fails.append("RootGate.tsx: a signed-in answer from auth no longer flips "
                 "the landing to Home — a learner on a fresh device would be "
                 "stuck on marketing")
if 'view === "landing"' not in gate_code or "<Landing" not in gate_code:
    fails.append("RootGate.tsx: the landing is no longer conditional on the "
                 "gate's stranger verdict")

# ── 2 · the prerender paints neither view ────────────────────────────────────
index_html = os.path.join(ROOT, "out", "index.html")
if os.path.isfile(index_html):
    html = open(index_html, encoding="utf-8").read()
    if "Start learning" in html:
        fails.append("out/index.html: the prerender paints the landing CTA — "
                     "every learner would flash marketing before hydration")
    if "Bienvenue sur" in html:
        fails.append("out/index.html: the prerender paints Home's welcome "
                     "strip — every stranger would flash the learner view")

# ── 3 · the credibility line ─────────────────────────────────────────────────
cred = re.compile(r"Built by Dr(&nbsp;|\s)+Daniel Chan, NUS Centre for Language Studies")
if not cred.search(landing):
    fails.append("Landing.tsx: the credibility line under the hero is gone "
                 "(Dan's hybrid voice: \"Built by Dr Daniel Chan, NUS Centre "
                 "for Language Studies\")")

# ── 4 · no full-width single control ─────────────────────────────────────────
if re.search(r"w-full", landing_code):
    fails.append("Landing.tsx: a control wears w-full — no single button "
                 "spans the page (Dan's rule; the exemption is his to grant)")
css = read("src/app/globals.css")
m = re.search(r"\.landing-course\s*\{[^}]*\}", css)
if m and "width: 100%" in m.group(0):
    fails.append("globals.css: .landing-course is width:100% — a course card "
                 "is a single control and must not span the page")

# ── 5 · the course grid ──────────────────────────────────────────────────────
if not re.search(r'aria-label="Courses"[\s\S]{0,400}?grid-cols-2', landing_code):
    fails.append("Landing.tsx: the Courses section is no longer a grid — the "
                 "offering must stay platform-shaped (cards slot in later)")
if "French A1" not in landing_code:
    fails.append("Landing.tsx: the French A1 course card is gone — it is the "
                 "one real offering")
soon = len(re.findall(r"is-soon", landing_code))
if soon > 1:
    fails.append(f"Landing.tsx: {soon} coming-soon cards — Dan allowed at "
                 "most ONE greyed card, no fake promises")

# ── 6 · the screenshots are present and light ────────────────────────────────
for name in ("map.webp", "game.webp", "drill.webp"):
    p = os.path.join(ROOT, "public", "landing", name)
    if not os.path.isfile(p):
        fails.append(f"public/landing/{name} is missing — the landing's "
                     "graphics are screenshots of the real app")
    elif os.path.getsize(p) > 150 * 1024:
        fails.append(f"public/landing/{name} is {os.path.getsize(p)//1024}KB "
                     "— each landing image stays under 150KB")

if fails:
    print("verify107-landing: FAIL")
    for f in fails:
        print(f"  - {f}")
    sys.exit(1)
print("verify107-landing: OK — strangers get the landing, learners get Home, "
      "the prerender paints neither")
