"use client";

/**
 * The 4Mémoire TABLE, split out of /practice/flip-it (patch 20–21).
 *
 * The drill route now renders one card in DrillShell; everything that was
 * about the WHOLE deck at once — the cover/reveal table, the all-cards
 * grid, grouping, sorting, subsets, notes, the reviewed column — lives
 * here, on the deck's own page. Same buckets store, same notes store, same
 * grading (shared.tsx) as the drill, so marking a card in either place
 * shows up in both.
 *
 * Views:
 *   • ▦ List — table; click a cell to cover/reveal; Show/Hide columns +
 *     rows; section headers when grouped; per-row Reviewed toggle.
 *   • ▤ All — every card; flip each, or Test Yourself each.
 * Spiral binding + index tabs come from CahierFrame.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { logEvent } from "@/lib/firebase/usage";
import PageBand from "@/components/PageBand";
import { activity } from "@/content/activities";
import PillSwitch from "@/components/PillSwitch";
import { goalNumberForDeck, stopForDeck } from "@/lib/stopTag";
import type { Collection, Item } from "@/lib/collections/schema";
import {
  loadLocal,
  setNote,
  syncIfDue,
  syncNow,
  hasDirtyNotes,
  graphemeCount,
  NOTE_MAX,
  type DeckNotes,
} from "@/lib/notes/store";
import { bareWord, displayEn, practiceItems } from "@/lib/collections/display";
import { loadBuckets, setBucket, type Bucket } from "@/lib/practice/buckets";
import { recordItemResult } from "@/lib/progress";
import { CahierFrame, TAB_HUES, type CahierTab } from "@/app/practice/flip-it/CahierFrame";
import {
  ART_LABEL,
  NatForms,
  ReviewToggle,
  articleOptionsOf,
  frFull,
  judgePart,
  partsFor,
  rowsOf,
  type Part,
  type Row,
} from "@/app/practice/flip-it/shared";
import { shuffle as shuffleArr } from "@/lib/shuffle";
import { HOME_HREF, sioHref } from "@/lib/routes";

/* ─────────────────────────── step labels ─────────────────────────── */

