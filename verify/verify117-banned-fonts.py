#!/usr/bin/env python3
"""
The banned fonts. This fails if any of them comes back.

Dan, 2026-09-07, twice in one sitting:
  *"GEIST HAS BEEN BANNED, WHY IS IT BACK AS A FONT?"*
  *"we said Geist and Work sans are banned — they are banned everywhere"*

IT WAS NEVER BACK, WHICH IS WORSE — it was never removed. `Geist` and
`Geist_Mono` are what `create-next-app` scaffolds into layout.tsx, they were
in the commit that created that file, and no session since took them out. The
ban was never written into AGENTS.md or docs/STATUS.md and no check enforced
it, so every session that read the repo found Geist looking like a deliberate
choice.

AND IT WAS NOT MERELY DECLARED. Three lines made it the app's actual face:

    @theme inline { --font-sans: var(--font-geist-sans);   }  <- Tailwind's
                   { --font-mono: var(--font-geist-mono);  }     default face
    --fluo-mono: var(--font-geist-mono), ui-monospace, ...    <- every label

Tailwind v4 resolves the `font-sans` / `font-mono` utilities AND its preflight
rule on <html> out of `@theme`, so Geist Sans was what anything not explicitly
overridden inherited. `--fluo-mono` led with Geist Mono, so it was what
rendered "GOAL", "PICK ONE OF THE FIFTY", the map's vocabulary/grammar legend,
the 2D/3D switch and the chevrons.

MEASURED BEFORE THE REMOVAL, by driving the built app and reading
`getComputedStyle().fontFamily` on every element: Geist rendered on 13 of the
14 pages checked — 28 elements on /profil and /moi, 18 on /map, 9 on
SpecuLearn. Not a dormant import.

AND WORK SANS WAS BIGGER STILL. It was the cahier system's FUNCTIONAL face —
body, controls, navigation, dense headings — and measured 176 of the 194 text
elements on SpecuLearn, i.e. essentially the whole app.

THE TRAP THAT MAKES THIS CHECK A LIST RATHER THAN A NAME: removing Geist,
this session pointed Tailwind's `--font-sans` at `var(--font-body)` — which
was Work Sans. One banned face was swapped straight for the other, and a
check hard-coded to the word "Geist" would have passed. BANNED is a set; add
to it below and everything here covers the new name.

Roboto carries --font-body and --font-display now. It is the one replacement
that was already Dan's call: he asked for it by name on 2026-07-01 for
anything that has to be legible fast.

WHAT THIS CHECKS. Every banned name, in the three places a font can enter —
an import, a theme variable, a stack — plus a sweep of every source file.
Blocking one door leaves the other two.
"""

import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src, css=False):
    """This file's own explanation names Geist a dozen times, and so does the
    note left where it was removed. A raw scan would read the documentation of
    the removal as the fault it documents — the same trap verify82 hit."""
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    if not css:
        src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
        src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

# THE LIST. Adding a name here is the whole job of banning a font.
BANNED = ["Geist", "Work Sans", "Work_Sans"]


def banned_in(text):
    """Which banned names appear, allowing Work_Sans / \"Work Sans\" spellings."""
    return [b for b in BANNED if re.search(re.escape(b).replace(r"\ ", r"[\s_]"), text, re.I)]


LAYOUT = strip_comments(read("src/app/layout.tsx"))
CSS = strip_comments(read("src/app/globals.css"), css=True)

ok(bool(LAYOUT) and bool(CSS), "layout.tsx and globals.css are readable",
   "layout.tsx or globals.css is missing")

# ---- 1 · not loaded ------------------------------------------------------
hit = banned_in(LAYOUT)
ok(not hit,
   f"layout.tsx loads none of the {len(BANNED)} banned faces",
   f"layout.tsx imports or instantiates {hit}. Banned by Dan, 7 Sep. Geist "
   "arrives back for free every time anyone copies create-next-app's layout, "
   "which is how it survived this long; Work Sans was the app's functional "
   "face and 176 of 194 elements on SpecuLearn.")

# ---- 2 · not the app's default face --------------------------------------
# Tailwind v4 reads --font-sans / --font-mono out of @theme and applies
# --font-sans to <html> in preflight, so these two lines decide what the whole
# app inherits.
theme = re.search(r"@theme inline\s*\{([\s\S]*?)\n\}", CSS)
ok(theme is not None,
   "the @theme block is readable — it is what sets the app's default face",
   "cannot find `@theme inline` in globals.css; the checks below read it")
if theme:
    hit = banned_in(theme.group(1))
    ok(not hit,
       "Tailwind's --font-sans and --font-mono point at no banned face",
       f"@theme points --font-sans or --font-mono at {hit}. That is not a "
       "declaration, it is the DEFAULT: Tailwind v4 resolves every font-sans / "
       "font-mono utility and its preflight rule on <html> from here. Note it "
       "can happen INDIRECTLY — pointing --font-sans at var(--font-body) is "
       "how Work Sans became the default the day Geist was removed.")

# ---- 3 · not in a stack ---------------------------------------------------
stacks = re.findall(r"(--[\w-]*(?:font|mono|serif|hand)[\w-]*)\s*:\s*([^;]+);", CSS)
bad = [f"{n}: {v.strip()[:60]}" for n, v in stacks if banned_in(v)]
ok(not bad,
   f"none of the {len(stacks)} font stacks names a banned face",
   "these font stacks lead with or contain a banned face: " + "; ".join(bad) +
   ". A stack is the quietest way back in — --fluo-mono led with Geist Mono "
   "and that is what actually rendered every label in the app.")

# ---- 4 · nowhere else in the source --------------------------------------
hits = []
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if d not in {"node_modules", ".next"}]
    for fn in files:
        if not fn.endswith((".ts", ".tsx", ".css")):
            continue
        path = os.path.join(root, fn).replace(os.sep, "/")
        body = strip_comments(read(path), css=fn.endswith(".css"))
        if banned_in(body):
            hits.append(f"{path} ({', '.join(banned_in(body))})")
ok(not hits,
   f"no file under src/ names any of the {len(BANNED)} banned faces outside a comment",
   "a banned face is named in: " + ", ".join(sorted(set(hits))[:6]) +
   ". Banned by Dan, 7 Sep. If a new face is genuinely wanted it is Dan's "
   "call, and it goes through layout.tsx and the cahier type system.")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
