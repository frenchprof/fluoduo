/**
 * Answers → outcome rows. Patch 26 (2026-08-17).
 *
 * The audit's "hot mess" was one flat grid mixing three things: a deck word
 * prefixed by its outcome, a bare word whose outcome was never resolved, and
 * a GramMarathon question about a whole outcome — coloured by position. This
 * module folds every recorded answer into its OUTCOME (`outcomeForItem`, the
 * curriculum spine from patch 12, which /moi never called), so a page renders
 * outcome rows with items nested under them, colour = accuracy tier, and the
 * unresolvable rest in one "Not yet mapped" bucket pinned last.
 *
 * Learner-safe: reads only the curriculum spine and content. Nothing here may
 * import teacher/roster modules (verify18/18b) — /moi, the Index and the
 * teacher page all import this.
 */
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { outcomeForItem } from "@/lib/evidence";
import { deckForItem } from "@/lib/curriculum";
import { tierFor } from "@/lib/progress";

/** The minimum a recorded answer needs to carry to be folded — plus the
 *  evidence block responses.ts has written since 2026-08-10 (D10: it was
 *  written and never read; readers pass it through since 2026-08-17). */
export type Answer = {
  item: string;
  status: string;
  /** The outcome the writer recorded (PRD §7). Preferred over the join. */
  outcomeId?: string | null;
  evidenceType?: string | null;
  assistance?: string | null;
  independent?: boolean | null;
};

/** The outcome an answer bears on: what the writer STORED first (evidence
 *  block), the item → outcome join table second (older rows, and games that
 *  record raw French). ONE resolver for every reader. */
export function outcomeOf(a: Pick<Answer, "item" | "outcomeId">): string | undefined {
  return (a.outcomeId && SIO_BY_ID.has(a.outcomeId) ? a.outcomeId : undefined) ?? outcomeForItem(a.item);
}

export type ItemRow = { item: string; label: string; n: number; missed: number };

export type OutcomeRow = {
  /** SIO id, or UNMAPPED. */
  sio: string;
  unit: number;
  num: number;
  topic: string;
  short: string;
  /** Deck behind the outcome (practise link). Undefined for UNMAPPED. */
  deck?: string;
  n: number;
  missed: number;
  /** 0..100 accuracy. */
  pct: number;
  /** Items missed at least once, most-missed first. */
  items: ItemRow[];
  /** How many distinct items were seen under this outcome. */
  itemsSeen: number;
  /** Items with a miss rate of 50%+ (what the row's bar shows). */
  weakItems: number;
};

export const UNMAPPED = "unmapped";

const SIO_BY_ID = new Map(SIOS.map((s) => [s.id, s] as const));

/** A miss is a miss. The writer (responses.ts) records exactly two statuses,
 *  `met` and `missed`; `retried` / `mastered` were read here and on the
 *  teacher page but never written by anything (D9) — gone since 2026-08-17. */
export function isMiss(status: string): boolean {
  return status === "missed";
}

/** French of a deck item, without its outcome prefix (chips live INSIDE their
 *  outcome row, so the SIO id would only repeat the row header). Marathon /
 *  pretest ids have no French of their own; the id stays. */
export function itemLabel(itemId: string): string {
  const deck = deckForItem(itemId);
  if (deck) {
    const c = CURATED.find((x) => x.id === deck);
    const it = (c?.items ?? []).find((x) => (x as { id?: string }).id === itemId) as { fr?: string } | undefined;
    if (it?.fr) return it.fr;
  }
  if (itemId.startsWith("finale:")) return `Marathon Q${itemId.split(":")[2] ?? ""}`.trim();
  return itemId;
}

/**
 * Fold answers into outcome rows. Order: `missed × weakItems` descending —
 * the audit's rule — then by accuracy ascending; UNMAPPED pinned last.
 * Rows with no miss at all are still returned (a heat-strip needs them);
 * callers wanting only "what to fix" filter `missed > 0`.
 */
export function outcomeRows(answers: Answer[]): OutcomeRow[] {
  const acc = new Map<string, { n: number; missed: number; items: Map<string, { n: number; missed: number }> }>();
  for (const a of answers) {
    if (!a.item) continue;
    const sio = outcomeOf(a) ?? UNMAPPED;
    let g = acc.get(sio);
    if (!g) acc.set(sio, (g = { n: 0, missed: 0, items: new Map() }));
    let it = g.items.get(a.item);
    if (!it) g.items.set(a.item, (it = { n: 0, missed: 0 }));
    g.n += 1; it.n += 1;
    if (isMiss(a.status)) { g.missed += 1; it.missed += 1; }
  }
  const rows: OutcomeRow[] = [];
  for (const [sio, g] of acc) {
    const s = SIO_BY_ID.get(sio);
    const items: ItemRow[] = [...g.items.entries()]
      .filter(([, v]) => v.missed > 0)
      .map(([item, v]) => ({ item, label: itemLabel(item), n: v.n, missed: v.missed }))
      .sort((a, b) => b.missed - a.missed || a.label.localeCompare(b.label));
    const weakItems = [...g.items.values()].filter((v) => v.missed * 2 >= v.n && v.missed > 0).length;
    rows.push({
      sio,
      unit: s?.unit ?? 99,
      num: s?.num ?? 999,
      topic: s?.topic ?? "Not yet mapped",
      short: s?.short ?? "Not yet mapped",
      deck: s?.collectionId ?? undefined,
      n: g.n,
      missed: g.missed,
      pct: g.n ? Math.round((100 * (g.n - g.missed)) / g.n) : 100,
      items,
      itemsSeen: g.items.size,
      weakItems,
    });
  }
  return rows.sort((a, b) => {
    if (a.sio === UNMAPPED) return 1;
    if (b.sio === UNMAPPED) return -1;
    return b.missed * b.weakItems - a.missed * a.weakItems || a.pct - b.pct || a.num - b.num;
  });
}

/** Per-outcome accuracy, 0..100, for the 50 SIOs — the heat-strip's input.
 *  Outcomes never answered are absent (the strip paints them neutral). */
export function outcomeAccuracy(answers: Answer[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of outcomeRows(answers)) if (r.sio !== UNMAPPED) out[r.sio] = r.pct;
  return out;
}

/** The tier token for an accuracy — ONE scale for /moi, the Index and the
 *  teacher page (weak under 50, medium under 75, otherwise good; neutral
 *  when nothing was answered). The thresholds live in progress.ts
 *  (`tierFor`) — this only maps the tier to its CSS token. */
export function tierToken(pct: number | null | undefined): string {
  const t = tierFor(pct);
  return t ? `var(--tier-${t})` : "var(--cahier-line-strong)";
}

/** Text-tone twin of tierToken (the number beside the bar). */
export function tierClass(pct: number | null | undefined): string {
  const t = tierFor(pct);
  return t ? `tier-${t}` : "";
}
