#!/usr/bin/env python3
"""
Grading unification (2026-08-11) — 7 implementations → 1.

The audit's complaint, verified before the fix: the same typed answer graded
differently depending on which drill asked. « l’eau » with a phone's curly
apostrophe passed Flip It and failed Complete It; « leau », « dix sept » and
a trailing period did the reverse; the Finale graded one paper two ways.

Now THE grader is lib/practice/cloze.ts — one normalizer (case, curly→
straight apostrophe, hyphens, punctuation, whitespace), one tier engine
(perfect / good / wrong, accents forgiven as "good" unless the item is
accent-strict), one alternates helper (gradeAgainst). Every typed-answer
surface imports it; the speech drills keep their SPEECH policy on top of the
shared transforms, never beside them.

Two kinds of assertion:

  A  BEHAVIOUR — cloze.ts is dependency-free, so it is compiled with tsc and
     the audit's divergence table is executed for real in node. These are the
     cases that used to disagree; they can never silently regress to grep.
  B  STRUCTURE — the six former private copies are gone, every grading
     surface imports the shared grader, and no new NFD normalizer appears in
     a grading file.

Run from the repo root:  python3 verify/verify-grading.py
"""
import json, os, re, shutil, subprocess, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── A · behaviour: compile THE grader and run the divergence table ─────────
TMP = ".tmp-verify-grading"
shutil.rmtree(TMP, ignore_errors=True)
r = subprocess.run(
    ["npx", "tsc", "src/lib/practice/cloze.ts", "--outDir", TMP,
     "--module", "commonjs", "--target", "es2020", "--skipLibCheck"],
    capture_output=True, text=True)
check(r.returncode == 0, "cloze.ts compiles standalone (dependency-free)",
      f"cloze.ts failed to compile alone: {r.stdout[-300:]}{r.stderr[-300:]}")

CASES = """
const g = require("./%s/cloze.js");
const out = [];
const t = (name, got, want) => out.push([name, got, want, got === want]);
t("curly-apostrophe folds", g.normalize("l\\u2019eau") === g.normalize("l'eau"), true);
t("leau = l'eau", g.gradeAnswer("leau", "l'eau"), "perfect");
t("curly l\\u2019eau = l'eau", g.gradeAnswer("l\\u2019eau", "l'eau"), "perfect");
t("dix sept = dix-sept", g.gradeAnswer("dix sept", "dix-sept"), "perfect");
t("cest = c'est", g.gradeAnswer("cest", "c'est"), "perfect");
t("fatigue -> fatigu\\u00e9 is GOOD not perfect", g.gradeAnswer("fatigue", "fatigu\\u00e9"), "good");
t("Fatigu\\u00e9 capital forgiven", g.gradeAnswer("Fatigu\\u00e9", "fatigu\\u00e9"), "perfect");
t("trailing period forgiven", g.gradeAnswer("il est huit heures.", "il est huit heures"), "perfect");
t("ou for o\\u00f9 lenient = good", g.gradeAnswer("ou", "o\\u00f9"), "good");
t("ou for o\\u00f9 STRICT = wrong", g.gradeAnswer("ou", "o\\u00f9", {accents: "strict"}), "wrong");
t("o\\u00f9 for o\\u00f9 strict = perfect", g.gradeAnswer("o\\u00f9", "o\\u00f9", {accents: "strict"}), "perfect");
t("empty input is wrong", g.gradeAnswer("", "l'eau"), "wrong");
t("alternates: best tier wins", g.gradeAgainst("velo", ["bicyclette", "v\\u00e9lo"]), "good");
t("alternates: exact alt is perfect", g.gradeAgainst("v\\u00e9lo", ["bicyclette", "v\\u00e9lo"]), "perfect");
t("de for d' gap capped at good", g.gradeGap("de", "d'"), "good");
console.log(JSON.stringify(out));
""" % TMP

behaviour = []
if r.returncode == 0:
    n = subprocess.run(["node", "-e", CASES], capture_output=True, text=True)
    check(n.returncode == 0, "the divergence table executed",
          f"node run failed: {n.stderr[-300:]}")
    if n.returncode == 0:
        behaviour = json.loads(n.stdout.strip().splitlines()[-1])
        for name, got, want, ok in behaviour:
            check(ok, f"behaviour: {name}",
                  f"behaviour REGRESSED: {name} — got {got!r}, wanted {want!r}")
shutil.rmtree(TMP, ignore_errors=True)

# ── B · structure: the copies are gone, everyone imports THE grader ────────
cloze = read("src/lib/practice/cloze.ts")
check("gradeAgainst" in cloze and '"strict"' in cloze,
      "cloze.ts exports gradeAgainst and the accent-strict option",
      "cloze.ts is missing gradeAgainst / the accents option")

GRADING_FILES = {
    "src/app/practice/flip-it/shared.tsx": "judgePart (drill + deck table)",
    "src/app/practice/say-it/[collectionId]/SayItContent.tsx": "Say It (speech)",
    "src/app/practice/grammarathon/finale/FinaleContent.tsx": "Finale",
    "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx": "SpecuLearn (speech)",
    "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx": "GramMarathon",
    "src/app/lessons/pager/LessonPager.tsx": "lesson pager",
    "src/app/practice/ecoutexte/EcouTexte.tsx": "ÉcouTexte",
    "src/app/conjugaison/embed/page.tsx": "ConjugaZone",
}
for path, who in GRADING_FILES.items():
    src = strip_comments(read(path))
    check('from "@/lib/practice/cloze"' in src or 'from "../shared"' in src
          or 'from "@/app/practice/flip-it/shared"' in src,
          f"{who} grades through the shared grader",
          f"{who} ({path}) does not import the shared grader")
    check('normalize("NFD")' not in src,
          f"{who} has no private NFD normalizer",
          f"{who} ({path}) still carries a private accent-stripper")

shared = strip_comments(read("src/app/practice/flip-it/shared.tsx"))
check("function norm" not in shared and "normCase" not in shared,
      "flip-it's norm and normCase are gone (norm was dead, normCase diverged)",
      "flip-it still carries a private normalizer (norm/normCase)")
check("gradeAgainst(val ?? \"\", [p.correct, ...(p.alt ?? [])])" in shared,
      "judgePart delegates letters to gradeAgainst (articles stay exact)",
      "judgePart does not grade through gradeAgainst")

# COMPLETE IT IS GONE, and its two rows above with it (2026-08-31). The Memo
# ladder's Moyen and Difficile ARE one- and two-piece completion (#97), the
# popup's door moved to Memo (#99), and Dan cut the orphan route that was left
# ("iComplete is to be deleted"). Its `item.alt` row went too: alt answers are
# still honoured, but by the shared grader those tiers call — every remaining
# entry in GRADING_FILES is asserted to import it, which is the stronger claim
# the alt row was standing in for. See verify70.

finale = strip_comments(read("src/app/practice/grammarathon/finale/FinaleContent.tsx"))
check("normA" not in finale and "normD" not in finale,
      "the Finale's two private normalizers are gone",
      "the Finale still grades one paper two ways (normA/normD survive)")
check('accents: "strict"' in finale,
      "Finale strict items = the accents option, nothing more",
      "Finale's strict path does not use the shared accents option")

runner = strip_comments(read("src/lib/pretests/runner.ts"))
check("choice === item.answer" in runner and 'normalize("NFD")' not in runner,
      "the pretest runner stays exact-match (MCQ picks are identity, not typing)",
      "the pretest runner changed — MCQ picks must stay exact")

print("\ngrading unification check (7 → 1)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
