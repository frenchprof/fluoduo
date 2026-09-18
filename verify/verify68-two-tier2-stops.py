#!/usr/bin/env python3
# RENUMBERED 66 -> 68 at merge time (integration, 31 Aug): #99's popup check
# took 66 while this branch was in flight, and #100 claims 67 — the fifth and
# sixth number collisions, both caught before CI this time.
"""
The two Tier 2 stops that had no lesson file — and the three decisions Dan made
on 2026-08-31 alongside them.

WHAT SHIPPED, AND WHY EACH PART IS ASSERTED HERE RATHER THAN READ.

1 · COLOURS AND SOME NOUNS GET A LESSON FILE. They were the only two Tier 2
    stops with a deck and no `src/content/lessons/native/*.tsx`, so a concept
    had physically nowhere to live. A file that exists but is not registered,
    or registered but not mapped to its SIO, is invisible to a learner and
    looks completely finished in a diff — so the wiring is asserted at all
    three joints, not just the file's existence.

2 · THE CONTENT IS THE DECK'S. Both lessons hold a hand-written table that
    restates deck data: colours' twelve mnemonics, and eighteen genders. **A
    flipped gender or a mistyped mnemonic would teach a wrong article or a
    wrong phrase and read as perfectly ordinary code.** So both tables are
    checked against the JSON they came from, item by item. This is the check
    that matters most in this file.

3 · ★ WITHDRAWS THE COLOUR, NOT THE NOUN. Dan's ladder: "★ just the colour
    word · ★★ the colour word and the noun". The phrase is « le feu rouge », so
    the leftmost blankable slot is the NOUN — the default `blankKeysFor` rule
    would blank the wrong half and ask the wrong question. `Slot.first` exists
    for that, and it defaults to today's behaviour everywhere else, which is
    also asserted: a flag that silently changed the other 47 generators would
    be a much worse bug than the one it fixes.

4 · THE BAND IS SEMIBOLD. Dan picked 600 from a rendered specimen. Two things
    have to agree or it silently stays 400: the CSS class, and the Tailwind
    `font-*` utility on the two components that mount it — a utility beats the
    class, which is exactly how this change would look done and not be.

5 · THE TABS ARE ENGLISH, ALL SIX. He was shown all-English, all-French and
    mixed, and picked all-English. Mixed is asserted against, because that is
    the state a half-finished rename lands in.

RUN FROM THE REPO ROOT:  python3 verify/verify68-two-tier2-stops.py
"""
import json
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

def read(p):
    return open(p, encoding="utf-8").read()

def strip_comments(src):
    return re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", src, flags=re.S))

# ── 1 · both lessons exist, and are wired at all three joints ───────────────
COLORS = "src/content/lessons/native/colors.tsx"
NOUNS = "src/content/lessons/native/core-nouns.tsx"
for p in (COLORS, NOUNS):
    check(os.path.isfile(p), f"{os.path.basename(p)} exists",
          f"{p} is missing — the stop has a deck and no place for a concept again")
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL)); sys.exit(1)

CSRC, NSRC = read(COLORS), read(NOUNS)
IDX = read("src/content/lessons/native/index.tsx")
LESSONS = read("src/content/lessons.ts")

for slug, export in (("colors", "colorsLesson"), ("core-nouns", "coreNounsLesson")):
    check(f"{export} }} from" in IDX or f"{{ {export} }}" in IDX,
          f"{slug}: imported into the native registry",
          f"{slug}: {export} is never imported by native/index.tsx, so getNativeLesson "
          "returns undefined and the lesson renders as a stop with no lesson")
    body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", IDX, re.S)
    check(bool(body) and export in body.group(1),
          f"{slug}: registered in NATIVE_LESSONS",
          f"{slug}: imported but not put in the NATIVE_LESSONS map — an import with no "
          "registry row is exactly what a tree-shaken, invisible lesson looks like")
    check(re.search(rf'"{slug}":\s*\{{\s*slug:\s*"{slug}"', LESSONS) is not None,
          f"{slug}: has a row in lessons.ts",
          f"{slug}: no lessons.ts row, so it has no title and no unit")

