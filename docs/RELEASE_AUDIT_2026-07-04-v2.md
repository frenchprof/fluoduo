# FluoLingo — 360° Release Audit v2 (2026-07-04, evening)

Round 2, run against the canonical spec: **"The Ideal Language Learning Portal:
Integrated Research Blueprint"** (36-page PDF, July 2026) — the first audit round
used a stand-in framework; this one grades the real thing. Four streams
(pedagogy/blueprint conformance · functional + learner journeys · UX/cognitive
load/delight · accessibility/performance); full stream evidence in
`docs/audit2/*.md`. Fixes applied same-day are marked ✔.

## Executive summary

Functionally, the portal is launch-grade: ~60 pages driven headlessly, four full
learner journeys completed end-to-end, **zero crashes, zero page errors**, one
HIGH bug (dead nationalities rain link — ✔ fixed same day). Content remains
near-flawless. Accessibility rose 62 → 78 and performance's biggest tax (a
167 KB gz Firestore chunk on every page) is ✔ out of the critical path.

Against the *blueprint*, the story is honest and useful: FluoLingo nails the
front half of the spec's spine (one content store → many projections, 85%) and
the pretesting loop (~90%, the app's crown jewel), but the back half —
continuous diagnosis (35%), adaptive retrieval (40%), authentic use (20%) — is
thin. The verdict phrase from the conformance stream: **"a learning portal in
kind, a Leitner box in degree."** Crucially, the four biggest gaps are all
[EST]-graded in the blueprint (established science), while the crown jewel
implements an [EMG] effect — the improvement budget should flow toward
FSRS-grade spacing, an input layer, multidimensional mastery, and the teacher
gap report.

## Scores

| Dimension | v1 | v2 | Notes |
|---|---|---|---|
| Content quality | 96 | **96** | unchanged; 5 pretest ambiguity fixes landed between rounds |
| Technical readiness | 92 | **93** | zero errors anywhere; F1 fixed same-day |
| Pedagogical readiness | 88 | **86** | graded against the real blueprint now (see fidelity scores) |
| Motivation & engagement | 85 | **85** | hearts ruled an anti-pattern by the blueprint — removal pending |
| UX readiness | 78 | **81** | launch surfaces + vocabulary unification still open (U1/U3) |
| Visual polish | 75 | **76** | cahier/fluo/slate mixing unchanged (U9) |
| Performance | 74 | **80** | ✔ Firestore off the critical path; fonts still 5 families |
| Accessibility | 62 | **78** | A1-A4 verified; aria-live, mutes, touch targets remain |
| **Overall release readiness** | 81 | **84** | |

## Blueprint conformance (full matrix: docs/audit2/audit2-pedagogy.md)

Core-thesis spine: content store **72%** (the rain game still runs on a
duplicate legacy store — the spec's design-mistake #17 verbatim) · projections
**85%** · continuous diagnosis **35%** (binary correctness only; picked
distractors discarded; pretest results never persisted) · adaptive retrieval
**40%** (fixed 1/3/7/14-day ladder; most-played games write nothing to it) ·
authentic use **20%** (classroom-owned by design) · human-in-the-loop **80%**
(division of labour directionally right; zero teacher instrumentation).

8 non-negotiable commitments: range 15–65%. Weakest: #2 massive comprehensible
input (25% — no reading/listening layer exists), #4 spaced retrieval built into
everything (~35% vs FSRS-critical [EST]), #8 autonomy trajectory (15%).
Strongest: pretest loop, meaning-adjacent drills, interleaved revision mixes.

ICAP in-app mix ≈ Interactive 0 / Constructive 30 / Active 40 / Passive 30 vs
target ≥15/≥25/≥30/≤30 — only Interactive fails, and it is classroom-delegated.

AI integration: **factually zero** (browser TTS/ASR only). All "AI must never"
rules trivially satisfied; the blueprint's MVP "grounded AI conversation" is
absent — acceptable for a declared A1 companion.

**Fidelity scores:** Educational 88 · Pedagogical 74 · Architectural 76 · UX 81
· AI readiness 20 (scoped-out) · Accessibility 78 · Technical 93 ·
Extensibility 78 · **Overall blueprint conformance 68 raw / 80 adjusted** for
the declared companion-app scope.

## Fixed same-day ✔

- F1 (H) dead 🌧️ link for nationalities on 3 surfaces → rain links now gated on
  the actual set registry everywhere
- P1 completion: `usage.ts` static Firestore import cut — chunk now loads only
  after the `load` event (idle prefetch), never in the critical path
- F3 weather hub said "32 expressions" (deck has 23) · F4 hub tile still said
  "Practice map" · F5 GramMarathon now accepts *de* for an elided *d'* gap ·
  U5/F7 duplicated "← FluoLingo" removed on 4 pages

## Open issue register (post-fix)

| # | Sev | Issue | Fix | Effort |
|---|---|---|---|---|
| R1 | H | Pretest results are never persisted → no learner "bring to class" list, no teacher gap report — the flagship PRIME loop evaporates on popup close | persist misses per SIO; render list in popup + a teacher view | M |
| R2 | H | Sign-in paradox: all practice auth-gated, all progress localStorage-only (`srs.ts` unwired) | wire progress sync, or drop the gate | M |
| R3 | H | Launch surfaces still disagree (popup flaps vs rail vs chips vs Index) — e.g. rain reachable from popup but not from any Cahier page | one `activityLinksFor(deck)` source of truth consumed by all four | M |
| R4 | H | Scheduler is a 4-rung Leitner ladder; rain/matching/weather write nothing to spacing | log results from all games; one-generation scheduler upgrade (per-item ease) | M–L |
| R5 | M | Feedback vocabulary: 5 dialects, 10 restart labels, 7 score formats, 4 home-link labels ("← Back to lessons" points home) | adopt the unified vocabulary in audit2-ux.md (file list included) | S–M |
| R6 | M | Hearts = blueprint anti-pattern ("punishes errors" [EST]) | remove hearts; streak-from-practice instead | S |
| R7 | M | Zero `aria-live` product-wide; unnamed controls (DiceTrainer 🔊🎲🏁, Flip It row checkboxes ×50, title-only pills); no TTS mute in 6 activities | aria batch + shared persisted 🔊 toggle | M |
| R8 | M | Dual content store for rain (`src/content/*.json`) — blueprint design-mistake #17 | generate rain sets from collections at build time | M |
| R9 | M | Flip It: only activity without the deck rail (no 📚 Lesson tab; sole exit is home); ⚙ popover ignores Escape; option overload (9 control clusters) | add rail link row; Escape; regroup options | M |
| R10 | M | Zero-French blockers: French-only mic alert (Say It), French placeholders in drills, DiceTrainer French chrome on first lesson | English fallbacks/hints at first-use | S |
| R11 | M | No focus trap in SioModal (Shift+Tab escapes); Practice Index `<th>` lacks scope; emoji headers tooltip-only on touch | trap + scope + visible header row on touch | S |
| R12 | M | Mastery is a single boolean vs blueprint's 8 dimensions; no latency/confidence capture | schema first (LearnerItemState), UI later | L |
| R13 | L | Touch targets 28–30 px (best practice 44); ink-soft small labels ~4.3:1; All-Cards group headers are divs; fonts 5 families/150 KB; Letris keydown rebinds per tick; lesson step numbering skips 4; two identical 🎲 buttons on lessons; rain study table not re-peekable; `/pretests/picture/*` orphaned | batch polish | S–M each |

## Prioritized action plan

**Top 10 next:** R1 gap report → R3 launch-surface unification → R5 vocabulary
batch → R2 sync-or-ungate decision (Dan) → R6 hearts removal (Dan sign-off) →
R7 aria/mute batch → R9 Flip It rail+Escape → R10 zero-French batch → R8 rain
store unification → R4 scheduler upgrade.

**Quick wins (<1 h each):** R5 strings, R6, R9 Escape, R10, R11, half of R13.

**Postpone (don't rush):** full FSRS (do the one-generation upgrade first),
input layer (design with Dan — graded readers from atelier texts is the cheap
path), AI conversation practice, custom-deck games, multidimensional mastery UI.

**Remove:** hearts (R6); `/pretests/picture/*` route if it stays unlinked.

**Expand (disproportionately strong):** the pretest→WHY loop (make its data
persistent — R1 turns the best feature into the teacher bridge); the weather
mastery cycle (blueprint-grade scaffolding removal — replicate the pattern in
one more game); revision interleaving; the gap/cloze engine (Correct It next).

## Final recommendation

**Release After Critical Fixes** — unchanged from v1, and the critical list is
still operational, not code: O1 signed-in retest, O2 host clean-URL routing +
404, O3 one real-device pass (mic/TTS/music), plus deploying the updated
Firestore rules. Nothing in the codebase blocks launch today; R1–R3 are the
highest-value improvements to ship in the first post-launch week. Against its
own declared scope (strands 3–4 companion to a taught course), the portal is a
faithful, working implementation — the blueprint gaps are a roadmap, not a
verdict against shipping.
