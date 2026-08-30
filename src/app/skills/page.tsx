import type { Metadata } from "next";
import FamilyHub from "@/components/FamilyHub";

export const metadata: Metadata = { title: "Skills · FluOlinGo" };

/** The 💪 slot's destination. Before this page it was /conjugaison — one of
 *  the six (Dan, 2026-08-30). */
export default function SkillsHubPage() {
  return <FamilyHub activeKey="skills" />;
}
