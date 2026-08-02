/**
 * Is a deck ready for the Lexicalator (the syllable key/keyhole game)? It is
 * when it has items with hand-authored syllables that reassemble to the word's
 * key (the word minus a trailing "(e)" parenthetical and internal spaces).
 * SOME, not every (Dan, 2026-08-02, ported 2026-08-20): a deck can mix
 * syllabified vocabulary with dialogue sentences that aren't syllabified and
 * never will be (Commerces) — the callers that build the game's entry list
 * must filter to lexReadyItems() themselves; isLexReady() only gates whether
 * the deck offers the game at all. Decks with no segmented items don't offer
 * the game — there is no old-game fallback anymore (Dan, 2026-07-03: "delete
 * the old skin so we don't ever see it again").
 */
import type { Collection, Item } from "./schema";
import { CURATED } from "@/content/collections";

export const lexBase = (fr: string) => fr.replace(/\s*\([^)]*\)\s*$/, "").trim();
const lexKey = (fr: string) => lexBase(fr).replace(/\s+/g, "");

const hasLexSyllables = (it: Item) =>
  !!it.syllables && it.syllables.length > 0 && it.syllables.join("") === lexKey(it.fr);

export function isLexReady(c: Collection | undefined): boolean {
  return !!c && c.items.some(hasLexSyllables);
}

/** The subset of a deck's items that are actually syllabified and playable. */
export function lexReadyItems(c: Collection): Item[] {
  return c.items.filter(hasLexSyllables);
}

export function isLexReadyId(id: string): boolean {
  return isLexReady(CURATED.find((c) => c.id === id));
}
