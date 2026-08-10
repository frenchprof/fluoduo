#!/usr/bin/env python3
"""
Patch 20–21's check — the DrillShell, phase 1.

What it asserts (the things a screenshot cannot):

  1  DrillShell exists and encodes its contract: 100dvh with overflow
     hidden, a body slot that swallows stray <h1>s, ONE Enter/Space binding,
     a real progressbar — and NO hearts (lives lockout is on the refused
     list of the settled gamification decisions, TODO.md §6).
  2  The four /practice/* drill routes render the drill, not the unit map:
     no UnitActivityPage import. UnitActivityPage itself survives for the
     two /lessons/* routes until patch 22 (the pager) replaces the popup.
  3  All four drill bodies are on the shell.
  4  SioModal lost its compensation chrome: drag-resize, the persisted
     panel size, auto-widen, and the ⤢ full-page hatch.
  5  Keyboard legends render only where a keyboard exists (>= sm, or
     pointer-fine): Say It, Flip It, Letris, SpecuLearn, NumBus.

Run from the repo root:  python3 verify/verify20.py
"""
import os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    """A check must tell code from prose (2026-08-10 lesson)."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── 1 · the shell and its contract ─────────────────────────────────────────
shell = read("src/components/DrillShell.tsx")
shell_code = strip_comments(shell)
check(bool(shell), "DrillShell exists", "src/components/DrillShell.tsx is missing")
check("h-dvh" in shell_code and "overflow-hidden" in shell_code,
      "the shell is 100dvh, overflow hidden",
      "DrillShell does not lock to the viewport (h-dvh + overflow-hidden)")
check("[&_h1]:hidden" in shell_code,
      "the body slot swallows any <h1> a drill prints",
      "DrillShell does not hide stray <h1>s")
check(shell_code.count("addEventListener(\"keydown\"") == 1,
      "ONE Enter/Space binding, defined in the shell",
      "DrillShell should own exactly one keydown binding")
check('role="progressbar"' in shell_code,
      "the progress bar is a real progressbar",
      "DrillShell's progress bar has no progressbar role")
check("♥" not in shell_code and not re.search(r"\bhearts?\b", shell_code, re.I),
      "no hearts — lives lockout stays refused (TODO §6)",
      "DrillShell mentions hearts/lives — that is on the REFUSED list")
check("animate-[drill-tray" in shell_code and "absolute inset-x-0 bottom-0" in shell_code,
      "the feedback tray overlays; it cannot push the body",
      "the feedback tray is not an absolute overlay — feedback would reflow the body")

# ── 2 · the four drill routes render the drill ─────────────────────────────
ROUTES = {
    "dice": "src/app/practice/dice/[collectionId]/page.tsx",
    "complete-it": "src/app/practice/complete-it/[collectionId]/page.tsx",
    "say-it": "src/app/practice/say-it/[collectionId]/page.tsx",
    "grammarathon": "src/app/practice/grammarathon/[collectionId]/page.tsx",
}
for name, p in ROUTES.items():
    src = strip_comments(read(p))
    check(src and "UnitActivityPage" not in src,
          f"/practice/{name} renders the drill, not the unit map",
          f"{p} still routes through UnitActivityPage")

# The popup path survives for lessons ONLY (patch 22 retires it).
uap_importers = []
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            if "UnitActivityPage" in strip_comments(read(p)) and not p.endswith("UnitActivityPage.tsx"):
                uap_importers.append(p.replace(os.sep, "/"))
check(sorted(uap_importers) == [
        "src/app/lessons/[slug]/page.tsx",
        "src/app/lessons/deck/[collectionId]/page.tsx",
      ],
      "UnitActivityPage survives for the two lesson routes only",
      f"unexpected UnitActivityPage importers: {sorted(uap_importers)}")

# ── 3 · the four drill bodies are on the shell ─────────────────────────────
CONTENTS = {
    "EtuDice": "src/app/practice/dice/[collectionId]/PracticeContent.tsx",
    "iComplete": "src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx",
    "WorDrill": "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
    "GramMarathon": "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx",
}
for name, p in CONTENTS.items():
    src = strip_comments(read(p))
    check("DrillShell" in src and "drillExitHref" in src,
          f"{name} runs in DrillShell",
          f"{p} does not use DrillShell")
    if name == "EtuDice":
        # Its "no dice practice for this deck" fallback is an information
        # page with navigation, not a drill — CahierShell is right there.
        # The drill itself must not touch it.
        check("PracticeRunner set={practiceSet}" not in src
              or "<CahierShell" not in src.split("function PracticeRunner")[-1],
              "EtuDice's runner carries no page-shell of its own",
              f"{p}: PracticeRunner still wraps itself in CahierShell")
    else:
        check("CahierShell" not in src,
              f"{name} carries no page-shell of its own",
              f"{p} still wraps itself in CahierShell")

# SpecuLearn: migrated, and its config wizard is DELETED — the drill opens
# straight into the first question; the 🎤 modes moved to the end card.
specu = strip_comments(read("src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx"))
check("DrillShell" in specu and "CahierShell" not in specu,
      "SpecuLearn runs in DrillShell",
      "SpecuLearn is not on DrillShell / still wraps CahierShell")
check("Choisis ta direction" not in specu and '"start"' not in specu,
      "SpecuLearn's config wizard is gone — the first question is the first screen",
      "SpecuLearn still renders a pre-question config screen")
check("Devine et dis" in specu and "again(false, \"say-s\")" in specu,
      "the 🎤 modes survive on the end card",
      "the wizard's 🎤 modes were deleted instead of moved to the end card")

# Select-then-commit (the shell's interaction grammar): in DrillShell an
# option tap SELECTS and the Vérifier CTA COMMITS, for both MCQ drills.
dice = strip_comments(read(CONTENTS["EtuDice"]))
check("setSelected" in dice and '"Vérifier"' in dice,
      "EtuDice is select-then-commit in the shell",
      "EtuDice still commits on tap in the shell")
check("setSelected" in specu and '"Vérifier"' in specu,
      "SpecuLearn is select-then-commit in the shell",
      "SpecuLearn still commits on tap in the shell")

# iComplete gains the help ladder it never had (its row's second half): the
# same buildLadder/shownRungs pair GramMarathon uses, hints recorded as
# evidence (hintsTaken) like everywhere else.
icomplete = strip_comments(read(CONTENTS["iComplete"]))
check("buildLadder" in icomplete and "shownRungs" in icomplete and "hintsTaken" in icomplete,
      "iComplete has the help ladder, and hints are recorded as evidence",
      "iComplete still has no help ladder (buildLadder/shownRungs/hintsTaken)")

# Word-bank tiles below sm: the typed drills keep their <input> for sm-and-up
# and render tappable chips beneath it — one `value`, either surface.
bank = strip_comments(read("src/components/WordBank.tsx"))
check(bool(bank) and "onChange(idxs.map((i) => tokens[i]).join(\" \"))" in bank,
      "WordBank exists and mirrors chips into the host's value",
      "src/components/WordBank.tsx missing or not mirroring value")
for name, p in (("iComplete", CONTENTS["iComplete"]), ("GramMarathon", CONTENTS["GramMarathon"])):
    src = read(p)
    check("WordBank" in src and 'className="sm:hidden"' in src and "hidden w-full sm:block" in src,
          f"{name}: typing above sm, word-bank tiles below it",
          f"{p}: word-bank/input breakpoint pair missing")

# ÉcouTexte: full-screen in the shell; its own Enter (mark a sentence)
# suppresses the shell CTA via preventDefault, which the shell honours.
ecout = strip_comments(read("src/app/practice/ecoutexte/EcouTexte.tsx"))
ecout_page = strip_comments(read("src/app/practice/ecoutexte/page.tsx"))
check("DrillShell" in ecout and "CahierShell" not in ecout_page,
      "ÉcouTexte runs in DrillShell",
      "ÉcouTexte is not on DrillShell / its page still wraps CahierShell")
check("e.defaultPrevented" in shell_code,
      "the shell stands down when a body handled the key itself",
      "DrillShell ignores defaultPrevented — ÉcouTexte's Enter would draw a new text")

# ── 4 · SioModal lost its compensation chrome ──────────────────────────────
sio = strip_comments(read("src/app/SioModal.tsx"))
for banned, why in (
    ("startResize", "drag-resize"),
    ("ResizeObserver", "the persisted panel size"),
    ("popupSize", "the size localStorage key"),
    ("Ouvrir en pleine page", "the ⤢ full-page hatch"),
    ("setPointerCapture", "pointer-capture resize"),
):
    check(banned not in sio,
          f"SioModal: {why} is gone",
          f"SioModal still carries {why} ({banned})")

# ── 5 · keyboard legends only where a keyboard exists ──────────────────────
LEGENDS = [
    ("Say It", "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
     "Space = 🎤", "hidden", "sm:block"),
    ("Flip It", "src/app/practice/flip-it/[collectionId]/FlipItContent.tsx",
     "Space flip", "hidden", "sm:block"),
    ("Letris", "src/games/letris/LetrisGame.tsx",
     "hard drop", "hidden", "sm:block"),
    ("SpecuLearn", "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx",
     "CHOICE_KEYS_HINT}", "hidden", "sm:block"),
    ("NumBus", "src/games/numbus/NumBus.tsx",
     "⏎ submit", "hidden", "pointer-fine:block"),
]
for name, p, marker, *classes in LEGENDS:
    src = strip_comments(read(p))  # NumBus documents its legend in a JSDoc
    i = src.find(marker)
    # The gating class sits on the legend's element, which may open a line
    # or two above the text — judge the enclosing 500 characters.
    ctx = src[max(0, i - 500):i] if i >= 0 else ""
    check(i >= 0 and all(c in ctx for c in classes),
          f"{name}'s keyboard legend hides where there is no keyboard",
          f"{p}: legend near {marker!r} is not gated by {classes}")

print("\npatch 20-21 check (phase 1)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
