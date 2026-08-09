#!/usr/bin/env python3
"""
Patch 6 — labels everywhere.

  cd ~/fluoduo && python3 patch6/apply6.py --dry-run
  cd ~/fluoduo && python3 patch6/apply6.py

Every teacher/learner surface that prints a raw path or deck id now prints the
exercise and the SIO. The raw value survives as the link target and as a
`title=` tooltip, so nothing becomes harder to trace — only easier to read.

Idempotent: each edit checks for its own result first and skips if present.
Safe to re-run.
"""
import os, re, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch6")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)


def read(rel):
    p = os.path.join(ROOT, rel)
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else None


def write(rel, txt):
    if not DRY:
        open(os.path.join(ROOT, rel), "w", encoding="utf-8").write(txt)


def copy(rel):
    src, dst = os.path.join(B, rel), os.path.join(ROOT, rel)
    if not os.path.isfile(src):
        fail.append("missing in bundle: " + rel); return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY:
        shutil.copy2(src, dst)
    ok.append("file  " + rel)


def add_import(txt, imp):
    """Insert after the LAST single-line import; never inside a block comment
    or a multi-line import (both of which broke earlier patches)."""
    if imp in txt:
        return txt
    lines = txt.split("\n")
    idx = [i for i, l in enumerate(lines)
           if l.startswith("import ") and l.rstrip().endswith(";")]
    if idx:
        at = idx[-1] + 1
    else:
        at = 0
        if lines and lines[0].lstrip().startswith(("/*", '"use client"')):
            for i, l in enumerate(lines):
                if l.rstrip().endswith("*/") or l.rstrip() == '"use client";':
                    at = i + 1
    lines.insert(at, imp)
    return "\n".join(lines)


def edit(rel, subs, imps=(), tag=""):
    """subs: (guard, old, new). Skip when `guard` is already in the file."""
    name = tag or rel
    txt = read(rel)
    if txt is None:
        fail.append("not found: " + rel); return
    orig = txt
    for guard, old, new in subs:
        if guard and guard in txt:
            continue
        if old not in txt:
            fail.append(f"{name}: no match -> " + old[:70].replace("\n", " ")); return
        txt = txt.replace(old, new, 1)
    for imp in imps:
        txt = add_import(txt, imp)
    if txt != orig:
        write(rel, txt); ok.append("edit  " + name)
    else:
        skip.append("edit  " + name + " (already applied)")


def span_edit(rel, start, end, new, guard, tag=""):
    """Replace from `start` through the first `end` after it. Used where the
    old text is a whole function — safer than pasting 20 lines of anchor."""
    name = tag or rel
    txt = read(rel)
    if txt is None:
        fail.append("not found: " + rel); return
    if guard in txt:
        skip.append("edit  " + name + " (already applied)"); return
    i = txt.find(start)
    if i < 0:
        fail.append(f"{name}: start anchor not found -> " + start[:60]); return
    j = txt.find(end, i)
    if j < 0:
        fail.append(f"{name}: end anchor not found -> " + end[:60]); return
    write(rel, txt[:i] + new + txt[j + len(end):])
    ok.append("edit  " + name)


# ── 0. the module ──────────────────────────────────────────────────────────
copy("src/lib/labels.ts")

LBL = 'import { describePath, titleFor } from "@/lib/labels";'
ACT = 'import { describeActivity } from "@/lib/labels";'
DECK = 'import { describeDeck, titleFor } from "@/lib/labels";'

A = 'target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"'

# ── 1. Attendance — "Pages that day", the table Dan was looking at ─────────
edit("src/app/teacher/Attendance.tsx", [
    ("describePath(row.path)",
     f'<a href={{row.path}} {A}>{{row.path}}</a>',
     f'<a href={{row.path}} {A} title={{titleFor(row.path)}}>{{describePath(row.path).label}}</a>'),
], [LBL], tag="Attendance · Page column")

# ── 2. Overview — "Most visited pages, last 7 days" AND the day modal ──────
edit("src/app/teacher/Overview.tsx", [
    ("describePath(p.path)",
     f'<a href={{p.path}} {A}>{{p.path}}</a>',
     f'<a href={{p.path}} {A} title={{titleFor(p.path)}}>{{describePath(p.path).label}}</a>'),
    ("describePath(path)",
     f'<a href={{path}} {A}>{{path}}</a>',
     f'<a href={{path}} {A} title={{titleFor(path)}}>{{describePath(path).label}}</a>'),
], [LBL], tag="Overview · top pages + day modal")

