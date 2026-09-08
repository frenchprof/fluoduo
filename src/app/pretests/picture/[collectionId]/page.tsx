/**
 * /pretests/picture/<deck> — THE OLD ADDRESS, kept alive as a forward.
 *
 * WHAT WAS HERE. A second pre-test engine, 472 lines of it, that showed a
 * picture and asked for the word (and the reverse). It was built before the
 * generated SpecuLearn existed and it never got a door: nothing in the app
 * links to this address — the only mention left anywhere under `src/` was a
 * row in the label table.
 *
 * AND IT MOSTLY HAD NOTHING TO RUN. It needs four items in a deck carrying an
 * emoji, and counted on the built export: **32 of the 50 pages rendered "No
 * picture pretest available"** and an error code. Two thirds of a route whose
 * whole job was to say it could not do its job.
 *
 * WHAT REPLACED IT. `speculearnPool`'s `fromDeck` builds exactly this question
 * — the deck's photo or emoji as the cue, four words from the same deck as the
 * options — into the goal's one merged run, where it is served one question
 * per screen alongside the authored and unit-0 questions. A deck too thin for
 * four picture questions still has a run, because the authored questions are
 * in the same pool; that is the case this page could only refuse.
 *
 * WHAT THE FORWARD DOES NOT CARRY, said plainly: the word→picture direction,
 * where the four OPTIONS are pictures. The pool deliberately takes one
 * direction only (pooling both asks the same item twice in one run), and that
 * direction is still played by the generated engine at
 * `/practice/speculearn/<deck>`. No learner loses it, because no learner could
 * reach this page to have it.
 */
import { CURATED } from "@/content/collections";
import { speculearnHrefForDeck } from "@/lib/speculearn/route";
import Forward from "@/components/Forward";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // A deck with no stop still has to land somewhere — the family's own hub,
  // never a dead end. `speculearnHrefForDeck` answers null for exactly that.
  return <Forward to={speculearnHrefForDeck(collectionId) ?? "/practice/speculearn"} />;
}
