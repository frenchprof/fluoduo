# 00 — Overview

## Repository layout (top level)

```
fluoduo/
├── src/
│   ├── app/           Next.js App Router pages + co-located page modules
│   ├── components/    Shared shell, chrome, overlays
│   ├── games/         Game engines (letris, lexicalator, matching, compose, dice, num*)
│   ├── lib/           Progress, economy, firebase, collections, practice, textgen
│   └── content/       SIOs, collections JSON, lessons, pretests, legacy letris JSON
├── functions/         Cloudflare Pages Functions (api/*)
├── scripts/           Content migration / TTS / audit helpers
├── public/            Static assets (supplements, devine, …)
├── docs/              Architecture, audits, planning, handoffs
├── firestore.rules    Security rules
├── next.config.ts     Static export
└── package.json       name: lang-games
```

## Stack facts (from repo, 2026-08-05)

| Concern | Implementation |
|---|---|
| UI | React 19 client components extensively; many pages `"use client"` |
| Styling | Tailwind 4 + large `src/app/globals.css` (fluo / cahier / neo primitives) |
| Fonts | Geist, Geist Mono, Fraunces, Public Sans, Roboto via `next/font` in `layout.tsx` |
| Auth | Google sign-in (`src/lib/firebase/auth.ts`); site usable signed-out |
| Persistence | `localStorage` progress (`fluolingo:progress`) + optional Firestore sync |
| Hosting | Cloudflare Pages static export; APIs in `functions/api/` |
| HTML lang | `lang="fr"` + `translate="no"` on `<html>` |

## Approximate inventory counts

| Area | Count (approx.) | Notes |
|---|---|---|
| `src/**/*.{ts,tsx,css,json}` | ~325 files | Excludes `node_modules` |
| App `page.tsx` routes | 44 | See `01-routes.md` |
| Shared components | 26 modules | `src/components/` |
| Game engine files | ~25 | `src/games/` |
| Lib modules | ~35 | `src/lib/` |
| Curated collections | 44 JSON | `src/content/collections/` |
| Legacy content JSON (root of `content/`) | 27 | Parallel Vocabularain store |
| Native lesson modules | 26 | `src/content/lessons/native/` |
| Pretest JSON banks | 35 | `src/content/pretests/` |
| SIOs | 50 | `src/content/sios/sios.json` |
| Cloudflare API functions | 4 | compose, correct, tts, tutor |
| Teacher dashboard panels | 6 (+ Evidence helper) | See `06-teacher-features.md` |

## Architectural invariants (observed)

1. **Static export** — no Next.js server runtime; user-created deck IDs use query-param routes (`/decks/view?id=`).
2. **One deck, many activities** — curated collections are the canonical vocabulary store; activity readiness predicates gate links.
3. **Local-first progress** — device `localStorage` is authoritative; signed-in sync merges to Firestore.
4. **Teacher surface unlinked** — `/teacher` is admin-gated by email allowlist (UX); rules are the security boundary.
5. **Dan litmus test** — redundant explanatory text discouraged; WHY behind on-demand controls (`AGENTS.md`).

## Related prior docs

- `docs/ARCHITECTURE.md` — system rationale (2026-07-05).
- `docs/audit2/*` — functional / UX / a11y-perf / pedagogy streams (2026-07).
- `TODO.md` — collections + gamification build plan (partially superseded by later work).
