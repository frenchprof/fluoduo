import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import { listLetrisSets } from "@/games/letris/sets";
import { CURATED } from "@/content/collections";
import { shortTitle } from "@/lib/shortTitles";

/** The VocabulaRain gallery — Cahier skin like every other section page
 *  (Dan, 2026-07-15: "the same skin for the index page as the others"),
 *  and just as compact as the SpecuLearn menu: one grid, the Unité as a
 *  colored chip on each tile instead of section headers. */

const UNIT_TINTS: Record<number, string> = { 0: "#fbe3ec", 1: "#def3f5", 2: "#fbeec4", 3: "#ece2fa", 4: "#fbe6cf" };
const EXTRA = { accent: "#5b8def", tint: "#e0eaff" };

export default function LetrisIndexPage() {
  const unitOf = (slug: string): number | null => {
    const c = CURATED.find((x) => x.id === slug || x.id === `${slug}-letris`);
    return c?.unit ?? null;
  };
  const sets = listLetrisSets()
    .map((s) => ({ ...s, unit: unitOf(s.slug) }))
    .sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9));
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="vocabularain" crumb="🌧️ VocabulaRain">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🌧️ VocabulaRain
          <span className="ml-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">steer each falling word into the right puddle</span>
        </h1>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {sets.map((s) => {
            const accent = s.unit === null ? EXTRA.accent : UNIT_ACCENTS[s.unit];
            const tint = s.unit === null ? EXTRA.tint : UNIT_TINTS[s.unit];
            return (
              <Link
                key={s.slug}
                href={`/games/vocabularain/${s.slug}`}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: accent }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: tint }} aria-hidden>
                  {s.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-[color:var(--cahier-ink)]" lang="fr" title={s.title}>
                    {shortTitle(s.slug, s.title)}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: accent }}>
                    {s.unit === null ? "Extra" : `U${s.unit}`} · 💧 {s.tileCount}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </CahierShell>
  );
}
