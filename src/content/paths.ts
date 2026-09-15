/**
 * CURATED PATHS — an authored sequence of activities that the app walks a
 * learner through, step by step.
 *
 * Dan, 2026-09-14: *"what i would really need now is a 'curated path'
 * automatically driving the sequence of activities on FluOLinGo — essential,
 * optional etc"*.
 *
 * WHY THIS IS DATA AND NOT A PAGE. Asked whether this was one path or the
 * first of several, Dan chose *"built for several, ship one"*. So a second
 * path — finals, a catch-up week, a single unit — is a new entry in `PATHS`
 * and nothing else: no new route, no new component, no second copy of the
 * walking logic to drift out of step with this one.
 *
 * THE RULE THE STEP LIST WAS BUILT ON, and the reason it is nine and not
 * twenty: NO TWO STEPS MAY DO THE SAME JOB. Each `does` line names the
 * physical thing the learner does, and no two of them repeat. That is what
 * makes the list sufficient without being excessive — drop one and a whole
 * skill goes unrehearsed; add one and you are paying minutes for a mechanic
 * already covered. The per-goal GramMarathon runs were cut under exactly this
 * test (same mechanic as step 1) and demoted to the optional tier.
 *
 * A STEP'S ADDRESS IS DERIVED, NEVER TYPED, wherever the activity is scoped to
 * a goal. `cellHref` reads `deckActivityTabs`, the one list that knows which
 * activities a deck can actually play, so a step cannot point at a door that
 * stop does not have. Only the handful of activities that are NOT goal-scoped
 * — the Finale, ErroReview, ConjugaZone, ÉcouTexte, VoixLà, the Numbers games
 * — carry a literal `href`, because for those there is one address and no
 * deck to derive it from. `verify760` resolves every step and fails on a dead
 * one, so the derivation cannot rot quietly.
 *
 * ELEVEN DESTINATIONS, NINE STEPS ON SCREEN. Step 3 is MémoiRecall at three
 * different goals, which is three separate doors — one step can only ever send
 * a learner to one place. `group` folds consecutive destinations back into one
 * numbered step for the reader, so the screen says what Dan approved (nine)
 * while the driver walks what actually exists (eleven).
 */
import { SIOS } from "@/content/sios";
import { cellHref } from "@/lib/indexMatrix";

export type PathStep = {
  /** Stable id — the run's saved position names these, so renaming one
   *  resets nobody's progress by accident. */
  id: string;
  /** Registry key, for the activity's own name and emoji. */
  activityKey: string;
  /** The stop this step is scoped to, where it is scoped to one. */
  goal?: number;
  /** A literal address, for the activities that are not goal-scoped. */
  href?: string;
  title: string;
  /** THE PHYSICAL THING THE LEARNER DOES — the line that proves this step is
   *  not another step wearing a different name. */
  does: string;
  /** THE AUTHOR'S BUDGET, NEVER SHOWN TO A LEARNER.
   *
   *  Dan, 2026-09-15: *"No need to give a time duration for those
   *  activities"*. Every minute figure came off the screen that day, and the
   *  reason is that mine had been wrong: three MneMemo lessons were priced at
   *  8–10 minutes each like drills, when a MneMemo lesson is a reference page
   *  with four tabs and no card count at all — which is how the tier reached
   *  the 104 minutes Dan sent back.
   *
   *  It stays in the DATA because it is what draws the essential/optional line
   *  (see the marks-per-minute costing below): an estimate an author uses to
   *  decide is not the same object as a number a learner is promised. Nothing
   *  renders it, and `verify760` clause 9 fails if anything starts to. */
  minutes: number;
  /** Consecutive steps sharing a group render as ONE numbered step. */
  group?: string;
  /** Why it earns its place. Shown on the path page, not on the push. */
  why?: string;
};

export type CuratedPath = {
  id: string;
  name: string;
  blurb: string;
  essential: PathStep[];
  optional: PathStep[];
};

