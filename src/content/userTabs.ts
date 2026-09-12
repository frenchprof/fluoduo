/**
 * The four tabs of the 👤 User family.
 *
 * THE WORDS, THE EMOJI AND THE COLOUR ARE NOT WRITTEN HERE. Dan, 2026-09-11:
 * *"use the same words colors and emojis"* — said after a strip that called the
 * first tab « Me » and the second « Board » reached him, when the ☰ menu has
 * always called them Profile and Leaderboard. A fourth hand-kept list of the
 * same activities is the exact fault `siteTabs.ts` was rewritten to end on
 * 2026-08-10; this derives from `activities.ts` like everything else, so a
 * rename there moves the tab too and the two cannot disagree again.
 *
 * `href` is the tab's OWN address — the one a bookmark or a printed handout may
 * hold. Each of those routes forwards into the User page with that tab open, so
 * no old link dies and every tab stays linkable on its own.
 *
 * HISTORY IS THE ONE TAB WITH NO REGISTRY ENTRY, deliberately: it is not a menu
 * tile — Dan's 9 Sep grid gives the User family three (Profile, Leaderboard,
 * Settings) and history is reached from inside the profile. So it names itself
 * here, and wears the ⌛ the top bar has used for « my learning history » since
 * 2026-07-25 rather than inventing a glyph.
 */
import { activity } from "@/content/activities";

type Tab = { key: string; label: string; emoji: string; href: string; embed: string };

/** A tab that IS a registry activity — its word and its glyph come from there. */
function fromRegistry(key: string, tabKey: string, embed: string): Tab {
  const a = activity(key);
  return {
    key: tabKey,
    label: a?.name ?? tabKey,
    emoji: a?.emoji ?? "",
    href: (a?.href as string) ?? "/profil",
    embed,
  };
}

export const TABS: Tab[] = [
  fromRegistry("profil", "me", "/profil/embed"),
  fromRegistry("leaderboard", "board", "/leaderboard/embed"),
  { key: "history", label: "History", emoji: "⌛", href: "/moi/historique", embed: "/moi/historique/embed" },
  fromRegistry("reglages", "settings", "/reglages/embed"),
];

export type UserTabKey = string;

/** The tab a `?tab=` value names, falling back to the first for anything
 *  unknown — a bad query string opens the page, it does not blank it. */
export function tabFrom(value: string | null | undefined): UserTabKey {
  return TABS.find((t) => t.key === value)?.key ?? TABS[0].key;
}
