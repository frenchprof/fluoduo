# 08 — Duplicated / parallel components & content

Inventory of near-duplicates and dual sources observed in the repository. No fixes applied.

## 1. Dual vocabulary stores (documented debt)

| Store | Location | Consumers |
|---|---|---|
| Canonical collections | `src/content/collections/*.json` (44) | Most practice engines, Index, adapters |
| Legacy letris / game JSON | `src/content/*.json` (27) | Vocabularain via `games/letris/sets.ts` |

`docs/ARCHITECTURE.md` flags Vocabularain’s separate store as Blueprint design-mistake #17. Several filenames exist in **both** trees (e.g. `directions-matching`, `aliments`, `countries-letris`, `possessives`).

## 2. Parallel French-number helpers

| File | Used by |
|---|---|
| `src/games/numbus/frenchNumber.ts` (93 lines) | NumBus |
| `src/games/numbourse/frenchNumbers.ts` (57 lines) | NumBourse |

Same domain (integer → French orthography); separate implementations.

## 3. Lexicalator naming fork

| Layer | Spelling |
|---|---|
| Route directory | `src/app/games/lexicalater/` |
| Engine directory | `src/games/lexicalator/` |
| UI label | LexicaLater |

## 4. Vocabularain surface fork

| Surface | Path |
|---|---|
| Main gallery + sets | `/games/vocabularain` |
| Hidden cognate sorter | `/hidden/vocabularain` (+ own Firestore hi-score writes) |
| Engine name | `letris` |

## 5. Deck route dualism (static export)

| Curated (prebuilt HTML) | User decks (query param) |
|---|---|
| `/decks/[id]` | `/decks/view?id=` |
| `/decks/[id]/study` | `/decks/study?id=` |
| `/decks/[id]/mcq` | `/decks/mcq?id=` |

Content components are shared (`DeckContent`, `study/Content`, `mcq/Content`); pages are duplicated wrappers.

## 6. Repeated `*Content.tsx` practice shells

Large client modules share similar structure (load collection → session state → check → next → XP/SRS) but are **not** factored into a shared practice shell:

- `FlipItContent.tsx`
- `SayItContent.tsx`
- `CompleteItContent.tsx`
- `GramMarathonContent.tsx`
- `SpecuLearnContent.tsx`
- `PracticeContent.tsx` (dice)
- `MatchingContent.tsx`
- `PretestContent.tsx` / `PicturePretestContent.tsx`
- Deck `study/Content.tsx` / `mcq/Content.tsx`

Pattern similarity ≠ byte-identical copies; still a duplication / consistency risk for feedback, TTS mute, a11y, and XP wiring.

## 7. Design token / button system overlap

`globals.css` carries multiple eras of primitives:

- `.neo-btn*` (neumorphic)
- `.fluo-btn*` (fluo highlighter era)
- `.cahier-btn*` (Le Cahier skin)

Pages mix these class families.

## 8. Font stack overlap

`layout.tsx` loads five families (Geist, Geist Mono, Fraunces, Public Sans, Roboto) while `globals.css` still references Arial/Helvetica on `body` before cahier overrides — layered historical defaults.

## 9. Admin email lists

Admin emails appear in:

- `firestore.rules` (`isAdmin()`)
- Teacher client `data.ts` (`ADMIN_EMAILS`)

Intentional duplication (rules = security; client = UX), but drift risk if one list updates without the other.

## 10. Prior audit docs

`docs/audit2/` contains July 2026 audits; this `docs/audit/` pass is a fresh inventory on branch `audit/repository-inventory`. Findings may overlap; treat this folder as the current inventory snapshot.
