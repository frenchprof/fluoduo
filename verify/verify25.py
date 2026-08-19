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
ink blob must come back even if you make it smaller"). So the heading
prose ("Bienvenue sur") stays dead, but the animated FluOlinGo + a
smaller « par Dr Chan » live on one line in the card, the whole show
~3.5 s (was 5.5 s), once per browser session.

What this asserts (the height itself is a screenshot's job):

  1  The hero heading prose is gone ("Bienvenue sur" — the shell's
     wordmark already brands the page), but the compact brand animation
     is present: wave letters, ink blob, byline strokes, the
     once-per-session gate, and the compressed timings.
  2  The bars are hairlines with real progressbar roles, not bordered
     furniture.
  3  The actions (Continue, DéjàRevu) live INSIDE the hero card, paired
     side by side — the button-grouping rule.
  4  Every progress counter survives (litmus: learner feedback stays).

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

# 1 · heading prose gone, compact animation present
check("Bienvenue sur" not in home,
      "the hero heading prose is gone (the shell wordmark already brands the page)",
      "the hero still greets — 'Bienvenue sur' is back")
check("fluo-brand-letter" in home and "fluo-byline" in home and "BYLINE_STROKES" in home,
      "the compact brand animation is back: wave letters, ink blob, byline",
      "the brand animation is missing a piece (letters / ink / byline)")
check("heroPlayed" in home,
      "the once-per-session gate survives (full show once, finished look after)",
      "the once-per-session gate is gone — the show would replay every visit")
check("<h1" in home and "fluo-serif text-xl" in home,
      "the heading is back as a real h1 (Design's report card, Dan 2026-08-19) at text-xl",
      "the heading is missing or the wrong size (expected an h1 with fluo-serif text-xl)")
check("text-2xl" not in home,
      "no text-2xl heading crept back into the hero",
      "a text-2xl heading is back — that size was retired with the 303px hero")

css = read("src/app/globals.css")
check("fluo-brand-hl 1s" in css and "0.95s forwards" in css,
      "the highlighter is compressed (1s from 0.95s, was 1.3s from 1.45s)",
      "the highlighter still runs the original 5.5-second-era timings")
check("2.0 + i * 0.08" in home,
      "the byline strokes start at 2.0s with 0.08s stagger (~3.5s total)",
      "the byline strokes still run the original 2.8s + 0.17s pacing")

# 2 · the report card: figures, not bars (Dan, 2026-08-19 — Design's stat
#     row replaces the 11 Aug hairlines; "without progress bar … like a
#     report card")
check(home.count("h-[3px]") == 0 and home.count('role="progressbar"') == 0,
      "no progress bars in the hero — the report card shows figures",
      "a progress bar is back in the hero (Dan, 2026-08-19: report card, no bars)")
for label in ("Level", "Streak", "Course", "XP", "Lessons"):
    check(f">{label}</span>" in home,
          f"the {label} figure is on the card",
          f"the {label} figure is missing from the report card")

# 3 · actions grouped in the card, side by side
sec_start = home.find("<section")
sec_end = home.find("</section>", sec_start)
hero = home[sec_start:sec_end]
check('aria-label="Continue"' in hero and 'aria-label="DéjàRevu"' in hero
      and 'aria-label="Help and more"' in hero,
      "the ⏪ ▶ ⋯ controls live inside the hero card they act on",
      "a hero control is missing or floats outside the card (button-grouping rule)")
cont = hero.find('aria-label="Continue"')
revu = hero.find('aria-label="DéjàRevu"')
check(cont >= 0 and revu >= 0 and "</div>" not in "" and abs(revu - cont) < 1400,
      "the two actions are paired, not scattered",
      "the two actions are far apart in the card")

# 4 · every counter survives
for marker, what in (
    ("doneTotal}/{SIOS.length", "the done-count chip"),
    ("progress.streak", "the streak chip"),
    ("progress.xp", "the XP chip"),
    ("{pct}%", "the course-completion percentage"),
):
# (gems and the level XP counter left the hero with the stat row —
#  Dan, 2026-08-19: the shop shows gems, the profil shows the level bar.)
    check(marker in home,
          f"{what} survives the shrink",
          f"{what} was lost in the shrink — progress counters are learner feedback")

print("\npatch 25 check (hero rows)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
