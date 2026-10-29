/**
 * Inline markup used in every string:
 *   **gras**  *italique*  ~~barré~~  _____ (blanc à compléter)  \n (retour à la ligne)
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "table"; headers?: string[]; rows: string[][]; firstColHeader?: boolean }
  | { type: "callout"; variant: "error" | "tip"; title?: string; lines: string[] }
  /** A text the learner reads: stays visible above every question of the section. */
  | { type: "document"; title?: string; lines: string[] }
  /** A dialogue the learner listens to (French speech synthesis): play button above every question; transcript only after checking. */
  | { type: "audio"; title?: string; lines: string[] };

export type ExerciseItem = {
  label?: string;
  text: string;
  /** Wrong tiles added to the word bank: the rival forms this item trains the learner to reject. */
  distractors?: string[];
};

export type Exercise = {
  title: string;
  items: ExerciseItem[];
  /** Lignes du corrigé (bloc N du corrigé = exercice de la section N). */
  answers: string[];
};

export type ThemeId =
  | "saluer"
  | "identite"
  | "temps"
  | "classe"
  | "objets"
  | "gouts"
  | "sorties"
  | "meteo"
  | "ville"
  | "repas"
  | "projets"
  | "verbes"
  | "partitifs"
  | "lieux"
  | "adjectifs"
  | "phrases"
  | "conseils"
  | "lecture"
  | "ecoute"
  | "ecriture";

export type WritingTask = {
  /** The task, in French. */
  task: string;
  minWords: number;
  maxWords: number;
  outline: { label: string; example: string }[];
  phrases: string[];
  checklist: string[];
  /** A model answer, one string per paragraph, shown only on request after writing. */
  model: string[];
};

export type Section = {
  id: string;
  number: number;
  title: string;
  theme: ThemeId;
  blocks: Block[];
  exercise?: Exercise;
  writing?: WritingTask;
};

export type Sheet = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  sections: Section[];
};
