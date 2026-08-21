"use client";

/**
 * /unit/N is a deep link into Home now (patch 25, 2026-08-17: "the separate
 * page dies; its content stays reachable from the map"). Anything still
 * pointing here — the shell's Unité flaps, DrillShell's back link, old
 * bookmarks, `/unit/2#SIO-023` — lands on `/carte?unit=N#SIO-023`, where
 * La Carte scrolls the map to that region band, opens the unit's list and,
 * with a hash, that SIO's popup. `replace`, so Back does not bounce here.
 */
import { useEffect } from "react";

export default function UnitRedirect({ unit }: { unit: number }) {
  useEffect(() => {
    const hash = window.location.hash || "";
    window.location.replace(`/carte?unit=${unit}${hash}`);
  }, [unit]);
  return null;
}
