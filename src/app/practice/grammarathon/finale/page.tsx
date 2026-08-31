import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import AuthGate from "@/components/AuthGate";
import FinaleContent from "./FinaleContent";

/** 🏁 GramMarathon Finale — the all-topic, weakness-weighted daily revision
 *  paper. Static route beside /practice/grammarathon/[collectionId]; the
 *  static segment wins routing, so "finale" is never treated as a deck id. */
export const metadata = { title: "GramMarathon Final — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="practice">
      <div className="mx-auto max-w-2xl px-4 py-2">
        <AuthGate what="practise" compact>
          <FinaleContent />
        </AuthGate>
      </div>
    </CahierShell>
  );
}
