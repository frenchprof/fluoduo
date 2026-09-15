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
import { gradeAgainst } from "@/lib/practice/cloze";

/* ─────────────────────────── model ─────────────────────────── */

/** A card, and THE DECK IT CAME FROM.
 *
 *  `deckId` exists for the mixed revision run (Dan, 2026-09-14, choosing one
 *  MémoiRecall step *"drawing across all 17"* tested stops rather than
 *  seventeen separate doors). A single-deck run has every row carrying the same
 *  id, so nothing about it changes.
 *
 *  IT IS NOT COSMETIC. Two things in this drill are filed PER DECK — the
 *  reviewed/again buckets in localStorage, and the evidence tag
 *  `flip-it:<deck>` that the mastery model reads. Run seventeen decks under one
 *  synthetic id and a learner's real per-deck progress is neither read nor
 *  written: the cards would all file under a deck that does not exist. */
export type Row = { item: Item; deckId: string; art: string; fr: string; full: string };

export function articleOf(collection: Collection, item: Item): string {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const tag = item.tags.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}

/** The column's frame in front of the item's French — ONCE.
 *
 *  A Letris column carries a prefix so a deck can hold bare fragments and let
 *  the board supply the frame: « du vent » under IL Y A. Four decks do not do
 *  that. They store the whole sentence in `fr` and keep the col: tag for the
 *  board, and until now this function pasted the frame on anyway, so
 *  MémoiRecall dealt « il fait Il fait beau. » and « un un sac », and VoixLà
 *  ASKED THE LEARNER TO SAY THAT and graded against it. Measured on the built
 *  app at 430px, 2026-09-13: 60 rows across weather-letris (23),
 *  objets-articles (20) and en-au-aux-a (17).
 *
 *  So: if the French already opens with the frame, it IS the full form. The
 *  test is on the joined head (« un » + a space), never the bare word — « ma »
 *  is a prefix of « maison », and stripping the space would swallow the frame
 *  on the one possessives row that starts with those two letters. */
export function frFull(article: string, fr: string): string {
  if (!article) return fr;
  const head = article.endsWith("'") ? article : `${article} `;
  return fr.toLowerCase().startsWith(head.toLowerCase()) ? fr : `${head}${fr}`;
}

export function rowsOf(collection: Collection, items: Item[]): Row[] {
  return items.map((it) => {
    const art = articleOf(collection, it);
    return { item: it, deckId: collection.id, art, fr: it.fr, full: frFull(art, it.fr) };
  });
}

/* ─────────────────────────── grading ─────────────────────────── */

// The private normalizers (norm, normCase) died in the grading unification
// (2026-08-11): they mapped apostrophes to SPACE where every other drill
// deleted them and had no hyphen or punctuation rule at all — so « l’eau »
// passed here and failed Complete It, while « leau » and « dix sept » did
// the reverse, on the same deck rows. judgePart keeps its name and its
// one-judge-both-surfaces contract; the letters now grade in lib/practice/
// cloze.ts like everywhere else. (norm was also dead — zero callers.)

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

/** ONE judge for both surfaces: articles match exactly (∅ included), text
 *  parts through THE grader (cloze.ts) against the answer and its alts —
 *  accent/case/apostrophe/hyphen-lenient, same verdict as every drill. */
export function judgePart(p: Part, val: string | undefined): boolean {
  return p.type === "article"
    ? val === p.correct
    : gradeAgainst(val ?? "", [p.correct, ...(p.alt ?? [])]) !== "wrong";
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
