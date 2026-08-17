import { notFound } from "next/navigation";
import LetrisGame from "@/games/letris/LetrisGame";
import AuthGate from "@/components/AuthGate";
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
      <LetrisGame set={set} />
    </AuthGate>
  );
}