# ── 3. Students — the per-learner "Pages visited" trail ────────────────────
edit("src/app/teacher/Students.tsx", [
    ("describePath(path)",
     f'<a href={{path}} {A}>{{path}}</a>',
     f'<a href={{path}} {A} title={{titleFor(path)}}>{{describePath(path).label}}</a>'),
], [], tag="Students · pages visited")

# ── 4. Activities — the Decks table printed bare deck ids ─────────────────
edit("src/app/teacher/Activities.tsx", [
    ("describeDeck(id)",
     f'<a href={{`/decks/${{id}}`}} {A}>{{id}}</a>',
     f'<a href={{`/decks/${{id}}`}} {A} title={{titleFor(id)}}>{{describeDeck(id).label}}</a>'),
], [DECK], tag="Activities · deck ids")

# ── 5. Students — retire the private labeller ─────────────────────────────
# Two hand-rolled labellers existed (here and in /moi) and they disagreed.
# Both now delegate, so a rename lands in one place.
span_edit(
    "src/app/teacher/Students.tsx",
    "  const normActivity = (id: string | null | undefined): string => {",
    "  };",
    '''  // Legacy route renames live in @/lib/labels now, so /moi and the teacher
  // page can no longer drift apart about what July was called.
  const normActivity = (id: string | null | undefined): string =>
    id ? normalizePath(id) : "(unlabelled)";''',
    guard="normalizePath(id)",
    tag="Students · normActivity → shared",
)
span_edit(
    "src/app/teacher/Students.tsx",
    "  const ACTIVITY_NAMES: [RegExp, string][] = [",
    "    return norm;\n  };",
    '''  // "/practice/speculearn/aliments" → "SpecuLearn · SIO-039 · Aliments".
  // The SIO is the point (Dan, 2026-08-10: "very hard to trace back what is
  // what later"); the raw id stays as the link target.
  const labelActivity = (norm: string): string => describeActivity(norm).label;''',
    guard="describeActivity(norm)",
    tag="Students · labelActivity → shared",
)
_t = read("src/app/teacher/Students.tsx")
if _t is not None:
    _t2 = add_import(_t, 'import { describeActivity, describePath, normalizePath, titleFor } from "@/lib/labels";')
    # comments that described the code these two functions used to be
    for stale in (
        "  // activityId is the recording page's pathname, so the 2026-07-20 URL\n"
        "  // renames split ONE exercise's history into two labels. Normalize legacy\n"
        "  // paths to today's names before any grouping, so old and new evidence\n"
        "  // merge into a single row.\n",
        '  // "/practice/speculearn/aliments" → "SpecuLearn · aliments" — the teacher\n'
        "  // reads exercises, not URLs.\n",
    ):
        _t2 = _t2.replace(stale, "", 1)
    # a stray line from a garbled terminal paste, seen 2026-08-10
    _t2 = re.sub(r'^\s*p = "src/app/teacher/Students\.tsx"\s*$\n?', "", _t2, flags=re.M)
    if _t2 != _t:
        write("src/app/teacher/Students.tsx", _t2)
        ok.append("edit  Students · imports + tidy")

# ── 6. /moi — same labeller, learner-facing ───────────────────────────────
span_edit(
    "src/app/moi/MoiContent.tsx",
    "function labelActivity(id: string): string {",
    "  return id;\n}",
    '''function labelActivity(id: string): string {
  // Was a second, subtly different copy of the teacher page's table — it said
  // "Compose It" where the teacher said "Composer", and knew nothing about
  // SIOs. One definition now (@/lib/labels), so a learner and their teacher
  // read the same name for the same exercise.
  return describeActivity(id).label;
}''',
    guard="describeActivity(id)",
    tag="/moi · labelActivity → shared",
)
_m = read("src/app/moi/MoiContent.tsx")
if _m is not None:
    _m2 = add_import(_m, ACT)
    if _m2 != _m:
        write("src/app/moi/MoiContent.tsx", _m2)
        ok.append("edit  /moi · import")

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  THEN:  npx tsc --noEmit && npm run build 2>&1 | tail -3

  LOOK AT:  /teacher -> Attendance.  "/unit/3" should now read "Unite 3",
            "/practice/grammarathon/finale" -> "GramMarathon Final",
            "/lessons/modaux" -> "Lecon . Modaux - split into modaux-plans
            (SIO-047) + modaux-avis (SIO-048), 2026-08-09".
            Hover any row to see the raw path.
""")
