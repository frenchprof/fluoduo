#!/usr/bin/env python3
"""
A tour step must point at something that exists (2026-08-28).

WHY THIS EXISTS. FirstTour is the "first time here?" walkthrough, and it had no
check of any kind — which is how the lesson tour came to describe a page that
had been deleted weeks earlier. It still said:

    "A lesson is one page: Lire → Pratique → Générateur. These chips jump
     between the parts."

and highlighted `#lf-pratique`. Patch 22 replaced LessonFlow with the one-card
pager; the anchor exists NOWHERE in the codebase. So the step highlighted
nothing and silently skipped — a tour that reports as present and does nothing,
the same shape as the ÉcouTexte band that rendered a 0x0 heading for four days.
It got worse on 2026-08-28, when lessons began opening on the ★/★★/★★★ chooser
the tour had never heard of.

Nothing here is clever. It resolves every selector a tour step names against
the source that would have to render it. That single question — "does this
target exist?" — is the one nobody asked for weeks.

What this asserts:

  1  Every `data-tour="…"` hook a step names is rendered somewhere in src/.
     Tours use these BECAUSE a utility class can be restyled away without
     anyone noticing the tour came unhooked; an explicit hook is a contract.
  2  Every `#id` a step names is rendered somewhere in src/. This is the one
     that would have caught #lf-pratique.
  3  Every class a step names appears in src/.
  4  The lesson tour does not describe the retired LessonFlow — no chips, no
     "Générateur", no #lf-pratique.
  5  The map has its own tour, or is explicitly acknowledged as not having
     one. /map is where the whole course lives; a first-time visitor landing
     there with nothing is a real gap, and it should be a decision rather
     than an oversight.

Run from the repo root:  python3 verify/verify44-tour-targets.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

TOUR = "src/components/FirstTour.tsx"
check(os.path.isfile(TOUR), "FirstTour present", f"MISSING {TOUR}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

tour = read(TOUR)

# Everything the app renders, in one blob — a target may live in any component.
SRC = []
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")) and os.path.join(root, f) != TOUR:
            SRC.append(read(os.path.join(root, f)))
SRC = "\n".join(SRC)

# Only the tour DEFINITIONS carry `selector:`; grab them all.
#
# The quote handling matters, and the first version got it wrong in exactly the
# way this file exists to catch. It used [^'"`]+ as the body, which stops at the
# FIRST quote of any kind — so a single-quoted selector containing double
# quotes, which is every data-tour hook:
#
#     { selector: '[data-tour="map-wake"]', ... }
#
# was captured as the fragment `[data-tour=`. That fragment contains no hook
# name, so the "does this hook exist?" loop found nothing to look up and passed
# vacuously. Proved by deleting data-tour="map-wake" from MapBody while the
# tour still pointed at it: the check stayed green. Match to the SAME quote.
selectors = re.findall(r"""selector:\s*(['"`])((?:(?!\1).)*)\1""", tour)
selectors = [body for _q, body in selectors]

# EVERY TOUR HAS A POINTING STEP — not "there are at least six selectors in the
# file" (2026-09-11).
#
# The floor used to be `>= 6`, a number sized to the shape the file happened to
# have on 28 Aug. It is the wrong question twice over. It passes a file where
# one tour carries six steps and three carry none, and it FAILS an honest
# change: retiring the lesson and unit tours — one for a page deleted three
# weeks earlier, one for a screen that had moved into a frame — took the count
# to four and turned this red for doing the right thing.
#
# What the floor was standing in for is "no tour is all prose", and that is
# answerable per tour. A tour with no selector at all is a sentence in a box:
# it is the end state of the silent-skip failure this whole file exists to
# catch, and it should fail by name rather than by arithmetic.
keys = re.findall(r'key: "(\w+)"', tour)
check(keys, "FirstTour defines at least one tour", "FirstTour defines no tours at all")
for k in keys:
    body = tour[tour.find(f'key: "{k}"'):]
    end = body.find("};")
    body = body[:end] if end != -1 else body
    n = len(re.findall(r"selector:", body))
    check(n >= 1,
          f'the "{k}" tour has {n} step(s) that point at something',
          f'the "{k}" tour names no selector at all — every step is prose, which is '
          f'what a tour looks like after its screen moves and its spotlights all skip')

# AN ANCHOR MAY BE CONDITIONAL, and a grep for the literal cannot see one.
#
# Home's map draws fifty stops and only the CURRENT one carries the tour's
# anchor, because lighting all fifty is not a spotlight:
#
#     data-tour={active ? "map-stop" : undefined}
#
# There is no `data-tour="map-stop"` anywhere in that file, so the literal
# search below reported the hook as missing while it renders correctly on
# screen. Both forms count: the attribute written out, and any string literal
# inside a `data-tour={…}` expression.
RENDERED = set(re.findall(r'data-tour="([^"]+)"', SRC))
for expr in re.findall(r"data-tour=\{([^}]*)\}", SRC):
    RENDERED.update(re.findall(r"""['"]([^'"]+)['"]""", expr))

missing_hook, missing_id, missing_class = [], [], []
for sel in selectors:
    for hook in re.findall(r'\[data-tour="([^"]+)"\]', sel):
        if hook not in RENDERED:
            missing_hook.append(f'{sel}  (no data-tour="{hook}" is rendered)')
    for ident in re.findall(r'#([A-Za-z][\w-]*)', sel):
        if f'id="{ident}"' not in SRC and f"id={{'{ident}'}}" not in SRC and f'id={{"{ident}"}}' not in SRC:
            missing_id.append(f'{sel}  (nothing renders id="{ident}")')
    for cls in re.findall(r'\.([A-Za-z][\w-]*)', sel):
        if cls not in SRC:
            missing_class.append(f"{sel}  (no element carries .{cls})")

check(not missing_hook,
      "every data-tour hook a step names is rendered",
      "a tour step points at a hook nothing renders: " + "; ".join(missing_hook))
check(not missing_id,
      "every #id a step names is rendered",
      "a tour step points at an id nothing renders — it will highlight nothing "
      "and silently skip: " + "; ".join(missing_id))
check(not missing_class,
      "every class a step names exists in the source",
      "a tour step points at a class nothing carries: " + "; ".join(missing_class))

# ---- 3b · no tour branch is unreachable ------------------------------------
# tourFor() is a chain of `if (path…) return`, so an earlier branch matching the
# same prefix makes a later one dead code. That happened the day this check was
# written: the Index was retired ("the map is the front door"), its tour was
# repointed from /activities to /map rather than deleted, and the /map tour
# added the same day matched first — so it was unreachable AND wrong, three of
# its four targets being nowhere on the map page.
#
# Nothing about that is visible in a diff, and section 1-3 above cannot see it:
# those selectors all exist SOMEWHERE in src, which is the weaker question this
# file can answer statically. Reachability it can answer exactly.
branch_paths = re.findall(r'if \((?:/\^?\\?/?([\w\\/^]+?)/?\\?/?\.test\(path\)|path\.startsWith\("([^"]+)"\))', tour)
# Normalise BOTH forms to the same shape before comparing. The two guard styles
# in this file yield different strings for the same route — a regex guard gives
# "map", a startsWith guard gives "/map" — and comparing them raw made the
# check blind to exactly the shadowing it was written for: "/map".startswith(
# "map") is False. Caught by injecting the dead branch and watching nothing
# fail, twice.
def norm(g: str) -> str:
    return g.replace("\\", "").lstrip("^/").rstrip("/")
guards = [norm(a or b) for a, b in branch_paths]
guards = [g for g in guards if g]
shadowed = []
for i, later in enumerate(guards):
    for earlier in guards[:i]:
        if later.startswith(earlier):
            shadowed.append(f"/{later} is never reached — /{earlier} matches first")
check(not shadowed,
      f"every tour branch is reachable ({len(guards)} path guards, none shadowed)",
      "a tour branch is dead code: " + "; ".join(shadowed))

# ---- 4 · NO tour anchors on something that can be restyled or reworded -----
#
# THIS WAS THE LESSON TOUR'S RULE AND IS NOW EVERY TOUR'S (2026-09-11), for two
# reasons — one of which is that the old form had quietly stopped testing
# anything at all.
#
# It read `lesson_tour = tour[tour.find('key: "lesson"'):]`. When the lesson
# tour was retired that find returned **-1**, so the slice was the file's LAST
# CHARACTER — and three assertions went on scanning a one-character string and
# passing. A check that reads its own subject's absence as a pass is the exact
# vacuous green this file's header describes catching in its own first version.
# The three dead-LessonFlow assertions are gone with the tour they policed:
# there is no lesson tour to mention « Générateur ».
#
# The surviving half is worth generalising rather than deleting. A tour hung
# off a styling class or a sentence of prose comes unhooked the next time
# either is edited, and NOTHING reports it — the step just skips. Both forms
# were live here until today:
#
#     main .grid.grid-cols-5 > button   a Tailwind grid; restyle it and it is gone
#     a[title^="Continue"]              the first word of a TOOLTIP
#
# So: every selector must name a `data-tour` hook. That is a contract a
# component cannot break by accident, and it is what the lesson tour was
# already being held to.
loose = [s for s in selectors if 'data-tour="' not in s]
check(not loose,
      f"all {len(selectors)} tour steps anchor on data-tour hooks",
      "a tour step anchors on something a restyle or a reword can remove, and the "
      "step will then skip in silence: " + "; ".join(loose))

# ---- 5 · the map has a tour -----------------------------------------------
# /map is what a stop-click opens (Home goes /?unit=1 -> /map?unit=1), and it
# had no tour: tourFor branched on "/", /unit/, /activities and /lessons/ only.
# Written 2026-08-28, so this is now an assertion rather than the "keep the gap
# visible" placeholder it started as.
check('key: "map"' in tour,
      "/map has its own tour — the screen the whole course lives on",
      "/map has no tour: a first-time visitor to the screen the whole course "
      "lives on is greeted with nothing")

# The step that earns the tour: the map is inert behind a transparent glass
# until tapped. That is deliberate — it stops a scroll dragging the map — and
# entirely invisible, so a learner who misses the small badge concludes the map
# is broken. REVERSED 2026-08-31: the wake glass itself is gone (Dan: "maybe
# we should remove the layer of transparent glass over it"), so the tour must
# no longer promise a wake tap that nothing needs — and the view toggle,
# now the map's front-and-centre control, is what the tour opens on.
# SLICE FROM A KEY THAT IS ACTUALLY THERE. `str.find` returns -1 when it is
# not, and `tour[-1:]` is the file's last character — which is how the lesson
# assertions above came to scan one byte and pass. The guard above already
# fails if the map tour is missing; this makes the slice honest rather than
# relying on that ordering.
_map_at = tour.find('key: "map"')
map_tour = tour[_map_at:] if _map_at != -1 else ""
map_tour = map_tour[: map_tour.find("};")] if "};" in map_tour else map_tour
check('data-tour="map-wake"' not in map_tour,
      "the map tour no longer points at the removed wake glass",
      "the map tour still tells learners to wake the map — the glass was "
      "removed on 31 Aug, so that step points at nothing")
check('data-tour="map-view"' in map_tour,
      "the map tour opens on the 2D/3D toggle",
      "the map tour lost its view-toggle step")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
