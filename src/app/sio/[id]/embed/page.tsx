/**
 * /sio/<id>/embed — the goals scroller, with no notebook around it.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/sio/<id>` is the page a learner opens; this
 * is what runs inside it.
 *
 * IT RENDERS THE SAME TREE, shell and all, and that is deliberate rather than
 * lazy: the chrome is hidden by CSS in a framed document (`html[data-embed]`
 * in globals.css), so there is no second copy of the goals page to drift from
 * the first — exactly the fault that made the old /sio route a redirect in
 * patch 25. Change the goal card and both change.
 */
import CahierShell from "@/components/CahierShell";
import { notFound } from "next/navigation";
import { getSio, SIOS } from "@/content/sios";
import SioScroller from "../SioScroller";
import { HOME_HREF } from "@/lib/routes";

export function generateStaticParams() {
  return SIOS.map((s) => ({ id: s.id }));
}

export default async function SioEmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sio = getSio(id);
  if (!sio) notFound();
  return (
    <CahierShell active="sio" band={{ title: "Goals", exitHref: HOME_HREF }}>
      <div className="mx-auto max-w-3xl">
        <SioScroller id={sio.id} />
      </div>
    </CahierShell>
  );
}