for sio, slug in (("SIO-005", "colors"), ("SIO-006", "core-nouns")):
    check(re.search(rf'"{sio}":\s*\[[^\]]*"{slug}"', LESSONS) is not None,
          f"{sio} opens {slug}",
          f"{sio} is not mapped to {slug}. The lesson file exists and is registered, and "
          "the stop still opens nothing — the failure mode this triple-check exists for.")

# ── 2 · the hand-written tables match the decks they were copied from ───────
colors_deck = json.load(open("src/content/collections/colors.json", encoding="utf-8"))
nouns_deck = json.load(open("src/content/collections/core-nouns.json", encoding="utf-8"))

# colours: art + noun + color must reassemble the deck's own `example`.
rows = re.findall(
    r'\{\s*art:\s*"([^"]+)",\s*noun:\s*"([^"]+)",\s*color:\s*"([^"]+)"', CSRC)
check(len(rows) == 12, f"colours: 12 mnemonics parsed",
      f"colours: parsed {len(rows)} mnemonic rows, not 12 — the regex has stopped "
      "matching, so every colour assertion below is vacuous")

by_example = {it["example"]: it for it in colors_deck["items"]}
bad = []
for art, noun, color in rows:
    phrase = f"{art} {noun} {color}"
    if phrase not in by_example:
        bad.append(phrase)
check(not bad and len(rows) == 12,
      "colours: every mnemonic is the deck's own `example`, verbatim",
      "colours: these phrases are in colors.tsx and in NO deck item's `example`, so the "
      "lesson teaches French the deck does not: " + "; ".join(bad))

check(len({c for _, _, c in rows}) == 12,
      "colours: twelve distinct colour words",
      "colours: a colour word is repeated — one of the twelve is missing its mnemonic")

# some nouns: gender and article must match col:m / col:f and `gap`.
nrows = re.findall(
    r'\{\s*fr:\s*"([^"]+)",\s*en:\s*"[^"]*",\s*g:\s*"([mf])",\s*art:\s*"([^"]+)",\s*q:\s*"(\w+)"',
    NSRC)
check(len(nrows) == 18, "some nouns: 18 rows parsed",
      f"some nouns: parsed {len(nrows)} rows, not 18 — the regex has stopped matching and "
      "the gender assertions below prove nothing")

# INDEXED BY THE NOUN, WITH OR WITHOUT ITS ARTICLE (13 Sep). The MASTER-v8
# audit moved the article INTO the French cell — « homme » became « un homme »
# — so that the gap is a real, visible, countable choice rather than a word
# with nothing hidden in it (its changes #6-23). The lesson still cites the
# bare noun, which is right: the lesson is about the noun, and the article is
# what it teaches you to choose.
#
# So the index carries both spellings. Matching only the exact cell would have
# reported all eighteen nouns as "in the lesson and not in the deck" — a
# failure that reads as content going missing when in fact nothing left.
_ART = re.compile(r"^(?:un|une|des|le|la|les|du|de la|de l'|l')\s+|^l['’]", re.I)
deck_by_fr = {}
for it in nouns_deck["items"]:
    deck_by_fr.setdefault(it["fr"], it)
    bare = _ART.sub("", it["fr"]).strip()
    if bare != it["fr"]:
        deck_by_fr.setdefault(bare, it)
wrong_gender, wrong_art, missing = [], [], []
for fr, g, art, q in nrows:
    it = deck_by_fr.get(fr)
    if not it:
        missing.append(fr); continue
    want_g = "f" if "col:f" in it["tags"] else "m"
    if g != want_g:
        wrong_gender.append(f"{fr}: lesson says {g}, deck says {want_g}")
    if art != it.get("gap"):
        wrong_art.append(f"{fr}: lesson says {art!r}, deck gap is {it.get('gap')!r}")

check(not missing, "some nouns: every row is a deck word",
      "some nouns: these words are in the lesson and not in the deck: " + "; ".join(missing))
check(not wrong_gender, "some nouns: every gender matches the deck's col: tag",
      "some nouns: A FLIPPED GENDER TEACHES A WRONG ARTICLE — " + "; ".join(wrong_gender))
check(not wrong_art, "some nouns: every article matches the deck's `gap`",
      "some nouns: " + "; ".join(wrong_art))
check(len(nrows) == len(nouns_deck["items"]),
      "some nouns: all eighteen are taught, none dropped",
      f"some nouns: the lesson lists {len(nrows)} of {len(nouns_deck['items'])} deck words")

