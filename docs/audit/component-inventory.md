# Component inventory

**Audit date:** 2026-08-05  
**Scope:** Shared UI under `src/components/`, major co-located page modules, and game engines.  
**Constraint:** Documentation only — no redesign proposals.

## Summary

| Area | Count | Location |
|---|---|---|
| Shared chrome / utilities | **26** modules | `src/components/` |
| App co-located page modules | many `*Content.tsx` / hub modules | `src/app/` |
| Game engines | ~25 files | `src/games/` |
| Design-system package / Storybook | **None** | tokens in `globals.css` + CSS variables |

Activity-specific UIs mostly live under `src/app/**` or `src/games/**`, not in `src/components/`.

---

## Shared components (`src/components/`)

### Shell & navigation

| File | Purpose |
|---|---|
| `CahierShell.tsx` (~562 lines) | Primary page shell: flap tabs, ☰ menu, width prefs, deck activity tab helpers, crumb. Also exports readiness helpers (`hasDicePractice`, `deckActivityTabs`, `pretestHrefForDeck`) — chrome mixed with content routing logic. |
| `siteTabs.ts` | `siteTabs()` unit flaps + `toolTabs()` lower tools; `UNIT_ACCENTS`; `tabsWithActive` |
| `BackLink.tsx` | Navigation back affordance |
| `SuiteBanner.tsx` | Cross-suite banner (sibling apps in shared Firebase project) |

### Account / auth / progress

| File | Purpose |
|---|---|
| `AccountButton.tsx` | Sign-in / account chip → profil links |
| `AuthGate.tsx` | Learning-activity Google sign-in wall |
| `ProgressSync.tsx` | Mounted in root layout; syncs local progress ↔ Firestore on auth |
| `PageViewTracker.tsx` | Logs `page.view` events for signed-in users |
| `RankBadge.tsx` | Level / rank badge display |
| `RewardToast.tsx` | XP / reward toast surface |
| `AccentBar.tsx` | Learner-equipped accent colour chrome |

### Overlays & discovery

| File | Purpose |
|---|---|
| `RankingOverlay.tsx` | Classement overlay from top bar (`role="dialog"`) |
| `LeaderboardList.tsx` | Leaderboard rows (Firestore `leaderboard`) |
| `SearchOverlay.tsx` | Global search overlay (`role="dialog"`) |
| `DeckSearch.tsx` | Deck / word search UI |
| `RoadMap.tsx` | Home learning-path snake of SIO nodes |
| `GuideSplash.tsx` | Quick Guide / HELP modal from home |
| `GuideBody.tsx` | Guide page body content |
| `FirstTour.tsx` | First-run / onboarding tour overlay |
| `BetaNotice.tsx` | Beta disclaimer dialog |
| `FeedbackButton.tsx` | Floating feedback reporter → Firestore `feedback` |

### Help, sound, input

| File | Purpose |
|---|---|
| `HelpDot.tsx` | Contextual `?` help; logs `help.open` |
| `StatsHelp.tsx` | Stats explanation popover |
| `SoundControl.tsx` | Global sound mute / control |
| `SpeakZone.tsx` | Tap-to-speak French text zones |
| `KeyNav.tsx` | Site-wide keyboard nav (two-digit SIO jump + spatial arrows) |

### Layout-mounted globals

From `src/app/layout.tsx` (always present):

- `SuiteBanner`, `FeedbackButton`, `BetaNotice`, `ProgressSync`, `PageViewTracker`, `KeyNav`, `AccentBar`, `RewardToast`
- Site footer with analytics disclosure + `/about` link

---

## Major page-local modules (`src/app/`)

These are not in `src/components/` but power primary surfaces.

### Home / unit / SIO

| File | Role |
|---|---|
| `HomeDashboard.tsx` | Hero, stats chips, Continuer CTA, mounts `RoadMap` |
| `UnitSection.tsx` | Unit page body: SIO tiles → `SioModal` |
| `Unit0Panel.tsx` | Unité 0 special panel |
| `UnitActivityPage.tsx` | Deep-link wrapper: open unit + force SIO activity view |
| `SioModal.tsx` | Floating SIO dialog |
| `SioDetail.tsx` | SIO detail body |
| `PretestQuiz.tsx` | Inline pretest |
| `DialoguePlayer.tsx` | Model dialogue playback |
| `MyDecks.tsx` | User deck list fragment |

