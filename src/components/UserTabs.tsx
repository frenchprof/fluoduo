"use client";

/**
 * The 👤 User family's own tab strip — Me · Board · History · Settings.
 *
 * WHY THIS EXISTS. Dan, 2026-09-11, looking at the four User pages: *"the user
 * pages are very un-userfriendly counter-intuitive. i wouldn't know what to do
 * or how to navigate my way around."* Photographed side by side, the four
 * disagreed with each other in every way a set of sibling pages can:
 *
 *   /profil      links at the BOTTOM   — MAP · EXPORT · HISTORY
 *   /reglages    links at the TOP      — My Progress · Leaderboard · Profile
 *                                        (and not Settings, the page you were on)
 *   /leaderboard no links at all       — signed out it is one card on blank paper
 *   historique   a ‹ PROFILE back link — the only page with one
 *
 * and the dark band said a different KIND of thing on each: PROFILE, USER
 * (the family, not the page), LEADERBOARD, SETTINGS. Nothing anywhere said
 * which of the four you were on.
 *
 * So: one strip, the same four tabs, on all four — the current one marked.
 * Dan picked this shape over four pages sharing a strip (2026-09-11), because
 * the panel then swaps without a page load and nothing flashes.
 *
 * THE WORDS, GLYPHS AND COLOUR ARE THE APP'S, NOT THIS FILE'S (Dan, same day:
 * *"use the same words colors and emojis"*). The first draft of this strip said
 * « Me » and « Board »; the ☰ menu has always said Profile and Leaderboard, and
 * two names for one page is the fault this whole change exists to end. Labels
 * and emoji come from `userTabs.ts`, which reads the registry; the colour is
 * the User family's own pen and wash — the same grey the ☰ flap and the page
 * spine already wear — so the strip cannot drift from the menu that leads to it.
 *
 * NOT covered by "no control spans the whole width": that rule is about ONE
 * control wearing the page's width. This is four sharing it, like the bottom
 * bar's five.
 */
import { TABS, type UserTabKey } from "@/content/userTabs";

export default function UserTabs({
  active,
  onPick,
}: {
  active: UserTabKey;
  /** Omitted on a server-rendered page: the tabs fall back to plain links. */
  onPick?: (key: UserTabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="User"
      className="flex w-full border-b-2"
      style={{ background: "var(--cahier-paper-raised, #fff)", borderColor: "var(--cahier-line-strong, #ddd)" }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <a
            key={t.key}
            role="tab"
            aria-selected={on}
            aria-current={on ? "page" : undefined}
            href={t.href}
            onClick={
              onPick
                ? (e) => {
                    // Plain left-click swaps the panel; anything with a modifier
                    // stays a real link, so "open in new tab" still works.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onPick(t.key);
                  }
                : undefined
            }
            className="fluo-hit44 flex flex-1 items-center justify-center gap-1.5 px-1 py-2 text-center no-underline"
            style={{
              color: on ? "var(--cahier-ink)" : "var(--cahier-ink-soft)",
              background: on ? "var(--fam-user-wash)" : "transparent",
              boxShadow: on ? "inset 0 -3px 0 var(--fam-user-ink)" : "none",
            }}
          >
            <span aria-hidden className="text-[13px] leading-none">{t.emoji}</span>
            <span className="whitespace-nowrap text-[11.5px] font-extrabold">{t.label}</span>
          </a>
        );
      })}
    </div>
  );
}
