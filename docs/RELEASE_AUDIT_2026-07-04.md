# FluoLingo — 360° Release Audit (2026-07-04)

Four audit streams run against the built static export (headless Chromium) and full source:
content correctness · functional QA · consistency/dead-text · accessibility/performance.
Pedagogical review done against the PRIME/Nation/Merrill/DeKeyser/ICAP framework document.

## Executive summary

The portal is functionally sound and pedagogically coherent. **Zero console errors, zero
crashes, zero broken learning flows** across 50 decks × all activities, 24 native lessons,
20 rain sets, and the home hub. French content is near-flawless (1 real error in 623 items,
already fixed). What separates this from "ready" is a **polish and access layer**: dialog
keyboard behaviour, colour contrast in one game, motion preferences, ~2.2 MB dead legacy
HTML, a heavyweight Firestore import on every page, and a set of terminology/feedback
inconsistencies that make one product feel like three eras of product.

**Verdict: RELEASE AFTER CRITICAL FIXES** — where "critical" for a public university course
means: the accessibility floor (dialog Escape/focus, contrast, reduced-motion), the Enter-key
drill rhythm, the auth-gated path retested, and host routing configured. Everything else is
staged polish.

## Scores

| Dimension | /100 | Basis |
|---|---|---|
| Content quality | **96** | 623 items: 0 gender/article errors; all syllables+gaps machine-verified; 1 French error found & fixed |
| Technical readiness | **92** | 0 page errors anywhere; 1 Medium (Enter flow), rest Low |
| Pedagogical readiness | **88** | Strong DeKeyser/pretesting/noticing implementation; ICAP top tiers live in class, not portal |
| Motivation & engagement | **85** | Weather-cycle mastery ladder, hearts, hi-scores; rain scoring opacity noted |
| UX readiness | **78** | 3 launch surfaces disagree; feedback in 3 dialects; dead links/orphan routes |
| Visual polish | **75** | cahier / fluo / slate-* systems mixed on sibling pages |
| Performance | **74** | Runtime healthy (FCP <170 ms); 184 KB gz Firestore on every page; 2.2 MB dead HTML; 540 KB fonts |
| Accessibility | **62** | Keyboard games mostly pass; dialog semantics, contrast, reduced-motion, aria-live all missing |
| **Overall release readiness** | **81** | |

## Issues

Severity: C=Critical (blocks release) · H=High · M=Medium · L=Low. Effort: S/M/L.

### Accessibility & input
| # | Sev | Issue | Location | Fix | Effort |
|---|---|---|---|---|---|
| A1 | C | SioModal: `role="dialog"` but no Escape, no focus trap, no initial focus | src/app/SioModal.tsx | Escape handler + focus ✕ on open + trap | S |
| A2 | C | White text fails contrast on rain palette (2.09–2.54:1) and fluo-secondary/danger buttons | src/games/letris/LetrisGame.tsx PALETTE; globals.css | Darken palette / switch to dark text | S |
| A3 | C | No `prefers-reduced-motion` handling (infinite rain, belt, blink) | globals.css + game CSS | Media query kills decorative animation | S–M |
| A4 | H | F1: Enter dead after Check in Complete It / GramMarathon / ConjugaZone — must mouse "Next" | all three *Content.tsx | Focus submit button when result set | S |
| A5 | M | ~12 emoji-only controls without accessible names; flag `title` dead on touch; no `aria-live` for feedback | Letris pills, BonusTrainer, Hear-it buttons, Flip It flags | aria-label batch; aria-live on feedback rows | S |
| A6 | M | Auto-TTS unmutable in DiceTrainer/ConjugaZone/Complete It/GramMarathon (others have toggles) | those components | Shared 🔊 toggle (persisted) | S |
| A7 | M | Touch targets under 40 px (cahier-btn-sm 28px, toggles 18–20px, checkboxes 17.6px) | globals.css | Bump paddings/hit areas | M |
| A8 | L | No `:focus-visible` styling for buttons; Escape doesn't close Flip It ⚙ popover | globals.css; FlipItContent | Add both | S |

### Performance
| # | Sev | Issue | Location | Fix | Effort |
|---|---|---|---|---|---|
| P1 | H | Firestore (184 KB gz) statically imported into root layout via FeedbackButton | src/components/FeedbackButton.tsx | Dynamic import on submit | S |
| P2 | M | 2.2 MB dead drchan HTML ships in export; iframe fallback is dead code (all 24 lessons native) | public/lessons; app/lessons/[slug]/page.tsx | Delete both; drop `file` field | S |
| P3 | L | 5 font families (540 KB); woff2 preload warnings; Letris rebinds keydown per tick | layout fonts; LetrisGame | Trim families; hoist listener | M |

