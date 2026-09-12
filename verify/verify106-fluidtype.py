#!/usr/bin/env python3
"""
Type is relative, everywhere — no font size is nailed to a pixel.

Dan, 5 Sep 2026: "the relative font size thingy should apply FluOLinGo wide,
not just here."

Every size in the app is now `calc(Xrem + var(--fs-step) * M)`. On a phone the
step is zero, so nothing moved; on a desktop it opens to 0.36rem and the whole
ramp grows together. The rem base also means a learner who raises their
browser's text size raises the app with it, which a pixel cannot do.

The app writes about 360 sizes as Tailwind arbitrary utilities — `text-[15px]`
on 93 elements alone, and a further 45 written in `rem` rather than px. Editing those in place would have touched some fifty
files; instead globals.css redefines each distinct size once, which works
because globals.css is imported after Tailwind and the nested rule under
:root outranks the flat utility.

That trick has one failure mode, and it is silent: a NEW arbitrary size added
later has no rule, so it stays a hard pixel and nobody notices. That is what
this check is for. It also holds the three ways a size can be written outside
Tailwind — a `font-size: NNpx` in globals.css, a `fontSize: "NNpx"` in a
component, or a CSS block a component writes itself.

The third was added on 2026-09-11, when Dan said it again — *"for font sizes,
don't use absolute hard coded font sizes, we want adaptive ones to the screen
size"*. The app already obeyed him everywhere this check could see; what it
could not see is a stylesheet living inside a .tsx file, because it only ever
read globals.css for the CSS form. Four such rules existed, all of them in
ChaTutor's print sheet, all of them correct (see PAPER below). Nothing was
wrong — but a rule Dan has to repeat is a rule the next `<style>` block would
have broken in silence, which is the same failure mode one level out.

The escaping trap, met on the day this was written: a decimal size is escaped
`.text-\[12\.5px\]` in Tailwind's own output. Writing `.text-\[12.5px\]` is a
different selector, matches nothing, and the size silently stays fixed — the
first run of this rule shipped four such rules (9.5, 11.5, 12.5, 13.5) and the
measurement caught them, not the build. So the check compares against the
escaped form.

Excluded on purpose: sizes computed from a drawn object's own geometry, e.g.
HomeMap3D's `fontSize: Math.max(7, sz * 0.34)` — that label scales with the
map tile it sits on, which is the same idea by another route.

Numbered 106, not 102: claude/fluolingo-color-review-9thj8x claimed 102 for
verify102-menu-hues.py 42 minutes after this file took it, and 103-105 are
spoken for (104 is already on main). Renumbering my own claim costs nothing
and stops whichever of the two PRs merges second from failing verify-wiring
on a duplicate leading number.

Run from the repo root:  python3 verify/verify106-fluidtype.py
"""
import os, re, sys

CSS = "src/app/globals.css"
SRC = "src"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

css = open(CSS, encoding="utf-8").read()

# ── the step itself must be declared in :root, not in @theme inline ─────────
# @theme inline INLINES its values into the utilities rather than emitting the
# custom property, so a --fs-step declared there would resolve to nothing.
root_blocks = re.findall(r":root\s*\{(.*?)\n\}", css, re.S)
ok(any("--fs-step:" in b for b in root_blocks),
   "--fs-step is declared in :root, so every calc() can see it",
   "--fs-step is missing from :root — every calc() that reads it resolves to nothing")
ok("clamp(" in re.search(r"--fs-step:([^;]*);", css).group(1),
   "--fs-step is a clamp, so it is zero on a phone and capped on a desktop",
   "--fs-step is no longer a clamp — the ramp has no floor or ceiling")

# ── every arbitrary Tailwind size has a rule that redefines it ──────────────
used = set()
for dirpath, _dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith((".tsx", ".ts")):
            continue
        text = open(os.path.join(dirpath, f), encoding="utf-8").read()
        # px AND rem. `em` is deliberately absent: text-[1.3em] is a multiple
        # of a parent that is already on the ramp, so it scales by construction
        # and a rule here would apply the step a second time.
        used.update(re.findall(r"text-\[([0-9]+(?:\.[0-9]+)?(?:px|rem))\]", text))

