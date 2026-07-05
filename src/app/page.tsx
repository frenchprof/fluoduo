import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import HomeDashboard from "./HomeDashboard";
import MyDecks from "./MyDecks";

/** The true Home page (Dan, 2026-07-05): the learning-journey overview —
 *  where you are across all 50 SIOs — plus Réviser/streak/gems. The units
 *  themselves live behind the Unité 0–4 flaps. */
export default function Home() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="home" crumb="🏠 Home">
      <div className="mx-auto max-w-3xl px-1 py-2">
        {/* Hero + journey both live in HomeDashboard (client: they need
            live progress for the CTA, chips and bar). */}
        <HomeDashboard />

        <div className="mt-8">
          <MyDecks />
        </div>

        <div className="mt-6">
          <Link href="/decks/new" className="fluo-btn fluo-btn-sm">
            ➕ Your Custom Deck
          </Link>
        </div>
      </div>
    </CahierShell>
  );
}
