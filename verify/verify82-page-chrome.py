#!/usr/bin/env python3
"""
Every page wears the same chrome: a family spine, one heading band, its stop.

Dan, 2026-09-01, after going through the app screen by screen:

  "There are pages missing this colored vertical strip on the left in whatever
   colour it should be in. There are pages whose horizontal strips don't bleed
   to the edge (they should). There are pages where there is an identity crisis
   as to where the activity name should be placed (we want visual unity
   please). There are pages where there is no identity tag regarding which stop
   it belongs to."

Four complaints, and the first three turned out to be ONE fault wearing three
faces. A page's `active` key is turned into a family by `familyOf`; a null
family costs the page three things at once, because

  · the spine is `[class*="fam-"]`, so no class means no strip;
  · the family ink is the same class, so the page has no colour;
  · CahierShell renders its heading band `{famKey && …}`, so no class means no
    BAND either — and the page falls back to whatever bare <h1> its content
    happens to start with, at whatever height that lands.

Five keys were missing from SITE_FAMILY (`pretest`, `mcq`, `study`, `new`,
`deck`, `dice`) and one page passed `active=""`. Measured before the fix: five
different heading heights across the site and six pages with no strip.

The fourth complaint was separate and real: nothing anywhere said which of the
fifty stops the work belonged to.

WHAT IS PINNED, and why each would fail in silence

  1  EVERY `active` key the app passes resolves to a family, with NO exemption
     left. This is the check that matters — it fails on the NEXT page that
     forgets, which is how all six of these got in. Executed against the real
     `familyOf`, over the keys scraped out of the real source.
  2  THE SPINE NAMES BOTH SHELLS. The rule said `.cahier-page` alone and
     DrillShell's root is not one, so every drill in the app carried the right
     family class and drew no strip. A regression here is invisible in a diff
     and invisible on any CahierShell page.
  3  NO PAGE BORROWS A SIBLING'S NAME. `context[0]?.label` fired exactly when a
     page could not name itself, and the first context flap on every deck page
     is « Home » — so /decks/<curated>/mcq announced itself as Home.
  4  ONE STOP LOOKUP. `SIOS.find((s) => s.collectionId === …)` was written out
     twice before this and would have been three times; lib/stopTag.ts is the
     one place, for the same reason `gapSentence` is.
  5  THE STOP IS ON THE BAND, and it is the POSITION (39/50), not the id —
     `SIO-039` means nothing to a learner and Home already counts in stops.
  6  HOME'S STRIP PULLS BY EXACTLY THE WELL'S PADDING. Recomputed here from
     both classes rather than asserted twice: if the well is re-padded and the
     strip is not, it stops short of the paper again, which is complaint two.
  7  NO PAGE PRINTS ITS OWN NAME TWICE. Three pages had their <h1> replaced by
     the band; leaving it would have been the identity crisis, not a fix.

Run from the repo root:  python3 verify/verify82-page-chrome.py
"""
import json
import os
import re
import subprocess
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped. Every file here explains this change at
    length, and "fam-", "context[0]", "active=" and "SIOS.find" all appear in
    that prose — a raw scan would pass on the documentation, and worse, would
    let a real re-introduction hide behind the words excusing it."""
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

CSS = "src/app/globals.css"
DRILL = "src/components/DrillShell.tsx"
CAHIER = "src/components/CahierShell.tsx"
STOPT = "src/lib/stopTag.ts"
HOME = "src/app/HomeDashboard.tsx"

css = read(CSS)
drill, cahier = code(read(DRILL)), code(read(CAHIER))
stopt, home = code(read(STOPT)), code(read(HOME))

# ---- 1 · every page key resolves to a family ------------------------------
# Scraped from the source, resolved by the REAL familyOf. A hand-kept list of
# pages here would go stale the first time someone adds one, which is the
# failure this is trying to prevent.
ALL_SRC = "".join(
    read(os.path.join(r, f))
    for r, _d, fs in os.walk("src")
    for f in fs if f.endswith((".ts", ".tsx"))
)
# COMMENT-STRIPPED, because this file's own explanation of the fix quotes
# `active=""` — the scrape read that back as a page key and reported the very
# fault the comment describes having fixed.
keys = sorted(set(re.findall(r'active="([^"]*)"', code(ALL_SRC))))
# `active="true"` is a different component's boolean-as-string prop, not a page.
keys = [k for k in keys if k != "true"]
ok(len(keys) >= 15, f"scraped {len(keys)} page keys out of the source",
   f"only {len(keys)} `active=` keys found — the scrape is broken, not the app")

JS = """
const A = await import("./src/content/activities.ts");
const keys = %s;
const unresolved = keys.filter((k) => !A.familyOf(k));
console.log(JSON.stringify({ unresolved, resolved: keys.length - unresolved.length }));
""" % json.dumps(keys)
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
ok(r.returncode == 0, "familyOf executed in node",
   f"could not resolve the page keys: {r.stderr[-300:]}")
if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])
    # NO EXEMPTIONS, since Dan closed the last one the same day: "i say touch
    # Profil please". /moi and /profil had been exempt since 21 Aug ("can we
    # maintain the current look of the profile page") — the reasoning was that
    # a family band arriving over a page whose rows each carry a hue would be
    # a second, louder system. That reasoning was about a band ARRIVING; what
    # the exemption actually left was a page with no spine and a heading card
    # inset in a rounded box, which is two of the four faults Dan then reported
    # on that very page. So the assertion is simply: EVERY page resolves.
    ok(not d["unresolved"],
       f"all {d['resolved']} page keys resolve to a family — every page gets its spine, its ink and its band",
       f"these pages resolve to NO family, so each draws no strip, no colour and no heading band: {d['unresolved']}")
    ok("SELF_COLOURED = new Set<string>([])" in read("src/content/activities.ts"),
       "no page is exempt from the family system",
       "a page has been exempted from the family system again — that is how /profil "
       "came to be the one page with no spine and an inset heading")
ok('active=""' not in code(ALL_SRC),
   "no page passes an empty `active` — the emptiest possible answer to which page this is",
   'a page passes active="" again; familyOf returns null before it looks anything up')

# ---- 2 · the spine names BOTH shells --------------------------------------
spine = re.search(r"^([^\n{]*)\[class\*=\"fam-\"\]\s*\{[^}]*border-left:\s*6px", css, re.M | re.S)
ok(spine is not None, "the family spine is a 6px left border keyed on the fam- class",
   "the spine rule is gone or no longer 6px")
if spine:
    sel = spine.group(1)
    ok("cahier-page" in sel and "cahier-drill" in sel,
       "the spine rule names BOTH shells — the cahier page and the drill",
       f"the spine selector is `{sel.strip()}`: a shell it does not name draws no strip at all, "
       "which is how every drill in the app lost one")
ok(re.search(r'className=\{`cahier-drill ', drill) is not None,
   "DrillShell's root carries `cahier-drill`, so the rule can reach it",
   "the drill root no longer carries the class the spine rule names")

# ---- 3 · no page borrows a sibling's name ---------------------------------
ok("context[0]?.label" not in cahier,
   "the band never falls back to another flap's label",
   "`context[0]?.label` is back: it fires only when a page cannot name itself, "
   "and the first context flap on a deck page is « Home »")

# ---- 4 · one stop lookup --------------------------------------------------
hand = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        p = os.path.join(root, f)
        if f.endswith((".ts", ".tsx")) and p.replace("\\", "/") != STOPT:
            if re.search(r"SIOS\.find\(\s*\(\w+\)\s*=>\s*\w+\.collectionId\s*===", code(read(p))):
                hand.append(p)
ok(not hand,
   "the deck → stop lookup lives only in lib/stopTag.ts",
   f"the lookup is hand-written again in {hand[:3]} — two copies of one question is how they start disagreeing")
# « GOAL », not « STOP » (Dan, 1 Sep: "the words 'stop' before the stop number
# should also be replaced with goal"). The brand is Fluency On Linguistic GOALS
# and the family holding the path is 🎯 Goals, so « stop » was the one place the
# course called its own unit something the rest of the app does not.
ok("GOAL ${n}/${SIOS.length}" in stopt,
   "the tag reads GOAL and the POSITION out of fifty — the figure Home's counter shows",
   "the tag no longer reads `GOAL n/50`; either the word reverted to « stop » or "
   "the position went back to being an id a learner cannot place")
ok("${sio.short}" in stopt,
   "and the goal's NAME, in the map's own compact wording",
   "the tag no longer names the goal — Dan: 'the number AND name of the stop'")

# ---- 5 · the drill band carries it ----------------------------------------
i = drill.find("<PageBand")
band = drill[i:i + 700] if i >= 0 else ""
ok("tag={stopTagForDeck(" in band,
   "a drill's band says which goal it belongs to",
   "the drill band has no goal tag — Dan: 'no identity tag regarding which stop it belongs to'")
# ONE LINE, NO NUMBER (Dan, 1 Sep). Both are properties of PageBand itself, so
# they hold for every band at once rather than page by page.
pb = code(read("src/components/PageBand.tsx"))
ok("stat" not in pb,
   "no band carries a number at its end",
   "PageBand has a `stat` slot again — Dan: 'drop the number at the end of that strip', and it "
   "was three different figures wearing one chip")
ok("truncate" in pb and "whitespace-nowrap" in pb and "block" not in pb.split("{tag")[0].split("<p")[-1],
   "the band is one line: the tag runs inline after the title and both truncate",
   "the band can wrap to two lines again — Dan: 'all colored strips must be uniformly of the "
   "same thickness (one line text max)'")

# ---- 6 · Home's strip pulls by exactly the well's padding ------------------
# BOTH numbers read out of the source and compared, never asserted twice: the
# well is CahierShell's, the pull is Home's, and they are in different files.
well = re.search(r'cahier-foolscap py-5 pr-4 sm:pr-7 \$\{nested \? "[^"]*" : "pl-(\d+) sm:pl-(\d+)"\}', cahier)
strip = re.search(r'home-strip -ml-(\d+) -mr-(\d+)[^"]*pl-(\d+) pr-(\d+) [^"]*sm:-ml-(\d+) sm:-mr-(\d+) sm:pl-(\d+) sm:pr-(\d+)', home)
ok(well is not None and strip is not None,
   "both the content well's padding and the strip's pull are readable from the source",
   "cannot read the well padding or the strip pull — the arithmetic below would be guessing")
if well and strip:
    ml, mr, pl, pr, sml, smr, spl, spr = (int(x) for x in strip.groups())
    ok(ml == int(well.group(1)) and pl == ml and sml == int(well.group(2)) and spl == sml,
       f"the welcome strip pulls out by exactly the well's left padding ({ml} / {sml}) and pads it back",
       f"the strip pulls {ml}/{sml} against a well padded {well.group(1)}/{well.group(2)} — "
       "it stops short of the paper, which is Dan's second complaint")
    ok(mr == pr and smr == spr,
       "and the same on the right, so the strip is centred on the page rather than nudged",
       f"the strip's right pull ({mr}/{smr}) and padding ({pr}/{spr}) disagree")
ok("mx-auto max-w-3xl px-1" not in code(read("src/app/page.tsx")),
   "no second padded wrapper between the well and the strip",
   "Home's wrapper is padded again — the strip pulls by the well's padding and would stop 4px short of it")

# ---- 7 · no page prints its own name twice --------------------------------
for path, dup in (
    ("src/app/decks/[id]/mcq/Content.tsx", r"<h1[^>]*>\{collection\.title\}"),
    ("src/app/pretests/[id]/PretestContent.tsx", r"<h1[^>]*>\{pretest\.title\}"),
    ("src/app/reglages/page.tsx", r"<h1[^>]*>⚙️ Settings"),
):
    ok(re.search(dup, code(read(path))) is None,
       f"{os.path.basename(os.path.dirname(path))} does not print its title under its own band",
       f"{path} prints its name twice — the band carries it now, and two headings one line apart "
       "is the identity crisis rather than the cure")

# ---- 8 · the band says the ACTIVITY first, and « goal » not « stop » ------
# Dan, 1 Sep: "the word that appears must be the activity name. followed in the
# same row by the number and name of the stop." Two of these bands used to open
# with something else entirely, and both read as duplication the moment the tag
# arrived beside them: the deck page opened with the DECK's title, which is the
# same string the tag carries, and Profil opened with the signed-in user's name.
for path, want, was in (
    ("src/app/decks/[id]/CuratedDeckTable.tsx", 'title="Deck"', "a name that is not its own"),
    ("src/components/ProfileContent.tsx", 'title="Moi"', "the signed-in user's name"),
    ("src/app/pretests/[id]/PretestContent.tsx", 'title: "Pretest"', "the pre-test's own title"),
):
    ok(want in code(read(path)),
       f"{os.path.basename(os.path.dirname(path))}'s band opens with the ACTIVITY's name",
       f"{path} opens its band with {was} again — Dan: 'the word that appears must be the "
       "activity name', and beside the goal tag that reads as the same thing said twice")

# AND NO PAGE WEARS ANOTHER PAGE'S NAME. Dan, 1 Sep: "why are there two
# 4Memoires". The deck's word table and Flip It both printed « 4Mémoire »,
# because fixing the first fault above I took the old hand-written row's
# wording at face value — that row was already wrong, and giving it a proper
# band made it visible. 4Mémoire is the DRILL this page links to; this page is
# the deck. Same shape as `context[0]?.label` borrowing « Home ».
#
# Asserted as: no page hands PageBand a registry activity's name that is not
# its own. Two pages CAN legitimately share a title — both pre-tests are
# « Pretest », at different goals, and the goal tag tells them apart — so this
# names the one relationship that is wrong rather than banning duplicates.
deck_tbl = code(read("src/app/decks/[id]/CuratedDeckTable.tsx"))
ok('activity("flip")' not in deck_tbl and '"4Mémoire"' not in deck_tbl,
   "the deck's table does not borrow the drill's name — 4Mémoire is one tap away, with its own band",
   "the deck table calls itself 4Mémoire again; that is the drill it LINKS to, and two pages "
   "wearing one name is the fault Dan spotted")

# THE WORD IS « GOAL » wherever a learner reads it before a number. Scanned
# rather than listed, so a new one cannot slip in: any JSX text or aria-label
# of the form "Stop <number>" or "stop N". Left alone deliberately: Say It's
# "Stop" (stop recording) and NumBus's 🚏 Stops (bus stops in a game), neither
# of which is a course unit.
strays = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        p_ = os.path.join(root, f)
        if "say-it" in p_ or "numbus" in p_.lower():
            continue
        body = code(read(p_))
        for m in re.finditer(r'(?:aria-label=|title=|>)\s*[{"`\s]*([Ss]top)\s+(?:\{|\d|N)', body):
            strays.append(f"{os.path.basename(p_)}: …{body[max(0, m.start() - 12):m.end() + 6]}…")
ok(not strays,
   "no surface says « stop » before a number — the course counts in GOALS",
   f"« stop » still precedes a number here: {strays[:3]}")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
