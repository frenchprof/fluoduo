#!/usr/bin/env python3
"""
The swipe rail is Dan's chain, and only the rail reads a finger.

Dan, 6 Sep 2026, having been shown thirteen page types driven one by one:
*"right now it is not at all what i asked for"*, then the chain itself:

    Map --> jump to one of the SIO > SpecuLearn > MneMemo > MémoiRecall >
    Skills (ConjugaZone · ÉcouTexte · WorDrill · VoixLà · ComposeIt ·
    ChaTutor) > Games [NumBus + NumBourse inside) · VocabulaRain ·
    LexicaLater] > 👤 User (Leaderboard · Profile)

and the next day: *"it's a mental map, not a map to be published. we just need
the swipes to go the right way."*

WHAT WENT WRONG BEFORE, and what each rule here stops coming back:

1 · THE CHAIN, IN ORDER. `lib/swipeRail.ts` holds it as a list, and its order
    IS the navigation. Reordering it silently reroutes every swipe in the app,
    so the order is pinned here against Dan's own sentence.

2 · ONE HANDLER. Two surfaces used to carry their own copy of the same
    60px / 1.5x arithmetic — the goals scroller and the lesson's tab strip —
    each with a private idea of where "forward" went, and the other eleven page
    types had no horizontal gesture at all. A second handler is how the app got
    into that state, so a `router.push` fired from a touch handler anywhere but
    `useRailSwipe` fails this check.

3 · SIDEWAYS IS NOT THE BROWSER'S (Dan: *"vertical left is not to the
    browser"*). A horizontal drag that runs out of page is an overscroll, and a
    browser answers a horizontal overscroll by going back in history — measured
    on the real build, a rightward swipe on ChaTutor left the app entirely.
    `overscroll-behavior-x: none` on html/body is what stops it, and it is one
    line that anybody could tidy away without knowing what it holds up.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
fails = []

# ── 1 · the chain, in Dan's order ──────────────────────────────────────────
rail = (SRC / "lib" / "swipeRail.ts").read_text(encoding="utf-8")
keys = re.findall(r'key:\s*"([a-z]+)"', rail)
EXPECTED = [
    "map", "goals", "speculearn", "lesson", "flip",
    "conjugaison", "ecoutexte", "wordrill", "tts", "compose", "tutor",
    "numbers", "vocabularain", "lexicalator",
    "leaderboard", "profil",
]
if keys != EXPECTED:
    fails.append(
        "swipeRail.ts no longer spells Dan's chain (6 Sep).\n"
        f"    expected: {' > '.join(EXPECTED)}\n"
        f"    found:    {' > '.join(keys)}"
    )

# Rightwards is back. The whole app's direction rule, in one function.
if "back: move(-1)" not in rail or "forward: move(1)" not in rail:
    fails.append(
        "swipeRail.railNeighbours no longer returns back=move(-1), forward=move(1).\n"
        "    Rightwards drags the page right and reveals what is to its LEFT, so\n"
        "    rightwards is back. Dan corrected himself once on this and the rule\n"
        "    has been written down ever since."
    )

# ── 2 · one handler reads a finger ─────────────────────────────────────────
HANDLER = SRC / "components" / "useRailSwipe.ts"
if not HANDLER.exists():
    fails.append("components/useRailSwipe.ts is gone — the rail has no reader.")

for f in sorted(SRC.rglob("*.tsx")) + sorted(SRC.rglob("*.ts")):
    if f == HANDLER:
        continue
    text = f.read_text(encoding="utf-8")
    if "onTouchStart" not in text and "touchstart" not in text:
        continue
    # A surface may track touches for its own purposes (a drag, a canvas). What
    # it may not do is NAVIGATE off one — that is the rail's job, and a second
    # opinion about where sideways goes is the fault this check exists for.
    if re.search(r"router\.push|location\.(href|assign|replace)", text):
        rel = f.relative_to(ROOT)
        # The games own their own board gestures and never navigate off them;
        # anything that does both is what we are looking for.
        fails.append(
            f"{rel} handles touch AND navigates. Sideways belongs to the rail\n"
            "    (components/useRailSwipe.ts). Two handlers with two ideas of\n"
            "    'forward' is the state Dan found on 6 Sep."
        )

# ── 3 · the browser does not get the horizontal ────────────────────────────
css = (SRC / "app" / "globals.css").read_text(encoding="utf-8")
if not re.search(r"html,\s*body\s*\{[^}]*overscroll-behavior-x:\s*none", css):
    fails.append(
        "globals.css lost `html, body { overscroll-behavior-x: none; }`.\n"
        "    Without it a horizontal overscroll is a history navigation and a\n"
        "    rightward swipe leaves the app — measured on ChaTutor, 6 Sep.\n"
        "    `touch-action: pan-y` does NOT cover this: it governs panning, and\n"
        "    the back gesture rides on top of it."
    )

if fails:
    print("verify110 — the swipe rail:\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print(f"verify110 ok — {len(EXPECTED)} stations in Dan's order, one handler, the browser stays out.")
