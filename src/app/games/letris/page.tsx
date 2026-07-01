import Link from "next/link";
import { listLetrisSets } from "@/games/letris/sets";

export default function LetrisIndexPage() {
  const sets = listLetrisSets();
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Apps &amp; Games
          </Link>
          <span className="text-slate-500">Letris</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Letris — pick a set</h1>
          <p className="mt-1 text-slate-300">
            Sort falling tiles into the correct grammar column.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((s) => (
            <Link
              key={s.slug}
              href={`/games/letris/${s.slug}`}
              className="group flex h-full flex-col rounded-lg border border-amber-400/40 bg-slate-900 p-5 transition hover:border-amber-300 hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  {s.emoji}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                  {s.subtitle && (
                    <p className="text-xs text-slate-400">{s.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {s.tileCount} tiles · {s.categoryCount} columns
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
