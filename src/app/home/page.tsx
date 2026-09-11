import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import HomeDashboard from "../HomeDashboard";

/** The true Home page (Dan, 2026-07-05): the learning-journey overview —
 *
 *  IT LIVES AT `/home` SINCE 2026-09-09, not at `/`. Dan: *"whether it is
 *  welcome or not, the first i see must be the one with Welcome to FluOLinGo
 *  in the horizon"*, and, asked whether that should greet him on every visit
 *  or only the first: every time. So the root renders the welcome page and
 *  Home took an address of its own.
 *
 *  THAT MOVE IS WHY SIXTEEN LINKS CHANGED IN THE SAME PATCH. `href="/home"` meant
 *  "Home" in fifteen places — the wordmark, the 🏠 button, "← Back to the
 *  path", the deck pages' "Home", the 404's button, the guide's Continue —
 *  plus one `router.push("/home")`. Left alone they would each have landed on the
 *  welcome page, and the ENTER coin, which also pointed at `/`, would have
 *  bounced a learner straight back to the screen they had just left. A door
 *  that returns you to itself is the whole risk in this change.
 *
 *  where you are across all 50 SIOs — plus Réviser/streak/gems. The units
 *  live behind the Unité 0–4 flaps; the deck library — including YOUR custom
 *  decks and the deck builder — lives in the 🗂️ Index (Dan, 2026-07-05:
 *  Home is the journey, the Index is the library). */
export default function Home() {
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
