import os, shutil, sys
DRY = "--dry-run" in sys.argv
ROOT = os.getcwd(); BUNDLE = os.path.join(ROOT, "patch")
ok, skip, fail = [], [], []

def die(m): print("\n  ERROR: " + m + "\n"); sys.exit(1)
if not os.path.isdir(os.path.join(ROOT,"src")) or not os.path.isfile(os.path.join(ROOT,"package.json")):
    die("run this from the repo root (~/fluoduo)")
if not os.path.isdir(BUNDLE): die("patch/ not found")

def copy(rel):
    src, dst = os.path.join(BUNDLE, rel), os.path.join(ROOT, rel)
    if not os.path.isfile(src): fail.append("missing in bundle: " + rel); return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY: shutil.copy2(src, dst)
    ok.append("file  " + rel)

def edit(rel, subs, add_import=None):
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p): fail.append("not found: " + rel); return
    txt = orig = open(p, encoding="utf-8").read(); applied = 0
    for old, new in subs:
        if old in txt: txt = txt.replace(old, new); applied += 1
        elif new in txt: applied += 1
        else: fail.append(rel + ": could not find -> " + old[:70]); return
    if add_import and add_import not in txt:
        lines = txt.split("\n")
        last = max([i for i,l in enumerate(lines) if l.startswith("import ")] or [0])
        lines.insert(last+1, add_import); txt = "\n".join(lines)
    if txt != orig:
        if not DRY: open(p,"w",encoding="utf-8").write(txt)
        ok.append("edit  " + rel + "  (" + str(applied) + " subs)")
    else: skip.append("edit  " + rel + "  (already applied)")

print("\n" + ("DRY RUN" if DRY else "APPLYING") + "\n" + "-"*60)
for f in ["src/lib/dayKey.ts","src/lib/collections/gapSentence.ts",
          "src/lib/collections/gramMarathonReady.ts","src/content/collections/partitifs.json",
          "src/content/collections/modaux-plans.json","src/content/collections/modaux-avis.json",
          "src/content/sios/sios.json","src/games/compose/banks-production.tsx"]: copy(f)

edit("src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx", [
 ("deck.items.map((it, idx) => (it.gap && it.fr.includes(it.gap) ? idx : -1))",
  "deck.items.map((it, idx) => (isPlayableGap(it) ? idx : -1))"),
 ("deck!.items.map((it, idx) => (it.gap && it.fr.includes(it.gap) ? idx : -1))",
  "deck!.items.map((it, idx) => (isPlayableGap(it) ? idx : -1))"),
 ("splitGap(item.fr, gap)", "splitGap(gapSentence(item), gap)"),
], 'import { gapSentence, isPlayableGap } from "@/lib/collections/gapSentence";')

edit("src/games/dice/DicedPractice.tsx", [
 ("const sentenceOf = (it: Item) => it.example ?? it.fr;",
  "// sentenceOf moved to @/lib/collections/gapSentence (2026-08-08)"),
 ("sentenceOf(item)", "gapSentence(item)"),
], 'import { gapSentence } from "@/lib/collections/gapSentence";')

edit("src/components/CahierShell.tsx", [
 ("curatedDeck?.items?.some((it) => it.gap && it.fr?.includes(it.gap))",
  "curatedDeck?.items?.some(isPlayableGap)"),
], 'import { isPlayableGap } from "@/lib/collections/gapSentence";')

edit("src/app/activities/page.tsx", [
 ("c.items?.some((it) => it.gap && it.fr?.includes(it.gap))",
  "c.items?.some(isPlayableGap)"),
], 'import { isPlayableGap } from "@/lib/collections/gapSentence";')

edit("src/lib/progress.ts", [
 ('function todayStr(): string {\n  return new Date().toISOString().slice(0, 10);\n}',
  '// todayStr() replaced by dayKey() - learner-local zone, 04:00 rollover.'),
 ("const today = todayStr();", "const today = dayKey();"),
 ('const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);\n  const streak = p.lastActiveDay === yesterday ? p.streak + 1 : 1;\n  return { ...p, streak, lastActiveDay: today };',
  'const streak = p.lastActiveDay === previousDay(today) ? p.streak + 1 : 1;\n  return { ...p, streak, lastActiveDay: today, timeZone: learnerZone() };'),
 ('  streak: number;\n  lastActiveDay: string | null; // "YYYY-MM-DD"',
  '  streak: number;\n  lastActiveDay: string | null; // "YYYY-MM-DD", learner-local, 04:00 rollover\n  timeZone?: string; // IANA zone lastActiveDay was computed in'),
], 'import { dayKey, previousDay, learnerZone } from "@/lib/dayKey";')

print()
for x in ok: print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("\n" + "-"*60)
print("  applied " + str(len(ok)) + " - skipped " + str(len(skip)) + " - failed " + str(len(fail)))
print("""
  STILL MANUAL:
   1. src/content/collections/index.ts
        remove les-de + modaux imports and their CURATED entries
        add    modaux-plans + modaux-avis imports and CURATED entries
   2. src/games/compose/banks.tsx
        import { PRODUCTION_BANKS } from "./banks-production";
        spread PRODUCTION_BANKS into the BANKS array
   3. git rm src/content/collections/les-de.json src/content/collections/modaux.json
   4. src/lib/firebase/progressSync.ts - in mergeProgress() add:
        timeZone: local.timeZone ?? remote.timeZone,

  THEN: npx tsc --noEmit && npm run build && npm run lint
""")
