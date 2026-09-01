/**
 * The five remaining ateliers' exercise: the model's own turns, and nothing
 * substituted into anything.
 *
 * WHAT WAS TRIED FIRST, AND WHY IT WAS REVERTED. The obvious source was
 * `FINALE_BANK` — Dan's own red-penned bank, keyed by stop, holding exactly
 * what each atelier is graded on: connectors for SIO-030 and SIO-040, well-wish
 * formulas for 030, review adjectives for 049, restaurant words for 050. It
 * built, it typechecked, and 141 assertions passed. Then a card was opened:
 *
 *     A WELL-WISH WORD
 *     Tu pars en France demain : « Bon chance ! »
 *
 * « Bon chance » is not French. The bank's frame ends in the adjective, and
 * dropping another item's noun into it breaks the agreement. Widening the gap
 * to « Bon voyage · Bonne chance · Joyeux anniversaire » fixed that one
 * category, and probing the next found « un sympa restaurant » waiting in the
 * adjectives.
 *
 * THE ROOT CAUSE, WHICH IS WORTH MORE THAN THE FIX. Those items were authored
 * for a TYPE-IN game — one gap, type the word, accent-tolerant alternates, an
 * English category behind the lightbulb. A bank item guarantees that ITS answer
 * fits ITS frame. It guarantees nothing whatever about another item's answer in
 * that frame, so every multiple choice built by substitution is a gamble on
 * agreement, elision and word order. A scan for "categories whose frame governs
 * the answer" fires on 60 of them, which is to say it separates nothing. This
 * is the same fault as the deck supply's « J'veux » and « Je besoin d' »
 * (task_da59bc63), reached from the opposite direction: substituting one item's
 * answer into another item's frame is unsound in general, and both surfaces
 * were doing it.
 *
 * SO THE OPTIONS ARE WHOLE LINES OF THE MODEL, VERBATIM. Every option is a
 * sentence Dan wrote for that atelier, so no card can be ungrammatical however
 * the roll falls — the property the bank could not give. The prompt is the
 * line's own English, which the dialogue carries for every turn.
 *
 * IT OVERLAPS THE DECK, AND THAT IS THE ACCEPTED COST. `ATELIER_DECKS` deals
 * the same lines as flip-cards. Duplicating a flashcard is a smaller fault than
 * printing « Bon chance » on a learner's screen, and the ramp asks for
 * something the deck does not: at Bonus the whole line is produced from
 * English, which is what performing the model in class actually requires.
 *
 * Loadable by `node --experimental-strip-types` so a check can execute it:
 * ateliers.ts imports nothing, and `@/` is a bundler feature.
 */
import type { DiceQuestion } from "./types";
import { roll } from "./axis.ts";
import { ATELIER_DIALOGUES, type DialogueLine } from "../../ateliers.ts";

/**
 * The lines a card can be built from, under atelierDecks.ts's own filter: a
 * line already dealt is a free point, and a line whose French and English are
 * identical is a proper name rather than language to learn. Applied here so the
 * lesson and the deck cannot disagree about what counts as a card.
 */
export const linesFor = (sio: string): DialogueLine[] =>
  (ATELIER_DIALOGUES[sio] ?? []).filter(
    (l, i, all) => l.fr !== l.en && all.findIndex((o) => o.fr === l.fr) === i,
  );

function others(pool: readonly DialogueLine[], not: DialogueLine, n: number): DialogueLine[] {
  const rest = pool.filter((x) => x !== not);
  const out: DialogueLine[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function questionFor(sio: string): DiceQuestion {
  const lines = linesFor(sio);
  const l = roll(lines);
  const decoys = others(lines, l, 3);

  return {
    // The stop's own dialogue, named. It says which model this line belongs to
    // and nothing about which line — there is no French in it to leak.
    meta: "Le modèle",
    big: l.en,
    bigLang: "en" as const,
    correct: l.fr,
    // Whole turns of this model, verbatim. Nothing is substituted into anything,
    // so no roll can produce a sentence Dan did not write.
    easyOptions: [l.fr, ...decoys.map((o) => o.fr)],
    // No French frame to blank — the unit of this stop is the turn, not a word
    // inside it. Same shape salutations.tsx settled on for the same reason.
    med: { before: "", choices: [l.fr, ...decoys.map((o) => o.fr)], correct: l.fr, after: "" },
  };
}
