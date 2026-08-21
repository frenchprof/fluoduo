import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import CarteBody from "./CarteBody";

/** 🗺️ La Carte — the course map, on its own page (Dan, 2026-08-21): a page
 *  that is ONLY the map scrolls with the map, so a finger travelling the
 *  road never fights the page underneath — the reason it left Home. */
export const metadata = { title: "La Carte — FluOlinGo" };

export default function CartePage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="home">
      <div className="mx-auto max-w-3xl px-1 py-2">
        <CarteBody />
      </div>
    </CahierShell>
  );
}
