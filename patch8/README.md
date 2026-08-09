# Patch 8 — SIO first, everywhere

> "every item must have the SIO at the start for everything"

## The order flips

| Was | Now |
|---|---|
| `SpecuLearn · SIO-041 · Les repas et les aliments` | **`SIO-041 · SpecuLearn · Les repas et les aliments`** |
| `VocabulaRain · SIO-021 · Un, une ou des ?` | **`SIO-021 · VocabulaRain · Un, une ou des ?`** |
| `Dice · SIO-032 · Prépositions + pays` | **`SIO-032 · Dice · Prépositions + pays`** |
| `Flip It · SIO-042 · Défini ou partitif ?` | **`SIO-042 · Flip It · Défini ou partitif ?`** |

One edit, in `withDeck()` inside `src/lib/labels.ts`. Every table that already
went through patches 6 and 7 follows automatically — Attendance, Overview, the
day pop-up, the student page trail, Decks, Games, the Activity column, `/moi`.
That is the whole point of having put them all on one function.

Beyond scanning: with the outcome in front, every row's key token sits in the
same column position, so you read down the left edge instead of parsing each
line — and sorting that column now sorts by curriculum instead of by exercise
name.

## Item ids get it too

| Was | Now |
|---|---|
| `lieux-letris-21-aeroport` | **`SIO-033 · lieux-letris-21-aeroport`** |
| `partitifs-16` | **`SIO-042 · partitifs-16`** |
| `u4-sio045-01` | **`SIO-043 · u4-sio045-01`** ← note: *not* 045 |
| `finale:SIO-034:2` | **`SIO-034 · finale:SIO-034:2`** |

The raw id stays. It is the only handle on the exact question answered, and two
items under one outcome have to stay distinguishable. Resolution goes through
the join table in `@/lib/evidence`, never by parsing the id — after the
2026-07-14 re-cut the pretest files kept their old names, so `u4-sio045-01` is
SIO-043 content and the id lies about itself.

Applied to `/moi` (hardest items + both history tables) and the teacher's
Hardest-items table. The teacher's **Recent answers** table is deliberately left
alone: it already has its own Lesson column, so prefixing there would print the
same SIO twice on one row.

## Also fixed

`/games/vocabularain/weather` read as `VocabulaRain · weather` — the route drops
the `-letris` suffix that the deck id carries. Now looked up both ways, so it
resolves to **`SIO-031 · VocabulaRain · Weather`**.

## Rows with no outcome

`ConjugaZone`, `DéjàRevu`, `NumBus`, `Accueil`, `Unité 3`, `GramMarathon Final`
keep their plain names. There is no SIO attached to them — they are whole-app
surfaces, not one lesson — and inventing one would be worse than a ragged left
edge.

## Run it

**Stop the dev server first.**

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch8.zip
python3 patch8/apply8.py --dry-run
python3 patch8/apply8.py
rm -rf .next
npx tsc --noEmit && npm run build 2>&1 | tail -3
npm run dev
```

Verified here against your real `sios.json` and collection files before
shipping — every line in the tables above is actual output, not an example.
