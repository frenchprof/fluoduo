import Link from "next/link";

const steps = [
  {
    slug: "/games/countries/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the 34 countries and their article (—, LE, LA, L', LES).",
    label: "Start the lesson",
  },
  {
    slug: "/games/letris/countries",
    name: "2. Letris",
    emoji: "🌍",
    desc: "Sort falling countries into the correct article column.",
    label: "Play Letris",
  },
];

export default function CountriesUnitPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Apps &amp; Games
          </Link>
          <span className="text-slate-500">C&apos;est quel pays ?</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">C&apos;est quel pays ?</h1>
          <p className="mt-1 text-slate-300">
            Learn then sort each country by its definite article.
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
