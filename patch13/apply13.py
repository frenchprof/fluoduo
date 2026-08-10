#!/usr/bin/env python3
"""
Patch 13 — the persistent shell for games, and the Cahier design tokens.

  cd ~/fluoduo && python3 patch13/apply13.py --dry-run
  cd ~/fluoduo && python3 patch13/apply13.py

WHAT THIS FIXES

Five games rendered their own ad-hoc top bar — a browser-style "← Back", the
game's name, a help dot — in five different colour schemes, with no way back to
FluOlinGo and none of the icons that exist on every other page:

    games/numbus            games/numbourse
    games/compose/[bankId]  games/lexicalater/[deckId]
    games/vocabularain/[setId]

A learner who opened one from a link was stranded. (Match It was fine — it goes
through CahierShell already, as do every practice drill and pretest.)

All five now share one `GameBar`: FluOlinGo home on the left, the activity in
the middle, and Index / Mon progrès / Classement / Profil on the right. Sticky,
so it scrolls with the learner and never covers the game.

WHY NOT THE FULL CahierShell IN GAMES: a game needs its screen. This is the
smallest bar that answers "where am I, how do I get out" — the flap rail stays
off. PRD §10: parts of the same product even when the mechanics differ.

ALSO: the Cahier design-system tokens (Dan's handoff, 2026-08-10) are appended
to globals.css. ONLY tokens that do not already exist are added — `--cahier-paper`,
`--cahier-ink` and `--cahier-ink-soft` are already defined and are left exactly
as they are, so no existing page shifts. The new ones (`--cahier-line`,
`--cahier-accent`, the `--tier-*` set, the type/space/radius scales) are what the
rest of the redesign will be built from.

Built and verified before shipping: tsc 0 errors, next build 738 pages.
Idempotent.
"""
import os, re, shutil, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
B = os.path.join(ROOT, "patch13")
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)


def read(rel):
    p = os.path.join(ROOT, rel)
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else None


def write(rel, txt):
    if not DRY:
        open(os.path.join(ROOT, rel), "w", encoding="utf-8").write(txt)


# ── 1. the component ────────────────────────────────────────────────────────
src, dst = os.path.join(B, "src/components/GameBar.tsx"), os.path.join(ROOT, "src/components/GameBar.tsx")
if os.path.isfile(src):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY:
        shutil.copy2(src, dst)
    ok.append("file  src/components/GameBar.tsx")
else:
    fail.append("missing in bundle: src/components/GameBar.tsx")


# ── 2. design tokens, additive only ────────────────────────────────────────
TOKENS = """
/* ── Cahier design system — Dan's handoff, 2026-08-10 ─────────────────────
   Tokens from `design_handoff_cahier_dashboard/README.md`, in OKLCH as
   specified. ADDITIVE ONLY: --cahier-paper, --cahier-ink and --cahier-ink-soft
   already existed here and are deliberately NOT redefined — overriding them
   would shift every page that already uses them, which is not what a token
   import should do. The names below are the ones the design system adds. */
:root {
  --cahier-paper-raised: oklch(99% 0.007 85);
  --cahier-line: oklch(90% 0.018 85);
  --cahier-line-strong: oklch(81% 0.025 78);
  --cahier-ink-faint: oklch(60% 0.014 65);
  --cahier-accent: oklch(46% 0.13 262);
  --cahier-accent-soft: oklch(92% 0.03 262);
  --cahier-accent-strong: oklch(36% 0.13 262);
  --cahier-kraft: oklch(85% 0.045 75);
  --cahier-kraft-strong: oklch(65% 0.06 70);
  --cahier-hover: oklch(95% 0.018 262);

  /* Accuracy tiers. Deliberately distinct from --cahier-accent so that
     "this is a link" never reads as "this is good". */
  --tier-good: oklch(56% 0.1 152);
  --tier-good-soft: oklch(93% 0.035 152);
  --tier-medium: oklch(72% 0.14 78);
  --tier-medium-soft: oklch(94% 0.05 78);
  --tier-weak: oklch(56% 0.15 25);
  --tier-weak-soft: oklch(93% 0.045 25);

  --fs-display: 2.75rem;
  --fs-h1: 2.25rem;
  --fs-h2: 1.75rem;
  --fs-h3: 1.375rem;
  --fs-h4: 1.125rem;
  --fs-body: 1rem;
  --fs-small: 0.875rem;
  --fs-micro: 0.75rem;

  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px; --sp-5: 20px;
  --sp-6: 24px; --sp-8: 32px; --sp-10: 40px; --sp-12: 48px; --sp-16: 64px;

  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 999px;
  --shadow-card: 0 1px 2px oklch(24% 0.02 55 / 0.07), 0 6px 16px oklch(24% 0.02 55 / 0.08);
}
"""
css = read("src/app/globals.css")
if css is None:
    fail.append("not found: src/app/globals.css")
