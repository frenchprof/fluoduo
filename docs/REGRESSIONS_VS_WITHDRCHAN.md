# The old course site vs the app that replaced it

**`french.withdrchan.com` → FluOlinGo / Fluoduo. Written 24 Aug 2026.**

This merges two independent analyses made the same day. The evidence base for
everything said about the old site is `docs/OLD_SITE_AUDIT.md`, which was read
off the shipped HTML and JavaScript of all eighteen modules plus the index — not
from memory and not from a sample. The framing, the gains/regressions/diluted
split and the learner's-eye reading come from a second agent's analysis, which
was strong on what the change feels like from the learner's seat and wrong on
four counts of fact. The four have been corrected here and the corrections are
named where they land, so this document supersedes both.

Everything about the Fluoduo side was re-measured in this repo at `8e0b6d0`
rather than taken on trust. Where a figure I was given did not survive
re-measurement, the measured figure is used and the discrepancy is stated.

---

## The reframe that matters most

Dan was already leaving the six-tab model before FluOlinGo existed.

The audit confirms the six advertised tabs — `0 Le parcours · 1 Le concept ·
2 Les formes · 3 L'exercice · 4 Le bonus · 5 Le lexique` — hold across modules
01 to 16. But module 17 threw them out entirely for a three-part linear pathway
with mastery gates, a live Firebase leaderboard and a printable results report,
and module 18 replaced them with ten independent drills and twelve topic tabs.
Neither carries the ★/★★/★★★ control at all: `cycleDifficulty` is present in
all sixteen teaching modules and in neither revision module. Those two are the
newest files on the site.

So a good part of what reads as "FluOlinGo regressed" is more honestly "Dan
changed his mind, twice, and FluOlinGo followed the later thinking." The losses
below are still real. They are not all accidental drift, and the difficulty
question in particular is not a question of restoring something that was taken
away — it is a question of deciding something that has now been abandoned twice.

A note on the count, since both analyses got it wrong in different directions:
there are **eighteen** modules, not sixteen. Sixteen teaching modules 01–16,
plus revision modules 17 and 18. The audit itself repeatedly writes "15 of 18"
and "01–16 (15 files)" where it means sixteen; that is an off-by-one in the
audit, caught here by counting `cycleDifficulty` in each file, and it does not
affect any of the audit's other findings.

---

## What got worse

### 1. The why behind the form — LOST

