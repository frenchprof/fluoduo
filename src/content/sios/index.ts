/**
 * The 50-SIO spine — the navigation backbone of FluoLingo.
 *
 * Generated from docs/handoff/LAF1201_SIOs_Flashcards_v9.csv by scripts/gen-sios.mjs
 * (the v9 spec is the source of truth; regenerate, don't hand-edit sios.json).
 *
 * Each SIO is one learning intention: a learner-facing Can-Do statement plus the
 * measurable linguistic competence the pre/post activities assess. The home hub
 * lists all 50 grouped by unit; each links to /sio/[id].
 */
import raw from "./sios.json";

export type SioSkill = "interaction" | "production" | "listening" | "writing";

export type Sio = {
  /** "SIO-001" */
  id: string;
  /** 1..50 */
  num: number;
  /** 0..4 */
  unit: number;
  /** "Unité 0" */
  unitLabel: string;
  topic: string;
  description: string;
  /** Spec flashcard-set id, e.g. "1.05". */
  setId: string;
  /** Raw CEFR-mode text, e.g. "Spoken Interaction". */
  cefrMode: string;
  skill: SioSkill;
  /** Production task assessed by a rubric, not an MCQ battery. */
  isProduction: boolean;
  /** Learner-facing goal. */
  canDo: string;
  /** Measurable enabling criteria — what assessments score against. */
  competence: string;
  /** Curated deck id wired into the Practice section, when one exists. */
  collectionId: string | null;
};

export const SIOS: Sio[] = (raw as Sio[]).slice().sort((a, b) => a.num - b.num);

/**
 * Learner-facing competence targets only the FULL goal — Dan, 2026-07-02:
 * "instead of 10/12, just say 12." Assessment thresholds (≥x/y, percentages)
 * stay in the CSV/sios.json for grading but never display.
 */
function targetHigherLimit(text: string): string {
  return text
    // parenthetical thresholds: (≥5/6), (≥80%), (≥90% letters correct), (≥2 each)
    .replace(/\s*\(≥[^)]*\)/g, "")
    // inline fractions target the total: "≥10/12 situations" → "12 situations"
    .replace(/≥\s*\d+\s*\/\s*(\d+)/g, "$1")
    // any remaining "≥N" targets N itself
    .replace(/≥\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([;,.])/g, "$1")
    .trim();
}

/**
 * One flowing sentence merging Can-Do + competence, no section labels — Dan,
 * 2026-07-01: "we don't need the words 'Statement of SIO', 'Measurable
 * Language Competency'... STICK TO THE ESSENTIALS." Mechanical, not hand-
 * authored per SIO — applies uniformly to all 50 without rewriting the CSV.
 */
export function sioStatement(sio: Sio): string {
  const canDo = sio.canDo.replace(/\.\s*$/, "");
  const competence = targetHigherLimit(sio.competence);
  return `${canDo}, and I know how to ${competence.charAt(0).toLowerCase()}${competence.slice(1)}`;
}

export const UNIT_META: Record<number, { label: string; subtitle: string; emoji: string }> = {
  0: { label: "Unité 0", subtitle: "Bonjour, bienvenue, enchanté !", emoji: "👋" },
  1: { label: "Unité 1", subtitle: "C'est qui, le monsieur ?", emoji: "🪪" },
  2: { label: "Unité 2", subtitle: "On fait quoi ce week-end ?", emoji: "🎉" },
  3: { label: "Unité 3", subtitle: "On va où cet été ?", emoji: "🗺️" },
  4: { label: "Unité 4", subtitle: "Qu'est-ce qu'on mange ce soir ?", emoji: "🍽️" },
};

export function getSio(id: string): Sio | undefined {
  return SIOS.find((s) => s.id === id);
}

/** Distinct unit numbers in order. */
export function unitNumbers(): number[] {
  return [...new Set(SIOS.map((s) => s.unit))].sort((a, b) => a - b);
}

export function siosForUnit(unit: number): Sio[] {
  return SIOS.filter((s) => s.unit === unit);
}

export type SioGroup = { key: string; label: string; sios: Sio[] };

/**
 * Sub-groups a unit's SIOs the way the source textbook (Didier's "L'atelier A1",
 * `~/Documents/Archived/L_39_atelier_A1_Manuel.pdf`) actually structures its
 * content — NOT an even numeric split. Verified against the book page by page
 * (2026-07-01): each unit runs 3 Situations de communication (each a named,
 * unevenly-sized cluster of grammar/lexique) then a culminating Atelier
 * d'expression. The book's own groupings are lopsided — e.g. Unité 1 Situation 1
 * ("Se présenter et présenter quelqu'un") covers only pronouns + professions,
 * while Situation 2 ("Dire sa nationalité") pulls in être + countries +
 * nationalities + languages. An earlier version of this function computed an
 * even 3-way split by SIO count, which does NOT match the book and was wrong.
 *
 * A handful of SIOs (014, 026's overlap, 027, 028, 037, 039, 043) don't have an
 * explicit grammar box of their own in the book pages read — those are placed
 * by best thematic fit with their unit's real Situations, not book-page
 * evidence. Flag to Dan if any placement should move.
 *
 * Unité 0 is a separate, deliberate exception (Dan's call, unrelated to the
 * book): it stays at 2 groups total, not 4 — see groupSiosForUnit's unit===0
 * branch below.
 */
