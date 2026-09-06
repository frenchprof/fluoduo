#!/usr/bin/env python3
"""
No sign-in wall in front of a guess.

Was "Class bag product + soft-auth". Dan dissolved Class bag on 5 Sep ("we
dowan that anymore"), and its half of this file went with it: the locked bag
copy, the soft-auth prompt's wording, the BringToClass export pin and the
Recap mount. docs/CLASS_BAG.md keeps that copy as a record.

What remains is the half that was never about the bag, and is the reason this
file exists at all: a learner must be able to reach and answer a diagnostic
without signing in. Four routes must not wrap AuthGate, and the wall itself
must stay env-driven rather than hand-edited — the same fault verify38 guards
from the other side.
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""
def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

BAG = "src/app/SioDetail.tsx"
SOFT = "src/components/SoftAuthModal.tsx"
SPECU = "src/app/practice/speculearn/[collectionId]/page.tsx"
PRE = "src/app/pretests/[id]/page.tsx"
U0 = "src/app/pretests/unit0/[sioId]/page.tsx"
PIC = "src/app/pretests/picture/[collectionId]/page.tsx"
RECAP = "src/app/pretests/[id]/PretestContent.tsx"
AUTH = "src/lib/authConfig.ts"

for p in (BAG, SOFT, SPECU, PRE, U0, PIC, RECAP, AUTH):
    check(os.path.isfile(p), f"{p} present", f"MISSING {p}")
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL)); sys.exit(1)

bag, soft = read(BAG), read(SOFT)
specu, pre, u0, pic = read(SPECU), read(PRE), read(U0), read(PIC)
recap = read(RECAP)
auth = read(AUTH)

# Class bag is gone, and so is anything that would resurrect it by pin.
# code(), not the raw file: SioDetail's header comment explains the removal by
# name, and a check that a comment can trip is a check nobody trusts.
check("BringToClass" not in code(bag),
      "Class bag stays dissolved — no BringToClass to mount",
      "BringToClass is back in SioDetail; Dan dissolved it on 5 Sep")

# No AuthGate on diagnostic / SpecuLearn routes
for name, src in (("SpecuLearn page", specu), ("pretest [id] page", pre),
                  ("Unit-0 pretest page", u0), ("picture pretest page", pic)):
    check("AuthGate" not in code(src),
          f"{name} has no AuthGate (soft-auth at save)",
          f"{name} still wraps AuthGate mid-guess")

# authConfig untouched — wall still env-driven
check('process.env.NEXT_PUBLIC_OPEN_APP !== "1"' in auth,
      "REQUIRE_SIGN_IN still env-driven (no hand-edit)",
      "authConfig hand-edited away from OPEN_APP switch")
check("REQUIRE_SIGN_IN = true" not in code(auth),
      "no hard-coded REQUIRE_SIGN_IN = true",
      "REQUIRE_SIGN_IN hard-coded true")

# A learner can always decline the guess and move on.
check("Skip pretest" in recap or "Skip pretest" in read("src/app/pretests/unit0/[sioId]/Content.tsx"),
      "Skip pretest is still offered",
      "no Skip pretest control — a learner cannot decline a diagnostic")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
