/**
 * WHAT TO DO HERE — one line-up of first-run instructions, one per activity.
 *
 * Dan, 2026-09-02: *"add a pop up instruction for the first time with a 'do
 * not show me again' regarding what the user needs to do"*, then, an hour
 * later: *"then can you add the same first timer pop ups instructions for all
 * activity pages (hub pages excluded)."*
 *
 * WHY THE TEXT IS HERE AND NOT IN THE PAGES. Fourteen activities each writing
 * their own modal is the shape this repo has been bitten by four times —
 * ACTIVITIES existed because four surfaces kept four private lists of the same
 * nineteen activities and no two agreed. A row here, and the shell the
 * activity already mounts draws it: no page is edited, and an activity that
 * arrives without a row simply gets no popup rather than a broken one.
 *
 * `on` SAYS WHICH SHELL OWNS THE ROW, and it is load-bearing rather than
 * bookkeeping. Two keys name two different screens: `wordrill` is the Say It
 * DRILL and also the deck-picker PAGE at /practice/wordrill, and `conjugaison`
 * likewise. Without `on`, opening the picker would fire the drill's
 * instruction over a list of decks. One row, one screen.
 *
 * HUBS ARE EXCLUDED BY ABSENCE (Dan's own exception). A family hub, a game
 * gallery, a deck picker and an activity landing have no row, so nothing
 * mounts — there is no list of exclusions to keep in step with anything.
 *
 * THE GAMES ARE NOT HERE, deliberately. GameFrame already takes a `help` node
 * — "how to play", written per game and reachable forever after behind
 * ⋯ → Help — so the first-run popup shows THAT, and VocabulaRain's
 * instructions cannot come to differ between the popup and the menu. See
 * components/GameFrame.tsx.
 *
 * THE LITMUS TEST APPLIES HERE TOO. Every line below is something the screen
 * does not say on its own. What the buttons are called, what the deck is
 * about, how many cards are left — all of that is on screen already and none
 * of it is repeated here.
 */

export type ActivityHint = {
  /** Which shell mounts it: DrillShell (`drill`) or CahierShell (`page`). */
  on: "drill" | "page";
  /** Names the ACTION, not the activity — the band above already names that. */
  title: string;
  /** Two or three steps. If it needs four, the screen is the problem. */
  steps: string[];
};

export const ACTIVITY_HINTS: Record<string, ActivityHint> = {
  // ── practice ────────────────────────────────────────────────────────────
  speculearn: {
    on: "drill",
    title: "Guess first",
    steps: [
      "Pick what you think is right, then Check.",
      "Wrong costs nothing — the lesson is built on it.",
      "? gives a hint, then another, then the answer.",
    ],
  },
  lesson: {
    on: "drill",
    title: "Pick a level, then answer",
    steps: [
      "★ Facile to 🎁 Bonus: same 12 cards, harder not longer.",
      "💡 Idea and 📐 Forms are to read. 🏋️ Pract. is where you answer.",
    ],
  },
  // The one this all started from. Dan had the « Flip » CTA removed as
  // redundant on 2026-09-02; the card was and is the button, but with the CTA
  // gone nothing on screen said so. This is that sentence, once.
  flip: {
    on: "drill",
    title: "Tap the card",
    steps: [
      "English on the front. Tap to turn it over.",
      "Then mark it ✓ know it, or ↺ review.",
    ],
  },

  // A pre-test is SpecuLearn's other engine, not another activity (the merger
  // Dan settled on 2026-08-10: "Pre-Test folds into SpecuLearn — same job, two
  // engines"), so it gets the same instruction in the same words. It is on
  // `page` because a pre-test mounts CahierShell rather than DrillShell.
  pretest: {
    on: "page",
    title: "Guess first",
    steps: [
      "This comes before the lesson. You are not meant to know it yet.",
      "Pick one anyway — wrong costs nothing.",
    ],
  },

  // ── revise ──────────────────────────────────────────────────────────────
  grammarathon: {
    on: "drill",
    title: "Fill the gap",
    steps: [
      "Tap a word from the bank, or type it, then Check.",
      "One whole deck, end to end. The top bar is how far you are.",
    ],
  },
  reviser: {
    on: "page",
    title: "What is due today",
    steps: [
      "Only what is due, and nothing else — an empty page is good news.",
      "Words arrive from decks you have practised, timed to when you would forget.",
    ],
  },

  // ── skills ──────────────────────────────────────────────────────────────
  conjugaison: {
    on: "drill",
    title: "Pick the ending",
    steps: [
      "Choose the form that goes with the pronoun, then Check.",
      "See the table opens the whole conjugation.",
    ],
  },
  ecoutexte: {
    on: "drill",
    title: "Listen, then write",
    steps: [
      "Choose a topic and how many sentences, then Start.",
      "Type what you hear. Replay freely — 🐌 slows it, ♀♂ changes the reader.",
    ],
  },
  wordrill: {
    on: "drill",
    title: "Say it out loud",
    steps: [
      "Tap 🎤 and say the French. The mic grades what it hears.",
      "🔊 plays a model. 🔤 gives a hint, then another, then the words.",
    ],
  },
  tts: {
    on: "page",
    title: "Type, then listen",
    steps: [
      "Type any French — a word, an expression, a whole text.",
      "▶ reads it back; 👩 and ×1.0 change voice and speed.",
      "✏️ checks and corrects what you wrote.",
    ],
  },
  tutor: {
    on: "page",
    title: "Ask anything",
    steps: [
      "Ask in French or English — about the course, or to practise on.",
      "🎤🇫🇷 🎤🇬🇧 let you speak instead; 🔊 reads the answer back.",
    ],
  },
};
