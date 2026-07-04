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
        <header className="mb-6">
          <h1 className="fluo-serif text-3xl font-black text-[color:var(--fluo-ink)]">
            French 1 — <span className="fluo-hl">50 Can-Do objectives</span>
          </h1>
          <p className="mt-2 max-w-2xl text-base text-[color:var(--fluo-ink-soft)]">
            Behind each objective: a <strong>Pre-Test</strong> before class, and{" "}
            <strong>practice</strong> after it. Tap any circle to jump in.
          </p>
        </header>

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
