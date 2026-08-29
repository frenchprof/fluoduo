# Audit — `french.withdrchan.com` (the old site)

> **Provenance and status.** Produced 24 Aug 2026 by fetching and reading the
> served HTML/JS of all eighteen module pages plus the index of Dan's original
> course site, at Dan's request. This is the **evidence base for
> `docs/REGRESSIONS_VS_WITHDRCHAN.md`**, which merges it with a second agent's
> learner-experience analysis of the same day; read that document for the
> comparison and its recommendations, and this one for the underlying facts.
>
> Kept **verbatim** as produced. The working directory it was written in
> (`patch-shots/`) is gitignored, so the raw fetched HTML, the text/JS dumps
> and the screenshots it refers to are **not** in the repository — only this
> file was preserved.
>
> Three figures in the body were re-measured while writing the merged document
> and did not hold; all three are corrected there, not here, so this file stays
> as written. For the record: the `VALID_MATRICS` array has **186** entries,
> not 193; the `if(difficulty===1)return;` no-op in `checkMain()` is in **five**
> files (02, 03, 07, 14, 15), not four — module 02 has it too; and the
> ★/★★/★★★ control is in **16** of 18 modules (all of 01–16), not 15, which is
> an off-by-one repeated wherever this file writes "01–16 (15 files)".

Research notes, 2026-08-24. Everything below is read off the served HTML/JS unless
explicitly marked as inference. Raw files are saved alongside this one as
`old-<module>.html` (all 17 fetched modules plus `old-index.html`; `mod13.html` was
already present). Extracted text/JS dumps: `txt-03.txt`, `txt-08.txt`, `txt-17.txt`,
`txt-18.txt`, `js-03.txt`, `js-17.txt`, `js-18.txt`.

Note on fetching: the site is served by Cloudflare Pages with extensionless URLs.
`https://french.withdrchan.com/03-conjugaison-u1.html` returns **HTTP 307 with an empty
body**; the working URL is `https://french.withdrchan.com/03-conjugaison-u1`. The `.html`
hrefs in the index still resolve in a browser, but a naive scraper gets zero bytes.

I fetched and analysed **17 of the 18 modules** (all except 13, which was already saved)
plus the index — so the coverage is complete, not a sample.

---

## 0. Site shape

The index (`/`) advertises "**4** Units · **18** Modules · **3** Difficulty levels ·
**6** Tabs per module" and describes the six tabs: 0 Le parcours, 1 Le concept,
2 Les formes, 3 L'exercice, 4 Le bonus, 5 Le lexique.

Verified tab bars:

| Modules | Tabs |
|---|---|
| 01–16 (15 files) | Exactly the six advertised tabs, same emoji/number/label. 08 and 09 use 📄 rather than 💡 for "Le concept"; otherwise identical. |
| 17 | **No tab bar at all.** Completely different architecture (see §1.3). |
| 18 | **Twelve tabs**: `🗺0 Vue d'ensemble`, then ten topic drills (`✈️1 Prépositions`, `❓2 Questions`, `🌤3 Météo`, `💬4 Conseils`, `🍽5 Alimentation`, `🏪6 Lieux`, `🔮7 Futur proche`, `👆8 Démonstratifs`, `🔄9 Pronom Y`, `⚙️10 Conjugaison`), plus `📚 Le lexique`. |

So the "six sections everywhere" claim in the index is true for 15 of 18 modules and
false for 17 and 18 — the two newest ones, which are also the two that experiment
hardest.

Every module page is a standalone, self-contained HTML file (85–295 KB) with all CSS,
JS and content inline. There is no shared bundle, no build step, no data layer. The only
links out of a module are back to `index.html`; **no module links to the next module.**

### Gate on entry (verified, and probably the single most consequential fact)

Every page — index included — ships a Firebase Firestore SDK from CDN and an
**identity gate**. On first load in a session an overlay appears: "Bienvenue! / Please
identify yourself to continue." with *Full Name* and *Last 4 characters of Matric No.*
The matric is validated against a **hardcoded array of 193 matric suffixes inlined in the
page source** (`VALID_MATRICS = ["271L","092H",...]`); a non-matching value gets
"Matric number not recognised. Please check and try again." On success the name+matric are
written to `sessionStorage` and a row is pushed to the Firestore `visits` collection
(`studentName`, `matric4`, `page`, `pageTitle`, server timestamp).

This is a **class site for an enrolled cohort**, not a public product. The Firebase API
key and the entire student roster are in plain client-side source on every page.

