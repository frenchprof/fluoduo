#!/usr/bin/env python3
"""
Patch 7 — the labels patch 6 missed, and the links it should never have cost.

  cd ~/fluoduo && python3 patch7/apply7.py --dry-run
  cd ~/fluoduo && python3 patch7/apply7.py

Requires patch 6 to have been applied first.

Two things Dan caught on 2026-08-10:

  1. Activities -> Games still read `letris · objets-articles`. That table is
     keyed off the EVENT payload ("<game> · <collectionId>"), not off a route,
     so nothing in patch 6 touched it. Same for the drills that record under a
     key rather than a path (`say-it:possessives`, `ecoutexte:unite-3`).

  2. On /moi, rows whose activityId is a key rather than a path rendered as
     dead text. That predates patch 6 — the test was `startsWith("/")`, so a
     key never got a link — but patch 6 made it conspicuous by labelling the
     rows properly, and a name you cannot click is a worse offence than an id
     you cannot read.

Idempotent. Safe to re-run.
"""
import os, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch7")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)
if not os.path.isfile(os.path.join(ROOT, "src/lib/labels.ts")):
    print("\n  ERROR: patch 6 has not been applied (src/lib/labels.ts missing)\n"); sys.exit(1)


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
    if imp in txt:
        return txt
    # Never add a symbol that is already imported from the same module under a
    # different grouping — that is exactly how patch 6 produced
    # "Duplicate identifier 'describePath'".
    mod = imp.split('from "')[-1].rstrip('";')
    syms = [s.strip() for s in imp.split("{")[-1].split("}")[0].split(",") if s.strip()]
    for line in txt.split("\n"):
        if line.startswith("import ") and mod in line:
            if all(s in line for s in syms):
                return txt
    lines = txt.split("\n")
    idx = [i for i, l in enumerate(lines)
           if l.startswith("import ") and l.rstrip().endswith(";")]
    at = (idx[-1] + 1) if idx else 0
    lines.insert(at, imp)
    return "\n".join(lines)


def edit(rel, subs, imps=(), tag=""):
    """subs: (guard, old, new, count). Skip a sub whose guard is present."""
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


def span_edit(rel, start, end, new, guard, tag=""):
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


# ── 0. the module, extended ────────────────────────────────────────────────
copy("src/lib/labels.ts")

BLUE = "font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"

# ── 1. Activities -> Games ─────────────────────────────────────────────────
# The href was `/games/letris · objets-articles`, which was never a route —
# every link in this table has been dead since it shipped. An <a> with no href
# renders as plain text, which is the honest thing to show when a key has
# nowhere to go.
edit("src/app/teacher/Activities.tsx", [
    ("describeGame(key)",
     f'<a href={{`/games/${{key}}`}} target="_blank" rel="noreferrer" className="{BLUE}">{{key}}</a>',
     '<a href={hrefForGame(key) ?? undefined} target="_blank" rel="noreferrer" title={key}'
     f' className={{hrefForGame(key) ? "{BLUE}" : "font-bold text-slate-900"}}>{{describeGame(key).label}}</a>'),
], ['import { describeGame, hrefForGame } from "@/lib/labels";'],
   tag="Activities · Games table")

# ── 2. /moi — a label must not cost a link ────────────────────────────────
edit("src/app/moi/MoiContent.tsx", [
    ("hrefForActivity(key)",
     'href: key.startsWith("/") ? key : null,',
     "href: hrefForActivity(key),"),
    ("hrefForActivity(r.activityId)",
     '{r.activityId.startsWith("/") ? <a href={r.activityId} className="font-bold text-blue-700 underline underline-offset-2">{labelActivity(r.activityId)}</a> : labelActivity(r.activityId)}',
     '<a href={hrefForActivity(r.activityId) ?? undefined} title={r.activityId}'
     ' className={hrefForActivity(r.activityId) ? "font-bold text-blue-700 underline underline-offset-2" : "font-bold text-slate-700"}>'
     "{labelActivity(r.activityId)}</a>",
     2),
], ['import { hrefForActivity } from "@/lib/labels";'], tag="/moi · links restored")

# ── 3. Students — the third private href table ────────────────────────────
# `hrefFor` knew about mcq:, vocabularain:, numbus: and speculearn: and nothing
# else, so say-it:, complete-it:, dice-practice: and compose: rendered dead
# here too. Same fix, same single source.
span_edit(
    "src/app/teacher/Students.tsx",
    "  const hrefFor = (key: string): string | null => {",
    "    return null;\n  };",
    "  const hrefFor = (key: string): string | null => hrefForActivity(key);",
    guard="hrefForActivity(key)",
    tag="Students · hrefFor → shared",
)
def imports_symbol(txt, symbol, module="@/lib/labels"):
    """Is `symbol` already imported from `module`? Checked against the import
    LINES, not the whole file — patch 6's duplicate-import breakage came from
    testing for a whole statement that a later edit had rewritten."""
    return any(
        l.startswith("import ") and module in l and symbol in l
        for l in txt.split("\n")
    )


_t = read("src/app/teacher/Students.tsx")
if _t is not None and not imports_symbol(_t, "hrefForActivity"):
    old = 'import { describeActivity, describePath, normalizePath, titleFor } from "@/lib/labels";'
    new = 'import { describeActivity, describePath, hrefForActivity, normalizePath, titleFor } from "@/lib/labels";'
    _t2 = _t.replace(old, new, 1) if old in _t else add_import(_t, 'import { hrefForActivity } from "@/lib/labels";')
    write("src/app/teacher/Students.tsx", _t2)
    ok.append("edit  Students · import")

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  STOP THE DEV SERVER FIRST, then:

    rm -rf .next
    npx tsc --noEmit && npm run build 2>&1 | tail -3
    npm run dev

  LOOK AT:  Activities -> Games.  "letris . objets-articles" should read
            "VocabulaRain . SIO-021 . Un, une ou des ?" and the link should
            actually go somewhere for the first time.
            /moi -> Where I lose marks: "say-it:possessives" becomes
            "WorDrill . SIO-025 . ..." AND becomes clickable.
""")
