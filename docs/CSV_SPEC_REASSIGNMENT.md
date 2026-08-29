# Handoff CSV — how the flashcard specs were put back where they belong

Done 2026-08-29, alongside `scripts/sync-sio-csv.mjs` bringing
`docs/handoff/LAF1201_SIOs_Flashcards_v9.csv` back in line with the app.
**Nothing is outstanding here** — this is the record of what moved and why.

## The two halves of a row

The sync only ever writes one of them.

| Half | Columns | Who owns it |
|---|---|---|
| **The objective** | Unit · Topic · SIO Description · Flashcard Set · CEFR Mode · Can-Do (A1) · Linguistic competence | **The app.** `sios.json` is the source; the sync writes these into the CSV. |
| **The flashcard spec** | Front side · Back side (flipped) · Overview columns · Letris / Notes | **The CSV.** The app holds nothing like it, so the sync never touches these. |

The spec is the instruction for building the cards — *"~8 cards — shop icon +
English (🥖 bakery / 🥩 butcher)"*, *"2 baskets: un / une"*. The app has its own
decks and reads none of it.

## What had happened

The CSV had fallen 17 objectives behind, because Units 1, 2 and 4 were
reorganised in the app and the CSV never followed. The sync moved each
objective to its right number — which left some rows with a correct objective
beside a spec describing a different one.

Fifteen rows changed topic. **Nine were only a rename** and needed nothing.
**Six had genuinely become a different objective** — and their specs turned out
not to be wrong, just *displaced*: nearly every one had a home under some other
number. So they were moved rather than rewritten, and the gaps filled from the
app's live decks.

## The six, and where each spec went

| Row | Objective is now | Its old spec | Went to |
|---|---|---|---|
| **SIO-028** | Négation — pas de ou pas le ? | *avec* — "with me / with my friends / alone" | **Retired.** The `avec-qui` deck no longer exists and *avec* is not a live objective. Rebuilt from the `negation-pas` deck, which is already paired on this exact contrast. |
| **SIO-042** | Partitives + manger/boire | défini vs partitif pairs | **Kept, and widened.** The app folded the partitive-negative and manger/boire strands into this SIO on 2026-08-02, so the spec now runs in three strands. |
| **SIO-043** | Frequency adverbs | positive → negative with *de/d'* | **To SIO-042**, per that same 2026-08-02 fold. SIO-043 took the frequency-scale spec that had been sitting under SIO-045A. |
| **SIO-044** | Commerces — shopping | *manger / boire* conjugation | **Retired** — ConjugaZone already covers that conjugation under SIO-042. SIO-044 took SIO-047's shop spec, plus the market exchange its objective now names. |
| **SIO-045A** | Numbers 70–99 | frequency scale bar | **To SIO-043**, which is Frequency adverbs now. Written fresh from the 30-card `numbers-70-99` deck. |
| **SIO-047** | Making plans — aller + infinitif | shops — 🥖 bakery / 🥩 butcher | **To SIO-044.** Written fresh from the `modaux-plans` deck; the *aller* cards that had been inside SIO-048's four-modal spec belong here. |
| **SIO-048** | Giving advice — devoir / falloir / pouvoir | all four modals incl. *aller* | **Trimmed to three**, matching the `modaux-avis` deck: pouvoir / devoir / falloir. |

Every new or rewritten spec is drawn from the deck the app actually ships for
that objective, not invented — `negation-pas`, `partitifs`, `frequence`,
`commerces`, `numbers-70-99`, `modaux-plans`, `modaux-avis`.

### Why SIO-045 became SIO-045A — a reused slot, not a rename

Three separate things collide at this number.

- The **CSV's** 5th Unit-4 row was *Frequency adverbs* — which the app calls
  **SIO-043**.
- The **app's** own SIO-045 was *Market phrases*. It was retired into SIO-044
  (Commerces) on 2026-08-02, and its number deliberately left as a permanent
  gap so nothing downstream would shift.
- *Numbers 70–99* was then added into that gap as **SIO-045A** — making it the
  newest objective in Unit 4, not a leftover from an older system. It has a
  deck, a pre-test, six finale items and its own place in "Situation 2 — Faire
  ses courses".

The history is recorded in `src/content/pretests/index.ts`.

## The nine that only got a better name

Objective unchanged, spec still fits, nothing done. Listed so nobody reopens
them later wondering whether they were missed.

| Row | Was | Now |
|---|---|---|
| SIO-006 | Who, What, Where | Core nouns — people, things, places |
| SIO-011 | Stress pronouns | Stressed pronouns |
| SIO-013 | Matières | School subjects — les matières |
| SIO-021 | c'est / ce sont + un/une/des + N | Everyday objects — c'est un… / ce sont des… |
| SIO-023 | aimer — what I like | Leisure activities — j'aime, j'adore |
| SIO-032 | être/aller/venir + city/country prepositions | en / au / aux / à — prepositions for cities & countries |
| SIO-033 | être/aller/venir + places in town | Places in town |
| SIO-038 | How to get somewhere + prendre + y | Getting around — en train, à vélo (+ y) |
| SIO-042 | Liking vs consuming — partitives | Partitives + manger/boire |

## Keeping it from drifting again

`npm run build` runs `check:sios`, which fails if the CSV and the app disagree
on any objective column:

```
node scripts/sync-sio-csv.mjs           # app → CSV, the usual direction
node scripts/sync-sio-csv.mjs --check   # what the build runs
```

Editing the four spec columns stays safe — the check ignores them — but
`verify42` now fails if any non-atelier objective is left with **no** cards
described at all, which is how this went unnoticed for so long.

Merging a fresh export from the spreadsheet:

```
python3 scripts/merge-handoff-csv.py "~/Downloads/LAF1201 … .csv"
```

It refuses if the export's columns or its 50 SIO ids don't line up with what's
here, and keeps the previous file as `.csv.bak`. It used to have a path to a
*v4_1* export baked in — running it would have overwritten every row's specs
from a spreadsheet several versions old, and reported success.

---

## SIO-034 and SIO-035 exchanged numbers (2026-08-29)

Dan: *"if you want to bring locating places closer to giving directions, we
should move the questions up so questions take 34, and those 2 take 35 36."*
So « Questions » is now 34 and « Où est… ? » is 35, which puts locating a place
directly beside asking for directions at 36.

**This one is simpler than the six above.** They were *displaced* specs — a row
whose objective had changed under it, whose cards had to be found a home
somewhere else. This is a straight exchange of two adjacent objectives, so each
spec simply moved with the objective it describes:

| Row | Objective is now | Spec it now carries |
|---|---|---|
| **SIO-034** | Yes/no and open-ended questions | *"~10 cards — English question"*, 2 baskets: oui/non / question ouverte |
| **SIO-035** | Locating places + article contraction | *"~8 cards — simple diagram or English cue"*, no baskets — visual matching |

Nothing was rewritten or retired. `Flashcard Set` (3.04 / 3.05) is owned by the
app and stayed with the number, as did the objective columns the sync writes.

**The sync cannot catch this.** It disclaims the four spec columns by design,
so it re-pointed the objectives and reported success while leaving both specs
describing the other row — which is exactly the state the six rows above were
found in. If two objectives are ever swapped again, their specs must be swapped
in the same commit, by hand.

The learner-side half of this renumber is `src/lib/migrations/renumber3435.ts`,
which swaps the ids in every store keyed by them. See `verify49`.
