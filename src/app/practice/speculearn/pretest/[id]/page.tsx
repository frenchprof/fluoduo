/**
 * /practice/speculearn/pretest/<id> — THE PRE-TEST'S OLD ADDRESS, still hosting.
 *
 * Dan, 2026-09-07: *"they CAN be and MUST NOW BE MERGED AS ONE!"*
 *
 * The MERGE is in what runs here, not in this URL disappearing. A pre-test id
 * names a stop, and the stop's SpecuLearn is now the whole pool — so this page
 * serves exactly what `/practice/speculearn/goal/<SIO>` serves. A forward would
 * have done the same job and cost a redirect flash on every QR scan; hosting is
 * simpler and keeps the embed twin this route owns (verify117).
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
       run's band comes from CahierShell, and `html[data-embed]` hides a
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
