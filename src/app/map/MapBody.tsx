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
  // THE GLASS IS GONE (Dan, 2026-08-31: "maybe we should remove the layer of
  // transparent glass over it"). It arrived on 22 Aug to stop a page-scroll
  // being captured by the map — but the map has lived on its own page since
  // 21 Aug, where there is little page below it to scroll to, and the extra
  // tap-to-wake was reading as part of the tap confusion on the 3D view.
  // touchAction pan-y on the box remains the scroll contract.

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
    try {
      if (window.localStorage.getItem(MAP_VIEW_KEY) === "3d") setMapView("3d");
    } catch {
      // storage blocked → 2D
    }
    // Deep link: ?unit=N and/or #SIO-0XX (the grammar Home used), and since
    // 1 Sep ?view=2d|3d — Home's prominent 2D/3D buttons (Dan's mock) are
    // only honest if each opens the map IN that view. The URL wins over the
    // saved choice and becomes it, so the next plain visit keeps the view.
    const readUrl = () => {
      const view = new URLSearchParams(window.location.search).get("view");
      if (view === "2d" || view === "3d") {
        setMapView(view);
        try { window.localStorage.setItem(MAP_VIEW_KEY, view); } catch { /* storage blocked */ }
      }
      const q = new URLSearchParams(window.location.search).get("unit");
      const hash = window.location.hash.replace("#", "");
      const sio = SIOS.find((s) => s.id === hash);
      const u = sio ? sio.unit : q !== null && /^[0-4]$/.test(q) ? Number(q) : null;
      if (u !== null) setOpenUnit(u);
      if (sio) setOpenSioId(sio.id);
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
      <div ref={mapRef} className="relative scroll-mt-3">
        <div data-tour="map">
          {mapView === "3d" ? (
            <HomeMap3D progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
          ) : (
            <HomeMap progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
          )}
        </div>
        {/* 2D · 3D — front and centre AT THE TOP OF THE MAP BOX (Dan,
            2026-08-31: "prominently displayed at the top in the middle of
            the map box"), floating over the scene, not a corner control. */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[5] flex justify-center">
          <div
            data-tour="map-view"
            role="group"
            aria-label="Map view"
            className="fluo-mono pointer-events-auto flex overflow-hidden rounded-xl border-2 text-sm font-black shadow-[2px_2px_0_rgba(0,0,0,0.22)]"
            style={{ borderColor: "var(--cahier-ink)" }}
          >
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
        </div>
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
