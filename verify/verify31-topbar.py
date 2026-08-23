#!/usr/bin/env python3
"""
The top icon row must never leave the screen.

Dan, 2026-08-21: "the top most row of icons still exist. and must not go
hiding into the overspill off the screen."

Measured before this pin, on a stock phone viewport:

    320px   4 of 6 icons reachable — the ☰ menu and the account button
            sat 67px past the right edge, with no way to scroll to them
    360px   5 of 6 — the ☰ was 28px off
    390px   6 of 6, with 0.8px to spare

390 passing by less than a pixel is the real finding: ANY addition — a live
score on /reviser, the daily-goal chip, a streak flame — pushed navigation off
the screen. /reviser already did, at 320.

The fix has three parts and this file pins all three, because each one alone
regresses silently:

  1. `topRight` is page-supplied and variable-width, so it lives OUTSIDE the
     icon strip in .cahier-topslot, where it truncates.
  2. The wordmark yields second — min-w-0 + truncate. It is a door home that
     the ← already signals, so "Flu…" still works.
  3. The strip itself is shrink-0 (never squeezed by the wordmark) AND
     max-w-full + flex-wrap (so content that genuinely does not fit makes the
     row TALLER rather than pushing an icon off the edge). A second line is a
     visible compromise; an unreachable ☰ is a broken one.

This is a structural pin. To re-measure the real layout:
    npx next dev -p 3111 &
    node verify/topbar-measure.mjs

Run from the repo root:  python3 verify/verify31-topbar.py
"""
import os, re, sys

PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

shell = open("src/components/CahierShell.tsx", encoding="utf-8").read()
css = open("src/app/globals.css", encoding="utf-8").read()
nocom_shell = re.sub(r"\{/\*[\s\S]*?\*/\}", "", shell)
nocom_css = re.sub(r"/\*[\s\S]*?\*/", "", css)

m = re.search(r'className="(cahier-topbar[^"]*)"', nocom_shell)
strip = m.group(1) if m else ""
ok(bool(m), "the icon strip is still there", "no .cahier-topbar found in CahierShell")

# ── 1 · the strip is never squeezed, and never overflows ───────────────────
ok("shrink-0" in strip,
   "the icon strip is shrink-0 — the wordmark cannot squeeze it",
   "the icon strip lost shrink-0: the wordmark will squeeze it into wrapping")
ok("max-w-full" in strip,
   "the icon strip is capped at the row width, so overflow becomes a wrap",
   "the icon strip lost max-w-full — content past the edge will simply overflow")
ok("flex-wrap" in strip,
   "the icon strip wraps rather than overflowing",
   "the icon strip lost flex-wrap: an extra icon would go off the screen")
ok("sm:flex-nowrap" in strip,
   "the strip stays one line from sm up, where there is always room",
   "the strip no longer pins to one line at sm+")
ok(re.search(r"\.cahier-topbar\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0", nocom_css) is not None,
   "strip children never shrink — they wrap intact instead of squashing",
   "strip children may shrink: icons will squash before the row wraps")

# ── 2 · page-supplied content is outside the strip ─────────────────────────
strip_start = nocom_shell.find('className="cahier-topbar')
strip_body = nocom_shell[strip_start:strip_start + 3000] if strip_start >= 0 else ""
ok("{topRight}" not in strip_body[:strip_body.find("cahier-menu")] if "cahier-menu" in strip_body else True,
   "topRight is not inside the icon strip",
   "topRight is back inside the icon strip — a long score will push ☰ off the screen")
ok("cahier-topslot" in nocom_shell,
   "topRight has its own shrinkable slot (.cahier-topslot)",
   "the .cahier-topslot yield slot is gone — page content has nowhere safe to go")
slot = re.search(r'className="(cahier-topslot[^"]*)"', nocom_shell)
ok(slot is not None and "truncate" in slot.group(1) and "min-w-0" in slot.group(1),
   "the topRight slot truncates before anything else yields",
   "the topRight slot no longer truncates — it will push the icons")

# ── 3 · the wordmark yields before the icons ──────────────────────────────
mark = re.search(r'className="(cahier-display[^"]*)"', nocom_shell)
mk = mark.group(1) if mark else ""
ok("min-w-0" in mk and "truncate" in mk,
   "the wordmark truncates rather than pushing the icons off",
   "the wordmark no longer truncates: at 320px it alone costs 112px and the ☰ goes off-screen")

# ── 4 · the small-screen width budget is still bought ─────────────────────
mq = re.search(r"@media\s*\(max-width:\s*639px\)\s*\{([\s\S]*?)\n\}", nocom_css)
body = mq.group(1) if mq else ""
pad = re.search(r"\.cahier-topbar \.cahier-btn\s*\{[^}]*padding-left:\s*([\d.]+)rem", body)
ok(pad is not None and float(pad.group(1)) <= 0.32,
   f"below sm the icon buttons stay tight ({pad.group(1) if pad else '?'}rem)",
   "the below-sm button padding grew — that budget is what fits six icons on a 320px phone")
gap = re.search(r"\.cahier-topbar\s*\{[^}]*gap:\s*([\d.]+)rem", body)
ok(gap is not None and float(gap.group(1)) <= 0.125,
   f"below sm the strip gap stays tight ({gap.group(1) if gap else '?'}rem)",
   "the below-sm strip gap grew — 6 icons no longer fit a 320px phone")

# ── 5 · nobody has quietly hidden an icon to make room ────────────────────
hidden = re.findall(r"cahier-btn cahier-btn-sm[^\"]*!hidden(?! sm:)", nocom_shell)
ok(len(re.findall(r"!hidden", nocom_shell)) <= 1,
   "no icon has been hidden below sm beyond the one deliberate 🏠",
   "an icon is being hidden on small screens — hiding is what this pin forbids")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
