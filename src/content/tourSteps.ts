/**
 * THE 8-STEP GUIDED TOUR — Dan's exact copy, his exact order.
 *
 * Dan, 2026-09-19: *"And instead of just pointing to what each of the steps
 * does, get users to actually click through one round of every single
 * activity."* This replaces the ActivityUsher's Steps (which said "You are
 * in Exercises" when the learner was not) with a tour that takes the learner
 * THROUGH each activity, one at a time, with the words Dan wrote for each.
 *
 * THE ORDER is the lesson's own: pre-lesson guessing → the lesson →
 * flashcards → speaking → listening → conjugation → reading → writing.
 * Each step names its activity, says what it is FOR (Dan's words), and
 * sends the learner into one round. Completing the round advances the tour;
 * skipping ends it; the position is remembered.
 *
 * NOTE (Dan, 2026-09-19): "Do not use the term FlipIt anymore — it was the
 * older name of MémoiRecall."
 */

export type TourStep = {
  /** Which activity (key in the ACTIVITY_HINTS registry). */
  key: string;
  /** The emoji the ☰ menu uses for this activity. */
  emoji: string;
  /** Dan's own name for the activity. */
  name: string;
  /** Dan's own words for what it does — one line, no paragraph. */
  what: string;
  /** Where to go for one round. */
  href: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    key: "speculearn",
    emoji: "💡",
    name: "SpecuLearn",
    what: "A pre-lesson activity that makes you learn by guessing the correct answer. After a few repeated rounds, you will remember the answers even if the order of questions and choices is scrambled.",
    href: "/practice/speculearn",
  },
  {
    key: "lesson",
    emoji: "📚",
    name: "MneMemo",
    what: "The lesson in concise details. It first describes the immediate goal, goes on to demonstrate the forms relevant to this goal, fleshes out the conceptual idea behind this goal, and checks your understanding with guided examples.",
    href: "/lessons/faire",
  },
  {
    key: "flip",
    emoji: "🃏",
    name: "MémoiRecall",
    what: "Flashcards to commit key phrases to your memory.",
    href: "/practice/flip-it",
  },
  {
    key: "wordrill",
    emoji: "🎙️",
    name: "WorDrill",
    what: "Speak French out loud. The microphone listens and tells you how close you are.",
    href: "/tts",
  },
  {
    key: "ecoutexte",
    emoji: "🌧️",
    name: "ÉcouTexte",
    what: "Listen to French being spoken, then answer questions about what you heard.",
    href: "/practice/ecoutexte",
  },
  {
    key: "conjugaison",
    emoji: "📐",
    name: "ConjugaZone",
    what: "Practice verb conjugations with instant feedback on every form.",
    href: "/conjugaison",
  },
  {
    key: "gcompris",
    emoji: "📖",
    name: "G-Compris",
    what: "Read a real French text — a note, a postcard, a voicemail — then answer questions about it.",
    href: "/gcompris",
  },
  {
    key: "compose",
    emoji: "🧩",
    name: "ComposeIt",
    what: "Write your own French sentences. A patient tutor reads them and corrects them.",
    href: "/compose",
  },
];
