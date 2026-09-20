/**
 * THE GUIDED TOURS — Dan's exact copy, his exact order.
 *
 * Dan, 2026-09-19: *"And instead of just pointing to what each of the steps
 * does, get users to actually click through one round of every single
 * activity."*
 *
 * NO BUTTON STARTS THEM (Dan, same day, two messages later: *"I am starting
 * to question if we actually need a BUTTON for it. it usually only appears
 * once and then user can say do not show me again."*). A tour starts ITSELF,
 * the first time it could have helped, and « Don't show again » — on the
 * sheet or by finishing — is final. The ☰ menu's 🧭 cell and the GO TO cell
 * it displaced are both gone from that plan: the tour is not a destination
 * a learner chooses, it is a hand offered once.
 *
 * THERE ARE TWO TOURS, and they are the same shape:
 *   — the APP tour: every activity, one round each, in the lesson's own
 *     order (pre-lesson guessing → the lesson → flashcards → speaking →
 *     listening → conjugation → reading → writing). Lives on every page
 *     from CahierShell. « Try it → » navigates.
 *   — the LESSON tour: the four tabs of MneMemo, in the order the lesson
 *     teaches (Goal → Form → Idea → Exercise). Lives inside LessonTabs, and
 *     « Try it → » switches the tab instead of navigating. It waits its
 *     turn: while the app tour is walking, the lesson tour does not start —
 *     two sheets over one page is not guidance, it is noise.
 *
 * NOTE (Dan, 2026-09-19): "Do not use the term FlipIt anymore — it was the
 * older name of MémoiRecall."
 */

export type TourStep = {
  /** Which activity (key in the ACTIVITY_HINTS registry) — or, on the lesson
   *  tour, the tab's key. */
  key: string;
  /** The emoji the ☰ menu uses for this activity. */
  emoji: string;
  /** Dan's own name for the activity. */
  name: string;
  /** Dan's own words for what it does — one line, no paragraph. */
  what: string;
  /** Where to go for one round (the app tour navigates here). */
  href?: string;
  /** The lesson tour's step: the tab « Try it → » opens. These are
   *  LessonTabs' TabKey values — addresses, not labels (the Memo-rename
   *  precedent: a display rename never touches keys). */
  tab?: "parcours" | "formes" | "concept" | "exercice";
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
    // /practice/wordrill, the registry's own address — an earlier draft sent
    // this step to /tts, which is VoixLà's door, not WorDrill's.
    href: "/practice/wordrill",
  },
  {
    key: "ecoutexte",
    emoji: "🎧",
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
    // /games/compose, per the registry — an earlier draft's /compose is no
    // route at all; the step's « Try it → » was a dead end.
    href: "/games/compose",
  },
];

/**
 * THE LESSON TOUR — the four tabs, in the order the lesson teaches them.
 * Each `what` leans on the TABS' own `does` lines (Dan's copy, 2026-08-31)
 * and the LESSON_SPEC's four phases; the tab labels are his 2026-09-16
 * ruling: "should name consistently: Goal Idea Form Exercise".
 */
export const LESSON_TOUR_STEPS: TourStep[] = [
  {
    key: "parcours",
    emoji: "🎯",
    name: "Goal",
    what: "Where this lesson is going — the one sentence you will be able to say when it ends. Read it first, so the forms that follow have somewhere to land.",
    tab: "parcours",
  },
  {
    key: "formes",
    emoji: "📐",
    name: "Form",
    what: "The forms themselves, laid out the way this lesson teaches them — a table, a list, or a dialogue — with the words you will drill.",
    tab: "formes",
  },
  {
    key: "concept",
    emoji: "💡",
    name: "Idea",
    what: "Why French does it this way: one idea behind the rule, then the traps it sets for you.",
    tab: "concept",
  },
  {
    key: "exercice",
    emoji: "🏋️",
    name: "Exercise",
    what: "Use them, one card at a time. Pick your level and build your sentences — 🎁 Bonus waits at the end.",
    tab: "exercice",
  },
];
