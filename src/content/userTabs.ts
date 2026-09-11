/**
 * The four tabs of the 👤 User family, in one place.
 *
 * Written down once for the same reason `activities.ts` is: the strip, the
 * host page's panel switch and the four forwarding routes all have to agree on
 * what the tabs are and where each one lives, and three hand-kept copies of a
 * list is how the app ended up with four different navigations on four sibling
 * pages in the first place.
 *
 * `href` is the tab's OWN address — the one a bookmark or a printed handout
 * may hold. Each of those routes forwards into the User page with that tab
 * open, so no old link dies and every tab is still linkable on its own.
 */
export const TABS = [
  { key: "me", label: "Me", href: "/profil", embed: "/profil/embed", title: "Me" },
  { key: "board", label: "Board", href: "/leaderboard", embed: "/leaderboard/embed", title: "Board" },
  { key: "history", label: "History", href: "/moi/historique", embed: "/moi/historique/embed", title: "History" },
  { key: "settings", label: "Settings", href: "/reglages", embed: "/reglages/embed", title: "Settings" },
] as const;

export type UserTabKey = (typeof TABS)[number]["key"];

/** The tab a `?tab=` value names, falling back to Me for anything unknown —
 *  a bad query string opens the page, it does not blank it. */
export function tabFrom(value: string | null | undefined): UserTabKey {
  return (TABS.find((t) => t.key === value)?.key ?? "me") as UserTabKey;
}
