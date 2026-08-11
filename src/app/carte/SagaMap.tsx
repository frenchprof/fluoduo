"use client";

/**
 * 🗺️ La Carte — the saga-map journey view (Dan, 2026-08-11: "a UI inspired
 * by Candy Crush for my 50 SIOs"; same day, four reference screenshots of the
 * real Candy Crush Saga map set the visual bar). What the reference shows,
 * rebuilt with CSS/SVG only (no King assets):
 *
 *   · TERRAIN, not tinted stripes: a cream plateau winds with the road over
 *     each world's ground, a dark dotted foreground strip closes each world,
 *     wooden stumps edge the plateau, a river with a plank bridge crosses
 *     between chapters, clouds drift over the FINAL's horizon.
 *   · MACARON STOPS: every stop sits on a golden frill ring; to-come stops
 *     are pink candy discs (ateliers purple — the reference's "hard level"),
 *     done stops wear their unit accent + ✓ (the 2026-07-13 contrast rule).
 *   · THE CURRENT LEVEL is the big blue orb with your avatar chip beside it —
 *     the map's one loudest thing, still glowing (the 2026-07-08 mechanic).
 *   · HUD: slim candy-pink top bar — back, ✓ done-counter, 🔥 streak, 💎 gems
 *     (progress counters are learner feedback — keep; litmus rule).
 *
 *   · ONE continuous vertical path — SIO-001 at the BOTTOM, the 🏁 FINAL at
 *     the top; the page loads centred on your active stop (native touch
 *     inertia: the window scroll IS the map).
 *   · MILESTONE GATES — each chapter opens with an arch carrying its name and
 *     done-counter, gold once complete. Arches are scenery you walk through,
 *     NEVER barriers — nothing on this map locks (Dan, 2026-07-01).
 *   · RETURN-TO-CURRENT — scroll away and a 📍 button snaps the view back.
 *
 * Same journey data as components/RoadMap; stops keep RoadMap's language:
 * shape = primary focus, fog = chapters beyond the current one (tappable).
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS } from "@/content/chapters";
import { sioKind, KIND_LABEL } from "@/content/sioKinds";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";

type Stop =
  | { kind: "gate"; unit: number }
  | { kind: "sio"; unit: number; id: string; num: number; topic: string }
  | { kind: "finale"; unit: number };

/** Bottom-up: each chapter's arch, then its ten stops; the FINAL crowns it. */
const STOPS: Stop[] = (() => {
  const out: Stop[] = [];
  for (const u of [0, 1, 2, 3, 4]) {
    out.push({ kind: "gate", unit: u });
    for (const s of SIOS.filter((x) => x.unit === u)) {
      out.push({ kind: "sio", unit: u, id: s.id, num: s.num, topic: s.topic });
    }
  }
  out.push({ kind: "finale", unit: 4 });
  return out;
})();

const STEP = 118; // vertical px per stop
const PAD_TOP = 240; // sky + FINAL headroom
const PAD_BOT = 150;
const MAP_H = PAD_TOP + (STOPS.length - 1) * STEP + PAD_BOT;

/** Landmark décor per world — purely visual (litmus-exempt). x in % of the
 *  page width (kept off the centre strip the path winds through), y in % of
 *  the band, s = font px, d = parallax depth (bigger = nearer = drifts more). */