# The concept turns on this counterexample. If the deck ever loses it, the
# lesson's central claim ("the ending is a hint, not a rule") stops being true
# of the material in front of the learner.
groupe = deck_by_fr.get("groupe")
check(groupe is not None and "col:m" in groupe["tags"],
      "some nouns: « un groupe » is still the deck's -e-but-masculine counterexample",
      "the concept argues the -e ending is unreliable and cites « un groupe ». That word "
      "is gone from the deck or no longer masculine, so the argument now has no instance "
      "in front of the learner.")

# ── 2b · every card carries an English reference you can build the French from
# Dan, 2026-08-31: "Is there the English reference to build the french from on
# each question?" For colours, yes and always was — `big` is the deck's
# exampleEn ("a red traffic light"). For Some nouns it was the BARE NOUN,
# "man", which does not tell a learner they are meant to produce a whole
# sentence, and is ambiguous besides: the deck maps « étudiant » and
# « étudiante » to the same English. So the card now shows the full sentence,
# with the gender marker kept wherever English alone cannot choose.
check("big: n.enFull" in NSRC and "big: n.en," not in NSRC,
      "some nouns: the card shows the whole English sentence, not the bare noun",
      "some nouns: the card's `big` is the bare noun again. « man » does not ask for "
      "« C'est un homme. », and at ★★★ a learner is asked to translate it from nothing.")
check("big: m.en" in CSRC,
      "colours: the card shows the deck's full English phrase",
      "colours: the card no longer shows an English reference, so there is nothing to "
      "build the French from")

enfull = dict(re.findall(r'fr:\s*"([^"]+)".*?enFull:\s*"([^"]+)"', NSRC))
check(len(enfull) == 18, f"some nouns: {len(enfull)} English references parsed",
      f"some nouns: parsed {len(enfull)} enFull values, not 18 — the assertions below are vacuous")
mismatch = []
for fr, e in enfull.items():
    it = deck_by_fr.get(fr)
    if not it:
        continue
    if not e.startswith(it.get("exampleEn", "\0")):
        mismatch.append(f"{fr}: {e!r} is not the deck's {it.get('exampleEn')!r}")
check(not mismatch, "some nouns: every English reference is the deck's own exampleEn",
      "some nouns: invented English — " + "; ".join(mismatch))

dupes = [e for e in set(enfull.values()) if list(enfull.values()).count(e) > 1]
check(not dupes,
      "some nouns: no two words share an English reference",
      "some nouns: these English prompts are ambiguous — two different French answers are "
      "correct for the same prompt, so the learner cannot know which is wanted: " +
      "; ".join(dupes))

# ── 3 · the star ladder withdraws the colour, and nothing else moved ────────
CLOZE = read("src/content/lessons/native/cloze.ts")
check("first?: boolean" in CLOZE,
      "Slot.first exists — ★ can target a slot that is not leftmost",
      "Slot has no `first` field, so ★ always blanks the leftmost gap. For « le feu "
      "rouge » that is the NOUN, and Dan's ladder asks for the colour.")
check(re.search(r"blankable\.find\(\(s\)\s*=>\s*s\.first\)", CLOZE) is not None,
      "blankKeysFor honours `first`",
      "blankKeysFor never reads `first` — the field is declared and ignored, which looks "
      "exactly like a working feature")

check('first: true' in CSRC and re.search(r'key:\s*"color".*first:\s*true', CSRC) is not None,
      "colours: the COLOUR slot claims ★",
      "colours: no slot sets `first: true` on the colour, so ★ withdraws « feu » and the "
      "one-star card asks the learner to name the thing instead of its colour — Dan's "
      "ladder inverted, and invisible in review")
check(re.search(r'key:\s*"noun"', CSRC) is not None,
      "colours: the noun is blankable too, so ★★ takes both",
      "colours: the noun slot is not blankable, so ★★ is identical to ★ and Dan's second "
      "rung does not exist")

# core-nouns must NOT use the flag: its article is already leftmost, and a
# redundant flag here would hide the fact that the default rule is what runs.
check("first: true" not in NSRC,
      "some nouns: relies on the default rule — the article is leftmost already",
      "some nouns sets `first: true`. Its article is the leftmost blankable slot, so the "
      "flag changes nothing and disguises which rule is actually in force.")

