import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { SPECULEARN_READY, BUILDING_EMOJI, SPECULEARN_EXCLUDED_ITEMS } from "@/lib/collections/speculearnReady";
import PHOTO_ITEMS from "@/content/devine-aliments.json";
import { shortTitle } from "@/lib/shortTitles";
import TileKeys from "./TileKeys";

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
  const decks = SPECULEARN_READY
    .map((id) => CURATED.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .sort((a, b) => (a.unit ?? 0) - (b.unit ?? 0));
  return (
    // Cahier skin like every other section page (Dan, 2026-07-15), still ONE
    // mobile screen: no per-unit sections; the unit lives as a colored chip
    // on each compact tile.
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="speculearn">
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-2">
        <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">
          🔮 SpecuLearn
          <span className="ml-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">guess first — that&rsquo;s how it sticks</span>
        </h1>
        <div className="mt-3">

        <TileKeys hrefs={decks.map((d) => `/practice/speculearn/${d.id}`)} />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {decks.map((d, i) => {
            const col = UNIT_COLORS[`Unité ${d.unit ?? 0}`] ?? UNIT_COLORS["Unité 0"];
            return (
              <Link
                key={d.id}
                href={`/practice/speculearn/${d.id}`}
                className="relative flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: col.accent }}
              >
                <span className="absolute right-1.5 top-1 hidden text-[10px] font-bold opacity-50 sm:block" aria-hidden>
                  {i + 1}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: col.tint }} aria-hidden>
                  {DECK_FACE[d.id] ?? "🔮"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-[color:var(--cahier-ink)]" lang="fr" title={d.title}>
                    {shortTitle(d.id, d.title)}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: col.accent }}>
                    U{d.unit ?? 0} · {playableCount(d.id)} words
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Why guess first — the pretesting effect, from the Chua & Pan
            (2026) NUS study Dan supplied (2026-07-15). Deliberately tiny:
            the menu must still end above the fold on a phone. */}
        <section className="mt-4 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-3">
          <h2 className="text-[13px] font-black text-[color:var(--cahier-ink)]">Why guess first? It&rsquo;s proven.</h2>
          <p className="mt-1 text-[12px] leading-snug text-[color:var(--cahier-ink)]/80">
            In 4 NUS experiments (341 beginners), <b>guessing a word before being taught it — then seeing
            the answer right away — beat passive study</b>, in both directions (Mot → Image and
            Image → Mot). Wrong guesses didn&rsquo;t hurt: with immediate feedback, the error is part of
            how the word sticks.
          </p>
          <p className="mt-1 text-[10px] font-semibold text-[color:var(--cahier-ink-soft)]">
            <a
              href="https://news.nus.edu.sg/study-confirms-guessing-before-learning-improves-memory-in-language-learning/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[color:var(--cahier-ink)]"
            >
              Chua &amp; Pan (2026), <i>Cognitive Research: Principles and Implications</i> — the pretesting effect ↗
            </a>
          </p>
        </section>
        </div>
      </div>
    </CahierShell>
  );
}
