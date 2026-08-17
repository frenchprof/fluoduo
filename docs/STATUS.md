# STATUS — the one place that is true (17 Aug 2026)

Every agent (Claude Code `main`, Peers, Cursor, Claude Chat, SIO session) reads
**this file first** and updates it before ending a session. `HANDOFF.md`, `TODO.md`,
`docs/planning/UI_WORK_PLAN_1.md`, `docs/audit/` are HISTORY — useful for the *why*,
wrong about the *what's left*. If they disagree with this file, this file wins.

## Where the code is

- `main` on `frenchprof/fluoduo` (origin) — the working repo.
- Production = `dckg/fluo` (remote `live`), Cloudflare Pages auto-builds its `main`.
  **Deploy = `git push live main`.** (`docs/DEPLOY.md` says "just merge to main" —
  that means `live`'s main, not origin's. Fixed in the banner there.)
- Merged into `main` today (17 Aug): content fixes (below), the SIO objectives doc,
  PR #19 grading unification (was reported merged on 11 Aug — it was not).
- Merged 11–12 Aug: patches 1–22 + hero rows of 25, PR #18 Reports tab, PR #20 region
  icons/tokens/sioKinds re-audit.

## Decisions Dan made on 17 Aug (do not re-open)

1. **Home map = two views, 2D and 3D, user toggles between them.** The 2D reference is
   Design's "FluOlinGo Home standalone" (course map in a scrollable box, zoom %
   control, path snakes right-then-down across five soft region bands, 56px round
   stops, legend vocabulary/grammar/expressions/communication, ▶ media-player
   "current" stop). Band fills are now tokens `--region-*-band` in `globals.css`.
   The 3D view is Dan's own build using the icon set / accents / foci / roadside
   catalog already on `main`. No more path-mechanic reversals.
2. **SIO-036 / SIO-040**: spec softened to match content (CSV + `sios.json` edited
   in step). Do NOT run `scripts/gen-sios.mjs` — it is stale against the hand-edited
   `sios.json` (would drop collectionIds, canDo, topics). Edit both files together
   or fix the generator first.
3. `envies-besoins.json` items 09/10: `gap` is `envie` (was `voudrais`).
4. Region **accent** hexes (`--region-village` … `--region-market`) remain
   provisional — Design gave band fills, not accents.
5. Firestore service-account key: Dan says rotated ("it should be"). Not verified
   from the repo — confirm once in Firebase console → Service accounts, then delete
   this line.

## Backlog — in order

| # | Item | Units | Notes |
|---|---|---|---|
| 1 | Deploy: `git push live main`; confirm fluolingo.com serves Reports tab + region icons | 0.25 | do first |
| 2 | Home path, rest of patch 25: 2D map per Design ref + 2D/3D toggle + `/unit/N` deep link + `short` labels + print stylesheet | ~8 | decision 1 above |
| 3 | La Carte branch (`claude/api-necessity-i8fgps`, 3 commits) — rebase; ring colours from `sioKind()`/`sioSecondary()`, not hand-coded; then merge or fold into #2 | 2 | |
| 4 | Patch 23 — games: shared `GameFrame`, boards fill device, game-over post-mortem, misses → ReVue | 14 | not started |
| 5 | Patch 24 — Index: chip rail + unit segments, result cells, hub pages gone | 8 | `/activities` still old matrix |
| 6 | Patch 26 — `/moi` + teacher: outcome-grouped hardest items, heat-strip, Class-now, student×outcome matrix | 12 | |
| 7 | Track D — AI / help ladder inside DrillShell (spec + build) | 16 | unblocked |
| 8 | `/teacher` off the public CDN (server-side hardening; PR #6 draft, `cursor/teacher-cdn-exposure-a214` behind main) | 3 | PII chunk leak itself is closed |
| 9 | Loose bugs: deck pages that demand sign-in / "No deck specified.", `/sio/[id]` | 4 | |
| 10 | Data-truth backlog: four "weak" definitions, biased shuffle, session/attempt fields read-not-written, D4 two learners' progress docs not syncing, leaderboard identity | ~10 | graders already unified (PR #19) |
| 11 | Ops: make the GitHub ruleset required; `add-claude-github-actions` branch — check workflow conflicts then merge or delete; `claude-review` billing | 1 | |
| — | December: canonical `FD-` outcome IDs (Track A) | 8 | deliberately deferred |

Near-term total ≈ 78 units. Shipped ≈ 72 of ~150 in-scope.

## Branches (17 Aug)

- merged/dead: `claude/peers-vd2h6h`, `claude/sio-instructional-objectives-7bjv1a`,
  `claude/fluoduo-pr9-review-sync-8uoyfx`, `cursor/patch-19c-a214`,
  `cursor/drillshell-20-21-a214`, `ship/patches-1-12`, `fluoduo/data-and-curriculum-fixes`
  → delete after deploy.
- live: `claude/api-necessity-i8fgps` (La Carte), `cursor/teacher-cdn-exposure-a214`,
  `add-claude-github-actions-…`.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).
