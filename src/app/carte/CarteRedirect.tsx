"use client";

/** /carte lived one day (21 Aug) before the everything-in-English rule
 *  renamed it /map — any QR sheet printed that day, and any bookmark, lands
 *  here and forwards with its query + hash intact. `replace`, so Back does
 *  not bounce through. */
import { useEffect } from "react";

export default function CarteRedirect() {
  useEffect(() => {
    window.location.replace(`/map${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
