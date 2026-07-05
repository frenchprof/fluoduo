"use client";
// Le Cahier rebuild — reference implementation.

/**
 * FLIP IT — "Le Cahier" reference implementation.
 * Post-lesson study (flip + spaced repetition) with an optional Test-Yourself
 * mode (write the French, check it, keep your answer beside the correct one).
 * Three views share one deck + the same interactions (consistency principle):
 *   • Overview  — table; click a cell to cover/reveal; Show/Hide columns + rows;
 *                 section headers when grouped; per-row Reviewed/To-Review toggle.
 *   • Cards     — one card at a time; flip OR Test Yourself; keyboard shortcuts.
 *   • All Cards — every card; flip each, or Test Yourself each.
 * Spiral binding + index tabs come from CahierFrame.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import type { Collection, Item } from "@/lib/collections/schema";
import {
  loadLocal,
  setNote,
  syncIfDue,
  syncNow,
  graphemeCount,
  NOTE_MAX,
  type DeckNotes,
} from "@/lib/notes/store";
import { bareWord, displayEn, practiceItems } from "@/lib/collections/display";
import { loadBuckets, setBucket, type Bucket } from "@/lib/practice/buckets";
import { recordItemResult } from "@/lib/progress";
import { CahierFrame, TAB_HUES, type CahierTab } from "../CahierFrame";
import BackLink from "@/components/BackLink";

/* ─────────────────────────── step labels ─────────────────────────── */

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  // Number in a fixed left gutter; label + content share an indented right
  // column so the numbers stay a clean column and content never sits under
  // them (Dan, 2026-07-05: "the column of numbers should be kept clear of
  // content, which should be indented to the right").
  return (
    <div className="mb-4 flex gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-base font-black text-white shadow-[2px_2px_0_var(--cahier-hl,#ffe000)]">{n}</span>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="cahier-hl rounded-sm px-1.5 text-base font-black text-[color:var(--cahier-ink)]">{label}</span>
          <div className="h-[2px] flex-1 bg-[color:var(--cahier-ink)]/25" />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────── model ─────────────────────────── */

type Row = { item: Item; art: string; fr: string; full: string };
type View = "overview" | "cards" | "allcards";
type Order = "deck" | "shuffle" | "article" | "continent" | "col";
type SortKey = "en" | "fr" | "art" | "ms" | "fs" | "mp" | "fp" | "reviewed" | "notes";

const CTRL_LABEL =
  "w-20 shrink-0 text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]";

const VIEW_TABS: CahierTab[] = [
  { key: "overview", label: "▦ Overview", hue: TAB_HUES[0] },
  { key: "cards", label: "🂠 Cards", hue: TAB_HUES[1] },
  { key: "allcards", label: "▤ All Cards", hue: TAB_HUES[3] },
];

function articleOf(collection: Collection, item: Item): string {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const tag = item.tags.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}
function frFull(article: string, fr: string): string {
  if (!article) return fr;
  return article.endsWith("'") ? `${article}${fr}` : `${article} ${fr}`;
}
function shuffleArr<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}
/** Forgiving compare: drop accents + apostrophes + case + extra spaces. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
// Case-sensitive variant (accents/spacing still lenient): proper nouns must be
// capitalised — "france" is rejected, "France" required; adjectives stay lower-case.
function normCase(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const ART_RANK: Record<string, number> = { le: 0, la: 1, "l'": 2, les: 3, "": 9 };
const ART_ORDER = ["", "le", "la", "l'", "les", "un", "une", "des", "du", "de la", "de l'"];
const REGION_RANK: Record<string, number> = {
  africa: 0, americas: 1, asia: 2, europe: 3, oceania: 4, continents: 5,
};
const REGION_LABEL: Record<string, string> = {
  africa: "Afrique", americas: "Amériques", asia: "Asie",
  europe: "Europe", oceania: "Océanie", continents: "Continents",
};
function regionOf(it: Item): string {
  const t = it.tags.find((x) => x.startsWith("region:"));
  return t ? t.slice(7) : "";
}
const ART_LABEL: Record<string, string> = {
  le: "le", la: "la", "l'": "l'", les: "les", un: "un", une: "une",
  des: "des", du: "du", "de la": "de la", "de l'": "de l'", "": "∅",
};
// Optional row tints (low alpha so the ruled paper still reads through).
const ART_TINT: Record<string, string> = {
  le: "rgba(45,91,255,.10)", la: "rgba(209,17,73,.10)", "l'": "rgba(138,95,212,.12)",
  les: "rgba(43,182,194,.12)", un: "rgba(45,91,255,.10)", une: "rgba(209,17,73,.10)",
  des: "rgba(43,182,194,.12)", du: "rgba(45,91,255,.08)", "de la": "rgba(209,17,73,.08)",
  "": "rgba(120,120,140,.08)",
};
const REGION_TINT: Record<string, string> = {
  africa: "rgba(243,203,160,.32)", americas: "rgba(182,215,127,.32)", asia: "rgba(143,211,205,.32)",
  europe: "rgba(203,183,230,.32)", oceania: "rgba(226,144,182,.28)", continents: "rgba(240,210,78,.26)",
};

/* ─────────────────────────── page shell ─────────────────────────── */

export default function FlipItPage({
  collectionId,
}: {
  collectionId: string;
}) {
  const collection = CURATED.find((c) => c.id === collectionId);
  // EVERY item is flippable — emoji is decoration on the card face, not an
  // entry requirement. (An old emoji?.trim() filter here silently emptied
  // whole decks — matieres, the ateliers, alphabet… — which is why "No
  // flippable vocab" kept coming back no matter how the links were fixed.)
  const items = collection ? practiceItems(collection) : [];

  if (!collection || items.length === 0) {
    return (
      <main className="cahier-sheet relative min-h-screen">
        <div className="cahier-binding" aria-hidden />
        <div className="mx-auto max-w-3xl px-4 py-10 pl-16 text-center text-[color:var(--cahier-ink-soft)]">
          No flippable vocab in <code>{collectionId}</code>.{" "}
          <Link href="/" className="font-bold text-[color:var(--cahier-ink)] underline">Home</Link>
        </div>
      </main>
    );
  }
  return <FlipIt collection={collection} items={items} />;
}

