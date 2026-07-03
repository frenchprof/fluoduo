import Link from "next/link";
import { notFound } from "next/navigation";
import LetrisGame from "@/games/letris/LetrisGame";
import AuthGate from "@/components/AuthGate";
import { getLetrisSet, listLetrisSets } from "@/games/letris/sets";

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
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm font-bold">
            <Link href="/games/letris" className="text-sky-700 hover:text-sky-900">
              ← Vocabularain sets
            </Link>
            <span className="text-sky-900/60">☁️ {set.title}</span>
          </div>
        </div>
        <LetrisGame set={set} />
      </main>
    </AuthGate>
  );
}
