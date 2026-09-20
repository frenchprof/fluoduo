import { notFound } from "next/navigation";
import LetrisGame from "@/games/letris/LetrisGame";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import { getLetrisSet, listLetrisSets } from "@/games/letris/sets";
import { stopForDeck } from "@/lib/stopTag";
import { sioHref } from "@/lib/routes";

export function generateStaticParams() {
  return listLetrisSets({ includeExpert: true }).map((s) => ({ setId: s.slug }));
}

// The game wears its own GameFrame (patch 23); the page adds the sign-in wall.
export default async function LetrisSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = getLetrisSet(setId);
  if (!set) notFound();

  return (
    <AuthGate what="play">
      {/* The game sits IN a page (Dan, 7 Sep: "can we have them embedded like
          the map, (with option to go full screen)") — the band names the
          activity above the board, and ⛶ on the game bar takes it full.
          `deck` IS the set's slug, and it is what makes the band's ✕ go UP
          ONE LEVEL to the stop this set serves (Dan, 2026-09-20) instead of
          falling to Home — the same prop LexicaLocker's deck page passes.
          A set with no stop keeps the Home default, which is right for it. */}
      <GameLanding activityKey="vocabularain" bleed deck={setId}>
        <LetrisGame set={set} exitHref={stopForDeck(setId) ? sioHref(stopForDeck(setId)!.id) : "/games/vocabularain"} />
      </GameLanding>
    </AuthGate>
  );
}
