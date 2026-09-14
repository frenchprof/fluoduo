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
      {/* THE SENTENCE IS GONE (Dan, 2026-09-12: *"a single row above the map
          without any other texts (e.g. delete the « In FluOLinGo land, blah
          blah »)"*). « In FluOLinGo-land, there are 50 color-coded goals to
          conquer: » introduced a map that is now the page's whole subject, and
          it sat between the learner and the only row of controls.

          It is also the litmus test applied to the one line it was written
          for: remove it and nobody is stopped from finding an answer. The
          colour key it introduced still sits under the map, where Dan put it
          on 7 Sep, and says what it means without a preamble.

          The container went with it — `.fluo-map-legendbox` existed only to
          give that sentence a container query, and its CSS is removed in the
          same pass rather than left as a rule matching nothing. */}

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
            dress.

            🎯, NOT 🧑‍🎓 (Dan, 2026-09-14: "the 🎯 stop badge is currently being
            displayed as a person. can we take put the 🎯 back?"). The person
            was chosen here because the figure stands on that stop out on the
            map — true, and it made this badge the only one in the app wearing a
            different glyph from the one the top bar's stop badge wears, two
            controls showing the same number. 🎯 is the goal family's own icon
            and is what the bar uses; one number, one mark. */}
        {/* A WELL, LIKE THE ZOOM FIELD BESIDE IT (Dan, 2026-09-14: "can the 01
            be in a similar depressed space something or else learners wont
            know they can tap on it"). The number has always been editable —
            StopBookmark puts a real input under it — but it was set as plain
            mono text, so nothing on screen said so. A well is this app's word
            for a value you read AND type into; the zoom field two controls
            along is the same shape, which is exactly why it reads as one. */}
        {/* NO « /50 » HERE, AND THE WELL GIVES BACK ITS PADDING (Dan,
            2026-09-14: *"the numbered stop-indicatpr, why on earth did you add
            '/50' it pushed down my map"*). The total is not new — it has been
            in StopBookmark since PR 211 — but the WELL around it is, and the two
            together grew this row at the top of the map. Dan's own 1 Sep rule
            settles the denominator: a count earns its place when it describes
            what you cannot see, and the map is fifty stops on screen. */}
        <span className="neo-well fluo-mono flex items-center rounded-lg px-1 py-0.5 text-[13px] font-black leading-none text-[color:var(--cahier-ink)]">
          <span aria-hidden className="mr-0.5 text-[13px] leading-none">🎯</span>
          <StopBookmark
            stopNo={activeId ? SIOS.findIndex((s) => s.id === activeId) + 1 : SIOS.length}
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
            value={zoomDraft ?? zoomPct}
            aria-label="Zoom percent"
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
            /* 68px, not 52 (QC, 8 Sep) — written as 4.25rem since the 12 Sep
               size sweep, which is the same width and follows the learner's own
               text size instead of ignoring it. The pixel figures below are the
               MEASUREMENTS that settled it, so they stay as pixels.
               At 52px "100" measured 58px of content
               and the browser scrolled the leading digit out of sight: a desktop
               read « 00 » at 100% and « ?00 » at 200%. A phone was fine, which
               is why it survived — the mono face is set from a smaller step
               there. Three digits is the widest this field can ever hold
               (max=200). The 68 also left room for the datalist arrow; the list went
               on 14 Sep and the width stays, because the measurement above is
               about THREE DIGITS and those have not moved. */
            /* `!` ON ALL FOUR, AND THE NOTEBOOK IS WHY (12 Sep). The map moved
               onto Home, which is a `.cahier-page`, and that shell dresses every
               input it contains: `.cahier-page input` sets width 100%, padding
               .55rem/.75rem and font-size .95rem. Its specificity is (0,1,1)
               against a Tailwind utility's (0,1,0), so it wins — the field blew
               past 4.25rem and clipped its own leading digit, a desktop reading
               « 00 » at 100%. That is the same fault verify152 caught in 2026-08
               and the reason the old /map/embed refused `.cahier-page`; framed,
               it could simply opt out, and on Home there is nothing to opt out
               of. The numbers stay here rather than moving to a CSS override so
               the measurements above still explain the field they describe. */
            className="neo-well !w-[4.25rem] rounded-lg !px-1 !py-1 !text-[length:var(--fs-small)] text-center leading-none"
            style={{ background: "var(--cahier-paper-raised)", color: "var(--cahier-ink)" }}
          />
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
        {/* NO KEY AT 50/50, AND NOTHING TO REPLACE ONE WITH (Dan, 2026-09-12:
            *"we already removed the continue button so there is no need to
            replace it with anything"*).

            The 🎓 Diplômé key existed for exactly one reason, written down on
            7 Sep: at 50/50 `nextSioId` returns undefined, so Home's ▶ Continue
            — the app's loudest door — VANISHED on the day a learner finished
            the course, and the 🎓 was what stood in its place so the row did
            not develop a hole.

            Continue is gone now, from every state. There is no hole for the
            🎓 to fill, and a key that appears only at 50/50 to point at a page
            already reachable from ☰ → 🔄 Revise is a second door wearing a
            ceremony. `verify111-forever-french.py` retired with it — a check
            whose entire subject has been ruled away is not weakened, it is
            finished. The reasoning it recorded is preserved here and in
            STATUS so the next session does not rebuild the key by accident. */}
        </span>
      </div>

      {/* `data-map-well` IS FOR verify152, and it is here because the frame it
          used to measure against is gone. That check asks one question — do the
          stops span at least half the space the map is GIVEN, or has the map
          shrink-wrapped into a block adrift on the page — and until 12 Sep the
          space given was the iframe, so the viewport width answered it. On Home
          the map sits in the notebook's content well and the viewport is the
          whole window, which would have made the same map look like it filled
          a third of it. This names the box, so the check keeps measuring the
          thing it was written to measure. */}
      <div ref={mapRef} data-map-well className="relative scroll-mt-3" style={{ touchAction: "pan-y" }}>
        {/* ONE FRAME FOR BOTH VIEWS (Dan, 2026-09-12: *"When switching between
            the 2D and the 3D views, the frame itself (not the content) for both
            maps must be identical in shape and size. zoom in and out should
            also make the shared shape and size for those maps tied together"*).

            WHAT IT WAS, MEASURED. The two views were swapped in and out of this
            box, each at its own natural height, so the page changed length under
            the learner every time they pressed the switch — and `zoom` scales
            layout, so the gap grew with it:

                            2D           3D          apart
              1440 @ 100%   768x818      768x612      206px
              1440 @ 150%   768x1227     768x918      309px
               390 @ 100%   297x566      297x520       46px
               390 @ 150%   297x849      297x780       69px

            THE 2D GRID SETS THE HEIGHT, IN BOTH VIEWS. It is the taller of the
            two at every width measured, so sizing the box to it is the only
            choice that cuts nothing off either view. The two stack in one CSS
            grid cell; the grid's height is therefore the 2D grid's height
            whichever view is on top, and because this sits INSIDE the zoom
            wrapper the two stay tied at any zoom without a second calculation.

            WHY THE HIDDEN COPY IS THE CHEAP ONE. Only the SIZER has to be in the
            DOM, and that is the 2D grid — fifty discs — not the 3D scene, which
            is the expensive one and is mounted only when it is being looked at.
            `visibility: hidden` keeps the box and its height while taking the
            copy out of the tab order and off the screen; `aria-hidden` keeps a
            screen reader from meeting all fifty stops twice.

            THE SCENE KEEPS ITS OWN HEIGHT INSIDE THAT FRAME, and two failed
            attempts say why it must. `fill` was the obvious lever — it drops the
            component's 520/640px card height for `h-full` — and it is wrong
            here twice over:

              · in a grid cell, `h-full` of an auto row is indeterminate, and
                this scene's own SCROLL height is the road's length (HomeMap3D:
                scrollTop drives the camera). The two fed each other and it
                measured 142,800px tall at 1440, 456,960px at 390;
              · bounded by `absolute inset-0` the number resolves — and the
                scene then fits its box exactly, so there is nothing left to
                scroll. verify211 caught that immediately: the wheel and the
                finger both moved the road by 0px. The road not travelling is a
                worse bug than the one being fixed.

            Dan asked for the FRAME to be identical, not the content — so the
            frame is the 2D grid's box in both views and the scene draws at its
            own height inside it. The switch no longer changes the page's
            length, which is the whole of what he was looking at. */}
        <div data-tour="map" style={{ zoom: zoomPct / 100 }}>
          <div className="relative">
            <div
              style={mapView === "3d" ? { visibility: "hidden" } : undefined}
              aria-hidden={mapView === "3d"}
            >
              <Map2DGrid progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
            </div>
            {/* THE SCENE SITS IN THE MIDDLE OF THE FRAME (Dan, 2026-09-12,
                shown the three options side by side and picking the second:
                *"2 is fine with me"*).

                The frame is the 2D grid's box in both views, so the 3D scene —
                the shorter of the two — leaves paper over: 206px at 1440,
                46px at 390. Left at the top, that read as the map having
                fallen short. Split evenly it reads as a margin, which is what
                it is.

                A COLUMN FLEX, NOT `items-center`. On the row axis, centring
                shrink-wraps the child to its content and the scene collapsed
                to 2px wide — measured, first attempt. A column flex stretches
                the cross axis by default, so the scene keeps the frame's full
                width and only moves vertically, which is the one axis that
                has slack. */}
            {mapView === "3d" && (
              <div className="absolute inset-0 flex flex-col justify-center">
                <HomeMap3D progress={progress} activeId={activeId} accent={accent} onOpenSio={openSio} />
              </div>
            )}
          </div>
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
              // `/home`, NOT `/map` (12 Sep). Closing a `#SIO-nnn` deep link
              // clears the hash by rewriting the address, and this still named
              // the page the map used to be. `/map` forwards to `/home` now, so
              // the learner was left holding an address that bounces: reload and
              // you go to /map, which redirects you back here. The address bar
              // should say where you actually are.
              window.history.replaceState(null, "", "/home");
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
