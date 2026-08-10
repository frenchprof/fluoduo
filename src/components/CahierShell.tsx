"use client";

/**
 * Shared "Le Cahier" page chrome — the same ring-bound-notebook look as Flip
 * It's CahierFrame (grey desk, ruled paper page, spiral binding down the left
 * gutter, pastel index tabs off the right edge), but the tabs here are LINKS
 * between pages rather than view switches. Below 900px the tab rail
 * collapses into the ☰ menu in the top bar (same .cahier-tabs / .cahier-menu
 * breakpoint CSS that CahierFrame uses).
 *
 * A tab without an href (typically the active page) renders as a static flap.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** Below this the flap rail is hidden. Was 1100, which left every iPad and
 *  every half-width laptop window with NO navigation but the burger.
 *  Keep in sync with the media query in globals.css. */
const RAIL_MIN_PX = 900;
import GuideSplash from "@/components/GuideSplash";
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";

const PAGE_WIDTH_KEY = "fluolingo:pageWidth";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { isSpecuLearnReady } from "@/lib/collections/speculearnReady";
import { hasMatching } from "@/lib/collections/loadCollections";
import { CURATED } from "@/content/collections";
import { lessonsForDeck } from "@/content/lessons";
import { supplementsForDeck, type Supplement } from "@/content/supplements";
import { auth } from "@/lib/firebase/client";
import { logEvent } from "@/lib/firebase/usage";
import { siteTabs, toolTabs, tabsWithActive } from "@/components/siteTabs";
import { SIOS } from "@/content/sios";
import { getPretestForSio } from "@/content/pretests";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { getLetrisSet } from "@/games/letris/sets";
import { composeBankForDeck } from "@/games/compose/banks";
import FirstTour from "@/components/FirstTour";
import AccountButton from "@/components/AccountButton";
import SearchOverlay from "@/components/SearchOverlay";
import RankingOverlay from "@/components/RankingOverlay";
import SoundControl from "@/components/SoundControl";
import { isPlayableGap } from "@/lib/collections/gapSentence";
import { activity } from "@/content/activities";
import { toPracticeSet } from "@/lib/practice/engine";
import BottomBar from "@/components/BottomBar";

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
  /** Tiny action verb under the name ("browse the cards") — activity names
   *  alone don't tell a first-timer how Flip It differs from Lesson (Dan,
   *  2026-07-05). Navigation text: it points at the right door, so it
   *  survives the litmus rule. */
  hint?: string;
  /** Extra click work (e.g. visit telemetry) — runs before navigation. */
  onClick?: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
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
      <span className={tab.hint ? "cahier-tab-text" : undefined}>
        {/* ALWAYS classed (2026-08-10): a bare span gave the 640-900
            icons-only rail nothing to hide once patch 17 removed the
            hints. Structure the CSS can address, not incidental markup. */}
        <span className="cahier-tab-label">{tab.label}</span>
        {tab.hint && <span className="cahier-tab-hint">{tab.hint}</span>}
      </span>
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
    <Link
      href={tab.href}
      data-active={active}
      className={className}
      style={style}
      onClick={(e) => {
        tab.onClick?.(e);
        onNavigate?.();
      }}
    >
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
  /** Page-context flaps (a deck's activities, Teacher, …). The two site
   *  tiers (Unités on top; QuickGuide + Index/WorDrill/SpecuLearn/tools as
   *  thin flaps below — Dan, 2026-07-15) are ALWAYS rendered above them —
   *  the flap rail must never "randomly disappear" (Dan, 2026-07-05). */
  tabs?: ShellTab[];
  active: string;
  crumb?: ReactNode; // small label on the top bar's right side
  topRight?: ReactNode; // extra top-bar content (e.g. a live score)
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Tap-away for the ☰ dropdown (Dan, 2026-07-20): the old full-screen
  // z-40 "catcher" div lost to pages with their own stacking contexts —
  // taps landed on higher-z widgets and the menu stayed open. A
  // capture-phase document listener sees every pointerdown regardless of
  // z-order: anything outside the menu wrapper closes it.
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [menuOpen]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  // The Quick Guide no longer pops up by default (Dan, 2026-07-14) — it
  // opens from the inverted QuickGuide button right after the ❓ flap.
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const hueOf = (t: ShellTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
  const site = tabsWithActive(siteTabs(), active);
  // Everything non-Unité (Index, WorDrill, SpecuLearn, Réviser, …) is the
  // demoted thin tier (Dan, 2026-07-15) — rendered in the rail AND the ☰.
  const tools = tabsWithActive(toolTabs(), active);
  // Pages that pass the site row itself just deduplicate to no context group.
  const context = tabs.filter((t) => !site.some((s) => s.key === t.key) && !tools.some((s) => s.key === t.key));
  // On a deck's activity page, the deck's Unité is the active layer of the
  // site row (Dan, 2026-07-05: "the activated Unité layer is not marked") —
  // highlighted but still clickable.
  const deckId = context.map((t) => t.href?.match(/^\/practice\/[a-z-]+\/([^/#?]+)/)?.[1]).find(Boolean);
  const deckUnit = deckId ? CURATED.find((c) => c.id === deckId)?.unit : undefined;
  const unitKey = deckUnit === undefined ? undefined : `unit-${deckUnit}`;
  const isActiveFlap = (t: ShellTab) => active === t.key || t.key === unitKey;

  // Per-page browser-tab title (audit 2026-07-19: every page announced
  // itself as just "FluOlinGo" — tabs, history, bookmarks and screen-reader
  // page announcements were indistinguishable). The active flap's label IS
  // the page's name; deck/context pages fall back to their first context
  // flap, then to a string crumb. Home (no matching flap) keeps the default.
  const pageLabel =
    [...site, ...tools, ...context].find((t) => t.key === active)?.label ??
    context[0]?.label ??
    (typeof crumb === "string" ? crumb : undefined);
  useEffect(() => {
    document.title = pageLabel ? `${pageLabel} · FluOlinGo` : "FluOlinGo";
  }, [pageLabel]);

  const nested = context.length > 0;

  // Every page's right edge is drag-widenable (Dan, 2026-07-05: "all the
  // pages should have their own draggable right edge") — resizes the outer
  // sheet (the stack on nested pages), persisted site-wide.
  const outerRef = useRef<HTMLElement | null>(null);
  // The saved page-width only applies where the tab rail actually shows (wide
  // screens ≥900px). Below that the rail is hidden, so a saved desktop width
  // would leave the page short of full-width with wasted grey on the right
  // (Dan, 2026-07-05: "it was spanning the full screen width"). On mobile we
  // clear the inline basis so the page fills the screen; re-apply on resize.
  useEffect(() => {
    const apply = () => {
      const el = outerRef.current;
      if (!el) return;
      if (window.innerWidth < RAIL_MIN_PX) { el.style.flexBasis = ""; return; }
      try {
        const w = parseInt(window.localStorage.getItem(PAGE_WIDTH_KEY) ?? "", 10);
        el.style.flexBasis = w ? `${Math.min(w, window.innerWidth - 150)}px` : "";
      } catch {}
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  // Accidental shrink rescue (Dan, 2026-07-15 screenshot): on a phone the
  // drag edge is easy to grab without noticing, leaving the page stuck
  // narrow with unexplained grey desk. When that state is detected (no tab
  // rail on screen, page well short of the viewport) a pulsing ⤢ arrow
  // floats in the gap — tap it, or double-tap the grey space, to expand
  // back to full width.
  const [shrunk, setShrunk] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = outerRef.current;
      setShrunk(!!el && window.innerWidth < RAIL_MIN_PX && el.offsetWidth < window.innerWidth - 60);
    };
    check();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    if (ro && outerRef.current) ro.observe(outerRef.current);
    window.addEventListener("resize", check);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);
  const expandFull = () => {
    const el = outerRef.current;
    if (el) el.style.flexBasis = "";
    try { window.localStorage.removeItem(PAGE_WIDTH_KEY); } catch {}
    setShrunk(false);
  };

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
            <div className={`flex items-center justify-between gap-2 py-3 pr-3 sm:pr-5 ${nested ? "pl-5 sm:pl-7" : "pl-9 sm:pl-16"}`}>
              {/* The wordmark is ALWAYS a door home (Dan, 2026-07-25) — on
                  the home page it simply arrives where you already are. */}
              <Link href="/" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
                {active !== "home" && <>← </>}<span className="cahier-hl">FluOlinGo</span>
              </Link>
              <div className="cahier-topbar flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Icon strip, macOS-menu-bar style (Dan, 2026-07-08): 🔍 opens
                    the floating search, 🏆 floats the ranking, 🏠 goes home —
                    icons only, no words. */}
                <button
                  type="button"
                  aria-label="Rechercher un mot"
                  title="Rechercher un mot · Search a word"
                  onClick={() => setSearchOpen(true)}
                  className="cahier-btn cahier-btn-sm"
                >
                  🔍
                </button>
                <button
                  type="button"
                  aria-label="Classement"
                  title="Classement · Leaderboard"
                  onClick={() => setRankingOpen(true)}
                  className="cahier-btn cahier-btn-sm"
                >
                  🏆
                </button>
                <SoundControl />
                {/* 🏠 and the crumb yield below sm — the ← FluOlinGo link is
                    the home door there, and they were pushing the ☰ off a
                    phone screen (Dan, 2026-07-15). */}
                {/* !important — .cahier-btn's own display rule beats a bare
                    `hidden` utility. */}
                <Link href="/" aria-label="Home" title="Home" className="cahier-btn cahier-btn-sm !hidden sm:!inline-flex">
                  🏠
                </Link>
                {/* ⌛ My learning history — always visible (Dan, 2026-07-25).
                    The crumb text retired to make its room: the page name
                    between 🏠 and the avatar was the least-load-bearing
                    element on the bar. */}
                <Link href="/moi" aria-label="My learning history" title="My learning history" className="cahier-btn cahier-btn-sm">
                  ⌛
                </Link>
                {topRight}
                <AccountButton />
                {/* Half-a-button inward on mobile (Dan, 2026-07-25: the corner made ☰
                    unreachable on some phones); flush again from sm up. */}
                <div ref={menuRef} className="cahier-menu relative mr-5 sm:mr-0">
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
                    // max-h + scroll: with the tools group the list outgrows
                    // small screens and items were cut off (Dan, 2026-07-08).
                    <div className="absolute right-0 top-full z-50 mt-1 flex max-h-[75vh] w-48 flex-col gap-1 overflow-y-auto rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
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
                      <hr className="my-0.5 border-[color:var(--cahier-ink)]/15" />
                      <button
                        key="quickguide"
                        type="button"
                        onClick={() => { setQuickGuideOpen(true); setMenuOpen(false); }}
                        className="cahier-tab cahier-tab--sm !rounded-md text-left font-black"
                        style={{ background: "var(--cahier-ink)", borderColor: "var(--cahier-ink)", color: "#d4f24c" }}
                      >
                        <span aria-hidden>❓</span> HELP!
                      </button>
                      {tools.map((t, i) => (
                        <TabFlap
                          key={t.key}
                          tab={t}
                          hue={hueOf(t, i)}
                          active={active === t.key}
                          className="cahier-tab cahier-tab--sm !rounded-md text-left"
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
          {/* Phone navigation. Nested shells (SioModal) must not draw a
              second one on top of the page's own. */}
          {!nested && <BottomBar />}
        </main>
  );

  return (
    <div className="cahier-desk">
      <div
        className="cahier-deskrow"
        onDoubleClick={(e) => {
          // Only the grey desk itself — not clicks bubbling up from the page.
          if (e.target === e.currentTarget) expandFull();
        }}
      >
        {nested ? (
          <div ref={(el) => { outerRef.current = el; }} className="cahier-stack min-h-screen">
            <div className="cahier-binding" aria-hidden />
            {page}
            {edgeGrip}
          </div>
        ) : (
          page
        )}

        {shrunk && (
          <button
            type="button"
            onClick={expandFull}
            aria-label="Agrandir la page · Expand to full width"
            title="Tap (or double-tap the grey space) to expand the page"
            className="fixed right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] bg-white text-xl text-[color:var(--cahier-ink)] shadow-lg"
          >
            <span aria-hidden>⤢</span>
          </button>
        )}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        {rankingOpen && <RankingOverlay onClose={() => setRankingOpen(false)} />}
        {quickGuideOpen && <GuideSplash onClose={() => setQuickGuideOpen(false)} />}
        <nav className="cahier-tabs" aria-label="Pages">
          {/* TOP tier: Unités only (Dan, 2026-07-15) — Home's doors are the
              top-left FluOlinGo link and the 🏠 icon. */}
          {site.map((t, i) => (
            <TabFlap
              key={t.key}
              tab={t}
              hue={hueOf(t, i)}
              active={isActiveFlap(t)}
              className={`cahier-tab ${context.length > 0 ? "cahier-tab--back1" : ""}`}
            />
          ))}
          {/* LOWER tier (Dan, 2026-07-15: everything non-Unité, thin so ALL
              of them fit): QuickGuide keeps its inverted colors, then Index,
              WorDrill, SpecuLearn and the tools. */}
          <span aria-hidden className="h-3" />
          <button
            key="quickguide"
            type="button"
            onClick={() => setQuickGuideOpen(true)}
            className="cahier-tab cahier-tab--xs font-black"
            style={{ background: "var(--cahier-ink)", borderColor: "var(--cahier-ink)", color: "#d4f24c" }}
          >
            <span aria-hidden>❓</span> HELP!
          </button>
          {tools.map((t, i) => (
            <TabFlap key={t.key} tab={t} hue={hueOf(t, i)} active={active === t.key} className="cahier-tab cahier-tab--xs" />
          ))}
          {context.length > 0 && <span aria-hidden className="h-3" />}
          {context.map((t, i) => (
            <TabFlap key={t.key} tab={t} hue={hueOf(t, i)} active={active === t.key} className="cahier-tab cahier-tab--sm" />
          ))}
        </nav>
        <FirstTour />
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

/** Visit telemetry for supplement pages (Dan, 2026-07-13: "who went into
 *  these pages"). Supplements are standalone HTML OUTSIDE the app, so the
 *  visit is recorded here at the door — and because a same-tab navigation
 *  unloads the app (cancelling an in-flight Firestore write), navigation is
 *  held until the write lands or 600 ms passes, whichever is first. Modified
 *  clicks (⌘/ctrl → new tab) keep the app alive, so they just log. */
function trackSupplementOpen(
  e: ReactMouseEvent<HTMLAnchorElement>,
  deck: string,
  sup: Supplement,
): void {
  if (!auth.currentUser) return; // logEvent would no-op; don't delay navigation
  const done = logEvent("supplement.open", {
    deck, key: sup.key, label: sup.label, href: sup.href,
  });
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const go = () => window.location.assign(sup.href);
  void Promise.race([done, new Promise((r) => setTimeout(r, 600))]).then(go, go);
}

/** THE deck activity list — popup flaps and page rails both render exactly
 *  this set (Dan, 2026-07-05: leaving via a flap must show the same flaps).
 *  Conditional tabs appear only where their readiness predicate passes. */
/**
 * One name, one emoji, one hue per activity — from `src/content/activities.ts`.
 *
 * The deck flaps used to spell things their own way: "Lesson" here and
 * "xPlain" in the rail, "Flip It" here and "4Mémoire" there, "Compose It" here
 * and "ComposeIt" there. Same activity, two names, two surfaces. Now a rename
 * happens in the registry or it does not happen.
 *
 * No `hint`. Twelve subtitles, eight of which truncated (Dan, 2026-08-10:
 * "way too many words"). The text lives on as `blurb` for HELP, where there is
 * room for it.
 */
function registryTab(key: string, href: string): ShellTab {
  const a = activity(key);
  return { key, label: a?.name ?? key, emoji: a?.emoji ?? "", href, hue: a?.hue };
}

export function deckActivityTabs(collectionId: string): ShellTab[] {
  const lessons = lessonsForDeck(collectionId);
  const pretestHref = pretestHrefForDeck(collectionId);
  const rainSet = getLetrisSet(collectionId.replace("-letris", ""));
  const composeBank = composeBankForDeck(collectionId);
  const curatedDeck = CURATED.find((c) => c.id === collectionId);
  return [
    ...(pretestHref
      ? [{ key: "pretest", label: "Pre-Test", emoji: "🧪", href: pretestHref } as ShellTab]
      : []),
    // Guess-first activity (Dan, 2026-07-14: native page, "not a
    // supplement") — photos for aliments, emoji everywhere else.
    ...(isSpecuLearnReady(collectionId)
      ? [registryTab("speculearn", `/practice/speculearn/${collectionId}`)]
      : []),
    // PRE-lesson supplements (standalone HTML outside the app) — none right
    // now; the plumbing (incl. visit tracking) stays for future material.
    ...supplementsForDeck(collectionId).map((sup) => ({
      key: sup.key, label: sup.label, emoji: sup.emoji, href: sup.href, hint: sup.hint,
      onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => trackSupplementOpen(e, collectionId, sup),
    }) as ShellTab),
    // Canonical app order (Dan, 2026-07-19): SpecuLearn-PreTest → Lesson +
    // Flip-It (the core of each SIO) → … → Composer. EVERY deck has a Lesson
    // since the unification folded Complete It and DicedPractice's own
    // sub-drills into one "Pratique" step (Lire → Pratique → Générateur) —
    // Complete It has no flap of its own now, it's just Pratique's ★★
    // Intermédiaire level on a gapless deck. GramMarathon was NOT absorbed:
    // it kept (and later regained, 2026-07-22) its own flap below, gated to
    // decks with gap-authored items.
    registryTab("lesson", lessons.length > 0 ? `/lessons/${lessons[0].slug}` : `/lessons/deck/${collectionId}`),
    // EtuDice and iComplete, back after the 2026-07-19 unification orphaned
    // them. Placed here so the row reads as FluOlin Goals' own sequence:
    // xPlain -> EtuDice -> 4Memoire -> iComplete.
    //
    // EtuDice is gated exactly like VocabulaRain and GramMarathon: only the 21
    // of 44 decks with >=2 letris columns can build a practice set, and on the
    // rest /practice/dice/[id] renders "No dice practice for this deck yet".
    // An absent flap beats a dead end -- and a rail slot could not be gated at
    // all, which is why it is here and not in the rail.
    ...(curatedDeck && toPracticeSet(curatedDeck)
      ? [registryTab("dice", `/practice/dice/${collectionId}`)]
      : []),
    registryTab("complete", `/practice/complete-it/${collectionId}`),
    registryTab("flip", `/practice/flip-it/${collectionId}`),
    ...(rainSet
      ? [registryTab("vocabularain", `/games/vocabularain/${collectionId.replace("-letris", "")}`)]
      : []),
    ...(isLexReadyId(collectionId)
      ? [registryTab("lexicalator", `/games/lexicalater/${collectionId}`)]
      : []),
    // Formerly reachable only through the Decks browser, and only for one
    // hardcoded deck id (directions-matching) — hasMatching() was already
    // generic, the restriction wasn't real (Dan, 2026-08-02 Decks→Flip It
    // merge). Every deck with matching pairs authored gets this flap now.
    ...(curatedDeck && hasMatching(curatedDeck)
      ? [{ key: "matching", label: "Match It", emoji: "🔗", href: `/games/matching/${collectionId}` } as ShellTab]
      : []),
    ...(composeBank
      ? [registryTab("compose", `/games/compose/${composeBank.id}`)]
      : []),
    // Resurrected as a NAMED activity (Dan, 2026-07-22) — the per-deck typed
    // sprint, distinct from the Final's authored bank. Only for decks whose
    // items carry gaps, so the marathon is never empty.
    ...(curatedDeck?.items?.some(isPlayableGap)
      ? [registryTab("grammarathon", `/practice/grammarathon/${collectionId}`)]
      : []),
    // né « Say It » — renamed WorDrill (Dan, 2026-07-19); key stays "say" so
    // SioModal embedding and withActive callers keep working.
    { ...registryTab("wordrill", `/practice/say-it/${collectionId}`), key: "say" },
  ];
}

/** Mark one tab as the current page: drops its href so it renders as a static flap. */
export function withActive(tabs: ShellTab[], activeKey: string): ShellTab[] {
  return tabs.map((t) => (t.key === activeKey ? { ...t, href: undefined } : t));
}
