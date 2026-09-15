import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** G-Compris! — the cahier, hosting the shelf of texts in a frame. */
export default function Page() {
  return (
    <CahierShell active="gcompris">
      <EmbedFrame src="/gcompris/embed" title="G-Compris!" />
    </CahierShell>
  );
}
