# Patch 6 — labels everywhere

The dashboard was printing raw ids at you. This makes every one of them read as
an exercise and an SIO, without losing the raw value.

## Run it

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch6.zip          # creates ~/fluoduo/patch6/
python3 patch6/apply6.py --dry-run       # look at it first
python3 patch6/apply6.py
npx tsc --noEmit && npm run build 2>&1 | tail -3
```

Safe to run twice — every edit checks for its own result and skips.

## What changes

| Where | Was | Now |
|---|---|---|
| **Attendance → Pages that day** (the table you sent) | `/unit/3` | `Unité 3` |
| | `/practice/grammarathon/finale` | `GramMarathon Final` |
| | `/lessons/modaux` | `Leçon · Modaux (retiré)` |
| **Overview → Most visited pages** | `/practice/flip-it/partitifs` | `Flip It · SIO-042 · Défini ou partitif ?` |
| **Overview → day pop-up** | same | same |
| **Student → Pages visited** | same | same |
| **Activities → Decks** | `weather-letris` | `SIO-031 · Quel temps fait-il ?` |
| **Student → Recent answers, Activity** | `SpecuLearn · aliments` | `SpecuLearn · SIO-041 · Les repas et les aliments` |
| **/moi → My history** | `Flip It · core-nouns` | `Flip It · SIO-006 · Qui ou quoi ? Un ou une ?` |

**Hover any of them** and you get the raw path back in a tooltip. That was the
point of the exercise — you asked to be able to trace back what is what, and a
label you can't reverse would be a worse version of the same problem.

## Retired decks

July's records point at decks that no longer exist. Those visits really
happened, so they keep their name and gain an explanation on hover:

- `modaux` → **Modaux (retiré)** — *split into modaux-plans (SIO-047) + modaux-avis (SIO-048) on 2026-08-09*
- `les-de` → **Quantités (retiré)** — *folded into SIO-042 (partitifs) on 2026-08-09*
- `manger-boire`, `au-marche`, `directions-matching` likewise

## The part that matters beyond today

There were **four** places inventing labels: two hand-written `labelActivity`
functions (teacher and /moi, which disagreed — "Composer" vs "Compose It", one
knew about `mcq:` keys and the other didn't) and two tables that gave up and
printed the path. None knew about SIOs.

`src/lib/labels.ts` is now the only one. Same shape of fix as `gapSentence()`
in patch 1: the bug wasn't any single call site, it was that there were five of
them. Rename a deck in future and it lands everywhere at once.

Nothing is written to Firestore. All of this resolves at read time, so all
10,623 historical responses pick it up the moment you deploy — which is just as
well, since the append-only rule means they could not be backfilled even
deliberately.
