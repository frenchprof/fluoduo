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
  /**
   * Two or three steps. If it needs four, the screen is the problem.
   *
   * A PLAIN STRING IS A LINE TO READ. A `{ text, selector }` is a line to DO:
   * the first run lights that control, says the line beside it, and waits for
   * the learner to really use it before moving on (see GuidedSteps).
   *
   * Dan, 2026-09-11: *"We need to hold their hand and guide them towards
   * completing the task at the first isntance."* The words were already right
   * — they were just printed away from the thing they describe. Adding a
   * selector is what moves a step from the card onto the screen.
   *
   * MIXED IS ALLOWED, AND THAT IS THE POINT: a row can be upgraded one step at
   * a time, and a row with no selectors anywhere behaves exactly as it did
   * before. Seventeen activities do not have to move on the same day.
   */
  steps: (string | GuidedStep)[];
};

/** The text of a step, plus the control it belongs to. */
export type GuidedStep = { text: string; selector: string };

/** Does this row guide, or only tell? */
export const isGuided = (s: string | GuidedStep): s is GuidedStep => typeof s !== "string";

/** The line, whichever kind of step it is. */
export const stepText = (s: string | GuidedStep): string => (typeof s === "string" ? s : s.text);

export const ACTIVITY_HINTS: Record<string, ActivityHint> = {
  // ── practice ────────────────────────────────────────────────────────────
  // ONE ROW NOW, BECAUSE THERE IS ONE SPECULEARN. Dan, 2026-09-07: *"they CAN
  // be and MUST NOW BE MERGED AS ONE!"* Until then this key described the
  // generated DRILL and `pretest` described the authored PAGE — two rows for
  // what a learner met as two identical lightbulbs on one goal. The merged run
  // is a CahierShell page, so `page` is not a preference here: on `drill` this
  // instruction would never fire again, silently, which is exactly the failure
  // verify88 exists to catch.
  speculearn: {
    on: "page",
    title: "Guess first",
    steps: [
      "This comes before the lesson. You are not meant to know it yet.",
      "Pick one anyway — wrong costs nothing.",
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
  // THE FIRST ROW TO GUIDE RATHER THAN TELL (Dan, 2026-09-11). Fitting, since
  // this is the row the whole first-run idea started from: the « Flip » CTA
  // was removed as redundant on 2 Sep, which left nothing on screen saying the
  // card could be tapped at all. Telling them once was the 2 Sep answer.
  // Showing them, on the card itself, is this one.
  flip: {
    on: "drill",
    title: "Tap the card",
    steps: [
      // THE FIRST STEP IS THE LENGTH, and that was found by driving it rather
      // than reasoning about it. The first-run card fires on ARRIVAL, and on
      // arrival this activity is showing « How many questions? » — the deck
      // itself does not exist yet. A guide that opened on the card would have
      // pointed at nothing and sat there saying "Finding it…".
      { text: "First, choose how long a run you want.", selector: '[data-tour="how-many"]' },
      { text: "English on the front. Tap the card to turn it over.", selector: '[data-tour="flip-card"]' },
      // This control does not exist until step 1 is done — the mark row is
      // born of the flip. GuidedSteps waits for it rather than measuring once.
      { text: "Now mark it: ✓ if you knew it, ↺ to see it again.", selector: '[data-tour="drill-cta"]' },
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
