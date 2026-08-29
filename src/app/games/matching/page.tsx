import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { CURATED } from "@/content/collections";
import { shortTitle } from "@/lib/shortTitles";

/** The Match It gallery — one ▶ Jouer card and a sheet of decks (patch 23).
 *  Only decks with authored pairs are listed, so no tile is a 404. */
export default function Page() {
  const entries: GalleryEntry[] = CURATED.filter((c) => (c.gameConfig?.matching?.pairs?.length ?? 0) > 0)
    .sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9))
    .map((c) => ({ id: c.id, href: `/games/matching/${c.id}`, title: shortTitle(c.id, c.title), unit: c.unit ?? null, deckId: c.id }));
  return <GameGallery activityKey="matching" emoji="🔗" name="Match It" entries={entries} />;
}
