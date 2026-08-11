"use client";

/**
 * WorDrill (Dan, 2026-07-15: "compile ALL the say-its into one space for
 * continuous oral practice"; named and given its flap the same day) — every
 * curated deck's Say It items in one shuffled run. The page lands on a unit
 * picker (Tout · Unité 0–4); each scope compiles its decks with articles/
 * prefixes baked into fr (the synthetic deck has no letris columns to derive
 * them from) and duplicates removed. Item ids are preserved so every say
 * feeds the Reviser and XP exactly like the per-deck pages.
 */
import { useMemo, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import SayItContent from "@/app/practice/say-it/[collectionId]/SayItContent";
import { CURATED } from "@/content/collections";
import { UNIT_META } from "@/content/sios";
import { practiceItems } from "@/lib/collections/display";
import type { Collection, Item } from "@/lib/collections/schema";

// Letters aren't sayable words — the recognizer can't grade "bé" — so the
// alphabet deck sits this one out.
const EXCLUDED = new Set(["alphabet"]);
const UNITS = [0, 1, 2, 3, 4];

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}

function buildDrillDeck(unit: number | "all"): Collection {
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const deck of CURATED) {
    if (EXCLUDED.has(deck.id)) continue;
    if (unit !== "all" && deck.unit !== unit) continue;
    for (const it of practiceItems(deck)) {
      if (!it.fr || !it.en) continue;
      const art = articleOf(deck, it);
      const fr = art ? (art.endsWith("'") ? `${art}${it.fr}` : `${art} ${it.fr}`) : it.fr;
      const key = fr.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) continue; // marché lives in one deck here, not three
      seen.add(key);
      // col: tags are dropped — the article is already in fr, and the
      // synthetic deck has no columns to re-derive it from.
      items.push({ ...it, fr, tags: [] });
    }
  }
  const label = unit === "all" ? "all" : UNIT_META[unit]?.label ?? `Unité ${unit}`;
  return {
    id: unit === "all" ? "wordrill" : `wordrill-u${unit}`,
    title: `WorDrill — ${label}`,
    subtitle: "un seul drill",
    langPair: "fr-en",
    owner: "curated",
    visibility: "public",
    unit: unit === "all" ? 4 : unit,
    lessonNo: 0,
    lessonSlug: "wordrill",
    tags: [],
    seq: 999,
    items,
  } as Collection;
}

export default function WorDrillPage() {
  // ONE stable deck object per scope — SayItContent reshuffles whenever its
  // deck identity changes, so these must not be rebuilt per render.
  const decks = useMemo(
    () =>
      new Map<number | "all", Collection>([
        ["all", buildDrillDeck("all")],
        ...UNITS.map((u) => [u, buildDrillDeck(u)] as const),
      ]),
    [],
  );
  const [scope, setScope] = useState<number | "all" | null>(null);
  const deck = scope === null ? null : decks.get(scope)!;

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "wordrill")} active="wordrill">
      {deck === null ? (
        // Landing: pick the scope. Tout first, then the five units, each
        // wearing its accent and word count.
        <div className="mx-auto max-w-2xl px-4 pb-6 pt-2">
          <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">🎙️ WorDrill</h1>
          <p className="mb-4 mt-1 text-sm text-[color:var(--cahier-ink-soft)]">Continuous oral practice — pick your ground.</p>
          <button
            type="button"
            onClick={() => setScope("all")}
            className="mb-3 flex w-full items-center justify-between rounded-xl border-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)] px-4 py-3 text-left font-black text-[color:var(--cahier-ink)] shadow-[3px_3px_0_var(--cahier-ink)] transition hover:-translate-y-0.5"
          >
            <span>🌍 Unités 0–4</span>
            <span className="fluo-mono text-sm">{decks.get("all")!.items.length} words</span>
          </button>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {UNITS.map((u) => {
              const meta = UNIT_META[u] ?? { label: `Unité ${u}`, subtitle: "", emoji: "📚" };
              const n = decks.get(u)!.items.length;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setScope(u)}
                  className="flex items-center justify-between rounded-xl border-2 bg-white px-4 py-3 text-left font-black text-[color:var(--cahier-ink)] shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5"
                  style={{ borderColor: UNIT_ACCENTS[u] }}
                >
                  <span>
                    {meta.emoji} {meta.label}
                    {meta.subtitle && <span lang="fr" className="ml-1.5 hidden text-sm font-bold text-[color:var(--cahier-ink-soft)] sm:inline">{meta.subtitle}</span>}
                  </span>
                  <span className="fluo-mono shrink-0 pl-2 text-sm" style={{ color: UNIT_ACCENTS[u] }}>{n} words</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-4">
            <button type="button" onClick={() => setScope(null)} className="fluo-btn fluo-btn-sm fluo-btn-ghost">
              ← Units
            </button>
            <h1 className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">
              🎙️ {deck.title} <span className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">· {deck.items.length} words</span>
            </h1>
          </div>
          {/* key: switching scope must reset the run, not resume the old one */}
          <SayItContent key={deck.id} collectionId={deck.id} deckOverride={deck} embedded />
        </>
      )}
    </CahierShell>
  );
}
