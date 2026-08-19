"use client";

/**
 * The Home course map, 3D view (patch 25c, 2026-08-19 — Dan on production:
 * "the 3D map is not yet 3D!"). The La Carte scroll-scale trick is gone;
 * this is a TRUE perspective scene, CSS 3D only (no WebGL, no dependency):
 *
 *   · a GROUND PLANE (`perspective` on the stage, the plane `rotateX(TILT)`,
 *     `preserve-3d` down to every post) that recedes to a horizon in the top
 *     third of the box. The five region bands are ground patches on it
 *     (`--region-*-band` tokens, a soft edge each) — SIO-001 nearest the
 *     camera at the bottom, the GramMarathon Arena and the 🏁 FINAL far away;
 *   · a WINDING ROAD, an SVG path lying ON the plane: kraft asphalt with a
 *     dashed centre line, paved up to the class flag 🚩 (CLASS_FLAG_SIO) and
 *     a dotted track beyond; the learner's travelled stretch wears the
 *     equipped accent (same semantics as the 2D view);
 *   · STOPS as upright signposts: each is positioned on the plane at its
 *     road point and counter-rotated (`rotateX(-TILT)`) so it stands up and
 *     faces the camera; nearer posts are simply bigger — perspective, no
 *     per-element scale. Ring = KIND_COLOR[sioKind()], the small dot at the
 *     foot = sioSecondary(); done = filled + ✓; current = the bigger ▶ orb
 *     with the avatar chip; to-come = paper fill, dashed ring. A shadow
 *     ellipse on the ground under every post makes it read as standing;
 *   · REGION LANDMARKS stand up too — one regionIcons.tsx icon per band on
 *     a kraft place-name pill (tap = open the unit) — plus two roadside props;
 *   · CAMERA TRAVEL: the box is a native scroll box (wheel, touch, keys,
 *     scrollbar); one rAF turns scrollTop into ONE transform on the world
 *     (`will-change: transform`) that slides the plane under the camera —
 *     nearer stops grow, farther ones shrink. Opens on the current stop (or
 *     the deep-linked unit), clamped to the two ends; 📍 recentres. Under
 *     reduced motion the recentre is a jump, not a glide, and nothing bobs.
 *
 * Tokens only — no hex; verify25c asserts the scene's ingredients.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

/** Near → far: units 0..4 then the FINAL at the far end. */
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

/* Scene constants (world px = px on the ground plane at scale 1, i.e. at
   the near edge). Tune TILT for a steeper/flatter camera; the horizon lands
   at perspective-origin − PERSPECTIVE·cot(TILT) from the top of the box. */
const TILT = 55; // deg — the ground plane's rotateX
const PERSPECTIVE = 900; // px
const STEP = 220; // world px between stops along the road
const FOCUS = 520; // world px from the near edge to the stop the camera "is on"
const FAR_PAD = 420; // ground beyond the FINAL (arena)
const NEAR_PAD = 900; // ground in front of SIO-001 (never behind the eye)
const GROUND_BELOW = 40; // the near edge sits this far under the box's bottom
const POST_W = 120; // billboard width, stops
const LAND_W = 200; // billboard width, landmarks

/** Roadside props per region — decorative (litmus-exempt): the emoji, which
 *  side of the road (−1 left / +1 right), how far along the band (0..1). */
const PROPS: Record<number, { e: string; side: -1 | 1; at: number; s: number }[]> = {
  0: [
    { e: "📚", side: 1, at: 0.25, s: 30 },
    { e: "🎒", side: -1, at: 0.7, s: 26 },
  ],
  1: [
    { e: "🎂", side: -1, at: 0.3, s: 28 },
    { e: "🐕", side: 1, at: 0.75, s: 26 },
  ],
  2: [
    { e: "☕", side: 1, at: 0.3, s: 28 },
    { e: "🎶", side: -1, at: 0.7, s: 26 },
  ],
  3: [
    { e: "⛲", side: -1, at: 0.3, s: 30 },
    { e: "🚌", side: 1, at: 0.7, s: 28 },
  ],
  4: [
    { e: "🥖", side: 1, at: 0.3, s: 30 },
    { e: "🧀", side: -1, at: 0.7, s: 26 },
  ],
};

