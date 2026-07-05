"use client";

import CahierShell, { withActive, type ShellTab } from "@/components/CahierShell";
import MatchingGame from "@/games/matching/MatchingGame";
import { toMatchingSet } from "@/games/matching/toMatchingSet";
import { CURATED } from "@/content/collections";

// The Directions unit hub was dissolved (2026-07-05) — this page now stands
// alone with a minimal flap rail.
const TABS: ShellTab[] = [
  { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
  { key: "matching", label: "Match It", emoji: "🔗" },
];

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
      <CahierShell tabs={withActive(TABS, "matching")} active="matching" crumb="Matching">
        <p className="p-6 text-[color:var(--cahier-ink-soft)]">No matching collection found.</p>
      </CahierShell>
    );
  }
  const set = toMatchingSet(collection);
  return (
    <CahierShell tabs={withActive(TABS, "matching")} active="matching" crumb="Matching">
      <MatchingGame set={set} />
    </CahierShell>
  );
}
