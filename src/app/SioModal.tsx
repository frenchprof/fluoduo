"use client";

/**
 * The shared popup chrome for a SIO — used by every unit (Dan, 2026-07-01:
 * "We should adopt what we did for Unit 0 for the Units 1 to 4 too"). Header
 * (id + topic + close) + a body slot; callers decide what goes in the body
 * (pretest questions, statement, MarkDone…).
 *
 * Activity modes (Flip It / Say It / Complete It / Lexicalator /
 * Vocabularain) ride on FLAP TABS — the same pastel index-tab look as the
 * home page's Unité flaps — poking off the popup's right edge on wide
 * screens, or as a flap row under the header on narrow ones. They are
 * navigation, not body content (Dan: minimalist body).
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Sio } from "@/content/sios";
import type { Collection } from "@/lib/collections/schema";

const SIZE_KEY = "fluolingo:popupSize";

export type PopupTab = { key: string; label: string; emoji: string; href?: string; active?: boolean };

const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

/**
 * Pre-Test on top, then the five activity modes. The Pre-Test flap is the
 * ACTIVE (current-view) flap when the pretest questions render inline in the
 * popup body; otherwise it links out to the pretest surface.
 */
export function popupActivityTabs(
  deck?: Collection,
  pretest?: { inline: boolean; href: string | null },
): PopupTab[] | undefined {
  const pretestTab: PopupTab[] =
    pretest && (pretest.inline || pretest.href)
      ? [{ key: "pretest", label: "Pre-Test", emoji: "🧪", href: pretest.inline ? undefined : pretest.href ?? undefined, active: pretest.inline }]
      : [];
  if (!deck) return pretestTab.length ? pretestTab : undefined;
  const hasLetris = !!deck.gameConfig?.letris;
  return [
    ...pretestTab,
    { key: "flip", label: "Flip It", emoji: "🃏", href: `/practice/flip-it/${deck.id}` },
    { key: "say", label: "Say It", emoji: "🎤", href: `/practice/say-it/${deck.id}` },
    { key: "complete", label: "Complete It", emoji: "✏️" }, // not built yet
    { key: "match", label: "Lexicalator", emoji: "⚙️", href: `/games/conveyor/${deck.id}` },
    ...(hasLetris
      ? [{ key: "rain", label: "Vocabularain", emoji: "🌧️", href: `/games/letris/${deck.id.replace("-letris", "")}` }]
      : []),
  ];
}

function Flap({ tab, hue, className }: { tab: PopupTab; hue: string; className?: string }) {
  const style = { "--tab-hue": hue } as CSSProperties;
  const body = (
    <>
      <span aria-hidden>{tab.emoji}</span>
      <span>{tab.label}</span>
    </>
  );
  if (!tab.href) {
    // Active = the current view (e.g. Pre-Test while its questions show in the
    // body); inactive+no-href = not built yet.
    return (
      <span
        data-active={tab.active || undefined}
        className={`cahier-tab cursor-default ${tab.active ? "" : "opacity-50"} ${className ?? ""}`}
        style={style}
        title={tab.active ? undefined : "Coming soon"}
      >
        {body}
      </span>
    );
  }
  return (
    <Link href={tab.href} className={`cahier-tab ${className ?? ""}`} style={style}>
      {body}
    </Link>
  );
}

export default function SioModal({
  sio,
  onClose,
  tabs,
  children,
}: {
  sio: Sio;
  onClose: () => void;
  tabs?: PopupTab[];
  children: ReactNode;
}) {
  const hueOf = (i: number) => TAB_HUES[i % TAB_HUES.length];
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is user-resizable (drag the bottom-right corner). Widening it
  // lets a question's four options stay on one line; they only wrap when the
  // panel is too narrow (Dan, 2026-07-02). The chosen size persists across
  // popups. Restore/clamp happens post-mount, so SSR stays deterministic.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    try {
      const raw = localStorage.getItem(SIZE_KEY);
      if (raw) {
        const { w, h } = JSON.parse(raw);
        if (w) el.style.width = `${Math.min(w, window.innerWidth * 0.9)}px`;
        if (h) el.style.height = `${Math.min(h, window.innerHeight * 0.88)}px`;
      }
    } catch {}
    const ro = new ResizeObserver(() => {
      try {
        localStorage.setItem(SIZE_KEY, JSON.stringify({ w: el.offsetWidth, h: el.offsetHeight }));
      } catch {}
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-w-full items-start" onClick={(e) => e.stopPropagation()}>
        <div
          ref={panelRef}
          className="resize overflow-auto rounded-2xl border-2 bg-[var(--fluo-card)] p-5"
          style={{
            borderColor: "var(--fluo-card-accent)",
            width: "32rem",
            minWidth: "16rem",
            maxWidth: "90vw",
            minHeight: "10rem",
            maxHeight: "88vh",
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <span className="fluo-mono rounded-md bg-[var(--fluo-card-tint)] px-2 py-0.5 text-xs font-bold text-[color:var(--fluo-ink)]">
                {sio.id}
              </span>
              <h2 className="fluo-readable mt-1 text-xl font-bold text-[color:var(--fluo-ink)]">{sio.topic}</h2>
            </div>
            <button type="button" onClick={onClose} className="fluo-btn fluo-btn-sm" aria-label="Close">
              ✕
            </button>
          </div>
          {/* narrow screens: the flaps as a row under the header */}
          {tabs && tabs.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5 sm:hidden">
              {tabs.map((t, i) => (
                <Flap key={t.key} tab={t} hue={hueOf(i)} className="!rounded-md !px-2 !py-1 text-xs" />
              ))}
            </div>
          )}
          {children}
        </div>
        {/* wide screens: flaps poke off the popup's right edge, home-page style */}
        {tabs && tabs.length > 0 && (
          <nav className="mt-14 hidden shrink-0 flex-col gap-2 sm:flex" aria-label="Practice activities">
            {tabs.map((t, i) => (
              <Flap key={t.key} tab={t} hue={hueOf(i)} />
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
