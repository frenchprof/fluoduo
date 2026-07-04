# FluoLingo — Architecture & Rationale

*Last updated: 2026-07-05. Companion documents: `docs/RELEASE_AUDIT_2026-07-04-v2.md`
(conformance audit against the Blueprint), `AGENTS.md` (design rules).*

---

## 1. What problem this site solves

FluoLingo is the **out-of-class companion** to a taught French A1 course
(LAF1201-family, 4 teaching units + an orientation Unité 0, ~50 learning
objectives). It is *not* a self-study replacement for the course — the
classroom owns interaction and production; the site owns everything a
classroom is bad at:

1. **Preparation.** Learners meet each objective *before* class through a
   pretest they are expected to fail partially. Failed retrieval before
   instruction measurably improves subsequent learning (the pretesting
   effect, Pan & Chua). The site captures each learner's misses into a
   personal "📝 Bring to class" list, turning errors into the classroom
   agenda.
2. **Rehearsal.** After class, the same vocabulary and grammar is drilled
   through eight interchangeable activity types (flashcards, speech,
   cloze, word-building, category-sorting games, dice sentence trainers),
   so repetition never means repeating the same exercise.
3. **Retention.** A spaced-repetition scheduler (1/3/7/14-day ladder)
   resurfaces items as they fall due; three interleaved revision mixes
   recombine material across units.
4. **Visibility.** A teacher view aggregates every learner's pretest
   answers into per-question miss rates — the instructor walks into class
   knowing what the group doesn't know.

The design philosophy is codified in the "Ideal Language Learning Portal"
Blueprint (research synthesis: PRIME framework, Nation's four strands,
DeKeyser's skill acquisition, ICAP, Schmidt's noticing, desirable
difficulties). FluoLingo deliberately implements the Blueprint's strands
3–4 (fluency development + language-focused learning) and delegates
strands 1–2 (meaning-focused input/output) to the classroom.

