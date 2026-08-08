import os, sys
DRY = "--dry-run" in sys.argv
ok, skip, fail = [], [], []

def edit(rel, subs, add_import=None):
    p = os.path.join(os.getcwd(), rel)
    if not os.path.isfile(p): fail.append("not found: " + rel); return
    txt = orig = open(p, encoding="utf-8").read()
    for old, new in subs:
        if new in txt: continue          # already applied -- check FIRST
        if old in txt: txt = txt.replace(old, new, 1)
        else: fail.append(rel + ": no match -> " + old[:60]); return
    if add_import and add_import not in txt:
        lines = txt.split("\n")
        last = max([i for i,l in enumerate(lines) if l.startswith("import ")] or [0])
        lines.insert(last+1, add_import); txt = "\n".join(lines)
    if txt != orig:
        if not DRY: open(p,"w",encoding="utf-8").write(txt)
        ok.append(rel)
    else: skip.append(rel + " (already applied)")

edit("src/content/collections/index.ts", [
 ('import lesDe from "./les-de.json";\n', ''),
 ('import modaux from "./modaux.json";',
  'import modauxPlans from "./modaux-plans.json";\nimport modauxAvis from "./modaux-avis.json";'),
 ('  lesDe as Collection,\n', ''),
 ('  modaux as Collection,',
  '  modauxPlans as Collection,\n  modauxAvis as Collection,'),
])

edit("src/games/compose/banks.tsx", [
 ('const BANKS: ComposeBank[] = [DIRECTIONS_BANK, CAFE_BANK, GREETINGS_BANK, RENDEZVOUS_BANK, SHOP_BANK, MARCHE_BANK];',
  'const BANKS: ComposeBank[] = [DIRECTIONS_BANK, CAFE_BANK, GREETINGS_BANK, RENDEZVOUS_BANK, SHOP_BANK, MARCHE_BANK, ...PRODUCTION_BANKS];'),
], 'import { PRODUCTION_BANKS } from "./banks-production";')

edit("src/lib/firebase/progressSync.ts", [
 ('        .pop() ?? null,\n    itemSrs,',
  '        .pop() ?? null,\n    timeZone: local.timeZone ?? remote.timeZone,\n    itemSrs,'),
])

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-"*50)
for x in ok: print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-"*50)
print("  changed " + str(len(ok)) + " - skipped " + str(len(skip)) + " - failed " + str(len(fail)) + "\n")
