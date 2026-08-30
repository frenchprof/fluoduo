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

**And a second mistake, found the next day.** The first version of §1 below
listed a bug where `fr-FR` — a speech-recogniser language tag — was being
passed as an activity name. **There is no such bug.** My scanner used a regex
that matched *across a call boundary*: the real line is
`recordItemResult(\`conj-${cell.v.id}-${cell.i}\`, ok)` at
`conjugaison/page.tsx:115`, a call with two arguments, and the `fr-FR` came
from the `speak()` call three lines below it. Re-scanned with a
brace-matching argument parser, the picture was different and worse. §1 now
reports what is actually there.

Both mistakes have the same shape: a regex over source text, believed without
a second pass. The scanner that replaced them is now
`verify/verify53-evidence-coverage.py`, so the next person does not have to
trust anyone's grep.

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

### (1) The tags — DONE, 30 Aug

Not three prefixes. The whole thing had a hole in the middle.

`recordResponse` falls back to `location.pathname` for the `activityId` it
**stores**, but `buildEvidence` is handed the raw `activity` argument and has
**no such fallback**. Nothing made the two agree. So a caller that passed no
activity wrote a document with a perfectly sensible `activityId` — and no
`evidenceType` at all. Every `/`-shaped key in the prefix table was therefore
unreachable: twenty-two of the thirty-five keys were dead.

Eight live call sites passed nothing:

| where | what it was writing |
|---|---|
| `conjugaison/page.tsx:115` | every ConjugaZone answer |
| `decks/[id]/CuratedDeckTable.tsx:633` | deck Test Yourself, card grid |
| `decks/[id]/CuratedDeckTable.tsx:1005` | deck Test Yourself, table row |
| `reviser/page.tsx:83` | **every review answer** |
| `games/lexicalator/Lexicalator.tsx:484, :544` | LexicaLater, both verdicts |
| `games/matching/MatchingGame.tsx:109` | Match It |
| `practice/grammarathon/finale/FinaleContent.tsx:166` | the finale's FIRST attempt |

Two more passed a tag that matched no prefix: `dice:` (the table had
`dice-practice` and `/practice/dice/`, not the bare prefix Sorting passes) and
`letris:` (it had `/games/letris`).

Two of those deserve naming on their own.

**The Reviser is the app's only source of `delayed`.** No other surface serves
an item because its spacing interval has elapsed. It produced none, ever — so
the single strongest signal the store can carry has been absent since the
model was built, and the PRD §7 sentence this module exists to serve was
unanswerable in practice.

**The finale had it exactly backwards.** The first attempt — the independent
measurement, the one that pays — passed `undefined`. The *post-assistance*
re-record twenty lines below passed the full path and typed itself `delayed`.
So the weaker record was the only one with meaning.

All ten now pass an explicit tag, and the missing prefixes are in the table.
The fix is at the call sites rather than a pathname fallback in
`buildEvidence`, for the reason `recordItemResult`'s own docstring gives: a
game embedded in `SioModal` never navigates, so its pathname is whatever host
page happened to be open. The path-shaped keys stay, because documents written
before the tags existed stored pathnames and a reader resolving history needs
them — but `verify53` now fails the build if a live surface resolves through
one.

### (2) The direct callers — YOURS, if you want it

Eight call sites in six files call `recordResponse` directly and so skip
`buildEvidence` entirely. Their answers store as bare right/wrong, with no
evidence block at all — no `evidenceType`, and also no `outcomeId`,
`assistance` or `independent`:

- `src/app/decks/[id]/mcq/Content.tsx:142`
- `src/games/numbus/NumBus.tsx:517`
- `src/games/letris/LetrisGame.tsx:287`
- `src/games/compose/ComposeDialogue.tsx:204` and `:252`
- `src/games/compose/ComposeSolo.tsx:111`
- `src/games/numbourse/NumBourse.tsx:193` and `:219`

(The earlier version of this list named `FinaleContent.tsx:176` — that one
does pass an evidence block — and missed ComposeSolo, NumBourse and the second
ComposeDialogue site. Same faulty scan as the `fr-FR` phantom.)

Note that their *tags* are fine: `mcq:`, `numbus`, `letris:`, `compose:`,
`compose-solo:`, `numbourse` all resolve. Nothing reads them, because nothing
calls `buildEvidence`. `verify53` checks tags, not writers, so it will stay
green while this is outstanding — deliberately, so the two pieces of work stay
separable.

