/**
 * /practice/speculearn/goal/<SIO-041> — THE ONE SPECULEARN DOOR PER GOAL.
 *
 * Dan, 2026-09-07: *"they CAN be and MUST NOW BE MERGED AS ONE!"*, and
 * *"could we work with bookmarks on the same page (one url) rather than
 * multiple pages"*.
 *
 * KEYED BY THE GOAL, not by the deck and not by a pre-test id, because the
 * pool is a fact about the goal: 36 goals have an authored pre-test and no
 * generated deck, nine have both, and a URL keyed on either half cannot
 * address the other. `/practice/speculearn/<deck>` and
 * `/practice/speculearn/pretest/<id>` still answer and forward here, so
 * printed QR sheets and old bookmarks keep working.
 *
 * The question a learner is on is a HASH on this one address — `#q7` — never a
 * second page. See SpeculearnRun.
 */
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { SIOS } from "@/content/sios";
import { goalNumber, stopForDeck } from "@/lib/stopTag";

export function generateStaticParams() {
  return SIOS.map((s) => ({ sioId: s.id }));
}

export default async function Page({ params }: { params: Promise<{ sioId: string }> }) {
  const { sioId } = await params;
  const sio = SIOS.find((s) => s.id === sioId);
  return (
    <CahierShell
      active="speculearn"
      band={{ title: "SpecuLearn", goal: sio ? goalNumber(sio) : undefined }}
    >
      <EmbedFrame src={`/practice/speculearn/goal/${sioId}/embed`} title="SpecuLearn" />
    </CahierShell>
  );
}
