/**
 * Chapter scenarios (Dan, 2026-07-08, episode model — "yes to all"): each
 * unité is a named real-life scenario with an intro line and a cliffhanger
 * teasing the next chapter. Rewards sequential play — never punishes skipping.
 */
export type Chapter = {
  scenario: string; // the chapter's name, shown on the map + unit page
  tagline: string; // one line under the scenario name
  /** End-of-unit tease for the NEXT chapter (none on the finale). */
  cliffhanger?: string;
};

export const CHAPTERS: Record<number, Chapter> = {
  0: {
    scenario: "Bienvenue en classe",
    tagline: "Premiers mots, premiers sons",
    cliffhanger: "La suite : qui êtes-vous ? Préparez votre carte d'identité… 🪪",
  },
  1: {
    scenario: "Qui suis-je ?",
    tagline: "Faire connaissance",
    cliffhanger: "La suite : vos goûts, vos objets, vos invitations… 🎉",
  },
  2: {
    scenario: "Ma vie, mes envies",
    tagline: "La vie quotidienne",
    cliffhanger: "La suite : la ville vous attend — sans vous perdre… 🗺️",
  },
  3: {
    scenario: "En ville",
    tagline: "Trouver son chemin",
    cliffhanger: "Attendez de voir ce qu'on mange au restaurant… 🍽️",
  },
  4: {
    scenario: "À table !",
    tagline: "Le grand final au restaurant",
  },
};