Also present site-wide: Plausible analytics (custom events `Difficulty Changed`,
`Help Opened`, `Feedback Opened`, `Feedback Submitted`), a bilingual (EN/FR) feedback
modal posting to Formspree, and a dark-mode toggle.

---

## 1. Exercise mechanics

### 1.1 The standard engine (modules 01–16)

Every teaching module runs the same hand-written engine, copied file to file. The
learner's loop is:

1. Set one or more **`<select>` dropdowns** that define *what* to practise (the
   "prompt selectors").
2. Optionally press the **dice** to have those selectors filled at random.
3. Answer, in a form determined by the current difficulty.
4. Press **`✅ Je vérifie`** (or Enter — there is a global Enter handler, commented
   `/* B-10: Global Enter-key for Easy/Medium modes */`).
5. Read one line of feedback, then `✏️ Je refais` / `✏️ Nouvelle question` for another,
   or `🏁 Je termine` for a summary.

**The dice is a random *item* generator, not a difficulty control.** This generalises
cleanly from module 13 to every module that has one. `randomQ()` in module 03 literally
does `curSubj=pick(SUBJECTS); curVerb=pick(VERBS); curPol=pick(POLARITIES)` and writes
those values into the three dropdowns. The in-app help says so explicitly, and the
wording is per-module:

- 01 "Generates a random subject + topic combination for you."
- 02 "Generates a random affirmative sentence to negate."
- 03 "Generates a random subject + verb + polarity combination."
- 06 "Generates a random country for you to article." *(sic)*
- 07 "Generates a random revision question from Unit 1."
- 11 "Generates a random subject + place combination."
- 14 "Generates a random subject + verb combination."
- 15 "Generates a random subject + modal verb combination."
- 16 "Generates a random rendez-vous dialogue scenario."
- 08/09/13 "…une phrase" — "Creates a random sentence prompt for you to answer."

**There is always exactly one dice control per exercise panel** (plus a second,
independent one on the ⭐ Le bonus tab). The "🎲🎲" is two dice *glyphs* in one button
label, not two dice. Labels are inconsistent across modules: `🎲🎲 Aléatoire` (03, 07,
14, 15), `🎲🎲 Je génère` (01, 02, 06, 11, 16), `🎲🎲 Je génère une phrase` (08, 09, 13),
`🎲🎲 Nouvelle question` / `🎲🎲 Nouvelle phrase` (bonus tabs), `🎲🎲 Générer` (18).
Modules 04, 05, 10 and 12 have **no selectors and no exercise dice at all** — they draw
from a fixed question list and the only randomiser is "✏️ Nouvelle question".

**Number of selectors varies by module** (from the rendered `<select id=...>`):

| Module | Prompt selectors | What they choose |
|---|---|---|
| 01 | 2 | subject, topic (name/age/nationality/family) |
| 02 | 0 (drill uses `ne_drop`/`pas_drop` as *answer* widgets) | — |
| 03 / 07 | 3 | subject, verb, polarity (affirmative/negative) |
| 04, 05, 10, 12 | 0 | fixed question pool only |
| 06 | 0 (answer dropdowns only) | — |
| 08 / 09 | 3 | `[Qui ?]` subject, `[Verbe ?]` verb, `[Quoi ?]` activity (28 options) |
| 11 | 0 prompt / 2 answer | — |
| 13 | 2 | `[Quoi]` noun phrase (8), `[Qui]` owner (8) |
| 14 / 15 | 2 | subject, verb |
| 16 | 0 | dialogue scenario picked by dice only |

Answer *modalities* across the whole set: single dropdown, two dropdowns, multiple-choice
buttons in a vertical list, free-text input, **word-bank click-to-build** (module 10
Facile — "Click the words in the correct order to build the sentence"), **cloze fill-in
inside a running dialogue** (16 and 18), **checkbox multi-select** (17 only), and
**a 12-verb × 13-pronoun conjugation grid of text inputs** (18, Ex. 10). There is no
drag-and-drop and no audio-input anywhere.

### 1.2 Module 18 — the revision monster

18 abandons the difficulty engine entirely. It is ten independent drills, each with its
own `check…` / `reveal…` / `reset…` trio. Two mechanic families:

- **Static worksheets**: `checkFill` / `checkFillMulti` / `checkSelects` walk every
  `.fill-inp` or `<select>` in a container, compare against `data-ans` (pipe-separated
  alternatives allowed), and colour each field green/red, then print
  `Score : <n> / <total>`. `revealFill` just writes the answer into every box.
  There are **109 `<input>` and 41 `<select>` elements** on the page.
