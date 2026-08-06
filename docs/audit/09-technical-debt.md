# 09 — Technical debt

Observed signals only — not a prioritised backlog or redesign.

## Large / concentrated modules

| File | ~Lines | Risk |
|---|---|---|
| `FlipItContent.tsx` | 1380 | Hard to test/change; options UI + modes + SRS |
| `NumBus.tsx` | 993 | Game + UI + help in one file |
| `Lexicalator.tsx` | 834 | Same |
| `LetrisGame.tsx` | 804 | Same |
| `Students.tsx` (teacher) | 604 | Dense analytics UI |
| `SayItContent.tsx` | 569 | Speech + grading |
| `FlashcardLesson.tsx` | 569 | Pre-rain study |
| `CahierShell.tsx` | 562 | Shell + activity routing helpers |
| `NumBourse.tsx` | 566 | Parallel number game |
| `DeckContent.tsx` | 505 | Deck browser |
| `ComposeDialogue.tsx` | 499 | Dialogue mode |
| `tutor/page.tsx` | 473 | UI + export concerns co-located |

## Dual content stores

- Collections vs legacy `src/content/*.json` for rain (see `08-duplication.md`).
- Migration scripts exist (`scripts/migrate-collections.mjs`) but legacy files remain.

## Incomplete / deferred paths (from code comments & TODO.md)

| Item | Evidence |
|---|---|
| Firestore SRS sync unwired as primary | `progress.ts` comments vs `firebase/srs.ts` |
| Importer progressive structure unfinished | `TODO.md` §2 still open items |
| TTS fallback hardening | `TODO.md` §5; Web Speech only in `speech.ts` |
| Gamification leagues / freezes (settled design, build last) | `TODO.md` §6 |
| Deprecated pretest explanation field | `pretests/schema.ts` DEPRECATED blob kept for reference |
| Hearts removed but historical comments remain | progress docs |

## eslint-disable hotspots

Multiple `react-hooks/exhaustive-deps` suppressions in games and practice (`LetrisGame`, `NumBus`, `NumBourse`, `Lexicalator`, `FlipItContent`, `FirstTour`, etc.).  
`SayItContent.tsx` disables `@typescript-eslint/no-explicit-any` at file level.

## Static-export constraints

- User deck IDs cannot be filesystem routes → query-param mirrors.
- No Next Route Handlers in `src/`; APIs live in Cloudflare `functions/`.
- Large pre-render surface (many `generateStaticParams` decks × activities).

## Bundle / performance debt (prior audit, still relevant)

From `docs/audit2/audit2-a11y-perf.md` (2026-07-04) and current structure:

- Five font families in root layout.
- Auth/telemetry graph historically pulled Firestore widely; `usage.ts` now **dynamic-imports** Firestore (improvement since earlier audit).
- Heavy client pages still ship large JS for games/drills.

Re-measure not performed in this documentation pass.

## Naming / product identity drift

| Surface | Name |
|---|---|
| npm package | `lang-games` |
| UI / titles | FluOlinGo |
| Repo / docs | Fluoduo / FluoLingo / FluOlinGo mixed |
| Firebase comments | `frenchfluolingo` / `laf1201` suite |

## Dead or niche surfaces

| Surface | Notes |
|---|---|
| `/hidden/vocabularain` | Intentional easter-egg / multilang sorter; noindex |
| Weather/Directions dedicated hubs | Removed per ARCHITECTURE (2026-07-05); compose banks remain |
| Legacy MCQ audit | `docs/audit2/LEGACY_MCQ_AUDIT_2026-07-05.md` — historical |

## Testing gap

`package.json` scripts: `dev`, `build`, `start`, `lint`, `check:textgen` only.  
No unit/e2e test runner configured in package scripts. Quality historically via release audits + manual / Playwright one-offs documented under `docs/audit2/`.

## Type / any debt

File-level `any` allowance in Say It; sporadic suppressions elsewhere. No exhaustive type-debt scan in this pass.
