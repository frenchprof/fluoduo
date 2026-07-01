"use client";

/**
 * "Le Cahier" frame — a French spiral-bound exercise-book PAGE resting on a grey
 * desk. Silver ring binding down the page's left gutter; pastel index tabs poke
 * off the page's right edge into the desk (the tabs are the view navigation).
 * On narrow screens the side rail is replaced by a ☰ menu at the top-right.
 * The grey desk space to the right is reserved for a future side panel.
 */

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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

  return (
    <div className="cahier-desk">
      <div className="cahier-deskrow">
        <main className="cahier-page">
          <div className="cahier-binding" aria-hidden />

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
