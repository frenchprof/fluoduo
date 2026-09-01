/**
 * SIO-039's card generator, in a JSX-free module so a check can EXECUTE it.
 *
 * WHY IT IS SPLIT OUT (the pattern aimer.gen.ts / aller.gen.ts already set).
 * `node --experimental-strip-types` cannot load a `.tsx`, so a generator living
 * beside its Mémo can only ever be REGEX-READ by a suite — and the first draft
 * of verify76 did exactly that, reimplemented `sentence()`'s elision rule in
 * Python, got the rule backwards, and reported the LESSON as having invented
 * « J'ai besoind'un hôtel ». The lesson was right and the checker was wrong.
 * A checker that reimplements what it checks is a second implementation to keep
 * correct; executing the real one is the only way to stop that happening twice.
 *
 * Every French string here is envies-besoins.json's own `fr`, split into frame ·
 * link · rest and reassembled — verify76 rebuilds all ten and compares them to
 * the JSON. The only composed French is `shapeError`, the `de` mistake the
 * lesson is about, which is a distractor and never shown as a model.
 */
import { medFrom, sentence, type Slot } from "./cloze.ts";
import { pinnedGroup, roll } from "./axis.ts";
import type { DiceAxis, DiceQuestion } from "./types";

export const FRAMES = [
  { fr: "Je voudrais",  de: false, en: "I would like",  note: "polite — the one to use with a stranger" },
  { fr: "J'aimerais",   de: false, en: "I'd love",      note: "a wish, softer than wanting" },
  { fr: "Je veux",      de: false, en: "I want",        note: "blunt — fine with friends, rude to a waiter" },
  { fr: "J'ai besoin",  de: true,  en: "I need",        note: "a necessity, not a preference" },
  { fr: "J'ai envie",   de: true,  en: "I feel like",   note: "an urge, right now" },
] as const;

/**
 * The ten cards, as frame + what follows.
 *
 * `link` is the elided or full `de` where the frame needs one, and empty where
 * it does not — kept per ITEM rather than per frame because the deck contains
 * both « J'ai envie d'un chocolat chaud » and « J'ai envie de dormir », which is
 * the whole evidence for the elision and would be lost if `de` lived upstairs.
 */
export const CARDS = [
  { frame: "Je voudrais", link: "",    rest: "un café.",                        en: "I would like a coffee." },
  { frame: "Je voudrais", link: "",    rest: "visiter le Louvre.",              en: "I would like to visit the Louvre." },
  { frame: "J'aimerais",  link: "",    rest: "voyager.",                        en: "I'd love to travel." },
  { frame: "J'aimerais",  link: "",    rest: "une chambre pour deux personnes.", en: "I'd love a room for two." },
  { frame: "Je veux",     link: "",    rest: "visiter Paris.",                  en: "I want to visit Paris." },
  { frame: "Je veux",     link: "",    rest: "partir en vacances.",             en: "I want to go on holiday." },
  { frame: "J'ai besoin", link: "d'",  rest: "un hôtel.",                       en: "I need a hotel." },
  { frame: "J'ai besoin", link: "d'",  rest: "un plan.",                        en: "I need a map." },
  { frame: "J'ai envie",  link: "d'",  rest: "un chocolat chaud.",              en: "I feel like a hot chocolate." },
  { frame: "J'ai envie",  link: "de",  rest: "dormir.",                         en: "I feel like sleeping." },
] as const;

/** The deck's `fr`, rebuilt. An elided link joins with no space (« d'un »); a
 *  full one takes its space (« de dormir »); no link at all leaves the frame
 *  and its object side by side. */
export const line = (c: (typeof CARDS)[number]) =>
  c.link ? sentence([{ text: c.frame }, { text: c.link }, { text: c.rest }])
         : `${c.frame} ${c.rest}`;

const FRAME_WORDS = FRAMES.map((f) => f.fr);

/**
 * The one steer worth offering, and the one the deck can honour.
 *
 * A learner who has just met « J'ai besoin de » wants the two cards that use
 * it, not one in five (Dan, 2026-08-27: "both — dropdowns and dice"). Pinning
 * the FRAME narrows the pool to that frame's own cards rather than applying a
 * frame on top of an object, which is how `aimer.gen.ts` learned to do it —
 * « le danse » is a wrong sentence, not a harder question, and the same trap
 * is here: « Je voudrais de dormir » would be the lesson's own error dealt as
 * an answer.
 *
 * There is deliberately no second axis. The obvious candidate is noun-vs-verb
 * object, but « Je veux » has only infinitives in this deck and « J'ai besoin »
 * only nouns, so half the combinations would be empty and the dropdown would
 * offer choices that deal nothing.
 */
export const ENVIES_AXES: DiceAxis[] = [
  {
    key: "frame",
    label: "Formule",
    options: FRAMES.map((f) => ({ value: f.fr, label: f.de ? `${f.fr} de…` : `${f.fr}…` })),
  },
];

/** Wrong options that are not each other and not the answer. */
function others<T>(pool: readonly T[], not: T, n: number): T[] {
  const rest = pool.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function enviesQuestion(pinned?: Record<string, string>): DiceQuestion {
    // A pinned frame NARROWS the pool to that frame's own cards; it is never
    // applied on top of one, or the card would deal « Je voudrais de dormir »
    // — the very mistake the lesson teaches — as an answer. Same trap
    // aimer.gen.ts hit with « le danse », same fix.
    const c = roll(pinnedGroup(CARDS, pinned?.frame, (x) => x.frame));
    const f = FRAMES.find((x) => x.fr === c.frame)!;

    // Reading order IS withdrawal order: the frame is the leftmost blankable
    // slot and the one thing the lesson is about, so ★ lands on it without
    // needing colours' `first` escape.
    const slots: Slot[] = c.link
      ? [
          { key: "frame", text: c.frame, choices: [c.frame, ...others(FRAME_WORDS, c.frame, 3)] },
          { text: c.link },
          { text: c.rest },
        ]
      : [
          { key: "frame", text: c.frame, choices: [c.frame, ...others(FRAME_WORDS, c.frame, 3)] },
          { text: c.rest },
        ];

    const correct = sentence(slots);

    // The one composed string in this file, and it is the SHAPE error the
    // lesson is about — `de` added where the verb takes its object bare, or
    // dropped where the noun frame requires it. Wrong in exactly ONE way: the
    // frame, the object and the spelling are all the deck's, so a learner who
    // rejects it has rejected the `de` and nothing else. That is the standard
    // colors.tsx set when it suppressed a distractor wrong twice over.
    const shapeError = f.de
      ? `${c.frame} ${c.rest}`
      : sentence([{ text: c.frame }, { text: /^[aeiouéèêîôûh]/i.test(c.rest) ? "d'" : "de" }, { text: c.rest }]);
    const decoys = others(CARDS, c, 2).map(line);

    return {
      // English prompt, so the card asks for production rather than copying;
      // `meta` names the task and never the answer.
      meta: "wanting and needing",
      big: c.en,
      bigLang: "en" as const,
      correct,
      easyOptions: [correct, shapeError, ...decoys],
      slots,
      med: medFrom(slots, "frame"),
    };
  }
