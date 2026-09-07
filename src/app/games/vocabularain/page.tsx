import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** VocabulaRain — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export default function Page() {
  return (
    <CahierShell active="vocabularain">
      <EmbedFrame src="/games/vocabularain/embed" title="VocabulaRain" />
    </CahierShell>
  );
}
