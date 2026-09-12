"use client";

/**
 * /unit/N is a deep link into Home now (patch 25, 2026-08-17: "the separate
 * page dies; its content stays reachable from the map"). Anything still
 * pointing here — the shell's Unité flaps, DrillShell's back link, old
 * bookmarks, `/unit/2#SIO-023` — lands on `/home?unit=N#SIO-023`, where the
 * map scrolls to that region band and, with a hash, opens that SIO.
 * `replace`, so Back does not bounce here.
 *
 * IT AIMED AT /map UNTIL 12 SEP, when Home and the map merged and /map became
 * a redirect itself. Two replaces for one destination is what that left, so
 * this now names Home directly. The reader of the deep link is unchanged:
 * `MapBody` parses ?unit= and #SIO-0nn, and Home renders MapBody.
 */
import { useEffect } from "react";

export default function UnitRedirect({ unit }: { unit: number }) {
  useEffect(() => {
    const hash = window.location.hash || "";
    window.location.replace(`/home?unit=${unit}${hash}`);
  }, [unit]);
  return null;
}
