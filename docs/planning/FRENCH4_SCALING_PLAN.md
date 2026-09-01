# Scaling FluOlinGo to French 4 (L'atelier A2, Units 5–8)

_Written 21 Aug 2026, against Dan's 40-SIO annex + the Unité 8 manuel pages.
Nothing here is built yet. The decisions in §3 gate everything else._

**Sources read (all now in hand):** Dan's 40-SIO annex → extracted to
`docs/handoff/ATELIER_A2_SIOs_v1.csv` (§5) · `L'atelier A2 — Manuel`, Units
5–8 complete (56 pages) · `Cahier d'activités`, Units 5–8 (46 pages) ·
`Guide pédagogique`, unit inventories for Units 5–8 (pp. 160/188/216/244).

---

## 1. The short version

FluOlinGo is **already a two-layer app**, and the split is cleaner than it
looks from outside:

- an **engine layer** — 20 activities, 6 games, the SRS/economy/evidence
  stack, the help ladder, the map, the teacher dashboard — that knows
  nothing about French, only about *outcomes, decks and items*;
- a **content layer** — 50 SIOs, 45 decks, 772 items, 27 lessons, 35
  pretests, the Finale bank, ConjugaZone's paradigms — that is 100% A1.

So French 4 is **not a rebuild**. It is three jobs, in this order:

1. **~2 days of plumbing** to stop ~10 files assuming "one course, units
   0–4, fifty SIOs" (§4). Ships invisibly; French 1 stays byte-identical.
2. **The content layer, authored** (§6). The long pole — ~3 weeks.
3. **Three engines raised from A1 to A2 shape** (§7). This is the part that
   is genuinely new work, and the manuel pages are why (§2.3).

**The annex is better news than I expected.** It already numbers the A2
objectives **SIO-051…SIO-090** in **units 5–8**, continuing the A1 sequence —
so there is *no id collision and no unit collision with French 1 at all*. That
removes the single largest risk (migrating live learner data) and makes the
Phase 1 plumbing materially smaller than it would otherwise have been. It also
already assigns **primary + secondary learning focus** to all 40 using exactly
the four kinds `src/content/sioKinds.ts` already implements (● vocab · ■
grammar · 💬 phrases · ◆ production). That file's data is, in effect, authored.

---

## 2. What we have, what it costs, and what the coursebook changes

### 2.1 Free — course-agnostic today, zero changes needed

| Layer | Files | Why it just works |
|---|---|---|
| Activity registry | `src/content/activities.ts` | 20 activities × 6 families. No French in it. |
| Game engines | `src/games/{letris,lexicalator,matching,numbus,numbourse,compose}` | Every game reads a `Collection`. Give it A2 decks and it plays A2. |
| Deck contract | `src/lib/collections/schema.ts` | `Collection` + `Item` + `GameConfig`. Already the intake format. |
| Shell & chrome | `CahierShell`, `DrillShell`, `GameFrame`, `GameBar`, `BottomBar`, `RailGroups`, `MenuSplash` | Driven by the registry + the SIO spine. |
| Learner state | `progress.ts`, `evidence.ts`, `economy.ts`, `activityLedger.ts`, `reviser.ts` | Keyed by *item id* and *SIO id*. Safe — and §3.2 keeps those namespaces disjoint. |
| Help ladder (Track D) | `src/lib/help/*`, `/api/feedback` | FRESH → TRY → HINT_1 → HINT_2. Rule hints are per-deck data. |
| Map (2D + 3D) | `HomeMap.tsx`, `HomeMap3D.tsx`, `src/lib/map3d/*` | Stops come from `SIOS`; bands from `REGIONS`. Both data. |
| Reporting | `indexMatrix.ts`, `outcomeRows.ts`, `HeatStrip`, `/moi`, `/teacher` | Iterate `SIOS`; need a *filter*, not new logic. |
| Curriculum index | `src/lib/curriculum.ts` | deck ↔ SIO ↔ item ↔ journey. Already the right abstraction. |

Roughly **85% of the codebase is reusable untouched.** That is the argument
for extending rather than forking.

### 2.2 Bound to French 1 — the ten pinch points

Grep-verified, 21 Aug 2026:

| # | Where | The assumption | After the annex |
|---|---|---|---|
| 1 | `src/content/sios/sios.json` + `sios/index.ts` | one flat array; `UNIT_META` 0–4; `UNIT_SITUATIONS` 1–4; `groupSiosForUnit`'s `unit === 0` branch | extend to 5–8 — **no renumbering** |
| 2 | `src/content/sioKinds.ts` | `GRAMMAR`/`PHRASES`/`PRODUCTION` are `Set<number>` keyed on the SIO integer | **de-fanged**: 51–90 don't collide with 1–50. Refactor is now optional hygiene, not a blocker |
| 3 | `src/content/chapters.ts` | `CHAPTERS` 0–4; `CLASS_FLAG_SIO` a single global | extend to 5–8; flag must go **per course** (two cohorts, two weeks) |
| 4 | `[0,1,2,3,4]` literals | `RailGroups.tsx:38`, `siteTabs.ts:48`, `activities/page.tsx:43`, `practice/wordrill/page.tsx:24`, `decks/new/page.tsx:190`, `unit/[unit]/page.tsx:9` | mechanical — `unitNumbers()` already exists and is simply not used |
| 5 | `src/content/collections/index.ts` | 45 hand-written imports, one flat `CURATED` | split `fr1/` + `fr4/`, root concatenates |
| 6 | `src/content/lessons.ts` | `LESSONS` (27, units 1–4) + `LESSONS_BY_SIO` | content |
| 7 | `src/content/finale.ts` | `FINALE_BANK`, ids `finale:SIO-034:1` | content; needs its own A2 bank |
| 8 | `src/content/conjugaison.ts` | **présent only** — A1 by construction | **engine gap** (§7.1) — A2 needs 5 more tenses |
| 9 | `HomeMap.REGIONS` + `--region-*` | 5 regions keyed by unit; `globals.css:517-532` | 4 more regions + 8 more tokens |
| 10 | Counts in copy & gates | `StatsHelp.tsx:30` "out of 50"; `HomeMap.tsx:519` "50 — whole course"; `check-short-labels.mjs`; `gen-sios.mjs` | mechanical |

### 2.3 What the manuel pages change — read this before costing anything

Unité 8's 14 pages are the important find, because **A2 is not A1 with harder
words.** Three structural differences, each with a build consequence:

**(a) The unit shape is different.** A1 units are *3 Situations + 1 Atelier*
(and `groupSiosForUnit` hardcodes exactly that, merging the Atelier into
Situation 3). Unité 8 is:

