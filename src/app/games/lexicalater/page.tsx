import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { shortTitle } from "@/lib/shortTitles";

/** The Lexicalator gallery — Cahier skin like every other section page
 *  (Dan, 2026-07-15), compact one-grid layout with the Unité as a colored
 *  chip on each tile. */

const UNIT_TINTS: Record<number, string> = { 0: "#fbe3ec", 1: "#def3f5", 2: "#fbeec4", 3: "#ece2fa", 4: "#fbe6cf" };

export default function LexicalatorIndexPage() {
  const decks = CURATED.filter((c) => isLexReadyId(c.id)).sort((a, b) => (a.unit ?? 9) - (b.unit ?? 9));
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="lexicalator" crumb="🧰 LexicaLater">
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-2">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🧰 LexicaLater
          <span className="ml-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">forge the French from the syllables on the belt</span>
        </h1>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {decks.map((c) => {
            const u = c.unit ?? 0;
            return (
              <Link
                key={c.id}
                href={`/games/lexicalater/${c.id}`}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: UNIT_ACCENTS[u] }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black leading-tight text-[color:var(--cahier-ink)]" lang="fr" title={c.title}>
                    {shortTitle(c.id, c.title)}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: UNIT_ACCENTS[u] }}>
                    U{u}
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
