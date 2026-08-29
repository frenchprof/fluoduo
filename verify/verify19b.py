#!/usr/bin/env python3
"""
The visual pass, checked — and ratcheted.

Patch 13 defined 26 Cahier tokens and NOTHING adopted them: the tier scale, the
type scale, the spacing scale and the radius scale had zero uses, while 615 raw
hex colours and 906 stock Tailwind palette classes did the actual painting.
That is how a design system dies — quietly, with the file still in the repo.

Two kinds of check here:

  HARD    things patch 19b finishes. These must be true, forever.
  RATCHET counts that cannot reach zero in one patch. The baseline is recorded
          in verify/visual-baseline.json; the check FAILS IF A COUNT GOES UP.
          Drift is what killed the system last time, so drift is what is
          forbidden. Lower the baseline as you clean up:
              python3 verify/verify19b.py --rebaseline

Run from the repo root:  python3 verify/verify19b.py
"""
import json, os, re, sys

ROOT = "."
BASE = "verify/visual-baseline.json"
REBASE = "--rebaseline" in sys.argv
HARD, SOFT = [], []


def files(ext):
    out = []
    for root, dirs, fs in os.walk("src"):
        dirs[:] = [d for d in dirs if d not in {"node_modules", ".next"}]
        out += [os.path.join(root, f) for f in fs if f.endswith(ext)]
    return out


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

tsx = files(".tsx") + files(".ts")
css = read("src/app/globals.css")
alltsx = "\n".join(read(f) for f in tsx)


def strip_comments(src: str) -> str:
    """Rough comment strip, for checks that look for CODE patterns.

    Without it a check fails on the comment that explains why the thing it
    forbids was removed — which is exactly what happened on this file's second
    run (2026-08-10), and on verify19's first run before that. A check that
    cannot tell code from prose reports its own documentation as a defect.
    """
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"(?m)^\s*//.*$", "", src)


code = strip_comments(alltsx)

# ── HARD ────────────────────────────────────────────────────────────────────
def hard(cond, ok, bad):
    HARD.append((cond, ok if cond else bad))

hard("--tier-good" in css and "var(--tier-good" in css + code,
     "the accuracy tier scale is consumed, not just declared",
     "--tier-good is declared and used nowhere — the tier scale is dead again")

# The page's BASELINE typeface (Dan, 2026-08-27: "make sure there is visual
# unity ... the fonts"). `body { font-family: Arial, Helvetica, sans-serif }`
# was create-next-app boilerplate that survived from the first commit, which
# made the whole five-face type system OPT-IN: measured before the fix,
# 50-83% of the real text runs on every page were Arial, « tes parents » in
# the Sorting drill among them. The house stack must be the default, not a
# class a component remembers to add.
_body_rule = re.search(r"(?<!-)\bbody\s*\{[^}]*\}", css)
_body_rule = _body_rule.group(0) if _body_rule else ""
hard("var(--font-body-stack)" in _body_rule,
     "body defaults to the house body stack — the type system is not opt-in",
     "body does not set font-family: var(--font-body-stack) — every unclassed "
     "run falls back to the browser default, which is how Arial ruled the app")
hard("Arial, Helvetica" not in _body_rule,
     "the create-next-app Arial boilerplate is gone from the body rule",
     "`Arial, Helvetica, sans-serif` is back on body — the starter template's "
     "default is overriding Work Sans again")

hard("HUES[i % HUES.length]" not in code,
     "no card colour comes from a rotating hue index",
     "HUES[i % HUES.length] is back: colour that encodes nothing")

hard("var(--fs-" in css,
     "the type scale is wired into the stylesheet",
     "--fs-* declared but never used — typography is still ad hoc")

# Whitespace-normalised: the override block aligns its values in a column, so
# a naive `--fluo-ink: var(` match failed on a file that was actually correct
# (caught by this check's own first run, 2026-08-10).
flat = re.sub(r"[ \t]+", " ", css)
for fam in ("fluo-ink", "fluo-card", "fluo-rule"):
    hard(f"--{fam}:" in flat and f"--{fam}: var(--cahier" in flat,
         f"--{fam} is an alias of the Cahier token, not a second opinion",
         f"--{fam} still holds its own colour — two palettes, one app")

hard(css.count("repeating-linear-gradient") >= 1,
     "the foolscap ruling exists as a reusable surface",
     "no ruled-paper surface defined")

hard("--cahier-margin-line" not in css,
     "no vertical margin line (Dan, 2026-08-10: horizontals only)",
     "a vertical margin line is defined — Dan asked for horizontals only")

# ── RATCHET ─────────────────────────────────────────────────────────────────
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
PALETTE = re.compile(r"\b(?:text|bg|border|ring|from|to|via|decoration|outline)-"
                     r"(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|"
                     r"emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b")

counts = {
    "raw_hex_in_components": sum(len(HEX.findall(read(f))) for f in tsx),
    "stock_tailwind_classes": len(PALETTE.findall(alltsx)),
    "files_with_raw_hex": sum(1 for f in tsx if HEX.search(read(f))),
}

prev = {}
if os.path.isfile(BASE):
    try:
        prev = json.load(open(BASE, encoding="utf-8")).get("counts", {})
    except Exception:
        prev = {}

if REBASE or not prev:
    json.dump({"note": "Ratchet for the visual pass. These may fall, never rise.",
               "counts": counts}, open(BASE, "w", encoding="utf-8"), indent=2)
    print(f"baseline written to {BASE}:")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    sys.exit(0)

for k, now in counts.items():
    was = prev.get(k, now)
    if now > was:
        SOFT.append((False, f"{k}: {was} -> {now} (+{now - was}) — the palette is drifting back"))
    elif now < was:
        SOFT.append((True, f"{k}: {was} -> {now} (-{was - now})"))
    else:
        SOFT.append((True, f"{k}: {now}, unchanged"))

print("\nvisual pass check\n" + "-" * 70)
for cond, msg in HARD:
    print(("  ok    " if cond else "  FAIL  ") + msg)
print("  " + "-" * 66)
for cond, msg in SOFT:
    print(("  ok    " if cond else "  FAIL  ") + msg)
print("-" * 70)
bad = [1 for c, _ in HARD + SOFT if not c]
print(f"  {len(HARD) + len(SOFT) - len(bad)} passed · {len(bad)} failed")
sys.exit(1 if bad else 0)
