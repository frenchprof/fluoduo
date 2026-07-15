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
    .filter((c): c is NonNullable<typeof c> => !!c)
    .sort((a, b) => (a.unit ?? 0) - (b.unit ?? 0));
  return (
    // ONE mobile screen (Dan, 2026-07-15: "it should fit into a single
    // mobile screen") — no per-unit sections; the unit lives as a colored
    // chip on each compact tile instead.
    <main
      className="min-h-screen text-indigo-950"
      style={{ background: "linear-gradient(180deg, #ded1fb 0%, #f0e9ff 45%, #fbf9ff 100%)" }}
    >
      <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 text-sm font-bold">
          <BackLink fallback="/" className="text-indigo-700 hover:text-indigo-900">
            ← Back
          </BackLink>
          <span className="text-indigo-900/60">🔮 SpecuLearn</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-5">
        <header className="mb-4">
          <h1 className="text-2xl font-black tracking-tight text-indigo-700" style={{ textShadow: "0 2px 0 #fff" }}>
            🔮 Specu<span className="text-indigo-400">Learn</span>
            <span className="ml-2 text-sm font-semibold text-indigo-900/70">guess first — that&rsquo;s how it sticks</span>
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {decks.map((d) => {
            const col = UNIT_COLORS[`Unité ${d.unit ?? 0}`] ?? UNIT_COLORS["Unité 0"];
            return (
              <Link
                key={d.id}
                href={`/practice/speculearn/${d.id}`}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: col.accent }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: col.tint }} aria-hidden>
                  {DECK_FACE[d.id] ?? "🔮"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-indigo-950" lang="fr" title={d.title}>
                    {shortTitle(d.id, d.title)}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: col.accent }}>
                    U{d.unit ?? 0} · {playableCount(d.id)} mots
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Why guess first — the pretesting effect, from the Chua & Pan
            (2026) NUS study Dan supplied (2026-07-15). Deliberately tiny:
            the menu must still end above the fold on a phone. */}
        <section className="mt-4 rounded-xl border-2 border-indigo-200 bg-white/70 p-3">
          <h2 className="text-[13px] font-black text-indigo-900">Pourquoi deviner d&rsquo;abord ? C&rsquo;est prouvé.</h2>
          <p className="mt-1 text-[12px] leading-snug text-indigo-950/80">
            In 4 NUS experiments (341 beginners), <b>guessing a word before being taught it — then seeing
            the answer right away — beat passive study</b>, in both directions (Mot → Image and
            Image → Mot). Wrong guesses didn&rsquo;t hurt: with immediate feedback, the error is part of
            how the word sticks.
          </p>
          <p className="mt-1 text-[10px] font-semibold text-indigo-900/50">
            Chua &amp; Pan (2026), <i>Cognitive Research: Principles and Implications</i> — the pretesting effect.
          </p>
        </section>
      </div>
    </main>
  );
}
