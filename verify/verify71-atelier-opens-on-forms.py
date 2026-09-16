#!/usr/bin/env python3
"""
An atelier's Mémo opens on the model and its words, not on « Choose your level ».

Dan, 2026-08-31: *"Atelier's Memo is to open on the range of sentences and
vocabulary one is expected to use or understand. Simple as that."*

WHY IT WAS WRONG. Every lesson opened on L'exercice, which is the entry-level
chooser — Facile / Moyen / Difficile / Bonus. For a stop with a deck and a
pre-test behind it that is right: the learner has met the material and is being
asked how hard they want it. For an ATELIER it is a question they cannot yet
answer, about a dialogue they have not read.

That gap opened the same day and by the same fix. Until 31 Aug an atelier
learner did meet the model early — the SIO popup printed the whole dialogue.
That had to stop, because the dialogue is that stop's PRE-TEST ANSWER KEY
(verify66, and content/pretests/ateliers.gen.ts builds every option from a line
of it). Taking it out of the popup left the model correct but far: two taps and
a level chooser away. This closes that.

FORMS IS EXACTLY WHAT DAN NAMED. It is the one panel holding both halves —
« Le modèle », the whole dialogue with « Tout écouter », and under it every
word in the lesson (the two were joined on 31 Aug: "can we put Words under
Forms?"). "The range of sentences AND vocabulary" is that panel, and no other.

WHAT IS PINNED

  1  The opening tab is a PROP with a default, and the default is unchanged —
     an ordinary lesson still opens on the exercise.
  2  It seeds state and never controls it: once a learner taps a tab, a
     re-render must not pull them back.
  3  The atelier case is chosen by `sio.isProduction`, never by the shape of a
     deck id — production is the property that makes the model the point, and
     a seventh atelier is covered without anyone naming it.
  4  Forms still holds BOTH halves. If the words leave that panel, "sentences
     and vocabulary" stops being one place and this rule half-fails silently.
  5  The atelier Mémos are still generated from ATELIER_DIALOGUES, so the
     sentences a learner arrives at cannot drift from the model they perform.
  6  The dialogue has NOT come back to the popup — the reason this page has to
     carry it (cross-check on verify66's subject).

Run from the repo root:  python3 verify/verify71-atelier-opens-on-forms.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped — both files explain this change at
    length, and "formes", "isProduction" and "atelier" all appear in that
    prose. A raw scan would pass on the documentation."""
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

TABS = "src/app/lessons/pager/LessonTabs.tsx"
PAGER = "src/app/lessons/pager/LessonPager.tsx"
MEMOS = "src/content/memos.tsx"
DETAIL = "src/app/SioDetail.tsx"

tabs, pager = code(read(TABS)), code(read(PAGER))
memos, detail = code(read(MEMOS)), code(read(DETAIL))

ok(bool(tabs) and bool(pager), "the lesson pager and its tabs exist",
   f"{TABS} or {PAGER} is missing")

# ---- 1 · the opening tab is a prop, and the ateliers override it ----------
#
# THE DEFAULT IS « Idée » NOW, NOT « Exercice » (Dan, 2026-09-13: *"MneMemo is
# still landing immediately on Exercice, it should land on Idee"*). This clause
# read `open = "exercice"` and its failure text said changing it "is not what
# Dan asked for" — which was true when it was written and is now the opposite
# of what he asked for.
#
# WHAT THIS CHECK IS ACTUALLY FOR IS UNCHANGED, which is why the assertion
# moves rather than goes: the atelier override below only means something if
# ordinary lessons open somewhere ELSE. So the default is still pinned — to the
# tab Dan named — and the two must differ.
_default = re.search(r'open\s*=\s*"(\w+)"', tabs)
ok(_default is not None and _default.group(1) == "concept",
   "an ordinary lesson opens on « Idée » — the lesson, not its exercise",
   f"the default opening tab is {_default.group(1) if _default else 'gone'!r}, not 'concept'. "
   "Dan, 13 Sep: MneMemo must land on Idée, not Exercice.")
