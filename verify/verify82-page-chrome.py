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
ok("STOP ${n}/${SIOS.length}" in stopt,
   "the tag is the stop's POSITION out of fifty, the same figure Home's counter shows",
   "the stop tag no longer prints the position; `SIO-039` is an id a learner cannot place")

# ---- 5 · the drill band carries it ----------------------------------------
i = drill.find("<PageBand")
band = drill[i:i + 700] if i >= 0 else ""
ok("sub={stopTagForDeck(" in band,
   "a drill's band says which stop it belongs to",
   "the drill band has no stop sub-line — Dan: 'no identity tag regarding which stop it belongs to'")

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

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
