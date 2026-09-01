/**
 * Native "Questions oui/non" lesson (Unité 1) — distilled from
 * 04-questions-oui-non.html: intonation ↗ / est-ce que / n'est-ce pas, plus
 * oui vs non vs si. The 🎲 trainer gives an answer; you form the question.
 */
import type { NativeLesson } from "./types";

type Item = {
  ans: string; en: string; mode: string; q: string;
  wrongs: [string, string, string];
  med: { before: string; choices: string[]; correct: string; after: string };
};

const ITEMS: readonly Item[] = [
  {
    ans: "Oui, je suis français.", en: "Yes, I am French. (m.)", mode: "est-ce que",
    q: "Est-ce que tu es français ?",
    wrongs: ["Est-ce que tu as français ?", "Est-ce que tu es française ?", "Tu es français ?"],
    med: { before: "Est-ce que tu", choices: ["es", "as", "parles", "habites"], correct: "es", after: "français ?" },
  },
  {
    ans: "Oui, je suis française.", en: "Yes, I am French. (f.)", mode: "est-ce que",
    q: "Est-ce que tu es française ?",
    wrongs: ["Est-ce que tu es français ?", "Est-ce que tu as française ?", "Tu es française ?"],
    med: { before: "Est-ce que tu", choices: ["es", "as", "parles", "habites"], correct: "es", after: "française ?" },
  },
  {
    ans: "Oui, j'ai 15 ans.", en: "Yes, I am 15.", mode: "est-ce que",
    q: "Est-ce que tu as 15 ans ?",
    wrongs: ["Est-ce que tu es 15 ans ?", "Tu as 15 ans ?", "Est-ce que tu as 16 ans ?"],
    med: { before: "Est-ce que tu", choices: ["as", "es", "parles", "habites"], correct: "as", after: "15 ans ?" },
  },
  {
    ans: "Non, je n'ai pas 16 ans.", en: "No, I am not 16.", mode: "est-ce que",
    q: "Est-ce que tu as 16 ans ?",
    wrongs: ["Est-ce que tu es 16 ans ?", "Est-ce que as tu 16 ans ?", "Est-ce que tu as 15 ans ?"],
    med: { before: "Est-ce que tu", choices: ["as", "es", "parles", "habites"], correct: "as", after: "16 ans ?" },
  },
  {
    ans: "Oui, je parle français.", en: "Yes, I speak French.", mode: "intonation ↗",
    q: "Tu parles français ?",
    wrongs: ["Tu parle français ?", "Tu habites français ?", "Est-ce que tu parles français ?"],
    med: { before: "Tu", choices: ["parles", "parle", "parlez", "habites"], correct: "parles", after: "français ?" },
  },
  {
    ans: "Oui, j'habite en France.", en: "Yes, I live in France.", mode: "intonation ↗",
    q: "Tu habites en France ?",
    wrongs: ["Tu habite en France ?", "Tu as en France ?", "Est-ce que tu habites en France ?"],
    med: { before: "Tu", choices: ["habites", "habite", "habitez", "as"], correct: "habites", after: "en France ?" },
  },
  {
    ans: "Non, je ne suis pas anglais.", en: "No, I am not English. (m.)", mode: "intonation ↗",
    q: "Tu es anglais ?",
    wrongs: ["Tu as anglais ?", "Tu es anglaise ?", "Est-ce que tu es anglais ?"],
    med: { before: "Tu", choices: ["es", "as", "est", "êtes"], correct: "es", after: "anglais ?" },
  },
  {
    ans: "Non, je ne suis pas anglaise.", en: "No, I am not English. (f.)", mode: "intonation ↗",
    q: "Tu es anglaise ?",
    wrongs: ["Tu as anglaise ?", "Tu es anglais ?", "Est-ce que tu es anglaise ?"],
    med: { before: "Tu", choices: ["es", "as", "est", "êtes"], correct: "es", after: "anglaise ?" },
  },
  {
    ans: "Si, je suis français.", en: "Yes I AM French! (contradicting)", mode: "question négative → si",
    q: "Tu n'es pas français ?",
    wrongs: ["Tu es français ?", "Tu n'as pas français ?", "Tu ne es pas français ?"],
    med: { before: "Tu", choices: ["n'es", "n'as", "ne es", "n'est"], correct: "n'es", after: "pas français ?" },
  },
  {
    ans: "Si, j'ai 15 ans.", en: "Yes I AM 15! (contradicting)", mode: "question négative → si",
    q: "Tu n'as pas 15 ans ?",
    wrongs: ["Tu as 15 ans ?", "Tu n'es pas 15 ans ?", "Tu ne as pas 15 ans ?"],
    med: { before: "Tu", choices: ["n'as", "n'es", "ne as", "n'a"], correct: "n'as", after: "pas 15 ans ?" },
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const questionsOuiNonLesson: NativeLesson = {
  slug: "questions-oui-non",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Questions oui / non
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">Intonation ↗</b> — <i lang="fr">Tu es français <b>?</b></i></li>
        <li><b className="text-[color:var(--gram-neutral)]">Est-ce que</b> + phrase — <i lang="fr"><b>Est-ce que</b> tu es français ?</i> (+ voyelle → <i lang="fr"><b>Est-ce qu&rsquo;</b>il parle anglais ?</i>)</li>
        <li><b className="text-[color:var(--gram-neutral)]">n&rsquo;est-ce pas ?</b> — <i lang="fr">Tu es français, <b>n&rsquo;est-ce pas ?</b></i></li>
      </ul>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <b>Oui</b> — <i>Tu es français ? — Oui.</i> · <b>Non</b> — <i>Tu es anglais ? — Non.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Si</b> = yes contradicting a <b>negative</b> question:{" "}
        <span lang="fr">Tu <u>n&rsquo;es pas</u> français ? — <b>Si</b>, je suis français !</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 34, the yes/no half. Three ways to ask the same thing is a
  // REGISTER choice, not three rules. And `si` is a word English does not have,
  // which is why learners answer a negative question wrongly.
  concept: {
    subtitle: "Why French has a second word for yes",
    contrast: (
      <>
        English answers <i>yes</i> to everything. French keeps a second yes,{" "}
        <i lang="fr">si</i>, for one job only: <b>contradicting a negative question</b>.
        Answering <i lang="fr">oui</i> there is not rude, it is unclear.
      </>
    ),
    question: (
      <>
        <i lang="fr">Tu n&rsquo;es pas fran&ccedil;ais&nbsp;?</i> You are. What do you say?
      </>
    ),
    answer: (
      <>
        <i lang="fr">Si, je suis fran&ccedil;ais&nbsp;!</i> The question assumed you were
        not, and <i lang="fr">si</i> exists to overturn that assumption. After an ordinary
        question, <i lang="fr">oui</i> is right and <i lang="fr">si</i> would be strange.
      </>
    ),
    pitfallHeads: ["one English yes", "which yes French wants"],
    pitfall: [
      { label: <><i lang="fr">Tu es fran&ccedil;ais&nbsp;?</i></>, wrong: <><i lang="fr">Si.</i></>, right: <><i lang="fr">Oui.</i></> },
      { label: <><i lang="fr">Tu n&rsquo;es pas fran&ccedil;ais&nbsp;?</i></>, wrong: <><i lang="fr">Oui.</i></>, right: <><i lang="fr">Si.</i></> },
    ],
    flow: [
      { depth: 0, text: "Was the question negative?" },
      { depth: 1, text: "no → oui / non" },
      { depth: 1, text: "yes, and you disagree → si" },
    ],
    check: [
      { q: <>Three ways to ask the same yes/no question. Do they mean different things?</>,
        a: <>No &mdash; intonation, <i lang="fr">est-ce que</i> and{" "}
        <i lang="fr">n&rsquo;est-ce pas</i> differ in how formal they sound, not in meaning.</> },
      { q: <><i lang="fr">Tu ne parles pas anglais&nbsp;?</i> You do.</>,
        a: <><i lang="fr">Si&nbsp;!</i></> },
    ],
    remember: (
      <>
        <i lang="fr">Si</i>{" "}is the yes that says &ldquo;you were wrong to assume
        otherwise&rdquo;. It only ever answers a negative.
      </>
    ),
  },
  dice: {
    instruction: "Form the question that matches the given answer.",
    newQuestion() {
      const it = pick(ITEMS);
      return {
        meta: `Formez la question — ${it.mode}`,
        big: it.ans,
        en: it.en,
        correct: it.q,
        easyOptions: [it.q, ...it.wrongs],
        med: it.med,
      };
    },
  },
  bonus: [
    { en: "Are you French? (boy, est-ce que)", fr: "Est-ce que tu es français ?" },
    { en: "Are you French? (girl, est-ce que)", fr: "Est-ce que tu es française ?" },
    { en: "Are you 15 years old? (est-ce que)", fr: "Est-ce que tu as 15 ans ?" },
    { en: "Do you speak French? (rising intonation)", fr: "Tu parles français ?" },
    { en: "Do you live in France? (rising intonation)", fr: "Tu habites en France ?" },
    { en: "You're not French? (answer yes: Si)", fr: "Tu n'es pas français ?" },
    { en: "You're not 16? (answer yes: Si)", fr: "Tu n'as pas 16 ans ?" },
    { en: "Is she French? (est-ce que)", fr: "Est-ce qu'elle est française ?" },
    { en: "Are you English? (rising intonation, boy)", fr: "Tu es anglais ?" },
    { en: "Does he speak Japanese? (est-ce que)", fr: "Est-ce qu'il parle japonais ?" },
  ],
};
