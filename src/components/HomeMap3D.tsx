"use client";

/**
 * The Home course map, 3D view — ported from Dan's Figma Make "3D Scroll Map
 * Interface" (19 Aug 2026; Dan on the CSS-perspective attempt of the same
 * afternoon: "the 3D map is not yet 3D" — the Make is THE reference).
 *
 * What it is: a FIRST-PERSON CAMERA travelling along a snaking road. The
 * camera sits on the road and turns with the bends (`src/lib/map3d/
 * projection.ts` — `pathXAt`, `cameraForward`, `project()`); every stop,
 * tree, building and prop is a billboard projected to box pixels and sized
 * by depth; the sky is painted from the learner's REAL local clock
 * (`sky.ts` — sun/moon arc, clouds, horizon haze); the roadside catalogue
 * (`scene.ts` — ROADSIDE_ITEMS, the procedurally placed NATURE_ITEMS) is
 * Peers' curriculum-grounded set, intact.
 *
 * What differs from the Make, and why:
 *   · DATA: the 50 stops come from SIOS (ids, `short` labels, unit);
 *     done / current / to-come from `progress` + `activeId` (nothing dims,
 *     nothing locks — Dan, 2026-07-01); ring colour = KIND_COLOR[sioKind()],
 *     secondary focus = the sioSecondary() dot (the Make's mock STOPS,
 *     stars, type badges and modal are gone — the parent opens the SIO).
 *   · WORLDS: the Make's "Café de Paris / Le Campus / …" are the repo's
 *     regions (HomeMap's REGIONS — Welcome Village … Gourmet Market) with
 *     the regionIcons.tsx icon on each world's gate sign (tap = open the
 *     unit); world accent = `--region-*`, ground = `--region-*-band`.
 *   · ROAD semantics kept from the 2D view: paved to the class flag 🚩
 *     (CLASS_FLAG_SIO), dotted beyond, the travelled stretch in the
 *     equipped accent. FINAL = the 🏁 GramMarathon arch (a link to the
 *     final), the finishing line reads ARENA_PLACE.
 *   · CLASSMATES: dropped — the repo has no per-learner stop that is safe
 *     to show (the leaderboard carries name + XP only; no emails, ever).
 *   · CAMERA: the box is a native scroll box (wheel, touch, keys,
 *     scrollbar; clamped to the road) — one rAF turns scrollTop into camZ;
 *     opens on the current stop / deep-linked unit; 📍 recentres; reduced
 *     motion = no glide, no bob, no pulse. Keyboard focus on a stop travels
 *     the camera to it.
 *   · COLOUR: tokens only in this file (no hex — verify19b/25b/25c); the
 *     sky keyframes are numeric RGB in sky.ts (see its header).
 *   · TYPE: the Cahier body stack, not Nunito.
 *
 * Knobs: HORIZON_Y / CAMERA_Y / FOCAL / MAX_AHEAD in projection.ts; the
 * road snake WX there; SCROLL_PER_STOP (px of scroll per stop) and CAM_MIN /
 * CAM_MAX below; the sky keyframes in sky.ts; the props in scene.ts.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS, CLASS_FLAG_SIO } from "@/content/chapters";
import { sioKind, sioSecondary, KIND_LABEL } from "@/content/sioKinds";
import { isSioDone, type Progress } from "@/lib/progress";
import { KIND_COLOR, REGIONS, ARENA_PLACE, KindLegend } from "@/components/HomeMap";
import { HORIZON_Y, MAX_AHEAD, getWorldX, pathXAt, cameraForward, project, zOrder, type Projected } from "@/lib/map3d/projection";
import { getSkyColors, sunPosition, clockHour, CLOUDS, STARS } from "@/lib/map3d/sky";
import { ROADSIDE_ITEMS, NATURE_ITEMS, type RBuild, type RProp, type NatureType } from "@/lib/map3d/scene";

/* ── Camera travel ─────────────────────────────────────────────────────────
   scrollTop → camZ: the box's scroll height is the road's length. */
const SCROLL_PER_STOP = 130; // px of scroll per stop
const CAM_MIN = -1.5; // before SIO-001, the Welcome Village gate in view
const CAM_MAX = 54.5; // the finishing line
const ARCH_Z = 51; // the 🏁 GramMarathon arch
const FINISH_Z = 54.5; // the finishing line
const scrollForCam = (z: number) => Math.round((z - CAM_MIN) * SCROLL_PER_STOP);
const MAX_SCROLL = scrollForCam(CAM_MAX);

const INK = "var(--cahier-ink)";
const PAPER = "var(--cahier-paper-raised)";
const SHADOW = "rgba(0,0,0,0.13)";

