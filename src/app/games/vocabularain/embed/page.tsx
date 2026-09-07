/**
 * /games/vocabularain/embed — VocabulaRain, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/games/vocabularain` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
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
