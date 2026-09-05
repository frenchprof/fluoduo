#!/usr/bin/env python3
"""
Class bag product + soft-auth (FINISH_BACKLOG items 2+3).

Pins locked CLASS_BAG.md copy, no AuthGate mid-guess on SpecuLearn/pretest,
and soft-auth only at Continu/save. Does not touch verify38's OPEN_APP ban —
run verify38 separately; this file asserts the product strings and the
AuthGate removal on the diagnostic routes.
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

# Locked Class bag chrome
for s in ("Class bag", "You can:", "Show in class", "Copy list",
          "Nothing to check — you're ready.", "Continue"):
    check(s in bag, f"Class bag UI includes {s!r}", f"Class bag UI missing {s!r}")

# Soft-auth locked copy
for s in ("Sign in to keep this bag", "Continue with Google", "Keep going without saving"):
    check(s in soft, f"soft-auth includes {s!r}", f"soft-auth missing {s!r}")

# Export name stays BringToClass for verify40
check("export function BringToClass" in bag,
      "BringToClass export name kept (verify40 Recap pin)",
      "BringToClass renamed — verify40 will fail")

# Recap still mounts BringToClass with empty ready state
recap_fn = recap[recap.find("function Recap("):] if "function Recap(" in recap else ""
check("<BringToClass" in recap_fn,
      "U1–4 Recap still mounts BringToClass",
      "U1–4 Recap lost BringToClass")
check("showEmpty" in recap_fn,
      "U1–4 Recap asks for empty ready state",
      "U1–4 Recap does not pass showEmpty")

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

# Skip pretest path exists
check("Skip pretest" in recap or "Skip pretest" in read("src/app/pretests/unit0/[sioId]/Content.tsx"),
      "Skip pretest → Class bag path exists",
      "no Skip pretest control")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
