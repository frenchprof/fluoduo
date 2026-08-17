# HANDOFF — FluoLingo (read me first)

> **⚠️ HISTORICAL. Read `docs/STATUS.md` first — it is the only current source of truth (17 Aug 2026). This file is kept for the reasoning behind decisions, not for what is left to do.**

_Updated 28 Jun 2026. Replaces the old data-layer-only handoff (that content is now §7 below)._

This is the **start-here** doc for a fresh Claude Code session. Your persistent **memory**
(`~/.claude/.../memory/MEMORY.md` + the `fluolingo_*` / `laf1201_*` files) auto-loads and holds
the settled design decisions — skim it. This doc ties memory + docs + code together and says
what's next.

**Golden rule: WIRE INTO the existing app — do NOT rebuild from scratch.**

---

## 1. What this is
**FluoLingo** = a Next.js (16, Turbopack, App Router) French A1 portal for NUS **LAF1201**
(Atelier "Quatre à Paris"). Run: `cd /Users/keijidan/projects/lang-games && npm run dev`
→ http://localhost:3000.

Separate app: `/Users/keijidan/deploy/laf1201/` = legacy standalone **MCQ-only pretest** (live,
auth-gated). Rebuild it with `cd /Users/keijidan/deploy/laf1201 && node build-standalone.mjs`.
The MCQ-only strip lives in `pre-lesson-shared.js` (`_stripNonMcqExercises`, reversible). Memory:
`laf1201-standalone-mcq-only`.

## 2. Content source of truth
- **`docs/handoff/LAF1201_SIOs_Flashcards_v9.{xlsx,csv}`** — finalized 50-SIO spec, one deck per
  SIO (columns Front / Back / Overview / Letris). **This governs deck structure.**
- **`docs/handoff/vocab_lists.json`** — locked item lists + open ones.
- **`docs/handoff/README.md`** — guard-rails + locked/open status.
- Memory: `laf1201-flashcard-spec-v9`.

**Grammar guard-rails (enforce in every deck):** present + futur proche only (aller/pouvoir/
devoir/falloir + inf); **NO imperative except SIO-008** (classroom instructions) — directions/
itinerary use "à gauche / il faut + inf / on + present", NOT Tournez/Allez/Prenez; no passé
composé/imparfait/conditionnel; "je voudrais / j'aimerais" allowed as fixed politeness.

My own design docs (secondary to v9 where they differ): `docs/PRETEST_BLUEPRINT.md`,
`docs/LESSON_PLAN.md` (book-ordered, # column), `docs/FLASHCARD_CONTENT.md` (U0+U1 authored;
U2–U4 inventory only), `docs/FluoLingo-Lesson-Plan.xlsx`.

## 3. State of play — BUILT & browser-verified this session
- **Skin** — foolscap ruled paper + highlighter in `src/app/globals.css` (`.fluo-surface`,
  `.fluo-hl`, `.fluo-btn*`, `.fluo-serif/.fluo-mono/.fluo-label`, `.fluo-card`). On home, Flip It,
  deck builder. Memory: `fluolingo-skin`.
- **Home = two zones** — `src/app/page.tsx` + `src/app/ZonedLessons.tsx`: toggle **Pretest Zone**
  (MCQ only) vs **Practice Zone** (10 ICAP activities, no MCQ) over one Unit→Lesson spine;
  per-deck activity chips (Flip It + Classify It live, others "· soon"); "Apps & Games" retired;
  "coming soon" pruned to Arrange It. Memory: `fluolingo-zones`, `fluolingo-pre-post-architecture`.
- **Flip It** — `src/app/practice/flip-it/[collectionId]/page.tsx`: Cards / See All / Table;
  buckets Reviewed·To-Review (default to-review) in `src/lib/practice/buckets.ts`; filter pills;
  multi-select (pick column + ▣); order Shuffle/A-Z/Z-A/By article/By continent; notes in
  `src/lib/notes/store.ts` (local-first + once-daily Firebase sync, 50-grapheme cap via
  Intl.Segmenter); nationalities 4-form card variant; ∅ marker for no-article.
- **Letris = match-3 colour mechanic** — `src/games/letris/LetrisGame.tsx` + `resolve.ts` (pure
  clear logic, unit-tested 6/6). Bases coloured; tile colour hidden until landing; clear runs of
  3+ same colour (base anchors, never vanishes); recover a wrong drop by repeating ×3; no lives,
  top-out = game over. ⚠️ Letris reads **legacy `@/content/*-letris.json`** (categories/tiles),
  NOT `collections/` — edit BOTH copies when changing a deck. Registry: `src/games/letris/sets.ts`.
- **Deck builder** — `src/app/decks/new/page.tsx`: both-sides editor, 4 fields/side, Tab crosses
  to the flip side; builds Flip-It items + letris gameConfig (≥2 article columns).
