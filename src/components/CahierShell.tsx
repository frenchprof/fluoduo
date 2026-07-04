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

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { isConjugaZoneReadyId } from "@/lib/collections/conjugaZoneReady";
import { isGramMarathonReadyId } from "@/lib/collections/gramMarathonReady";
import { CURATED } from "@/content/collections";
import { lessonsForDeck } from "@/content/lessons";

/** Dice Practice is an MCQ over the deck's letris columns — no columns, no game. */
export function hasDicePractice(collectionId: string): boolean {
  return !!CURATED.find((c) => c.id === collectionId)?.gameConfig?.letris;
}

/** Decks with a multi-step UNIT page beyond the standard activities (the
 *  adopted weather and directions units — content that exists nowhere else). */
export const UNIT_PAGES: Record<string, { label: string; emoji: string; href: string }> = {
  "weather-letris": { label: "Weather Unit", emoji: "🌦️", href: "/games/weather" },
  "directions-matching": { label: "Directions Unit", emoji: "🧭", href: "/games/directions" },
};

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
      <span data-active={active} className={className} style={style}>
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
  tabs,
  active,
  crumb,
  topRight,
  children,
}: {
  tabs: ShellTab[];
  active: string;
  crumb?: ReactNode; // small label on the top bar's right side
  topRight?: ReactNode; // extra top-bar content (e.g. a live score)
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hueOf = (t: ShellTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];

  return (
    <div className="cahier-desk">
      <div className="cahier-deskrow">
        <main className="cahier-page min-h-screen">
          <div className="cahier-binding" aria-hidden />

          <div className="sticky top-0 z-10 border-b-2 border-[color:var(--cahier-ink)]/15 bg-[color:var(--cahier-paper)]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-2 py-3 pl-12 pr-3 sm:pl-16 sm:pr-5">
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
                    <div className="absolute right-0 top-full z-50 mt-1 flex w-44 flex-col gap-1 rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
                      {tabs.map((t, i) => (
                        <TabFlap
                          key={t.key}
                          tab={t}
                          hue={hueOf(t, i)}
                          active={active === t.key}
                          className="cahier-tab !rounded-md text-left"
                          onNavigate={() => setMenuOpen(false)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 pl-12 pr-4 sm:pl-16 sm:pr-7">{children}</div>
        </main>

        <nav className="cahier-tabs" aria-label="Pages">
          {tabs.map((t, i) => (
            <TabFlap key={t.key} tab={t} hue={hueOf(t, i)} active={active === t.key} className="cahier-tab" />
          ))}
        </nav>
      </div>
    </div>
  );
}

/** Tab set for a deck's activity pages — Flip It / Say It / dice Practice / Lexicalator.
 *  The Lexicalator tab appears only where the deck is hand-syllabified (no old-game
 *  fallback anymore). */
export function deckActivityTabs(collectionId: string): ShellTab[] {
  const lessons = lessonsForDeck(collectionId);
  return [
    // The lesson leads its SIO's flow — Receive before Integrate.
    ...(lessons.length > 0
      ? [{ key: "lesson", label: "Lesson", emoji: "📚", href: `/lessons/${lessons[0].slug}` } as ShellTab]
      : []),
    { key: "flip", label: "Flip It", emoji: "🃏", href: `/practice/flip-it/${collectionId}` },
    { key: "say", label: "Say It", emoji: "🎤", href: `/practice/say-it/${collectionId}` },
    { key: "complete", label: "Complete It", emoji: "✏️", href: `/practice/complete-it/${collectionId}` },
    ...(hasDicePractice(collectionId)
      ? [{ key: "dice", label: "Practice", emoji: "🎲", href: `/practice/dice/${collectionId}` } as ShellTab]
      : []),
    ...(isConjugaZoneReadyId(collectionId)
      ? [{ key: "conjugazone", label: "ConjugaZone", emoji: "🎯", href: `/practice/conjugazone/${collectionId}` } as ShellTab]
      : []),
    ...(isGramMarathonReadyId(collectionId)
      ? [{ key: "grammarathon", label: "GramMarathon", emoji: "🏃", href: `/practice/grammarathon/${collectionId}` } as ShellTab]
      : []),
    ...(isLexReadyId(collectionId)
      ? [{ key: "match", label: "Lexicalator", emoji: "🧰", href: `/games/conveyor/${collectionId}` } as ShellTab]
      : []),
    ...(UNIT_PAGES[collectionId]
      ? [{ key: "unit", ...UNIT_PAGES[collectionId] } as ShellTab]
      : []),
  ];
}

/** Mark one tab as the current page: drops its href so it renders as a static flap. */
export function withActive(tabs: ShellTab[], activeKey: string): ShellTab[] {
  return tabs.map((t) => (t.key === activeKey ? { ...t, href: undefined } : t));
}
