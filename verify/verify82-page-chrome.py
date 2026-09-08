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
  8  ONE PAGE SHAPE (Dan, 2026-09-01: "Ok move all to A"). Complaint three
     survived the first pass, because "visual unity" is not a property of any
     one screen — it only exists BETWEEN screens, and no check that reads one
     page can see it. Swept across all 134 exported routes, the site drew its
     band at two lefts (6px and 19px) and two tops (49 and 57): a drill's paper
     filled the viewport while a page's lay on a grey desk, and separately 91
     routes were drawn as a sheet inside a parent sheet BECAUSE THEY CARRIED
     THEIR OWN TAB STRIP — an accident of `context.length > 0`, not a
     statement about hierarchy. Ninety of those 91 were pre-tests, which are
     inside nothing, and they paid 48px of a 430px screen and, because the bar
     was drawn `{!nested && <BottomBar />}`, their whole bottom navigation.
     So: no `nested` in CahierShell, a bottom bar that is not conditional, and
     a drill sitting on the SAME desk numbers as a page — recomputed here from
     `.cahier-desk` and `.cahier-deskrow` rather than restated, because a third
     spelling of those two numbers is exactly how the two edges drifted apart.

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

# ---- 2 · ONE class carries the colour, and both shells wear it -------------
# Dan, 2026-09-06, shown the eleven activity pages side by side: *"can you
# standardise pls, i don't want outliers"*.
#
# The spine rule used to name `.cahier-page` alone, and DrillShell's root is
# not one — so every drill carried the right `fam-` class and drew no strip
# (Dan's 1 Sep audit). The fix listed both shells, `:is(.cahier-page,
# .cahier-drill)`, which works and leaves the same trap armed: a THIRD shell
# is silently colourless again, and a grep for one name finds half the app.
# Both roots wear `cahier-surface` now, so the colour is keyed on what a
# surface IS rather than on which component drew it.
spine = re.search(r"^([^\n{]*)\[class\*=\"fam-\"\]\s*\{[^}]*border-left:\s*6px", css, re.M | re.S)
ok(spine is not None, "the family spine is a 6px left border keyed on the fam- class",
   "the spine rule is gone or no longer 6px")
if spine:
    sel = spine.group(1).strip()
    ok(sel.startswith(".cahier-surface"),
       "the spine is keyed on the ONE surface class, not on a list of shells",
       f"the spine selector is `{sel}`: back to naming shells one by one, so the "
       "next shell added draws no strip and nobody finds out until an audit")
for name, src in (("CahierShell", cahier), ("DrillShell", drill)):
    ok(re.search(r'className=\{?`cahier-(page|drill) cahier-surface ', src) is not None,
       f"{name}'s root wears `cahier-surface`, so one rule reaches it",
       f"{name}'s root no longer carries `cahier-surface` — its pages lose the "
       "spine, the family ground and the band in one go")

# ---- 2b · no page is exempt from the ground -------------------------------
# `paper-sand` made the Memo, the guide and the quick guide the only three
# grounds in the app that did not name a family. Retired 6 Sep with the ruling
# above. Deleted rather than unwired: an exemption nothing calls is one import
# away from returning, and this one was invisible for a fortnight.
ok("paper-sand" not in css and "isReadingSurface" not in code(ALL_SRC),
   "no page opts out of its family's ground",
   "`paper-sand` / `isReadingSurface` is back. A reading page keeps its family's "
   "paper — Dan retired the sand on 6 Sep looking at the eleven activity pages: "
   '"can you standardise pls, i don\'t want outliers"')

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
ok("goal={goalNumberForDeck(" in band,
   "a drill's band says which goal it belongs to",
   "the drill band has no goal circle — Dan: 'no identity tag regarding which stop it "
   "belongs to', then 'a circle and the related goal number'")
