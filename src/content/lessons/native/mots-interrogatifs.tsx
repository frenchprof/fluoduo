/**
 * Native "Mots interrogatifs" lesson (Unité 1, L05) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 05-mots-interrogatifs.html drchan import.
 */
import type { NativeLesson } from "./types";
import { sample } from "@/lib/shuffle";

// INTONATION FIRST (2026-10-30): Atelier A1 Units 0–4 teach the question
// word at the end or at the front with no inversion — « Tu as quel âge ? »,
// « Tu viens de quel pays ? ». The inverted forms (« Quel âge as-tu ? ») are
// still ACCEPTED through `alternates`, never required. `before` is what
// precedes the question word in the cloze; when it is not empty the word is
// set lower-case. « Qui est-ce ? » and « Quel est ton prénom ? » are fixed
// formulas the course teaches as wholes, so they stay.
const ITEMS = [
  { answer: "Je m'appelle Thomas.", en: "My name is Thomas.", question: "Comment tu t'appelles ?", alternates: ["Tu t'appelles comment ?", "Comment t'appelles-tu ?", "Comment est-ce que tu t'appelles ?"], before: "", qword: "Comment", rest: "tu t'appelles ?" },
  { answer: "Je m'appelle Emma.", en: "My name is Emma.", question: "Comment tu t'appelles ?", alternates: ["Tu t'appelles comment ?", "Comment t'appelles-tu ?", "Comment est-ce que tu t'appelles ?"], before: "", qword: "Comment", rest: "tu t'appelles ?" },
  { answer: "J'ai 15 ans.", en: "I am 15 years old.", question: "Tu as quel âge ?", alternates: ["Quel âge as-tu ?", "Quel âge tu as ?", "Quel âge est-ce que tu as ?"], before: "Tu as", qword: "quel âge", rest: "?" },
  { answer: "J'ai 16 ans.", en: "I am 16 years old.", question: "Tu as quel âge ?", alternates: ["Quel âge as-tu ?", "Quel âge tu as ?", "Quel âge est-ce que tu as ?"], before: "Tu as", qword: "quel âge", rest: "?" },
  { answer: "Je suis français.", en: "I am French (m.).", question: "Tu es de quelle nationalité ?", alternates: ["De quelle nationalité es-tu ?", "De quelle nationalité tu es ?"], before: "Tu es", qword: "de quelle nationalité", rest: "?" },
  { answer: "Je suis française.", en: "I am French (f.).", question: "Tu es de quelle nationalité ?", alternates: ["De quelle nationalité es-tu ?", "De quelle nationalité tu es ?"], before: "Tu es", qword: "de quelle nationalité", rest: "?" },
  { answer: "Il y a 10 personnes dans la classe.", en: "There are 10 people in the class.", question: "Il y a combien de personnes dans la classe ?", alternates: ["Combien de personnes il y a dans la classe ?", "Combien de personnes y a-t-il dans la classe ?"], before: "Il y a", qword: "combien de", rest: "personnes dans la classe ?" },
  { answer: "C'est Marie.", en: "It's Marie.", question: "Qui est-ce ?", alternates: ["C'est qui ?"], before: "", qword: "Qui", rest: "est-ce ?" },
  { answer: "Je parle français.", en: "I speak French.", question: "Tu parles quelle langue ?", alternates: ["Quelle langue parles-tu ?", "Quelle langue tu parles ?"], before: "Tu parles", qword: "quelle langue", rest: "?" },
  { answer: "Je viens de France.", en: "I come from France.", question: "Tu viens de quel pays ?", alternates: ["De quel pays viens-tu ?", "De quel pays tu viens ?"], before: "Tu viens", qword: "de quel pays", rest: "?" },
  { answer: "Mon prénom est Lucas.", en: "My first name is Lucas.", question: "Quel est ton prénom ?", alternates: ["C'est quoi ton prénom ?", "Ton prénom, c'est quoi ?"], before: "", qword: "Quel", rest: "est ton prénom ?" },
] as const;

