"use client";

import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import MatchingGame from "@/games/matching/MatchingGame";
import { toMatchingSet } from "@/games/matching/toMatchingSet";
import { CURATED } from "@/content/collections";

export default function MatchingContent({ collectionId }: { collectionId: string }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  if (!collection) {
    return (
      <CahierShell active="matching">
        <p className="p-6 text-[color:var(--cahier-ink-soft)]">No matching deck <code>{collectionId}</code>.</p>
      </CahierShell>
    );
  }
  const set = toMatchingSet(collection);
  return (
    <CahierShell tabs={withActive(deckActivityTabs(collection.id), "matching")} active="matching">
      <MatchingGame set={set} />
    </CahierShell>
  );
}
