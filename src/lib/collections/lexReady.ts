/**
 * Is a deck ready for the Lexicalator (the syllable key/keyhole game)? It is when
 * every item has hand-authored syllables that reassemble to the word's key (the
 * word minus a trailing "(e)" parenthetical and internal spaces). Decks that
 * aren't segmented yet don't offer the game — there is no old-game fallback
 * anymore (Dan, 2026-07-03: "delete the old skin so we don't ever see it again").
 */
import type { Collection } from "./schema";
import { CURATED } from "@/content/collections";

export const lexBase = (fr: string) => fr.replace(/\s*\([^)]*\)\s*$/, "").trim();
const lexKey = (fr: string) => lexBase(fr).replace(/\s+/g, "");

export function isLexReady(c: Collection | undefined): boolean {
  return (
    !!c &&
    c.items.length > 0 &&
    c.items.every(
      (it) => !!it.syllables && it.syllables.length > 0 && it.syllables.join("") === lexKey(it.fr),
    )
  );
}

export function isLexReadyId(id: string): boolean {
  return isLexReady(CURATED.find((c) => c.id === id));
}
