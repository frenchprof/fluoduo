"use client";

/**
 * The Map — the course map on ITS OWN PAGE (Dan, 2026-08-21: "avoid having
 * that map within the same page as the navigational controls and menu items,
 * because as we scroll down with the finger, it will inadvertently cause the
 * finger to scroll on the map instead of the page").
 *
 * Everything map-shaped that used to live inline on Home moved here whole:
 * the 2D ⇄ 3D toggle (remembered under `fluo.homeMapView`), both views, the
 * unit's SIO list that opens under the map, and the A4 print sheet. Home
 * keeps the hero and links here with one card.
 *
 * Deep links: `/map?unit=N` and/or `#SIO-0XX` — same grammar the Home page
 * used (`/?unit=N` still works: Home forwards it here, so the printed QR
 * codes and old bookmarks survive).
 */
import { useEffect, useRef, useState } from "react";
import HomeMap from "@/components/HomeMap";
import HomeMap3D from "@/components/HomeMap3D";
import HomePrintSheet from "@/components/HomePrintSheet";
import UnitSection from "../UnitSection";
import { CHAPTERS } from "@/content/chapters";
import { SIOS, UNIT_META } from "@/content/sios";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";

const MAP_VIEW_KEY = "fluo.homeMapView";

export default function MapBody() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [mapView, setMapView] = useState<"2d" | "3d">("2d");
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [openSioId, setOpenSioId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  // The map behind one more layer (Dan, 2026-08-22: "embedded in one more
  // layer to prevent scrolling on it accidentally when going down the page").
  // Until the learner taps the sheet, the map is a picture: pointer-events
  // off underneath, so a finger (or wheel) travelling down the page glides
  // over — the 3D camera and the 2D zoom can only catch AFTER the tap says
  // "I mean the map". Same contract as an embedded street map.
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const refresh = () => setProgress(loadProgress());
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    try {
      if (window.localStorage.getItem(MAP_VIEW_KEY) === "3d") setMapView("3d");
    } catch {
      // storage blocked → 2D
    }
    // Deep link: ?unit=N and/or #SIO-0XX (the grammar Home used).
    const readUrl = () => {
      const q = new URLSearchParams(window.location.search).get("unit");
      const hash = window.location.hash.replace("#", "");
      const sio = SIOS.find((s) => s.id === hash);
      const u = sio ? sio.unit : q !== null && /^[0-4]$/.test(q) ? Number(q) : null;
      if (u !== null) setOpenUnit(u);
      if (sio) setOpenSioId(sio.id);
    };
    readUrl();
    window.addEventListener("hashchange", readUrl);
    window.addEventListener("popstate", readUrl);
    return () => {
      window.removeEventListener("fluolingo:progress-updated", refresh);
      window.removeEventListener("hashchange", readUrl);
      window.removeEventListener("popstate", readUrl);
    };
  }, []);

  // A deep-linked unit brings the MAP to the top of the screen.
  useEffect(() => {
    if (openUnit === null || openSioId) return;
    mapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [openUnit, openSioId]);

  const openSio = (unit: number, id: string) => {
    setOpenUnit(unit);
    setOpenSioId(id);
    try {
      window.history.replaceState(null, "", `/map?unit=${unit}#${id}`);
    } catch {
      // fine — the modal still opens
    }
  };
  const showUnit = (unit: number) => {
    setOpenSioId(null);
    setOpenUnit(unit);
    try {
      window.history.replaceState(null, "", `/map?unit=${unit}`);
    } catch {
      // fine
    }
  };

  const activeId = nextSioId(progress);
  const accent = equippedAccent(progress);

  return (
    <>
      {/* 2D · 3D — a small segmented control; the map below follows. */}
      <div ref={mapRef} className="mb-2 flex scroll-mt-3 items-center justify-end">
        <div data-tour="map-view" role="group" aria-label="Map view" className="fluo-mono flex overflow-hidden rounded-lg border-2 text-[11px] font-black" style={{ borderColor: "var(--cahier-ink)" }}>
          {(["2d", "3d"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={mapView === v}
              onClick={() => {
                setMapView(v);
                try {
                  window.localStorage.setItem(MAP_VIEW_KEY, v);
                } catch {
                  // fine — the choice just does not persist
                }
              }}
              className="px-2.5 py-1 leading-none"
              style={{
                background: mapView === v ? "var(--cahier-ink)" : "var(--cahier-paper-raised)",
                color: mapView === v ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div data-tour="map" className={engaged ? undefined : "pointer-events-none select-none"} {...(engaged ? {} : { inert: true })}>
          {mapView === "3d" ? (
            <HomeMap3D progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
          ) : (
            <HomeMap progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
          )}
        </div>
        {!engaged && (
          <button
            type="button"
            data-tour="map-wake"
            onClick={() => setEngaged(true)}
            className="absolute inset-0 z-10 flex cursor-pointer items-end justify-center rounded-2xl pb-4"
            aria-label="Tap to use the map"
            /* Transparent glass over the picture: it eats the tap that means
               "wake the map" and nothing else — wheel and touch-drag on it
               scroll the PAGE, because the glass itself has nothing to
               scroll. */
            style={{ background: "transparent", touchAction: "pan-y" }}
          >
            <span
              className="fluo-mono pointer-events-none rounded-full border-2 px-3 py-1.5 text-[11px] font-black shadow-[2px_2px_0_rgba(0,0,0,0.18)]"
              style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper)", color: "var(--cahier-ink)" }}
            >
              Tap to use the map
            </span>
          </button>
        )}
      </div>

      {/* The unit's SIO list, inline under the map — opens from a region
          pill, a stop, or the deep link. */}
      {openUnit !== null && (
        <div id={`unit-list-${openUnit}`} className={`fluo-h-${openUnit % 6} mt-6 scroll-mt-4`}>
          <div className="mb-3 flex items-start gap-2 rounded-2xl border-2 px-4 py-3" style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}>
            <div className="min-w-0 flex-1">
              <p lang="fr" className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
                {UNIT_META[openUnit]?.emoji} {CHAPTERS[openUnit]?.scenario}
              </p>
              <p lang="fr" className="text-sm font-bold text-[color:var(--fluo-ink)]/70">{CHAPTERS[openUnit]?.tagline}</p>
            </div>
            <button
              type="button"
              aria-label="Close unit"
              onClick={() => {
                setOpenUnit(null);
                setOpenSioId(null);
                try {
                  window.history.replaceState(null, "", "/map");
                } catch {
                  // fine
                }
              }}
              className="fluo-mono rounded-lg border-2 px-2 py-0.5 text-xs font-black text-[color:var(--fluo-ink)]"
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card)" }}
            >
              ✕
            </button>
          </div>
          <UnitSection
            key={openUnit}
            unit={openUnit}
            openSioId={openSioId}
            onSioClosed={() => {
              setOpenSioId(null);
              try {
                window.history.replaceState(null, "", `/map?unit=${openUnit}`);
              } catch {
                // fine
              }
            }}
          />
          {CHAPTERS[openUnit]?.cliffhanger && openUnit < 4 && (
            <button
              type="button"
              onClick={() => showUnit(openUnit + 1)}
              className="mt-4 block w-full rounded-2xl border-2 border-dashed px-4 py-3 text-left text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
            >
              <span lang="fr">👀 {CHAPTERS[openUnit].cliffhanger}</span>
            </button>
          )}
        </div>
      )}
      <HomePrintSheet progress={progress} />
    </>
  );
}