- **Infinite generators**: four `drill*` engines (`drillPrep`, `drillAli`, `drillFP`,
  `drillY`) that compose a sentence from data tables and can be driven either from
  dropdowns or from `🎲🎲 Générer`. These keep `{correct, total, streak}` counters.

Data pools in 18: 20 prep nouns, 47 food items, 15 futur-proche actions, 14 `y`-places,
13 pronouns, a 63-row lexique.

### 1.3 Module 17 — the "gates" experiment

17 is the outlier and the most pedagogically interesting file. It is a three-part
linear pathway on `de` vs `à`, with a **mastery gate between parts**:

- Part 1 (core concept: static/dynamic × origin/location) → **Gate 1: Comprehension Check**
- Part 2 (countries, cities, islands) → **Gate 2: Practice Check**
- Part 3 (place nouns, contractions) → **Gate 3: Final Check**

Each gate draws **4 questions from a 10-question pool** (`pickQuestions(gate1Pool, 4)`)
in three formats: `mc` (single choice), `mcm` (select-all-that-apply with checkboxes),
`fill` (type the preposition). "Try New Questions" (`retryGate`) re-draws a fresh 4 from
the pool. `checkGateCompletion` marks pass/fail at **≥ 75 %** (`correct >= Math.ceil(qCount*0.75)`).

Honest caveat: the "gate" is a **soft** gate. The Continue button starts `disabled` and
is enabled once all four are answered — *regardless of score*. The pass/fail class is
cosmetic. So it enforces *attempting*, not *mastery*.

17 is also the only module with a **real leaderboard**: a Firebase Realtime Database
`leaderboardRef` with a live `on('value')` listener, `aggregateBest()` keeping each
student's best attempt, 🥇🥈🥉 medals, a floating `🏆 High Scores` widget showing top 3 +
"Your Best", a `Save Score` button (total out of 12, "New personal best for X: n%!"),
and a **`Print Results`** button that builds a per-question printable report headed
"Aide-Mémoire: de & à — Results Report" with the student's name and timestamp. That is a
teacher solving a real classroom problem: proof of completion.

---

## 2. The difficulty model

**★/★★/★★★ exists in 15 of 18 modules (01–16). It is absent from 17 and 18.**

It is always **learner-chosen, never automatic**. Three ways in, all manual:

1. A persistent pill in the page header — `★ Facile` with the subtitle **"tap to change"**,
   wired to `cycleDifficulty()`, which cycles 0→1→2→0 and re-renders. Colour-coded green
   / amber / red (`#1e7a1e`, `#b45309`, `#a30000`).
2. A **`🎯 Ready to practise?`** block at the bottom of *Les formes* with three buttons,
   each jumping straight to L'exercice at that level. Module 08 words it
   "🎯 Ready to practise? Choose your level … Each button takes you straight to
   L'exercice at that difficulty. You can always change level once you're there."
3. The help overlay's "🎯 Difficulty Levels — click to jump to exercise".

**There is no adaptivity anywhere.** `progressLevel()` and `regressLevel()` exist in every
module, but in 01–07 and 10–16 `applyDiffUI()` explicitly hides their buttons:
`if(rg)rg.style.display='none'; if(pr)pr.style.display='none';`. Only **08 and 09** surface
them as `⬇ Je régresse` / `🚀 Je progresse`, and even there the learner presses them. The
site never changes level on the learner's behalf, never tracks per-item difficulty, and
never re-serves an item you got wrong.

**What distinguishes the tiers is almost always scaffolding removal** — but the *shape* of
the scaffolding is genuinely tailored per module, which is the teacherly part:

