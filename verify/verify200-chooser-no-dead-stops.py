#!/usr/bin/env python3
"""
The stop chooser never offers a goal that goes nowhere.

***Dan, 2026-09-11: "just don't allow anyone to land on 'there is nothing
here'".***

WHAT THIS IS ANSWERING. The activity pop-up used to be a 1-to-50 slider with
no list of decks and no gate: it built a URL from `SIOS[stop-1].collectionId`
for every activity. Driven on the built export, from the ☰, pressing Confirm
on the stop the picker OPENS ON:

    ComposeIt      0 of 50 stops led to a page that exists
    VocabulaRain  28 of 50
    the other four 50 of 50

and worse, "the page exists" is not the same question as "the game can play
it". Measured against each activity's own gate:

    MémoiRecall   50/50      GramMarathon  27/50   <- page exists, opens EMPTY
    WorDrill      50/50      LexicaLocker  31/50   <- likewise
    VocabulaRain  33/50      ComposeIt     12/50

Across the six the slider offered 300 choices and 97 went nowhere, in two
different ways: a 404, or a page that loads with nothing in it. The second is
the one a 404-scan misses, and it is the shape `lib/collections/gapSentence.ts`
records as this repo's most expensive recurring bug — the gate said yes and the
game found nothing.

WHAT IS CHECKED, AND WHY IT IS CHECKED AGAINST THE BUILD. `playableStops()` and
`stopHref()` are the one source both the chooser and the router read, so a
source-reading check would only prove the file agrees with itself. This walks
every activity x every stop it offers, resolves the href, and asserts the
EXPORTED page is on disk. A gate that passes while the page 404s is the same
bug wearing a different coat — that is exactly how `modaux-plans` would have
slipped through, resolving through a set alias that `generateStaticParams`
never exported.

COST, STATED PLAINLY: this check runs `npm run build` once itself, to render a
throwaway page that calls the very functions the pop-up calls. That is roughly
a minute in CI. The alternative is a Python re-implementation of six activities'
readiness rules, which is precisely the "second opinion" that gapSentence.ts was
written to stop. The probe route is deleted from out/ afterwards so the rest of
the sweep sees the export the real build produced.

It needs `out/`:  NEXT_PUBLIC_OPEN_APP=1 npm run build
Run from the repo root: python3 verify/verify200-chooser-no-dead-stops.py
"""
import json, os, re, subprocess, sys, tempfile

OK, FAIL = [], []
def ok(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)
if not os.path.isdir("out"):
    print("  FAIL  out/ is missing — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

KEYS = ["flip", "grammarathon", "wordrill", "lexicalator", "vocabularain", "compose"]

# ---- 1 · the chooser and the router read ONE source ---------------------------

picker = open("src/components/ActivityGoalPicker.tsx", encoding="utf-8").read()
code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", picker)
code = re.sub(r"(?m)^\s*//.*$", "", code)

ok("playableStops(" in code and "stopHref(" in code,
   "the pop-up gates and routes through lib/activityStops",
   "the pop-up no longer calls playableStops/stopHref — it is back to building "
   "its own URLs, which is what offered 97 dead choices")

ok("type=\"range\"" not in code and "fluo-goal-slider" not in code,
   "the 1-to-50 slider is gone",
   "the slider is back — it offers every stop whether the activity has one or not")

ok("SIO_HREF" not in code,
   "the old ungated route table is gone",
   "SIO_HREF is back; it could not say whether a deck was playable")

# ---- 2 · every offered stop resolves to a page that was really exported -------
# Ask the app itself, through a throwaway page, so this uses the SAME functions
# the pop-up uses rather than a Python re-implementation of them.

# NOT an underscore-prefixed name: Next treats `_foo` as a private folder and
# does not route it, so the page builds and no HTML is ever emitted — which
# reads exactly like a build failure. Cost ten minutes the first time.
probe = "src/app/verify200-probe"
os.makedirs(probe, exist_ok=True)
open(os.path.join(probe, "page.tsx"), "w", encoding="utf-8").write("""
import { playableStops, stopHref } from "@/lib/activityStops";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { gappedItems } from "@/lib/collections/gramMarathonReady";
import { lexReadyItems } from "@/lib/collections/lexReady";
import { letrisSlugForDeck, getLetrisSet } from "@/games/letris/sets";
import { composeBanksForDeck } from "@/games/compose/banks";

const KEYS = ["flip","grammarathon","wordrill","lexicalator","vocabularain","compose"] as const;

/** HOW MANY THINGS WOULD THE GAME ACTUALLY HAVE TO PLAY at this stop, counted
 *  with the activity's OWN item function — deliberately a different function
 *  from the gate, so a check built on this catches a gate that has been
 *  removed or loosened. "The page exists" cannot catch that: GramMarathon and
 *  LexicaLocker export a page for all fifty and open empty. */
function playableItems(key: string, stop: number): number {
  const deck = SIOS[stop - 1]?.collectionId ?? "";
  const c = CURATED.find((x) => x.id === deck);
  if (key === "grammarathon") return c ? gappedItems(c).length : 0;
  if (key === "lexicalator") return c ? lexReadyItems(c).length : 0;
  if (key === "flip" || key === "wordrill") return c ? c.items.length : 0;
  if (key === "vocabularain") {
    const slug = letrisSlugForDeck(deck);
    return slug ? (getLetrisSet(slug)?.tiles.length ?? 0) : 0;
  }
  if (key === "compose") return composeBanksForDeck(deck).length;
  return 0;
}

export default function P() {
  const out: Record<string, { stop: number; href: string | null; items: number }[]> = {};
  for (const k of KEYS) {
    out[k] = playableStops(k).map((n) => ({ stop: n, href: stopHref(k, n), items: playableItems(k, n) }));
  }
  return <pre id="d">{JSON.stringify(out)}</pre>;
}
""")

try:
    env = dict(os.environ, NEXT_PUBLIC_OPEN_APP="1")
    r = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, env=env)
    built = r.returncode == 0 and os.path.isfile("out/verify200-probe.html")
    data = {}
    if built:
        html = open("out/verify200-probe.html", encoding="utf-8").read()
        m = re.search(r'id="d"[^>]*>(.*?)</pre>', html, re.S)
        if m:
            import html as H
            data = json.loads(H.unescape(re.sub(r"<[^>]+>", "", m.group(1))))