function TopBar({ crumb }: { crumb: string }) {
  return (
    <div className="border-b-2 border-[color:var(--cahier-ink)]/15 bg-[var(--cahier-paper-2)]/85 backdrop-blur">
      <div className="flex items-center gap-3 py-3 pl-12 pr-4 sm:pl-16">
        <BackLink fallback="/" className="cahier-btn cahier-btn-sm">← Back</BackLink>
        <span className="cahier-display truncate text-sm font-bold text-[color:var(--cahier-ink)]">
          🃏 Flip It · {crumb}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── controller ─────────────────────────── */

function FlipIt({ collection, items }: { collection: Collection; items: Item[] }) {
  const isNat = items.some((i) => i.nat);

  const [view, setView] = useState<View>("overview");
  const [test, setTest] = useState(false); // Test Yourself mode
  const [showOptions, setShowOptions] = useState(false); // ⚙ popover holds ORDER/COLOUR/notes
  const [colorBy, setColorBy] = useState<"none" | "article" | "continent">("none");
  // All-Cards flip-everything lives here so its button can sit next to ⚙ Options
  const [flipAll, setFlipAll] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const flipEverything = () => { setFlipAll((f) => !f); setFlippedIds(new Set()); };
  const [editNotes, setEditNotes] = useState(false);
  const hasRegion = items.some((i) => i.tags.some((t) => t.startsWith("region:")));
  const [order, setOrder] = useState<Order>("deck");
  const [sortCol, setSortCol] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [seed, setSeed] = useState(0);
  const [buckets, setBuckets] = useState<Record<string, Bucket>>({});
  const [notes, setNotes] = useState<DeckNotes>({});

  useEffect(() => { setBuckets(loadBuckets(collection.id)); }, [collection.id]);
  useEffect(() => {
    setNotes(loadLocal(collection.id));
    syncIfDue(collection.id).then(setNotes).catch(() => {});
  }, [collection.id]);

  const base = useMemo<Row[]>(
    () => items.map((it) => {
      const art = articleOf(collection, it);
      return { item: it, art, fr: it.fr, full: frFull(art, it.fr) };
    }),
    [collection, items],
  );

  const articleOptions = useMemo(() => {
    const set = new Set<string>();
    base.forEach((r) => set.add(r.art));
    set.add("");
    return [...set].sort((a, b) => ART_ORDER.indexOf(a) - ART_ORDER.indexOf(b));
  }, [base]);
  const canGroupArt = !isNat && articleOptions.some((a) => a !== "");
  const artRank = useMemo(() => artRankOf(collection), [collection]);

  const ordered = useMemo(
    () => orderRows(base, order, seed, sortCol, sortDir, buckets, notes, artRank),
    [base, order, seed, sortCol, sortDir, buckets, notes, artRank],
  );

  function applyOrder(o: Order) {
    if (o === order) { setSortCol(null); setOrder("deck"); return; } // click active → back to deck order
    if (o === "shuffle") setSeed((s) => s + 1);
    setSortCol(null);
    setOrder(o);
  }
  // Header-driven sorting: click a column header to sort by it; click again to flip direction.
  function sortByCol(k: SortKey) {
    if (order === "col" && sortCol === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(k); setSortDir("asc"); setOrder("col"); }
  }
  // "Group by" merges ordering + section headers + row tint in one action.
  function setGroup(g: "none" | "article" | "continent") {
    setSortCol(null);
    setColorBy(g);
    setOrder(g === "none" ? "deck" : g);
  }
  const groupBy: "none" | "article" | "continent" =
    order === "article" ? "article" : order === "continent" ? "continent" : "none";
  function setRowBucket(id: string, b: Bucket) { setBuckets(setBucket(collection.id, id, b)); }

  // Show / Hide ROWS ---------------------------------------------------------
  type RowFilter = { kind: "all" | "none" | "reviewed" | "toReview" | "selected" } | { kind: "subset"; idx: number };
  const [rowFilter, setRowFilter] = useState<RowFilter>({ kind: "all" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subsetSize, setSubsetSize] = useState<number | null>(null);
  function toggleSel(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectMany(ids: string[], on: boolean) {
    setSelected((s) => { const n = new Set(s); ids.forEach((id) => (on ? n.add(id) : n.delete(id))); return n; });
  }
  const nReviewed = base.filter((r) => buckets[r.item.id] === "reviewed").length;
  const nToReview = base.length - nReviewed;
  const subsetCount = subsetSize && subsetSize > 0 ? Math.ceil(ordered.length / subsetSize) : 0;

  const rows = useMemo(() => {
    if (rowFilter.kind === "none") return [];
    if (rowFilter.kind === "subset" && subsetSize) {
      const start = rowFilter.idx * subsetSize;
      return ordered.slice(start, start + subsetSize);
    }
    return ordered.filter((r) => {
      if (rowFilter.kind === "reviewed") return buckets[r.item.id] === "reviewed";
      if (rowFilter.kind === "toReview") return buckets[r.item.id] !== "reviewed";
      if (rowFilter.kind === "selected") return selected.has(r.item.id);
      return true;
    });
  }, [ordered, rowFilter, subsetSize, buckets, selected]);

  return (
    <CahierFrame
      tabs={VIEW_TABS}
      active={view}
      onSelect={(k) => setView(k as View)}
      topBar={<TopBar crumb={collection.title} />}
    >
      <Step n={1} label="Select view">
      {/* The three views as plain buttons right here (Dan, 2026-07-05: "we
          don't need the burger menu — there are only three view modes");
          the side flaps remain on wide screens as the notebook look. */}
      <div className="mb-4 mt-2 flex flex-wrap gap-2">
        {VIEW_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            data-active={view === t.key}
            onClick={() => setView(t.key as View)}
            className="cahier-tab !rounded-md"
            style={{ "--tab-hue": t.hue } as React.CSSProperties}
          >
            {t.label}
          </button>
        ))}
      </div>
      </Step>
      <Step n={2} label="Select mode">
      {/* Test Yourself — a clearly separate study-mode switch (not a view) */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2">
          <button type="button" role="switch" aria-checked={test}
            onClick={() => setTest((t) => !t)} title={test ? "Test (type the name)" : "Study (click to reveal/hide)"}
            data-on={test} className="cahier-modeswitch">
            <span className="cahier-modeswitch-knob">{test ? "✍️" : "📖"}</span>
          </button>
          <span className="cahier-display text-sm font-bold text-[color:var(--cahier-ink)]">
            {test ? "Test (type the name)" : "Study (click to reveal/hide)"}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-2">
        {/* Flip-all sits just left of ⚙ Options; only meaningful in All Cards study mode */}
        {view === "allcards" && !test && (
          <button type="button" onClick={flipEverything} className="cahier-btn cahier-btn-sm">
            {flipAll ? "Show all English" : "Flip all to French"}
          </button>
        )}
        {/* ⚙ settings popover — ORDER + COLOUR + notes, so they don't reflow the page */}
        <div className="relative">
          <button type="button" onClick={() => setShowOptions((o) => !o)} aria-expanded={showOptions}
            className={`cahier-btn cahier-btn-sm ${showOptions ? "cahier-btn-primary" : ""}`}>
            ⚙ Options {showOptions ? "▴" : "▾"}
          </button>
          {showOptions && (
            <>
            <div className="fixed inset-0 z-20" onClick={() => setShowOptions(false)} aria-hidden />
            <div className="absolute right-0 z-30 mt-1 flex w-72 flex-col gap-3 rounded-xl border-2 border-[color:var(--cahier-ink)]/20 bg-white p-3 shadow-xl">
              <div className="flex flex-col gap-1.5">
                {/* "By article" only where the deck HAS an article axis — on a
                    deck without one the button grouped everything under a
                    single pointless "no article" header. No group axis at all
                    → the row is honestly just "order" (shuffle). */}
                <span className={CTRL_LABEL}>{canGroupArt || hasRegion ? "group by" : "order"}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {([
                    ...(canGroupArt || hasRegion ? ([["none", "✕", "No grouping"]] as ["none" | "article" | "continent", string, string][]) : []),
                    ...(canGroupArt ? ([["article", "le·la", "By article"]] as ["none" | "article" | "continent", string, string][]) : []),
                    ...(hasRegion ? ([["continent", "🌍", "By continent"]] as ["none" | "article" | "continent", string, string][]) : []),
                  ] as ["none" | "article" | "continent", string, string][]).map(([k, icon, title]) => (
                    <button key={k} type="button" onClick={() => setGroup(k)} title={title} aria-label={title}
                      className={`cahier-btn cahier-btn-sm ${groupBy === k ? "cahier-btn-primary" : ""}`}>{icon}</button>
                  ))}
                  {(canGroupArt || hasRegion) && <span className="mx-1 h-5 w-px bg-[color:var(--cahier-rule)]" aria-hidden />}
                  <button type="button" onClick={() => applyOrder("shuffle")} title="Shuffle" aria-label="Shuffle"
                    className={`cahier-btn cahier-btn-sm ${order === "shuffle" ? "cahier-btn-primary" : ""}`}>🔀</button>
                </div>
                {(canGroupArt || hasRegion) && (
                  <span className="text-[0.7rem] text-[color:var(--cahier-ink-soft)]">groups + sections + colours rows · sort A–Z via column headers</span>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-[color:var(--cahier-rule)] pt-2">
                <button type="button" onClick={() => setEditNotes((e) => !e)}
                  className={`cahier-btn cahier-btn-sm ${editNotes ? "cahier-btn-accent" : ""}`}>
                  {editNotes ? "✓ editing notes" : "✎ Edit notes"}
                </button>
                <button type="button" onClick={() => syncNow(collection.id).then(setNotes).catch(() => {})}
                  title="Sync notes" className="cahier-btn cahier-btn-sm">⟳ Sync</button>
              </div>
            </div>
            </>
          )}
        </div>
        </div>
      </div>

      </Step>
      <Step n={3} label="Filter (optional)">
      {/* Rows — one compact selector for the single-select filters; subsets kept inline */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">{view === "overview" ? "rows" : "cards"}</span>
        <select
          aria-label="Show rows"
          value={rowFilter.kind === "subset" ? "all" : rowFilter.kind}
          onChange={(e) => setRowFilter({ kind: e.target.value as "all" | "reviewed" | "toReview" | "selected" })}
          className="!w-auto"
        >
          <option value="all">All · {base.length}</option>
          <option value="reviewed">✓ Reviewed · {nReviewed}</option>
          <option value="toReview">↻ To review · {nToReview}</option>
          {selected.size > 0 && <option value="selected">▣ Selected · {selected.size}</option>}
        </select>
        <span className="ml-2 flex items-center gap-1">
          {/* count field — reacts to the "subsets of N" size, and vice-versa */}
          <input type="number" min={1} max={ordered.length} value={subsetCount || ""} placeholder="#"
            title="number of subsets"
            onChange={(e) => {
              const c = parseInt(e.target.value, 10);
              const ok = Number.isFinite(c) && c > 0;
              setSubsetSize(ok ? Math.ceil(ordered.length / c) : null);
              setRowFilter(ok ? { kind: "subset", idx: 0 } : { kind: "all" }); // default to subset 1
            }}
            className="!w-20 !px-2 text-center text-base font-bold" />
          <span className="text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">subsets of</span>
          <input type="number" min={1} max={ordered.length} value={subsetSize ?? ""} placeholder="N"
            title="cards per subset"
            onChange={(e) => { const v = parseInt(e.target.value, 10); const ok = Number.isFinite(v) && v > 0; setSubsetSize(ok ? v : null); setRowFilter(ok ? { kind: "subset", idx: 0 } : { kind: "all" }); }}
            className="!w-20 !px-2 text-center text-base font-bold" />
          {subsetSize && (
            <button type="button" title="Clear subsets" aria-label="Clear subsets"
              onClick={() => { setSubsetSize(null); setRowFilter({ kind: "all" }); }}
              className="cahier-btn cahier-btn-sm">✕</button>
          )}
        </span>
        {subsetCount > 0 && Array.from({ length: subsetCount }, (_, k) => (
          <button key={k} type="button"
            onClick={() => setRowFilter((f) => f.kind === "subset" && f.idx === k ? { kind: "all" } : { kind: "subset", idx: k })}
            className={`cahier-btn cahier-btn-sm ${rowFilter.kind === "subset" && rowFilter.idx === k ? "cahier-btn-primary" : ""}`}>S{k + 1}</button>
        ))}
      </div>

      {/* Subset navigator — work through the deck one subset at a time in the card views */}
      {subsetSize && subsetCount > 0 && view !== "overview" && (() => {
        const cur = rowFilter.kind === "subset" ? rowFilter.idx : -1;
        return (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">subset</span>
            {cur < 0 ? (
              <button type="button" onClick={() => setRowFilter({ kind: "subset", idx: 0 })} className="cahier-btn cahier-btn-sm cahier-btn-primary">
                Work through subsets (1/{subsetCount}) →
              </button>
            ) : (
              <>
                <button type="button" disabled={cur === 0} onClick={() => setRowFilter({ kind: "subset", idx: cur - 1 })} className="cahier-btn cahier-btn-sm" aria-label="Previous subset">◀</button>
                <span className="cahier-display text-sm font-bold text-[color:var(--cahier-ink)]">Subset {cur + 1} / {subsetCount}</span>
                <button type="button" disabled={cur === subsetCount - 1} onClick={() => setRowFilter({ kind: "subset", idx: cur + 1 })} className="cahier-btn cahier-btn-sm cahier-btn-primary" aria-label="Next subset">▶</button>
                <button type="button" onClick={() => setRowFilter({ kind: "all" })} className="cahier-btn cahier-btn-sm">Show all</button>
              </>
            )}
          </div>
        );
      })()}

      </Step>
      <Step n={4} label="Study / Self-test">
      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] p-6 text-center text-[color:var(--cahier-ink-soft)]">
          No rows shown.{" "}
          <button type="button" onClick={() => setRowFilter({ kind: "all" })} className="font-bold underline">Show all rows</button>
        </p>
      ) : view === "overview" ? (
        <Overview deckId={collection.id} rows={rows} isNat={isNat} test={test} order={order}
          sortCol={sortCol} sortDir={sortDir} onSortCol={sortByCol}
          colorBy={colorBy} editNotes={editNotes}
          buckets={buckets} onBucket={setRowBucket} selected={selected} onToggleSelect={toggleSel} onSelectAll={selectMany}
          notes={notes} setNotes={setNotes} articleOptions={articleOptions} />
      ) : view === "cards" ? (
        <Cards rows={rows} isNat={isNat} test={test} buckets={buckets} onBucket={setRowBucket}
          articleOptions={articleOptions} />
      ) : (
        <AllCards rows={rows} isNat={isNat} test={test} order={order} buckets={buckets} onBucket={setRowBucket}
          articleOptions={articleOptions} flipAll={flipAll} flippedIds={flippedIds} setFlippedIds={setFlippedIds} />
      )}
      </Step>
      <AccentBar />
    </CahierFrame>
  );
}

/** Column show/hide glyph — a small square, struck through when the column is hidden. */
function HideIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="2" />
      {hidden && <line x1="3.2" y1="10.8" x2="10.8" y2="3.2" />}
    </svg>
  );
}

function sortVal(r: Row, k: SortKey, buckets: Record<string, Bucket>, notes: DeckNotes): string {
  switch (k) {
    case "en": return r.item.en;
    case "fr": return r.fr;
    case "art": return String(ART_RANK[r.art] ?? 5);
    case "reviewed": return buckets[r.item.id] === "reviewed" ? "0" : "1";
    case "notes": { const t = notes[r.item.id]?.text ?? ""; return t ? t.toLowerCase() : "￿"; } // empties last
    default: return r.item.nat ? (r.item.nat[k] ?? "") : "";
  }
}

/** Rank an article/prefix by ITS DECK's column order (un/une, il est/elle est,
 *  mon/ma/mes… — the hardcoded le/la list only knew 4 values, so every other
 *  deck's rows tied, fell back to alphabetical, and grouping fragmented into
 *  alternating one-row sections). Articleless rows sink to the bottom. */
function artRankOf(collection: Collection): Map<string, number> {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const m = new Map<string, number>();
  cols.forEach((c, i) => {
    const key = (c.prefix ?? "").trim().toLowerCase();
    if (key && !m.has(key)) m.set(key, i);
  });
  return m;
}

function orderRows(
  base: Row[], order: Order, seed: number, sortCol: SortKey | null, dir: "asc" | "desc",
  buckets: Record<string, Bucket>, notes: DeckNotes, artRank: Map<string, number>,
): Row[] {
  switch (order) {
    case "shuffle": return seed >= 0 ? shuffleArr(base) : base;
    case "article": return [...base].sort((a, b) =>
      ((artRank.get(a.art.toLowerCase()) ?? 99) - (artRank.get(b.art.toLowerCase()) ?? 99)) || a.fr.localeCompare(b.fr, "fr"));
    case "continent": return [...base].sort((a, b) => (REGION_RANK[regionOf(a.item)] ?? 9) - (REGION_RANK[regionOf(b.item)] ?? 9) || a.fr.localeCompare(b.fr, "fr"));
    case "col": {
      if (!sortCol) return base;
      const out = sortCol === "art"
        ? [...base].sort((a, b) =>
            ((artRank.get(a.art.toLowerCase()) ?? 99) - (artRank.get(b.art.toLowerCase()) ?? 99)) || a.fr.localeCompare(b.fr, "fr"))
        : [...base].sort((a, b) => sortVal(a, sortCol, buckets, notes).localeCompare(sortVal(b, sortCol, buckets, notes), "fr"));
      return dir === "asc" ? out : out.reverse();
    }
    default: return base;
  }
}

/* ─────────────────────────── shared: AnswerField ─────────────────────────── */

type Part = { key: string; type: "text" | "article"; label?: string; correct: string };

/**
 * The consistent check-answer widget used in every view: type/select the
 * answer, Check or Reveal, and your response stays visible beside the correct
 * one (never erased). Calls onResult(true) on a fully-correct Check.
 */
function AnswerField({
  parts, articleOptions, onResult, autoFocus,
}: {
  parts: Part[];
  articleOptions: string[];
  onResult: (correct: boolean) => void;
  autoFocus?: boolean;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "checked" | "revealed">("idle");

  const judge = (p: Part) =>
    p.type === "article" ? vals[p.key] === p.correct : normCase(vals[p.key] ?? "") === normCase(p.correct);
  const allRight = parts.every(judge);
  const hasArt = parts.some((p) => p.key === "art");
  const multi = parts.length > 2; // nationality forms keep their labels

  function check() { setPhase("checked"); onResult(allRight); }
  function reveal() { setPhase("revealed"); }
  function retry() { setPhase("idle"); }

  if (phase !== "idle") {
    if (hasArt) {
      // ONE integrated result — the full "article + noun" phrase, single mark
      const artP = parts.find((p) => p.key === "art")!;
      const frP = parts.find((p) => p.key === "fr")!;
      const aVal = vals.art && vals.art !== "__unset__" ? vals.art : "";
      const mine = frFull(aVal, vals.fr ?? "");
      const correct = frFull(artP.correct, frP.correct);
      return (
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          {phase === "checked" && <span lang="fr" className={`text-lg font-semibold ${allRight ? "text-emerald-700" : "text-[color:var(--cahier-la)] line-through"}`}>{mine.trim() || "—"}</span>}
          {(!allRight || phase === "revealed") && <span lang="fr" className="cahier-display text-lg font-bold"><span className="cahier-hl">{correct}</span></span>}
          {phase === "checked" && <span>{allRight ? "✓" : "✗"}</span>}
          <button type="button" onClick={retry} title="Try again" aria-label="Try again" className="cahier-btn cahier-btn-sm">↺</button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        {parts.map((p) => {
          const ok = judge(p);
          const mine = vals[p.key] ?? "";
          return (
            <div key={p.key} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              {p.label && <span className="text-xs text-[color:var(--cahier-ink-soft)]">{p.label}</span>}
              {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-emerald-700" : "text-[color:var(--cahier-la)] line-through"}`}>{mine.trim() ? mine : "—"}</span>}
              {(!ok || phase === "revealed") && <span lang="fr" className="cahier-display font-bold"><span className="cahier-hl">{p.correct}</span></span>}
              {phase === "checked" && <span>{ok ? "✓" : "✗"}</span>}
            </div>
          );
        })}
        <button type="button" onClick={retry} title="Try again" aria-label="Try again" className="cahier-btn cahier-btn-sm w-fit">↺</button>
      </div>
    );
  }

  const firstText = parts.findIndex((p) => p.type === "text");
  return (
    <form className={`flex items-center gap-1 ${multi ? "flex-wrap" : "flex-nowrap"}`} onSubmit={(e) => { e.preventDefault(); check(); }}>
      {parts.map((p, i) => (
        <span key={p.key} className="flex min-w-0 items-center gap-1">
          {multi && p.label && <span className="text-xs text-[color:var(--cahier-ink-soft)]">{p.label}</span>}
          {p.type === "article" ? (
            <select aria-label="article" value={vals[p.key] ?? "__unset__"}
              onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))} className="!w-16">
              <option value="__unset__" disabled>-</option>
              {articleOptions.map((a) => <option key={a} value={a}>{ART_LABEL[a]}</option>)}
            </select>
          ) : (
            <input lang="fr" autoFocus={autoFocus && i === firstText} value={vals[p.key] ?? ""}
              onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))}
              placeholder="…" className={`cahier-answer ${multi ? "!w-24" : "min-w-0 flex-1"}`} />
          )}
        </span>
      ))}
      <button type="submit" title="Check answer" aria-label="Check answer" className="cahier-btn cahier-btn-sm cahier-btn-accent">✓</button>
      <button type="button" onClick={reveal} title="Reveal answer" aria-label="Reveal answer" className="cahier-btn cahier-btn-sm">💡</button>
    </form>
  );
}

