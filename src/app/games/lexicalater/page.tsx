import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { CURATED } from "@/content/collections";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { shortTitle } from "@/lib/shortTitles";

/** The Lexicalator gallery — one ▶ Jouer card (the next deck) and a bottom
 *  sheet for « Choisir un autre » (patch 23). */
export default function LexicalatorIndexPage() {
  const entries: GalleryEntry[] = CURATED.filter((c) => isLexReadyId(c.id))
    .sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9))
    .map((c) => ({ id: c.id, href: `/games/lexicalater/${c.id}`, title: shortTitle(c.id, c.title), unit: c.unit ?? null, deckId: c.id }));
  return <GameGallery activityKey="lexicalator" emoji="🧰" name="LexicaLater" entries={entries} />;
}
