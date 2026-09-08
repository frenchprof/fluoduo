/**
 * /practice/speculearn/pretest/<id>/embed — the merged run, at the pre-test's
 * old address.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and, the same day, *"they CAN be and MUST NOW
 * BE MERGED AS ONE!"*
 *
 * THE ID RESOLVES TO A GOAL AND THE GOAL IS WHAT RUNS. A pre-test id names a
 * stop, and a stop's SpecuLearn is now its whole pool — the authored items
 * first, then the deck's. So this address serves the same 63 questions as
 * `/practice/speculearn/goal/<SIO>`, rather than the 7 it used to. That is the
 * point of the merge: a QR sheet printed in week one cannot be allowed to keep
 * serving half the run.
 *
 * A DRILL KEEPS ITS OWN BAND in a frame — that strip carries the ✕, the goal
 * chip and the progress, so it is the drill rather than furniture. The page
 * around it therefore passes band={false}; only a CahierShell page's band is
 * hidden inside a frame (globals.css).
 */
import { PRETESTS } from "@/content/pretests";
import { stopForPretestId } from "@/lib/stopTag";
import PretestFeed from "../PretestFeed";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stop = stopForPretestId(id);
  return <PretestFeed sioId={stop?.id ?? ""} />;
}
