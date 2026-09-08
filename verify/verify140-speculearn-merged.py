#!/usr/bin/env python3
"""
One SpecuLearn per goal, one URL, and the run opens ON the first question.

Dan, 2026-09-07, over a screenshot of SIO-041 with two 💡 circled in red:

  *"the SIO page itself is now being separated from the SpecuLearn, there
   should no longer be any SIO at the start of SpecuLearn. it jumps into the
   first question, and the SpecuLearn is to be answered question by question.
   There are lessons with two speculearn, which must now be merged"*

and, when the two were put to him as different engines:

  *"it does not matter if they are different versions, but the combined pool
   between them consists only of MCQ, so they CAN be and MUST NOW BE MERGED AS
   ONE!"*

WHY THERE WERE TWO. Three engines grew separately and each kept its own door:
an authored pre-test (35 goals), a unit-0 bank (10), and a generated deck run
(9). Nine goals had two of them — colors, consignes, countries, languages,
objets-articles, lieux, transport, aliments, commerces — and after 6 Sep, when
the pre-test's 🧪 was unified with SpecuLearn's 💡, those nine printed the same
lightbulb twice. Nothing on either tile said which was which.

WHAT IS PINNED, and what each failure looks like on Dan's screen

  1  ONE DOOR. `deckActivityTabs` emits at most one SpecuLearn tab, and it is
     the merged address. Two `registryTab("speculearn", …)` calls, or one that
     names a deck or a pre-test id, and the two lightbulbs are back.
  2  THE ADDRESS IS WRITTEN ONCE. No surface types `/practice/speculearn/` by
     hand — every link comes from lib/speculearn/route.ts. This is the fault
     that made the swipe rail send a learner to the deck run while the goal
     card sent them to the merged one, on the same goal, in the same hour.
  3  THE OLD DOORS STILL ANSWER, AND SERVE THE MERGED RUN. The deck's address
     forwards; the pre-test's hosts the same pool the goal does; `/pretests/<id>`
     forwards as it always has. All three are on printed QR sheets — and an
     address that answers with HALF the run is worse than one that 404s, because
     nobody notices.
  4  THE POOL IS MCQ ONLY. `multi` questions are graded on the exact SET of
     picks, which is not multiple choice — Dan's own older rule, quoted in
     unit0-questions.ts: *"pre-tests should only involve MCQ"*. Pooling one
     would put a question in the run that the runner cannot grade.
  5  NOTHING PRECEDES QUESTION ONE. The feed's first row IS the first question.
     An intro row, a goal card or a "start" screen is exactly what Dan circled.
     The recap AFTER them is not that — a score belongs at the end.

  8  ONE RUNNER. The merged run is `PretestFeed`, mounted at both addresses.
     It was briefly built as a second runner beside it, which is the mistake
     verify117 names: *"two runners is how the app came to have four of them
     under one name"*.

  9  THE ENGLISH BEFORE THE PICK STAYS AUDITED, ITEM BY ITEM. `transFirst`
     shows a question's English translation BEFORE the learner answers. On some
     cards that is the whole question — « Elle est ___ » cannot choose between
     actrice and chanteuse without it. On others it hands the answer over —
     « Je ___ manger de la pizza » is decided by « Je » alone. Dan, 2026-09-08:
     *"so it is a case by case basis, that is what the audit is for, NOT a
     clean sweep modify-all-once lazy method, but meticulous check that only AI
     can help do"*. So this does NOT assert a rule about `transFirst`; it pins
     the RESULT of that audit — the 28 items it took the flag off, and the
     total that still carry it — so a later sweep in either direction shows up
     as a diff with a number on it rather than as silence.
     docs/audit2/ENGLISH_FIRST_AUDIT_2026-09-08.md is the reasoning, per item.
  6  THE BOOKMARK IS A HASH, SET WITH replaceState. `pushState` would make the
     Back button walk 63 questions backwards; a route per question would make
     it 63 pages.
  7  A PRE-TEST STILL PAYS NOTHING. Merging generated questions into a
     pre-test makes them part of the cold guess, not the other way round —
     verify40's rule, restated here because the merge is where it would break.

Run from the repo root:  python3 verify/verify140-speculearn-merged.py
"""
import glob
import json
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped.

    Every file here explains the merge at length, quoting Dan's instruction
    verbatim — so a raw scan would pass on the prose that describes the very
    thing being removed.
    """
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

ROUTE = "src/lib/speculearn/route.ts"
POOL = "src/lib/speculearn/pool.ts"
RUN = "src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx"
SHELL = "src/components/CahierShell.tsx"

route, pool, run, shell = (code(read(p)) for p in (ROUTE, POOL, RUN, SHELL))
ok(all([route, pool, run, shell]),
   "the merged route, pool, runner and shell are all present",
   "one of route.ts / pool.ts / SpeculearnRun.tsx / CahierShell.tsx is missing")

# ---- 1 · one door ---------------------------------------------------------
doors = re.findall(r'registryTab\(\s*"speculearn"\s*,\s*([^)]*)\)', shell)
ok(len(doors) == 1,
   "the goal card emits exactly one SpecuLearn tab",
   f"{len(doors)} SpecuLearn tabs are emitted — that is the two lightbulbs Dan circled")
ok(bool(doors) and "speculearnHref" in doors[0],
   "and it is the merged address, from the one function that knows it",
   f"the SpecuLearn tab is built from {doors[0] if doors else 'nothing'} rather than speculearnHref()")

ok(re.search(r"speculearnHref\(sioId:\s*string\):\s*string", route) is not None
   and "/practice/speculearn/goal/${sioId}" in route,
   "the merged address is keyed by the GOAL, so the 36 deckless goals can reach it",
   "speculearnHref() no longer takes a goal id — an address keyed on a deck cannot reach a goal without one")

# ---- 2 · the address is written once --------------------------------------
# The three files ALLOWED to write it: the one that defines it, and the two
# stubs whose whole job is to keep an old address answering.
STUBS = {
    ROUTE,
    "src/app/practice/speculearn/[collectionId]/page.tsx",
    "src/app/practice/speculearn/pretest/[id]/page.tsx",
    "src/app/pretests/[id]/page.tsx",
    "src/lib/pretests/routes.ts",
}
typed = []
for base, _dirs, files in os.walk("src"):
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        p = os.path.join(base, f).replace(os.sep, "/")
        if p in STUBS or "/speculearn/goal/" in p:
            continue
        body = code(read(p))
        # An href, not a prose mention: the string must sit in a template or a
        # quoted literal that is being used as a path.
        if re.search(r'["`]/practice/speculearn/[^"`\s]', body):
            typed.append(p)
ok(not typed,
   "no surface types a SpecuLearn address by hand — every link comes from route.ts",
   f"these type the address themselves and will drift from the merged one: {typed}")

# ---- 3 · the old doors still answer, with the merged run behind them -------
deck_stub = code(read("src/app/practice/speculearn/[collectionId]/page.tsx"))
ok("Forward" in deck_stub and "generateStaticParams" in deck_stub,
   "a deck's old SpecuLearn still builds, and forwards to the goal's",
   "/practice/speculearn/<deck> no longer forwards — QR sheets with that address stop working")

pre_stub = code(read("src/app/practice/speculearn/pretest/[id]/page.tsx"))
pre_embed = code(read("src/app/practice/speculearn/pretest/[id]/embed/page.tsx"))
ok("EmbedFrame" in pre_stub and "generateStaticParams" in pre_stub,
   "a pre-test's old address still builds and hosts its run",
   "/practice/speculearn/pretest/<id> no longer hosts — and verify117 owns the twin under it")
ok("stopForPretestId" in pre_embed and "PretestFeed" in pre_embed,
   "and what it hosts is the GOAL's pool, not the 7 authored questions alone",
   "the pre-test's old address serves its own items again — a QR sheet printed in week one "
   "would keep serving half the merged run, which nobody would notice")

old_pre = code(read("src/app/pretests/[id]/page.tsx"))
ok("Forward" in old_pre and "generateStaticParams" in old_pre,
   "the original /pretests/<id> still builds and forwards",
   "/pretests/<id> no longer forwards — the stub is why the fifty stop ids are frozen")

# ---- 8 · one runner -------------------------------------------------------
twins = []
for base, _dirs, files in os.walk("src/app/practice/speculearn"):
    for f in files:
        if f.endswith(".tsx") and "SnapFeed" in read(os.path.join(base, f)) and f != "PretestFeed.tsx":
            twins.append(os.path.join(base, f).replace(os.sep, "/"))
ok(not twins,
   "one runner drives the merged SpecuLearn, mounted at both addresses",
   f"a second SpecuLearn runner exists: {twins} — two runners is how the app came to have four "
   "of them under one name (verify117)")

# ---- 4 · the pool is MCQ only ---------------------------------------------
ok(re.search(r"if\s*\(\s*q\.multi\s*\)\s*return null", pool) is not None,
   "a multi-answer question is dropped rather than pooled — it is not multiple choice",
   "pool.ts pools `multi` questions, which are graded on the exact SET of picks and would reach a runner that cannot grade them")
ok(re.search(r"options:\s*\[\s*(it\.answer|right\.v|word\.w)", pool) is not None,
   "every pooled item carries its answer among its options",
   "an item is built whose options may not contain its answer — an unanswerable question")

# ---- 5 · nothing precedes question one ------------------------------------
feed = re.search(r"<SnapFeed\b[\s\S]*?>([\s\S]*?)</SnapFeed>", run)
ok(feed is not None, "the runner mounts one feed", "the merged runner no longer mounts a SnapFeed")
body = feed.group(1) if feed else ""
# The feed's children are the pool's map and NOTHING else. Counted by walking
# the braces rather than by matching indentation: an intro row placed at the
# same depth as the map is precisely the regression, so a check that keyed on
# indentation would be blind to the one shape it exists to catch.
inner = body.strip()
rest = ""
if inner.startswith("{"):
    d = 0
    for i, ch in enumerate(inner):
        d += (ch == "{") - (ch == "}")
        if d == 0:
            rest = inner[i + 1:].strip()
            break
# What may follow the questions is the recap and nothing else: a score belongs
# at the end of a run. What may PRECEDE them is nothing at all.
ok(inner.startswith("{rows.map("),
   "the feed's first row IS the first question — nothing sits before it",
   f"the feed opens with {inner[:70]!r} rather than the questions — that is the SIO card Dan circled")
ok(rest == "" or rest.startswith("<Recap"),
   "and the one row after them is the recap",
   f"a row besides the recap follows the questions: {rest[:70]!r}")

# ---- 6 · the bookmark is a hash, replaced not pushed ----------------------
ok("history.replaceState" in run and "pushState" not in run,
   "the question is a hash, written with replaceState — Back leaves the run, it does not walk it",
   "the runner pushes history per question — 63 questions become 63 Back steps")
ok(re.search(r"#q\(\\d\+\)|#q\$\{", run) is not None or re.search(r'`#q\$\{', run) is not None,
   "and that hash is `#qN`, which a learner can read and type",
   "the bookmark is no longer a readable #qN")

# ---- 7 · a pre-test still pays nothing ------------------------------------
banned = [w for w in ("recordItemResult", "queueForReview", "awardXp") if w in run]
ok(not banned,
   "the merged run pays no XP and schedules no review — it is still the cold guess",
   f"the merged runner calls {banned} — pooling generated questions into a pre-test made the pre-test count")

# ---- 9 · the English-before-the-pick audit holds --------------------------
AUDITED_OFF = [
    "u1-sio011/u1-sio011-02",
    "u1-sio017/u1-sio017-08",
    "u1-sio019/u1-sio019-01",
    "u2-sio027/u2-sio027-07",
    "u2-sio027/u2-sio027-08",
    "u3-l1-weather/05-il-fait-frais",
    "u3-l1-weather/12-quel-temps-fait-il",
    "u3-sio039/u3-sio039-02",
    "u4-sio041/u4-sio041-03",
    "u4-sio045/u4-sio045-03",
    "u4-sio046/u4-sio046-02",
    "u4-sio047-plans/u4-sio047-plans-01",
    "u4-sio047-plans/u4-sio047-plans-02",
    "u4-sio047-plans/u4-sio047-plans-03",
    "u4-sio047-plans/u4-sio047-plans-04",
    "u4-sio047-plans/u4-sio047-plans-07",
    "u4-sio047-plans/u4-sio047-plans-08",
    "u4-sio047-plans/u4-sio047-plans-09",
    "u4-sio047-plans/u4-sio047-plans-10",
    "u4-sio047-plans/u4-sio047-plans-11",
    "u4-sio047-plans/u4-sio047-plans-12",
    "u4-sio047/u4-sio047-11",
    "u4-sio047/u4-sio047-16",
    "u4-sio048-advice/u4-sio048-advice-06",
    "u4-sio048-advice/u4-sio048-advice-08",
    "u4-sio048-advice/u4-sio048-advice-09",
    "u4-sio048-advice/u4-sio048-advice-10",
    "u4-sio048-advice/u4-sio048-advice-11",
]
AUDIT_DOC = "docs/audit2/ENGLISH_FIRST_AUDIT_2026-09-08.md"
ok(os.path.isfile(AUDIT_DOC),
   "the per-item audit of the English-before-the-pick flag is written down",
   f"{AUDIT_DOC} is gone — the reasoning for 88 individual calls with it")

back, still = [], 0
for path in sorted(glob.glob("src/content/pretests/*.json")):
    pre = os.path.splitext(os.path.basename(path))[0]
    try:
        items = json.load(open(path, encoding="utf-8")).get("items", [])
    except Exception:
        items = []
    for it in items:
        if not it.get("transFirst"):
            continue
        still += 1
        if f"{pre}/{it.get('id')}" in AUDITED_OFF:
            back.append(f"{pre}/{it.get('id')}")
ok(not back,
   f"none of the {len(AUDITED_OFF)} items the audit cleared shows its English before the pick again",
   f"these were audited and cleared, and the flag is back on them: {back[:5]} — "
   f"see {AUDIT_DOC} for why each one came off")
# The ateliers' 34 are generated, so only the authored JSON is counted here.
ok(still == 26,
   f"{still} authored items still show their English first — the audit's own number",
   f"{still} authored items show their English first, not the 26 the audit left. "
   f"A sweep in either direction is the thing this number exists to catch; if the change "
   f"is deliberate, audit the new ones in {AUDIT_DOC} and move the number with them")

print("\n".join(f"  ok    {m}" for m in PASS))
if FAIL:
    print("\n".join(f"  FAIL  {m}" for m in FAIL))
print("-" * 70)
print(f"  all {len(PASS)} checks passed" if not FAIL else f"  {len(FAIL)} of {len(PASS) + len(FAIL)} FAILED")
sys.exit(1 if FAIL else 0)
