"use client";

/**
 * The old address of a User tab, forwarding into the one User page with that
 * tab open (Dan, 2026-09-11 — the four pages became one).
 *
 * NOT deleted, forwarded: `/leaderboard` is on printed handouts and in the ☰
 * menu, `/moi` is what the ⌛ top-bar icon points at, and `/reglages` is where
 * the account chip goes. A URL that has been given out never just stops
 * working. `replace`, so Back does not bounce through the hop.
 */
import { useEffect } from "react";

import type { UserTabKey } from "@/content/userTabs";

export default function UserTabRedirect({ tab }: { tab: UserTabKey }) {
  useEffect(() => {
    const q = tab === "me" ? "" : `?tab=${tab}`;
    window.location.replace(`/profil${q}${window.location.hash}`);
  }, [tab]);
  return null;
}
