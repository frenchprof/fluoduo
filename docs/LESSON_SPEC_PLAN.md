# Restoring Dr Chan's lesson framework — the work, split for parallel agents

**Written 30 Aug 2026 by the Peers session, for whoever takes a track.**

Dan supplied three of his original lesson pages — `08 aimer le/la/les`,
`09 faire du/de la/des`, `13 possessifs` — and said: *"Yes they represent what
ALL SIOs should look like."* They are the specification. This file is the work
that implies, cut so that separate agents can run without colliding.

## The spec, from the three pages

Every lesson is a **pathway, followed in order**, not a menu:

| stage | what it is | in the app today |
|---|---|---|
| 🗺 **Vue d'ensemble** | orientation: the pathway and what each stage does | — |
| 💡 **Le concept** | a **puzzle**, not a summary | partly, inside `memo` |
| 📖 **Les formes** | rules, conjugation tables, Explorer widgets | `memo` |
| 📊 **Side-by-side** | the contrast made explicit | — |
| ⚠️ **Common Mistakes** | the traps, named | sometimes, inside `memo` |
| ✅ **Self-check** | hover-to-reveal Q&A, a **gate** before drilling | — |
| 📝 **L'exercice** | the ★/★★/★★★ scaffold ladder | `dice`, wrongly |
| ⭐ **Le bonus** | EN→FR, no hints, aim 80%+ | `bonus` |
| 📚 **Le lexique** | reference table with test modes | the deck, elsewhere |

Two things about the spec are easy to miss, and both were missed once already.

**The concept is a question the forms cannot answer.** L13's is *"Why does
`son cahier` mean both HIS exercise book and HER exercise book?"* — answered by
*"possessives agree with the thing owned, not the owner."* A learner cannot
derive that from a table, which is why the table comes after. Our Mémos state
rules; his pages earn them.

**Two lessons may be two doors into one room.** L08 is titled from `aimer` and
L09 from `faire`, and BOTH contain the same three sections and the same
`🔎 Découvertes : ❤️ Aimer vs 💪 Faire`. He did not split the contrast across
two stops — he gave each stop the whole contrast, framed from its own side.
Any plan that "re-joins" them has misread it. (I proposed exactly that, and was
wrong.)

## The ladder is a TYPE change, not a config change

Dan's levels remove scaffolding from **one** sentence:

```
★    subject + article+noun shown   ->  pick the VERB
★★   subject + BARE NOUN shown      ->  pick the VERB and the ARTICLE
★★★  nothing shown                  ->  type the whole sentence
```

Today `DiceQuestion.med` is `{ before, choices, correct, after }` — **one**
blank, and which blank is fixed by the generator. **★★ is not expressible.**
`src/lib/lessonEntry.ts` currently varies the *kind* of exercise instead
(`mcq | gap | build | translate`), which produces a difficulty gradient without
the mechanism: `gap` does not know which slot it blanked, so it can never
isolate the le/du contrast at the moment its support is withdrawn. That is the
whole grammatical point of L08/L09.

This is the highest-leverage item in the plan and everything in Track C
depends on it.

## Where things stand

```
50 SIOs   39 with a lesson   6 ateliers   5 with neither
47 native lesson modules
NativeLesson = { slug, memo, dice, bonus }        <- 4 fields, 9 stages
```

## The tracks

Cut along **conflict surface**, which is what actually decides whether two
agents can run at once.

| track | touches | conflict | can start |
|---|---|---|---|
| **A · the container** | `types.ts`, `LessonPager.tsx`, `lessonEntry.ts` | HIGH — one agent only | now |
| **B · the checks** | `verify/verify5x-*.py` | none | after A's types land |
| **C · the content** | one `.tsx` + one `.gen.ts` per lesson | none between authors | after A ships |
| **D · the lexique** | deck surfaces, `/decks` | low | any time |

Registries (`lessons.ts`, `native/index.tsx`) and `docs/STATUS.md` are
append-only: expect trivial conflicts, resolve by keeping both.

---

### Track A — the container (ONE agent, blocks C)

