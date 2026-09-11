"use client";

/**
 * THE 👤 USER PAGE — one page, four tabs (Dan, 2026-09-11).
 *
 * The four screens a learner could already reach — their own progress, the
 * board, their answer history and their settings — used to be four separate
 * pages that agreed with each other about nothing: three different kinds of
 * navigation in three different places, a dark band that named the page on two
 * of them and the FAMILY on a third, and no page anywhere saying which of the
 * four you were looking at. Dan: *"i wouldn't know what to do or how to
 * navigate my way around."*
 *
 * They are now ONE page. The band and the strip belong to this host and never
 * move; only the framed panel below them swaps, so switching tabs costs no
 * page load and nothing flashes. Each tab keeps its own address — `/profil`,
 * `/leaderboard`, `/moi/historique`, `/reglages` all still resolve and forward
 * here with that tab open — so bookmarks, the ☰ menu and printed handouts
 * carry on working and every tab stays linkable on its own.
 *
 * WHY THE QUERY STRING IS READ IN AN EFFECT and not with `useSearchParams`:
 * the site is a static export, where that hook forces the whole page to
 * client-render and demands a Suspense boundary around it. Reading
 * `window.location.search` on mount is the same answer without either cost,
 * and it is what the rest of the app already does for device-local state.
 */
import { useCallback, useEffect, useState } from "react";

import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import UserTabs from "@/components/UserTabs";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { TABS, tabFrom, type UserTabKey } from "@/content/userTabs";

export default function UserPage() {
  const [tab, setTab] = useState<UserTabKey>("me");

  useEffect(() => {
    // `?tab=` is how the four forwarding routes say which panel to open.
    /* eslint-disable-next-line react-hooks/set-state-in-effect --
       the query string cannot be read during render on a static export. */
    setTab(tabFrom(new URLSearchParams(window.location.search).get("tab")));
  }, []);

  const pick = useCallback((key: UserTabKey) => {
    setTab(key);
    // The address follows the panel, so a refresh or a copied link comes back
    // to the tab you were on. `replaceState`, not `pushState`: Back should
    // leave the User page, not walk the tabs you flicked through.
    const t = TABS.find((x) => x.key === key);
    if (t) window.history.replaceState(null, "", `${t.href}${key === "me" ? "" : `?tab=${key}`}`);
  }, []);

  const current = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <CahierShell
      tabs={tabsWithActive(siteTabs(), "home")}
      active="profil"
      band={{ title: current.label }}
    >
      <UserTabs active={tab} onPick={pick} />
      <EmbedFrame src={current.embed} title={current.label} />
    </CahierShell>
  );
}