> **3 Situations** (Rendre service p.116 · Améliorer un logement p.118 ·
> Exprimer un souhait p.120) · **Lab' Langue & Culture** (p.123) ·
> **2 Ateliers** (Exprimer son mécontentement p.124 · Recommander un
> logement p.125) · **Mémo + Mission** (Rénover ce bâtiment p.127)

**Verified identical across all four units** (guide pédagogique
pp. 160/188/216/244 + the four unit-opener contents pages): every A2 unit is
3 Situations · Lab' Langue & Culture · 2 Ateliers d'expression · Mission,
plus Stratégies, S'exercer and a two-page Mémo. So `UNIT_SITUATIONS` can no
longer carry a hardcoded "three groups, atelier merged into the third" — it
becomes per-unit group data, and **all 40 SIOs are now assigned to their
section** in the intake CSV (§5).

The mapping is not perfectly uniform, and the CSV records it honestly: U6 and
U7 spend a SIO on both the Projet culturel *and* the Mission (69/70, 79/80),
U5's 060 is the Projet culturel with the Mission folded in, and U8's 090 is
the Mission with the Lab' (*Jouer un huis clos*) folded in. A handful of SIOs
are placed by best thematic fit rather than by an explicit box — exactly the
situation `sios/index.ts` already documents for A1, and flagged the same way.

**(b) Production load is 2.5× A1's.** Counting the annex's primary focus:

| | A1 (50 SIOs) | A2 (40 SIOs) |
|---|---|---|
| ● vocab | 22 | 13 |
| ■ grammar | 18 | 12 |
| 💬 phrases | 6 | 3 |
| ◆ **production** | **6 (12%)** | **12 (30%)** |

Two Ateliers + a Mission per unit instead of one Atelier. The assessment
centre of gravity moves off the MCQ/pretest machinery and onto rubric-graded
`/api/feedback` + ComposeIt. That path exists and is evaluated (22 eval cases,
≈$0.003/check) — but see the cost risk in §8.4.

**(c) A2 Situations hang off documents, not inventories.** A1 decks were
closed lists (colours, numbers, countries) — perfect for LexicaLater,
VocabulaRain and flashcards. Unité 8 Situation 1 is: an authentic Facebook
page, three audio tracks (pistes 74–76), six comprehension questions, a
grammar-in-context task, **and a phonetics section ([t] vs [d])**.

Consequences:
- **ÉcouTexte stops being a Skills-family side dish and becomes primary.**
  Its content source (`src/content/textgen/`, currently `unit3.ts` +
  `unit4.ts` only) needs four units' worth of material.
- **There is no engine for sound discrimination.** WorDrill grades *your*
  production via the mic; nothing asks "did you hear [t] or [d]?". See §7.2 —
  the NumBus shell ("type the number you hear") is the natural donor.
- **We cannot ship the coursebook's audio.** Pistes 74–76 are Didier's. A2
  listening content must be *parallel texts we author*, TTS'd through the
  existing `/api/tts` + `generate-tts-bank.mjs` path — the same thing
  `textgen/` already does. Budget it as authoring, not as asset copying.

### 2.4 The Mémo and the cahier hand us the content layer

This is the biggest change to the costing, and it is good news.

**The manuel's two-page Mémo closing each unit is deck-shaped already.** For
Unité 5 it is, verbatim: six named Lexique lists (*Le voyage* · *Partir en
voyage* · *Des qualités* · *Des défauts* · *La forme physique* · *Se lancer un
défi*, ~8 items each), two Communication chunk lists (*Encourager quelqu'un*,
7 chunks; *Insister pour inviter*, 5), three grammar boxes with rule + examples,
two phonetics boxes, and four ready-made production activities. That is
~48 vocab items + ~12 chunks + 3 lessons per unit, **transcribed rather than
invented**. A1's decks had to be reverse-engineered from the syllabus; A2's
are handed over. (**Amended by §2.5** — this holds for the Lexique lists, but
the Mémo is *not* the whole source for the chunk load.)

**The cahier supplies the assessment layer, in shapes the app already has.**
Each unit runs 12 pages on one pattern — 3 Situations × 2pp, *J'agis*,
*J'apprends* (stratégies), then:

| Cahier section | Maps onto | Notes |
|---|---|---|
| **Bilan linguistique** (2pp, GRAMMAIRE + LEXIQUE) | `finale.ts` bank + GramMarathon | Gap-fill, word-order and choose-the-verb items — the exact "one gap, one word" shape `finale.ts` already enforces |
| **Préparation au DELF** (2pp, CO/CE/PE/PO) | *nothing yet* | See §7.4 — a real opportunity and a real decision |
| Phonetics exercises | the missing engine (§7.2) | Literally *"Écoutez. Vous entendez [s], [z] ou les deux ?"* and *"dites si la prononciation est identique (=) ou différente"* — binary/ternary discrimination items, ready to import |
| Situation exercises | pretests, iComplete, GramMarathon | Standard drill shapes |

**But two strands in the book have no SIO at all**, and the annex does not
cover them:

- **Phonétique — 8 objectives across the four units** (U5 enchaînement
  consonantique · [ʃ]/[ʒ] · intonation; U6 [s]/[z] · [ə]/[e]/[a]; U7 la
  liaison · [i]/[e]/[ɛ]; U8 [t]/[d] · [p]/[b]/[f]/[v]). Drilled in every unit,
  drilled again in the cahier, and invisible to the 40-SIO spine.
- **Conjugaison — one paradigm per unit** (*se battre* · *s'asseoir* · the
  participe passé of *connaître/grandir/offrir* · *rendre*), on top of the
  tense load in §7.1.

Neither is a defect in the annex — A1 handles conjugation the same way, as a
cross-course Skills activity outside the spine. But phonetics has no home at
all today. See §7.2 and open question 4.

### 2.5 Correction: the Mémo is not the whole deck source

§2.4 said the content layer is "transcribed rather than invented". That is true
of the Lexique lists and **false of roughly half the chunk load** — Dan caught
it, 21 Aug: *"do the lessons include phrases that are picked up from the
lesson, e.g. in Situation 3 of Unit 5, students learn 'Mieux vaut…'"*

He is right, and the arithmetic shows the size of it:

| | Count |
|---|---|
| A2 SIOs carrying a `phrases` load (primary or secondary, per the annex) | **16 of 40** |
| Chunk boxes in the Mémo pages (U5 2 · U6 3 · U7 3 · U8 2) | **10** |
| SIOs whose chunk load is **Situation-page-only** | **7** — 053, 056, 064, 074, 082, 084, 087 |
| …of those, with no box of any kind to fall back on | **4** — 053, 056, 064, 087 |

