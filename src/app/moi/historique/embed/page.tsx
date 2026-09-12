/**
 * /moi/historique/embed — History, running inside the cahier the User page
 * draws (the `/profil/embed` pattern, 2026-09-07).
 *
 * The ‹ PROFILE link is gone and so is the « Everything you have done »
 * heading: the tab strip above is the way back now, and the band already says
 * HISTORY, so the heading repeated the band — the litmus test's own case.
 */
import CahierShell from "@/components/CahierShell";
import HistoryContent from "../HistoryContent";

export const metadata = { title: "My History — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="moi">
      <div className="mx-auto max-w-3xl px-1 py-3">
        <HistoryContent />
      </div>
    </CahierShell>
  );
}