/** Where a step goes, or null if the app has no door for it.
 *
 *  NULL IS NOT A BUG HERE, it is the honest answer for a goal that cannot play
 *  an activity — Dan's own parenthesis, *"(Not all stops have all
 *  activities)"*. The path page draws such a step greyed rather than as a dead
 *  link, and `verify760` fails if one appears on the essential tier, where it
 *  would break the walk. */
export function stepHref(step: PathStep): string | null {
  if (step.href) return step.href;
  if (step.goal == null) return null;
  const sio = SIOS[step.goal - 1];
  return sio ? cellHref(step.activityKey, sio) : null;
}

/** Every destination on a path, essential then optional. */
export function stepsOf(path: CuratedPath): PathStep[] {
  return [...path.essential, ...path.optional];
}

export function pathById(id: string): CuratedPath | undefined {
  return PATHS.find((p) => p.id === id);
}

/* `minutesOf` lived here and printed « 9 steps · 64 min » and « 9 more · 71
   min ». Deleted 2026-09-15 with every other duration on the page (Dan: *"No
   need to give a time duration for those activities"*). The budget it summed
   is still in the data; nothing sums it for display. */

/** Consecutive steps folded by `group`, for numbering and display. */
export function groupsOf(steps: PathStep[]): { label: string; steps: PathStep[] }[] {
  const out: { label: string; steps: PathStep[] }[] = [];
  for (const s of steps) {
    const last = out[out.length - 1];
    if (s.group && last && last.label === s.group) last.steps.push(s);
    else out.push({ label: s.group ?? s.id, steps: [s] });
  }
  return out;
}

