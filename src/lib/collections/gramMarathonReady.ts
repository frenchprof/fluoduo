/**
 * Is a deck ready for GramMarathon (the grammar-word cloze drill)? It is when
 * every item carries a hand-authored `gap` — the exact grammar word(s) to blank
 * out of `fr` (e.g. "du", "de la", "d'"). Data-driven like isLexReady: tag a
 * deck's items and the tab appears, no registry to update.
 */
import type { Collection } from "./schema";
import { CURATED } from "@/content/collections";

export function isGramMarathonReady(c: Collection | undefined): boolean {
  return (
    !!c &&
    c.items.length > 0 &&
    c.items.every((it) => !!it.gap && it.fr.includes(it.gap))
  );
}

export function isGramMarathonReadyId(id: string): boolean {
  return isGramMarathonReady(CURATED.find((c) => c.id === id));
}