/** A billboard: a zero-size anchor ON the plane at (x, y), a flat shadow
 *  ellipse, and the post itself counter-rotated to stand upright and face the
 *  camera. Perspective does the sizing — no per-element scale. */
function Post({
  x,
  y,
  width,
  shadow = 56,
  children,
}: {
  x: number;
  y: number;
  width: number;
  shadow?: number;
  children: ReactNode;
}) {
  // The anchor IS the shadow ellipse (a real box — Chromium does not paint
  // a 3D-transformed subtree's out-of-box overflow), centred on (x, y);
  // the post's foot stands on the ellipse's middle.
  return (
    <div
      className="absolute rounded-[50%]"
      style={{
        left: x - shadow / 2,
        top: y - shadow / 5,
        width: shadow,
        height: shadow / 2.5,
        background: "color-mix(in oklch, var(--cahier-ink) 18%, transparent)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: "50%",
          marginLeft: -width / 2,
          bottom: shadow / 5,
          width,
          transformOrigin: "50% 100%",
          transform: `rotateX(${-TILT}deg)`,
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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
  const worldRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pin, setPin] = useState<"visible" | "ahead" | "behind">("visible");
  const { w, h } = size;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // World geometry. y runs FAR (0) → NEAR (L); the plane is three boxes wide
  // so the ground fills the view at every depth; x winds around its centre.
  const last = STOPS.length - 1;
  const geo = useMemo(() => {
    const pw = Math.max(w * 3, 900);
    const cx = pw / 2;
    const amp = Math.min(200, Math.max(84, w * 0.3));
    const yFirst = FAR_PAD + last * STEP; // SIO-001 (nearest)
    const L = yFirst + NEAR_PAD;
    const y = (i: number) => yFirst - i * STEP;
    const x = (i: number) => (STOPS[i].kind === "sio" ? cx + amp * Math.sin(i * 1.05) : cx);
    /** Band u on the ground: from just past its last stop to just before its first. */
    const band = (u: number) => {
      const first = STOPS.findIndex((s) => s.unit === u);
      const lastIn = STOPS.map((s) => s.unit).lastIndexOf(u);
      const top = u === 5 ? 0 : y(lastIn) - STEP * 0.5;
      const bottom = u === 0 ? L : y(first) + STEP * 0.5;
      return { top, height: bottom - top, first, lastIn };
    };
    /** scrollTop that puts stop i on the focus mark. */
    const scrollFor = (i: number) => yFirst - y(i);
    return { pw, cx, amp, yFirst, L, y, x, band, scrollFor, maxScroll: yFirst - y(last) };
  }, [w, last]);

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
  const travelledTo = activeIdx >= 0 ? activeIdx : last;
  const pavedTo = Math.max(travelledTo, flagIdx);

  // The camera: scrollTop → one transform on the world. The near edge of the
  // ground shows world y = yFirst + FOCUS − scrollTop, so the world slides
  // by (L − yFirst − FOCUS + scrollTop). One rAF, transform-only; the 📍
  // state flips only when the current stop leaves the view.
  const pinRef = useRef(pin);
  useEffect(() => {
    const box = boxRef.current;
    const world = worldRef.current;
    if (!box || !world || w === 0) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const s = box.scrollTop;
      world.style.transform = `translate3d(0, ${(geo.L - geo.yFirst - FOCUS + s).toFixed(1)}px, 0)`;
      if (activeIdx >= 0) {
        const d = FOCUS + geo.scrollFor(activeIdx) - s; // ground distance of the current stop
        const next: typeof pin = d < 40 ? "behind" : d > 1900 ? "ahead" : "visible";
        if (next !== pinRef.current) {
          pinRef.current = next;
          setPin(next);
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      box.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [w, h, geo, activeIdx]);

  // Land once measured: on the deep-linked unit's first stop, else on the
  // current stop (SIO-001 when nothing is current).
  const landed = useRef<string | null>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || w === 0) return;
    const key = `${focusUnit ?? "active"}:${activeId ?? ""}`;
    if (landed.current === key) return;
    landed.current = key;
    const i = focusUnit !== undefined ? geo.band(focusUnit).first : Math.max(0, activeIdx);
    box.scrollTo({ top: geo.scrollFor(i), behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, focusUnit, activeId]);

  const recentre = () => {
    const box = boxRef.current;
    if (!box || activeIdx < 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: geo.scrollFor(activeIdx), behavior: reduce ? "auto" : "smooth" });
  };

  const stageStyle = {
    perspective: PERSPECTIVE,
    // Eye height: the horizon lands ~1/3 down the box (see TILT above).
    perspectiveOrigin: `50% ${Math.round(h * 0.22 + PERSPECTIVE / Math.tan((TILT * Math.PI) / 180))}px`,
  };

  return (
    <div className="home-map home-map-3d">
      <div className="relative">
        <div
          ref={boxRef}
          tabIndex={0}
          aria-label="Course map, 3D — scroll to travel the road"
          className="home-map3d-box relative h-[520px] overflow-y-auto overflow-x-hidden rounded-2xl border md:h-[640px]"
          style={{
            maxHeight: "68vh",
            borderColor: "var(--cahier-line-strong)",
            background: "var(--cahier-paper-raised)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Spacer = the road's length; the stage sticks and the world slides. */}
          <div style={{ height: h + geo.maxScroll }}>
            <div className="home-map3d-stage sticky top-0 w-full" style={{ height: h, ...stageStyle }}>
              {w > 0 && h > 0 && (
                <>
                  {/* Sky: paper, hazing into the horizon. */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0"
                    style={{
                      height: h,
                      background: "linear-gradient(var(--cahier-accent-soft), var(--cahier-paper) 40%, var(--cahier-paper-raised))",
                    }}
                  />
                  {/* The ground plane, tilted away; origin = its near edge. */}
                  <div
                    aria-hidden={false}
                    className="home-map3d-ground absolute"
                    style={{
                      left: "50%",
                      bottom: -GROUND_BELOW,
                      width: geo.pw,
                      height: 20000,
                      marginLeft: -geo.pw / 2,
                      background: "var(--cahier-paper)",
                      transformOrigin: "50% 100%",
                      transform: `rotateX(${TILT}deg)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      ref={worldRef}
                      className="home-map3d-world absolute left-0 will-change-transform"
                      onFocusCapture={(e) => {
                        // Keyboard focus on a post: the browser cannot scroll a
                        // 3D-transformed post into view, so travel to it ourselves.
                        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-scroll]");
                        if (t && boxRef.current) boxRef.current.scrollTo({ top: Number(t.dataset.scroll), behavior: "auto" });
                      }}
                      style={{
                        bottom: 0, // world y = L sits on the ground's near edge
                        width: geo.pw,
                        height: geo.L,
                        transformStyle: "preserve-3d",
                        // Field furrows: a faint cross-line every 60 world px —
                        // straight on the plane, converging on screen.
                        backgroundImage: "repeating-linear-gradient(to bottom, var(--cahier-line-strong) 0 1px, transparent 1px 60px)",
                      }}
                    >
                      {/* Region bands as ground patches (far → near). */}
                      {[{ unit: 5, key: "arena" }, ...[...REGIONS].reverse()].map((r) => {
                        const b = geo.band(r.unit);
                        return (
                          <div
                            key={`band${r.unit}`}
                            aria-hidden
                            className="absolute inset-x-0"
                            style={{
                              top: b.top,
                              height: b.height,
                              background: r.unit === 5 ? "var(--cahier-line)" : `var(--region-${r.key}-band)`,
                              borderTop: r.unit === 5 ? undefined : "3px solid var(--cahier-line-strong)",
                              opacity: 0.92,
                            }}
                          />
                        );
                      })}

                      {/* The road, ON the plane: shoulder · asphalt · centre line;
                          paved to the class flag, a dotted track beyond; the
                          travelled stretch in the equipped accent. */}
                      <svg className="absolute left-0 top-0" width={geo.pw} height={geo.L} viewBox={`0 0 ${geo.pw} ${geo.L}`} aria-hidden>
                        <path d={roadPath(0, pavedTo)} fill="none" stroke="var(--cahier-paper-raised)" strokeWidth={112} strokeLinejoin="round" strokeLinecap="round" />
                        <path d={roadPath(0, pavedTo)} fill="none" stroke="var(--cahier-kraft-strong)" strokeWidth={92} strokeLinejoin="round" strokeLinecap="round" />
                        {pavedTo > travelledTo && (
                          <path
                            d={roadPath(travelledTo, pavedTo)}
                            fill="none"
                            stroke="var(--cahier-paper-raised)"
                            strokeWidth={5}
                            strokeDasharray="26 22"
                            strokeLinecap="round"
                          />
                        )}
                        {travelledTo > 0 && (
                          <path d={roadPath(0, travelledTo)} fill="none" stroke={accent ?? "var(--cahier-accent)"} strokeWidth={12} strokeLinecap="round" />
                        )}
                        {pavedTo < last && (
                          <>
                            <path d={roadPath(pavedTo, last)} fill="none" stroke="var(--cahier-paper-raised)" strokeOpacity={0.7} strokeWidth={70} strokeLinejoin="round" strokeLinecap="round" />
                            <path
                              d={roadPath(pavedTo, last)}
                              fill="none"
                              stroke="var(--cahier-kraft-strong)"
                              strokeOpacity={0.8}
                              strokeWidth={16}
                              strokeDasharray="4 34"
                              strokeLinecap="round"
                            />
                          </>
                        )}
                      </svg>

                      {/* Landmarks + props: one upright region icon per band, at the
                          roadside opposite the road's swing, and two small props. */}
                      {REGIONS.map((r) => {
                        const b = geo.band(r.unit);
                        const mid = Math.round((b.first + b.lastIn) / 2);
                        const off = geo.x(mid) - geo.cx;
                        const side = off >= 0 ? -1 : 1;
                        const inUnit = SIOS.filter((s) => s.unit === r.unit);
                        const done = inUnit.filter((s) => isSioDone(s.id, progress)).length;
                        return (
                          <div key={`land${r.unit}`} className="contents">
                            <Post x={geo.cx + side * (geo.amp + 60)} y={geo.y(mid) + STEP * 0.4} width={LAND_W} shadow={200}>
                              <button
                                type="button"
                                onClick={() => onOpenUnit?.(r.unit)}
                                title={`${UNIT_META[r.unit].label} — ${CHAPTERS[r.unit].scenario} · ${done}/${inUnit.length}`}
                                className="flex flex-col items-center"
                              >
                                <span aria-hidden className="block">
                                  {r.icon(96)}
                                </span>
                                <span
                                  className="home-map-pill -mt-1 flex items-center gap-1 whitespace-nowrap px-4 py-1 text-[13px] font-bold"
                                  style={{
                                    background: "var(--cahier-kraft-strong)",
                                    color: "var(--cahier-paper-raised)",
                                    boxShadow: "var(--shadow-card)",
                                  }}
                                >
                                  {r.place} · {done}/{inUnit.length}
                                </span>
                              </button>
                            </Post>
                            {PROPS[r.unit].map((p, j) => {
                              const i = Math.round(b.first + (b.lastIn - b.first) * p.at);
                              return (
                                <Post key={j} x={geo.cx + p.side * (geo.amp + 40 + j * 70)} y={geo.y(i) - STEP * 0.5} width={60} shadow={30}>
                                  <span aria-hidden className="block leading-none" style={{ fontSize: p.s }}>
                                    {p.e}
                                  </span>
                                </Post>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Arena sign at the far end. */}
                      <Post x={geo.cx} y={geo.y(last) - STEP * 0.9} width={LAND_W} shadow={200}>
                        <span
                          className="home-map-pill whitespace-nowrap px-4 py-1 text-[13px] font-bold"
                          style={{
                            background: "var(--cahier-kraft-strong)",
                            color: "var(--cahier-paper-raised)",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          {ARENA_PLACE}
                        </span>
                      </Post>

                      {/* Stops as signposts, far → near so nearer posts paint last. */}
                      {STOPS.map((st, i) => {
                        const px = geo.x(i);
                        const py = geo.y(i);
                        if (st.kind === "finale") {
                          return (
                            <Post key="finale" x={px} y={py} width={POST_W} shadow={120}>
                              <Link
                                href="/practice/grammarathon/finale"
                                title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                                aria-label="GramMarathon Final"
                                className="home-map3d-node flex h-[72px] w-[72px] items-center justify-center rounded-full border-[4px] text-3xl"
                                style={{
                                  background: "var(--cahier-paper-raised)",
                                  borderColor: "var(--cahier-ink)",
                                }}
                              >
                                🏁
                              </Link>
                              <span aria-hidden className="mt-1 rounded px-1 text-[13px] font-bold leading-tight" style={{ color: "var(--cahier-ink)", background: "var(--cahier-paper-raised)" }}>
                                Final
                              </span>
                            </Post>
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
                          <Post key={st.id} x={px} y={py} width={POST_W} shadow={active ? 150 : 120}>
                            {/* Above the ring, in flow (a 3D-transformed post does not
                                paint absolutely-positioned overflow in Chromium): the
                                avatar chip on the current stop, the class flag 🚩. */}
                            {active && (
                              <span
                                aria-hidden
                                className="home-map-bob mb-1 grid h-10 w-10 place-items-center rounded-xl border-2 text-2xl"
                                style={{
                                  borderColor: colour,
                                  background: "var(--cahier-paper-raised)",
                                  boxShadow: "var(--shadow-card)",
                                }}
                              >
                                🧑‍🎓
                              </span>
                            )}
                            {flag && (
                              <span aria-label="The class is here this week" title="The class is here this week" className="-mb-1 text-2xl leading-none">
                                🚩
                              </span>
                            )}
                            <div className="relative">
                              <button
                                type="button"
                                data-scroll={geo.scrollFor(i)}
                                onClick={() => onOpenSio?.(st.unit, st.id)}
                                title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]}${second ? ` + ${KIND_LABEL[second]}` : ""})`}
                                aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                                aria-current={active ? "step" : undefined}
                                className={`home-map3d-node relative flex items-center justify-center rounded-full border-[5px] font-black ${active ? "fluo-node-active h-20 w-20 text-3xl" : "h-14 w-14 text-lg"}`}
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
                                    className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2"
                                    style={{
                                      background: KIND_COLOR[second],
                                      borderColor: "var(--cahier-paper-raised)",
                                    }}
                                  />
                                )}
                              </button>
                            </div>
                            <span
                              aria-hidden
                              className="pointer-events-none mt-2 max-w-full truncate rounded px-1.5 text-[13px] font-bold leading-tight"
                              style={{ color: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", boxShadow: "var(--shadow-card)" }}
                            >
                              {st.short}
                            </span>
                          </Post>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {pin !== "visible" && activeIdx >= 0 && (
          <button
            type="button"
            aria-label="Back to your stop"
            onClick={recentre}
            className="absolute right-3 top-3 z-[4] flex flex-col items-center rounded-full border-2 px-2.5 py-1.5 leading-none shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
            style={{
              borderColor: "var(--cahier-ink)",
              background: "var(--fluo-hl)",
            }}
          >
            <span aria-hidden className="text-[10px] font-black" style={{ color: "var(--cahier-ink)" }}>
              {pin === "ahead" ? "▲" : "▼"}
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
