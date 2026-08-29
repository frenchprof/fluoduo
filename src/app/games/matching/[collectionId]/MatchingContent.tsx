"use client";

import AuthGate from "@/components/AuthGate";
import GameFrame from "@/components/GameFrame";
import MatchingGame from "@/games/matching/MatchingGame";
import { toMatchingSet } from "@/games/matching/toMatchingSet";
import { CURATED } from "@/content/collections";

// Match It wears the same GameFrame as the other five games (patch 23) — it
// used to sit inside CahierShell with the flap rail, the only game that did.
export default function MatchingContent({ collectionId }: { collectionId: string }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  if (!collection) {
    return (
      <GameFrame title="🔗 Match It" exitHref="/games/matching" progress={null}>
        <p className="p-6 text-[color:var(--cahier-ink-soft)]">No matching deck <code>{collectionId}</code>.</p>
      </GameFrame>
    );
  }
  const set = toMatchingSet(collection);
  return (
    <AuthGate what="play">
      <MatchingGame set={set} />
    </AuthGate>
  );
}
