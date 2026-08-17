"use client";

/**
 * The Home course map, 3D view (patch 25; Dan's decision 1, 2026-08-17: two
 * views, the learner toggles). Ported from the La Carte branch
 * (`claude/api-necessity-i8fgps`, src/app/carte/SagaMap.tsx — Dan's
 * "Candy-Crush saga map" with "the 3D scroll feel"), folded into Home
 * instead of living at /carte:
 *
 *   · ONE winding vertical road — SIO-001 at the bottom, the 🏁 FINAL at
 *     the top — through the five region bands (same `--region-*-band`
 *     fills and place names as the 2D view), landmarks bobbing at the
 *     roadside;
 *   · the 3D feel: every stop and landmark carries its map y and scales
 *     with where it sits in the box — small near the top (far), full size
 *     low (near) — landmarks drift at their own depth rate. Transform-only
 *     writes in one rAF per frame; nothing moves under reduced motion.
 *   · the map lives in the same scroll box as the 2D view (box scroll, not
 *     window scroll, drives the depth), opens centred on your current stop,
 *     and a 📍 button brings you back when you scroll away.
 *
 * Ring colours come from `sioKind()` (primary, the thick ring) and
 * `sioSecondary()` (the small dot at the ring's foot) through the shared
 * KIND_COLOR palette in HomeMap.tsx — NOT hand-coded, unlike the branch
 * (STATUS backlog item 3). Done = filled + ✓; current = the big ▶ orb with
 * the avatar chip; to-come = paper fill, dashed ring. Nothing locks.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS, CLASS_FLAG_SIO } from "@/content/chapters";
import { sioKind, sioSecondary, KIND_LABEL } from "@/content/sioKinds";
import { isSioDone, type Progress } from "@/lib/progress";
import { KIND_COLOR, REGIONS, ARENA_PLACE, KindLegend } from "@/components/HomeMap";

type Stop =
  | {
      kind: "sio";
      unit: number;
      id: string;
      num: number;
      short: string;
      topic: string;
    }
  | { kind: "finale"; unit: number };

/** Bottom-up: units 0..4 then the FINAL crowns it. */
const STOPS: Stop[] = (() => {
  const out: Stop[] = SIOS.map((s) => ({
    kind: "sio",
    unit: s.unit,
    id: s.id,
    num: s.num,
    short: s.short,
    topic: s.topic,
  }));
  out.push({ kind: "finale", unit: 5 });
  return out;
})();

const STEP = 104; // vertical px per stop
const PAD_TOP = 150;
const PAD_BOT = 270; // enough that the first stop can sit centred in the box
const MAP_H = PAD_TOP + (STOPS.length - 1) * STEP + PAD_BOT;
const BOX_H = 520;

/** Roadside landmarks per region — decorative (litmus-exempt). x/y in % of
 *  the band, s = font px, d = parallax depth (bigger = nearer = drifts more). */
const DECOR: Record<number, { e: string; x: number; y: number; s: number; d: number }[]> = {
  0: [
    { e: "👋", x: 6, y: 12, s: 34, d: 0.18 },
    { e: "🔤", x: 86, y: 30, s: 28, d: 0.1 },
    { e: "📚", x: 8, y: 58, s: 38, d: 0.22 },
    { e: "🎒", x: 88, y: 80, s: 30, d: 0.08 },
  ],
  1: [
    { e: "🪪", x: 86, y: 12, s: 32, d: 0.16 },
    { e: "🎂", x: 6, y: 34, s: 30, d: 0.1 },
    { e: "🌍", x: 88, y: 60, s: 34, d: 0.2 },
    { e: "🐕", x: 8, y: 82, s: 28, d: 0.12 },
  ],
  2: [
    { e: "🎉", x: 8, y: 10, s: 34, d: 0.18 },
    { e: "⏰", x: 88, y: 32, s: 28, d: 0.1 },
    { e: "☕", x: 6, y: 58, s: 32, d: 0.2 },
    { e: "🎶", x: 88, y: 82, s: 26, d: 0.08 },
  ],
  3: [
    { e: "⛅", x: 8, y: 8, s: 36, d: 0.1 },
    { e: "🗺️", x: 88, y: 30, s: 32, d: 0.18 },
    { e: "⛲", x: 6, y: 58, s: 36, d: 0.22 },
    { e: "🚌", x: 88, y: 82, s: 30, d: 0.08 },
  ],
  4: [
    { e: "🍽️", x: 86, y: 12, s: 32, d: 0.16 },
    { e: "🥖", x: 6, y: 34, s: 34, d: 0.1 },
    { e: "🧀", x: 88, y: 60, s: 30, d: 0.2 },
    { e: "🛒", x: 8, y: 82, s: 28, d: 0.08 },
  ],
};