/** Build the answer parts for a row (article dropdown + noun, or 4 nat forms). */
function partsFor(row: Row, isNat: boolean, hasArticles: boolean): Part[] {
  if (row.item.nat) {
    const n = row.item.nat;
    return [
      { key: "ms", type: "text", label: "il est", correct: n.ms },
      { key: "fs", type: "text", label: "elle est", correct: n.fs },
      { key: "mp", type: "text", label: "ils sont", correct: n.mp },
      { key: "fp", type: "text", label: "elles sont", correct: n.fp },
    ];
  }
  // For article decks, always ask for the article (∅ included) — the heading says "art.".
  const parts: Part[] = [];
  if (hasArticles) parts.push({ key: "art", type: "article", label: "article", correct: row.art });
  parts.push({ key: "fr", type: "text", label: hasArticles ? "noun" : undefined, correct: row.fr });
  return parts;
}

/* ─────────────────────────── shared: ReviewToggle ─────────────────────────── */

function ReviewToggle({ value, onChange }: { value: Bucket | undefined; onChange: (b: Bucket) => void }) {
  const reviewed = value === "reviewed"; // default = to review
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reviewed}
      aria-label={reviewed ? "Reviewed — tap to move to To review" : "To review — tap to mark Reviewed"}
      title={reviewed ? "Reviewed" : "To review"}
      data-on={reviewed}
      onClick={() => onChange(reviewed ? "toReview" : "reviewed")}
      className="cahier-switch"
    >
      <span className="cahier-switch-knob">{reviewed ? "✓" : "↺"}</span>
    </button>
  );
}

