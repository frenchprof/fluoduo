# FluoLingo — Release Audit Round 2 · PEDAGOGY + BLUEPRINT CONFORMANCE (2026-07-04, v2)

**Spec of record:** *The Ideal Language Learning Portal: Integrated Research Blueprint*
(36-pp. PDF, July 2026 — "the authoritative integrated synthesis"; its own closing note maps
implementation to src/lib/collections/schema.ts, docs/PRETEST_BLUEPRINT.md and the SRS/progress
modules). House rules (AGENTS.md litmus test) and docs/PRETEST_BLUEPRINT.md audited as the
local implementations of the spec. Round-1 findings (docs/RELEASE_AUDIT_2026-07-04.md) are not
repeated; where they were fixed in source since, that is credited.

Evidence labels follow the PDF: **[EST]** established · **[EMG]** emerging · **[HYP]**
hypothesis. Divergence from an [EST] item is a heavier finding than from an [EMG]/[HYP] item.
[OK-A1] = acceptable deviation for a university-course companion app whose Interactive tier,
placement and high-stakes judgment are deliberately owned by the classroom (a division the
spec itself endorses in its human-in-the-loop column). All claims carry file references.

---

## A · CORE THESIS — the six-stage spine, graded stage by stage

> "One authoritative language-content store → many learner-facing projections → continuous
> diagnosis → adaptive retrieval → authentic use → human-in-the-loop judgment."

