# Accessibility audit (current state)

**Audit date:** 2026-08-05  
**Scope:** Accessibility mechanisms and gaps that currently exist in the codebase.  
**Constraint:** Documentation only — inventory of what is present; no redesign proposals.  
**Method:** Static review of `src/` + cross-check with `docs/audit2/audit2-a11y-perf.md` (2026-07 browser-verified pass). No new Playwright run in this inventory pass.

## Summary snapshot

| Area | Current state |
|---|---|
| Document language | `<html lang="fr" translate="no">` in `layout.tsx` |
| Auto-translate opt-out | `google: "notranslate"` metadata + `translate="no"` |
| Focus rings | Global `:focus-visible` in `globals.css` |
| Reduced motion | Multiple `@media (prefers-reduced-motion: reduce)` blocks in `globals.css`; SFX confetti respects it |
| `aria-live` / live regions | **0** matches in `src/` (confirmed this pass) |
| Skip links | **None** found |
| Dedicated a11y test suite | **None** found |
| A11y libraries (axe, etc.) | **None** in package scripts/deps for this pass |

---

## What exists today

### Document & language

- Root `lang="fr"` so screen readers / TTS default to French phonology for chrome and content.
- Learning strings frequently marked with `lang="fr"` in games and drills (Compose, Dice, NumBus, Lexicalator, Letris, etc.).
- English-heavy blocks can opt out with `lang="en"` (pattern noted in layout comments).
- Title template `"%s · FluOlinGo"` so pages can set distinct document titles via metadata / `CahierShell`.

### Semantic structure & dialogs

Surfaces using `role="dialog"` + usually `aria-modal="true"`:

| Surface | File |
|---|---|
| SIO modal | `src/app/SioModal.tsx` |
| Beta notice | `src/components/BetaNotice.tsx` |
| Ranking overlay | `src/components/RankingOverlay.tsx` |
| Search overlay | `src/components/SearchOverlay.tsx` |
| Guide splash | `src/components/GuideSplash.tsx` |
| Teacher student panel | `src/app/teacher/Students.tsx` |
| Game end / credits dialogs | Letris, Lexicalator, NumBourse |

`SioModal` (prior verified): Escape closes; initial focus on close control. **Focus trap not present** (Shift+Tab can leave dialog) — residual from July audit.

### ARIA usage (non-exhaustive)

Highest `aria-*` density among shared components:

| Module | Notes |
|---|---|
| `CahierShell.tsx` | `aria-label` on search/ranking/home/history/nav; `aria-expanded` menu; `aria-current="page"` on active flaps; decorative binding `aria-hidden` |
| `FlipItContent.tsx` | Switches (`role="switch"` + `aria-checked`), sort (`aria-sort`), many control labels; row select-all labelled |
| `HomeDashboard.tsx` | Brand / Continuer / DéjàRevu labelled; decorative emoji `aria-hidden` |
| `SoundControl.tsx` | Mute controls labelled |
| `AccountButton.tsx` | Account chip labelling |
| `FeedbackButton.tsx` | `aria-label="Feedback"`; file input `sr-only` |
| `FirstTour.tsx` | Replay control labelled |
| Practice Index | Prior audit: activity emoji links labelled |

Decorative emoji / icons commonly use `aria-hidden`.

### Keyboard support

| Mechanism | Where | Behaviour |
|---|---|---|
| `KeyNav` | root layout | Two-digit SIO jump; spatial arrow focus among links/buttons; stands down in fields / choice exercises; games opt out via `data-kbnav-off` |
| Choice keys | `useChoiceKeys` | Digit answers for MCQ-style drills |
| Enter→Next rhythm | Complete It / GramMarathon / ConjugaZone (July verified) | After check, focus moves to Next |
| Flip It card | flashcard surface | `role="button"` + Space/Enter shortcuts (prior note) |
| Letris / rain games | gameplay | Own arrow/key handlers; KeyNav disabled in subtree |

### Focus & motion CSS

From `globals.css`:

