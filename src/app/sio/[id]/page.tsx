/**
 * /sio/SIO-0NN — a deep link into Home (patch 25's rule, applied here on
 * 2026-08-17). The standalone SIO page duplicated the popup Home already
 * opens for the same outcome (SioDetail inside SioModal) and had drifted:
 * its pre-test button said "Planned" for outcomes whose pre-test exists.
 * Nothing linked here except KeyNav's two-digit jump (now pointed at Home
 * directly), so the page is one redirect: `/?unit=N#SIO-0NN`, where Home
 * scrolls the map to the region band and opens that outcome's popup.
 * The fifty static pages still build (old bookmarks, QR codes) — each is
 * only this. MarkDoneButton stays in this folder; three pages import it.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSio, SIOS } from "@/content/sios";
import SioRedirect from "./SioRedirect";

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
  const href = `/?unit=${sio.unit}#${sio.id}`;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-center">
      <SioRedirect href={href} />
      {/* No-JS fallback: the same link, by hand. */}
      <Link href={href} className="fluo-mono text-sm font-bold underline">
        {sio.id} · {sio.topic} →
      </Link>
    </main>
  );
}
