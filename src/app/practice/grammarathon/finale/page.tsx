import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import AuthGate from "@/components/AuthGate";
import FinaleContent from "./FinaleContent";

/** 🏁 GramMarathon Finale — the all-topic, weakness-weighted daily revision
 *  paper. Static route beside /practice/grammarathon/[collectionId]; the
 *  static segment wins routing, so "finale" is never treated as a deck id.
 *
 *  THE SHELL IS TOLD THE ACTIVITY, not the family hub (6 Sep). This route
 *  passed `active="practice"`, and the shell derives THREE things from that
 *  key — so all three came out wrong on the one route:
 *
 *    the band's NAME   "PRACTICE" — the family's name. PageBand's own rule is
 *                      that the word on the band is the ACTIVITY's (Dan,
 *                      1 Sep: "the word that appears must be the activity
 *                      name").
 *    the band's COLOUR BAND["practice"] does not exist, so the band fell back
 *                      to the family ink — the olive #756700 — where
 *                      GramMarathon's band is Produce rust.
 *    the page's GROUND Practice yellow, where the registry files GramMarathon
 *                      under Revise.
 *
 *  Its own sibling, the per-deck GramMarathon at [collectionId], has always
 *  declared `activity="grammarathon"` to DrillShell. This route is the same
 *  activity with a different paper, and now says so. */
export const metadata = { title: "GramMarathon Final — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "grammarathon")} active="grammarathon">
      <div className="mx-auto max-w-2xl px-4 py-2">
        <AuthGate what="practise" compact>
          <FinaleContent />
        </AuthGate>
      </div>
    </CahierShell>
  );
}
