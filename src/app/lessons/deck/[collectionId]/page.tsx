import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { CURATED } from "@/content/collections";

/** The lesson — the cahier, hosting the pager in a frame since 2026-09-07.
 *  No band here: the pager's own carries the ✕ and the goal chip. */
export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <CahierShell active="lesson" band={false}>
      <EmbedFrame src={`/lessons/deck/${collectionId}/embed`} title="MneMemo" />
    </CahierShell>
  );
}
