#!/usr/bin/env python3
"""
The site bar outranks page content, so the ☰ menu is tappable everywhere.

THE BUG THIS PINS (5 Sep 2026, found driving the export at 390x844). Opening
☰ on Home showed all eight rows and they LOOKED right in a screenshot. Three
of them — 👤 User, ▦ MENU, 🗺️ Map — did nothing when tapped. On /practice and
/games the same eight rows all worked.

WHY. SiteTopBar's wrapper is `sticky top-0 z-10`, and `position: sticky` with
a z-index makes an element its own STACKING CONTEXT. Everything inside it —
including the dropdown's `z-50` — is sealed in; against the rest of the page
the bar competes with the one number on that wrapper. Home's map postcard
covers its whole card with a stretched link:

    <a class="absolute inset-0 z-10">        <- invisible, covers the card

Equal z-index, later in the DOM, so the link won. It has no pixels, so the
menu still painted above it and a screenshot showed nothing wrong; it simply
took the taps. Anything that reaches the bar's number does this again, which
is why the check is an INEQUALITY and not a spelling test:

    max z-index anywhere under src/app  <  the site bar's z-index

WHAT WOULD BREAK IT. Lowering the bar back toward page content, or giving a
page card a z-index that catches up with the bar. Either is the same bug.

The ceiling is one-sided on purpose: scrims and modals (z-40 and up) are meant
to cover the bar, and they live in src/components, not in a page.

Run from the repo root:  python3 verify/verify94-topbar-above-page.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BAR = os.path.join(ROOT, "src", "components", "SiteTopBar.tsx")
APP = os.path.join(ROOT, "src", "app")

# `z-30` and `z-[30]` are the same thing to Tailwind; read both.
Z = re.compile(r"\bz-\[?(\d+)\]?")

fails = []


def z_values(text):
    return [int(m) for m in Z.findall(text)]


# --- 1. the bar's own number -------------------------------------------------
src = open(BAR, encoding="utf-8").read()
m = re.search(r'className="sticky top-0 z-\[?(\d+)\]?', src)
if not m:
    fails.append(
        "SiteTopBar.tsx: no `sticky top-0 z-N` wrapper found. The site bar must "
        "carry an explicit z-index — without one it cannot outrank page content."
    )
    bar_z = None
else:
    bar_z = int(m.group(1))

# --- 2. nothing in a page may reach it ---------------------------------------
if bar_z is not None:
    worst = []
    for dirpath, _dirs, files in os.walk(APP):
        for fn in files:
            if not fn.endswith((".tsx", ".ts")):
                continue
            path = os.path.join(dirpath, fn)
            for n, line in enumerate(open(path, encoding="utf-8"), 1):
                # `fixed` overlays — modals, scrims, full-screen sheets — are
                # SUPPOSED to cover the bar. They are viewport-anchored and a
                # learner cannot reach the bar underneath one anyway. The rule
                # is about content that sits IN the page beside the bar.
                if "fixed " in line or "fixed\"" in line:
                    continue
                for z in z_values(line):
                    if z >= bar_z:
                        worst.append((os.path.relpath(path, ROOT), n, z, line.strip()[:90]))
    if worst:
        fails.append(
            f"page content reaches the site bar's z-{bar_z}, so it can swallow taps "
            f"meant for the ☰ menu:\n"
            + "\n".join(f"    {p}:{n}  z-{z}  {t}" for p, n, z, t in worst[:8])
        )

    # --- 3. and the bar must clear the stretched links that caused this -------
    # A whole-card link is the dangerous shape: invisible, and as big as the card.
    if bar_z <= 10:
        fails.append(
            f"the site bar sits at z-{bar_z}. Stretched card links use `absolute "
            f"inset-0 z-10`; at this height the bar ties with them and the later "
            f"element in the DOM eats the ☰ menu's taps. This is the 5 Sep bug."
        )

if fails:
    print("verify94-topbar-above-page: FAIL")
    for f in fails:
        print("  - " + f)
    sys.exit(1)

print(f"verify94-topbar-above-page: site bar at z-{bar_z}; nothing under src/app reaches it.")
