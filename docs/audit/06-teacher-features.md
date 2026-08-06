# 06 — Teacher features

**Route:** `/teacher` (`src/app/teacher/page.tsx`)  
**Access:** Google sign-in + client email allowlists (`ADMIN_EMAILS`, `REVIEWER_EMAILS` in `data.ts`).  
**Security boundary:** Firestore rules admin allowlist (`firestore.rules` `isAdmin()`).  
**Discovery:** Not linked from learner chrome; teachers receive the URL.

## Panels

| Panel key | Module | What it shows |
|---|---|---|
| `overview` | `Overview.tsx` | Class KPIs, day-by-day rhythm, top pages, XP top 10; day drill modal |
| `attendance` | `Attendance.tsx` | Day × page → unique visitors with names (from `page.view` + supplements) |
| `students` | `Students.tsx` | Roster → progress economy, SRS, sessions, responses, event trail |
| `activities` | `Activities.tsx` | Games / decks / supplements / flashcard reviews / tutor volume |
| `pretests` | `Pretests.tsx` | Per-item miss rates + top wrong picks (`pretest.answer` events) |
| `feedback` | `FeedbackPanel.tsx` | Bug-report inbox; admins can mark done |

Additional analysis module (loaded in student/evidence contexts):

| Module | Role |
|---|---|
| `Evidence.tsx` | Within-student analyses: first vs later accuracy, errors conquered, marathon trajectory; CSV-style export rows |

## Data sources (teacher)

Fetched once at dashboard root where possible (`page.tsx` comments):

| Source | Collection / path | Consumers |
|---|---|---|
| Events stream | `events` (capped fetch) | Overview, Attendance, Activities, Pretests, Students trail |
| Leaderboard | `leaderboard` | Overview XP top 10, roster enrichment |
| Per-user progress | `users/{uid}/app/progress` | Students drilldown |
| Sessions | `users/{uid}/sessions` | Time-on-task |
| Responses | `users/{uid}/responses` | Item-level analytics / Evidence |
| Attempts count | `users/{uid}/attempts` | Volume signal |
| Feedback | `feedback` | FeedbackPanel |

## Roles

| Role | Capability |
|---|---|
| Admin (`ADMIN_EMAILS`) | Full view + write actions (e.g. mark feedback done) |
| Reviewer (`REVIEWER_EMAILS`) | Full read view, no write actions (`canWrite={isAdmin}`) |
| Other signed-in | “Teachers only” gate UI |
| Signed-out | Prompt to Continue with Google |

## UX notes observed in code

- Toggle to **include teacher accounts** in analytics (default excluded) for “is it recording?” checks.
- XP top-10 names jump into student modal (`jumpUid`).
- Teacher accounts / specific test accounts filtered from Evidence computations.
- Shared UI primitives in `ui.tsx` (`Kpi`, `TableBox`, `Section`, sortable sections).
- Wide tables use `overflow-x-auto` for smaller viewports.
