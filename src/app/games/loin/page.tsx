import Link from "next/link";

const steps = [
  {
    slug: "/games/loin/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the 12 prepositions of location, split into Group 1 and Group 2.",
    label: "Start the lesson",
  },
  {
    slug: "/games/letris/loin",
    name: "2. Letris",
    emoji: "📍",
    desc: "Sort each place phrase under the preposition group it belongs to.",
    label: "Play Letris",
  },
];

export default function LoinUnitPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← FluoLingo
          </Link>
          <span className="text-slate-500">C&apos;est loin ?</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">C&apos;est loin ?</h1>
          <p className="mt-1 text-slate-300">
            Prepositions of location — Group 1 (sur, sous, devant…) take LE / LA /
            L&apos; / LES. Group 2 (à côté de, près de…) take DU / DE LA / DE L&apos; / DES.
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
