"use client";

/**
 * The activity hubs are gone (patch 24, 2026-08-17). `/practice/flip-it`,
 * `/practice/grammarathon` (ActivityHub — fifty cards, 3969px on a phone) and
 * `/practice/speculearn` (the tile gallery) each listed the decks that
 * supported one activity; the Index now IS that list, for every activity,
 * with the learner's own results in the cells. The old routes still build so
 * bookmarks, the flap rail's history and the teacher page's links land
 * somewhere useful: here, then straight on to `/activities?activity=…`.
 * `replace`, so Back does not bounce through this page.
 */
import { useEffect } from "react";

function indexHref(activity: string): string {
  return `/activities?activity=${encodeURIComponent(activity)}`;
}

export default function IndexRedirect({ activity }: { activity: string }) {
  useEffect(() => {
    window.location.replace(indexHref(activity));
  }, [activity]);
  return null;
}