The missing half lives on the **Situation pages**, in three forms the Mémo
never repeats:

1. **Harvested frames.** Each unit's Situation 3 closes with a *Résumons /
   On coopère en classe* step that lifts sentence frames straight out of the
   document and asks the learner to reuse them. U5 p.79, verbatim: *« Il
   explique les obligations : **Nous devons…** · Il en décrit les possibilités :
   **C'est possible…** · Il nous donne des conseils : **Mieux vaut…** · Il nous
   raconte son enfance : **J'alternais…** »* — then *« Écrivons nos propres
   idées… Mieux vaut travailler en groupes. »* U8 p.121 does the same with
   *« Si tu veux atteindre le niveau A2, tu devras… · Si nous étions à ta
   place, nous… »*. **None of these four is in the U5 Mémo.**
2. **« Aide à la lecture » glosses.** The book's own explanations of the
   expressions it knows are hard: *on bosse = on travaille · se détendre = se
   reposer · consacrer du temps à · alterner*. One box per Situation-3 page.
3. **Task-embedded frames.** U8 Situation 3: *« À quelle administration
   s'adresser ? Je souhaite renouveler un visa / ouvrir un compte / rédiger un
   testament. »*

**SIO-056 is the proof case** — Dan's own example. The annex gives it vocab +
phrases. The Mémo gives it two Lexique sets (*La forme physique*, *Se lancer un
défi*) and **no chunk box at all**. Its entire chunk load — *Mieux vaut… ·
Nous devons… · C'est possible… · J'alternais…*, plus the five *Aide à la
lecture* glosses — exists only on p.79.

*(Correction to an earlier draft of this section, which used SIO-087 and
claimed it would ship an empty deck. That was wrong: the U8 Mémo does carry a
*Faire des démarches administratives* Lexique box (p.126). What 087 lacks is a
**chunk** box — its « Je souhaite renouveler un visa… » frames are
Situation-page-only. The section's claim holds; that particular example did
not.)*

#### The rule I suggest, so this stays bounded

Harvesting from running text is judgement, not transcription, and without a
rule it balloons. The book supplies an objective test:

> **Lift a frame onto a card only where the book itself asks the learner to
> reuse it** — the *Résumons* step, the *Appliquez* step, and the *Exemple:*
> lines all mark reusable frames explicitly. Anything that appears only inside
> a reading text and is never re-elicited stays reading, not a card.

That keeps *Mieux vaut + inf* and *Je souhaite + inf* (both re-elicited) and
drops incidental text vocabulary. **Revised phrases layer: ~50 Mémo chunks +
~40–60 harvested frames — roughly double what §2.4 costed**, and the
authoring is per-Situation reading rather than per-Mémo copying. Deck source
for every SIO is therefore *Mémo box + its Situation pages*, not the Mémo
alone.

#### And a guard-rail question this exposes

