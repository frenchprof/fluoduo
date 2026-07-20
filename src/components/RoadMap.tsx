"use client";

/**
 * The continuous road map (Dan, 2026-07-08: "line up the steps more
 * continuously — U0 · 1 · 2 · … · 10 · U1 · 11 · … — left to right, then
 * right to left on the next line, like a real road map; the number of lines
 * depends on the screen size").
 *
 * One flat sequence of 55 stops (each unit's chip, then its ten SIOs) laid
 * out boustrophedon on a measured grid; an SVG road snakes through the cell
 * centres — full route in light asphalt with a dashed centre line, the
 * travelled part (up to the glowing "you are here" node) darker. Chapters
 * beyond the current one keep the fog (visible, tappable, never locked).
 */
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS } from "@/content/chapters";
import { sioKind, KIND_LABEL } from "@/content/sioKinds";
import { isSioDone, type Progress } from "@/lib/progress";

type Stop =
  | { kind: "unit"; unit: number }
  | { kind: "sio"; unit: number; id: string; num: number; topic: string };

// 74, not 56 (audit 2026-07-19): the extra rows carry each stop's visible
// label — on touch there is no hover, so title-only names left phone users
// (most of the class) with a wall of anonymous numbers.
const CELL_H = 74;
const MIN_CELL_W = 56;

const STOPS: Stop[] = (() => {
  const out: Stop[] = [];
  for (const u of [0, 1, 2, 3, 4]) {
    out.push({ kind: "unit", unit: u });
    for (const s of SIOS.filter((x) => x.unit === u)) {
      out.push({ kind: "sio", unit: u, id: s.id, num: s.num, topic: s.topic });
    }
  }
  return out;
})();

export default function RoadMap({ progress, activeId, accent }: { progress: Progress; activeId?: string; accent?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(5, Math.floor(w / MIN_CELL_W));
  const rows = Math.ceil(STOPS.length / cols);
  const cellW = w / cols;

  // Boustrophedon: even rows run left→right, odd rows right→left.
  const pos = (i: number) => {
    const row = Math.floor(i / cols);
    const p = i % cols;
    return { row, col: row % 2 === 0 ? p : cols - 1 - p };
  };
  const centre = (i: number): [number, number] => {
    const { row, col } = pos(i);
    return [col * cellW + cellW / 2, row * CELL_H + CELL_H / 2];
  };
  const roadPath = (n: number) =>
    STOPS.slice(0, n)
      .map((_, i) => centre(i))
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const activeIdx = STOPS.findIndex((s) => s.kind === "sio" && s.id === activeId);
  const activeUnit = activeIdx >= 0 ? STOPS[activeIdx].unit : 5;

  return (
    <div>
      <div ref={ref} className="relative">
        {w > 0 && (
          <svg
            className="absolute inset-0"
            width={w}
            height={rows * CELL_H}
            viewBox={`0 0 ${w} ${rows * CELL_H}`}
            aria-hidden
          >
            <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(34,40,80,0.10)" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
            {activeIdx > 0 && (
              // The TRAVELLED road wears the boutique accent (the shop
              // promises exactly this), noticeably darker than the road ahead.
              <path d={roadPath(activeIdx + 1)} fill="none" stroke={accent ?? "rgba(34,40,80,0.35)"} strokeOpacity={accent ? 0.5 : 1} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
            )}
            <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeDasharray="6 9" strokeLinejoin="round" />
          </svg>
        )}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: `${CELL_H}px` }}
        >
          {STOPS.map((st, i) => {
            const { row, col } = pos(i);
            const cell: CSSProperties = { gridRowStart: row + 1, gridColumnStart: col + 1 };
            const fogged = st.unit > activeUnit;
            const hue = `fluo-h-${st.unit % 6}`;
            if (st.kind === "unit") {
              const meta = UNIT_META[st.unit];
              const done = SIOS.filter((s) => s.unit === st.unit && isSioDone(s.id, progress)).length;
              return (
                <div key={`u${st.unit}`} style={cell} className={`relative flex items-center justify-center ${hue} ${fogged ? "fluo-fog" : ""}`}>
                  <Link
                    href={`/unit/${st.unit}`}
                    title={`${meta?.label} — ${CHAPTERS[st.unit]?.scenario ?? ""} · ${done}/${SIOS.filter((x) => x.unit === st.unit).length}`}
                    className="relative z-[1] flex h-9 w-11 items-center justify-center rounded-lg text-sm font-black text-white transition hover:-translate-y-0.5"
                    style={{ background: "var(--fluo-card-accent)" }}
                  >
                    U{st.unit}
                  </Link>
                  <span aria-hidden className="pointer-events-none absolute left-0 right-0 top-[calc(50%+20px)] truncate px-0.5 text-center text-[9px] font-bold leading-none text-[color:var(--fluo-ink)]/70">
                    {meta?.label}
                  </span>
                </div>
              );
            }
            const sDone = isSioDone(st.id, progress);
            const sActive = st.id === activeId;
            const kind = sioKind(st.id);
            const shape =
              kind === "production" ? "rotate-45 rounded-md"
              : kind === "grammar" ? "rounded-lg"
              : kind === "phrases" ? "rounded-2xl rounded-bl-[4px]"
              : "rounded-full";
            return (
              <div key={st.id} style={cell} className={`relative flex items-center justify-center ${hue} ${fogged ? "fluo-fog" : ""}`}>
                <Link
                  href={`/unit/${st.unit}#${st.id}`}
                  title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                  aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                  className={`relative z-[1] flex h-9 w-9 items-center justify-center border-2 text-xs font-black transition hover:-translate-y-0.5 ${shape} ${
                    sActive ? "fluo-node-active ring-2 ring-[var(--fluo-danger)] ring-offset-1" : sDone ? "shadow-[0_2px_6px_rgba(0,0,0,0.3)]" : "opacity-55 border-dashed"
                  }`}
                  style={{
                    // Stronger done/to-come contrast (Dan, 2026-07-13): done =
                    // solid + shadow; to-come = white, dashed, faded.
                    background: sDone ? "var(--fluo-card-accent)" : sActive ? "var(--fluo-hl)" : "#ffffff",
                    borderColor: "var(--fluo-card-accent)",
                    color: sDone ? "#fff" : "var(--fluo-ink)",
                  }}
                >
                  <span className={kind === "production" ? "-rotate-45" : undefined}>{sDone ? "✓" : st.num}</span>
                </Link>
                {/* The stop's name, visible without hover (audit 2026-07-19). */}
                <span aria-hidden className="pointer-events-none absolute left-0 right-0 top-[calc(50%+20px)] truncate px-0.5 text-center text-[9px] font-bold leading-none text-[color:var(--fluo-ink)]/70">
                  {st.topic}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shape legend — the node's shape says what kind of work it is. */}
      <p className="fluo-mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-[color:var(--fluo-ink)]/70">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-current" /> {KIND_LABEL.vocab}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[4px] border-2 border-current" /> {KIND_LABEL.grammar}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full rounded-bl-[2px] border-2 border-current" /> {KIND_LABEL.phrases}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-current" /> {KIND_LABEL.production}</span>
      </p>
    </div>
  );
}
