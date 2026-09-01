#!/usr/bin/env python3
"""
What every option says is not a choice, and a blank is not five empty
characters.

Dan, 2026-09-01, on a transport card whose four options all began « Nous y
allons »: *"if the MCQ answers are going to be nearly identical except for one
part, then put the identical parts in the question and just separate out the
choice parts!"* — and, on the blank: *"can we have the question mark in a
minimal square rather than a super long blank?? why waste the space?"*

THE SPLITTER IS THE RISKY PART, so most of this file executes it rather than
reading it. Reducing an option's LABEL while grading its VALUE is exactly the
kind of change that works on the card in front of you and quietly destroys
another. Two faults are reachable from real option lists and are covered as
cases here: a split landing inside a word (« la »/« le » becoming « a »/« e »),
and a split so shallow it buys nothing but costs a frame to parse.

The module's other two guards — an option reduced to nothing, two options
reduced to the same string — are DEFENSIVE, not covered. Trimming the prefix
back to a word boundary makes both unreachable from any option list that has no
trailing whitespace, which is why an attempt to break-test them here passed a
sabotaged module: the case was really exercising the size threshold. They stay
in the code because they are one line each and the next caller may not have
that property; they are recorded here as untested rather than left to look
tested.

THE BLANK is asserted from source, and there is a reason it is worth asserting
at all: the frame card carried its OWN copy of the class list, so narrowing the
shared `blankClass` left the one card Dan was looking at still 90px wide. The
assertion is therefore that no copy remains, not that the shared one is right.
"""
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
AFFIX = ROOT / "src/lib/practice/sharedAffix.ts"
PAGER = ROOT / "src/app/lessons/pager/LessonPager.tsx"

# name, options, expected before/after/parts — or None for "must not split".
CASES = [
    (
        "the card Dan sent back",
        ["Nous y allons à vélo.", "Nous y allons en métro.", "Nous y allons en avion."],
        {"before": "Nous y allons ", "after": ".", "parts": ["à vélo", "en métro", "en avion"]},
    ),
    (
        "a question keeps its mark in the frame",
        ["Tu prends la voiture ?", "Tu prends le voiture ?"],
        {"before": "Tu prends ", "after": " voiture ?", "parts": ["la", "le"]},
    ),
    (
        "bare gaps share nothing and are left alone",
        ["le", "la", "l'", "en"],
        None,
    ),
    (
        "never split inside a word",
        ["Nous allons au métro.", "Nous allons au bistro."],
        {"before": "Nous allons au ", "after": ".", "parts": ["métro", "bistro"]},
    ),
    (
        # « Je » alone is not a frame worth building — this is the threshold,
        # not the empty-option guard, which the header explains is unreachable.
        "one word of shared text is not worth a frame",
        ["Je vais", "Je vais bien"],
        None,
    ),
    (
        # A tail is lifted only as far as a clean boundary. Here the options
        # differ in their final punctuation, so no tail is common and the whole
        # remainder stays on the buttons — which is right: the difference IS
        # the punctuation, and hiding it in the frame would make the two
        # options identical on screen.
        "a tail that is not shared is not lifted",
        ["Il a mangé.", "Il a mangé !"],
        {"before": "Il a ", "after": "", "parts": ["mangé.", "mangé !"]},
    ),
    (
        "a single shared letter is not worth a frame",
        ["allons", "allez"],
        None,
    ),
]

HARNESS = """
import { sharedAffix } from "%s";
const cases = %s;
const out = cases.map(([, opts]) => sharedAffix(opts));
console.log(JSON.stringify(out));
"""


def main() -> int:
    bad: list[str] = []
    if not AFFIX.exists():
        print("verify86: src/lib/practice/sharedAffix.ts is missing")
        return 1

    import json

    payload = json.dumps([[n, o] for n, o, _ in CASES], ensure_ascii=False)
    with tempfile.NamedTemporaryFile("w", suffix=".ts", delete=False, encoding="utf-8") as fh:
        fh.write(HARNESS % (AFFIX.as_posix(), payload))
        path = fh.name
    try:
        run = subprocess.run(
            ["node", "--experimental-strip-types", path],
            capture_output=True, text=True, cwd=ROOT,
        )
    finally:
        pathlib.Path(path).unlink(missing_ok=True)
    if run.returncode != 0:
        print("verify86: could not execute sharedAffix\n" + (run.stderr or "")[-1200:])
        return 1

    line = [x for x in run.stdout.splitlines() if x.startswith("[")]
    got = json.loads(line[-1]) if line else []
    for (name, opts, want), g in zip(CASES, got):
        if want is None:
            if g is not None:
                bad.append(f"{name}: split into {g} — it must be left alone.\n      options: {opts}")
            continue
        if g is None:
            bad.append(f"{name}: was not split at all.\n      options: {opts}")
        elif {k: g[k] for k in ("before", "after", "parts")} != want:
            bad.append(f"{name}:\n      wanted {want}\n      got    {g}")

    # The frame's blank: one skin, and no 90px copy of it left behind.
    pg = PAGER.read_text(encoding="utf-8") if PAGER.exists() else ""
    if not pg:
        bad.append("LessonPager.tsx is missing")
    else:
        if "min-w-[90px]" in pg:
            bad.append(
                'a "min-w-[90px]" blank is still in LessonPager.tsx. That reserved '
                "five characters of empty paper for a « ? » — and it survived the "
                "first fix because the frame card kept its own copy of the class."
            )
        if not re.search(r"min-w-\[1\.6em\]", pg):
            bad.append("the blank is no longer min-w-[1.6em] — Dan asked for a minimal square.")
        if pg.count("blankClass(") < 3:
            bad.append(
                "not every blank goes through blankClass. A second copy of the "
                "class list is how the last narrowing missed the card on screen."
            )
        if "optionSplit" not in pg:
            bad.append(
                "LessonPager no longer lifts a shared frame out of the MCQ "
                "options, so every option prints the words it shares with all "
                "the others."
            )
        # The label is reduced; the VALUE must stay whole or grading breaks.
        if not re.search(r"onSelect\(c\)", pg):
            bad.append(
                "the MCQ button no longer selects the FULL option `c`. With the "
                "labels reduced, selecting the label would grade « en bus » "
                "against « Tu y vas en bus ? » and mark every answer wrong."
            )

    if bad:
        print("verify86 — the shared frame, and the blank:")
        for b in bad:
            print(f"  ✗ {b}")
        return 1
    print(f"verify86: {len(CASES)} splitter cases pass; the blank is a minimal square with one skin.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
