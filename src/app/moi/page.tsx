import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import ProfileContent from "@/components/ProfileContent";

/** 📊 The profile — one learner model (Design handoff, 2026-08-22). /moi and
 *  /profil are the SAME page now: the merge folded the economy into a strip,
 *  and both routes stayed live so every existing link, QR and bookmark lands
 *  where it always did. */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="moi" band={false}>
      {/* `band={false}`: this page draws its OWN PageBand, inside
          ProfileContent, because its title is the signed-in name and its chip
          is the live outcome count — neither of which a server component
          knows. Without it the shell adds a SECOND band above, and the page
          carries two headings one line apart, which is the fault being fixed
          rather than the fix.

          And no max-w wrapper since 1 Sep: a band centred inside 768px is not
          a band that reaches the paper. ProfileContent constrains its body. */}
      <ProfileContent />
    </CahierShell>
  );
}
