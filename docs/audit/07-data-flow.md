# 07 — Data flow

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Learner device                                              │
│  localStorage: fluolingo:progress, pretest.v1, prefs…       │
│  UI activities → recordItemResult / markSioDone / economy   │
└───────────────┬─────────────────────────────┬───────────────┘
                │ signed-in sync              │ signed-in telemetry
                ▼                             ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│ Firestore users/{uid}/…  │    │ Firestore events, feedback, │
│  app/progress, srs,      │    │ leaderboard, collections    │
│  responses, sessions,    │    └──────────────┬──────────────┘
│  notes, attempts         │                   │ admin read
└──────────────────────────┘                   ▼
                                   ┌───────────────────────┐
                                   │ /teacher dashboard    │
                                   └───────────────────────┘

Cloudflare Pages Functions (not Next server):
  /api/tutor · /api/tts · /api/compose · /api/correct
```

## Learner progress (local-first)

| Concern | Module | Storage |
|---|---|---|
| Done SIOs, XP, gems, streak, badges, cosmetics, item SRS | `src/lib/progress.ts` | `localStorage` key `fluolingo:progress` |
| Cross-device merge | `src/lib/firebase/progressSync.ts` | `users/{uid}/app/progress` + `leaderboard/{uid}` |
| Layout hook | `ProgressSync` component | Debounced push after local saves |
| Pretest misses | `src/lib/pretestRecord.ts` | Separate local key; clears on later correct |
| DéjàRevu due set | `src/lib/reviser.ts` | Reads `itemSrs` from progress |
| Economy rules | `src/lib/economy.ts` | Levels, multipliers, cosmetics catalogue |

**Merge policy (progressSync):** union of done SIOs; max gems/streak/XP; later active day; per-item further-due wins.

**SRS note:** `src/lib/firebase/srs.ts` exists as synced upgrade path; comments in `progress.ts` state local ladder is current practice path.

## Item-level analytics

| Writer | Module | Destination |
|---|---|---|
| Response log | `src/lib/firebase/responses.ts` | `users/{uid}/responses` (append-only, shape-checked) |
| Activity log helper | `src/lib/firebase/activityLog.ts` | Related session/attempt plumbing |
| Usage events | `src/lib/firebase/usage.ts` | top-level `events` (dynamic Firestore import) |
| Page views | `PageViewTracker` | `page.view` events |
| Feedback | `FeedbackButton` | `feedback` (anonymous create allowed) |

### Event types (`usage.ts`)

`auth.signin/out`, `deck.open/create`, `flashcard.review`, `game.start/end`, `pretest.answer`, `page.view`, `supplement.open/answer`, `tutor.message`, `help.open`, `hint.tap`, `tts.play`, `review.self`.

Signed-out users: **no** event writes (uid required).

## Collections / decks

| Kind | Source | Loader |
|---|---|---|
| Curated | Bundled JSON in `src/content/collections/` | `CURATED` / `loadCollections` merge |
| User decks | Firestore `collections/{id}` | `src/lib/firebase/collections.ts` |
| Schema | `src/lib/collections/schema.ts` | Unified item + `gameConfig` |
| Readiness | `*Ready.ts` under collections | Gates activity links |

## Notes

| Module | Path |
|---|---|
| Deck notes store | `src/lib/notes/store.ts` → `users/{uid}/notes/{deckId}` |

## Edge / API functions (`functions/api/`)

| Endpoint | File | Role |
|---|---|---|
| `/api/tutor` | `tutor.js` | ChaTutor via OpenRouter; needs env key |
| `/api/tts` | `tts.js` | Server TTS path |
| `/api/compose` | `compose.js` | Compose-related backend |
| `/api/correct` | `correct.js` | Correction helper |
| Catch-all | `functions/__/[[path]].js` | Pages Functions plumbing |

These sit **outside** the Next static export; configured on Cloudflare Pages.

## Auth

| Module | Role |
|---|---|
| `src/lib/firebase/client.ts` | App init |
| `src/lib/firebase/auth.ts` | Google sign-in helpers / `useAuthUser` |
| `src/lib/firebase/db.ts` | Firestore instance (split to avoid bundle weight) |
| `src/lib/authConfig.ts` | Auth-related config |
| `src/lib/accountAliases.ts` | Display-name aliases |

## Security model (rules summary)

From `firestore.rules` comments + structure:

- Owner-only writes under `users/{uid}`; append-only `attempts` / `responses`.
- Admin email allowlist (+ `email_verified`) for cross-user reads.
- Shape-checked creates for `events`, `feedback`, leaderboard rows, decks.
- Leaderboard exclusion list for specific emails.
- Default deny.

Client teacher allowlists are **UX only**; rules remain authoritative.
