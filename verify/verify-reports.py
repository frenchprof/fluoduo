#!/usr/bin/env python3
"""
The teacher Reports tab check (mockup §2a — "Report cards, no accordions").

What it asserts (the things a screenshot cannot):

  1  /teacher has a Reports panel: key, label, and a render arm wired to the
     shared events/roster streams (no fetch of its own for the cards).
  2  Reports is four cards on a 2x2 grid — and NO accordions: the panel
     renders no <Section>, no <details>, no SectionGroup.
  3  Each card carries a headline number and an Export button; all four
     CSVs exist (under-5-days, accuracy-by-group, day-by-day, analytics).
  4  The cards are on the Cahier tokens (paper-raised, line-strong, ink),
     not the slate palette the older panels use; labels are English.
  5  The analytics-summary export MOVED: CLASS_UIDS lives in Reports.tsx,
     and Students.tsx no longer renders its CSV accordion (stu:csv).
  6  One name per pretest group on both tabs: Pretests exports pretestTitle
     and Reports imports it rather than re-deriving titles.

Run from the repo root:  python3 verify/verify-reports.py
"""
import os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    """A check must tell code from prose (2026-08-10 lesson)."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

page = strip_comments(read("src/app/teacher/page.tsx"))
reports = strip_comments(read("src/app/teacher/Reports.tsx"))
students = strip_comments(read("src/app/teacher/Students.tsx"))
pretests = strip_comments(read("src/app/teacher/Pretests.tsx"))

# ── 1 · the panel is wired in ──────────────────────────────────────────────
check(bool(reports), "Reports.tsx exists", "src/app/teacher/Reports.tsx is missing")
check('key: "reports"' in page and "📄 Reports" in page,
      "the Reports tab is on the panel rail",
      "page.tsx has no reports panel entry")
check('panel === "reports" && <Reports events={shown ?? []} roster={roster}' in page,
      "Reports reads the shared events/roster streams",
      "page.tsx does not hand Reports the shared events/roster")
check("fetchAllEvents" not in reports and "fetchLeaderboard" not in reports,
      "the cards fetch nothing of their own (summary export aside)",
      "Reports.tsx re-fetches streams the page already holds")

# ── 2 · four cards, 2x2, no accordions ─────────────────────────────────────
check("sm:grid-cols-2" in reports,
      "the grid is 2-up from sm (2x2 with four cards)",
      "Reports has no sm:grid-cols-2 grid")
check(reports.count("<ReportCard") == 4,
      "exactly four report cards",
      f"expected 4 <ReportCard>, found {reports.count('<ReportCard')}")
check("Section" not in reports and "<details" not in reports,
      "no accordions — no Section, no <details>",
      "Reports.tsx renders an accordion (Section/<details>)")

# ── 3 · headline number + Export on every card; the four CSVs ──────────────
check("text-4xl font-black" in reports,
      "cards carry a headline number",
      "no headline number style (text-4xl font-black) in the card")
check("⬇️ Export" in reports and "onExport" in reports,
      "every card has its Export button",
      "the card template has no Export button")
for stem in ("under-5-days", "accuracy-by-group", "day-by-day", "analytics"):
    check(f'"{stem}"' in reports,
          f"the {stem} CSV exists",
          f"no {stem} CSV export in Reports.tsx")
check('"\\ufeff"' in read("src/app/teacher/Reports.tsx"),
      "CSVs keep the Excel BOM the old export had",
      "the CSV builder lost the \\ufeff BOM — Excel will mangle accents")

# ── 4 · Cahier tokens, English labels ──────────────────────────────────────
for token in ("--cahier-paper-raised", "--cahier-line-strong", "--cahier-ink"):
    check(token in reports,
          f"cards use {token}",
          f"Reports.tsx does not use {token}")
check("cahier-btn" in reports,
      "the Export button is a cahier-btn",
      "the Export button is not on the cahier button style")
for label in ("active days", "Accuracy by group", "Day-by-day usage", "Analytics summary"):
    check(label in reports,
          f'English label "{label}" present',
          f'card label "{label}" missing')

# ── 5 · the summary export moved, not duplicated ───────────────────────────
check("CLASS_UIDS" in reports,
      "CLASS_UIDS lives in Reports.tsx",
      "Reports.tsx has no CLASS_UIDS — the summary export lost its roster")
check("CLASS_UIDS" not in students and "stu:csv" not in students,
      "Students.tsx no longer carries the CSV accordion",
      "Students.tsx still has the analytics-summary accordion (stu:csv/CLASS_UIDS)")
check("fetchStudentDetail" in reports,
      "the summary export still reads the deep per-student stores",
      "the summary export no longer calls fetchStudentDetail")

# ── 6 · the phone fixes (Dan's screenshot review, 2026-08-11) ──────────────
bar = strip_comments(read("src/components/BottomBar.tsx"))
drag = strip_comments(read("src/lib/useDragFloat.ts"))
check('setProperty("--bottombar-floor"' in bar and "removeProperty" in bar and "ResizeObserver" in bar,
      "the bottom bar declares its own measured float floor",
      "BottomBar.tsx does not declare --bottombar-floor (measured, withdrawn when hidden)")
check("var(--bottombar-floor" in drag and "var(--float-floor" in drag,
      "the floats honour both declared floors",
      "useDragFloat ignores a declared floor (--float-floor / --bottombar-floor)")
check("BOTTOM_BAR_H" not in drag,
      "no hardcoded bar-height guess left in the drag clamp",
      "useDragFloat still guesses the bar height (BOTTOM_BAR_H) instead of reading the declared floor")
check('"flex gap-2 overflow-x-auto pb-1"' in page and '"flex flex-wrap gap-2"' not in page
      and "shrink-0 whitespace-nowrap" in page,
      "the panel pills are one scrolling row, never a stack",
      "the teacher panel rail still wraps into stacked rows")
check("scrollIntoView" in page and 'data-active={panel === p.key}' in page,
      "the active pill scrolls itself into view",
      "nothing keeps the active pill visible in the scrolling rail")

# ── 7 · one name per group, both tabs ──────────────────────────────────────
check("export function pretestTitle" in pretests,
      "Pretests exports pretestTitle",
      "Pretests.tsx does not export pretestTitle")
check("pretestTitle" in reports and 'from "./Pretests"' in reports,
      "Reports names groups through Pretests' own titles",
      "Reports.tsx re-derives pretest titles instead of importing pretestTitle")

print("\nteacher Reports tab check\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