# The default must be untouched for the generators that predate the flag.
import subprocess, tempfile
# The import must be ABSOLUTE. A relative one resolves from the probe file's
# own directory, not the repo, so `./src/...` looked for /tmp/src and the whole
# executed section failed open — which is how a check quietly becomes
# source-reading only.
CLOZE_ABS = os.path.abspath("src/content/lessons/native/cloze.ts")
probe = r"""
import { blankKeysFor } from "%s";""" % CLOZE_ABS + r"""
const plain = [{ text: "Tu" }, { key: "verb", text: "aimes", choices: ["aimes","adores"] },
               { key: "article", text: "le", choices: ["le","la"] }, { text: "sport" }];
const flagged = [{ text: "le" }, { key: "noun", text: "feu", choices: ["feu","café"] },
                 { key: "color", text: "rouge", choices: ["rouge","noir"], first: true }];
const out = {
  plain1: blankKeysFor(1, plain), plain2: blankKeysFor(2, plain), plain3: blankKeysFor(3, plain),
  flag1: blankKeysFor(1, flagged), flag2: blankKeysFor(2, flagged), flag3: blankKeysFor(3, flagged),
};
console.log(JSON.stringify(out));
"""
got, why = None, ""
with tempfile.NamedTemporaryFile("w", suffix=".ts", delete=False) as fh:
    fh.write(probe)
    probe_path = fh.name
try:
    r = subprocess.run(["node", "--experimental-strip-types", probe_path],
                       capture_output=True, text=True, timeout=60)
    if r.returncode == 0:
        got = json.loads(r.stdout.strip().splitlines()[-1])
    else:
        why = (r.stderr or r.stdout).strip().splitlines()[-1] if (r.stderr or r.stdout) else "no output"
except Exception as e:
    why = repr(e)
finally:
    os.unlink(probe_path)

check(got is not None, "blankKeysFor executed, not just read",
      "could not run blankKeysFor under node --experimental-strip-types, so every ladder "
      f"assertion above is source-reading only: {why}")
if got:
    check(got["plain1"] == ["verb"],
          "unflagged ★ still takes the leftmost blank — the 47 old generators are untouched",
          f"an unflagged ★ now returns {got['plain1']} instead of ['verb']. The `first` "
          "flag has changed the default and every generator that predates it just moved.")
    # AMENDED AT MERGE (31 Aug): #97 renamed the ladder the same afternoon —
    # Moyen (level 2) takes ONE piece ("CompleteIt is supposed to [be] …
    # Moyen if it involves one"), and TWO pieces is Difficile (level 3). The
    # intent this held — a level that withdraws everything — moved up a tier.
    check(got["plain2"] == ["verb"],
          "unflagged Moyen takes one blank — the leftmost, like Facile",
          f"unflagged Moyen returns {got['plain2']}, expected ['verb'] — Dan's "
          "31 Aug ladder gives Moyen ONE piece; every blank is Difficile's")
    check(got["plain3"] == ["verb", "article"],
          "unflagged Difficile takes every blank",
          f"unflagged Difficile returns {got['plain3']}")
    check(got["flag1"] == ["color"],
          "flagged ★ takes the colour, not the leftmost noun — Dan's ladder, executed",
          f"flagged ★ returns {got['flag1']}, so the one-star colours card blanks the "
          "wrong half of « le feu rouge »")
    check(got["flag2"] == ["color"],
          "flagged Moyen takes the claimed colour — one piece, the right one",
          f"flagged Moyen returns {got['flag2']}")
    check(got["flag3"] == ["noun", "color"],
          "flagged Difficile takes both, in reading order — Dan's '★★ the "
          "colour word and the noun', which the rename calls Difficile",
          f"flagged Difficile returns {got['flag3']}")

# ── 4 · the heading band is SemiBold, in BOTH places that decide it ─────────
CSS = read("src/app/globals.css")
band = re.search(r"\.fluo-band-hand\s*\{([^}]*)\}", CSS)
check(band is not None and "font-weight: 600" in band.group(1),
      "the band class is font-weight 600",
      "`.fluo-band-hand` is not 600 — Dan picked SemiBold from a rendered specimen")