# ONE LINE, NO NUMBER (Dan, 1 Sep). Both are properties of PageBand itself, so
# they hold for every band at once rather than page by page.
pb = code(read("src/components/PageBand.tsx"))
ok("stat" not in pb,
   "no band carries a number at its end",
   "PageBand has a `stat` slot again — Dan: 'drop the number at the end of that strip', and it "
   "was three different figures wearing one chip")
ok("truncate" in pb and "min-w-0 flex-1" in pb,
   "the band is one line: the name truncates rather than wrapping",
   "the band can wrap to two lines again — Dan: 'all colored strips must be uniformly of the "
   "same thickness (one line text max)'")
# THE ✕ AND THE CIRCLE, on every band (Dan, 1 Sep, with a drawing).
ok('href={exitHref}' in pb and "✕" in pb,
   "every band carries the ✕",
   "the band draws no ✕ — Dan: 'can i have all strips looking like this: (1) with a X'")
ok(re.search(r"goal != null", pb) is not None and "🎯" in pb,
   "and the goal's circle, 🎯 and its number, where the page has a goal",
   "the band draws no goal circle — Dan: '(2) with a circle and the related goal number'")

# ---- 6 · Home's strip pulls by exactly the well's padding ------------------
# BOTH numbers read out of the source and compared, never asserted twice: the
# well is CahierShell's, the pull is Home's, and they are in different files.
# THE TERNARY IS GONE (2026-09-02). This read the `: "pl-… sm:pl-…"` arm of
# `${nested ? … : …}`; Dan's "Ok move all to A" left one page shape and one
# padding, so the well is a plain string now. The claim is untouched — the
# strip must pull out by exactly what the well pads in — and it is a stronger
# read than before, because there is no longer a second arm the strip could be
# agreeing with instead.
well = re.search(r'cahier-foolscap py-5 pl-(\d+) pr-4 sm:pl-(\d+) sm:pr-7', cahier)
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
    ("src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx", r"<h1[^>]*>\{pretest\.title\}"),
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
    # 7 Sep: this was `title="Deck"`. See the note below — Dan reversed it.
    ("src/app/decks/[id]/CuratedDeckTable.tsx", 'title={activity("flip")?.name',
     "a name that is not the activity's"),
    # The profile's band moved OUT of ProfileContent and into its two routes
    # on 1 Sep — drawn inside the content well it sat 20px lower than every
    # other band on the site. The claim is unchanged: its first word is the
    # activity's, not the signed-in name.
    ("src/app/profil/embed/page.tsx", 'band={{ title: "Moi" }}', "the signed-in user's name"),
    ("src/app/moi/embed/page.tsx", 'band={{ title: "Moi" }}', "the signed-in user's name"),
    # « Pretest » became « SpecuLearn » on 5 Sep (Dan: "it is the name for
    # everything pre-tests (old-speculearn and old-pretests)... because they
    # learn by speculating wisely based on prior knowledge", and when this
    # pin went red on the rename: "leave it as Speculearn... they are just
    # names of activities... and they are clear enough"). The CLAIM is
    # unchanged — the band opens with the ACTIVITY's name; only the
    # activity's name changed.
    ("src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx", 'title: "SpecuLearn"', "the pre-test's own title"),
):
    ok(want in code(read(path)),
       f"{os.path.basename(os.path.dirname(path))}'s band opens with the ACTIVITY's name",
       f"{path} opens its band with {was} again — Dan: 'the word that appears must be the "
       "activity name', and beside the goal tag that reads as the same thing said twice")

