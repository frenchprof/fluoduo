/**
 * /games/lexicalater/embed — LexicaLater, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/games/lexicalater` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
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
