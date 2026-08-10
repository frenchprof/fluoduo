#!/usr/bin/env python3
"""
Patch 14 — remove the LAF1201 suite banner. Everywhere. For good.

  cd ~/fluoduo && python3 patch14/apply14.py

The dark navy `LAF1201 · French I  …  MENU ▾` band was mounted in
`src/app/layout.tsx`, which means it rendered on EVERY page of the app —
including inside every game, where Dan has repeatedly said it must not be.

It survived the 2026-08-09 removal because that patch took out a different,
blue LAF1201 banner. This is `SuiteBanner`, added 2026-07-14 to make the course
sites read as one family, and no longer wanted.

This removes the mount, the import, and the component file. The file is
recoverable from git history if the suite banner is ever wanted again.

Idempotent.
"""
import os, re, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
ok, skip, fail = [], [], []

if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)

p = os.path.join(ROOT, "src/app/layout.tsx")
if not os.path.isfile(p):
    fail.append("not found: src/app/layout.tsx")
else:
    t = orig = open(p, encoding="utf-8").read()
    t = re.sub(r'^import SuiteBanner from "@/components/SuiteBanner";\n', "", t, flags=re.M)
    t = re.sub(r'^\s*<SuiteBanner />\n', "", t, flags=re.M)
    if t != orig:
        if not DRY:
            open(p, "w", encoding="utf-8").write(t)
        ok.append("edit  src/app/layout.tsx (banner unmounted)")
    else:
        skip.append("edit  src/app/layout.tsx (already removed)")

f = os.path.join(ROOT, "src/components/SuiteBanner.tsx")
if os.path.isfile(f):
    if not DRY:
        os.remove(f)
    ok.append("del   src/components/SuiteBanner.tsx")
else:
    skip.append("del   src/components/SuiteBanner.tsx (already gone)")

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  STOP THE DEV SERVER, then:
    rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev

  The dark LAF1201 band should be gone from every page, games included.
""")
