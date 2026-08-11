"use client";

/**
 * The shared popup chrome for a SIO — used by every unit (Dan, 2026-07-01:
 * "We should adopt what we did for Unit 0 for the Units 1 to 4 too"). Header
 * (id + topic + close) + a body slot; callers decide what goes in the body
 * (pretest questions, statement, MarkDone…).
 *
 * Activity modes ride on FLAP TABS — the same pastel index-tab look as the
 * home page's Unité flaps — poking off the popup's right edge on wide
 * screens, or as a flap row under the header on narrow ones. They are
 * navigation, not body content (Dan: minimalist body). The tab list is
 * deckActivityTabs() (CahierShell.tsx) — current names there: Say It is
 * user-facing "WorDrill" (renamed 2026-07-19); Complete It has no flap of
 * its own, it's the Pratique step's ★★ Intermédiaire on a gapless deck;
 * GramMarathon has its own flap but only on decks with gap-authored items.
 */
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Sio } from "@/content/sios";
import type { Collection } from "@/lib/collections/schema";
import { deckActivityTabs } from "@/components/CahierShell";
import AuthGate from "@/components/AuthGate";

// Level-2 activities float INSIDE this popup (Dan, 2026-07-05: "can i ask for
// level 2 to be all floating like the SIOs pretest") — the unit page stays
// visible behind. Loaded lazily so unit pages don't bundle every activity.
const SayItContent = dynamic(() => import("@/app/practice/say-it/[collectionId]/SayItContent"));
const CompleteItContent = dynamic(() => import("@/app/practice/complete-it/[collectionId]/CompleteItContent"));
const DicePractice = dynamic(() => import("@/app/practice/dice/[collectionId]/PracticeContent"));
const GramMarathonContent = dynamic(() => import("@/app/practice/grammarathon/[collectionId]/GramMarathonContent"));

/** Activity keys that render inside the popup; the rest navigate out.
 *  "lesson" left this set with patch 22 — the lesson is the full-screen card
 *  pager now, so its flap navigates like any non-embeddable activity. */
const EMBEDDABLE = new Set(["say", "complete", "dice", "grammarathon"]);

export type PopupTab = { key: string; label: string; emoji: string; href?: string; active?: boolean; hint?: string };

const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

/**
 * The popup renders EXACTLY the deck's unified activity list
 * (deckActivityTabs — same set the activity pages' rail shows, so leaving
 * via a flap never changes the flaps). The Pre-Test flap becomes the ACTIVE
 * (current-view) flap when the pretest questions render inline in this
 * popup's body; a pretest with no deck still gets its lone flap.
 */
export function popupActivityTabs(
  deck?: Collection,
  pretest?: { inline: boolean; href: string | null },
): PopupTab[] | undefined {
  const base: PopupTab[] = deck
    ? deckActivityTabs(deck.id).map((t) => ({ key: t.key, label: t.label, emoji: t.emoji ?? "", href: t.href, hint: t.hint }))
    : [];
  if (pretest && (pretest.inline || pretest.href)) {
    const tab: PopupTab = pretest.inline
      ? { key: "pretest", label: "Pre-Test", emoji: "🧪", active: true, hint: "try it first" }
      : { key: "pretest", label: "Pre-Test", emoji: "🧪", href: pretest.href ?? undefined, hint: "try it first" };
    const i = base.findIndex((t) => t.key === "pretest");
    if (i >= 0) base[i] = tab;
    else base.unshift(tab);
  }
  return base.length ? base : undefined;
}

