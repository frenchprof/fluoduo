# Patch 9 — SIO first, everywhere, including the tables nobody had touched

**Run this instead of patch 8.** It contains everything patch 8 did, plus the
two tables that were causing what you just saw. Safe if you already ran 8.

## Why the student page had almost no SIOs

Two separate causes, both real, neither cosmetic.

### 1. "Time on task" was never labelled by anything

```jsx
<td className="px-3 py-2 font-bold text-slate-900">{act}</td>
```

Raw, since the day it shipped. No patch had touched it because nothing in it
looked like a path or a deck id until you opened it. Now:

`/practice/flip-it/partitifs` → **SIO-042 · Flip It · Défini ou partitif ?**

### 2. "Games, pretests & more" threw the deck away before anything could label it

This is the interesting one. The aggregation keyed each row on the game alone:

```js
const game = str(ev.payload.game) ?? "?";   // "letris"
```

The event payload carries `collectionId` too — the Activities panel uses it —
but this table discarded it at aggregation time. So a row could only ever say
`letris`. **No deck means no outcome means no SIO** — and no labelling fix
downstream could have recovered it, because the information was gone before any
labeller ran. That's why patches 6 and 7 appeared to do nothing here.

Keyed the way Activities keys it, the outcome resolves:

| Was | Now |
|---|---|
| `letris` | `SIO-021 · VocabulaRain · Un, une ou des ?` |
| `speculearn` | `SIO-041 · SpecuLearn · Les repas et les aliments` |
| `dice` | `SIO-032 · Dice · Prépositions + pays` |

You also get one row **per deck** now instead of one row per game, which is the
breakdown you actually wanted from that table.

### 3. Overview's day pop-up, "Games started"

Same raw game names in a text line. Labelled.

## The order flip (this was patch 8)

`SpecuLearn · SIO-041 · …` → **`SIO-041 · SpecuLearn · …`**

One edit in `withDeck()`; every table on `labels.ts` follows at once.

## Item ids (also patch 8)

| Was | Now |
|---|---|
| `lieux-letris-21-aeroport` | `SIO-033 · lieux-letris-21-aeroport` |
| `u4-sio045-01` | `SIO-043 · u4-sio045-01` — **043**, not 045 |
| `finale:SIO-034:2` | `SIO-034 · finale:SIO-034:2` |

Via the join table, never by parsing the id: the July re-cut left pretest files
with names that lie about their own outcome.

## Also fixed

`/games/vocabularain/weather` read as `VocabulaRain · weather` — the route drops
the `-letris` the deck id carries. Looked up both ways now →
**`SIO-031 · VocabulaRain · Weather`**.

## What still has no SIO, on purpose

`ConjugaZone`, `DéjàRevu`, `NumBus`, `Accueil`, `Unité 3`, `GramMarathon Final`
— whole-app surfaces, not one lesson. Nothing to lead with, and inventing one
would be worse than a ragged edge.

The teacher's **Recent answers** Item column also stays raw: it has its own
Lesson column beside it, so prefixing would print the same SIO twice per row.

## Run it

**Stop the dev server first.**

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch9.zip
python3 patch9/apply9.py --dry-run
python3 patch9/apply9.py
rm -rf .next
npx tsc --noEmit && npm run build 2>&1 | tail -3
npm run dev
```

Every file it touches was parse-checked and `labels.ts` type-checked here
before packaging, and the label outputs above are real output run against your
`sios.json`, not examples.
