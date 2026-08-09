# Patch 7 — the tables patch 6 couldn't reach, and the links it shouldn't have cost

Two things you caught. Both fair.

## 1. Activities → Games still showed raw ids

That table isn't keyed off a route. It's built from the **event payload** —
`"<game> · <collectionId>"`, e.g. `letris · objets-articles` — so nothing in
patch 6 was looking at it. Same for the drills that record under a key instead
of a path: `say-it:possessives`, `ecoutexte:unite-3`, `complete-it:possessives`.

| Was | Now |
|---|---|
| `letris · objets-articles` | VocabulaRain · SIO-021 · Un, une ou des ? |
| `speculearn · aliments` | SpecuLearn · SIO-041 · Les repas et les aliments |
| `dice-practice · en-au-aux-a` | Dice · SIO-032 · Prépositions + pays |
| `matching · commerces` | Matching · SIO-044 · Les commerces — et au marché |
| `devine · aliments` | SpecuLearn · SIO-041 · … *(merged with the row above's activity)* |

## 2. /moi rows lost their links — you're right, and it's older than patch 6

The test was `activityId.startsWith("/")`. Anything recorded under a key —
`say-it:possessives`, `numbus`, `grammarathon:partitifs` — never got a link,
going back to when that view shipped. Patch 6 didn't break it; patch 6 made it
**conspicuous**, by giving those rows a proper name. A name you can't click
looks broken in a way a raw id didn't.

So `hrefForActivity()` now lives beside `describeActivity()` in the same table,
and the two can't drift:

| Key | Now goes to |
|---|---|
| `say-it:possessives` | `/practice/say-it/possessives` |
| `mcq:aliments` | `/decks/aliments/mcq` |
| `grammarathon:partitifs` | `/practice/grammarathon/partitifs` |
| `dice-practice:en-au-aux-a` | `/practice/dice/en-au-aux-a` |
| `numbus` | `/games/numbus` |

There was a **third** private copy of this logic, in `Students.tsx` — it knew
about four prefixes and nothing else, so `say-it:`, `complete-it:`,
`dice-practice:` and `compose:` were dead there too. It now delegates.

While in there: the Games table linked to `` `/games/${key}` `` — i.e.
`/games/letris · objets-articles`, which has never been a route. **Every link
in that table has been dead since it shipped.** They work now.

## One thing I got wrong in patch 6

I had `/practice/say-it/…` rewritten to `/practice/wordrill`. They read as the
same activity, but `say-it` still has a live `[collectionId]` page and
`wordrill` takes no parameter — so that rewrite would have turned working links
into 404s. Removed; `say-it` keeps its route and just reads "WorDrill".

## Run it

**Stop the dev server first** — last time `rm -rf .next` ran underneath a live
Turbopack process and corrupted its cache, which is why the page kept looking
unchanged.

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch7.zip
python3 patch7/apply7.py --dry-run
python3 patch7/apply7.py
rm -rf .next
npx tsc --noEmit && npm run build 2>&1 | tail -3
npm run dev
```

The import helper now refuses to add a symbol that's already imported from the
same module under a different grouping — that's what produced the duplicate
`describePath` yesterday.