| Module | ★ Facile | ★★ Intermédiaire | ★★★ Difficile |
|---|---|---|---|
| 01 | "Choose the correct verb form from a dropdown to complete the sentence." | "Choose the verb AND complete additional parts of the phrase." | "Type the full French sentence from memory — no hints!" |
| 02 | "Choose ne or n' from the dropdown to form the negative." | "Choose the full negative sentence from multiple options." | "Type the complete negative sentence from memory." |
| 03 / 07 | "Choose the correct conjugated form from a dropdown." *(options = the 6 forms of that verb only)* | "Choose from multiple-choice options" *(1 correct + 4 distractors drawn from **all** verbs and polarities)* | "Type the conjugated form from memory — no hints!" |
| 04 | "choose the question word (1 dropdown)" | "choose question word + verb form (2 dropdowns)" | "type the full question from memory" |
| 05 | "Choose question word from dropdown" | 2 dropdowns | type full question |
| 06 | "Choose the correct definite article from a dropdown." | "Choose the article AND identify the gender of the country." | "Type the article + country name from memory — no hints!" |
| 08 / 09 | "Subject and article+noun are shown. Pick the correct verb from a dropdown." | "Subject and bare noun shown. Pick both the verb and the correct article." | "Type the complete sentence from memory. No help at all!" |
| 10 | "Click the words in the correct order to build the sentence." *(word bank)* | "Choose the option that uses aimer + infinitif (not the noun or faire form)." | "Given the noun version, write the infinitif form and the faire form." |
| 11 | "Choose the correct complete sentence from multiple options." | "Choose the correct aller form AND the contracted article + place." | "Write the full sentence from memory — no hints!" |
| 12 | "choose the moment of day (1 dropdown)" | "choose heure + période (2 dropdowns)" | "write the full sentence in French" |
| 13 | possessive only, C'est/Ce sont pre-filled | both dropdowns | type the whole sentence |
| 14 / 15 | dropdown of that verb's forms | MCQ across all verbs | type from memory |
| 16 | "2 dialogue lines are given — choose the correct French line for the other 2 (MCQ)." | "Full dialogue in English — write 2 lines in French from memory." | "One line in English — translate it into French completely." |

Two tiers are **not** pure scaffolding removal and deserve credit. Module 10's ★★ is a
*discrimination* task (pick the `aimer + infinitif` form, rejecting the noun and `faire`
variants) and its ★★★ is a *transformation* task (convert a noun sentence to the
infinitive and the `faire` structure). Module 16's ★★ is harder than a simple removal
because you write **two turns of a dialogue** as one speaker, which forces coherence
across turns. Module 03's ★★ is subtly clever: the distractor pool is drawn from *all
three verbs and both polarities*, so it tests discrimination between `n'es pas` and
`ne sont pas`, not just recall.

**One genuine bug, present in 03, 07, 14, 15:** at ★★ the MCQ buttons call
`checkMedium()`, and `checkMain()` contains `if(difficulty===1) return;` — so on the
★★ tier, pressing `✅ Je vérifie` (or Enter) silently does nothing. Only clicking an
option button scores.

---

## 3. Feedback and help

### On a wrong answer

For the standard engine the answer is: **one line, no ladder, no retry.** The exact
string, identical across 01–07 and 10–16:

```
✘ Incorrect ! <correct answer>
```

and on success `✔ Correct ! <correct answer>`. Comparison is
`user.toLowerCase().replace(/\s+/g," ").trim() === correct` — case- and
whitespace-insensitive, but **accent- and punctuation-sensitive** in most modules
(`ne sont pas` vs `ne sont pas.` fails in 03's main drill; the bonus checker strips a
single trailing period, `replace(/\.$/,"")`). Typing `etes` for `êtes` is marked wrong
with no acknowledgement that it was a near miss.

There is **no hint button, no "try again", no partial credit, no second attempt.** The
answer is revealed immediately and the item is scored. You cannot re-attempt the same
item; you can only generate a new one.

### The exceptions — and they're the good bits

- **08 / 09 bonus tab** is the only place with **error-specific diagnosis**. On a wrong
  translation it emits `✘ Not quite right. → <correct>` plus one of four targeted notes:
  - `💡 Article error — check <em>le</em>.` (detects a wrong article by scanning both
    strings against a 10-article list)
  - `💡 Check for negation — this sentence should be affirmative.`
  - `💡 Missing negation — add <strong>ne...pas</strong>.`
  - `💡 Check your verb form or spacing.` (fallback)

  These also fire `announceFeedback('Article error. Try again.')` into an ARIA live
  region — 08/09 are the only modules with screen-reader announcements.
- **06** appends the gender to the feedback: `✔ Correct ! le Japon (masculin)` — a
  one-word explanation of *why*.
- **12** on a wrong answer at ★★ shows the moment of day alongside the sentence.
- **04, 05, 10, 16** build a composed `fb` string that names the constituent you got wrong
  (e.g. echoing the expected verb form) rather than only the whole answer.
- **10** appends an `explain` / `hintHtml` fragment to feedback on the ★★ and bonus tiers.
- **18** uses `✓ Correct !` / `✗ Réponse : <strong>answer</strong>` per drill, plus a
  **`Reveal`** button on every worksheet that fills in all answers — an explicit "show me"
  affordance the standard engine lacks.
