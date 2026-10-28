/**
 * Inline markup used in every string:
 *   **gras**  *italique*  ~~barré~~  _____ (blanc à compléter)  \n (retour à la ligne)
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "table"; headers?: string[]; rows: string[][]; firstColHeader?: boolean }
  | { type: "callout"; variant: "error" | "tip"; title?: string; lines: string[] };

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
  | "conseils";

export type Section = {
  id: string;
  number: number;
  title: string;
  theme: ThemeId;
  blocks: Block[];
  exercise?: Exercise;
};

export type Sheet = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  sections: Section[];
};