def escaped(size):
    return r".text-\[" + size.replace(".", r"\.") + r"\]"

def num(size):
    return float(size.replace("rem", "").replace("px", ""))

missing = sorted((s for s in used if escaped(s) not in css), key=num)
ok(not missing,
   f"all {len(used)} arbitrary text sizes ride the ramp",
   "these arbitrary sizes are off the ramp — add a rule to the ramp block "
   "in globals.css: " + ", ".join(f"text-[{s}]" for s in missing))

# a rule that matches nothing is worse than no rule: it looks done
declared = set(re.findall(r"\.text-\\\[([0-9]+(?:\\\.[0-9]+)?(?:px|rem))\\\]", css))
declared = {d.replace("\\.", ".") for d in declared}
orphans = sorted(declared - used, key=num)
ok(not orphans,
   "no ramp rule points at a size the app has stopped using",
   "these ramp rules match nothing any more — delete them: "
   + ", ".join(f"text-[{s}]" for s in orphans))

# ── AND THE SIZE A PAGE ASKS FOR AT A BREAKPOINT ───────────────────────────
# The clause above reads BASE spellings only, and that is exactly the spelling
# the fault of 11 Sep was not written in. Every ramp rule is `:root .text-[X]`
# — a pseudo-class plus a class — so it outranks Tailwind's own `.sm\:text-[Y]`,
# which is a class alone. A page's own breakpoint override therefore lost to the
# ramp at every width, in silence:
#
#     welcome, phone sideways   asked 1.6rem   got 3.2rem ramped   <- covers the road
#     welcome, desktop          asked 4.4rem   got 3.2rem ramped
#     NumBus,  desktop          asked   38px   got   30px ramped
#
# The three px ones had been dead since the ramp was written on 5 Sep and
# nothing noticed, because a size that stops changing at a breakpoint looks
# like a size somebody chose. Only the welcome page had a check watching the
# geometry (verify151), and it is what finally named this.
#
# So every variant spelling needs its own rule too, and this is what fails a
# new one that has none.
VARIANT = re.compile(r"((?:[a-z0-9]+|\[@media\([^)]*\)\]):text-\[[0-9]+(?:\.[0-9]+)?(?:px|rem)\])")
variants = set()
for dirpath, _dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith((".tsx", ".ts")):
            continue
        text = open(os.path.join(dirpath, f), encoding="utf-8").read()
        variants.update(VARIANT.findall(text))

def tw_class(spelling):
    """The class name Tailwind emits for a spelling — it backslash-escapes
       every character CSS would otherwise read as syntax."""
    return "." + "".join(("\\" + c) if c in ".:()[]@" else c for c in spelling)

# AND THE SAME BOTH WAYS: a ramp rule for a BREAKPOINT spelling the app has
# stopped writing. The orphan clause above cannot see these — its regex needs a
# literal "." before "text-", and a variant class reads ".sm\:text-[…]". Five
# such rules went dead in one commit on 12 Sep when the welcome hero came off
# its breakpoints, and nothing would have said so.
#
# Read by SCANNING, not by a regex over escaped CSS. The first version of this
# clause was a regex and it silently matched nothing — its character class read
# `[^\]]` where the selector it had to cross is `4\.4rem`, full of backslashes.
# It passed the break-test, which is the only reason anyone found out. A
# selector this punctuated is cheaper to walk than to describe.
declared_var = set()
for line in css.splitlines():
    line = line.strip()
    if not line.startswith(".") or "\\:text-\\[" not in line:
        continue
    sel = line.split("{", 1)[0].strip()          # ".sm\:text-\[4\.4rem\]"
    declared_var.add(sel[1:].replace("\\", ""))  # "sm:text-[4.4rem]"
var_orphans = sorted(c for c in declared_var if c not in variants)
ok(not var_orphans,
   "no ramp rule points at a breakpoint size the app has stopped using",
   "these breakpoint ramp rules match nothing any more — delete them: "
   + ", ".join(var_orphans))

