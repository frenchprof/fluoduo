import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import HomeDashboard from "./HomeDashboard";

/** The true Home page (Dan, 2026-07-05): the learning-journey overview —
 *  where you are across all 50 SIOs — plus Réviser/streak/gems. The units
 *  live behind the Unité 0–4 flaps; the deck library — including YOUR custom
 *  decks and the deck builder — lives in the 🗂️ Index (Dan, 2026-07-05:
 *  Home is the journey, the Index is the library). */
export default function Home() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="home" crumb="🏠 Home">
      <div className="mx-auto max-w-3xl px-1 py-2">
        {/* Hero + journey both live in HomeDashboard (client: they need
            live progress for the CTA, chips and bar). */}
        <HomeDashboard />
      </div>
    </CahierShell>
  );
}
