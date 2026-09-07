import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { CURATED } from "@/content/collections";

/** MémoiRecall — the cahier, hosting the flashcards in a frame since
 *  2026-09-07. No band here: the drill's own carries the ✕. */
export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <CahierShell active="flip" band={false}>
      <EmbedFrame src={`/practice/flip-it/${collectionId}/embed`} title="MémoiRecall" />
    </CahierShell>
  );
}
