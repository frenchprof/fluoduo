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