/* ─────────────────────────── card faces ─────────────────────────── */

function FrenchAnswer({ row, hasArt }: { row: Row; hasArt: boolean }) {
  if (row.item.nat) return <NatForms nat={row.item.nat} />;
  // ∅ marks a genuinely article-less item in an ARTICLE deck (Cuba); decks with
  // no article axis at all (sentences, letters) just show the French.
  return (
    <span lang="fr" className="cahier-display text-4xl font-black text-[color:var(--cahier-ink)]">
      {row.art ? <span className="cahier-hl">{row.full}</span> : hasArt ? (
        <><span className="text-[color:var(--cahier-ink-soft)]">∅ </span><span className="cahier-hl">{row.fr}</span></>
      ) : (
        <span className="cahier-hl">{row.fr}</span>
      )}
    </span>
  );
}

function NatForms({ nat, size = "lg" }: { nat: NonNullable<Item["nat"]>; size?: "lg" | "sm" }) {
  const lines: [string, string][] = [
    ["il est", nat.ms], ["elle est", nat.fs], ["ils sont", nat.mp], ["elles sont", nat.fp],
  ];
  return (
    <div lang="fr" className={`cahier-display font-bold text-[color:var(--cahier-ink)] ${size === "lg" ? "space-y-1.5 text-lg" : "space-y-0.5 text-[11px] leading-tight"}`}>
      {lines.map(([subj, form]) => (
        <div key={subj}><span className="text-[color:var(--cahier-ink-soft)]">{subj} </span><span className="cahier-hl">{form}</span></div>
      ))}
    </div>
  );
}

function sayText(row: Row): string {
  const n = row.item.nat;
  return n ? `il est ${n.ms}, elle est ${n.fs}, ils sont ${n.mp}, elles sont ${n.fp}` : row.full;
}

/* ─────────────────────────── Cards ─────────────────────────── */