# ONE ACTIVITY, ONE NAME — EVEN ACROSS TWO URLs. REVERSED 7 SEP, BY DAN.
#
# This assertion used to say the opposite, and the reversal is worth keeping in
# full because the argument for the old version was good and it was still
# wrong.
#
# On 1 Sep Dan asked *"why are there two 4Memoires"*. The deck's word table and
# the flashcards both printed « 4Mémoire », so this check was written to stop a
# page wearing another page's name, and the deck table was renamed « Deck » on
# the reasoning that a page is not the drill it links to.
#
# On 7 Sep he saw « DECK » on the band and asked why. Put to him that the two
# pages are deliberately separate, he answered: *"No way José, they are
# supposed to be one and the same activity!"* — and, the same day, *"i wanted
# to keep the pages apart, and in different URL"*. Both at once: APART is about
# the pages, not about what they are called.
#
# The swipe rail says the same thing in its own words (lib/swipeRail.ts, from
# Dan's 6 Sep chain): MémoiRecall is ONE station, and "a ROW is one item inside
# a station — you move between rows by scrolling DOWN". The word table and the
# cards are two rows of one station: two URLs, one activity, one name. What he
# objected to on 1 Sep was two things looking like separate activities, not two
# URLs sharing a name.
#
# So the assertion inverts: the band must READ THE NAME FROM THE REGISTRY, and
# must never hard-code it. `activity("flip")` is now required, and a typed
# "MémoiRecall" is the fault — that is how the band drifts the next time the
# activity is renamed (the Memo-rename precedent: display renames never touch
# keys or routes, and this page's key and URL do not move).
deck_tbl = code(read("src/app/decks/[id]/CuratedDeckTable.tsx"))
ok('activity("flip")' in deck_tbl,
   "the deck's table takes MémoiRecall's name from the registry — one activity, one name",
   "the deck table no longer reads its band name from the registry. Dan, 7 Sep: "
   "'No way José, they are supposed to be one and the same activity!' — the word "
   "table and the cards are two URLs of ONE activity and wear one name")
ok('"MémoiRecall"' not in deck_tbl.replace('?? "MémoiRecall"', ""),
   "and does not type the name out beside the registry lookup",
   "the deck table hard-codes « MémoiRecall » somewhere other than the lookup's "
   "fallback — the name lives once, in the registry, or it drifts at the next rename")

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

# ---- 8 · one page shape, and one desk under both shells ------------------
drill = code(read("src/components/DrillShell.tsx"))
css_all = read("src/app/globals.css")

# THE FLAG IS GONE. Asserted on the CONSTRUCT, not the word: `"nested" not in
# cahier` would be broken by the paragraph of comment explaining the removal,
# and `code()` strips those — but a future comment inside a JSX expression
# would not be, so this looks for the two shapes that could bring it back.
ok(re.search(r"\bconst nested\b", cahier) is None,
   "CahierShell computes no `nested` flag — one page shape, not two",
   "the `nested` flag is back; it is `context.length > 0`, which means "
   "'this page has its own tabs' and was read as 'this page is inside another'")
ok(re.search(r"\{\s*!?\s*nested\s*(?:&&|\?)", cahier) is None,
   "nothing in CahierShell is drawn conditionally on it",
   "something is still drawn only when a page has no tab strip — that is what "
   "cost 90 pre-tests their bottom bar")
ok(re.search(r"\{\s*<BottomBar\s*/>\s*\}|<BottomBar\s*/>", cahier) is not None
   and re.search(r"nested\s*&&\s*<BottomBar", cahier) is None,
   "every page gets the phone bottom bar",
   "the bottom bar is conditional again — 90 pre-tests had none, on the "
   "surfaces a learner spends most of their time answering on")

# THE TWO DESK NUMBERS, read from their one home and compared with the drill's.
# Neither is written here: this fails if either is CHANGED in one place, which
# is the only way the two shells' left edges can come apart again.
desk_top = re.search(r"\.cahier-desk \{[^}]*padding:\s*(\d+)px", css_all)
row_left = re.search(r"\.cahier-deskrow \{[^}]*padding-left:\s*(clamp\([^)]*\))", css_all)
dd = re.search(r"\.cahier-drilldesk \{([^}]*)\}", css_all)
ok(desk_top is not None and row_left is not None and dd is not None,
   "the page desk, its gutter and the drill desk are all readable from the CSS",
   "cannot read one of .cahier-desk / .cahier-deskrow / .cahier-drilldesk — "
   "the comparison below would be guessing")
