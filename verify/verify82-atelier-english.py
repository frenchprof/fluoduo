#!/usr/bin/env python3
"""
The atelier model's English is TOGGLED, never deleted.

On 1 Sep the gloss under each line of « Le modèle » was cut outright, because
SIO-030's nine-line e-mail ran to 1.47 screens on a phone and an atelier OPENS
on that panel. It fixed the fold and cost the meaning: a learner reading
« Bonne chance pour ton examen ! » on the panel they are about to perform from
had nothing to check their understanding against.

Dan's ruling, the same day: *"leave the english but allow users to toggle with
or without English support."*

That is a specific shape, and every part of it can regress without looking
wrong in a diff:

  * delete `{showEn && ...}` and the gloss is gone again — the exact fault
    this replaced, and the panel still renders perfectly;
  * flip the default to `useState(false)` and the English is "available"
    but nobody who does not hunt for a button ever sees it;
  * drop the persistence and a learner who turns it off turns it off again
    on every atelier, forever;
  * label the switch "Hide English" and there are two controls with that
    text on one screen — the word list's Show both / Hide English / Hide
    French strip is on the SAME panel, governing something else.

So all four are asserted here.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
MEMOS = ROOT / "src/content/memos.tsx"
TABS = ROOT / "src/app/lessons/pager/LessonTabs.tsx"


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8") if p.exists() else ""


def code_only(src: str) -> str:
    """Source with its comments removed.

    The label assertion below looks for a STRING a learner reads. Scanning the
    raw file caught the comment that explains why the label was chosen — a
    check that fails on its own rationale is a check nobody keeps.
    """
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$|(?<=\s)//[^\n]*$", "", src)


def main() -> int:
    src = read(MEMOS)
    bad: list[str] = []
    if not src:
        print("verify82: src/content/memos.tsx is missing")
        return 1

    # 1 — the gloss exists and is conditional on the switch.
    if not re.search(r"\{\s*showEn\s*&&", src):
        bad.append(
            "the English gloss is not rendered behind `showEn`. Either it was "
            "deleted again (the fault this check exists for) or it is now "
            "unconditional, which puts the nine-line e-mail back past the fold."
        )
    if "l.en" not in src:
        bad.append("no `l.en` in memos.tsx — the model's English is not rendered at all.")

    # 2 — it starts ON. "Available behind a button nobody presses" is not
    #     what was asked for; the English is the default and the fold is the
    #     thing a learner opts out of.
    if not re.search(r"useState\(true\)[^\n]*\n?", src) or "const [showEn, setShowEn] = useState(true)" not in src:
        bad.append(
            "`showEn` does not default to true. Dan asked for the English to be "
            "there, with a way out — not for it to be hidden by default."
        )
    # The stored read must treat anything but an explicit "0" as ON, so a
    # first-time learner and a learner with a corrupt value both get English.
    if 'getItem(EN_KEY) !== "0"' not in src:
        bad.append(
            'the stored preference is not read as `!== "0"`. Read the other way '
            "round, an empty or unparsed value turns the English off for "
            "everyone who has never touched the switch."
        )

    # 3 — the choice survives the page. One key across every atelier.
    if not re.search(r'EN_KEY\s*=\s*"fluolingo:atelier:en"', src):
        bad.append('EN_KEY must be the namespaced "fluolingo:atelier:en".')
    if "setItem(EN_KEY" not in src:
        bad.append(
            "the switch never writes to localStorage, so the choice dies with "
            "the panel and has to be made again on every atelier."
        )

    # 4 — the label does not collide with the word list's own strip, which is
    #     rendered on the SAME Forms panel.
    if "Hide English" in read(TABS) and "Hide English" in code_only(src):
        bad.append(
            'memos.tsx uses the label "Hide English", which LessonTabs.tsx '
            "already puts on the word list on the same panel. Two identical "
            "labels governing different things on one screen: show the "
            "switch's STATE (aria-pressed) instead of its action."
        )
    if "aria-pressed={showEn}" not in src:
        bad.append("the switch has no aria-pressed, so its state is invisible to a screen reader.")

    # 5 — the switch is ABOVE the model, not under it.
    #
    # This one was found by photographing the panel, not by reading it. Every
    # assertion above passed while the control row sat at the FOOT of the list,
    # and SIO-030's nine-line e-mail runs to 1.47 screens on a phone: the one
    # control that fixes the fold was itself below the fold, on the panel an
    # atelier opens on. A switch a learner cannot reach is the deleted gloss
    # again, so its position is part of the fix and not decoration.
    code = code_only(src)
    switch_at = code.find("onClick={toggleEn}")
    # The RENDER's map, not `playAll`'s — that one builds the speech queue and
    # sits above everything, which made this assertion fire on correct code.
    lines_at = code.find("{lines.map((l, i) =>")
    if switch_at < 0 or lines_at < 0:
        bad.append("cannot locate the switch or the dialogue list in memos.tsx.")
    elif switch_at > lines_at:
        bad.append(
            "the English switch is rendered AFTER the model's lines. On a phone "
            "the nine-line e-mail pushes it past the fold, where nobody finds "
            "it — put the control row above the dialogue."
        )

    if bad:
        print("verify82 — the atelier English toggle:")
        for b in bad:
            print(f"  ✗ {b}")
        return 1
    print("verify82: the atelier model's English is on by default, switchable, and remembered.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