const DECOR: Record<number, { e: string; x: number; y: number; s: number; d: number }[]> = {
  0: [
    { e: "👋", x: 7, y: 10, s: 46, d: 0.18 },
    { e: "🔤", x: 88, y: 22, s: 36, d: 0.1 },
    { e: "📚", x: 9, y: 44, s: 54, d: 0.22 },
    { e: "✏️", x: 90, y: 58, s: 38, d: 0.12 },
    { e: "🎒", x: 12, y: 78, s: 42, d: 0.08 },
  ],
  1: [
    { e: "🪪", x: 88, y: 12, s: 44, d: 0.16 },
    { e: "🎂", x: 8, y: 30, s: 40, d: 0.1 },
    { e: "🎈", x: 86, y: 48, s: 44, d: 0.2 },
    { e: "🐕", x: 10, y: 66, s: 36, d: 0.12 },
    { e: "⚽", x: 87, y: 80, s: 34, d: 0.08 },
  ],
  2: [
    { e: "🎉", x: 9, y: 12, s: 46, d: 0.18 },
    { e: "⏰", x: 89, y: 28, s: 38, d: 0.1 },
    { e: "☕", x: 8, y: 48, s: 44, d: 0.2 },
    { e: "🚲", x: 88, y: 64, s: 48, d: 0.14 },
    { e: "🎶", x: 12, y: 80, s: 34, d: 0.08 },
  ],
  3: [
    { e: "⛅", x: 10, y: 8, s: 48, d: 0.1 },
    { e: "🗺️", x: 88, y: 24, s: 44, d: 0.18 },
    { e: "⛲", x: 8, y: 46, s: 50, d: 0.22 },
    { e: "🚇", x: 90, y: 62, s: 40, d: 0.12 },
    { e: "🚌", x: 11, y: 78, s: 42, d: 0.08 },
  ],
  4: [
    { e: "🍽️", x: 88, y: 14, s: 44, d: 0.16 },
    { e: "🥖", x: 8, y: 30, s: 46, d: 0.1 },
    { e: "🧀", x: 90, y: 48, s: 42, d: 0.2 },
    { e: "🥐", x: 9, y: 64, s: 40, d: 0.12 },
    { e: "🛒", x: 87, y: 80, s: 38, d: 0.08 },
  ],
};

/** Wooden stumps edging each world's plateau (reference: scattered posts).
 *  Same fixed layout per band; % coords, w = stump width px. */
const STUMPS: { x: number; y: number; w: number }[] = [
  { x: 4, y: 90, w: 34 },
  { x: 17, y: 94, w: 26 },
  { x: 72, y: 93, w: 30 },
  { x: 88, y: 89, w: 38 },
  { x: 95, y: 40, w: 26 },
  { x: 2, y: 52, w: 28 },
];

