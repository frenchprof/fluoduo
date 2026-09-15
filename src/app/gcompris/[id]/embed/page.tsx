/**
 * /gcompris/<text>/embed — the scene itself, inside the cahier.
 *
 * A server page, so the static export knows the ten addresses to build; the
 * reader beside it is the client component. `"use client"` and
 * `generateStaticParams` cannot share a file, and reading the id from
 * `useParams` instead would leave these routes unbuilt.
 */
import { GC_SCENES } from "@/content/gcompris";
import GComprisScene from "../../GComprisScene";

export function generateStaticParams() {
  return GC_SCENES.map((s) => ({ id: s.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GComprisScene id={id} />;
}
