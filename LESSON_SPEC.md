# LESSON_SPEC.md — the one place that is true about a lesson's shape

Every agent working on a lesson reads this file first. Where habit, older
docs, or taste disagree with this file, **this file wins**. It changes only
by Dan's explicit ruling, recorded here with its date. A lesson PR cites
the clause it implements.

## §0 Thesis

One lesson shape, fifty fillings. The wrapper is **invariant** — four phases
in fixed order; the frame is the **variable** — the slot chain, its banks,
its dependency rules. Underneath all fifty stops is one idea: *a French
sentence is a chain of dependent choices, and every phase trains one link
deeper in that chain.*

## §1 The four phases

| # | Phase | Tab | Original source | Learner's question | What varies |
|---|---|---|---|---|---|
| 1 | Goal | Goal | Overview tab | *Why am I here?* | One communicative line |
| 2 | Form | Form | Guide tab | *What do the words look like?* | Layout by lesson type |
| 3 | Idea | Idea | Big Idea tab | *Why do they behave this way?* | One-sentence dependency rule |
| 4 | Exercise | Exercise | Practice tiers | *Can I do it?* | Banks + ladder from the frame |

**Order (ratified 16 Sep):** Goal → Form → Idea → Exercise. **Landing
(13 Sep):** the lesson lands on Idea. *Order and landing are two rulings;
neither overrides the other.*

**SpecuLearn boundary:** the learner has already guessed unsupported before
arriving. Exercise never re-runs that.

## §2 Frame taxonomy — where the weight falls

| Lesson type | Examples | Forms shows | Idea (one sentence) | Exercise does |
|---|---|---|---|---|
| Closed + grammatical | être, articles, partitifs | Full paradigm table | The rule — agreement, contraction, du/de la/de | Choose or type the form in a sentence |
| Closed + lexical | Numbers, days, nationalities | The whole set | The generating pattern — 70 = 60+10; m/f endings | Build a new item from the pattern |
| Open + lexical | Food, hobbies | A core sample, gendered | The frame the words live in — aimer + le/la + noun | Slot new words into the frame |
| Open + functional | Greetings, ordering, directions | Short dialogues | The pragmatic idea — tu/vous, politeness | Pick the right reply for the situation |

**Orthogonal, not competing:** this 2×2 types the *lesson* — what is taught
and where the weight falls. RECTIFICATION.md's Frame A–L taxonomy types the
*slot shape the Exercise cascade renders* (§5). Every lesson carries exactly
one of each — stop 08 is open-lexical with a Frame A chain — and the §6
schema already holds both fields (`type:` and `frame:`). Neither taxonomy
replaces the other.

## §3 Form

**Layouts — four templates:** table (paradigms) · list (sets) · audio pairs
(sound-based points) · short dialogues (functional). *Claim to verify, not
dogma: these four cover all 50 SIOs. The audit settles it (§8).*

**MémoiRecall ruling (19 Sep, PR #416 — supersedes the 16 Sep umbrella):**
*"No more hiding MémoiRecall as an embedded page within MneMemo — it looks
awful."* MémoiRecall is the standalone station again; the folded
cards-inside-Form shape is gone. Form shows the Mémo grid; the cards live
at their own door. **One copy, one door still holds — only the door's
location changed.** No fifth tab.

**Gender clause:** every noun appears with its article — in the Mémo grid
**and on the MémoiRecall cards at the standalone station**. *(Closes the gap
recorded 16 Sep: "recorded and drawn nowhere.")*

## §4 Idea (Concept)

- **One sentence, learner English.** Litmus: if you can cut it without
  harming the lesson's reasoning, cut it.
- **Dual focus:** Forms covers the primary focus; Concept links the
  secondary in a single sentence.
- **Cultural content is allowed *inside* the one Concept label** — tu/vous's
  "why" is sociolinguistic but still *the reason the forms behave as they
  do*. No fifth label.

## §5 Exercise

**The ladder is the primary mechanic** *(shipped as the slot-cascade,
verify58 19/19)*:

1. **★ Pick the dependent slot** — the choice in one slot determines the
   next; all plausible forms as distractors
2. **★★ Type the word** — the word just picked by MCQ
3. **★★★ Type the sentence** — from the emoji/English prompt

A tier is scaffold removal, never a new activity type.

**Engine clauses:**
- Sentence and slots are built from **one source of glue** — never
  maintained twice. *(verify58 caught « Ils n' adorent » this way.)*
- The frame may be **a function of the verb** (Frame D: aller takes
  preposition + place). Declare per verb-set. *(faire.gen.ts precedent.)*
- **Discontinuous slots** (ne…pas) are declared as one slot spanning two
  positions — a "wraps" relation.
- **Non-sentence stops** (time, numbers): the slot generalizes to a choice
  point; the tiers still hold. Existing games may serve as the renderer
  where the frame matches.
- **Only the built frames get dropdowns** (19 Sep, PR #422): the cascade
  guards on the blankable-key set; every other slot shape falls back to
  the free-text exercise.

## §6 Data schema — one per stop

```yaml
id: 08
title: "aimer + le/la/les"
goal: "Say what people like and don't like doing"
type: open-lexical          # from the 2×2 (§2)
frame: subject → verb → article → noun   # RECTIFICATION Frame A
banks:
  verbs: [aimer, adorer, détester]
  nouns: {le: sport, la: natation, "l'": équitation, les: "jeux vidéo"}
forms:
  layout: table            # table | list | audio | dialogue
concept: "The ending follows the subject; the article follows the noun."
exercise:
  tiers: [pick-dependent-slot, type-word, type-sentence]
```

## §7 Constitution

1. Four phases, fixed order; landing per 13 Sep — two rulings, both stand.
2. One idea per stop, one sentence, learner English.
3. Every noun carries its article everywhere in Form.
4. Exercise is generated from the frame — same banks, one glue source.
5. The ladder is fixed; tiers are scaffold removal, never new activities;
   never re-run SpecuLearn.
6. Chrome in English; French only where French is the content.
7. No new tab, category, layout, or label without an explicit Dan ruling.
8. Lesson PRs cite the clause implemented; verifies pin the structure per
   stop, break-tested.
9. This file changes only by Dan's ruling, dated. Where it disagrees with
   history docs, it wins.

## §8 Migration — extraction, not authorship

The 49 originals **already contain** all four parts: Overview→goal, Guide→
forms, Big Idea→concept, Practice→frame+tiers. The audit is mechanical.

**Acceptance test:** extract the next original (`09-*.html`) cold. It must
land in one row of the 2×2 and one of the four layouts without forcing a
fifth. If it forces a fifth, the taxonomy grows that entry *before*
stamping the remaining stops.

## §9 Rulings — settled by Dan, 19 Sep

1. **Cultural Concept: ONE LABEL, CULTURE ALLOWED.** A lesson's
   one-sentence Idea may carry pragmatic, sociolinguistic or cultural
   content — the "why" is the why, wherever it sits. No fifth label.

2. **Hint fading: NO — PERMANENTLY.** Dan's own words: *"THE DIFFICULTY
   LEVEL IS UNIQUE TO MNEMEMO PROGRESSIVE REMOVAL OF SCAFFOLDING AND HAS
   NOTHING TO DO WITH FADING OR WHATEVER YOU ARE THINKING OF."* The
   ★/★★/★★★ ladder is the one difficulty mechanic. There is no second
   layer, no within-tier fading, and this ruling does not expire.
