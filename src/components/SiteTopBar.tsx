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
import { loadProgress } from "@/lib/progress";
import { xpMultiplier } from "@/lib/economy";
import { readUiPrefs } from "@/lib/uiPrefs";
import { dueForReview } from "@/lib/reviser";
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

  // The Revise due count rides the bottom bar's 🔄 slot. Since 5 Sep a
  // learner can untick that slot — or the whole bar — in Réglages, and the
  // count lands HERE as a small badge on ☰ instead of vanishing (Dan's
  // default from the bottom-bar ruling). 0 while the slot is on, so the
  // number never shows twice.
  const [dueBadge, setDueBadge] = useState(0);
  useEffect(() => {
    const sync = () => {
      const reviseOff = !readUiPrefs().bottomNav.includes("review");
      setDueBadge(reviseOff ? dueForReview(loadProgress(), Date.now()).length : 0);
    };
    sync();
    window.addEventListener("fluolingo:uiprefs", sync);
    window.addEventListener("fluolingo:progress-updated", sync);
    return () => {
      window.removeEventListener("fluolingo:uiprefs", sync);
      window.removeEventListener("fluolingo:progress-updated", sync);
    };
  }, []);

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
    {/* z-30, NOT z-10 — and this number is load-bearing (5 Sep). `sticky` with
        a z-index makes this bar its own stacking context, so the ☰ dropdown's
        z-50 counts only INSIDE the bar; against the page the bar competes with
        whatever number is on this line. At z-10 it TIED with Home's postcard,
        whose whole-card link is `absolute inset-0 z-10` — equal z, later in the
        DOM, so an INVISIBLE stretched link sat on top of the open menu. The
        dropdown still painted (the link has no pixels) and still looked right
        in a screenshot; it just stopped receiving taps. Measured on the export
        at 390px: 👤 User, ▦ MENU and 🗺️ Map were dead on Home and fine on
        /practice and /games, which have no stretched card that far up.
        z-30 clears page content and stays under every scrim (z-40+) and modal.
        verify94 fails the build if page content ever reaches this number. */}
    <div
      className="sticky top-0 z-30 border-b-2 border-[color:var(--cahier-ink)]/15 backdrop-blur"
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
            aria-label={dueBadge > 0 ? `Navigation — ${dueBadge} to revise` : "Navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="cahier-btn cahier-btn-sm relative"
          >
            {menuOpen ? "✕" : "☰"}
            {dueBadge > 0 && (
              <span
                aria-hidden
                className="absolute -right-2 -top-2 rounded-full bg-[var(--dopa-streak)] px-1.5 text-[10px] font-bold leading-[1.4] text-[color:var(--dopa-streak-on)]"
              >
                {dueBadge}
              </span>
            )}
          </button>

          {menuOpen && (
            // max-h + scroll: with the tools group the list outgrows
            // small screens and items were cut off (Dan, 2026-07-08).
            // PAPER, NOT WHITE (Dan, 2 Sep: "make sure the tabs are not
            // sitting on a white background or else it looks unreal") and
            // WIDTH FROM CONTENT (same day: "as long as the longest among
            // them without redundant space at the tails") — w-max lets the
            // longest flap set the column; min-w keeps MENU/Carte legible.
            <div className="absolute left-0 top-full z-50 mt-1 flex max-h-[75vh] w-max min-w-44 flex-col gap-1 overflow-y-auto rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-[color:var(--cahier-paper-raised)] p-1.5 shadow-lg">
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
        {/* text-xl, not the text-lg it wore in the display face: FluOLinGo Hand
            has a smaller x-height and the wordmark lost presence at 18px next
            to a ☰ that did not change. Measured at 320px after the bump — the
            burger and the whole icon strip stay on screen, which is the only
            budget this size is allowed to spend. */}
        <Link href="/" className="min-w-0 shrink truncate text-xl font-black text-[color:var(--cahier-ink)]">
          {active !== "home" && <>← </>}
          {/* THE KALLANG WAVE (Dan, 1 Sep: "the top return link to be in the
              same FluOLinGo font but with the KALLANG wave effect and
              irregular highlighter movement" — the stadium crowd wave at the
              National Stadium). One span per letter, rising and dipping in
              sequence, so the crest travels through the word rather than the
              word bouncing as a block. The delay is per LETTER and the cycle
              is one animation, which is what makes it read as a wave: at any
              instant the letters are at nine different points of the same arc.

              The letters are aria-hidden and the name is given once to a
              screen reader — nine separate characters would otherwise be read
              out one at a time, which is how the hero already does it. */}
          <span className="fluo-wave">
            <span aria-hidden>
              {"FluOLinGo".split("").map((ch, i) => (
                <span key={i} className="fluo-wave-letter" style={{ animationDelay: `${i * 0.09}s` }}>
                  {ch}
                </span>
              ))}
            </span>
            <span className="sr-only">FluOLinGo</span>
          </span>
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
          {/* 🔥 THE STREAK, between History and User (Dan, 1 Sep: "move the
              streak value and emoji up between History and User"). It was a
              tile on Home, which meant the one reading with a deadline was
              visible only on the one page a learner leaves first. Here it is
              on all 28 surfaces, including the drill they are in the middle
              of — which is where a streak argues for itself.

              NOT a button: every other item in this strip is a destination
              (verify31's rule) and a streak is a reading. It renders as plain
              text so the icon strip keeps meaning "these go somewhere". */}
          <StreakMark />
          <AccountButton />
        </div>
      </div>
    </div>
      {quickGuideOpen && <MenuSplash onClose={() => setQuickGuideOpen(false)} />}
    </>
  );
}

/**
 * The day streak, as a reading rather than a door.
 *
 * WHY IT READS AFTER MOUNT. `loadProgress()` touches localStorage, which does
 * not exist while the page is being statically exported — and this bar renders
 * on every one of those pages. Reading during render would give the server one
 * number and the first client render another, and React would blame the
 * mismatch on the whole subtree, which here is the entire top bar. So it
 * starts null and renders NOTHING until the real value arrives: a streak that
 * appears a frame late is invisible; a top bar that fails to hydrate is not.
 *
 * Zero stays hidden rather than greyed. On Home the tile could afford to show
 * an unlit 0 beside its label — a column missing from a report card reads as
 * broken. In a five-icon strip there is no row to keep, and « 🔥 0 » next to
 * the account button is a reproach carried onto every screen in the app.
 */
function StreakMark() {
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    // localStorage cannot be read during render (see above), so the first
    // read has to happen here.
    const read = () => setStreak(loadProgress().streak);
    read();
    // AND KEEP READING. This mark read once on mount and never again, so the
    // day's first practice bumped the streak in storage while the bar went on
    // showing nothing — the fire only ever appeared after a full reload,
    // which in an SPA is never (Dan, 2026-09-02: "the streaks are not
    // working yet?"). Every save announces itself on this event; the one
    // reading with a deadline now hears it.
    window.addEventListener("fluolingo:progress-updated", read);
    return () => window.removeEventListener("fluolingo:progress-updated", read);
  }, []);
  if (streak === null || streak <= 0) return null;
  const mult = xpMultiplier(streak);
  return (
    /* THE NUMBER ABOVE THE FIRE (Dan, 1 Sep: "would it be possible to show 4
       above the fire at the top instead?"). Stacked, not side by side — which
       also buys back the width the pair was spending in a strip whose one hard
       rule is that nothing pushes the ☰ off a 320px screen: two lines of ~13px
       cost less horizontally than 🔥 and a numeral in a row, and the icons
       either side are square. */
    /* IN A DEPRESSED SPACE (Dan, 1 Sep: "can the streak sitting next to the
       on/off button be within a depressed space"). The right reading, and it
       settles what the mark IS: every neighbour in this strip is a door that
       stands out, and a well is the app's word for a value you read rather
       than press. It now says that in the same vocabulary Home uses for 1/50,
       ring and all — so a learner meets one grammar of depth everywhere and
       nothing here offers a press that does nothing.

       py-0.5, not py-1, and that was measured rather than picked: the well needs
       a little room or its inset ring closes on the numeral, but at py-1 the
       bar grew from 30.3px to 33 — the streak was making the whole top bar
       taller on every one of the 28 surfaces to give itself breathing space.
       Half of it is enough for the ring and costs the bar nothing. */
    <span
      className="neo-well flex shrink-0 flex-col items-center rounded-lg px-1.5 py-0.5 leading-none"
      title={mult > 1 ? `Day streak — everything earns ×${mult}` : "Day streak"}
      aria-label={`Day streak: ${streak}`}
    >
      <span
        aria-hidden
        className="fluo-mono text-[13px] font-black [font-variant-numeric:tabular-nums]"
        style={{ color: "var(--dopa-streak-ink)" }}
      >
        {streak}
      </span>
      <span aria-hidden className="text-[12px]">🔥</span>
    </span>
  );
}
