"use client";

/**
 * The Home course map, 2D view (patch 25; Dan's decision 1, 2026-08-17: the
 * map has two views, 2D and 3D, the learner toggles). This file is the 2D
 * one, built from Design's "FluOlinGo Home standalone" reference:
 *
 *   · a rectangular map inside a bordered scroll box, a zoom % control
 *     (30–200, fit-to-width = 100 %);
 *   · the path snakes right → down across five soft REGION BANDS — one band
 *     per unit — each with a kraft label pill (region icon + place name);
 *     then the GramMarathon Arena band for the 🏁 final;
 *   · 56 px round stops, 3 px border coloured by KIND; the CURRENT stop is
 *     filled and wears a bobbing 🧑‍🎓, the same mark the 3D view uses (it was
 *     a ▶ until 2026-08-21 — the triangle belongs to sound); done stops are
 *     filled with ✓; the stop
 *     names sit under the stops and hide when the map is zoomed out
 *     (< 0.7), a dotted kraft polyline is the road, a legend row closes.
 *
 * Kind → colour, Design's four categories onto the repo's `sioKind()`:
 *   vocab      → "vocabulary"    → --cahier-accent
 *   grammar    → "grammar"       → --tier-weak
 *   phrases    → "expressions"   → --tier-medium   (KIND_LABEL: expressions)
 *   production → "communication" → --tier-good     (KIND_LABEL: communication)
 * (Same colours the 3D view uses — see HomeMap3D; the palette lives in
 * KIND_COLOR below and nowhere else.)
 *
 * What replaced the old RoadMap's fog: the road is PAVED (solid) up to the
 * class flag 🚩 (CLASS_FLAG_SIO — where the class is this week) and unpaved
 * (dotted, fainter) beyond; the learner's own travelled stretch wears the
 * equipped accent. Nothing dims, nothing locks (Dan, 2026-07-01).
 *
 * "One unit per screen": the map box snaps band-to-band on a vertical swipe
 * (scroll-snap), opens on the current unit's band, and the unit chips above
 * jump to a band. Bands are stacked, not paged sideways, so the road stays
 * ONE road that snakes down — Design's ref — instead of six disconnected
 * screens.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS, CLASS_FLAG_SIO } from "@/content/chapters";
import { sioKind, KIND_LABEL, type SioKind } from "@/content/sioKinds";
import { isSioDone, type Progress } from "@/lib/progress";
import { ChalkboardIcon, IdBadgeIcon, GiftIcon, SignpostIcon, BasketIcon } from "@/components/regionIcons";

/** Kind → colour token. The ONE place the map's category palette lives. */
export const KIND_COLOR: Record<SioKind, string> = {
  vocab: "var(--cahier-accent)",
  grammar: "var(--tier-weak)",
  phrases: "var(--tier-medium)",
  production: "var(--tier-good)",
};

/** The five regions (Design's place names, 17 Aug 2026), one per unit, and
 *  the arena for the final. Band fills are the `--region-*-band` tokens;
 *  the icon is one motif from regionIcons.tsx per region. */
export const REGIONS: {
  unit: number;
  key: string;
  place: string;
  icon: (size: number) => ReactNode;
}[] = [
  {
    unit: 0,
    key: "village",
    place: "Welcome Village",
    icon: (s) => <ChalkboardIcon size={s} title="" />,
  },
  {
    unit: 1,
    key: "heights",
    place: "Identity Heights",
    icon: (s) => <IdBadgeIcon size={s} title="" />,
  },
  {
    unit: 2,
    key: "valley",
    place: "Wants & Wishes Valley",
    icon: (s) => <GiftIcon size={s} title="" />,
  },
  {
    unit: 3,
    key: "downtown",
    place: "Downtown District",
    icon: (s) => <SignpostIcon size={s} title="" />,
  },
  {
    unit: 4,
    key: "market",
    place: "Gourmet Market",
    icon: (s) => <BasketIcon size={s} title="" />,
  },
];
export const ARENA_PLACE = "GramMarathon Arena";