function Cards({
  rows, isNat, test, buckets, onBucket, articleOptions,
}: {
  rows: Row[]; isNat: boolean; test: boolean;
  buckets: Record<string, Bucket>; onBucket: (id: string, b: Bucket) => void;
  articleOptions: string[];
}) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const idx = Math.min(i, rows.length - 1);
  const row = rows[idx];

  function go(delta: number) {
    setFlipped(false);
    setI((p) => (p + delta + rows.length) % rows.length);
  }
  function flip() {
    setFlipped((f) => !f);       // flip ONLY flips this card — never navigates
  }

  // keyboard shortcuts (ignore while typing)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowUp") { e.preventDefault(); speak(sayText(row), "fr-FR"); }
      else if (e.key === " " && !test) { e.preventDefault(); setFlipped((f) => !f); }
      else if (e.key === "t" || e.key === "T") onBucket(row.item.id, "toReview");
      else if (e.key === "r" || e.key === "R") onBucket(row.item.id, "reviewed");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, rows.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = buckets[row.item.id];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">
        {idx + 1} / {rows.length}{test && <span className="ml-2 text-[color:var(--cahier-la)]">✍️ test yourself</span>}
      </div>

      <div className="w-full max-w-sm">
        {/* Reviewed/To-review toggle, top-right */}
        <div className="mb-2 flex justify-end">
          <ReviewToggle value={status} onChange={(b) => onBucket(row.item.id, b)} />
        </div>

        {test ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 overflow-auto rounded-2xl border-2 border-[color:var(--cahier-ink)]/20 bg-white p-6 text-center shadow-sm">
            <span className="text-6xl" aria-hidden>{row.item.emoji}</span>
            <span className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">{row.item.en}</span>
            <AnswerField key={row.item.id} parts={partsFor(row, isNat, articleOptions.some((a) => a !== ""))} articleOptions={articleOptions} autoFocus
              onResult={(ok) => { recordItemResult(row.item.id, ok); if (ok) onBucket(row.item.id, "reviewed"); }} />
          </div>
        ) : (
          <div className="cursor-pointer select-none" style={{ perspective: "1200px" }}
            onClick={flip} role="button" aria-label="Flip card">
            <div className="relative h-64" style={{ transformStyle: "preserve-3d", transition: "transform .5s", transform: flipped ? "rotateY(180deg)" : "none" }}>
              <Face>
                <span className="text-7xl" aria-hidden>{row.item.emoji}</span>
                <span className="cahier-display mt-3 text-2xl font-black text-[color:var(--cahier-ink)]">
                  {row.item.en}
                  {row.item.note ? <span className="ml-1 text-base font-medium text-[color:var(--cahier-ink-soft)]">{row.item.note}</span> : null}
                </span>
                <span className="mt-2 text-[0.7rem] text-[color:var(--cahier-ink-soft)]">tap or Space to flip</span>
              </Face>
              <Face back><FrenchAnswer row={row} hasArt={articleOptions.some((a) => a !== "")} /></Face>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => speak(sayText(row), "fr-FR")} className="cahier-btn cahier-btn-sm">🔊 Hear it <kbd className="ml-1 opacity-60">↑</kbd></button>
        <button type="button" onClick={() => go(-1)} className="cahier-btn cahier-btn-sm">← Prev</button>
        <button type="button" onClick={() => go(1)} className="cahier-btn cahier-btn-sm cahier-btn-primary">Next →</button>
      </div>
      <p className="mt-3 text-[0.7rem] text-[color:var(--cahier-ink-soft)]">shortcuts: T to-review · R reviewed · Space flip · ↑ hear · ← prev · → next</p>
    </div>
  );
}

function Face({ children, back }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[color:var(--cahier-ink)]/20 bg-white p-6 text-center shadow-sm"
      style={{ backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}>
      {children}
    </div>
  );
}

/* ─────────────────────────── All Cards ─────────────────────────── */

/** Contiguous group runs for section headers — shared by Overview and All
 *  Cards so "group by" is VISIBLE in both (Dan, 2026-07-04: selecting le·la
 *  showed nothing in the card grid). */
function groupRows(rows: Row[], order: Order): { label: string; rows: Row[] }[] {
  const keyOf = (r: Row) => order === "article" ? (r.art || "∅") : order === "continent" ? regionOf(r.item) : "";
  const labelOf = (g: string) => order === "continent" ? (REGION_LABEL[g] ?? "—") : (g === "∅" ? "no article" : g);
  if (order !== "article" && order !== "continent") return [{ label: "", rows }];
  const out: { label: string; rows: Row[] }[] = [];
  let cur = "";
  rows.forEach((r) => {
    const g = keyOf(r);
    if (g !== cur || out.length === 0) { out.push({ label: labelOf(g), rows: [] }); cur = g; }
    out[out.length - 1].rows.push(r);
  });
  return out;
}

