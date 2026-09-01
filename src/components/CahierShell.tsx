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

/** Below this the flap rail is hidden. Was 1100, which left every iPad and
 *  every half-width laptop window with NO navigation but the burger.
 *  Keep in sync with the media query in globals.css. */
const RAIL_MIN_PX = 900;
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

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
import SiteTopBar from "@/components/SiteTopBar";
import TabFlap, { hueOf, type ShellTab } from "@/components/TabFlap";
import { getPretestForSio } from "@/content/pretests";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { getLetrisSet } from "@/games/letris/sets";
import { composeBanksForDeck } from "@/games/compose/banks";
import FirstTour from "@/components/FirstTour";
import { isPlayableGap } from "@/lib/collections/gapSentence";
import { activity, bandOf, familyOf, familyShort, hubFamily, isReadingSurface } from "@/content/activities";
import { stopForDeck } from "@/lib/stopTag";
import BottomBar from "@/components/BottomBar";
import PageBand from "@/components/PageBand";

/** Sorting is an MCQ over the deck's letris columns — no columns, no game. */
export function hasDicePractice(collectionId: string): boolean {
  return !!CURATED.find((c) => c.id === collectionId)?.gameConfig?.letris;
}

/** The flap shape and its hues moved to TabFlap.tsx on 2026-08-31 so that
  * SiteTopBar could draw flaps without importing this file back. Re-exported
  * because four pages already type their tabs as `CahierShell`'s ShellTab. */
export type { ShellTab };

