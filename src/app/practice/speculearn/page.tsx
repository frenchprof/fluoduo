import Link from "next/link";
import BackLink from "@/components/BackLink";
import { CURATED } from "@/content/collections";
import { DEVINE_READY, BUILDING_EMOJI, SPECULEARN_EXCLUDED_ITEMS } from "@/lib/collections/devineReady";
import PHOTO_ITEMS from "@/content/devine-aliments.json";
import { shortTitle } from "@/lib/shortTitles";

/**
 * The SpecuLearn gallery (Dan, 2026-07-15: "have them consolidated as a page
 * … organised like how we did for VocabulaRain and Lexicalator") — every
 * guess-first deck as a tile, grouped by Unité, word counts matching what the
 * game actually serves (photo bank for aliments, building emojis excluded).
 */

// Unit accent colours — same palette as the site flaps / letris gallery.
const UNIT_COLORS: Record<string, { accent: string; tint: string }> = {
  "Unité 0": { accent: "#e0567f", tint: "#fbe3ec" },
  "Unité 1": { accent: "#2bb6c2", tint: "#def3f5" },
  "Unité 2": { accent: "#e3a700", tint: "#fbeec4" },
  "Unité 3": { accent: "#8a5fd4", tint: "#ece2fa" },
  "Unité 4": { accent: "#e8852e", tint: "#fbe6cf" },
};

/** The tile face: one emoji standing for the deck (aliments shows a photo
 *  camera — its images are real photos, not emoji). */
const DECK_FACE: Record<string, string> = {
  aliments: "📸",
  consignes: "📢",
  "countries-letris": "🗺️",
  languages: "🗣️",
  "lieux-letris": "🌳",
  commerces: "🧺",
};

function playableCount(id: string): number {
  if (id === "aliments") return PHOTO_ITEMS.length;
  const deck = CURATED.find((c) => c.id === id);
  return (deck?.items ?? []).filter((i) => i.fr && i.emoji && !BUILDING_EMOJI.has(i.emoji) && !SPECULEARN_EXCLUDED_ITEMS.has(i.id)).length;
}

export default function SpecuLearnIndexPage() {
  const decks = DEVINE_READY
    .map((id) => CURATED.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const units = [...new Set(decks.map((d) => d.unit ?? 0))].sort((a, b) => a - b);
  return (
    <main
      className="min-h-screen text-indigo-950"
      style={{ background: "linear-gradient(180deg, #ded1fb 0%, #f0e9ff 45%, #fbf9ff 100%)" }}
    >
      <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm font-bold">
          <BackLink fallback="/" className="text-indigo-700 hover:text-indigo-900">
            ← Back
          </BackLink>
          <span className="text-indigo-900/60">🔮 SpecuLearn</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-indigo-700" style={{ textShadow: "0 2px 0 #fff" }}>
            🔮 Specu<span className="text-indigo-400">Learn</span>
          </h1>
          <p className="mt-1 font-semibold text-indigo-900/70">
            Guess first — trying before you know is how the word sticks.
          </p>
        </header>

        {units.map((u) => {
          const col = UNIT_COLORS[`Unité ${u}`] ?? UNIT_COLORS["Unité 0"];
          const group = decks.filter((d) => (d.unit ?? 0) === u);
          return (
            <section key={u} className="mb-8">
              <h2 className="mb-3 inline-block rounded-full px-4 py-1 text-base font-black text-white" style={{ background: col.accent }}>
                Unité {u}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((d) => (
                  <Link
                    key={d.id}
                    href={`/practice/speculearn/${d.id}`}
                    className="group flex h-full flex-col items-center rounded-2xl border-2 border-b-4 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: col.accent }}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: col.tint }} aria-hidden>
                      {DECK_FACE[d.id] ?? "🔮"}
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm font-black leading-snug text-indigo-950" lang="fr" title={d.title}>
                      {shortTitle(d.id, d.title)}
                    </span>
                    <span className="mt-auto pt-2 text-[11px] font-bold" style={{ color: col.accent }}>
                      🔮 {playableCount(d.id)} mots
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