- **17** colours each gate question and shows `You got n/4 correct`, with a `pass`/`fail`
  class at the 75 % line.

### Help affordances

- A `?` **help overlay** (`showHelp()`): 01, 02, 03, 06, 07, 08, 09, 11, 13, 14, 15, 16 get
  a styled modal, "❓ Comment utiliser ce module", listing the difficulty tiers as
  clickable jump targets and then a row per control button. Modules **04, 05, 10, 12 fall
  back to a raw `alert()`** with `\n`-separated text — visibly less finished.
- A floating bottom bar on the exercise tabs with `↺ Je recommence` (reset score) and
  `📋 Aide-mémoire` (slide-out cheat sheet panel). Present in all of 01–16.
- **08 / 09 only**: a nine-step guided **spotlight tour** (`SPOT_STEPS`) launched from a
  welcome overlay — "Bienvenue ! … Let me give you a quick walkthrough. / 👉 Show Me Around
  / Skip & Explore".
- **08 / 09 only**: an explicit "**If You're Stuck**" panel — *"Getting 3+ wrong in a row?
  Drop a difficulty level with ⬇, open the 📋 cheat sheet, or revisit 📖 Les formes.
  **There's no penalty for reviewing.**"* That last clause is a teacher talking, and it is
  the single best sentence on the site.

---

## 4. Reference and support material

| Feature | Which modules |
|---|---|
| Full reference tables in *Les formes* | 01–16 (all), plus 17 and 18 in their own layouts |
| Negative-form table alongside affirmative | 03, 07, 08, 09, 13 |
| `📋 Aide-mémoire` floating cheat panel | 01–16 (16 files); 17 has two cheat panels ("Aide-Mémoire — Statique & Dynamique" and a full preposition list); 18 has none |
| `✅ Self-check` before the exercise | 01–08 and 09 (verified string "Self-check"); richest in 08/09 — five hover-to-reveal Q&A, "*Before moving to the 📝 Exercise tab, check that you can answer these questions from memory: 3 on articles, 2 on conjugation.*" |
| `⚠️ Common Mistakes` / side-by-side "don't say / say instead / why" | 08, 09 (a 5-row table); 13 (established); 17 has a "Key Insight" contrast panel; 18 has per-drill warning boxes ("⚠️ Prépositions avec *de* — contractions obligatoires") |
| `📚 Le lexique` with click-to-reveal cells, column hide/show, and a 4-way sort cycle (Default / French A–Z / English A–Z / Random) | 01–16 |
| TTS (`🔊 J'écoute`, Web Speech `fr-FR`, rate 0.9) | 01–16 and 18 (`speechSynthesis` present in all); **not** in 17 |
| Click a French word in the lexique to hear it | 08, 09 |
| Interactive "Explorer" widgets (build a sentence from three dropdowns and watch the article morph, with a `▶ replay` animation of `le → du`) | 08, 09; 17 has simpler "Interactive Explorer" button rows |

Lexique sizes (rows in the vocab tab): 11 (11-aller-à) up to **41 (08/09)**; typical
14–18; 18's lexique is a 63-item filterable table with its own column toggles.

TTS quality-of-life in 08/09 goes further than elsewhere: a keep-alive timer, cancel on
`visibilitychange`, and a **visible warning banner if no French voice is installed** —
a real-device problem that most of the other modules ignore.

---

## 5. Progress and motivation

This is where the brief's prior assumption needs correcting: **there is more
gamification than "none", but all of it is ephemeral.**

**What exists, per exercise panel (01–16):**

- **Score** as a live percentage (`Math.round(score/total*100)+"%"`) with a filling
  progress bar.
- **Streak** — consecutive correct answers, reset to 0 on any error, with `bestStreak`
  tracked. 08/09/13 add a `.streakGlow` CSS class that goes `big` at streak ≥ 3.
- **Confetti** — a 70-piece canvas burst on every correct answer, with a header toggle
  `🎉 Confetti` / `🎉 Off`. On by default.
- **`🏁 Je termine` → a "Résumé" modal**: three stat cards (Score %, `n/total` Correct,
  best Streak) and a full per-item table — `# / Question / Votre réponse / Correct / ✔✘` —
  with correct rows green and wrong rows red. This is a proper end-of-session review and
  it is genuinely good. Refusing to open on zero items: `alert("Complétez au moins une
  question !")`.
- 18 shows `Score : n / total` badges per drill and correct/total/streak counters on the
  four generators.

**What does NOT exist:**

