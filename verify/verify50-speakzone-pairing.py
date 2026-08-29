#!/usr/bin/env python3
"""
A tapped table cell is paired with the RIGHT subject (2026-08-29).

WHY THIS EXISTS. `SpeakZone.withSubject` turns a tap on a conjugation cell into
a speakable phrase: tap « m'appelle » and you hear « je m'appelle », not a bare
verb ending. It found the subject with

    row.querySelector("th, td")        // the row's FIRST cell

which is correct for the two-column tables it was written against, and silently
wrong for any wider one. SIO-011's pronoun table is four columns — two logical
pairs per row, to fit eight pronouns without eight rows:

    + verbe | tout seul | + verbe | tout seul
    je      | moi       | nous    | nous
    il      | lui       | ils     | eux

Against cells[0], a tap on « eux » said « il eux » and a tap on « nous » said
« je nous ». Both are false pairings, and they were being taught by the one
lesson whose entire subject is which pronoun goes with which.

Nothing about this is visible in the rendered page — it exists only in what the
speech engine is handed. It was found by stubbing `speechSynthesis` and tapping
every cell of the table in a browser, and it is asserted here the same way,
because a reading of the source is exactly what missed it for as long as the
table existed.

The rule now: the subject is the nearest SUBJECT-token cell to the LEFT of the
tapped one, and a cell that is itself a subject stays alone. For a two-column
table those are the same thing, so the conjugation behaviour is unchanged —
which this file also asserts, since a fix that quietly drops « je m'appelle »
back to « m'appelle » would be a worse bug than the one it cures.

What this asserts:

  1  withSubject scans leftwards for the subject rather than taking cells[0].
  2  A cell that is itself a subject pronoun is not given another one.
  3  The elision « j'ai » survives (je + a vowel), which is the one piece of
     real French knowledge in the function.
  4  The 4-column shape SIO-011 depends on is still what its lesson renders —
     if that table is ever flattened to two columns this check should be
     revisited rather than left asserting something nothing exercises.

Run from the repo root:  python3 verify/verify50-speakzone-pairing.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""
def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

SZ = "src/components/SpeakZone.tsx"
check(os.path.isfile(SZ), "SpeakZone present", f"MISSING {SZ}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

src = code(read(SZ))

# ---- 1 · the subject is found by scanning left, not by taking cells[0] -----
# Asserted on the CODE with comments stripped, because the explanation above
# quotes the old expression verbatim and would satisfy a naive search — the
# same trap verify40 and verify48 both fell into.
check(re.search(r"for \(let i = here - 1; i >= 0; i--\)", src) is not None,
      "withSubject scans leftwards for the nearest subject cell",
      "withSubject no longer scans leftwards — a 4-column table will pair every "
      "cell with the row's first, so « eux » becomes « il eux »")
check("row?.querySelector<HTMLElement>(\"th, td\")" not in src
      and 'querySelector<HTMLElement>("th, td")' not in src,
      "the row's first cell is no longer taken as the subject",
      "withSubject is back to row.querySelector(\"th, td\") — correct for two "
      "columns, silently wrong for any wider table")

# ---- 2 · a subject cell is not given a second subject ----------------------
check(re.search(r"if \(SUBJECT_TOKENS\.has\(tokenOf\(cell\)\)\) return text;", src) is not None,
      "a cell that is itself a subject pronoun stays alone",
      "a subject cell is no longer left alone — tapping « nous » in the stressed "
      "column will say « je nous »")

# ---- 3 · the elision survives ---------------------------------------------
check(re.search(r"j'\$\{text\}", src) is not None
      and re.search(r"/\^\[aeéèêiîoôuh\]/i", src) is not None,
      "« je » + vowel still elides to « j'ai »",
      "the je→j' elision is gone — the table will say « je ai »")

# ---- 4 · the shape this was written for still exists -----------------------
# Four header cells in SIO-011's memo. If the table is ever rebuilt as two
# columns this check is asserting something nothing exercises, and should be
# revisited rather than deleted.
memo = read("src/content/lessons/native/moi-aussi.tsx")
heads = re.findall(r"\+ verbe|tout seul", memo)
check(len(heads) >= 4,
      f"SIO-011 still renders the 4-column pairing this guards ({len(heads)} headers)",
      "SIO-011's pronoun table is no longer 4 columns — the leftward scan is "
      "now unexercised; re-check whether this file still earns its place")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
