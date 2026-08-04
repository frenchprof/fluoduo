# 03 — Page modules under `src/app/`

Co-located (non-`page.tsx`) modules that power major surfaces.

## Home / hub

| File | Lines (approx.) | Role |
|---|---|---|
| `HomeDashboard.tsx` | ~280 | Hero, stats chips, Continuer CTA, mounts `RoadMap` |
| `UnitSection.tsx` | — | Unit page body: SIO tiles, opens `SioModal` |
| `Unit0Panel.tsx` | — | Unité 0 special panel |
| `UnitActivityPage.tsx` | ~45 | Deep-link wrapper: open unit + force SIO activity view |
| `SioModal.tsx` | — | Floating SIO dialog (pretest, lessons, activity flaps) |
| `SioDetail.tsx` | — | SIO detail body |
| `PretestQuiz.tsx` | — | Inline pretest inside modal / unit flow |
| `DialoguePlayer.tsx` | — | Model dialogue playback for production SIOs |
| `MyDecks.tsx` | — | User deck list / library fragment |

## Teacher (`src/app/teacher/`)

| File | Role |
|---|---|
| `page.tsx` | Auth gate + panel switcher |
| `data.ts` | Event/leaderboard fetch, roster build, student detail loaders |
| `ui.tsx` | Shared tables, KPIs, section chrome |
| `Overview.tsx` | Class KPIs, rhythm, top pages, XP top 10 |
| `Attendance.tsx` | Day × page unique visitors |
| `Students.tsx` | Roster + per-learner drilldown (~604 lines) |
| `Activities.tsx` | Games / decks / supplements / flashcards from events |
| `Pretests.tsx` | Gap report: miss rates + wrong picks |
| `FeedbackPanel.tsx` | Feedback inbox triage |
| `Evidence.tsx` | Within-student learning evidence analyses |

## Practice / pretest content modules (large)

| File | Lines (approx.) | Notes |
|---|---|---|
| `practice/flip-it/.../FlipItContent.tsx` | **1380** | Largest UI module in repo |
| `practice/say-it/.../SayItContent.tsx` | 569 | Speech recognition drill |
| `practice/speculearn/.../SpecuLearnContent.tsx` | 452 | Guess-from-image / speculation |
| `pretests/.../PretestContent.tsx` | 434 | Standalone pretest |
| `pretests/picture/.../PicturePretestContent.tsx` | 444 | Picture pretest |
| `decks/[id]/DeckContent.tsx` | 505 | Deck browser |
| `tutor/page.tsx` | 473 | Tutor UI + PDF export helpers inline |
| `practice/ecoutexte/EcouTexte.tsx` | — | Listening mini-text |
| `practice/complete-it/.../CompleteItContent.tsx` | — | Cloze typing |
| `practice/grammarathon/.../GramMarathonContent.tsx` | — | Gap grammar marathon |
| `practice/grammarathon/finale/FinaleContent.tsx` | — | Finale mix |
| `practice/dice/.../PracticeContent.tsx` | — | Dice practice wrapper |
| `moi/MoiContent.tsx` | — | Learner self-analytics |
| `lessons/LessonFlow.tsx` | — | Unified Lire → Débutant → Intermédiaire → Difficile |
| `lessons/NativeLessonView.tsx` | — | Renders native lesson TSX |

## Pattern: thin `page.tsx` + fat `*Content.tsx`

Most dynamic practice/game routes:

1. Server or client `page.tsx` resolves params / `generateStaticParams`.
2. Optionally wraps `UnitActivityPage` for floating presentation.
3. Delegates interaction to a large client `*Content.tsx`.

This pattern repeats across Flip It, Say It, Complete It, SpecuLearn, Matching, Pretests, Decks study/MCQ.
