/**
 * Native "Mots interrogatifs" lesson (Unité 1, L05) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 05-mots-interrogatifs.html drchan import.
 */
import type { NativeLesson } from "./types";

const ITEMS = [
  { answer: "Je m'appelle Thomas.", en: "My name is Thomas.", question: "Comment tu t'appelles ?", qword: "Comment", rest: "tu t'appelles ?" },
  { answer: "Je m'appelle Emma.", en: "My name is Emma.", question: "Comment tu t'appelles ?", qword: "Comment", rest: "tu t'appelles ?" },
  { answer: "J'ai 15 ans.", en: "I am 15 years old.", question: "Quel âge as-tu ?", qword: "Quel âge", rest: "as-tu ?" },
  { answer: "J'ai 16 ans.", en: "I am 16 years old.", question: "Quel âge as-tu ?", qword: "Quel âge", rest: "as-tu ?" },
  { answer: "Je suis français.", en: "I am French (m.).", question: "De quelle nationalité es-tu ?", qword: "De quelle nationalité", rest: "es-tu ?" },
  { answer: "Je suis française.", en: "I am French (f.).", question: "De quelle nationalité es-tu ?", qword: "De quelle nationalité", rest: "es-tu ?" },
  { answer: "Il y a 4 personnes dans ma famille.", en: "There are 4 people in my family.", question: "Combien de personnes y a-t-il dans ta famille ?", qword: "Combien de", rest: "personnes y a-t-il dans ta famille ?" },
  { answer: "C'est Marie.", en: "It's Marie.", question: "Qui est-ce ?", qword: "Qui", rest: "est-ce ?" },
  { answer: "Je parle français.", en: "I speak French.", question: "Quelle langue parles-tu ?", qword: "Quelle langue", rest: "parles-tu ?" },
  { answer: "Je viens de France.", en: "I come from France.", question: "De quel pays viens-tu ?", qword: "De quel pays", rest: "viens-tu ?" },
  { answer: "Mon prénom est Lucas.", en: "My first name is Lucas.", question: "Quel est ton prénom ?", qword: "Quel", rest: "est ton prénom ?" },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const sample = <T,>(a: readonly T[], n: number): T[] => {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o.slice(0, n);
};

export const motsInterrogatifsLesson: NativeLesson = {
  slug: "mots-interrogatifs",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les mots interrogatifs
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--cahier-la)]">Comment</b> — name — <i lang="fr">Comment tu t&rsquo;appelles ?</i></li>
        <li><b className="text-[color:var(--cahier-la)]">Quel(le)</b> + nom — which/what — <i lang="fr">Quel âge as-tu ? · Quelle langue parles-tu ?</i></li>
        <li><b className="text-[color:var(--cahier-la)]">Combien de</b> — how many — <i lang="fr">Combien de personnes y a-t-il dans ta famille ?</i></li>
        <li><b className="text-[color:var(--cahier-la)]">Qui</b> — who — <i lang="fr">Qui est-ce ?</i></li>
        <li><b className="text-[color:var(--cahier-la)]">Est-ce que</b> — yes/no — <i lang="fr">Est-ce que tu es français ?</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b><span lang="fr">Quel</span> agrees with the noun, not the subject</b> —{" "}
        <span lang="fr"><b>quel</b> âge (m) · <b>quelle</b> nationalité (f) · <b>quels</b> pays (m.pl) · <b>quelles</b> langues (f.pl)</span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "You are given the answer — form the matching French question.",
    newQuestion() {
      const it = pick(ITEMS);
      const otherQs = [...new Set(ITEMS.filter((x) => x.question !== it.question).map((x) => x.question))];
      const qwords = [...new Set(ITEMS.map((x) => x.qword))];
      const otherWords = sample(qwords.filter((w) => w !== it.qword), 4);
      return {
        meta: "Réponse :",
        big: it.answer,
        en: it.en,
        correct: it.question,
        easyOptions: [it.question, ...sample(otherQs, 3)],
        med: { before: "", choices: [it.qword, ...otherWords], correct: it.qword, after: it.rest },
      };
    },
  },
  bonus: [
    { en: "What is your name? (informal)", fr: "Comment tu t'appelles ?" },
    { en: "How old are you? (informal)", fr: "Quel âge as-tu ?" },
    { en: "What is your nationality? (informal)", fr: "De quelle nationalité es-tu ?" },
    { en: "How many people are there in your family?", fr: "Combien de personnes y a-t-il dans ta famille ?" },
    { en: "Who is it?", fr: "Qui est-ce ?" },
    { en: "What language do you speak? (informal)", fr: "Quelle langue parles-tu ?" },
    { en: "What is your first name? (informal)", fr: "Quel est ton prénom ?" },
    { en: "What country do you come from? (informal)", fr: "De quel pays viens-tu ?" },
    { en: "Are you French? (m., informal, with est-ce que)", fr: "Est-ce que tu es français ?" },
    { en: "What languages do you speak? (informal)", fr: "Quelles langues parles-tu ?" },
  ],
};
