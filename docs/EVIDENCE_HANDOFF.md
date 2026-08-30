# The evidence model — what is built, what is not, and who takes what

**Written 30 Aug 2026 for Peers, by the Claude Code session that scoped it.**
Dan's question was whether an activity's page should be coloured by what it
*asks* of the learner. The answer — after looking properly — is that colour
cannot carry it at all, because **cognitive demand is a property of the
occasion, not the activity**. The same WorDrill word is near-worthless right
after the lesson and strong evidence a week later, cold. A per-page colour
can never say that. `src/lib/evidence.ts` can, and mostly already does.

## Read this first: the mistake I made

I reported that "one activity writes evidence, fifteen don't", and scoped a
day's work on that basis. **It was wrong.** I had grepped for the literal
string `evidenceType:` and found six hits — but almost nothing sets it
explicitly. It is *derived*, inside `buildEvidence()`, from the activity id.
I measured the overrides and called them the population.

If you take one thing from this file, take that: in this codebase the
evidence block is assembled centrally, so **follow the call chain, do not
count the call sites**.

## What is already built

The chain runs end to end today:

```
useHelpLadder.attempt()            src/lib/help/useHelpLadder.ts:130
  → recordItemResult(id, ok, given, activity,
        { hintsTaken, revealed, assistance, latencyMs, award })
                                   src/lib/progress.ts:~437
  → buildEvidence(itemId, activity, {...})      src/lib/evidence.ts:212
  → recordResponse(id, ok, { evidence, xpPaid, latencyMs })
                                   src/lib/firebase/responses.ts:38
```

`buildEvidence` fills in **all five** fields: `assistance` (the exact rung the
ladder showed, or one inferred from the hint count), `assistCount`,
`independent`, `outcomeId` (via the join table — never parse an outcome out of
an item id, see the note at `evidence.ts:118`), and `evidenceType`, looked up
from `ACTIVITY_EVIDENCE` at `evidence.ts:65` — a 35-prefix table, longest
prefix wins.

Seven surfaces already run answers through the help ladder, so their
assistance rung reaches the store: the lesson pager, GramMarathon, iComplete,
Say It, Flip It, Sorting, SpecuLearn, plus DrillShell itself.

**The Firestore rules for all of this deployed on 10 Aug.** Nothing is blocked
on schema.

## What is missing

Small, and in three separable pieces.

### (1) Three prefixes and one bug — mine

Of the 15 activity strings passed to a recorder, 12 resolve to an evidence
type. Three do not:

| string passed | where | should be |
|---|---|---|
| `dice:` | Sorting | `recognition` — the table has `dice-practice` and `/practice/dice/` but not the bare prefix the game actually passes |
| `letris:` | VocabulaRain | `recognition` — absent from the table entirely |
| `fr-FR` | a speech call site | **a bug** — that is a recogniser language tag being passed where an activity name belongs |

### (2) The direct callers — YOURS, if you want it

Five places call `recordResponse` directly and so skip `buildEvidence`
entirely. Their answers store as bare right/wrong, with no evidence block at
all:

- `src/app/decks/[id]/mcq/Content.tsx:142`
- `src/games/numbus/NumBus.tsx:517`
- `src/games/letris/LetrisGame.tsx:287`
- `src/games/compose/ComposeDialogue.tsx:204`
- `src/app/practice/grammarathon/finale/FinaleContent.tsx:176`

Route each through `recordItemResult` instead, or pass
`evidence: buildEvidence(...)` where the XP path must stay as it is. Check the
XP behaviour of each before moving it: `recordItemResult` pays XP and
`recordResponse` does not, so a naive swap can double-pay or start paying
where the design says it should not (`progress.ts:470` has the table).

**This is the clean split.** Five files, none of which (1) or (3) touches.

### (3) The conditions — mine, and the only part with real pedagogical value

`EvidenceType` has nine kinds and the interesting three are per-attempt, not
per-activity:

- **`delayed`** — the Reviser already knows the spacing interval when it
  serves an item; nothing tells the store.
- **`transfer`** — the same outcome met in an activity that did not teach it.
  `sioForItem`/`sioForDeck` in `lib/curriculum.ts` already resolve both sides.
- **`diagnostic`** — mapped for pretests, but SpecuLearn's guess-before-taught
  screens currently record as `receptive`, which is not what they are.

Until these land, the store cannot distinguish "picked it from four options
straight after reading it" from "held it a week later, unaided" — which is the
one sentence in the PRD (§7) this whole module exists to serve.

## Two traps

**The lint gate has changed and AGENTS.md is wrong about it.** CI now lints
every file a PR touches. `AGENTS.md` still says "CI does not run lint". A
one-line change to an old file inherits that file's lint debt — a string edit
of mine pulled in seven pre-existing errors. Budget for it. Where the rule
disagrees with an older deliberate decision (localStorage cannot be read
during render; a live ref must be written during render or an async callback
fires a stale value), a targeted `eslint-disable-next-line` **with the reason
written out** is the accepted resolution — see `SayItContent.tsx` for the
pattern.

**Old stored answers keep their old shape.** Anything written before this work
has no evidence block, and anything before the 10 Aug rules deploy sits under
a known-bad XP ceiling (`evidence.ts:20`). Any analysis spanning those dates
carries the caveat.

## How to know it worked

There is no check for this yet. Worth adding one: a `verify` script that reads
every `activity:` string in `src/` and fails if any of them resolves to no
evidence type through `evidenceTypeFor()`. That is the fault above — a prefix
table drifting away from the strings the code actually passes — and it is
exactly the kind this repo catches with a script rather than a promise.
