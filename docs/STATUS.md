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
| ~~1~~ | ~~Deploy: `git push live main`; confirm fluolingo.com serves Reports tab + region icons~~ | — | **not done, 17 Aug** — Peers has no push access; Dan runs it |
| ~~2~~ | ~~Home path, rest of patch 25~~ — **done 17 Aug** on `pm/patch25-home-map` (verify25b, `work/patch25/*.png`): 2D map per Design ref (region bands, kind-coloured stops, ▶ current, zoom %), 2D/3D toggle (`fluo.homeMapView`), `/unit/N` → deep link into Home, `short` labels + `check:short` in the build, print stylesheet with a QR per unit | — | merge the branch, then deploy |
| ~~3~~ | ~~La Carte branch~~ — **folded into #2, 17 Aug**: `HomeMap3D.tsx` ports the 3D scroll treatment; ring colours from `sioKind()`/`sioSecondary()` via one `KIND_COLOR` palette. Delete `claude/api-necessity-i8fgps` after merge (its `/carte` page and objectives.json were not taken — the SIO objectives doc is already on main) | — | |
| ~~4~~ | ~~Patch 23 — games~~ — **done 17 Aug** on `pm/patch23-games` (verify23, `work/patch23/*.png`): `GameFrame` + GameBar v2 on all six games, 100dvh/no page scroll, boards measured (`useBoardSize`), desktop two-pane record, headers/instructions gone (⋯ → Help), `GameOver` post-mortem → ReVue queue + `CORRIGER MAINTENANT`, CreditsSplash once per browser, galleries → ▶ Jouer + sheet | 14 | merge the branch (after #2), then deploy |
| ~~5~~ | ~~Patch 24 — Index~~ — **done 17 Aug** on `pm/patch24-index` (verify24, `work/patch24/*.png`): chip rail + unit segments + ten SIO rows, `?activity=&unit=` in the URL, result cells from a device-local activity ledger, xPlain/4Mémoire/WorDrill as row buttons, three hubs → redirects, `?gaps=1` backlog | — | merge the branch (after #4), then deploy |
| ~~6~~ | ~~Patch 26 — `/moi` + teacher~~ — **done 17 Aug** on `pm/patch26-moi-teacher` (verify26, `work/patch26/*.png`): outcome rows (`src/lib/outcomeRows.ts`), `HeatStrip` on four pages, /moi thin hero + four segments + CAP 5, teacher Class now board + outcome × student matrix, one pool fetch, Compute button gone | — | merge the branch (after #5), then deploy |
| 7 | Track D — AI / help ladder inside DrillShell (spec + build) | 16 | unblocked |
| 8 | `/teacher` off the public CDN (server-side hardening; PR #6 draft, `cursor/teacher-cdn-exposure-a214` behind main) | 3 | PII chunk leak itself is closed |
| 9 | Loose bugs: deck pages that demand sign-in / "No deck specified.", `/sio/[id]` | 4 | |
| 10 | Data-truth backlog: four "weak" definitions, biased shuffle, session/attempt fields read-not-written, D4 two learners' progress docs not syncing, leaderboard identity | ~10 | graders already unified (PR #19) |
| 11 | Ops: make the GitHub ruleset required; `add-claude-github-actions` branch — check workflow conflicts then merge or delete; `claude-review` billing | 1 | |
| — | December: canonical `FD-` outcome IDs (Track A) | 8 | deliberately deferred |

Near-term total ≈ 44 units. Shipped ≈ 106 of ~150 in-scope.

## Branches (17 Aug)

- merged/dead: `claude/peers-vd2h6h`, `claude/sio-instructional-objectives-7bjv1a`,
  `claude/fluoduo-pr9-review-sync-8uoyfx`, `cursor/patch-19c-a214`,
  `cursor/drillshell-20-21-a214`, `ship/patches-1-12`, `fluoduo/data-and-curriculum-fixes`
  → delete after deploy.
- live: `claude/api-necessity-i8fgps` (La Carte), `cursor/teacher-cdn-exposure-a214`,
  `add-claude-github-actions-…`.

## Patch 26 — what was left out or decided on the fly (17 Aug, Peers)

- **Outcome rows are one fold, three readers.** `src/lib/outcomeRows.ts`
  (learner-safe: spine + content only) turns any `{item, status}` list into
  outcome rows — `outcomeForItem` → SIO, items nested, `weakItems` = items
  missed ≥ 50 %, order `missed × weakItems`, the unresolvable rest in ONE
  "Not yet mapped" bucket pinned last. /moi's Fix segment, the teacher
  student panel's "Hardest outcomes" (was "Hardest items", flat) and the
  matrix all read it. `retried` counts as a miss (first try failed).
- **The heat-strip is on four pages**: /moi (under the hero, cells → the
  Index row `/activities?unit=N#SIO`), the teacher student panel (top of
  the modal), the teacher **Class now** board (the class column as one
  strip, above the matrix), and the **Index** (compact `size="sm"` under the
  unit control, from the device ledger summed across activities; a tap
  moves to that outcome's row). NOT Home — the hero is frozen (patch 25) and
  the map already is the syllabus picture. Index rows now carry
  `id={sio.id}` so `#SIO-0NN` lands (an effect scrolls after hydration).
- **/moi**: hero = chips (✓ done, 🎯 accuracy, 🔥, ⭐, 🔁 due) + two 3 px
  hairlines (Course, Accuracy), 90 px at 390 (Home's is ~99). Six tabs →
  four segments **Fix · Exercises · History · Journey**: "Where I lose marks"
  → Exercises; "My hardest items" → Fix (outcome rows); "Strong vs weak" →
  the heat-strip (it IS that list, without the words) and, signed out, the
  Fix rows drawn from `itemSrs` (interval ≤ 1 day = weak — the old rule);
  "My tips" → gone (the top Fix row IS the tip; the 🔁 due count is a hero
  chip); "Journey" keeps the six fun numbers + the marathon CTA. Every list
  is `Capped` at 5 with "+N more". `void rows;` and the `Math.random()` key
  died with the rewrite. Stock palette count fell 904 → ~826.
- **Teacher**: new first/default panel **🟢 Class now** — 16 tiles (2-up on
  a phone, 4×4 from sm), worst-first (`tileRank`: stuck, then lowest last-10
  accuracy, then no data, absent last), name · live/today/absent dot · last
  five ✓✗ (tooltip = outcome) · the last outcome's short · a last-10
  hairline. **Stuck = 3 consecutive misses on ONE outcome inside 20 min**
  (red tile, ⚠). Under it the class heat-strip and the **outcome × student
  matrix** (50 rows grouped by unit, a column per learner, `Class` last;
  cell = tier of that learner's accuracy on that outcome; a click on a name
  opens the student). Overview stays (its KPIs / day drill-down were asked
  for) — Class now is added, not swapped in.
- **One fetch**: `fetchClassDetails(roster)` — pool of 4, tiles land as
  each learner arrives — feeds Class now, the matrix, Evidence, the
  analytics CSV and the student modal (`cached ?? fetched`). **The `Compute`
  button is gone**: Evidence is a `useMemo` over the shared map. **Repoll
  every 30 s** = `fetchResponsesSince(uids, lastPoll)` — a single-field
  `timestamp >` range per uid (no composite index), prepended into the map;
  paused while the tab is hidden. Cost: 16 full response reads on open
  (was 0 until someone pressed Compute), then only deltas.
- **Screenshots of the teacher page use a fixture.** It cannot render
  without live Firestore + an admin sign-in, so `src/app/teacher/fixture.ts`
  fabricates sixteen `Élève Un…Seize` (deterministic PRNG, real item ids,
  two "live", one stuck) behind `NEXT_PUBLIC_TEACHER_FIXTURE=1` — inlined at
  build, dynamic-imported, `canView` opens for it. A clean build still emits
  the fixture as one orphan chunk no page references (Turbopack does not
  drop the dead dynamic import); verify26 checks that, verify18b stays
  green. **Never set the flag for a deploy.** /moi shots are the signed-out
  device view (progress + ledger seeded) — the Fix rows there come from
  `itemSrs`; the answer-log rows look the same with ✗ counts.
- Not done: the /moi ▶ on an outcome row goes to the Index row, not
  straight into a drill (Dan to say if it should open 4Mémoire); "Not yet
  mapped" has no practise link (nothing to link); the matrix has no
  per-cell click-through (title only); Class now's presence dot reads
  events + answers, not a heartbeat — "live" = anything inside 5 min.

## Patch 24 — what was left out or decided on the fly (17 Aug, Peers)

- **Rows are SIOs, not decks.** All 50 SIOs own exactly one curated deck and
  no curated deck is outside a SIO (checked in verify24), so nothing fell off
  the Index. Ten rows per unit; the row's stop number is the one on Home and
  links to `/?unit=N#SIO` (✓ in green once the outcome is marked done).
- **Chips vs buttons is decided by content, not taste** (`src/lib/indexMatrix.ts`):
  xPlain, 4Mémoire, WorDrill exist for every deck → per-row buttons; the seven
  content-gated ones (SpecuLearn, EtuDice, iComplete, GramMarathon, ComposeIt,
  VocabulaRain, LexicaLater) are the chip rail, in registry (family) order.
  Pre-Test folds into the SpecuLearn cell (Dan, 2026-08-10). Match It stays
  off (KIV). Eligibility comes from `deckActivityTabs()` — not re-derived.
- **The cell's data is a device-local ledger** (`src/lib/activityLedger.ts`,
  `fluolingo:activityLedger`), written once from `recordResponse()` — the one
  place every graded answer already passes — keyed activity → SIO →
  {right, wrong}. NOT synced: two devices, two ledgers; the synced truth is
  still `users/{uid}/responses`. Replaying responses into the ledger after
  sign-in is on the data-truth backlog (#10). VocabulaRain, ComposeIt,
  NumBus/NumBourse tally only what they already record; games that record
  raw French (no item id) still resolve through the activityId's deck.
  Tier scale = /moi's (red < 50, amber < 75).
- **Only three hubs existed to delete** (patch 23 had already turned the four
  game galleries into ▶ Jouer + sheet): `/practice/flip-it`,
  `/practice/grammarathon` (ActivityHub) and `/practice/speculearn` (tile
  gallery). All three are redirect stubs → `/activities?activity=…`; the
  registry hrefs point straight at the Index (verify19's route check reads
  the path part). The SpecuLearn gallery's "Why guess first?" NUS paragraph
  went with it — the registry blurb keeps the claim; Dan to say if the
  citation should live somewhere (HELP?).
- `?activity=flip|lesson|wordrill` (from the 4Mémoire / WorDrill flaps)
  focuses that row button (its hue) and the cell reports that activity; the
  chip rail shows no selection. `/practice/dice` and `/practice/complete-it`
  never had index pages and still do not (registry hrefs stay null).
- `?gaps=1` (GapsView) is reached only by URL — nothing in the learner chrome
  links it. It counts xPlain as a gap when no lesson is AUTHORED (the deck
  lesson still renders). Today: 189 gaps across 8 columns.
- Search stays (word-level, Dan 2026-07-08); a live query spans all units and
  dims the unit control. "Your decks" (MyDecks) stays at the bottom.
- Not done: the `?unit=` default is the learner's next SIO's unit (same as
  ▶ Continue) — a class-flag default was not attempted; no legend for
  disc / ring / dash (title + aria-label only, per the litmus test); the
  gaps table scrolls sideways on a phone (it is Dan's desktop view).
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the last
  build and commit); harness `work/patch24/serve.py` + `shoot.py`, committed
  this time (`work/patch*/` is gitignored — added with `-f`).

## Patch 25 — what was left out or decided on the fly (17 Aug, Peers)

- "One unit per screen": the 2D map box snaps band-to-band on a **vertical**
  swipe (scroll-snap) and lands on the current/deep-linked unit; bands are
  stacked so the road stays one road, as Design drew it — NOT a horizontal
  pager. Dan to confirm.
- Class flag 🚩 = `CLASS_FLAG_SIO` in `src/content/chapters.ts` (hand-set,
  SIO-010) — nothing in progress/cohort exposes a per-week position yet.
  The road is paved to the flag, dotted beyond; the learner's travelled
  stretch wears the equipped accent.
- The hero's ▶ Continue still links `/unit/N#SIO` (untouched per the
  hero-freeze); it lands via the redirect. Point it at `/?unit=N#SIO` when the
  hero is next opened.
- `KIND_LABEL` stays French (vocabulaire/grammaire/…) in the map legend —
  the app-wide choice from 2026-07-08; Design's legend was English.
- Legacy `/unit/N` pages still build (five redirect stubs) because the shell's
  Unité flaps, DrillShell's back link and old bookmarks point there.

## Patch 23 — what was left out or decided on the fly (17 Aug, Peers)

- **Hearts stay in the games that had them** (NumBus, NumBourse, LexicaLater):
  GameBar v2 draws ♥♥♡ when the game keeps lives and nothing otherwise.
  DrillShell's "no hearts" rule was about *curriculum drills*; the games are
  arcade play. Dan to confirm or strike.
- **The queue is `itemSrs`.** `queueForReview(ids)` (progress.ts) drops each
  miss to the due-now rung — exactly what `dueForReview` reads — the moment
  the post-mortem mounts; `CORRIGER MAINTENANT` opens `/reviser?items=…` and
  the reviser page puts those at the head of the session. It does NOT call
  `recordItemResult` again (the game already graded/paid the attempt).
- **Number games' misses reach the queue only when the course has the row**:
  NumBus/NumBourse deal spoken numbers, not deck items; `reviewItemByFrench`
  matches the words against `numbers-0-20/20-69/70-99`. A number outside
  those decks is listed on the post-mortem (with "where it goes" → SIO-007)
  but cannot be queued. VocabulaRain tiles match the same way (by French);
  Match It queues the mis-chosen completion (the item it graded).
- ComposeIt has no graded misses (AI feedback) — its GameOver shows the bill
  / le bilan du prof and « Sans faute ». The scenario reminder line stays on
  the board (Dan, 2026-07-19) — the one instruction not moved to Help.
- VocabulaRain's pre-game study table stays (Dan, 2026-07-04) minus its
  blurb; LexicaLater's blinking red "Drag down a chest" and pointing hands
  are gone (WCAG flash risk + litmus) — the down-arrows remain.
- The four game galleries are one card + sheet; the *drill* hubs
  (`/practice/flip-it`, `/practice/grammarathon` → ActivityHub) were not
  touched — patch 24's Index work owns those.
- Screenshots were taken from a build with `REQUIRE_SIGN_IN=false` (the wall
  is Google-only, no headless path); the flag was reverted before the last
  build and commit. Harness: `work/patch23/serve.py` + `shoot.py`.
- Match It now sits behind AuthGate like the other five (it was the only
  game without the wall).
- Not done: a per-game *why* button on the post-mortem rows; keyboard `?`
  for Help; the two-pane record for ComposeIt on tablets < 1024px.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).
