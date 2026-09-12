/**
 * /games/compose/embed — ComposeIt, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/games/compose` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
import GameGallery, { type GalleryEntry } from "@/components/GameGallery";
import { listComposeBanks } from "@/games/compose/banks";

/** The ComposeIt gallery — the ▶ Play card, and every bank on the page under
 *  it, folded by unit (Dan, 2026-09-12). */
export default function Page() {
  const entries: GalleryEntry[] = listComposeBanks()
    .slice()
    .sort((a, b) => a.unit - b.unit)
    .map((b) => ({ id: b.id, href: `/games/compose/${b.id}`, title: `${b.emoji} ${b.title}`, unit: b.unit, deckId: b.deckId }));
  return <GameGallery activityKey="compose" emoji="🧩" name="ComposeIt" entries={entries} />;
}
