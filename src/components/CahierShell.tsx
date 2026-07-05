"use client";

/**
 * Shared "Le Cahier" page chrome — the same ring-bound-notebook look as Flip
 * It's CahierFrame (grey desk, ruled paper page, spiral binding down the left
 * gutter, pastel index tabs off the right edge), but the tabs here are LINKS
 * between pages rather than view switches. Below 1100px the tab rail
 * collapses into the ☰ menu in the top bar (same .cahier-tabs / .cahier-menu
 * breakpoint CSS that CahierFrame uses).
 *
 * A tab without an href (typically the active page) renders as a static flap.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const PAGE_WIDTH_KEY = "fluolingo:pageWidth";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { CURATED } from "@/content/collections";
import { lessonsForDeck } from "@/content/lessons";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { SIOS } from "@/content/sios";
import { getPretestForSio } from "@/content/pretests";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { getLetrisSet } from "@/games/letris/sets";
import { composeBankForDeck } from "@/games/compose/banks";

/** Dice Practice is an MCQ over the deck's letris columns — no columns, no game. */
export function hasDicePractice(collectionId: string): boolean {
  return !!CURATED.find((c) => c.id === collectionId)?.gameConfig?.letris;
}

const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

export type ShellTab = {
  key: string;
  label: string;
  href?: string; // omit on the active page's own tab
  emoji?: string;
  hue?: string;
};

function TabFlap({
  tab,
  hue,
  active,
  className,
  onNavigate,
}: {
  tab: ShellTab;
  hue: string;
  active: boolean;
  className: string;
  onNavigate?: () => void;
}) {
  const style = { "--tab-hue": hue } as CSSProperties;
  const body = (
    <>
      {tab.emoji && <span aria-hidden>{tab.emoji}</span>}
      <span>{tab.label}</span>
    </>
  );
  if (!tab.href) {
    return (
      <span data-active={active} aria-current={active ? "page" : undefined} className={className} style={style}>
        {body}
      </span>
    );
  }
  return (
    <Link href={tab.href} data-active={active} className={className} style={style} onClick={onNavigate}>
      {body}
    </Link>
  );
}

