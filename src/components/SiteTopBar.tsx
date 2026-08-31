"use client";

/**
 * The site bar — ☰ · ← FluOLinGo · icons — and the one definition of it.
 *
 * WHY IT IS ITS OWN COMPONENT (2026-08-31). Dan: *"many pages are missing that
 * menu and other links in the area above the coloured header strip. can you
 * reinstate them so that those are accessible at all times"*.
 *
 * It lived inside CahierShell, so only CahierShell pages had it. Every drill,
 * game and lesson runs in DrillShell instead — 28 surfaces — and DrillShell
 * has never drawn it. That was deliberate once: patch 20-21 made a drill a
 * focused mode whose only chrome is ✕ · progress · score, because the four
 * /practice routes used to spend 36-44% of a phone before the first question.
 * Dan has now overruled the focused mode for the NAVIGATION specifically: the
 * way out must be reachable at all times, not only by finishing or quitting.
 *
 * Copying the markup into DrillShell was the other option and is the one this
 * repo has already been bitten by — the ☰ dropdown and the desk rail were two
 * nav surfaces that disagreed for eleven days (STATUS, 19 Aug), closed only on
 * 30 Aug by making the dropdown BE the rail. A second copy of the top bar
 * would re-open exactly that. So: one component, two mounts.
 *
 * It derives its own contents (`siteTabs`, `toolTabs`, RailGroups) and owns
 * its own open/closed state, so a caller supplies only what it cannot know:
 * which key is active, any page-context flaps, and an optional right slot.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import MenuSplash from "@/components/MenuSplash";
import RailGroups from "@/components/RailGroups";
import AccountButton from "@/components/AccountButton";
import SoundControl from "@/components/SoundControl";
import TabFlap, { hueOf, type ShellTab } from "@/components/TabFlap";
import { siteTabs, toolTabs, tabsWithActive } from "@/components/siteTabs";

export default function SiteTopBar({
  active,
  tabs = [],
  topRight,
  nested = false,
}: {
  /** Which tab key is the current page. */
  active: string;
  /** Page-context flaps (a deck's activities, Teacher, …). */
  tabs?: ShellTab[];
  /** Extra bar content, e.g. a live score. Shrinks before the icons do. */
  topRight?: ReactNode;
  /** No flap rail off the right edge (a nested SioModal, a drill) — so
   *  the bar takes the tighter right inset. */
  nested?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Tap-away for the ☰ dropdown (Dan, 2026-07-20): a capture-phase document
  // listener sees every pointerdown regardless of z-order, which the old
  // full-screen catcher div did not on pages with their own stacking context.
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [menuOpen]);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);

  const site = tabsWithActive(siteTabs(), active);
  const tools = tabsWithActive(toolTabs(), active);
  const context = tabs.filter(
    (t) => !site.some((s) => s.key === t.key) && !tools.some((s) => s.key === t.key),
  );

  return (
    <>
    {/* The family band: the header field is the family's wash and the
        page carries its spine. Both are tokens, so switching family
        switches the page and nothing else moves. */}
    <div
      className="sticky top-0 z-10 border-b-2 border-[color:var(--cahier-ink)]/15 backdrop-blur"
      style={{ background: "var(--fam-wash, var(--cahier-paper))" }}
    >
      {/* py-2 + tighter left inset (Dan, 2026-08-21): the wordmark hugs
          the page's top-left corner — just clear of the spiral binding
          (38px), no further. */}
      <div className={`flex items-center justify-between gap-2 py-2 pl-3 sm:pl-5 ${nested ? "pr-5 sm:pr-7" : "pr-9 sm:pr-11"}`}>
        {/* The wordmark is ALWAYS a door home (Dan, 2026-07-25) — on
            the home page it simply arrives where you already are. */}
        {/* THE RULE OF THIS BAR (Dan, 2026-08-21: "the top most row of
            icons still exist, and must not go hiding into the overspill
            off the screen"): every icon in .cahier-topbar is a
            destination, the strip is shrink-0, and nothing may push it
            past the right edge. So the bar has a yield order, widest
            concession first:

              1. `topRight` — page-supplied, variable width, and the one
                 thing that broke the budget. It now has its OWN
                 shrinkable slot below (min-w-0 + truncate), OUTSIDE the
                 icon strip, so a long score readout ellipsizes instead
                 of shoving ☰ off the screen.
              2. the wordmark — a door home the ← already signals, so it
                 truncates legibly.
              3. the icons — never. They are the invariant.

            Measured on /reviser before this: at 320px the score readout
            and ☰ were both off-screen; at 360 and 390 one added chip was
            enough to lose ☰. verify31 pins the structure. */}
      {/* ☰ LEADS THE BAR (Dan, 2026-08-30: "burger menu left"). It sat
          at the far right for as long as it was a phone-only stand-in
          for the desk rail; now that it IS the navigation at every
          width, it takes the position navigation takes — first, before
          the wordmark. The icon strip on the right stays destinations
          only, which is what verify31 pins. */}
      <div ref={menuRef} className="cahier-menu relative shrink-0">
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
            <div className="absolute left-0 top-full z-50 mt-1 flex max-h-[75vh] w-60 flex-col gap-1 overflow-y-auto rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-1 shadow-lg">
              {/* THE GROUPED FAMILIES, not a flat list (Dan,
                  2026-08-30: the rail "cannot be flaps … they have to
                  be drop down like in most interfaces"). This dropdown
                  used to list `site` flat while the desk rail showed
                  the six families — the one surface that disagreed
                  with the rail, flagged in STATUS on 19 Aug and left
                  open because the rail was the real navigation. Now
                  the dropdown IS the navigation, so it takes the
                  grouped structure and the disagreement closes. */}
              <RailGroups activeKey={active} onNavigate={() => setMenuOpen(false)} />
              <hr className="my-0.5 border-[color:var(--cahier-ink)]/15" />
              <button
                key="quickguide"
                type="button"
                onClick={() => { setQuickGuideOpen(true); setMenuOpen(false); }}
                className="cahier-tab cahier-tab--sm !rounded-md text-left font-black"
                style={{ background: "var(--cahier-ink)", borderColor: "var(--cahier-ink)", color: "#d4f24c" }}
              >
                <span aria-hidden>▦</span> MENU
              </button>
              {/* Only what RailGroups above does NOT already list.
                  `toolTabs()` is Carte plus every navigable activity, and
                  the six families cover the activities — rendering it
                  whole put SpecuLearn and 4Mémoire in this menu twice.
                  Carte belongs to no family, so it is the one that stays.
                  Dan, 2026-08-30: "the shortcuts below can be swapped to
                  something else" — this row is now free for whatever he
                  wants a standing shortcut to be. */}
              {tools.filter((t) => t.key === "map").map((t, i) => (
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
        <Link href="/" className="cahier-display min-w-0 shrink truncate text-lg font-black text-[color:var(--cahier-ink)]">
          {active !== "home" && <>← </>}<span className="cahier-hl">FluOLinGo</span>
        </Link>
        {/* Yield slot 1 — shrinks and truncates before anything else. */}
        {topRight && (
          <div className="cahier-topslot min-w-0 flex-shrink truncate text-right">{topRight}</div>
        )}
        <div className="cahier-topbar flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1 sm:flex-nowrap sm:gap-2">
          {/* Icon strip, macOS-menu-bar style (Dan, 2026-07-08) — icons
              only, no words. 🔍 and 🏆 left the bar (Dan, 2026-08-22):
              word search lives in the Index's own box, the ranking on
              /leaderboard. */}
          <SoundControl />
          {/* 🏠 yields below sm — the ← FluOLinGo link is the home
              door there, and it was pushing the ☰ off a phone screen
              (Dan, 2026-07-15). */}
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
          <AccountButton />
        </div>
      </div>
    </div>
      {quickGuideOpen && <MenuSplash onClose={() => setQuickGuideOpen(false)} />}
    </>
  );
}
