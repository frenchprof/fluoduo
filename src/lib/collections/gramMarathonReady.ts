/**
 * Is a deck ready for GramMarathon (the grammar-word cloze drill)? The game
 * plays only items that carry a hand-authored `gap` — the exact grammar
 * word(s) to blank out of the drilled sentence — so a deck qualifies once it
 * has a playable handful of them; ungapped items (a line with no grammar
 * word, like "Oui, bonne idée !") simply sit the game out. Data-driven like
 * isLexReady: tag a deck's items and the tab appears.
 *
 * Single source of truth (2026-08-02 fix — three call sites had drifted into
 * disagreeing rules: the readiness check here used `example ?? fr` while the
 * deck-tab and Index-matrix flap gates each carried their own inline
 * `fr`-only copy, and none of the three agreed with the actual game, which
 * only ever plays `fr`). `gapSentence()` below is now the one place that
 * decides: `fr` is the canonical drilled sentence — most decks' gap already
 * lives there — and `example` is used ONLY as a fallback for the item's OWN
 * gap when `fr` doesn't carry it (a few decks keep `fr` as a short label —
 * e.g. a bare country/place name for Flip It's grid — and drill the full
 * sentence via `example` instead, en-au-aux-a and lieux-letris being the
 * two that actually need it). `example` is NEVER checked first: some decks
 * (partitifs) authored `example` as a separate contrastive sentence that
 * doesn't contain the gap at all, and blindly preferring it there returned
 * the wrong sentence and silently dropped 13/16 valid items from the pool.
 */
import type { Collection, Item } from "./schema";
import { CURATED } from "@/content/collections";

const MIN_GAPPED = 4;

/** The sentence that actually carries an item's authored gap, or undefined
 *  if neither `fr` nor `example` does (an ungapped item, or a data bug). */
export function gapSentence(it: Item): string | undefined {
  if (!it.gap) return undefined;
  if (it.fr.includes(it.gap)) return it.fr;
  if (it.example?.includes(it.gap)) return it.example;
  return undefined;
}

export function gappedItems(c: Collection): Item[] {
  return c.items.filter((it) => gapSentence(it) !== undefined);
}

export function isGramMarathonReady(c: Collection | undefined): boolean {
  return !!c && gappedItems(c).length >= MIN_GAPPED;
}

export function isGramMarathonReadyId(id: string): boolean {
  return isGramMarathonReady(CURATED.find((c) => c.id === id));
}
