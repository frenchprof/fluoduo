# STATUS — the one place that is true (17 Aug 2026, end of day)

Every agent (Claude Code `main`, Peers, Cursor, Claude Chat, Cowork PM) reads
**this file first** and updates it before ending a session. `HANDOFF.md`, `TODO.md`,
`docs/planning/UI_WORK_PLAN_1.md`, `docs/audit/` are HISTORY — useful for the *why*,
wrong about the *what's left*. If they disagree with this file, this file wins.
Only ONE agent edits this file at a time; say so in your commit.

## Where the code is

- `main` on `frenchprof/fluoduo` (origin) — the working repo.
- Production = `dckg/fluo` (remote `live`), Cloudflare Pages project
  `fluolingo-dot-com` auto-builds its `main`. **Deploy = `git push live main`.**
- 17 Aug, morning (on `main`, deployed at `3453b1e`): SIO-036/040 softening +
  `envies-besoins` gap fix; SIO objectives doc; PR #19 grading unification (had
  never been merged); PRs #18/#20 finally deployed; STATUS.md born.
- 17 Aug, afternoon (built by the Cowork PM session in seven patch files, applied
  by Dan with `git am`): the whole remaining UI programme — see the table.
- 20 Aug (Peers): PR #24 merged — the 3-Aug game-content port (LexicaLater
  phrase integrity + live misses, Commerces +7, beige livery — 19b baseline
  506 → 508 with Dan's OK, nationalities withdraws from LexicaLater);
  then the 3D-camera rework (row 25e) merged and the lot deployed to live
  on Dan's word ("deploy").
- 20–21 Aug (Peers, Dan's verdict rounds on the live camera): PR #26 —
  rounds 9–10 (road owns the frame · flat solid-colour buttons, dashed ring
  retired · gentle-S snake · tall grounded flanks · giant trees) — and
  PR #27 — round 11 (**the map moves to /carte**: finger-scroll fought the
  Home page; Home links there with one card, all old `/?unit=N#SIO` deep
  links + printed QRs forward; hover titles on all roadside; passed things
  exit through the frame; 2D zoom = number + milestone dropdown; side rail
  = one-flap accordion). Both merged on green and deployed by Dan.
  Ops PRs #28 (checkout/setup-node v5 — Node 24) and #29 (pages-preview
  guarded to frenchprof/fluoduo — it 404'd on dckg where Pages is off).
  Still red everywhere: claude-review (ANTHROPIC_API_KEY/billing — Dan).
