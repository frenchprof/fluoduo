"use client";

/**
 * Marathon oral (Dan, 2026-07-15: "compile ALL the say-its into one space for
 * continuous oral practice") — every curated deck's Say It items in a single
 * shuffled run. Articles/prefixes are baked into fr here (the synthetic deck
 * has no letris columns to derive them from), item ids are preserved so every
 * say still feeds the Reviser and XP exactly like the per-deck pages.
 */
import { useMemo } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import SayItContent from "@/app/practice/say-it/[collectionId]/SayItContent";
import { CURATED } from "@/content/collections";
import { practiceItems } from "@/lib/collections/display";
import type { Collection, Item } from "@/lib/collections/schema";

// Letters aren't sayable words — the recognizer can't grade "bé" — so the
// alphabet deck sits this one out.
const EXCLUDED = new Set(["alphabet"]);

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}

function buildMarathonDeck(): Collection {
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const deck of CURATED) {
    if (EXCLUDED.has(deck.id)) continue;
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
  return {
    id: "oral-marathon",
    title: "Marathon oral",
    subtitle: "tous les decks, une seule course",
    langPair: "fr-en",
    owner: "curated",
    visibility: "public",
    unit: 4,
    lessonNo: 0,
    lessonSlug: "oral-marathon",
    tags: [],
    seq: 999,
    items,
  } as Collection;
}

export default function OralMarathonPage() {
  // ONE stable deck object — SayItContent reshuffles whenever its deck
  // identity changes, so this must not be rebuilt per render.
  const deck = useMemo(buildMarathonDeck, []);
  return (
    // Site row only, like ConjugaZone/Teacher — this space belongs to no
    // single deck, so there is no deck flap group to show.
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="oral" crumb="🎤 Marathon oral">
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🎤 Marathon oral <span className="text-base font-bold text-[color:var(--cahier-ink-soft)]">· {deck.items.length} mots</span>
        </h1>
      </div>
      <SayItContent collectionId="oral-marathon" deckOverride={deck} embedded />
    </CahierShell>
  );
}
