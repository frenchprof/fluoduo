"use client";

/**
 * THE 🤍 AT THE END OF EVERY COLOURED BAND.
 *
 * Dan, 2026-09-14: *"can you put 🤍 at the end of each colore band. When users
 * tap on it, they favourite it and it becomes ❤️"*.
 *
 * IT IS THE ACTION, AND THE ★ IN THE BAR IS NOW ONLY THE DOOR. Until today the
 * top bar's star did both jobs — tap to star the page, tap again (once
 * starred) to open the list — because it was the only favourites control in
 * the app and the list had to be reachable somehow. With a heart on every band
 * that double duty is a second control doing the first one's job on the same
 * screen, which is the two-doors fault Help was cut down for in September. So
 * the work is split where it now falls naturally:
 *
 *     band 🤍 / ❤️   favourite THIS page, and unfavourite it
 *     bar  ★         open your favourites, always, one tap
 *
 * WHY A HEART AND NOT A SECOND STAR: they are not the same control, and giving
 * them one glyph would say they were. The band's mark answers "is this page
 * saved?" and the bar's answers "where are the saved ones?".
 *
 * ── WHY IT READS AFTER MOUNT ──────────────────────────────────────────────
 * `output: "export"` prerenders every page, so localStorage does not exist
 * when this renders on the server, and the path is only known in the browser.
 * It renders nothing until the real value arrives rather than drawing a hollow
 * heart that might be about to turn red — a mark that flips a frame after the
 * band paints reads as the page changing its mind.
 */

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

export default function FavouriteHeart({ activeKey }: { activeKey?: string }) {
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
    // The Favourites page and the bar's ★ write the same key; a favourite
    // removed in either place must go hollow here without a reload. Both
    // events matter: `storage` fires for another tab, the custom one for this
    // document (which `storage` skips).
    window.addEventListener("storage", reread);
    window.addEventListener("fluolingo:favourites", reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener("fluolingo:favourites", reread);
    };
  }, [reread]);

  if (!fav || !here) return null;

  const on = isStarred(fav, here.href);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={
        on ? `Saved — tap to remove « ${here.auto} » from your favourites`
        : full ? `Favourites are full — ${MAX_ITEMS} is the limit`
        : `Save « ${here.auto} » to your favourites`
      }
      title={
        on ? `Saved. Tap to remove it.`
        : full ? `Favourites are full (${MAX_ITEMS}). Remove one first.`
        : `Save this page so you can come back to it`
      }
      onClick={() => {
        const r = toggleFavourite(fav, here, Date.now());
        setFull(r.full);
        if (!r.full) setFav(saveFavourites(r.next));
      }}
      /* `-my-1` for the band's own reason: the strip's height is set by its
         one-line title, and an untrimmed 36px control would grow it. The tap
         target is still 44px via `fluo-hit44`, which is the finger and not a
         size (verify270). */
      className="fluo-hit44 -my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[19px] leading-none transition hover:bg-black/10"
    >
      <span aria-hidden>{on ? "❤️" : "🤍"}</span>
    </button>
  );
}
