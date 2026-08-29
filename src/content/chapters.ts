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

/**
 * Where the CLASS is this week — the 🚩 on the Home map (patch 25, 2026-08-17).
 * The road is "paved" (solid) up to this stop and unpaved (dotted) beyond,
 * so a learner can see at a glance whether they are ahead of or behind the
 * class. Nothing about it locks: every stop stays tappable.
 *
 * Hand-set for now: nothing in progress/cohort exposes a per-week position
 * (src/lib/term.ts only stamps the term). Dan moves it as the term goes —
 * or a later patch derives it from TERM_START_MS + a week table.
 */
export const CLASS_FLAG_SIO = "SIO-010";