**A1. Multi-slot questions.** Extend `DiceQuestion` so a question exposes its
parts rather than one pre-blanked frame. Enough to express: blank the verb;
blank the verb AND the article; blank everything. Keep the current single-blank
shape working — 47 generators use it, and they must not all be rewritten at
once. Suggest an optional `slots?: Slot[]` beside `med`, with `med` derived
when absent.

**A2. Rebuild the ★ ladder on scaffolding.** Replace the `ExerciseKind[]` ramps
in `lessonEntry.ts` with levels defined as *which slots are given*. Delete the
mcq/gap/build/translate mix for lesson entry (those kinds stay valid for other
surfaces). Break-test that ★★ genuinely presents two choices.

**A3. Add the missing stages to `NativeLesson`.** At minimum `concept` and
`selfCheck`; decide whether `sideBySide` and `mistakes` are their own fields or
part of `memo`. Every field optional, so 47 existing lessons keep compiling.

**A4. Render the pathway in `LessonPager`.** Stage order, the "Do not skip
this" weight on `concept`, and the self-check as a **gate** before exercises —
Dan's pages make it a gate, not a page.

**A5. Self-check interaction.** Hover/tap to reveal. On a phone, hover is a
tap; check it does not fight the existing tap-to-speak SpeakZone.

### Track B — the checks (independent once A's types exist)

**B1.** Every non-atelier SIO has a `concept`, and it is a QUESTION — assert a
`?` and a minimum length, so nobody satisfies it with a restated rule.
**B2.** Every lesson with a self-check has ≥2 items, each with an answer.
**B3.** The ★ ladder: ★ blanks one slot, ★★ blanks two, ★★★ blanks all —
executed, not read.
**B4.** Paired lessons carry each other's contrast (the L08/L09 rule): if a
lesson names a sibling, both must render the same side-by-side.
**B5.** Extend `verify27` (one goal, one lesson) so a stage cannot be silently
empty — an absent `concept` should fail loudly, not render nothing.

### Track C — the content (parallel, one agent per unit)

44 lessons at 9 stages each. **This is the bulk and it is authoring, not
refactoring.** Per lesson:

- **C1.** Write the concept as a puzzle the forms cannot answer.
- **C2.** Move the existing Mémo body into `formes` unchanged where it already
  states rules well.
- **C3.** Side-by-side, where the lesson has a contrast; name the sibling stop
  if the contrast spans two (L08/L09 pattern).
- **C4.** Common mistakes — several already exist inside Mémos as ⚠️ lines.
- **C5.** Two to four self-check questions, testing the CONCEPT, not recall.
- **C6.** Confirm the generator can produce the three scaffold levels; extend
  it if not.

Suggested split: **unit 0 · unit 1 · unit 2 · unit 3 · unit 4**, ten stops each,
six of which are ateliers and need no lesson. No two unit-owners share a file.

### Track D — Le lexique (independent, low priority)

The reference table with test modes — see French recall English, and back;
click any cell to reveal. The decks hold the data; this is a surface.

---

## Decide before starting

1. **Does every stage apply to every stop?** Some Unit 0 stops are a handful of
   words. A forced nine-stage pathway on « Les couleurs » may be worse than a
   short one. Dan's three samples are all grammar lessons.
2. **Is the self-check a hard gate or a nudge?** His page says *"pass the
   self-check"*, but a hard gate can trap a learner. A gate that can be walked
   past is a different build from one that cannot.
3. **What happens to the games?** EtuDice, Sorting, Letris, VocabulaRain and the
   rest are not in the framework. Do they stay as extra practice reachable from
   the stop, or leave the lesson pathway entirely?
4. **Migration.** 47 lessons ship today with a Mémo and no concept. Do they show
   a pathway with a missing first stage, or keep the current shape until their
   unit is authored? Track A's optional fields make either possible; the choice
   is Dan's.

## The one thing that can start immediately

**A2 without A1** is not worth doing — the ladder cannot be fixed without the
type. But **A1 is self-contained**, testable in isolation, and blocks
everything else. Whoever takes Track A should start there.
