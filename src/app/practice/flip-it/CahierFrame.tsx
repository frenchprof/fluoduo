"use client";

/**
 * "Le Cahier" frame — a French spiral-bound exercise-book PAGE resting on a grey
 * desk. Silver ring binding down the page's left gutter; pastel index tabs poke
 * off the page's right edge into the desk (the tabs are the view navigation).
 * On narrow screens the side rail is replaced by a ☰ menu at the top-right.
 * The grey desk space to the right is reserved for a future side panel.
 */

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { ShellTab } from "@/components/CahierShell";
import { siteTabs } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";

export const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

export type CahierTab = { key: string; label: string; hue?: string };

/** A nav flap (link) for the rail — site row + deck activities, matching the
 *  CahierShell rail so the flap set never changes between pages. */
function NavFlap({ tab, hue, active, className, onNavigate }: {
  tab: ShellTab; hue: string; active: boolean; className: string; onNavigate?: () => void;
}) {
  const style = { "--tab-hue": tab.hue ?? hue } as CSSProperties;
  const body = (
    <>
      {tab.emoji && <span aria-hidden>{tab.emoji}</span>}
      <span>{tab.label}</span>
    </>
  );
  if (!tab.href) {
    return <span data-active={active} aria-current={active ? "page" : undefined} className={className} style={style}>{body}</span>;
  }
  return <Link href={tab.href} data-active={active} className={className} style={style} onClick={onNavigate}>{body}</Link>;
}

export function CahierFrame({
  tabs,
  active,
  onSelect,
  navTabs = [],
  navActive,
  topBar,
  children,
}: {
  tabs: CahierTab[];
  active: string;
  onSelect: (key: string) => void;
  /** Deck-activity link flaps shown between the site row and the view flaps. */
  navTabs?: ShellTab[];
  /** Key in navTabs marking THIS page (e.g. "flip"). */
  navActive?: string;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hueOf = (t: CahierTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
  const site = siteTabs();
  // Mark the deck's Unité as the site row's active layer (still clickable).
  const deckId = navTabs.map((t) => t.href?.match(/^\/practice\/[a-z-]+\/([^/#?]+)/)?.[1]).find(Boolean);
  const deckUnit = deckId ? CURATED.find((c) => c.id === deckId)?.unit : undefined;
  const unitKey = deckUnit === undefined ? undefined : `unit-${deckUnit}`;

  return (
    <div className="cahier-desk">
      <div className="cahier-deskrow">
        {/* Real nested sheets: the outer wrapper is the bound notebook page
            (it owns the coils), the middle is the deck layer, the top sheet
            is this view — loose sheets carry no binding of their own. */}
        <div className="cahier-stack min-h-screen">
          <div className="cahier-binding" aria-hidden />
          <div className="cahier-stack--inner min-h-[calc(100vh-18px)]">
        <main className="cahier-page min-h-[calc(100vh-36px)]">

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
              <div className="absolute right-0 mt-1 flex max-h-[70vh] w-48 flex-col gap-1 overflow-y-auto rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
                {site.map((t, i) => (
                  <NavFlap key={t.key} tab={t} hue={TAB_HUES[i % TAB_HUES.length]} active={t.key === unitKey}
                    className="cahier-tab !rounded-md text-left" onNavigate={() => setMenuOpen(false)} />
                ))}
                {navTabs.length > 0 && <hr className="my-0.5 border-[color:var(--cahier-ink)]/15" />}
                {navTabs.map((t, i) => (
                  <NavFlap key={t.key} tab={navActive === t.key ? { ...t, href: undefined } : t}
                    hue={TAB_HUES[i % TAB_HUES.length]} active={navActive === t.key}
                    className="cahier-tab cahier-tab--sm !rounded-md text-left" onNavigate={() => setMenuOpen(false)} />
                ))}
                <hr className="my-0.5 border-[color:var(--cahier-ink)]/15" />
                {tabs.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    data-active={active === t.key}
                    onClick={() => { onSelect(t.key); setMenuOpen(false); }}
                    className="cahier-tab cahier-tab--xs !rounded-md text-left"
                    style={{ "--tab-hue": hueOf(t, i) } as CSSProperties}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {topBar}
          <div className="py-5 pl-5 pr-4 sm:pl-7 sm:pr-7">{children}</div>
        </main>
          </div>
        </div>

        <nav className="cahier-tabs" aria-label="Pages and views">
          {site.map((t, i) => (
            <NavFlap key={t.key} tab={t} hue={TAB_HUES[i % TAB_HUES.length]} active={t.key === unitKey} className="cahier-tab cahier-tab--back2" />
          ))}
          {navTabs.length > 0 && <span aria-hidden className="h-3" />}
          {navTabs.map((t, i) => (
            <NavFlap key={t.key} tab={navActive === t.key ? { ...t, href: undefined } : t}
              hue={TAB_HUES[i % TAB_HUES.length]} active={navActive === t.key} className="cahier-tab cahier-tab--sm cahier-tab--back1" />
          ))}
          <span aria-hidden className="h-3" />
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              data-active={active === t.key}
              onClick={() => onSelect(t.key)}
              className="cahier-tab cahier-tab--xs"
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
