#!/usr/bin/env python3
"""
The sign-in wall stays up in production.

REQUIRE_SIGN_IN became a build-time switch on 2026-08-27 so an agent can build
a throwaway open copy and actually SEE a gated surface — 19 of the bugs Dan
reported that day were ones no code-reading test could have caught.

The switch is only safe while it is impossible to set by accident. A password
would have been unsafe by construction (static export: every student downloads
the bundle), which is why it is compile-time. This file holds the two things
that keep it that way.

Run from the repo root:  python3 verify/verify38-authwall.py
"""
import os, re, sys, glob

PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read()
def code(p):
    """Source with comments stripped — a check that greps prose finds its own
    explanation and fails (verify19b learned this the same way)."""
    s = re.sub(r"/\*[\s\S]*?\*/", "", read(p))
    return re.sub(r"//[^\n]*", "", s)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

FLAG = "NEXT_PUBLIC_OPEN_APP"
cfg = code("src/lib/authConfig.ts")

# 1 · the wall defaults CLOSED: only an explicit "1" opens it, and the default
#     when the variable is absent must be true.
ok(f'process.env.{FLAG} !== "1"' in cfg,
   "the wall is open ONLY when the flag is exactly \"1\" — absent means closed",
   "the wall's default is not closed; an unset or malformed flag could open it")
ok("REQUIRE_SIGN_IN = true" not in cfg,
   "there is one definition of the wall, not a stale hard-coded one beside it",
   "a hard-coded REQUIRE_SIGN_IN survives next to the switch")

# 2 · and the flag is nowhere a deploy could pick it up. This is the check
#     that makes the switch safe: it can only ever be typed by hand, locally.
tracked = []
for pat in ("*.json", "*.yml", "*.yaml", "*.toml", ".env*", "*.sh"):
    tracked += glob.glob(pat) + glob.glob(f".github/**/{pat}", recursive=True) \
             + glob.glob(f"scripts/**/{pat}", recursive=True)
hits = [f for f in sorted(set(tracked))
        if os.path.isfile(f) and FLAG in read(f)]
ok(not hits,
   f"{FLAG} appears in no committed config — nothing a deploy reads can set it",
   f"{FLAG} IS COMMITTED in {hits} — a deploy could take the wall down for everyone")

# 3 · no other route around the wall crept in beside it.
gate = code("src/components/AuthGate.tsx")
ok("REQUIRE_SIGN_IN" in gate,
   "AuthGate still consults the wall",
   "AuthGate no longer reads REQUIRE_SIGN_IN")
for word in ("password", "secretCode", "bypassToken", "magicLink"):
    ok(word not in cfg and word not in gate,
       f"no {word} bypass — a shared secret in a static export is not a secret",
       f"a {word} bypass exists; it ships to every student's browser")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