function Step({ n, label, wide, children }: { n: number; label: string; wide?: boolean; children: React.ReactNode }) {
  // Number in a fixed left gutter; the LABEL keeps its indent so the numbers
  // read as a column.
  //
  // ⚠️ THE ATTRIBUTION THAT USED TO BE ON THIS LINE IS DISPUTED. It read:
  // «Dan, 2026-07-05: "the column of numbers should be kept clear of content,
  // which should be indented to the right"». Dan, 2026-09-13: ***"THIS IS
  // UNTRUE! I NEVER MADE SUCH A RULING"***.
  //
  // It was already in this file and this session repeated it as established
  // fact while adding `wide` below — which is how a quotation nobody can source
  // becomes load-bearing. The INDENT ITSELF is kept because it reads well and
  // nothing depends on the quote; what is removed is the claim that it answers
  // a ruling. If the layout is ever questioned, it is a design choice to argue
  // with, not a decision already made.
  //
  // `wide` DROPS THE INDENT FOR THE CONTENT ONLY (Dan, 2026-09-13, on
  // MémoiRecall: *"Under the numbers there is plenty of space. Please use the
  // space wisely. And can we not have the table on the paper rather having to
  // scroll within that tiny space?!"*).
  //
  // Below the label there is no number to sit beside — the gutter is empty
  // paper — so a table indented there pays 42px of width for nothing and then
  // scrolls sideways to make it up. That is how « your best friend » came out
  // as « your best fri ».
  //
  // Applied only to the step that holds the table. The narrow steps keep the
  // indent, because a row of small controls under a wide label reads as part of
  // that label and losing the alignment would make it read as a new section.
  const head = (
    <div className="mb-2 flex items-center gap-2.5">
      <span className="cahier-hl rounded-sm px-1.5 text-base font-black text-[color:var(--cahier-ink)]">{label}</span>
      <div className="h-[0.125rem] flex-1 bg-[color:var(--cahier-ink)]/25" />
    </div>
  );
  const badge = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-base font-black text-white shadow-[2px_2px_0_var(--cahier-hl,#ffe000)]">{n}</span>
  );
  if (wide) {
    return (
      <div className="mb-4">
        <div className="flex gap-2.5">
          {badge}
          <div className="min-w-0 flex-1">{head}</div>
        </div>
        {children}
      </div>
    );
  }
  return (
    <div className="mb-4 flex gap-2.5">
      {badge}
      <div className="min-w-0 flex-1">
        {head}
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────── model ─────────────────────────── */

type View = "overview" | "allcards";
type Order = "deck" | "shuffle" | "article" | "continent" | "col";
type SortKey = "en" | "fr" | "art" | "ms" | "fs" | "mp" | "fp" | "reviewed" | "notes";

const CTRL_LABEL =
  "w-20 shrink-0 text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]";

// Short names (Dan, 2026-07-20) — the toolbar must not wrap on phones.
const VIEW_TABS: CahierTab[] = [
  { key: "overview", label: "▦ List", hue: TAB_HUES[0] },
  { key: "allcards", label: "▤ All", hue: TAB_HUES[3] },
];

const ART_RANK: Record<string, number> = { le: 0, la: 1, "l'": 2, les: 3, "": 9 };
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

export default function CuratedDeckTable({ collection }: { collection: Collection }) {
  // EVERY item is flippable — emoji is decoration on the card face, not an
  // entry requirement.
  const items = practiceItems(collection);
  if (items.length === 0) {
    return (
      <main className="cahier-sheet relative min-h-screen">
        <div className="cahier-binding" aria-hidden />
        <div className="mx-auto max-w-3xl px-4 py-10 pl-16 text-center text-[color:var(--cahier-ink-soft)]">
          No flippable vocab in <code>{collection.id}</code>.{" "}
          <Link href="/home" className="font-bold text-[color:var(--cahier-ink)] underline">Home</Link>
        </div>
      </main>
    );
  }
  return <DeckTable collection={collection} items={items} />;
}

// Decks→Flip It merge (Dan, 2026-08-02): the retired Decks browser also
// showed a unit/lesson badge, crossRefs ("Also revisited in…"), and the
// deck's subtitle. Deliberately NOT ported here — this table is always
// reached from inside a SIO page/popup that already carries that context,
// and none of the three helps a learner find the correct answer (Dan's
// litmus test, AGENTS.md 2026-07-02: text that doesn't do that is
// redundant).
/**
 * IT IS THE PAGE BAND NOW (Dan, 1 Sep: "there are pages where there is an
 * identity crisis as to where the activity name should be placed — we want
 * visual unity please").
 *
 * This was a pale bar with a back button, the activity name and the deck's,
 * set in the display face at 14px on translucent paper — a fourth way of
 * heading a page, on a page that also had no band. Nothing about it needed to
 * be its own thing: PageBand already takes a control on its left (`lead` — it
 * is where a drill's ✕ lives), a title, a sub-line and one chip, which is
 * exactly what this row held. The words are unchanged; where they sit and what
 * they sit on are now the site's.
 *
 * The stop joins them, from the same helper every other surface uses.
 */
function TopBar({ collectionId }: { collectionId: string }) {
  return (
    <PageBand
      /* THE ACTIVITY'S OWN NAME, FROM THE REGISTRY (Dan, 7 Sep).
         He asked why this band said « Deck », and when it was put to him that
         the two pages are deliberately separate: *"No way José, they are
         supposed to be one and the same activity!"*

         SO: two PAGES, two URLs — `/decks/<id>` is the word table, notes and
         shuffle; `/practice/flip-it/<id>` is the cards themselves — but ONE
         ACTIVITY, wearing one name on both. Dan the same day: *"i wanted to
         keep the pages apart, and in different URL"*. Apart is about the
         pages, not about what they are called.

         THIS REVERSES A 1 SEP DECISION, on Dan's word. That day he asked *"why
         are there two 4Memoires"* and this band was renamed to « Deck » to
         answer it, on the reasoning that a page is not the drill it links to.
         The reasoning was wrong about what he meant, and it stood for six
         days. Recorded so the next session does not restore « Deck » from the
         earlier note and start the loop again.

         Read from `activity("flip")`, never typed: the name lives once, in
         FAMILIES/ACTIVITIES, and everything else derives (the Memo-rename
         precedent — a display rename never touches keys or routes, and this
         page's key and URL do not move). Typing "MémoiRecall" here is how the
         band drifts the next time the activity is renamed. */
      activeKey="flip"
      title={activity("flip")?.name ?? "MémoiRecall"}
      /* …and its glyph from the same row (Dan, 11 Sep: "we have fixed emojis
         for them"). This is the ONE band the shell does not draw — the page
         suppresses it and heads its table with this — so it is also the one
         that silently misses anything added to PageBand from the shells. */
      emoji={activity("flip")?.emoji}
      goal={goalNumberForDeck(collectionId)}
      /* The ← became the band's ✕ (Dan, 1 Sep: "all strips … with a X"). One
         control on every strip, spelt once in PageBand, rather than a back
         arrow here and a close there. */
      /* THE STOP'S 🎯 PAGE, NOT THE MAP (Dan, 2026-09-13) — the same move
         `drillExitHref` makes for every drill, spelt here because this band is
         the page's own rather than the shell's. A deck off the study path has
         no stop, and only then does the map remain the way out. */
      exitHref={(() => { const s = stopForDeck(collectionId); return s ? sioHref(s.id) : HOME_HREF; })()}
      /* 🔊 left this row on 2026-08-31 because SiteTopBar sits directly above
         it and carries the same control. THE (?) LEFT ON 2026-09-02 for the
         identical reason, which the note here had got wrong: it claimed to be
         "the only help this page has", and it never was. It mounted HelpDot,
         whose whole purpose is pages OUTSIDE the CahierShell — the immersive
         games, which have no ☰ — and it opened the same twenty-tile grid the
         ☰ two centimetres above it opened from its « MENU » row. Two
         doors to one room, on one screen, and it made the deck the only band
         in the app with a fourth thing on it (Dan, seeing the strips lined up:
         "what is with the question mark on the deck strip"). */
      /* No binding clearance — `.page-band` paints over the coils now
         (globals.css), so this band takes PageBand's own padding like every
         other one and its ✕ lands where every other ✕ lands. */
    />
  );
}

/* ─────────────────────────── controller ─────────────────────────── */

function DeckTable({ collection, items }: { collection: Collection; items: Item[] }) {
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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
  useEffect(() => { setBuckets(loadBuckets(collection.id)); }, [collection.id]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
    setNotes(loadLocal(collection.id));
    syncIfDue(collection.id).then(setNotes).catch(() => {});
  }, [collection.id]);
  // Background auto-sync: whenever a note edit leaves the deck dirty, push it
  // to the cloud after a short debounce — no manual Sync button (Dan,
  // 2026-07-05). syncNow clears the dirty flag, so this settles, not loops.
  useEffect(() => {
    if (!hasDirtyNotes(collection.id)) return;
    const t = window.setTimeout(() => {
      syncNow(collection.id).then(setNotes).catch(() => {});
    }, 2500);
    return () => window.clearTimeout(t);
  }, [notes, collection.id]);

  const base = useMemo<Row[]>(() => rowsOf(collection, items), [collection, items]);

  const articleOptions = useMemo(() => articleOptionsOf(base), [base]);
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
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
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

  // NO SIDE FLAPS — this page draws its own view switch (7 Sep).
  // VIEW_TABS was passed to CahierFrame AND mapped into the "View & mode" row
  // below, so on a desktop the same two controls appeared twice on one screen:
  // « ▦ List · ▤ All » in the row, and the same pair again as flaps off the
  // right edge of the paper. Both drove the same `setView`. On a phone it
  // never showed, because the rail collapses into ☰ below the breakpoint —
  // which is why it survived this long.
  //
  // The row is the one Dan designed (2026-07-20: views as short buttons, the
  // study–test switch beside them, the drill's door first), so the rail is the
  // copy that goes. Two doors to one control on one screen is the HelpDot
  // fault.
  return (
    <CahierFrame
      tabs={[]}
      active={view}
      onSelect={(k) => setView(k as View)}
      siteActive="flip"
      topBar={<TopBar collectionId={collection.id} />}
    >
      <Step n={1} label="View & mode">
      {/* ONE row (Dan, 2026-07-20). Views as short buttons, the 📖/✍️
          study–test switch beside them, the drill's own door first, and the
          tool buttons emoji-only with full titles on hover/long-press. */}
      <div className="mb-4 mt-1 flex flex-wrap items-center gap-2">
        <Link href={`/practice/flip-it/${collection.id}`} className="cahier-btn cahier-btn-sm cahier-btn-primary">
          🃏 Practise
        </Link>
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
        {/* THE SAME SWITCH AS THE MAP'S (Dan, 1 Sep: "the study-test switch
            should be redone like the 2D 3D switch"). It was a small track with
            an emoji knob AND a word beside it — the emoji said which mode by a
            picture, the word said it again in text, and the pair took 96px to
            answer one question twice. The pill says it once, inside itself, in
            the same object the rest of the app uses. */}
        <PillSwitch
          label="Card mode"
          title={test ? "Test — type the name" : "Study — click to reveal"}
          offLabel="📖"
          onLabel="✍️"
          offSpoken="Study"
          onSpoken="Test"
          offHue="win"
          onHue="streak"
          on={test}
          onFlip={setTest}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
        {/* Emoji-only tools (Dan, 2026-07-20) — titles carry the words. */}
        <button type="button" onClick={() => applyOrder("shuffle")} title="Shuffle the order" aria-label="Shuffle the order"
          className={`cahier-btn cahier-btn-sm ${order === "shuffle" ? "cahier-btn-primary" : ""}`}>🔀</button>
        <button type="button" onClick={() => setEditNotes((e) => !e)}
          title={editNotes ? "Stop editing notes" : "Edit notes"} aria-label={editNotes ? "Stop editing notes" : "Edit notes"}
          className={`cahier-btn cahier-btn-sm ${editNotes ? "cahier-btn-accent" : ""}`}>
          {editNotes ? "✓✎" : "✎"}
        </button>
        {/* Flip-all sits just left of ⚙; only meaningful in All Cards study mode */}
        {view === "allcards" && !test && (
          <button type="button" onClick={flipEverything} className="cahier-btn cahier-btn-sm"
            title={flipAll ? "Show all English" : "Flip all to French"} aria-label={flipAll ? "Show all English" : "Flip all to French"}>
            {flipAll ? "🇬🇧⇆" : "🇫🇷⇆"}
          </button>
        )}
        {/* ⚙ grouping popover — only for decks that actually have a group axis
            (article / continent); simple decks have nothing to put here. */}
        {(canGroupArt || hasRegion) && (
        <div className="relative">
          <button type="button" onClick={() => setShowOptions((o) => !o)} aria-expanded={showOptions}
            className={`cahier-btn cahier-btn-sm ${showOptions ? "cahier-btn-primary" : ""}`}>
            ⚙ Group {showOptions ? "▴" : "▾"}
          </button>
          {showOptions && (
            <>
            <div className="fixed inset-0 z-20" onClick={() => setShowOptions(false)} aria-hidden />
            {/* Above its own scrim, below the site bar. In-flow page content
                that reaches the bar's stacking number can swallow the ☰
                menu's taps — verify94 holds the ceiling. */}
            <div className="absolute right-0 z-[25] mt-1 flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-2 rounded-xl border-2 border-[color:var(--cahier-ink)]/20 bg-white p-3 shadow-xl">
              <span className={CTRL_LABEL}>group by</span>
              <div className="flex flex-wrap items-center gap-2">
                {([
                  ["none", "✕", "No grouping"] as ["none" | "article" | "continent", string, string],
                  ...(canGroupArt ? ([["article", "le·la", "By article"]] as ["none" | "article" | "continent", string, string][]) : []),
                  ...(hasRegion ? ([["continent", "🌍", "By continent"]] as ["none" | "article" | "continent", string, string][]) : []),
                ] as ["none" | "article" | "continent", string, string][]).map(([k, icon, title]) => (
                  <button key={k} type="button" onClick={() => setGroup(k)} title={title} aria-label={title}
                    className={`cahier-btn cahier-btn-sm ${groupBy === k ? "cahier-btn-primary" : ""}`}>{icon}</button>
                ))}
              </div>
              <span className="text-[0.7rem] text-[color:var(--cahier-ink-soft)]">groups + sections + colours rows · sort A–Z via column headers</span>
            </div>
            </>
          )}
        </div>
        )}
        </div>
      </div>

      </Step>
      <Step n={2} label="Filter (optional)">
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

      {/* Subset navigator — work through the deck one subset at a time in the card view */}
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
      <Step n={3} label="Study / Self-test" wide>
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
      ) : (
        <AllCards deckId={collection.id} rows={rows} isNat={isNat} test={test} order={order} buckets={buckets} onBucket={setRowBucket}
          articleOptions={articleOptions} flipAll={flipAll} flippedIds={flippedIds} setFlippedIds={setFlippedIds} />
      )}
      </Step>
      {/* accent keyboard is now the global one mounted in layout.tsx */}
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

/**
 * The consistent check-answer widget used in the All view: type/select the
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

  const judge = (p: Part) => judgePart(p, vals[p.key]);
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
          {phase === "checked" && <span lang="fr" className={`text-lg font-semibold ${allRight ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--cahier-la)] line-through"}`}>{mine.trim() || "—"}</span>}
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
              {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--cahier-la)] line-through"}`}>{mine.trim() ? mine : "—"}</span>}
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
              {articleOptions.map((a) => <option key={a} value={a}>{ART_LABEL[a] ?? a}</option>)}
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
  deckId, rows, isNat, test, order, buckets, onBucket, articleOptions, flipAll, flippedIds, setFlippedIds,
}: {
  deckId: string; rows: Row[]; isNat: boolean; test: boolean; order: Order;
  buckets: Record<string, Bucket>; onBucket: (id: string, b: Bucket) => void;
  articleOptions: string[];
  flipAll: boolean; flippedIds: Set<string>; setFlippedIds: (fn: (s: Set<string>) => Set<string>) => void;
}) {
  function flipOne(id: string) {
    setFlippedIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
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
                    onResult={(ok) => { recordItemResult(row.item.id, ok, undefined, `deck-test:${deckId}`); void logEvent("flashcard.review", { itemId: row.item.id, rating: ok ? "good" : "again" }); if (ok) onBucket(row.item.id, "reviewed"); }} />
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
/* `short` is the label a PHONE shows. Two columns are narrower than their own
   name once the sheet is 303px: « emoji » needs 28px in a 31px column with
   16px of padding, « Reviewed » 48px in 45px — and a header that does not fit
   pushes the whole table sideways again, which is the fault being fixed. A
   header is a label, so it may abbreviate; the full word stays in `title` and
   in the sort button's tooltip. Desktop is untouched. */
type ColDef = { key: ColKey; label: string; w: number; short?: string };

/* Columns a phone drops so the words get the room. `pick` selects rows for a
   bulk action and `notes` is empty until somebody types in it — neither is
   needed to READ the deck, which is what a phone is for. Empty = keep all
   seven at every width.

   MEASURED, not guessed. With the Reviewed switch reduced to a round button
   its column fell from 45px to 26px — and `notes` then became the WIDEST
   column on the sheet at 96px, on a deck where every notes cell is empty.
   English still had 60px and French 68px, so « professeur » still broke.
   Dropping these two gives the two word columns 97px and 110px. */
const NARROW_DROP: ColKey[] = ["pick", "notes"];

const STD_COLS: ColDef[] = [
  { key: "pick", label: "pick", w: 42 }, { key: "flag", label: "emoji", w: 44, short: "" },
  { key: "eng", label: "English", w: 150 }, { key: "art", label: "art.", w: 72 },
  { key: "fr", label: "French", w: 170 }, { key: "deck", label: "Reviewed", w: 64, short: "✓" },
  { key: "notes", label: "notes", w: 240 },
];
const NAT_COLS: ColDef[] = [
  { key: "pick", label: "pick", w: 42 }, { key: "flag", label: "emoji", w: 44, short: "" },
  { key: "fr", label: "country", w: 130 }, { key: "ms", label: "il est", w: 120 },
  { key: "fs", label: "elle est", w: 120 }, { key: "mp", label: "ils sont", w: 120 },
  { key: "fp", label: "elles sont", w: 120 }, { key: "deck", label: "Reviewed", w: 64, short: "✓" },
  { key: "notes", label: "notes", w: 220 },
];
// The "art." column is populated by articleOf(), which reads the deck's Letris
// columns. For a deck sorted by PREPOSITION (en/au/aux/à…) those values are
// prepositions, not articles (Dan, 2026-07-06: "grossly misnamed: it is not
// article") — so title the column accordingly.
const PREP_PURE = new Set(["à", "en", "au", "aux", "de", "d'"]);
const PREP_ALL = new Set(["à", "en", "au", "aux", "de", "du", "des", "d'", "à la", "à l'", "de la", "de l'"]);
function articleColLabel(articleOptions: string[]): string {
  const vals = articleOptions.filter((a) => a !== "");
  const isPrep = vals.length > 0 && vals.every((a) => PREP_ALL.has(a)) && vals.some((a) => PREP_PURE.has(a));
  if (isPrep) return "prép.";
  // Neither articles nor prepositions (e.g. stress-pronouns' "c'est" frame):
  // a neutral header beats a wrong one.
  if (vals.some((a) => !(a in ART_LABEL))) return "forme";
  return "art.";
}

const COVERABLE: ColKey[] = ["eng", "art", "fr", "ms", "fs", "mp", "fp", "notes"];
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
  const COLS = (isNat ? NAT_COLS : STD_COLS).map((c) =>
    c.key === "art" ? { ...c, label: articleColLabel(articleOptions) } : c);
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
  // ON A PHONE THE WORDS COME FIRST (Dan, 2026-09-13: *"can we not have the
  // table on the paper rather having to scroll within that tiny space?!"*).
  //
  // Fitting the table to the sheet was only half the answer. SEVEN authored
  // columns sum to 802px; shared proportionally across a 303px sheet, English
  // gets 56px and French 63px — and the three that are not words take 242px of
  // the 802, so on a phone the checkbox, the emoji and the Reviewed toggle
  // claimed more room than English and French combined. « professeur » cannot
  // fit 63px at any weight, so it was cut.
  //
  // The checkbox and the notes column are the two a learner reading the deck
  // does not need: one selects rows for a bulk action, the other is empty on
  // every row until somebody types in it. Dropping just those two below 640px
  // returns ~110px to the words, which is the difference between « profes-
  // seur » and « professeur ». Nothing is removed on a tablet or a desktop.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    // Read after mount on purpose: the viewport width is unknowable on the
    // server, so seeding this during render would make SSR and the first
    // client render disagree.
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const cols = (isNat || !redundantEn ? COLS : COLS.filter((c) => c.key !== "eng"))
    .filter((c) => !((hasLang || !hasArt) && c.key === "art")) // no article axis → no art column
    .filter((c) => !(c.key === "flag" && !rows.some((r) => r.item.emoji || r.item.lang))) // no visuals → no flag column
    .filter((c) => !(narrow && NARROW_DROP.includes(c.key))); // phone: the words get the room
  // The header a learner sees: the language relabel first, then the phone's
  // short form where the column has one.
  const headLabel = (c: ColDef) =>
    c.key === "flag" && hasLang ? "language" : narrow && c.short !== undefined ? c.short : c.label;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
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

  // grouping → section header rows (same helper drives All Cards)
  const grouped = useMemo(() => groupRows(rows, order), [rows, order]);

  const totalW = cols.reduce((s, c) => s + widthOf(c), 0);

  return (
    <div>
      {/* Per-column hiding lives on each header (◻). A contextual "Reveal all"
          appears only when something is covered. */}

      <div className="overflow-x-auto rounded-xl border-2 border-[color:var(--cahier-ink)]/15 bg-white">
        {/* THE TABLE FITS THE PAPER (Dan, 2026-09-13: *"can we not have the table on
            the paper rather having to scroll within that tiny space?!"*).

            `width: totalW` is the SUM of the per-column pixel widths — 802px on
            the tu-vous deck — so on a 390px phone the table was always wider
            than its box and always scrolled sideways. That is what clipped
            « your best friend » to « your best fri ».

            `min(totalW, 100%)` changes nothing where there is room: on a
            desktop 802px is under the available width, so the columns keep
            their authored sizes. Where there is not, `table-layout: fixed`
            shares the width between the same columns in the same proportions
            and the text wraps instead of hiding. `minWidth` goes with it — it
            was the floor that made the overflow inevitable. */}
          <table className="text-left text-sm" style={{ tableLayout: "fixed", width: `min(${totalW}px, 100%)` }}>
          {/* PROPORTIONAL, NOT PIXEL (Dan, 2026-09-13: *"can we not have the
              table on the paper rather having to scroll within that tiny
              space?!"*).

              Capping the TABLE at `min(totalW, 100%)` was not enough and the
              measurement said why: with `table-layout: fixed` the `<col>`
              widths are authoritative, so a colgroup summing to 802px pulled
              the table back out to 802px inside a 303px box — style said
              `min(802px, 100%)` and the rendered width was 802 regardless.

              As PERCENTAGES of that same total the columns keep their authored
              proportions exactly (42/80/150/170/120/240 → 5.2%/10%/18.7%/…)
              and the table now fits whatever room it is given: the same layout
              on a desktop, and on a phone the text wraps instead of hiding.
              Manual column resizing still works — `widthOf` is the numerator,
              so dragging a handle changes the share.

              AND THAT ALONE TRADED ONE CLIPPING FOR ANOTHER, found by putting
              the two builds side by side rather than by reading the diff. The
              sideways scroll went, but every `<td>` carries `overflow-hidden`,
              and under `table-layout: fixed` a WORD longer than its column is
              cut rather than wrapped. « meilleur ami » came out « meilleu ami »,
              « professeur » « professe », « Monsieur » « Monsieu » — 64 cells
              on this deck. Dan's complaint was « your best fri »; a fix that
              leaves « professe » has not answered it.

              `break-words` (overflow-wrap: break-word) breaks a word ONLY when
              it cannot fit, so desktop is untouched and the phone wraps instead
              of cutting. The padding goes 12px -> 8px below `sm` for the same
              reason: at six columns on a 303px sheet, 24px of padding was over
              two fifths of the English column. */}
          <colgroup>{cols.map((c) => <col key={c.key} style={{ width: `${(widthOf(c) / totalW) * 100}%` }} />)}</colgroup>
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
                <th
                  key={c.key}
                  className="relative break-words px-2 py-2 sm:px-3"
                  // Announce sort state to assistive tech (audit 2026-07-19).
                  aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {/* WRAPS, because a header may be wider than its column.
                      « Reviewed ⇅ » is 66px of unbreakable inline-flex; once
                      the switch below it became a round button its column fell
                      to 45px, and the header alone pushed 23px of sideways
                      scroll back into a table that had just stopped scrolling.
                      A header is a label, not a control — it may stack. */}
                  <span className="inline-flex max-w-full flex-wrap items-center gap-1">
                    {sk ? (
                      // A real <button>, not a bare span (audit 2026-07-19):
                      // spans gave no keyboard access and, on touch, no
                      // affordance at all. The faint ⇅ makes "sortable"
                      // visible without hover; it sharpens to ▲/▼ when active.
                      <button
                        type="button"
                        onClick={() => onSortCol(sk)}
                        title={`Sort by ${c.key === "flag" && hasLang ? "language" : c.label}`}
                        className="inline-flex max-w-full cursor-pointer select-none flex-wrap items-center gap-0.5 hover:text-[color:var(--cahier-ink)]"
                      >
                        {headLabel(c)}
                        <span aria-hidden className={active ? "" : "opacity-40"}>
                          {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </button>
                    ) : (
                      <span>{headLabel(c)}</span>
                    )}
                    {coverable && !test && (
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
                      <TestRow key={row.item.id} deckId={deckId} row={row} cols={cols} isNat={isNat}
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
                          className={row.item.lang ? "inline-flex items-baseline gap-1.5 whitespace-nowrap" : "text-base sm:text-2xl"}>
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
                          <td key={c.key} className="overflow-hidden break-words px-2 py-2 sm:px-3"
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
  deckId, row, cols, isNat, articleOptions, status, onBucket, selected, onToggleSelect, notes, editNotes, onNote, tint,
}: {
  deckId: string; row: Row; cols: ColDef[]; isNat: boolean; articleOptions: string[];
  status: Bucket | undefined; onBucket: (id: string, b: Bucket) => void;
  selected: Set<string>; onToggleSelect: (id: string) => void;
  notes: DeckNotes; editNotes: boolean; onNote: (t: string) => void; tint?: string;
}) {
  const parts = partsFor(row, isNat, articleOptions.some((a) => a !== ""));
  const [vals, setVals] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "checked" | "revealed">("idle");
  const judge = (p: Part) => judgePart(p, vals[p.key]);
  const allRight = parts.every(judge);
  const answerKeys = parts.map((p) => p.key);
  const lastKey = answerKeys[answerKeys.length - 1];
  const partByKey: Record<string, Part> = Object.fromEntries(parts.map((p) => [p.key, p]));
  // article decks show ONE integrated result (article + noun as a phrase), not per-token marks
  const hasArt = !!partByKey["art"];
  const myArt = vals["art"] && vals["art"] !== "__unset__" ? vals["art"] : "";
  const mergedMine = frFull(myArt, vals["fr"] ?? "");

  function check() {
    setPhase("checked");
    // Test Yourself types the target from the English/emoji prompt — constrained
    // production. Untagged it stored no evidence type at all (audit 2026-08-30).
    recordItemResult(row.item.id, allRight, mergedMine || undefined, `deck-test:${deckId}`);
    void logEvent("flashcard.review", { itemId: row.item.id, rating: allRight ? "good" : "again" });
    if (allRight) onBucket(row.item.id, "reviewed");
  }
  function reveal() { setPhase("revealed"); }
  function retry() { setPhase("idle"); setVals({}); }
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); check(); } };

  const answerCell = (key: string) => {
    const p = partByKey[key];
    if (phase !== "idle") {
      const ok = judge(p);
      const mine = p.type === "article" ? (vals[p.key] === undefined ? "" : (ART_LABEL[vals[p.key]] ?? vals[p.key])) : (vals[p.key] ?? "");
      return (
        <span className="flex flex-wrap items-baseline gap-x-1 text-sm">
          {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--cahier-la)] line-through"}`}>{mine?.trim() ? mine : "—"}</span>}
          {(!ok || phase === "revealed") && <span lang="fr" className="cahier-display font-bold"><span className="cahier-hl">{p.type === "article" ? (ART_LABEL[p.correct] ?? p.correct) : p.correct}</span></span>}
          {phase === "checked" && <span>{ok ? "✓" : "✗"}</span>}
        </span>
      );
    }
    return p.type === "article" ? (
      <select aria-label="article" value={vals[p.key] ?? "__unset__"} onKeyDown={onKey}
        onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))} className="!w-14">
        <option value="__unset__" disabled>-</option>
        {articleOptions.map((a) => <option key={a} value={a}>{ART_LABEL[a] ?? a}</option>)}
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
          // Mirror the browse-mode flag cell (hotfix 2026-07-20): language
          // decks carry greeting+autonym, not an emoji — the emoji-only
          // version rendered those cells blank in Test Yourself.
          <span title={displayEn(row.item)} className={row.item.lang ? "inline-flex items-baseline gap-1.5 whitespace-nowrap" : "text-base sm:text-2xl"}>
            {row.item.lang ? (
              <>
                <span lang="fr" className="text-base font-bold text-[color:var(--cahier-ink)]">{row.item.lang.greeting}</span>
                <span className="text-[11px] text-[color:var(--cahier-ink-soft)]">{row.item.lang.autonym}</span>
              </>
            ) : row.item.emoji}
          </span>
        );
        // The English PROMPT (hotfix 2026-07-20): TestRow's cell list simply
        // had no "eng" branch, so the whole column rendered EMPTY in Test
        // Yourself — students were answering with no prompt visible. Same
        // markup as the browse-mode cell.
        else if (c.key === "eng") content = <span>{row.item.en}{row.item.note ? <span className="text-[color:var(--cahier-ink-soft)]"> {row.item.note}</span> : null}</span>;
        else if (c.key === "fr" && isNat) content = <span lang="fr" className="font-bold">{row.fr}</span>;
        else if (answerKeys.includes(c.key)) {
          if (hasArt && phase !== "idle") {
            // integrative result: the full "article + noun" phrase, one mark, shown in the French cell
            content = c.key === "fr" ? (
              <span className="flex w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
                {phase === "checked" && <span lang="fr" className={`font-semibold ${allRight ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--cahier-la)] line-through"}`}>{mergedMine.trim() || "—"}</span>}
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
        return <td key={c.key} className="overflow-hidden break-words px-2 py-2 sm:px-3">{content}</td>;
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
      <span className={`text-[10px] tabular-nums ${n >= NOTE_MAX ? "font-bold text-[color:var(--drill-bad-mid)]" : "text-[color:var(--cahier-ink-soft)]"}`}>{n}/{NOTE_MAX}</span>
    </div>
  );
}
