import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import ProfileContent from "@/components/ProfileContent";

/**
 * 🎖️ Profil — the SAME page as /moi since the 2026-08-22 merge.
 *
 * It used to be the economy surface: level ring, XP bar, badge grid, gem
 * boutique, and a card at the top pointing at /moi for "the learning". Two
 * profile pages, and the one a learner opened to ask "what do I do now?"
 * answered with a level ring. Dan merged them; the economy is the THRILLS
 * strip inside the one page, and this route is kept (rather than redirected)
 * because it is linked from the account chip, printed handouts and old
 * bookmarks — a live page beats a hop.
 */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="profil" band={false}>
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
