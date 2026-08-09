#!/usr/bin/env python3
"""
Apply patch 3 — the evidence model.

  cd ~/fluoduo && python3 patch3/apply3.py --dry-run
  cd ~/fluoduo && python3 patch3/apply3.py

Checks "already applied" BEFORE attempting a match, so re-running is safe.
Import insertion anchors on a COMPLETE single-line import (starts with
`import `, ends with `;`) — the two failure modes from patch 1 were an import
wedged inside a multi-line import block and one landed inside a doc comment.
"""
import os, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch3")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)
if not os.path.isdir(B):
    print("\n  ERROR: patch3/ not found — unzip into the repo root first\n"); sys.exit(1)

def copy(rel):
    src, dst = os.path.join(B, rel), os.path.join(ROOT, rel)
    if not os.path.isfile(src): fail.append("missing in bundle: " + rel); return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY: shutil.copy2(src, dst)
    ok.append("file  " + rel)

def add_import(lines, imp):
    """Insert after the last COMPLETE single-line import — never inside a
    multi-line import block (patch-1 failure mode #1) and never inside the
    leading doc comment (failure mode #2). When a file has NO single-line
    import at all (progress.ts: its only import spans many lines), fall back
    to the first line after the leading block comment."""
    idx = [i for i, l in enumerate(lines)
           if l.startswith("import ") and l.rstrip().endswith(";")]
    if idx:
        lines.insert(idx[-1] + 1, imp)
        return lines
    # fall back: just past the closing */ of the leading block comment
    if lines and lines[0].lstrip().startswith("/*"):
        for i, l in enumerate(lines):
            if l.rstrip().endswith("*/"):
                lines.insert(i + 1, imp)
                return lines
    lines.insert(0, imp)
    return lines

def edit(rel, subs, imp=None):
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p): fail.append("not found: " + rel); return
    txt = orig = open(p, encoding="utf-8").read()
    for old, new in subs:
        if new in txt: continue                      # already applied — check FIRST
        if old in txt: txt = txt.replace(old, new, 1)
        else: fail.append(rel + ": no match -> " + old[:64]); return
    if imp and imp not in txt:
        txt = "\n".join(add_import(txt.split("\n"), imp))
    if txt != orig:
        if not DRY: open(p, "w", encoding="utf-8").write(txt)
        ok.append("edit  " + rel)
    else:
        skip.append("edit  " + rel + " (already applied)")

# ── new / replacement files ────────────────────────────────────────────────
copy("src/lib/evidence.ts")
copy("src/lib/firebase/responses.ts")

# ── recordItemResult: accept and forward the evidence block ────────────────
edit("src/lib/progress.ts", [
 ("export function recordItemResult(itemId: string, correct: boolean, given?: string, activity?: string): Progress {",
  "export function recordItemResult(\n"
  "  itemId: string,\n"
  "  correct: boolean,\n"
  "  given?: string,\n"
  "  activity?: string,\n"
  "  /** How the answer was produced (PRD §7). Omit and the record still\n"
  "   *  stores, just without evidence meaning — adoption is incremental. */\n"
  "  ev?: { hintsTaken?: number; revealed?: boolean; latencyMs?: number },\n"
  "): Progress {"),
 ('void import("@/lib/firebase/responses")\n'
  '    .then((m) => m.recordResponse(itemId, correct, { given, xpPaid: paid, activity }))\n'
  '    .catch(() => {});',
  'void import("@/lib/firebase/responses")\n'
  '    .then((m) =>\n'
  '      m.recordResponse(itemId, correct, {\n'
  '        given,\n'
  '        xpPaid: paid,\n'
  '        activity,\n'
  '        latencyMs: ev?.latencyMs,\n'
  '        evidence: buildEvidence(itemId, activity, {\n'
  '          hintsTaken: ev?.hintsTaken,\n'
  '          revealed: ev?.revealed,\n'
  '        }),\n'
  '      }),\n'
  '    )\n'
  '    .catch(() => {});'),
], 'import { buildEvidence } from "@/lib/evidence";')

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 56)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 56)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  THEN:  npx tsc --noEmit && npm run build && npm run lint 2>&1 | tail -2
         (lint should stay at 126)

  Every existing caller keeps working — the new argument is optional and every
  new Firestore field is optional in the rules. Nothing needs to change for the
  evidence trail to start carrying outcomeId and evidenceType on every answer.

  What is NOT wired yet, deliberately:
    · hintsTaken / revealed — nothing counts hints outside Finale's clue
      ladder, so assistance will read "none" everywhere until the help-ladder
      work lands. That is honest: it says "no help recorded", not "no help
      taken".
    · latencyMs — plumbed through, but no caller times its questions yet.
""")
