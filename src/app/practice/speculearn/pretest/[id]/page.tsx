/**
 * /practice/speculearn/pretest/<id> — THE PRE-TEST'S NEW ADDRESS.
 *
 * Dan, 2026-09-07: *"the Pre-Tests are still sitting under the SIO. They should
 * be moved into the SpecuLearn as separate page - AND ONE QUESTION PER PAGE!"*
 *
 * It lived at `/pretests/<id>`, a top-level family of its own, which is what
 * "sitting under the SIO" describes from the learner's side: the only door to
 * it was a stop on the map, and the page it opened belonged to nothing you
 * could name. The merger has been settled since 2026-08-10 — the registry has
 * said « Pre-Test folds into SpecuLearn » for a month, the band over the page
 * has read « SpecuLearn » since 1 Sep, and the ledger has filed it under
 * SpecuLearn all along. Only the URL had not moved. Now it has, so SpecuLearn
 * is one activity with one address instead of a name over two families.
 *
 * `/pretests/<id>` still answers — it redirects here, keeping printed QR sheets
 * and bookmarks alive.
 */
import { PRETESTS } from "@/content/pretests";
import PretestFeed from "./PretestFeed";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Never AuthGate mid-guess — browsing and guessing need no sign-in
  // (FINISH_BACKLOG item 3).
  return <PretestFeed id={id} />;
}
