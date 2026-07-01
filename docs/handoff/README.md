# LAF1201 / Fluolingo — Flashcard Handoff

This bundle hands off the **flashcard + Letris specification** for LAF1201 (Atelier A1)
so it can be wired into the **existing half-built Fluolingo HTML** — do **not** rebuild from scratch.

## Files

| File | What it is |
|---|---|
| `LAF1201_SIOs_Flashcards_v9.xlsx` | Master spec: all 50 SIOs (Unités 0–4), one row per SIO, with Front side / Back side / Overview columns / Letris baskets. **This is the source of truth for deck structure.** |
| `LAF1201_SIOs_Flashcards_v9.csv` | Same content as the xlsx, flattened to CSV for easy parsing in code. |
| `vocab_lists.json` | The **locked vocabulary item lists** (simple nouns, everyday objects, food, transport, **25 countries/nationalities/languages**) + **open items** still needing Dan's decision (commerces pairing, food subset). |

## How the spec maps to flashcards

Each SIO row defines ONE deck. The columns mean:

- **Flashcard Set** — deck ID (e.g. `0.07`, `2.01`). Matches Fluolingo deck numbering.
- **Front side** — what shows before flip (English cue / image / pattern blank).
- **Back side (flipped)** — the French answer + any TTS note.
- **Overview columns** — the columns for the reference/overview table view of that deck.
- **Letris / Notes** — the falling-tile sorting game config: how many baskets and what they are.

## Grammar guard-rails (IMPORTANT — already enforced in v9)

- Present tense + futur proche only (`aller / pouvoir / devoir / falloir + infinitif`).
- **No imperative** anywhere **except SIO-009** (classroom instructions).
  - Directions (SIO-036) and itinerary (SIO-040) use `il faut + inf.` / `on + present`, NOT `Tournez/Allez/Prenez`.
- No passé composé, no imparfait, no conditionnel-as-conjugation.
- `je voudrais / j'aimerais` allowed as fixed politeness expressions.

## Production-task SIOs (the SIO-XX0 rows: 020, 030, 040, 050)

These are speaking/writing tasks, but they STILL get flashcards — **representative model
sentences** that scaffold the output. See those rows' Front/Back columns.

## Card-by-card manifest status

The xlsx/csv give the **deck-level spec**. The **per-card manifest** (one row per individual
card, ~450 cards) is NOT yet generated because three vocab decisions are still open:

1. ~~**39 countries**~~ — **LOCKED: 25-country set** in `vocab_lists.json` (SIO-015/016/017). Matching games, not Letris.
2. **Food** — ~55 items listed in `vocab_lists.json`; Dan to confirm full set vs subset.
3. **Commerces** — confirm the `chez le marchand` pairing pattern (shop name ↔ chez + tradesperson).

Once those are settled, the per-card manifest can be generated in the format Fluolingo
ingests (JSON / Firestore schema) and merged into the existing deck files.

## Locked & ready-to-build now (no decision needed)

- Simple nouns (SIO-007) — 15 items, baskets un/une/des
- Everyday objects (SIO-021) — 14 items from the slide, baskets un/une/des
- Transport Letris (SIO-038) — en vs à baskets
- All grammar-pattern decks (pronouns, être, avoir, articles, partitives, demonstratives,
  futur proche, modals) — fully specified in the xlsx.