const COLS = 5;
const COL_W = 86;
const ROW_H = 86;
const BAND_GAP = 44; // headroom above each band for its label pill
const TOP_PAD = 52;
const BOTTOM_PAD = 24;
const BAND_PAD = 8; // breathing room so stops sit inside their band
const MAP_W = COLS * COL_W;

type Node =
  | {
      kind: "sio";
      id: string;
      unit: number;
      num: number;
      short: string;
      topic: string;
      x: number;
      y: number;
      cx: number;
      cy: number;
    }
  | {
      kind: "finale";
      unit: number;
      x: number;
      y: number;
      cx: number;
      cy: number;
    };
type Band = {
  unit: number;
  top: number;
  height: number;
  place: string;
  fill: string;
  region?: (typeof REGIONS)[number];
};

/** Static geometry: nodes snake left→right then right→left inside each band,
 *  bands stack with a gap for the label; the arena band holds the 🏁. */
const GEO: { nodes: Node[]; bands: Band[]; height: number } = (() => {
  const nodes: Node[] = [];
  const bands: Band[] = [];
  let y = 0;
  let seed = 0;
  const place = (i: number, bandTop: number) => {
    const row = Math.floor(i / COLS);
    const p = i % COLS;
    const col = row % 2 === 0 ? p : COLS - 1 - p;
    // A hair of hand-placed jitter so the grid does not read as a spreadsheet.
    const jx = Math.sin(seed * 1.7) * 8;
    const jy = Math.cos(seed * 2.3) * 5;
    seed++;
    const x = col * COL_W + jx;
    const yy = bandTop + BAND_PAD + row * ROW_H + jy;
    return { x, y: yy, cx: x + COL_W / 2, cy: yy + 28 };
  };
  for (const r of REGIONS) {
    const sios = SIOS.filter((s) => s.unit === r.unit);
    const top = y;
    sios.forEach((s, i) => {
      nodes.push({
        kind: "sio",
        id: s.id,
        unit: s.unit,
        num: s.num,
        short: s.short,
        topic: s.topic,
        ...place(i, top),
      });
    });
    const height = Math.ceil(sios.length / COLS) * ROW_H + BAND_PAD * 2;
    bands.push({
      unit: r.unit,
      top,
      height,
      place: r.place,
      fill: `var(--region-${r.key}-band)`,
      region: r,
    });
    y = top + height + BAND_GAP;
  }
  nodes.push({ kind: "finale", unit: 5, ...place(0, y) });
  bands.push({
    unit: 5,
    top: y,
    height: ROW_H + BAND_PAD * 2,
    place: ARENA_PLACE,
    fill: "var(--cahier-line)",
  });
  return { nodes, bands, height: y + ROW_H + BAND_PAD * 2 };
})();

const polyline = (from: number, to: number) =>
  GEO.nodes
    .slice(from, to + 1)
    .map((n) => `${n.cx.toFixed(1)},${n.cy.toFixed(1)}`)
    .join(" ");

