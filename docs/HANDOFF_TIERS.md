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
| **A1** multi-slot `DiceQuestion` | **done — #79** | `slots` is on `DiceQuestion`; `cloze.ts` has `sentence`, `cloze`, `medFrom`, `blankKeysFor`; `aimer.gen.ts` is converted and ★★ genuinely blanks two. `med` is **derived**, not deleted — 47 generators author it by hand and every card builder reads it, so `medFrom` reproduces the legacy shape and `verify57` asserts the derived value equals what `aimer` used to write itself. Nothing else had to change on the day. |
| **A2** the ★ ladder on scaffolding | **still open**, blocked by A1 | `lessonEntry.ts` still varies `mcq \| gap \| build \| translate`. |
| **A3** `concept` on `NativeLesson` | **done — yours** | `LessonConcept` with `subtitle / contrast / question / answer / remember` required. Better than what I had planned: requiring a claim *and* a question is what stops a concept decaying into a second Mémo. |
| **A4** render the pathway | **done — yours** | The six tabs, as front matter. |
| **A5** self-check interaction | **subsumed** | `LessonConcept.check` covers it. |

So the only thing left in the container is **A2**, rebuilding the ladder on
which slots are given rather than on `mcq | gap | build | translate`. That
touches `lessonEntry.ts` and the card builder, not `LessonPager.tsx` or the tab
work. We are still not in the same files.

Two things from #79 worth having, because both are the kind that rot quietly.

**Two of my assertions passed through their own breakage.** I compared
`sentence(slots)` to `correct` — but the generator now builds `correct` *from*
the slots, so both sides moved together and deleting a full stop stayed green.
Rewritten against `easyOptions`, which is still assembled the old way and is
therefore an independent oracle. If you convert a generator to slots, do not
check it against a value it derives.

**`verify-wiring` earned its keep, twice in one day.** My check was 55; while it
sat in review you landed `verify55-atelier-cards` and then
`verify56-sorting-answers`. Both collisions were caught in CI on the first push.
It is now 57. A day on a branch is enough to collide twice — take the next free
number at push time, not at write time.

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

## The concept brief differs per tier — the count does not

Your `LessonConcept` requires `subtitle / contrast / question / answer /
remember`, and *"the first of forty-seven"* is the right count: every native
lesson wants one. What changes per tier is **what the question is a question
about**, and it is worth writing on the type rather than rediscovering it at
stop thirty.

| tier | the concept answers a question that… | worked example |
|---|---|---|
| **1 · Systemic Grammar** | **the forms** cannot answer | *Why does « son cahier » mean both his and hers?* — because possessives agree with the thing owned. No table yields that, which is why the table comes after. |
| **2 · Lexical Core** | **the word list** cannot answer | *Why is it « une tarte aux pommes » but « un jus de pomme »?* — à + article names an ingredient among others, de + bare noun names what the thing is made of, and the preposition carries the number with it. English builds both the same way and gives no warning. |
| **3 · Phraseology** | **untested** | Nobody has tried to fill the type from a phrase stop or an atelier. |

Same type, same required fields, different target. `contrast` survives the move
intact in Tier 2 — English *does* contrast, it just contrasts over name-building
rather than over agreement.

**Tier 3 is the open question and it is worth answering before the six
ateliers.** A Phraseology stop teaches blocks — *bon voyage*, *je voudrais…*,
*d'abord / ensuite / puis / enfin* — and the honest doubt is whether `contrast`
and `remember` mean anything there. *Enchanté* has no English logic to be set
against; it is just what you say. If the type does not fit, better to find out
on one than on six. Write one and see: that is a cheaper experiment than any
amount of arguing about it, and the answer changes the type or confirms it.

## The split, as Dan approved it on 31 Aug

No longer a proposal. He gave you the go for this, so it is the standing
arrangement until he says otherwise.

| | |
|---|---|
| **Colour review** | **Track C + Track D together, Tier 2 first**, in batches of **five stops**, each batch being one review sitting for Dan. |
| **Peers** | The container. A1 is done; A2 next. |

Two things about that shape are load-bearing, and both are yours, not mine.

**The binding constraint is Dan's review rate, not agent capacity.** Your own
type comment says it — `contrast` and `remember` are *"drafted for Dan, never
shipped past him"* — so a second agent on Track C builds him a longer queue
rather than finishing sooner. Batches of five exist for that reason. Do not let
a batch grow because the authoring went quickly.

**For Tier 2, C and D are one job.** Your framing, and it is right: *"what does
the word list not tell you"* is the concept **and** the argument for the
surface. The aliments sample is the demonstration — the forms tab only became
worth anything once it showed 42 words sorted by gender with nine of them hiding
it, which is a surface, not a paragraph. Author the concept and build the
lexique in the same pass or neither will be honest.

## What is yours, if you want it

### 1 · Track D — Le lexique. Settled: yours, and not low priority.

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

1. ~~12 of the 28 items carry no `col:` tag.~~ **I had this wrong and it is
   worth un-learning.** `col:` values are not a semantic taxonomy — they feed
   `gameConfig.letris.columns`, which declares exactly four: repas, legumes,
   viandes, boissons. An item without one simply does not appear in Letris. So
   the untagged items are not a defect, and inventing `col:feculents` would
   produce a tag nothing reads.
2. **Nothing records a course**, and this is the real gap. No field, no tag,
   nowhere — so the arrangement a Tier 2 word list needs has no source.
3. **Nothing records gender**, and the strings often hide it. `du` is *de + le*
   so it does mark masculine, and `de la` marks feminine — but `de l'` and `des`
   mark nothing, which covers **7 of the 28**: de l'eau, de l'huile, des pâtes,
   des frites, des asperges, des champignons, des oignons. A learner who only
   ever meets *de l'eau* is never told that *eau* is feminine.

Point 3 is the one worth having. It is not a data gap to paper over — it is the
lesson. The sample builds the forms stage around exactly that column.

These are mine unless you want them — say which, since you have Track D now.

One is already done: Dan said *"then grow it!"* and `aliments` went from 28 to
42 words (#73). The gender split is now 23 masculine, 10 feminine and **9 that
hide it**. The course/category gap is untouched and, per Dan on 31 Aug —
*"we don't need a course field, there is no need to dwell in courses"* — it
should stay untouched. Do not build an arrangement the data does not support and
he has not asked for.

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
