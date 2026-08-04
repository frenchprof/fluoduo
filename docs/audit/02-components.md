# 02 — Shared component library (`src/components/`)

These modules are the cross-route chrome and utilities. Activity-specific UIs mostly live under `src/app/**` or `src/games/**` (not here).

| File | Purpose (from exports / comments) |
|---|---|
| `CahierShell.tsx` | Primary page shell: flap tabs, ☰ menu, width prefs, deck activity tab helpers, crumb |
| `siteTabs.ts` | `siteTabs()` unit flaps + `toolTabs()` lower tools; `UNIT_ACCENTS` |
| `SuiteBanner.tsx` | Cross-suite banner (sibling apps in shared Firebase project) |
| `AccentBar.tsx` | Learner-equipped accent colour chrome |
| `AccountButton.tsx` | Sign-in / account chip → profil links |
| `AuthGate.tsx` | Optional auth gate wrapper for restricted surfaces |
| `BackLink.tsx` | Navigation back affordance |
| `BetaNotice.tsx` | Beta disclaimer toast / notice |
| `FeedbackButton.tsx` | Floating feedback reporter → Firestore `feedback` |
| `ProgressSync.tsx` | Mounted in root layout; syncs local progress ↔ Firestore on auth |
| `PageViewTracker.tsx` | Logs `page.view` events for signed-in users |
| `KeyNav.tsx` | Global keyboard navigation helper |
| `RewardToast.tsx` | XP / reward toast surface |
| `RoadMap.tsx` | Home learning-path snake of SIO nodes |
| `RankBadge.tsx` | Level / rank badge display |
| `RankingOverlay.tsx` | Classement overlay from top bar |
| `LeaderboardList.tsx` | Leaderboard rows (Firestore `leaderboard`) |
| `SearchOverlay.tsx` | Global search overlay |
| `DeckSearch.tsx` | Deck search UI (Index / library) |
| `SoundControl.tsx` | Global sound mute / control popover |
| `SpeakZone.tsx` | Speech / mic practice wrapper |
| `HelpDot.tsx` | Contextual `?` help; logs `help.open` |
| `StatsHelp.tsx` | Stats explanation popover |
| `GuideBody.tsx` | Guide page body content |
| `GuideSplash.tsx` | Quick Guide modal from home |
| `FirstTour.tsx` | First-run / onboarding tour overlay |

## Layout-mounted globals

From `src/app/layout.tsx` (always present):

- `SuiteBanner`, `FeedbackButton`, `BetaNotice`, `ProgressSync`, `PageViewTracker`, `KeyNav`, `AccentBar`, `RewardToast`
- Site footer with analytics disclosure + `/about` link

## Observations

- **Shell-centric design** — nearly every page wraps `CahierShell`.
- **Not a design-system package** — no Storybook / component docs; tokens live in `globals.css` + CSS variables.
- **Activity UIs are page-local** — Flip It, Say It, SpecuLearn, etc. are large co-located `*Content.tsx` files, not shared library components.
- **`CahierShell` is overloaded** — also exports readiness helpers (`hasDicePractice`, `deckActivityTabs`, `pretestHrefForDeck`), mixing chrome with content routing logic (~562 lines).
