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
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="home">
      <div className="mx-auto max-w-3xl px-1 py-2">
        {/* Hero + journey both live in HomeDashboard (client: they need
            live progress for the CTA, chips and bar). */}
        {/* 🏁 Finale entry (Dan, 2026-07-21: the promised all-topic revision) */}
        <a href="/practice/grammarathon/finale"
          className="mb-3 flex items-center justify-between rounded-2xl border-[3px] border-slate-900 bg-yellow-100 px-4 py-3 font-bold text-slate-900 shadow-[3px_3px_0_#1f2440] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#1f2440]">
          <span lang="fr">🏁 GramMarathon Finale — 100 questions du jour, toutes les leçons</span>
          <span aria-hidden>→</span>
        </a>
        <HomeDashboard />
      </div>
    </CahierShell>
  );
}
