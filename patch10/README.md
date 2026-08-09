# Patch 10 — the help ladder, complete

**Supersedes patch 4.** Patch 4 left three pieces of JSX for you to place by
hand. That was the wrong call — it left the ladder half-applied, and a script
I can build and run before shipping is safer than you pasting JSX into a
terminal that has already garbled one paste. Nothing here is manual.

## Verified before it reached you

```
npx tsc --noEmit   → 0 errors
npx next build     → 738 pages, exit 0
```

Run against a reconstruction of your tree — patches 1, 2, 3, 6, 7, 9 plus your
hand edits — not against my 8 August baseline.

## What it does

**One ladder definition** (`src/lib/help/ladder.ts`), shared. Before this,
Finale had a four-rung Socratic clue ladder and per-deck GramMarathon had
nothing at all: a learner stuck on the same grammar point got escalating
scaffolds in the daily paper and a bare "wrong" in the lesson drill. Backwards
— Finale is the summative surface; the drill is where scaffolding belongs most.
It arose exactly the way the gap-sentence bug did: two call sites, two answers,
no shared definition.

PRD §8: nudge → guiding question → scaffold → partial reveal → **answer**.

**Finale gains the fifth rung.** Your 2026-07-21 rule was "never reveal the
answer"; you revised it on 08-09 — Finale is practice, so the answer must be
reachable. Reaching it is now *recorded*, not prevented.

**Per-deck GramMarathon gains a ladder** — one rung shorter, since its items
carry no hand-authored category label, so it opens at the lesson rung. A yellow
**💡 un indice** button sits under Check; tapping it walks lesson → first letter
→ skeleton → answer.

## Why this is the patch that makes the evidence model real

Since patch 3, every answer has recorded `assistance` — and it has read
`"none"` on every single row, because nothing outside Finale's clue ladder
counted help. It said "no help recorded", which was honest but empty.

From this patch on:

| Learner did | Stored |
|---|---|
| Answered cold | `assistance: "none"`, `assistCount: 0`, `independent: true` |
| Answered after two clues | `assistance: "question"`, `assistCount: 2`, `independent: false` |
| Opened the answer | `assistance: "answer"`, `revealed: true`, `independent: false` |

`assistCount` measures help taken **before** the answer was submitted, not help
available — so a learner who solves an item cold on a five-rung surface still
reads `none`. That is the distinction the mastery model needs, and the reason
it is tagged at grade time rather than at end of session.

This is the signal PRD §6 Goal 2 asks for when it lists *"declining reliance on
hints and scaffolds over time"*. It means nothing until enough accumulates —
but from the moment this ships, it starts accumulating.

## One new event type

`answer.reveal`, separate from `hint.tap`. A revealed answer differs in **kind**,
not degree (PRD §7): it still counts as encountered and practised, never as
independent mastery. Counted together, a rising reveal rate could hide inside a
falling hint rate — precisely the trend Goal 2 exists to measure.

Also recorded now: in Finale, an item solved *after* assistance. The first
attempt still stands as the independent measurement and still pays nothing
extra, but PRD §7 is explicit that assistance changes evidentiary strength
without making the learning event disappear. "Got there with a scaffold" is
visible for the first time.

## Run it

**Stop the dev server first.**

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch10.zip
python3 patch10/apply10.py --dry-run
python3 patch10/apply10.py
rm -rf .next
npx tsc --noEmit && npm run build 2>&1 | tail -3
npm run dev
```

Then click `/practice/grammarathon/partitifs` and tap the yellow button four
times.
