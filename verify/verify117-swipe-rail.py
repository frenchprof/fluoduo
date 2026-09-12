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
# DAN REWROTE THE TAIL ON 2026-09-08, station by station: "MémoiRecall — swipe
# left for ConjugaZone", then an hour later "can you swap the WorDrill (comes
# first) and ConjugaZone (last)", and he closed the list himself with "[end of
# left swipe]". So the three skills that belong to ONE lesson are three columns
# again, in his order, and Games is off the chain.
#
# This is not the 7 Sep hub decision taken twice. That day six skills became one
# column because dragging through ChaTutor, VoixLà and ComposeIt was "a walk
# through a list nobody thinks of as ordered". These three ARE ordered — say it,
# hear it, conjugate it, on one lesson — and the other three are not in the
# chain at all. Skills is still a hub PAGE; it is no longer a station.
EXPECTED = [
    "map", "goals", "speculearn", "lesson", "flip",
    "wordrill", "ecoutexte", "conjugaison",
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

# THE HUB RULE AND ITS TWO USERS PARTED COMPANY ON 2026-09-08.
#
# It was written on 7 Sep for a real fault: standing on ChaTutor, rightwards had
# to be « Skills » and not « ComposeIt », because the six skills are doors off
# one page rather than a row of stations. Then Dan rewrote the tail and neither
# Skills nor Games is a station any more — so the two `hub:` lines this used to
# demand by name are correctly gone, and demanding them would now be demanding
# the chain he replaced.
#
# The MECHANISM stays, and the invariant is the pair: a station may declare a
# hub, and if any does, the code that honours it must still be there. Assert
# them against each other rather than either alone — that way the rule cannot
# rot while unused, and a hub cannot come back to code that ignores it.
declares_hub = re.search(r'^\s*hub:\s*"', rail, re.M) is not None
honours_hub = "normalise(hub) !== here" in rail
if declares_hub and not honours_hub:
    fails.append(
        "A station declares `hub:` but railNeighbours no longer honours it.\n"
        "    Dan, 7 Sep: on a door off a hub, rightwards is the hub itself — the\n"
        "    way out of a door is back through it."
    )

# THE LESSON IS IN CONJUGAZONE'S ADDRESS, and this is the load-bearing half of
# Dan's own question (2026-09-08): *"will it be able to return via the swipe
# right way from ConjugaZone back through the entire chain?"* All fifty lessons
# share `/conjugaison`, so a right swipe reads the lesson from `?deck=` or it
# reads nothing. `?v=` cannot stand in (two lessons can share a verb) and the
# remembered deck cannot either — a bookmark, a shared link or a dropped tab
# has no memory to read, and the swipe would land on somebody else's lesson.
if "deck=${deck}" not in rail:
    fails.append(
        "ConjugaZone's station no longer puts the lesson in its address.\n"
        "    One page serves all fifty lessons, so without `?deck=` a right swipe\n"
        "    off it cannot know whose ÉcouTexte to go back to."
    )
if not re.search(r'deck=\(\[\^&#\]\+\)', rail):
    fails.append(
        "swipeRail no longer READS `?deck=` back out of the address.\n"
        "    Writing it and not reading it is worse than neither: the URL claims a\n"
        "    lesson the rail ignores."
    )

# The two pages Dan struck off must not creep back as stations.
for gone in ['"/leaderboard"', '"/profil"']:
    if gone in rail:
        fails.append(
            f"{gone} is back on the rail. Dan, 7 Sep: \"LEADERBOARD AND PROFILE\n"
            "    SHOULD NOT BE INSIDE THIS CHAIN TAKE THEM OUT\". They are reached\n"
            "    through the 👤 User family, not by swiping through the course."
        )

# ── 2 · ONE CHAIN, and only the rail's own handlers may move on it ─────────
#
# This used to say "one handler", naming useRailSwipe, and on 7 Sep that
# wording failed a correct change. Dan, pointing at a news article: *"The
# scroll is not done right … when u scroll to the end of this page, it
# automatically goes into the new URL at the start of that page."* Reaching
# the end of a vertical scroll is a SECOND GESTURE — it reads a different
# finger from a sideways drag and cannot share its code — so the app now has
# two readers, `useScrollOn` beside `useRailSwipe`.
#
# What was never really about the count is the thing worth keeping: on 6 Sep
# the app had two handlers with two PRIVATE IDEAS OF WHERE FORWARD WENT, and
# that is what Dan found. So the rule is sharpened rather than dropped — a
# handler that navigates off a touch must take its destination from
# `railNeighbours`, the one list. Two gestures asking one chain cannot drift;
# two gestures each holding a route is the 6 Sep state by another name.
HANDLERS = {
    SRC / "components" / "useRailSwipe.ts": "the sideways drag",
    SRC / "components" / "useScrollOn.ts": "the end of a vertical scroll",
}
# TWO AXES, ONE FILE (2026-09-08). The sideways drag asks `railNeighbours` for
# the next ACTIVITY; the vertical pull asks `sioNeighbours` for the next GOAL.
# Either satisfies the rule, because the rule was never about one function name
# — it is that a handler which navigates takes its destination from
# lib/swipeRail.ts rather than spelling a route inside itself, which is how the
# app came to have two ideas of "forward" on 6 Sep.
#
# SCANNED WITH COMMENTS STRIPPED, and that is not fussiness: useScrollOn's own
# header explains that it reads sioNeighbours "not railNeighbours", so a raw
# text search found the old name in the sentence saying it had stopped using it
# and passed. A check green on its own documentation is the failure verify40
# names in its header, met here in the wild.
def code_only(src):
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)