// NOTE (2026-07-01): Dan renumbered SIOs 012-014 and 022-028 to follow his
// preferred order of appearance (see docs/handoff/HANDOFF_NEXT_CLAUDE.md
// §4.8) — the ids below reference the NEW numbers, but the actual content
// groupings (which topics sit in which Situation) are unchanged from the
// book-verified mapping above; only the labels attached to each topic moved.
const UNIT_SITUATIONS: Record<number, { label: string; ids: string[] }[]> = {
  1: [
    { label: "Situation 1 — Se présenter et présenter quelqu'un", ids: ["SIO-011", "SIO-012", "SIO-013"] },
    { label: "Situation 2 — Dire sa nationalité", ids: ["SIO-014", "SIO-015", "SIO-016", "SIO-017"] },
    { label: "Situation 3 — Demander et donner des informations", ids: ["SIO-018", "SIO-019"] },
  ],
  2: [
    { label: "Situation 1 — Identifier des objets", ids: ["SIO-021", "SIO-022"] },
    { label: "Situation 2 — Parler de ses goûts", ids: ["SIO-023", "SIO-024", "SIO-025"] },
    { label: "Situation 3 — Sortir", ids: ["SIO-026", "SIO-027", "SIO-028", "SIO-029"] },
  ],
  3: [
    { label: "Situation 1 — Parler de la météo", ids: ["SIO-031", "SIO-032"] },
    { label: "Situation 2 — S'informer sur une ville", ids: ["SIO-033", "SIO-034", "SIO-035"] },
    { label: "Situation 3 — Demander et indiquer son chemin", ids: ["SIO-036", "SIO-037", "SIO-038", "SIO-039"] },
  ],
  // Unit 4 re-cut (Dan, 2026-07-14): 42 = partitives + negation + manger/boire
  // merged; 43 = frequency; Situation 2 = commerces + the market dialogue;
  // Situation 3 = demonstratives + modaux + giving advice (Atelier appended
  // by groupSiosForUnit below).
  4: [
    { label: "Situation 1 — Parler de ses habitudes alimentaires", ids: ["SIO-041", "SIO-042", "SIO-043"] },
    { label: "Situation 2 — Faire ses courses", ids: ["SIO-044", "SIO-045", "SIO-045A"] },
    { label: "Situation 3 — Faire des projets", ids: ["SIO-046", "SIO-047", "SIO-048"] },
  ],
};

export function groupSiosForUnit(unit: number): SioGroup[] {
  if (unit === 0) {
    // No separate Atelier group for Unité 0 — Dan's call, see the doc comment above.
    const all = siosForUnit(0);
    const parts = 2;
    const base = Math.floor(all.length / parts);
    const extra = all.length % parts;
    const groups: SioGroup[] = [];
    let start = 0;
    for (let i = 0; i < parts; i++) {
      const size = base + (i < extra ? 1 : 0);
      groups.push({ key: `situation-${i + 1}`, label: `Situation ${i + 1}`, sios: all.slice(start, start + size) });
      start += size;
    }
    return groups;
  }

  const situations = UNIT_SITUATIONS[unit];
  const atelier = siosForUnit(unit).filter((s) => s.isProduction);
  if (!situations) return atelier.length > 0 ? [{ key: "atelier", label: "Atelier", sios: atelier }] : [];

  const groups: SioGroup[] = situations.map((s, i) => ({
    key: `situation-${i + 1}`,
    label: s.label,
    sios: s.ids.map((id) => getSio(id)).filter((s): s is Sio => !!s),
  }));
  // The unit overview shows THREE subsections, not four: the Atelier rides
  // inside Situation 3 (Dan, 2026-07-14: "merge situation 3 with Atelier as
  // one sub-section").
  if (atelier.length > 0 && groups.length > 0) {
    const last = groups[groups.length - 1];
    last.label = last.label.replace(/^Situation 3 — /, "Situation 3 + Atelier — ");
    if (!last.label.includes("Atelier")) last.label += " + Atelier";
    last.sios = [...last.sios, ...atelier];
  }
  return groups;
}

/** Previous / next SIO by sequence, for in-page navigation. */
export function siblingSios(id: string): { prev?: Sio; next?: Sio } {
  const i = SIOS.findIndex((s) => s.id === id);
  if (i === -1) return {};
  return { prev: SIOS[i - 1], next: SIOS[i + 1] };
}

/**
 * SIOs that share one country dataset and run as a short chain
 * (015 countries → 016 nationalities → 017 languages). Used to show a
 * "part of a chain" hint so learners aren't hit with 3 near-identical pretests.
 */
export const SIO_CHAINS: string[][] = [["SIO-015", "SIO-016", "SIO-017"]];

export function chainFor(id: string): string[] | undefined {
  return SIO_CHAINS.find((c) => c.includes(id));
}
