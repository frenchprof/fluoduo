# Teacher pages

**Audit date:** 2026-08-05  
**Scope:** Teacher / admin analytics surfaces that currently exist.  
**Constraint:** Documentation only — no redesign proposals.

## Summary

| Fact | Value |
|---|---|
| Primary route | **`/teacher`** only (`src/app/teacher/page.tsx`) |
| Linked from learner chrome | **No** — teachers receive the URL |
| Shell | `CahierShell` with site unit tabs; crumb `🧑‍🏫 Teacher` |
| Client gate | Google sign-in + email allowlists |
| Security boundary | Firestore `isAdmin()` in `firestore.rules` |
| Panel count | **6** switchable panels (+ `Evidence` helper in student contexts) |

There is no separate teacher App Router tree beyond `/teacher`. All panels are client modules co-located under `src/app/teacher/`.

---

## Access control (as implemented)

| Role | How determined | Capability |
|---|---|---|
| Admin | `ADMIN_EMAILS` in `teacher/data.ts` (+ rules) | Full view + write actions (e.g. mark feedback done) |
| Reviewer | `REVIEWER_EMAILS` in `teacher/data.ts` | Full read view; `canWrite={false}` |
| Other signed-in | not on allowlists | “Teachers only” UI + sign-in button |
| Signed-out | `useAuthUser() === null` | Prompt to Continue with Google |
| Auth resolving | `user === undefined` | “Loading…” |

Comments in `page.tsx` state explicitly: the email gate is **UX**, not security; Firestore rules restrict admin reads.

---

## Panels

Switched via in-page tabs (`PANELS` constant in `page.tsx`):

| Key | Module | What it shows today |
|---|---|---|
| `overview` | `Overview.tsx` | Class KPIs, day-by-day rhythm, top pages, XP top 10; day drill modal |
| `attendance` | `Attendance.tsx` | Day × page → unique visitors with names (from `page.view` + supplements) |
| `students` | `Students.tsx` | Roster → progress economy, SRS, sessions, responses, event trail; learner dialog |
| `activities` | `Activities.tsx` | Games / decks / supplements / flashcard reviews / tutor volume |
| `pretests` | `Pretests.tsx` | Per-item miss rates + top wrong picks (`pretest.answer` events) |
| `feedback` | `FeedbackPanel.tsx` | Bug-report inbox; admins can mark done; screenshot preview when attached |

### Evidence helper

| Module | Role |
|---|---|
| `Evidence.tsx` | Within-student analyses: first vs later accuracy, errors conquered, marathon trajectory; CSV-style export rows |

Loaded in student/evidence contexts (not a top-level panel key).

### Shared teacher UI

| Module | Role |
|---|---|
| `ui.tsx` | `Kpi`, `TableBox`, `Section`, sortable section primitives |
| `data.ts` | Event/leaderboard fetch, roster build, student detail loaders, allowlists, `EVENT_FETCH_CAP` |

---

## Data sources (teacher)

Fetched once at dashboard root where possible (`page.tsx` comments); per-student stores load lazily on drilldown:

| Source | Collection / path | Consumers |
|---|---|---|
| Events stream | `events` (capped fetch) | Overview, Attendance, Activities, Pretests, Students trail |
| Leaderboard | `leaderboard` | Overview XP top 10, roster enrichment |
| Per-user progress | `users/{uid}/app/progress` | Students drilldown |
| Sessions | `users/{uid}/sessions` | Time-on-task |
| Responses | `users/{uid}/responses` | Item-level analytics / Evidence |
| Attempts count | `users/{uid}/attempts` | Volume signal |
| Feedback | `feedback` | FeedbackPanel |

Signed-out learners generate **no** usage events (uid required in `usage.ts`), so teacher analytics reflect signed-in activity.

---

## UX behaviours present in code

- Toggle to **include teacher accounts** in analytics (default excluded) for “is it recording?” checks.
- XP top-10 names jump into student modal (`jumpUid`).
- Teacher / test accounts filtered from Evidence computations.
- Legacy activity label normalization in `Students.tsx` (renames / prefixes like `letris:` / `mcq:`).
- Wide tables use `overflow-x-auto` for smaller viewports.
- Student detail uses `role="dialog"` + `aria-modal` + close control.
- Feedback screenshots render with `alt="screenshot attached to the report"`.

---

## Related learner telemetry teachers consume

These are **not** teacher pages, but they feed `/teacher`:

| Writer | Learner surface | Event / store |
|---|---|---|
| `PageViewTracker` | all pages (signed-in) | `page.view` |
| Practice / games | AuthGate surfaces | `game.*`, `pretest.answer`, `flashcard.review`, etc. |
| `FeedbackButton` | floating (anonymous allowed) | `feedback` docs |
| `HelpDot` | contextual help | `help.open` |
| Progress sync | signed-in | `users/{uid}/app/progress`, `leaderboard` |
| Responses | item attempts | `users/{uid}/responses` |
| Supplements | `public/supplements/` | `supplement.open` / `supplement.answer` |

---

## File list (`src/app/teacher/`)

```
page.tsx
data.ts
ui.tsx
Overview.tsx
Attendance.tsx
Students.tsx
Activities.tsx
Pretests.tsx
FeedbackPanel.tsx
Evidence.tsx
```
