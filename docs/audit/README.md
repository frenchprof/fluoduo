# Fluoduo repository audit

**Branch:** `audit/repository-inventory`  
**Audit date:** 2026-08-05  
**Scope:** Read-only inventory of the Fluoduo / FluOlinGo codebase.  
**Constraint:** Documentation only — no runtime code was modified.

## Product snapshot

| Item | Value |
|---|---|
| Package name | `lang-games` (`package.json`) |
| Product name (UI / metadata) | FluOlinGo |
| Framework | Next.js 16.2.7 App Router, React 19, Tailwind CSS 4 |
| Deploy model | Static export (`output: "export"`) + Cloudflare Pages Functions |
| Backend | Firebase Auth + Firestore (project shared suite; rules in `firestore.rules`) |
| Content model | ~50 SIOs, ~44 curated collections, native lessons, pretest banks |
| Prior architecture doc | [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Prior a11y/perf notes | [`docs/audit2/`](../audit2/) (2026-07; re-verified where noted) |

## Document index

| File | Contents |
|---|---|
| [`00-overview.md`](./00-overview.md) | Repo map, stack, inventory counts |
| [`01-routes.md`](./01-routes.md) | App Router route inventory |
| [`02-components.md`](./02-components.md) | Shared components under `src/components/` |
| [`03-pages.md`](./03-pages.md) | Page-level modules co-located under `src/app/` |
| [`04-games.md`](./04-games.md) | Game engines under `src/games/` + game routes |
| [`05-learner-features.md`](./05-learner-features.md) | Learner-facing feature map |
| [`06-teacher-features.md`](./06-teacher-features.md) | Teacher dashboard modules |
| [`07-data-flow.md`](./07-data-flow.md) | Progress, telemetry, Firestore, Functions |
| [`08-duplication.md`](./08-duplication.md) | Duplicated / parallel components & content stores |
| [`09-technical-debt.md`](./09-technical-debt.md) | Debt, stubs, naming drift, large files |
| [`10-accessibility.md`](./10-accessibility.md) | Accessibility findings |
| [`11-responsive.md`](./11-responsive.md) | Mobile / desktop / breakpoint behaviour |

## Method

- Enumerated `src/app/**/page.tsx`, `src/components/`, `src/games/`, `src/lib/`, `src/content/`, `functions/`.
- Cross-checked with `docs/ARCHITECTURE.md`, `TODO.md`, `firestore.rules`, and July 2026 `docs/audit2/` notes.
- Static grep for a11y (`aria-*`, `aria-live`, clickable non-buttons) and responsive (`sm:`/`md:`/`lg:`, `@media`, `1100px` shell breakpoint).
- No runtime tests or browser automation were run in this pass.

## Out of scope

- Redesign proposals or masterplan content (see `docs/FLUODUO_MASTERPLAN.md` if present).
- Changing application code, config, or Firestore rules.
- Content accuracy / pedagogy scoring (see `docs/audit2/audit2-pedagogy.md` for prior work).
