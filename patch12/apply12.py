#!/usr/bin/env python3
"""
Patch 12 — one curriculum spine, and a journey position for everything.

  cd ~/fluoduo && python3 patch12/apply12.py --dry-run
  cd ~/fluoduo && python3 patch12/apply12.py

Requires patches 3 and 9. Three whole files, no anchored edits — nothing to
mis-match.

WHAT IT FIXES

1. 84 of 806 curated items had NO outcome (10%, clustered).
   `outcomeForItem` resolved deck items with `itemId.startsWith(deckId + "-")`,
   inside a function whose own header says "never by parsing the id". Four
   decks author ids that don't begin with their deck name:

       nationalities        nat-01-france        25/25 lost
       numbers-70-99        num-70               30/30 lost
       negation-pas         negpas-01            14/14 lost
       directions-matching  directions-full-01   15/40 lost

   It now indexes actual deck MEMBERSHIP. Verified: 0 unresolved, and no item
   id is claimed by two decks, so the mapping is unambiguous. This is why
   "Hardest items" mixed prefixed and unprefixed rows.

2. `directions-matching` was listed as RETIRED and is LIVE — SIO-036 points at
   it and learners use it. `describeDeck` consults the retirement list before
   the outcome lookup, so every response from it rendered "(retiré)" with no
   SIO. My error, from checking a note instead of sios.json.

3. The deck→outcome index existed TWICE (labels.ts and evidence.ts) and had
   already drifted — only one resolved the `-letris` suffix, so three decks
   answered differently depending on which module asked. Now one index, in
   src/lib/curriculum.ts, imported by both.

4. Seven routes printed raw because they were in siteTabs.ts and not in the
   label table: the three galleries (/practice/speculearn, /games/vocabularain,
   /games/lexicalater — only their trailing-slash forms were listed, which the
   gallery route itself never matches), plus /tts, /guide, /about and
   /hidden/vocabularain.

5. JOURNEY POSITION. Every label now carries where it sits on the path — unit,
   then the SIO's running number, which is the taught order. `/unit/3` sorts at
   the HEAD of unit 3; NumBus and NumBourse sit with the number outcomes;
   WorDrill with the alphabet; the galleries, ConjugaZone, DéjàRevu and the
   Finale get "Toutes unités"; the app's own pages get "Application". Retired
   decks keep the position they taught from, so July still sorts into July.

   `journeyKey(info)` is the sort key. Tables that use it read in the order a
   learner actually travels rather than alphabetically or by exercise name.

Built and verified here before shipping: tsc 0 errors, next build 738 pages,
item coverage re-measured against your real content.
"""
import os, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch12")
FILES = ["src/lib/curriculum.ts", "src/lib/labels.ts", "src/lib/evidence.ts"]

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)
for need in ("src/lib/labels.ts", "src/lib/evidence.ts"):
    if not os.path.isfile(os.path.join(ROOT, need)):
        print(f"\n  ERROR: {need} missing — apply patches 3 and 9 first\n"); sys.exit(1)

# Patch 9 introduced describeItem; without it labels.ts here would go backwards.
lbl = open(os.path.join(ROOT, "src/lib/labels.ts"), encoding="utf-8").read()
if "describeItem" not in lbl:
    print("\n  ERROR: patch 9 has not been applied (describeItem missing)\n"); sys.exit(1)

ok, fail = [], []
for rel in FILES:
    src, dst = os.path.join(B, rel), os.path.join(ROOT, rel)
    if not os.path.isfile(src):
        fail.append("missing in bundle: " + rel); continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    same = os.path.isfile(dst) and open(dst, encoding="utf-8").read() == open(src, encoding="utf-8").read()
    if not DRY and not same:
        shutil.copy2(src, dst)
    ok.append(("same  " if same else "file  ") + rel)

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  {len(ok)} file(s) · failed {len(fail)}")
print("""
  STOP THE DEV SERVER, then:
    rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev

  LOOK AT:
    /moi -> My hardest items. Every row now carries an SIO — the numbers,
    nationalities and negation items never could before.
    /teacher -> a student -> Hardest items. Same.
    Anywhere showing "Directions (matching) (retiré)" now reads
    "SIO-036 . Quel est le chemin pour ... ?" — it was never retired.
""")