- **No XP, no levels, no badges, no coins, no hearts/lives, no daily goal, no streak
  *calendar*, no notifications, no unlocks.** The "streak" is within-session only.
- **No persistence of results.** In 01–07 and 10–16, score/streak/history are plain JS
  variables. **Reload the page and everything is gone.** Only **08 and 09** save to
  `localStorage` (`saveProgress()` / `loadProgress()` with a
  `confirm('Resume your previous session?')`) — and they both use the *same unnamespaced
  key* `lessonProgress`, so module 08 and module 09 overwrite each other's saved session.
- **The index "progress" is not progress.** `updateProgress()` counts entries in a
  `localStorage.visited` array populated by a click handler on each card. It measures
  *"did you click this link"*, nothing more. The "0 / 7", "0 / 9", "0 / 2" bars and
  "Progress is tracked locally in your browser" describe a **visited-links counter**. Open
  a module and immediately close it and you are 1/7 complete.
- The `visits` documents written to Firestore give the *teacher* attendance data. They are
  never read back to the learner.
- **Module 17 is the only place with cross-session, cross-student persistence** — the
  Firebase leaderboard with medals and personal bests. Nothing else on the site has it,
  and module 17 doesn't use `localStorage` at all.

---

## 6. Scope and sequencing

**Units.** The hero says 4 units; the actual grouping is Unité 1 (7 modules, 01–07),
Unité 2 (9 modules, 08–16), and "Unités 3 & 4 — Revision" (2 modules, 17–18). So Units 3
and 4 were never built out as teaching units — only revised.

**Content volume per module** (counted from the JS data structures):

| Module | Main exercise pool | Bonus pool |
|---|---|---|
| 01 | 5 male + 5 female names × 6 ages × 10 nationalities × 5 family sizes × 4 topics (combinatorial) | 14 EN→FR |
| 02 | 15 sentences | 10 |
| 03 / 07 | 6 subjects × 3 verbs × 2 polarities = **36** distinct prompts | 10 |
| 04 | 10 questions | 10 |
| 05 | 11 questions | 7 |
| 06 | 10 countries | 10 |
| 08 / 09 | 8 subjects × 5 (or 2) verbs × 28 activities (combinatorial, ~1000+) | ~generated |
| 10 | 12 activities × 7 subjects | 15 |
| 11 | 19 places × 7 subjects = 133 | 10 |
| 12 | 13 times | — |
| 13 | 8 noun phrases × 8 owners = **64** | separate owner/noun selectors |
| 14 | 6 subjects × 5 verbs = 30 | 10 |
| 15 | 6 subjects × 2 verbs = **12** | 10 |
| 16 | 5 four-turn dialogues = 20 turns | 12 |
| 17 | 3 gates × 10-question pools = 30 items (4 shown per gate) | — |
| 18 | 10 drills; 109 inputs + 41 selects of static worksheet, plus 4 infinite generators | — |

So the *combinatorial* modules (01, 08/09, 11, 13) never run out; the *fixed-list* modules
(04, 05, 06, 12, 16) exhaust in 10–15 items and then repeat.

**How does a learner know what to do next?** Weakly.

- Inside a module, `🗺 Le parcours` lays out a numbered pathway ("1. 💡 Le concept — Why
  these three verbs are irregular. **Go →**") with jump buttons, and the tabs carry
  step-of-5 labels in the richer modules ("**L'exercice — Step 3 of 5: Practice**",
  "**Le bonus — Step 4 of 5: The Final Test**"). Some modules end a tab with
  "Ready? Go to 📖 Les formes for the full tables." That within-module sequencing is clear
  and well signposted.
- **Between modules there is nothing.** No next-module link, no prerequisite check, no
  "you should do 03 before 07". You finish a module and your only exit is the back link to
  the index. Ordering lives entirely in the numbered filenames and the index grid.
- The index does help you *find* things: a search box over `data-tags`, and filter chips
  (All / Unité 1 / Unité 2 / Conjugation / Révision / Vocabulary / Exercises). Module 18
  is heavily flagged — a red ribbon "**TEST PREPARATION — Revise here!**" and
  "Complete this module to prepare for your test" — which is the teacher steering the
  cohort at a specific moment.

---

## 7. Notable — things worth carrying over

1. **The explanation style in module 08/09's *Le concept*.** It opens with "**One
   question** — Why does *J'aime le yoga* become *Je fais du yoga*?" and answers it in one
   sentence: "*Because aimer talks about a **category**, and faire talks about
   **participating** in it.*" Then two numbered mental images (🗂️ "The idea of yoga."
   vs 📅 "Actual sessions of yoga."), then negation as a consequence of the same idea
   ("You are saying there are **zero sessions**"), then "**The Whole System in 20 Seconds**",
   then "**If you remember only one thing**: Liking = the activity as a whole. Doing =
   taking part in it. Everything else follows from that." That is a taught explanation
   with a spine, not a rule list.
