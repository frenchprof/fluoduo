# The Tier 2 sample — the shape a Lexical Core lesson takes

`build-tier2-sample.py` renders `tier2-aliments.template.html` into a standalone
page for **SIO-041 « Les repas et les aliments »**. Run it from the repo root:

    python3 docs/samples/build-tier2-sample.py

It reads the live deck and `src/fonts/FluOlinGoHandRegular.otf`, so the page
shows the deck's real counts and the app's real typeface. Nothing is hardcoded
and nothing is remembered: **change `aliments.json` and the script either
follows or fails**, which is deliberate. It failed exactly that way when the
deck grew from 28 to 42.

## What it is for

Dan approved a lesson shape for **grammar** stops — his own `08 aimer`,
`09 faire du/de la` and `13 possessifs` — and nothing for the other two tiers.
`docs/SYLLABUS_TIERS.md` sorts all 50 stops; 15 are Lexical Core. This page is
the shape those 15 should take, iterated with him on 30–31 Aug 2026 and settled.

## What it settled

**The tabs do not change per tier.** An early draft invented a seventh stage
called "the map". Dan's correction: a vocabulary lesson runs the same six tabs
— Learning path · The concept · The forms · The exercise · The bonus · The word
list — and only the *contents* of two of them differ.

**A noun has forms; they are not conjugations.** Dan: *"a vocab list with gender
and so on, as seen in SpecuLearn."* Sorting the deck by gender gives 23
masculine, 10 feminine and **9 whose article hides it** — `de l'` before a vowel,
`des` in the plural. A learner who only ever meets *de l'eau* is never told that
*eau* is feminine, and the deck records no gender field at all. That third
column is what the tab is built around.

The tab's second half is Dan's too: compound names, **à + article + noun** for
one important ingredient (*une tarte **aux** pommes*) against **de + noun** for
what a thing is made of (*un jus **de** pomme*). Same fruit, and the preposition
carries the number with it. English builds both the same way, which is what
makes it teachable material rather than trivia.

**The exercise is the same cloze as a grammar lesson.** ★ choose the item whole ·
★★ fill in the article · ★★★ fill in the article and the noun, on one frame:
« Je prends **du** pain avec **du** beurre. » Two article slots, because *avec*
takes the partitive again and the second is the one learners drop.

The consequence is in `docs/HANDOFF_TIERS.md`: `DiceQuestion.med` holds one
blank fixed by the generator, so **A1 unblocks 35 stops, not 20**. One mechanism
serves both tiers.

## Two wrong turns, kept because they are instructive

**The ladder drilled classification.** The first version asked which course a
word belonged to. Dan: *"the ladder asks the wrong questions."* It was the
Sorting game wearing a ladder's clothes — the exact drift this whole effort
exists to correct, reproduced by the person correcting it.

**Courses, at all.** The rewrite kept the classification as the word list's
*arrangement*. Dan: *"we don't need a course field, there is no need to dwell in
courses."* It is gone, and no course field is proposed anywhere.

## Still open

- **The frame.** « Je prends… » cannot hold all 42 words: nobody says *je prends
  du sel*. Probably three frames per stop — one for things you eat, one for
  ingredients (*je mets… dans…*), one for ordering — with the word's group
  picking the frame. An authoring rule, not code, and the same question at all
  15 Lexical Core stops.
- **The tab names.** They ship in French. Dan's ruling is that instructional
  headings must not be, and he has named the first one **Learning path**.
