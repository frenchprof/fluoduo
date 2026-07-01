import Link from "next/link";

const steps = [
  {
    slug: "/games/directions/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the verb phrases and completions used in directions.",
    label: "Start the lesson",
  },
  {
    slug: "/games/matching",
    name: "2. Matching",
    emoji: "🔗",
    desc: "Match each verb phrase with a valid completion.",
    label: "Match the pairs",
  },
  {
    slug: "/games/directions/map",
    name: "3. Practice map",
    emoji: "🗺️",
    desc: "Assemble the route from A to B by clicking phrases.",
    label: "Open the map",
  },
];

export default function DirectionsUnitPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Apps &amp; Games
          </Link>
          <span className="text-slate-500">Quel est le chemin … ?</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Quel est le chemin pour … ?</h1>
          <p className="mt-1 text-slate-300">
            Learn then match the verb phrases used when giving directions.
          </p>
        </header>

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <li key={s.name}>
              <Link
                href={s.slug}
                className="group flex h-full flex-col rounded-lg border border-amber-400/40 bg-slate-900 p-5 transition hover:border-amber-300 hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                </div>
                <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
                <span className="mt-auto pt-3 text-xs font-semibold uppercase tracking-widest text-amber-300">
                  {s.label} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
