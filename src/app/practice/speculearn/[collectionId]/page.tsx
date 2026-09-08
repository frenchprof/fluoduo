/**
 * /practice/speculearn/<deck> — AN OLD DOOR, KEPT OPEN AND FORWARDED.
 *
 * Dan, 2026-09-07, over a screenshot of SIO-041 wearing two 💡:
 * *"it does not matter if they are different versions, but the combined pool
 * between them consists only of MCQ, so they CAN be and MUST NOW BE MERGED AS
 * ONE!"*
 *
 * This was the GENERATED SpecuLearn — a deck's photos and words, dealt as
 * four-way MCQs. Its questions are not gone: `speculearnPool` folds them into
 * the goal's one run alongside the authored pre-test, so a deck's words are
 * still asked, in the same place as everything else the goal can ask. What is
 * gone is the second door, which is the whole of Dan's instruction.
 *
 * The address stays because it is on QR sheets and in histories; it now lands
 * on `/practice/speculearn/goal/<SIO>`. A deck with no goal keeps the old
 * runner rather than forwarding into nowhere.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import Link from "next/link";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";
import { speculearnHrefForDeck } from "@/lib/speculearn/route";
import Forward from "@/components/Forward";

export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  const merged = speculearnHrefForDeck(collectionId);
  if (merged) {
    return (
      <CahierShell active="speculearn" band={{ title: "SpecuLearn" }}>
        <Forward to={merged} />
        {/* No-JS fallback: the same hop, by hand. */}
        <div className="px-4 py-10 text-center">
          <Link href={merged} className="fluo-mono text-sm font-bold underline">
            SpecuLearn →
          </Link>
        </div>
      </CahierShell>
    );
  }
  return (
    <CahierShell active="speculearn" band={false}>
      <EmbedFrame src={`/practice/speculearn/${collectionId}/embed`} title="SpecuLearn" />
    </CahierShell>
  );
}
