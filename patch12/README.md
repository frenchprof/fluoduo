# Patch 12 — one curriculum spine, and a place on the journey for everything

Three whole files. No anchored edits, so nothing can mis-match.

## 1. Ten percent of items could never carry an SIO

`outcomeForItem` resolved deck items with `itemId.startsWith(deckId + "-")` —
inside a function whose own header says *"never by parsing the id"*. Four decks
author ids that don't begin with their deck name:

```
nationalities        nat-01-france         25/25 lost
numbers-70-99        num-70                30/30 lost
negation-pas         negpas-01             14/14 lost
directions-matching  directions-full-01    15/40 lost
                                           ─────
                                           84 of 806  (10%)
```

It now indexes actual deck **membership**. Measured against your content:
**0 unresolved**. And no item id is claimed by two decks, so the mapping is
unambiguous.

This is why Hardest items mixed prefixed and unprefixed rows — and why it looked
random. It wasn't: a learner weak on numbers or nationalities got a whole screen
of bare ids.

## 2. A live deck was wearing an obituary

`directions-matching` was in my RETIRED table. SIO-036 points at it and learners
are using it. `describeDeck` checks retirement *before* the outcome lookup, so
every response from it rendered "(retiré)" with no SIO. My error — I checked a
note instead of `sios.json`. The table now carries a warning that anything added
to it must be absent from CURATED and unreferenced by any SIO.

## 3. The deck→outcome index existed twice

`labels.ts` and `evidence.ts` each built their own, and they had already
drifted — only one resolved the `-letris` suffix, so three decks answered
differently depending on which module you asked. That's the fourth time this
codebase has grown a second copy of one idea (gapSentence, labelActivity,
hrefFor, now this). One index now, in `src/lib/curriculum.ts`.

## 4. Seven routes still printed raw

They were in `siteTabs.ts` and absent from the label table: the three galleries
(`/practice/speculearn`, `/games/vocabularain`, `/games/lexicalater` — only
their *trailing-slash* forms were listed, which the gallery route itself never
matches), plus `/tts`, `/guide`, `/about`, `/hidden/vocabularain`.

## 5. Everything now has a place on the journey

> "by right everything belongs to somewhere along the learning journey levels of
> the map… we can label everything such that we can sort them by what they
> should have looked like chronologically"

Every label carries `journey` — unit, then the SIO's running number, which *is*
the taught order. Sorted, your dashboard now reads:

```
Unité 0          0   Unité 0
Unité 0          3   WorDrill
Unité 0          7   NumBus
Unité 3          0   Unité 3
Unité 3         36   SIO-036 · Matching · Quel est le chemin pour … ?
Unité 4         42   SIO-042 · Flip It · Défini ou partitif ?
Unité 4         44   SIO-044 · Deck · Les commerces — et au marché
Toutes unités        ConjugaZone, DéjàRevu, the galleries, GramMarathon Final
Application          Accueil, My Progress, Teacher, Guide
```

- A **unit hub** sorts at the head of its unit — a learner opens it before
  anything taught inside.
- **NumBus / NumBourse** sit with the number outcomes (SIO-007, where numbers
  are first met); **WorDrill** with the alphabet (SIO-003).
- The **galleries** are every deck at once, so they say *Toutes unités* rather
  than pretending to a position. Same for ConjugaZone, DéjàRevu and the Finale,
  which draws from all fifty outcomes by design.
- **Retired decks keep the position they taught from**, so July's records sort
  into July instead of piling up at the end.

`journeyKey(info)` is the sort key. Patch 13 will use it to order every table.

Two things I deliberately did **not** do: invent a position for the app's own
pages (they say *Application*), and guess a unit for a surface that genuinely
spans the course. A wrong chronology would be worse than an honest "everywhere".

## Run it

```bash
cd ~/fluoduo && unzip -o ~/Downloads/patch12.zip && python3 patch12/apply12.py
```

then stop the dev server and

```bash
rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev
```

Verified here: tsc 0 errors, next build 738 pages, item coverage re-measured
against your real content (84 → 0).
