import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** The curated path's map — the half of the drive a learner comes back to
 *  (Dan, 2026-09-14, choosing both halves: a push at the end of a step, and
 *  a page showing all of them with ticks). Framed like every other station
 *  since 2026-09-07. */
export default function Page() {
  return (
    /* `active` NAMES AN ACTIVITY, NOT A FAMILY, and the first draft passed
       "review" — the family key — which resolves to no activity, so the page
       drew no strip, no colour and no heading band at all. verify82 and
       verify126 both caught it. `reviser` is the Revise family's own door, so
       the page wears that family's colour; the band's own words are given
       explicitly below, because this page is the PATH, not ErroReview. */
    <CahierShell active="reviser" band={{ title: "Mid-term revision", emoji: "📋" }}>
      <EmbedFrame src="/path/embed" title="Mid-term revision path" />
    </CahierShell>
  );
}
