#!/usr/bin/env python3
"""G-COMPRIS! — a reading question is answerable from the document, and its
answer is a word the course taught.

Dan, 2026-09-15: *"Call the reading exercises : G-Compris!"*, and, when the
shape of the questions was put to him: *"it is not so much about reading per
se, but what those reading questions are really testing"*, then *"Ok but it
must not look like we tailored exercises around the test"*.

THE TWO WAYS A READING BANK GOES WRONG ARE BOTH INVISIBLE ON SCREEN, which is
the whole reason this file exists rather than a note in the content:

  · AN ANSWER THE TEXT NEVER GIVES.  A typed answer is graded against a string
    somebody wrote in a different file from the document. Change « mercredi »
    to « jeudi » in the text and the question keeps marking « mercredi »
    right — the page looks perfect and the learner is told they are wrong for
    reading correctly. Clause 4 grades the ANSWER AGAINST THE TEXT, which is
    the only place the truth is.

  · AN ANSWER THE COURSE NEVER TAUGHT.  Reading is receptive, so a text may
    carry « bibliothèque » or « gratuit » the way any real note would. What it
    may never do is make an untaught word the ANSWER — you cannot mark somebody
    wrong for something nobody told them. That is verify40's ruling (*"remember
    it, but don't score it"*, 27 Aug) applied a third time, and clause 2 holds
    the containing half of it: every scene is built from units 0–2, which is
    the same *"Stops 0 to 30 only please"* that scoped the Finale.

AND THE PARSER ASSERTS HOW MUCH IT PARSED (clause 1). `verify760` read 19 of
its 21 steps and passed, having never looked at two of them; a bank check that
silently matches half the questions reports exactly the same thing as one that
matches all of them. So the regex count is cross-checked against a plain tally
of declared `id:` lines, and a mismatch FAILS.

Run from the repo root:  python3 verify/verify770-gcompris.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def deaccent(s):
    table = str.maketrans("àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ",
                          "aaaeeeeiioouuucAAAEEEEIIOOUUUC")
    return s.translate(table)


def fold(s):
    """Lower-cased, unaccented, apostrophes normalised — the same folding the
    grader does, so this check agrees with what a learner actually sees."""
    return deaccent(s.lower()).replace("’", "'").replace("'", " ")


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

src = read("src/content/gcompris.ts")
ok(bool(src), "src/content/gcompris.ts is present", "src/content/gcompris.ts is missing")

# ── 1 · THE PARSE, AND HOW MUCH OF IT ──────────────────────────────────────
# Anchored on indentation, which is what tells a scene from a question: a scene
# opens at two spaces, a question inside it at six.
SCENE = r'\n  \{\n    id: "([^"]+)",([\s\S]*?)\n  \},'
QUESTION = r'\n      \{\n        id: "([^"]+)",([\s\S]*?)\n      \},'

scenes = re.findall(SCENE, src)
declared_scenes = len(re.findall(r'^    id: "', src, re.M))
ok(len(scenes) == declared_scenes and len(scenes) >= 8,
   f"{len(scenes)} scenes read from the bank (all {declared_scenes} declared)",
   f"parsed {len(scenes)} scenes but {declared_scenes} are declared. The parse "
   "is dropping scenes, so every clause below is silently skipping them too. "
   "Fix SCENE, never the data.")

qs = []          # (scene_id, q_id, body)
for sid, body in scenes:
    for qid, qbody in re.findall(QUESTION, body):
        qs.append((sid, qid, qbody))
declared_qs = len(re.findall(r'^        id: "', src, re.M))
ok(len(qs) == declared_qs and len(qs) >= 30,
   f"{len(qs)} questions read across those scenes (all {declared_qs} declared)",
   f"parsed {len(qs)} questions but {declared_qs} are declared. Same fault as "
   "above, one level down — and a floor of 30, so an emptied bank cannot pass "
   "this file by having nothing left to check.")


def field(body, name):
    m = re.search(rf'\n\s*{name}: "((?:[^"\\]|\\.)*)"', body)
    return m.group(1).replace('\\"', '"') if m else None


# THE BANK SHARES ONE CONSTANT FOR VRAI/FAUX, and the first version of this
# parser did not know it. `const VF = ["Vrai", "Faux"]` means ten questions are
# written `options: VF` — no array literal on the line — so they matched no
# array and were read as TYPED questions, whose answer (« Faux ») is nowhere in
# the document. The check failed loudly, which is the only reason it was not
# quietly wrong in the other direction. Clause 3 had also never seen one.
ALIASES = {m.group(1): [s for s in re.findall(r'"([^"]*)"', m.group(2))]
           for m in re.finditer(r'\nconst ([A-Z][A-Z0-9_]*) = \[([^\]]*)\];', src)}


def strings(body, name):
    """The string members of an array field, or None when the field is absent.

    Resolves a bare identifier (`options: VF`) through the module's own
    constants, so a question written the short way is not silently skipped."""
    m = re.search(rf"\n\s*{name}: \[([\s\S]*?)\],", body)
    if m:
        return [s.replace('\\"', '"') for s in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))]
    alias = re.search(rf"\n\s*{name}: ([A-Z][A-Z0-9_]*),", body)
    if alias:
        got = ALIASES.get(alias.group(1))
        if got is None:
            FAIL.append(f"`{name}: {alias.group(1)}` names a constant this check "
                        "cannot resolve, so that question would be read as if it "
                        "had no options at all. Add it to ALIASES.")
        return got
    return None


TEXTS = {}
UNITS = {}
for sid, body in scenes:
    m = re.search(r"\n    text: `([\s\S]*?)`,", body)
    TEXTS[sid] = m.group(1) if m else ""
    u = re.search(r"\n    unit: (\d)", body)
    UNITS[sid] = int(u.group(1)) if u else -1

ok(all(TEXTS.values()),
   f"every scene carries its document ({len(TEXTS)} texts)",
   "a scene parsed with an empty text: " +
   ", ".join(s for s, t in TEXTS.items() if not t) +
   ". Every clause that reads the document would pass over nothing.")

# ── 2 · NOTHING REACHES PAST STOP 30 ───────────────────────────────────────
past = sorted(s for s, u in UNITS.items() if u not in (0, 1, 2))
ok(not past,
   f"every scene is built from units 0–2 ({len(UNITS)} scenes)",
   f"THESE SCENES ARE OUTSIDE THE COURSE SO FAR: {past}. Dan, 2026-09-14: "
   "*\"Stops 0 to 30 only please\"* — units 0, 1 and 2. A reading text made of "
   "unit 3 language asks a learner to be marked on material nobody has taught "
   "them yet, which is the one thing reading practice must not do.")

# ── 3 · AN MCQ'S ANSWER IS ONE OF ITS OWN OPTIONS ──────────────────────────
# Spelled identically, because that is how the option is rendered AND how the
# answer is graded. A near-miss here is a question nobody can get right, and it
# looks completely normal in the diff.
orphan, thin = [], []
for sid, qid, body in qs:
    opts = strings(body, "options")
    ans = field(body, "answer")
    if opts is None:
        continue
    if ans not in opts:
        orphan.append(f"{sid}/{qid} (answer « {ans} » is not among its options)")
    if len(opts) < 2:
        thin.append(f"{sid}/{qid}")
# AND HOW MANY QUESTIONS THIS CLAUSE ACTUALLY LOOKED AT. `options:` is declared
# once per tap-one question, literal or aliased; if the two disagree the parser
# is skipping some, which is how ten Vrai/Faux questions escaped it on the first
# run of this file.
mcq = [1 for _, _, b in qs if strings(b, "options") is not None]
declared_mcq = len(re.findall(r"^        options: ", src, re.M))
ok(len(mcq) == declared_mcq and len(mcq) >= 20,
   f"{len(mcq)} tap-one questions found (all {declared_mcq} declared)",
   f"found {len(mcq)} questions with options but {declared_mcq} declare one. "
   "The option parse is skipping questions — it did exactly this with "
   "`options: VF` before ALIASES existed, and the clause below then asserted "
   "nothing about ten of them.")
ok(not orphan and not thin,
   "every tap-one question's answer is one of its own options, spelled the same",
   "AN OPTION LIST DOES NOT CONTAIN ITS ANSWER: " + "; ".join(orphan + thin) +
   ". Nobody can answer that question correctly, and the page looks fine.")

# Vrai/Faux is a PAIR and stays in that order — the component refuses to
# shuffle a binary, so the data must spell it the way it is read.
vf_bad = []
for sid, qid, body in qs:
    opts = strings(body, "options") or []
    if "Vrai" in opts or "Faux" in opts:
        if opts != ["Vrai", "Faux"]:
            vf_bad.append(f"{sid}/{qid} → {opts}")
ok(not vf_bad,
   "every true/false question is exactly [Vrai, Faux], in that order",
   "a true/false question is not the plain pair: " + "; ".join(vf_bad) +
   ". The reader leaves a binary unshuffled on purpose — swapping the halves of "
   "Vrai/Faux is not variety, it is a trap — so the order here is what a "
   "learner sees.")

# ── 4 · A TYPED ANSWER IS SOMETHING THE DOCUMENT ACTUALLY SAYS ─────────────
# THE CLAUSE THIS FILE EXISTS FOR. A typed answer is graded against a string
# written in a different part of the file from the text it is about. Edit the
# text — a day, a room number, a nationality — and the grader keeps marking the
# old one right, with nothing anywhere to notice.
missing = []
for sid, qid, body in qs:
    if strings(body, "options") is not None:
        continue  # a tap-one question is held by clause 3
    ans = field(body, "answer")
    alts = strings(body, "also") or []
    hay = fold(TEXTS.get(sid, ""))
    if not any(fold(a) in hay for a in [ans] + alts if a):
        missing.append(f"{sid}/{qid} (« {ans} », also {alts or 'none'})")
ok(not missing,
   f"every typed answer appears in its own document "
   f"({sum(1 for *_, b in qs if strings(b, 'options') is None)} typed questions)",
   "AN ANSWER THE TEXT NEVER GIVES: " + "; ".join(missing) + ". The learner "
   "reads the document, answers what it says, and is marked wrong. Either the "
   "text changed under the question, or the answer needs the spelling the text "
   "uses added to `also`.")

# ── 5 · EVERY QUESTION EXPLAINS THE RULE, NOT THE LINE ─────────────────────
# Dan: *"it is not so much about reading per se, but what those reading
# questions are really testing"*. The `why` is where a question states what it
# was testing, and it is worth nothing if it merely quotes the sentence back —
# quoting teaches the text, naming the rule teaches the next text.
no_why, echo = [], []
for sid, qid, body in qs:
    why = field(body, "why")
    if not why or len(why) < 40:
        no_why.append(f"{sid}/{qid}")
        continue
    if fold(why) in fold(TEXTS.get(sid, "")):
        echo.append(f"{sid}/{qid}")
ok(not no_why and not echo,
   f"every question says which rule it turned on ({len(qs)} explanations)",
   "THESE QUESTIONS EXPLAIN NOTHING: " + "; ".join(no_why + echo) + ". A `why` "
   "that is missing, one line long, or a straight quotation of the text is not "
   "an explanation — it is the answer again. Name the grammar: « son agrees "
   "with the thing owned, not the owner ».")

# ── 6 · IDS ARE UNIQUE, AND THE ROUTES THEY NAME WERE BUILT ────────────────
sids = [s for s, _ in scenes]
dupe_s = sorted({s for s in sids if sids.count(s) > 1})
pairs = [f"{s}/{q}" for s, q, _ in qs]
dupe_q = sorted({p for p in pairs if pairs.count(p) > 1})
ok(not dupe_s and not dupe_q,
   f"every scene id and question id is unique ({len(sids)} + {len(pairs)})",
   f"DUPLICATE IDS: scenes {dupe_s}, questions {dupe_q}. An id is the address "
   "of a page and the key of an answer; two of either collide silently.")

if not os.path.isdir("out"):
    FAIL.append("`out/` is missing, so no scene route could be resolved. CI "
                "builds before the checks; locally run "
                "`NEXT_PUBLIC_OPEN_APP=1 npm run build` first.")
else:
    unbuilt = [s for s in sids
               if not os.path.isfile(f"out/gcompris/{s}/index.html")
               and not os.path.isfile(f"out/gcompris/{s}.html")]
    ok(not unbuilt,
       f"every scene has a page in the export ({len(sids)} routes)",
       f"THESE SCENES HAVE NO PAGE: {unbuilt}. `generateStaticParams` reads the "
       "same bank, so an unbuilt id means the route file stopped reading it — "
       "the shelf would link to a 404.")

# ── 7 · THE ACTIVITY IS REGISTERED, UNDER THE NAME DAN GAVE IT ─────────────
reg = read("src/content/activities.ts")
ok('key: "gcompris"' in reg and 'name: "G-Compris!"' in reg and 'family: "tools"' in reg.split('key: "gcompris"')[-1][:200],
   "G-Compris! is in the registry, in the 🛠️ Texts family",
   "the registry row is missing or renamed. Dan named it on 2026-09-15 — "
   "*\"Call the reading exercises : G-Compris!\"* — and put it in the family he "
   "renamed from « Write » to « Texts » the same day so a text you READ would "
   "have somewhere to be. One name, one place, spelled once.")

print("\nG-Compris! holds (15 Sep)\n" + "-" * 70)
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
