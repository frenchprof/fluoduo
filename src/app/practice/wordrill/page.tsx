"use client";

/**
 * WorDrill (Dan, 2026-07-15: "compile ALL the say-its into one space for
 * continuous oral practice"; named and given its flap the same day) — every
 * curated deck's Say It items in one shuffled run. The page lands on a unit
 * picker (Tout · Unité 0–4); each scope compiles its decks with articles/
 * prefixes baked into fr (the synthetic deck has no letris columns to derive
 * them from) and duplicates removed. Item ids are preserved so every say
 * feeds the Reviser and XP exactly like the per-deck pages.
 *
 * The picker is content-sized (patch 31, from Dan's design handoff — "DO WE
 * REALLY NEED SUCH MASSIVE BUTTONS ACROSS THE WIDTH???"): scopes are chips in
 * a wrapping row, not full-width bars in a grid. Each chip carries the last
 * words you were asked in that scope as coloured dots — see recentMarks().
 */
import { useMemo, useState, useSyncExternalStore } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import SayItContent from "@/app/practice/say-it/[collectionId]/SayItContent";
import { CURATED } from "@/content/collections";
import { UNIT_META } from "@/content/sios";
import { practiceItems } from "@/lib/collections/display";
import { loadProgress, type ItemSrs } from "@/lib/progress";
import type { Collection, Item } from "@/lib/collections/schema";

// Letters aren't sayable words — the recognizer can't grade "bé" — so the
// alphabet deck sits this one out.
const EXCLUDED = new Set(["alphabet"]);
const UNITS = [0, 1, 2, 3, 4];

/** How many past words a scope chip reports. Eight fits the chip at 390px. */
const CHIP_DOTS = 8;
const DAY = 86_400_000;

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}

/**
 * The last words you were asked in a scope, newest first.
 *
 * The design drew these dots as session history, which nothing stores — the
 * activity ledger keeps {right, wrong} TALLIES per activity × outcome, not a
 * sequence. `itemSrs` does carry it, implicitly: an answer sets
 * `due = now + intervalDays`, so `due - intervalDays` is when the word was
 * last answered, and `intervalDays` is how it went (0 = missed and reset,
 * 1 = repaired but fragile, more = holding). That is the same "one definition
 * of weak" the Reviser and /moi read (progress.ts isWeakSrs), so the dots
 * cannot drift from the rest of the app.
 *
 * Words never asked have no srs entry and no dot — an empty chip is a scope
 * you have not started, which is the honest thing for it to say.
 */
function recentMarks(items: Item[], srs: Record<string, ItemSrs>): ("ok" | "shaky" | "bad")[] {
  const seen: { at: number; interval: number }[] = [];
  for (const it of items) {
    const s = it.id ? srs[it.id] : undefined;
    if (!s) continue;
    seen.push({ at: s.due - s.intervalDays * DAY, interval: s.intervalDays });
  }
  return seen
    .sort((a, b) => b.at - a.at)
    .slice(0, CHIP_DOTS)
    .map((s) => (s.interval === 0 ? "bad" : s.interval <= 1 ? "shaky" : "ok"));
}

const MARK_COLOR: Record<"ok" | "shaky" | "bad", string> = {
  ok: "var(--tier-good)",
  shaky: "var(--tier-medium)",
  bad: "var(--tier-weak)",
};

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

// itemSrs is localStorage, so it is read through a subscription rather than
// an effect (useSyncExternalStore — patch 24's answer to the
// set-state-in-effect rule). The server snapshot is -1: chips render without
// dots until hydration, which is also the truth for a first-time visitor.
let version = 0;
function subscribeProgress(cb: () => void) {
  const bump = () => { version += 1; cb(); };
  window.addEventListener("fluolingo:progress-updated", bump);
  return () => window.removeEventListener("fluolingo:progress-updated", bump);
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

  const tick = useSyncExternalStore(subscribeProgress, () => version, () => -1);
  const mounted = tick >= 0;

  const marks = useMemo(() => {
    const m = new Map<number | "all", ("ok" | "shaky" | "bad")[]>();
    if (!mounted) return m;
    const srs: Record<string, ItemSrs> = loadProgress().itemSrs;
    for (const [k, d] of decks) m.set(k, recentMarks(d.items, srs));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick IS the dependency: it names the external state
  }, [decks, mounted, tick]);

  const chipDots = (key: number | "all") => {
    const list = marks.get(key) ?? [];
    if (list.length === 0) return null;
    return (
      <span className="flex shrink-0 items-center gap-[2px]" aria-hidden>
        {list.map((m, i) => (
          <span
            key={i}
            className="block h-1 w-1 rounded-full"
            style={{ background: MARK_COLOR[m] }}
          />
        ))}
      </span>
    );
  };

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "wordrill")} active="wordrill">
      {deck === null ? (
        // Landing: pick the scope. Tout first, then the five units, each
        // wearing its accent, its recent marks and its word count — all three
        // sized to their content so the row wraps instead of striping the page.
        <div className="cahier-foolscap mx-auto max-w-2xl px-4 pb-6 pt-2">
          <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">🎙️ WorDrill</h1>
          <p className="mb-4 mt-1 text-sm text-[color:var(--cahier-ink-soft)]">Say the French out loud — pick your ground.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setScope("all")}
              className="cahier-btn cahier-btn-accent flex items-center gap-2"
            >
              <span className="whitespace-nowrap font-black">🌍 Tout</span>
              {chipDots("all")}
              <span className="fluo-mono shrink-0 text-xs font-bold">{decks.get("all")!.items.length}</span>
            </button>
            {UNITS.map((u) => {
              const meta = UNIT_META[u] ?? { label: `Unité ${u}`, subtitle: "", emoji: "📚" };
              const n = decks.get(u)!.items.length;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setScope(u)}
                  title={meta.subtitle}
                  className="cahier-btn flex items-center gap-2 bg-white"
                  style={{ borderColor: UNIT_ACCENTS[u], boxShadow: `0 2px 0 0 ${UNIT_ACCENTS[u]}` }}
                >
                  <span className="whitespace-nowrap font-black">
                    {meta.emoji} {meta.label}
                  </span>
                  {chipDots(u)}
                  <span className="fluo-mono shrink-0 text-xs font-bold" style={{ color: UNIT_ACCENTS[u] }}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <SayItContent
          key={deck.id}
          collectionId={deck.id}
          deckOverride={deck}
          embedded
          variant="wordrill"
          onExit={() => setScope(null)}
        />
      )}
    </CahierShell>
  );
}
