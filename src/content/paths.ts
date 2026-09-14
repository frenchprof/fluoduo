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
  minutes: number;
  /** Consecutive steps sharing a group render as ONE numbered step. */
  group?: string;
  /** Why it earns its minutes. Shown on the path page, not on the push. */
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

/** Minutes for a tier, so no total is ever typed twice. */
export function minutesOf(steps: PathStep[]): number {
  return steps.reduce((n, s) => n + s.minutes, 0);
}

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
  blurb:
    "Nine steps, about an hour, plus ten minutes the next morning. No two steps do the same job.",
  essential: [
    {
      id: "finale",
      activityKey: "grammarathon",
      /* `?upto=30` IS LOAD-BEARING, not tidiness (Dan, 2026-09-14: *"the
         curated exercises are not at all adapted for the first test covering
         stops 1 to 30"*, then *"Stops 0 to 30 only please"*). FINALE_BANK holds
         437 items and 201 of them — 46% — are from stops 31–50. Unscoped, a
         25-question paper put about eleven questions on material the test does
         not cover, AND those misses fed ErroReview, so step 2 then drilled
         units 3 and 4. The diagnostic was poisoning the repair. */
      href: "/practice/grammarathon/finale?upto=30",
      title: "GramMarathon — the Finale",
      does: "types a gap · across stops 1–30",
      minutes: 8,
      why: "The only thing in the app that samples the whole test in one sitting — 236 sentences across stops 1–30. Everything missed is queued automatically, which is what makes step 2 possible.",
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
      id: "flip-16",
      activityKey: "flip",
      goal: 16,
      group: "MémoiRecall, Test Yourself",
      title: "MémoiRecall — nationalities",
      does: "types a whole word from the English · recall, not recognition",
      minutes: 3,
      why: "The most rule-bearing deck. It ends with a nationality the app never taught, to see whether the ending rule transferred.",
    },
    {
      id: "flip-22",
      activityKey: "flip",
      goal: 22,
      group: "MémoiRecall, Test Yourself",
      title: "MémoiRecall — possessives",
      does: "types a whole word from the English",
      minutes: 3,
    },
    {
      id: "flip-24",
      activityKey: "flip",
      goal: 24,
      group: "MémoiRecall, Test Yourself",
      title: "MémoiRecall — faire",
      does: "types a whole word from the English",
      minutes: 3,
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
      id: "composeit",
      activityKey: "compose",
      href: "/games/compose/presenter-personne",
      title: "ComposeIt — « Présenter quelqu'un »",
      does: "composes sentences to a set word list · written production",
      minutes: 8,
      why: "Five sentences, sixteen words to draw on, 50–60 words. The list ticks a verb only when you conjugate it.",
    },
    {
      id: "wordrill",
      activityKey: "wordrill",
      goal: 23,
      title: "WorDrill",
      does: "speaks · the only spoken step",
      minutes: 4,
      why: "Ten words. The job is to find the handful you cannot say under pressure, not to rehearse the ones you can.",
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
      why: "One text, not three — goal 27's days, times and plans. A path with a speaking step and no listening step is lopsided.",
    },
    {
      id: "erroreview-morning",
      activityKey: "reviser",
      href: "/reviser",
      title: "ErroReview, the next morning",
      does: "the same misses, spaced · retention rather than correction",
      minutes: 10,
      why: "A different job from step 2: that one corrects, this one makes it stick. Steps 3–8 will have added to the queue.",
    },
  ],
  optional: [
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
      id: "opt-remettre-27",
      activityKey: "compose",
      href: "/games/compose/remettre-quand-time",
      title: "Remettre dans l'ordre — when",
      does: "where a time expression sits in the sentence",
      minutes: 4,
    },
    {
      id: "opt-remettre-26",
      activityKey: "compose",
      href: "/games/compose/remettre-aller-destinations",
      title: "Remettre dans l'ordre — going places",
      does: "verb + preposition + place, in order",
      minutes: 4,
    },
    {
      id: "opt-numbers",
      activityKey: "numbers",
      href: "/games/numbers",
      title: "NumBus",
      does: "numbers by ear · which nothing else tests",
      minutes: 10,
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
      id: "opt-lesson-15",
      activityKey: "lesson",
      goal: 15,
      title: "MneMemo — countries",
      does: "articles before country names",
      minutes: 10,
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
