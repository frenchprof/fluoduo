import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** 🗺️ The Map — the cahier draws the notebook, the map runs inside it.
 *
 *  Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 *  PAGES IN IFRAMES (EMBEDDED)"*. The map is where the pattern already existed
 *  — `/map/embed` has been the map and nothing else since 6 Sep ("can i have it
 *  as a standalone map which we then embed into our interface on our web") —
 *  so this page stops mounting the map's body and mounts the embed instead.
 *
 *  IT IS THE SAME MAP EITHER WAY. `/map/embed` renders Map2DGrid, the component
 *  this page used to render directly, so nothing can drift between the two.
 *  What the page keeps is the notebook: the site bar, the heading band, the
 *  coils, the bottom bar — drawn once, out here, where the map's own scrolling
 *  can no longer reach them.
 *
 *  The 21 Aug "dedicated map interface" ruling stays superseded (23 Aug: "most
 *  pages (except for games) should have this cahier set to the left of the
 *  screen"); this changes how the map is mounted, not whether it wears the
 *  notebook.
 */
export const metadata = { title: "Map of FluOLinGo-land — FluOLinGo" };

export default function MapPage() {
  return (
    <CahierShell active="map" band={{ title: "Map of FluOLinGo-land" }}>
      <EmbedFrame src="/map/embed" title="Map of FluOLinGo-land" />
    </CahierShell>
  );
}
