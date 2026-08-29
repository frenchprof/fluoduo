# What went into each patch — 8 to 10 August 2026

Twenty patches. Two are dead (8 and 16, superseded before they shipped).

---

## Phase 1 · Data, curriculum, evidence — patches 1–12

These were not the redesign. They were the pre-existing defects that had to be
cleared before any UI work could show a learner something true.

| # | what it did | key file |
|---|---|---|
| **1** | The 8 Aug base bundle. Retired two broken decks (`les-de`, `modaux`) and replaced them with `modaux-plans` / `modaux-avis`; wired the production Compose banks. 4 manual steps. | `collections/index.ts`, `compose/banks.tsx` |
| **2** | `+50 gap sentences` across `core-nouns`, `objets-articles`, `aimer-activites` — the decks GramMarathon could not run on. Plus a real `not-found` page. | 3 deck JSONs, `not-found.tsx` |
| **3** | **The evidence model.** PRD §7 in code: encountered / practised / evidence available / current mastery, with assistance downgrading evidentiary strength. | `lib/evidence.ts` (new) |
| **4** | The help ladder, first attempt — nudge → guiding question → scaffold → partial reveal → answer. *Superseded by 10.* | `lib/help.ts` |
| **5** | `lib/labels.ts` — the first central label resolver. | `lib/labels.ts` (new) |
| **6** | **Labels everywhere.** Every teacher and learner surface that printed `/unit/3` or `letris · objets-articles` now prints the exercise and its outcome. Raw value kept as the link target and `title=`. | 10 sites |
| **7** | The labels 6 missed. The Games table is keyed off the **event payload**, not a route, so it needed its own resolver. Restored links 6 had cost. | `labels.ts`, `Overview.tsx` |
| **8** | SIO-first ordering. **Dead — superseded by 9 before it shipped.** | — |
| **9** | **"Every item must have the SIO at the start."** Label order flips to `SIO-041 · SpecuLearn · Les aliments`, including three teacher tables nobody had touched. | `labels.ts` + 3 tables |
| **10** | The help ladder, complete. Two independent surfaces, applied and reported separately. Also fixed `answer.reveal` missing from `EventType` — patch 4 would not have compiled. | `lib/help.ts`, `EventType` |
| **11** | **D6 — session telemetry is orphaned.** `users/{uid}/sessions` had two readers and *no writer*; every `activityId` was null. Teacher time-on-task rebuilt from `page.view` dwell (30-min cap, 60s floor), labelled as an estimate. | `teacher/data.ts` |
| **12** | **The curriculum spine.** `outcomeForItem` matched item ids by string prefix inside a function whose header says "never by parsing the id" — so **84 of 806 items (10%) could never carry an outcome**: `nationalities` 25/25, `numbers-70-99` 30/30, `negation-pas` 14/14, `directions-matching` 15/40. Now indexes deck **membership**: 0 unresolved. Also un-retired `directions-matching`, which was live and rendering "(retiré)". | `lib/curriculum.ts` (new) |

**This is the cause of the "Hardest items is a HOT MESS" complaint** — 12 is the
one that fixed it.

---

## Phase 2 · The UI pivot begins — patches 13–19b

