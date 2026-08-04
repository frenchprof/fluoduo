# Route inventory

**Audit date:** 2026-08-05  
**Scope:** What currently exists in the App Router under `src/app/`.  
**Constraint:** Documentation only — no redesign proposals.

## Summary

| Fact | Value |
|---|---|
| Framework routing | Next.js App Router (`src/app/**/page.tsx`) |
| Route count | **44** `page.tsx` files |
| Middleware | **None** (`src/middleware.ts` absent) |
| Deploy model | Static export (`output: "export"` in `next.config.ts`) |
| API routes (Next) | **None** under `src/app/api/` |
| Edge APIs | Cloudflare Pages Functions in `functions/api/` |
| Auth at route layer | Client `AuthGate` + teacher email allowlist (not Next middleware) |

Dynamic segments that need prebuilt HTML use `generateStaticParams` (listed below). User-created Firestore decks cannot be prebuilt, so they use query-param routes (`?id=`).

---

## Chrome / navigation (how routes are reached)

Defined in `src/components/siteTabs.ts` and rendered by `CahierShell`:

| Tier | Entries | Targets |
|---|---|---|
| Unit flaps | Unité 0–4 | `/unit/0` … `/unit/4` |
| Tool flaps | Index, SpecuLearn, ConjugaZone, ÉcouTexte, VocabulaRain, LexicaLater, NumBourse, NumBus, ChaTutor, DéjàRevu, WorDrill, VoixLà | see tables below |
| Top-bar (not flaps) | Home, Classement overlay, Account → Profil / My Progress | `/`, overlay, `/profil`, `/moi` |

`/teacher` is **not** linked from learner chrome.

---

## Top-level learner / shared pages

| URL | File | Role |
|---|---|---|
| `/` | `src/app/page.tsx` | Home dashboard + road map (`HomeDashboard`) |
| `/about` | `src/app/about/page.tsx` | About / privacy chrome |
| `/guide` | `src/app/guide/page.tsx` | Learner guide |
| `/activities` | `src/app/activities/page.tsx` | Practice Index (deck × activity matrix) |
| `/conjugaison` | `src/app/conjugaison/page.tsx` | ConjugaZone verb drill |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | Classement |
| `/reviser` | `src/app/reviser/page.tsx` | DéjàRevu interleaved revision |
| `/tutor` | `src/app/tutor/page.tsx` | ChaTutor AI chat |
| `/tts` | `src/app/tts/page.tsx` | VoixLà TTS tool |
| `/profil` | `src/app/profil/page.tsx` | Economy: level, badges, cosmetics |
| `/moi` | `src/app/moi/page.tsx` | My Progress (learner analytics) |
| `/teacher` | `src/app/teacher/page.tsx` | Teacher analytics dashboard |

---

## Unit / SIO

| URL | File | `generateStaticParams` | Role |
|---|---|---|---|
| `/unit/[unit]` | `src/app/unit/[unit]/page.tsx` | yes | Unit hub (SIO tiles + modal flow) |
| `/sio/[id]` | `src/app/sio/[id]/page.tsx` | yes | Standalone SIO page |

Co-located support (not routes): `UnitSection.tsx`, `Unit0Panel.tsx`, `SioModal.tsx`, `SioDetail.tsx`, `UnitActivityPage.tsx`, `PretestQuiz.tsx`, `DialoguePlayer.tsx`, `sio/[id]/MarkDoneButton.tsx`.

---

## Lessons

| URL | File | `generateStaticParams` | Role |
|---|---|---|---|
| `/lessons/[slug]` | `src/app/lessons/[slug]/page.tsx` | yes | Native / authored lesson slugs |
| `/lessons/deck/[collectionId]` | `src/app/lessons/deck/[collectionId]/page.tsx` | yes | Unified `LessonFlow` for a deck |

Support: `LessonFlow.tsx`, `NativeLessonView.tsx`.

---

## Practice engines

| URL | File | Engine UI | GSP |
|---|---|---|---|
| `/practice/flip-it/[collectionId]` | `…/flip-it/[collectionId]/page.tsx` | `FlipItContent.tsx` (+ `CahierFrame.tsx`) | yes |
| `/practice/say-it/[collectionId]` | `…/say-it/[collectionId]/page.tsx` | `SayItContent.tsx` | yes |
| `/practice/complete-it/[collectionId]` | `…/complete-it/[collectionId]/page.tsx` | `CompleteItContent.tsx` | yes |
| `/practice/dice/[collectionId]` | `…/dice/[collectionId]/page.tsx` | `PracticeContent.tsx` | yes |
| `/practice/grammarathon/[collectionId]` | `…/grammarathon/[collectionId]/page.tsx` | `GramMarathonContent.tsx` | yes |
| `/practice/grammarathon/finale` | `…/grammarathon/finale/page.tsx` | `FinaleContent.tsx` | — |
| `/practice/speculearn` | `…/speculearn/page.tsx` | Gallery | — |
| `/practice/speculearn/[collectionId]` | `…/speculearn/[collectionId]/page.tsx` | `SpecuLearnContent.tsx` | yes |
| `/practice/ecoutexte` | `…/ecoutexte/page.tsx` | `EcouTexte.tsx` | — |
| `/practice/wordrill` | `…/wordrill/page.tsx` | Aggregated Say It across decks | — |

