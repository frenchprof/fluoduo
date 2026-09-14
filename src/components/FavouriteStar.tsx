"use client";

/**
 * THE ★ — THE DOOR TO THE LIST, one button in the top bar, on every page.
 *
 * ⚠️ IT NO LONGER STARS ANYTHING (Dan, 2026-09-14: *"can you put 🤍 at the end
 * of each colore band. When users tap on it, they favourite it and it becomes
 * ❤️"*). Saving a page is the BAND's heart now, so a star that also toggled
 * would be a second control doing the first one's job on the same screen —
 * the two-doors fault Help was cut down for in September. What is left here is
 * the half the heart cannot do: reach the list.
 *
 * THAT ALSO RETIRES A GESTURE NOBODY COULD SEE. It used to tap-to-toggle,
 * long-press to open the list, and only link to the list once something was
 * starred — three behaviours on one glyph, two of them invisible. One tap,
 * one destination, always.
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

import { loadFavourites } from "@/lib/favourites";

export default function FavouriteStar({ activeKey }: { activeKey?: string }) {
  const [count, setCount] = useState<number | null>(null);

  const reread = useCallback(() => setCount(loadFavourites().items.length), []);

  useEffect(() => {
    // localStorage cannot be read during render on a static export.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    reread();
    // The band's heart and the Favourites page write the same key; the count
    // in the label must follow without a reload. `storage` fires for another
    // tab, the custom event for this document (which `storage` skips).
    window.addEventListener("storage", reread);
    window.addEventListener("fluolingo:favourites", reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener("fluolingo:favourites", reread);
    };
  }, [reread]);

  // `activeKey` is no longer read — the star names no page now — but the prop
  // stays so every caller does not have to change for a component that may
  // want it again. Referenced here so it is not an unused parameter.
  void activeKey;

  return (
    <Link
      href="/favourites"
      aria-label={count ? `Open your favourites (${count})` : "Open your favourites"}
      title={count
        ? `Your favourites (${count}). Save a page with the 🤍 on its coloured strip.`
        : "Your favourites. Save a page with the 🤍 on its coloured strip."}
      className="cahier-btn cahier-btn-sm"
    >
      ★
    </Link>
  );
}