### UX / consistency
| # | Sev | Issue | Location | Fix | Effort |
|---|---|---|---|---|---|
| U1 | H | Three launch surfaces offer different activity sets for the same deck (popup flaps vs tab rail vs chips) | SioModal / CahierShell / SioDetail | Single source of truth for activity list | M |
| U2 | H | Dead links: "← Apps & Games" (no such page) on legacy /games pages; Flip It "← Practice Zone" → home | games/* pages; FlipItContent | Point home with honest label | S |
| U3 | M | Feedback in 3 dialects (✅ Parfait ! / Correct! / ✔ Correct !); restart labels ×7 variants; 2 score formats | drills, DiceTrainer, dice Practice | One feedback + restart vocabulary | M |
| U4 | M | Lexicalator emoji ⚙️ in SioModal vs 🧰 everywhere; MCQ ❓ vs 🎯 collides with ConjugaZone | SioModal.tsx:64 etc. | Standardise 🧰; re-emoji MCQ | S |
| U5 | M | Duplicated "← FluoLingo" twice in same top bar (crumb duplicates shell link) on 4 pages | Complete It/ConjugaZone/GramMarathon/Réviser | Drop crumb link | S |
| U6 | M | Unreachable dead code: LOCKED_UNITS branch, "Coming soon" flap/chip branches; stale texts ("Unlocks the next objective", "speed drill", stale Flip It helper, layout metadata) | SioHub, SioModal, SioDetail, MarkDoneButton, PretestContent, FlipItContent, layout.tsx | Delete branches; correct texts | S |
| U7 | M | Orphan routes: /pretests/picture/* (no inbound links), legacy /games/{weather,countries,lieux,loin,directions} cluster + /games/letris gallery only self-linked | route tree | Link them from a real surface or retire | M |
| U8 | L | Rain scoring: correct drop = 0 pts (score on clears only) reads as a bug to learners | LetrisGame | +1 per correct drop or a one-line score hint in study table | S |
| U9 | L | cahier vs fluo vs slate-* palettes mixed on sibling pages; divergent h1 styles | drills, dice Practice, deck/pretest pages | Converge on cahier for practice zone | L |

### Operational (pre-launch checklist)
| # | Sev | Issue | Fix |
|---|---|---|---|
| O1 | C | Auth-gated experience untested (REQUIRE_SIGN_IN suspended in audit build) | Re-enable and retest sign-in, sync, feedback, hi-scores |
| O2 | C | Host must resolve `deck.html` beside `deck/` RSC dirs + serve branded 404 (naive S3/nginx won't) | Deploy-config check on the real host |
| O3 | M | Say It mic grading + real-device TTS/music untestable headlessly | One manual device pass (iOS/Android/desktop) |

## Top 20 priority fixes (in order)
A1 · A2 · A3 · O1 · O2 · A4 · P1 · P2 · U2 · U4 · U6 · A5 · A6 · U1 · U3 · U5 · A7 · U8 · O3 · A8

## Quick wins (<1 hour each)
A1, A2, A4, A8, P1, P2, U2, U4, U5, U6, U8, A5 (label batch), A6 (toggle reuse)

## Postpone (do not rush)
- Custom-deck VocabulaRain/Lexicalator (needs curated-quality axis/syllable data)
- Full visual-system convergence (U9) — mechanical but wide
- Font consolidation (P3)

## Remove entirely
- public/lessons drchan HTML + iframe fallback (dead)
- LOCKED_UNITS / "Coming soon" unreachable branches
- Legacy /games/{weather,countries,lieux,loin} cluster **decision needed**: they duplicate
  rain/deck content with an older skin — either link them as "extra games" or retire them.

## Expand (disproportionately strong)
- VocabulaRain weather cycle (day→night→storm) — the clearest automaticity ladder in the app
- GramMarathon gap engine — cheapest path to Correct It / Rewrite It (ICAP constructive tier)
- Revision mixed trainers — pattern generalises to any cross-lesson review
- The pre-game study table — consider the same pattern before Lexicalator

## Stream reports
Full per-stream findings: scratchpad audit-content.md, audit-functional.md,
audit-consistency.md, audit-a11y-perf.md (session workspace).
