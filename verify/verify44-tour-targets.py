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
check(len(selectors) >= 6,
      f"{len(selectors)} tour steps name a target",
      f"only {len(selectors)} selectors found — has the tour shape changed?")

missing_hook, missing_id, missing_class = [], [], []
for sel in selectors:
    for hook in re.findall(r'\[data-tour="([^"]+)"\]', sel):
        if f'data-tour="{hook}"' not in SRC:
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

# ---- 4 · the lesson tour describes the CURRENT lesson ----------------------
lesson_tour = tour[tour.find('key: "lesson"'):]
lesson_tour = lesson_tour[: lesson_tour.find("};")] if "};" in lesson_tour else lesson_tour
for dead, why in (
    ("lf-pratique", "the LessonFlow anchor patch 22 deleted"),
    ("Générateur", "the LessonFlow generator section, gone since patch 22"),
    ("chips jump", "the LessonFlow part-chips, gone since patch 22"),
):
    check(dead not in lesson_tour,
          f"the lesson tour no longer mentions {dead!r}",
          f"the lesson tour still names {dead!r} — {why}")
check("data-tour" in lesson_tour,
      "the lesson tour anchors on data-tour hooks, not on utility classes",
      "the lesson tour uses styling classes as targets — a restyle unhooks it silently")

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
map_tour = tour[tour.find('key: "map"'):]
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
