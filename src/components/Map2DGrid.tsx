"use client";

/**
 * The 2D map, COMPRESSED — ten rows of five, all fifty stops at a glance
 * (Dan, 2 Sep: "can we compress the 2D map more such that all 50 stops are
 * visible at a glance, which means we should have 10 rows of 5 stops. we
 * don't actually need to name each section, the color differences are
 * sufficient to distinguish").
 *
 * SECOND PASS, same day: "line spacings in the rows of goals can be
 * narrower: we want to see 10 rows without scrolling. and remember to put
 * back the route linking them." So the rows sit tight (44px nodes — the
 * touch floor — with 4px row gaps and slim band padding), and THE ROUTE IS
 * BACK: the stops snake boustrophedon (row one left-to-right, row two
 * right-to-left, …) so the numbers read like a path walked, and one measured
 * SVG polyline runs through every centre — solid in the learner's accent up
 * to the current stop, dotted beyond, the same travelled/ahead grammar the
 * winding map used. Measured from the real node positions after layout, not
 * assumed from the grid maths, so zoom and viewport changes redraw it.
 *
 * What carries over from the winding map, unchanged on purpose so the two
 * views stay one map: the stop node itself (kind-coloured border, dashed
 * when still ahead, filled when done or current, 🧑‍🎓 bobbing on the current
 * stop, 🚩 on the class flag) and the 🏁 arena door at the end. What stays
 * gone: the named region banners (each unit is a tinted band of two rows —
 * the colour IS the section) and the U0–U4 jump chips.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CLASS_FLAG_SIO } from "@/content/chapters";
import { sioKind, KIND_LABEL } from "@/content/sioKinds";
import { KIND_COLOR, KIND_WASH } from "@/components/HomeMap";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { isSioDone, type Progress } from "@/lib/progress";

/** Boustrophedon: within each global row of five, odd rows run right-to-left
 *  so the route never has to jump back across the band. */
function serpentine<T>(items: T[]): T[] {
  const out: T[] = [];
  for (let r = 0; r * 5 < items.length; r++) {
    const row = items.slice(r * 5, r * 5 + 5);
    out.push(...(r % 2 ? row.slice().reverse() : row));
  }
  return out;
}

/** How far a row-end hairpin swings out past the last stop, and the least it
 *  ever swings — a turn shorter than this reads as a kink, not a corner. */
const HAIRPIN_REACH = 0.62;
const HAIRPIN_MIN = 16;
/** The cord's own width.
 *
 *  This went 7 -> 4 on "the line linking the stops is way too thick", and then
 *  Dan corrected the diagnosis himself: *"I realised the thickness is not the
 *  real issue, it is the color and darkness, it should be greyish with almost
 *  the same thickness"*. A near-black cord at 7px reads as heavy; the SAME
 *  width in grey does not. So the width comes back and the ink goes. */
const ROAD_W = 6;
/** The road's grey. Dark enough to read on the paper and on every band wash,
 *  pale enough that fifty of them are a route rather than a cage. */
const ROAD_GREY = "color-mix(in oklab, var(--cahier-ink) 42%, var(--cahier-paper))";
/* FOLD_SPAN lived here — how far a crease ran across a button. It is gone with
   the crease-as-a-chord idea: the fold is a wash over the whole node now, so
   the only measurement it needs is the node's own radius. */

