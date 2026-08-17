import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { listComposeBanks } from "@/games/compose/banks";

/** The ComposeIt gallery — one ▶ Jouer card and a sheet of banks (patch 23). */
export default function Page() {
  const entries: GalleryEntry[] = listComposeBanks()
    .slice()
    .sort((a, b) => a.unit - b.unit)
    .map((b) => ({ id: b.id, href: `/games/compose/${b.id}`, title: `${b.emoji} ${b.title}`, unit: b.unit, deckId: b.deckId }));
  return <GameGallery activityKey="compose" emoji="🧩" name="ComposeIt" entries={entries} />;
}
