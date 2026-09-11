"use client";

/** `/welcome` MOVED TO `/` on 2026-09-09 (Dan: *"the first i see must be the
 *  one with Welcome to FluOLinGo in the horizon"*). The address stays and
 *  forwards, because a URL that has been shared or bookmarked must still land
 *  somewhere — the same bargain `/skills`, `/practice` and `/games` took when
 *  their hubs retired the same day.
 *
 *  It FORWARDS rather than rendering a second copy: two addresses drawing one
 *  page is how they drift apart, and this one is the app's front door. `replace`,
 *  so Back does not bounce through it. */
import { useEffect } from "react";

export default function WelcomeRedirect() {
  useEffect(() => {
    window.location.replace(`/${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