function Flap({
  tab,
  hue,
  className,
  active,
  onSelect,
}: {
  tab: PopupTab;
  hue: string;
  className?: string;
  /** Overrides tab.active — the popup's current in-body view. */
  active?: boolean;
  /** When set, this flap switches the popup's body instead of navigating. */
  onSelect?: () => void;
}) {
  const style = { "--tab-hue": hue } as CSSProperties;
  const body = (
    <>
      <span aria-hidden>{tab.emoji}</span>
      <span className={tab.hint ? "cahier-tab-text" : undefined}>
        <span>{tab.label}</span>
        {tab.hint && <span className="cahier-tab-hint">{tab.hint}</span>}
      </span>
    </>
  );
  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} data-active={active || undefined}
        className={`cahier-tab ${className ?? ""}`} style={style}>
        {body}
      </button>
    );
  }
  if (!tab.href) {
    // No href = the current view (e.g. Pre-Test while its questions show in
    // the body) — every other flap always links somewhere.
    return (
      <span data-active={active !== false || undefined} className={`cahier-tab cursor-default ${className ?? ""}`} style={style}>
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
  deck,
  children,
}: {
  sio: Sio;
  onClose: () => void;
  tabs?: PopupTab[];
  /** When given, embeddable activity flaps switch the popup body in place —
   *  level 2 floats above the unit page instead of navigating away. */
  deck?: Collection;
  children: ReactNode;
}) {
  const hueOf = (i: number) => TAB_HUES[i % TAB_HUES.length];
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState("main");

  const embeds: Record<string, ReactNode> = deck
    ? {
        say: <SayItContent collectionId={deck.id} embedded />,
        complete: <CompleteItContent collectionId={deck.id} embedded />,
        dice: <DicePractice collectionId={deck.id} embedded />,
        grammarathon: <GramMarathonContent collectionId={deck.id} embedded />,
      }
    : {};
  const flapProps = (t: PopupTab) => {
    if (deck && EMBEDDABLE.has(t.key) && embeds[t.key]) {
      return { active: view === t.key, onSelect: () => setView(t.key) };
    }
    if (t.key === "pretest" && !t.href) {
      // The inline pretest lives in the main body — its flap returns there.
      return { active: view === "main", onSelect: () => setView("main") };
    }
    return { active: view === "main" ? undefined : false };
  };

  // Dialog keyboard basics: Escape closes; focus starts on the ✕ so keyboard
  // and screen-reader users land inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ~120 lines of chrome left here on 2026-08-10 (patch 20–21): drag-resize
  // (◢ grip + pointer capture), a persisted panel size, an auto-widen on
  // leaving the main view, and the ⤢ full-page escape hatch. All of it was
  // compensation for holding a drill inside a container that shouldn't hold
  // one — the /practice/* routes now render drills full-screen in
  // DrillShell, and the popup that remains is a fixed-size SIO card.

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-w-full items-start" onClick={(e) => e.stopPropagation()}>
        <div className="relative max-w-full">
        <div
          className="overflow-auto rounded-2xl border-2 bg-[var(--fluo-card)] p-5"
          style={{
            borderColor: "var(--fluo-card-accent)",
            width: view === "main" ? "32rem" : "52rem",
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
            <div className="flex items-center gap-1.5">
              <button ref={closeRef} type="button" onClick={onClose} className="fluo-btn fluo-btn-sm" aria-label="Close">
                ✕
              </button>
            </div>
          </div>
          {/* narrow screens: the flaps as a row under the header */}
          {tabs && tabs.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5 sm:hidden">
              {tabs.map((t, i) => (
                <Flap key={t.key} tab={t} hue={hueOf(i)} className="!rounded-md !px-2 !py-1 text-xs" {...flapProps(t)} />
              ))}
            </div>
          )}
          {view === "main" || !embeds[view] ? children : (
            <AuthGate what="practice" compact>{embeds[view]}</AuthGate>
          )}
        </div>
        </div>
        {/* wide screens: flaps poke off the popup's right edge, home-page style */}
        {tabs && tabs.length > 0 && (
          <nav className="mt-14 hidden shrink-0 flex-col gap-2 sm:flex" aria-label="Practice activities">
            {tabs.map((t, i) => (
              <Flap key={t.key} tab={t} hue={hueOf(i)} {...flapProps(t)} />
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
