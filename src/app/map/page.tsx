import Link from "next/link";
import MapBody from "./MapBody";

/** 🗺️ The Map — a DEDICATED MAP INTERFACE, not an embedded page (Dan,
 *  2026-08-21: "should be a dedicated map interface, rather than embedded").
 *  No notebook shell, no rail, no bottom bar — one slim top bar with the
 *  way home at its top-left, then the map owns the viewport. The same
 *  precedent as Flip It's own world: an interface, not a site page. */
export const metadata = { title: "The Map — FluOlinGo" };

export default function MapPage() {
  return (
    <main className="map-full min-h-screen" style={{ background: "var(--cahier-paper)", color: "var(--cahier-ink)" }}>
      <div
        className="sticky top-0 z-20 flex items-center gap-3 border-b-2 px-3 py-2 backdrop-blur"
        style={{ borderColor: "var(--cahier-ink)", background: "color-mix(in oklch, var(--cahier-paper) 90%, transparent)" }}
      >
        {/* The way home — top-left, always (Dan, 2026-08-21). */}
        <Link href="/" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
          ← <span className="cahier-hl">FluOlinGo</span>
        </Link>
        <span lang="fr" className="fluo-serif min-w-0 flex-1 truncate text-right text-lg font-black">
          🗺️ The Map
        </span>
      </div>
      <div className="mx-auto max-w-3xl px-2 py-2">
        <MapBody />
      </div>
    </main>
  );
}
