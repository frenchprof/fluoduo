#!/usr/bin/env python3
"""
Patch 19c's check — the two rows patch 19 did not finish.

  1  The HELP panel (GuideBody) derives from the activity registry: grouped
     by family, four columns, and NO name can truncate. It was the last of
     the four surfaces keeping a private activity list — 15 tiles, its own
     spellings ("Lesson", "Flip It"), two of which both cut to "GramMara…"
     and became the same button.

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

# ── 1 · HELP derives from the registry ─────────────────────────────────────
check('from "@/content/activities"' in guide_code,
      "GuideBody imports the registry",
      "GuideBody does not import @/content/activities — it still keeps its own list")

check("FAMILIES.map" in guide_code and "activitiesIn(" in guide_code,
      "HELP grid is grouped by family, in family order",
      "HELP grid does not iterate FAMILIES/activitiesIn — grouping is hand-rolled or absent")

# The old private list declared rows like `{ emoji: "🔮", name: "SpecuLearn"…`.
# Any literal activity row left in the file is a second source of truth.
private_rows = re.findall(r'\{\s*emoji:\s*"[^"]+",\s*name:', guide_code)
check(not private_rows,
      "no hardcoded activity rows remain in GuideBody",
      f"{len(private_rows)} hardcoded activity row(s) still in GuideBody")

check("grid-cols-4" in guide_code,
      "the activity grid is four columns",
      "the activity grid is not grid-cols-4")

check("truncate" not in guide_code,
      "no HELP tile can truncate its name",
      "GuideBody still uses `truncate` — names can be cut to 'GramMara…' again")

# Registry sanity: every family that groups ACTIVITIES has at least one, so no
# grouped surface can render an empty shelf.
#
# GOALS is the documented exception since 19 Aug: its children are the fifty
# objectives (by unit, then goal), not activities — the five that used to sit
# under it are now PRACTICE. It carries no `family: "goals"` row on purpose,
# and the Menu grid iterates ACTIVITIES directly, so nothing renders empty.
OBJECTIVE_FAMILIES = {"goals"}
fams = set(re.findall(r'\{ key: "([a-z]+)", name: "FluOlin', reg))
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