2. **"The #1 rule" as a self-question**, not a rule: "*Ask yourself — am I expressing a
   feeling about the activity (category → le/la), or am I doing the activity (episodes →
   du/de la)? The verb tells you which mental image to use.*"
3. **"There's no penalty for reviewing."** Explicit permission to go backwards.
4. **The self-check gate is a checklist you can actually run** — five specific questions
   with hover-reveal answers and a two-branch verdict: "*If you can answer all three: Head
   to 📝 L'exercice… If not: Re-read the sections above, or revisit 💡 Le concept.*"
5. **Named 80 % criterion.** 08/09: "*When scoring 80%+, press 🚀 to move up*" and
   "*Scoring 80%+ here means you've mastered this unit. If not, return to 📝 L'exercice.*"
   A stated mastery bar, even though nothing enforces it.
6. **The cheat sheet is explicitly licensed, then withdrawn**: "*Use it freely on ★ Facile,
   then try without it on ★★ and ★★★.*" Scaffolding with a stated fading schedule.
7. **The Explorer widget with the `le → du` transformation animation** and a `▶ replay`
   button. It shows the article *changing*, which is exactly the thing a static table
   can't show.
8. **Bilingual framing, deliberately split.** Task instructions appear twice, French first
   then English, in the same block: "*Conjuguez le verbe selon le sujet et la polarité
   indiqués.*" / "*Conjugate the verb for the given subject and polarity.*";
   "*Étape 1 : Choisissez un sujet, un verbe et une activité — ou cliquez 🎲🎲.*" /
   "*Step 1: Choose a subject, a verb, and an activity — or click 🎲🎲.*" But **UI chrome and
   feedback are French-only** (`✔ Correct !`, `✘ Incorrect !`, `✅ Je vérifie`, `🔊 J'écoute`,
   `✏️ Je refais`, `🏁 Je termine`, `↺ Je recommence`, `Résumé`, `Votre réponse`), and
   **help/meta text is English-only**. The learner reads French for *doing the task* and
   English for *understanding the system*. That split is consistent enough to be a choice.
9. **The first-person verb labels for buttons** — *Je vérifie, J'écoute, Je refais, Je
   termine, Je recommence, Je génère, Je progresse, Je régresse*. The learner is the
   grammatical subject of every control, in the target language. It is incidental input.
10. **Emoji as a semantic scale, not decoration**: `❤️❤️❤️ adorer / ❤️❤️ aimer / ❤️ aimer bien
    / 💔 ne pas aimer / 💀 détester` in the 08 verb dropdown encodes an intensity cline the
    learner reads at a glance.
11. **Module 17's printable results report** — a per-question report with the student's
    name and timestamp, designed to be handed in.
12. **`⭐ Le bonus` is always the same genre** — pure EN→FR production with no scaffolding,
    positioned as "the final test". A consistent terminal task per module.
13. **The lexique's column-hide-then-cell-reveal mechanic** with study tips written for it:
    "*Hide **French** and try to recall the French word from the English*", "*Hide
    **Gender** to test yourself on article rules*". A self-quiz built out of a table.

---

## 8. Weaknesses — the honest other half

**Pedagogical**

- **No spaced repetition, no review scheduling, no memory model of any kind.** Nothing is
  ever re-served. Verified: no interval, due-date, or item-history structure exists in any
  of the 18 files.
- **No adaptivity.** Difficulty is 100 % manual, and the auto-progress/regress functions
  are written but hidden in 13 of 15 modules.
- **No cross-module review.** 07 and 16 are labelled "révision" but 07 is a byte-for-byte
  copy of 03 (see below) and 16's revision is a Unit-2 dialogue drill. 18 is the only file
  that genuinely mixes topics, and it mixes topics from units that were never taught here.
- **No speaking or listening practice.** TTS is output-only; there is no microphone, no
  recording, no dictation, no listening comprehension. For a course whose Unit 1 is
  "se présenter", the learner never speaks.
- **No writing beyond one sentence.** The ceiling is a single sentence typed from memory.
  Module 16's ★★ (two dialogue turns) is the longest production task on the site.
