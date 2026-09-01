"use client";

/**
 * The Map — the full-screen map page (Dan, 2 Sep: "The separate map
 * interface is for fuller-screen map").
 *
 * Rebuilt to Dan's 2 Sep spec, replacing three layers in one pass:
 *   · the band reads « Map of FluOLinGo-land », followed by one sentence
 *     that carries the legend — the only prose on the page;
 *   · ONE control row: the 2D⇄3D switch left, the zoom field right —
 *     "the 2D-3D switch must remain the same and a fixed place regardless
 *     of which view is active", so it no longer floats over the scene;
 *   · the 2D view is Map2DGrid — ten rows of five, every stop visible,
 *     units told apart by colour bands, not names;
 *   · the U0–U4 jump chips are gone ("Those shortcuts buttons to U0 etc
 *     are to be deleted");
 *   · the unit panel under the map is gone ("we don't need this anymore
 *     … delete it") — a stop opens StopPopup directly, the same popup for
 *     all fifty.
 *
 * Deep links survive the panel's retirement: `#SIO-0XX` opens that stop's
 * popup; `?unit=N` (the /unit/N redirects, printed QR codes) scrolls the
 * map so that unit's band is on screen; `?view=2d|3d` still picks the view
 * and saves it.
 */
import { useEffect, useRef, useState } from "react";
import Map2DGrid from "@/components/Map2DGrid";
import HomeMap3D from "@/components/HomeMap3D";
import HomePrintSheet from "@/components/HomePrintSheet";
import { KindLegend } from "@/components/HomeMap";
import StopPopup from "../StopPopup";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";
// The key and its read/write live in lib/mapView.ts, shared with Home's
// switch — the surfaces that set this view must not spell it three ways.
import { loadMapView, saveMapView, type MapView } from "@/lib/mapView";

export default function MapBody() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [mapView, setMapView] = useState<MapView>("2d");
  const [openSioId, setOpenSioId] = useState<string | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Progress and the saved 2D/3D choice live in localStorage, and the deep
    // link lives in the URL — none of which can be read during render (the
    // site is statically exported), so this mount effect has to seed that
    // state. Block-disabled: the rule reports only the first setState it
    // meets, and which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    const refresh = () => setProgress(loadProgress());
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    setMapView(loadMapView());
    const readUrl = () => {
      const view = new URLSearchParams(window.location.search).get("view");
      if (view === "2d" || view === "3d") {
        setMapView(view);
        saveMapView(view);
      }
      const q = new URLSearchParams(window.location.search).get("unit");
      const hash = window.location.hash.replace("#", "");
      const sio = SIOS.find((s) => s.id === hash);
      if (sio) setOpenSioId(sio.id);
      // With every unit on screen, a ?unit=N deep link only needs to bring
      // that band into view — there is no panel left to open.
      else if (q !== null && /^[0-4]$/.test(q)) {
        document.getElementById(`unit-band-${q}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    };
    readUrl();
    /* eslint-enable react-hooks/set-state-in-effect */
    window.addEventListener("hashchange", readUrl);
    window.addEventListener("popstate", readUrl);
    return () => {
      window.removeEventListener("fluolingo:progress-updated", refresh);
      window.removeEventListener("hashchange", readUrl);
      window.removeEventListener("popstate", readUrl);
    };
  }, []);

  const openSio = (_unit: number, id: string) => {
    setOpenSioId(id);
    try {
      window.history.replaceState(null, "", `/map#${id}`);
    } catch {
      // fine — the popup still opens
    }
  };

  const setZoom = (v: number) => setZoomPct(Math.min(200, Math.max(30, Math.round(v))));
  const setView = (v: MapView) => {
    setMapView(v);
    saveMapView(v);
  };

  const activeId = nextSioId(progress);
  const accent = equippedAccent(progress);
  const openSioObj = openSioId ? SIOS.find((s) => s.id === openSioId) : undefined;

  return (
    <>
      {/* The sentence that carries the legend — Dan's wording, 2 Sep, set in
          the brand's own hand (his follow-up: "It is the wrong font to use
          for English text. Please use the FluOLinGo or Patrick Hand font …
          so that it occupies one line maximum"). One line is enforced, not
          hoped for: nowrap plus a viewport clamp that shrinks the hand face
          before it ever wraps. */}
      <p className="fluo-band-hand whitespace-nowrap text-[clamp(13px,4.3vw,19px)] leading-tight text-[color:var(--cahier-ink)]">
        In FluOLinGo-land, there are 50 color-coded goals to conquer:
      </p>
      <KindLegend />

      {/* ONE control row, fixed for both views: switch left, zoom right. */}
      <div className="mb-2 mt-1.5 flex items-center justify-between gap-3">
        <div
          data-tour="map-view"
          role="group"
          aria-label="Map view"
          className="fluo-mono flex overflow-hidden rounded-xl border-2 text-sm font-black shadow-[2px_2px_0_rgba(0,0,0,0.22)]"
          style={{ borderColor: "var(--cahier-ink)" }}
        >
          {(["2d", "3d"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={mapView === v}
              onClick={() => setView(v)}
              className="px-5 py-2 leading-none"
              style={{
                background: mapView === v ? "var(--cahier-ink)" : "var(--cahier-paper-raised)",
                color: mapView === v ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Zoom, migrated up from under the map (Dan, 2 Sep: "right-aligned
            Zoom control field migrated from below"). */}
        <span className="fluo-mono flex shrink-0 items-center gap-1 text-[12px] font-bold text-[color:var(--cahier-ink-faint)]" aria-label="Zoom">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom(zoomPct - 10)}
            className="rounded-lg border-2 px-2 py-1 leading-none"
            style={{ borderColor: "var(--cahier-line-strong)", background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={30}
            max={200}
            step={10}
            list="fluo-zoom-milestones"
            value={zoomPct}
            aria-label="Zoom percent — type a value or pick a milestone"
            onChange={(e) => setZoom(Number(e.target.value) || 100)}
            className="w-[52px] rounded-lg border-2 px-1 py-1 text-center leading-none"
            style={{ borderColor: "var(--cahier-line-strong)", background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
          />
          <datalist id="fluo-zoom-milestones">
            <option value="50" />
            <option value="75" />
            <option value="100" />
            <option value="150" />
            <option value="200" />
          </datalist>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom(zoomPct + 10)}
            className="rounded-lg border-2 px-2 py-1 leading-none"
            style={{ borderColor: "var(--cahier-line-strong)", background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
          >
            +
          </button>
          <span aria-hidden>%</span>
        </span>
      </div>

      <div ref={mapRef} className="relative scroll-mt-3">
        <div data-tour="map" style={{ zoom: zoomPct / 100 }}>
          {mapView === "3d" ? (
            <HomeMap3D progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
          ) : (
            <Map2DGrid progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
          )}
        </div>
      </div>

      {openSioObj && (
        <StopPopup
          sio={openSioObj}
          onClose={() => {
            setOpenSioId(null);
            try {
              window.history.replaceState(null, "", "/map");
            } catch {
              // fine
            }
          }}
        />
      )}
      <HomePrintSheet progress={progress} />
    </>
  );
}