- `:focus-visible` ring (global).
- `prefers-reduced-motion: reduce` kills/zeros animation & transition durations in several blocks (cahier, fluo fog/rank, etc.).
- `games/audio/sfx.ts` skips confetti when reduced motion is preferred.

### Images & media

| Pattern | Example |
|---|---|
| Meaningful alt | Teacher feedback screenshot: `alt="screenshot attached to the report"` |
| Empty alt (decorative / redundant) | SpecuLearn images: `alt=""` with emoji fallback `aria-hidden` |
| TTS / auto-speak | Multiple drills auto-speak French; some have mute toggles (Letris voice/music, dice `ttsOn`, matching `audioOn`); several auto-speak without a dedicated mute (July list: DiceTrainer, ConjugaZone, Complete It, GramMarathon, Réviser mix, Lexicalator completion) |

### Forms & controls

- Many icon-only controls use `aria-label` and/or `title`.
- Some controls remain title-only or emoji-named (July DOM check): DiceTrainer 🔊/🎲/🏁, some Flip It row checkboxes, subset number inputs, Letris mute pills without `aria-pressed`.
- Drill answer inputs often rely on `placeholder` as the accessible name (weak but non-empty).
- Review toggles in Flip It implement `role="switch"` + `aria-checked` + descriptive `aria-label`.

### Touch targets (prior measurement, unchanged sizes referenced)

July measurement at 390×844: many `.cahier-btn-sm` controls ~28–30 px tall; Flip It eye buttons ~13×13; checkboxes ~18×18. Prior verdict: no hard WCAG 2.5.8 AA failure via spacing exception, but below 44 px best-practice floor.

### Contrast (prior verified)

- Letris rain palette vs white text: all ≥4.5:1 after restyle.
- Borderline: `--cahier-ink-soft` ~4.3–4.4:1 on tinted panels (July note).
- Reduced-motion + contrast work landed in July round-2 verification.

---

## Gaps confirmed still present (static re-check 2026-08-05)

| Gap | Evidence |
|---|---|
| No `aria-live` / `role="status"` for score/feedback | Grep: zero `aria-live` in `src/` |
| No skip-to-content link | Not found |
| No automated a11y CI | No axe/jest-axe/playwright a11y scripts in `package.json` |
| Focus trap incomplete on SioModal | July residual; no trap code added in inventory review |
| Flip It Options popover Escape | July residual (no Escape handler noted) |
| Unnamed / weakly named controls | See July A5 batch (DiceTrainer emoji buttons, some Flip It checkboxes, etc.) |
| Auto-TTS without shared mute | Six activities listed in July A6 still architecturally separate |
| Practice Index table semantics | Prior: missing `scope` on `<th>`; deck cells as `<td>` |
| Flip It All-Cards group headers | Prior: plain `<div class="cahier-section">`, not headings |

---

## Prior scored assessment (July 2026)

From `docs/audit2/audit2-a11y-perf.md` (browser-verified):

- **Accessibility score suggestion:** 78/100  
- Verified landed: dialog Escape + initial focus (partial), rain contrast, reduced-motion, Enter→Next rhythm, `:focus-visible`  
- Remaining priority themes: live regions, control names, TTS mute consistency, focus trap, touch targets, table/heading semantics  

This inventory pass **did not re-score** in a browser; it confirms structural signals (especially zero `aria-live`) remain.

---

## Files with the densest a11y affordances

Useful starting points for future work (by current `aria-*` usage):

1. `src/app/practice/flip-it/[collectionId]/FlipItContent.tsx`
2. `src/components/CahierShell.tsx`
3. `src/games/numbus/NumBus.tsx` / `lexicalator/Lexicalator.tsx` / `letris/*`
4. `src/app/HomeDashboard.tsx`
5. `src/app/activities/page.tsx`
6. `src/app/SioModal.tsx`

---

## Related docs

- Prior deep dive: [`docs/audit2/audit2-a11y-perf.md`](../audit2/audit2-a11y-perf.md)
- Learner surfaces map: [`learner-pages.md`](./learner-pages.md)
- Component chrome: [`component-inventory.md`](./component-inventory.md)
