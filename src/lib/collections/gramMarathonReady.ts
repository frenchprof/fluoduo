/**
 * Is a deck ready for GramMarathon (the grammar-word cloze drill)? The game
 * plays only the items that carry a hand-authored `gap` — the exact grammar
 * word(s) to blank out (e.g. "du", "mange", "besoin d'") — so a deck
 * qualifies once it has a playable handful of them; ungapped items (a line
 * with no grammar word, like "Oui, bonne idée !") simply sit the game out.
 * Data-driven like isLexReady: tag a deck's items and the tab appears.
 *
 * 2026-08-08: the "which sentence holds the gap?" question moved to the shared
 * `gapSentence` helper, because this file and the game itself had answered it
 * differently — this gate checked `example ?? fr` while GramMarathonContent
 * filtered on `fr`. Three decks were affected (SIO-032, SIO-033, SIO-042); see
 * gapSentence.ts for the full account.
 */
import type { Collection, Item } from "./schema";
import { CURATED } from "@/content/collections";
import { isPlayableGap } from "./gapSentence";

const MIN_GAPPED = 4;

export function gappedItems(c: Collection): Item[] {
  return c.items.filter(isPlayableGap);
}

export function isGramMarathonReady(c: Collection | undefined): boolean {
  return !!c && gappedItems(c).length >= MIN_GAPPED;
}

export function isGramMarathonReadyId(id: string): boolean {
  return isGramMarathonReady(CURATED.find((c) => c.id === id));
}
