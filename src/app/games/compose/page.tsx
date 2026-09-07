import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** ComposeIt — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export default function Page() {
  return (
    <CahierShell active="compose">
      <EmbedFrame src="/games/compose/embed" title="ComposeIt" />
    </CahierShell>
  );
}
