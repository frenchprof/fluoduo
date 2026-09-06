import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import HomeDashboard from "./HomeDashboard";
import RootGate from "./RootGate";

/** The true Home page (Dan, 2026-07-05): the learning-journey overview —
 *  where you are across all 50 SIOs — plus Réviser/streak/gems. The units
 *  live behind the Unité 0–4 flaps; the deck library — including YOUR custom
 *  decks and the deck builder — lives in the 🗂️ Index (Dan, 2026-07-05:
 *  Home is the journey, the Index is the library).
 *
 *  Since 6 Sep the route is shared with the LANDING page: RootGate shows a
 *  stranger (no sign-in, no local progress) the pitch instead, and everyone
 *  else this page, unchanged. */
export default function Home() {
  return (
    <RootGate>
      <HomeInner />
    </RootGate>
  );
}

function HomeInner() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="home">
      {/* `px-1` removed 1 Sep. Four pixels of nothing, and they were what
          stopped the welcome strip bleeding to the paper's edge: the strip
          pulls itself out by the content well's own padding, and a second
          padded wrapper in between meant it always stopped 4px short on each
          side. Cheaper to delete than to make the strip know about two
          ancestors — and nothing on Home was relying on 4px. */}
      <div className="mx-auto max-w-3xl py-2">
        {/* Hero + journey both live in HomeDashboard (client: they need
            live progress for the CTA, chips and bar). */}
        <HomeDashboard />
      </div>
    </CahierShell>
  );
}
