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
/** The cord's own width, and the disc that swells it at each stop. */
const ROAD_W = 7;
const BEAD_R = 7;

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
  const [route, setRoute] = useState<{ travelled: string; ahead: string; beads: { x: number; y: number }[] }>(
    { travelled: "", ahead: "", beads: [] },
  );

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

    const pts: { x: number; y: number }[] = [];
    for (const s of SIOS) {
      const el = box.querySelector(`[data-stop="${s.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      pts.push({
        x: (r.left + r.width / 2 - b.left) / scale,
        y: (r.top + r.height / 2 - b.top) / scale,
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
      // A bead where the road meets each stop. See the render for what it does.
      beads: pts.map((q) => ({ x: Math.round(q.x), y: Math.round(q.y) })),
    });
  }, [activeIdx]);

  useEffect(() => {
    // The route's points ARE external state — DOM geometry, which cannot be
    // read during render and only exists after layout. The first draw has to
    // run in the effect body or the road appears one resize late; the
    // observers below are the subscription the rule asks for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    draw();

    /* A PINCH IS NOT A RESIZE, and that is the whole of this (Dan, 2026-09-07:
       *"WHEN DRAGGING THE MAP THE LINE JOINING UP THE STOPS GET DETACHED FROM
       THE STOPS"*, then *"NOT A SCROLLER BUT PINCH GESTURE"*).

       The road is MEASURED — node centres read from the laid-out DOM — and the
       only thing that re-measured it was a ResizeObserver on this box. A pinch
       changes the VISUAL viewport, not the layout: the box's width and height
       in CSS pixels do not move a hair, so the observer never fires and the
       polyline keeps the coordinates it was given before the pinch while the
       stops are painted at the new scale. The road stays where the stops used
       to be, which is exactly what "detached" looks like.

       `visualViewport` is the event nobody thinks of because it is the only one
       a pinch raises. Both of its events matter: `resize` is the zoom itself
       and `scroll` is panning around while zoomed in.

       rAF-throttled, because a pinch fires these continuously and each draw
       reads fifty rects. */
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
        {/* ONE SOLID ROAD, DARK AND THICK (Dan, 2026-09-07, with a drawing:
            *"we don't want to see dotted lines, but solid darker thicker line
            that even seems to almost 'bulge' the stop along the line where it
            passes"*).

            WHY IT LOOKED DOTTED EVERYWHERE, which is the part worth recording:
            the dashes were never a style choice about the road, they were the
            AHEAD half of a travelled/ahead grammar — and a learner standing on
            stop 1 has forty-nine stops ahead, so the whole map was dashes. The
            distinction survives, in colour rather than in dots: the stretch you
            have walked takes your accent, the stretch to come takes the ink.
            Both are the same solid cord, so the map reads as one road either
            way, which is what it is.

            THE BEAD IS THE BULGE. The road passes UNDER the stops (z-[1] on
            this svg, the nodes above it), so on its own it simply disappears
            behind each one and reappears. A disc at every centre, a shade wider
            than the cord, swells the line exactly where a stop sits on it — the
            stop looks threaded onto the road rather than laid beside it. It is
            drawn first so the cord runs over its own bead and the two read as
            one shape. */}
        {route.beads.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r={BEAD_R}
            fill={i <= (activeIdx >= 0 ? activeIdx : route.beads.length - 1)
              ? (accent ?? "var(--cahier-ink)")
              : "var(--cahier-ink)"} />
        ))}
        {route.ahead && (
          <>
            {/* The under-edge, one pixel low: the road has a body, not a
                painted stripe. Same three-stroke cord the travelled half has
                used since 6 Sep, in ink instead of the accent. */}
            <path d={route.ahead} fill="none" strokeWidth={ROAD_W + 2}
              stroke="color-mix(in oklab, var(--cahier-ink) 35%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1.5)" />
            {/* NO CATCH-LIGHT ON THIS HALF. The travelled cord earns one — it
                is the accent, a raised thing you have laid down behind you. On
                the ink road a white hairline down the middle read as a SEAM,
                and forty-nine of the fifty stops are ahead, so that seam was
                the map. Dan drew one solid dark line; this is one solid dark
                line, with only the under-edge that keeps it off the paper. */}
            <path d={route.ahead} fill="none" strokeWidth={ROAD_W}
              stroke="var(--cahier-ink)" strokeLinejoin="round" strokeLinecap="round" />
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
            className="fluo-band grid grid-cols-5 justify-items-center gap-y-1 rounded-xl px-1.5 py-1"
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
                  className={`fluo-stop ${done ? "fluo-stop--down" : "fluo-stop--up fluo-stop-num"} relative z-[2] flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${active ? "fluo-node-active" : ""}`}
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
            className="fluo-stop fluo-stop--up z-[2] flex h-11 w-11 items-center justify-center rounded-full text-lg"
            style={{
              ["--fluo-stop-kind" as string]: "var(--cahier-ink)",
              background: "var(--cahier-paper-raised)",
            }}
          >
            🏁
          </Link>
        </div>
      </div>
    </div>
  );
}