unramped = sorted(v for v in variants if tw_class(v) not in css)
ok(not unramped,
   f"all {len(variants)} breakpoint text sizes ride the ramp too",
   "these sizes are asked for at a breakpoint but the base ramp rule beats "
   "them, so the breakpoint does nothing — give each one a rule in its own "
   "media query in the ramp block: " + ", ".join(unramped))

# ── the welcome hero is sized by its SKY, and stays that way ──────────────
# It had an opt-out from the ramp for a day (`welcome-sky-type`), and the
# opt-out was the wrong shape: it froze three sizes so the hero could not grow
# at all. Dan then asked for it bigger — *"Yes expand is better"* — and the
# honest fix was neither the ramp nor a frozen size but a third thing, because
# what this hero must fit is not the WIDTH of the window, it is the depth of
# the SKY above a horizon drawn at a fixed fraction of the frame.
#
# So its three sizes are a min() of a vh term, a vw term and the ramp's own
# value as a ceiling, in globals.css, and they are not Tailwind utilities at
# all — which is why the clauses above no longer see them and why this one
# exists. What it holds is the vh term: drop that and the hero is back to being
# sized by width, which is exactly how a phone held sideways ended up with a
# 59.9px headline lying on the road.
#
# It strips comments first. The note explaining all this names every class it
# guards, and on its first run the previous version of this clause counted its
# own explanation as a second use — the third time in this repo a check has
# read its own documentation as the defect.
def bare(src):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", src))

hero = re.findall(r"\.fluo-welcome-(?:title|sub|course)\s*\{[^}]*\}", bare(css))
ok(len(hero) >= 3 and all("vh" in r for r in hero[:3]),
   "the welcome hero is sized from the sky it stands in, not from the window's width",
   "the welcome hero's sizes have lost their vh term — sized by width alone it "
   "outgrows the sky on any short screen, which is how a phone held sideways "
   "got a 59.9px headline lying across the road. See globals.css, "
   ".fluo-welcome-title")
ok("welcome-sky-type" not in css,
   "the frozen opt-out that replaced the ramp is gone",
   "welcome-sky-type is back — it pins the hero to three fixed sizes, which is "
   "what Dan reversed when he asked for it expanded")

# ── PAPER: the one place a pixel is the right answer ───────────────
# The ramp adapts type to the VIEWPORT. A printed page has no viewport: the
# ChaTutor transcript opens a fresh window, writes a stylesheet into it and
# calls window.print(), so what the learner gets is a sheet of paper. Sizing
# that off --fs-step would read the print window's own width, which is not a
# screen anybody looks at. Pixels there are correct, not debt.
#
# A LIST, not a hard-coded filename, for the reason verify119 keeps a list of
# banned fonts: the next exemption will not be this file, and the next session
# should be able to add it with its reason rather than rewrite the check.
PAPER = {
    "src/components/tools/ChaTutorPanel.tsx",  # savePdf(): a print sheet, not a screen
}

# ── no raw pixel font-size survives, in CSS or inline ───────────────────────
css_px = re.findall(r"font-size:\s*[0-9.]+px", css)
ok(not css_px,
   "globals.css declares no font-size in raw pixels",
   f"globals.css still has {len(css_px)} pixel font-size rule(s): " + ", ".join(css_px[:6]))

inline = []
sheets = []
for dirpath, _dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith((".tsx", ".ts")):
            continue
        p = os.path.join(dirpath, f)
        rel = p.replace(os.sep, "/")
        for i, line in enumerate(open(p, encoding="utf-8"), 1):
            if re.search(r'fontSize:\s*"[0-9.]+px"', line):
                inline.append(f"{rel}:{i}")
            if re.search(r"font-size\s*:\s*[0-9.]+(px|pt)\b", line) and rel not in PAPER:
                sheets.append(f"{rel}:{i}")
ok(not inline,
   "no component hard-codes a pixel font size in an inline style",
   "these inline styles are still pixels: " + ", ".join(inline))
ok(not sheets,
   "no component writes a pixel font-size in a CSS block of its own",
   "these CSS blocks inside components are still pixels — size them off the "
   "ramp, or add the file to PAPER with the reason: " + ", ".join(sheets))

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