Route each through `recordItemResult` instead, or pass
`evidence: buildEvidence(...)` where the XP path must stay as it is. Check the
XP behaviour of each before moving it: `recordItemResult` pays XP and
`recordResponse` does not, so a naive swap can double-pay or start paying
where the design says it should not (`progress.ts:470` has the table).

**This is the clean split.** Five files, none of which (1) or (3) touches.

### (3) The conditions — one done, two are Dan's call

`EvidenceType` has nine kinds. Six are now reachable; three are not, and the
reasons differ.

**`delayed` — DONE.** The Reviser tags `reviser` and the finale tags
`/practice/grammarathon/finale`, both resolving to `delayed`. That is the
whole of it: those two surfaces are the only ones that serve an item *because*
its interval elapsed, and both now say so. `verify53` asserts the Reviser
specifically, because it is a single point of failure — no other surface would
notice if the tag went.

**`diagnostic` — NOT a wiring fix. It contradicts a standing rule.** The table
maps `pretest` and `/pretests/`, but nothing emits either, because pretests
deliberately do not write to the evidence store at all.
`PicturePretestContent.tsx:174` says so outright, citing Dan, 27 Aug:
*"remember it, but don't score it."* They call `recordPretestAnswer`, which is
localStorage only and touches neither XP nor the SRS ladder.

The rule and the gap are not actually in conflict — "don't score it" is about
XP, accuracy and the review queue, none of which the evidence store drives. A
pretest answer could be written with `xpPaid: 0`, no SRS step, and
`evidenceType: "diagnostic"`, and every part of Dan's rule would still hold.
But that is a decision about what the teacher dashboard sees, not a lookup
error, **so it is Dan's to make, not ours.** Until he does, `diagnostic` stays
unreachable and `verify53` records that as expected.

The earlier draft of this file said SpecuLearn "currently records as
`receptive`, which is not what they are". Having read it: it opens straight
into Mixte over the whole deck inside DrillShell, and the guess-first framing
is pedagogy, not a cold measurement — it is replayable practice, not a
one-shot pretest. `receptive` is defensible and it has been left alone. If it
should move, it is the same kind of decision as the paragraph above.

**`transfer` — needs a rule before it needs code.** "The outcome applied in an
unfamiliar context" is the definition; `sioForItem`/`sioForDeck` in
`lib/curriculum.ts` resolve both sides, so the data is there. What is missing
is what counts as unfamiliar — a different deck? a deck from a later unit? any
activity other than the one that taught it? Each answer classifies a different
slice of history, and `evidence.ts:118` already warns that correcting a lookup
changes what past answers mean. Pick the rule with Dan first.

### An open contradiction, for Dan

`activities.ts` files Sorting under `recog`, while `ACTIVITY_EVIDENCE` maps
every dice prefix to `constrained` — and `EvidenceType`'s own comment defines
`recognition` as including "sort into a column". Two of the three say
recognition. It has been left as `constrained` rather than changed quietly,
because the change would reclassify every Sorting answer already in the store.

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

`verify/verify53-evidence-coverage.py`, wired into CI on 30 Aug. It parses
`ACTIVITY_EVIDENCE` out of `evidence.ts` rather than restating it, finds every
activity tag the source emits — by brace-matching the arguments, not by regex
across them — and fails if any resolves to no evidence type. A call with no
tag at all is a failure too, since that is exactly how all eight of the sites
in §1 hid: the argument was simply absent, so a scan looking at argument
*values* saw nothing to check.

It also asserts the **exact set** of evidence types the app can produce, so
both directions are loud: losing `delayed` again fails it, and wiring
`diagnostic` fails it too — with a message asking you to update the list and
say why, rather than passing in silence.

Break-tested four ways before being trusted (the standing rule in this repo):
strip the Reviser's tag, rename a tag to one with no prefix, retype a prefix in
the table, and tag a surface with a route. Each fails, each with a message that
names the surface and says what the store loses.

**What it does not check:** whether a writer builds an evidence block at all.
The eight direct `recordResponse` callers in §2 all have valid tags and write
no evidence, and `verify53` stays green on them by design — so the two pieces
of work stay separable.
