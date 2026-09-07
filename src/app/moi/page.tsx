import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** My Progress — the cahier, hosting the activity in a frame since 2026-09-07
 *  (Dan: everything runs in the cahier in an iframe). */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return (
    /* THE TITLE IS PASSED, NOT LOOKED UP (Dan, 2026-09-07: pages never lose
       their coloured strip at the top). "moi" has a family — `user` — but no
       flap and no registry entry of its own, because /moi and /profil are one
       page and Profile is the entry. CahierShell draws no band without a title,
       so this host drew none, and /moi/embed's own band is hidden inside a
       frame: the page had no strip. It says « Profile » rather than « Moi »
       because it IS /profil, and one page with two names is the fault under
       the fault. */
    <CahierShell active="moi" band={{ title: "Profile" }}>
      <EmbedFrame src="/moi/embed" title="My Progress" />
    </CahierShell>
  );
}
