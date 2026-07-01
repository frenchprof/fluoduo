/**
 * Display helpers for items rendered as flashcards / preview cards.
 *
 * Background: a Letris item carries only the FRAGMENT in `fr` (e.g. "beau",
 * "de la neige") and relies on its column's `prefix` ("Il fait ", "Il y a ")
 * to form a real sentence. Letris reconstructs this via buildSentence() before
 * speaking; flashcard-style views must do the same or the FR side won't match
 * the EN gloss ("beau" ≠ "The weather is nice.").
 */
import type { Collection, Item } from "./schema";

/** Returns the sentence form: prefix + fr, capitalised, with a final period. */
export function displayFr(item: Item, collection: Collection): string {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const colTag = item.tags.find((t) => t.startsWith("col:"));
  if (!colTag) return item.fr;
  const key = colTag.slice("col:".length);
  const col = cols.find((c) => c.key === key);
  if (!col?.prefix) return item.fr;
  const joined = (col.prefix + item.fr).replace(/\s+/g, " ").trim();
  const capitalised = joined.charAt(0).toLocaleUpperCase("fr-FR") + joined.slice(1);
  return /[.!?…]$/.test(capitalised) ? capitalised : capitalised + ".";
}

/** English gloss with the optional disambiguation note appended ("Mexico (country)"). */
export function displayEn(item: { en: string; note?: string }): string {
  return item.note ? `${item.en} ${item.note}` : item.en;
}