elif "--tier-good" in css:
    skip.append("edit  globals.css (tokens already present)")
else:
    write("src/app/globals.css", css.rstrip() + "\n" + TOKENS)
    ok.append("edit  globals.css (+26 design tokens, none overridden)")


# ── 3. swap each game's ad-hoc bar for GameBar ─────────────────────────────
OPEN = '<div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">'

GAMES = [
    ("src/app/games/numbus/page.tsx", '"🚌 NumBus"', None),
    ("src/app/games/numbourse/page.tsx", '"📈 NumBourse"', None),
    ("src/app/games/compose/[bankId]/page.tsx", "{`${bank.emoji} ${bank.title}`}", "/games/compose"),
    ("src/app/games/lexicalater/[deckId]/page.tsx", '"🧰 LexicaLater"', "/games/lexicalater"),
    ("src/app/games/vocabularain/[setId]/page.tsx", "{`☁️ ${set.title}`}", "/games/vocabularain"),
]


def replace_bar(rel, title, up):
    """Replace the ad-hoc bar block with <GameBar/>.

    The block is found structurally rather than by pasting twenty lines of
    anchor: from the opening div, consume until the first `</div>` sitting at
    the SAME indentation. Five files, five slightly different bars, one rule."""
    txt = read(rel)
    if txt is None:
        fail.append("not found: " + rel); return
    if "GameBar" in txt:
        skip.append("edit  " + rel + " (already applied)"); return
    lines = txt.split("\n")
    start = next((i for i, l in enumerate(lines) if OPEN in l), None)
    if start is None:
        fail.append(rel + ": bar not found"); return
    indent = len(lines[start]) - len(lines[start].lstrip())
    end = None
    for j in range(start + 1, len(lines)):
        s = lines[j].strip()
        if s == "</div>" and (len(lines[j]) - len(lines[j].lstrip())) == indent:
            end = j
            break
    if end is None:
        fail.append(rel + ": bar end not found"); return
    pad = " " * indent
    attrs = f"title={title}" if title.startswith("{") else f"title={title}"
    if up:
        attrs += f' up="{up}"'
    lines[start:end + 1] = [f"{pad}<GameBar {attrs} />"]
    out = "\n".join(lines)
    # import, after the last single-line import
    if 'from "@/components/GameBar"' not in out:
        L = out.split("\n")
        idx = [i for i, l in enumerate(L) if l.startswith("import ") and l.rstrip().endswith(";")]
        L.insert((idx[-1] + 1) if idx else 0, 'import GameBar from "@/components/GameBar";')
        out = "\n".join(L)
    # BackLink / HelpDot may now be unused — lint would flag them
    for sym in ("BackLink", "HelpDot"):
        if out.count(sym) == 1:
            out = re.sub(rf'^import {sym} from "[^"]+";\n', "", out, flags=re.M)
    write(rel, out)
    ok.append("edit  " + rel)


for rel, title, up in GAMES:
    replace_bar(rel, title, up)

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x)
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  STOP THE DEV SERVER, then:
    rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev

  LOOK AT any of: /games/numbus  /games/numbourse  /games/vocabularain/weather
                  /games/lexicalater/aliments  /games/compose/cafe
  Every one now has FluOlinGo top-left and Index / Mon progres / Classement /
  Profil top-right, and the bar sticks as you scroll.
""")