**Then**, *Le concept* opened with reasoning before any table. Four cards, each
explaining why the form is what it is: *"French uses avoir (to have) for age,
not être (to be)… the word ans is always included."* At its best — module 08's
concept tab — this is genuinely taught explanation with a spine rather than a
rule list. It opens with **one question** ("Why does *J'aime le yoga* become
*Je fais du yoga*?"), answers it in a sentence ("Because *aimer* talks about a
**category**, and *faire* talks about **participating** in it"), gives two
mental images (🗂️ the idea of yoga vs 📅 actual sessions of yoga), derives
negation from the same idea ("you are saying there are **zero sessions**"), and
closes with "**If you remember only one thing**: Liking = the activity as a
whole. Doing = taking part in it. Everything else follows from that."

**Now**, Memo goes straight to the structures and the conjugation table. One
warning line survives at the bottom: *"⚠️ Age uses avoir — never Je suis
quinze."*

The warning tells a learner the rule; the concept card told them the reason.
Reasons survive a week; rules get forgotten by Thursday. **This is the one to
fix first**, and it is authoring, not architecture — the Memo surface already
renders arbitrary React, so a why beat costs nothing structurally.

### 2. The opening promise — LOST

**Then**, concrete: *"By the end of this module, you will correctly say: Je
m'appelle… · J'ai … ans. · Je suis + nationalité."*

**Now**, abstract: *"I can introduce myself and other people, ask someone their
name, and address someone politely with M./Mme."*

One shows a learner the destination; the other describes it to an
administrator. This is the cheapest item on the whole list: the concrete
sentences already exist inside the lesson files, so it is a copy change on the
SIO text, not new authoring.

### 3. The self-check before practice — LOST

**Then**, between the concept and the exercise sat a small unscored gate.
Modules 01–09 carry a `✅ Self-check`; in 08 and 09 it is five hover-to-reveal
questions with a two-branch verdict — *"If you can answer all three: head to
📝 L'exercice… If not: re-read the sections above, or revisit 💡 Le concept."*
A private "have I got this?" moment with no consequence attached.

**Now** there is nothing between reading and being scored. The first thing that
tests you is also the first thing that records you. Fluoduo has a great deal of
machinery for making a wrong answer survivable — the help ladder, the requeue,
the reviser — but no low-stakes rehearsal *before* the record starts.

### 4. Choosing your own difficulty — LOST

**Then**, three ways in, all manual and all on-screen: a persistent header pill
reading *★ Facile — tap to change*, wired to `cycleDifficulty()`; a
`🎯 Ready to practise?` block at the end of *Les formes* with three buttons that
jump straight into the exercise at that level; and the same three as jump
targets in the help overlay. Changeable at any time, mid-exercise. The audit is
clear that this was never adaptive — `progressLevel()` and `regressLevel()`
exist in every module but `applyDiffUI()` hides their buttons everywhere except
08 and 09, and even there the learner presses them. The site never moved a
learner's level for them.

**Now**, a fixed twelve-card ramp — four recognise, four fill the frame, three
build, one translate (`RAMP` in `src/app/lessons/pager/buildCards.tsx`).
EtuDice's d12 picks your entry point: face N starts you at card N, so a 1 walks
the whole ramp and a 12 is the lone translate card.

This one is genuinely arguable. A forced ramp beats letting a learner hide on
★ Facile forever, and modules 17 and 18 dropped the tiers themselves. But a
dice roll is not agency, and the original's control was always on screen rather
than a one-time gate at the entrance.

### 5. Choosing what to practise — LOST, but scope it correctly

**Then**, dropdowns above the exercise let the learner aim it: subject × verb ×
polarity in 03 and 07, subject × topic in 01, `[Qui ?]` × `[Verbe ?]` ×
`[Quoi ?]` in 08 and 09, noun-phrase × owner in 13, subject × verb in 14 and
15. Weak on *tu*? Set it to *tu* and drill it.

The second analysis said these sat above "every exercise". They did not.
**Eight of the eighteen modules had prompt selectors** — 01, 03, 07, 08, 09,
13, 14, 15. Ten did not: 02, 04, 05, 06, 10, 11, 12 and 16 draw from a fixed
question pool whose only randomiser is `✏️ Nouvelle question` (02, 06 and 11 do
have dropdowns, but they are *answer* widgets, not aim), and 17 and 18 have a
different architecture entirely. Note that my brief listed seven modules
without selectors and omitted 11; the correct count of modules with no prompt
selector among 01–16 is eight.

The point survives the correction. Where the aim existed, it was real control
over what you practised, and **now there is no equivalent anywhere** — questions
are served, never aimed. It is arguably the bigger agency loss of the two,
because unlike difficulty it has no replacement mechanism at all.

And note what it means for the dice. **The original 🎲🎲 randomised the
*question*.** `randomQ()` in module 03 literally does
`curSubj=pick(SUBJECTS); curVerb=pick(VERBS); curPol=pick(POLARITIES)` and
writes the results into the three dropdowns; the in-app help says so
per-module, in ten different wordings ("Generates a random subject + verb +
polarity combination", "Generates a random country for you to article" *(sic)*).
FluOlinGo kept the glyph and quietly changed its meaning to "randomise where
you enter the ramp". Same symbol, different job, and **nobody decided the
swap** — it fell out of the selectors going away.

### 6. The first-person French controls — LOST

Every control in the old exercise engine made the learner the grammatical
subject of the sentence, in the target language: *✅ Je vérifie · 🔊 J'écoute ·
✏️ Je refais · 🏁 Je termine · 🎲🎲 Je génère · ↺ Je recommence*, and in 08 and 09
*⬇ Je régresse · 🚀 Je progresse*. That is incidental input at zero cost — a
learner who pressed the check button forty times read the first-person present
of *vérifier* forty times.

They went with commit `12bd816`, "english-first chrome: the interface defaults
to English; the French stays where it teaches" (353 strings across 69 files).
The reasoning in that commit message is sound and I would not reverse it: up to
three hundred freshmen who cannot yet read French have to navigate the app, and
the commit was careful about the boundary — curriculum content untouched by
construction, activity and brand names kept, `★ Facile` kept, the KIND legend
kept as cognates. But the first-person verbs were classed as chrome and swept
with the rest, and a grep of `src/` today returns none of them. What was lost
was not navigation clarity; it was forty free repetitions per session.

Worth recording alongside this, because it is the thing that made the old
site's language policy defensible rather than accidental: **the old site was
bilingual on a consistent three-way split.** Task instructions appeared twice,
French first then English, in the same block — *"Conjuguez le verbe selon le
sujet et la polarité indiqués."* / *"Conjugate the verb for the given subject
and polarity."* UI chrome and feedback were French-only (`✔ Correct !`,
`✘ Incorrect !`, `Résumé`, `Votre réponse`). Help and meta text were
English-only. The learner read French for *doing the task* and English for
*understanding the system*. That is consistent enough across eighteen
hand-written files to be a choice rather than a drift, and it is a sharper rule
than "the interface defaults to English".

### 7. Findability — LOST

The old index was a grid of eighteen titled cards. Each carried a number, an
emoji, a French title, an English subtitle, a full description paragraph and a
row of topic tags — module 17's reads *"Les prépositions de lieu / Prepositions
of place — sur, sous, devant, derrière… / Learn to describe where things are:
sur, sous, devant, derrière, entre, à côté de, dans, en face de… — essential
prepositions for describing locations"* with tags *prépositions · sur / sous*.
Above them sat a search box over `data-tags` and filter chips (All / Unité 1 /
Unité 2 / Conjugation / Révision / Vocabulary / Exercises). You could find
things.

The current Index does carry each row's SIO number and topic, so this is not
quite the "numbered rings with no words" it has been described as. What has no
key is the *marks*: a cell is a filled disc in an accuracy-tier colour with a
number, a hollow ring when you have not tried it, or an em dash when there is
nothing to try, and the only explanation of that vocabulary is a `title` and an
`aria-label` on each cell. The same is true of the map, where a stop's colour
carries its kind and the road's dash pattern carries whether you have reached
it. Patch 24 recorded the omission deliberately, under the litmus test: "no
legend for disc / ring / dash (title + aria-label only)."

The litmus test is the right rule and this is where it bites. On 22 Aug Dan
said, of his own Index, *"I really don't understand how to read it."* When the
author of the course cannot read the progress display, the marks are not
self-evident and the text that would explain them is not redundant. **This is
still unassigned** and it is the one user-facing failure currently on the
board.

---

## What survived, but weaker

**Le bonus — the EN→FR production task — DILUTED.** Then it had its own tab,
its own score and streak, its own ⭐ badge, and it was explicitly optional and
explicitly a stretch — the audit calls it "always the same genre… positioned as
the final test", consistent across all sixteen teaching modules. It has *not*
disappeared: **30 of the 31 native lesson files still carry a `bonus` bank**,
and `bonus` is a required field on the `NativeLesson` type. (The one file
without it, `prepositions-core.tsx`, is not a lesson — it is the shared engine
that `prepositions.tsx` and `prepositions-lieux.tsx` both import, per Dan's
2026-07-06 note that SIO-032 and SIO-033 differ only in destination set.) What
the bonus lost is its *status*: it now surfaces as card 12 of 12 inside a
required ramp. One card, no badge, no separate space, and no longer optional.
Diluted, not lost.

**The module as one place — DILUTED.** Six tabs, one page, one file meant you
could bounce back to the conjugation table mid-exercise and return. Now a stop
is a chain of five activities across separate routes. It is more coherent as a
path and it is genuinely worse as a desk: you cannot glance at the table while
typing an answer.

**Vocabulary as the send-off — DILUTED.** `📚 Le lexique` closed every module,
with a click-to-reveal cell mechanic, column hide/show, a four-way sort cycle,
and study tips written for the mechanic ("Hide **French** and try to recall the
French word from the English"; "Hide **Gender** to test yourself on article
rules") — a self-quiz built out of a table. 4Mémoire now sits at position 3 of
5, mid-chain, and the chain ends on iComplete.

---

## What genuinely got better

**Guess before you're taught (NEW).** SpecuLearn and the pre-tests put a guess
before the teaching. The original had no pre-test anywhere; it opened with the
explanation.

**Spaced repetition (NEW).** DéjàRevu brings back what you got wrong, timed.
The audit is categorical about the old site here: no interval, no due date, no
item history, no memory model of any kind exists in any of the eighteen files.
Nothing was ever re-served.

**Bring it to class (NEW).** A learner's misses become a list they carry into
the room. Nothing in the original connected practice to the classroom — the
`visits` documents written to Firestore gave the teacher attendance data and
were never read back to the learner.

**Speaking and listening (NEW).** WorDrill grades a real microphone; ÉcouTexte
generates listening. The original had TTS on sixteen of eighteen modules but it
was output-only: no microphone, no recording, no dictation, no listening
comprehension. For a course whose Unit 1 is *se présenter*, the learner never
spoke.

**Real progress tracking (NEW).** Per-activity, per-outcome accuracy, synced,
against an original whose index progress bars counted clicks —
`updateProgress()` read a `localStorage.visited` array populated by a click
handler on each card, so opening a module and closing it immediately made you
1/7 complete, under the caption "Progress is tracked locally in your browser".
Within a session the original was not unmotivated: it had a live score
percentage, a streak with `bestStreak`, a 70-piece confetti burst on every
correct answer, and a genuinely good `🏁 Je termine` résumé modal with three
stat cards and a full per-item table. It was unremembered rather than
unmotivated. **Score did not survive a reload in fifteen of the eighteen
modules** — in 01–07, 10–16 and 18 the score, streak and history are plain JS
variables. Two modules persisted and one synced: 08 and 09 save to
`localStorage`, with a `confirm('Resume your previous session?')` on return —
but both write to the *same unnamespaced key*, `lessonProgress`, so module 08
and module 09 silently overwrite each other's saved session. Module 17 is the
only cross-session, cross-student persistence on the site, via a Firebase
Realtime Database leaderboard with `aggregateBest()`, medals and personal
bests. (My brief said fourteen of eighteen; the measured figure is fifteen,
because module 18's only `localStorage` use is the dark-mode flag. Fourteen is
the right number for a different statistic — the fourteen modules 01–07 and
10–16 whose wrong-answer feedback is the flat one-liner and nothing else.)

**Diagnosis at the moment of error (BETTER) — and by a wider margin than
claimed.** The original's answer to a wrong answer was, in fourteen of eighteen
modules, exactly one line: `✘ Incorrect ! <correct answer>`. Comparison was
case- and whitespace-insensitive but accent- and punctuation-sensitive, so
typing `etes` for `êtes` was simply "Incorrect" with no acknowledgement that it
was a near miss. No hint, no second attempt, no partial credit; the answer was
revealed and the item scored. The good exception is the 08/09 bonus tab, the
one place on the site with error-specific diagnosis — four targeted notes
(article error, spurious negation, missing negation, and a "check your verb
form or spacing" fallback), also announced into an ARIA live region.

Those four notes are what the second analysis compared Fluoduo against, and it
undersold the comparison. `src/lib/help/feedback.ts` declares an `ErrorKind`
enum of **twelve** members. Nine of them are diagnostic categories — `spelling`,
`accent`, `agreement`, `conjugation`, `article`, `word_order`, `vocabulary`,
`register`, `elision` — and the remaining three are structural or fallback:
`missing`, `extra`, `other`. Each kind carries a one-line English *why* behind
the WHY button. The classifier is real logic, not a lookup: `classify(got,
want)` checks both words against an article set, then compares deaccented
forms, then strips agreement tails and verb tails to see whether the two words
share a stem, and finally falls back on edit distance to separate a spelling
slip from a different word altogether. Register is detected by tu/vous
mismatch against the model answer; elision fires only when the model answer
actually elides, so *« je es »* is scored as a verb slip rather than an elision
one.

The part that matters pedagogically is the verdict scale. **An accent-only
answer is a `partial`, not a miss** — `gradeAnswer` returns "good", the grader
finds the first word that differs only by accent, and the learner gets
verdict `partial` with a single `accent` error reading "Same word — the accent
is missing or wrong" and the hint "Check the accents." A `partial` is also
returned when most of the model answer is present, or most of what the learner
wrote is right, or the difference is one of the recognised A1 slips. The
grader is deliberately conservative and documented as such: when unsure it says
`partial` and points at the model answer rather than inventing a rule. There is
an eval-case suite at `src/lib/help/evalCases.json` — **22 cases**, each
carrying both the pedagogically-correct answer the LLM path must return and the
exact output the offline rule grader must produce, and
`verify/verify28-trackd.py` executes every one of them in node. So the rule
path is not just written, it is pinned.

The old site's excellent explanation all sat *before* practice and none of it
reached the learner at the moment of error. That gap is closed, and the thing
that closed it is stronger than the thing it replaced.

**No hardcoded roster in the client (FIXED — and this is the largest single
improvement nobody asked for).** Every page of the old site, index included,
shipped the Firebase config and an identity gate in plain client-side source.
On first load a learner met an overlay — "Bienvenue! / Please identify yourself
to continue" — asking for a full name and the last four characters of a
matriculation number, validated against a `VALID_MATRICS` array **inlined in
the source of every single page**. I counted the entries myself: **186**,
identical in all eighteen module files and the index. (The audit says 193; the
measured figure is 186. Either way the shape of the problem is the same.) The
gate is simultaneously trivially bypassable — any listed suffix with any name
gets you in — and a publication of the class list to anyone who views source.
The Firestore `visits` writes were unauthenticated client writes. Fluoduo has
none of this: real Google sign-in, `firestore.rules` with an allowlist, no
roster in the bundle.

**Navigation between modules (NEW).** The old site had none. Within a module
the sequencing was clear and well signposted — `🗺 Le parcours` laid out a
numbered pathway with jump buttons, and the richer modules labelled their tabs
"Step 3 of 5: Practice". Between modules there was nothing at all: no
next-module link, no prerequisite check, no "you should do 03 before 07". You
finished a module and your only exit was the back link to the index. **Ordering
lived entirely in the numbered filenames and the index grid.** Fluoduo has a
fifty-stop authored spine, a map, `nextStep.ts` resolving the next undone step
of a stop's chain, and one worded « Next › ». That is a straightforward gain
and it is easy to undervalue precisely because the old site's within-module
signposting was so good that the gap between modules is invisible until you
look for it.

**Scale (NEW).** Two taught units and eighteen modules became five units and
fifty stops on one authored spine. Measured in this repo at `8e0b6d0`:

| | count |
|---|---|
| SIOs (objectives on the spine) | 50 |
| Curated decks | 44 |
| Deck items across those decks | 883 |
| Native lesson files | 31 (32 registered entries — `revisions.tsx` exports three) |
| …of which carry a bonus bank | 30 of 31 |
| SIOs with an authored lesson | 26 — so **24 have none** |
| Pre-test files | 35 |
| Activities in the registry | 20 (plus the six family entries) |

The one figure in that table worth acting on is the last-but-one. My brief said
roughly nineteen objectives have no authored lesson; the measured number is
**twenty-four**. `LESSONS_BY_SIO` maps 26 of the 50 SIOs, so just under half
the spine has no authored Memo behind it and falls back to the generic deck
lesson. The scale gain is real, and it is wider than it is deep.

**Nothing is locked (KEPT).** Both versions let a learner go anywhere.

---

## The engineering counterweight, and why it explains the flattening

The above reads as a trade of teaching for architecture, and it is — but the
architecture was not a preference. It was forced, and understanding why it was
forced also explains why it flattened Dan's per-module tailoring.

Every module page on the old site was a standalone, self-contained HTML file of
85 to 295 KB with all CSS, JavaScript and content inline. No shared bundle, no
build step, no data layer. The audit puts the duplicated CSS+JS at roughly
90 KB per page, shipped eighteen times. Modules 08 and 09 are about 292 KB of
HTML each.

Consequently the files are near-copies of each other. The audit measures 07
against 03 at 99.5% byte-identical, 08 against 09 at 99.96%, and 14 against 15
at 99.9%. I re-measured independently with a character-level sequence matcher
and got 99.38%, 99.93% and 99.71% — a slightly different metric, the same
conclusion. Module 07, labelled "révision", is module 03 with a different `<h1>`,
two changed help strings and a dead `checkReview()` function that nothing
calls. Modules 08 and 09 differ in their page title and one array — 08's
`VERBS_ALL` is `["adorer","aimer","aimer bien","ne pas aimer","détester"]`,
09's is `["faire","ne pas faire"]` — while *both* files carry the full
aimer-and-faire content.

**And the copies carry the bugs.** The audit found `if(difficulty===1)return;`
sitting early in `checkMain()`, before any grading, which means that on the
★★ Intermédiaire tier pressing `✅ Je vérifie` — or hitting Enter, via the
global Enter handler — silently does nothing at all. Only clicking an option
button scores. The audit reports it in four files; I grepped all eighteen and
found it in **five**: 02, 03, 07, 14 and 15. Module 02 has the same early
return inside the same function and the audit missed it. The bug is present
wherever that code path was pasted and absent everywhere else. A fix to the
exercise engine had to be applied by hand eighteen times, which is visibly why
it never was.

The same mechanism produced a real content defect. **Module 15, "Modaux:
vouloir, pouvoir", serves module 14's *Les formes* page.** Both files carry the
identical instruction *"Study the tables for -er verbs, faire, aller, vouloir,
and pouvoir"*, and the page opens on 📖 *Regular -er verbs (aimer, parler,
habiter)* with the aimer/parler/habiter paradigm table. A learner who arrives
at the modal-verbs lesson to study *vouloir* and *pouvoir* is shown *aimer,
parler, habiter* first. Module 15's practice pool is also only twelve items
(6 subjects × 2 verbs), and its ★★ MCQ distractors are drawn from the shared
seven-verb `CONJ` table, so it drills discrimination against verbs the module
does not teach.

**Here is the argument that both analyses left implicit.** Consolidating
eighteen hand-copied files into one engine was necessary — not tidiness,
necessity, since the alternative was a codebase where every fix is eighteen
edits and every bug has five hiding places. But consolidation is a
generalisation, and generalisation requires deciding which differences between
the files are meaningful. **From the code's point of view, Dan's deliberate
per-module tailoring and eighteen files' worth of copy-paste drift looked
exactly the same.** Both present as "this file differs from that one."

Module 10's ★★ is a genuine discrimination task (pick the `aimer + infinitif`
form, rejecting the noun and `faire` variants) and its ★★★ is a genuine
transformation task. Module 16's ★★ makes you write two turns of a dialogue as
one speaker, which forces coherence across turns. Module 03's ★★ draws its
distractor pool from all three verbs and both polarities, so it tests
discrimination between *n'es pas* and *ne sont pas* rather than recall. Those
are teacherly decisions. They sit in the same diff as five inconsistent dice
labels, help as a styled overlay in twelve modules and a raw `alert()` in four,
ARIA live regions in two modules only, `localStorage` resume in two modules
only, `⬇/🚀` visible in two modules only, and a `Unité 2 · Leçon 8 / 7`
counter in module 08. Nothing in the source distinguishes the first list from
the second.

So the flattening was not carelessness and it was not really a choice either.
It is what happens when you unify a codebase that never recorded the difference
between intention and accident. Which means the tailoring is recoverable —
per-module intent is exactly the kind of thing a data layer can carry
deliberately, now that there is a data layer — but it has to be re-authored as
intent rather than rescued as diff.

One last consequence worth naming: the old site's own best ideas each exist in
exactly one or two of eighteen files. Mastery gates and a printable per-question
results report: module 17 only. Reveal buttons and pipe-separated multi-answer
tolerance: module 18 only. Error-specific diagnosis, the spotlight tour, the
guided self-check, the `le → du` transformation animation with a `▶ replay`
button, the "If You're Stuck" panel: 08 and 09 only. Neither 17 nor 18 was ever
retrofitted to 01–16. The architecture made copying a page cheaper than
improving the engine, so good ideas stayed where they were born.

---

## The honest summary

The app got structurally stronger and pedagogically thinner.

Everything gained is architecture: sequencing, memory, tracking, new
modalities, scale, security, navigation between stops, and a much better answer
to a wrong answer. Almost everything lost is explanation and agency — the
reasoning behind the form, the concrete promise, the low-stakes self-check, the
first-person French on the buttons, the legibility of the index, and the two
dials that let a learner aim their own practice. The scaffolding around the
learning improved; the teaching inside it got quieter, and the learner got
fewer choices.

Of the seven regressions above, four are content and copy (the why beat, the
concrete promise, the self-check, the first-person controls), one is a design
task nobody has picked up (Index legibility), and two touch how the app is
built — difficulty and question-aim. Those two are also the two where the
current design might honestly be the better call.

Two things are worth carrying over verbatim, because the app does the substance
and never says the words. The first is **"There's no penalty for reviewing."**
It appears in the 08/09 "If You're Stuck" panel — *"Getting 3+ wrong in a row?
Drop a difficulty level with ⬇, open the 📋 cheat sheet, or revisit 📖 Les
formes. There's no penalty for reviewing."* — and it is a teacher talking. I
grepped `src/`: the phrase appears nowhere. The second is the licence on the
cheat sheet: **"Use it freely on ★ Facile, then try without it on ★★ and
★★★."** That is scaffolding with a published fading plan, stated to the learner
in advance. Fluoduo's help ladder does exactly this — rungs that withdraw
support as the learner climbs — and never says so out loud. A learner who does
not know the plan cannot cooperate with it.

---

## What to do

Marked by what each one costs: **copy** touches strings only, **content**
needs authoring, **architecture** changes how the app is built, **design** needs
a decision before anything can be built.

| # | Action | Kind |
|---|---|---|
| 1 | Concrete "by the end of this you will say…" opening on each stop, replacing the abstract can-do line. The sentences already exist in the lesson files. | copy |
| 2 | Put *"There's no penalty for reviewing"* somewhere a stuck learner sees it, and state the help ladder's fading plan out loud the way the cheat sheet's licence did. | copy |
| 3 | A why beat at the top of each Memo, before the tables — module 08's *Le concept* is the model to copy. | content |
| 4 | Fill the lesson gap: 24 of the 50 SIOs have no authored Memo. | content |
| 5 | A 2–3 question unscored self-check closing each Memo, before the drills. Small component, but it needs a rule about what happens to the result (nothing, ideally — the whole point is that it does not record). | content + small component |
| 6 | Give the bonus its optional-summit framing back instead of burying it as card 12 of 12. The banks are all still there. | architecture (the ramp) |
| 7 | Move vocabulary recall to the end of the chain, where *Le lexique* used to sit. | architecture (the chain order) |
| 8 | **The Index legibility failure.** Dan cannot read his own progress display (22 Aug, still unassigned). The marks — tier-coloured disc, hollow ring, dash, and the map's kind colours and dash patterns — carry meaning with no key. Under the litmus test, text that is needed to find the right answer is not redundant. | design, then build |
| 9 | **Difficulty: decide it deliberately this time.** Not "restore the tiers" — the tiers have now been abandoned twice, by module 17 and by module 18, before FluOlinGo existed, and the fixed ramp is the third abandonment rather than a departure from a settled position. The real question is whether a learner should be able to choose their own level at all, and if so whether the choice lives on screen permanently (as the *★ Facile — tap to change* pill did) or at the entrance (as the d12 does). | decision, then architecture |
| 10 | **Question-aim: the same decision, and the one with no current replacement.** Eight of eighteen old modules let a learner aim their practice; nothing in Fluoduo does. If aim comes back, the dice glyph needs its job settled at the same time — it means "randomise the question" on the old site and "randomise your ramp entry" here, and that swap was never a decision. | decision, then architecture |

---

*Sources: `docs/OLD_SITE_AUDIT.md` (the evidence base, read off the shipped
HTML of all eighteen modules); a second agent's learner-experience analysis of
the same day, whose structure and framing this document keeps and whose four
factual errors are corrected in place; and this repository at `8e0b6d0`, where
every Fluoduo figure quoted above was re-measured.*
