# Handoff CSV — rows whose flashcard spec no longer matches its objective

Generated 2026-08-29, when `scripts/sync-sio-csv.mjs` first brought
`docs/handoff/LAF1201_SIOs_Flashcards_v9.csv` back in line with the app.

**What happened.** The CSV had fallen 17 SIOs behind the live course. For the
rows below the *topic itself* had changed — a different objective sitting under
the same number — because Units 1, 2 and 4 were reorganised in the app and the
CSV never followed. The sync rewrote each row's **objective** columns (Unit,
Topic, SIO Description, Flashcard Set, CEFR Mode, Can-Do, competence) from the
app, which is the live course.

**What it did NOT touch,** because the app holds none of it and only Dan knows
where it belongs: **Front side · Back side (flipped) · Overview columns ·
Letris / Notes**. Those still describe the OLD objective.

So each row below now reads correctly on the left and describes different cards
on the right. **15 rows to work through.** Nothing in the app depends on
these columns — this is the spreadsheet's own bookkeeping.

| Row | Objective was | Objective is now | Cards still describe |
|---|---|---|---|
| SIO-006 | Who, What, Where | Core nouns — people, things, places | Who, What, Where |
| SIO-011 | Stress pronouns | Stressed pronouns | Stress pronouns |
| SIO-013 | Matières | School subjects — les matières | Matières |
| SIO-021 | c'est / ce sont + un/une/des + N | Everyday objects — c'est un… / ce sont des… | c'est / ce sont + un/une/des + N |
| SIO-023 | aimer — what I like | Leisure activities — j'aime, j'adore | aimer — what I like |
| SIO-028 | avec — with whom | Négation — pas de ou pas le ? | avec — with whom |
| SIO-032 | être/aller/venir + city/country prepositions | en / au / aux / à — prepositions for cities & countries | être/aller/venir + city/country prepositions |
| SIO-033 | être/aller/venir + places in town | Places in town | être/aller/venir + places in town |
| SIO-038 | How to get somewhere + prendre + y | Getting around — en train, à vélo (+ y) | How to get somewhere + prendre + y |
| SIO-042 | Liking vs consuming — partitives | Partitives + manger/boire | Liking vs consuming — partitives |
| SIO-043 | Partitive — negative | Frequency adverbs | Partitive — negative |
| SIO-044 | manger / boire | Commerces — shopping, and the market exchange | manger / boire |
| SIO-045 → **SIO-045A** | Frequency adverbs | Numbers 70–99 | Frequency adverbs |
| SIO-047 | Commerces — shopping | Making plans — aller + infinitif | Commerces — shopping |
| SIO-048 | aller / pouvoir / devoir / falloir + infinitif | Giving advice — devoir / falloir / pouvoir | aller / pouvoir / devoir / falloir + infinitif |

## The two that need a decision, not just an edit

- **SIO-045 → SIO-045A — a reused slot, not a rename.** Two different things
  happened here and they are easy to confuse. The CSV's 5th Unit-4 row is
  *Frequency adverbs*, which the app now calls **SIO-043**. Separately, the
  app's own SIO-045 was *Market phrases*; it was retired into SIO-044
  (Commerces) on 2026-08-02 and its number left as a deliberate permanent gap
  so nothing downstream would shift — and *Numbers 70–99* was then added into
  that gap as **SIO-045A**. (The history is recorded in
  `src/content/pretests/index.ts`.) So SIO-045A is the newest objective in Unit
  4, not a leftover. The consequence for this file: the row's frequency-adverb
  card spec now sits under *Numbers 70–99*, and probably belongs with SIO-043.
- **SIO-044 / SIO-047.** *Commerces — shopping* moved from 047 to 044, so those
  two rows have effectively swapped card specs with each other.

## Keeping it from happening again

`npm run build` now runs `check:sios`, which fails if the CSV and the app
disagree on any objective column. Edit either side and the build says so:

```
node scripts/sync-sio-csv.mjs           # app → CSV, the usual direction
node scripts/sync-sio-csv.mjs --check   # what the build runs
```

Editing the CSV's card-spec columns is always safe — the check ignores them.
