# Handoff: `claude/peers-vd2h6h` → fluoduo-main

**Peers (fluoduo-f2), 31 Aug 2026.** Dan, this afternoon: *"can we, moving
forward, push everything to fluoduo-main for quality check, and letting
fluoduo-main do the necessary merging?"* This is that handoff. The branch is
pushed and will not be merged by me.

## Land #97 first. This branch rebases onto it, not the other way round.

Both branches merge cleanly into `main` and **conflict with each other on five
files**. #97 is the larger structural change and was opened first; this one is
presentation plus two lesson files and is much cheaper to replay.

```
src/app/lessons/pager/LessonPager.tsx
src/app/lessons/pager/LessonTabs.tsx
src/app/lessons/pager/buildCards.tsx
src/content/lessons/native/cloze.ts
src/content/lessons/native/types.ts
```

Verify numbers do **not** collide — #97 takes 65, this branch takes 66.

## The one merge hazard that is invisible in the diff

`blankKeysFor` is edited by both, differently, and **both edits are needed**.

- #97 widens the level to `1 | 2 | 3 | 4` and changes the rule to
  `level <= 2 ? keys.slice(0, 1) : keys`.
- This branch adds `Slot.first`, so ★ withdraws the slot that CLAIMS it rather
  than the leftmost one.

`first` is not cosmetic. Dan's colours ladder (31 Aug) is *"★ just the colour
word · ★★ the colour word and the noun"*, and the phrase is « le feu rouge » —
so the leftmost blankable slot is the **noun**. Without `first`, Facile and
Moyen both blank « feu » and the card asks a learner to name the *thing* when
the lesson is about the *colour*. Nothing in either diff looks wrong; the
lesson is just silently inverted.

**Merged shape** — keep both:

```ts
export function blankKeysFor(level: 1 | 2 | 3 | 4, slots: Slot[]): string[] {
  const blankable = slots.filter(isBlankable);
  const keys = blankable.map((s) => s.key!);
  if (level > 2) return keys;                 // #97: Difficile takes every slot
  const lead = blankable.find((s) => s.first); // this branch: ★ may be claimed
  return keys.length === 0 ? [] : [lead?.key ?? keys[0]];
}
```

`verify66` executes this under `node --experimental-strip-types` and asserts
both halves, so a merge that drops either goes red rather than shipping.

## What to carry over, and what to drop

**Drop from this branch — #97 already settles it.** The `bonus` tab. I held it
open pending Dan's answer; #97 has already cut it and made ⭐ Bonus a *level* of
Practice, which is the better resolution. Take theirs.

**Carry over:**

| what | where | why it must survive |
|---|---|---|
| Short English tab labels — Path · Idea · Forms · Pract. | `LessonTabs.tsx` | Dan chose all-English from three rendered strips, then shortened them himself. #97 branched before this and still has `L'exercice` / `Le lexique`. |
| The strip **wraps**, and carries no number | `LessonTabs.tsx` | Measured: 594px of tabs in a 328px phone strip. `overflow-x-auto` HID the sixth tab — which is why Dan's own shortened list stopped at five. |
| **Words moved under Forms** | `LessonTabs.tsx` | Dan: *"can we put Words under Forms?"* Conflicts with #97 keeping a `lexique` tab — this side wins, it is a later instruction. |
| `Section` + the collapse rule | `LessonTabs.tsx` | Dan: *"now that the page is long please collapse part of it. can you make it a rule for all."* Rule is in AGENTS.md. |
| `Slot.first` | `cloze.ts` | See above. The dangerous one. |
| `DiceQuestion.bigLang` | `types.ts`, `buildCards.tsx`, `LessonPager.tsx` | An EN→FR prompt was going out tagged `lang="fr"`, so 🔊 read English with French phonics. Also the styling Dan asked for: the English reference at the French's size, italic, unbolded. |
| `colors.tsx`, `core-nouns.tsx` | new files | SIO-005 / SIO-006 — the two Tier 2 stops that had a deck and no lesson file. No conflict with #97. |
| `verify66` | new | 68 assertions, eleven break-tested. |
| `verify51` amendment | `verify51-four-more-stops.py` | It asserted SIO-006 must have NO lesson. Amended with the reasoning, not silenced — its case was about the question frames, not gender. |

## Three permanent rules were added to AGENTS.md today

All three are Dan's words, and none is mine to soften:

1. **Show it, don't describe it** — every visible change ships with a picture of
   the real route.
2. **Long pages collapse** — the argument stays open, the apparatus folds, and a
   closed section says what is behind it.
3. **fluoduo-main is the integration lane** — the rule this file exists under.

## State

`tsc` clean · wall-open build green · all 54 suites pass · lint clean on every
file touched. Driven in Chromium at 390 and 880.

**Still with Dan, not blocked on you:** the deploy decision (manual / a Deploy
button / mirror on merge), and `live` is 12 commits behind `main`.

**One thing I noticed and did not fix**, because it is wider than this branch
and #97 is already in that area: the deck supply offers `un · la · une · le` on
a gender card — four articles across two series, so it asks two questions where
the stop teaches one — and a deck with no `gap` data silently turns every
Moyen/Difficile card back into multiple choice. Colours is such a deck.
