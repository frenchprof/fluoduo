"use client";

/**
 * "Le Cahier" — Flip It's OWN full interface (Dan, 2026-07-05: "can Flip It
 * be given its own entire interface like how VocabulaRain and LexicaLator
 * are"), the way the rain and conveyor games own their worlds. A French
 * spiral-bound exercise book on a warm wooden desk: silver ring binding down
 * the left gutter, pastel index tabs off the right edge switching the VIEWS
 * (Overview / Cards / All Cards). Navigation back out is the ← Back in the
 * top bar — no site/deck rail here, same convention as the games.
 * On narrow screens the side rail is replaced by a ☰ menu at the top-right.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const WIDTH_KEY = "fluolingo:flipWidth";

export const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

export type CahierTab = { key: string; label: string; hue?: string };

export function CahierFrame({
  tabs,
  active,
  onSelect,
  topBar,
  children,
}: {
  tabs: CahierTab[];
  active: string;
  onSelect: (key: string) => void;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hueOf = (t: CahierTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
  const pageRef = useRef<HTMLElement>(null);

  // The notebook is user-widenable: drag the page's right edge (Dan,
  // 2026-07-05). Width persists; restore happens post-mount so SSR stays
  // deterministic.
  useEffect(() => {
    try {
      const w = parseInt(window.localStorage.getItem(WIDTH_KEY) ?? "", 10);
      if (w && pageRef.current) pageRef.current.style.flexBasis = `${Math.min(w, window.innerWidth - 150)}px`;
    } catch {}
  }, []);
  function startEdgeDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = pageRef.current;
    if (!el) return;
    e.preventDefault();
    const grip = e.currentTarget;
    try { grip.setPointerCapture(e.pointerId); } catch {}
    const sw = el.offsetWidth, sx = e.clientX;
    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const w = Math.min(Math.max(560, sw + ev.clientX - sx), window.innerWidth - 150);
      el.style.flexBasis = `${w}px`;
    };
    const done = () => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", done);
      grip.removeEventListener("pointercancel", done);
      try { window.localStorage.setItem(WIDTH_KEY, String(el.offsetWidth)); } catch {}
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", done);
    grip.addEventListener("pointercancel", done);
  }

  return (
    <div className="cahier-desk cahier-desk--flip">
      <div className="cahier-deskrow">
        <main ref={pageRef} className="cahier-page min-h-screen">
          <div className="cahier-binding" aria-hidden />
          {/* Right-edge drag handle: widen the notebook page. */}
          <div
            onPointerDown={startEdgeDrag}
            className="absolute bottom-0 right-0 top-0 z-20 flex w-3 cursor-ew-resize touch-none select-none items-center justify-center"
            title="Drag to widen the page"
            aria-hidden
          >
            <span className="rounded-full bg-[color:var(--cahier-ink)]/25 px-[1.5px] py-2 text-[8px] leading-[5px] text-transparent">
              ⋮
            </span>
          </div>

          {/* narrow-screen ☰ menu (top-right is free — the title sits on the left) */}
          <div className="cahier-menu absolute right-2 top-2 z-20">
            <button
              type="button"
              aria-label="Choose view"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="cahier-btn cahier-btn-sm"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 flex w-40 flex-col gap-1 rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
                {tabs.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    data-active={active === t.key}
                    onClick={() => { onSelect(t.key); setMenuOpen(false); }}
                    className="cahier-tab !rounded-md text-left"
                    style={{ "--tab-hue": hueOf(t, i) } as CSSProperties}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {topBar}
          <div className="py-5 pl-12 pr-4 sm:pl-16 sm:pr-7">{children}</div>
        </main>

        <nav className="cahier-tabs" aria-label="Views">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              data-active={active === t.key}
              onClick={() => onSelect(t.key)}
              className="cahier-tab"
              style={{ "--tab-hue": hueOf(t, i) } as CSSProperties}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
