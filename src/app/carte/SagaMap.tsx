"use client";

/**
 * 🗺️ La Carte — the saga-map journey view (Dan, 2026-08-11: "a UI inspired
 * by Candy Crush for my 50 SIOs"). What Candy Crush's 3D scroll map does,
 * translated to FluOlinGo:
 *
 *   · ONE continuous vertical path — SIO-001 at the BOTTOM, the 🏁 FINAL at
 *     the top; the page loads centred on your active stop and you flick up
 *     and down with native touch inertia (the window scroll IS the map).
 *   · FIVE themed worlds, one per unité, each wearing its chapter's colours
 *     with drifting landmark décor on two parallax depths (diorama feel).
 *   · MILESTONE GATES — each chapter opens with an arch across the path
 *     carrying its name and done-counter; a completed chapter's arch turns
 *     gold. Arches are scenery you walk through, NEVER barriers — nothing on
 *     this map locks (Dan, 2026-07-01).
 *   · RETURN-TO-CURRENT — scroll away from your active stop and a 📍 button
 *     pops up to snap the view back to it.
 *
 * Same journey data as components/RoadMap (the compact Home overview); this
 * page is the full-screen scenic version. Stops keep RoadMap's language:
 * shape = primary focus, solid = done, glow = you-are-here, fog = chapters
 * beyond the current one (tappable as ever).
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

const STEP = 112; // vertical px per stop
const PAD_TOP = 170;
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
    { e: "🎒", x: 12, y: 80, s: 42, d: 0.08 },
  ],
  1: [
    { e: "🪪", x: 88, y: 12, s: 44, d: 0.16 },
    { e: "🎂", x: 8, y: 30, s: 40, d: 0.1 },
    { e: "👨‍👩‍👧", x: 90, y: 48, s: 48, d: 0.2 },
    { e: "🐕", x: 10, y: 66, s: 36, d: 0.12 },
    { e: "⚽", x: 87, y: 84, s: 34, d: 0.08 },
  ],
  2: [
    { e: "🎉", x: 9, y: 12, s: 46, d: 0.18 },
    { e: "⏰", x: 89, y: 28, s: 38, d: 0.1 },
    { e: "☕", x: 8, y: 48, s: 44, d: 0.2 },
    { e: "🚲", x: 88, y: 64, s: 48, d: 0.14 },
    { e: "🎶", x: 12, y: 84, s: 34, d: 0.08 },
  ],
  3: [
    { e: "⛅", x: 10, y: 8, s: 48, d: 0.1 },
    { e: "🗺️", x: 88, y: 24, s: 44, d: 0.18 },
    { e: "⛲", x: 8, y: 46, s: 50, d: 0.22 },
    { e: "🚇", x: 90, y: 62, s: 40, d: 0.12 },
    { e: "🚌", x: 11, y: 82, s: 42, d: 0.08 },
  ],
  4: [
    { e: "🍽️", x: 88, y: 10, s: 44, d: 0.16 },
    { e: "🥖", x: 8, y: 28, s: 46, d: 0.1 },
    { e: "🧀", x: 90, y: 48, s: 42, d: 0.2 },
    { e: "🥐", x: 9, y: 66, s: 40, d: 0.12 },
    { e: "🛒", x: 87, y: 84, s: 38, d: 0.08 },
  ],
};

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

  // Diorama parallax: each landmark drifts against the scroll by its depth,
  // measured from its band's offset to the viewport centre. Transform-only,
  // one rAF per scroll frame, skipped entirely under reduced motion.
  useEffect(() => {
    const root = wrapRef.current;
    if (!root || w === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bands = Array.from(root.querySelectorAll<HTMLElement>("[data-band]"));
    let raf = 0;
    const tick = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      for (const band of bands) {
        const r = band.getBoundingClientRect();
        if (r.bottom < -300 || r.top > window.innerHeight + 300) continue;
        const off = r.top + r.height / 2 - mid;
        for (const el of Array.from(band.querySelectorAll<HTMLElement>("[data-depth]"))) {
          el.style.transform = `translate3d(0, ${(off * Number(el.dataset.depth)).toFixed(1)}px, 0)`;
        }
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
    const amp = Math.max(64, colW / 2 - 80);
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

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(#dff1fb, #eef1f8 30%)" }}>
      <Link
        href="/"
        aria-label="Accueil"
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/90 text-lg font-black text-[color:var(--fluo-ink)] shadow-[0_3px_0_rgba(34,40,80,0.35)] backdrop-blur transition hover:-translate-y-0.5"
      >
        ←
      </Link>
      <span className="fluo-mono fixed right-3 top-3 z-50 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/90 px-3 py-2 text-xs font-black text-[color:var(--fluo-ink)] shadow-[0_3px_0_rgba(34,40,80,0.35)] backdrop-blur">
        ✓ {doneTotal}/{SIOS.length}
      </span>

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
            {/* The five worlds: tinted skies + parallax landmarks (visual only). */}
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
                    background: `linear-gradient(to top, color-mix(in srgb, var(--fluo-card-tint) 80%, white), color-mix(in srgb, var(--fluo-card-tint) 35%, white))`,
                  }}
                >
                  {/* far hills */}
                  <span
                    data-depth="0.05"
                    className="absolute -left-[12%] bottom-[2%] block h-[26%] w-[55%]"
                    style={{ background: "var(--fluo-card-accent)", opacity: 0.1, borderRadius: "48% 52% 62% 38% / 60% 55% 45% 40%" }}
                  />
                  <span
                    data-depth="0.07"
                    className="absolute -right-[14%] bottom-[34%] block h-[22%] w-[50%]"
                    style={{ background: "var(--fluo-card-accent)", opacity: 0.08, borderRadius: "55% 45% 40% 60% / 45% 60% 40% 55%" }}
                  />
                  {/* near landmarks */}
                  {DECOR[u].map((it, j) => (
                    <span
                      key={j}
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

            {/* The road, travelled part in the boutique accent. */}
            <svg className="absolute inset-0 z-[1]" width={w} height={MAP_H} viewBox={`0 0 ${w} ${MAP_H}`} aria-hidden>
              <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(34,40,80,0.13)" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
              {activeIdx > 0 && (
                <path d={roadPath(activeIdx + 1)} fill="none" stroke={accent} strokeOpacity={0.5} strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
              )}
              <path d={roadPath(STOPS.length)} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} strokeDasharray="7 11" strokeLinejoin="round" />
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
                      title={`${meta.label} — ${chapter.scenario} · ${done}/${inUnit.length}`}
                      className={`flex flex-col items-center transition hover:-translate-y-0.5 ${complete ? "saga-gate-open" : ""}`}
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
                      title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                      aria-label="GramMarathon Final"
                      className="saga-node flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-900 transition hover:-translate-y-0.5"
                      style={{ background: "repeating-conic-gradient(#1f2440 0% 25%, #ffffff 0% 50%) 0 0/14px 14px" }}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-300 text-xl">🏁</span>
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
              const shape =
                kind === "production" ? "rotate-45 rounded-lg"
                : kind === "grammar" ? "rounded-xl"
                : kind === "phrases" ? "rounded-3xl rounded-bl-[6px]"
                : "rounded-full";
              return (
                <div key={st.id} className={`absolute z-[2] ${hue} ${fogged ? "fluo-fog" : ""}`} style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}>
                  {sActive && (
                    <span aria-hidden className="saga-pin absolute left-1/2 top-0 z-[3] text-2xl" style={{ transform: "translate(-50%, -100%)" }}>
                      📍
                    </span>
                  )}
                  <Link
                    ref={sActive ? activeRef : undefined}
                    href={`/unit/${st.unit}#${st.id}`}
                    title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                    aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})`}
                    className={`saga-node relative flex h-12 w-12 items-center justify-center border-2 text-sm font-black transition hover:-translate-y-0.5 ${shape} ${
                      sActive ? "fluo-node-active ring-2 ring-[var(--fluo-danger)] ring-offset-2" : sDone ? "" : "opacity-70 border-dashed"
                    }`}
                    style={{
                      background: sDone
                        ? `radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--fluo-card-accent) 45%, white), var(--fluo-card-accent) 75%)`
                        : sActive
                          ? `radial-gradient(circle at 35% 28%, #eefb9a, var(--fluo-hl) 75%)`
                          : "radial-gradient(circle at 35% 28%, #ffffff, #eef0f6 80%)",
                      borderColor: "var(--fluo-card-accent)",
                      color: sDone ? "#fff" : "var(--fluo-ink)",
                    }}
                  >
                    <span className={kind === "production" ? "-rotate-45" : undefined}>{sDone ? "✓" : st.num}</span>
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
