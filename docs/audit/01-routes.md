# 01 — Routes inventory

All routes are App Router `page.tsx` files under `src/app/`.  
Static export: dynamic segments use `generateStaticParams` where listed.

## Top-level navigation (chrome)

Defined in `src/components/siteTabs.ts`:

| Tier | Entries | Target |
|---|---|---|
| Unit flaps | Unité 0–4 | `/unit/{0..4}` |
| Tool flaps | Index, SpecuLearn, ConjugaZone, ÉcouTexte, VocabulaRain, LexicaLater, NumBourse, NumBus, ChaTutor, DéjàRevu, WorDrill, VoixLà | see table below |
| Top-bar icons (not flaps) | Home, Classement, Account → Profil / My Progress | `/`, overlay, `/profil`, `/moi` |

Teacher route `/teacher` is **not** in learner navigation.

---

## Static / simple pages

| Route | File | Role |
|---|---|---|
| `/` | `src/app/page.tsx` | Home dashboard + road map |
| `/about` | `src/app/about/page.tsx` | About / privacy chrome |
| `/guide` | `src/app/guide/page.tsx` | Learner guide |
| `/activities` | `src/app/activities/page.tsx` | Practice Index (deck × activity matrix) |
| `/conjugaison` | `src/app/conjugaison/page.tsx` | ConjugaZone verb drill |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | Classement |
| `/reviser` | `src/app/reviser/page.tsx` | DéjàRevu interleaved revision |
| `/tutor` | `src/app/tutor/page.tsx` | ChaTutor AI chat |
| `/tts` | `src/app/tts/page.tsx` | VoixLà TTS tool |
| `/profil` | `src/app/profil/page.tsx` | Economy: level, badges, cosmetics |
| `/moi` | `src/app/moi/page.tsx` | My Progress analytics for learner |
| `/teacher` | `src/app/teacher/page.tsx` | Admin teacher dashboard |

---

## Unit / SIO

| Route | File | `generateStaticParams` | Role |
|---|---|---|---|
| `/unit/[unit]` | `src/app/unit/[unit]/page.tsx` | yes | Unit hub (SIO tiles + modal flow) |
| `/sio/[id]` | `src/app/sio/[id]/page.tsx` | yes | Standalone SIO page |

Co-located support: `UnitSection.tsx`, `Unit0Panel.tsx`, `SioModal.tsx`, `SioDetail.tsx`, `UnitActivityPage.tsx`, `PretestQuiz.tsx`, `DialoguePlayer.tsx`, `MarkDoneButton.tsx`.

---

## Lessons

| Route | File | Notes |
|---|---|---|
| `/lessons/[slug]` | `src/app/lessons/[slug]/page.tsx` | Native / authored lesson slugs |
| `/lessons/deck/[collectionId]` | `src/app/lessons/deck/[collectionId]/page.tsx` | Unified LessonFlow for any deck |

Support: `LessonFlow.tsx`, `NativeLessonView.tsx`.

---

## Practice engines

| Route | File | Engine UI |
|---|---|---|
| `/practice/flip-it/[collectionId]` | `…/flip-it/[collectionId]/page.tsx` | `FlipItContent.tsx` (+ `CahierFrame.tsx`) |
| `/practice/say-it/[collectionId]` | `…/say-it/[collectionId]/page.tsx` | `SayItContent.tsx` |
| `/practice/complete-it/[collectionId]` | `…/complete-it/[collectionId]/page.tsx` | `CompleteItContent.tsx` |
| `/practice/dice/[collectionId]` | `…/dice/[collectionId]/page.tsx` | `PracticeContent.tsx` → dice games |
| `/practice/grammarathon/[collectionId]` | `…/grammarathon/[collectionId]/page.tsx` | `GramMarathonContent.tsx` |
| `/practice/grammarathon/finale` | `…/grammarathon/finale/page.tsx` | `FinaleContent.tsx` |
| `/practice/speculearn` | `…/speculearn/page.tsx` | Gallery |
| `/practice/speculearn/[collectionId]` | `…/speculearn/[collectionId]/page.tsx` | `SpecuLearnContent.tsx` |
| `/practice/ecoutexte` | `…/ecoutexte/page.tsx` | `EcouTexte.tsx` listening |
| `/practice/wordrill` | `…/wordrill/page.tsx` | Aggregated Say It across decks |

Many practice routes wrap through `UnitActivityPage` so deep links open the floating SIO modal presentation when a SIO owns the deck.

---

## Games

| Route | File | Engine |
|---|---|---|
| `/games/vocabularain` | gallery | lists letris sets |
| `/games/vocabularain/[setId]` | dynamic | `src/games/letris/*` |
| `/games/lexicalater` | gallery | spelling: **lexicalater** (route) vs **lexicalator** (module) |
| `/games/lexicalater/[deckId]` | dynamic | `src/games/lexicalator/Lexicalator.tsx` |
| `/games/matching/[collectionId]` | dynamic | `MatchingContent` → `MatchingGame` |
| `/games/compose/[bankId]` | dynamic | Compose solo / dialogue |
| `/games/numbourse` | page | `NumBourse.tsx` |
| `/games/numbus` | page | `NumBus.tsx` + setup |
| `/hidden/vocabularain` | hidden | Multilingual cognate sorter + hi-scores; `robots: noindex` |

---

## Decks (curated + user)

| Route | File | Notes |
|---|---|---|
| `/decks/new` | create deck UI | Importer / paste path |
| `/decks/[id]` | curated static ids | `DeckContent.tsx` |
| `/decks/[id]/study` | curated study | `study/Content.tsx` |
| `/decks/[id]/mcq` | curated MCQ | `mcq/Content.tsx` |
| `/decks/view?id=` | query-param viewer | User decks (static export workaround) |
| `/decks/study?id=` | query-param study | Same pattern |
| `/decks/mcq?id=` | query-param MCQ | Same pattern |

Home also surfaces `MyDecks.tsx` (co-located under `src/app/`).

---

## Pretests

| Route | File | Notes |
|---|---|---|
| `/pretests/[id]` | `PretestContent.tsx` | Authored pretest banks |
| `/pretests/picture/[collectionId]` | `PicturePretestContent.tsx` | Picture pretest variant |

Inline pretest also runs inside SIO modal via `PretestQuiz.tsx`.

---

## Route patterns / quirks

1. **Dual deck URLs** — path params for curated; query params for Firestore user decks.
2. **Naming drift** — `/games/lexicalater` vs `src/games/lexicalator/`; Vocabularain vs VocabulaRain vs letris.
3. **Absorbed drills** — Complete It / dice / GramMarathon still have routes for deep links but Lesson flow also hosts them (`docs/ARCHITECTURE.md` §5).
4. **Hidden game** — `/hidden/vocabularain` is a separate letris instance with its own Firestore hi-score collection usage in `VocabularainClient.tsx`.