export default function SagaMap() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLAnchorElement | null>(null);
  const [w, setW] = useState(0);
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [pin, setPin] = useState<"visible" | "above" | "below">("visible");

  // Flipped (as a ref, before the setState re-renders) once real localStorage
  // progress is in — the landing jump below must not aim at the default state.
  const progressReady = useRef(false);

  useEffect(() => {
    const refresh = () => setProgress(loadProgress());
    progressReady.current = true;
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    return () => window.removeEventListener("fluolingo:progress-updated", refresh);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeId = nextSioId(progress);
  const activeUnit = activeId ? (SIOS.find((s) => s.id === activeId)?.unit ?? 5) : 5;
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;
  const accent = equippedAccent(progress);

  // Land on your own level, once, as soon as real progress is in (jumping on
  // the default state would always aim at SIO-001).
  const jumped = useRef(false);
  useEffect(() => {
    if (jumped.current || !progressReady.current || w === 0) return;
    jumped.current = true;
    activeRef.current?.scrollIntoView({ block: "center" });
  }, [progress, w]);

  // The 📍 shortcut appears whenever the active stop leaves the viewport —
  // and knows which way back it is.
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) setPin("visible");
        else setPin(en.boundingClientRect.top < 0 ? "above" : "below");
      },
      { rootMargin: "-40px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activeId, w]);

  // The 3D scroll feel (Dan, 2026-08-11: "There is a 3d feel as u scroll.
  // That effect is not ported over"). Candy Crush renders a tilted camera
  // over a 3D world; the CSS translation of that is per-object screen-space
  // depth: everything on the map carries its document y (data-pop-y) and an
  // optional drift rate (data-depth), and each scroll frame scales it by
  // where it sits on screen — small near the top (far from camera), full
  // size low on screen (near) — while landmarks also drift at their own
  // rate. No layout reads in the loop (positions are stamped at render),
  // transform-only writes, one rAF per frame, and nothing moves under
  // reduced motion.
  useEffect(() => {
    const root = wrapRef.current;
    if (!root || w === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pops = Array.from(root.querySelectorAll<HTMLElement>("[data-pop-y]")).map((el) => ({
      el,
      y: Number(el.dataset.popY),
      d: Number(el.dataset.depth ?? 0),
      // Class-borne transforms (the ateliers' 45° diamond) would be clobbered
      // by the inline write — carry them through it instead.
      base: el.dataset.popBase ?? "",
    }));
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const mid = vh / 2;
      for (const p of pops) {
        const scrY = p.y - sy;
        if (scrY < -280 || scrY > vh + 280) continue;
        // 0 at the top of the viewport → 1 at the bottom, gently clamped.
        const t = Math.min(Math.max(scrY / vh, -0.15), 1.15);
        const s = 0.86 + 0.3 * t;
        const dy = p.d ? ((scrY - mid) * p.d).toFixed(1) : "0";
        p.el.style.transform = `translate3d(0, ${dy}px, 0) scale(${s.toFixed(3)}) ${p.base}`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [w]);

  // Geometry: y walks bottom→top; x winds around the centre. Arches and the
  // FINAL sit on the centreline so the road threads straight through them.
  const geo = useMemo(() => {
    const colW = Math.min(w, 560);
    const amp = Math.max(64, colW / 2 - 84);
    const y = (i: number) => MAP_H - PAD_BOT - i * STEP;
    const x = (i: number) => (STOPS[i].kind === "sio" ? w / 2 + amp * Math.sin(i * 1.15) : w / 2);
    return { x, y };
  }, [w]);

  const roadPath = (n: number) => {
    let d = "";
    for (let i = 0; i < n; i++) {
      const px = geo.x(i);
      const py = geo.y(i);
      if (i === 0) {
        d = `M${px.toFixed(1)},${py.toFixed(1)}`;
      } else {
        const qx = geo.x(i - 1);
        const my = ((geo.y(i - 1) + py) / 2).toFixed(1);
        d += ` C${qx.toFixed(1)},${my} ${px.toFixed(1)},${my} ${px.toFixed(1)},${py.toFixed(1)}`;
      }
    }
    return d;
  };

  const activeIdx = STOPS.findIndex((s) => s.kind === "sio" && s.id === activeId);

  /** World band k: from just under its arch up to just under the next one. */
  const band = (u: number) => {
    const bottom = u === 0 ? MAP_H : geo.y(u * 11) + STEP / 2;
    const top = u < 4 ? geo.y((u + 1) * 11) + STEP / 2 : 0;
    return { top, height: bottom - top };
  };

  /** Rivers cross between chapters, just below each arch (units 1-4); the
   *  plank bridge sits where the road passes. */
  const rivers = [1, 2, 3, 4].map((u) => {
    const gi = u * 11;
    const y = geo.y(gi) + STEP * 0.68;
    const bx = w / 2 + (geo.x(gi - 1) - w / 2) * 0.3;
    return { y, bx };
  });

  const chipCls =
    "fluo-mono flex items-center gap-1 rounded-full border-2 border-[#c2497c] bg-white/85 px-2.5 py-1 text-xs font-black text-[#8c2f57]";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(#bfe9f2, #dff2e6 30%)" }}>
      {/* Candy HUD: back + the learner-feedback counters. */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b-4 border-[#e784ad] px-3 py-2"
        style={{ background: "linear-gradient(#fbd0e0, #f7b7cf)" }}
      >
        <Link
          href="/"
          aria-label="Accueil"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#c2497c] bg-white/85 text-lg font-black text-[#8c2f57] shadow-[0_2px_0_rgba(140,47,87,0.4)] transition hover:-translate-y-0.5"
        >
          ←
        </Link>
        <span className="flex-1" />
        <span className={chipCls}>✓ {doneTotal}/{SIOS.length}</span>
        {progress.streak > 0 && <span className={chipCls}>🔥 {progress.streak}</span>}
        {progress.gems > 0 && <span className={chipCls}>💎 {progress.gems}</span>}
      </div>

      {pin !== "visible" && activeIdx >= 0 && (
        <button
          type="button"
          aria-label="Back to your level"
          onClick={() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          // bottom-20: clear of the global 💬 feedback bubble pinned at the corner.
          className="fixed bottom-20 right-4 z-50 flex flex-col items-center justify-center rounded-full border-2 border-[color:var(--fluo-ink)] bg-[var(--fluo-hl)] px-3 py-2 leading-none shadow-[0_4px_0_rgba(34,40,80,0.6)] transition hover:-translate-y-0.5"
        >
          <span aria-hidden className="text-[10px] font-black text-[color:var(--fluo-ink)]">
            {pin === "above" ? "▲" : "▼"}
          </span>
          <span aria-hidden className="text-xl">
            📍
          </span>
        </button>
      )}

      <div ref={wrapRef} className="relative mx-auto w-full overflow-hidden" style={{ height: MAP_H }}>
        {w > 0 && (
          <>
            {/* The five worlds: ground tint, dark dotted foreground strip,
                stumps + parallax landmarks (all visual). */}
            {[0, 1, 2, 3, 4].map((u) => {
              const b = band(u);
              return (
                <div
                  key={`band${u}`}
                  data-band
                  aria-hidden
                  className={`fluo-h-${u} absolute left-0 right-0`}
                  style={{
                    top: b.top,
                    height: b.height,
                    background: `linear-gradient(to top, color-mix(in srgb, var(--fluo-card-tint) 68%, #8fd39b), color-mix(in srgb, var(--fluo-card-tint) 60%, #d7eebc))`,
                  }}
                >
                  {/* dark dotted foreground closing the world */}
                  <span
                    className="saga-dots absolute inset-x-0 bottom-0 block"
                    style={{
                      height: 96,
                      background: "color-mix(in srgb, var(--fluo-card-accent) 26%, transparent)",
                      borderRadius: "40% 60% 0 0 / 24px 30px 0 0",
                    }}
                  />
                  {STUMPS.map((st, j) => (
                    <span
                      key={`st${j}`}
                      data-pop-y={Math.round(b.top + (st.y / 100) * b.height)}
                      data-depth={0.05}
                      className="saga-stump absolute"
                      style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.w, height: st.w * 0.72 }}
                    />
                  ))}
                  {DECOR[u].map((it, j) => (
                    <span
                      key={j}
                      data-pop-y={Math.round(b.top + (it.y / 100) * b.height)}
                      data-depth={it.d}
                      className="absolute block"
                      style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.s }}
                    >
                      <span className="saga-bob" style={{ animationDelay: `${(j * 0.7) % 3}s`, filter: "drop-shadow(0 6px 6px rgba(34,40,80,0.25))" }}>
                        {it.e}
                      </span>
                    </span>
                  ))}
                </div>
              );
            })}

            {/* Sky over the FINAL. */}
            <div aria-hidden className="absolute inset-x-0 top-0" style={{ height: 260, background: "linear-gradient(rgba(178,229,240,0.95), rgba(178,229,240,0))" }}>
              <span className="saga-cloud" data-pop-y={42} data-depth={0.03} style={{ left: "12%", top: 42, width: 90, height: 30 }} />
              <span className="saga-cloud" data-pop-y={96} data-depth={0.03} style={{ left: "64%", top: 96, width: 120, height: 36 }} />
              <span className="saga-cloud" data-pop-y={168} data-depth={0.03} style={{ left: "38%", top: 168, width: 70, height: 24 }} />
            </div>

            {/* Terrain + road: white rim → cream plateau → rivers + bridges →
                the pink candy trail (travelled part in the boutique accent). */}
            <svg className="absolute inset-0 z-[1]" width={w} height={MAP_H} viewBox={`0 0 ${w} ${MAP_H}`} aria-hidden>
              <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={224} strokeLinejoin="round" strokeLinecap="round" />
              <path d={roadPath(STOPS.length)} fill="none" stroke="#f2f8ea" strokeWidth={202} strokeLinejoin="round" strokeLinecap="round" />
              {rivers.map((r, i) => (
                <g key={`riv${i}`}>
                  <path d={`M0,${r.y} L${w},${r.y}`} stroke="#a5d9ea" strokeWidth={54} strokeLinecap="butt" fill="none" />
                  <path d={`M0,${r.y} L${w},${r.y}`} stroke="#c9ecf6" strokeWidth={22} fill="none" />
                  <path d={`M0,${r.y - 20} L${w},${r.y - 20}`} stroke="rgba(255,255,255,0.8)" strokeWidth={3} strokeDasharray="14 26" fill="none" />
                  <g transform={`translate(${r.bx}, ${r.y}) rotate(-7)`}>
                    <rect x={-60} y={-32} width={120} height={64} rx={10} fill="#b0743a" stroke="#7e4c20" strokeWidth={3} />
                    <line x1={-56} y1={-11} x2={56} y2={-11} stroke="#8a5426" strokeWidth={2.5} />
                    <line x1={-56} y1={11} x2={56} y2={11} stroke="#8a5426" strokeWidth={2.5} />
                    {[
                      [-64, -46],
                      [48, -46],
                      [-64, 26],
                      [48, 26],
                    ].map(([px, py], k) => (
                      <rect key={k} x={px} y={py} width={16} height={22} rx={5} fill="#9c6130" stroke="#7e4c20" strokeWidth={2} />
                    ))}
                  </g>
                </g>
              ))}
              <path d={roadPath(STOPS.length)} fill="none" stroke="#f6a8ca" strokeOpacity={0.85} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
              {activeIdx > 0 && (
                <path d={roadPath(activeIdx + 1)} fill="none" stroke={accent} strokeOpacity={0.75} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
              )}
              <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={4} strokeDasharray="4 14" strokeLinejoin="round" strokeLinecap="round" />
            </svg>

            {STOPS.map((st, i) => {
              const cx = geo.x(i);
              const cy = geo.y(i);
              const fogged = st.unit > activeUnit;
              const hue = `fluo-h-${st.unit % 6}`;

              if (st.kind === "gate") {
                const meta = UNIT_META[st.unit];
                const chapter = CHAPTERS[st.unit];
                const inUnit = SIOS.filter((s) => s.unit === st.unit);
                const done = inUnit.filter((s) => isSioDone(s.id, progress)).length;
                const complete = done === inUnit.length;
                return (
                  <div
                    key={`g${st.unit}`}
                    className={`absolute z-[2] ${hue} ${fogged ? "fluo-fog" : ""}`}
                    style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}
                  >
                    <Link
                      href={`/unit/${st.unit}`}
                      data-pop-y={Math.round(cy)}
                      title={`${meta.label} — ${chapter.scenario} · ${done}/${inUnit.length}`}
                      className={`flex flex-col items-center ${complete ? "saga-gate-open" : ""}`}
                    >
                      <span
                        className="flex w-[218px] flex-col items-center rounded-t-[109px] border-[6px] border-b-0 px-5 pb-3 pt-4 text-center"
                        style={{
                          borderColor: "var(--fluo-card-accent)",
                          background: complete
                            ? "linear-gradient(rgba(255,235,160,0.9), rgba(255,255,255,0.25))"
                            : "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.2))",
                        }}
                      >
                        <span className="text-2xl leading-none">{complete ? "⭐" : meta.emoji}</span>
                        <span className="fluo-mono mt-1 text-[11px] font-black leading-none text-[color:var(--fluo-ink)]">{meta.label}</span>
                        <span className="fluo-serif text-[13px] font-bold italic leading-tight text-[color:var(--fluo-ink)]">{chapter.scenario}</span>
                      </span>
                      <span
                        className="fluo-mono -mt-[3px] rounded-full border-2 bg-white px-2.5 py-0.5 text-[10px] font-black leading-none text-[color:var(--fluo-ink)]"
                        style={{ borderColor: "var(--fluo-card-accent)" }}
                      >
                        {done}/{inUnit.length}
                      </span>
                    </Link>
                  </div>
                );
              }

              if (st.kind === "finale") {
                return (
                  <div key="finale" className={`absolute z-[2] ${hue}`} style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}>
                    <Link
                      href="/practice/grammarathon/finale"
                      data-pop-y={Math.round(cy)}
                      title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                      aria-label="GramMarathon Final"
                      className="saga-ring flex rounded-3xl p-[7px]"
                    >
                      <span
                        className="saga-node flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-900"
                        style={{ background: "repeating-conic-gradient(#1f2440 0% 25%, #ffffff 0% 50%) 0 0/14px 14px" }}
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-300 text-xl">🏁</span>
                      </span>
                    </Link>
                    <span aria-hidden className="fluo-mono pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[10px] font-black leading-none text-[color:var(--fluo-ink)]">
                      FINAL
                    </span>
                  </div>
                );
              }

              const sDone = isSioDone(st.id, progress);
              const sActive = st.id === activeId;
              const kind = sioKind(st.id);
              // Outer = the gold frill ring; inner = the macaron. Shapes stay
              // RoadMap's focus coding, radii paired so the ring follows.
              const ringShape =
                kind === "production" ? "rotate-45 rounded-2xl"
                : kind === "grammar" ? "rounded-2xl"
                : kind === "phrases" ? "rounded-[28px] rounded-bl-[10px]"
                : "rounded-full";
              const nodeShape =
                kind === "production" ? "rounded-xl"
                : kind === "grammar" ? "rounded-xl"
                : kind === "phrases" ? "rounded-3xl rounded-bl-[7px]"
                : "rounded-full";
              // To-come = pink candy (ateliers purple, the reference's "hard"
              // look); done = unit accent + ✓ (solid beats faded, 2026-07-13).
              const macaron = sDone
                ? `radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--fluo-card-accent) 45%, white), var(--fluo-card-accent) 75%)`
                : kind === "production"
                  ? "radial-gradient(circle at 35% 28%, #dcbcf4, #a56cd6 78%)"
                  : "radial-gradient(circle at 35% 28%, #ffd9e7, #f7a4c5 78%)";
              return (
                <div key={st.id} className={`absolute z-[2] ${hue} ${fogged ? "fluo-fog" : ""}`} style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}>
                  {sActive && (
                    <span
                      aria-hidden
                      className="absolute right-full top-1/2 mr-2 -translate-y-1/2"
                    >
                      <span className="saga-bob grid h-11 w-11 place-items-center rounded-xl border-[3px] border-[#2a6bd8] bg-white text-2xl shadow-[0_4px_6px_rgba(34,40,80,0.35)]">
                        🧑‍🎓
                      </span>
                    </span>
                  )}
                  <Link
                    ref={sActive ? activeRef : undefined}
                    href={`/unit/${st.unit}#${st.id}`}
                    data-pop-y={Math.round(cy)}
                    data-pop-base={kind === "production" ? "rotate(45deg)" : undefined}
                    title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                    aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                    className={`saga-ring flex ${ringShape} ${sActive ? "fluo-node-active p-[8px]" : "p-[6px]"} ${
                      !sDone && !sActive ? "opacity-85" : ""
                    }`}
                  >
                    <span
                      className={`saga-node flex items-center justify-center border-2 font-black ${nodeShape} ${
                        sActive ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
                      }`}
                      style={{
                        background: sActive
                          ? "radial-gradient(circle at 35% 28%, #7fa8f5, #2b53cb 78%)"
                          : macaron,
                        borderColor: sActive ? "#1c3fa5" : "rgba(255,255,255,0.75)",
                        color: sDone || sActive ? "#fff" : kind === "production" ? "#5b2d86" : "#a34a71",
                      }}
                    >
                      <span className={kind === "production" ? "-rotate-45" : undefined}>{sDone ? "✓" : st.num}</span>
                    </span>
                  </Link>
                  <span
                    aria-hidden
                    className="fluo-mono pointer-events-none absolute left-1/2 top-full mt-1.5 w-[110px] -translate-x-1/2 truncate text-center text-[10px] font-bold leading-none text-[color:var(--fluo-ink)]/80"
                  >
                    {st.topic}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Shape legend, at the foot of the map = the start of the journey —
          same coding as the Home road map. */}
      <p className="fluo-mono mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-8 pt-2 text-[11px] font-bold text-[color:var(--fluo-ink)]/70">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-current" /> {KIND_LABEL.vocab}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[4px] border-2 border-current" /> {KIND_LABEL.grammar}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full rounded-bl-[2px] border-2 border-current" /> {KIND_LABEL.phrases}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-current" /> {KIND_LABEL.production}</span>
      </p>
    </div>
  );
}
