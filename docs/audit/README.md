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
| Framework | Next.js App Router, React 19, Tailwind CSS 4 |
| Deploy model | Static export (`output: "export"`) + Cloudflare Pages Functions |
| Backend | Firebase Auth + Firestore (rules in `firestore.rules`) |
| Content model | ~50 SIOs, ~44 curated collections, native lessons, pretest banks |
| Prior architecture doc | [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Prior a11y/perf notes | [`docs/audit2/`](../audit2/) (2026-07; re-verified where noted) |

## Primary deliverables

| File | Contents |
|---|---|
| [`route-inventory.md`](./route-inventory.md) | App Router + Functions route inventory |
| [`component-inventory.md`](./component-inventory.md) | Shared components, page modules, game engines |
| [`learner-pages.md`](./learner-pages.md) | Learner-facing pages and journey map |
| [`teacher-pages.md`](./teacher-pages.md) | Teacher dashboard panels and data sources |
| [`technical-debt.md`](./technical-debt.md) | Dual stores, naming drift, stubs, test gaps |
| [`accessibility-audit.md`](./accessibility-audit.md) | Existing a11y affordances and confirmed gaps |

## Supplemental numbered notes

Earlier working notes in the same folder (overlapping detail):

| File | Contents |
|---|---|
| [`00-overview.md`](./00-overview.md) | Repo map, stack, inventory counts |
| [`01-routes.md`](./01-routes.md) | Routes (superseded in detail by `route-inventory.md`) |
| [`02-components.md`](./02-components.md) | Shared components |
| [`03-pages.md`](./03-pages.md) | Page-level modules |
| [`04-games.md`](./04-games.md) | Game engines |
| [`05-learner-features.md`](./05-learner-features.md) | Learner feature catalogue |
| [`06-teacher-features.md`](./06-teacher-features.md) | Teacher panels |
| [`07-data-flow.md`](./07-data-flow.md) | Progress, telemetry, Firestore, Functions |
| [`08-duplication.md`](./08-duplication.md) | Duplicated / parallel stores |

## Method

- Enumerated `src/app/**/page.tsx`, `src/components/`, `src/games/`, `src/lib/`, `src/content/`, `functions/`.
- Cross-checked with `docs/ARCHITECTURE.md`, `TODO.md`, `firestore.rules`, and July 2026 `docs/audit2/` notes.
- Static grep for a11y (`aria-*`, `aria-live`, dialogs) and debt signals (dual stores, eslint disables, leftover files).
- No runtime tests or browser automation were run in this pass.

## Out of scope

- Redesign proposals or masterplan content.
- Changing application code, config, or Firestore rules.
- Content accuracy / pedagogy scoring (see `docs/audit2/audit2-pedagogy.md` for prior work).
