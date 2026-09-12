/**
 * /games/vocabularain/embed — VocabulaRain's gallery, running inside the cahier.
 *
 * Dan, 2026-09-07: everything runs in the cahier in an iframe. `/games/
 * vocabularain` is the notebook; this is the activity inside it.
 *
 * MERGE NOTE (same day): main landed the expert-unlock gallery (PR 216) on the
 * old `page.tsx` while this branch was turning that file into the host. The
 * gallery is the ACTIVITY, so main's version is what belongs here — taken
 * whole, not merged by hand.
 */
import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { listLetrisSets } from "@/games/letris/sets";
import { EXPERT_UNLOCKS } from "@/lib/economy";
import { CURATED } from "@/content/collections";
import { shortTitle } from "@/lib/shortTitles";

/** The VocabulaRain gallery — the ▶ Play card for the next set, and all 24
 *  sets on the page under it, folded by unit (Dan, 2026-09-12: the sheet was
 *  the last activity pop-up). Still in course order. */
export default function LetrisIndexPage() {
  const deckOf = (slug: string) => CURATED.find((x) => x.id === slug || x.id === `${slug}-letris`);
  const entries: GalleryEntry[] = listLetrisSets()
    .map((s) => {
      const deck = deckOf(s.slug);
      return { id: s.slug, href: `/games/vocabularain/${s.slug}`, title: shortTitle(s.slug, s.title), unit: deck?.unit ?? null, deckId: deck?.id };
    })
    .sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9));
  // The expert decks join the sheet as GATES (Dan, 7 Sep: gems "can unlock
  // difficult parts" — games only). Until bought the tile is a buy button;
  // the set itself has been in the registry since the content-gap audit,
  // waiting for exactly this door.
  for (const u of EXPERT_UNLOCKS) {
    entries.push({
      id: u.setSlug,
      href: `/games/vocabularain/${u.setSlug}`,
      title: u.label,
      unit: null,
      locked: { unlockId: u.id, cost: u.cost, emoji: u.emoji },
    });
  }
  return <GameGallery activityKey="vocabularain" emoji="🌧️" name="VocabulaRain" entries={entries} />;
}
