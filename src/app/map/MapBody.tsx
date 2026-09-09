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
import PillSwitch from "@/components/PillSwitch";
import Map2DGrid from "@/components/Map2DGrid";
import HomeMap3D from "@/components/HomeMap3D";
import HomePrintSheet from "@/components/HomePrintSheet";
import { KindLegend } from "@/components/HomeMap";
import StopPopup from "../StopPopup";
import { usePinchZoom } from "@/lib/usePinchZoom";
import { useRouter } from "next/navigation";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId, loadBookmark, BOOKMARK_EVENT } from "@/lib/continuer";
import StopBookmark from "@/components/StopBookmark";
import { equippedAccent } from "@/lib/economy";
// The key and its read/write live in lib/mapView.ts, shared with Home's
// switch — the surfaces that set this view must not spell it three ways.
import { loadMapView, saveMapView, type MapView } from "@/lib/mapView";

export default function MapBody() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  // 3D BEFORE THE STORE IS READ, not only after it. The site is a static
  // export, so this initial value is what the prerendered HTML paints for
  // EVERYONE; the saved choice only arrives in the mount effect below. Left at
  // "2d" the default would be 3D in name while still showing every learner the
  // flat grid first and then flipping — the flash landing on exactly the
  // majority Dan just moved to 3D. Seeded here it goes the other way: no
  // flip for an unsaved learner, one only for someone who chose 2D.
  const [mapView, setMapView] = useState<MapView>("3d");
  const router = useRouter();
  const [openSioId, setOpenSioId] = useState<string | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  // The learner's bookmarked stop (Dan, 2 Sep) — null = compute as before.
  const [bookmark, setBookmark] = useState<number | null>(null);
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
    const readBookmark = () => setBookmark(loadBookmark());
    readBookmark();
    window.addEventListener(BOOKMARK_EVENT, readBookmark);
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
      window.removeEventListener(BOOKMARK_EVENT, readBookmark);
      window.removeEventListener("hashchange", readUrl);
      window.removeEventListener("popstate", readUrl);
    };
  }, []);

  // A stop is a DOOR to the goal's own page now, not a popup trigger (Dan,
  // 7 Sep: "WE ARE STILL SEEING THE POPUPS FROM CLICKING THE MAP, WHERE ARE
  // THE FULL PAGED SIOS"). The page it opens is the middle level of his own
  // MAP > SIO > MneMemo chain — /sio/[id], the one-goal-per-screen magnet
  // scroller built to his 5 Sep spec — which existed and was never wired in
  // here. StopPopup stays for the #SIO-nnn deep links below until every QR
  // and bookmark in the wild has aged out.
  const openSio = (_unit: number, id: string) => {
    router.push(`/sio/${id}`);
  };

  const setZoom = (v: number) => setZoomPct(Math.min(200, Math.max(30, Math.round(v))));
  // WHAT IS IN THE FIELD WHILE YOU TYPE (Dan, 7 Sep: "the field is supposed to
  // allow me to key in precise values?"). It was bound straight to the CLAMPED
  // number, so every KEYSTROKE was clamped and written back under the caret:
  // typing 135 goes 1 -> clamped to 30 -> the box now reads "30" -> the next
  // key makes "303" -> clamped to 200. Driven and measured: typing "135" left
  // 200 in the field. Only round numbers already in range could ever be typed.
  const [zoomDraft, setZoomDraft] = useState<string | null>(null);
  // PINCH TO ZOOM, BOTH VIEWS (Dan, 7 Sep, choosing "Both views" and thereby
  // retiring his own 20 Aug ruling that the 3D view must not zoom).
  //
  // It drives the SAME `zoomPct` the field and the steppers drive — the zoom
  // wrapper below contains both the 3D scene and the 2D grid, so there is one
  // number and the field visibly tracks your fingers. A second, separate
  // pinch scale for 3D would be two scales fighting over one scene.
  //
  // `touch-action: pan-y` on the wrapper is what makes the gesture OURS: it
  // leaves one-finger scrolling to the browser and takes two-finger pinch off
  // it, so the page does not zoom underneath the map. The move listener has to
  // be non-passive to call preventDefault, which is why this is an effect and
  // not an onTouchMove prop — React attaches those passively.
  // The pinch lives in usePinchZoom now (7 Sep) — the swipe-rail law says a
  // file that navigates may not also read fingers, and the stops below
  // became doors to /sio/[id]. Same gesture, new owner; the long comment
  // above still describes it.
  usePinchZoom(mapRef, zoomPct, setZoom);

  const commitZoom = (text: string) => {
    const n = parseFloat(text);
    setZoom(Number.isFinite(n) ? n : 100);
    setZoomDraft(null);
  };
  const setView = (v: MapView) => {
    setMapView(v);
    saveMapView(v);
  };

  // The bookmark outranks the computation (Dan, 2 Sep) — from state, so the
  // first client render agrees with the prerender.
  const activeId = nextSioId(progress, bookmark);
  const accent = equippedAccent(progress);
  const openSioObj = openSioId ? SIOS.find((s) => s.id === openSioId) : undefined;

  return (
    <>
      {/* The sentence that carries the legend — Dan's wording, 2 Sep, set in
          the brand's own hand (his follow-up: "It is the wrong font to use
          for English text. Please use the FluOLinGo or Patrick Hand font …
          so that it occupies one line maximum"). One line is enforced, not
          hoped for: nowrap plus a viewport clamp that shrinks the hand face
          before it ever wraps.

          THE CLAMP WAS TUNED FOR A FULL-WIDTH PAGE, and this line has run
          inside an iframe since 7 Sep — where `vw` is the FRAME's width, not
          the phone's. On a 320px phone the notebook leaves the frame 247px and
          this line measured 252px of content in 201px: the frame scrolled
          sideways and the sentence ran off the paper (QC, 8 Sep). 4.3vw → 4.05
          and the floor 13px → 10px, which is what it takes to keep Dan's one
          line at that width. A 390px phone loses about half a pixel of face. */}
      <p className="fluo-band-hand whitespace-nowrap text-[clamp(10px,4.05vw,19px)] leading-tight text-[color:var(--cahier-ink)]">
        In FluOLinGo-land, there are 50 color-coded goals to conquer:
      </p>

      {/* ONE control row, fixed for both views: switch left, zoom right.
          IT WRAPS ON A NARROW DESK (QC, 8 Sep). Inside the notebook a 320px
          phone leaves the frame 247px, and the switch, the bookmark and the
          zoom measured 308px on one line — so the frame scrolled sideways and
          the % sign sat off the paper. Nothing here shrinks well (the switch is
          a fixed pill, the well has to hold three digits), so the row is
          allowed to become two lines instead, right-aligned under the switch.
          Above that width it is one line exactly as before. */}
      <div className="mb-2 mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        {/* THE SAME SWITCH AS HOME'S, which is where it should have been all
            along (Dan, 2026-09-02: "Map of FluOLinGo page is missing the 2D-3D
            switch that is a copy of the one on the homepage"). PillSwitch's own
            docstring records that Dan drew it ON 1 SEP FOR THIS CONTROL — "can
            the 2D 3D switch look more like this" — and it then shipped on Home
            and on the deck page while the map it was designed for kept the
            plain segmented pair. This is the component going where it was
            meant to go.

            THE WRAPPER IS NOT DECORATION. `data-tour="map-view"` is the first
            tour's target for this step (FirstTour STEPS, and verify44 pins the
            attribute), and PillSwitch renders its own button with no prop for
            passing one through — so the hook lives on a wrapper and the tour
            still finds it. */}
        <div data-tour="map-view">
          <PillSwitch
            label="Map view"
            title="Tap to switch between the plan and the scene"
            offLabel="2D"
            onLabel="3D"
            on={mapView === "3d"}
            onFlip={(next) => setView(next ? "3d" : "2d")}
          />
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-2">
        {/* THE BOOKMARK, left of the zoom (Dan, 2 Sep: "could that editable
            indicator be placed to the left of zoom control") — the same
            editable stop number Home's well carries, in this row's mono
            dress. 🧑‍🎓 names it: it is the stop that figure stands on. */}
        <span className="fluo-mono flex items-center text-[13px] font-black text-[color:var(--cahier-ink)]">
          <span aria-hidden className="mr-0.5 text-[15px] leading-none">🧑‍🎓</span>
          <StopBookmark
            stopNo={activeId ? SIOS.findIndex((s) => s.id === activeId) + 1 : SIOS.length}
            totalClassName="font-bold text-[color:var(--cahier-ink-faint)]"
          />
        </span>
        {/* Zoom, migrated up from under the map (Dan, 2 Sep: "right-aligned
            Zoom control field migrated from below"). */}
        <span className="fluo-mono flex shrink-0 items-center gap-1 text-[12px] font-bold text-[color:var(--cahier-ink-faint)]" aria-label="Zoom">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom(zoomPct - 10)}
            className="neo-key fluo-spring rounded-lg px-2 py-1 leading-none"
            style={{ background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
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
            value={zoomDraft ?? zoomPct}
            aria-label="Zoom percent — type a value or pick a milestone"
            onChange={(e) => {
              const text = e.target.value;
              setZoomDraft(text);
              const n = parseFloat(text);
              if (Number.isFinite(n) && n >= 30 && n <= 200) setZoom(n);
            }}
            onBlur={(e) => commitZoom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitZoom((e.target as HTMLInputElement).value); }}
            // A WELL: the app's word for a value you read and type into,
            // rather than a key you press (Dan, 7 Sep: "the zoom counter is
            // not showing any 3D depression like the 2D control is showing").
            /* w-[62px], not 52 (QC, 8 Sep). At 52px "100" measured 58px of content
               and the browser scrolled the leading digit out of sight: a desktop
               read « 00 » at 100% and « ?00 » at 200%. A phone was fine, which
               is why it survived — the mono face is set from a smaller step
               there. Three digits is the widest this field can ever hold
               (max=200), and 68 leaves room for the datalist arrow beside them. */
            className="neo-well w-[68px] rounded-lg px-1 py-1 text-center leading-none"
            style={{ background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
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
            className="neo-key fluo-spring rounded-lg px-2 py-1 leading-none"
            style={{ background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
          >
            +
          </button>
          <span aria-hidden>%</span>
        </span>
        </span>
      </div>

      <div ref={mapRef} className="relative scroll-mt-3" style={{ touchAction: "pan-y" }}>
        <div data-tour="map" style={{ zoom: zoomPct / 100 }}>
          {mapView === "3d" ? (
            <HomeMap3D progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
          ) : (
            <Map2DGrid progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
          )}
        </div>
      </div>

      {/* THE LEGEND SITS UNDER THE MAP (Dan, 2026-09-07: "ON THE MAP. PUT THE
          COLOR LEGEND AT THE BOTTOM OF THE MAP"). It was between the sentence
          and the controls, which put a key to the colours ABOVE the colours it
          keys — you read it before you had anything to read it against, and it
          pushed the map itself further down a phone screen. Underneath, it is
          what it actually is: the thing you glance at when a stop's colour
          asks a question. The sentence stays on top, because that one
          introduces the map rather than explaining it. */}
      <div className="mt-2.5">
        <KindLegend />
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
