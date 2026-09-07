/**
 * /practice/speculearn/<deck>/embed — a deck's SpecuLearn, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/practice/speculearn/<deck>` is the page a learner opens; this is
 * what runs in the frame it holds, and it is the SAME component the page used
 * to render directly, so the two cannot drift.
 *
 * A DRILL KEEPS ITS OWN BAND in a frame — that strip carries the ✕, the goal
 * chip and the progress, so it is the drill rather than furniture. The page
 * around it therefore passes band={false}; only a CahierShell page's band is
 * hidden inside a frame (globals.css).
 */
import SpecuLearnContent from "../SpecuLearnContent";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";

export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // Never AuthGate mid-guess — browsing and guessing need no sign-in
  // (FINISH_BACKLOG item 3).
  return <SpecuLearnContent collectionId={collectionId} />;
}
