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
import { readUiPrefs } from "@/lib/uiPrefs";
import { dueForReview } from "@/lib/reviser";
import type { ReactNode } from "react";
import MenuGrid from "@/components/MenuGrid";
import PathDoor from "@/components/PathDoor";
import AccountButton from "@/components/AccountButton";
import SoundControl from "@/components/SoundControl";
import NewsBell from "@/components/NewsBell";
import { type ShellTab } from "@/components/TabFlap";

export default function SiteTopBar({
  active,
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

  // site/tools/context computations retired with RailGroups (7 Sep) — the
  // grid menu derives nothing from the tab lists, and the desk flaps are
  // CahierShell's own. The `tabs` prop stays in the type for the callers.

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
      /* `cahier-sitebar` names this bar so one rule can reach it. A station
         running inside the cahier must not draw a second site bar inside the
         frame (globals.css, html[data-embed]) — and there was no class here to
         name, only a stack of utilities. */
      className="cahier-sitebar sticky top-0 z-30 border-b-2 border-[color:var(--cahier-ink)]/15 backdrop-blur"
      style={{ background: "var(--fam-wash, var(--cahier-paper))" }}
    >
      {/* py-2 + tighter left inset (Dan, 2026-08-21): the wordmark hugs
          the page's top-left corner — just clear of the spiral binding
          (38px), no further. */}
      <div className={`flex items-center gap-2 py-2 pl-3 sm:pl-5 ${nested ? "pr-5 sm:pr-7" : "pr-9 sm:pr-11"}`}>
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
            /* data-tour: the home tour's second step. It teaches this because
               the bottom bar it used to teach is gone — Dan removed it on
               6 Sep and `bottomNav` defaults to empty, so that step matched
               nothing and skipped in silence. ☰ is the navigation now, and
               unlike the bar it is on every page for everyone. */
            data-tour="site-menu"
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
            // THE GRID, AS DAN DREW IT (7 Sep: "replace the burger menu that
            // comes down like this with this 3x5 grid instead"). RailGroups'
            // grouped flaps, the ▦ MENU button and the Carte flap all retire
            // together — the twelve activity tiles + Help/User/Leaderboard
            // are the whole menu now, and Help carries the quick guide the
            // ▦ button used to. Paper ground, per the 2 Sep not-white rule.
            <div className="absolute left-0 top-full z-50 mt-1 max-h-[80vh] overflow-y-auto rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-[color:var(--cahier-paper-raised)] shadow-lg">
              <MenuGrid
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          )}
        </div>
        {/* text-xl, not the text-lg it wore in the display face: FluOLinGo Hand
            has a smaller x-height and the wordmark lost presence at 18px next
            to a ☰ that did not change. Measured at 320px after the bump — the
            burger and the whole icon strip stay on screen, which is the only
            budget this size is allowed to spend. */}
        {/* mr-auto, and the bar no longer justifies-between (Dan, 6 Sep: "The
            current <-- FluOLinGo in the top should be on the left rather
            than in the middle"): the wordmark now sits AGAINST the ☰, and
            everything after it is pushed right by this margin. */}
        <Link href="/home" className="min-w-0 shrink truncate text-xl font-black text-[color:var(--cahier-ink)]">
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
        {/* THE MIDDLE SLOT (Dan, 2026-09-14: "between the menu burger and
            buttons, in the middle"). flex-1 so it takes the slack the wordmark
            used to absorb, justify-center so the key sits in the middle of
            that slack rather than against either neighbour — which is what
            "in the middle" has to mean on a row whose two ends are pinned.

            min-w-0 so this slot, not the icon strip, is what gives way when
            the row is tight: verify31's whole finding is that navigation must
            never be pushed off the edge. */}
        <div className="flex min-w-0 flex-1 justify-center">
          <PathDoor />
        </div>
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
          {/* 🔔 BESIDE 🔊 (Dan, 2026-09-15: *"a notifications icon at the top
              right of the screen next to the volume button - for all these
              messages"*). It carries the What's New card and its unread dot. */}
          <NewsBell />
          {/* 🏠 IS GONE (Dan, 2026-09-12: *"We also don't need the home button
              at the top right"*).
              It was already the second home door on the bar — the ← FluOLinGo
              wordmark to its left has been the first since 2026-07-15, which is
              why 🏠 hid itself below `sm` rather than push the ☰ off a phone.
              One door that works at every width beats two that share a
              destination and only one of which survives a narrow screen. */}
          {/* ⌛ IS GONE (Dan, 2026-09-14, looking at the crowded bar: "maybe we
              can remove the history and favourites button too there"). It was
              a DOOR, and the same door is already in the ☰ menu — 👤 User
              carries History at /moi/historique. Two doors to one room, one of
              which was spending the bar's last pixels: the wordmark had begun
              truncating to « FluO » on a phone.

              Same reasoning that retired 🏠 on 12 Sep: one door that works at
              every width beats two that share a destination. */}
          {/* 🔥 THE STREAK, between History and User (Dan, 1 Sep: "move the
              streak value and emoji up between History and User"). It was a
              tile on Home, which meant the one reading with a deadline was
              visible only on the one page a learner leaves first. Here it is
              on all 28 surfaces, including the drill they are in the middle
              of — which is where a streak argues for itself.

              NOT a button: every other item in this strip is a destination
              (verify31's rule) and a streak is a reading. It renders as plain
              text so the icon strip keeps meaning "these go somewhere". */}
          {/* THE STOP FIELD IS GONE FROM THE BAR (Dan, 2026-09-14: "we don't
              have the stop field anymore, it s ben a while since it was take
              off"). It had already been taken off HOME on 12 Sep, because the
              map's own control row carries the editable number just above the
              road it names; what this line did was keep it everywhere ELSE, so
              the thing Dan remembers removing was still on 27 surfaces.

              The number is not lost: the map's row has it, in a well, and the
              ☰'s own 🎯 badge computes the same stop. */}
          {/* THE ★ IS GONE FROM THE BAR (Dan, 2026-09-15, seeing the new heart
              beside it: *"I see it but why does it coexist with the star"*).

              IT HAD ALREADY LOST BOTH OF ITS JOBS. It was put here on 12 Sep
              because he asked where the favourites live — *"At the top right
              next to their name"* — and at the time it was the only favourites
              control in the app: it starred the page AND opened the list. On
              14 Sep the 🤍 on every coloured band took over the starring, and
              this was cut back to a plain door to /favourites.

              THAT DOOR IS ALREADY IN THE ☰, AT DAN'S OWN INSTRUCTION — *"put
              Favourites in the burger grid menu in the yellow lesson strip"* —
              so `MenuGrid`'s yellow row carries « ★ Favourites → /favourites ».
              Two doors to one room, and this one was spending the bar's last
              pixels: the same reasoning that retired 🏠 on 12 Sep and ⌛ on
              14 Sep.

              He had in fact asked for this on 14 Sep — *"maybe we can remove
              the history and favourites button too there"* — and it was KEPT
              then, deliberately and with the cost reported: at that moment it
              was the only way to add a favourite anywhere, so removing it
              would not have moved the feature to the menu, it would have
              removed the feature. The heart is what makes it removable. */}
          <AccountButton />
        </div>
      </div>
    </div>
    </>
  );
}

