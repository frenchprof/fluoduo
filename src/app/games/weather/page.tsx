import Link from "next/link";

const steps = [
  {
    slug: "/games/weather/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the 32 expressions with flippable flashcards (Got it / Review loop).",
    label: "Start with the lesson",
  },
  {
    slug: "/games/weather/match",
    name: "2. Matching",
    emoji: "🔗",
    desc: "Match French sentences with their meaning. Recognition warm-up.",
    label: "Match the pairs",
  },
  {
    slug: "/games/weather/mcq",
    name: "3. MCQ",
    emoji: "✅",
    desc: "Pick the correct French sentence from four options.",
    label: "Take the quiz",
  },
  {
    slug: "/games/weather/gap",
    name: "4. Gapfill",
    emoji: "✏️",
    desc: "Fill in the missing word(s) in each weather expression.",
    label: "Fill the gaps",
  },
  {
    slug: "/games/letris/weather",
    name: "5. Letris",
    emoji: "🌦️",
    desc: "Race the falling tiles — sort each expression under its starter clause.",
    label: "Play Letris",
  },
];

export default function WeatherUnitPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← FluoLingo
          </Link>
          <span className="text-slate-500">Quel temps fait-il ?</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Quel temps fait-il ?</h1>
          <p className="mt-1 text-slate-300">
            5-step weather unit — learn, then match, recognise, produce, and race.
            All five games share the same 32 expressions.
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
