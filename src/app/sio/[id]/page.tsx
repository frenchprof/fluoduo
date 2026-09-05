/**
 * /sio/SIO-0NN — THE MIDDLE LEVEL of Dan's chain (2026-09-05: *"so the idea is
 * / MAP > SIO > MneMemO > ..."*).
 *
 * THIS REVERSES PATCH 25's REDIRECT, deliberately. That patch reduced this
 * route to one `window.location.replace` because the page it replaced was a
 * SECOND COPY of the popup Home already opened for the same outcome, and had
 * drifted out of step with it — its pre-test button said "Planned" for
 * pre-tests that existed. The reasoning was about duplication, and it does not
 * reach what is here now: the goal is a level of the app's navigation, and the
 * card it shows is the same `GoalCard` the lesson's ← 🎯 Goal tab shows, from
 * one file, so the two cannot drift the way those two did.
 *
 * The fifty static pages still build, so old bookmarks and printed QR codes
 * land on the goal they name — and now on the goal itself rather than on a
 * redirect to a popup.
 */
import CahierShell from "@/components/CahierShell";
import { notFound } from "next/navigation";
import { getSio, SIOS } from "@/content/sios";
import SioScroller from "./SioScroller";

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
    /* `active="sio"` and not "home": SITE_FAMILY already maps `sio` to the
       goals family, and CahierShell draws its heading band only when a family
       resolves AND the key is not "home" (Home keeps its hero instead). Passing
       "home" here meant the page rendered with no band at all — the frozen
       header Dan asked the goals to scroll behind did not exist. */
    <CahierShell active="sio" band={{ title: "Goals", exitHref: "/map" }}>
      <div className="mx-auto max-w-3xl">
        <SioScroller id={sio.id} />
      </div>
    </CahierShell>
  );
}
