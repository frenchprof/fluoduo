/**
 * « N'OUBLIEZ PAS DE CONJUGUER LES VERBES DANS LA LISTE » — the checklist for a
 * guided writing task.
 *
 * THE SHAPE OF TASK THIS SERVES, which is one of the oldest in language
 * teaching: write a short piece on a given subject, drawing on a set list of
 * words, using at least so many of them, conjugating the verbs in the list,
 * and landing inside a word count.
 *
 *     Présentez quelqu'un. Voici une liste de mots, utilisez 10 mots minimum.
 *     N'oubliez pas de conjuguer les verbes dans la liste. (50 – 60 mots)
 *
 * It is a revision exercise before it is anything else: the list is what stops
 * a learner writing only the six words they are already sure of.
 *
 * THE WHOLE DIFFICULTY IS IN ONE WORD OF THAT INSTRUCTION: *conjuguer*. The
 * list gives INFINITIVES, and the learner must not write them. « avoir » is
 * ticked off by « il **a** vingt ans », never by the word "avoir" — so a
 * checklist that searched for the listed string would tick precisely when the
 * learner got it wrong, and stay blank when they got it right.
 *
 * THE DATA FOR THIS ALREADY EXISTED. `content/conjugaison.ts` carries the six
 * present forms of 67 verbs, every one of Dan's seven among them, because
 * ConjugaZone needs them. So matching a written form back to its infinitive is
 * a table read, not new grammar — which is why this file is small.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not grade French. A tick means
 * "this word of the list has been used", nothing more; whether the sentence
 * around it is correct is the AI check's job (`aiCheck` on the bank) and the
 * teacher's. Keeping the two apart is what lets the checklist be generous —
 * it is there to get a learner to 10 words, not to catch them out.
 */
import { VERBS } from "@/content/conjugaison";
import { deaccent } from "@/lib/practice/cloze";

/**
 * One line of the word list.
 *
 * `verb` names an infinitive in `conjugaison.ts`: the line is ticked by the
 * infinitive OR any of its six present forms. Everything else is matched as
 * written, through `all`.
 *
 * `all` is a list of GROUPS, and every group must be satisfied by one of its
 * members. Two groups is what « ne..pas / ne..plus » needs and a single word
 * never does:
 *
 *     { label: "ne…pas / ne…plus", all: [["ne", "n"], ["pas", "plus"]] }
 *
 * — because the two halves are never adjacent (« je **ne** suis **pas** »),
 * and because elision splits « n'aime » into two tokens, so "ne" alone would
 * miss half the sentences a learner actually writes.
 */
export type Requirement = {
  /** What the learner reads on the checklist — the list's own wording. */
  label: string;
  /** An infinitive in conjugaison.ts; any present form ticks the line. */
  verb?: string;
  /** Groups of alternatives; each group needs one member present. */
  all?: string[][];
};

export type RequirementHit = Requirement & {
  used: boolean;
  /** The form actually found, so the checklist can show « avoir → a ». */
  as?: string;
};

/** Lower-case, unaccented, punctuation-free tokens.
 *
 *  THE APOSTROPHE IS A SEPARATOR, not a letter: « j'ai » has to yield "ai" or
 *  `avoir` would never be ticked by the commonest sentence a learner writes.
 *  The hyphen is one too, for « a-t-il ». */
function tokenise(text: string): string[] {
  return deaccent(text.toLowerCase())
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const norm = (s: string) => tokenise(s).join(" ");

/** Is `needle` present in `tokens` as consecutive whole tokens?
 *  Whole tokens, so « et » is not found inside « étudiant », and multi-word,
 *  so « le football » only counts in that order. */
function present(tokens: string[], needle: string): boolean {
  const want = tokenise(needle);
  if (want.length === 0) return false;
  for (let i = 0; i + want.length <= tokens.length; i++) {
    let ok = true;
    for (let j = 0; j < want.length; j++) if (tokens[i + j] !== want[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

/** Every written form that ticks a verb: its infinitive and its six present
 *  forms. « — » marks a person the verb has no form for (il faut) and is
 *  dropped, or every text would satisfy `falloir`. */
export function formsOf(infinitive: string): string[] {
  const v = VERBS.find((x) => norm(x.inf) === norm(infinitive) || x.id === infinitive);
  if (!v) return [infinitive];
  return [v.inf, ...v.forms.filter((f) => f && f !== "—")];
}

/** Check a piece of the learner's writing against the list. */
export function checkRequired(text: string, list: Requirement[]): RequirementHit[] {
  const tokens = tokenise(text);
  return list.map((r) => {
    if (r.verb) {
      const hit = formsOf(r.verb).find((f) => present(tokens, f));
      return { ...r, used: !!hit, as: hit };
    }
    const groups = r.all ?? [[r.label]];
    const found: string[] = [];
    const used = groups.every((g) => {
      const hit = g.find((m) => present(tokens, m));
      if (hit) found.push(hit);
      return !!hit;
    });
    return { ...r, used, as: used ? found.join(" … ") : undefined };
  });
}

/** How many words the learner has written — the « (50 – 60 mots) » counter.
 *  Counted the way a marker counts them: « aujourd'hui » is one word, so the
 *  apostrophe does NOT split here, unlike in matching above. */
export function countWords(text: string): number {
  return (text.trim().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}