function AllCards({
  rows, isNat, test, order, buckets, onBucket, articleOptions, flipAll, flippedIds, setFlippedIds,
}: {
  rows: Row[]; isNat: boolean; test: boolean; order: Order;
  buckets: Record<string, Bucket>; onBucket: (id: string, b: Bucket) => void;
  articleOptions: string[];
  flipAll: boolean; flippedIds: Set<string>; setFlippedIds: (fn: (s: Set<string>) => Set<string>) => void;
}) {
  function flipOne(id: string) {
    setFlippedIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  const showBack = (id: string) => (flipAll ? !flippedIds.has(id) : flippedIds.has(id));

  return (
    <div>
      {groupRows(rows, order).map((grp, gi) => (
        <div key={grp.label || gi}>
          {grp.label && (
            <div lang="fr" className="cahier-section mb-2 mt-4 rounded-md px-3 py-1.5 first:mt-0">{grp.label}</div>
          )}
          {/* same grid in both modes; cards hold the individual-card 3:2 ratio */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {grp.rows.map((row) => {
          const status = buckets[row.item.id];
          return (
            <div key={row.item.id} className="relative flex aspect-[3/2] flex-col overflow-hidden rounded-xl border-2 border-[color:var(--cahier-ink)]/15 bg-white p-2">
              <div className="mb-1 flex items-center justify-between gap-1">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 text-2xl" aria-hidden>{row.item.emoji}</span>
                  {test && <span className="cahier-display truncate text-sm font-bold text-[color:var(--cahier-ink)]">{row.item.en}</span>}
                </span>
                <ReviewToggle value={status} onChange={(b) => onBucket(row.item.id, b)} />
              </div>
              {test ? (
                <div className="flex flex-1 items-center px-1">
                  <AnswerField key={row.item.id} parts={partsFor(row, isNat, articleOptions.some((a) => a !== ""))} articleOptions={articleOptions}
                    onResult={(ok) => { recordItemResult(row.item.id, ok); if (ok) onBucket(row.item.id, "reviewed"); }} />
                </div>
              ) : (
                <button type="button" onClick={() => flipOne(row.item.id)} className="flex flex-1 flex-col items-center justify-center p-1 text-center transition hover:brightness-95">
                  {showBack(row.item.id) ? (
                    row.item.nat ? <NatForms nat={row.item.nat} size="sm" /> : (
                      <span lang="fr" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
                        {row.art ? <span className="cahier-hl">{row.full}</span>
                          : articleOptions.some((a) => a !== "") ? <><span className="text-[color:var(--cahier-ink-soft)]">∅ </span><span className="cahier-hl">{row.fr}</span></>
                          : <span className="cahier-hl">{row.fr}</span>}
                      </span>
                    )
                  ) : (
                    <span className="cahier-display text-sm font-bold text-[color:var(--cahier-ink)]">{row.item.en}</span>
                  )}
                </button>
              )}
            </div>
          );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Overview ─────────────────────────── */

type ColKey = "pick" | "flag" | "eng" | "art" | "fr" | "ms" | "fs" | "mp" | "fp" | "deck" | "notes";
type ColDef = { key: ColKey; label: string; w: number };

const STD_COLS: ColDef[] = [
  { key: "pick", label: "pick", w: 42 }, { key: "flag", label: "emoji", w: 80 },
  { key: "eng", label: "English", w: 150 }, { key: "art", label: "art.", w: 72 },
  { key: "fr", label: "French", w: 170 }, { key: "deck", label: "Reviewed", w: 120 },
  { key: "notes", label: "notes", w: 240 },
];
const NAT_COLS: ColDef[] = [
  { key: "pick", label: "pick", w: 42 }, { key: "flag", label: "emoji", w: 80 },
  { key: "fr", label: "country", w: 130 }, { key: "ms", label: "il est", w: 120 },
  { key: "fs", label: "elle est", w: 120 }, { key: "mp", label: "ils sont", w: 120 },
  { key: "fp", label: "elles sont", w: 120 }, { key: "deck", label: "Reviewed", w: 120 },
  { key: "notes", label: "notes", w: 220 },
];
const COVERABLE: ColKey[] = ["eng", "art", "fr", "ms", "fs", "mp", "fp", "notes"];
const ANSWER_COLS: ColKey[] = ["art", "fr", "ms", "fs", "mp", "fp"];
const LANG_COLS: ColKey[] = ["eng", "fr", "ms", "fs", "mp", "fp"];
const SORT_OF: Partial<Record<ColKey, SortKey>> = {
  eng: "en", fr: "fr", art: "art", ms: "ms", fs: "fs", mp: "mp", fp: "fp",
  deck: "reviewed", notes: "notes",
};

function natVal(row: Row, key: ColKey): string {
  const n = row.item.nat; if (!n) return "";
  return key === "ms" ? n.ms : key === "fs" ? n.fs : key === "mp" ? n.mp : key === "fp" ? n.fp : "";
}

function Overview({
  deckId, rows, isNat, test, order, sortCol, sortDir, onSortCol,
  colorBy, editNotes,
  buckets, onBucket, selected, onToggleSelect, onSelectAll, notes, setNotes, articleOptions,
}: {
  deckId: string; rows: Row[]; isNat: boolean; test: boolean; order: Order;
  sortCol: SortKey | null; sortDir: "asc" | "desc"; onSortCol: (k: SortKey) => void;
  colorBy: "none" | "article" | "continent"; editNotes: boolean;
  buckets: Record<string, Bucket>; onBucket: (id: string, b: Bucket) => void;
  selected: Set<string>; onToggleSelect: (id: string) => void; onSelectAll: (ids: string[], on: boolean) => void;
  notes: DeckNotes; setNotes: (n: DeckNotes) => void; articleOptions: string[];
}) {
  const COLS = isNat ? NAT_COLS : STD_COLS;
  const coverableHere = COLS.filter((c) => COVERABLE.includes(c.key)).map((c) => c.key);
  const hasArt = articleOptions.some((a) => a !== ""); // deck has an article/prefix axis at all
  // Answer columns differ by deck: nat tests the 4 forms (country stays as the
  // prompt); standard tests article + French noun (English stays as the prompt).
  const answerCols: ColKey[] = isNat ? ["ms", "fs", "mp", "fp"] : hasArt ? ["art", "fr"] : ["fr"];
  // English gets its own column wherever it actually differs from the French
  // (Dan, 2026-07-04). It is hidden only where it would ECHO the French —
  // countries/nationalities-style decks where en ≈ fr ("France | France"
  // teaches nothing; the emoji tooltip covers those rows).
  const hasLang = rows.some((r) => r.item.lang); // languages deck → relabel flag col, drop article
  const redundantEn =
    rows.length > 0 &&
    rows.filter((r) => bareWord(r.item.en).toLowerCase() === r.fr.toLowerCase()).length >= rows.length * 0.8;
  const cols = (isNat || !redundantEn ? COLS : COLS.filter((c) => c.key !== "eng"))
    .filter((c) => !((hasLang || !hasArt) && c.key === "art")) // no article axis → no art column
    .filter((c) => !(c.key === "flag" && !rows.some((r) => r.item.emoji || r.item.lang))); // no visuals → no flag column
  const lastAnswerKey = answerCols[answerCols.length - 1]; // holds the single Check/Reveal
  // In Test: article column is narrow ("-"), the last answer column is wide (input + ✓ + 💡).
  const colW = (c: ColDef) => {
    if (!test) return c.w;
    if (c.key === "art") return 64;
    if (c.key === lastAnswerKey) return 240; // wide input + ✓ + 💡
    if (answerCols.includes(c.key)) return 160;
    return c.w;
  };
  const widthOf = (c: ColDef) => colWidths[c.key] ?? colW(c); // manual override wins
  const startResize = (e: React.PointerEvent, key: ColKey, curW: number) => {
    e.preventDefault(); e.stopPropagation();
    dragRef.current = { key, startX: e.clientX, startW: curW };
  };

  const [hidden, setHidden] = useState<Set<string>>(new Set()); // covered cells `${id}:${col}`
  const [revealedCell, setRevealedCell] = useState<Set<string>>(new Set()); // answered/clicked open
  const [coveredCols, setCoveredCols] = useState<Set<ColKey>>(new Set());
  // English on a flag/emoji is an AUTOMATIC MOUSEOVER (title tooltip) — never
  // text that appears in the layout (Dan, 2026-07-04).
  // manual column resizing — drag the handle on a header's right edge
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({});
  const dragRef = useRef<{ key: ColKey; startX: number; startW: number } | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      setColWidths((p) => ({ ...p, [d.key]: Math.max(44, d.startW + (e.clientX - d.startX)) }));
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);
  const rowTint = (row: Row): string | undefined =>
    colorBy === "article" ? ART_TINT[row.art] ?? "transparent"
      : colorBy === "continent" ? REGION_TINT[regionOf(row.item)] ?? "transparent"
      : undefined;

  // Test Yourself: cover the answer columns; off: reveal everything.
  useEffect(() => {
    if (test) {
      setCoveredCols(new Set(coverableHere.filter((c) => answerCols.includes(c))));
      setRevealedCell(new Set());
      setHidden(new Set());
    } else {
      setCoveredCols(new Set());
      setHidden(new Set());
      setRevealedCell(new Set());
    }
  }, [test]); // eslint-disable-line react-hooks/exhaustive-deps

  const cellKey = (id: string, k: ColKey) => `${id}:${k}`;
  // art counts as content even when ∅ (the absence of an article is itself a
  // thing to recall); notes are coverable too.
  const hasContent = (row: Row, k: ColKey) =>
    k === "ms" || k === "fs" || k === "mp" || k === "fp" ? natVal(row, k) !== "" : true;

  function isCovered(row: Row, k: ColKey): boolean {
    if (!COVERABLE.includes(k) || !hasContent(row, k)) return false;
    if (k === "notes" && editNotes) return false; // notes editable → never covered
    if (k === "notes" && test) return false;       // not a Test-Yourself target
    const key = cellKey(row.item.id, k);
    if (revealedCell.has(key)) return false;     // explicitly opened
    if (hidden.has(key)) return true;            // explicitly covered
    return coveredCols.has(k);                    // column-level
  }
  function toggleCell(row: Row, k: ColKey) {
    const key = cellKey(row.item.id, k);
    if (isCovered(row, k)) {
      setRevealedCell((s) => new Set(s).add(key));
    } else {
      setRevealedCell((s) => { const n = new Set(s); n.delete(key); return n; });
      setHidden((s) => new Set(s).add(key));
    }
  }

  // Show/Hide whole columns (covers content; column stays — layout fixed).
  function visibleLangCount(next: Set<ColKey>) {
    return COLS.filter((c) => LANG_COLS.includes(c.key) && !next.has(c.key)).length;
  }
  function toggleCol(k: ColKey) {
    if (!COVERABLE.includes(k)) return;
    setCoveredCols((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else {
        // keep ≥1 language column's contents visible
        if (LANG_COLS.includes(k) && visibleLangCount(new Set([...next, k])) < 1) return prev;
        next.add(k);
      }
      return next;
    });
    setRevealedCell(new Set()); setHidden(new Set());
  }
  function showAllCols() { setCoveredCols(new Set()); setHidden(new Set()); setRevealedCell(new Set()); }
  function hideAllCols() {
    // cover all coverable except keep one language column's contents visible
    const keepLang = COLS.find((c) => LANG_COLS.includes(c.key))?.key;
    setCoveredCols(new Set(coverableHere.filter((c) => c !== keepLang)));
    setHidden(new Set()); setRevealedCell(new Set());
  }

  const expected = (row: Row, k: ColKey) => (k === "art" ? row.art : k === "fr" ? row.fr : natVal(row, k));

  // grouping → section header rows (same helper drives All Cards)
  const grouped = useMemo(() => groupRows(rows, order), [rows, order]);

  const totalW = cols.reduce((s, c) => s + widthOf(c), 0);

  return (
    <div>
      {/* Per-column hiding lives on each header (◻). A contextual "Reveal all"
          appears only when something is covered. */}

      <div className="overflow-x-auto rounded-xl border-2 border-[color:var(--cahier-ink)]/15 bg-white">
        <table className="text-left text-sm" style={{ tableLayout: "fixed", width: totalW, minWidth: "100%" }}>
          <colgroup>{cols.map((c) => <col key={c.key} style={{ width: widthOf(c) }} />)}</colgroup>
          <thead className="bg-[var(--cahier-paper-2)] text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">
            <tr>{cols.map((c) => {
              const sk = SORT_OF[c.key];
              const active = sk && sortCol === sk;
              const coverable = COVERABLE.includes(c.key);
              if (c.key === "pick") {
                const ids = rows.map((r) => r.item.id);
                const allSel = ids.length > 0 && ids.every((id) => selected.has(id));
                return (
                  <th key={c.key} className="relative px-3 py-2">
                    <input type="checkbox" checked={allSel}
                      onChange={() => onSelectAll(ids, !allSel)}
                      title={allSel ? "Deselect all" : "Select all"}
                      aria-label={allSel ? "Deselect all" : "Select all"}
                      style={{ width: "1.1rem", height: "1.1rem", padding: 0, accentColor: "#2d5bff" }} />
                  </th>
                );
              }
              return (
                <th key={c.key} className="relative px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={sk ? "cursor-pointer select-none hover:text-[color:var(--cahier-ink)]" : ""}
                      onClick={sk ? () => onSortCol(sk) : undefined}
                      title={sk ? "Sort by this column" : undefined}
                    >
                      {c.key === "flag" && hasLang ? "language" : c.label}{active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </span>
                    {coverable && (
                      <button type="button" onClick={() => toggleCol(c.key)}
                        title={coveredCols.has(c.key) ? "Show this column" : "Hide this column"}
                        aria-label={coveredCols.has(c.key) ? "Show this column" : "Hide this column"}
                        className="opacity-50 transition hover:opacity-100">
                        <HideIcon hidden={coveredCols.has(c.key)} />
                      </button>
                    )}
                  </span>
                  <span onPointerDown={(e) => startResize(e, c.key, widthOf(c))}
                    title="Drag to resize column"
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none hover:bg-[color:var(--cahier-le)]/30"
                    aria-hidden />
                </th>
              );
            })}</tr>
          </thead>
          <tbody>
            {grouped.map((grp, gi) => (
              <FragmentRows key={gi} label={grp.label} span={cols.length}
                groupIds={grp.rows.map((r) => r.item.id)} selected={selected} onSelectAll={onSelectAll}>
                {grp.rows.map((row) => {
                  const status = buckets[row.item.id];
                  if (test) {
                    return (
                      <TestRow key={row.item.id} row={row} cols={cols} isNat={isNat}
                        articleOptions={articleOptions} status={status}
                        onBucket={onBucket} selected={selected} onToggleSelect={onToggleSelect}
                        notes={notes} editNotes={editNotes}
                        onNote={(t) => setNotes(setNote(deckId, row.item.id, t))} tint={rowTint(row)} />
                    );
                  }
                  const cellContent = (k: ColKey): React.ReactNode => {
                    switch (k) {
                      case "pick":
                        return <input type="checkbox" checked={selected.has(row.item.id)}
                          onChange={() => onToggleSelect(row.item.id)}
                          style={{ width: "1.1rem", height: "1.1rem", padding: 0, accentColor: "#2d5bff" }} />;
                      case "flag": return (
                        <span title={displayEn(row.item)}
                          className={row.item.lang ? "inline-flex items-baseline gap-1.5 whitespace-nowrap" : "text-2xl"}>
                          {row.item.lang ? (
                            <>
                              <span lang="fr" className="text-base font-bold text-[color:var(--cahier-ink)]">{row.item.lang.greeting}</span>
                              <span className="text-[11px] text-[color:var(--cahier-ink-soft)]">{row.item.lang.autonym}</span>
                            </>
                          ) : row.item.emoji}
                        </span>
                      );
                      case "eng": return <span>{row.item.en}{row.item.note ? <span className="text-[color:var(--cahier-ink-soft)]"> {row.item.note}</span> : null}</span>;
                      case "art": return <span lang="fr" className="font-bold">{row.art || "∅"}</span>;
                      case "fr": return <span lang="fr" className={`font-bold ${isNat ? "" : "cahier-hl"}`}>{isNat ? row.full : row.fr}</span>;
                      case "ms": case "fs": case "mp": case "fp":
                        return <span lang="fr" className="font-bold cahier-hl">{natVal(row, k)}</span>;
                      case "deck": return <ReviewToggle value={status} onChange={(b) => onBucket(row.item.id, b)} />;
                      case "notes": return <NoteCell value={notes[row.item.id]?.text ?? ""} editable={editNotes}
                        onChange={(t) => setNotes(setNote(deckId, row.item.id, t))} />;
                    }
                  };
                  return (
                    <tr key={row.item.id} className="border-t border-[color:var(--cahier-rule)] align-middle"
                      style={{ background: rowTint(row) }}>
                      {cols.map((c) => {
                        const covered = isCovered(row, c.key);
                        const clickable = COVERABLE.includes(c.key) && hasContent(row, c.key) && !(c.key === "notes" && editNotes);
                        return (
                          <td key={c.key} className="overflow-hidden px-3 py-2"
                            onClick={clickable ? () => toggleCell(row, c.key) : undefined}
                            style={{ cursor: clickable ? "pointer" : undefined }}>
                            {covered ? (
                              <span className="inline-flex rounded bg-[var(--cahier-paper-2)] px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink-soft)]">•••</span>
                            ) : cellContent(c.key)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </FragmentRows>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[0.7rem] text-[color:var(--cahier-ink-soft)]">
        {test ? "Write each covered answer and check it — your answer stays beside the correct one." : "Tap any cell to cover or reveal it · tap a column header to sort (▲/▼)."}
      </p>
    </div>
  );
}

/** One Test-Yourself row: a single Check/Reveal validates ALL answer parts at
 * once (article + noun, or the four nationality forms), inline on the same row. */
function TestRow({
  row, cols, isNat, articleOptions, status, onBucket, selected, onToggleSelect, notes, editNotes, onNote, tint,
}: {
  row: Row; cols: ColDef[]; isNat: boolean; articleOptions: string[];
  status: Bucket | undefined; onBucket: (id: string, b: Bucket) => void;
  selected: Set<string>; onToggleSelect: (id: string) => void;
  notes: DeckNotes; editNotes: boolean; onNote: (t: string) => void; tint?: string;
}) {
  const parts = partsFor(row, isNat, articleOptions.some((a) => a !== ""));
  const [vals, setVals] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "checked" | "revealed">("idle");
  const judge = (p: Part) => p.type === "article" ? vals[p.key] === p.correct : normCase(vals[p.key] ?? "") === normCase(p.correct);
  const allRight = parts.every(judge);
  const answerKeys = parts.map((p) => p.key);
  const lastKey = answerKeys[answerKeys.length - 1];
  const partByKey: Record<string, Part> = Object.fromEntries(parts.map((p) => [p.key, p]));
  // article decks show ONE integrated result (article + noun as a phrase), not per-token marks
  const hasArt = !!partByKey["art"];
  const myArt = vals["art"] && vals["art"] !== "__unset__" ? vals["art"] : "";
  const mergedMine = frFull(myArt, vals["fr"] ?? "");

  function check() { setPhase("checked"); if (allRight) onBucket(row.item.id, "reviewed"); }
  function reveal() { setPhase("revealed"); }
  function retry() { setPhase("idle"); setVals({}); }
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); check(); } };

  const answerCell = (key: string) => {
    const p = partByKey[key];
    if (phase !== "idle") {
      const ok = judge(p);
      const mine = p.type === "article" ? (vals[p.key] === undefined ? "" : ART_LABEL[vals[p.key]]) : (vals[p.key] ?? "");
      return (
        <span className="flex flex-wrap items-baseline gap-x-1 text-sm">
          {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-emerald-700" : "text-[color:var(--cahier-la)] line-through"}`}>{mine?.trim() ? mine : "—"}</span>}
          {(!ok || phase === "revealed") && <span lang="fr" className="cahier-display font-bold"><span className="cahier-hl">{p.type === "article" ? ART_LABEL[p.correct] : p.correct}</span></span>}
          {phase === "checked" && <span>{ok ? "✓" : "✗"}</span>}
        </span>
      );
    }
    return p.type === "article" ? (
      <select aria-label="article" value={vals[p.key] ?? "__unset__"} onKeyDown={onKey}
        onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))} className="!w-14">
        <option value="__unset__" disabled>-</option>
        {articleOptions.map((a) => <option key={a} value={a}>{ART_LABEL[a]}</option>)}
      </select>
    ) : (
      <input lang="fr" value={vals[p.key] ?? ""} onKeyDown={onKey}
        onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))}
        placeholder="…" className="cahier-answer min-w-0 flex-1" />
    );
  };

  const buttons = phase === "idle" ? (
    <>
      <button type="button" onClick={check} title="Check answer" aria-label="Check answer" className="cahier-btn cahier-btn-sm cahier-btn-accent">✓</button>
      <button type="button" onClick={reveal} title="Reveal answer" aria-label="Reveal answer" className="cahier-btn cahier-btn-sm">💡</button>
    </>
  ) : (
    <button type="button" onClick={retry} title="Try again" aria-label="Try again" className="cahier-btn cahier-btn-sm">↺</button>
  );

  return (
    <tr className="border-t border-[color:var(--cahier-rule)] align-middle" style={{ background: tint }}>
      {cols.map((c) => {
        let content: React.ReactNode = null;
        if (c.key === "pick") content = <input type="checkbox" checked={selected.has(row.item.id)} onChange={() => onToggleSelect(row.item.id)} style={{ width: "1.1rem", height: "1.1rem", padding: 0, accentColor: "#2d5bff" }} />;
        else if (c.key === "flag") content = (
          <span title={displayEn(row.item)} className="text-2xl">{row.item.emoji}</span>
        );
        else if (c.key === "fr" && isNat) content = <span lang="fr" className="font-bold">{row.fr}</span>;
        else if (answerKeys.includes(c.key)) {
          if (hasArt && phase !== "idle") {
            // integrative result: the full "article + noun" phrase, one mark, shown in the French cell
            content = c.key === "fr" ? (
              <span className="flex w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
                {phase === "checked" && <span lang="fr" className={`font-semibold ${allRight ? "text-emerald-700" : "text-[color:var(--cahier-la)] line-through"}`}>{mergedMine.trim() || "—"}</span>}
                {(!allRight || phase === "revealed") && <span lang="fr" className="cahier-display font-bold"><span className="cahier-hl">{row.full}</span></span>}
                {phase === "checked" && <span>{allRight ? "✓" : "✗"}</span>}
                <button type="button" onClick={retry} title="Try again" aria-label="Try again" className="cahier-btn cahier-btn-sm">↺</button>
              </span>
            ) : null; // article cell folds into the merged phrase
          } else {
            content = <span className="flex w-full items-center gap-1">{answerCell(c.key)}{c.key === lastKey && buttons}</span>;
          }
        }
        else if (c.key === "deck") content = <ReviewToggle value={status} onChange={(b) => onBucket(row.item.id, b)} />;
        else if (c.key === "notes") content = <NoteCell value={notes[row.item.id]?.text ?? ""} editable={editNotes} onChange={onNote} />;
        return <td key={c.key} className="overflow-hidden px-3 py-2">{content}</td>;
      })}
    </tr>
  );
}

function FragmentRows({ label, span, children, groupIds, selected, onSelectAll }: {
  label: string; span: number; children: React.ReactNode;
  groupIds?: string[]; selected?: Set<string>; onSelectAll?: (ids: string[], on: boolean) => void;
}) {
  return (
    <>
      {label && (
        <tr>
          <td colSpan={span} className="cahier-section px-3 py-1.5">
            {groupIds && selected && onSelectAll ? (
              <span className="inline-flex items-center gap-2">
                <input type="checkbox"
                  checked={groupIds.length > 0 && groupIds.every((id) => selected.has(id))}
                  onChange={() => onSelectAll(groupIds, !groupIds.every((id) => selected.has(id)))}
                  title="Select / deselect this group"
                  aria-label="Select / deselect this group"
                  style={{ width: "1.1rem", height: "1.1rem", padding: 0, accentColor: "#2d5bff" }} />
                {label}
              </span>
            ) : label}
          </td>
        </tr>
      )}
      {children}
    </>
  );
}

function NoteCell({ value, editable, onChange }: { value: string; editable: boolean; onChange: (t: string) => void }) {
  if (!editable) {
    return <span className={`text-sm ${value ? "" : "text-[color:var(--cahier-ink-soft)]"}`}>{value || "—"}</span>;
  }
  const n = graphemeCount(value);
  return (
    <div className="flex items-center gap-1">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="note…" className="!min-w-0 flex-1 text-sm" />
      <span className={`text-[10px] tabular-nums ${n >= NOTE_MAX ? "font-bold text-rose-500" : "text-[color:var(--cahier-ink-soft)]"}`}>{n}/{NOTE_MAX}</span>
    </div>
  );
}

/* ─────────────────────────── accent keyboard ─────────────────────────── */

function insertAtCursor(input: HTMLInputElement, ch: string) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const next = input.value.slice(0, start) + ch + input.value.slice(end);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, next);
  input.dispatchEvent(new Event("input", { bubbles: true })); // let React update the controlled value
  const pos = start + ch.length;
  input.setSelectionRange(pos, pos);
  input.focus();
}

const ACCENTS_LOWER = ["é", "è", "à", "ù", "ç", "ê", "â", "ô", "û", "î", "ï", "ë", "ü", "œ", "æ", "«"];
const ACCENTS_UPPER = ["É", "È", "À", "Ù", "Ç", "Ê", "Â", "Ô", "Û", "Î", "Ï", "Ë", "Ü", "Œ", "Æ", "»"];

/** On-screen French accent pad — appears when a French answer input is focused
 * (mobile keyboards can't type accents). 4×4 grid + a shift toggle (lower/UPPER;
 * the « key becomes » when shifted). */
function AccentBar() {
  const [shift, setShift] = useState(false);
  const [visible, setVisible] = useState(false);
  const targetRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const isFr = (el: EventTarget | null) =>
      el instanceof HTMLInputElement && el.getAttribute("lang") === "fr";
    const onIn = (e: FocusEvent) => { if (isFr(e.target)) { targetRef.current = e.target as HTMLInputElement; setVisible(true); } };
    const onOut = () => { setTimeout(() => { if (!isFr(document.activeElement)) setVisible(false); }, 120); };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, []);

  if (!visible) return null;
  const keys = shift ? ACCENTS_UPPER : ACCENTS_LOWER;
  // pointerdown + preventDefault keeps focus in the input so the insert lands there
  const press = (fn: () => void) => (e: React.PointerEvent) => { e.preventDefault(); fn(); };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[color:var(--cahier-ink)]/20 bg-[var(--cahier-paper-2)] p-2 shadow-[0_-4px_16px_rgba(34,40,80,0.12)]">
      <div className="mx-auto flex max-w-md items-stretch gap-2">
        <button type="button" onPointerDown={press(() => setShift((s) => !s))}
          className={`cahier-btn cahier-btn-sm ${shift ? "cahier-btn-primary" : ""}`} aria-label="Shift case" title="Shift (uppercase / »)">⇧</button>
        <div className="grid flex-1 grid-cols-4 gap-1">
          {keys.map((ch) => (
            <button key={ch} type="button" onPointerDown={press(() => targetRef.current && insertAtCursor(targetRef.current, ch))}
              className="cahier-btn cahier-btn-sm !px-0 text-base" aria-label={`Insert ${ch}`}>{ch}</button>
          ))}
        </div>
        <button type="button" onPointerDown={press(() => setVisible(false))} className="cahier-btn cahier-btn-sm" aria-label="Hide accents">✕</button>
      </div>
    </div>
  );
}
