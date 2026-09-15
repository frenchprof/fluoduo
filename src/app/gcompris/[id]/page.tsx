/**
 * /gcompris/<text> — one reading scene, in the cahier.
 *
 * `band={false}`: the drill inside the frame draws its own band and that one
 * carries the ✕. Drawing one out here as well puts two heading strips on the
 * page, one above the other — the fault verify126 pins.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { GC_SCENES } from "@/content/gcompris";

export function generateStaticParams() {
  return GC_SCENES.map((s) => ({ id: s.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CahierShell active="gcompris" band={false}>
      <EmbedFrame src={`/gcompris/${id}/embed`} title="G-Compris!" />
    </CahierShell>
  );
}
