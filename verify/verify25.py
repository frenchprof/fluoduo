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
  4  The actions (Continue, DéjàRevu, Help) live INSIDE the hero card,
     grouped — the button-grouping rule.
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

# 2b · the marks are a horizontal report-card row
check("<dl" in home and "<dt" in home and "<dd" in home,
      "the marks are a description list — each figure carries its label",
      "the marks are not a <dl> of value/label pairs")
dl_open = home.find("<dl")
dl_cls = home[dl_open:home.find(">", dl_open)] if dl_open >= 0 else ""
check("MARKS" in home and "flex-wrap" not in dl_cls and "flex-1" in home,
      "every mark shares one row — the marks list never wraps",
      "the row of marks can wrap — a report card's row stays a row")

# 3 · actions grouped in the card, side by side
sec_start = home.find("<section")
sec_end = home.find("</section>", sec_start)
hero = home[sec_start:sec_end]
check('aria-label="Continue"' in hero and 'aria-label="DéjàRevu"' in hero,
      "Continue and DéjàRevu live inside the hero card they act on",
      "the hero's actions float outside the card (button-grouping rule)")
cont = hero.find('aria-label="Continue"')
revu = hero.find('aria-label="DéjàRevu"')
check(cont >= 0 and revu >= 0 and "</div>" not in "" and abs(revu - cont) < 1400,
      "the two actions are paired, not scattered",
      "the two actions are far apart in the card")

# 4 · every counter survives
for marker, what in (
    ("doneTotal}/${SIOS.length", "the done count"),
    ("progress.streak", "the streak"),
    ("progress.xp", "the XP total"),
    ("progress.gems", "the gems counter"),
    ("${pct}%", "the course-completion percentage"),
    ("lvl.into}/${lvl.span", "the level XP counter"),
):
    check(marker in home,
          f"{what} survives the restyle",
          f"{what} was lost in the restyle — progress counters are learner feedback")

print("\npatch 25 check (hero rows)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
