/**
 * THE single read path for collections. Games call this and never care whether a
 * deck is curated (bundled JSON) or user-created (Firestore). Swapping a source
 * later is a one-file change here.
 *
 * v2: no more `eligible` field — game-side filtering uses the structural helpers below
 * (hasLetris, hasMatching, gapfillItems …) so the rules live in the data, not on each item.
 */
import type { Collection, Item } from "./schema";
import { CURATED } from "@/content/collections";
import { getMyCollections } from "@/lib/firebase/collections";

export type LoadOpts = {
  /** Include the signed-in user's own decks from Firestore. Default true. */
  includeMine?: boolean;
};

export async function loadCollections(opts: LoadOpts = {}): Promise<Collection[]> {
  const { includeMine = true } = opts;
  const mine = includeMine ? await safe(getMyCollections) : [];
  return [...CURATED, ...mine].sort(byUnitLessonSeq);
}

async function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return []; // signed-out or offline → just curated
  }
}

/** Sort: explicit `seq` first; otherwise by (unit, lessonNo). User decks (no unit) trail. */
export function byUnitLessonSeq(a: Collection, b: Collection): number {
  const ka = a.seq ?? rankFromLesson(a);
  const kb = b.seq ?? rankFromLesson(b);
  return ka - kb;
}

function rankFromLesson(c: Collection): number {
  if (c.unit == null) return 9_999;
  return c.unit * 100 + (c.lessonNo ?? 99);
}

/* ── Grouping helpers for Home navigation: Unit → Lesson → Decks ── */

export type LessonGroup = {
  unit: number;
  lessonNo: number;
  lessonSlug: string;
  decks: Collection[];
};

/** Group curated/user decks into a stable Unit → Lesson tree. Skips decks with no unit. */
export function groupByLesson(cols: Collection[]): LessonGroup[] {
  const groups = new Map<string, LessonGroup>();
  for (const c of cols) {
    if (c.unit == null || c.lessonNo == null) continue;
    const key = `${c.unit}|${c.lessonNo}|${c.lessonSlug ?? ""}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        unit: c.unit,
        lessonNo: c.lessonNo,
        lessonSlug: c.lessonSlug ?? "",
        decks: [],
      };
      groups.set(key, g);
    }
    g.decks.push(c);
  }
  return [...groups.values()].sort((a, b) =>
    a.unit !== b.unit ? a.unit - b.unit : a.lessonNo - b.lessonNo,
  );
}

/** Decks WITHOUT a unit/lesson position — typically user-authored personal vocab. */
export function decksWithoutLesson(cols: Collection[]): Collection[] {
  return cols.filter((c) => c.unit == null || c.lessonNo == null);
}

/* ── Filter helpers (no per-item eligibility) ── */

/** All items across the given collections that carry ALL of `tags` (AND match). */
export function itemsByTags(cols: Collection[], tags: string[]): Item[] {
  return cols.flatMap((c) => c.items).filter((it) => tags.every((t) => it.tags.includes(t)));
}

/** Distinct tag values under a namespace, e.g. tagValues(cols, "difficulty"). */
export function tagValues(cols: Collection[], namespace: string): string[] {
  const set = new Set<string>();
  cols.forEach((c) =>
    c.items.forEach((it) =>
      it.tags.forEach((t) => t.startsWith(`${namespace}:`) && set.add(t)),
    ),
  );
  return [...set].sort();
}

/* ── Per-game "can this deck feed me?" predicates. ── */

export function hasLetris(c: Collection): boolean {
  const cols = c.gameConfig?.letris?.columns ?? [];
  if (cols.length < 2) return false;
  const keys = new Set(cols.map((k) => `col:${k.key}`));
  return c.items.some((it) => it.tags.some((t) => keys.has(t)));
}

export function hasMatching(c: Collection): boolean {
  return (c.gameConfig?.matching?.pairs?.length ?? 0) > 0;
}

export function hasMcq(c: Collection): boolean {
  return c.items.filter((it) => it.fr && it.en).length >= 4;
}

export function gapfillItems(c: Collection): Item[] {
  return c.items.filter(
    (it) => it.example && it.fr && it.example.toLowerCase().includes(it.fr.toLowerCase()),
  );
}
