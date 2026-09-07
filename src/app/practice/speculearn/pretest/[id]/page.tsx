/**
 * /practice/speculearn/pretest/<id> — THE PRE-TEST'S ADDRESS, and since
 * 2026-09-07 the notebook that HOSTS it (Dan: "EVERYTHING (LIKE THE MAP) MUST
 * NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES (EMBEDDED)").
 *
 * It lived at `/pretests/<id>`, a top-level family of its own, which is what
 * "sitting under the SIO" described from the learner's side. The merger has
 * been settled since 2026-08-10 — the registry has said « Pre-Test folds into
 * SpecuLearn » for a month — and only the URL had not moved. `/pretests/<id>`
 * still answers and forwards, keeping printed QR sheets alive.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { PRETESTS } from "@/content/pretests";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CahierShell active="pretest" band={false}>
      <EmbedFrame src={`/practice/speculearn/pretest/${id}/embed`} title="SpecuLearn" />
    </CahierShell>
  );
}
