"use client";

import CahierShell, { withActive } from "@/components/CahierShell";
import MatchingGame from "@/games/matching/MatchingGame";
import { toMatchingSet } from "@/games/matching/toMatchingSet";
import { CURATED } from "@/content/collections";
import { DIRECTIONS_TABS } from "@/games/directions/tabs";

// Source the deck from the unified collection layer instead of raw JSON.
// (Curated decks are bundled, so this stays static — no async/auth. When
//  user-created Matching decks land, this calls loadCollections(); the game +
//  adapter are unchanged.)
const collection =
  CURATED.find((c) => c.id === "directions-matching") ??
  CURATED.find((c) => c.gameConfig?.matching);

export default function MatchingPage() {
  if (!collection) {
    return (
      <CahierShell tabs={withActive(DIRECTIONS_TABS, "matching")} active="matching" crumb="Matching">
        <p className="p-6 text-[color:var(--cahier-ink-soft)]">No matching collection found.</p>
      </CahierShell>
    );
  }
  const set = toMatchingSet(collection);
  return (
    <CahierShell tabs={withActive(DIRECTIONS_TABS, "matching")} active="matching" crumb="Matching">
      <MatchingGame set={set} />
    </CahierShell>
  );
}
