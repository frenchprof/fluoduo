/**
 * The morphology the generators are not allowed to get wrong: articles,
 * contractions (à + le = au, de + les = des), elision (l', de l', d'), and
 * adjective agreement. Every article in a generated text comes from here, so
 * a lexicon entry only ever carries its features — never a hand-typed "du".
 *
 * Article helpers return their own trailing space, EXCEPT the elided forms
 * that end in an apostrophe. Callers therefore always write `art(n) + n.fr`.
 */

import type { Adj, Gram } from "./types";

/** le / la / l' / les */
export function def(n: Gram): string {
  if (n.pl) return "les ";
  if (n.vowel) return "l'";
  return n.g === "m" ? "le " : "la ";
}

/** un / une / des */
export function indef(n: Gram): string {
  if (n.pl) return "des ";
  return n.g === "m" ? "un " : "une ";
}

/** à + article: au / à la / à l' / aux */
export function aLe(n: Gram): string {
  if (n.pl) return "aux ";
  if (n.vowel) return "à l'";
  return n.g === "m" ? "au " : "à la ";
}

/** de + article: du / de la / de l' / des. Doubles as the partitive. */
export function deLe(n: Gram): string {
  if (n.pl) return "des ";
  if (n.vowel) return "de l'";
  return n.g === "m" ? "du " : "de la ";
}

/** The partitive is de + article — same forms, named for what it means. */
export const part = deLe;

/** After ne … pas / jamais the partitive collapses to de / d'. */
export function pasDe(n: Gram): string {
  return n.vowel ? "d'" : "de ";
}

/** ce / cet / cette / ces — the unit-4 second-mention device. */
export function dem(n: Gram): string {
  if (n.pl) return "ces ";
  if (n.g === "f") return "cette ";
  return n.vowel ? "cet " : "ce ";
}

/** A bare quantity expression: "un kilo de pommes", "beaucoup d'oignons". */
export function quantity(q: { fr: string; en: string }, n: Gram & { fr: string }): string {
  return `${q.fr} ${pasDe(n)}${n.fr}`;
}

/** est / sont for a subject with these features. */
export function be(n: Gram): string {
  return n.pl ? "sont" : "est";
}

/** The written form of an adjective agreeing with `n`. */
export function agree(a: Adj, n: Gram): string {
  if (n.pl) return n.g === "f" ? a.fp : a.mp;
  return n.g === "f" ? a.fs : a.ms;
}

/** Sentence-initial capital, apostrophes and accents included. */
export function cap(s: string): string {
  return s.charAt(0).toLocaleUpperCase("fr-FR") + s.slice(1);
}

/**
 * Collapse the double spaces optional connectors leave behind, and apply
 * French punctuation spacing: no space before « , » or « . », but one before
 * the two-part marks « ? ! ; : ». The learner sees the same typography the
 * decks use ("Quel temps fait-il ?").
 */
export function tidy(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s*([?!;:])/g, " $1")
    .trim();
}

/** The same clean-up for the English gloss, under English spacing rules. */
export function tidyEn(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}
