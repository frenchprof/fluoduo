#!/usr/bin/env python3

"""
Three type families ship, and no fourth sneaks in.

Dan, 7 Sep 2026: *"i can still see a lot of Geist and Work Sans -- it should
only be FluOLinGo, Roboto (and Patrick in reserve)"*.

WHAT WAS ACTUALLY THERE. Every visible text run on eight routes was measured
before anything was touched, by asking the browser which family it had
resolved for each one:

     1180  Work Sans        the whole app, effectively
      139  Geist Mono       every small caps label
       24  FluOLinGo Hand   the bands and the wordmark
        4  Iowan Old Style  a system serif nobody had chosen
        1  Patrick Hand
        0  Roboto           loaded on every page, rendering nowhere

Roboto was the one face he asked for and the one face that never appeared.
And Iowan Old Style was never SHIPPED at all: `--fluo-serif` named a stack of
system fonts, so « Choose your level » was Iowan on a Mac, Palatino on some
Windows machines and Georgia elsewhere — a different typeface per device.

WHAT THIS CHECKS, and why each rule is here rather than in a comment:

1 · The layout loads exactly three families. A fourth `next/font` import is
    how the last two got in, one at a time, each for a good local reason.
2 · No role resolves to a face the app does not load. `--fluo-serif` pointing
    at "Iowan Old Style" passed every check in the repo for weeks because
    nothing was looking at the VALUE of a font stack.
3 · Roboto is what a page reads in. `--font-body-stack` is what `body` and
    every `.cahier-body` resolve through, so if it stops naming the readable
    face the app has quietly changed its mind about its body text.

Patrick Hand is IN RESERVE, which is a real state and not a synonym for
unused: it is loaded, it is `--font-hand`, and `.cahier-hand` opts in. One
text run used it when this was written. That is fine, and it is why rule 1
counts three imports rather than checking that each is heavily used.

Numbered 118: 112 was claimed on main by verify112-vs-last-week while this
branch held it.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
layout = (ROOT / "src" / "app" / "layout.tsx").read_text(encoding="utf-8")
css = (ROOT / "src" / "app" / "globals.css").read_text(encoding="utf-8")
fails = []

# ── 1 · three families, named ───────────────────────────────────────────────
google = re.search(r'import \{([^}]*)\} from "next/font/google"', layout)
if not google:
    fails.append("layout.tsx no longer imports any Google font — the type system is gone.")
else:
    loaded = {n.strip() for n in google.group(1).split(",") if n.strip()}
    if loaded != {"Patrick_Hand", "Roboto"}:
        fails.append(
            "layout.tsx loads Google fonts other than Roboto and Patrick Hand:\n"
            f"    {sorted(loaded)}\n"
            "    Dan, 7 Sep: \"it should only be FluOLinGo, Roboto (and Patrick in\n"
            "    reserve)\". Geist, Geist Mono and Work Sans were each added for a\n"
            "    good local reason and together they became the app's whole voice."
        )
if "FluOlinGoHand-Regular.woff2" not in layout:
    fails.append("the house hand is no longer loaded — FluOLinGo Hand is the brand's own face.")

# ── 2 · no role points at a face the app does not load ──────────────────────
# Anything quoted inside a font stack is a NAMED face. Ours are loaded through
# CSS variables, so a quoted name here is either a generic fallback (allowed —
# it only renders if a variable is empty) or a font we never ship.
ALLOWED_FALLBACKS = {
    # Generic last resorts. They are reached only if a variable is unset, and
    # naming them is what stops a missing variable becoming Times New Roman.
    "Roboto", "Helvetica Neue", "Arial", "Segoe UI", "Bradley Hand", "Segoe Print",
    "SFMono-Regular", "Menlo", "Courier New",
}
BANNED = {"Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia",
          "Times New Roman", "Work Sans", "Geist", "Geist Mono"}
for m in re.finditer(r"--(?:fluo|font)-[\w-]+:\s*([^;]+);", css):
    for name in re.findall(r'"([^"]+)"', m.group(1)):
        if name in BANNED:
            fails.append(
                f'a font stack still names "{name}", which this app does not load.\n'
                f"    {m.group(0).strip()[:110]}\n"
                "    A stack of system fonts is not a typeface choice — it is a\n"
                "    different typeface on every device."
            )
        elif name not in ALLOWED_FALLBACKS:
            fails.append(f'a font stack names an unknown face "{name}": {m.group(0).strip()[:110]}')

# A GENERIC KEYWORD IS A FOURTH FACE TOO. `ui-monospace` and friends resolve to
# whatever the device has, which is exactly the fault `--fluo-serif` had — the
# check missed it at first because it only read QUOTED names, and the merge with
# main on 7 Sep put one back. A generic is fine as the LAST resort in a stack
# (it renders only if a real face is missing); it is not fine as the first.
for m in re.finditer(r"--(?:fluo|font)-[\w-]+:\s*([^;]+);", css):
    first = m.group(1).split(",")[0].strip()
    if first in {"ui-monospace", "ui-sans-serif", "ui-serif", "system-ui", "serif", "sans-serif", "monospace", "cursive"}:
        fails.append(
            f"a font role opens on the generic `{first}`, so it renders in whatever\n"
            f"    the device happens to have — a fourth face, and a different one per\n"
            f"    phone: {m.group(0).strip()[:100]}"
        )

# ── 3 · the app reads in Roboto ─────────────────────────────────────────────
body = re.search(r"--font-body-stack:\s*([^;]+);", css)
if not body:
    fails.append("--font-body-stack is gone — nothing says what the app reads in.")
elif "var(--font-readable)" not in body.group(1):
    fails.append(
        "--font-body-stack no longer opens with var(--font-readable).\n"
        "    That variable IS Roboto, and Roboto is the face Dan asked the app to\n"
        "    read in. It was loaded on every page for two months and rendered on\n"
        "    none of them before 7 Sep."
    )

if fails:
    print("verify118 — three type families:\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print("verify118 ok — FluOLinGo Hand, Roboto, Patrick Hand in reserve; no unshipped face named.")
