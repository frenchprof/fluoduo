#!/usr/bin/env python3
"""
The drill shell's chrome: the ✕ has one home, and the 56px row is only drawn
when it carries something.

WHAT WAS WRONG, MEASURED. `DrillShell` stacked a 30px site bar, a 55px band,
and then a 56px row holding the ✕ at one end and a score at the other with a
243px EMPTY `flex-1` between them — on every surface with no progress to show:
a lesson's tab view, a landing, a finished run. At 390px on /lessons/colors
that put **187px of chrome above the first tab**. The band was already drawn,
already 55px tall, and carrying a single word.

The ✕ moved into the band and the row is now conditional. Re-measured the same
way: **132px**, and the band did not grow (the control takes `-my-1`, because
an untrimmed 36px target added 8px and gave back less than it saved).

THE ASSERTION THAT MATTERS MOST IS NOT THE SAVING. It is that **an exit always
exists**. The band only renders when `activityInfo()` resolves, and it does NOT
resolve for a route whose registry row was retired while the route stayed —
Sorting (#93) and iComplete (#97) are both deliberately in that state. Without
the `|| !act` guard the row would vanish on exactly those pages and take the
only way out with it. `/practice/complete-it/*` is the live instance: no band,
so the row renders and carries the ✕.

This file reads SOURCE. The rendered proof is a browser sweep across the
DrillShell surfaces, recorded in the commit; what a check can hold is that the
guard and its two hosts stay wired to each other.

Run from the repo root:  python3 verify/verify71-drill-chrome.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

DS = open("src/components/DrillShell.tsx", encoding="utf-8").read()
PB = open("src/components/PageBand.tsx", encoding="utf-8").read()

def strip_comments(src):
    return re.sub(r"\{/\*.*?\*/\}", "", re.sub(r"//[^\n]*", "",
                  re.sub(r"/\*.*?\*/", "", src, flags=re.S)), flags=re.S)

CODE = strip_comments(DS)

# ── 1 · the band can host a control, and the shell gives it one ────────────
check("lead" in PB and re.search(r"lead\??:\s*ReactNode", PB) is not None,
      "PageBand takes a `lead` control",
      "PageBand has no `lead` slot, so the band cannot host the ✕ and the 56px row "
      "is the only place it can live")
check(re.search(r"\{lead\}", PB) is not None,
      "PageBand renders it",
      "PageBand declares `lead` and never renders it — a prop that is accepted and "
      "dropped looks exactly like a working one")

band = re.search(r"<PageBand(.*?)/>", CODE, re.S)
check(band is not None, "DrillShell mounts a PageBand", "no PageBand in DrillShell")
if band:
    check("lead=" in band.group(1),
          "the band carries the ✕",
          "DrillShell no longer passes `lead`, so the ✕ is back to costing a whole row")
    check('aria-label="Exit"' in band.group(1),
          "and it is the Exit control, not something else",
          "the band's `lead` is not the Exit link")

# ── 2 · the row is conditional, on the right condition ─────────────────────
guard = re.search(r"const barNeeded\s*=\s*([^;]+);", CODE)
check(guard is not None,
      "the row is gated by `barNeeded`",
      "there is no `barNeeded` — the 56px row renders unconditionally again, which is "
      "the 55px this change reclaimed")
if guard:
    g = guard.group(1)
    check("progress" in g,
          "the row renders where there IS progress — unchanged for a run",
          "`barNeeded` ignores progress, so a drill mid-run loses its progress bar")
    check("help" in g,
          "and where the ? help ladder is live",
          "`barNeeded` ignores `help`, so the hint ladder has nowhere to render")
    # THE TRAP GUARD. Break-tested: removing `!act` leaves
    # /practice/complete-it/* with no exit at all.
    check("!act" in g,
          "AND where there is no band to host the ✕ — a drill you cannot leave is a trap",
          "`barNeeded` has lost `!act`. The band only renders when activityInfo() "
          "resolves, and it does NOT for a retired-registry route whose page stayed "
          "(Sorting #93, iComplete #97). On those the row would vanish and take the "
          "only exit with it.")

check(re.search(r"\{barNeeded && \(", CODE) is not None,
      "and the row is actually wrapped in it",
      "`barNeeded` is computed and never used to gate the row")

# ── 3 · exactly one ✕ on screen, ever ──────────────────────────────────────
exits = re.findall(r'aria-label="Exit"', CODE)
check(len(exits) == 2,
      "two Exit controls in source — the band's, and the row's fallback",
      f"found {len(exits)} Exit controls. There should be exactly two: one in the band, "
      "one in the row for the no-band case. More than that and a page shows two ✕.")
row_exit = re.search(r"\{!act && \(\s*<Link", CODE)
check(row_exit is not None,
      "the row's ✕ is gated on there being no band",
      "the row renders its ✕ unconditionally, so any page with a band shows TWO — worse "
      "than the row this change removed")

# ── 4 · the control does not grow the band ────────────────────────────────
lead_cls = re.search(r'lead=\{\s*<Link.*?className="([^"]+)"', DS, re.S)
check(lead_cls is not None and "-my-1" in lead_cls.group(1),
      "the ✕ is trimmed so the band keeps its height",
      "the band's ✕ has no `-my-1`. The title line is 28px inside py-3, so an untrimmed "
      "36px control adds 8px of band — measured, it gave back less than it saved.")

# ── 5 · the tabs sit with the band, and the drill's beat is untouched ──────
# Dan picked 8px from four gaps rendered on the page (2026-08-31). The offset
# lives on the TABS, not on DrillShell's shared content padding: that padding
# is used by all 28 surfaces and encodes an 11 Aug ruling — a drill CARD starts
# a fixed beat below the bar, because a short card under a header-sized hole
# was wrong. Cutting it at source would reopen that everywhere to tidy one page.
TABS_SRC = open("src/app/lessons/pager/LessonTabs.tsx", encoding="utf-8").read()
wrap = re.search(r'return \(\s*(?:/\*.*?\*/\s*)?<div className="([^"]*)">\s*\{/\* ONE ROW', TABS_SRC, re.S)
check(wrap is not None,
      "the tabs wrapper parsed",
      "could not find the tab strip's wrapper — the assertions below are vacuous")
if wrap:
    cls = wrap.group(1)
    check("-mt-" in cls,
          "the tabs pull themselves up to the band",
          "the tab strip no longer offsets itself, so it sits a full content-beat below "
          "the band — the 28px gap Dan rejected")
    check("sm:-mt-" in cls,
          "and at desktop width too, where the padding it cancels is larger",
          "only ONE offset is set. DrillShell's padding is pt-6 on a phone and sm:pt-10 "
          "above it, so a single value leaves the desktop at the gap Dan rejected — the "
          "same fault surviving at the width he was not looking at.")

DS_PAD = re.search(r'className="mx-auto flex w-full max-w-\[600px\][^"]*"', open("src/components/DrillShell.tsx", encoding="utf-8").read())
check(DS_PAD is not None and "pt-6" in DS_PAD.group(0) and "sm:pt-10" in DS_PAD.group(0),
      "DrillShell's own content beat is untouched — all 28 surfaces keep it",
      "DrillShell's content padding changed. That is the shared beat every drill card "
      "sits on (Dan, 11 Aug: a short card under a header-sized hole was wrong). Tightening "
      "the LESSON tabs must not reach it.")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