- 21 Aug (Claude Code, branch `claude/french-4-sios-scaling-u39gjr`): **French 4
  scaling plan** — `docs/planning/FRENCH4_SCALING_PLAN.md`, written against
  Dan's 40-SIO annex + the Unité 8 manuel pages. No code touched. The 40 A2
  SIOs are extracted to `docs/handoff/ATELIER_A2_SIOs_v1.csv` (the shape
  `gen-sios.mjs` eats), with proposed ≤14-char `short` labels. Headline: the
  annex numbers A2 as **SIO-051–090, units 5–8**, so nothing collides with
  French 1 — `course` can be DERIVED from the unit, and no learner data
  migrates. Plumbing ≈2 d, then content. Open decisions in its §10.
  Updated the same day against the full materials (manuel U5–8, cahier U5–8,
  guide inventories): all four A2 units share ONE shape (3 Situations · Lab'
  Langue · 2 Ateliers · Mission), so all 40 SIOs are now placed into their
  book section in the CSV — that IS `UNIT_SITUATIONS`. The Mémo pages are
  deck-shaped verbatim and the cahier's Bilan linguistique is already
  `finale.ts`'s shape, so list content roughly halves vs a naive scaling
  while authored listening text doubles. Two gaps the annex does not cover:
  a phonetics strand (8 objectives, no SIO, no engine — NumBus is the donor
  shell) and DELF preparation (no equivalent surface). **Blocker found:**
  `HomeMap.tsx:178` already uses `unit: 5` as the arena sentinel and line 305
  branches on `b.unit < 5` — that collides with A2's Unité 5 and must be
  fixed in Phase 1. Third pass (Dan's two asks): §11 = the map's whole naming
  layer (4 regions + icons + accents, chapters, ~24 roadside props, and the
  50-stop geometry constants in projection.ts/scene.ts — 1.5 d, was costed
  0.5); §12 = the answer to "SIOs that cannot be represented in goals" — a
  `goalShape` field orthogonal to `sioKind`: 28 drill · 6 model · 6 brief.
  A1's six production SIOs are all `model` (its dialogue lines ARE the deck)
  and it has zero `brief` stops, which is why A2's Missions/Projets are the
  first thing that doesn't fit. **Dan decided (21 Aug): a `brief` counts 1/40
  like any other stop, no asterisk — do not re-open.** Follow-up left open by
  that: XP pays base + a mastery bonus scaled by the SIO's own items, which a
  brief has none of, so a Mission would be worth half a vocab stop forever;
  the plan recommends scaling it by the brief's feeder SIOs instead (§12.6).
  §2.5 corrects the pass before it, on Dan's catch: the Mémo is NOT the whole
  deck source. 16 of 40 SIOs carry a phrases load but the Mémo has only 8
  Communication boxes — the rest (« Mieux vaut… », « Je souhaite… ») are
  harvested from the Situation pages' Résumons/Aide-à-la-lecture steps.
  SIO-087 would have shipped an empty deck. Rule proposed to bound it: lift a
  frame only where the book itself re-elicits it. Phrases layer roughly
  doubles. Exposes a guard-rail question — A2's texts run ahead of A2's
  grammar sequence (imparfait in U5, futur simple in U8).
  §2.6 = the enrichment pass Dan asked for, over all 56 manuel + 46 cahier
  pages: nothing deleted, five columns ADDED to the CSV (lexique sets,
  chunks & frames incl. harvested ones, box on page, phonetics, manuel pp.) —
  39 of 40 SIOs now carry chunk content. Found a THIRD unnamed strand: word
  relations, one box per unit (préfixe · synonymes · antonymes ·
  abréviations), in no inventory and no SIO, and the best LexicaLater
  material in the course. Corrected my own §2.5 example — SIO-087 does have a
  Mémo Lexique box; SIO-056 is the real proof case (Dan's own example).

## Programme — done

| Patch | What | Check |
|---|---|---|
| 1–22 | data layer, curriculum spine, PII split, bottom bar, Cahier tokens, HELP from the registry, DrillShell, lesson pager, English-first, cohort filter, hero shrink | verify18–22, 25 |
| 25 | **Home path**: 2D map per Design (region bands, kind-coloured stops, ▶ current, 🚩 class flag, zoom), 2D ⇄ 3D toggle (3D ported from La Carte, ring colours from `sioKind()`), `short` labels + build check, `/unit/N` deep link, A4 print with QR per unit | verify25b (38) |
| 25c/25d | **Home map 3D view = Dan's Figma Make** (ported 19 Aug, `pm/home-map-figma-3d`): first-person camera on the snaking road, depth-scaled stops, world gate signs, Peers' roadside props, trees, clock-driven sky, 🏁 arch; 📍 recentre | verify25c (61) |
| 25e | **3D camera = Candy Crush register** (Peers, 20 Aug, eight rounds against Dan's captures): mini-planet camera — six-station chain on a beaten path sunken between coloured banks, stations = oblate buttons on road-pad spots, tip-first rises over a scalloped terrace lip (`reveal` + `clipRise`), water at the lip's foot, the NEXT region's land beyond with far dressing on parallax, roadside clamped clear of the road (`placeAt` verge), no pinch zoom. Knobs now `FULL_AHEAD`/`MAX_AHEAD`/`SIZE_FALLOFF`/`HORIZON_Y 0.46`/`SKYLINE_Y 0.2` | verify25c (64) |
| 23 | **Games**: `GameFrame` + GameBar v2 on all six, 100dvh boards, per-game headers/instructions gone, game-over post-mortem, misses → ReVue + `CORRIGER MAINTENANT`, credits once, desktop two-pane, galleries → ▶ Jouer + sheet | verify23 (70) |
| 24 | **Index**: chip rail + unit segments + 10 SIO rows, URL state, cells = how you did (device ledger), hubs → redirects, `?gaps=1`, row buttons | verify24 (58) |
| 26 | **/moi + teacher**: outcome rows, `HeatStrip` on 4 pages, thin /moi hero + 4 segments, teacher Class now (16 tiles, stuck detection, 30 s repoll), outcome × student matrix, one pooled fetch, Compute gone | verify26 (61) |
| bugs | deck gate/redirect, `NoDeck`, DeckContent on tokens, `/sio/[id]` → deep link, DEPLOY.md name, ONE "weak", ONE shuffle, D6/D7/D9/D10/D11, leaderboard identity, D4 sync diagnostic | verify27-bugs (81) |
| hero | **Home hero = a horizontal report card** (19 Aug): the two hairline bars gone ("no status bar"), chip rail gone, « Bienvenue sur FluOlinGo » heading back, counters now one row of value-over-label marks — level · streak · course · XP · lessons, + gems once earned; actions round, dropping below the marks on a phone | verify25 (19) |
| menu/nav | **HELP popup → Menu** (20 tiles, 4×5 phone / 5×4 tablet, no prose — /guide keeps the long form); registry regrouped to **six** families in Dan's 19 Aug order **Goals · Practice · Play · Review · Skills · User** — Goals now means the 50 objectives, the five pre-lesson activities became Practice | verify19c (10) |
| rail | **Side rail grouped**: six family flaps (Goals · Practice · SvPlay · Review · Skills · User), children under each, Unités under Goals | verify29-rail (22) |
| Track D | help-ladder spec + state machine + rule hints + `?`/WHY in every drill, evidence tagged, hinted items → ReVue, open-production feedback (`/api/feedback`, rule fallback), 22 eval cases | verify28-trackd (165) |

Shipped ≈ 147 of ~150 in-scope units.

## What is left

| # | Item | Units | Who |
|---|---|---|---|
| 1 | **Apply + deploy the 17 Aug patch series** (0001–0008, in order), then delete the merged branches below | 0.25 | Dan |
| 2 | ~~Home hero: keep the 11 Aug compact hero, or adopt Design's stat row?~~ **Dan chose the report card, 19 Aug** — built, verify25 rewritten to the new decision, screenshots in `work/hero-report-card/` | — | done |
| 3 | ~~3D map: swap the placeholder `HomeMap3D` for a real 3D build~~ **ported from Dan's Figma Make 19 Aug** (`pm/home-map-figma-3d`, replaces the CSS-perspective attempt of the same afternoon — Dan: "the 3D map is not yet 3D"). The Make's engine is intact in `src/lib/map3d/` (`projection.ts`: `pathXAt` / `cameraForward` / `project()`, HORIZON_Y 0.30 · CAMERA_Y 0.80 · FOCAL 3.8 · MAX_AHEAD 38; `sky.ts`: 8 clock keyframes, sun/moon arc, clouds, stars; `scene.ts`: Peers' ROADSIDE_ITEMS + seeded trees). **What differs from the Make and why:** stops from SIOS + `progress` (no mock, no stars / type badges / modal — a tap opens the SIO under the map; nothing dims); the Make's "Café de Paris / Le Campus…" are the repo's regions (HomeMap `REGIONS` + regionIcons on each world's gate sign, tap = open the unit; accent `--region-*`, ground `--region-*-band`); road keeps the 2D semantics (paved to 🚩, dotted beyond, travelled in the accent); classmates DROPPED (no safe per-learner stop source; leaderboard = name + XP only); colours are tokens (no hex — the ratchet did not move; sky keyframes are numeric RGB in `sky.ts`, see its header); Cahier body stack, not Nunito; camera = the box's native scroll (wheel / touch / keys / scrollbar) → one rAF → `camZ`; `?hour=N` pins the sky for screenshots. Knobs: `SCROLL_PER_STOP`, `CAM_MIN/MAX` (HomeMap3D.tsx), the projection constants + `WX` snake, `SKY_KF`, `MAX_BEHIND` (4 — lower it for less clutter behind the camera). Known: on a 390 phone the nearest stops stack vertically (the Make does too); the current stop is forced on top. verify25c (61) | — | done |
| 4 | Class flag: `CLASS_FLAG_SIO` in `src/content/chapters.ts` is hand-set (SIO-010) — move weekly or derive from the term table | 0.5 | agent |
| 5 | Ops: ruleset is active ✓; delete `add-claude-github-actions-…` (unmerged, `main` has its own workflows); `claude-review` billing in the Anthropic console; delete `import-fluoduo` on `dckg/fluo` | 0.5 | Dan |
| 6b | **French 4 (L'atelier A2, units 5–8, SIO-051–090)** — plan written, not started. Blocked on Dan's §10 answers + cahier/guide + manuel units 5–7. See `docs/planning/FRENCH4_SCALING_PLAN.md` | 2 + content | agent |
| 6 | Track D follow-ups: run the 22 eval cases against the deployed `/api/feedback`; teacher charts for `help.rung`; ÉcouTexte on the `?` ladder | 2 | agent |
| — | December: canonical `FD-` outcome IDs (Track A) | 8 | deferred |

Closed as non-issues (Dan, 17 Aug): `/teacher` on the CDN — the page is gated to
Dan's email; Firestore service-account key — being retired.

## Decisions Dan made on 17 Aug (do not re-open)

1. Home map = two views, 2D and 3D, learner toggles. 2D reference = Design's
   "FluOlinGo Home standalone". Band fills = `--region-*-band` tokens. 3D = Dan's own
   build — his Figma Make "3D Scroll Map Interface", ported 19 Aug (row 3 below).
   No more path reversals.
2. SIO-036/040 spec softened to content (description AND competence, CSV + `sios.json`
   in step). Do NOT run `scripts/gen-sios.mjs` (stale vs hand-edited `sios.json`).
3. `envies-besoins.json` 09/10 `gap` = `envie`.
4. Region **accent** hexes stay provisional (Design gave bands, not accents).
5. Firestore key: being retired — not a task. `/teacher`: gated to Dan's email — closed.

## Decision Dan made on 19 Aug (do not re-open)

7. **Menu, not HELP.** The popup is a grid of the twenty activities and nothing
   else. **Six families**, order `Goals · Practice · SvPlay · Review · Skills ·
   User` (Dan: "2a → 2b → 2e → 2c → 2d → 2f", and "Pre-Lesson = Goals").
   GOALS = the fifty objectives by unit then goal; the five that used to sit
   under it (SpecuLearn, xPlain, EtuDice, 4Mémoire, iComplete) are PRACTICE.
   `activitiesInFamilyOrder()` is the single reader — do not hand-keep a
   second list.
   **Side rail DONE** (same day): `RailGroups.tsx` replaces the rail's flat
   22-flap column with the six family flaps, each opening to its children.
   The Unités are Goals' children now, not a tier — a unit IS ten goals.
   Open state is per family in sessionStorage, read through
   `useSyncExternalStore` (patch 24's answer to the set-state-in-effect
   rule); the family owning the current page opens by default.
   verify29-rail (22), wired into CI after verify28.
   LEFT: the phone **☰ dropdown** still lists the activities flat — it was
   not in Dan's ask, but it is now the one surface disagreeing with the rail.

6. **Home hero = a horizontal report card.** Dan, shown Design's "FluOlinGo Home
   standalone" twice: *"the dashboard that wouldn't have a status bar, that is
   minimalist and that is a bit like a report card but horizontally."* This
   REVERSES the 11 Aug hero shrink — deliberately. Do not re-shrink it, do not
   put the hairline bars back: `verify25` now asserts the reversal (no
   `h-[3px]`, no `role="progressbar"`, the h1 greets again), so a re-shrink
   fails CI. Marks are numbers with a label under each; emoji left the values
   so six marks fit a 390px phone; XP shows `420/1k` with the exact figure in
   the tooltip; gems join the row only once earned (the 20 Jul zero rule holds
   for currencies, not for the five academic marks).

## Decisions awaiting Dan (all default to what was built)

- Games: hearts kept in NumBus/NumBourse/LexicaLater; Match It now behind sign-in.
- Home: "one unit per screen" = vertical band snap, not sideways paging.
- /moi: no time-on-task line any more (D6 sessions had no writer); Reviser "N weak" now
  counts fragile 1-day items too.
- Teacher: Class now added as first panel, Overview kept; the page reads all 16 logs on open.
- Track D: stuck thresholds (typed/cloze every wrong + 20 s idle; say 2 wrong / 30 s;
  MCQ every wrong); drills retry instead of ending on a wrong answer; WHY sits on the
  tray; feedback runs on ChaTutor's key (≈ $0.003/check).

## Branches

- merged/dead → delete: `claude/peers-vd2h6h`, `claude/sio-instructional-objectives-7bjv1a`,
  `claude/fluoduo-pr9-review-sync-8uoyfx`, `claude/api-necessity-i8fgps` (La Carte, folded in),
  `cursor/patch-19c-a214`, `cursor/drillshell-20-21-a214`, `cursor/teacher-cdn-exposure-a214`,
  `ship/patches-1-12`, `fluoduo/data-and-curriculum-fixes`, `add-claude-github-actions-…`,
  `claude/case-01n37qiwbywj63ebzdabdeht-status-b9muew` (its STATUS edit is superseded).
- Cowork PM patch series (17 Aug): `pm/*` existed only in the PM's workspace; they arrive
  as `git am` patches, not branches.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot,
  and CI runs every `verify/*.py` on every push.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).

---

# Notes per patch (17 Aug) — the detail behind the table

## Track D — what was done, what was left, what Dan must confirm (17 Aug, Peers)

Branch `pm/track-d-help-ladder` (on top of `pm/integration`), check =
`verify/verify28-trackd.py` (165 checks: the machine + generators run in
node, 66 rows; the 22 eval cases run against the rule grader). Spec =
`docs/TRACK_D_HELP_LADDER.md`.

- **One machine.** `src/lib/help/ladder.ts`: FRESH → TRY → HINT_1 → HINT_2 →
  REVEAL / RETRY_AFTER_REVEAL → DONE; pure, clock-free (`step(ladder,
  event)`). `useHelpLadder` is the React glue: records EVERY attempt through
  `recordItemResult` with the rung actually shown (`assistance`,
  `hintsTaken`, `revealed`, so `independent` is true only for first-try
  no-hint), queues a hinted/revealed item for ReVue when it closes
  (`queueForReview`, due now), logs `help.rung` per transition (+ the old
  `hint.tap`/`answer.reveal` with `auto`). The Finale keeps its five-rung
  ladder (now in `hints.ts`).
- **"Stuck" — Dan to confirm the numbers** (`LADDER_CONFIG`): typed/cloze
  climb on every wrong try and after **20 s** idle (hints only — idle never
  reveals); say after **2** wrong / 30 s; MCQ on every wrong pick, no idle,
  no cold hint; flashcard test may reveal cold; reveal never before one
  attempt anywhere else. Every hinted or revealed item is queued for ReVue
  at interval 0 (a clean retype after a reveal is NOT credited an
  interval) — confirm that is the intended severity.
- **Drills changed behaviour** (Dan should try them): iComplete/GramMarathon
  no longer end on a wrong answer — the tray says "Not yet · Try again", a
  hint chip appears, the field stays live; the third wrong shows the answer
  and asks for it to be typed ("Type it"). EtuDice/SpecuLearn/lesson MCQ: a
  wrong pick is struck and the learner picks again (≥ 3 options); the second
  wrong reveals. 4Mémoire test: `?` replaces 💡 Révéler. WorDrill: the 🔤
  peek is the answer rung (recorded), two misses climb by themselves.
  First try scores; every try is a response record.
- **The `?` control lives in the shell bar** (with rung dots), the hint
  chips under the item, WHY at the tray's right — not "top right of the
  answered question" as AGENTS.md words it; the tray IS where the answered
  question's verdict lives. Dan to say if WHY should move.
- **Evidence enum unchanged.** Post-reveal recall is `status met +
  assistance "answer"`; there is no `evidenceType: "assisted-recall"`
  (adding one = firestore.rules deploy). Readers derive it.
- **Row 7 = the lesson end "SIO write"** (`OpenFeedback`): one free
  sentence on the SIO's can-do; Correct me / Model answer;
  `functions/api/feedback.js` on **ChaTutor's key** (`ANTHROPIC_API_KEY`,
  OpenRouter, `anthropic/claude-haiku-4.5`, Mistral fallback,
  `TUTOR_MODEL` override) — **cost ≈ $0.003 per check**, ~500 tokens; no
  new env var. 8 s budget then the rule grader (cloze tiers + word diff)
  answers, same shape. Model answer = the deck's first authored `example`
  (13/44 decks; the rest get screening only). No XP paid. Dan to confirm the
  provider/cost and whether ComposeIt / the /tts proofreader should move to
  this schema (not touched).
- **ÉcouTexte** is not on the `?` ladder (multi-blank sheet, own
  per-sentence reveal); a check after a reveal is now recorded as
  `assistance: answer` and queued. Pretests stay cold. The `dictation` and
  `ordering` kinds are specified and generated but no drill uses them
  yet.
- **Not done:** the LLM path of the eval cases has not been run against a
  deployed `/api/feedback` (no key here — run
  `curl -X POST /api/feedback` per case after deploy; `expect` in
  `evalCases.json` is the pass mark); the SioModal popup forms of
  iComplete/GramMarathon show hints inline (no shell bar there); no
  per-error 🔊; the teacher dashboards do not yet chart `help.rung`
  (`auto` vs asked, rung reached) — the events are flowing.
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the
  last build and commit); harness `work/trackd/serve.py` + `shoot.py`
  (untracked, no .png committed).

## Loose bugs + data-truth — what was done, what was left (17 Aug, Peers)

Branch `pm/bugs-data-truth` (on top of `pm/integration`), check = `verify/verify27-bugs.py`.

- **Deck gates.** `/decks/[id]/study` for a curated id only ever redirected to
  `/practice/flip-it/<id>`, but the redirect sat inside `AuthGate` — a
  signed-out learner was asked to sign in to be sent somewhere that has its
  own gate. The redirect now runs first. `/decks/[id]` itself is NOT a redirect
  any more (patch 20–21 made it the 4Mémoire table), so it stays gated.
- **`No deck specified.`** was on three routes (`/decks/view|study|mcq`
  without `?id=`) → one `NoDeck` empty state inside the shell, "Open the
  Index". Not the deck-`[id]` `NotFound` (that one already had doors).
- **DeckContent.tsx** on cahier + tier + drill-bad tokens; 19b baseline
  re-run (`--rebaseline`): 904 → 773 stock classes, 542 → 506 raw hex.
- **`/sio/[id]`** — nothing linked to it except KeyNav's two-digit jump, and
  Home's popup (SioModal → SioDetail) is the same content, so it is a
  redirect to `/?unit=N#SIO-0NN` (the fifty static pages still build for old
  links/QR). KeyNav opens the popup on Home (sets the hash when already
  there). The "Planned" pre-test label was the same `getPretestForSio` logic
  the popup uses — if Dan still sees "Planned" where a pre-test exists, it
  is a `PRETEST_BY_SIO` gap in `content/pretests`, not a page bug.
- **DEPLOY.md** says `fluolingo-dot-com` (was `fluoguo`); banner kept.
- **`LAF1201` stays in the meta description** — decision recorded next to
  the string in `layout.tsx`: it is the course code people search for;
  English first, no French.
- **One "weak"** — `progress.ts`: `WEAK_BELOW = 50`, `GOOD_FROM = 75`,
  `tierFor(pct)`, `isWeakSrs(srs)` (interval ≤ 1 day: just missed, or
  repaired-but-fragile). Callers: outcomeRows `tierToken/tierClass` (the
  ledger re-exports them), the teacher's `missColor` (was miss ≥ 50/25 —
  off by one at 75 %), the Reviser's weak count (was interval === 0 — now
  counts fragile items too, so the "N weak" chip can read higher), /moi's
  signed-out SRS rows, the Finale's weighting.
