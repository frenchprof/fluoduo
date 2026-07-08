/**
 * Word-level deck search (Dan, 2026-07-08: "a lot of words like bruine,
 * tonnerre, vent" were missing — the old Index search matched deck TITLES
 * only). This searches every item of every curated deck (fr, en, example,
 * exampleEn) plus the deck title/subtitle, accent- and case-blind, and
 * reports WHICH words matched so the UI can show them. One shared module:
 * the Home search box and the Practice Index both call searchDecks().
 */
import { CURATED } from "@/content/collections";
import type { Collection, Item } from "@/lib/collections/schema";

/** Accent-blind match: "cafe" finds Café, "ou" finds Où. */
export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export type DeckHit = {
  deck: Collection;
  /** The deck's own title/subtitle matched (not just an item inside it). */
  titleHit: boolean;
  /** Items whose fr/en/example matched — capped, for display. */
  words: Item[];
};

type Row = { deck: Collection; title: string; items: { it: Item; text: string }[] };
let INDEX: Row[] | null = null;

function index(): Row[] {
  INDEX ??= CURATED.map((deck) => ({
    deck,
    title: norm(`${deck.title} ${deck.subtitle ?? ""}`),
    items: deck.items.map((it) => ({
      it,
      text: norm([it.fr, it.en, it.example ?? "", it.exampleEn ?? ""].join(" | ")),
    })),
  }));
  return INDEX;
}

export function searchDecks(q: string, maxWordsPerDeck = 4): DeckHit[] {
  const n = norm(q.trim());
  if (!n) return [];
  const hits: DeckHit[] = [];
  for (const row of index()) {
    const titleHit = row.title.includes(n);
    const words = row.items.filter((x) => x.text.includes(n)).map((x) => x.it);
    if (titleHit || words.length > 0) {
      hits.push({ deck: row.deck, titleHit, words: words.slice(0, maxWordsPerDeck) });
    }
  }
  // Decks named after the query first, then the richest word matches.
  return hits.sort(
    (a, b) => Number(b.titleHit) - Number(a.titleHit) || b.words.length - a.words.length,
  );
}
