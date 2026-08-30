# Handoff — the three tiers, and who takes what

**From the Peers session to colour review, 30 Aug 2026.** Companion to
`docs/SYLLABUS_TIERS.md` (the classification) and `docs/LESSON_SPEC_PLAN.md`
(the tracks). Both are in PR #71.

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

## What I am doing next — do not start these

**Track A, the container.** It is one agent's job by definition: every item is
in the same three files, so a second agent working here is a merge conflict, not
help.

- `src/content/lessons/native/types.ts`
- `src/lib/lessonEntry.ts`
- `src/components/LessonPager.tsx`

A1 first, because everything waits on it. `DiceQuestion.med` is
`{ before, choices, correct, after }` — **one** blank, and which blank is fixed
by the generator. Dan's ★★ ("pick the verb AND the article") is therefore not
expressible in the type. Adding an optional `slots?: Slot[]` beside `med`, with
`med` derived when absent, lets the 47 existing generators keep working while
the ladder gets rebuilt on *which slots are given* instead of on
`mcq | gap | build | translate`.

Then A3 (`concept` on `NativeLesson`) and A4 (render the pathway in order).

**Two things for Dan, not code.** A Tier 2 sample lesson page for him to
approve — he has approved a Tier 1 shape and nothing else, and nobody should
author fifteen Lexical Core lessons against a shape I invented. And the activity
cull: all 20 activity keys, what each drills, which tier it serves or none.

## What is yours, if you want it

### 1 · Track D — Le lexique. It was "low priority" and it is not.

This is the change that matters most to you. `LESSON_SPEC_PLAN.md` filed the
lexique as a low-priority side surface because it assumed every stop was a
grammar lesson with a lexique bolted on the end. Under the classification,
**15 stops are Tier 2 — and for those the lexique is not a side surface, it is
the lesson.**

Dan's brief for Tier 2 is *"meaning-focused, semantic mapping, contextual
retrieval"*. Semantic mapping is an information-design problem before it is a
data problem: the same set of words carved two different ways, and the carving
is what teaches. `src/content/collections/aliments.json` is the honest test —
28 items, and the tags already carve them by category (`col:boissons`,
`col:viandes`, `col:legumes`, `col:repas`).

**One thing to know before you start: 12 of those 28 items carry no `col:` tag
at all** — croissant, pain, fromage, riz, pâtes, pomme, beurre, sucre, farine,
huile, soupe, frites. So the deck cannot render a semantic map today. That is a
content fix, not a design one, and it is mine unless you want it; either way it
blocks the surface, so say early if you are taking Track D.

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

Mine: `types.ts`, `lessonEntry.ts`, `LessonPager.tsx`, the native lesson
modules, `docs/SYLLABUS_TIERS.md`.

Yours: `globals.css`, the tokens, the deck surfaces, `/decks`, anything under
Track D.

Append-only and expect trivial conflicts: `docs/STATUS.md`, `AGENTS.md`,
`src/content/lessons.ts`, `src/content/lessons/native/index.tsx`. Resolve by
keeping both sides — that has been the right answer every time so far.
