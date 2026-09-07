#!/usr/bin/env python3

"""
The swipe rail is Dan's chain, and only the rail reads a finger.

Numbered 117, and the walk here is the point. This file took 110; the colour
review claimed it the same hour. It took 111; main landed
verify111-forever-french while this branch held it. Those are the ninth and
tenth number collisions in this repo, after 102 the day before — and every one
was found by verify-wiring at push time rather than by anybody's scan, which is
exactly what that check was added for on 6 Sep.

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

3 · A ROW IS A SCREEN. Dan, 7 Sep: *"the Pre-Tests are still sitting under
    the SIO. They should be moved into the SpecuLearn as separate page - AND
    ONE QUESTION PER PAGE!"*, *"so that we scroll down when one is done"*,
    *"scroll down = swipe up"*. The magnet that makes that work is one
    component (SnapFeed), and the « Next → » button it replaces must not creep
    back: two ways past a question teaches the one that cannot be found by
    feel.

4 · EVERY FRAME HAS A HOST, AND EVERY HOST A FRAME. Dan, 7 Sep: *"EVERYTHING
    (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES
    (EMBEDDED)"*. The pattern is a pair, and either half alone is a broken page
    that the other half's source cannot reveal.

5 · SIDEWAYS IS NOT THE BROWSER'S (Dan: *"vertical left is not to the
    browser"*). A horizontal drag that runs out of page is an overscroll, and a
    browser answers a horizontal overscroll by going back in history — measured
    on the real build, a rightward swipe on ChaTutor left the app entirely.
    `overscroll-behavior-x: none` on html/body is what stops it, and it is one
    line that anybody could tidy away without knowing what it holds up.

Numbered 117: 110 and then 111 were both claimed on main while this branch
held them (verify110-palette-hues, verify111-forever-french). The ninth and
tenth collisions in this repo; verify-wiring catches them at push time now,
which is how both were found.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
fails = []

# ── 1 · the chain, in Dan's order ──────────────────────────────────────────
rail = (SRC / "lib" / "swipeRail.ts").read_text(encoding="utf-8")
keys = re.findall(r'key:\s*"([a-z]+)"', rail)
# Skills and Games are ONE COLUMN EACH (Dan, 7 Sep: *"when there are multiple
# destinations on the right, we need the hub page, but when we return from one
# of those back to the left, it returns to the hub page. Hub pages are Skills
# and Games."*). They were six and three columns for a day, which made a
# sideways drag on ChaTutor a walk through a list nobody thinks of as ordered.
# And the chain ENDS AT GAMES (Dan, same day: *"LEADERBOARD AND PROFILE SHOULD
# NOT BE INSIDE THIS CHAIN TAKE THEM OUT"*). Every station is work on a goal;
# where you stand against the class is not. Both pages stay reachable through
# the 👤 User family — they simply get no horizontal swipe.
EXPECTED = [
    "map", "goals", "speculearn", "lesson", "flip",
    "skills", "svplay",
]
if keys != EXPECTED:
    fails.append(
        "swipeRail.ts no longer spells Dan's chain (6 Sep).\n"
        f"    expected: {' > '.join(EXPECTED)}\n"
        f"    found:    {' > '.join(keys)}"
    )

# Rightwards is back. The whole app's direction rule, in one function.
if "move(-1)" not in rail or "forward: move(1)" not in rail:
    fails.append(
        "swipeRail.railNeighbours no longer walks back with move(-1) and forward\n"
        "    with move(1). Rightwards drags the page right and reveals what is to\n"
        "    its LEFT, so rightwards is back. Dan corrected himself once on this\n"
        "    and the rule has been written down ever since."
    )

# A hub swallows its own doors: standing on one of them, BACK is the hub.
if "hub" not in rail or "normalise(hub) !== here" not in rail:
    fails.append(
        "The hub rule is gone. Dan, 7 Sep: on ChaTutor, rightwards is « Skills »,\n"
        "    not « ComposeIt » — the six skills are doors off one page, not a row\n"
        "    of stations, and the way out of a door is back through it."
    )
for hub_href in ['hub: "/skills"', 'hub: "/games"']:
    if hub_href not in rail:
        fails.append(f"{hub_href} is gone — Dan named both hubs by name.")

# The two pages Dan struck off must not creep back as stations.
for gone in ['"/leaderboard"', '"/profil"']:
    if gone in rail:
        fails.append(
            f"{gone} is back on the rail. Dan, 7 Sep: \"LEADERBOARD AND PROFILE\n"
            "    SHOULD NOT BE INSIDE THIS CHAIN TAKE THEM OUT\". They are reached\n"
            "    through the 👤 User family, not by swiping through the course."
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

# ── 3 · a row is a screen ──────────────────────────────────────────────────
FEED = SRC / "components" / "SnapFeed.tsx"
if not FEED.exists():
    fails.append("components/SnapFeed.tsx is gone — nothing makes a row a screen.")
else:
    feed = FEED.read_text(encoding="utf-8")
    for want, why in [
        ("snap-y", "the vertical snap"),
        ("snap-mandatory", "MANDATORY, not proximity — proximity lets a flick coast past three items"),
        ("snap-always", "so a fast flick cannot skip a row"),
    ]:
        if want not in feed:
            fails.append(f"SnapFeed lost `{want}` — {why}.")

for owner in ["app/practice/speculearn/pretest/[id]/PretestFeed.tsx",
              "app/sio/[id]/SioScroller.tsx"]:
    f = SRC / owner
    if not f.exists():
        fails.append(f"{owner} is gone — a feed surface Dan asked for.")
        continue
    text = f.read_text(encoding="utf-8")
    if "SnapFeed" not in text:
        fails.append(f"{owner} no longer uses SnapFeed — one item per screen was written twice before.")
    if re.search(r">\s*(Next|Suivant)\s*(→|›|&rarr;)", text):
        fails.append(
            f"{owner} has a Next button again. The way on is the swipe\n"
            "    (Dan, 7 Sep: \"scroll down = swipe up\"); a button beside it is a\n"
            "    second answer to the same question, and the undiscoverable one."
        )

# The pre-test's home is SpecuLearn, and its old address still answers.
if (SRC / "app" / "pretests" / "[id]" / "PretestContent.tsx").exists():
    fails.append(
        "The old /pretests/[id] runner is back. The pre-test moved under\n"
        "    SpecuLearn on 7 Sep — two runners is how the app came to have\n"
        "    four of them under one name."
    )
old = SRC / "app" / "pretests" / "[id]" / "page.tsx"
if old.exists() and "Forward" not in old.read_text(encoding="utf-8"):
    fails.append(
        "/pretests/[id] no longer forwards. Printed QR sheets and a term of\n"
        "    bookmarks name that URL — the stub is why the ids are frozen."
    )

# ── 4 · every frame has a host, and every host has a frame ─────────────────
#
# Dan, 7 Sep: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER PAGES
# IN IFRAMES (EMBEDDED)"*. The pattern is a PAIR — `<route>/page.tsx` draws the
# notebook and mounts a frame; `<route>/embed/page.tsx` is the activity. Either
# half alone is a broken page and neither failure is visible from the other's
# source, which is why this is checked as a pair rather than route by route:
#
#   a host with no twin   a notebook containing a frame that 404s
#   a twin with no host   an activity nobody can reach at its own URL
#
# Written as a sweep so a station added next month is covered without anyone
# remembering to add a line here.
APP = SRC / "app"
for embed in sorted(APP.rglob("embed/page.tsx")):
    route_dir = embed.parent.parent
    host = route_dir / "page.tsx"
    rel = route_dir.relative_to(APP)
    if not host.exists():
        fails.append(f"src/app/{rel}/embed/ has no host page beside it — the activity has no URL.")
        continue
    text = host.read_text(encoding="utf-8")
    if "EmbedFrame" not in text:
        fails.append(
            f"src/app/{rel}/page.tsx does not mount EmbedFrame, but an embed twin\n"
            f"    sits under it. Either the route stopped hosting its station — in which\n"
            f"    case the twin is unreachable — or the twin is left over."
        )
    elif "/embed" not in text:
        fails.append(f"src/app/{rel}/page.tsx mounts a frame that does not point at its own /embed twin.")

# ── 5 · the browser does not get the horizontal ────────────────────────────
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
    print("verify117 — the swipe rail:\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print(f"verify117 ok — {len(EXPECTED)} stations in Dan's order, one handler, one row per screen, the browser stays out.")
