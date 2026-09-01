# Handoff → the pre-tests lane: SpecuLearn and Pre-Tests are the same thing

**From Peers (fluoduo-f2), 1 Sep 2026. Dan's ruling, with the evidence behind
it and the one decision that has to be made before any code moves.**

> **Dan, 1 Sep 2026:** *"I think they are essentially the same thing."*

He is right about the learner's experience, and the registry has been quietly
admitting it for weeks — SpecuLearn's own blurb reads *"Guess before you're
taught. **Pre-Tests live here too.**"*

This document exists so the pre-tests lane starts from the measurements instead
of rediscovering them, and so the one genuinely dangerous part of the merge is
not walked into by accident.

---

## 1 · What is the same

For every deck except `aliments`, both surfaces show **the item's emoji** and
ask the learner to pick the word from **four options**. Same source, same
shape, same grid. A learner cannot tell them apart by looking.

| | SpecuLearn | Picture pre-test |
|---|---|---|
| prompt | item emoji (photos only for `aliments`) | item emoji |
| task | pick the word from 4 | pick the word from 4 |
| pedagogy | guess before you are taught | guess before you are taught |
| source | the deck's own items | the deck's own items |

Both are built on the pretesting effect. Neither is a typo of the other; they
are two implementations of one idea, written months apart.

`SpecuLearnContent.tsx` even lost its five-mode config wizard in patch 20–21
and now opens straight into "Mixte", which is close to what the picture
pre-test does in both directions.

## 2 · What differs — and only one of them matters

Three of the four differences are cosmetic or incidental:

- **The shell.** SpecuLearn runs in `DrillShell`; the pre-tests run in
  `CahierShell` with a deliberately stripped rail (Home + Pretest only).
- **Direction.** The picture pre-test tests BOTH directions (word→picture and
  picture→word); SpecuLearn folded direction into "Mixte".
- **Photos.** SpecuLearn has the `aliments` photo bank; pre-tests are
  emoji-only.

The fourth is the whole ballgame.

### THE SCORING CONTRACT — do not merge past this without Dan

| | SpecuLearn | Pre-test |
|---|---|---|
| every answer | **XP + streak + SRS** via `recordItemResult` | `recordPretestAnswer` — a gap record, **no score** |
| ends in | end card, 🎤 restart chips | **"Bring to class"** gap report |
| replayable | yes, any time | it is a cold, pre-lesson diagnostic |

**`verify40-pretest-record.py` enforces this by absence**, and calls it "the
load-bearing one" in its own words:

> *NO pretest surface reaches the scoring machinery — not `recordItemResult`,
> not `addXp`/`awardXp`, not `queueForReview`.*

It also guards the gap store against ever importing `progress.ts`, because
*"if it ever imports the XP/SRS module, 'remember' and 'score' have been welded
together"* and the absence checks become bypassable.

So "they are the same thing" is true of the CARD and false of the CONTRACT.
Merging the two surfaces without deciding the contract will either silently
start scoring diagnostics, or silently stop paying for practice.

## 3 · The decision Dan owes this work

**Which contract survives the merge?** Three readings, and they are not
equivalent:

**A · One activity, never scored.** Pre-test absorbs SpecuLearn. Guess-first
stops paying XP/SRS anywhere. Honest and simple; costs the Practice family one
of its two scored activities and removes a reward loop a learner already has.

**B · One activity, scored after the first meeting.** The first pass over a
deck is a diagnostic and pays nothing; later passes are practice and pay
normally. Closest to what both were reaching for, and the only reading where
"the same thing" is literally true. **It is also the most work**: `verify40`'s
absence checks would have to become conditional, which is exactly the welding
its comment warns about, so the boundary would need a new and stricter guard.

**C · One door, two modes.** Keep both contracts, merge the NAMING and the
entry point so a learner meets one thing called one name, with the stakes
stated on the card. Least code, keeps `verify40` untouched, and is the only
option that does not change what is already recorded for students.

**My read is C, then B later if Dan wants it.** C removes the confusion Dan
actually named — two identical-looking cards under two names — without
touching a data contract mid-term. B is the better end state and deserves its
own decision rather than being smuggled in as a refactor.

**This is a pedagogical call and a data call. It is Dan's, not the lane's.**

## 4 · The numbers, so nobody re-derives them

- **4 pre-test engines**: authored `/pretests/[id]`, picture
  `/pretests/picture/[collectionId]`, `unit0`, and the atelier generator
  (`src/content/pretests/ateliers.gen.ts`).
- **35 authored pre-test files** in `src/content/pretests/*.json`.
- **9 SpecuLearn-ready decks** (`SPECULEARN_READY` in
  `src/lib/collections/speculearnReady.ts`).

The asymmetry is worth noting before anyone plans a merge in either direction:
**pre-tests cover far more of the course than SpecuLearn does.** Whatever
survives, it should be the pre-test's coverage, not SpecuLearn's.

## 5 · Files this touches

```
src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx
src/app/pretests/[id]/PretestContent.tsx
src/app/pretests/picture/[collectionId]/PicturePretestContent.tsx
src/app/pretests/unit0/…
src/lib/pretestRecord.ts          the gap store — must not import progress.ts
src/lib/pretests/runner.ts
src/lib/collections/speculearnReady.ts
src/content/activities.ts         the `speculearn` registry row and its blurb
verify/verify40-pretest-record.py the guard that will fight this, correctly
```

## 6 · What must not be silenced

`verify40` will go red on any merge that lets a diagnostic reach the scoring
machinery. **That is the check doing its job.** If Dan picks B, the check is
*rewritten* to assert the new boundary — first pass unscored, later passes
scored — never deleted or weakened. The repo has a standing rule about this and
`verify51` is the worked example: it asserted SIO-006 must have no lesson, Dan
reversed the ruling, and the check was amended **with the reasoning recorded**
rather than removed.

The stripped pre-test rail is the same kind of thing: it exists to keep the
pre/post boundary visible, so a learner cannot slide from a cold diagnostic
into scored practice without noticing. If the two become one door, that
boundary has to be expressed some other way — on the card — not simply
dropped.

## 7 · Where this came from

Raised by Dan on 1 Sep while reviewing two mock-ups of a `/practice` hub
(assignment 2 in `#113`). The hub made the overlap visible: the Practice
family has three activities, one of which (`Memo`) has no href, so the hub
renders **two tiles** — and one of those two, SpecuLearn, is also the door to
pre-tests, which are not practice at all. The hub decision (A or B) is still
with Dan and is tracked separately; this document is only about the
SpecuLearn/pre-test overlap it exposed.
