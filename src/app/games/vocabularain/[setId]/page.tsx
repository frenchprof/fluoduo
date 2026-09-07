import { notFound } from "next/navigation";
import LetrisGame from "@/games/letris/LetrisGame";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import { getLetrisSet, listLetrisSets } from "@/games/letris/sets";

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
          activity above the board, and ⛶ on the game bar takes it full. */}
      <GameLanding activityKey="vocabularain" bleed>
        <LetrisGame set={set} />
      </GameLanding>
    </AuthGate>
  );
}