### Practice / pretest / decks (large client modules)

| File | Approx. lines | Notes |
|---|---|---|
| `practice/flip-it/.../FlipItContent.tsx` | **1380** | Largest UI module |
| `practice/say-it/.../SayItContent.tsx` | ~569 | Speech recognition; `eslint-disable` for `any` |
| `practice/speculearn/.../SpecuLearnContent.tsx` | ~452 | Guess-from-image |
| `pretests/.../PretestContent.tsx` | ~434 | Standalone pretest |
| `pretests/picture/.../PicturePretestContent.tsx` | ~444 | Picture pretest |
| `decks/[id]/DeckContent.tsx` | ~505 | Deck browser |
| `tutor/page.tsx` | ~473 | Tutor UI (+ PDF helpers inline) |
| `practice/ecoutexte/EcouTexte.tsx` | — | Listening mini-text |
| `practice/complete-it/.../CompleteItContent.tsx` | — | Cloze typing |
| `practice/grammarathon/.../GramMarathonContent.tsx` | — | Gap marathon |
| `practice/grammarathon/finale/FinaleContent.tsx` | — | Finale mix |
| `practice/dice/.../PracticeContent.tsx` | — | Dice practice wrapper |
| `moi/MoiContent.tsx` | — | Learner self-analytics |
| `lessons/LessonFlow.tsx` | — | Lire → Débutant → Intermédiaire → Difficile |
| `lessons/NativeLessonView.tsx` | — | Renders native lesson TSX |

### Teacher dashboard modules

| File | Role |
|---|---|
| `teacher/page.tsx` | Auth gate + panel switcher |
| `teacher/data.ts` | Fetch helpers, allowlists, roster |
| `teacher/ui.tsx` | Shared KPIs / tables / sections |
| `teacher/Overview.tsx` | Class KPIs, rhythm, top pages, XP top 10 |
| `teacher/Attendance.tsx` | Day × page unique visitors |
| `teacher/Students.tsx` | Roster + per-learner drilldown |
| `teacher/Activities.tsx` | Games / decks / supplements / flashcards |
| `teacher/Pretests.tsx` | Miss rates + wrong picks |
| `teacher/FeedbackPanel.tsx` | Feedback inbox |
| `teacher/Evidence.tsx` | Within-student learning evidence |

---

## Game engines (`src/games/`)

| Path | Role |
|---|---|
| `letris/LetrisGame.tsx` (~804) | VocabulaRain core |
| `letris/LetrisFlow.tsx` | Pre-round study → game |
| `letris/FlashcardLesson.tsx` (~569) | Pre-game study |
| `letris/sets.ts`, `resolve.ts`, `speech.ts` | Set resolution + TTS helpers |
| `lexicalator/Lexicalator.tsx` (~834) | Syllable assembly |
| `matching/MatchingGame.tsx`, `toMatchingSet.ts` | Pair matching + collection adapter |
| `compose/ComposeGame.tsx`, `ComposeSolo.tsx`, `ComposeDialogue.tsx`, `banks.tsx` | Phrase-bank production |
| `dice/DiceTrainer.tsx`, `DicedPractice.tsx` | Roll / MCQ trainers |
| `numbus/NumBus.tsx` (~993), `NumBusSetup.tsx`, `config.ts`, `frenchNumber.ts` | Hear-and-type numbers |
| `numbourse/NumBourse.tsx` (~566), `frenchNumbers.ts` | Shouted numbers typing |
| `audio/sfx.ts`, `chiptune.ts`, `mute.ts` | Shared SFX / mute |
| `CreditsSplash.tsx` | Shared credits splash |

---

## Patterns observed

1. **Shell-centric** — nearly every page wraps `CahierShell`.
2. **Thin `page.tsx` + fat `*Content.tsx`** — common for dynamic practice/game routes.
3. **Client-heavy** — many surfaces are `"use client"`; interactive state lives in large content modules.
4. **No shared practice shell library** — Flip It / Say It / Complete It / SpecuLearn / etc. repeat similar session/check/next structure independently.
5. **UI libraries** — custom Cahier / Fluo CSS primitives; no shadcn/Radix package dependency observed in `package.json` inventory for this pass (styling is Tailwind 4 + `globals.css`).
6. **French `lang` attributes** — many learning surfaces mark French strings with `lang="fr"`; document root is `lang="fr"` in `layout.tsx`.
