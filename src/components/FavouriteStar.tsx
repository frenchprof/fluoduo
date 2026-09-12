"use client";

/**
 * THE ★ — one button in the top bar, on every page.
 *
 * Dan, 2026-09-12, shown three places the list could live and asked where:
 * *"At the top right next to their name"*, then *"option A"*. So the star
 * rides beside the account chip on all 28 surfaces, and it does the two
 * things a bookmark button does:
 *
 *   tap        star or unstar the page you are on
 *   long-press / right-click   open the Favourites page
 *
 * AND IT IS ALSO A LINK, because a long-press is invisible. The ★ that is
 * ALREADY starred links straight to the list on a second tap — the state a
 * learner is in when they want the list is the state where they have starred
 * something. A learner who has starred nothing has nothing to look at, which
 * is why the plain tap never navigates.
 *
 * NOT A DESTINATION IN THE ICON STRIP'S SENSE. `verify31`'s rule is that every
 * item in that strip goes somewhere; this one does when it can and toggles
 * when it cannot, so it is deliberately placed AFTER the strip, beside the
 * account chip, where Dan put it.
 *
 * ── WHY IT READS AFTER MOUNT ──────────────────────────────────────────────
 * `output: "export"` prerenders every page, so localStorage does not exist
 * when this renders on the server. It starts null and draws the hollow star
 * until the real value arrives — the same shape `StopMark` uses.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { describeHere } from "@/lib/favouriteHere";
import {
  MAX_ITEMS,
  isStarred,
  loadFavourites,
  saveFavourites,
  toggleFavourite,
  type Favourites,
} from "@/lib/favourites";

export default function FavouriteStar({ activeKey }: { activeKey?: string }) {
  const [fav, setFav] = useState<Favourites | null>(null);
  const [here, setHere] = useState<ReturnType<typeof describeHere> | null>(null);
  const [full, setFull] = useState(false);

  const reread = useCallback(() => {
    setFav(loadFavourites());
    setHere(describeHere(window.location.pathname, window.location.search, document.title, activeKey));
  }, [activeKey]);

  useEffect(() => {
    // localStorage cannot be read during render on a static export, and the
    // path is only known in the browser.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    reread();
    // The Favourites page writes the same key; a star removed there must go
    // hollow here without a reload. Both events matter: `storage` fires for
    // another tab, the custom one for this document (which `storage` skips).
    window.addEventListener("storage", reread);
    window.addEventListener("fluolingo:favourites", reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener("fluolingo:favourites", reread);
    };
  }, [reread]);

  if (!fav || !here) return null;

  const on = isStarred(fav, here.href);

  // Starred already → the button is a link to the list, so the list is
  // reachable with no gesture anyone has to be taught.
  if (on) {
    return (
      <Link
        href="/favourites"
        aria-label={`Starred — open your favourites (${fav.items.length})`}
        title={`« ${here.auto} » is starred. Open your favourites (${fav.items.length})`}
        className="cahier-btn cahier-btn-sm"
        onContextMenu={(e) => {
          // Right-click unstars, so the page can be un-starred from here too.
          e.preventDefault();
          setFav(saveFavourites(toggleFavourite(fav, here, Date.now()).next));
        }}
      >
        ★
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={full ? `Favourites are full — ${MAX_ITEMS} is the limit` : `Star this page — ${here.auto}`}
      title={full
        ? `Favourites are full (${MAX_ITEMS}). Remove one first.`
        : `Star « ${here.auto} » so you can come back to it`}
      className="cahier-btn cahier-btn-sm"
      onClick={() => {
        const r = toggleFavourite(fav, here, Date.now());
        setFull(r.full);
        if (!r.full) setFav(saveFavourites(r.next));
      }}
    >
      ☆
    </button>
  );
}
