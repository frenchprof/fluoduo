"use client";

/** /carte lived one day (21 Aug) before the everything-in-English rule
 *  renamed it /map — any QR sheet printed that day, and any bookmark, lands
 *  here and forwards with its query + hash intact. `replace`, so Back does
 *  not bounce through.
 *
 *  IT AIMS AT /home NOW, NOT /map (12 Sep). /map became a redirect to Home the
 *  day the two pages merged, so leaving this pointed there made /carte a
 *  double bounce — two replaces for one destination. Forwarding to a forward
 *  works, which is exactly why it would have gone unnoticed. */
import { useEffect } from "react";

export default function CarteRedirect() {
  useEffect(() => {
    window.location.replace(`/home${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