/* ── Sky + ground (SVG) ─────────────────────────────────────────────────── */
function PerspectiveBg({
  fluo,
  ground,
  vw,
  vh,
  camZ,
  hour,
}: {
  fluo: string;
  ground: string;
  vw: number;
  vh: number;
  camZ: number;
  hour: number;
}) {
  const horizY = vh * HORIZON_Y;
  // The ground tilts a touch against the bend, like a banked road.
  const { fx } = cameraForward(camZ);
  const vpX = vw * (0.5 - fx * 0.12);
  const sky = getSkyColors(hour);
  const sun = sunPosition(hour);
  const sunX = vw * sun.x;
  const sunY = horizY * sun.y;
  const sunR = Math.max(8, vw * 0.024);
  return (
    <svg width={vw} height={vh} className="absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <defs>
        <linearGradient id="m3dSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top} />
          <stop offset="55%" stopColor={sky.mid} />
          <stop offset="100%" stopColor={sky.hor} />
        </linearGradient>
        <linearGradient id="m3dFog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.hor} stopOpacity="0.55" />
          <stop offset="100%" stopColor={sky.hor} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="m3dSunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sky.sun} stopOpacity="0.5" />
          <stop offset="100%" stopColor={sky.sun} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m3dGround" cx={vpX / vw} cy="0" r="1.1">
          <stop offset="0%" stopColor={PAPER} />
          <stop offset="100%" stopColor={ground} />
        </radialGradient>
      </defs>
      {/* Sky */}
      <rect x={0} y={0} width={vw} height={horizY + 1} fill="url(#m3dSky)" />
      {/* Stars */}
      {sky.night > 0 && STARS.map((st, i) => <circle key={i} cx={vw * st.x} cy={horizY * st.y} r={st.r} fill="white" opacity={0.85 * sky.night} />)}
      {/* Sun / moon */}
      <ellipse cx={sunX} cy={sunY} rx={sunR * 2.8} ry={sunR * 2.8} fill="url(#m3dSunGlow)" />
      {sky.isDay ? (
        <circle cx={sunX} cy={sunY} r={sunR} fill={sky.sun} opacity={0.92} />
      ) : (
        <>
          <circle cx={sunX} cy={sunY} r={sunR} fill={sky.sun} opacity={0.88} />
          <circle cx={sunX + sunR * 0.35} cy={sunY - sunR * 0.05} r={sunR * 0.82} fill={sky.mid} opacity={0.9} />
        </>
      )}
      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <g key={i} opacity={sky.isDay ? 0.78 : 0.28}>
          <ellipse cx={vw * c.cx - sunR * 0.5} cy={horizY * c.cy} rx={vw * c.rx} ry={horizY * c.ry} fill="rgba(255,255,255,0.9)" />
          <ellipse cx={vw * c.cx - vw * c.rx * 0.25} cy={horizY * c.cy - horizY * c.ry * 0.55} rx={vw * c.rx * 0.5} ry={horizY * c.ry * 0.65} fill="rgba(255,255,255,0.85)" />
          <ellipse cx={vw * c.cx + vw * c.rx * 0.2} cy={horizY * c.cy - horizY * c.ry * 0.45} rx={vw * c.rx * 0.38} ry={horizY * c.ry * 0.55} fill="rgba(255,255,255,0.8)" />
        </g>
      ))}
      {/* Ground: the region's band colour, paler towards the vanishing point */}
      <rect x={0} y={horizY} width={vw} height={vh - horizY} fill={ground} />
      <rect x={0} y={horizY} width={vw} height={vh - horizY} fill="url(#m3dGround)" opacity={0.4} />
      {/* World-accent wash */}
      <rect x={0} y={horizY} width={vw} height={vh - horizY} fill={fluo} opacity={0.16} />
      {/* Night falls on the ground too */}
      {sky.night > 0 && <rect x={0} y={horizY} width={vw} height={vh - horizY} fill={sky.top} opacity={0.42 * sky.night} />}
      {/* Horizon line in the world's accent */}
      <line x1={0} y1={horizY} x2={vw} y2={horizY} stroke={fluo} strokeWidth="2.5" />
      {/* Haze */}
      <rect x={0} y={horizY - 24} width={vw} height={48} fill="url(#m3dFog)" />
    </svg>
  );
}