export default function Map2DGrid({
  progress,
  activeId,
  accent,
  onOpenSio,
}: {
  progress: Progress;
  activeId?: string | null;
  /** The learner's equipped accent — paints the travelled stretch of route. */
  accent?: string;
  onOpenSio?: (unit: number, id: string) => void;
}) {
  const activeIdx = activeId ? SIOS.findIndex((s) => s.id === activeId) : -1;
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [route, setRoute] = useState<{
    travelled: string;
    ahead: string;
    /** One fold per stop: its centre, the button's radius, and its index. */
    creases: { x: number; y: number; r: number; i: number }[];
  }>({ travelled: "", ahead: "", creases: [] });

  // The route, measured. Node centres are read from the laid-out DOM (in
  // course order, via data-stop) because the grid's geometry depends on the
  // viewport and the zoom — drawing from assumed cell sizes is how a road
  // ends up beside its stops.
  const draw = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const b = box.getBoundingClientRect();

    /* THE ROAD IS MEASURED IN ONE SPACE AND DRAWN IN ANOTHER, and that is the
       whole of this bug (Dan, 2026-09-07, shown the postcard on Home: *"The
       pinching issue is not solved right?"* — it was not).
       `getBoundingClientRect` answers in POST-zoom CSS pixels; an SVG inside
       the zoomed subtree consumes its `points` as PRE-zoom user units and is
       then scaled with everything else. So under a CSS `zoom` the road paints
       at `zoom x` the stop positions — compressed toward the top-left corner,
       which is exactly what "detached from the stops" looks like.
       Measured on the built export, Home's postcard at zoom 0.44:
           stop 5 centre  x = 247      polyline point 4  x = 247
           where that point ACTUALLY paints  x = 109   (247 x 0.44)
       TWO SURFACES CARRY A CSS ZOOM, so this was never only Home's: MapBody
       wraps this grid in `zoom: zoomPct/100` for its own - / + control, and
       `usePinchZoom` drives that same number. The 7 Sep fix below listened to
       `visualViewport` — the BROWSER's pinch — and that was the wrong pinch:
       the app's own pinch changes CSS zoom, which resizes the box, fires the
       ResizeObserver, and redraws just as wrongly as before. Dividing here
       fixes all three at once, and any future zoomed embedding with them.
       `currentCSSZoom` is the browser's own answer (Chrome 128+); the width
       ratio is the same number for anything older. */
    const zoomed = box as HTMLElement & { currentCSSZoom?: number };
    const k = zoomed.currentCSSZoom
      ?? (box.offsetWidth > 0 ? b.width / box.offsetWidth : 1);
    const scale = Number.isFinite(k) && k > 0 ? k : 1;

    const pts: { x: number; y: number; r: number }[] = [];
    for (const s of SIOS) {
      const el = box.querySelector(`[data-stop="${s.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      pts.push({
        x: (r.left + r.width / 2 - b.left) / scale,
        y: (r.top + r.height / 2 - b.top) / scale,
        // The node's own radius, so the crease is sized to the button rather
        // than to a constant that goes wrong the moment the grid resizes.
        r: r.width / 2 / scale,
      });
    }
    /* A PATH, NOT A POLYLINE, so the row ends can TURN (Dan, 2026-09-07, with
       a drawing: *"that line should also show at the end of each row between
       rows"*). The stops snake five to a row, so the 5th and the 6th sit in the
       same column and a polyline joined them with a bare vertical stub, mostly
       hidden behind the band edge and the two stops. A road that reaches the
       end of a row and turns is what Dan drew — a hairpin swinging out past the
       last stop and back down into the next row, the way a real route doubles
       back. Which side it swings to follows the stop: the serpentine ends right
       on even rows and left on odd ones, so the sign comes from the point's own
       x against the middle rather than from a parity anyone has to keep in step
       with `serpentine()`. */
    const mid = pts.reduce((a, q) => a + q.x, 0) / pts.length;
    const path = (from: number, to: number) => {
      if (to <= from) return "";
      let d = `M ${Math.round(pts[from].x)} ${Math.round(pts[from].y)}`;
      for (let i = from; i < to; i++) {
        const a = pts[i], q = pts[i + 1];
        // The 5th stop of a row is the last one; the 6th opens the next.
        if ((i + 1) % 5 !== 0) { d += ` L ${Math.round(q.x)} ${Math.round(q.y)}`; continue; }
        const out = a.x >= mid ? 1 : -1;
        const reach = Math.max(HAIRPIN_MIN, Math.abs(q.y - a.y) * HAIRPIN_REACH);
        d += ` C ${Math.round(a.x + out * reach)} ${Math.round(a.y)},`
          + ` ${Math.round(q.x + out * reach)} ${Math.round(q.y)},`
          + ` ${Math.round(q.x)} ${Math.round(q.y)}`;
      }
      return d;
    };
    const last = pts.length - 1;
    const t = activeIdx >= 0 ? activeIdx : last;
    setRoute({
      travelled: path(0, t),
      ahead: path(t, last),
      /* THE FOLD IS IN THE BUTTON, NOT IN THE ROAD (Dan, 2026-09-08: *"it was
         supposed to look like the button was folded very lightly along the line
         below … can you try to render a slight folding line along where the
         line below passes?"*, then *"make it look 3D"*).

         Two wrong readings before this one, both mine. First a disc at each
         stop's CENTRE — invisible, because the road runs under a 44px node.
         Then a disc MIDWAY between stops — visible, but a knot on the road,
         when what he drew was a crease across the BUTTON where the road passes
         behind it. The road is not meant to change shape at all.

         So each stop carries a chord at its own centre line: the button bent
         gently along the road. Drawn ABOVE the nodes, since a crease under one
         is the same nothing as the first attempt. */
      creases: pts.map((q, i) => ({
        x: Math.round(q.x),
        y: Math.round(q.y),
        // The button's own radius, so the fold is the button's shape exactly.
        r: Math.round(q.r),
        i,
      })),
    });
  }, [activeIdx]);

  useEffect(() => {
    // The route's points ARE external state — DOM geometry, which cannot be
    // read during render and only exists after layout. The first draw has to
    // run in the effect body or the road appears one resize late; the
    // observers below are the subscription the rule asks for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    draw();

    /* WHEN TO RE-MEASURE (Dan, 2026-09-07: *"WHEN DRAGGING THE MAP THE LINE
       JOINING UP THE STOPS GET DETACHED FROM THE STOPS"*, then *"NOT A SCROLLER
       BUT PINCH GESTURE"*, and on 7 Sep again: *"the pinching issue is not
       resolved: the stops get detached from the route"*).

       A CORRECTION FOR THE NEXT READER. This block was first written on the
       theory that the detachment was a MISSED REDRAW: that a pinch changes the
       visual viewport without changing layout, so the ResizeObserver never
       fires and the polyline keeps pre-pinch coordinates. That is true of a
       NATIVE two-finger pinch on the page — but it is not what was happening
       here, and the listeners it added did not fix anything, which is why Dan
       reported the same fault twice.

       The map's pinch does not zoom the browser. It drives `zoomPct`, which
       becomes CSS `zoom` on an ancestor, which DOES change layout — so the
       observer fires and the road is redrawn every time. The road was redrawn
       wrong: see the scale correction in `draw()` above, which is the actual
       fix. Proof it was never the trigger: the road detaches identically when
       you type 150 into the zoom field and never touch the screen.

       The visualViewport listeners stay because they are still right for the
       case they were written for — a learner pinching the PAGE itself, on a
       phone, which really does move the stops without a resize. rAF-throttled:
       those events fire continuously and each draw reads fifty rects. */
    let raf = 0;
    const redraw = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; draw(); });
    };
    const ro = new ResizeObserver(draw);
    if (boxRef.current) ro.observe(boxRef.current);
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", redraw);
    vv?.addEventListener("scroll", redraw);
    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", redraw);
      vv?.removeEventListener("scroll", redraw);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [draw]);

  return (
    <div ref={boxRef} className="relative">
      {/* `overflow-visible`: the row-end hairpins swing out PAST the last stop
          of a row, and the outermost stops sit close to this box's edge, so the
          default SVG clip would cut the turns in half — the one thing Dan asked
          to be able to see. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
        {/* THE ROAD HAS A BODY (6 Sep). Between fifty raised stops a 4px flat
            stroke read as paint on the band rather than something laid on it.
            Travelled is now a CORD: a dark under-edge one pixel low, the accent
            over it, and a hairline highlight one pixel high — three strokes, no
            filter, so it costs nothing to paint fifty times a second while the
            ResizeObserver redraws. Ahead is a GROOVE cut into the band: the
            dark dashes sit a pixel high with a white catch-light under them,
            which is the same light-from-above the stops use. */}
        {/* ONE SOLID ROAD, IN GREY (Dan, 2026-09-07 with a drawing: *"we don't
            want to see dotted lines, but solid darker thicker line"*; then, on
            8 Sep, correcting his own diagnosis: *"I realised the thickness is
            not the real issue, it is the color and darkness, it should be
            greyish with almost the same thickness"*).

            WHY IT LOOKED DOTTED EVERYWHERE, which is the part worth recording:
            the dashes were never a style choice about the road, they were the
            AHEAD half of a travelled/ahead grammar — and a learner standing on
            stop 1 has forty-nine stops ahead, so the whole map was dashes. The
            distinction survives in COLOUR: the stretch you have walked takes
            your accent, the stretch to come takes the grey.

            THE BULGE IS NOT HERE. Two versions put it on the road — a disc at
            each stop's centre (invisible under a 44px node) and then one midway
            between stops (visible, but a knot on the cord). Dan meant a crease
            in the BUTTON, and it is drawn over the nodes further down. */}
        {route.ahead && (
          <>
            {/* The under-edge, one pixel low: the road has a body, not a
                painted stripe. Same three-stroke cord the travelled half has
                used since 6 Sep, in ink instead of the accent. */}
            <path d={route.ahead} fill="none" strokeWidth={ROAD_W + 2}
              stroke="color-mix(in oklab, var(--cahier-ink) 16%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1.5)" />
            {/* NO CATCH-LIGHT ON THIS HALF. The travelled cord earns one — it
                is the accent, a raised thing you have laid down behind you. On
                the ink road a white hairline down the middle read as a SEAM,
                and forty-nine of the fifty stops are ahead, so that seam was
                the map. Dan drew one solid dark line; this is one solid dark
                line, with only the under-edge that keeps it off the paper. */}
            <path d={route.ahead} fill="none" strokeWidth={ROAD_W}
              stroke={ROAD_GREY} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {route.travelled && (
          <>
            <path d={route.travelled} fill="none" strokeWidth={ROAD_W + 2}
              stroke="color-mix(in oklab, var(--cahier-ink) 35%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1.5)" />
            <path d={route.travelled} fill="none" strokeWidth={ROAD_W}
              stroke={accent ?? "var(--cahier-ink)"} strokeLinejoin="round" strokeLinecap="round" />
            <path d={route.travelled} fill="none" strokeWidth="1.5"
              stroke="color-mix(in oklab, white 55%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 -1.5)" />
          </>
        )}
      </svg>
      <div className="space-y-1">
        {[0, 1, 2, 3, 4].map((unit) => (
          <div
            key={unit}
            id={`unit-band-${unit}`}
            role="group"
            aria-label={UNIT_META[unit]?.label}
            className="fluo-band grid grid-cols-5 justify-items-center gap-y-1 rounded-xl px-1.5 py-1 sm:gap-y-2 sm:px-3 sm:py-2 lg:gap-y-3 lg:px-4 lg:py-3"
            style={{ background: `color-mix(in oklab, ${UNIT_ACCENTS[unit]} 14%, var(--cahier-paper-raised))` }}
          >
            {serpentine(SIOS.filter((s) => s.unit === unit)).map((s) => {
              const i = SIOS.indexOf(s);
              const done = isSioDone(s.id, progress);
              const active = s.id === activeId;
              const kind = sioKind(s.id);
              const colour = KIND_COLOR[kind];
              const flag = s.id === CLASS_FLAG_SIO;
              // `ahead` (i > activeIdx) went with `sunk` on 2026-09-07: once
              // depth and colour both followed COMPLETION rather than position,
              // nothing asked where the stop sat relative to the current one.
              // One name for "not reached yet", used by the fill, the numeral
              // and the depth so the three cannot disagree.
              //
              // `!done` MATTERS. A learner can finish a stop beyond their
              // current one — the map has never locked anything (Dan, 1 Jul:
              // "nothing dims, nothing locks"). Without it, a stop you have
              // completed but walked past would render in the pale wash, i.e.
              // as "not yet", and your own finished work would disappear.
              // DEPTH FOLLOWS COMPLETION, not position (Dan, 7 Sep: "all
              // buttons are up by default, and as they are completed they get
              // pressed down"), and so does the COLOUR: `done` takes the wash,
              // everything else the pen.
              //
              // `const sunk = ahead && !active && !done` stood here until
              // 2026-09-07 with a comment saying it "still drives the COLOUR".
              // It did not — the colour had already moved to `done` — so the
              // variable was dead and the note beside it described a rule the
              // file no longer followed. Lint found the variable; the comment
              // is the part worth removing.
              return (
                <button
                  key={s.id}
                  data-stop={s.id}
                  type="button"
                  onClick={() => onOpenSio?.(s.unit, s.id)}
                  title={`${s.id} · ${s.topic} (${KIND_LABEL[kind]})`}
                  aria-label={`${s.id} · ${s.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                  aria-current={active ? "step" : undefined}
                  // RAISED when reached, SUNK when still ahead (6 Sep). The
                  // dashed border is gone: a broken outline read as a hole, and
                  // forty of the fifty stops wore it. The kind colour moves from
                  // a `border` to an inset ring inside .fluo-stop, which costs
                  // no layout — 44px stays 44px, the touch floor holds.
                  className={`fluo-stop ${done ? "fluo-stop--down" : "fluo-stop--up fluo-stop-num"} relative z-[2] flex h-11 w-11 items-center justify-center rounded-full text-sm font-black sm:h-12 sm:w-12 sm:text-base lg:h-14 lg:w-14 lg:text-lg ${active ? "fluo-node-active" : ""}`}
                  // TWO SHADES OF ONE PEN (Dan, 6 Sep, choosing option B of
                  // three shown at 44px). Reached stops are filled with the
                  // pen at full strength; stops still ahead take its wash. The
                  // numeral is PAGE INK on both — never white (1.34–3.01 on
                  // these pens) and never the pen's own ink (1.95–4.25). The
                  // ring is the pen either way, so the hue runs edge to edge.
                  // COLOUR FOLLOWS COMPLETION TOO (Dan, 7 Sep: "when
                  // unvisited it is up and DARKER (not lighter) and completed
                  // it FADES and lighter depressed"). It used to follow
                  // POSITION — the stretch you had walked wore the pen — which
                  // left a finished stop as loud as an untouched one and gave
                  // the depth nothing to agree with. A button that has been
                  // pressed is worn: faded and sunk. One that has not is fresh:
                  // full colour, standing up. Both halves now say the same
                  // thing, which is what makes it read as an object.
                  style={{
                    ["--fluo-stop-kind" as string]: colour,
                    background: done ? KIND_WASH[kind] : colour,
                    color: done ? "var(--cahier-ink)" : undefined,
                  }}
                >
                  {/* THE NUMBER STAYS, ALWAYS (Dan, 6 Sep: "i do still want the
                      number to remain on the buttons"). It used to be replaced
                      by a ✓ the moment a stop was done, so a learner looking for
                      "stop 12" lost it the moment they finished it — and half a
                      full map became unnumbered.

                      AND THERE IS NO ✓ AT ALL NOW (Dan, same day, seeing the
                      fluorescent fills: "Drop it — the fill says it"). The tick
                      briefly lived as a white disc on the shoulder, which was
                      drawn for a pale body; against a full-strength pen fifty
                      of them read as debris. A reached stop is the pen and
                      everything ahead is its wash, so done-ness is already the
                      loudest thing on the grid. */}
                  {i + 1}
                  {/* THE LEARNER RIDES THE STOP, not the air above it (6 Sep).
                      At -top-5 the marker sat 20px clear of a 44px node, which
                      on the compressed grid put it inside the BAND ABOVE — on
                      a phone it landed on top of another stop. It now sits on
                      the node's shoulder like the class flag opposite, raised
                      off it by its own shadow. */}
                  {active && (
                    <span
                      aria-hidden
                      className="home-map-bob absolute -left-1.5 -top-2 text-base leading-none"
                      style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.35))" }}
                    >
                      🧑‍🎓
                    </span>
                  )}
                  {flag && (
                    <span
                      aria-label="The class is here this week"
                      title="The class is here this week"
                      className="absolute -right-2 -top-2 text-base leading-none"
                    >
                      🚩
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        {/* The arena keeps its door after the last band — the one node that is
            a place, not a stop. */}
        <div className="flex justify-center pt-0.5">
          <Link
            href="/practice/grammarathon/finale"
            title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
            aria-label="GramMarathon Final"
            // The door stands PROUDEST of anything on the map — it is the one
            // node that is a place, and it is what the whole road leads to.
            className="fluo-stop fluo-stop--up z-[2] flex h-11 w-11 items-center justify-center rounded-full text-lg sm:h-12 sm:w-12 lg:h-14 lg:w-14"
            style={{
              ["--fluo-stop-kind" as string]: "var(--cahier-ink)",
              background: "var(--cahier-paper-raised)",
            }}
          >
            🏁
          </Link>
        </div>
      </div>

      {/* THE FOLD, DRAWN OVER THE BUTTONS (Dan, 2026-09-08: *"it was supposed
          to look like the button was folded very lightly along the line below
          … can you try to render a slight folding line along where the line
          below passes?"*, then *"make it look 3D"*).

          A SECOND LAYER, and it has to be: the road sits at z-[1], under the
          nodes, which is why both earlier attempts at a bulge were invisible or
          in the wrong place. A crease belongs ON the button, so it is painted
          after them at z-[3], pointer-events off so nothing is caught.

          WHAT MAKES IT READ AS A BEND rather than a drawn line: two chords, not
          one. A white hairline a pixel ABOVE the centre is the face turned up
          into the light; a soft shadow a pixel BELOW is the face turned away.
          That is the same light-from-above the stops are already lit by
          (`.fluo-stop`), so the button folds within its own lighting rather
          than against it. The chord stops short of the rim (FOLD_SPAN), because
          a crease that reaches the edge cuts the button in two instead of
          bending it. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-visible">
        <defs>
          {/* THE FOLD IS SHADING, NOT A LINE. Drawn first as a single bright
              chord across each button, it read as a STRIKE-THROUGH: a white
              rule straight through the number, cutting the button in two
              instead of bending it. A fold is not a line you draw, it is two
              faces meeting — so this is a vertical wash: the upper face turned
              up into the light, a thin catch on the crease itself, the lower
              face falling away. The digits sit under a gradient rather than
              under a rule, so nothing is struck out. */}
          <linearGradient id="fluo-fold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgb(255,255,255)" stopOpacity="0.13" />
            <stop offset="47%"  stopColor="rgb(255,255,255)" stopOpacity="0.03" />
            <stop offset="50%"  stopColor="rgb(255,255,255)" stopOpacity="0.28" />
            <stop offset="53%"  stopColor="rgb(0,0,0)"       stopOpacity="0.09" />
            <stop offset="100%" stopColor="rgb(0,0,0)"       stopOpacity="0.14" />
          </linearGradient>
        </defs>
        {/* A circle, not a clipped rect: the stops ARE circles (`rounded-full
            h-11 w-11`), so the node's own measured radius is the fold's shape
            and no clip path is needed — fifty of them would cost more than the
            fold is worth. */}
        {route.creases.map((c) => (
          <circle key={c.i} cx={c.x} cy={c.y} r={c.r} fill="url(#fluo-fold)" />
        ))}
      </svg>
    </div>
  );
}