- **One shuffle** — `src/lib/shuffle.ts` (Fisher–Yates, injectable rand):
  5 biased `sort(() => Math.random() - 0.5)` sites (conjugaison, three
  native lessons) and 17 private copies replaced; 24 files import it. The
  seeded ones (deck MCQ `stableShuffle`, Finale `mulberry32`) untouched.
- **D6 / D7 = the smaller fix, delete the readers.** `users/{uid}/sessions`
  had no writer in this repo (the old suite's docs carry a null activityId)
  and `users/{uid}/attempts` was never written. Teacher panel: time on task
  is the page-view estimate only; the "Attempts" KPI is now "Answers" =
  recorded responses; /moi lost its "⏱ N min on task" line (it was empty
  for anyone post-reset). `firestore.rules` still shapes both collections —
  harmless, left for the next rules deploy.
- **D9 delete / D10 round-trip.** `retried`/`mastered` were never written
  (`recordResponse` stores `met`/`missed` only) → gone from every reader
  (`isMiss = missed`; the rules enum still lists them, harmless). The
  evidence block (`outcomeId`, `evidenceType`, `assistance`, `assistCount`,
  `independent`) was written since 10 Aug and read by nothing → teacher
  `data.ts` parses it, `outcomeOf(answer)` prefers the stored `outcomeId`
  over the item join (every fold, ClassNow, the recent-answers table), the
  teacher's Recent answers gained an "Evidence" column, /moi carries
  `outcomeId` through. `assistCount` is stored but not shown (nothing asks).
- **D11.** `mergeProgress` already kept `timeZone` on this branch's parent,
  but as `local ?? remote` — the zone could belong to the OTHER device's
  `lastActiveDay`. It is now a pure module (`src/lib/progressMerge.ts`,
  re-exported by progressSync) that pairs the zone with the winning day, and
  verify27 runs a 15-row merge table in node (`--experimental-strip-types`).
- **Leaderboard identity.** `boardName(uid, displayName)` in
  `accountAliases.ts` = alias → display name → "Anonymous" (the publisher
  used to fall back to the email's local part). The board marks "(you)" on
  the folded canonical row for an aliased learner on her second account.
- **D4 diagnostic (cannot reproduce here).** `progressSync.push` stamps
  `lastSyncedAt` + the device's `lastSyncError`/`lastSyncErrorAt`/
  `syncErrorCount` on the progress doc; every pull/push failure is kept in
  `fluolingo:syncState` and sent as a `sync.error` event (separate
  collection — a rules denial on the doc still gets out). Teacher student
  panel "Last sync": red **STALE — active <when>** when the learner's newest
  event is > 12 h past the doc, plus the error count and last message. In
  week 1 Dan opens the two learners and reads the KPI.
- **Not done:** replaying `responses` into the device ledger after sign-in
  (patch 24's note); a rules edit dropping `sessions`/`attempts`/the two
  statuses (needs a deploy); the plan's "delete `import-fluoduo` on
  dckg/fluo" (needs push access — Dan).

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
