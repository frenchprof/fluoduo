/**
 * /practice/flip-it/<deck>/embed — a deck's flashcards, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/practice/flip-it/<deck>` is the page a learner opens; this is
 * what runs in the frame it holds, and it is the SAME component the page used
 * to render directly, so the two cannot drift.
 *
 * A DRILL KEEPS ITS OWN BAND in a frame — that strip carries the ✕, the goal
 * chip and the progress, so it is the drill rather than furniture. The page
 * around it therefore passes band={false}; only a CahierShell page's band is
 * hidden inside a frame (globals.css).
 */
import { CURATED } from "@/content/collections";
import FlipItContent from "../FlipItContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="practise"><FlipItContent collectionId={collectionId} /></AuthGate>;
}