finally:
    import shutil
    shutil.rmtree(probe, ignore_errors=True)
    # Leave out/ exactly as the real build left it — later checks in the CI
    # run scan this directory, and a stray route of ours is not their business.
    for leftover in ("out/verify200-probe.html", "out/verify200-probe.txt"):
        if os.path.isfile(leftover):
            os.remove(leftover)

ok(bool(data), "the probe build produced the chooser's own offer list",
   "could not build the probe page — cannot verify the offers against the export")

if data:
    total, dead, empty = 0, [], []
    for key in KEYS:
        rows = data.get(key) or []
        ok(len(rows) > 0, f"{key}: offers {len(rows)} stop(s)",
           f"{key}: offers NOTHING — every stop was gated out, which is a bug in the gate")
        for row in rows:
            total += 1
            h, n = row.get("href"), row.get("items", 0)
            if not h:
                dead.append(f"{key}: stop {row.get('stop')} offered with a null href"); continue
            # (a) the page was really exported — catches a URL in the wrong namespace
            if not os.path.isfile("out" + h + ".html"):
                dead.append(f"{key}: {h} is offered but out{h}.html was never exported")
            # (b) AND the game has something to play there — catches the silent
            #     kind, where the page exists and opens empty. Counted with the
            #     activity's own item function, not its gate, so a removed gate
            #     shows up here. Found by break-testing this very check: with
            #     only (a), deleting GramMarathon's readiness test still passed.
            if n <= 0:
                empty.append(f"{key}: stop {row.get('stop')} ({h}) is offered but the game has 0 items there")
    ok(not dead,
       f"all {total} offered stops resolve to a page that exists",
       "OFFERED BUT MISSING — " + "; ".join(dead[:5]) + (f" (+{len(dead)-5} more)" if len(dead) > 5 else ""))
    ok(not empty,
       f"all {total} offered stops have something for the game to play",
       "OFFERED BUT EMPTY — " + "; ".join(empty[:5]) + (f" (+{len(empty)-5} more)" if len(empty) > 5 else ""))

# ---- 3 · ÉcouTexte does not ask a question it cannot use ---------------------

grid = open("src/components/MenuGrid.tsx", encoding="utf-8").read()
gcode = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", grid)
gcode = re.sub(r"(?m)^\s*//.*$", "", gcode)
ok('sioKey: "ecoutexte"' not in gcode,
   "ÉcouTexte opens straight to its topic picker — no question it would discard",
   "ÉcouTexte is a chooser tile again; it has no per-stop route, so the pop-up "
   "takes an answer it cannot use")

print("\n".join("  ok    " + s for s in OK))
if FAIL: print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
