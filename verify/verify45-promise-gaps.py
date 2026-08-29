#!/usr/bin/env python3
"""
Two stops whose DECK could not keep a promise its lesson already kept
(2026-08-29, Dan: "fix it and merge pls").

Numbered 45, not 44: verify44-tour-targets.py already exists. Peers renamed
their own 42 to 43 for exactly this reason a few hours ago — two files sharing
a number is how verify31-wordrill sat unwired for a fortnight, the workflow
naming the number once while the other never ran. I walked straight into it
anyway; checking `ls verify/` before choosing a number is cheaper than the
fortnight.

Peers' verify43 covers stops 3, 17 and 18, where neither the lesson nor the
deck carried the act. These two are a different shape, and the difference
matters — I got it wrong out loud first and had to correct it:

  SIO-001  "use M./Mme as forms of address" is in the competence, and the
           LESSON does teach it (se-presenter.tsx has a `title` task and the
           Mémo's « Bonjour, Madame Martin »). The DECK did not: sappeler.json
           held `Monsieur` zero times and `Madame` once, inside
           « Vous vous appelez Madame Martin », where Madame is part of a NAME
           and not a form of address. So every card-driven activity — 4Mémoire,
           WorDrill, iComplete, GramMarathon, Letris — could never show it.

  SIO-005  "give the matching mnemonic object for each" is what the stop is
           graded on, and the deck carried twelve bare colour words. Eleven
           mnemonics came from the v9 handoff sheet; `le sable beige` is Dan's
           call of 2026-08-29, because the sheet simply stops before beige.

THE POINT OF BOTH: a lesson teaching something the deck cannot show is not
"taught" — the lesson is one screen and the cards are the other five. What is
asserted here is the DECK, deliberately, because the lesson was never the gap.

Run from the repo root:  python3 verify/verify45-promise-gaps.py
"""
import json, os, re, sys

FAIL, OK = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def deck(name):
    with open(f"src/content/collections/{name}.json", encoding="utf-8") as f:
        d = json.load(f)
    return d["items"] if isinstance(d, dict) else d


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── SIO-001 · M./Mme as a form of ADDRESS, in the deck ────────────────────
sappeler = deck("sappeler")
# The vocative is what the promise asks for, and it is punctuated: a title
# addressed TO someone is set off by a comma (« Bonjour, Madame Martin. »,
# « …vous appelez, Madame ? »). A title inside a name carries no comma, which
# is exactly why the old « Vous vous appelez Madame Martin » did not count —
# match on the punctuation, not on the bare word, or this check passes on the
# very card that made the gap.
VOC = re.compile(r",\s*(Monsieur|Madame|M\.|Mme)\b")
voc = [i["id"] for i in sappeler if VOC.search(i["fr"])]
titles = {t for i in sappeler for t in VOC.findall(i["fr"])}
check(len(voc) >= 2,
      f"sappeler addresses someone by title on {len(voc)} cards ({', '.join(voc)})",
      "sappeler has no card addressing someone as M./Mme — SIO-001 promises it")
check({"Monsieur", "Madame"} <= titles,
      "both Monsieur and Madame are addressed, not just one",
      f"only these titles are used in address: {sorted(titles) or 'none'}")

# ── SIO-005 · a mnemonic object on every colour ───────────────────────────
colors = deck("colors")
missing = [i["id"] for i in colors if not (i.get("example") or "").strip()]
check(not missing,
      f"all {len(colors)} colours carry a mnemonic object",
      f"colours with no mnemonic: {missing} — SIO-005 is graded on giving one")
# The mnemonic must actually contain its colour word, or it is a phrase about
# something else: « le citron jaune » teaches jaune, « le citron » does not.
# The colour word is `fr` minus its article, and the article may be ELIDED:
# splitting on spaces gives "l'orange" for colors-02, which is not a substring
# of "le fluo orange" — the check fired on its own bad extraction, not on the
# content. Strip le / la / l' properly.
ART = re.compile(r"^(?:le|la|les)\s+|^l['\u2019]", re.I)
mismatch = [i["id"] for i in colors
            if (i.get("example") or "").strip()
            and ART.sub("", i["fr"]).lower() not in i["example"].lower()]
check(not mismatch,
      "every mnemonic contains the colour it teaches",
      f"mnemonic does not name its own colour: {mismatch}")
# All eleven from the sheet are masculine (le X + adj); so is Dan's beige.
badart = [i["id"] for i in colors
          if (i.get("example") or "").strip() and not i["example"].startswith("le ")]
check(not badart,
      "every mnemonic is le + noun + adjective, one grammatical shape",
      f"mnemonic is not « le … »: {badart}")

print("\npatch 45 check (deck promises: SIO-001 M./Mme, SIO-005 mnemonics)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
