import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { listLetrisSets } from "@/games/letris/sets";
import { CURATED } from "@/content/collections";
import { shortTitle } from "@/lib/shortTitles";

/** The VocabulaRain gallery — one ▶ Jouer card (the next set) and a bottom
 *  sheet for « Choisir un autre » (patch 23). The 24-tile grid that used to
 *  be the page lives in the sheet, still in course order. */
export default function LetrisIndexPage() {
  const deckOf = (slug: string) => CURATED.find((x) => x.id === slug || x.id === `${slug}-letris`);
  const entries: GalleryEntry[] = listLetrisSets()
    .map((s) => {
      const deck = deckOf(s.slug);
      return { id: s.slug, href: `/games/vocabularain/${s.slug}`, title: shortTitle(s.slug, s.title), unit: deck?.unit ?? null, deckId: deck?.id };
    })
    .sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9));
  return <GameGallery activityKey="vocabularain" emoji="🌧️" name="VocabulaRain" entries={entries} />;
}