const MIDTERM: CuratedPath = {
  id: "midterm",
  name: "Mid-term revision",
  /* NINE STEPS, AND THE HOUR IS THE CONSTRAINT, not a result (Dan,
     2026-09-14, sent back a 104-minute tier: *"104 minutes is now too long.
     We had promised about half that duration. Can you divide that into
     essential and optional"*).
     So the tier line is drawn by MARKS PER MINUTE against the real Test 1
     paper, not by "is this useful". Everything that earns its minute is here;
     everything that is merely good is in the fold, and the fold now carries
     the things a learner reaches for when an hour turns out to be ninety
     minutes. */
  blurb:
    "Ten steps, and the last one is the next morning. No two steps do the same job.",
  essential: [
    {
      id: "finale",
      activityKey: "grammarathon",
      /* NO QUERY, AND THAT IS THE FIX RATHER THAN AN OMISSION. This step used
         to carry `?upto=30`, which was right against the old default and is
         now WRONG: `?upto=N` means "stops 1..N", so passing 30 here would put
         the twelve stops the paper never asks about back into the draw. The
         Finale's own default is `TESTED_STOPS` — the eighteen Dan named after
         auditing the paper — so the bare address is the scoped one, through
         this step and through every other door alike. */
      href: "/practice/grammarathon/finale",
      title: "GramMarathon — the Finale",
      does: "types a gap · only what the paper asks",
      minutes: 8,
      why: "162 sentences across the eighteen stops the test actually asks about — nothing on the twelve it does not. Everything missed is queued automatically, which is what makes step 2 possible.",
    },
    {
      id: "erroreview-now",
      activityKey: "reviser",
      href: "/reviser",
      title: "ErroReview, straight away",
      does: "your own misses · while you still remember being unsure",
      minutes: 5,
      why: "Every item is one you got wrong ten minutes ago. Highest value per minute on the path, and it beats guessing which goals to drill.",
    },
    {
      /* ONE DOOR ACROSS SEVENTEEN DECKS (Dan, 2026-09-14, offered one mixed
         run or seventeen doors: *"One step, drawing across all 17 — a single
         ~10 min run that mixes cards"*).
         IT REPLACES THREE. The step used to open nationalities, possessives
         and faire — three decks of the thirty the first thirty stops have, and
         of the seventeen the paper reaches. That was me protecting the hour,
         not the test: Dan's own words when it was put to him were *"We have so
         many stops and we are looking at 3 of them???"*.
         The deck list is DERIVED from TESTED_STOPS, so a stop leaving the list
         leaves this run with it — stop 12 did, this evening. */
      id: "flip-revision",
      activityKey: "flip",
      href: "/practice/flip-it/revision",
      title: "MémoiRecall — the whole test",
      does: "types a whole word from the English · recall, not recognition",
      minutes: 10,
      why: "Cards from all seventeen stops the paper reaches, in one sitting. It ends with a nationality the app never taught, to see whether the ending rule transferred.",
    },
    /* THREE LESSONS THAT WERE ALREADY IN THE COURSE AND ON NO STEP.
     *
     * Dan, 2026-09-14, reading the Test 1 paper against the path: *"please
     * stick to the 30 stops"*, and, of the reading section, *"it is not so
     * much about reading per se, but what those reading questions are really
     * testing"*. Both point the same way — every gap the audit turned up was
     * a rule the course ALREADY teaches inside stops 1–30, sitting in a
     * MneMemo lesson that no step opened. Nothing here is new material and
     * nothing reaches past stop 30.
     *
     *   quel-prefere   SIO-015. « Quel ? Quelle ? Quels ? Quelles ? » — four
     *                  of the paper's five question marks are Quel âge /
     *                  Quelle nationalité / Quelles langues / Quelle
     *                  profession. The systematic question lesson IS at
     *                  SIO-034, out of scope; this one was moved into Unit 1
     *                  on 2026-09-05 for exactly this reason and the map in
     *                  lessons.ts says so.
     * ONLY THE FIRST OF THE THREE IS ESSENTIAL, and the tier line is drawn on
     * marks per minute: « Quel ? » is worth four marks of a fifty-mark paper.
     * The négation lesson is worth one and l'article devant le pays two, so
     * both sit in the fold — named, counted, and one tap away.
     *
     * EACH CARRIES ITS OWN ADDRESS rather than `goal: 15`, because SIO-015 has
     * TWO lessons and `cellHref` takes the first — a goal-scoped step would
     * silently open articles-pays twice and never quel-prefere.
     *
     * FIVE MINUTES, NOT TEN. The first pass at this priced a MneMemo lesson
     * like a drill and put 104 minutes on an hour-long path. Driven in the
     * built app, a lesson is a REFERENCE PAGE with four tabs — 🎯 Goal, 💡
     * Idée, 📐 Formes, 🏋️ Exercice — and no fixed card count to measure, so
     * five is an honest estimate for reading two tabs and working the third,
     * where ten was a guess dressed as a number. */
    {
      id: "lesson-quel",
      activityKey: "lesson",
      href: "/lessons/quel-prefere",
      title: "MneMemo — Quel ? Quelle ? Quels ? Quelles ?",
      does: "reads a rule and applies it · the only step that explains",
      minutes: 5,
      why: "The four forms, and the possessive that answers them, on one card — « quel pays » / « ton pays », « quelle ville » / « ta ville ». A learner who can ask the question can already give the answer.",
    },
    {
      id: "conjuga",
      activityKey: "conjugaison",
      /* THE SIX VERBS ARE NAMED IN THE ADDRESS. Plain `/conjugaison` opens on
         être / avoir / aller and offers all 67, so the six this step's own text
         promises were never actually the ones drilled. */
      href: "/conjugaison?v=etre,avoir,faire,aller,sappeler,aimer",
      title: "ConjugaZone, TYPE IT",
      does: "types verb forms across a paradigm · the only conjugation step",
      minutes: 8,
      why: "être · avoir · faire · aller · s'appeler · aimer. Nothing else on this path drills a whole paradigm.",
    },
    {
      id: "remettre-28",
      activityKey: "compose",
      href: "/games/compose/remettre-negation-pas",
      title: "Remettre dans l'ordre",
      does: "arranges words that are given · the only step about order",
      minutes: 4,
      why: "Word order is the first thing a learner loses. Every other drill asks for a word, never for where the words go.",
    },
    {
      /* READING, AND THE PAPER SCORES IT. « Compréhension écrite » is a whole
         section of Test 1 and until 15 Sep nothing on this path read a text at
         all — ÉcouTexte is the ear, ComposeIt is the hand, and the eye had no
         step. G-Compris! was built the same day for exactly this hole.
         ONE NAMED TEXT, NEVER `/gcompris`. The shelf is a chooser: a learner
         who starts there finishes at `/gcompris/<text>`, so a step addressed
         to the shelf could never match and could never tick — the same trap
         that kept NumBus pointed at /games/numbus rather than at /games/numbers.
         « Une page de journal » is the densest of the ten: avoir vs être, ne…pas,
         a nationality asked back as its country, and mon / son twice. */
      id: "gcompris",
      activityKey: "gcompris",
      href: "/gcompris/page-de-journal",
      title: "G-Compris! — « Une page de journal »",
      does: "reads a whole text and answers on it · the only reading step",
      minutes: 6,
      why: "Five questions, and not one is answered by matching a word: « marocaine » is asked back as the country, « mon frère » as whose brother. The text stays on screen the whole time.",
    },
    {
      id: "composeit",
      activityKey: "compose",
      href: "/games/compose/presenter-personne",
      title: "ComposeIt — « Présenter quelqu'un »",
      does: "composes sentences to a set word list · written production",
      minutes: 8,
      why: "Five sentences, sixteen words to draw on, 50–60 words. The list ticks a verb only when you conjugate it.",
    },
    {
      id: "ecoutexte",
      activityKey: "ecoutexte",
      /* A DECK, NOT THE TOPIC PICKER. `/practice/ecoutexte` lists every unit
         including 3 and 4, so the step said "one text" and let a learner pick
         one from outside the test. quand-time is goal 27 — days, times, plans. */
      href: "/practice/ecoutexte/quand-time",
      title: "ÉcouTexte — one text",
      does: "writes what it hears · the only listening step",
      minutes: 6,
      why: "One text, not three — goal 27's days, times and plans. The paper's listening is ten marks and this is the only step that answers it.",
    },
    {
      id: "erroreview-morning",
      activityKey: "reviser",
      href: "/reviser",
      title: "ErroReview, the next morning",
      does: "the same misses, spaced · retention rather than correction",
      minutes: 10,
      why: "A different job from step 2: that one corrects, this one makes it stick. Every step before it will have added to the queue.",
    },
  ],
  /* THE FOLD IS ORDERED BY WHAT IT IS WORTH ON THE PAPER, best first, because
     a learner who finds they have ninety minutes rather than sixty opens the
     top of this list and stops when the time runs out. Everything down to
     « four more verbs » carries real marks; the last two are practice. */
  optional: [
    {
      /* NumBus is the highest-value thing in the fold and the only reason it
         is in the fold at all is its ten minutes. `quand-time` teaches whole
         hours only — measured, « à 8 heures », « à 10 heures » — so NumBus 🕑
         is the ONLY place in the app that says a 24-hour time, and its 📞 is
         the only place a French phone number is read in two-digit blocks. The
         paper asks for 15h45, 18h, 16h30 and « 06 27 68 05 15 ».
         POINTED AT THE GAME, not at `/games/numbers`, which is only the
         NumBus/NumBourse chooser: a learner finishes at /games/numbus, so a
         step addressed to the chooser could never tick. */
      id: "opt-numbus",
      activityKey: "numbers",
      href: "/games/numbus",
      title: "NumBus",
      does: "numbers by ear · 24-hour times, prices, a phone number",
      minutes: 10,
      why: "Worth about four marks and nothing else in the app says « seize heures trente » or « zéro six, vingt-sept, soixante-huit ». Do this one first if there is any time at all.",
    },
    {
      id: "opt-lesson-pays",
      activityKey: "lesson",
      href: "/lessons/articles-pays",
      group: "MneMemo — two more rules",
      title: "MneMemo — l'article devant le pays",
      does: "reads a rule and applies it",
      minutes: 5,
      why: "le / la / l' / les, by ending and by vowel. The only place a country the course never taught is explained.",
    },
    {
      /* The DECK cannot do this and the LESSON can, which is the whole reason
         this entry exists: measured, 0 of the négation deck's 20 items is
         reflexive and none is « ne…pas » + être. */
      id: "opt-lesson-negation",
      activityKey: "lesson",
      href: "/lessons/negation",
      group: "MneMemo — two more rules",
      title: "MneMemo — la négation",
      does: "reads a rule and applies it",
      minutes: 5,
      why: "« il ne s'appelle pas », « elle n'est pas anglaise » — the two shapes the négation deck never drills.",
    },
    {
      /* Stop 26, « aller + au / à la / aux » — which is both « où elle
         habite » and « après le film, on va au parc ». */
      id: "opt-remettre-26",
      activityKey: "compose",
      href: "/games/compose/remettre-aller-destinations",
      group: "Remettre dans l'ordre — two more",
      title: "Remettre dans l'ordre — going places",
      does: "verb + preposition + place, in order",
      minutes: 4,
    },
    {
      id: "opt-remettre-27",
      activityKey: "compose",
      href: "/games/compose/remettre-quand-time",
      group: "Remettre dans l'ordre — two more",
      title: "Remettre dans l'ordre — when",
      does: "where a time expression sits in the sentence",
      minutes: 4,
    },
    {
      id: "opt-gram-28",
      activityKey: "grammarathon",
      goal: 28,
      title: "GramMarathon — the goals step 1 caught",
      does: "depth where the diagnostic found weakness",
      minutes: 7,
      why: "Cut from the essential tier because it is step 1's mechanic a second time. Worth it only when step 1 shows a specific goal weak.",
    },
    {
      id: "opt-ecoutexte-2",
      activityKey: "ecoutexte",
      href: "/practice/ecoutexte/aimer-activites",
      title: "ÉcouTexte — two more scenarios",
      does: "a whole text by ear: days, times, plans",
      minutes: 10,
    },
    {
      /* Moved out of the essential tier on 14 Sep, and the reason is worth
         keeping: Test 1 has no spoken section at all. « Compréhension orale »
         is listening, which ÉcouTexte answers. WorDrill trains a skill the
         paper does not score, so it costs four minutes of an hour that is
         already short — but it stays on the path, because the course is not
         only this paper. */
      id: "opt-wordrill",
      activityKey: "wordrill",
      goal: 23,
      title: "WorDrill",
      does: "speaks · the only spoken step",
      minutes: 4,
      why: "Ten words, said out loud. Nothing on Test 1 scores speaking — this one is for the course, not the paper.",
    },
    {
      id: "opt-conjuga-2",
      activityKey: "conjugaison",
      /* Named in the address, like the essential step — a bare /conjugaison
         opens on être/avoir/aller and these four are never picked. */
      href: "/conjugaison?v=ecouter,adorer,acheter,vouloir",
      title: "ConjugaZone — four more verbs",
      does: "écouter · adorer · acheter · vouloir",
      minutes: 6,
      why: "Two more -ER, the -eR spelling change, and vouloir.",
    },
    {
      id: "opt-tts",
      activityKey: "tts",
      href: "/tts",
      title: "VoixLà",
      does: "hears your own paragraph read back",
      minutes: 5,
      why: "Type what you wrote in step 6 and listen to it — your own French in your own ear.",
    },
  ],
};

export const PATHS: CuratedPath[] = [MIDTERM];
