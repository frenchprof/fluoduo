#!/usr/bin/env python3
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

RUN FROM THE REPO ROOT:  python3 verify/verify66-two-tier2-stops.py
"""
import json, os, re, sys

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

deck_by_fr = {it["fr"]: it for it in nouns_deck["items"]}
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
  plain1: blankKeysFor(1, plain), plain2: blankKeysFor(2, plain),
  flag1: blankKeysFor(1, flagged), flag2: blankKeysFor(2, flagged),
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
    check(got["plain2"] == ["verb", "article"],
          "unflagged ★★ still takes every blank",
          f"unflagged ★★ returns {got['plain2']}")
    check(got["flag1"] == ["color"],
          "flagged ★ takes the colour, not the leftmost noun — Dan's ladder, executed",
          f"flagged ★ returns {got['flag1']}, so the one-star colours card blanks the "
          "wrong half of « le feu rouge »")
    check(got["flag2"] == ["noun", "color"],
          "flagged ★★ takes both, in reading order",
          f"flagged ★★ returns {got['flag2']}")

# ── 4 · the heading band is SemiBold, in BOTH places that decide it ─────────
CSS = read("src/app/globals.css")
band = re.search(r"\.fluo-band-hand\s*\{([^}]*)\}", CSS)
check(band is not None and "font-weight: 600" in band.group(1),
      "the band class is font-weight 600",
      "`.fluo-band-hand` is not 600 — Dan picked SemiBold from a rendered specimen")
for p in ("src/components/PageBand.tsx", "src/components/ProfileContent.tsx"):
    src = read(p)
    check("fluo-band-hand" in src and "font-normal" not in
          (re.search(r'className="([^"]*fluo-band-hand[^"]*)"', src) or
           type("x", (), {"group": lambda s, n: ""})()).group(1),
          f"{os.path.basename(p)}: no font-normal utility fighting the class",
          f"{p} still pins `font-normal` on the band title. A Tailwind utility beats "
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
    check(labels == ["Learning path", "The idea", "The forms", "Practice", "Bonus", "Word list"],
          "all six tabs are English, in Dan's order",
          f"the tab strip reads {labels}. Dan was shown all-English, all-French and mixed "
          "on 2026-08-31 and chose all-English.")
    french = [l for l in labels if re.match(r"^(Le |La |Les |L')", l)]
    check(not french,
          "no French label left in the strip",
          f"these tabs are still French: {french}. One French tab among five English ones "
          "is the state a half-finished rename lands in, and it was explicitly rejected.")

# The learner-facing empty states name the tabs too — a rename that leaves
# those behind tells a learner to go to a tab that no longer exists.
empties = re.findall(r'Empty what="([^"]+)"', TABS)
stale = [e for e in empties if re.search(r"\bLe concept\b|\bLes formes\b|\bparcours\b|\blexique\b", e)]
check(not stale,
      "the empty-state messages use the new tab names",
      "these messages still send a learner to a French tab name that is no longer on the "
      "strip: " + "; ".join(stale))

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
