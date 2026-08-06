# Technical debt inventory

**Audit date:** 2026-08-05  
**Scope:** Debt signals that currently exist in the repository.  
**Constraint:** Documentation only — inventory of what is present; no redesign proposals.

## Sources consulted

- Code comments and dual content stores
- `TODO.md`, `HANDOFF.md`, `docs/ARCHITECTURE.md`
- Prior audits in `docs/audit2/`
- Static greps (`eslint-disable`, `any`, leftover files, test scripts)
- File-size hotspots

---

## 1. Dual vocabulary stores

| Store | Location | Consumers |
|---|---|---|
| Canonical collections | `src/content/collections/*.json` (44) | Most practice engines, Index, adapters |
| Legacy letris / game JSON | `src/content/*.json` (27) | VocabulaRain via `games/letris/sets.ts` |

`docs/ARCHITECTURE.md` and `HANDOFF.md` document VocabulaRain’s separate store as intentional unfinished migration. Several filenames exist in **both** trees. Editing a deck for Letris can require updating two copies.

---

## 2. Naming drift

| Layer | Spellings in use |
|---|---|
| LexicaLater | Route `lexicalater` · engine `lexicalator` · UI “LexicaLater” |
| VocabulaRain | Product name · route `vocabularain` · engine folder `letris` · hidden cognate fork |
| Package vs product | `package.json` name `lang-games` · UI/metadata FluOlinGo · repo Fluoduo |

---

## 3. Static-export workarounds

| Pattern | Why it exists |
|---|---|
| `/decks/view?id=` / `/study?id=` / `/mcq?id=` | User Firestore decks cannot use `generateStaticParams` |
| Parallel curated path-param routes | Prebuilt HTML for known collection ids |
| Cloudflare Functions for `/api/*` | No Next server runtime under `output: "export"` |

---

## 4. Incomplete / suspended features (documented in code or TODO)

| Item | Evidence |
|---|---|
| In-app importer progressive structure | `TODO.md` §2 still open (paste path partially present at `/decks/new`) |
| Flashcard SRS crowns / mastery rings | `TODO.md` §3 open items |
| TTS fallback hardening | `TODO.md` §5; `speech.ts` has legacy fallbacks |
| “Coming soon” activity doors | `SioDetail.tsx` still has `title="Coming soon"` for unavailable flaps |
| SpecuLearn supplement plumbing leftover | `Activities.tsx` notes SpecuLearn became native; empty supplements table copy remains |
| Deprecated pretest explanation field | `src/lib/pretests/schema.ts` marks general explanation blob DEPRECATED |
| Auth wall master switch | `REQUIRE_SIGN_IN` in `authConfig.ts` (currently `true`) — documented as flip for launch/dev |

---

## 5. Large / overloaded modules

| File | Approx. lines | Debt signal |
|---|---|---|
| `FlipItContent.tsx` | 1380 | Monolithic practice UI |
| `NumBus.tsx` | 993 | Large game surface |
| `Lexicalator.tsx` | 834 | Large game surface |
| `LetrisGame.tsx` | 804 | Large game surface |
| `CahierShell.tsx` | 562 | Chrome + readiness/routing helpers mixed |
| `tutor/page.tsx` | 473 | UI + PDF helpers co-located |

Repeated `*Content.tsx` shells share session/check/next structure without a shared practice framework (consistency risk for TTS mute, a11y, XP wiring).

---

## 6. Parallel implementations

| Pair | Notes |
|---|---|
| `numbus/frenchNumber.ts` vs `numbourse/frenchNumbers.ts` | Same domain, separate helpers |
| Button/CSS eras in `globals.css` | `.neo-btn*`, `.fluo-btn*`, `.cahier-btn*` coexist; pages mix families |
| Five font families in `layout.tsx` | Geist, Geist Mono, Fraunces, Public Sans, Roboto |
| Admin email lists | `firestore.rules` `isAdmin()` **and** `teacher/data.ts` `ADMIN_EMAILS` (intentional UX vs security split; drift risk) |
| Mute preference keys | `games/audio/mute.ts` migrates legacy `fluolingo:sound.muted` / `tts.muted` |
| FirstTour legacy key | `fluolingo:toured.v1` still folded into v2 seen state |

---

## 7. Type safety & lint escapes

| Location | Signal |
|---|---|
| `SayItContent.tsx` | File-level `eslint-disable @typescript-eslint/no-explicit-any`; `SpeechRecognition` typed as `any` |
| Multiple game/practice files | `eslint-disable-line react-hooks/exhaustive-deps` on intentional effect deps |
| Broader codebase | Few `@ts-ignore` / `@ts-expect-error` hits in `src/` on this pass |

---

## 8. Leftover / stray files

| Path | Notes |
|---|---|
| `src/app/page.tsx.orig` | Backup beside live Home page; not a route |
| Prior audit folder | `docs/audit2/` (July 2026) overlaps this inventory |

---

## 9. Test coverage gap

| Fact | Value |
|---|---|
| `package.json` scripts | `dev`, `build`, `start`, `lint`, `check:textgen` |
| Automated unit/e2e suite in repo | **No** `*.test.*` / `*.spec.*` tree found in this pass |
| Known pure logic with comments about tests | `games/letris/resolve.ts` (HANDOFF claims unit-tested historically; no committed test files found here) |
| Scripted checks | `scripts/check-textgen.mjs`, content migration scripts |

---

## 10. Performance debt (from prior verified audit, still structural)

From `docs/audit2/audit2-a11y-perf.md` (2026-07) and current architecture:

| Item | Status signal |
|---|---|
| Firestore client graph on many pages | Auth/usage/notes chains pull Firebase into client bundles |
| Heavy per-page JS | Prior measure: ~1.2–1.9 MB JS on several surfaces |
| Font weight | Five families still loaded in `layout.tsx` |
| Static export size | Large `out/` duplication of per-route HTML+RSC (prior note) |

---

## 11. Content / product plan debt (docs, not code)

| Doc | What it shows |
|---|---|
| `TODO.md` | Collections + gamification build plan; many boxes still open |
| `HANDOFF.md` | Spec’d-but-not-built Flip It revisions; U2–U4 content gaps |
| `docs/PRD.md` | Scaffold with many `<!-- TODO -->` redesign sections |
| `docs/audit/README.md` (this folder) | Indexes inventory docs produced on branch `audit/repository-inventory` |

---

## 12. Console / debug debt

| Check | Result (this pass) |
|---|---|
| `console.log` / `console.debug` in `src/` | No notable production logging hits in the grep sample |
| Explicit `HACK` / `FIXME` markers in `src/` | Sparse; debt is mostly dual stores, TODOs, and size/naming |

---

## Cross-reference

- Duplication detail: [`08-duplication.md`](./08-duplication.md) (if present) and section 6 above.
- Route quirks: [`route-inventory.md`](./route-inventory.md).
- Prior a11y/perf scores and remaining items: `docs/audit2/audit2-a11y-perf.md`.
