"use client";

/**
 * 4Mémoire's shared vocabulary — the pieces the DRILL
 * (/practice/flip-it/[collectionId], in DrillShell) and the TABLE
 * (/decks/[id], the browse/self-test grid) grade and render identically
 * (patch 20–21: the drill migrated to the shell, the table split out to
 * /decks/:id; both keep one answer model so a deck behaves the same on
 * either surface).
 */

import type { Collection, Item } from "@/lib/collections/schema";
import type { Bucket } from "@/lib/practice/buckets";

/* ─────────────────────────── model ─────────────────────────── */

export type Row = { item: Item; art: string; fr: string; full: string };

export function articleOf(collection: Collection, item: Item): string {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const tag = item.tags.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}

export function frFull(article: string, fr: string): string {
  if (!article) return fr;
  return article.endsWith("'") ? `${article}${fr}` : `${article} ${fr}`;
}

export function rowsOf(collection: Collection, items: Item[]): Row[] {
  return items.map((it) => {
    const art = articleOf(collection, it);
    return { item: it, art, fr: it.fr, full: frFull(art, it.fr) };
  });
}

/* ─────────────────────────── grading ─────────────────────────── */

/** Forgiving compare: drop accents + apostrophes + case + extra spaces. */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Case-insensitive since 2026-07-19 (audit): the name always promised it,
// but the function only forgave accents/apostrophes — so "fatigue" (a real
// error) passed while "Fatigué" (phone auto-capitalisation) failed. That
// inverts the forgiveness philosophy (effort counts, errors are never
// punished — see progress.ts). Trade-off: proper-noun capitals (la France)
// are no longer enforced here; grading capitals is a separate objective.
export function normCase(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Part = { key: string; type: "text" | "article"; label?: string; correct: string; alt?: string[] };

/** Build the answer parts for a row (article dropdown + noun, or 4 nat forms). */
export function partsFor(row: Row, isNat: boolean, hasArticles: boolean): Part[] {
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
  parts.push({ key: "fr", type: "text", label: hasArticles ? "noun" : undefined, correct: row.fr, alt: row.item.alt });
  return parts;
}

/** ONE judge for both surfaces: articles match exactly (∅ included),
 *  text parts accent/case-leniently against the answer and its alts. */
export function judgePart(p: Part, val: string | undefined): boolean {
  return p.type === "article"
    ? val === p.correct
    : [p.correct, ...(p.alt ?? [])].some((c) => normCase(val ?? "") === normCase(c));
}

export const ART_LABEL: Record<string, string> = {
  le: "le", la: "la", "l'": "l'", les: "les", un: "un", une: "une",
  des: "des", du: "du", "de la": "de la", "de l'": "de l'", "": "∅",
};

export function articleOptionsOf(rows: Row[]): string[] {
  const ART_ORDER = ["", "le", "la", "l'", "les", "un", "une", "des", "du", "de la", "de l'"];
  const set = new Set<string>();
  rows.forEach((r) => set.add(r.art));
  set.add("");
  return [...set].sort((a, b) => ART_ORDER.indexOf(a) - ART_ORDER.indexOf(b));
}

/* ─────────────────────────── card faces ─────────────────────────── */

export function FrenchAnswer({ row, hasArt }: { row: Row; hasArt: boolean }) {
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

export function NatForms({ nat, size = "lg" }: { nat: NonNullable<Item["nat"]>; size?: "lg" | "sm" }) {
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

export function sayText(row: Row): string {
  const n = row.item.nat;
  return n ? `il est ${n.ms}, elle est ${n.fs}, ils sont ${n.mp}, elles sont ${n.fp}` : row.full;
}

/* ─────────────────────────── ReviewToggle ─────────────────────────── */

export function ReviewToggle({ value, onChange }: { value: Bucket | undefined; onChange: (b: Bucket) => void }) {
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
