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
        # ONE class string for every English sentence on a card, and it is
        # smaller than the French unconditionally.
        #
        # This assertion used to require a ternary sizing the English against
        # whether the card had a French frame. That rule was right and still
        # too clever: the English remained the same FACE as the French, so only
        # size and ink told them apart, and Dan sent the card back again —
        # "the English sentences are still too big." The English is now the
        # house hand at a fixed text-lg, which satisfies "never bigger" outright
        # and cannot drift back per-card, because there is only one string.
        en = re.search(r'const EN_TEXT = "([^"]+)"', pg)
        if not en:
            bad.append(
                "LessonPager has no single EN_TEXT class for its English lines. "
                "There were three separate strings and two still said text-2xl "
                "after the first pass narrowed the third."
            )
        else:
            cls = en.group(1)
            if "fluo-en" not in cls:
                bad.append(
                    "EN_TEXT does not carry `fluo-en`, so the English is set in "
                    'the same face as the French (Dan, 1 Sep: "switch all English '
                    'sentences to the House Font (FluOLinGo)").'
                )
            if not re.search(r"\btext-(sm|base|lg)\b", cls):
                bad.append(f"EN_TEXT is sized {cls!r} — the English must be smaller than the 2xl French.")
            # Every English line must USE it; a stray text-2xl on a lang="en"
            # paragraph is the exact regression this replaces.
            for m in re.finditer(r'<p lang="en"[^>]*className=(\{[^}]*\}|"[^"]*")', pg):
                if "EN_TEXT" not in m.group(1):
                    bad.append(f"an English line does not use EN_TEXT: {m.group(1)[:70]}")
        if not re.search(r"\.fluo-en\s*\{[^}]*font-fluohand-stack", ROOT.joinpath("src/app/globals.css").read_text(encoding="utf-8")):
            bad.append(".fluo-en is not defined against the FluOLinGo Hand stack in globals.css.")

        # 3 — THE FRENCH ON A CARD IS ONE SIZE, question and answers alike
        #     (Dan, 1 Sep: "some questions have both the Q and the A in French.
        #     In that case they should equally big"). The frame was 2xl and the
        #     options text-lg, because the options had been sized against the
        #     English back when English was the only other thing on the card.
        if "FR_TEXT" not in pg:
            bad.append(
                "LessonPager has no single FR_TEXT size. The French question and "
                "the French answers must be set from one value, or they drift "
                "apart again."
            )
        else:
            # Nothing French may carry its own size any more.
            for m in re.finditer(r'className=(?:\{`|")([^`"]*\btext-2xl\b[^`"]*)(?:`\}|")', pg):
                if "${FR_TEXT}" not in m.group(0):
                    bad.append(f"a French line hard-codes text-2xl instead of FR_TEXT: {m.group(1)[:60]}")

    # 4 — an English prompt must SAY it is English.
    #
    # `big: item.en` under a meta reading "Choose the French" rendered bold,
    # sans and larger than the French options, and 🔊 read it with French
    # phonics — because the pager reads `bigLang`, and this card never set it.
    # Nothing looked wrong while both languages were styled the same.
    bc = ROOT / "src/app/lessons/pager/buildCards.tsx"
    src_bc = bc.read_text(encoding="utf-8") if bc.exists() else ""
    for m in re.finditer(r"big: (item\.en|en|en \?\? item\.en),([^\n]*)", src_bc):
        if "bigLang" not in m.group(2):
            bad.append(
                f"a card sets an English `big` without `bigLang: \"en\"`: {m.group(0)[:70]} — "
                "it will be drawn as the French target and spoken with French phonics."
            )
    # The old assertion here pinned the MCQ option class to a literal size.
    # FR_TEXT above supersedes it: the options are now sized with the French
    # question rather than against a number of their own.

    if bad:
        print("verify85 — the card's French leads:")
        for b in bad:
            print(f"  ✗ {b}")
        return 1
    print("verify85: every gapped card is dealt as a sentence, and no English outsizes its French.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
