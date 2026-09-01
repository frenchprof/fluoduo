# Handoff → the pre-tests lane: SpecuLearn and Pre-Tests become SpecuLearn

**From Peers, 1 Sep 2026. REWRITTEN the same day — the first version was wrong
about the one thing it said was blocking, and it was wrong because it believed a
comment instead of the code.**

> **Dan, 1 Sep:** *"I think they are essentially the same thing."*
> **Dan, later the same day:** *"I was actually going to rename Pre-Tests and
> SpecuLearn collectively as SpecuLearn. Now that they are on par, are there any
> differences that differentiate them?"*

**The answer is: not the one this document used to be about.**

---

## What the first version of this file got wrong

It said the scoring contract was "the whole ballgame" and that merging without
Dan's decision on it would "either silently start scoring diagnostics, or
silently stop paying for practice." Three readings were laid out (A, B, C) and a
decision was asked for.

**There is no such contract.** `SpecuLearnContent.tsx` calls `recordItemResult`
nowhere, writes no XP, no streak and no SRS entry, and persists nothing at all:
`score` lives for the length of the session, and `game.start` / `game.end` go to
analytics. The file's own header block claimed the opposite — *"every answer pays
XP + streak + SRS through recordItemResult"* — and that sentence, not the code,
is what the first draft of this document was built on. The header is corrected
now, with a note pointing here.

The lesson is worth more than the correction: **a header that describes
behaviour is a claim, and claims go stale.** Grep the calls.

## What actually differs, now, in the code

| | SpecuLearn | Pre-test |
|---|---|---|
| prompt | item emoji (photos for `aliments`) | item emoji |
| task | pick the word from 4 | pick the word from 4 |
| scoring | **none** | **none** |
| **what survives** | **nothing** | **a gap record** (`recordPretestAnswer`) |
| ends in | end card, restart chips | "Bring to class" gap report |
| shell | `DrillShell` | `CahierShell`, stripped rail |
| coverage | 9 decks (`SPECULEARN_READY`) | 35 authored + picture + unit0 + the atelier generator |
| direction | folded into "Mixte" | both, on the picture engine |

**One of those rows matters and the rest are cosmetic.** The pre-test remembers
that it was sat; SpecuLearn forgets. Under Dan's ruling — *"we reward the
presence not the result"* — that is precisely the half to keep.

## What the merge should therefore do

1. **Keep the pre-test's recording.** `recordPretestAnswer` stays, on every run
   of the merged activity. Presence is the reward; the gap report is what a
   teacher gets.
2. **Keep the pre-test's coverage.** It reaches four times as much of the course.
   Whatever survives should be the pre-test's reach with SpecuLearn's name.
3. **Keep SpecuLearn's shell and its photo bank.** Cosmetic, and better.
4. **One name: SpecuLearn.** The registry blurb already says *"Guess before
   you're taught. Pre-Tests live here too."*

## The guard, and why it does NOT fight this

`verify40-pretest-record.py` asserts by absence that no pretest surface reaches
the scoring machinery — not `recordItemResult`, not `addXp`/`awardXp`, not
`queueForReview` — and that the gap store never imports `progress.ts`, because
*"if it ever imports the XP/SRS module, 'remember' and 'score' have been welded
together"*.

**Every one of those assertions is already true of SpecuLearn**, which is the
whole point of this rewrite. Merging the two under one name does not touch the
guard, because neither side scores. It stays as written and should not be
weakened; if the merged activity is ever given XP, that is a new decision and
verify40 is the check that will, correctly, refuse it.

## Files this touches

```
src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx
src/app/pretests/[id]/PretestContent.tsx
src/app/pretests/picture/[collectionId]/PicturePretestContent.tsx
src/app/pretests/unit0/[sioId]/Content.tsx   ·   src/components/Unit0Pretest.tsx
src/lib/pretestRecord.ts          the gap store — must not import progress.ts
src/lib/collections/speculearnReady.ts
src/content/activities.ts         the `speculearn` row and its blurb
verify/verify40-pretest-record.py the guard, which this merge does not disturb
```

## One thing to settle that is NOT a code question

The stripped pre-test rail exists so a learner cannot slide from a cold
diagnostic into scored practice without noticing. Nothing is scored on either
side any more, so the boundary it was drawing has less to hold up — but "this is
a first look, before you are taught" is still worth saying on the card, because
it is what makes a wrong answer costless. Say it in words rather than by taking
the navigation away.