| # | what it did |
|---|---|
| **13** | **`GameBar`** — five games rendered their own ad-hoc top bar in five colour schemes with no way back to FluOlinGo. One sticky bar instead. Plus the 26 Cahier design tokens in OKLCH, **additive only** (`--cahier-paper`, `--cahier-ink`, `--cahier-ink-soft` deliberately not redefined). |
| **14** | **Removed the `LAF1201 · French I / MENU ▾` band** — mounted in `layout.tsx`, so it rendered on every page including inside games. The 9 Aug removal had taken out a *different*, blue LAF1201 banner. |
| **15** | **A landing page for four activities that had none** — `/practice/flip-it`, `/practice/grammarathon`, `/games/compose`, `/games/matching`. Eligibility is asked of `deckActivityTabs()`, not re-derived; a deck that gains gaps tomorrow appears by itself. |
| **16** | Seven family cards + the matrix header fix. **Dead — superseded by 17 before it was applied.** |
| **17** | **The option grid** (`.cahier-option` no longer full-width; 4 containers → 2 columns; one threshold in `lib/optionGrid.ts`). **The activity registry** — 19 activities, 5 families, replacing four private lists that disagreed. All 12 flap subtitles deleted. Index gets **stop numbers**, rows **sorted by them**, and the missing **9th column**. Five bugs: gems no longer rank, `/moi` `Math.random()` key, Match It's unreachable Restart, two pretest copy errors. |
| **18** | **The PII leak.** `accountAliases.ts` held teacher data but was imported by `LeaderboardList` and `progressSync`, so the bundler put the class's email addresses in a chunk **every learner loads on the home page**. 13 addresses on 8 learner-facing pages, since 25 July. Split to `rosterPrivate.ts`; publish map re-keyed email → uid; CSV labels from the authenticated roster. Ships `verify18.py`, which is what found it. **13 → 0.** |
| **19** | **The shell.** Bottom bar (Index · ReVue · Skills · SvPlay, icons only, label on press-and-hold) replacing a ☰ panel that covered 62% of a phone. Rail breakpoint 1100 → 900 — the 640–1100 band, every iPad and every half-width window, had **no navigation but the burger**. Réglages at `/reglages`. EtuDice and iComplete flaps back, gated on real capability. `deckActivityTabs()` reads the registry, so one rename lands everywhere. `verify/` checked in and wired to GitHub Actions. |
| **19b** | **The visual pass.** Patch 13's design system had **zero** adoption — the tier, type, spacing and radius scales unused while 615 raw hexes and 906 stock Tailwind classes did the painting. The three core Cahier tokens take their design values, `--fluo-*` becomes aliases: **1074 sites re-skinned, no component touched.** Type scale wired in, foolscap surface (horizontals only), and `HUES[i % HUES.length]` retired at all four sites for `tierFor()` — colour that encodes accuracy instead of list position. `verify19b.py` ratchets the hex and palette counts so they can fall but never rise. |

---

## Tooling built alongside

| | |
|---|---|
| `rebuild-tree.sh` | Replays your working tree in the sandbox — baseline + patch 1 + its 4 manual steps + 2–3 + your two hand edits + any named patches. Every patch since 6 was type-checked, built and screenshotted here before it reached you. |
| `work/active-cohort.mjs` | Read-only denominator pipeline. 47 uids → −2 admin → −25 prior-term → −2 test → alias merge → **16 enrolled, 14 active**, recorded as a dated Special Term 2 snapshot. |
| `verify/verify18.py` | Walks the chunks each page actually loads and greps them for any address in `src/`. Exits non-zero. Belongs in CI. |
| `verify/verify19.py` · `verify19b.py` | 21 structural assertions and 8 visual ones, plus a drift ratchet. Run by `.github/workflows/verify.yml` on every push and PR. |
| `PROJECT_STATE_LEDGER.md` | Track status, defect register D1–D11, patch inventory, deployment topology. |
| `UI_AUDIT.md` | Six independent design passes over every page at 390×844. |
| `UI_WORK_PLAN.md` | Everything remaining, with unit estimates. |

---

## Lessons the patches encode

Five habits came out of mistakes made in this run, and every patch since
follows them:

1. **Anchor imports on the symbol, not the statement.** Patch 6 broke because it
   tested for an exact import line that a later edit had rewritten.
2. **Never audit against `repo/`.** A stale `firestore.rules` in the 8 Aug
   baseline produced a false "every response write is being rejected" alarm.
3. **No `#` comments inside command blocks.** Your zsh does not treat them as
   interactive comments — one opened a `quote>` hang, another was parsed as
   extra git refspecs.
4. **A check must tell code from prose.** Three false positives in one session:
   `verify19` failed on the word "Accueil" inside the comment explaining why
   Accueil is not in the bar; `verify19b` failed on the literal it forbids,
   quoted in the comment explaining its removal; `apply19b`'s idempotency guard
   did the same. Checks now strip comments before matching, and guards key on
   the **result** rather than the absence of the old pattern.
5. **Structure and appearance need different proofs.** `verify19` passed 21/21
   with two visible defects on the phone. Ship a script *and* screenshots.