# REWRITTEN 1 Sep, naming the supersession. This named two files — PageBand
# and ProfileContent — because both hand-rolled a heading band and either could
# pin a `font-normal` utility that beats the class. ProfileContent stopped
# hand-rolling one that day (Dan: "i say touch Profil please"; it renders
# PageBand now), so the hard-coded pair began FAILING on a page for having been
# fixed. The claim was never about those two files: it is that wherever the
# band class is used, no utility fights it. So the check now finds the users
# rather than being told them — and it also insists there is at least one, or
# it would pass vacuously the day the class is dropped altogether.
users = []
for _root, _dirs, _files in os.walk("src"):
    for _f in _files:
        if _f.endswith(".tsx"):
            _p = os.path.join(_root, _f)
            if "fluo-band-hand" in read(_p):
                users.append(_p)
check(bool(users),
      f"the band class is used in {len(users)} place(s)",
      "nothing uses `.fluo-band-hand` — the band's typeface decision has no subject")
for p in users:
    cls = re.findall(r'className="([^"]*fluo-band-hand[^"]*)"', read(p))
    bad = [c for c in cls if "font-normal" in c or "font-light" in c or "font-thin" in c]
    check(not bad,
          f"{os.path.basename(p)}: no weight utility fighting the class",
          f"{p} pins a lighter weight on the band title ({bad[:1]}). A Tailwind utility beats "
          "`.fluo-band-hand`, so the CSS says 600 and the screen renders 400 — the change "
          "looks done and is not.")

LAYOUT = read("src/app/layout.tsx")
check('weight: "600"' in LAYOUT,
      "the 600 face is actually loaded",
      "layout.tsx loads no weight 600, so `font-weight: 600` synthesises a fake bold from "
      "the Regular instead of using Dan's drawn SemiBold")
check("FluOlinGoHandRegular.otf" not in LAYOUT,
      "the superseded first-upload Regular is gone",
      "layout.tsx still loads FluOlinGoHandRegular.otf — a different, older build from the "
      "nine-weight family, so Regular and SemiBold are two drawings of one hand")

# ── 5 · the six tabs are English, and not half-renamed ──────────────────────
TABS = read("src/app/lessons/pager/LessonTabs.tsx")
tabs_body = re.search(r"const TABS[^=]*=\s*\[(.*?)\n\];", TABS, re.S)
check(tabs_body is not None, "the TABS table parsed",
      "TABS is unreadable — the assertions below are vacuous")
