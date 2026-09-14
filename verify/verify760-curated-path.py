#!/usr/bin/env python3
"""THE CURATED PATH — every step lands somewhere, and the walk cannot stall.

Dan, 2026-09-14: *"what i would really need now is a 'curated path'
automatically driving the sequence of activities on FluOLinGo — essential,
optional etc"*.

A path is a list of doors the app pushes a learner through. Almost everything
that can go wrong with one is INVISIBLE on screen: a step pointing at a route
that no longer exists looks like a button, a duplicated step id looks like two
steps, and a push wired behind the usher's null-guard looks like a push right
up until the learner reaches the one screen that needed it. Hence each clause.

 1 · EVERY LITERAL ADDRESS IS A PAGE THAT WAS BUILT. A path step is a promise
     that the door opens. `/games/compose/remettre-negation-pas` existed the
     day it was written; a rename, a retired bank, or a route turned into a
     forward would leave the path sending learners to a 404 with nothing in
     the diff to notice. Checked against `out/`, which is what actually ships.

 2 · A STEP ID IS UNIQUE. The run records FINISHED STEP IDS, so two steps
     sharing one id tick together: a learner does step 2 and step 9 goes green
     with it, and the path reports itself complete a step early. Nothing on
     screen says so.

 3 · NO TWO ESSENTIAL STEPS DO THE SAME JOB. This is the rule the list was
     built on — Dan's own test for whether it is *"sufficient and not
     excessive"* — and the `does` line is where each step states its job. Two
     matching `does` lines mean one of them is paying minutes for a mechanic
     already covered, which is exactly what got the per-goal GramMarathon runs
     cut. A rule nobody can check is a rule that lasts one session.

 4 · THE PUSH IS DRAWN OUTSIDE THE USHER'S NULL-GUARD. `ActivityUsher` returns
     early when it has no compass to draw, and TWO path steps hand it exactly
     that — SpecuLearn's recap and ÉcouTexte. Draw the push after that guard
     and the path silently stops on those screens only. This is the single
     easiest way to break the feature while every test still passes, so it is
     pinned by shape: the push must be reached before the early return.

 5 · A STEP IS ONLY TICKED WHERE THE LEARNER ACTUALLY IS. `markDone` must be
     gated on an address match (`stepAtPlace`). Ungated — "the usher drew, so
     tick the next step" — the path would race ahead one step every time a
     learner finished ANY activity, including one that is not on it.

 6 · THE OPTIONAL TIER IS FOLDED, AND ITS FOLD CARRIES A COUNT. Both halves of
     the collapse rule (31 Aug): native `<details>`, and a summary that says
     what is behind it, because *"a collapsed section with no count is a
     section nobody opens, which is just deletion with extra steps"*.

Run from the repo root:  python3 verify/verify760-curated-path.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(p):
    """The file with its comments stripped — a check must read what RUNS, never
    what a comment says about what runs (the trap verify700 and verify560 both
    fell into first time)."""
    s = read(p)
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    return re.sub(r"(?m)^\s*//.*$", "", s)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

src = read("src/content/paths.ts")
ok(bool(src), "src/content/paths.ts is present", "src/content/paths.ts is missing")

# Split the two tiers so clause 3 can tell them apart.
def tier(name):
    m = re.search(rf"{name}:\s*\[(.*?)\n  \],", src, re.S)
    return m.group(1) if m else ""


ESSENTIAL, OPTIONAL = tier("essential"), tier("optional")
ok(bool(ESSENTIAL) and bool(OPTIONAL),
   "both tiers parsed out of paths.ts",
   "could not read the tiers — re-point this parse rather than letting every "
   "clause below pass over an empty list.")

# A STEP MAY OPEN WITH A COMMENT, and for an afternoon this parse said it may
# not. The pattern used to demand `id:` on the line straight after `{`, so the
# two steps promoted out of the optional fold on 14 Sep — each carrying a
# comment saying WHY it was promoted — were simply not seen: the check read 19
# of 21 steps and passed, having never looked at two of them. That is the
# failure this file was written to prevent, committed by the file itself.
#
# So the pattern now skips a leading comment, AND the count is cross-checked
# against a plain tally of `id:` lines below — a parse that silently drops a
# step now fails instead of shrinking.
# ANCHORED ON THE INDENTATION, which is what actually distinguishes a step from
# the object that holds it. A loose `\{\s*…id:` also matched `const MIDTERM = {
# id: "midterm"` and then swallowed whole runs of real steps inside one match —
# the first attempt at this fix read ELEVEN of twenty-one and looked fine.
STEP = (r"\n    \{\n"                                   # a step opens at 4 spaces
        r"(?:[^\S\n]*(?:/\*[\s\S]*?\*/|//[^\n]*)\n)*"   # …optionally a comment
        r"[^\S\n]*id:\s*\"([^\"]+)\",([\s\S]*?)\n    \}")
steps = re.findall(STEP, src, re.S)
declared = len(re.findall(r"^\s{6}id:\s*\"", ESSENTIAL + OPTIONAL, re.M))
ok(len(steps) >= 10 and len(steps) == declared,
   f"{len(steps)} path steps read from the module (all {declared} declared)",
   f"parsed {len(steps)} steps but {declared} are declared in the two tiers. "
   "The parse is dropping steps, which means every clause below is silently "
   "skipping them too. Fix STEP, never the data.")

# ── 1 · every literal address is a page that was built ──────────────────────
hrefs = re.findall(r'href:\s*"(/[^"]*)"', src)
ok(bool(hrefs), f"{len(hrefs)} literal addresses to resolve",
   "no literal addresses found — re-point this parse.")

if not os.path.isdir("out"):
    FAIL.append("`out/` is missing, so no address could be resolved. CI builds "
                "before running the checks; locally, run "
                "`NEXT_PUBLIC_OPEN_APP=1 npm run build` first. Passing without "
                "resolving would be the check lying about the thing it exists "
                "to hold.")
else:
    dead = []
    for h in sorted(set(hrefs)):
        # A step may carry a query that SCOPES it — `?upto=30` on the Finale,
        # `?v=…` on ConjugaZone. The page is the part before the `?`.
        rel = h.split("?")[0].lstrip("/")
        if not (os.path.isfile(f"out/{rel}.html") or os.path.isfile(f"out/{rel}/index.html")):
            dead.append(h)
    ok(not dead,
       f"every path step's address is a built page ({len(set(hrefs))} addresses)",
       "THE PATH SENDS LEARNERS TO A PAGE THAT DOES NOT EXIST: " + ", ".join(dead) +
       ". A step is a promise that the door opens; a renamed route or a retired "
       "bank leaves a button that 404s and nothing in the diff to notice.")

# ── 2 · a step id is unique ─────────────────────────────────────────────────
ids = [i for i, _ in steps]
dupes = sorted({i for i in ids if ids.count(i) > 1})
ok(not dupes,
   f"every step id is unique ({len(ids)} steps)",
   f"TWO STEPS SHARE AN ID: {dupes}. The run records finished step IDS, so "
   "these tick together — a learner finishes one and the other goes green with "
   "it, and the path reports itself complete early.")

# ── 3 · no two essential steps do the same job ──────────────────────────────
# A GROUP IS ONE STEP, which is the whole reason `group` exists: MémoiRecall at
# goals 16, 22 and 24 is three DOORS but one job, and the screen numbers it
# once. Comparing raw entries flagged exactly that and was wrong to — the first
# run of this check caught it. So compare one `does` per group.
blocks = [b for _, b in re.findall(STEP, ESSENTIAL, re.S)]
does_e, seen_groups = [], set()
for b in blocks:
    d = re.search(r'does:\s*"([^"]+)"', b)
    if not d:
        continue
    g = re.search(r'group:\s*"([^"]+)"', b)
    if g:
        if g.group(1) in seen_groups:
            continue  # a later door of a group already counted
        seen_groups.add(g.group(1))
    does_e.append(d.group(1))
seen, same = set(), []
for d in does_e:
    if d in seen:
        same.append(d)
    seen.add(d)
ok(not same,
   f"no two essential steps claim the same job ({len(does_e)} steps, groups folded)",
   "TWO ESSENTIAL STEPS DO THE SAME JOB, which is the one test this list was "
   f"built on — Dan's « sufficient and not excessive »: {same}. Either they are "
   "genuinely one step, or one belongs on the optional tier the way the "
   "per-goal GramMarathon runs did.")

# ── 4 · the push is drawn outside the usher's null-guard ────────────────────
usher = code("src/components/ActivityUsher.tsx")
ok("<PathNext" in usher,
   "the usher row draws the path's push, so it reaches every activity at once",
   "ActivityUsher no longer renders PathNext. That component is the ONLY place "
   "the push is wired; without it no end screen in the app moves a learner on.")
# THE ELEMENT, NOT THE NAME. The first draft looked for "PathNext" and found
# the IMPORT, which sits at the top of the file and is therefore always before
# the guard — so the clause passed on a file with the fault deliberately
# reintroduced. It is measuring the rendered element now, which is the thing
# the sentence below actually claims.
rendered = usher.find("<PathNext")
guard = re.search(r"if\s*\(\s*!usher\s*\)\s*return", usher)
ok(rendered >= 0 and guard is not None and rendered < guard.start(),
   "the push is reached BEFORE the `if (!usher) return` early exit",
   "THE PUSH IS BEHIND THE USHER'S NULL-GUARD. Two path steps hand "
   "ActivityUsher a null usher — SpecuLearn's recap and ÉcouTexte — so the "
   "path would stop dead on exactly those screens and nowhere else. The "
   "feature looks fine everywhere it is tested.")

# ── 5 · a step is only ticked where the learner actually is ─────────────────
nxt = code("src/components/PathNext.tsx")
ok("stepAtPlace" in nxt and "markDone" in nxt,
   "the push ticks a step only where the address matches (stepAtPlace)",
   "markDone is no longer gated on stepAtPlace. Ungated, the path advances "
   "every time a learner finishes ANY activity — including ones not on it.")
run = code("src/lib/pathRun.ts")
ok(re.search(r"replace\(\s*/\\/embed", run) or "/embed" in run,
   "the address comparison strips the frame's `/embed` suffix",
   "THE `/embed` STRIP IS GONE. Every station runs in an iframe, so the "
   "pathname when the usher mounts ends in /embed and would never match a "
   "step's address — the path would simply never advance, anywhere.")
ok("!run.done.includes(s.id)" in run,
   "a match skips steps already done (ErroReview is two steps at one door)",
   "stepAtPlace no longer skips finished steps. ErroReview is step 2 AND step "
   "9 at the same address, so finishing it on day two would re-tick day one "
   "and leave the path permanently one step short.")

# ── 7 · EVERY ESSENTIAL STEP HAS A SCREEN THAT CAN TICK IT ──────────────────
# THE BUG THIS CLAUSE EXISTS FOR, found by walking the path in the built app
# with all fourteen other clauses green: the push rides `ActivityUsher`, which
# reaches most drills — but the usher's compass is computed from a STOP, and
# TWO of the essential steps belong to no stop at all. ErroReview (steps 2 and
# 9) and ConjugaZone (step 6) therefore drew NOTHING, so the walk reached step
# 2 and stopped there forever. The map page was perfect. Every id was unique.
# Every address resolved. And the feature did not work.
#
# THE MAP BELOW IS HAND-WRITTEN, AND THAT IS THE POINT, not a shortcut: a new
# essential step whose address is not listed FAILS, so nobody can add a step
# without stating which screen ends it. That is `verify105`'s shape — name the
# surfaces one by one — chosen for the same reason: a clever sweep here would
# have to follow every component's render tree and would quietly answer "yes"
# for a screen that renders a usher it was never given.
ENDS = {
    "/practice/grammarathon/finale": "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx",
    "/reviser": "src/app/reviser/embed/page.tsx",
    "/conjugaison": "src/app/conjugaison/embed/page.tsx",
    "/games/compose/remettre-negation-pas": "src/components/GameOver.tsx",
    "/games/compose/remettre-aller-destinations": "src/components/GameOver.tsx",
    "/games/compose/presenter-personne": "src/components/GameOver.tsx",
    "/practice/ecoutexte/quand-time": "src/app/practice/ecoutexte/EcouTexte.tsx",
    # NumBus ends in GameOver, like the compose games. The step is addressed to
    # /games/numbus and NOT to /games/numbers, which is only the two-game
    # chooser: a learner who starts there finishes at /games/numbus, so a step
    # pointed at the chooser would never match and never tick.
    "/games/numbus": "src/components/GameOver.tsx",
    # Every MneMemo lesson runs in LessonPager, which is a DrillShell — and
    # DrillShell draws ActivityUsher, which returns the push BEFORE its own
    # null-guard. A lesson belongs to no stop-chain of its own, so that
    # ordering is the whole reason these three can tick at all.
    "/lessons/quel-prefere": "src/components/DrillShell.tsx",
    "/lessons/negation": "src/components/DrillShell.tsx",
    "/lessons/articles-pays": "src/components/DrillShell.tsx",
}
# The goal-scoped steps (MémoiRecall, WorDrill) end in their own content
# components, which draw the usher and therefore the push.
GOAL_SCOPED_ENDS = [
    "src/app/practice/flip-it/[collectionId]/FlipItContent.tsx",
    "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
]
ess_hrefs = sorted({h.split("?")[0] for h in re.findall(r'href:\s*"(/[^"]*)"', ESSENTIAL)})
unmapped = [h for h in ess_hrefs if h not in ENDS]
ok(not unmapped,
   f"every literal essential step names the screen that ends it ({len(ess_hrefs)})",
   f"THESE ESSENTIAL STEPS HAVE NO END SCREEN NAMED: {unmapped}. Add each to "
   "ENDS in this check with the file that draws its end, so the clause below "
   "can confirm the path can actually tick it. A step whose screen draws no "
   "push stalls the walk there permanently, and nothing on any other screen "
   "looks wrong.")
mute = []
for h in ess_hrefs:
    f = ENDS.get(h)
    if not f:
        continue
    body = code(f)
    if "<PathNext" not in body and "<ActivityUsher" not in body:
        mute.append(f"{h} → {f}")
for f in GOAL_SCOPED_ENDS:
    body = code(f)
    if "<PathNext" not in body and "<ActivityUsher" not in body:
        mute.append(f"(goal-scoped) → {f}")
ok(not mute,
   f"every essential step ends on a screen that draws the push "
   f"({len(ess_hrefs) + len(GOAL_SCOPED_ENDS)} screens)",
   "THE PATH WILL STALL HERE: " + "; ".join(mute) + ". That screen draws "
   "neither the usher nor the push, so the step it ends can never tick and "
   "the learner's walk stops on it for good. ErroReview and ConjugaZone were "
   "exactly this on 14 Sep — they belong to no stop, so the usher's compass "
   "has nothing to compute and they must render <PathNext /> directly.")

# ── 6 · the optional tier is folded, and the fold carries a count ───────────
page = read("src/app/path/embed/page.tsx")
ok("<details" in page and "<summary" in page,
   "the optional tier uses native <details>/<summary>",
   "the optional tier is not folded with native <details>. The collapse rule "
   "(31 Aug) asks for it by name: keyboard and screen-reader support come "
   "free, it needs no state, and it survives having no JavaScript.")
summary = re.search(r"<summary[\s\S]{0,400}?</summary>", page)
ok(bool(summary) and re.search(r"\{[^}]*length[^}]*\}|\{minutesOf", summary.group(0) if summary else ""),
   "the closed fold says what is behind it (a count, not a bare chevron)",
   "the optional fold carries no count. « a collapsed section with no count is "
   "a section nobody opens, which is just deletion with extra steps ».")

# ── 8 · NOTHING ON THE PATH REACHES PAST THE TEST ───────────────────────────
# Dan, 2026-09-14, looking at the built path: *"the curated exercises are not
# at all adapted for the first test covering stops 1 to 30"*, then *"Stops 0 to
# 30 only please"*.
#
# THREE DIFFERENT WAYS A STEP ESCAPED THE TEST, and only one of them was
# visible in the step list:
#
#   a GOAL above 30        « MneMemo — asking a question » was goal 34, unit 3.
#                          The only one you could see by reading paths.ts.
#   an UNSCOPED BANK       the Finale draws from FINALE_BANK, 437 items, of
#                          which 201 (46%) are stops 31–50. The step LOOKED
#                          fine — one href, no goal — and put about eleven of
#                          twenty-five questions outside the test, then fed
#                          those misses to ErroReview as the revision queue.
#   an UNSCOPED PICKER     `/practice/ecoutexte` and `/conjugaison` open on a
#                          chooser covering all five units and all 67 verbs.
#                          The step's own text named six verbs it never picked.
#
# So this clause checks the goal numbers AND that the three wide doors carry
# the query that narrows them. A bare `/practice/grammarathon/finale` on this
# path is the 46% bug, silently, again.
STOP_MAX = 30
# The eighteen stops Dan named on 14 Sep after auditing the real Test 1 paper.
# Held here as well as in content/finale.ts so a silent edit to either fails.
EXPECT_STOPS = [1, 4, 7, 9, 14, 15, 16, 17, 18, 19, 22, 23, 24, 26, 27, 28, 29]
goals = [(sid, int(m.group(1)))
         for sid, body in steps
         if (m := re.search(r"goal:\s*(\d+)", body))]
over = [f"{sid} → stop {n}" for sid, n in goals if n > STOP_MAX]
ok(not over,
   f"every goal-scoped step is inside stops 1–{STOP_MAX} ({len(goals)} steps)",
   f"THESE STEPS ARE OUTSIDE THE TEST: {over}. Stops 31–50 are units 3 and 4; "
   "the first test covers 1–30 only.")

NARROW = {
    # THE FINALE MUST CARRY NO `upto=` NOW, which inverts what this line said
    # an hour ago. `?upto=N` means "stops 1..N", and the Finale's own default
    # is the eighteen stops the paper asks about — so passing `upto=30` here
    # would WIDEN the draw back to thirty stops, twelve of which the test never
    # touches. The bare address is the scoped one.
    "/practice/grammarathon/finale": "",
    "/conjugaison": "v=",
    "/practice/ecoutexte": None,  # narrowed by taking a deck route, not a query
}
wide = []
for h in sorted(set(re.findall(r'href:\s*"(/[^"]*)"', src))):
    page, _, query = h.partition("?")
    need = NARROW.get(page)
    if need == "":
        # "" means: this door is narrow by DEFAULT and a query would widen it.
        if query:
            wide.append(f"{h} — carries ?{query}, which widens it back")
        continue
    if need is None and page in NARROW:
        wide.append(f"{h} — open the picker, every unit")
    elif need and need not in query:
        wide.append(f"{h} — needs ?{need}…")
ok(not wide,
   "every wide door on the path carries the query that narrows it",
   "A STEP OPENS A DOOR WIDER THAN THE TEST: " + "; ".join(wide) + ". The "
   "Finale unscoped is 437 items of which 201 are stops 31–50; "
   "/practice/ecoutexte and /conjugaison open choosers covering all five units "
   "and all 67 verbs.")

# ── 9 · THE FINALE'S OWN DEFAULT IS THE TEST, NOT THE COURSE ────────────────
# Clause 8 pins the query on the PATH's step. That is not enough and Dan paid
# for the difference: he opened /practice/grammarathon/finale directly — the
# ☰ menu and a bookmark reach it the same way — and met SIO-047 and SIO-049 on
# a paper he was revising for a test that stops at 30. He said so three times
# before it was heard.
#
# A DEFAULT THAT IS ONLY RIGHT THROUGH ONE DOOR IS NOT A DEFAULT. So the cap
# lives in the component: `DEFAULT_UPTO = 30`, and `?upto=50` is what asks for
# the whole course back. This clause pins that constant, because the tidy
# version of this design — "a path scopes itself, the activity stays whole" —
# is exactly what shipped the bug, and it will read as the right idea again.
fin = read("src/app/practice/grammarathon/finale/FinaleContent.tsx")
bank = read("src/content/finale.ts")
m = re.search(r"export const TESTED_STOPS[^=]*=\s*\[([^\]]*)\]", bank, re.S)
got = sorted(int(n) for n in re.findall(r"\d+", m.group(1))) if m else []
ok(got == EXPECT_STOPS,
   f"the Finale draws from the {len(EXPECT_STOPS)} stops the paper asks about",
   f"TESTED_STOPS is {got or 'missing'}, expected {EXPECT_STOPS}. Dan named these "
   "after auditing the real paper item by item (14 Sep). Changing the list is a "
   "content decision, not a refactor — twelve stops are deliberately absent and "
   "content/finale.ts says why for each one.")
ok("TESTED_STOPS" in fin and bool(re.search(r"upto == null", fin)),
   "and scopeOf uses that list whenever the address names no range",
   "scopeOf does not fall back to TESTED_STOPS. A null scope must mean the "
   "eighteen tested stops, never the whole course and never a bare 1..30 range "
   "— `drawDaily` floors ONE question per stop in range, so twelve of every "
   "fifty would be off-target by construction.")

print("\nthe curated path holds (14 Sep)\n" + "-" * 70)
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
