/**
 * /practice/speculearn/pretest/<id>/embed — a pre-test, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/practice/speculearn/pretest/<id>` is the page a learner opens; this is
 * what runs in the frame it holds, and it is the SAME component the page used
 * to render directly, so the two cannot drift.
 *
 * A DRILL KEEPS ITS OWN BAND in a frame — that strip carries the ✕, the goal
 * chip and the progress, so it is the drill rather than furniture. The page
 * around it therefore passes band={false}; only a CahierShell page's band is
 * hidden inside a frame (globals.css).
 */
import { PRETESTS } from "@/content/pretests";
import PretestFeed from "../PretestFeed";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PretestFeed id={id} />;
}
