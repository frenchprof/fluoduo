import Link from "next/link";
import { notFound } from "next/navigation";
import LetrisGame from "@/games/letris/LetrisGame";
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
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/letris" className="text-slate-400 hover:text-white">
            ← Letris sets
          </Link>
          <span className="text-slate-500">{set.title}</span>
        </div>
      </div>
      <LetrisGame set={set} />
    </main>
  );
}