- **Single-attempt scoring with instant reveal.** No second try, no hint ladder, no
  progressive disclosure. Getting it wrong costs you the item and teaches you only the
  answer.
- **Exact string matching.** No accent tolerance, no typo tolerance, no acceptance of
  legitimate alternatives (outside module 18's pipe-separated `data-ans`), no partial
  credit. `etes` for `êtes` is simply "Incorrect".
- **The "why" is decoupled from the moment of error.** All the good explanation lives in
  *Le concept* / *Les formes*, read *before* practice. When you actually get something
  wrong, you get the answer string and, in 14 of 18 modules, nothing else.

**Content and engineering**

- **Massive duplication.** 07 vs 03 is **99.5 % byte-identical** — same `CONJ` data, same
  `B_QUESTIONS`, differing only in `<h1>` text, two help strings, and a dead
  `checkReview()` function that nothing calls. 08 vs 09 is **99.96 % identical** — the only
  real differences are the page title and `VERBS_ALL` (`["adorer","aimer","aimer bien",
  "ne pas aimer","détester"]` vs `["faire","ne pas faire"]`); both files carry the full
  aimer+faire content. 14 vs 15 is **99.9 % identical** — module 15 "Modaux: vouloir,
  pouvoir" serves the *same* Les formes page as 14, headed "*Study the tables for -er
  verbs, faire, aller, vouloir, and pouvoir*", with regular -er verbs first. A learner
  arriving at the modal-verbs lesson is shown `aimer / parler / habiter` before
  `vouloir / pouvoir`.
- Module 15's practice pool is only **12 items** (6 subjects × 2 verbs) and the ★★ MCQ
  distractors are drawn from the shared 7-verb `CONJ`, so it drills discrimination against
  verbs the module doesn't teach.
- **Inconsistency between modules is pervasive**: five different dice labels; help as a
  styled overlay in 12 modules and a raw `alert()` in 4; ARIA live regions in 2 modules
  only; localStorage resume in 2 modules only; `⬇/🚀` buttons visible in 2 modules only;
  the ★★ `Je vérifie` no-op bug in 4 modules; `Unité 2 · Leçon 8 / 7` (a "8 of 7" counter)
  in 08.
- **Everything is inline, per-file.** ~90 KB of duplicated CSS+JS per page, 18 times. A
  fix to the exercise engine has to be applied 18 times by hand, which is visibly why it
  wasn't (the ★★ bug survives in exactly the four files that share that code path).
- Nothing loads incrementally; 08/09 are ~292 KB of HTML each.

**Security and privacy**

- The **complete matric roster (193 entries) and the Firebase config are in plain view** in
  every page's source. The gate is trivially bypassable (any listed matric, any name) and
  simultaneously leaks the class list.
- Firestore `visits` writes are unauthenticated client writes.

**Structural**

- **The index progress bars are misleading** — they count clicks, not completion, and the
  copy ("Progress is tracked locally in your browser") implies more than is true.
- **Module 13 is not in any unit's progress array?** — it is (`MODULES.u2` includes it),
  but note the u2 denominator is 9 while Unit 2 shows 9 cards, so that one is fine. The
  real gap is that a module can never be marked *complete*, only *visited*.
- **No mobile-specific exercise design.** Free-text French with accents on a phone
  keyboard, judged by exact match, is the hardest input case on the site and gets no
  accent-key palette.
- **Two abandoned architectures.** 17 (gates + leaderboard, no tabs, no TTS, no difficulty)
  and 18 (ten drills, no tabs-of-six, no difficulty, no confetti) each invent a new model
  and neither was retrofitted to 01–16. The site's own best ideas — mastery gates,
  printable evidence, reveal buttons, multi-answer tolerance — exist in exactly one module
  each.

---

## 9. One-line summary for the comparison

The old site is a **teacher's site**: strong, sequenced explanation; scaffolding that is
explicitly named and explicitly withdrawn; a self-check before practice; a per-item
session review; and small, judged touches (intensity emoji, first-person French button
verbs, "there's no penalty for reviewing"). It is **not a learning system**: nothing
persists, nothing repeats, nothing adapts, nothing is ever reviewed across modules, and
a wrong answer buys you the correct string and nothing else. Its best individual features
— error-specific diagnosis (08/09), mastery gates (17), reveal + multi-answer tolerance
(18), a leaderboard and a printable report (17) — each exist in exactly one or two of
eighteen files, because the architecture made copying a page cheaper than improving the
engine.