for h, what in HANDLERS.items():
    if not h.exists():
        fails.append(f"components/{h.name} is gone — the rail has no reader for {what}.")
        continue
    body = code_only(h.read_text(encoding="utf-8"))
    if "railNeighbours" not in body and "sioNeighbours" not in body:
        fails.append(
            f"components/{h.name} no longer asks lib/swipeRail.ts where to go.\n"
            "    A handler that navigates must read the one chain — railNeighbours\n"
            "    for the next activity, sioNeighbours for the next goal. A route\n"
            "    spelled inside a gesture handler is how the app came to have two\n"
            "    ideas of 'forward' on 6 Sep."
        )

# AND THE VERTICAL AXIS IS THE COURSE, not the chain. Dan, 2026-09-08, of every
# station in turn: "swipe up and down to the next or previous SIO". Before that
# the end of a scroll carried a learner to the next STATION, which is now the
# sideways drag's job alone — one finger, one meaning, per direction. If this
# ever reads railNeighbours again, down and left have gone back to meaning the
# same thing.
scroll = code_only((SRC / "components" / "useScrollOn.ts").read_text(encoding="utf-8"))
if "sioNeighbours" not in scroll:
    fails.append(
        "useScrollOn no longer moves along the GOALS. Downwards is the course —\n"
        "    goal 23 to goal 24, same activity, its own address — and the next\n"
        "    ACTIVITY is what the sideways drag is for."
    )

# The end-of-scroll gesture's three guards, each pinned against the failure it
# was written for. Every one of them was found by DRIVING the built export, and
# without any of them this feature is worse than the wall it replaces.
#
# THEY MOVED ON 8 SEP, and the check follows them rather than going quiet where
# they used to be. Dan asked for the same gesture one level in — *"between
# questions of the same lesson … it should be scrolling to the next bookmarked
# item below on the same page"* — so the reading of the finger came out of
# `useScrollOn` into `usePullPastEnd`, which the rail and DrillShell now share.
# A check that kept looking in the old file would have passed on an empty
# string, which is the failure mode verify127 already taught this repo once.
scroll_on = (SRC / "components" / "usePullPastEnd.ts")
if not scroll_on.exists():
    fails.append(
        "components/usePullPastEnd.ts is gone — the pull past the end has no reader.\n"
        "    Both the rail's carry-on and a drill's next question are that one\n"
        "    gesture; if it has moved again, point this check at where it lives."
    )
if scroll_on.exists():
    text = scroll_on.read_text(encoding="utf-8")
    for token, why in [
        ("if (!boxes.length) return opts.whenNothingScrolls === true",
         "GUARD 1 — a page that does not scroll is never at the end of a scroll.\n"
         "    /skills and /games are shorter than the screen, so every scroller on\n"
         "    them is trivially at its bottom; without this one flick anywhere\n"
         "    navigates. The opt-out is for a caller whose answer costs nothing on a\n"
         "    stray flick (a drill pressing Continue on a question already answered);\n"
         "    the RAIL must never pass it, because navigating away is destructive."),
        ("startedAtEnd",
         "GUARD 2 — a gesture only counts if it BEGAN at the end. Measured before\n"
         "    this existed: reading the pre-test through in one pass landed on the\n"
         "    lesson, because the notch that ARRIVED at the bottom spent the whole\n"
         "    threshold on the spot. No threshold alone fixes it — a bigger one just\n"
         "    means a longer page triggers it."),
        ("data-no-scroll-on",
         "GUARD 3 — a pan surface is not a reading flow. The map's 3D box scrolls,\n"
         "    but dragging it is looking around; without the hatch, reaching its\n"
         "    bottom throws a learner off the map into SpecuLearn."),
        ("hidden|clip",
         "THE LOCKED DOCUMENT. A feed sets html{overflow:hidden}, and a locked\n"
         "    <html> still reports overflow with scrollTop frozen at 0 — so counting\n"
         "    it meant 'every scroller at its bottom' was never true on a feed. The\n"
         "    pre-test sat at 4005 of 4005 and nothing happened."),
    ]:
        if token not in text:
            fails.append(f"usePullPastEnd lost `{token}`.\n    {why}")

