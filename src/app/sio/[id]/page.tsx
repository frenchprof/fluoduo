/**
 * /sio/SIO-0NN — THE MIDDLE LEVEL of Dan's chain (2026-09-05: *"so the idea is
 * / MAP > SIO > MneMemO > ..."*), and since 2026-09-07 the notebook that HOSTS
 * it rather than the notebook that draws it: *"EVERYTHING (LIKE THE MAP) MUST
 * NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES (EMBEDDED)"*.
 *
 * So this page is the cahier — site bar, heading band, coils, bottom bar — and
 * the fifty goals scroll inside `/sio/<id>/embed`, in their own document where
 * their scrolling cannot reach the header above them.
 *
 * THIS STILL REVERSES PATCH 25's REDIRECT, deliberately. That patch reduced
 * this route to one `window.location.replace` because the page it replaced was
 * a SECOND COPY of the popup Home already opened, and had drifted out of step
 * with it. The reasoning was about duplication and it does not reach what is
 * here: the frame renders the same `GoalCard` from one file.
 *
 * The fifty static pages still build, so old bookmarks and printed QR codes
 * land on the goal they name.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { notFound } from "next/navigation";
import { getSio, SIOS } from "@/content/sios";

export function generateStaticParams() {
  return SIOS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sio = getSio(id);
  return { title: sio ? `${sio.id} · ${sio.topic}` : id };
}

export default async function SioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sio = getSio(id);
  if (!sio) notFound();
  return (
    /* `active="sio"` and not "home": SITE_FAMILY maps `sio` to the goals
       family, and CahierShell draws its heading band only when a family
       resolves AND the key is not "home". */
    <CahierShell active="sio" band={{ title: "Goals", exitHref: "/map" }}>
      <EmbedFrame src={`/sio/${sio.id}/embed`} title={`${sio.id} — ${sio.topic}`} />
    </CahierShell>
  );
}
