"use client";

import Link from "next/link";
import CahierShell, { withActive } from "@/components/CahierShell";
import { DIRECTIONS_TABS } from "@/games/directions/tabs";

const steps = [
  {
    slug: "/games/directions/lesson",
    name: "1. Lesson",
    emoji: "📚",
    desc: "Learn the verb phrases and completions used in directions.",
  },
  {
    slug: "/games/matching",
    name: "2. Matching",
    emoji: "🔗",
    desc: "Match each verb phrase with a valid completion.",
  },
  {
    slug: "/games/directions/map",
    name: "3. Practice map",
    emoji: "🗺️",
    desc: "Assemble the route from A to B by clicking phrases.",
  },
];

export default function DirectionsUnitPage() {
  return (
    <CahierShell tabs={withActive(DIRECTIONS_TABS, "unit")} active="unit" crumb="Quel est le chemin … ?">
      <div className="mx-auto max-w-5xl">
        <h1 className="cahier-display mb-6 text-3xl font-black text-[color:var(--cahier-ink)]">
          <span className="cahier-hl">Quel est le chemin pour … ?</span>
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
