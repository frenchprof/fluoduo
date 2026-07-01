# FLUOLINGO — TODO / Build Plan

_Last updated: 22 June 2026. Owner: Dr Daniel Chan._

This file is the single source of truth for the "universal tagged collections + Duolingo-style
learner layer" initiative. Design decisions below are **settled** unless re-opened explicitly.

---

## 0. North star

One deck, authored once, is the single source of truth. Every game (Letris, Matching, gapfill,
MCQ, directions, flashcards) is a **view** over the same collections, filtered by tag and by
per-item game eligibility. Nothing is maintained twice.

---

## 1. Data layer  _(build first — everything depends on it)_  — BUILT (typecheck-clean)

- [x] **Unified item schema** (`src/lib/collections/schema.ts`) — replaces per-game JSON shapes.
      `{ id, fr, en, ipa?, audioUrl?, example?, pos?, gender?, emoji?, tags[], eligible[] }`.
- [x] **Collection wrapper** + per-collection `gameConfig` (Letris columns / Matching pairs).
- [x] **Eligibility validator** baked into `scripts/migrate-collections.mjs`; six legacy decks
      migrated into `src/content/collections/*.json`.
- [x] **Firestore** wired (project `frenchfluolingo`). Curated = bundled JSON (0 reads);
      user decks / SRS / events = Firestore. Single `loadCollections()` merges both.
- [x] **Google sign-in** + usage-event logging (`auth.ts`, `usage.ts`).
- [ ] **Dan's manual Firebase steps** — see FIREBASE_SETUP.md (enable Google auth, create
      Firestore, deploy `firestore.rules`).
- [ ] Seed any curated decks into Firestore? NO — kept bundled by design (Spark economy).

## 2. Importer  _(unblocks all content authoring)_  — FLEXIBLE PATH chosen

- [ ] In-app "New deck" screen. **Bulk paste** is the default path: `fr [tab] en [tab] tags`
      per line. Reuse the numbered-step + localStorage-retention pattern from the HSSR survey UI.
- [ ] **Progressive structure** (the broader/flexible option Dan chose): plain paste fully
      equips flashcards / MCQ / gapfill. Extra steps appear ONLY when the author toggles a
      structural game on:
        - Letris → bin-assignment step (assign each item to a grammatical bin + label/prefix).
        - Matching → pair-builder step (define the valid-completions graph). This is the one
          genuinely tricky editor; keep it behind the toggle so it never bloats the simple path.
      Available to students too, not admin-only.
- [ ] **Live eligibility preview**: a table showing what each pasted row will be eligible for,
      *before* save.
- [ ] Curated decks go through the same validator with a human approval gate before going live.
- [ ] CSV upload = nice-to-have on top of paste, not instead of it.

### Structural finding (drives the schema — see §1)
The six legacy files are TWO shapes, and the vocabulary unifies but the game STRUCTURE does not:
- Letris carries grammatical bins + sentence `prefix` (for `buildSentence()`/TTS) — structural.
- Matching (`directions`) is RELATIONAL: `lefts` / `rights` / `validLefts[]` graph — cannot be
  expressed as flat tags. Carried as explicit per-collection `gameConfig.matching.pairs`.
Resolution: two-tier model — flat shared **items** + thin per-collection **gameConfig** that
games needing structure read, and games that don't simply ignore.

## 3. Flashcard module  _(canonical view of a deck)_