export default function CahierShell({
  tabs = [],
  active,
  crumb,
  topRight,
  children,
}: {
  /** Page-context flaps (a deck's activities, Teacher, …). The site row
   *  (Home/Guide/Unités/Index) is ALWAYS rendered above them — the flap rail
   *  must never "randomly disappear" between pages (Dan, 2026-07-05). */
  tabs?: ShellTab[];
  active: string;
  crumb?: ReactNode; // small label on the top bar's right side
  topRight?: ReactNode; // extra top-bar content (e.g. a live score)
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hueOf = (t: ShellTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
  const site = tabsWithActive(siteTabs(), active);
  // Pages that pass the site row itself just deduplicate to no context group.
  const context = tabs.filter((t) => !site.some((s) => s.key === t.key));
  // On a deck's activity page, the deck's Unité is the active layer of the
  // site row (Dan, 2026-07-05: "the activated Unité layer is not marked") —
  // highlighted but still clickable.
  const deckId = context.map((t) => t.href?.match(/^\/practice\/[a-z-]+\/([^/#?]+)/)?.[1]).find(Boolean);
  const deckUnit = deckId ? CURATED.find((c) => c.id === deckId)?.unit : undefined;
  const unitKey = deckUnit === undefined ? undefined : `unit-${deckUnit}`;
  const isActiveFlap = (t: ShellTab) => active === t.key || t.key === unitKey;

  const nested = context.length > 0;

  // Every page's right edge is drag-widenable (Dan, 2026-07-05: "all the
  // pages should have their own draggable right edge") — resizes the outer
  // sheet (the stack on nested pages), persisted site-wide.
  const outerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    try {
      const w = parseInt(window.localStorage.getItem(PAGE_WIDTH_KEY) ?? "", 10);
      if (w && outerRef.current) outerRef.current.style.flexBasis = `${Math.min(w, window.innerWidth - 150)}px`;
    } catch {}
  }, []);
  function startEdgeDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = outerRef.current;
    if (!el) return;
    e.preventDefault();
    const grip = e.currentTarget;
    try { grip.setPointerCapture(e.pointerId); } catch {}
    const sw = el.offsetWidth, sx = e.clientX;
    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      el.style.flexBasis = `${Math.min(Math.max(560, sw + ev.clientX - sx), window.innerWidth - 150)}px`;
    };
    const done = () => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", done);
      grip.removeEventListener("pointercancel", done);
      try { window.localStorage.setItem(PAGE_WIDTH_KEY, String(el.offsetWidth)); } catch {}
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", done);
    grip.addEventListener("pointercancel", done);
  }
  const edgeGrip = (
    <div
      onPointerDown={startEdgeDrag}
      className="absolute bottom-0 right-0 top-0 z-20 w-3 cursor-ew-resize touch-none select-none"
      title="Drag to widen the page"
      aria-hidden
    />
  );

  const page = (
        <main
          ref={(el) => { if (!nested) outerRef.current = el; }}
          className={`cahier-page ${nested ? "min-h-[calc(100vh-18px)]" : "min-h-screen"}`}
        >
          {!nested && <div className="cahier-binding" aria-hidden />}
          {!nested && edgeGrip}

          <div className="sticky top-0 z-10 border-b-2 border-[color:var(--cahier-ink)]/15 bg-[color:var(--cahier-paper)]/90 backdrop-blur">
            <div className={`flex items-center justify-between gap-2 py-3 pr-3 sm:pr-5 ${nested ? "pl-5 sm:pl-7" : "pl-12 sm:pl-16"}`}>
              {active === "home" ? (
                <span className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
                  <span className="cahier-hl">FluoLingo</span> <span aria-hidden>✨</span>
                </span>
              ) : (
                <Link href="/" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
                  ← <span className="cahier-hl">FluoLingo</span>
                </Link>
              )}
              <div className="flex items-center gap-2">
                {crumb && (
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
                    {crumb}
                  </span>
                )}
                {topRight}
                <div className="cahier-menu relative">
                  <button
                    type="button"
                    aria-label="Navigation"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                    className="cahier-btn cahier-btn-sm"
                  >
                    {menuOpen ? "✕" : "☰"}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 flex w-48 flex-col gap-1 rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
                      {site.map((t, i) => (
                        <TabFlap
                          key={t.key}
                          tab={t}
                          hue={hueOf(t, i)}
                          active={isActiveFlap(t)}
                          className="cahier-tab !rounded-md text-left"
                          onNavigate={() => setMenuOpen(false)}
                        />
                      ))}
                      {context.length > 0 && <hr className="my-0.5 border-[color:var(--cahier-ink)]/15" />}
                      {context.map((t, i) => (
                        <TabFlap
                          key={t.key}
                          tab={t}
                          hue={hueOf(t, i)}
                          active={active === t.key}
                          className="cahier-tab cahier-tab--sm !rounded-md text-left"
                          onNavigate={() => setMenuOpen(false)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`py-5 pr-4 sm:pr-7 ${nested ? "pl-5 sm:pl-7" : "pl-12 sm:pl-16"}`}>{children}</div>
        </main>
  );

  return (
    <div className="cahier-desk">
      <div className="cahier-deskrow">
        {nested ? (
          <div ref={(el) => { outerRef.current = el; }} className="cahier-stack min-h-screen">
            <div className="cahier-binding" aria-hidden />
            {page}
            {edgeGrip}
          </div>
        ) : (
          page
        )}

        <nav className="cahier-tabs" aria-label="Pages">
          {site.map((t, i) => (
            <TabFlap
              key={t.key}
              tab={t}
              hue={hueOf(t, i)}
              active={isActiveFlap(t)}
              className={`cahier-tab ${context.length > 0 ? "cahier-tab--back1" : ""}`}
            />
          ))}
          {context.length > 0 && <span aria-hidden className="h-3" />}
          {context.map((t, i) => (
            <TabFlap key={t.key} tab={t} hue={hueOf(t, i)} active={active === t.key} className="cahier-tab cahier-tab--sm" />
          ))}
        </nav>
      </div>
    </div>
  );
}

/** Where this deck's Pre-Test lives: the authored pretest page, or (Unit 0)
 *  the SIO popup whose body carries the questions. Null = no pretest. */
export function pretestHrefForDeck(collectionId: string): string | null {
  const sio = SIOS.find((s) => s.collectionId === collectionId);
  if (!sio) return null;
  const pretest = getPretestForSio(sio.id);
  if (pretest) return `/pretests/${pretest.id}`;
  if ((UNIT0_QUESTIONS[sio.id] ?? []).length > 0) return `/unit/0#${sio.id}`;
  return null;
}

/** THE deck activity list — popup flaps and page rails both render exactly
 *  this set (Dan, 2026-07-05: leaving via a flap must show the same flaps).
 *  Conditional tabs appear only where their readiness predicate passes. */
export function deckActivityTabs(collectionId: string): ShellTab[] {
  const lessons = lessonsForDeck(collectionId);
  const pretestHref = pretestHrefForDeck(collectionId);
  const rainSet = getLetrisSet(collectionId.replace("-letris", ""));
  const composeBank = composeBankForDeck(collectionId);
  return [
    ...(pretestHref
      ? [{ key: "pretest", label: "Pre-Test", emoji: "🧪", href: pretestHref } as ShellTab]
      : []),
    // Learning order (Dan, 2026-07-05): Pre-Test → flashcards → Lesson. EVERY
    // deck has a Lesson since the unification (Lire → Débutant → Intermédiaire
    // → Difficile absorbed Complete It / dice / GramMarathon).
    { key: "flip", label: "Flip It", emoji: "🃏", href: `/practice/flip-it/${collectionId}` },
    {
      key: "lesson",
      label: "Lesson",
      emoji: "📚",
      href: lessons.length > 0 ? `/lessons/${lessons[0].slug}` : `/lessons/deck/${collectionId}`,
    },
    { key: "say", label: "Say It", emoji: "🎤", href: `/practice/say-it/${collectionId}` },
    ...(isLexReadyId(collectionId)
      ? [{ key: "match", label: "Lexicalator", emoji: "🧰", href: `/games/conveyor/${collectionId}` } as ShellTab]
      : []),
    ...(rainSet
      ? [{ key: "rain", label: "Vocabularain", emoji: "🌧️", href: `/games/letris/${collectionId.replace("-letris", "")}` } as ShellTab]
      : []),
    ...(composeBank
      ? [{ key: "compose", label: "Compose It", emoji: "🧩", href: `/games/compose/${composeBank.id}` } as ShellTab]
      : []),
  ];
}

/** Mark one tab as the current page: drops its href so it renders as a static flap. */
export function withActive(tabs: ShellTab[], activeKey: string): ShellTab[] {
  return tabs.map((t) => (t.key === activeKey ? { ...t, href: undefined } : t));
}