/* ── The road: segments between consecutive projected stops ────────────── */
type Seg = { x1: number; y1: number; x2: number; y2: number; sc: number; i: number };
function PathSVG({ segments, vw, vh, travelledTo, pavedTo, accent }: { segments: Seg[]; vw: number; vh: number; travelledTo: number; pavedTo: number; accent: string }) {
  return (
    <svg width={vw} height={vh} className="absolute inset-0" style={{ zIndex: 5, pointerEvents: "none" }} aria-hidden>
      {segments.map((s) => {
        const w = Math.max(1.5, s.sc * 18);
        const paved = s.i < pavedTo;
        const travelled = s.i < travelledTo;
        return (
          <g key={s.i}>
            <line x1={s.x1 + 1} y1={s.y1 + 2} x2={s.x2 + 1} y2={s.y2 + 2} stroke="rgba(0,0,0,0.10)" strokeWidth={w + 1} strokeLinecap="round" />
            {paved ? (
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={INK} strokeWidth={w} strokeLinecap="round" />
            ) : (
              // beyond the class flag: a dotted track
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={INK} strokeOpacity={0.55} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${w * 0.9} ${w * 1.1}`} />
            )}
            {/* centre channel — the travelled stretch wears the equipped accent */}
            <line
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={travelled ? accent : "rgba(250,247,240,0.3)"}
              strokeWidth={travelled ? w * 0.36 : w * 0.3}
              strokeLinecap="round"
              strokeDasharray={travelled ? undefined : `${w * 0.8} ${w * 1.4}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Sprites ───────────────────────────────────────────────────────────── */
function BuildingSprite({ item, scale, scaleY }: { item: RBuild; scale: number; scaleY: number }) {
  const pw = Math.round(item.w * scale);
  const ph = Math.round(item.h * scale);
  const roofH = Math.max(4, Math.round(pw * 0.16));
  const sideW = Math.max(2, Math.round(pw * 0.14 * Math.max(0.28, scaleY)));
  const brd = Math.max(1, Math.round(scale * 2.5));
  if (pw < 14) return null;
  const floorH = Math.max(10, Math.round(ph / item.floors));
  const winH = Math.max(5, Math.round(floorH * 0.5));
  const winW = Math.max(4, Math.round(winH * 0.72));
  const gap = Math.max(3, Math.round(pw * 0.1));
  const winsPerFloor = Math.max(1, Math.floor((pw - gap * 2) / (winW + gap)));
  const edge = "rgba(0,0,0,0.4)";
  return (
    <div className="pointer-events-none flex flex-col items-start">
      <div
        style={{
          width: pw + sideW + brd * 2,
          height: roofH,
          marginLeft: -brd,
          background: item.roof,
          borderTop: `${brd}px solid ${edge}`,
          borderLeft: `${brd}px solid ${edge}`,
          borderRight: `${brd}px solid ${edge}`,
          borderRadius: `${brd * 2}px ${brd * 2}px 0 0`,
          boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.18)",
        }}
      />
      <div className="flex items-stretch">
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: pw, height: ph, background: item.wall, borderBottom: `${brd}px solid ${edge}`, borderLeft: `${brd}px solid ${edge}` }}
        >
          {Array.from({ length: item.floors }).map((_, fi) => {
            const isGround = fi === item.floors - 1;
            return (
              <div
                key={fi}
                className="flex flex-1 items-center justify-around"
                style={{ borderBottom: fi < item.floors - 1 ? `${brd}px solid rgba(0,0,0,0.16)` : "none", padding: `0 ${gap}px` }}
              >
                {Array.from({ length: winsPerFloor }).map((_, wi) => {
                  const isDoor = isGround && wi === Math.floor(winsPerFloor / 2);
                  return (
                    <div
                      key={wi}
                      className="relative shrink-0 overflow-hidden"
                      style={{
                        width: winW,
                        height: isDoor ? winH * 1.35 : winH,
                        background: isDoor ? "var(--cahier-kraft-strong)" : "var(--cahier-accent-soft)",
                        border: `${Math.max(1, Math.round(brd * 0.65))}px solid rgba(0,0,0,0.32)`,
                        borderRadius: isDoor ? `${brd}px ${brd}px 0 0` : brd,
                        alignSelf: isDoor ? "flex-end" : "center",
                      }}
                    >
                      {!isDoor && winH > 7 && (
                        <>
                          <div className="absolute inset-x-0" style={{ top: "46%", height: 1, background: "rgba(0,0,0,0.28)" }} />
                          <div className="absolute inset-y-0" style={{ left: "46%", width: 1, background: "rgba(0,0,0,0.28)" }} />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.35) 0%,transparent 55%)" }} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* side extrusion */}
        <div
          style={{
            width: sideW,
            height: ph,
            background: item.wall,
            filter: "brightness(0.48)",
            borderRight: `${brd}px solid ${edge}`,
            borderBottom: `${brd}px solid ${edge}`,
            borderRadius: `0 0 ${brd}px ${brd}px`,
          }}
        />
      </div>
      {item.sign && scale > 0.26 && (
        <div
          className="overflow-hidden whitespace-nowrap font-extrabold"
          style={{
            marginTop: 2,
            marginLeft: 2,
            background: item.roof,
            fontSize: Math.max(6, Math.round(pw * 0.11)),
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            padding: "1px 5px",
            borderRadius: 3,
            border: `${Math.max(1, brd * 0.5)}px solid rgba(0,0,0,0.2)`,
            maxWidth: pw + sideW,
            textOverflow: "ellipsis",
          }}
        >
          {item.sign}
        </div>
      )}
      <div className="self-center rounded-[50%]" style={{ marginTop: 1, width: (pw + sideW) * 0.68, height: Math.max(2, Math.round(7 * scale * scaleY)), background: SHADOW }} />
    </div>
  );
}

function PropSprite({ item, scale, scaleY }: { item: RProp; scale: number; scaleY: number }) {
  const fs = Math.max(10, Math.round(item.size * scale));
  if (fs < 10) return null;
  return (
    <div className="pointer-events-none flex flex-col items-center">
      <span className="block" style={{ fontSize: fs, lineHeight: 1, filter: `drop-shadow(0 ${Math.max(2, fs * 0.07)}px ${Math.max(3, fs * 0.13)}px rgba(0,0,0,0.42))` }}>
        {item.emoji}
      </span>
      {item.label && scale > 0.27 && (
        <div
          lang="fr"
          className="whitespace-nowrap text-center font-extrabold"
          style={{ marginTop: 2, fontSize: Math.max(6, Math.round(fs * 0.23)), color: INK, background: "rgba(255,255,255,0.88)", padding: "1px 5px", borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
        >
          {item.label}
        </div>
      )}
      <div className="rounded-[50%]" style={{ marginTop: 2, width: fs * 0.52, height: Math.max(2, Math.round(fs * 0.08 * scaleY)), background: SHADOW }} />
    </div>
  );
}

const LEAF_DARK = "color-mix(in oklch, var(--tier-good) 72%, black)";
const LEAF_MID = "var(--tier-good)";
const LEAF_LIGHT = "color-mix(in oklch, var(--tier-good) 65%, white)";
const PINE_DARK = "color-mix(in oklch, var(--tier-good) 55%, black)";
const PINE_MID = "color-mix(in oklch, var(--tier-good) 80%, black)";
const TRUNK = "linear-gradient(to bottom, var(--cahier-kraft-strong), color-mix(in oklch, var(--cahier-kraft-strong) 60%, black))";

function NatureSprite({ type, size, scale, scaleY }: { type: NatureType; size: number; scale: number; scaleY: number }) {
  const cW = Math.round(size * scale);
  const cH = Math.round(size * (type === "pine" ? 1.35 : type === "bush" ? 0.55 : 0.88) * scale);
  const tW = Math.max(2, Math.round(size * 0.17 * scale));
  const tH = Math.max(1, Math.round(size * 0.3 * scale));
  const brd = Math.max(0.8, scale * 1.8);
  if (cW < 4) return null;
  const dark = type === "pine" ? PINE_DARK : LEAF_DARK;
  const mid = type === "pine" ? PINE_MID : LEAF_MID;
  const light = type === "pine" ? LEAF_MID : LEAF_LIGHT;
  const shadow: CSSProperties = { width: Math.round(cW * 0.55), height: Math.max(2, Math.round(4 * scale * scaleY)), background: "rgba(0,0,0,0.10)", borderRadius: "50%", marginTop: 1 };
  if (type === "bush") {
    return (
      <div className="pointer-events-none flex flex-col items-center">
        <div
          style={{
            width: Math.round(cW * 1.6),
            height: Math.max(4, cH),
            background: `radial-gradient(ellipse at 38% 32%, ${light} 0%, ${mid} 52%, ${dark} 100%)`,
            borderRadius: "50%",
            border: `${brd}px solid rgba(0,0,0,0.16)`,
            boxShadow: `inset 0 -${Math.max(1, Math.round(cH * 0.15))}px ${cH * 0.22}px rgba(0,0,0,0.10)`,
          }}
        />
        <div style={shadow} />
      </div>
    );
  }
  return (
    <div className="pointer-events-none flex flex-col items-center">
      <div
        style={{
          width: cW,
          height: Math.max(5, cH),
          background: `radial-gradient(ellipse at 40% 28%, ${light} 0%, ${mid} 50%, ${dark} 100%)`,
          borderRadius: type === "pine" ? "48% 48% 44% 44% / 58% 58% 42% 42%" : "50%",
          border: `${brd}px solid rgba(0,0,0,0.18)`,
          boxShadow: `inset 0 -${Math.max(1, Math.round(cH * 0.12))}px ${cH * 0.18}px rgba(0,0,0,0.11)`,
        }}
      />
      {tH >= 2 && (
        <div
          style={{
            width: tW,
            height: tH,
            background: TRUNK,
            borderRight: `${Math.max(0.8, brd * 0.7)}px solid rgba(0,0,0,0.28)`,
            borderBottom: `${Math.max(0.8, brd * 0.7)}px solid rgba(0,0,0,0.28)`,
            borderLeft: `${Math.max(0.8, brd * 0.7)}px solid rgba(0,0,0,0.28)`,
          }}
        />
      )}
      <div style={shadow} />
    </div>
  );
}

/* ── The map ───────────────────────────────────────────────────────────── */
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
  /** The learner's equipped accent — paints the travelled stretch of road. */
  accent?: string;
  /** Unit to open on (deep link); defaults to the current stop. */
  focusUnit?: number;
  /** Tapping a world's gate sign — the parent shows that unit's list. */
  onOpenUnit?: (unit: number) => void;
  /** Tapping a stop — the parent opens that SIO (in the unit list under the map). */
  onOpenSio?: (unit: number, id: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w: vw, h: vh } = size;

  const activeIdx = SIOS.findIndex((s) => s.id === activeId);
  const flagIdx = SIOS.findIndex((s) => s.id === CLASS_FLAG_SIO);
  const travelledTo = activeIdx >= 0 ? activeIdx : SIOS.length;
  const pavedTo = Math.max(travelledTo, flagIdx);
  const homeZ = Math.max(0, activeIdx);

  // The camera — starts ON the current stop (no landing flash).
  const [camZ, setCamZ] = useState(homeZ);
  const [pin, setPin] = useState<"visible" | "ahead" | "behind">("visible");
  const [reduce, setReduce] = useState(false);

  // The clock → sky, once a minute; `?hour=` (dev / screenshots) pins it.
  const [hour, setHour] = useState(12);
  useEffect(() => {
    const tick = () => setHour(clockHour(window.location.search));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onMq = () => setReduce(mq.matches);
    mq.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // scrollTop → camZ, one rAF; the 📍 state flips only when the current
  // stop leaves the view.
  const pinRef = useRef(pin);
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const z = CAM_MIN + box.scrollTop / SCROLL_PER_STOP;
      setCamZ(z);
      if (activeIdx >= 0) {
        const d = activeIdx - z;
        const next: typeof pin = d < -1.5 ? "behind" : d > 14 ? "ahead" : "visible";
        if (next !== pinRef.current) {
          pinRef.current = next;
          setPin(next);
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      box.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeIdx]);

  // Land once measured: on the deep-linked unit's gate, else on the current stop.
  const landed = useRef<string | null>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || vw === 0) return;
    const key = `${focusUnit ?? "active"}:${activeId ?? ""}`;
    if (landed.current === key) return;
    landed.current = key;
    const z = focusUnit !== undefined ? focusUnit * 10 - 0.5 : homeZ;
    box.scrollTo({ top: scrollForCam(z), behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vw, focusUnit, activeId]);

  const travelTo = (z: number, smooth = true) => {
    boxRef.current?.scrollTo({ top: scrollForCam(z), behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  const recentre = () => travelTo(homeZ);

  // The world the camera is in → accent + ground.
  const worldIdx = Math.min(4, Math.max(0, Math.floor(camZ / 10)));
  const region = REGIONS[worldIdx];
  const fluo = `var(--region-${region.key})`;
  const ground = `var(--region-${region.key}-band)`;

  // Project the stops; the road runs between consecutive visible ones.
  const projected = useMemo(() => {
    if (vw === 0) return [];
    return SIOS.map((s, i) => {
      const p = project(getWorldX(i + 1), i - camZ, camZ, vw, vh);
      return p ? { i, st: s, ...p } : null;
    });
  }, [camZ, vw, vh]);
  const segments: Seg[] = [];
  for (let i = 0; i < projected.length - 1; i++) {
    const a = projected[i];
    const b = projected[i + 1];
    if (!a || !b) continue;
    segments.push({ x1: a.px, y1: a.py, x2: b.px, y2: b.py, sc: (a.scale + b.scale) / 2, i });
  }
  segments.sort((a, b) => a.sc - b.sc);
  const visibleStops = projected.filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => b.t - a.t);

  // World gate signs (one per region, just before its first stop) + the arch + the line.
  // World gate signs stand at the verge just before each world's first stop,
  // on the side the road bends away from (so they stay in view), never
  // behind the camera.
  const gates = vw === 0 ? [] : REGIONS.map((r) => {
    const z = r.unit * 10 - 0.6;
    if (z - camZ < -0.2) return null;
    const side = pathXAt(z + 1.5) - pathXAt(z) > 0 ? -1 : 1;
    const p = project(pathXAt(z) + side * 0.42, z - camZ, camZ, vw, vh);
    return p ? { r, ...p } : null;
  });
  const archP = vw === 0 ? null : (() => {
    const rel = ARCH_Z - camZ;
    return rel > -1 && rel < MAX_AHEAD ? project(pathXAt(49.99), rel, camZ, vw, vh) : null;
  })();
  const finP = vw === 0 ? null : (() => {
    const rel = FINISH_Z - camZ;
    return rel > 0 && rel < MAX_AHEAD ? project(pathXAt(49.99), rel, camZ, vw, vh) : null;
  })();

  const placeAt = (z: number, side: 1 | -1, lat: number): Projected | null => (vw === 0 ? null : project(pathXAt(z) + side * lat, z - camZ, camZ, vw, vh));

  return (
    <div className="home-map home-map-3d" style={{ fontFamily: "var(--font-body-stack)" }}>
      <div className="relative">
        <div
          ref={boxRef}
          tabIndex={0}
          aria-label="Course map, 3D — scroll to travel the road"
          className="home-map3d-box relative h-[520px] overflow-y-auto overflow-x-hidden rounded-2xl border md:h-[640px]"
          style={{ maxHeight: "68vh", borderColor: "var(--cahier-line-strong)", background: PAPER, boxShadow: "var(--shadow-card)" }}
          onFocusCapture={(e) => {
            // Keyboard focus on a stop travels the camera to it.
            const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cam]");
            if (t) travelTo(Number(t.dataset.cam), false);
          }}
        >
          {/* Spacer = the road's length; the stage sticks and the scene is re-projected. */}
          <div style={{ height: vh + MAX_SCROLL }}>
            <div className="home-map3d-stage sticky top-0 w-full" style={{ height: vh }}>
              {vw > 0 && vh > 0 && (
                <>
                  <PerspectiveBg fluo={fluo} ground={ground} vw={vw} vh={vh} camZ={camZ} hour={hour} />
                  <PathSVG segments={segments} vw={vw} vh={vh} travelledTo={travelledTo} pavedTo={pavedTo} accent={accent ?? "var(--cahier-accent)"} />

                  {/* Trees & bushes */}
                  {NATURE_ITEMS.map((item) => {
                    const p = placeAt(item.z, item.side, item.lat);
                    if (!p) return null;
                    const cW = Math.round(item.size * p.scale * (item.type === "bush" ? 1.6 : 1));
                    const fullH = Math.round(item.size * p.scale * (item.type === "pine" ? 1.75 : item.type === "bush" ? 0.65 : 1.25));
                    return (
                      <div key={item.id} aria-hidden className="absolute" style={{ left: p.px - cW / 2, top: p.py - fullH, zIndex: zOrder(p.scale) - 2 }}>
                        <NatureSprite type={item.type} size={item.size} scale={p.scale} scaleY={p.scaleY} />
                      </div>
                    );
                  })}

                  {/* Roadside props & buildings (Peers' catalogue; the labels teach) */}
                  {ROADSIDE_ITEMS.map((item) => {
                    const p = placeAt(item.z, item.side, item.lat);
                    if (!p) return null;
                    const approxH =
                      item.kind === "B" ? Math.round(item.h * p.scale + item.w * 0.16 * p.scale + 6 * p.scale * p.scaleY + 4) : Math.round(item.size * p.scale * 1.05 + 6);
                    const frontW = item.kind === "B" ? Math.round(item.w * p.scale) : Math.round(item.size * p.scale * 0.9);
                    return (
                      <div key={item.id} aria-hidden className="absolute" style={{ left: p.px - frontW / 2, top: p.py - approxH, zIndex: zOrder(p.scale) - 1 }}>
                        {item.kind === "B" ? <BuildingSprite item={item} scale={p.scale} scaleY={p.scaleY} /> : <PropSprite item={item} scale={p.scale} scaleY={p.scaleY} />}
                      </div>
                    );
                  })}

                  {/* World gate signs: the region icon over a place-name pill (tap = open the unit) */}
                  {gates.map((g) => {
                    if (!g) return null;
                    const { r, px, py, scale } = g;
                    const icon = Math.max(18, Math.round(96 * scale));
                    const inUnit = SIOS.filter((s) => s.unit === r.unit);
                    const done = inUnit.filter((s) => isSioDone(s.id, progress)).length;
                    return (
                      <div key={`gate${r.unit}`} className="absolute flex flex-col items-center" style={{ left: px, top: py, transform: "translate(-50%, -100%)", zIndex: zOrder(scale) + 1 }}>
                        <button
                          type="button"
                          onClick={() => onOpenUnit?.(r.unit)}
                          title={`${UNIT_META[r.unit].label} — ${CHAPTERS[r.unit].scenario} · ${done}/${inUnit.length}`}
                          aria-label={`${r.place} — ${UNIT_META[r.unit].label} · ${done}/${inUnit.length}`}
                          className="flex flex-col items-center"
                        >
                          <span aria-hidden className="block" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>
                            {r.icon(icon)}
                          </span>
                          {scale > 0.2 && (
                            <span
                              className="home-map-pill -mt-0.5 whitespace-nowrap px-3 font-extrabold uppercase"
                              style={{
                                fontSize: Math.max(8, Math.round(13 * scale * 1.4)),
                                lineHeight: 1.6,
                                letterSpacing: "0.08em",
                                background: `var(--region-${r.key})`,
                                color: PAPER,
                                boxShadow: "var(--shadow-card)",
                              }}
                            >
                              {r.place} · {done}/{inUnit.length}
                            </span>
                          )}
                        </button>
                        <span aria-hidden className="rounded-[50%]" style={{ marginTop: 2, width: icon * 0.7, height: Math.max(2, Math.round(icon * 0.08)), background: SHADOW }} />
                      </div>
                    );
                  })}

                  {/* Stops, far → near */}
                  {visibleStops.map(({ i, st, px, py, scale, scaleY, size: sz }) => {
                    const done = isSioDone(st.id, progress);
                    const active = st.id === activeId;
                    const kind = sioKind(st.id);
                    const second = sioSecondary(st.id);
                    const colour = KIND_COLOR[kind];
                    const ahead = i > travelledTo;
                    const flag = st.id === CLASS_FLAG_SIO;
                    const nodeH = Math.round(sz * scaleY);
                    const depthH = Math.max(2, Math.round(sz * 0.18 * scaleY));
                    const baseW = Math.round(sz * 1.14);
                    const baseH = Math.round(baseW * scaleY * 0.38);
                    const totalH = nodeH + depthH;
                    const rim = ahead && !active ? `color-mix(in oklch, ${colour} 45%, var(--cahier-kraft-strong))` : `color-mix(in oklch, ${colour} 78%, black)`;
                    const face = done || active ? colour : PAPER;
                    const ring = Math.max(1.5, Math.round(sz * 0.05));
                    return (
                      <div
                        key={st.id}
                        className="absolute flex flex-col items-center"
                        // the current stop always paints on top — it is the thing to find
                        style={{ left: px - baseW / 2, top: py - totalH / 2, width: baseW, zIndex: active ? 950 : zOrder(scale) }}
                      >
                        {/* 🧑‍🎓 bobs over the current stop; 🚩 marks the class stop */}
                        {active && (
                          <span aria-hidden className="home-map-bob absolute left-1/2 -translate-x-1/2" style={{ top: -Math.max(12, sz * 0.46), fontSize: Math.max(13, sz * 0.4), filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))", zIndex: 2 }}>
                            🧑‍🎓
                          </span>
                        )}
                        {flag && (
                          <span aria-label="The class is here this week" title="The class is here this week" className="absolute left-1/2" style={{ top: -Math.max(10, sz * (active ? 0.8 : 0.42)), fontSize: Math.max(11, sz * 0.34), lineHeight: 1, zIndex: 2 }}>
                            🚩
                          </span>
                        )}
                        <button
                          type="button"
                          data-cam={i}
                          onClick={() => onOpenSio?.(st.unit, st.id)}
                          title={`${st.id} · ${st.topic} (${KIND_LABEL[kind]}${second ? ` + ${KIND_LABEL[second]}` : ""})`}
                          aria-label={`${st.id} · ${st.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                          aria-current={active ? "step" : undefined}
                          className="home-map3d-node relative block"
                          style={{ width: baseW, height: totalH, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          {/* pulsing gold ring — current stop */}
                          {active && (
                            <span
                              aria-hidden
                              className="home-map3d-ring absolute rounded-[50%]"
                              style={{
                                top: -(nodeH * 0.28),
                                left: (baseW - sz) / 2 - nodeH * 0.28,
                                width: sz + nodeH * 0.56,
                                height: nodeH * 1.56,
                                border: `${Math.max(2, Math.round(sz * 0.06))}px solid var(--cahier-gold)`,
                                boxShadow: `0 0 ${Math.max(4, Math.round(sz * 0.3))}px color-mix(in oklch, var(--cahier-gold) 60%, transparent)`,
                              }}
                            />
                          )}
                          {/* kraft base disc */}
                          <span
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 rounded-[50%]"
                            style={{
                              height: Math.max(4, baseH + depthH * 0.7),
                              background: "radial-gradient(ellipse at 50% 30%, var(--cahier-kraft) 0%, var(--cahier-kraft-strong) 60%, color-mix(in oklch, var(--cahier-kraft-strong) 70%, black) 100%)",
                              boxShadow: `0 ${depthH * 0.5}px ${depthH * 1.5}px rgba(0,0,0,0.22)`,
                            }}
                          />
                          {/* side rim */}
                          <span
                            aria-hidden
                            className="absolute rounded-[50%]"
                            style={{ bottom: Math.max(2, baseH * 0.3), left: (baseW - sz) / 2, right: (baseW - sz) / 2, height: nodeH + depthH, background: rim }}
                          />
                          {/* top face */}
                          <span
                            className={`absolute flex items-center justify-center overflow-hidden rounded-[50%] ${active && !reduce ? "home-map3d-pulse" : ""}`}
                            style={{
                              top: 0,
                              left: (baseW - sz) / 2,
                              right: (baseW - sz) / 2,
                              height: nodeH,
                              background: face,
                              border: `${ring}px ${ahead && !active ? "dashed" : "solid"} ${ahead && !active ? colour : "transparent"}`,
                              boxShadow: `inset 0 -${Math.max(1, nodeH * 0.08)}px ${nodeH * 0.15}px rgba(0,0,0,0.22)`,
                            }}
                          >
                            <span aria-hidden className="pointer-events-none absolute rounded-[50%]" style={{ top: "10%", left: "14%", width: "40%", height: "30%", background: "rgba(255,255,255,0.52)", filter: "blur(1px)" }} />
                            <span
                              className="relative font-black leading-none"
                              style={{ fontSize: Math.max(7, sz * (active ? 0.34 : 0.28)), color: done || active ? PAPER : "var(--cahier-ink-faint)", textShadow: done || active ? "0 1px 2px rgba(0,0,0,0.35)" : "0 1px 3px rgba(255,255,255,0.7)", paddingLeft: active ? "0.1em" : 0 }}
                            >
                              {active ? "▶" : done ? "✓" : st.num}
                            </span>
                          </span>
                          {second && nodeH > 10 && (
                            // Secondary focus (sioSecondary): a small dot at the ring's foot.
                            <span
                              aria-hidden
                              className="absolute left-1/2 -translate-x-1/2 rounded-full"
                              style={{ top: nodeH - Math.max(3, sz * 0.1), width: Math.max(5, sz * 0.2), height: Math.max(5, sz * 0.2), background: KIND_COLOR[second], border: `${Math.max(1, sz * 0.025)}px solid ${PAPER}` }}
                            />
                          )}
                        </button>
                        {nodeH > 24 && (
                          <span
                            aria-hidden
                            className="pointer-events-none mt-0.5 whitespace-nowrap rounded px-1 font-bold leading-tight"
                            style={{ fontSize: Math.max(7, sz * 0.16), color: INK, background: "rgba(255,255,255,0.82)" }}
                          >
                            {st.short}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* 🏁 GramMarathon arch — the FINAL */}
                  {archP && (() => {
                    const bw = Math.round(vw * 0.58 * archP.scale);
                    const bh = Math.round(52 * archP.scale);
                    const ph = Math.round(160 * archP.scale);
                    const pw = Math.max(4, Math.round(14 * archP.scale));
                    const pillar: CSSProperties = { position: "absolute", top: archP.py - ph, width: pw, height: ph, background: "linear-gradient(to right, var(--cahier-la), color-mix(in oklch, var(--cahier-la) 70%, white), var(--cahier-la))", borderRadius: Math.round(3 * archP.scale), pointerEvents: "none" };
                    return (
                      <>
                        <div aria-hidden style={{ ...pillar, left: archP.px - bw * 0.52 - pw / 2, zIndex: zOrder(archP.scale) + 5 }} />
                        <div aria-hidden style={{ ...pillar, left: archP.px + bw * 0.52 - pw / 2, zIndex: zOrder(archP.scale) + 5 }} />
                        <Link
                          href="/practice/grammarathon/finale"
                          title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
                          aria-label="GramMarathon Final"
                          className="absolute flex items-center justify-center whitespace-nowrap font-black uppercase"
                          style={{
                            zIndex: zOrder(archP.scale) + 6,
                            left: archP.px - bw / 2,
                            top: archP.py - Math.round(140 * archP.scale),
                            width: bw,
                            height: bh,
                            background: "linear-gradient(135deg, var(--cahier-la) 0%, color-mix(in oklch, var(--cahier-la) 75%, white) 50%, var(--cahier-la) 100%)",
                            borderRadius: Math.round(8 * archP.scale),
                            color: PAPER,
                            fontSize: Math.max(10, Math.round(24 * archP.scale)),
                            letterSpacing: "0.1em",
                            boxShadow: `0 ${Math.round(4 * archP.scale)}px ${Math.round(18 * archP.scale)}px rgba(0,0,0,0.55)`,
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                          }}
                        >
                          🏁 GramMarathon Final
                        </Link>
                      </>
                    );
                  })()}

                  {/* Finishing line */}
                  {finP && (
                    <div
                      aria-hidden
                      className="absolute flex items-center justify-center whitespace-nowrap font-black uppercase"
                      style={{
                        zIndex: zOrder(finP.scale) + 6,
                        left: finP.px - Math.round(vw * 0.52 * finP.scale) / 2,
                        top: finP.py - Math.round(46 * finP.scale),
                        width: Math.round(vw * 0.52 * finP.scale),
                        height: Math.round(40 * finP.scale),
                        background: `repeating-linear-gradient(90deg, white 0px, white 10%, ${INK} 10%, ${INK} 20%)`,
                        borderRadius: Math.round(4 * finP.scale),
                        fontSize: Math.max(9, Math.round(20 * finP.scale)),
                        letterSpacing: "0.12em",
                        color: PAPER,
                        textShadow: `0 1px 4px ${INK}, 0 0 8px ${INK}`,
                        boxShadow: `0 ${Math.round(2 * finP.scale)}px ${Math.round(12 * finP.scale)}px rgba(0,0,0,0.5)`,
                      }}
                    >
                      🏁 {ARENA_PLACE}
                    </div>
                  )}
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
            style={{ borderColor: INK, background: "var(--fluo-hl)" }}
          >
            <span aria-hidden className="text-[10px] font-black" style={{ color: INK }}>
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