# …AND THE RAIL MAY NOW OPT OUT OF IT, which reverses a rule written on the
# morning of 8 Sep and is worth saying why rather than just deleting.
#
# That rule said the rail must never pass `whenNothingScrolls`, because a page
# shorter than the screen is trivially at its end and one flick anywhere would
# carry a learner off. True while downwards meant LEAVE THIS ACTIVITY.
#
# Dan's grid, the same day, made downwards mean the next GOAL in the SAME
# activity — gentle, and undone by pulling up again — and `sioNeighbours`
# answers null for anything off the rail, so Home, the guide, Réglages, Skills
# and Games cannot fire at all. What protects a learner is no longer "the page
# must scroll" but "the page must be a station on a goal".
#
# Measured, because without it the feature does not work where Dan asked for it:
# a lesson arrived at by pulling down opens on its level picker, where the
# finger is not over the panel scroller, so nothing scrolled under it and three
# pulls in a row did nothing. A drill card does not scroll at all.
#
# So what is pinned is the replacement guard, not the old one: the vertical
# pull must take its destination from sioNeighbours, which is the thing that
# refuses every page that is not a station.
scroll_src = (SRC / "components" / "useScrollOn.ts").read_text(encoding="utf-8")
if "whenNothingScrolls" in scroll_src and "sioNeighbours" not in scroll_src:
    fails.append(
        "useScrollOn acts on a page that does not scroll, but no longer asks\n"
        "    sioNeighbours where to go. That pairing is what keeps a stray flick\n"
        "    safe: off the rail there IS no next goal, so nothing fires."
    )

for f in sorted(SRC.rglob("*.tsx")) + sorted(SRC.rglob("*.ts")):
    if f in HANDLERS:
        continue
    text = f.read_text(encoding="utf-8")
    if "onTouchStart" not in text and "touchstart" not in text:
        continue
    # A surface may track touches for its own purposes (a drag, a canvas). What
    # it may not do is NAVIGATE off one — that is the rail's job, and a second
    # opinion about where a gesture goes is the fault this check exists for.
    if re.search(r"router\.push|location\.(href|assign|replace)", text):
        rel = f.relative_to(ROOT)
        # The games own their own board gestures and never navigate off them;
        # anything that does both is what we are looking for.
        fails.append(
            f"{rel} handles touch AND navigates. Moving between stations belongs to\n"
            "    the rail's own handlers (useRailSwipe, useScrollOn), which both read\n"
            "    railNeighbours. Two handlers with two ideas of 'forward' is the state\n"
            "    Dan found on 6 Sep."
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
    # A host may delegate to a sibling client component — `page.tsx` carries the
    # metadata a client file cannot export, and the frame lives next door. Follow
    # one hop of local imports so the pair is read as the page a learner gets.
    for m in re.finditer(r'import\s+\w+\s+from\s+"\./([\w/]+)"', text):
        sib = route_dir / f"{m.group(1)}.tsx"
        if sib.exists():
            text += sib.read_text(encoding="utf-8")
    # SECOND LEGAL SHAPE (2026-09-11): the four 👤 User twins are framed by the
    # ONE User page, and their own routes forward into it with that tab open.
    # The invariant is unchanged — every twin still has to be reachable at its
    # own URL — so this does not excuse the route, it follows the hop: the
    # forwarder must name a tab that userTabs.ts lists, and the User page must
    # frame that tab's twin. A twin that is in neither shape still fails.
    if "UserTabRedirect" in text:
        tabs_src = (SRC / "content" / "userTabs.ts").read_text(encoding="utf-8")
        host_src = (APP / "profil" / "UserPage.tsx").read_text(encoding="utf-8")
        want = f"/{rel}/embed"
        if want not in tabs_src:
            fails.append(
                f"src/app/{rel}/page.tsx forwards into the User page, but userTabs.ts\n"
                f"    does not list {want} — the twin is unreachable through the tabs."
            )
        elif "<EmbedFrame" not in host_src or "current.embed" not in host_src:
            fails.append(
                "src/app/profil/UserPage.tsx stopped framing the tab's twin, so every\n"
                "    forwarded User route now lands on a page that shows nothing."
            )
        continue
    if "<EmbedFrame" not in text:
        fails.append(
            f"src/app/{rel}/page.tsx does not mount EmbedFrame, but an embed twin\n"
            f"    sits under it. Either the route stopped hosting its station — in which\n"
            f"    case the twin is unreachable — or the twin is left over."
        )
    elif "current.embed" in text:
        # The User page frames whichever tab is open rather than one fixed
        # route, so its twin is named in userTabs.ts instead of inline. Its own
        # twin still has to be in that list, or /profil frames everything except
        # the panel it is supposed to open on.
        tabs_src = (SRC / "content" / "userTabs.ts").read_text(encoding="utf-8")
        if f"/{rel}/embed" not in tabs_src:
            fails.append(
                f"src/app/{rel}/page.tsx frames the User tabs but userTabs.ts does not\n"
                f"    list /{rel}/embed — its own panel is the one tab nobody can open."
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
print(f"verify117 ok — {len(EXPECTED)} stations in Dan's order, two gestures on one chain, one row per screen, the browser stays out.")
