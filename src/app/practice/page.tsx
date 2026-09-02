import type { Metadata } from "next";
import FamilyHub from "@/components/FamilyHub";

export const metadata: Metadata = { title: "Practice · FluOLinGo" };

/** The 🏋️ slot's destination. Before this page it was /map — the learning
 *  path, which is Goals' front door, not Practice's (Dan, assignment 2 of
 *  #113). The two Practice activities with doors of their own had no shortcut
 *  anywhere; Memo has no href and is reached from a stop, so it is not listed
 *  — a tile linking nowhere is worse than no tile. */
export default function PracticeHubPage() {
  return <FamilyHub activeKey="practice" />;
}