export default function HomeMap3D({
  progress,
  activeId,
  accent,
  focusUnit,
  onOpenUnit,
  onOpenSio,
}: {
  progress: Progress;
  activeId?: string;
  accent?: string;
  focusUnit?: number;
  onOpenUnit?: (unit: number) => void;
  /** Tapping a stop — the parent opens that SIO (in the unit list under the map). */
  onOpenSio?: (unit: number, id: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const [w, setW] = useState(0);
  const [pin, setPin] = useState<"visible" | "above" | "below">("visible");

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Geometry: y walks bottom → top; x winds around the centre; the FINAL
  // sits on the centreline.
  const geo = useMemo(() => {
    const amp = Math.max(56, Math.min(w, 560) / 2 - 80);
    const y = (i: number) => MAP_H - PAD_BOT - i * STEP;
    const x = (i: number) => (STOPS[i].kind === "sio" ? w / 2 + amp * Math.sin(i * 1.15) : w / 2);
    return { x, y };
  }, [w]);

  const roadPath = (from: number, to: number) => {
    let d = "";
    for (let i = from; i <= to; i++) {
      const px = geo.x(i);
      const py = geo.y(i);
      if (i === from) d = `M${px.toFixed(1)},${py.toFixed(1)}`;
      else {
        const my = ((geo.y(i - 1) + py) / 2).toFixed(1);
        d += ` C${geo.x(i - 1).toFixed(1)},${my} ${px.toFixed(1)},${my} ${px.toFixed(1)},${py.toFixed(1)}`;
      }
    }
    return d;
  };

  const activeIdx = STOPS.findIndex((s) => s.kind === "sio" && s.id === activeId);
  const flagIdx = STOPS.findIndex((s) => s.kind === "sio" && s.id === CLASS_FLAG_SIO);
  const last = STOPS.length - 1;
  const travelledTo = activeIdx >= 0 ? activeIdx : last;
  const pavedTo = Math.max(travelledTo, flagIdx);

  /** Region band u: from just under its first stop up to just above its last. */
  const band = (u: number) => {
    const first = STOPS.findIndex((s) => s.unit === u);
    const lastIn = STOPS.map((s) => s.unit).lastIndexOf(u);
    const bottom = geo.y(first) + STEP * 0.6;
    const top = geo.y(lastIn) - STEP * 0.6;
    return { top, height: bottom - top };
  };

  // Land once the box is measured: on the deep-linked unit's band, else
  // centred on your current stop.
  const landed = useRef<string | null>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || w === 0) return;
    const key = `${focusUnit ?? "active"}:${activeId ?? ""}`;
    if (landed.current === key) return;
    landed.current = key;
    if (focusUnit !== undefined) {
      const b = band(focusUnit);
      box.scrollTo({ top: Math.max(0, b.top + b.height - BOX_H + 30) });
    } else if (activeIdx >= 0) {
      box.scrollTo({ top: Math.max(0, geo.y(activeIdx) - BOX_H / 2) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, focusUnit, activeId]);

  // 📍 appears whenever the current stop leaves the box — and knows the way back.
  useEffect(() => {
    const el = activeRef.current;
    const box = boxRef.current;
    if (!el || !box) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) setPin("visible");
        else setPin(en.boundingClientRect.top < box.getBoundingClientRect().top ? "above" : "below");
      },
      { root: box, rootMargin: "-30px 0px -30px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activeId, w]);

  // The 3D scroll feel (La Carte): per-object screen-space depth. Each
  // [data-pop-y] element scales by where it sits in the box — far at the
  // top, near at the bottom — landmarks also drift by their depth rate.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || w === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pops = Array.from(box.querySelectorAll<HTMLElement>("[data-pop-y]")).map((el) => ({
      el,
      y: Number(el.dataset.popY),
      d: Number(el.dataset.depth ?? 0),
      base: el.dataset.popBase ?? "",
    }));
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = box.clientHeight;
      const sy = box.scrollTop;
      const mid = vh / 2;
      for (const p of pops) {
        const scrY = p.y - sy;
        if (scrY < -240 || scrY > vh + 240) continue;
        const t = Math.min(Math.max(scrY / vh, -0.15), 1.15);
        const s = 0.84 + 0.32 * t;
        const dy = p.d ? ((scrY - mid) * p.d).toFixed(1) : "0";
        p.el.style.transform = `${p.base} translate3d(0, ${dy}px, 0) scale(${s.toFixed(3)})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    box.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      box.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [w, progress, activeId]);

  return (
    <div className="home-map home-map-3d">
      <div className="relative">
        <div
          ref={boxRef}
          className="relative overflow-auto rounded-2xl border"
          style={{
            height: BOX_H,
            maxHeight: "68vh",
            borderColor: "var(--cahier-line-strong)",
            background: "var(--cahier-paper-raised)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="relative w-full" style={{ height: MAP_H }}>
            {w > 0 && (
              <>
                {/* Region bands (bottom = U0) with their label pills and landmarks. */}
                {REGIONS.map((r) => {
                  const b = band(r.unit);
                  const inUnit = SIOS.filter((s) => s.unit === r.unit);
                  const done = inUnit.filter((s) => isSioDone(s.id, progress)).length;
                  return (
                    <div
                      key={`band${r.unit}`}
                      className="absolute inset-x-0"
                      style={{
                        top: b.top,
                        height: b.height,
                        background: `var(--region-${r.key}-band)`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenUnit?.(r.unit)}
                        title={`${UNIT_META[r.unit].label} — ${CHAPTERS[r.unit].scenario} · ${done}/${inUnit.length}`}
                        className="home-map-pill absolute left-1/2 top-2 z-[3] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap px-4 py-0.5 text-[13px] font-bold"
                        style={{
                          background: "var(--cahier-kraft-strong)",
                          color: "var(--cahier-paper-raised)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "var(--cahier-paper-raised)" }}>
                          {r.icon(16)}
                        </span>
                        {r.place} · {done}/{inUnit.length}
                      </button>
                      {DECOR[r.unit].map((it, j) => (
                        <span
                          key={j}
                          aria-hidden
                          data-pop-y={Math.round(b.top + (it.y / 100) * b.height)}
                          data-depth={it.d}
                          className="absolute block"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            fontSize: it.s,
                          }}
                        >
                          <span className="home-map-bob" style={{ animationDelay: `${(j * 0.7) % 3}s` }}>
                            {it.e}
                          </span>
                        </span>
                      ))}
                    </div>
                  );
                })}
                {/* Arena at the top. */}
                <span
                  className="home-map-pill absolute left-1/2 z-[3] -translate-x-1/2 whitespace-nowrap px-4 py-0.5 text-[13px] font-bold"
                  style={{
                    top: geo.y(last) - 92,
                    background: "var(--cahier-kraft-strong)",
                    color: "var(--cahier-paper-raised)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {ARENA_PLACE}
                </span>

                {/* Road: a pale plateau, then travelled · paved · unpaved. */}
                <svg className="absolute inset-0 z-[1]" width={w} height={MAP_H} viewBox={`0 0 ${w} ${MAP_H}`} aria-hidden>
                  <path
                    d={roadPath(0, last)}
                    fill="none"
                    stroke="var(--cahier-paper-raised)"
                    strokeOpacity={0.9}
                    strokeWidth={150}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {pavedTo < last && (
                    <path
                      d={roadPath(pavedTo, last)}
                      fill="none"
                      stroke="var(--cahier-kraft-strong)"
                      strokeOpacity={0.7}
                      strokeWidth={4}
                      strokeDasharray="2 10"
                      strokeLinecap="round"
                    />
                  )}
                  {pavedTo > travelledTo && (
                    <path d={roadPath(travelledTo, pavedTo)} fill="none" stroke="var(--cahier-kraft-strong)" strokeWidth={10} strokeLinecap="round" />
                  )}
                  {travelledTo > 0 && (
                    <path d={roadPath(0, travelledTo)} fill="none" stroke={accent ?? "var(--cahier-accent)"} strokeOpacity={0.8} strokeWidth={10} strokeLinecap="round" />
                  )}
                </svg>

                {STOPS.map((st, i) => {
                  const cx = geo.x(i);
                  const cy = geo.y(i);
                  if (st.kind === "finale") {
                    return (
                      <div
                        key="finale"
                        className="absolute z-[2]"
                        style={{
                          left: cx,
                          top: cy,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <Link
                          href="/practice/grammarathon/finale"
                          data-pop-y={Math.round(cy)}
                          title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                          aria-label="GramMarathon Final"
                          className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] text-2xl"
                          style={{
                            background: "var(--cahier-paper-raised)",
                            borderColor: "var(--cahier-ink)",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          🏁
                        </Link>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[10px] font-bold"
                          style={{ color: "var(--cahier-ink-soft)" }}
                        >
                          Final
                        </span>
                      </div>
                    );
                  }
                  const done = isSioDone(st.id, progress);
                  const active = st.id === activeId;
                  const kind = sioKind(st.id);
                  const second = sioSecondary(st.id);
                  const colour = KIND_COLOR[kind];
                  const ahead = i > travelledTo;
                  const flag = st.id === CLASS_FLAG_SIO;
                  return (
                    <div
                      key={st.id}
                      className="absolute z-[2]"
                      style={{
                        left: cx,
                        top: cy,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {active && (
                        <span aria-hidden className="absolute right-full top-1/2 mr-2 -translate-y-1/2">
                          <span
                            className="home-map-bob grid h-9 w-9 place-items-center rounded-xl border-2 text-xl"
                            style={{
                              borderColor: colour,
                              background: "var(--cahier-paper-raised)",
                              boxShadow: "var(--shadow-card)",
                            }}
                          >
                            🧑‍🎓
                          </span>
                        </span>
                      )}
                      <button
                        type="button"
                        ref={active ? activeRef : undefined}
                        onClick={() => onOpenSio?.(st.unit, st.id)}
                        data-pop-y={Math.round(cy)}
                        title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]}${second ? ` + ${KIND_LABEL[second]}` : ""})`}
                        aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                        aria-current={active ? "step" : undefined}
                        className={`home-map3d-node relative flex items-center justify-center rounded-full border-[4px] font-black ${active ? "fluo-node-active h-16 w-16 text-xl" : "h-12 w-12 text-sm"}`}
                        style={{
                          borderColor: colour,
                          borderStyle: ahead && !active ? "dashed" : "solid",
                          background: done || active ? colour : "var(--cahier-paper-raised)",
                          color: done || active ? "var(--cahier-paper-raised)" : "var(--cahier-ink-faint)",
                        }}
                      >
                        {active ? (
                          <span aria-hidden className="pl-0.5">
                            ▶
                          </span>
                        ) : done ? (
                          "✓"
                        ) : (
                          st.num
                        )}
                        {second && (
                          // Secondary focus (sioSecondary): a small dot at the ring's foot.
                          <span
                            aria-hidden
                            className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2"
                            style={{
                              background: KIND_COLOR[second],
                              borderColor: "var(--cahier-paper-raised)",
                            }}
                          />
                        )}
                        {flag && (
                          <span aria-label="The class is here this week" title="The class is here this week" className="absolute -right-2 -top-2 text-base leading-none">
                            🚩
                          </span>
                        )}
                      </button>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-full mt-1.5 w-[96px] -translate-x-1/2 truncate text-center text-[10px] font-bold leading-none"
                        style={{ color: "var(--cahier-ink-soft)" }}
                      >
                        {st.short}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {pin !== "visible" && activeIdx >= 0 && (
          <button
            type="button"
            aria-label="Back to your stop"
            onClick={() =>
              activeRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
            className="absolute bottom-3 right-3 z-[4] flex flex-col items-center rounded-full border-2 px-2.5 py-1.5 leading-none shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
            style={{
              borderColor: "var(--cahier-ink)",
              background: "var(--fluo-hl)",
            }}
          >
            <span aria-hidden className="text-[10px] font-black" style={{ color: "var(--cahier-ink)" }}>
              {pin === "above" ? "▲" : "▼"}
            </span>
            <span aria-hidden className="text-lg">
              📍
            </span>
          </button>
        )}
      </div>
      <KindLegend />
    </div>
  );
}
