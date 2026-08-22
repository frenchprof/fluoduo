import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import ProfileContent from "@/components/ProfileContent";

/** 📊 The profile — one learner model (Design handoff, 2026-08-22). /moi and
 *  /profil are the SAME page now: the merge folded the economy into a strip,
 *  and both routes stayed live so every existing link, QR and bookmark lands
 *  where it always did. */
export const metadata = { title: "My Profile — FluOlinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="moi">
      <div className="mx-auto max-w-3xl">
        <ProfileContent />
      </div>
    </CahierShell>
  );
}
