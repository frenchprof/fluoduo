/**
 * /moi/embed — My Progress, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/moi` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
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