| Stage | Conf. | Current implementation & evidence | Gap |
|---|---|---|---|
| 1. **One authoritative content store** | **72%** | Collection schema v2 is a deliberate implementation of "write once, project everywhere" ("One tagged item list is the single source of truth. Every game is a *view*", src/lib/collections/schema.ts:1-14) and even matches the spec's own rule verbatim: game structure in thin `gameConfig`, not duplicated items. **But** the flagship rain game runs on a second, legacy store — src/content/*.json (LetrisSet format) via src/games/letris/sets.ts REGISTRY — duplicating src/content/collections/*.json item-for-item (verified: weather-letris exists in both formats); Directions/Weather unit games hard-code their own content (PHRASE_BANK/MAP_PLACES, src/games/directions/DirectionsMapGame.tsx:6-71); Unit-0 MCQs live in a third store (src/content/sios/unit0-questions.ts). This is the spec's design mistake **#17 "content duplicated across activities"** verbatim. | Unify: generate LetrisSet projections from Collections at build time (col: tags + letris columns already carry everything incl. item ids). **High** |
| 2. **Many learner-facing projections** | **85%** | Genuinely strong: one deck lights up Flip It / Say It / Complete It automatically, plus dice-MCQ, Vocabularain, GramMarathon, ConjugaZone, Lexicalator via data-driven readiness predicates (src/lib/collections/{lexReady,gramMarathonReady,conjugaZoneReady}.ts, CahierShell.hasDicePractice). One example item appears as flip card, table row, typed cloze, MCQ, spoken prompt — the spec's "an example sentence exists once; it can appear in…" | No listening-quiz or reading projection (see stage 6 of Part-F row 1); projections skew form-focused. Med |
| 3. **Continuous diagnosis** | **35%** | What exists: per-item binary correctness stream from 7 practice surfaces into itemSrs (src/lib/progress.ts:154-164); per-deck weak/due/seen gap map (src/lib/reviser.ts:32-51, rendered reviser/page.tsx:162-186); cold pretests per SIO (35 authored, src/content/pretests/index.ts). What is missing vs spec: no placement, no fine-grained diagnostic map, no error *pattern* capture (the picked distractor is discarded everywhere), no latency, no confidence, no listening/phoneme diagnosis; pretest results are not even persisted (PretestContent Recap is ephemeral). "Every interaction provides evidence" [EST] — here most interactions provide one bit, and game interactions (Letris, matching, weather games, DiceTrainer) provide zero (grep: no recordItemResult in those files). | Persist pretest misses; log picked distractor into itemSrs. **Critical** (cheap) |
| 4. **Adaptive retrieval** | **40%** | Fixed 4-rung ladder (1/3/7/14 d; miss→0; early-review guard) + due-only Reviser queue + in-session miss re-queue (dice Practice review round) + Letris mercy rule. See Part-D FSRS row for the full verdict. | FSRS-grade scheduling is the spec's single **critical [EST]** item; FluoLingo is 2 generations behind it (fixed ladder < SM-2 (built but unwired, src/lib/firebase/srs.ts) < FSRS). **High** |
| 5. **Authentic use** | **20%** | In-app: Route Builder free assembly (ungraded), atelier model dialogues to perform *in class* (src/content/ateliers.ts). No transfer tasks, no real-world outputs, no unit-end integrative task in the portal. [OK-A1] *partially*: the classroom owns authentic use by design — but the spec's transfer-gate principle ("transfer task required before advancement" [EST]) has no counterpart in-app, and nothing even *records* that classroom use happened beyond self-marking (MarkDoneButton). | Even one graded recombination task per unit would move this; see Recommendations. High |
| 6. **Human-in-the-loop judgment** | **80%** | The division of labour is directionally correct: everything the spec says to keep human *is* human (all content hand-authored; high-stakes speaking = classroom rubric per sios.json isProduction; no AI grading anywhere), and the top-priority automation candidates *are* automated, crudely (scheduling, immediate formative feedback on constrained practice). FluoLingo under-automates but never over-automates — the safer failure mode per the spec. Deduction: the human (teacher) side has zero instrumentation — no teacher dashboard, no gap report, no evidence samples (spec Part XV; also on the spec's **MVP Must-Have list**). | Teacher gap report is the missing half of the loop. **High** |

**Spine verdict:** stages 1-2 are the app's strength (and clearly built by people who had read
this spec's data-model chapter); stages 3-5 thin out sharply; stage 6 is half a loop.

---

## B · THE 8 NON-NEGOTIABLE DESIGN COMMITMENTS (spec p.6) — one row each

| # | Commitment (label) | Conf. | Evidence for | Evidence against / gap |
|---|---|---|---|---|
| 1 | **Meaning-first practice** (tasks drive forms) [EST] | **45%** | SIO spine is Can-Do/situation-first (sios/index.ts sioStatement; UNIT_SITUATIONS mirror the book's communicative Situations); ateliers are situated dialogues; pretest items are full sentences in context with translations. | The practice layer itself is overwhelmingly form-first: decks of isolated items, conjugation drills, article sorting. Grammar *is* contextualised (gap-in-sentence, frames) but tasks do not drive forms — forms are the task. The spec's "Departure from convention" (task- and corpus-centric, grammar as focus-on-form) [EST] is only half-honoured. [OK-A1] softens this (A1 + classroom tasks) but does not erase it. |
| 2 | **Massive comprehensible input + guided noticing** [EST] | **25%** | Noticing is genuinely good: cold-guess pretests, per-distractor WHY (PretestQuiz.tsx:95-98), GramMarathon blanking exactly the grammar morpheme, partitif items showing the contrasting definite-article example (collections/partitifs.json `example`). | **Input is the app's biggest structural absence.** There is no reading or listening library at all — no graded texts, no 90-95 % lexical-familiarity anything, no captions/glossing, no speed control (spec checklist G). Total listening input = TTS of sentences + 6 short dialogues. Against an [EST] pillar this is the single largest conformance deficit. [DEFICIT even for A1] |
| 3 | **Frequent output with feedback and revision loops** [EST] | **65%** | Output is frequent and graded: 4 typed-production drills + Say It ASR + DiceTrainer ★★★ + Bonus, all with immediate feedback; Complete It/ConjugaZone/GramMarathon keep the type→Enter→Enter loop (nextRef focus — round-1 A4 fixed). | No *revision* loop anywhere: a miss shows the answer and moves on; nothing implements write→feedback→revise / speak→transcript→repair (spec activity "Feedback-driven revision", A2+ — partially [OK-A1] by timing, since revision loops are specced A2+). Route Builder output gets no feedback at all. |
| 4 | **Spaced retrieval built into everything — not a separate flashcard mode** [EST] | **60%** | Better than most products: 7 surfaces write the same spacing store as a side effect of normal practice (grep recordItemResult: dice Practice, Complete It, ConjugaZone, GramMarathon, Say It, Flip It Test-Yourself, Lexicalator, Reviser), and the home page surfaces the due count (SioHub.tsx:110-119). | "Everything" is not true: Vocabularain, MatchingGame, weather MCQ/gap, DiceTrainer/Bonus, DialoguePlayer write nothing — the games a learner most *wants* to replay are spacing dead zones. And the scheduler behind it is a fixed ladder (see D). |
| 5 | **Interleaving by function/skill/task, not just by chapter** [EST] | **55%** | Reviser interleaves across all decks; revision mixes interleave 5-6 lesson generators per roll (revisions.tsx: "interleaved retrieval over the whole unit"); SIO chain hint links same-dataset lessons. | Interleaving is by *deck/unit* (chapter-shaped), not by function or confusable set; no cross-unit ~20 % spiral in new units (spec cumulative-revision [EST]); U0/U2 have no revision mix. |
| 6 | **Learner agency and reflection** [EST] | **50%** | Real agency: nothing is ever locked (Dan's rule, progress.ts:14-17), every activity freely chosen, Flip It's column-reveal/order/notes give strong study control, per-deck notes (50-grapheme, synced) are a genuine reflection artifact, self-marked completion is literal self-assessment. | No goal-setting, no strategy prompts, no confidence ratings, no weekly reflection (Zimmerman row [EST]); no dashboard beyond gems/streak/hearts; "Today's plan" absent. Agency ✓, reflection ✗. |
| 7 | **Authentic interaction (humans + AI) with safety controls** [EST/EMG] | **15% raw / [OK-A1]** | Model dialogues + classroom performance; leaderboard is opt-in-name and peripheral (spec: "never central" ✓). | Zero in-app interaction, human or AI; no information-gap, no negotiation, no repair sequences. The spec itself keeps "negotiation of meaning with real humans" [EST] — the course has real humans twice a week. Acceptable *if* the classroom link is instrumented (it isn't — see teacher report). |
| 8 | **Autonomy trajectory: teach learners to leave the portal** [EST] | **20%** | Custom deck authoring exists end-to-end (importer parse.ts, MyDecks, study/MCQ) — learners *can* create personal SRS items, which is the spec's own autonomy marker. | Nothing teaches them to: no mining input from real media, no deliberate-practice planning, no self-assessment training, no exit plan (spec mistake #19). For a one-semester A1 course this is Low priority, but it is 0 % implemented. |

---

## C · AUTOMATE vs KEEP-HUMAN division of labour (spec Part I table)

| Spec: automate | FluoLingo | Spec: keep human | FluoLingo |
|---|---|---|---|
| Spaced scheduling, item selection, interleaving [EST] | 🟡 automated but fixed-ladder, no item *selection* intelligence | High-stakes speaking/writing eval [EST] | ✅ classroom rubric (isProduction SIOs; no in-app grading of ateliers) |
| Rapid formative feedback on constrained practice [EST/EMG] | ✅ every drill, immediate, deterministic | Goal negotiation, affective support, community [EST] | ✅ classroom-owned (nothing in-app pretends to do this) |
| Exposure optimization: adaptive input, captions, glossing [EST] | ❌ no input layer to optimize | Sensitive feedback (identity, accent) [EST] | ✅ Say It grades intelligibility-ish (accent-different = still correct, "Bien ! (accent différent)") — conforms to intelligibility-over-nativeness [EST] |
| Pronunciation acoustic analysis [EMG] | 🟡 word-level ASR match only (SayItContent.gradeAnswer), no phoneme level — fine for [EMG] | Nuanced pragmatic judgment [EST] | ✅ human (tu/vous deck trains it declaratively; judgment stays in class) |
| Progress analytics, error clustering, personalization [EST] | ❌ none beyond due counts — the one *automate-column [EST]* item fully missing | Curriculum philosophy, final content approval [EST] | ✅ 100 % hand-authored, Dan-approved content |
| Low-stakes AI conversation [EMG] | ❌ none (see K) | Negotiation with real humans [EST] | ✅ classroom |
| Example/drill generation with QA [EMG] | 🟡 deterministic generators (native-lesson dice `newQuestion()`) — template, not AI; QA = author | Relationship/mentorship [EST] | ✅ classroom |

**Call:** the human column is fully honoured; the automate column is honoured for feedback,
half-honoured for scheduling, and unimplemented for analytics/error-clustering and input
optimization — both [EST]. FluoLingo errs exclusively on the side of under-automation.

---

## D · LEARNING THEORIES — graded against the spec's "portal embodiment" column

| Framework | Spec embodiment (label) | FluoLingo | Conf. |
|---|---|---|---|
| Input Hypothesis | Adaptive reading/listening; 90-95 % lexical familiarity in graded texts [EST] | No graded texts, no adaptive input. TTS + 6 dialogues (grammar-capped: "present + futur proche only", ateliers.ts:10-11 — the *spirit* of i+1 at micro scale). | **15%** |
| Output Hypothesis | Mandatory production; reformulation when meaning fails [EST] | Production plentiful (5 typed/spoken surfaces) but optional and form-focused; no reformulation loop. | 55% |
| Interaction Hypothesis | AI/human tasks with repair sequences [EST] | None in-app; classroom-owned [OK-A1]. | 10% raw |
| Usage-Based Learning | Corpus-informed; high-frequency first [EST/EMG] | Frequency ordering is editorial (syllabus-driven), not corpus-driven; items are mostly single words, few MWEs/collocations (spec mistake #8). Chunks do appear where it matters (il fait…, je voudrais, partitive frames). | 45% |
| Skill Acquisition (DeKeyser) | Explicit instruction → controlled practice → free production [EST] | **The app's best theory fit.** Mémo → dice ★ (recognize) → ★★ (cued) → ★★★ (free typing); Flip It flip → Test Yourself; Vocabularain day → night (blurred recall, 3.2× slow) → storm (recall at full tempo) → dawn (LetrisGame.tsx:39-58). Free *production* stage = classroom. | **85%** |
| TBLT | Situation-first navigation; transfer tasks gate progression [EST] | Situation-first nav ✅ (UNIT_SITUATIONS); transfer gates ❌ — and deliberately so: "we must not lock any of the future modules" (progress.ts:14-17). A conscious product decision *against* an [EST] spec item; defensible for a companion app, but it removes the spec's mastery mechanism entirely. | 40% |
| **Retrieval + Spacing** | **Platform-wide FSRS scheduling [EST] — critical** | Fixed 4-rung ladder, binary input, 14-day cap, no stability/difficulty params, no latency, no error history (progress.ts:139-152; LearnerItemState spec fields mastery/stability/latency/error_history[]/confidence — FluoLingo has 2 of 8: interval, due). SM-2 exists but is unwired by design (firebase/srs.ts). Coverage holes (games). | **35% — the heaviest single [EST] divergence** |
| Desirable Difficulties (Bjork) | Interleaving, generation before hints, varied contexts [EST] | Generation-first ✅ (pretest cold guess; typed recall before any hint); varied contexts ✅ (same item across 5+ formats); interleaving 🟡 (see B5). Anti-pattern: permanent first-letter placeholder in Complete It/ConjugaZone *removes* difficulty forever (CompleteItContent.tsx:183, ConjugaZoneContent.tsx:122). | 65% |
| Cognitive Load (Sweller) | One primary action per screen; inline glosses [EST] | Drill screens are exemplary one-action screens; popup keeps options+sentence on one line (PretestQuiz comment); litmus rule strips redundant text app-wide; study-table = pretraining. | **85%** |
| Multimedia (Mayer) | Audio + visual; no decorative clutter [EST] | Dual coding throughout (emoji+word+TTS); cahier skin is decorative but litmus-exempt (visual channel). Weakness: auto-TTS fires only on *correct* answers in drills — the miss (where dual coding pays most) stays silent unless clicked. | 75% |
| Self-Regulated Learning | Dashboards, goal-setting, strategy prompts [EST] | Gap panel + due badge only; no goals, no prompts, no calibration. | 30% |
| Self-Determination | Choice, mastery feedback, opt-in community [EST] | Choice ✅✅ (nothing locked); mastery feedback 🟡 (gems weighted by real mastery, progress.ts:52-58 — but hearts are loss-theatre, below); community = opt-in leaderboard ✅. | 70% |
| ICAP | Activity mix weighted toward higher tiers; target ≥15 % I / ≥25 % C / ≥30 % A / ≤30 % P [EST] | In-app estimated mix: **I ≈ 0 %**, C ≈ 30 % (typed drills, Say It, Test-Yourself, dice ★★★, Route Builder), A ≈ 40 % (MCQ, sorting, matching, Reviser), P ≈ 30 % (flip, tables, memos, dialogues). C/A/P targets met; Interactive fails outright in-app [OK-A1 with the classroom counted; ✗ as a portal]. | 60% |
| Pretesting (Pan & Chua) | Pretest-before-instruction loops **[EMG]** | **Best-implemented theory in the app**: 35 hand-authored cold MCQ pretests + Unit-0 batteries; never grades/never writes practice SRS (separate namespace, "never spend hearts" rule); rule revealed only after attempt; per-distractor WHY; full-sentence TTS. Missing only the gap-report persistence its *own* local blueprint demands (PRETEST_BLUEPRINT.md:19). | **90%** |

**Honest inversion:** FluoLingo's deepest investment (pretesting) sits on an **[EMG]** item,
while its deepest deficits (FSRS scheduling, comprehensible input, multidimensional mastery,
transfer gates) are all **[EST]**. The effort-to-evidence mapping is upside-down relative to
the spec's own weighting.

---

## E · MACRO PIPELINE (Onboard → … → Autonomize) and PER-ITEM PIPELINE

| Spec stage (label) | FluoLingo | Conf. |
|---|---|---|
| Onboard (goals, L1, time budget) [HYP demo-path / EST disclosure] | None. App opens on the SIO path; AuthGate demands Google sign-in before any activity (AuthGate.tsx) — the *opposite* of "try a lesson first" [HYP, so light]. Progressive disclosure ✅ (units collapsed on fresh session, SioHub.tsx:74-84). | 25% |
| Place (adaptive CAT, IRT) [EST] | None — placement = university enrollment in LAF1201. [OK-A1: cohort is definitionally A1-zero.] | n/a-OK |
| Diagnose (fine-grained gap map) [EMG] | Per-SIO pretests are exactly this at lesson grain — but unrecorded. | 40% |
| Path (Personal Learning Graph) [EMG/HYP] | Single shared path with a "you-are-here" cue (SioHub activeId); no personalization. [Light — EMG/HYP.] | 20% |
| Learn | Native lessons, Flip It, study tables — solid. | 80% |
| Retrieve | See B4/D-FSRS. | 60% |
| Produce | See B3. | 65% |
| Assess (mastery gates, p≥0.85, 3+ spaced retrievals, transfer task required) [EST] | No gates by explicit product decision; itemsMastery exists but gates nothing; no p-threshold; the ladder does encode "3+ successful retrievals across spaced intervals" implicitly (rungs 1→3→7→14). | 30% |
| Remediate (micro-loops triggered by error clusters) [EST/EMG] | dice Practice end-of-run review round is a within-session micro-loop for that deck; nothing cluster-triggered; no minimal pairs / focused recasts. Spec's error-recycling cadence (re-integrate at 3/7/15 min in-session then spaced [EST]) — only the crude end-of-run version exists. | 35% |
| Transfer (novel context, unrehearsed) [EST] | Absent in-app (Route Builder closest, ungraded). | 15% |
| Review (FSRS; cumulative ~20 % spiral) [EST] | Reviser + 3 revision mixes; no spiral inside new units. | 50% |
| Autonomize [EST] | See B8. | 20% |
| **Per-item** Encounter→Notice→Understand→Retrieve→Produce→Reuse→Transfer→Maintain | Encounter ✅ (study table gates the rain; Flip It Overview) · Notice ✅ (pretest, WHY, gap-blanking) · Understand ✅ (memo, recap) · Retrieve ✅✅ · Produce ✅ (typed/spoken) · Reuse 🟡 (revision mixes; same-deck only otherwise) · Transfer ❌ · Maintain 🟡 (14-d cap; recognition-only review; game dead zones). | **~65%** |
| Session design (15-25 min: warm-up retrieval → new → mixed consolidation) [EMG] | No session orchestration; the learner self-assembles from flaps. The Reviser is a warm-up nobody is steered to first. [Light — EMG.] | 25% |

### Required verdict — the "content exposure" line
> *"A platform that stops at 'complete lesson' without long-term retrieval is content
> exposure, not a learning portal."* [EST]

**FluoLingo clears this bar — genuinely, but unevenly.** It does not stop at complete-lesson:
seven practice surfaces silently feed a spacing store (progress.ts:154-164), the home page
pulls learners back with a due-count badge (SioHub.tsx:110-119), and the Reviser reschedules
on every answer (reviser/page.tsx:71). That is a real retrieval loop, and it distinguishes
FluoLingo from a course website. **Against the spec's FSRS-critical standard, however, it
scores ~35 %:** the scheduler is a fixed 4-rung ladder with a 14-day ceiling; it models
neither stability, difficulty, latency, error history nor confidence (all named
LearnerItemState fields in the spec); it conflates slips with competence gaps (every miss
hard-resets to rung 0 — progress.ts:144-151 — where the spec's Gemini model says preserve flow
on slips and remediate only competence gaps); review is recognition-only regardless of how the
item was learned; and the most-replayed surfaces (Vocabularain, matching, weather games) write
nothing into it. Verdict: **a learning portal in kind, a Leitner box in degree.**

---

## F · REMAINING SPEC PARTS (III-XVIII) — conformance rows

| Spec part | Requirement (label) | FluoLingo | Conf. | Priority fix |
|---|---|---|---|---|
| III Information Architecture | Hybrid task-skill-concept graph; Task Worlds primary nav; Review Queue for all; search-first help [EST] | Task/situation-first nav ✅ (Situations + Can-Do); Review Queue ✅ (Réviser + badge); unit wrappers ✅ (course pacing). No skill studios (can't practice "listening" as a skill), no concept graph, **no search at all** ("I keep confusing X and Y" has no answer surface) [EST]. Granularity hierarchy matches spec down to Item level. | 55% | Search over decks/lessons/pretests: Med |
| IV Data Model | Write once; canonical entities; **mastery is not binary — 8 dimensions**; LearnerItemState rich fields [EST] | Schema matches the spirit and even the letter of the gameConfig rule; Item lacks frequency rank, CEFR tag, collocations, confusable sets (has: note, gender, nat forms, syllables, frames — respectable for A1). **Mastery: single boolean per item id vs 8 spec dimensions** — recognition/recall/listening/pronunciation/grammar collapse into one key: a Say It success and a spelling success are indistinguishable, a GramMarathon miss erases Flip It credit; nat items collapse 4 agreement forms into one id (CompleteItContent NAT_FORMS vs single item.id at :121). | 50% | Namespace SRS keys by modality (`id:w`/`:s`/`:r`) — additive migration: **High** |
| V Activities | Non-negotiable sequencing (Input→Noticing→Recognition→Controlled recall→Guided→Open→Real-world→Reflection→Review); "orchestrate by cognitive function, do not randomly mix games" [EST]; ICAP targets | Within-deck the flap order is roughly right (Lesson→Flip→Say→Complete→games, SioModal.popupActivityTabs) but nothing *sequences* — all stages offered at once, learner may storm-drill before ever encountering; no reflection stage. Per-activity audit: §G. ICAP: Interactive 0 % in-app (D-ICAP row). | 60% | Order flaps by function + a subtle "start here" cue: Low/Med |
| VI Adaptive Engine | Adapt on 9 signals (mastery, error patterns, latency…); do-NOT-adapt list; 80-85 % desirable-difficulty zone; explainable adaptation; IRT→BKT→FSRS→rules→LLM stack [EST] | Adapts on signal #1 only (partially) and #9 (due compliance implicitly). Latency/confidence/L1-profile absent. **Do-not-adapt list: fully clean** — no demographic proxies, no leaderboard-driven adaptation, no opaque AI scores ✅. Explainability ✅ in miniature: the Reviser says exactly why items appear ("Words you've practised that are due again", reviser/page.tsx:93-95) — spec-conformant explanation style. No success-rate targeting anywhere (drills are fixed-difficulty). | 40% | Distractor logging (cheap, unlocks error patterns): **High** |
| VII Assessment | Continuous, low-stakes, learning-oriented; **never grade cold guesses** [EMG]; practice vs assessment spaces [EST]; diagnostic/formative/mastery/summative ladder | **Never-grade rules: fully conformant** — pretest writes no SRS, spends no hearts, separate id namespace (progress.ts:23-34) ✅✅; formative = every activity ✅; effort metrics not graded ✅. Missing: mastery gates (by decision), summative end-of-unit (nothing), self-assessment beyond buckets, and the pretest's own gap-report step (PRETEST_BLUEPRINT.md:19) — results vanish on navigation. | 55% | Persist pretest results + "bring to class" list: **Critical** |
| VIII Feedback | "Few, useful, actionable — 1-3 targets"; timing matrix; slip-vs-gap differentiation [EST] | 1-target feedback everywhere ✅ (exactly one correction per answer — spec-conformant restraint); immediate corrective on discrete items ✅ = the matrix's optimal cell; immediate confirmatory ✅. Missing: slip vs competence-gap distinction (uniform hard reset — the "repaired but fragile" rung-1 policy, progress.ts:154-159, punishes slips as gaps); no Socratic/metalinguistic tier for repeated errors; drills give no *why* (only pretests do). | 70% | Two-strikes-before-reset for items with prior rung ≥ 7 d: Med |
| IX UX | Home = today's plan + review queue + weak areas; ≤3 taps to any skill; no dead ends [EST]; focus mode; auto-advance ~85 % | Review queue + weak areas on home/Reviser ✅; drills are true focus screens ✅; ≤3 taps ✅ (path→popup→flap). No "today's plan"; **dead ends persist** (round-1 U2/U7 orphan/legacy routes — spec mistake #16/#17 cousins); no auto-advance tuning. Undo without penalty 🟡 (Route Builder has Undo; drills have none, but single-shot answers make it moot). | 65% | Kill dead links (round-1 list): High (already queued) |
| X Accessibility | WCAG 2.2 AA + UDL by design [EST] | Deferred to the a11y stream. Conformance-relevant deltas since round 1: SioModal gained Escape + initial focus (SioModal.tsx:120-127; trap still missing); Letris palette darkened for AA contrast (LetrisGame.tsx:85-94 comment); NightWord has an aria letter-count. Round-1 A2/A3/A5-A8 unverified here. | (defer) | — |
| XI AI Integration | 4 capability layers; AI-should/AI-should-never; grounded, teacher-overridable conversation is MVP-Must-Have [EMG] | **Zero AI, factually** (grep: no LLM/AI provider anywhere in src). Browser TTS + browser ASR with deterministic grading are the whole stack. Consequence: every "AI should never" rule is trivially satisfied; every "AI should" capability (incl. the MVP's grounded conversation) is absent. For this audience the absence is defensible [OK-A1] — hallucinated French at A1 is a real risk the spec itself flags — but against the spec's MVP list it is a named miss. | 0% capability / 100% safety | Do not add AI pre-launch. Post-launch, lowest-risk: offline AI-drafted, human-approved whyWrong coverage. Low |
| XII Gamification | "Gamify learning, not rewards"; **hearts/lives = Avoid, anti-pattern** [EST]; streaks only with freeze; leaderboards opt-in only; XP careful | Core mechanics *are* learning (night-blur retrieval, syllable keyholes, storm tempo — the spec's "spaced retrieval as mechanic ★★★★★" in spirit). **Hearts violate a named [EST] anti-pattern** — currently toothless (only Lexicalator decrements; no refill; gates nothing; progress.ts:21-26) which makes them pure loss-display: remove rather than finish them. Streak has no freeze and counts self-marking, not practice (bumpStreakToday only via markSioDone) — spec mistake #13 adjacent. Leaderboard: opt-in name, hidden page, never central ✅. XP: mastery-weighted gems are the *good* kind of XP ✅. | 65% | **Delete hearts** (spec-mandated direction); streak-from-practice + freeze: Med |
| XIII Motivation | SDT: autonomy/competence/relatedness; failure normalization; habit cues | Autonomy ✅✅ (no locks, free order, resizable UI); competence 🟡 (gems track mastery; but no per-skill growth view — single progress lens); relatedness = classroom. Failure normalization ✅ in pretest copy ("errors are productive", blueprint) but drills' ❌ has no growth framing. No habit cues/re-engagement (nothing notifies). | 60% | Per-deck mastery bar on SIO popup (data already in itemsMastery): Med |
| XIV Social | Layered, opt-in, never required for progression; safety | Level 0-1 only (solo; anonymous board). Never required ✅. Safety n/a (no UGC visible to others except hi-score names — 20-char cap, no moderation; minor exposure). Classroom = levels 3-4 offline. | 35% raw / [OK-A1] | Name-moderation pass on vlrain_hiscores: Low |
| XV Analytics | Learner dashboard (mastery map, top confusions, retention forecast); **teacher dashboard (error clusters, gap evidence, at-risk alerts)** | Learner: gap panel (weak/due/seen per deck) + due badge — honest start, no confusions/forecast. Teacher: **nothing**, while every practice event dies in localStorage. The sign-in paradox makes this worse: all practice is auth-gated ("engaging in any learning activity cannot [be anonymous]", AuthGate.tsx:4-8) yet nothing per-user is stored server-side (progress.ts is localStorage-only; srs.ts unwired) — learners pay identity friction and the teacher gets zero visibility for it. | 25% | Sync progress to users/{uid} (pattern exists in srs.ts; rules already owner-scoped) + minimal teacher roster view: **High** |
| XVI Technical Architecture | Offline-first, FSRS microservice, privacy, canonical DB | Static export + bundled content = zero-read browsing ✅ and de-facto offline-capable reading; localStorage progress is local-first without the sync half (no CRDT/conflict story — last device wins by never syncing). Privacy: minimal by architecture (nothing collected) ✅. Perf details → round 1 (P1-P3 stand). | 65% | — (covered elsewhere) |
| XVII Benchmarking | Combine Anki-grade scheduling + LingQ-grade input + Busuu community + Speak speaking + teacher-grade pedagogy | FluoLingo today ≈ **teacher-grade pedagogy ✅ + Clozemaster-grade contextual retrieval ✅ + Duolingo-style path/streak veneer 🟡 − Anki-grade scheduling ✗ − LingQ-grade input ✗**. Notably it already avoids Duolingo's two named weaknesses in one column (shallow transfer, hearts punish errors)… while shipping hearts anyway. | — | — |
| XVIII Future-proofing | Event-sourced learner model, API-first content, pluggable activity templates | Pluggable activity projections ✅ (readiness predicates); content API-first-ish (typed JSON modules); learner model is the opposite of event-sourced (mutable snapshot, no history — error_history[] impossible retroactively). | 55% | Append attempt events alongside itemSrs now, model later: Med |

### MVP checklist (spec p.34) — scorecard
Unified item schema w/ 5+ projections ✅ · Adaptive onboarding+placement ❌ [OK-A1] · FSRS
scheduler + retrieval activities 🟡 (retrieval ✅ / FSRS ✗) · Pretest→learn→retrieve loop ✅
(the app's signature) · Input library with captions/gloss + save-to-practice ❌ · Core
speaking/writing loops with 1-3-target feedback 🟡 (loops ✅ / revision ✗) · Formative
feedback immediate ✅ · Grounded AI conversation ❌ [OK-A1] · Learner dashboard (queue + top
errors + per-skill) 🟡 (queue ✅ / errors ✗ / per-skill ✗) · **Teacher gap report ❌** ·
WCAG AA baseline 🟡 (a11y stream) · PWA offline for reviews 🟡. **≈ 5 of 12 fully met.**

### The 20 common design mistakes — which FluoLingo commits
Committed: **#7 partially** (spacing exists, no interleaving strategy), **#8** (mostly
isolated words, few MWEs), **#13 partially** (streak w/o freeze; XP fine), **#16 partially**
(a11y retrofit in progress), **#17** (content duplicated: legacy letris store), **#18** (no
error recycling by cluster; no teacher dashboard), **#19 half** (no L1-contrastive layer for
a Singapore cohort — no EN/CN transfer notes; no exit plan).
Cleanly avoided: #1 (gems track mastery, not clicks), #2 (no lockstep treadmill — nothing
locked), #3 (retrieval everywhere), #5 (no feedback-less output *except Route Builder*), #6
(1-target feedback), #10 (intelligibility over nativeness in Say It), #11 (no opaque scores),
#12 (no single global level *displayed*… though the store is single-dimension), #14
(leaderboard peripheral), #15 (no AI), #20 (no novelty tech).

---

## G · PER-ACTIVITY COGNITIVE-ROLE AUDIT
(spec Part V taxonomy; sequencing = Input→Noticing→Recognition→Controlled recall→Guided→Open)

| Activity (route) | Knowledge component | Retrieval mechanism | ICAP tier | Scaffolding removal? | Does failure teach? | Implements ↔ contradicts |
|---|---|---|---|---|---|---|
| Pretest page (/pretests/[id]) | Grammar/usage discrimination, pre-instruction | Cold MCQ, full reshuffle per run | Active | n/a (diagnostic) | ✅ best in app: answer + full-sentence TTS + tap-options-to-hear + recap table | Pretesting [EMG] ✅; never-grade-cold-guesses [EST] ✅. ↔ no persisted gap report (own blueprint L19) |
| Pretest inline (PretestQuiz) | Same, at-a-glance battery | Cold MCQ, instant per-question grading | Active | n/a | ✅ whyWrong for the picked distractor only, behind WHY (litmus ✅) | Noticing ✅ |
| Flip It flip/Overview (FlipItContent) | Form-meaning + article/gender | Flip; per-cell cover/reveal in 5-col table | Passive→Active | ✅ learner-controlled column hiding (blueprint mechanic verbatim) | 🟡 self-judged | Encounter/Recognition stage ✅; buckets = manual Leitner read by no scheduler |
| Flip It Test-Yourself | Written production incl. article; case-sensitive proper nouns | Typed recall → itemSrs; success auto-buckets | Constructive | ✅ learner-elected flip→produce | ✅ correct kept beside learner's answer | Controlled recall [EST] ✅ |
| Say It | Oral production of deck items | ASR vs expected, 4-grade; itemSrs incl. no-speech | Constructive (spoken) | ❌ within mode | ✅ transcript vs expected; "close" amber | Intelligibility>nativeness [EST] ✅; pronunciation [EMG] word-level only. ↔ "close" shown amber but recorded as miss |
| Complete It | Orthographic production; nat decks ×4 agreement forms | EN→FR typed recall → itemSrs | Constructive | ❌ first-letter hint permanent | ✅ answer + example + 🔊; no why | Retrieval-practice [EST] ✅. ↔ 4 forms share one SRS id |
| dice Practice MCQ (engine.ts) | Category/frame discrimination (frames = item-conjugated distractors) | MCQ over letris columns; first-try misses re-queued end-of-run; itemSrs | Active | 🟡 frames harden distractors, fixed | ✅ review round = immediate remediation of exactly what was missed | Recognition + error-recycling-lite [EST] 🟡 |
| ConjugaZone | Whole-predicate production | Subject+EN cue → type predicate → itemSrs | Constructive | ❌ permanent first-letter hint | ✅ answer shown; no why | Controlled→guided output [EST] ✅ |
| GramMarathon | The grammar morpheme alone, context constant | Word-boundary-safe cloze → itemSrs | Constructive | ✅ everything but target given (focus-on-form) | ✅ answer + contrasting example (partitif vs definite) | Focus-on-form [EST] ✅; cloze = spec's lexical-approach cell ✅ |
| Vocabularain/Letris | Category classification at speed → automatization | Forced-choice under time; day→night(blur+slow)→storm(blur+tempo)→dawn; 4/cat hands; study-table gate | Active at automaticity tempo | ✅✅ clearest fade in app (read→recall-slow→recall-fast) | 🟡 true colour revealed on landing; match-3 recovery *rehearses the wrong drop ×3* (resolve.ts:3-9) | DeKeyser automatization [EST] ✅✅; "retrieval as mechanic ★★★★★" ✅. ↔ no itemSrs (legacy store); score ≠ mastery |
| Lexicalator (/games/conveyor) | Sublexical form: syllables vs hand-authored near-miss decoys | Any-order syllable assembly; itemSrs both ways; heart on wrong key | Active/Constructive | ✅ levels gate syllable count; hard mode hides count; belt accelerates | ✅ wrong key rejected in place | Phoneme-grapheme work ≈ dictation cell [EST] 🟡; only game wired to SRS ✅ |
| MatchingGame (weather/directions) | Pair association, multi-valid graph | Tap-pair | Active | ❌ | 🟡 red flash only; nothing recorded | Match It ✅. ↔ SRS dead zone |
| Weather unit (lesson/match/MCQ/gap) | il fait / il y a / il+verbe frames | 4 escalating formats, one content set | Passive→Active | ✅ across tabs | 🟡 per-game only | Varied contexts [EST] ✅. ↔ own content copy (mistake #17); no SRS |
| Directions unit + Route Builder | Route-giving discourse (verbs/completions/connectors) | Free assembly from phrase bank; TTS reads route back | **Constructive — only open composer in app** | 🟡 full bank always visible | ❌ ungraded; ungrammatical routes spoken back verbatim | Guided output ✅ in spirit. ↔ spec mistake #5: output without feedback |
| Native lessons (Mémo+DiceTrainer+Bonus) | Grammar rule + sentence assembly | 🎲 generated Qs, 3 tiers (pick→dropdown-frame→type-full); ⭐ EN→FR | Passive→Active→Constructive | ✅✅ explicit learner-selected 3-tier fade | ✅ correct sentence shown+spoken on every answer, incl. misses | Explicit→controlled→free [EST] ✅; Merrill ✅. ↔ generative items id-less → no SRS; no promotion nudge off ★ Facile |
| Revision mixes (revisions.tsx) | Cross-lesson interleaving per unit | Random roll across 5-6 lesson generators | Active→Constructive | inherits tiers | inherits | Interleaving [EST] ✅ ("the drill itself is the revision"). Missing U0/U2 |
| Reviser (/reviser) | Whatever is due, cross-deck | FR→EN recognition MCQ, same-deck distractors; reschedules | Active | ❌ always recognition regardless of rung | ✅ correct shown; no why, no lesson link | Spacing+interleaving ✅; explainable adaptation ✅. ↔ reviews below acquisition tier; distractors not learner-confusion-based |
| DialoguePlayer/Ateliers | Discourse models, grammar-capped to covered forms | Listen (all/per-line), read FR+EN | Passive (performance = class) | class takes over | n/a | Input at micro-scale ✅; interaction outsourced [OK-A1] |
| Unit-0 inline MCQs | Survival-French discriminations | At-a-glance MCQ battery | Active | n/a | ✅ | Pretesting ✅ |

---

## H · HONEST CALLS

**Mastery: single number or multidimensional?** Single binary per item id
(`intervalDays > 0`, progress.ts:107-111) + a self-reported per-SIO boolean — against the
spec's 8-dimension "mastery is not binary" table [EST] and LearnerItemState (stability, ease,
latency, error_history[], confidence: FluoLingo implements 2 of 8 fields). All modalities
share one key; nat items collapse 4 forms into one. The sios.json measurable thresholds are
display-stripped and assessed by nothing. The in-code honesty ("the only honest signal
available") is real and creditable — but the model is one bit deep.

**Does the adaptive layer adapt?** It schedules and surfaces; it does not adapt. Of the
spec's nine adapt-on signals it uses #1 partially (binary mastery) and nothing else — no
latency (spec [EST/EMG]), no error patterns [EST] (the picked distractor is discarded at every
MCQ site), no confidence, no L1 profile (notable for a Singapore cohort: zero EN/中文
contrastive notes anywhere in content). Hearts gate nothing; buckets feed nothing. Redeeming
features: it is *explainable* (Reviser states its reason — a spec [EST] requirement most big
apps fail) and it adapts by none of the forbidden signals. Verdict: Leitner with good manners.

**Where does the pipeline skip stages?** Transfer (nothing in-app between drill and
classroom; no transfer gates by explicit product decision — a conscious trade against an
[EST] principle) and Maintain (14-day ladder cap; recognition-only review; the replayable
games are spacing dead zones; streak — the one maintenance nudge — counts self-marking, not
practice). Also skipped at macro level: Onboard, Place, Diagnose-persistence, Autonomize.

**Any AI?** None, factually (grep-verified). Browser TTS + browser SpeechRecognition with
deterministic grading. Every "AI should never" rule is satisfied by absence; every "AI
should" capability, including the spec-MVP grounded conversation partner, is absent. For an
A1 curated course this is the safe side of the ledger — but it must not be marketed as AI.

**The evidence-weighting inversion.** FluoLingo's crown jewel (pretesting loop, ~90 %
conformant) implements an **[EMG]** effect; its four largest deficits — FSRS-critical
scheduling, comprehensible-input layer, multidimensional mastery, transfer gates — are all
**[EST]**. If effort follows the spec's own evidence labels, the next sprint belongs to the
scheduler and the input layer, not to more pretests.

**The sign-in paradox (flag to Dan).** Practice is auth-gated (AuthGate: learning "cannot
[be anonymous]") yet every learning event dies in device-local localStorage; the synced SRS
module exists and is deliberately unwired (srs.ts). Learners pay identity friction; neither
they (cross-device) nor the teacher (gap visibility) receive anything for it. Wire the sync
or drop the gate.

**Hearts.** Round 1 said "refill design needed, deferred." The canonical spec overrules:
hearts/lives are a named anti-pattern, "Avoid — punishes errors" [EST]. Recommendation
upgraded: **delete the hearts display and the Lexicalator decrement**; do not build a refill.

---

## I · SCORES (/100)

| Dimension | Score | Basis |
|---|---|---|
| **Educational Fidelity** (right A1 content, sequence, coverage) | **88** | Book-verified Situations; spanning-case pretests match PRETEST_BLUEPRINT topic-for-topic; atelier grammar caps. Docked: no input library, few MWEs, no L1-contrastive layer, missing U0/U2 mixes. |
| **Pedagogical Fidelity** (spec theories → mechanics, weighted by [EST]>[EMG]) | **74** | Exceptional on DeKeyser + pretesting + CLT + feedback restraint; heavy [EST] misses on FSRS scheduling, comprehensible input, multidimensional mastery, transfer gates, slip-vs-gap. |
| **Architectural Fidelity** (write-once → projections; zero dead text) | **76** | Schema v2 + readiness predicates are spec-grade; docked for the legacy Letris dual store (mistake #17), hardcoded unit-game content, three non-communicating progress stores, sign-in-without-sync. |
| **Future Extensibility** | **78** | Data-driven activity lighting, staged SM-2 path, custom-deck pipeline; docked for 5 manual registries, snapshot (non-event) learner model, TSX-only lesson authoring. |
| **Overall Blueprint Conformance — raw, vs the full canonical spec** | **68** | The spec describes a multi-year ideal portal (AI conversation, CAT placement, teacher dashboards, input library); FluoLingo implements the content/retrieval core of it. |
| **Overall — adjusted for declared scope** (A1 classroom companion; classroom owns Interactive tier, placement, high-stakes judgment — a division the spec's own human-in-the-loop column endorses) | **80** | Consistent with round 1's Pedagogical 88 minus the newly graded [EST] gaps (scheduler depth, input, mastery model, teacher loop). |

## Top pedagogy actions (re-ranked under the canonical spec)
1. **Persist pretest results → learner "bring to class" gap list + teacher gap report** — closes the app's flagship loop AND the spec's MVP teacher item. Critical, S/M.
2. **Resolve the sign-in paradox** — sync progress via the existing srs.ts pattern (prereq for #1's teacher half). High, M.
3. **Upgrade the scheduler one generation** — wire the already-built SM-2 (srs.ts) or lift the ladder cap + add slip-tolerance (no reset from rung ≥ 7 on first miss); log picked distractors into item state. High, M. (FSRS proper is post-launch.)
4. **Split mastery by modality** (`itemId:w/:s/:r` + nat sub-forms) — additive, unblocks honest per-skill display. High, S/M.
5. **Delete hearts** (spec anti-pattern); **streak from practice + freeze**. Med, S.
6. **Correct It from GramMarathon data** (wrong filler shown → learner repairs) — cheapest new Constructive rung and first in-app transfer-ish task. Med, S/M.
7. **Unify the Letris store onto Collections** — kills mistake #17, unlocks rain→SRS. Med, M.
8. **Minimal input layer** (per-unit 60-90-word graded reading with tap-gloss from existing decks + TTS) — the largest [EST] hole; even one text per unit changes the strand balance. Med, M/L.

Acceptable deviations to leave alone for this release: no placement/CAT, no AI conversation,
no XR, Interactive tier in classroom, portfolio/autonomy features, DiceTrainer's unrecorded
generative items, Route Builder's ungraded openness (fluency rehearsal before class).
