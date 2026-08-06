# 10 — Accessibility

Static inventory as of 2026-08-05. Complements (does not replace) `docs/audit2/audit2-a11y-perf.md` (browser-verified 2026-07-04).

## Positive patterns present

| Pattern | Where |
|---|---|
| `lang="fr"` + `translate="no"` | Root `layout.tsx` — intentional for French learning content |
| `prefers-reduced-motion` kills animations | `globals.css` (multiple `@media` blocks) |
| Global `:focus-visible` ring | `globals.css` |
| Dialog basics on several modals | `role="dialog"` / `aria-modal` on GuideSplash, RankingOverlay, SearchOverlay, some game helps, SioModal (prior audit) |
| Many emoji controls carry `aria-label` | Home chips, Practice Index links (prior audit verified) |
| KeyNav global helper | `KeyNav.tsx` |
| Footer privacy disclosure | Every page via layout |
| Document title template | `%s · FluOlinGo` |

## Critical gaps (reconfirmed by grep)

### No live regions product-wide

Grep for `aria-live`, `role="status"`, `role="alert"` under `src/`: **zero matches**.

Implication: score changes, correct/incorrect feedback, and toast-like updates are not announced to screen readers unless they move focus. This matches the July audit (A5) and remains open.

## Likely issues by category

### 1. Clickable non-buttons / incomplete keyboard support

Examples (not exhaustive):

| Location | Pattern |
|---|---|
| `FlashcardLesson.tsx` | `role="button"` on flip surface (needs Enter/Space — verify per surface) |
| `FlipItContent.tsx` | Card flip `role="button"`; options overlay dismiss via empty `fixed inset-0` div click |
| `FirstTour.tsx` | Absolute `div` with `onClick={goNext}` for spotlight hole |
| Overlay backdrops | `AccountButton`, `SoundControl`, `StatsHelp`, game helps — click-to-dismiss divs often `aria-hidden` (OK for backdrop) but Escape handling inconsistent |

### 2. Missing or weak accessible names

Prior DOM-verified offenders (July) still present in source structure:

- DiceTrainer emoji controls (🔊 / 🎲 / 🏁) — emoji-only names.
- Flip It row checkboxes — historically unnamed.
- Flip It mode toggles — `title` without `aria-pressed`.
- Letris mute/voice pills — title-only; pressed state not exposed.
- Drill answer inputs — placeholder-as-name pattern in cloze engines.

### 3. Images

| File | Finding |
|---|---|
| `SpecuLearnContent.tsx` | `<img … alt="">` — decorative empty alt; confirm images are not the sole carrier of meaning |
| `FeedbackPanel.tsx` | Screenshot `alt` present (good) |
| Broader corpus | Very few `<img>` / `next/image` usages; emoji-heavy UI instead |

### 4. TTS / auto-speak

Multiple activities auto-speak without a shared mute (July A6): DiceTrainer, Complete It, GramMarathon, Réviser, Lexicalator, etc. Persisted mute exists on some dice practice paths but is not universal. Auto speech is an accessibility (and vestibular) concern when uncancellable.

### 5. Focus management

- SioModal: Escape + initial focus previously verified; **focus trap** still called out as residual in July audit.
- Flip It options popover: Escape handling called out as missing (July A8 residual).
- Teacher student modal / day modals: click-outside patterns; trap not audited this pass.

### 6. Touch target sizes

July measurement: many `.cahier-btn-sm` / emoji links ~24–30px (below 44px best practice; some at WCAG 2.5.8 floor). Flip It eye toggles ~13px. Unchanged architecture.

### 7. Tables

Practice Index (`/activities`): prior audit noted missing `scope` on `<th>` and row-header semantics.

### 8. Language mixing

Root `lang="fr"` is intentional; English chrome exists. Comments note English-heavy blocks should opt out with `lang="en"` — consistency of that opt-out was not fully audited file-by-file.

## Testing posture

- No automated a11y test script in `package.json`.
- Prior verification used Playwright/Chromium against static export (`docs/audit2/audit2-a11y-perf.md`).
- This pass: static analysis only.

## Suggested verification targets (documentation only)

1. Confirm still-zero `aria-live` after any new surfaces (SpecuLearn, NumBus, NumBourse, ÉcouTexte, Evidence).
2. Re-drive SioModal focus trap.
3. Name audit on NumBus / NumBourse / SpecuLearn (post–July additions relative to oldest audits).
4. Keyboard-only path through LessonFlow sections.
