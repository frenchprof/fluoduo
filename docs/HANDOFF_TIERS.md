# Handoff — the three tiers, and who takes what

**From the Peers session to colour review, 30 Aug 2026.** Companion to
`docs/SYLLABUS_TIERS.md` (the classification) and `docs/LESSON_SPEC_PLAN.md`
(the tracks). Both are in PR #71.

> **Corrected 31 Aug, and the correction is the important part.** This file's
> "what I am doing next" claimed Track A. By the time it merged, `25e13ee` and
> `99d5c4a` were already on main: `LessonConcept` is on `NativeLesson`, and the
> six tabs render as front matter. **A3 and A4 are DONE and they are not mine.**
> Thank you for the warning — it stopped me rebuilding both. See "Where Track A
> actually stands" below, which replaces the section under it.
>
> One thing you may want from Dan before going further. He ruled on 30 Aug:
> *"must not be in french for the instructional headings."* The six tabs shipped
> as **Le parcours · Le concept · Les formes · L'exercice · Le bonus · Le
> lexique**. Those are instructional headings, so his rule reaches them — but
> they are also the names in his own three approved pages, which is why you
> used them and why I would have too. It needs his word, not ours. I have put
> the question to him.

## Where Track A actually stands

| | | |
|---|---|---|
| **A1** multi-slot `DiceQuestion` | **still open — and bigger than I said** | `med` is still `{ before, choices, correct, after }` on main: one blank, fixed by the generator. Dan's ★★ remains inexpressible. **31 Aug: it blocks Tier 2 as well.** He specified the vocabulary ladder as ★ whole item · ★★ fill the article · ★★★ fill article *and* noun — the same two-slot cloze. So A1 unblocks **35 stops, not 20**. Mine unless you say otherwise. |
| **A2** the ★ ladder on scaffolding | **still open**, blocked by A1 | `lessonEntry.ts` still varies `mcq \| gap \| build \| translate`. |
| **A3** `concept` on `NativeLesson` | **done — yours** | `LessonConcept` with `subtitle / contrast / question / answer / remember` required. Better than what I had planned: requiring a claim *and* a question is what stops a concept decaying into a second Mémo. |
| **A4** render the pathway | **done — yours** | The six tabs, as front matter. |
| **A5** self-check interaction | **subsumed** | `LessonConcept.check` covers it. |

So the only thing left in the container is the question type, and it does not
touch `LessonPager.tsx` or the tab work at all. We are not in the same files.

## What happened, in three sentences

Dan sent three of his original lesson pages and said the framework in them had
been misunderstood, and had drifted "into things like EtuDice and Sorting". He
then gave the architecture to measure the drift against: **Systemic Grammar /
Lexical Core / Phraseology**, each with its own treatment. All 50 stops are now
classified — 20 / 15 / 15 — and the finding is that **all three of his approved
pages are Tier 1**, so the pathway everyone has been treating as universal is
one tier's treatment out of three.

Then Dan added: *"Ateliers and phrases go together, it is about using the same
set of phrases in context."* That folds the six ateliers into Tier 3, which is
why Tier 3 is 15 and not 9.

## What I am doing next — the corrected list

**A1, the question type, and only that.** `DiceQuestion.med` is
`{ before, choices, correct, after }` — one blank, fixed by the generator. Dan's
★★ ("pick the verb AND the article") is therefore not expressible. The plan is
an optional `slots?: Slot[]` beside `med`, with `med` derived when absent, so
the 47 existing generators keep working while the ladder is rebuilt on *which
slots are given*. That is `types.ts` and `lessonEntry.ts`; it does not enter
`LessonPager.tsx`.

**The Tier 2 shape, for Dan.** A sample lesson page he can approve, since he has
approved a Tier 1 shape and nothing else and nobody should author fifteen
Lexical Core lessons against a shape I invented. Two rulings already came back
on it and both are worth knowing here:

- **Instructional headings in English.** His words, 30 Aug. Applies to whatever
  either of us writes.
- **A vocabulary lesson keeps the same six tabs.** My draft invented a seventh
  stage; Dan's answer was that *Les formes* for a noun is the vocab list with
  **gender**, as in SpecuLearn. So the tabs don't change per tier — only their
  contents do.
