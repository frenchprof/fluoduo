#!/usr/bin/env python3
"""
A card shows a SENTENCE, and the English on it is never bigger than the French.

Both halves come from one screenshot Dan sent on 1 Sep — a transport card
reading « ? moto » over "by motorbike", with his own mock beside it restoring
the lead: *"i prefer a hybrid like this : english should never be bigger than
french."*

WHY THE FRAGMENT HAPPENED. `gapSentence` prefers `fr`, which is right for the
authoring pattern it was written for (partitifs: `fr` IS the drilled sentence).
transport is the other pattern — `fr` is the two-word grid label « en train »,
`example` is the sentence — and the label happens to CONTAIN the gap, so `fr`
won and every one of the deck's twelve cards blanked the label. Nothing looked
broken: the card rendered, the answer graded, the SRS key was real.

WHY THE ENGLISH WAS BIGGER. On 31 Aug Dan asked for the English reference to be
"of equal size (but italics non bold)", and that was implemented as a constant,
text-2xl. On a frame card it is equal — the French frame is text-2xl too. On an
MCQ card there is no French frame: the only French is in the options, and they
were text-base. So a 24px English prompt sat above 16px French answers.

Both faults are invisible in a diff and obvious in a photograph, which is why
they are asserted here.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DECKS = ROOT / "src/content/collections"
GAPSENT = ROOT / "src/lib/collections/gapSentence.ts"
PAGER = ROOT / "src/app/lessons/pager/LessonPager.tsx"

SENTENCE_END = re.compile(r"[.?!]\s*$")


def is_sentence(s: str) -> bool:
    return bool(SENTENCE_END.search(s))


def chosen(it: dict) -> str:
    """`gapSentence`, in Python. Kept in step by the assertions below."""
    gap = it.get("gap")
    fr = it.get("fr") or ""
    ex = it.get("example") or ""
    if gap:
        fr_has, ex_has = gap in fr, gap in ex
        if fr_has and ex_has and not is_sentence(fr) and is_sentence(ex):
            return ex
        if fr_has:
            return fr
        if ex_has:
            return ex
    return ex or fr


def main() -> int:
    bad: list[str] = []

    # 1 — no card is dealt as a fragment when the deck holds a sentence.
    fragments = []
    for f in sorted(DECKS.glob("*.json")):
        try:
            deck = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        for it in deck.get("items") or []:
            gap = it.get("gap")
            if not gap:
                continue
            ex = it.get("example") or ""
            got = chosen(it)
            if not is_sentence(got) and gap in ex and is_sentence(ex):
                fragments.append(f"{f.name}:{it.get('id')} deals « {got} » when « {ex} » exists")
    if fragments:
        bad.append(
            "these items are blanked as a FRAGMENT while the deck holds a whole "
            "sentence containing the same gap:\n      " + "\n      ".join(fragments[:8])
        )

    src = GAPSENT.read_text(encoding="utf-8") if GAPSENT.exists() else ""
    if not src:
        bad.append("src/lib/collections/gapSentence.ts is missing")
    else:
        # The SELECTION, not merely a helper of that name. Deleting the branch
        # and leaving `isSentence` defined above it passed an earlier version of
        # this assertion while every transport card went back to a fragment —
        # the data loop above cannot catch it, because it re-implements the rule
        # rather than importing it.
        if not re.search(r"isSentence\(it\.fr!\)[^\n]*isSentence\(it\.example!\)[^\n]*example", src):
            bad.append(
                "gapField no longer prefers `example` when `fr` is a grid label "
                "and `example` is a sentence, so a pattern-B deck whose label "
                "contains the gap is back to dealing fragments."
            )
        # The French and its gloss must come from ONE decision. They did not for
        # one build, and the card read « J'y vais ? métro. » over "by metro" —
        # the sentence moved and the gloss stayed behind.
        if src.count("gapField(it)") < 2:
            bad.append(
                "gapSentence and gapSentenceEn do not both go through gapField. "
                "Chosen separately they drift, and the card shows a sentence in "
                "French glossed by a two-word label in English."
            )

    # 2 — the English line is sized against the card's own French, not a
    #     constant. A fixed text-2xl is correct beside a text-2xl frame and
    #     half again too big above the options.
    pg = PAGER.read_text(encoding="utf-8") if PAGER.exists() else ""
    if not pg:
        bad.append("LessonPager.tsx is missing")
    else:
        # Again the behaviour, not the name: keeping `frenchIsFrame` declared
        # and hard-coding the size back to text-2xl passed an earlier version.
        if not re.search(r"!frenchIsFrame\s*\?\s*\"text-lg\"\s*:\s*\"text-2xl\"", pg):
            bad.append(
                "the English prompt's size is not computed from whether the card "
                "shows a French frame. Dan, 1 Sep: \"english should never be "
                "bigger than french.\""
            )
        # The options ARE the French on an MCQ card; at text-base they were
        # smaller than the English above them.
        opt = re.search(r"rounded-xl border-2 px-4 py-3 text-center (text-\w+)", pg)
        if not opt:
            bad.append("cannot find the MCQ option class in LessonPager.tsx.")
        elif opt.group(1) in ("text-xs", "text-sm", "text-base"):
            bad.append(
                f"MCQ options are {opt.group(1)}, smaller than the text-lg English "
                "prompt above them — the reference outsizes the target."
            )

    if bad:
        print("verify85 — the card's French leads:")
        for b in bad:
            print(f"  ✗ {b}")
        return 1
    print("verify85: every gapped card is dealt as a sentence, and no English outsizes its French.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
