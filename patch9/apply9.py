#!/usr/bin/env python3
"""
Patch 9 — SIO first, everywhere, including the three tables nobody had touched.

  cd ~/fluoduo && python3 patch9/apply9.py --dry-run
  cd ~/fluoduo && python3 patch9/apply9.py

Requires patches 6 and 7. SUPERSEDES patch 8 — if you never ran patch 8,
run this instead; if you did, this is safe on top.

Dan, 2026-08-10: "every item must have the SIO at the start for everything."

Two changes:

  1. Label ORDER flips. `SpecuLearn · SIO-041 · Les repas et les aliments`
     becomes `SIO-041 · SpecuLearn · Les repas et les aliments`. One edit in
     @/lib/labels.ts, so every table that already uses it follows at once —
     Attendance, Overview, the day pop-up, the student trail, Decks, Games,
     the Activity column, /moi.

  2. ITEM ids get the same treatment. `lieux-letris-21-aeroport` becomes
     `SIO-033 · lieux-letris-21-aeroport`. The raw id stays — it is the only
     handle on the exact question answered — but the outcome leads.

Idempotent. Safe to re-run.
"""
import os, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch9")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)
for need in ("src/lib/labels.ts", "src/lib/evidence.ts"):
    if not os.path.isfile(os.path.join(ROOT, need)):
        print(f"\n  ERROR: {need} missing — apply patches 3, 6 and 7 first\n"); sys.exit(1)


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
    """Never add a symbol already imported from the same module under another
    grouping — that is how patch 6 produced a duplicate identifier."""
    if imp in txt:
        return txt
    mod = imp.split('from "')[-1].rstrip('";')
    syms = [s.strip() for s in imp.split("{")[-1].split("}")[0].split(",") if s.strip()]
    for line in txt.split("\n"):
        if line.startswith("import ") and mod in line and all(s in line for s in syms):
            return txt
    lines = txt.split("\n")
    idx = [i for i, l in enumerate(lines)
           if l.startswith("import ") and l.rstrip().endswith(";")]
    lines.insert((idx[-1] + 1) if idx else 0, imp)
    return "\n".join(lines)


def edit(rel, subs, imps=(), tag=""):
    """subs: (guard, old, new, count?). A sub whose guard is present is skipped."""
    name = tag or rel
    txt = read(rel)
    if txt is None:
        fail.append("not found: " + rel); return
    orig = txt
    for guard, old, new, *rest in subs:
        count = rest[0] if rest else 1
        if guard and guard in txt:
            continue
        if txt.count(old) < count:
            fail.append(f"{name}: no match -> " + old[:70].replace("\n", " ")); return
        txt = txt.replace(old, new, count)
    for imp in imps:
        txt = add_import(txt, imp)
    if txt != orig:
        write(rel, txt); ok.append("edit  " + name)
    else:
        skip.append("edit  " + name + " (already applied)")


# ── 1. the order flip — one file, every table follows ─────────────────────
copy("src/lib/labels.ts")

ITEM = 'import { describeItem } from "@/lib/labels";'

# ── 2. /moi — hardest items, and both history tables ──────────────────────
edit("src/app/moi/MoiContent.tsx", [
    ("describeItem(item)",
     '<span className="font-bold text-slate-800" lang="fr">{item}</span>',
     '<span className="font-bold text-slate-800" lang="fr" title={item}>{describeItem(item).label}</span>'),
    ("describeItem(r.item)",
     'lang="fr">{r.item}{r.given &&',
     'lang="fr" title={r.item}>{describeItem(r.item).label}{r.given &&',
     2),
], [ITEM], tag="/moi · item ids")

# ── 3. Students — the hardest-items table ─────────────────────────────────
# The Recent-answers table is deliberately left alone: it already carries a
# dedicated Lesson column (added 2026-08-10), so prefixing the item there would
# print the same SIO twice on one row.
edit("src/app/teacher/Students.tsx", [
    ("describeItem(item)",
     '<a href={h} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{item}</a> : item;',
     '<a href={h} target="_blank" rel="noreferrer" title={item} className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{describeItem(item).label}</a> : describeItem(item).label;'),
], [ITEM], tag="Students · hardest items")

# ── 4. Students → "Time on task" ─────────────────────────────────────────
# This table printed `act` completely raw — it was never labelled by anything,
# by any patch, since it shipped. Dan, 2026-08-10: "when i go a student's
# records and i click on activities, there are not even SIO numbers visible in
# most of them." This is one of the two reasons why.
edit("src/app/teacher/Students.tsx", [
    ("describeActivity(act)",
     '<td className="px-3 py-2 font-bold text-slate-900">{act}</td>',
     '<td className="px-3 py-2 font-bold text-slate-900" title={act}>{describeActivity(act).label}</td>'),
], [], tag="Students · Time on task")

# ── 5. Students → "Games, pretests & more" ───────────────────────────────
# The other reason. This table keyed its rows on the game ALONE, discarding
# `collectionId` from the event payload — so a row could only ever say
# "letris", never which deck was played. No deck, no outcome, no SIO: the
# information was thrown away at aggregation time, before any labeller could
# see it. Keyed the way the Activities panel keys it, the SIO resolves.
edit("src/app/teacher/Students.tsx", [
    ("payload.collectionId",
     '        const game = str(ev.payload.game) ?? "?";',
     '        // Key on game + deck, the way the Activities panel does. Keying on\n'
     '        // the game alone threw the collectionId away, which is why this\n'
     '        // table could never show an outcome: "letris" is a surface,\n'
     '        // "letris · objets-articles" is a lesson.\n'
     '        const game = `${str(ev.payload.game) ?? "?"} · ${str(ev.payload.collectionId) ?? ""}`.replace(/ · $/, "");'),
    ("describeGame(game)",
     '<td className="px-3 py-2 font-bold text-slate-900">{game}</td>',
     '<td className="px-3 py-2 font-bold text-slate-900" title={game}>{describeGame(game).label}</td>'),
], ['import { describeGame } from "@/lib/labels";'], tag="Students · games by deck")

# ── 6. Overview → the day pop-up's "Games started" line ─────────────────
edit("src/app/teacher/Overview.tsx", [
    ("describeGame(g)",
     '{[...games.entries()].map(([g, n]) => `${g} ×${n}`).join(" · ")}',
     '{[...games.entries()].map(([g, n]) => `${describeGame(g).label} ×${n}`).join(" · ")}'),
], ['import { describeGame } from "@/lib/labels";'], tag="Overview · games started")

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  STOP THE DEV SERVER, then:

    rm -rf .next
    npx tsc --noEmit && npm run build 2>&1 | tail -3
    npm run dev

  Activities -> Games should now read:

    SIO-041 . SpecuLearn . Les repas et les aliments
    SIO-021 . VocabulaRain . Un, une ou des ?
    SIO-032 . Dice . Prepositions + pays

  Rows with no outcome (ConjugaZone, DejaRevu, Accueil, Unite 3) keep their
  plain name -- there is no SIO to lead with and inventing one would be worse.
""")
