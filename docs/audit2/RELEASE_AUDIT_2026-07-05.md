# FluoLingo — 360° Release Audit (2026-07-05)

Third full round, run against the same canonical spec (*"The Ideal Language
Learning Portal: Integrated Research Blueprint"*) and the same four streams as
v2 (2026-07-04). Method is unchanged and load-bearing: **the app was driven, not
just read.** `npx tsc --noEmit` + `npx next build` both clean; the static export
(`out/`) was served with `python3 -m http.server 8899` and driven headlessly
with playwright-core / chromium at **both 1280×900 and 390×844**, localStorage
seeded to skip tours + beta notice, `page.on('pageerror')` wired on every page.
72 page loads + 8 interactive journeys. Baseline for deltas is v2 (register
R1–R13, ops O1–O2).

## Executive summary

The build is **healthier than v2 and still launch-grade**: TypeScript clean,
`next build` green at **701 static pages / 700 HTML files**, and **zero
pageerrors across 72 loads and every interactive journey** (tutor, café,
leaderboard, custom-deck builder, Unit-0 mark-done, Vocabularain base-tap, Flip
It, pretest→lesson). Three v2 HIGH/MEDIUM items are genuinely **fixed in code**:
hearts are removed (R6), the dead nationalities rain link stays gone (F1), and
the flagship pretest loop now **persists** (R1 — `fluolingo:pretest.v1` survives
popup close, plus a `/teacher` gap view). The ~18 new PRs land real motivation
and pedagogy surface (leaderboard, AI tutor, AI café, custom decks, per-item SRS
write-back from the drills).

**But the mobile stream — which the brief rightly weights — surfaced one fresh
regression the "phone-width" PRs missed:** the Vocabularain / Letris game HUD
(Score · ? · 🔇 · 🗣️ · Pause · Restart + volume slider) is a **non-wrapping**
flex row that runs **84 px off the right edge at 390 px**, pushing Pause/Restart
and the volume slider off-screen and giving the two most-played games a
horizontal scrollbar on every phone. It is a one-line CSS fix but it is
learner-visible on the marquee game. No code **blocker** exists; this is the one
code item worth fixing before the domain is pointed at it.

**Verdict: SHIP-AFTER-FIXES** — same posture as v1/v2. The only *code* item on
the pre-launch list is H1 (mobile HUD wrap). Everything else gating launch is
Dan-side ops already known: deploy `firestore.rules`, set `ANTHROPIC_API_KEY`,
flip `REQUIRE_SIGN_IN`, host clean-URL/404 routing.

## Scores

| Dimension | v2 | today | Δ | One-line justification |
|---|---|---|---|---|
| Content quality | 96 | **96** | 0 | No regressions; legacy MCQ port added 52 vetted Qs / dropped 743 — curation discipline held; café/tutor copy sound |
| Technical readiness | 93 | **94** | +1 | tsc clean; 701 pages build green; 0 pageerrors over 72 loads + 8 journeys; hearts/R1/F1 resolved — minus one new mobile overflow |
| Pedagogical readiness | 86 | **88** | +2 | R1 pretest persistence real (+ picked distractor now stored); drills write per-item SRS (`recordItemResult`); teacher gap view; café adds constructive output |
| Motivation & engagement | 85 | **88** | +3 | Leaderboard, confetti+jingles, café, tutor, home hero/Continuer; hearts (anti-pattern) removed for streak-from-practice |
| UX readiness | 81 | **82** | +1 | Home hero, Guide/About, flap hints, Index-hosted deck library, Flip It de-burgered — but Flip It still railless and the new mobile HUD overflow |
| Visual polish | 76 | **78** | +2 | Unit hues, activity colour chips, accent bar, stage confetti, welcome hero |
| Performance | 80 | **79** | −1 | Firestore chunk (171 KB gz) still off the home critical path but now also on activities.html + decks/new; bundle grew (leaderboard/tutor/firebase) |
| Accessibility | 78 | **76** | −2 | **Still zero `aria-live` product-wide** (grep = 0); new mobile HUD overflow hides controls; game/drill pills still ~30 px targets |
| **Overall release readiness** | 84 | **85** | +1 | Real pedagogy + motivation gains and two HIGH items retired outweigh the a11y/perf dips and the one new mobile HIGH |

## Blueprint conformance (brief — see v2 audit2-pedagogy.md for the full matrix)

The v2 verdict still stands — *"a learning portal in kind, a Leitner box in
degree"* — but this session narrows two of the named gaps:

- **Authentic use (was 20%)** and the **input layer** gap are now *architecturally*
  addressed by the **AI café** (free-text + fixed-phrase composition, waiter
  reply) and the **AI tutor** (grounded chat) — *conditional on
  `ANTHROPIC_API_KEY`.* Locally both run in the rule-based / "pas encore branché"
  fallback (verified), so the credit only fully lands once the key is deployed.
- **Continuous diagnosis (was 35%)** improves: pretest verdicts now persist with
  the *picked distractor* retained, and the drills feed a per-item SRS. The
  **games** (rain / matching) still write nothing back — R4/R8 below.
- **Motivation surface** gains a real **leaderboard** (blueprint-sanctioned
  social comparison), correctly **read-gated** behind sign-in.

Net: conformance nudges up but the shape is unchanged — the back half of the
spine still lags the crown-jewel pretest loop.

## What changed since v2 (this session's ~18 PRs — verified state)

| Area | PR(s) | Driven-state today |
|---|---|---|
| 🏆 Leaderboard | #71 | Loads clean; **signed-out gate shown** ("Sign in to see the board") ✓. Writes need Firestore rules (Dan) |
| 🤖 AI tutor | #71,#73 | Degrades to **"pas encore branché 🔌"** card + laf1201 fallback link when `/api/tutor` 404/503s locally ✓ |
| AI café | #48,#68,#73 | **Free-text input** (`…ou tapez ici`) + fixed-phrase chips (Je voudrais / un café…); **rule-based waiter replies** with no backend ✓ |
| Custom decks | #62,#65–#67 | `/decks/new` builder loads; **accent bar 14 accents** (é è ê ë à â ç î ï ô…) ✓; **SIO picker** present ✓; library moved to Index. Save gated on Firestore rules (Dan) |
| Legacy MCQ port | #72 | 52 vetted Qs kept, 743 dropped (see LEGACY_MCQ_AUDIT_2026-07-05.md) |
| Per-page tours + beta notice | #58,#59,#68 | `FirstTour`/`BetaNotice` present; seeding suppresses them; no errors |
| Jingles + confetti | #59,#68 | Wired in PretestQuiz, Lexicalator, LetrisGame, ComposeDialogue, sfx/chiptune ✓ |
| Guide / Home / About | #60,#61,#63 | All load clean; home hero (Bienvenue, Continuer, stat chips, progress bar) |
| Flap hints | #64 | Action-verb hints present under activity names |
| Flip It de-burger + step column | #69,#74 | Burger gone, step column added — **but still no deck/lesson rail** (R9 below) |
| Phone-width fixes | #74,#75 | Unit-0 grid → **3 cols @390** ✓; saved desktop width no longer applied below rail breakpoint ✓ |
| Unit-0 mark-done | #76 | Button present in popup; **writes `fluolingo:progress`** ✓ |
| Tappable rain bases | fb59f6f | Category bases render as `cursor-pointer` (ILS ONT / IL EST…), 44 px tall, in-view, tappable ✓ |
| parler + article fix | #73 | (source; not independently regression-driven this round) |
| Hearts removal | (progress.ts) | **Hearts REMOVED** — "punished errors" per blueprint; streak now from practice ✓ (R6 resolved) |

## Open issue register — ranked by severity

### BLOCKER
**None.** Build clean, zero pageerrors, no crash in any driven journey.

### HIGH
- **H1 · NEW · Mobile: Vocabularain / Letris HUD overflows the phone viewport.**
  `src/games/letris/LetrisGame.tsx:540` — the header is `flex flex-wrap` but the
  inner controls row `div.flex items-center gap-2 font-mono text-sm` has **no
  `flex-wrap`**; Score pill + ? + 🔇 + volume slider (`w-20`, added #69) + 🗣️ +
  Pause + Restart sum to **458 px**. **Repro:** 390×844 → `/games/letris/countries.html`
  (or any set, or `/hidden/vocabularain.html`) → `document.documentElement.scrollWidth`
  = **474 > 390**; Restart's right edge = **474 px** (off-screen), volume slider
  and Pause partly clipped; page gets a horizontal scrollbar. Board itself is
  fine and tappable — this is the control strip only. **Fix:** add
  `flex-wrap justify-end` to the row (and/or drop `w-20`→`w-16` on the slider).
  <1 h. Affects the two most-played games on every phone.
- **H2 · carry (Dan-side ops, not code) · Sign-in / progress posture (v2 R2/O1).**
  `REQUIRE_SIGN_IN=false` (`src/lib/authConfig.ts:11`) intentionally suspends the
  wall for dev; progress is localStorage-only; leaderboard + custom-deck + teacher
  gap **writes** need `firestore.rules` published. Launch-day toggle + paste-and-
  publish, not a code fix.

### MEDIUM
- **M1 · R7 still fully open · Zero `aria-live` product-wide.** `grep -rn aria-live
  src/` = **0**. Wrong-answer feedback in several games is border/colour only;
  game/tutor icon-buttons carry `title` but no persistent label; no shared TTS
  mute. Screen-reader + colour-blind learners get no signal. aria batch.
- **M2 · R9 partly open · Flip It has no deck/lesson rail.**
  `FlipItContent.tsx` renders only `VIEW_TABS` (Overview / Cards / All Cards) +
  a top-bar **Home** link (`:161`); no 📚 Lesson tab, no sibling activity tabs
  (confirmed at 390 and 1280 — tab list empty of Lesson/Say It/etc.). It remains
  the sole activity from which a learner cannot reach the lesson or siblings
  without going home. De-burgering (#69) did **not** add the rail.
- **M3 · R3 partly open · Launch-surface unification.** Improved (deck library
  moved to Index; F1 dead link gone; Unit-0 mark-done added) but the popup-flap
  / rail / Index / chip link sets are still assembled independently rather than
  from one `activityLinksFor(deck)` source — regressions like H-family recur
  because there is no single list.
- **M4 · R4/R8 partly open · Games don't feed the scheduler; dual content store.**
  Drills now call `recordItemResult` (`complete-it`, `say-it`, `grammarathon`,
  `dice`, `flip-it`, lexicalator) — real progress since v2. But **rain
  (`LetrisGame.tsx`) and matching write nothing** to SRS, and rain still runs on
  the **legacy `src/content/*.json` store** (avoir-etats.json, countries-letris.json,
  …) separate from `content/collections/*` — blueprint design-mistake #17, still
  present.

### LOW
- **L1 · R13 carry · Tap targets ~30 px.** Letris HUD pills (`px-2.5 py-1`,
  `LetrisGame.tsx:484`) and several drill controls are ~28–30 px vs the 44 px
  guideline (rain *bases* are a healthy 44 px).
- **L2 · Perf.** Firestore chunk 171 KB gz — off the home critical path (home
  HTML references it 0×) but eagerly on `activities.html` + `decks/new.html`;
  fonts still multi-family / 26 woff2. Idle-prefetch the chunk on those two pages.
- **L3 · F5 carry · GramMarathon apostrophe-gap grading edge** (`normalize()`
  strips `'` → bare `d` accepted where `de` is rejected). Judgement call.
- **L4 · O2 carry (Dan-side hosting).** Naive host (python server) doesn't resolve
  clean URLs and serves a raw 404, not branded `out/404.html`. Cloudflare Pages
  config must map `.html` extensionless + the 404. Reproduced, not a code fix.

**Resolved since v2:** R1 (pretest persistence ✓), R6 (hearts removed ✓), F1
(nationalities rain link gone from built output ✓), F3/F4 (weather/directions
hubs dissolved — moot ✓), F7 (double "← FluoLingo" gone ✓).

## Prioritized action plan

**Pre-launch (code):**
1. **H1** — add `flex-wrap` to the Letris/Vocabularain HUD row (<1 h). The only
   code item between here and a clean phone experience.

**Pre-launch (Dan-side ops, already known):** deploy `firestore.rules`; set
`ANTHROPIC_API_KEY` on Cloudflare Pages; decide `REQUIRE_SIGN_IN`; configure
host clean-URL + branded 404 (L4); one real-device pass (mic/TTS/music/confetti).

**First post-launch week:** M1 aria-live/mute batch → M2 Flip It rail + Escape →
M3 `activityLinksFor(deck)` single source → M4 rain/matching SRS write-back and
rain store unification → L1 tap targets → L2 chunk prefetch.

**Postpone:** full FSRS (per-item ladder is the right first step); multidimensional
mastery UI; graded-reader input layer (design with Dan once café/tutor prove out).

## Final recommendation

**SHIP-AFTER-FIXES.** The codebase does not block launch: clean typecheck, clean
701-page build, zero pageerrors across a wide driven sweep, and two of v2's HIGH
items genuinely retired. The single **code** thing worth doing before pointing the
real domain at it is **H1** (mobile HUD wrap — a one-line CSS change on the
marquee game). Everything else on the launch gate is the known Dan-side ops list
(Firestore rules, API key, sign-in toggle, host routing) — none of them code. New
café/tutor/leaderboard/custom-deck surface all degrade gracefully in their
backend-less state, so nothing ships broken even before the keys land. Against its
declared A1-companion scope this is a faithful, working, and now noticeably
richer implementation.
```
Scores: Content 96 · Technical 94 · Pedagogical 88 · Motivation 88 · UX 82 ·
Visual 78 · Performance 79 · Accessibility 76 · Overall 85 (v2 84 → +1)
```
