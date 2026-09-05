#!/usr/bin/env python3
"""
The Mémo's forms are its heroes (Dan, 2026-08-31).

"The forms themselves (the 'heros' of the lesson) are not salient enough.
They should be in bold or something. … We need to sort out the UX-UI for the
Memo. unify everything."

The audit that produced this check: 44 of 45 lesson Mémos already share one
wrapper and one display heading, so the UNIFIED part was never the box — it
was what happens inside. Most Mémos set their French forms bold and their
scaffolding light; a few (salutations above all, the one Dan was reading)
had it INVERTED — the situation labels were bold and the forms were plain
paragraphs. Same data, opposite hierarchy, and only visible by comparing two
lessons side by side.

So the rule, now checked instead of hoped for:

  1  In every native lesson's Mémo, a French form line — a <p lang="fr"> —
     must be SALIENT: bold (font-black / font-bold on the line, or a <b>
     inside it). English glosses and labels are not lang="fr" paragraphs, so
     they are free to stay light. Same rule over the deck Mémos in
     content/memos.tsx (its <B> and <Pill> helpers count — they render bold).
  2  The salutations exemplar keeps its corrected hierarchy: four bold form
     lines, four caption labels — the label may not be the bolder element
     again.
  3  The shared wrapper stays shared: every lesson Mémo opens with the one
     card wrapper and the one display heading, so "unify everything" cannot
     quietly un-unify.

Run from the repo root:  python3 verify/verify65-memo-forms.py
"""
import glob, os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

WRAPPER = 'rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4'
HEADING = "cahier-display"

def memo_block(src):
    m = re.search(r"\n  memo: \(\n(.*?)\n  \),\n", src, re.S)
    return m.group(1) if m else None

def naked_fr_lines(block):
    """<p lang="fr"> paragraphs with no bold anywhere on or in them."""
    out = []
    for h in re.finditer(r'<p[^>]*lang="fr"[^>]*>((?:(?!</p>).)*?)</p>', block, re.S):
        whole, inner = h.group(0), h.group(1)
        if ("font-black" in whole or "font-bold" in whole
                or "<b" in inner or "<B" in inner or "<Pill" in inner):
            continue
        out.append(" ".join(whole.split())[:90])
    return out

# ── 1 · every lesson Mémo sets its French form lines bold ────────────────────
lessons = sorted(glob.glob("src/content/lessons/native/*.tsx"))
lessons = [p for p in lessons if os.path.basename(p) not in ("index.tsx", "types.tsx")]
with_memo, offenders, unwrapped = 0, [], []
for p in lessons:
    block = memo_block(read(p))
    if block is None:
        continue
    with_memo += 1
    for line in naked_fr_lines(block):
        offenders.append(f"{os.path.basename(p)}: {line}")
    if WRAPPER not in block or HEADING not in block:
        unwrapped.append(os.path.basename(p))

check(with_memo >= 40,
      f"{with_memo} lesson Mémos found and scanned",
      f"only {with_memo} Mémos matched the scan — the memo shape changed and "
      "this check went blind; fix the regex, not the rule")
check(not offenders,
      "every French form line in every lesson Mémo is bold — the forms are the heroes",
      "plain French form lines (the inverted-hierarchy fault Dan flagged):\n        "
      + "\n        ".join(offenders[:8]))
check(not unwrapped,
      "every Mémo keeps the one shared wrapper + display heading",
      f"Mémos off the shared wrapper: {unwrapped} — 'unify everything' is drifting")

# ── same rule over the deck Mémos ────────────────────────────────────────────
deck = read("src/content/memos.tsx")
deck_naked = naked_fr_lines(deck)
check(not deck_naked,
      "every French form line in the deck Mémos (memos.tsx) is bold too",
      "plain French form lines in memos.tsx:\n        " + "\n        ".join(deck_naked[:8]))

# ── 2 · the salutations exemplar keeps its corrected hierarchy ───────────────
SAL_SRC = read("src/content/lessons/native/salutations.tsx")
sal = memo_block(SAL_SRC) or ""
# The four form lines went through a <Greetings> component on 2026-09-05 —
# Dan: *"it looks terrible to have à demain separated into two lines"*, so each
# greeting is now its own nowrap span and the <p> is built by the helper rather
# than typed four times. The RULE is unchanged (four bold French lines over four
# captions); only where the markup lives moved, so the count follows it there
# and the helper's own boldness is asserted below rather than assumed.
forms = (re.findall(r'<p lang="fr" className="[^"]*font-black[^"]*">', sal)
         + re.findall(r"<Greetings>", sal))
labels = re.findall(r'<p className="fluo-label[^"]*">', sal)
check(re.search(r'function Greetings[\s\S]*?<p lang="fr" className="[^"]*font-black', SAL_SRC) is not None,
      "the Greetings helper still sets the French bold",
      "Greetings no longer renders its French bold — the four tiles would go "
      "plain and the inverted hierarchy Dan flagged would be back, invisibly")
check(len(forms) == 4 and len(labels) == 4,
      "salutations: four bold form lines over four caption labels",
      f"salutations hierarchy drifted: {len(forms)} bold form lines, "
      f"{len(labels)} caption labels (want 4 and 4)")
check('<b className="text-[color:var(--gram-neutral)]">→ arriver</b>' not in sal,
      "the situation labels are captions, not the bold element",
      "a situation label is bold again — the inverted hierarchy Dan flagged is back")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
