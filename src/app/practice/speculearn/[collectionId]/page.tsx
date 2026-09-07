import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";

/** A deck's SpecuLearn — the cahier, hosting the game in a frame since
 *  2026-09-07 (Dan: everything runs in the cahier in an iframe). No band here:
 *  the drill inside draws its own, and that one carries the ✕. */
export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <CahierShell active="speculearn" band={false}>
      <EmbedFrame src={`/practice/speculearn/${collectionId}/embed`} title="SpecuLearn" />
    </CahierShell>
  );
}
