/**
 * /practice/ecoutexte/<deck> — ÉcouTexte for ONE lesson.
 *
 * Dan, 2026-09-08, laying out the swipe chain: *"WorDrill — swipe left for
 * ÉcouText for that lesson"*. Before this the chain's ÉcouTexte column had
 * nowhere lesson-shaped to point at, so a learner swiping left off WorDrill
 * landed on the general topic picker and had to find their own way back to
 * what they had been working on.
 *
 * The page is the cahier; the listening runs in the frame, as every station
 * has since 2026-09-07.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { CURATED } from "@/content/collections";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    /* `band={false}`, exactly as the general ÉcouTexte page does it: the drill
       inside the frame draws its own band and that one carries the ✕. Drawing
       one out here as well put TWO heading bands on the page, one above the
       other — measured on the built export before this. The goal number now
       reaches the band that IS drawn, by way of the deck. */
    <CahierShell active="ecoutexte" band={false}>
      <EmbedFrame src={`/practice/ecoutexte/${collectionId}/embed`} title="ÉcouTexte" />
    </CahierShell>
  );
}
