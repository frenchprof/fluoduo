# Handoff CSV — where the flashcard spec no longer fits its objective

Written 2026-08-29, when `scripts/sync-sio-csv.mjs` first brought
`docs/handoff/LAF1201_SIOs_Flashcards_v9.csv` back in line with the app.

## What "flashcard spec" means here

Each CSV row has two halves, and the sync only ever writes one of them.

| Half | Columns | Who owns it |
|---|---|---|
| **The objective** | Unit · Topic · SIO Description · Flashcard Set · CEFR Mode · Can-Do (A1) · Linguistic competence | **The app.** `sios.json` is the source; the sync writes these into the CSV. |
| **The flashcard spec** | Front side · Back side (flipped) · Overview columns · Letris / Notes | **The CSV.** The app holds nothing like it, so the sync never touches these. |

The spec is the instruction for building the cards — *"~8 cards — shop icon +
English (🥖 bakery / 🥩 butcher)"*, *"2 baskets: un / une"*. The app has its own
decks and does not read any of it.

## What happened

The CSV had fallen 17 objectives behind the course, because Units 1, 2 and 4
were reorganised in the app and the CSV never followed. The sync rewrote the
objective half of those rows. Where the objective under a number genuinely
changed, its spec is now describing different cards from the ones the objective
calls for.

**Fifteen rows changed topic. Nine are only a rename — nothing to do. Six need
attention.** Nothing in the app depends on any of it; this is the spreadsheet's
own bookkeeping.

---

## Six rows to fix

The objective moved; the spec stayed. In most cases the spec is still good
material — it just belongs under a different number now.

| Row | Objective is now | Spec still describes | Where that spec belongs |
|---|---|---|---|
| **SIO-028** | Négation — pas de ou pas le ? | *avec* — "with me / with my friends / alone" | No home in the app — `avec` is not a live objective. Decide: fold in, or drop. |
| **SIO-043** | Frequency adverbs | partitive negative — *Je mange de la viande.* | **SIO-042.** The app folded the negation content into partitives on 2026-08-02. |
| **SIO-044** | Commerces — shopping | *manger / boire* — "she drinks water" | Retired. ConjugaZone already covers that conjugation under SIO-042. |
| **SIO-045A** | Numbers 70–99 | frequency scale bar — *toujours … jamais* | **SIO-043**, which is Frequency adverbs now. Needs a new spec for 70–99. |
| **SIO-047** | Making plans — aller + infinitif | shops — 🥖 bakery / 🥩 butcher | **SIO-044**, which is Commerces now. Needs a new spec for the futur proche. |
| **SIO-048** | Giving advice — devoir / falloir / pouvoir | all four modals incl. *aller* + inf | Trim, don't move. The *aller* cards belong with SIO-047; the other three stay. |

Two of those are effectively a swap: **SIO-044 and SIO-047 have exchanged
objectives**, so their specs can simply trade places.

### Why SIO-045 became SIO-045A — a reused slot, not a rename

Three separate things collide at this number, so it is worth spelling out.

- The **CSV's** 5th Unit-4 row is *Frequency adverbs* — which the app calls
  **SIO-043**.
- The **app's** own SIO-045 was *Market phrases*. It was retired into SIO-044
  (Commerces) on 2026-08-02, and its number deliberately left as a permanent
  gap so nothing downstream would shift.
- *Numbers 70–99* was then added into that gap as **SIO-045A** — making it the
  newest objective in Unit 4, not a leftover from an older system. It has a
  deck, a pre-test, six finale items and its own place in "Situation 2 — Faire
  ses courses".

The history is recorded in `src/content/pretests/index.ts`.

---

## Nine rows that only got a better name

The objective is the same; the spec still fits. **No action.** Listed so nobody
re-opens them later wondering whether they were missed.

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

SIO-042 is the one to glance at: its objective grew to cover *manger/boire*
conjugation and the partitive negative, so the existing spec is now a subset
rather than wrong.

---

## Keeping it from drifting again

`npm run build` runs `check:sios`, which fails if the CSV and the app disagree
on any objective column:

```
node scripts/sync-sio-csv.mjs           # app → CSV, the usual direction
node scripts/sync-sio-csv.mjs --check   # what the build runs
```

Editing the four flashcard-spec columns is always safe — the check ignores them
entirely, so working through the list above will never make the build red.
