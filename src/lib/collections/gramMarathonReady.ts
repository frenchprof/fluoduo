/**
 * Is a deck ready for GramMarathon (the grammar-word cloze drill)? The game
 * plays only the items that carry a hand-authored `gap` — the exact grammar
 * word(s) to blank out of `fr` (e.g. "du", "mange", "besoin d'") — so a deck
 * qualifies once it has a playable handful of them; ungapped items (a line
 * with no grammar word, like "Oui, bonne idée !") simply sit the game out.
 * Data-driven like isLexReady: tag a deck's items and the tab appears.
 */
import type { Collection, Item } from "./schema";
import { CURATED } from "@/content/collections";

const MIN_GAPPED = 4;

export function gappedItems(c: Collection): Item[] {
  // The gap must occur in the drilled sentence — `example` when the item carries
  // one (so `fr` can stay a short grid label), else `fr` itself.
  return c.items.filter((it) => !!it.gap && (it.example ?? it.fr).includes(it.gap));
}

export function isGramMarathonReady(c: Collection | undefined): boolean {
  return !!c && gappedItems(c).length >= MIN_GAPPED;
}

export function isGramMarathonReadyId(id: string): boolean {
  return isGramMarathonReady(CURATED.find((c) => c.id === id));
}