ok(_default is not None and _default.group(1) != "formes",
   "and it is not the ateliers' own tab, so their override still says something",
   "the default is now 'formes', which makes the atelier override below a no-op — "
   "the clause would pass while testing nothing")

# ---- 2 · it SEEDS state, never controls it -------------------------------
# useState(open) reads the prop once. useState + an effect that re-applies it,
# or `tab = open`, would drag a learner back to Forms every render — they tap
# Pract., something re-renders, and they are on Forms again.
ok(re.search(r"useState<TabKey>\(open\)", tabs) is not None,
   "the prop seeds the tab state once",
   "the opening tab no longer seeds useState — either it is hardcoded again, or it now CONTROLS the tab and a learner cannot leave it")
seeded = re.search(r"setTab\(open\)", tabs) is None
ok(seeded,
   "nothing re-applies the prop after mount — the learner's tap wins",
   "the prop is re-applied after mount: tapping another tab would bounce back to Forms")

# ---- 3 · the atelier case comes from isProduction, not a deck-id shape ----
mount = pager[pager.find("<LessonTabs"):]
mount = mount[: mount.find("/>") + 2]
ok("open=" in mount,
   "the pager tells the tabs where to open",
   "the pager passes no opening tab — an atelier would land on « Choose your level » again")
ok('"formes"' in mount,
   "an atelier opens on Forms",
   "Forms is no longer the atelier's opening tab — Dan asked for the sentences and the vocabulary")
ok("sio?.isProduction" in mount or "sio.isProduction" in mount,
   "the atelier case is read from the stop, not from a deck id",
   "the opening tab is chosen some other way; a deck-id prefix test would miss a seventh atelier and could catch an ordinary deck named like one")
ok(re.search(r'startsWith\("atelier', mount) is None,
   "no deck-id prefix test",
   "the pager tests the deck id's shape — ids are not a schema, and this breaks the moment one is renamed")

# ---- 4 · Forms holds BOTH halves -----------------------------------------
formes = tabs[tabs.find("function Formes("):]
formes = formes[: formes.find("\n}\n") + 3]
# REVERSED 2026-09-16 — Dan, of the word list under the Mémo: *"That is
# actually the MemoiRecall section. We do not need to repeat it if it is
# already in there."* So Form holds the MÉMO — the model sentences an atelier
# opens on, which is the half of "the range of sentences and vocabulary" that
# lives in a lesson — and the vocabulary is MémoiRecall's, one tap away on the
# same goal, not drawn a second time here. The clause now pins that Form still
# renders the Mémo and does NOT draw the deck again.
ok("memo" in formes and "Lexique" not in formes and "/practice/flip-it/" in formes,
   "Form holds the pattern, with MémoiRecall itself framed under it (16 Sep)",
   "Form has lost the Mémo it opens on, draws the deck's words as a table again, or no "
   "longer frames MémoiRecall — Dan: the station is part of the lesson, in the slot the "
   "list held")
ok(re.search(r'key:\s*"formes"', tabs) is not None,
   "\"formes\" is a real tab in the strip",
   "there is no formes tab; the pager would ask for one that does not exist")

# ---- 5 · the sentences cannot drift from the model -----------------------
ok("ATELIER_DIALOGUES" in memos,
   "the atelier Mémos are generated from the model dialogue",
   "the atelier Mémos are authored by hand again — the sentences a learner reads could drift from the ones they perform")
ok(re.search(r"DECK_MEMOS\[`atelier-\$\{sioId\.toLowerCase\(\)\}`\]", memos) is not None,
   "every atelier deck gets its Mémo automatically",
   "the atelier Mémos are registered one by one; a seventh atelier would open on Forms with nothing in it")

# ---- 6 · and the dialogue has NOT gone back to the popup -----------------
# The reason this page must carry it. Cross-checked here as well as in
# verify66, because the two changes only make sense together: taking the model
# out of the popup is what made its distance from the learner a problem.
ok("DialoguePlayer" not in detail and "getAtelier" not in detail,
   "the popup still does not print the model — which is why Forms must",
   "the popup prints the model dialogue again: that is the atelier pre-test's answer key, and this page's job would be done twice")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
