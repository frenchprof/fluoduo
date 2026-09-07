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
import { goalNumber, stopForPretestId } from "@/lib/stopTag";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    /* THE HOST DRAWS THE BAND (Dan, 2026-09-07: *"we also need to make it a
       point that pages never lose their coloured strip at the top, which means
       this should be illegal"*, over a screenshot of this very page).
       `band={false}` was here on the reasoning that the framed drill draws its
       own strip. That reasoning holds for the five DrillShell activities — a
       drill's band carries its ✕, goal chip and progress — but NOT here: the
       pre-test's band comes from CahierShell, and `html[data-embed]` hides a
       CahierShell band inside a frame. Host suppressed + frame hidden = a page
       with no strip at all, which is what Dan was looking at. */
    <CahierShell
      active="pretest"
      band={{ title: "SpecuLearn", goal: goalNumber(stopForPretestId(id)) }}
    >
      <EmbedFrame src={`/practice/speculearn/pretest/${id}/embed`} title="SpecuLearn" />
    </CahierShell>
  );
}
