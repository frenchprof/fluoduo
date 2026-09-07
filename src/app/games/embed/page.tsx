/**
 * /games/embed — the three Games, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/games` is the page a learner opens; this is
 * what runs in the frame it holds.
 *
 * IT RENDERS THE SAME TREE the page used to, shell and all. That is deliberate
 * rather than lazy: in a framed document the chrome is hidden by CSS
 * (`html[data-embed]`, globals.css), so there is no second copy of this screen
 * that can drift from the first.
 */
import FamilyHub from "@/components/FamilyHub";

export default function GamesEmbedPage() {
  return <FamilyHub activeKey="games" />;
}
