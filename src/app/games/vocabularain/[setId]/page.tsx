import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import LetrisGame from "@/games/letris/LetrisGame";
import AuthGate from "@/components/AuthGate";
import { getLetrisSet, listLetrisSets } from "@/games/letris/sets";
import GameBar from "@/components/GameBar";

export function generateStaticParams() {
  return listLetrisSets({ includeExpert: true }).map((s) => ({ setId: s.slug }));
}

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
      <main
        className="min-h-screen"
        style={{ background: "linear-gradient(180deg, #b5e0fb 0%, #e2f4ff 45%, #f4fbff 100%)" }}
      >
        <GameBar title={`☁️ ${set.title}`} up="/games/vocabularain" />
        <LetrisGame set={set} />
      </main>
    </AuthGate>
  );
}
