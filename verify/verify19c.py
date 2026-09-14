#!/usr/bin/env python3
"""
Patch 19c's check — the two rows patch 19 did not finish.

  1  The HELP panel (GuideBody) keeps NO activity list. It once derived one
     from the registry (grouped by family, four columns, no truncation) to
     end a private list whose spellings drifted; on 11 Sep Dan removed the
     grid outright — "the activities are already on the menu" — and this
     now holds that it stays gone.

  2  The `crumb` prop is gone. Declared on CahierShell, passed by every
     page, never rendered — its one live job (a document.title fallback)
     now comes from the registry.

Run from the repo root:  python3 verify/verify19c.py
"""
import os, re, sys, pathlib

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    """A check must tell code from prose (lesson of 2026-08-10: three false
    positives in one session came from matching words inside the comments
    that explained their removal)."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"(?<=[ ;{(])//[^\n]*", "", src)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

guide = read("src/components/GuideBody.tsx")
guide_code = strip_comments(guide)
reg = read("src/content/activities.ts")

# ── 1 · HELP keeps NO activity list at all ─────────────────────────────────
# Patch 19c made the HELP grid derive from the registry so its spellings could
# not drift. On 11 Sep Dan removed the grid outright — "the activities are
# already on the menu" — the ☰ menu lists every activity from that same
# registry one tap away, so a second copy on the guide was redundant. The
# assertions that policed the grid's shape (imports, FAMILIES.map, four
# columns, no truncate) are retired with it; what stays is the one that
# still matters — no private activity list can come back here — plus the
# grid staying gone, so the next session does not helpfully restore it.
private_rows = re.findall(r'\{\s*emoji:\s*"[^"]+",\s*name:', guide_code)
check(not private_rows,
      "no hardcoded activity rows in GuideBody",
      f"{len(private_rows)} hardcoded activity row(s) in GuideBody — the ☰ menu is the one list")

check("activitiesIn(" not in guide_code and "FAMILIES.map" not in guide_code,
      "GuideBody draws no activity grid (Dan, 11 Sep: the activities are already on the menu)",
      "GuideBody draws an activity grid again — the ☰ menu already lists every activity from the registry")

# TWO GUIDES, ONE DOOR (Dan, 2026-09-13: "Both should live under SOS HELP,
# although one should be the abridged version essential to begin, while the
# other has the details"). The five steps are the QuickStart; the full manual is
# a standalone page in public/ that the QuickStart links to. Both halves have
# to exist, or Help offers one guide and a dead link.
# THE ILLUSTRATED GUIDE IS THE FULL MANUAL (Dan, 14 Sep, shown the two side by
# side and asked which should sit behind Help: "YES PLS DO THAT NOW"). It had
# been built in #357 and served NOWHERE — docs/ is not in the static export — so
# for a day the only full guide a learner could open was the pictureless wiki,
# which is now retired into it.
#
# It is a COPY of docs/guide/, not a second document: docs/GUIDE.md is the
# source, scripts/build-guide.py renders it, and public/manual/ is what ships.
# The check compares the two, because a copy that drifts from its source is how
# the app came to have two guides disagreeing about XP in the first place.
check(os.path.isfile("public/manual/index.html"),
      "the full manual ships (public/manual/index.html, served at /manual)",
      "public/manual/index.html is missing — the QuickStart's « full guide » "
      "link would 404")
check(not os.path.isfile("public/manual.html"),
      "the pictureless wiki is retired, not left beside it",
      "public/manual.html is back — two full guides behind one Help door, and "
      "the host decides which one /manual serves")
_manual = read("public/manual/index.html")
_source = read("docs/guide/index.html")
check(bool(_source) and _manual == _source,
      "the served manual is byte-for-byte the built docs/guide",
      "public/manual/index.html has drifted from docs/guide/index.html — "
      "re-run scripts/build-guide.py and copy it across")
check(os.path.isdir("public/manual/img"),
      f"its {len(os.listdir('public/manual/img')) if os.path.isdir('public/manual/img') else 0} "
      "screenshots ship with it",
      "public/manual/img is missing — every figure would be a broken image")
check('href="/manual"' in guide_code,
      "the QuickStart links to the full manual",
      "GuideBody no longer links to /manual — the detailed half becomes "
      "unreachable from Help")
check("/guide" in _manual,
      "…and the manual links back to the QuickStart",
      "the manual has no way back to the five steps — the pair only walks one way")
check("20" in _manual and "free, once" in _manual,
      "the manual states the welcome purse",
      "the manual does not state what a learner starts with")
# The three stale claims by name, not a sweep for the word "nothing" — the
# manual's own opening line on the subject is « Nothing you can open pays
# nothing », which a blunt test flags as the very fault it is announcing fixed.
_stale = [c for c in ("pays no XP", "records nothing and pays nothing",
                      "NumBus, NumBourse | 0", "SpecuLearn, VocabulaRain, NumBus, NumBourse | 0")
          if c in _manual]
check(not _stale,
      "no activity is described as paying nothing (13 Sep economy)",
      f"the manual still carries the pre-13-Sep claim(s): {_stale} — every "
      "activity pays at least once now")
check("beats your own best" in _manual,
      "…and it explains that improving pays again",
      "the manual does not mention beating your own best — the farming rule "
      "(Dan, 13 Sep) is invisible to a learner")

# Registry sanity: every family that groups ACTIVITIES has at least one, so no
# grouped surface can render an empty shelf.
#
# GOALS is the documented exception since 19 Aug: its children are the fifty
# objectives (by unit, then goal), not activities — the five that used to sit
# under it are now PRACTICE. It carries no `family: "goals"` row on purpose,
# and the Menu grid iterates ACTIVITIES directly, so nothing renders empty.
OBJECTIVE_FAMILIES = {"goals"}
fams = set(re.findall(r'\{ key: "([a-z]+)", name: "FluOL?in', reg))
fam_of = re.findall(r'family: "([a-z]+)"', reg)
empty = sorted(fams - set(fam_of) - OBJECTIVE_FAMILIES)
check(fams and not empty,
      f"every activity family has activities ({len(fams)} families, {len(fam_of)} rows, "
      f"{len(OBJECTIVE_FAMILIES)} objective-family exempt)",
      f"families with no activities would render empty groups: {empty}")
check("practice" in set(fam_of),
      "the five pre-lesson activities live under PRACTICE (19 Aug regrouping)",
      "no activity is in the practice family — the 19 Aug regrouping is undone")

# ── 2 · the crumb prop is gone ─────────────────────────────────────────────
shell_code = strip_comments(read("src/components/CahierShell.tsx"))
check("crumb" not in shell_code,
      "CahierShell no longer declares a crumb prop",
      "CahierShell still declares/uses `crumb`")

# No page may pass one either. Scan every <CahierShell …> opening tag; the
# unrelated TopBar in FlipItContent has its own (rendered) crumb and compose
# has a THEMES field of the same name — scoping to the tag avoids both.
passers = []
for p in pathlib.Path("src").rglob("*.tsx"):
    src = strip_comments(p.read_text(encoding="utf-8"))
    for m in re.finditer(r"<CahierShell\b", src):
        j, depth = m.end(), 0
        while j < len(src):
            c = src[j]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            elif c == ">" and depth == 0:
                break
            j += 1
        if re.search(r"\bcrumb=", src[m.start():j]):
            passers.append(str(p))
check(not passers,
      "no page passes crumb to CahierShell",
      f"crumb is still passed by: {sorted(set(passers))}")

# The title fallback the crumb used to feed must not simply vanish (audit
# 2026-07-19: indistinguishable browser tabs). The registry supplies it now.
check("activity(active)?.name" in shell_code,
      "document.title falls back to the registry, not the crumb",
      "the crumb went but no registry fallback replaced it — non-flap pages lose their titles")

print("\npatch 19c check\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
