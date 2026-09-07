import type { Metadata } from "next";
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { FAMILIES, familyShort } from "@/content/activities";

export const metadata: Metadata = { title: "Skills · FluOLinGo" };

/** The 💪 slot's destination, and since 2026-09-07 the notebook that HOSTS the
 *  hub rather than the one that draws it (Dan: everything runs in the cahier in
 *  an iframe). Before this page existed the slot pointed at /conjugaison — one
 *  of the six (Dan, 2026-08-30). */
export default function SkillsHubPage() {
  return (
    <CahierShell active="skills" band={{ title: familyShort(FAMILIES.find((f) => f.key === "skills")!) }}>
      <EmbedFrame src="/skills/embed" title="Skills" />
    </CahierShell>
  );
}