- [ ] Flip FR↔EN on tap; FR→EN and EN→FR direction toggle.
- [ ] Optional third layer (example / IPA) on long-press.
- [ ] TTS on every card (see §5 — harden, don't add).
- [ ] SRS state per user, **synced** to Firestore (not local-only — students have accounts).
- [ ] Mastery rings per deck (bronze→gold), surfaced from SRS — the "crowns" idea.
- [ ] Immediate sensory feedback (sound + confetti), instant.

## 4. Wire one game as pipeline proof  — DONE (Matching, lossless-verified)

- [x] **Matching** now sources its deck from the collection layer via `toMatchingSet()` adapter
      (`src/games/matching/toMatchingSet.ts`); page rewired to read `CURATED` instead of raw JSON.
      Round-trip verified lossless: 15/15 valid pairs, 8 lefts, 13 rights identical to source.
      Game component unchanged. Old `directions-matching.json` can retire once all games migrate.
- [ ] Roll the same loader/adapter pattern out to Letris (and the rest), then delete legacy
      per-game JSON. Letris adapter: Collection → LetrisSet (items+`col:` tags → tiles+categories).
- [ ] Swap the static `CURATED` import for async `loadCollections()` once user-created decks exist
      (page becomes a client component; adapter + game stay the same).

### Letris game mechanics — SALVAGE rule (confirmed 22 Jun)
Only wrong drops stack on the board; fall speed rises over time → eventually a column tops out
= game over. SALVAGE: three same-colour (same-category) tiles **clear** (Tetris-style), freeing
column space. Purpose is purely to **delay game-over** — NOT a scoring or lives mechanic. Cleared
tiles vanish; no life refund, no points. Assumed: three **contiguous** in a column (confirm if
scattered-also-counts). Lives in `LetrisGame.tsx` (game-update phase), independent of data layer.

## 5. TTS — HARDEN (not absent!)

> Correction to an earlier assumption: TTS is **already wired** via `src/games/letris/speech.ts`
> (`speak()` + `buildSentence()`), imported by Letris, FlashcardLesson, Matching, Directions, and
> all three Weather games. The gap is robustness, not existence.

- [ ] `speak()` is bare Web Speech API with **no fallback** → silent failure / wrong-language
      voice on devices lacking a French voice (mobile Safari, some Android). Add a
      ResponsiveVoice (or pre-rendered audio-file) fallback.
- [ ] Ensure the unified item schema carries the `prefix` / `displayName` fields that
      `buildSentence()` relies on, so the speak path stays consistent post-migration.
- [ ] Consider pre-baking `ipa` with the existing phonemizer pipeline for display + voice tuning.

## 6. Gamification / learner layer  _(build LAST, against live XP)_

**All decisions below are SETTLED.**

| Decision | Resolution |
|---|---|
| Streak multiplier cap | ×3, reached at 7-day streak (3–4d ×1.5, 5–6d ×2.0, 7+ ×3.0) |
| Multiplier scope | **Personal XP only** |
| Post-cap streak rewards | Flat +50 to **personal** XP on 7-day completion; badges + freeze unlocks at 14/30/60 days |
| Streak freeze | **Auto-consume** on a missed day; learner notified *after* the fact, never pre-prompted |
| Leaderboard XP | **Raw content XP only** — no multiplier, no attendance bonus |
| League structure | **Persistent** weekly tiers: Gold / Silver / Bronze |
| Tier sizing | Percentage-based (15 / 35 / 50 of weekly actives), with an absolute floor (≥5) per tier |
| Promotion/relegation | Top/bottom % of each persistent pool, resolved Sunday evening |

Build-time reconciliation (tracked, not a pending decision): promote/relegate counts are clamped
to hold tier sizes near their target percentages so Gold doesn't bloat over weeks; absolute floor
takes precedence in thin-activity weeks.

**Taken from Duolingo (gameful):** bite-sized loop, instant sensory feedback, visible skill-tree
progression, mastery rings, one-deck-many-exercise-types, French character/delight, leagues.
**Refused (coercive gamification):** hearts/lives lockout, nagging streak notifications.
Leaderboards kept — but tiered leagues so the bottom isn't crushed.

---

## Open inputs still needed from Dan

- [x] **RESOLVED 22 Jun:** Canonical *Atelier A1* Unité 3 = "On va où cet été ?" (p.92).
      Sit.1 météo (weather) · Sit.2 S'informer sur une ville = lieux + prépositions (two ordered
      sub-groups) · Sit.3 directions. countries-letris = legit Unit 3 grammar (prép. devant
      villes/pays), tied to Sit.1 travel framing. Unit lexique order: météo → ordinaux → lieux →
      prépositions → transports → `seq` index per collection. Within-box tile order: sequence by
      existing logical grouping, Dan spot-corrects (manuel pp.46–50 would close it word-for-word).
- [x] **RESOLVED:** `langPair` = `"fr-en"` for now (metadata label; both study directions
      supported via the flashcard direction toggle, independent of this field).
- [ ] Eyeball the proposed tag taxonomy before migration bakes it in.