export default function CahierShell({
  tabs = [],
  active,
  topRight,
  band,
  children,
}: {
  /** Page-context flaps (a deck's activities, Teacher, …). The two site
   *  tiers (Unités on top; QuickGuide + Index/WorDrill/SpecuLearn/tools as
   *  thin flaps below — Dan, 2026-07-15) are ALWAYS rendered above them —
   *  the flap rail must never "randomly disappear" (Dan, 2026-07-05). */
  tabs?: ShellTab[];
  active: string;
  topRight?: ReactNode; // extra top-bar content (e.g. a live score)
  /** The heading band's data slots (sub-line + the one number), or `false`
   *  to suppress the band on a page that draws its own heading. */
  /** `tag` replaced `sub` + `stat` on 1 Sep: the band is ONE LINE now and
   *  carries no number at the end (Dan). See components/PageBand.tsx. */
  band?: { title?: ReactNode; tag?: ReactNode; trailing?: ReactNode } | false;
  children: ReactNode;
}) {
  const site = tabsWithActive(siteTabs(), active);
  // Everything non-Unité (Index, WorDrill, SpecuLearn, Réviser, …) is the
  // demoted thin tier (Dan, 2026-07-15) — rendered in the rail AND the ☰.
  const tools = tabsWithActive(toolTabs(), active);
  // Pages that pass the site row itself just deduplicate to no context group.
  const context = tabs.filter((t) => !site.some((s) => s.key === t.key) && !tools.some((s) => s.key === t.key));
  // null for a page that colours itself — then NO fam- class is added, the
  // header falls back to plain paper and the spine rule does not match, so
  // the page renders exactly as it did before this system existed.
  const famKey = familyOf(active);
  // What the page ASKS, where it is an activity — the band over it takes
  // this over the family (Dan, 2026-08-26). Section pages keep the family.
  const bandKey = bandOf(active);

  // Per-page browser-tab title (audit 2026-07-19: every page announced
  // itself as just "FluOLinGo" — tabs, history, bookmarks and screen-reader
  // page announcements were indistinguishable). The active flap's label IS
  // the page's name; deck/context pages fall back to their first context
  // flap, then to the registry (patch 19c retired the `crumb` prop, whose
  // only surviving job was this fallback). Home keeps the default.
  const hub = hubFamily(active);
  const pageLabel =
    [...site, ...tools, ...context].find((t) => t.key === active)?.label ??
    // `context[0]?.label` used to sit here, and it could only ever be wrong.
    // It fires exactly when the active key is NOT among the page's own flaps
    // — and the first context flap on every deck page is « Home », so
    // /decks/<curated>/mcq (curated decks get no MCQ flap, DeckContent.tsx)
    // announced itself as Home. Invisible until 1 Sep, because that page had
    // no family and so drew no band at all; giving it one made the old label
    // visible. A page that cannot name itself from its own flaps should say
    // nothing and let its caller pass a `band` title, not borrow a sibling's.
    activity(active)?.name ??
    // A family hub is not an activity and has no flap, so without this its
    // browser tab would say plain "FluOLinGo" — the fault the per-page title
    // was introduced to end.
    (hub && familyShort(hub));
  useEffect(() => {
    document.title = pageLabel ? `${pageLabel} · FluOLinGo` : "FluOLinGo";
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
          /* EVERY page wears its family's colour, from one place (Dan,
             2026-08-21: "I WANT COLOR"). familyOf() turns the page's own
             `active` key into one of the six, so a route does not have to
             declare a hue — and the whole site stops being one undivided
             field of paper. Unknown keys stay uncoloured on purpose. */
          className={`cahier-page ${famKey ? `fam-${famKey}` : ""}${bandKey ? ` band-${bandKey}` : ""}${isReadingSurface(active) ? " paper-sand" : ""} ${nested ? "min-h-[calc(100vh-18px)]" : "min-h-screen"}`}
        >
          {!nested && <div className="cahier-binding" aria-hidden />}
          {!nested && edgeGrip}

          {/* The site bar — ☰ · ← FluOLinGo · icons. It used to be written
              out here, which is exactly why only CahierShell pages had it;
              DrillShell mounts the same component now (Dan, 2026-08-31). */}
          <SiteTopBar active={active} tabs={tabs} topRight={topRight} nested={nested} />

          {/* The page's heading band (Dan, 2026-08-23, variant A): every
              family page opens with the same structure the profile page
              established — name on the family's ink, one number right.
              Home keeps its hero instead; /moi and /profil have no famKey. */}
          {famKey && active !== "home" && band !== false && (band?.title ?? pageLabel) && (
            <PageBand title={band?.title ?? pageLabel} tag={band?.tag} trailing={band?.trailing} className={nested ? "pl-5 sm:pl-7" : "pl-12 sm:pl-16"} />
          )}

          {/* Ruled paper behind the content well — horizontals only, no vertical
              margin line (Dan, 2026-08-10). Opt-in class rather than a body
              background so a drill or a game can turn it off. */}
          <div className={`cahier-foolscap py-5 pr-4 sm:pr-7 ${nested ? "pl-5 sm:pl-7" : "pl-12 sm:pl-16"}`}>{children}</div>
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
            aria-label="Expand to full width"
            title="Tap (or double-tap the grey space) to expand the page"
            className="fixed right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] bg-white text-xl text-[color:var(--cahier-ink)] shadow-lg"
          >
            <span aria-hidden>⤢</span>
          </button>
        )}
        {/* Only the per-deck activity flaps live on the desk now (Dan,
            2026-08-30: "burger menu left, flaps right"). The six-family rail
            moved into the ☰ above; what is left is the handful of tabs that
            belong to THIS page — List / All on a deck, the activity tabs on a
            drill — which are page furniture rather than site navigation, and
            which Dan kept as flaps. */}
        <nav className="cahier-tabs" aria-label="This page">
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
  const sio = stopForDeck(collectionId);
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
 * "xPlain" in the rail (renamed "Memo" 2026-08-23), "Flip It" here and
 * "4Mémoire" there, "Compose It" here
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
  const composeBanks = composeBanksForDeck(collectionId);
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
    // Sorting and iComplete, back after the 2026-07-19 unification orphaned
    // them. Placed here so the row reads as FluOlin Goals' own sequence:
    // Memo -> Sorting -> 4Memoire -> iComplete.
    //
    // Sorting is gated exactly like VocabulaRain and GramMarathon: only the 21
    // of 44 decks with >=2 letris columns can build a practice set, and on the
    // Sorting's flap is gone with the activity (Dan, 2026-08-31: "sorting is
    // cut"). The route survives so banked answers keep a label, but nothing
    // offers it any more — see the note in content/activities.ts.
    // iComplete's flap is gone with the activity. Two of Dan's 31 Aug rulings
    // arrived at the same line from both ends: "iComplete does not have its
    // door from here, but through Memo" (#99) and then "we can retire
    // CompleteIt … it will be part of Memo's activities" (#97) — the Memo's
    // Moyen/Difficile tiers ARE one- and two-piece completion now. The route
    // survives so banked answers keep a label — see activities.ts.
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
    // One flap per compose bank on the deck. The first wears the registry
    // chrome ("ComposeIt"); any further bank flies its own title + emoji so
    // two doors never read as one (atelier-sio-040 carries the itinerary AND
    // « L'e-carte postale » — Dan, 2026-08-23). The Index's compose cell
    // keeps pointing at the first (key "compose" is what cellHref finds).
    ...composeBanks.map((bank, i) => {
      const tab = registryTab("compose", `/games/compose/${bank.id}`);
      return i === 0 ? tab : { ...tab, key: `compose-${bank.id}`, label: bank.title, emoji: bank.emoji };
    }),
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