- **The ladder is the same cloze in both tiers.** I twice got this wrong. First
  I made the vocabulary ladder a sorting task, and Dan's verdict was that it
  "asks the wrong questions" — it was the Sorting game wearing a ladder's
  clothes, i.e. the exact drift he sent us to fix. Then I claimed the corrected
  version needed no type change. It does: he specified ★★ as *fill in the
  article* and ★★★ as *fill in the article and the noun*, which is a two-slot
  cloze on one frame — structurally identical to L08's ★★. **One mechanism
  serves both tiers**, which is the strongest argument for A1 there is.

**The activity cull.** All 20 activity keys, what each drills, which tier it
serves or none — for Dan to strike through.

## What is yours, if you want it

### 1 · Track D — Le lexique. It was "low priority" and it is not.

This is the change that matters most to you. `LESSON_SPEC_PLAN.md` filed the
lexique as a low-priority side surface because it assumed every stop was a
grammar lesson with a lexique bolted on the end. Under the classification,
**15 stops are Tier 2 — and for those the lexique is not a side surface, it is
the lesson.**

Dan's brief for Tier 2 is *"meaning-focused, semantic mapping, contextual
retrieval"*, and on 30 Aug he sharpened it twice: sort the words **by course** —
dessert, main dish, fruit — and *do not* separate starter from main, because in
a French meal the two overlap. Then, on what a vocabulary lesson's *Les formes*
should hold: **a vocab list with gender**, as in SpecuLearn.

`src/content/collections/aliments.json` is the honest test, and it fails three
ways. Every one is a content fix that blocks your surface, so take them as the
prerequisite list rather than as trivia:

1. **12 of the 28 items carry no `col:` tag** — croissant, pain, fromage, riz,
   pâtes, pomme, beurre, sucre, farine, huile, soupe, frites.
2. **Nothing records a course.** No field, no tag.
3. **Nothing records gender**, and the strings often hide it. `du` is *de + le*
   so it does mark masculine, and `de la` marks feminine — but `de l'` and `des`
   mark nothing, which covers **7 of the 28**: de l'eau, de l'huile, des pâtes,
   des frites, des asperges, des champignons, des oignons. A learner who only
   ever meets *de l'eau* is never told that *eau* is feminine.

Point 3 is the one worth having. It is not a data gap to paper over — it is the
lesson. The sample builds the forms stage around exactly that column.

These are mine unless you want them; either way say early if you are taking
Track D.

### 2 · Do the three tiers want a visual identity?

Genuinely open, and squarely yours. If a learner can see from the map that stop
22 (possessives) and stop 41 (aliments) are *different kinds of thing that ask
different work of them*, the architecture teaches by itself. If they cannot, it
stays a spreadsheet distinction that only we can see.

The obvious risk is that this collides with the region colours, which
`verify30-dopamine.py` guards and which the colour review deliberately left as
their own system. Tier could be a non-colour cue — a mark, a rule weight, a band
texture — precisely so it does not fight regions. Your call; you own the
palette, and I would rather you rule on it than route around it.

## Two traps, both paid for already

**The deck-file trap.** 20 deck names exist at BOTH `src/content/<name>.json`
(the letris *tile* file) and `src/content/collections/<name>.json` (the card
deck the app actually reads). Anything auditing a deck must resolve
`collections/` FIRST. I got this wrong last week, declared a content gap that
did not exist, and built a lesson on the strength of it before Dan caught it.

**Accents are not word characters.** `\bà le\b` never fires, because `à` is not
ASCII and there is no word boundary before it. This bit me four times in one
session. Use `(^|\s)à (le|les)(\s|$)`. Any check touching French text needs
breaking on purpose before it is believed.

## The line between us

Mine: `DiceQuestion` / the ladder in `types.ts` and `lessonEntry.ts`, the deck
content fixes above, `docs/SYLLABUS_TIERS.md`.

Yours: `LessonPager.tsx` and the six tabs, `LessonConcept` and the concept
drafts, `globals.css`, the tokens, the deck surfaces, `/decks`, Track D.

`types.ts` is now shared — you own `LessonConcept`, I own `DiceQuestion`. They
are different declarations in one file, so expect a conflict only if we both
touch the imports.

Append-only and expect trivial conflicts: `docs/STATUS.md`, `AGENTS.md`,
`src/content/lessons.ts`, `src/content/lessons/native/index.tsx`. Resolve by
keeping both sides — that has been the right answer every time so far.
