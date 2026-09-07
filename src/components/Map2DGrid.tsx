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
  const [route, setRoute] = useState<{ travelled: string; ahead: string }>({ travelled: "", ahead: "" });

  // The route, measured. Node centres are read from the laid-out DOM (in
  // course order, via data-stop) because the grid's geometry depends on the
  // viewport and the zoom — drawing from assumed cell sizes is how a road
  // ends up beside its stops.
  const draw = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const b = box.getBoundingClientRect();
    const pts: { x: number; y: number }[] = [];
    for (const s of SIOS) {
      const el = box.querySelector(`[data-stop="${s.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      pts.push({ x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top });
    }
    const seg = (from: number, to: number) =>
      pts.slice(from, to + 1).map((p) => `${Math.round(p.x)},${Math.round(p.y)}`).join(" ");
    const last = pts.length - 1;
    const t = activeIdx >= 0 ? activeIdx : last;
    setRoute({ travelled: t > 0 ? seg(0, t) : "", ahead: t < last ? seg(t, last) : "" });
  }, [activeIdx]);

  useEffect(() => {
    // The route's points ARE external state — DOM geometry, which cannot be
    // read during render and only exists after layout. The first draw has to
    // run in the effect body or the road appears one resize late; the
    // ResizeObserver below is the subscription the rule asks for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    draw();
    const ro = new ResizeObserver(draw);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={boxRef} className="relative">
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full">
        {/* THE ROAD HAS A BODY (6 Sep). Between fifty raised stops a 4px flat
            stroke read as paint on the band rather than something laid on it.
            Travelled is now a CORD: a dark under-edge one pixel low, the accent
            over it, and a hairline highlight one pixel high — three strokes, no
            filter, so it costs nothing to paint fifty times a second while the
            ResizeObserver redraws. Ahead is a GROOVE cut into the band: the
            dark dashes sit a pixel high with a white catch-light under them,
            which is the same light-from-above the stops use. */}
        {route.travelled && (
          <>
            <polyline points={route.travelled} fill="none" strokeWidth="6"
              stroke="color-mix(in oklab, var(--cahier-ink) 30%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1.5)" />
            <polyline points={route.travelled} fill="none" strokeWidth="5"
              stroke={accent ?? "var(--cahier-ink)"} strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={route.travelled} fill="none" strokeWidth="1.5"
              stroke="color-mix(in oklab, white 55%, transparent)"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 -1.5)" />
          </>
        )}
        {route.ahead && (
          <>
            <polyline points={route.ahead} fill="none" strokeWidth="3"
              stroke="color-mix(in oklab, white 75%, transparent)" strokeDasharray="2 7"
              strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1)" />
            <polyline points={route.ahead} fill="none" strokeWidth="3"
              stroke="var(--cahier-line-strong)" strokeDasharray="2 7"
              strokeLinejoin="round" strokeLinecap="round" />
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
              const ahead = activeIdx >= 0 && i > activeIdx;
              const kind = sioKind(s.id);
              const colour = KIND_COLOR[kind];
              const flag = s.id === CLASS_FLAG_SIO;
              // One name for "not reached yet", used by the fill, the numeral
              // and the depth so the three cannot disagree.
              //
              // `!done` MATTERS. A learner can finish a stop beyond their
              // current one — the map has never locked anything (Dan, 1 Jul:
              // "nothing dims, nothing locks"). Without it, a stop you have
              // completed but walked past would render in the pale wash, i.e.
              // as "not yet", and your own finished work would disappear.
              const sunk = ahead && !active && !done;
              // DEPTH FOLLOWS COMPLETION, not position (Dan, 7 Sep: "all
              // buttons are up by default, and as they are completed they get
              // pressed down"). `sunk` still drives the COLOUR — pen for the
              // stretch you have walked, wash for what is ahead — because that
              // is a different question from whether the key is latched. A
              // stop you have passed but not finished stays UP and coloured,
              // which is exactly the nudge it should be.
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
                  className={`fluo-stop ${done ? "fluo-stop--down" : "fluo-stop--up"} ${sunk ? "" : "fluo-stop-num"} relative z-[2] flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${active ? "fluo-node-active" : ""}`}
                  // TWO SHADES OF ONE PEN (Dan, 6 Sep, choosing option B of
                  // three shown at 44px). Reached stops are filled with the
                  // pen at full strength; stops still ahead take its wash. The
                  // numeral is PAGE INK on both — never white (1.34–3.01 on
                  // these pens) and never the pen's own ink (1.95–4.25). The
                  // ring is the pen either way, so the hue runs edge to edge.
                  style={{
                    ["--fluo-stop-kind" as string]: colour,
                    background: sunk ? KIND_WASH[kind] : colour,
                    color: sunk ? "var(--cahier-ink)" : undefined,
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
