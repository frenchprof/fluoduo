import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** ChaTutor — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export default function Page() {
  return (
    <CahierShell active="tutor">
      <EmbedFrame src="/tutor/embed" title="ChaTutor" />
    </CahierShell>
  );
}
