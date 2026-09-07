import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** Numbers — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export const metadata = { title: "Numbers — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="numbers">
      <EmbedFrame src="/games/numbers/embed" title="Numbers" />
    </CahierShell>
  );
}