if tabs_body:
    labels = re.findall(r'label:\s*"([^"]+)"', tabs_body.group(1))
    # AMENDED AT MERGE (31 Aug): #97 parked the Bonus tab under practice the
    # same day ("we can park Bonus under practice, so it does not have to
    # have its own tab") — the ⭐ Bonus level of the chooser serves those
    # sentences. Four tabs, not five.
    # RELABELLED 2026-09-05, and the reversal is Dan's: *"i think we can use
    # those french words, they are simple single words"*, having just written
    # Idée / Forme / Exercice himself. The 31 Aug all-English ruling stands for
    # what it decided — navigation is furniture and a beginner should not have
    # to decode it — and « Idée », « Formes » and « Exercice » are cognates that
    # need no decoding. GOAL stays English because it is not one of the
    # lesson's parts: it is the 🎯 Goals family's name, spelled once in
    # FAMILIES for the whole app, and its ← says it leaves the lesson.
    # REVERSED AGAIN 2026-09-16, TO ENGLISH, and again the reversal is Dan's:
    # *"should name consistently: Goal Idea Form Exercise"* — sent the same day
    # as the Forms page being *"way too much french in there for a beginner"*.
    # Consistency won over the cognate argument: four tabs in one language, the
    # one the chrome is in. Keys (`formes`, `exercice`) do not move.
    # AND FORM MOVED AHEAD OF IDEA the same evening — Dan: *"MeMoiRecall might
    # be better even right after SpecuLearn, and before the Lesson Idea and
    # Exercises"*, then, refusing a fifth tab for the cards: *"are cards and
    # forms not the same thing, they should be put under the same umbrella.
    # STOP MULTIPLYING CATEGORIES"*. Still four tabs; the cards are inside Form.
    # REVERSED AGAIN 2026-09-19 — Dan, on SEEING the fold: *"Now that i see
    # what MemoiRecall flashcards look like, they should really be a section
    # of its own."* Five tabs; the cards left Form for the fifth, in the
    # position his 16 Sep instinct named (after Form, before Idea/Exercise).
    check(labels == ["Goal", "Form", "Cards", "Idea", "Exercise"],
          "five tabs: ← 🎯 Goal · Form · 🃏 Cards · Idea · Exercise — Bonus parked, the cards a section of their own",
          f"the tab strip reads {labels}. Five tabs, in English (Cards added by Dan, "
          "19 Sep), the bonus still a level of the chooser since #97.")
    # THE SIX-CHARACTER RULE IS GONE, and what replaced it is the thing the rule
    # was standing in for. Six characters was a proxy for "fits a 320px column
    # in one row beside an emoji"; « Exercice » is eight and the proxy said no,
    # so the strip was measured instead — one row needed 67px in a 59px cell at
    # 360px and three of four tabs overflowed. Stacking the emoji ABOVE the word
    # (which is what the bottom bar already does) drops every tab to exactly its
    # column at 320 / 360 / 390 / 430. So the assertion is now the stack, which
    # is what actually makes a long label safe, and a label of any length is
    # fine while it holds.
    check("flex flex-col" in TABS and "grid-cols-5" in TABS,
          "the strip stacks emoji over word in five fixed columns — measured to fit "
          "at 320, 360, 390 and 430px with no tab overflowing",
          "the tab strip is no longer a stacked four-column grid. Re-measure before "
          "changing this: in ONE row « 🏋️ Exercice » needs 67px and a 360px phone "
          "gives it 59, so the labels clip and the strip scrolls — which is how a "
          "tab came to be missing from a screenshot in the first place.")
    french = [l for l in labels if re.match(r"^(Le |La |Les |L')", l)]
    # Dan reversed the language on 2026-09-05, so this no longer forbids French —
    # it forbids the OLD French, « Le concept » / « Les formes » / « Le parcours »,
    # the article-prefixed names the short labels replaced. « Idée » is a tab;
    # « Le concept » is a page title someone pasted into a tab.
    check(not french,
          "no tab has slipped back to the old article-prefixed French name",
          f"these tabs read as page titles rather than labels: {french}. The labels are "
          "Idea · Form · Exercise (16 Sep); « Le concept » and « Les formes » are what the "
          "short forms replaced.")

# The learner-facing empty states name the tabs too — a rename that leaves
# those behind tells a learner to go to a tab that no longer exists.
empties = re.findall(r'Empty what="([^"]+)"', TABS)
stale = [e for e in empties if re.search(r"\bLe concept\b|\bLes formes\b|\bparcours\b|\blexique\b", e)]
check(not stale,
      "the empty-state messages use the new tab names",
      "these messages still send a learner to a French tab name that is no longer on the "
      "strip: " + "; ".join(stale))


# ── 6 · the concept page's sections are legible as sections ────────────────
# Dan, 2026-08-31: "the headings are hardly salient. and i can hardly make out
# the sections from each other." They were `fluo-label` — small, uppercase and
# in the SOFT ink, which is the app's caption treatment. Asserted so nobody
# quietly returns them to it.
hblock = re.search(r"function H\(\{ children[^}]*\}[^)]*\)\s*\{(.*?)\n\}", TABS, re.S)
check(hblock is not None, "the section-heading component parsed",
      "H() is unreadable — the assertions below are vacuous")
if hblock:
    h = hblock.group(1)
    check("fluo-label" not in h,
          "section headings are not the app's caption style",
          "H() is back on `fluo-label`, the small soft-ink caption treatment. A heading in "
          "the caption style is a caption sitting where a heading should be.")
# The heading STYLE moved into a shared `HEAD` constant on 2026-08-31 so the
# collapsible <summary> and the plain <h3> cannot drift apart. Assert the
# constant, not H()'s body — that is where the styling now lives, and checking
# the old place failed against correct code.
head = re.search(r"const HEAD =(.*?);\n", TABS, re.S)
check(head is not None, "the shared heading style parsed",
      "HEAD is unreadable — the two assertions below are vacuous")
