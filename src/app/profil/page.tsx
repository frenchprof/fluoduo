import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** Profile — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="profil">
      <EmbedFrame src="/profil/embed" title="Profile" />
    </CahierShell>
  );
}