if desk_top and row_left and dd:
    body = dd.group(1)
    m_top = re.search(r"padding-top:\s*(\d+)px", body)
    m_left = re.search(r"padding-left:\s*(clamp\([^)]*\))", body)
    ok(m_top is not None and m_top.group(1) == desk_top.group(1),
       f"a drill's paper starts the same {desk_top.group(1)}px down as a page's",
       f"the drill desk pads {m_top.group(1) if m_top else 'nothing'} above the paper and a page "
       f"desk pads {desk_top.group(1)} — the band jumps vertically the moment a learner starts answering")
    ok(m_left is not None and m_left.group(1) == row_left.group(1),
       "and one gutter in, by the same expression the page row uses",
       f"the drill's gutter is {m_left.group(1) if m_left else 'unset'} and the page row's is "
       f"{row_left.group(1)} — two spellings of one edge, which is how they came apart before")
    # ALL FOUR SIDES (Dan, 2026-09-02: shown three renders and asked which, "B").
    # The first landing put grey on the left and above only, and the edge that
    # actually showed the difference was the RIGHT one — the paper ran off the
    # side of the screen while every other page in the app sat on grey. The
    # right gutter is asserted against the LEFT rather than against a number,
    # so re-tuning the gutter moves both or fails.
    m_right = re.search(r"padding-right:\s*(clamp\([^)]*\))", body)
    ok(m_right is not None and m_left is not None and m_right.group(1) == m_left.group(1),
       "and the same gutter on the right, so the paper is centred rather than nudged",
       f"the drill's right gutter is {m_right.group(1) if m_right else 'unset'} against a left of "
       f"{m_left.group(1) if m_left else 'unset'} — the paper runs off one side of the screen")
    # The BOTTOM is deliberately NOT the page desk's 64: a page scrolls, a drill
    # is exactly one screen with its footer tray pinned to the end of it, and 64
    # there costs 64px of that screen where 8 costs 8. Asserted as a range, not
    # a value, because the point is "some desk, but not a page's".
    m_bot = re.search(r"padding-bottom:\s*(\d+)px", body)
    ok(m_bot is not None and 0 < int(m_bot.group(1)) < int(desk_top.group(1)) + 24,
       f"the drill's paper sits on desk at the bottom too, without paying a page's 64px for it "
       f"({m_bot.group(1) if m_bot else 'unset'}px)",
       f"the drill's bottom desk is {m_bot.group(1) if m_bot else 'unset'} — either the paper runs off "
       "the bottom of the screen again, or a drill has given up a page's worth of its one screen")
# THREE PARTS, AND ONLY THREE. Dan drew the band with a ✕, a name and a goal
# circle; PageBand also had a `trailing` slot ("one extra control, never a
# number") and exactly one page filled it — the deck's band mounted the (?)
# that opens the Menu, which is what the ☰ two centimetres above it opens. He
# found it the moment the bands were lined up side by side: *"what is with the
# question mark on the deck strip"*. The slot is gone, not just its occupant,
# because a slot that exists is a slot that gets filled — and the band's whole
# claim is that it is the same three parts on every page.
band_src = read("src/components/PageBand.tsx")
ok(re.search(r"^\s*trailing[,?]", code(band_src), flags=re.M) is None,
   "the band has no spare slot — ✕, the activity's name, the goal, and nothing else",
   "PageBand has a `trailing` slot again; one page filled the last one with a second "
   "door to the Menu and the deck became the only band in the app with four things on it")
ok("HelpDot" not in code(read("src/app/decks/[id]/CuratedDeckTable.tsx")),
   "the deck's band does not mount a second Menu button",
   "the deck's band mounts HelpDot again — HelpDot is for pages OUTSIDE the shell, which "
   "have no ☰; a page inside it already has that door")

ok("cahier-drilldesk" in drill,
   "DrillShell mounts that desk",
   "DrillShell's root is loose in the layout again — its spine starts at x=0 and every page's at the gutter")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