export default function HomeMap({
  progress,
  activeId,
  accent,
  focusUnit,
  onOpenUnit,
  onOpenSio,
  postcard,
}: {
  progress: Progress;
  activeId?: string;
  /** The learner's equipped accent — paints the travelled stretch of road. */
  accent?: string;
  /** Band to open on (deep link); defaults to the current stop's unit. */
  focusUnit?: number;
  /** Tapping a region pill / unit chip — the parent shows that unit's list. */
  onOpenUnit?: (unit: number) => void;
  /** Tapping a stop — the parent opens that SIO (in the unit list under the map). */
  onOpenSio?: (unit: number, id: string) => void;
  /** POSTCARD mode (Dan, 2026-08-21): a bare, read-only snapshot for Home —
   *  no unit chips, no legend, no zoom, a short box landed on the learner's
   *  current band. The parent wraps it in a link to /map and turns
   *  pointer events off. */
  postcard?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxW, setBoxW] = useState(0);
  const [zoomPct, setZoomPct] = useState(100);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBoxW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 100 % = fit-to-width (Design's default); the number input scales that.
  const fit = boxW > 0 ? Math.min(boxW / MAP_W, 1.2) : 1;
  const zoom = fit * (zoomPct / 100);
  const hasLabels = zoom >= 0.7;

  const activeIdx = GEO.nodes.findIndex((n) => n.kind === "sio" && n.id === activeId);
  const flagIdx = GEO.nodes.findIndex((n) => n.kind === "sio" && n.id === CLASS_FLAG_SIO);
  const activeUnit = activeIdx >= 0 ? GEO.nodes[activeIdx].unit : 5;
  const openUnit = focusUnit ?? activeUnit;

  // Land on the band that matters (the deep-linked unit, else the current
  // stop's) once the box is measured — one unit per screen.
  const landed = useRef<number | null>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || boxW === 0 || landed.current === openUnit) return;
    landed.current = openUnit;
    const band = GEO.bands.find((b) => b.unit === openUnit);
    if (!band) return;
    box.scrollTo({
      top: Math.max(0, (TOP_PAD + band.top - BAND_GAP + 6) * zoom),
      behavior: "auto",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxW, openUnit]);

  const jumpTo = (unit: number) => {
    const box = boxRef.current;
    const band = GEO.bands.find((b) => b.unit === unit);
    if (!box || !band) return;
    box.scrollTo({
      top: Math.max(0, (TOP_PAD + band.top - BAND_GAP + 6) * zoom),
      behavior: "smooth",
    });
  };

  const setZoom = (v: number) => setZoomPct(Math.min(200, Math.max(30, Math.round(v))));

  // Road segments: travelled (→ current, accent) · paved (→ class flag,
  // solid kraft) · unpaved (dotted, fainter). Nothing beyond is hidden.
  const last = GEO.nodes.length - 1;
  const travelledTo = activeIdx >= 0 ? activeIdx : last; // all done → all travelled
  const pavedTo = Math.max(travelledTo, flagIdx);
  const road = useMemo(
    () => ({
      travelled: travelledTo > 0 ? polyline(0, travelledTo) : "",
      paved: pavedTo > travelledTo ? polyline(travelledTo, pavedTo) : "",
      unpaved: pavedTo < last ? polyline(pavedTo, last) : "",
    }),
    [travelledTo, pavedTo, last],
  );

  const chip = "fluo-mono shrink-0 rounded-full border-2 px-2 py-0.5 text-[11px] font-black leading-none transition hover:-translate-y-0.5";

  return (
    <div className="home-map">
      {/* Unit chips: one tap = that band on screen. */}
      {!postcard && <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1">
        {GEO.bands.map((b) => {
          const isOpen = b.unit === openUnit;
          const inUnit = b.unit < 5 ? SIOS.filter((s) => s.unit === b.unit) : [];
          const done = inUnit.filter((s) => isSioDone(s.id, progress)).length;
          return (
            <button
              key={b.unit}
              type="button"
              onClick={() => {
                jumpTo(b.unit);
                if (b.unit < 5) onOpenUnit?.(b.unit);
              }}
              aria-current={isOpen ? "true" : undefined}
              title={b.unit < 5 ? `${UNIT_META[b.unit].label} — ${CHAPTERS[b.unit].scenario} · ${done}/${inUnit.length}` : ARENA_PLACE}
              className={chip}
              style={{
                borderColor: isOpen ? "var(--cahier-ink)" : "var(--cahier-line-strong)",
                background: isOpen ? "var(--cahier-ink)" : "var(--cahier-paper-raised)",
                color: isOpen ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
              }}
            >
              {b.unit < 5 ? `U${b.unit} · ${done}/${inUnit.length}` : "🏁"}
            </button>
          );
        })}
      </div>}

      {/* The map box — Design's bordered scroll box. Vertical swipes snap
          band to band; the zoom scales the whole sheet. */}
      <div
        ref={boxRef}
        className="home-map-box overflow-auto rounded-2xl border"
        style={{
          height: postcard ? 280 : 520,
          maxHeight: postcard ? undefined : "68vh",
          borderColor: "var(--cahier-line-strong)",
          background: "var(--cahier-paper-raised)",
          boxShadow: "var(--shadow-card)",
          scrollSnapType: "y proximity",
        }}
      >
        <div style={{ zoom, padding: `${TOP_PAD}px 0 ${BOTTOM_PAD}px` } as CSSProperties}>
          <div className="relative mx-auto" style={{ width: MAP_W, height: GEO.height }}>
            {GEO.bands.map((b) => (
              <div key={`band${b.unit}`}>
                <div
                  id={`unit-${b.unit}`}
                  aria-hidden
                  className="absolute left-0 rounded-[20px]"
                  style={{
                    top: b.top,
                    width: MAP_W,
                    height: b.height,
                    background: b.fill,
                    scrollSnapAlign: "start",
                    scrollMarginTop: BAND_GAP - 6,
                  }}
                />
                {/* Region label pill — the region icon + Design's place name.
                    Tapping it opens the unit's list under the map. */}
                {b.unit < 5 ? (
                  <button
                    type="button"
                    onClick={() => onOpenUnit?.(b.unit)}
                    title={`${UNIT_META[b.unit].label} — ${CHAPTERS[b.unit].scenario}`}
                    className="home-map-pill absolute left-1/2 z-[1] flex items-center gap-1.5 whitespace-nowrap px-4 py-0.5 text-[13px] font-bold"
                    style={{
                      top: b.top,
                      transform: "translate(-50%, calc(-100% - 6px))",
                      background: "var(--cahier-kraft-strong)",
                      color: "var(--cahier-paper-raised)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "var(--cahier-paper-raised)" }}>
                      {b.region?.icon(16)}
                    </span>
                    {b.place}
                  </button>
                ) : (
                  <span
                    className="home-map-pill absolute left-1/2 z-[1] whitespace-nowrap px-4 py-0.5 text-[13px] font-bold"
                    style={{
                      top: b.top,
                      transform: "translate(-50%, calc(-100% - 6px))",
                      background: "var(--cahier-kraft-strong)",
                      color: "var(--cahier-paper-raised)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {b.place}
                  </span>
                )}
              </div>
            ))}

            {/* The road: travelled · paved to the class flag · unpaved. */}
            <svg width={MAP_W} height={GEO.height} className="pointer-events-none absolute left-0 top-0 z-[1]" aria-hidden>
              {road.unpaved && (
                <polyline
                  points={road.unpaved}
                  fill="none"
                  stroke="var(--cahier-kraft-strong)"
                  strokeOpacity={0.7}
                  strokeWidth={3}
                  strokeDasharray="2 9"
                  strokeLinecap="round"
                />
              )}
              {road.paved && (
                <polyline points={road.paved} fill="none" stroke="var(--cahier-kraft-strong)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              )}
              {road.travelled && (
                <polyline points={road.travelled} fill="none" stroke={accent ?? "var(--cahier-accent)"} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>

            {GEO.nodes.map((n, i) => {
              if (n.kind === "finale") {
                return (
                  <div key="finale" className="absolute z-[2] flex flex-col items-center" style={{ left: Math.round(n.x), top: Math.round(n.y), width: COL_W }}>
                    <Link
                      href="/practice/grammarathon/finale"
                      title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                      aria-label="GramMarathon Final"
                      className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] text-2xl transition hover:-translate-y-0.5"
                      style={{
                        background: "var(--cahier-paper-raised)",
                        borderColor: "var(--cahier-ink)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      🏁
                    </Link>
                    {hasLabels && (
                      <span aria-hidden className="mt-1 text-center text-[10px] font-bold leading-tight" style={{ color: "var(--cahier-ink-soft)" }}>
                        Final
                      </span>
                    )}
                  </div>
                );
              }
              const done = isSioDone(n.id, progress);
              const active = n.id === activeId;
              const ahead = i > travelledTo; // beyond the current stop: to come
              const kind = sioKind(n.id);
              const colour = KIND_COLOR[kind];
              const flag = n.id === CLASS_FLAG_SIO;
              return (
                <div key={n.id} className="absolute z-[2] flex flex-col items-center" style={{ left: Math.round(n.x), top: Math.round(n.y), width: COL_W }}>
                  <button
                    type="button"
                    onClick={() => onOpenSio?.(n.unit, n.id)}
                    title={`${n.id} · ${n.topic} (${KIND_LABEL[kind]})`}
                    aria-label={`${n.id} · ${n.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                    aria-current={active ? "step" : undefined}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] text-lg font-black transition hover:-translate-y-0.5 ${active ? "fluo-node-active" : ""}`}
                    style={{
                      borderColor: colour,
                      borderStyle: ahead && !active ? "dashed" : "solid",
                      background: done || active ? colour : "var(--cahier-paper-raised)",
                      color: done || active ? "var(--cahier-paper-raised)" : "var(--cahier-ink-faint)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {done ? "✓" : n.num}
                    {/* 🧑‍🎓 bobs over the current stop — the SAME mark the 3D
                        view uses (HomeMap3D). It was a ▶ here until
                        2026-08-21: two views of one map disagreed about "you
                        are here", and this file called it "a filled ▶
                        media-player button" — which is what ▶ means
                        everywhere else in the app. The filled circle already
                        says which stop is current; the avatar says it is you. */}
                    {active && (
                      <span aria-hidden className="home-map-bob absolute -top-5 left-1/2 -translate-x-1/2 text-base leading-none" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }}>
                        🧑‍🎓
                      </span>
                    )}
                    {flag && (
                      <span aria-label="The class is here this week" title="The class is here this week" className="absolute -right-2 -top-2 text-base leading-none">
                        🚩
                      </span>
                    )}
                  </button>
                  {hasLabels && (
                    <span aria-hidden className="mt-1 max-w-full truncate text-center text-[10px] font-bold leading-tight" style={{ color: "var(--cahier-ink-soft)" }}>
                      {n.short}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!postcard && <KindLegend>
        {/* Zoom, compact: − [nn] + % */}
        <span className="fluo-mono flex shrink-0 items-center gap-1 text-[11px] font-bold text-[color:var(--cahier-ink-faint)]" aria-label="Zoom">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom(zoomPct - 10)}
            className="h-6 w-6 rounded-md border"
            style={{
              borderColor: "var(--cahier-line-strong)",
              background: "var(--cahier-paper-raised)",
              color: "var(--cahier-ink)",
            }}
          >
            −
          </button>
          {/* One field, two ways in (Dan, 2026-08-21, re-asked): type any
              number, or drop the field down to the milestone levels. */}
          <input
            type="number"
            min={30}
            max={200}
            step={5}
            list="fluo-zoom-milestones"
            value={zoomPct}
            onChange={(e) => setZoom(parseFloat(e.target.value) || 100)}
            aria-label="Zoom percent — type a value or pick a milestone"
            className="h-6 w-12 rounded-md border px-1 text-center text-[11px]"
            style={{
              borderColor: "var(--cahier-line-strong)",
              background: "var(--cahier-paper-raised)",
              color: "var(--cahier-ink)",
            }}
          />
          <datalist id="fluo-zoom-milestones">
            <option value="50" label="50 — whole course" />
            <option value="75" label="75 — two regions" />
            <option value="100" label="100 — one region" />
            <option value="150" label="150 — a few stops" />
            <option value="200" label="200 — stop by stop" />
          </datalist>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom(zoomPct + 10)}
            className="h-6 w-6 rounded-md border"
            style={{
              borderColor: "var(--cahier-line-strong)",
              background: "var(--cahier-paper-raised)",
              color: "var(--cahier-ink)",
            }}
          >
            +
          </button>
          %
        </span>
      </KindLegend>}
    </div>
  );
}

/** Legend shared by both views: colour = kind (primary focus per stop),
 *  🧑‍🎓 you, 🚩 class. `children` sits at the right (the 2D zoom control). */
export function KindLegend({ children }: { children?: ReactNode }) {
  return (
    <div className="fluo-mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold" style={{ color: "var(--cahier-ink-soft)" }}>
      {(Object.keys(KIND_COLOR) as SioKind[]).map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
          {KIND_LABEL[k]}
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span aria-hidden>🧑‍🎓</span> you
      </span>
      <span className="flex items-center gap-1">
        <span aria-hidden>🚩</span> class
      </span>
      {children && <span className="flex-1" />}
      {children}
    </div>
  );
}
