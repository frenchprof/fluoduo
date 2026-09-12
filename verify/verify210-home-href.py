#!/usr/bin/env python3
"""verify210 — a bare "/" never means Home, and "/map" never means the map.

On 2026-09-09 the welcome page took the root and Home moved to `/home` (#255).
The commit that did it swept the app for links to `/` and rewrote fifteen of
them: the wordmark, the 🏠 button, « ← Back to the path », the deck pages'
Home, the 404's button, the guide's Continue.

IT MISSED THE DEFAULTS, and that is the whole reason this check exists.

Nobody writes a Home link inside `exitHref = "/"` or `next?.href ?? "/"`. They
write a fallback once, correctly, and it stays correct until the day the root
changes meaning. Eighteen survived the sweep, every one of them still
resolving, every one now landing on the front door. The symptom reached Dan on
2026-09-11 as:

    "Closing each of the pages is not supposed to jump to the Enter page."

The ✕ on every page in the app is `PageBand`'s `exitHref`, and its default was
`/`. So was `BackLink`'s `fallback`, `CahierShell`'s, `DrillShell`'s and
`GameOver`'s "next" fallbacks, the rail hooks', NumBus's and NumBourse's, the
Lesson family's own door, and three "home" tabs.

A LINK THAT STILL RESOLVES IS THE HARD KIND OF BROKEN. Nothing errors, nothing
404s, no test goes red — the learner just ends up somewhere else. That is why
this is a check and not a comment.

WHAT IT FORBIDS: a bare "/" in the shapes that MEAN a destination — a prop
default, a `??` fallback, an `href:` in a tab or registry row, an `href="/"`
on a link. `HOME_HREF` from `src/lib/routes.ts` is the answer in all of them.

WHAT IT ALLOWS, deliberately:
  · comparisons — `if (path === "/")` asks where you ARE, and FirstTour needs
    exactly that;
  · the door itself — `src/app/page.tsx` IS the root, and
    `welcome/WelcomeRedirect.tsx` forwards to it. Those two say "/" literally
    because they are the thing, not a reference to it;
  · `src/lib/routes.ts`, which defines the address.

THE SAME FAILURE, A SECOND TIME, THREE DAYS LATER. On 2026-09-12 the map
merged into Home: `/map` became a `location.replace` stub and Home began
drawing the map itself. Eighteen live links still named `/map` — the 🗺️ in the
tab strip, the swipe rail's first station, every drill's ✕, the profile's MAP,
the 404's button, ÉcouTexte's and the lesson pager's exits. Every one of them
still worked, which is the point: they cost a second page load and a flash to
reach a page one click away, and nothing anywhere went red.

`/unit/N` is in the same list and has been since August — it is a redirect stub
too, so `drillExitHref` returning `/unit/N` was a forward to a forward.

So this check now holds BOTH addresses. The shapes are identical because the
failure is identical: a destination written once, correct, that outlived the
page it named.

Break-tested: putting `exitHref = "/"` back in PageBand.tsx, or `href: "/map"`
back in siteTabs.ts, goes red naming the file, the line and the text.

Run from the repo root:  python3 verify/verify210-home-href.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

# The two files that ARE the door, plus the module that names the address.
ALLOW = {
    "src/app/page.tsx",
    "src/app/welcome/WelcomeRedirect.tsx",
    "src/lib/routes.ts",
}

# The same courtesy for the map's old address. Each of these NAMES `/map`
# rather than linking to it, and each would be wrong to rewrite:
#   · the redirect stub and its page are the thing itself;
#   · swipeRail asks "is the learner standing here?", which must still say yes
#     for the moment before the forward fires — the same comparison exemption
#     `if (path === "/")` gets above;
#   · labels.ts labels page-view rows already recorded under the old address;
#   · the teacher fixture is demo data, not navigation.
ALLOW_MAP = {
    "src/app/map/page.tsx",
    "src/app/map/MapRedirect.tsx",
    "src/app/map/standalone/page.tsx",
    "src/lib/swipeRail.ts",
    "src/lib/labels.ts",
    "src/app/teacher/fixture.ts",
}

# A destination, not a comparison. Each of these was a real site on 11 Sep.
SHAPES = [
    (re.compile(r'\b\w*[Hh]ref\s*=\s*"/"'), 'a prop default of "/" — e.g. `exitHref = "/"`'),
    (re.compile(r'\bfallback\s*=\s*"/"'), 'a fallback of "/"'),
    (re.compile(r'\?\?\s*"/"'), 'a `?? "/"` fallback'),
    (re.compile(r'\bhref:\s*"/"'), 'an `href: "/"` in a tab or registry row'),
    (re.compile(r'\bhref="/"'), 'an `href="/"` on a link'),
    (re.compile(r'router\.(?:push|replace)\("/"\)'), 'a router push to "/"'),
]

# The map's old address, in the same shapes. `/map/standalone` and `/map/embed`
# are NOT this — the bare route is what forwards, so the patterns all end the
# path at a quote, a query or a hash.
MAP_TAIL = r'(?:["\'`?#])'
MAP_SHAPES = [
    (re.compile(r'\b\w*[Hh]ref\s*=\s*["\'`]/map' + MAP_TAIL), 'a prop default of "/map"'),
    (re.compile(r'\?\?\s*["\'`]/map' + MAP_TAIL), 'a `?? "/map"` fallback'),
    (re.compile(r'\b[Hh]ref:\s*["\'`]/map' + MAP_TAIL), 'an `href: "/map"` in a tab or registry row'),
    (re.compile(r'\bhref=\{?["\'`]/map' + MAP_TAIL), 'an `href="/map"` on a link'),
    (re.compile(r'router\.(?:push|replace)\(\s*[`"\']/map' + MAP_TAIL), 'a router push to "/map"'),
    (re.compile(r'window\.open\(\s*[`"\']/map' + MAP_TAIL), 'a window.open on "/map"'),
    # /unit/N has been a redirect stub since August — same fault, older.
    (re.compile(r'\b\w*[Hh]ref\s*=\s*[`"\']/unit/'), 'a prop default of "/unit/N", which only forwards'),
    (re.compile(r'\?\?\s*[`"\']/unit/'), 'a `?? "/unit/N"` fallback, which only forwards'),
]

bad = []
for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, "src")):
    dirnames[:] = [d for d in dirnames if d not in {"node_modules", ".next"}]
    for name in filenames:
        if not name.endswith((".ts", ".tsx")):
            continue
        full = os.path.join(dirpath, name)
        rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
        if rel in ALLOW:
            continue
        for n, line in enumerate(open(full, encoding="utf-8"), 1):
            # A comment explaining the rule must not trip the rule — the same
            # trap verify152 and verify153 each hit on their first run.
            if line.lstrip().startswith(("//", "*", "/*")):
                continue
            for pat, what in SHAPES:
                if pat.search(line):
                    bad.append(f"{rel}:{n} — {what}: {line.strip()[:90]}")
            if rel not in ALLOW_MAP:
                for pat, what in MAP_SHAPES:
                    if pat.search(line):
                        bad.append(f"{rel}:{n} — {what}: {line.strip()[:90]}")

if bad:
    print(f"  FAIL {len(bad)} link(s) naming an address that no longer means what they meant:\n")
    for b in bad:
        print(f"       {b}")
    # Only explain the half that actually fired — a report that recites both
    # rules every time makes the reader hunt for which one they broke.
    if any('"/"' in b for b in bad):
        print('\n  "/" is the welcome page now, not Home. A link left pointing at it still')
        print("  resolves — the learner simply lands on the front door instead of their")
        print("  own page, which is what Dan reported on 11 Sep: \"Closing each of the")
        print("  pages is not supposed to jump to the Enter page.\"")
    if any("/map" in b or "/unit/" in b for b in bad):
        print("\n  \"/map\" and \"/unit/N\" are redirect stubs — Home draws the map itself.")
        print("  A link to either still resolves, after a second page load and a flash.")
    print("\n  Use HOME_HREF from src/lib/routes.ts (with ?unit=N for a unit).")
    sys.exit(1)

print("  ok   no bare \"/\" is used as a Home link or default")
print("  ok   the door's own two files still say \"/\", because they are the door")
print("  ok   no live link names \"/map\" or \"/unit/N\", which only forward")
print("\nverify210: Home has one address — the root is not it, and neither is /map.")
