"use client";

import Link from "next/link";
import CahierShell, { withActive } from "@/components/CahierShell";
import { WEATHER_TABS } from "@/games/weather/tabs";

const steps = [
  {
    slug: "/games/weather/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the 32 expressions with flippable flashcards (Got it / Review loop).",
  },
  {
    slug: "/games/weather/match",
    name: "2. Matching",
    emoji: "🔗",
    desc: "Match French sentences with their meaning. Recognition warm-up.",
  },
  {
    slug: "/games/weather/mcq",
    name: "3. MCQ",
    emoji: "✅",
    desc: "Pick the correct French sentence from four options.",
  },
  {
    slug: "/games/weather/gap",
    name: "4. Gapfill",
    emoji: "✏️",
    desc: "Fill in the missing word(s) in each weather expression.",
  },
  {
    slug: "/games/letris/weather",
    name: "5. Letris",
    emoji: "🌦️",
    desc: "Race the falling tiles — sort each expression under its starter clause.",
  },
];

export default function WeatherUnitPage() {
  return (
    <CahierShell tabs={withActive(WEATHER_TABS, "unit")} active="unit" crumb="Quel temps fait-il ?">
      <div className="mx-auto max-w-5xl">
        <h1 className="cahier-display mb-6 text-3xl font-black text-[color:var(--cahier-ink)]">
          <span className="cahier-hl">Quel temps fait-il ?</span>
        </h1>

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <li key={s.name}>
              <Link
                href={s.slug}
                className="group flex h-full flex-col rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-5 transition hover:border-[color:var(--cahier-ink)] hover:bg-[color:var(--cahier-paper-2)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <h2 className="text-lg font-black text-[color:var(--cahier-ink)]">{s.name}</h2>
                </div>
                <p className="mt-2 text-sm text-[color:var(--cahier-ink-soft)]">{s.desc}</p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </CahierShell>
  );
}
