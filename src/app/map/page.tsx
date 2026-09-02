import MapBody from "./MapBody";
import CahierShell from "@/components/CahierShell";

/** 🗺️ The Map — back inside the cahier (Dan, 2026-08-23: "most pages
 *  (except for games) should have this cahier set to the left of the
 *  screen"). This supersedes the 21 Aug "dedicated map interface" ruling:
 *  the tap-to-use glass in MapBody has since solved the finger-scroll
 *  conflict that motivated it, so the notebook frame costs nothing. The
 *  shell's heading band carries the name; the map keeps its glass. */
export const metadata = { title: "Map of FluOLinGo-land — FluOLinGo" };

export default function MapPage() {
  return (
    <CahierShell active="map" band={{ title: "Map of FluOLinGo-land" }}>
      <div className="map-full mx-auto max-w-3xl">
        <MapBody />
      </div>
    </CahierShell>
  );
}