const low = (w: string) => w.charAt(0).toLowerCase() + w.slice(1);
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const motsInterrogatifsLesson: NativeLesson = {
  slug: "mots-interrogatifs",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les mots interrogatifs
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">Comment</b> — name — <i lang="fr">Comment tu t&rsquo;appelles ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">Quel(le)</b> + nom — which/what — <i lang="fr">Tu as quel âge ? · Tu parles quelle langue ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">Combien de</b> — how many — <i lang="fr">Il y a combien de personnes dans la classe ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">Qui</b> — who — <i lang="fr">Qui est-ce ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">Est-ce que</b> — yes/no — <i lang="fr">Est-ce que tu es français ?</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b><span lang="fr">Quel</span> agrees with the noun, not the subject</b> —{" "}
        <span lang="fr"><b>quel</b> âge (m) · <b>quelle</b> nationalité (f) · <b>quels</b> pays (m.pl) · <b>quelles</b> langues (f.pl)</span>.
      </p>
    </div>
  ),
  // TIER 1 · stop 34, the wh- half. The Mémo's warning is the whole concept:
  // `quel` agrees with the NOUN it asks about, not with the person answering.
  concept: {
    subtitle: "Why quel changes but comment never does",
    contrast: (
      <>
        English question words are frozen &mdash; <i>what</i>, <i>which</i>, <i>how</i>,
        the same every time. Most French ones are too. One is not:{" "}
        <i lang="fr">quel</i> is an <b>adjective</b>, so it agrees with the noun it asks
        about.
      </>
    ),
    question: (
      <>
        <i lang="fr">Tu as quel &acirc;ge&nbsp;?</i> but{" "}
        <i lang="fr">Tu parles quelle langue&nbsp;?</i> What decides the ending?
      </>
    ),
    answer: (
      <>
        The noun straight after it. <i lang="fr">L&rsquo;&acirc;ge</i> is masculine, so{" "}
        <i lang="fr">quel</i>; <i lang="fr">la langue</i> is feminine, so{" "}
        <i lang="fr">quelle</i>. Not the person being asked &mdash; a woman is still asked{" "}
        <i lang="fr">quel &acirc;ge</i>.
      </>
    ),
    pitfallHeads: ["agreeing with the person", "agreeing with the noun"],
    pitfall: [
      { label: <>asking a woman her age</>, wrong: <><i lang="fr">quelle &acirc;ge</i></>, right: <><i lang="fr">quel &acirc;ge</i></> },
      { label: <>which languages</>, wrong: <><i lang="fr">quels langues</i></>, right: <><i lang="fr">quelles langues</i></> },
      { label: <>how are you called</>, wrong: <><i lang="fr">comment</i> changing</>, right: <><i lang="fr">comment</i>, always</> },
    ],
    check: [
      { q: <>Which countries &mdash; <i lang="fr">les pays</i>, masculine plural.</>,
        a: <><i lang="fr">Quels pays&nbsp;?</i></> },
      { q: <>Why does <i lang="fr">combien de</i> never change?</>,
        a: <>It is not an adjective. Only <i lang="fr">quel</i> agrees.</> },
    ],
    remember: (
      <>
        <i lang="fr">Quel</i>{" "}is an adjective wearing a question word&rsquo;s clothes. It
        agrees with the noun beside it, never with the person you are asking.
      </>
    ),
  },
  dice: {
    instruction: "You are given the answer — form the matching French question.",
    newQuestion() {
      const it = pick(ITEMS);
      const otherQs = [...new Set(ITEMS.filter((x) => x.question !== it.question).map((x) => x.question))];
      const qwords = [...new Set(ITEMS.map((x) => low(x.qword)))];
      const otherWords = sample(qwords.filter((w) => w !== low(it.qword)), 4);
      const fit = (w: string) => (it.before ? low(w) : cap(w));
      return {
        meta: "Réponse :",
        big: it.answer,
        en: it.en,
        correct: it.question,
        alternates: [...(it.alternates ?? [])],
        easyOptions: [it.question, ...sample(otherQs, 3)],
        med: { before: it.before, choices: [it.qword, ...otherWords].map(fit), correct: fit(it.qword), after: it.rest },
      };
    },
  },
  bonus: [
    { en: "What is your name? (informal)", fr: "Comment tu t'appelles ?", alt: ["Tu t'appelles comment ?", "Comment t'appelles-tu ?", "Comment est-ce que tu t'appelles ?"] },
    { en: "How old are you? (informal)", fr: "Tu as quel âge ?", alt: ["Quel âge as-tu ?", "Quel âge tu as ?", "Quel âge est-ce que tu as ?"] },
    { en: "What is your nationality? (informal)", fr: "Tu es de quelle nationalité ?", alt: ["De quelle nationalité es-tu ?", "De quelle nationalité tu es ?"] },
    { en: "How many people are there in the class?", fr: "Il y a combien de personnes dans la classe ?", alt: ["Combien de personnes il y a dans la classe ?", "Combien de personnes y a-t-il dans la classe ?"] },
    { en: "Who is it?", fr: "Qui est-ce ?", alt: ["C'est qui ?"] },
    { en: "What language do you speak? (informal)", fr: "Tu parles quelle langue ?", alt: ["Quelle langue parles-tu ?", "Quelle langue tu parles ?"] },
    { en: "What is your first name? (informal)", fr: "Quel est ton prénom ?", alt: ["C'est quoi ton prénom ?", "Ton prénom, c'est quoi ?"] },
    { en: "What country do you come from? (informal)", fr: "Tu viens de quel pays ?", alt: ["De quel pays viens-tu ?", "De quel pays tu viens ?"] },
    { en: "Are you French? (m., informal, with est-ce que)", fr: "Est-ce que tu es français ?" },
    { en: "What languages do you speak? (informal)", fr: "Tu parles quelles langues ?", alt: ["Quelles langues parles-tu ?", "Quelles langues tu parles ?"] },
  ],
};
