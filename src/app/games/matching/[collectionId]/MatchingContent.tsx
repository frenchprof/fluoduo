"use client";

import AuthGate from "@/components/AuthGate";
import GameFrame from "@/components/GameFrame";
import GameLanding from "@/components/GameLanding";
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
      {/* THE GAME SITS IN A PAGE, like the other four (Dan, 7 Sep: "can we have
          them embedded like the map, (with option to go full screen)", then
          "pages never lose their coloured strip at the top"). VocabulaRain and
          LexicaLater were wrapped that day; Match It and ComposeIt were the two
          that got missed, and both opened on a bare white game bar with nothing
          naming them. ⛶ on that bar still takes the board full-screen. */}
      <GameLanding activityKey="matching" title="Match It" bleed>
        <MatchingGame set={set} />
      </GameLanding>
    </AuthGate>
  );
}