**One rule governs every screen** (Dan's litmus test, `AGENTS.md`): any
text that can be removed without preventing the user from finding the
correct answer is redundant and must go. Explanations exist, but behind
on-demand WHY buttons — never inline. Decorative visuals are exempt;
progress counters stay.

---

## 2. System overview

```
┌────────────────────────────────────────────────────────────┐
│  Cloudflare Pages  (static hosting, auto-deploy from main) │
│    fluolinguo.com  (+ fluolingo.com when migrated)         │
│                                                            │
│  Next.js 16 static export (`output: "export"`)             │
│    699 pre-rendered pages, zero server code                │
└──────────────┬─────────────────────────────────────────────┘
               │ (only for signed-in / feedback features)
┌──────────────▼─────────────────────────────────────────────┐
│  Firebase project «laf1201» (shared with sibling apps)     │
│    Auth: Google sign-in (optional — site works signed-out) │
│    Firestore: progress sync · telemetry events ·           │
│               feedback · rain hi-scores                    │
└────────────────────────────────────────────────────────────┘
```

- **GitHub `dckg/fluo` → main** is the single source of truth; every merge
  auto-builds and deploys. There is no CMS, no database of content —
  content is code-reviewed JSON/TSX in the repo.
- **The site is fully functional signed-out.** Firebase is additive:
  sign-in unlocks progress persistence/sync and telemetry. The Firestore
  SDK (~167 KB gz) is *dynamically imported* only at the moment a feature
  needs it — it is never in any page's critical path.

## 3. Content architecture — one store, many projections

The Blueprint's core thesis: author content **once**, project it into
**many** activities. FluoLingo's realization:

```
src/content/
  sios/                 50 SIOs (Statements of Intended Outcome) in 5 units
  collections/          46 decks — the canonical vocabulary store
  pretests/             35 authored pretest banks (JSON) mapped to SIOs
  lessons/native/       24 grammar lessons (memo + dice trainer + bonus)
  ateliers.ts           model dialogues for the 6 production SIOs
  *.json                Vocabularain (letris) category sets  ⚠ legacy 2nd store
```

- **SIO** — the pedagogical unit: one can-do statement ("I can order in a
  café"), belonging to a unit, optionally flagged `isProduction`
  (classroom task with a model dialogue instead of drills).
- **Collection (deck)** — a list of items: `fr`, `en`, optional `note`,
  `emoji`, `syllables` (hand-syllabified for Lexicalator), `gap` (cloze
  form for GramMarathon), `nat`, and namespaced `tags` (`col:` sort-column
  axis, `role:` grammatical fragments hidden from flashcards, `region:`).
  **Every activity is a projection of this one file** — a deck edit
  propagates to Flip It, Say It, Complete It, Lexicalator, etc.
- **Readiness predicates** (`src/lib/collections/*Ready.ts`) decide which
  activities a deck can support: `isLexReady` (syllables verified to
  reconcatenate into `fr`), `isGramMarathonReady` (≥4 valid gaps),
  `isConjugaZoneReadyId`, `hasDicePractice`, `getLetrisSet` (rain).
  Launch surfaces render an activity link **only if its predicate
  passes** — this is what guarantees zero dead ends across 50 SIOs.
- **Known deviation:** Vocabularain runs on a *separate* legacy store
  (`src/content/*.json` category sets) — the Blueprint's design-mistake
  #17. Migration to build-time generation from collections is roadmap
  item R8.

## 4. Pages & navigation

| Route | What it is |
|---|---|
| `/` | SioHub — the whole course on one page: Unité 0 panel + 4 unit sections, each SIO a tile opening a popup (SioModal) |
| SIO popup | The learner's home per objective: merged can-do statement, inline pretest (Unit-0 style, instant per-question grading, WHY on wrong answers), 📝 Bring-to-class card, lesson links, activity flaps |
| `/activities` | Practice Index — deck × activity matrix, every filled cell a direct link ("where is everything?") |
| `/practice/{flip-it,say-it,complete-it,dice,conjugazone,grammarathon}/[deckId]` | Drill engines over a deck |
| `/games/{letris,conveyor,matching,directions,weather}/…` | Game engines (Vocabularain, Lexicalator, Match It, Mapless Route Builder, weather mastery cycle) |
| `/lessons/[slug]` | Native grammar lesson: Mémo card + 🎲 dice sentence trainer + EN→FR bonus round |
| `/pretests/[id]` | Standalone pretest page (same bank as the popup quiz) |
| `/reviser` | Interleaved revision mixes |
| `/decks/…` | My-decks area (create/study custom decks, Firestore-backed) |
| `/teacher` | Admin-gated pretest gap report (unlinked; teachers get the URL) |
| `/guide` | Learner tutorial (linked from home navigation) |

Navigation is deliberately shallow: home → popup → activity, with the
Practice Index as the single flat catalogue. Unit tabs (right rail ≥1100px,
burger menu below) scroll the one-page hub.

## 5. Activity engines

All engines share deck data, TTS (`speechSynthesis`, fr-FR, with 🐌 slow
variants), and the progress store. Each targets a different retrieval mode:

- **🃏 Flip It** — flashcards with grouping by article/column axis,
  FR↔EN direction, sorting; fragments (`role:` tags) excluded.
- **🎤 Say It** — pronunciation practice against the browser mic.
- **✏️ Complete It** — typed cloze recall.
- **🎲 Dice trainer** (in lessons + `/practice/dice`) — roll → assemble a
  sentence from the lesson's pattern; three difficulty tiers (easy: pick
  the sentence; medium: pick the gap; hard: type).
- **🎯 ConjugaZone** — conjugation drill (verb-table decks).
- **🏃 GramMarathon** — grammar cloze race over `gap` items (accepts
  elision alternates, e.g. *de* for *d'*).
- **🌧️ Vocabularain (letris)** — falling words sorted into 3–5 category
  columns; pre-round study table; hidden language-sorter leaderboard;
  night mode.
- **🧰 Lexicalator (conveyor)** — syllable-assembly against the clock
  (in-game session lives only — no global hearts).
- **Match It (matching/conveyor)** — FR/EN pair matching, works for any deck.
- **Weather / Mapless Route Builder** — bespoke unit games kept where the
  content demands more than a generic engine (scaffolding-removal mastery
  cycle; form-only route reconstruction).

## 6. Learner state

`src/lib/progress.ts` — one localStorage blob (`fluolingo:progress`):
done SIOs, gems, streak (bumps on any recorded practice — hearts were
removed as a Blueprint anti-pattern), and per-item SRS state on a
1/3/7/14-day ladder.

**Cross-device sync** (`src/lib/firebase/progressSync.ts`): on sign-in,
pull `users/{uid}/app/progress`, merge (union of done SIOs, max
gems/streak, later active day, per-item further-due wins), save locally,
push; thereafter every save pushes debounced (2.5 s). Signed-out learners
lose nothing — the local store is always authoritative on-device.

**Pretest record** (`src/lib/pretestRecord.ts`): last result per item in
localStorage (`fluolingo:pretest.v1`); a later correct answer clears the
miss. Feeds the Bring-to-class card.

## 7. Telemetry & teacher loop

`logEvent()` (`src/lib/firebase/usage.ts`) writes fire-and-forget event
docs for signed-in users: `auth.signin/out`, `deck.open/create`,
`game.start/end`, `flashcard.review`, `pretest.answer` — each stamped
with `uid`, `ts`, `ua`, and `site` (hostname — several sites share the
Firebase project). `/teacher` aggregates `pretest.answer` events
client-side into per-pretest, per-item miss rates with top wrong picks.

Feedback: a floating button on every page posts shape-checked reports
(optionally with a screenshot) to `feedback` — anonymous create allowed,
admin-only read.

## 8. Security model (`firestore.rules`)

Owner-only writes under `users/{uid}` (with an append-only `attempts`
audit log), signed-in create on `events`, admin email allowlist for all
cross-user reads (`/teacher`, feedback triage), shape-checked anonymous
creates for feedback and rain hi-scores, explicit default-deny. The admin
list is duplicated client-side in `/teacher` for UX only — rules remain
the security boundary.

## 9. Build, deploy, verify

- `npx next build` → static export in `out/` (699 pages). No server.
- Cloudflare Pages project (`fluoguo.pages.dev`) builds from `main`;
  custom domain fluolinguo.com (fluolingo.com to be attached at launch).
- Firestore rules deploy separately (console paste or
  `firebase deploy --only firestore:rules`).
- House verification pattern: typecheck → build → headless Chromium
  sweep over the export (clean-URL hosts must serve extensionless paths;
  local python servers need explicit `.html`).

## 10. Known gaps (the honest list)

From the v2 audit (overall 84/100, "release after operational fixes"):
continuous diagnosis is thin (binary correctness; picked distractors
underused), the scheduler is a 4-rung ladder rather than FSRS-grade,
there is no comprehensible-input layer (readers/listening), Vocabularain's
duplicate store (R8), launch-surface unification (R3), aria-live/mute
batch (R7). These are roadmap, not launch blockers — tracked in the audit
report's issue register.