- **Decks** (`src/content/collections/*.json`, registered in `index.ts`): countries (39, dup
  Turquie removed, region tags), nationalities (18, `nat` field), languages (19, NO article),
  weather, attractions, directions, place-preps (cols WITHOUT de / WITH de; old loin-letris
  removed). `Item.nat {ms,fs,mp,fp}` added in `src/lib/collections/schema.ts`.
- **Config** — `next.config.ts` has `allowedDevOrigins` for LAN/phone testing (needs dev restart).

## 4. SPEC'd but NOT yet built
- **Flip It revisions** (full list in memory `fluolingo-zones`): mode order → Overview→Cards→All
  Cards, start on Overview; "hide column" = per-cell click-to-reveal (revert full-hide); PICK+DECK
  never hideable; A-Z sorts by the language currently showing; FILTERS row = label→custom→reviewed
  →to-review→**Subsets of (N)**; **nationalities Overview is on the wrong dataset — fix**; per-lesson
  front/reverse framing text (countries "C'est quel pays?"/"Le pays, c'est…"; nationalities m.sg
  ending + "View in Full" split-reveal); nationalities Letris v1 (endings) / v2 (agreement).
- **Other activities**: Say It, Complete It, Translate It, Arrange It, Rewrite It, Correct It,
  Role-play It (only Flip It + Classify It exist). Suggested first: **Complete It**.
- **Pretest MCQ engine** — cold guess + mandatory feedback, rule revealed AFTER. Memory:
  `fluolingo-pretest-pretesting-effect`.
- **U2–U4 flashcard content** still to author (`docs/FLASHCARD_CONTENT.md`), then build decks.
- **Firebase sync for buckets** (notes already have it).

## 5. IMMEDIATE NEXT — 5 open decisions (v9 reconciliation, awaiting Dan)
1. **Numbering** — adopt spec IDs and renumber repo decks (countries→1.05, nationalities→1.06,
   languages→1.07, weather→3.01…)? Repo currently uses 6/7/10 + U3 7/8/9. Spec is final → likely yes.
2. **Directions** — fix the deck to drop imperatives → "à gauche / il faut + inf" (guard-rail).
3. **Countries/nat/lang** — 39-country list is in `countries-letris.json`; derive article +
   preposition + 4 nationality forms + language for all 39, rebuild those 3 decks (Dan validates).
4. **Food** (4.01/4.03) — full ~55 items (in vocab_lists.json) or a subset?
5. **Commerces** (4.07) — confirm shop ↔ "chez le marchand" pairing.

**Locked & buildable NOW (no decision needed):** simple nouns (SIO 0.07, 15, un/une/des),
everyday objects (2.01, 14, un/une/des), transport Letris (3.08, en vs à) — all in
`vocab_lists.json`. Offered to start these in one pass while 1–5 settle.

## 6. Gotchas
- **`AGENTS.md`**: this Next.js (16) has breaking changes — read `node_modules/next/dist/docs/`
  before writing Next code. (`params` is a Promise → `use(params)`; `allowedDevOrigins`; etc.)
- **Two data copies for Letris decks** (legacy `@/content/*-letris.json` + v2 `collections/`) —
  keep in sync.
- **Google Fonts via `next/font/google` fail offline** — if a build error mentions Geist/fonts,
  swap to system-font CSS vars.
- **Firebase** (`frenchfluolingo`) needs Google sign-in for saving/sync; all local-first features
  work without it. `firestore.rules` deployed; owner-only `users/{uid}/{document=**}` covers
  notes+buckets without rule changes.
- **Verify in the browser** via the preview tools (start server → navigate → snapshot/screenshot);
  don't ask the user to check manually. Typecheck with `npx tsc --noEmit`.
- Don't reintroduce **"Apps & Games"** (→ Practice Zone) or **MCQ in the Practice Zone**.

## 7. Data layer (built earlier, still true — was the old handoff)
- Unified schema `src/lib/collections/schema.ts`; six legacy decks migrated to
  `src/content/collections/*.json` (`scripts/migrate-collections.mjs`).
- Firebase auth + Firestore CRUD + SRS + telemetry in `src/lib/firebase/*`; single read path
  `loadCollections()` (curated bundled = 0 reads; user decks/SRS/events in Firestore).
- Matching game via `src/games/matching/toMatchingSet.ts` (lossless). `firestore.rules` deployed.
- Two-tier model: flat tagged `items` + thin per-collection `gameConfig` (Letris columns /
  Matching pairs). Parallel tags (`unit/sit/sub/theme` + reserved `col:`/`role:`). Gamification
  spec settled in `TODO.md §6` (build last). `npm install firebase` if it's ever missing.
