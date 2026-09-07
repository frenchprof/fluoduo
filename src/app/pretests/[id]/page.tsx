/**
 * /pretests/<id> — THE OLD ADDRESS, kept alive as a forward.
 *
 * The pre-test moved under SpecuLearn on 2026-09-07 (Dan: *"they should be
 * moved into the SpecuLearn as separate page"*). Printed QR sheets, the
 * teacher dashboard's saved links and a term's worth of bookmarks all name
 * this URL, and the fifty stops' ids are frozen precisely because paper does
 * not get re-issued. So the route still builds, and forwards.
 */
import { PRETESTS } from "@/content/pretests";
import Forward from "@/components/Forward";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Forward to={`/practice/speculearn/pretest/${id}`} />;
}
