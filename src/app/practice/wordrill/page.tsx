import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** WorDrill — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export default function Page() {
  return (
    <CahierShell active="wordrill">
      <EmbedFrame src="/practice/wordrill/embed" title="WorDrill" />
    </CahierShell>
  );
}