if head:
    hd = head.group(1)
    check("border-t" in hd,
          "a rule separates one section from the next",
          "the heading style draws no top border, so the sections run together — the second "
          "half of what Dan reported")
    check("--cahier-ink" in hd and "font-black" in hd,
          "headings are full ink at black weight, so they outrank the prose",
          "the heading style no longer sets full ink and black weight, so a heading does not "
          "stand out from the paragraph under it")
    check("summary" in TABS and f"{{HEAD}}" in TABS,
          "the folded and unfolded headings share one style",
          "the <summary> does not use HEAD, so a collapsible section and a plain one can "
          "drift into looking like different things")


# ── 7 · the word list lives UNDER Forms, not beside it ─────────────────────
# Dan, 2026-08-31: "can we put Words under Forms?" The Mémo states the pattern
# and the deck is that pattern's own instances — on a Tier 2 stop the word list
# IS the lesson. Two consequences are asserted, because a half-done move leaves
# the panel merged and the tab still there, which looks finished either way.
check('key: "lexique"' not in TABS,
      "there is no Words tab — the word list is a section, not a destination",
      "TABS still carries a `lexique` row, so the word list has both a tab AND a place "
      "inside Forms")
check('"lexique"' not in re.search(r"type TabKey = ([^;]+);", TABS).group(1),
      "`lexique` is gone from TabKey, so nothing can route to it",
      "TabKey still admits \"lexique\", so a stale link or a stored tab value can select a "
      "tab that no longer renders anything")
# SLICED, not regex-matched. Every brace-based boundary I tried closed on
# the DESTRUCTURING brace — `}: { memo?: ... }) {` puts a `}` in column 0
# three lines into the signature — capturing none of the body, so both
# assertions below failed against perfectly correct code. The next
# top-level declaration is the honest end of a function.
def _decl(src, name):
    i = src.find(f"function {name}(")
    if i < 0:
        return None
    nxt = [j for j in (src.find("\nfunction ", i + 1), src.find("\n/* \u2500", i + 1),
                       src.find("\nexport ", i + 1)) if j > 0]
    return src[i:min(nxt)] if nxt else src[i:]
formes = _decl(TABS, "Formes")
check(formes is not None, "the Forms panel parsed",
      "there is no Formes component — the merge did not happen")
if formes:
    f = formes
    # REVERSED 2026-09-16 — Dan, of the word list under the Mémo: *"That is
    # actually the MemoiRecall section. We do not need to repeat it if it is
    # already in there."* The deck is drawn ONCE, by MémoiRecall; Form is the
    # Mémo and nothing else, so the two assertions that pinned the second half
    # now pin its absence.
    # AND AN HOUR LATER, THE SLOT IS FILLED WITH THE REAL THING — Dan: *"bring
    # MemoiRecall back at where you removed the list, because honestly you
    # created MemoiRecall out of that list in the first place and moved it out
    # of my lesson when it was supposed to be a part of it."* Not the words
    # drawn again: the station itself, framed, folded, counted.
    check("{memo}" in f and "Lexique" not in f,
          "Form renders the Mémo and no second copy of the deck's words",
          "the Form panel draws the deck's word list again. MémoiRecall is the deck's "
          "flashcards (Dan, 16 Sep); a table of its words under the Mémo is the duplicate "
          "he sent back.")
    # REVERSED AGAIN 2026-09-19 — Dan, seeing the fold: *"Now that i see what
    # MemoiRecall flashcards look like, they should really be a section of its
    # own."* The frame and the count moved to the Cards tab (its own panel);
    # Form is the Mémo, full stop. No fold remains, so the count assertion
    # retired with it — the tab itself is the disclosure now.
    check("/practice/flip-it/" not in f,
          "and nothing else — the flashcards moved to their own 🃏 Cards tab (19 Sep)",
          "Form is framing MémoiRecall again — the cards have had a section of their "
          "own since Dan's 19 Sep ruling")


# ── 8 · long panels collapse, and the right half stays open ────────────────

# EVERY fold names what is behind it. Dan's rule: a closed section with no count
# "is a section nobody opens, which is just deletion with extra steps."
_folds = re.findall(r"<Section\s+([^>]*?)>", TABS, re.S)
_foldable = [f for f in _folds if "folds={false}" not in f]
_bare = [re.sub(r"\s+", " ", f).strip()[:60] for f in _foldable if "note=" not in f]
check(not _bare,
      f"all {len(_foldable)} folds say what is behind them",
      "these collapsed sections show a bare chevron and nothing else, so a learner has no "
      "reason to open them: " + "; ".join(_bare))

