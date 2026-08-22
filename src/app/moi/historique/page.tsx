import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import HistoryContent from "./HistoryContent";

/** ⌛ Full activity history — the door at the foot of the profile. */
export const metadata = { title: "My History — FluOlinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="moi">
      <div className="mx-auto max-w-3xl px-1">
        <a href="/moi" className="fluo-mono text-[10px] font-bold no-underline">‹ PROFILE</a>
        <h1 className="cahier-display cahier-hand mt-1 text-3xl font-normal" style={{ color: "var(--cahier-ink)" }}>
          Everything you have done
        </h1>
        <div className="mt-4">
          <HistoryContent />
        </div>
      </div>
    </CahierShell>
  );
}
