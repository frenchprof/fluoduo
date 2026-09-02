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
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="moi" band={{ title: "Moi" }}>
      {/* The band is the SHELL's now (1 Sep) — drawn inside ProfileContent it
          sat 20px lower than every other band on the site, because the content
          well it lived in is padded and the shell's band is not. It can move
          because it stopped needing anything only that component knows: the
          title is the activity's name and the outcome count came off every
          strip the same day.

          No max-w wrapper either: a band centred inside 768px is not a band
          that reaches the paper. ProfileContent constrains its own body. */}
      <ProfileContent />
    </CahierShell>
  );
}