# THE `first:` TRAP, in the one place it bites. A <summary> is ALWAYS the first
# child of its <details>, so a `first:` variant on the SHARED heading style
# fires on every collapsible section at once and strips the rule and margin off
# all of them, while plain <h3> headings keep theirs. The page then looks like
# the folds are not sections at all. Found by looking at the render, not the
# class list; the reset lives in HEAD_FIRST and is applied per element instead.
_head = re.search(r"const HEAD =(.*?);", TABS, re.S)
check(_head is not None and "first:" not in _head.group(1),
      "the shared heading style carries no `first:` variant",
      "`first:` is back in HEAD. A <summary> is always its <details>'s first child, so it "
      "fires on EVERY fold and strips the rule off all of them — see HEAD_FIRST.")

# Dan, 2026-08-31: "now that the page is long please collapse part of it. can
# you make it a rule for all — this is the rule from now on." The rule is in
# AGENTS.md; ONE component implements it, so a second panel cannot invent a
# different disclosure. Asserted here because the failure is silent both ways:
# a fold that never closes reads as a plain heading, and a fold over the
# ARGUMENT hides the lesson itself.
check("function Section(" in TABS,
      "there is one collapsible Section component",
      "no Section component — each panel would hand-roll its own disclosure, which is how "
      "two nav surfaces came to disagree for eleven days in August")
sec = _decl(TABS, "Section")
check(sec is not None and "<details" in sec and "<summary" in sec,
      "it is a native <details>/<summary>",
      "Section does not use <details>. A useState div has to reimplement keyboard "
      "operation, the screen-reader expanded state and find-in-page, and will get one of "
      "them wrong.")
check(sec is not None and "note" in sec,
      "a closed section can say what is behind it",
      "Section takes no `note`, so a closed section shows a bare chevron. A fold nobody "
      "opens is deletion with extra steps.")

conc = _decl(TABS, "Concept")
check(conc is not None, "the Concept panel parsed", "Concept is unreadable")
if conc:
    # ── EDITED BY COLOR REVIEW, 31 Aug PM. Cross-lane, and flagged as such. ──
    # Dan replaced the folds with a tab strip: *"broken into side-by-side tabs
    # that allows everything to be visible on the same screen all at once…
    # i would prefer the latter"*. The <Section> assertions that stood here
    # pinned the OLD mechanism and went red on the new one.
    #
    # The INTENT is kept exactly, and it was this lane that stated it: the
    # apparatus is put away, and **the argument never is**. A strip honours that
    # only if it opens on the claim — asserted below, because a strip opening on
    # the pitfall table would have passed the old "no <Section> in the argument"
    # test while hiding the lesson.
    #
    # fluoduo-main: revert this hunk if the trade is wrong. Measured both ways —
    # with folds, 39 of 39 concepts exceeded one screen; with panes, 39 of 39 fit.
    check('useState<"claim"' in conc,
          "the concept opens on the claim, not on its apparatus",
          "the Concept panel's first pane is not the claim. Apparatus is put away; the "
          "argument never is — and a strip that opens on the traps breaks that while "
          "looking perfectly fine in a diff.")
    bare = strip_comments(conc)
    # The EXACT guard. A window search for `pane === "` matched a different
    # pane's guard and passed a pitfall table that had escaped its own.
    for guard, what in (('pane === "traps" && c.pitfall', "the pitfall table"),
                        ('pane === "steps" && c.flow',    "the decision flow"),
                        ('pane === "check" && c.check',   "the self-check")):
        check(guard in bare,
              f"{what} sits in its own pane",
              f"{what} is not behind `{guard}`, so it is on screen with everything else "
              f"and the tab is as long as it was when Dan asked for this.")

formes_body = _decl(TABS, "Formes") or ""
check("{memo}" in formes_body and "folds={true}" not in formes_body and "<details" not in formes_body,
      "Form keeps the pattern open",
      "the Mémo is behind a fold. It is the lesson, not the apparatus — the collapse rule's "
      "one exception — and since 16 Sep it is the only thing on the tab.")


print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