*« J'alternais… »* is **imparfait, taught incidentally in Unit 5** — while the
imparfait SIO is 072, in Unit 7. *« tu devras »* is futur simple, in Unit 8,
with no SIO anywhere. A1 held a strict line on this (`ateliers.ts`: *"Grammar
guard-rails: present + futur proche only, no passé composé"*). A2's own texts
run ahead of its own grammar sequence.

Two honest options: **hold the guard-rail** and paraphrase the frame into
taught grammar (loses the book's wording), or **accept the frames as
unanalysed chunks** — learn *« Mieux vaut travailler en groupes »* whole, the
way the book plainly intends, and let SIO-072 explain the machinery later. See
open question 8.

### 2.6 The enrichment pass — done, and what it turned up

Dan, 21 Aug: *"let's relook at the 40 SIOs to include such things. Without
deleting what we have already listed out (unless it is totally NOT what is in
the textbook nor workbook nor guidebook)."*

Done, across all 56 manuel pages, the 46 cahier pages and the four guide unit
inventories. **Nothing was deleted** — all 40 SIOs keep their id, topic,
can-do, focus, section and goal shape exactly as they were. Five columns were
*added* to `ATELIER_A2_SIOs_v1.csv`:

| New column | Filled for |
|---|---|
| `Lexique sets (books)` — the book's own named word-sets | 17 SIOs |
| `Chunks & frames (books)` — Mémo chunk boxes **+ harvested frames + glosses** | **39 of 40** |
| `Box on page` — the grammar or word-relations box that sits with it | 17 |
| `Phonetics on page` | 9 |
| `Manuel pp.` — the evidence, so any placement can be checked | all 40 |

Every entry is quoted from the books. Where language came off a Situation page
rather than the Mémo it is tagged `HARVESTED` or `GLOSSES` with its page, so
the two sources stay distinguishable when decks get authored.

#### A third strand nobody had named: word relations

The box sweep across all four units found **12 grammar boxes — exactly the
guide's Grammaire column — and four more that are in no inventory at all**:

| Unit | Box | Content |
|---|---|---|
| 5 | **Le préfixe** (p.75) | contraires in dés- / in- / im- / mal- / ir- — *désorganisé, impatient, malhonnête, irresponsable, impoli, imprudent* |
| 6 | **Les synonymes** (p.89) | *un animal = une bête*; find synonyms of *utiliser · les renseignements · une forêt* |
| 7 | **Les antonymes** (p.103) | *long ≠ court, vieille ≠ jeune*; antonyms of *futur · moderne · déçu* |
| 8 | **Les abréviations** (p.117) | *Tél. · h · CV · av. · Ex. · min · s* |

One per unit, absent from the 40 SIOs *and* from the guide's Grammaire column
— the same shape as the phonetics gap in §2.4. **It is also the best
LexicaLater material in the whole course**: derivational morphology is exactly
what that game does, and A1 never had any.

#### The three cross-cutting strands, counted

| Strand | Items | Has a SIO? | Where it should live |
|---|---|---|---|
| Phonétique | **9** (8 in the guide + *Intonation : les questions*, U5 Mémo) | no | Skills activity (§7.2), items now attached per-SIO in the CSV |
| Word relations | **4** | no | Skills activity — LexicaLater |
| Conjugaison | **4** (se battre · s'asseoir · participes passés offrir/connaître/grandir · rendre) | no | ConjugaZone, as A1 already does |

All 17 are now **attached to the SIO whose page they sit on**, so each is
reachable from the map, while the strand itself drills across units — the same
double life a ConjugaZone verb already has (it belongs to a lesson *and* the
trainer sweeps them all). That answers "include such things" without inventing
a single SIO.

#### One thing to watch

Grammar keeps arriving ahead of its own SIO — *« Ils se sont battus »* (passé
composé, U5) · *« J'alternais »* (imparfait, U5) · imperative advice frames
(U6) · *« tu devras »* (futur simple, U8, no SIO anywhere). This is the
guard-rail question in open question 7, and the enrichment pass makes it
sharper: it is not one stray frame, it is a pattern across all four units.

---

## 3. The decisions

### 3.1 One app or two? — **recommend: one app**

| Option | Verdict |
|---|---|
| **A. Fork the repo** | ✗ Every future fix (the camera rounds, the help ladder, the rail) gets built twice or drifts. The 20-activity registry exists precisely because four copies of one list drifted. |
| **B. One app, `course` as a dimension** | ✓ **Recommended.** ~2 days buys one engine forever. A learner who takes French 1 then French 4 keeps their streak, XP, badges and account. |
| **C. One course, 90 SIOs, units 0–8** | ✗ Tempting now that the numbering is continuous — but it gives one map with 90 stops, one leaderboard mixing an A1 and an A2 cohort, and `/moi` telling a French 1 learner they are 55% through a course they never enrolled in. |

Because the annex made unit and SIO ranges disjoint, **`course` can be
*derived*, not stored**: `unit ≤ 4 → fr1`, `unit ≥ 5 → fr4`. One function,
no new field on 90 SIOs, no data migration. That is why Phase 1 is 2 days.

### 3.2 The id scheme — **settled by the annex, and it's the right call**

> *"The numbering continues from the 50 A1 objectives so that the A2 sequence
> begins at SIO 51."*

Keep it exactly as written: **`SIO-051`…`SIO-090`, units 5–8**, and the
book's own unit numbers double as ours, so `unitLabel` needs no remapping.

This matters more than it looks. SIO ids are already **learner data**
(`progress.doneSios`), **printed artefacts** (the A4 QR sheet), **deep links**
(`/sio/SIO-034`, `/?unit=3#SIO-034`) and **evidence rows** in Firestore. A
prefix scheme (`F4-SIO-001`) would have meant migrating every existing
account. This costs nothing.

**One gate to add:** deck item ids must be globally unique across both
courses. `curriculum.ts` already relies on this informally ("no item id is
claimed by two decks"); make it `npm run check:ids` and fail the build.

### 3.3 Where the learner picks a course — **recommend: profile + URL override**

- `?course=fr4` wins for that visit (printed QRs; Dan demoing both);
- otherwise the account's `course` field (default `fr1`);
- signed-out: `localStorage`, default `fr1`;
- the switch lives in `/profil` and as one line in the Menu — **not** in
  permanent chrome. Dan's litmus test: a learner in one course never needs to
  see the other one's name.

XP, level, streak, gems and badges stay **lifetime and cross-course** (they
are the show-up motivator, not a course score). Everything that *is* a course
score — map, `/moi` counters, Index matrix, leaderboard, teacher matrix —
filters by course.

---

## 4. Phase 1 — make the spine course-aware (~2 days, ships invisibly)

French 1 must be **byte-identical** after this phase. Every existing
`verify/*.py` staying green is the acceptance test.

**4.1 New `src/content/courses.ts`** — `Course = { id, code, name, cefr,
units, classFlagSio, finaleSize }`; `COURSES`, `DEFAULT_COURSE`,
`courseForUnit(u)`, `courseForSio(id)`, `unitsForCourse(id)`.

**4.2 `src/content/sios/index.ts`** — add `siosForCourse()`,
`unitNumbersForCourse()`. Extend `UNIT_META` and `UNIT_SITUATIONS` to 5–8.
`siblingSios` must clamp to its own course rather than walking from SIO-050
into SIO-051. `groupSiosForUnit`'s "3 Situations, Atelier merged into the
third" hardcode becomes per-unit group data (§2.3a).

**4.3 `sioKinds.ts`** — data is authored (annex, both columns). The
number-`Set` mechanism still works because 51–90 don't collide; converting to
an explicit `Record<sioId, kind>` is recommended hygiene while we're here (it
also kills the `SIO-045A`-parses-to-45 special case the file apologises for),
with a verify assertion that all 50 A1 kinds are unchanged.

**4.4 `chapters.ts`** — extend to 5–8. `CLASS_FLAG_SIO` moves onto `Course`;
two cohorts run on different weeks. (This also closes STATUS row 4.)

**4.5 The six `[0,1,2,3,4]` literals** → `unitsForCourse(current)`.
`unit/[unit]/generateStaticParams` returns 0–8 so both courses' deep links
pre-render.

**4.6 Collections** — split into `collections/fr1/` and `collections/fr4/`,
root concatenates. Explicit imports stay (the static export needs them).

**4.7 Course-scoped surfaces** — one `filter` each against
`siosForCourse(current)`: `HomeMap`, `HomeMap3D`, `HomePrintSheet`,
`/activities`, `RailGroups`, `siteTabs`, `/moi`, `/teacher`,
`LeaderboardList`, `/reviser`, GramMarathon Final. Leaderboard and teacher
roster additionally gain a `course` field on the row, filtered alongside the
existing `term` filter.

**4.8 Gates** — `check:short` over both courses; new `check:ids`; new
`verify/verify30-course.py`: French 1 renders identically · no A2 SIO on an A1
surface · `sioKind()` unchanged for all 50 A1 SIOs · `siblingSios` never
crosses a course boundary · every A2 SIO has a unique id and a `short` ≤ 14.

---

## 5. Phase 0 — intake status: **complete**

Everything the plan asked for has arrived. The annex is extracted to
**`docs/handoff/ATELIER_A2_SIOs_v1.csv`** — 40 rows in the shape
`scripts/gen-sios.mjs` already consumes:

| Column | Status |
|---|---|
| Unit · SIO # · Topic · Can-Do | ✔ from the annex |
| **Short (≤14)** | ✔ 40 drafted, all inside the `check:short` build gate |
| Primary / Secondary focus | ✔ from the annex — this is `sioKinds.ts`'s data |
| **Flashcard Set** (`5.01`–`8.10`) | ✔ assigned |
| **Book section** | ✔ all 40 placed — Situation 1/2/3 · Lab' Langue · Atelier 1/2 · Mission. **This is `UNIT_SITUATIONS`.** |
| **SIO Description** | ✔ seeded with the book's own Lexique/Grammaire box names (the Mémo pages) |
| CEFR Mode | ✗ still to assign per SIO |
| Linguistic competence (measurable) | ✗ the assessable criteria — the one genuinely authored column left |
| Collection id | ✗ assigned as each deck is authored |

**Two columns left, and only one of them is real work:** `CEFR Mode` is
mechanical (the book's skill labels), `Linguistic competence` is the
measurable criteria the drills score against — the same column that took the
most red-pen on A1.

**Still needed as decisions, not documents** (the flavour layer — Dan's):
- four chapter scenarios, taglines and cliffhangers (`chapters.ts`). The book
  titles are the seed and they are good ones: U5 *Ensemble, c'est mieux !* ·
  U6 *C'est trop beau !* · U7 *Comme disait mon grand-père…* · U8 *Si vous
  voulez bien…*
- four region names, icons, accent + band colours for the map. A1's are
  Welcome Village / Identity Heights / Wants & Wishes Valley / Downtown
  District / Marché.

---

## 6. Phases 2–3 — the content build-out

A1's volume was the only yardstick before the books arrived. Now the A2
figures come from the Mémo and cahier pages themselves (§2.4), which changes
the shape of the estimate — **fewer deck items than a naive scaling suggests,
more authored text**:

| Asset | French 1 (actual) | French 4 (from the books) |
|---|---|---|
| SIOs | 50 | 40 ✔ authored, sectioned |
| Lexique items | 772 across 45 decks | **~200** — 6 named lists/unit × ~8 items, transcribed from the Mémo |
| Communication chunks | folded into decks | **~50** — 2–3 lists/unit, verbatim |
| Grammar lessons | 27 | **12** — 3 boxes/unit, rule + examples given |
| Phonetics items | none | **~8 sets** — cahier discrimination exercises, ready to import (§7.2) |
| Pretests | 35 | ~28 |
| Finale / Bilan items | ~160 | **~130** — the cahier's Bilan linguistique is already this shape |
| **ÉcouTexte / listening** | 2 units' worth | **4 units, all newly authored** — the coursebook audio cannot ship (§2.3c) |

The headline: **the list-shaped content roughly halves** (the book curates a
tighter A2 core than A1's closed inventories), while the **authored-text
content roughly doubles**. Net effort lands close to A1's, redistributed from
transcription toward writing — and the writing is the part that needs Dan's
eye, not an agent's.

**Phase 2 — skeleton (~1 day/unit).** Land the 40 SIOs, chapters, regions,
group structure. Immediately: the map draws French 4, the Index lists 40 rows,
rail and Menu navigate it, `/moi` and `/teacher` report on it. Decks are
stubs. This is the demo-able milestone and it is cheap — the engine layer
needs nothing.

**Phase 3 — content (~2–4 days/unit).** Per SIO, in A1's build order: deck
JSON (items + `gameConfig`) → lesson TSX where the SIO is grammar-shaped →
pretest → help-ladder rule hints → Finale items. Parallelisable by unit; each
unit ships independently because nothing locks.

---

## 7. Phase 4 — the three engines that are A1-shaped

### 7.1 ConjugaZone has no tenses

`conjugaison.ts` models a verb as `forms: [6 strings]` — the présent, full
stop. The A2 SIOs demand **passé composé + imparfait** (072, 078),
**conditionnel** (085), **impératif with pronouns** (082), and the annex's
narrative work leans on all of them.

**Change:** `ConjVerb.forms` becomes `Record<Tense, [6 strings]>`, plus
`participle` and `aux: "avoir" | "être"`. `/conjugaison` gains a tense
selector beside the existing group picker. A1 authors only `present`, so its
screen is unchanged. **~1 day + the paradigm data.**

### 7.2 The activity mix must shift, and one activity is missing

- **NumBus / NumBourse** have no A2 job as number games — but **the NumBus
  shell is exactly the missing phonetics engine.** "Type the number you hear"
  → "tap the sound you hear": same audio-prompt/timed-response loop, new item
  type. This is no longer a guess from one page: the strand runs **8
  objectives across all four units** (§2.4), and the cahier already writes the
  items in a form the shell can eat — *"Écoutez. Vous entendez [s], [z] ou les
  deux ?"* is a three-way tap; *"dites si la prononciation est identique (=)
  ou différente"* is a two-way tap. Recommend repurposing rather than adding a
  21st activity, and keeping the number decks for French 1. **~0.5 day**, and
  it closes the only content strand the site currently cannot represent.
- **ÉcouTexte, ComposeIt, ChaTutor, WorDrill** carry much more weight (§2.3c).
- **VocabulaRain / LexicaLater** still earn their place — derivational
  morphology (`-ment` / `-amment` / `-emment`, SIO-066) is *more* suited to
  LexicaLater than A1's vocabulary was.
- **A `text` SIO kind?** `sioKinds` has `vocab | grammar | phrases |
  production`. The annex fits all 40 into those four cleanly, so **no new kind
  is needed** — dropping the idea I'd have proposed blind. The map legend
  stays as it is.

### 7.3 Grading moves from MCQ to rubric

30% production (§2.3b) means `/api/feedback` and ComposeIt become the primary
assessment path rather than a Track D extra. Already built and evaluated; the
open question is cost per cohort (§8.4), not capability.

---

### 7.4 The DELF preparation pages have no equivalent — opportunity or scope creep?

Every cahier unit closes with a two-page **Préparation au DELF** (compréhension
de l'oral · compréhension des écrits · production écrite · production orale,
scored out of 25). FluOlinGo has no timed, multi-skill mock-exam surface — the
closest thing is the GramMarathon Finale, which is single-skill gap-fill.

Four units of DELF A2 practice is a genuinely valuable thing to own, and most
of the pieces exist (ÉcouTexte for CO, the reading drills for CE, ComposeIt +
`/api/feedback` for PE, WorDrill/SpeakZone for PO). But it is a **new surface**,
not a scaling job — perhaps 3–4 days on top of everything above. Flagging it
rather than assuming it: see open question 7.

---

## 8. Risks

1. **Content before plumbing.** Much reduced by the annex's numbering, but
   `UNIT_SITUATIONS`, `chapters.ts` and the `[0..4]` literals will still throw
   or silently render nothing for units 5–8. **Phase 1 first.**
2. **French 1 regressing.** Mitigated by the byte-identical rule and
   `verify30-course.py`. CI already runs every `verify/*.py` on every push.
3. **`check:short`'s 14 characters.** All 40 proposed labels fit (§5) — but
   they are my drafts, and any red-pen has to stay inside 14 or widen the
   map's column. It is a build-failing gate.
4. **LLM cost.** 30% production × a second cohort, on a path that costs
   ≈$0.003/check. Worth a per-learner ceiling before launch, not after.
5. **Audio authoring.** The coursebook's pistes cannot ship (§2.3c). Every A2
   listening item is content we write and TTS. This is the most easily
   under-estimated line in §6.
6. **Firebase Spark quota.** Two cohorts roughly double reads.
7. **The 3D map is tuned to a 5-region, 50-stop road.** `FULL_AHEAD` /
   `MAX_AHEAD` / `SIZE_FALLOFF` came out of eleven verdict rounds. A 4-region,
   40-stop road needs a look, not a rebuild.
8. **`unit: 5` is already taken.** `HomeMap.tsx:178-183` pushes the
   GramMarathon Arena band as `unit: 5`, and line 305 branches on
   `b.unit < 5 ? …unit… : ARENA_PLACE`. With A2 on units 5–8 the map would
   render Unité 5 as the finale arena and Units 6–8 as arenas too. **Fix in
   Phase 1** — the arena is not a unit: give the band a `kind` flag, or
   `UNIT_APP` (99), which `curriculum.ts` already reserves for exactly this.
   Each course then gets its own Finale. Caught by reading, not by a test;
   `verify30-course.py` should assert it.
9. **The phonetics and conjugaison strands have no SIOs** (§2.4). If they are
   in scope for the site, they need a home that is not the SIO spine — the
   same shape ConjugaZone already has (a cross-course Skills activity).

---

## 9. Recommended order of work

| # | Step | Depends on | Est. |
|---|---|---|---|
| 0 | Dan settles §3.1 / §3.3; sends cahier, guide, and manuel Units 5–7 | — | Dan |
| 1 | Phase 1 plumbing + `verify30-course.py`; French 1 byte-identical | §3 decisions only | 2 d |
| 2 | **Naming layer** — regions, icons, colours, chapters, roadside props, and the 50-stop geometry constants (§11) | 0 | 1.5 d |
| 3 | Skeleton — 40 SIOs navigable end to end, empty decks | 1, 2 | 1 d |
| 4 | ConjugaZone tenses (§7.1) | 1 | 1 d |
| 5 | NumBus → minimal-pair discriminator (§7.2) | 1 | 0.5 d |
| 6 | Content, unit by unit — decks → lessons → pretests → hints → finale | 3 | 2–4 d × 4 |
| 7 | Cross-course surfaces: course switch, leaderboard/teacher scoping | 1 | 1 d |

**Steps 1–3 can start the moment §3.1 and §3.3 are answered — they need no
further coursebook content.** That is the fastest path to seeing French 4 on
the map.

---

## 10. Open questions for Dan

1. **One app or two?** (§3.1 — recommend one, with `course` *derived* from
   the unit number, which the annex's numbering makes free.)
2. **XP/streak/badges shared across courses, course scores separate** — right
   call? (§3.3)
3. **Does a French 4 learner ever see French 1?** Remedial back-links to an A1
   outcome are genuinely useful and nearly free once both are in one app — but
   they cut against the "never see the other course" default.
4. **Phonetics: in scope or classroom-only?** The book drills 8 phonetic
   objectives across the four units and the cahier hands us the items (§2.4),
   but none of them has a SIO. If in scope, recommend repurposing the NumBus
   shell as a discriminator (§7.2, ~0.5 d) and hanging the strand off the
   units the way ConjugaZone hangs off the course.
5. **DELF preparation — build it or skip it?** (§7.4 — a new surface, ~3–4 d,
   genuinely valuable, definitely scope creep. Your call, not mine.)
6. **The four chapter scenarios, region names and colours.** (§5)
7. **Grammar guard-rail on harvested frames** (§2.5): paraphrase *«&nbsp;Mieux
   vaut… &nbsp;»* / *«&nbsp;J'alternais…&nbsp;»* into taught grammar, or teach them
   whole as unanalysed chunks and let the later SIO explain the machinery?
   Recommend whole — it is plainly what the book intends.
8. **Word relations — same call as phonetics?** Four boxes, one per unit
   (§2.6), in no inventory and no SIO. Recommend a LexicaLater strand: it is
   derivational morphology, which is exactly what that game does, and A1 had
   none of it.
9. **Confirm the A2 `short` labels and section placements** in
   `ATELIER_A2_SIOs_v1.csv` — 40 drafts inside the 14-character gate, and the
   handful of thematic-fit placements flagged in §2.3.

_Answered by the materials, previously open: the id scheme (§3.2, SIO-051–090
/ units 5–8) · whether French 4 has an orientation unit (no — it opens at
Unité 5) · whether a new `text` SIO kind is needed (no, §7.2) · whether the
four units share one shape (yes, verified — §2.3) · whether a `brief` stop
counts toward completion (yes, 1/40, no asterisk — Dan, 21 Aug, §12.6)._

_Found while reading, not asked: `unit: 5` is already the map's arena
sentinel and collides with A2's Unité 5 (risk 8). And the screenshot you sent
shows the map card as "La Carte · Unité 3 · Identity Heights" — `main` has
since renamed it to The Map, so that build predates commit 56aef90, but the
Unité 3 / Identity Heights pairing looks off either way (Identity Heights is
Unité 1's region; Unité 3 is Downtown District). Worth a glance at live.__

---

## 11. The naming layer — everything the map calls things

Dan, 21 Aug: *"those labels of course need to adapt to the new topics. This
includes the maps and its references within the map."* Agreed, and it is a
bigger surface than the 40 `short` labels. This section is the complete
inventory, with a concrete proposal for each so it can be red-penned rather
than specified from scratch.

### 11.1 What is named, and where it lives

| # | Thing | File | Count for A2 |
|---|---|---|---|
| 1 | `short` map label per stop | `sios.json` | 40 — ✔ drafted (§5) |
| 2 | Region **place name** | `HomeMap.tsx` `REGIONS` | 4 |
| 3 | Region **token key** (`village`, `heights`…) | `HomeMap.tsx` + `globals.css` | 4 |
| 4 | Region **icon** (one SVG motif each) | `regionIcons.tsx` | 4 new |
| 5 | Region **accent** + **band** colour | `globals.css:517-532` | 4 accents (bands can be reused — §11.4) |
| 6 | Chapter **scenario · tagline · cliffhanger** | `chapters.ts` `CHAPTERS` | 4 |
| 7 | Unit **label · subtitle · emoji** | `sios/index.ts` `UNIT_META` | 4 |
| 8 | **Roadside props & buildings** (3D), each with a French teaching label or shop sign | `map3d/scene.ts` `ROADSIDE_ITEMS` | ~24 |
| 9 | **Gate signs** on each world (3D) | `HomeMap3D.tsx` — reads `REGIONS` + `regionIcons` | falls out of 2–4 |
| 10 | Finish-zone props + `ARENA_PLACE` | `scene.ts`, `HomeMap.tsx:93` | 1 set — see §11.5 |
| 11 | Print sheet region headers | `HomePrintSheet.tsx` | falls out of 2 |

Items 9 and 11 need no separate authoring — they read 2–4. Items 2–8 and 10 do.

### 11.2 Proposed regions

A1's naming pattern is `[Quality] + [Landform/Settlement]`, in English (the
map's chrome follows the English rule; chapter scenarios stay French, as
content). Keeping that:

| Unit | Book title | Proposed place | key | Icon motif | Covers |
|---|---|---|---|---|---|
| 5 | *Ensemble, c'est mieux !* | **Departure Docks** | `docks` | suitcase + tag | travel, leaving, deciding, justifying, challenge |
| 6 | *C'est trop beau !* | **Gallery Gardens** | `gallery` | easel / palette-and-leaf | the five senses, nature, art, appreciation, emotion |
| 7 | *Comme disait mon grand-père…* | **Memory Lane** | `memory` | framed photo | fashion & change, family, keepsakes, past narrative |
| 8 | *Si vous voulez bien…* | **Renovation Quarter** | `quarter` | house + scaffold | services, home improvement, housing, admin, complaints |

**Memory Lane** is the strongest of the four — it is idiomatic English *and*
literally a road, which the map metaphor already is. **Departure Docks**
carries units 51–55 well and the fitness/challenge half (056–057) less so;
the alternative is *World-Tour Wharf*, which leans on the unit's Projet
culturel instead. **Gallery Gardens** was chosen over *Sensory Gardens*
because half the unit is art and culture, not only the senses.

### 11.3 Proposed chapters (`CHAPTERS`)

Following A1's shape — French scenario name, French tagline, a cliffhanger
teasing the next chapter, none on the finale. The book's own unit titles are
the scenario names; they are better than anything I would invent.

| Unit | scenario | tagline | cliffhanger |
|---|---|---|---|
| 5 | Ensemble, c'est mieux ! | Partir, et partir ensemble | La suite : ouvrez les yeux, les oreilles, le nez… 👀 |
| 6 | C'est trop beau ! | Les sens, l'art, les émotions | La suite : et si on parlait de famille ? 📷 |
| 7 | Comme disait mon grand-père… | Histoires et souvenirs de famille | La suite : il est temps de rentrer à la maison… 🏠 |
| 8 | Si vous voulez bien… | Rendre service, et refaire le quartier | *(none — finale)* |

### 11.4 Colours: A2 can reuse A1's band tokens

`globals.css:517-532` defines five `--region-*` accents and five
`--region-*-band` fills, the bands mapped onto existing semantic tokens
(`--cahier-accent-soft`, `--cahier-kraft`, `--tier-good-soft`,
`--tier-medium-soft`, `--tier-weak-soft`).

**The two courses never render on the same map**, so A2 may reuse the same
five band fills without any visual collision — only four new `--region-*`
accents are needed, and those stay provisional exactly as A1's are
(STATUS decision 4: "Region accent hexes stay provisional — Design gave
bands, not accents"). That halves this item.

### 11.5 Roadside props — the part that is real authoring

~24 items, ~6 per region, each with a French label or shop sign that teaches
(Dan's litmus test keeps these: they are content, not decoration). Draft:

**Departure Docks (U5)** — 🛫 « le départ » · 🧳 « faire sa valise » ·
🧭 « le tour du monde » · *travel agency* « l'agence de voyage » ·
🥾 « se lancer un défi » · 📣 « Allez ! Courage ! »

**Gallery Gardens (U6)** — 👃 « sentir les fleurs » · *gallery*
« la galerie d'art » · 🗿 « une sculpture » · 🎭 « les émotions » ·
🎙️ « un balado » · 🌿 « la nature »

**Memory Lane (U7)** — 👗 « la mode » · *family house* « la maison de
famille » · 🌳 « l'arbre généalogique » · 📷 « les souvenirs » ·
⌚ « un objet précieux » · ☎️ « prendre des nouvelles »

**Renovation Quarter (U8)** — *town hall* « la mairie · les démarches » ·
🧰 « bricoler » · 🎨 « rénover » · *apartment block* « le logement » ·
🔑 « emménager » · 📣 « Ce n'est pas normal ! »

### 11.6 The geometry is hardcoded to a 50-stop road

Authoring the names is not enough — the map's coordinates assume A1's length.
All of these are Phase 1, and none is hard:

| Where | Assumption | Fix |
|---|---|---|
| `projection.ts:50` | `N_STOPS = 50` | per-course stop count |
| `projection.ts:52` | `getWorldX(id) = WX[(id-1) % 10]` | works by luck for 51–90 (`(51-1)%10 = 0`); make it position-within-course, not global `num` |
| `HomeMap3D.tsx:606,610` | `Math.min(4, …)` — 4 = last region index | `REGIONS.length - 1`, scoped to the course |
| `scene.ts:placeNature(until = 49.6)` | 50-stop road | per-course length |
| `ROADSIDE_ITEMS` | `z` is the **absolute** stop index 0–53 | per-course arrays with `z` relative to the course |
| `scene.ts` finish zone | z 51.3–53.2 | rides on the per-course length |
| `HomeMap.tsx:178,305` | `unit: 5` is the arena sentinel | risk 8 — the arena is not a unit |

`ARENA_PLACE` ("GramMarathon Arena") is the activity's name rather than a
place in either course, so it stays shared — but **each course needs its own
Finale bank and its own finish zone**, which is why the sentinel has to move.

### 11.7 Revised estimate for this layer

Previously costed at 0.5 d as "chapters, regions, colours". With the roadside
props, the four icons and the geometry parameterisation it is **~1.5 days**,
of which about a day is authoring that wants Dan's red pen rather than an
agent's judgement.

---

## 12. SIOs that can't be goals — and content that isn't a SIO

Dan, 21 Aug: *"the purpose of the 40 SIOs is really about breaking down the
objectives to bite sized ones. So given that there are now SIOs that cannot be
represented in goals, what do you suggest."*

There are **two** mismatches, and they point in opposite directions. Naming
them separately is most of the answer.

### 12.1 What A1 already does, and why it stops working at A2

A1 has 6 production SIOs. Every one of them has a model mini-dialogue in
`content/ateliers.ts`, and `atelierDecks.ts` turns **the dialogue's lines into
the deck** — *"the dialogue lines ARE the cards, so students can drill the
model line-by-line before performing it in class."* Verified: the set of
production SIOs and the set of SIOs with a model dialogue are identical.

That is a real answer to "how does a performance become a goal", and it works
because all six A1 ateliers are **scripted, single-performer or two-hander
exchanges**: a first meeting, a country presentation, an email, an itinerary,
a review, a restaurant scene. You can write the model down.

A2 breaks that assumption. Of its 12 production SIOs, six are still scripted
exchanges — but six are **Projets culturels and Missions**: group work, over
multiple sessions, with an unpredictable outcome and an artefact at the end
(design a virtual world tour · record a soundscape · negotiate a three-day
programme · gather a family recipe · invent a family secret · propose a
building renovation). There is no model to write down. That is the *point* of
them.

### 12.2 Suggestion: one more goal shape, not one more SIO kind

Add a field orthogonal to `sioKind` — kind says *what content*, shape says
*how the goal is worked*:

| `goalShape` | Count | What the stop opens | Assessment |
|---|---|---|---|
| **`drill`** | 28 | the existing five-step Practice sequence over a deck | items, SRS, pretest |
| **`model`** | 6 | the model dialogue/text, its lines as cards, then ComposeIt rehearsal | rubric via `/api/feedback` |
| **`brief`** | 6 | **a brief** — what the task is, the language it draws on (links to its 3–4 feeder SIOs), a worked example, and a self-mark | done / not done |

The A2 split falls out cleanly:

- **`model` (6)** — 053 Deciding to leave · 067 Buying an artwork ·
  068 Advice email · 078 Telling a story · 088 Complaining ·
  089 Recommending accommodation. All six are the unit **Ateliers
  d'expression** plus U5's Situation-1 task. Same treatment as A1's six.
- **`brief` (6)** — 060 Virtual world tour · 069 Soundscape podcast ·
  070 Well-being mission · 079 Family recipe · 080 Family secrets ·
  090 Renovation mission. All six are **Projets culturels and Missions**.

**Retrofit check: all 6 of A1's production SIOs are `model`, and A1 has zero
`brief` stops.** That is not a coincidence — it is why this friction appears
now and not before. A2 introduces a goal shape the course never had. The field
is additive; A1's data is unchanged.

### 12.3 Why `brief` is honest rather than a cop-out

`docs/ARCHITECTURE.md` §1 already draws this line: FluOlinGo *"deliberately
implements the Blueprint's strands 3–4 (fluency development + language-focused
learning) and delegates strands 1–2 (meaning-focused input/output) to the
classroom… the classroom owns interaction and production."*

The Missions are the classroom's by design. The failure mode to avoid is not
"the app doesn't run the Mission" — it is **the Mission having no stop on the
map**, which would silently drop 6 of 40 objectives, break the `x/40` counters,
and make the spine stop being a decomposition of the syllabus. A brief keeps
the stop, keeps the count, prepares the learner, records that it happened, and
does not pretend to grade group work a webpage never saw.

Most of the machinery exists: `isProduction` already means "rubric, not MCQ
battery", `MarkDoneButton` already self-marks, and `SIO_CHAINS` already
expresses "this stop belongs with those stops" — which is exactly the
"language it draws on" link a brief needs.

### 12.4 The mirror problem: content that is *not* a SIO

The book drills two strands the 40 SIOs do not cover (§2.4): **8 phonetics
objectives** and **4 conjugaison paradigms**. These are the opposite mismatch —
drillable material with no goal.

**Do not invent SIOs for them.** A1 already answers this: ConjugaZone is a
cross-course *Skills* activity that hangs off the course rather than the
spine, and `curriculum.ts` gives it the `UNIT_ALL` journey bucket precisely so
it isn't forced to pretend a position. Phonetics gets the same treatment — a
Skills-family activity (the repurposed NumBus shell, §7.2), with its item sets
tagged by unit so a learner on Unité 7 gets *la liaison* rather than [t]/[d].

### 12.5 The resulting shape

- **The spine stays exactly 40 goals.** Nothing invented, nothing dropped.
- **28 drill · 6 model · 6 brief** — three ways a goal can be worked, one of
  which is new.
- **Two Skills strands** carry the phonetics and conjugaison the spine can't.

Cost: `goalShape` on the `Sio` type, a `brief` renderer in `SioDetail`
(the smallest of the three — it is prose, links and a button), and the six
briefs authored from the book's Mission pages. **~1 day**, plus the model
dialogues, which are content either way.

### 12.6 Decided (Dan, 21 Aug): a `brief` counts 1/40

**A `brief` stop counts toward course completion on the same footing as any
drilled one — 1/40, no asterisk, no different treatment on the map.** The
Missions are the most motivating work in the unit; discounting them would say
the opposite. Do not re-open.

Three places must honour that, and one of them is not free:

1. **The Index matrix.** Its cells are "how you did" from the device ledger. A
   brief has no items, so the cell must read *done* rather than *no data* —
   otherwise six stops per course render as gaps in a completion view that just
   said they count. (`HeatStrip` and `outcomeRows` are already safe:
   `tierFor(null)` returns null → neutral, not weak.)
2. **The teacher's outcome × student matrix.** Same: a brief column shows
   done / not done, never an accuracy.
3. **XP — the one that needs a call.** `economy.ts` pays `XP_SIO_BASE` (300)
   for completing a SIO, plus up to `XP_SIO_MASTERY` (300) *scaled by how many
   of that SIO's practice items the learner has got right*. A brief has no
   items, so it can never earn the second 300: a Mission would be worth **half**
   a vocabulary stop, permanently. That contradicts the decision above.

   Options: (a) base only — rejected, that is the contradiction; (b) pay the
   full 600 on self-mark — the cheapest and least verifiable XP in the course,
   and farmable; (c) **scale the mastery bonus by the brief's feeder SIOs
   instead of its own items.** A brief already links the 3–4 SIOs whose
   language it draws on (§12.2), so the mastery signal exists — it just lives
   next door. **Recommend (c):** same formula, same ceiling, sourced from where
   the evidence actually is, and it rewards exactly the preparation the Mission
   depends on.

   This is a follow-up to the decision, not a re-opening of it: (c) needs a nod,
   and if none comes it should ship as (c) rather than silently as (a).

