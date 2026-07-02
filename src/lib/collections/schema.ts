/**
 * FLUOLINGO — Unified collection schema (v2).
 *
 * One tagged item list is the single source of truth. Every game is a *view* over
 * collections, filtered at the game itself by the structural data it needs.
 *
 * v2 changes (22 Jun 2026 rethink):
 *  - Dropped per-item `eligible: GameKind[]`. Items are universal vocabulary; each game
 *    renderer filters what it can use (Matching reads `gameConfig.matching.pairs`,
 *    Letris reads `col:` tags + `gameConfig.letris.columns`, Gapfill reads `example`).
 *  - Promoted unit/lesson to first-class fields on Collection. The old tag namespaces
 *    (`unit:`, `sit:`, `sub:`, `theme:`) are retired. `tags` is now user-authored only.
 *  - `crossRefs` records lessons where a deck is revisited under different grammar.
 */

export type GameKind =
  | "flashcard"
  | "letris"
  | "matching"
  | "mcq"
  | "gapfill";

export type Gender = "m" | "f" | "mpl" | "fpl";

/** A single vocabulary unit. Shared across every game. */
export type Item = {
  /** Stable, unique within its collection. */
  id: string;
  /**
   * Canonical target text. For most items this is the headword ("café", "Japon").
   * Letris fragments carry only the fragment ("beau"); display layer prepends the
   * column prefix to form the sentence (see lib/collections/display.ts).
   */
  fr: string;
  /** English gloss / meaning. */
  en: string;
  /**
   * Disambiguation / register note — shown next to en in parentheses.
   *   "Mexico" → en: "Mexico", note: "(country)"     vs.   en: "Mexico", note: "(city)"
   *   "Quebec" → en: "Quebec", note: "(province)"    vs.   en: "Quebec", note: "(city)"
   * Use sparingly: only when `en` is ambiguous in isolation.
   */
  note?: string;
  emoji?: string;
  ipa?: string;
  /** Example sentence containing the target — blankable for gapfill. */
  example?: string;
  pos?: string;
  gender?: Gender;
  /**
   * Tags. Free-form user/curator axis PLUS two reserved STRUCTURAL namespaces:
   *   col:<key>                — Letris sort-column assignment
   *   role:left | role:right   — Matching role
   * Everything else is user-defined (e.g. `difficulty:hard`, `idiom`).
   * Unit/lesson DO NOT live in tags — they're first-class on the Collection.
   */
  tags: string[];
  /**
   * Nationality agreement forms (used by the Nationalities lesson card variant).
   * ms = masc. sing., fs = fem. sing., mp = masc. plural, fp = fem. plural.
   * e.g. France → { ms: "français", fs: "française", mp: "français", fp: "françaises" }
   */
  nat?: { ms: string; fs: string; mp: string; fp: string };
  /**
   * Language identity, for the Languages deck — shown instead of a flag.
   * greeting = native "hello"; autonym = the language's own name in its script.
   * e.g. { greeting: "你好", autonym: "中文" }.
   */
  lang?: { greeting: string; autonym: string };
  /**
   * Per-column choice text for dice Practice, keyed by Letris column key.
   * Lets a choice show a syntactic frame conjugated for THIS item
   * ("___ m'appelle" for je, "___ t'appelles" for tu) instead of the static
   * column label. "___" marks the slot; TTS fills it with `fr` on a correct
   * answer. Columns without an entry fall back to their label.
   */
  frames?: Record<string, string>;
};

/** Letris sort-column. Items carry `col:<key>`; this maps key -> label + TTS prefix. */
export type LetrisColumn = {
  key: string;
  label: string;
  /** Literal prefix for buildSentence()/TTS, e.g. "Il fait ", "Le ", "Devant ", "". */
  prefix?: string;
};

/** Matching is relational — a directed validity graph between role:left and role:right items. */
export type MatchingPair = { leftId: string; rightId: string };

/** Per-collection structural config. Games that need no structure ignore it. */
export type GameConfig = {
  letris?: { columns: LetrisColumn[] };
  matching?: { pairs: MatchingPair[] };
  /** Dice-practice presentation overrides (read by lib/practice/engine.ts). */
  practice?: {
    /** Custom question line, e.g. "In which sentence would this pronoun fit best?" */
    prompt?: string;
  };
};

export type Owner = "curated" | string; // "curated" or a Firebase uid
export type Visibility = "public" | "unlisted" | "private";

/** Where this lesson lives in the LAF1201 syllabus. */
export type LessonRef = {
  unit: number; // 0..4
  lessonNo: number; // 1..N within the unit
  lessonSlug: string; // e.g. "weather", "city-preps"
  /** Optional human note for cross-refs ("revisited under prép. devant villes/pays"). */
  note?: string;
};

export type Collection = {
  id: string;
  title: string;
  subtitle?: string;
  /** Language pair label. "fr-en" for now; both study directions are a runtime toggle. */
  langPair: "fr-en";
  owner: Owner;
  visibility: Visibility;

  /* ── Syllabus position (curated decks; optional for user decks). ── */
  unit?: number;
  lessonNo?: number;
  lessonSlug?: string;
  /** Other lessons where this content is revisited (cross-unit grammar etc.). */
  crossRefs?: LessonRef[];

  /** Free-form user/curator tags. NOT for unit/lesson info — use the fields above. */
  tags: string[];

  /** Homepage ordering hint. Lower = earlier. Falls back to (unit, lessonNo). */
  seq?: number;

  items: Item[];
  gameConfig?: GameConfig;
  /** Provenance for migrated decks. */
  source?: string;
};
