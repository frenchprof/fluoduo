import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** ConjugaZone — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). No band here: the drill inside draws its own,
 *  and that one carries the ✕. */
export default function Page() {
  return (
    <CahierShell active="conjugaison" band={false}>
      <EmbedFrame src="/conjugaison/embed" title="ConjugaZone" />
    </CahierShell>
  );
}