Many practice deep links also wrap through `UnitActivityPage` so the floating SIO modal presentation opens when a SIO owns the deck.

---

## Games

| URL | File | Engine | GSP |
|---|---|---|---|
| `/games/vocabularain` | gallery page | lists letris sets | — |
| `/games/vocabularain/[setId]` | dynamic page | `src/games/letris/*` | yes |
| `/games/lexicalater` | gallery page | LexicaLater decks | — |
| `/games/lexicalater/[deckId]` | dynamic page | `src/games/lexicalator/Lexicalator.tsx` | yes |
| `/games/matching/[collectionId]` | dynamic page | `MatchingGame` (+ adapter) | yes |
| `/games/compose/[bankId]` | dynamic page | Compose solo / dialogue | yes |
| `/games/numbourse` | page | `NumBourse.tsx` | — |
| `/games/numbus` | page | `NumBus.tsx` + setup | — |
| `/hidden/vocabularain` | hidden page | Multilingual cognate sorter; `robots: noindex` | — |

---

## Decks (curated + user)

| URL | File | Notes |
|---|---|---|
| `/decks/new` | `decks/new/page.tsx` | Create / paste importer UI |
| `/decks/[id]` | `decks/[id]/page.tsx` | Curated deck hub (`DeckContent.tsx`); GSP |
| `/decks/[id]/study` | `decks/[id]/study/page.tsx` | Curated study; GSP |
| `/decks/[id]/mcq` | `decks/[id]/mcq/page.tsx` | Curated MCQ; GSP |
| `/decks/view?id=` | `decks/view/page.tsx` | User deck viewer (static-export workaround) |
| `/decks/study?id=` | `decks/study/page.tsx` | User deck study |
| `/decks/mcq?id=` | `decks/mcq/page.tsx` | User deck MCQ |

---

## Pretests

| URL | File | Notes |
|---|---|---|
| `/pretests/[id]` | `pretests/[id]/page.tsx` | Authored pretest banks; GSP |
| `/pretests/picture/[collectionId]` | `pretests/picture/[collectionId]/page.tsx` | Picture pretest variant; GSP |

Inline pretest also runs inside the SIO modal via `PretestQuiz.tsx` (not a separate route).

---

## Cloudflare Pages Functions (not App Router pages)

| Endpoint | File | Role |
|---|---|---|
| `/api/tutor` | `functions/api/tutor.js` | ChaTutor (OpenRouter; env key) |
| `/api/tts` | `functions/api/tts.js` | Server TTS path |
| `/api/compose` | `functions/api/compose.js` | Compose-related backend |
| `/api/correct` | `functions/api/correct.js` | Correction helper |
| catch-all | `functions/__/[[path]].js` | Pages Functions plumbing |

---

## Auth / gating observed at route usage

| Mechanism | Where | Behaviour |
|---|---|---|
| `AuthGate` | Many practice/game/lesson/pretest/tutor/tts/reviser surfaces | Google sign-in wall when `REQUIRE_SIGN_IN === true` (`src/lib/authConfig.ts`) |
| Teacher allowlist | `/teacher` | `ADMIN_EMAILS` / `REVIEWER_EMAILS` in `teacher/data.ts`; Firestore `isAdmin()` is the security boundary |
| Feedback | layout floating button | Intentionally **not** gated |

---

## Route patterns / quirks (as implemented)

1. **Dual deck URLs** — path params for curated; query params for Firestore user decks.
2. **Naming drift** — route `lexicalater` vs module `lexicalator`; product name LexicaLater; VocabulaRain vs engine folder `letris`.
3. **Absorbed drills** — Complete It / dice / GramMarathon keep standalone routes for deep links; Lesson flow also hosts them.
4. **Hidden game** — `/hidden/vocabularain` is a separate letris instance with its own hi-score usage.
5. **Leftover file** — `src/app/page.tsx.orig` exists beside `page.tsx` (not a route).
