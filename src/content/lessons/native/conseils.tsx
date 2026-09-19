/**
 * Native "Donner un conseil" lesson (Unité 4, SIO-048).
 *
 * Why this file exists (2026-08-27). SIO-048's promise is « I can give simple
 * advice about food, health and daily life », and the stop served `modaux` —
 * the same three-verb paradigm table SIO-037 opened. Two different goals, one
 * identical screen, and neither of them about advice. `modaux-avis.json` had
 * asked for a lesson of its own all along; it was never written.
 *
 * ONE objective, three registers of it. The grammar is not the point here and
 * a conjugation drill would miss the goal entirely: a learner giving advice
 * has to choose HOW STRONGLY to give it, so the lesson varies
 *
 *     tu dois + inf   ·  strong, personal    "you must"
 *     il faut + inf   ·  strong, impersonal  "one must"
 *     tu peux + inf   ·  gentle, a suggestion "you can / you could"
 *
 * over one shared pool of food, health and daily-life actions — all of them
 * from the deck, so the Mémo teaches the French the stop then tests.
 *
 * « Il faut » is the one form worth a warning: it is impersonal and never
 * changes, and a learner who has just met devoir will reach for « je faut ».
 */
import type { NativeLesson } from "./types";

const DEVOIR: Record<string, string> = {
  je: "dois", tu: "dois", il: "doit", nous: "devons", vous: "devez", ils: "doivent",
};
const POUVOIR: Record<string, string> = {
  je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent",
};

const PEOPLE = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" },
] as const;

/** Straight from modaux-avis.json — food, health, daily life. */
const ACTIONS = [
  { fr: "manger des légumes", en: "eat vegetables" },
  { fr: "boire de l'eau", en: "drink water" },
  { fr: "manger le matin", en: "eat in the morning" },
  { fr: "acheter du pain", en: "buy bread" },
  { fr: "réserver une table", en: "book a table" },
  { fr: "acheter des fruits ici", en: "buy fruit here" },
  { fr: "goûter", en: "taste it" },
  { fr: "cuisiner", en: "cook" },
] as const;

const DEVOIR_ROWS = [
  ["je", "dois"], ["tu", "dois"], ["il / elle / on", "doit"],
  ["nous", "devons"], ["vous", "devez"], ["ils / elles", "doivent"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export const conseilsLesson: NativeLesson = {
  slug: "conseils",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Donner un conseil — trois façons
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Fort, à quelqu&rsquo;un — <i lang="fr"><b>Tu dois</b> manger des légumes.</i></li>
        <li>Fort, en général — <i lang="fr"><b>Il faut</b> boire de l&rsquo;eau.</i></li>
        <li>Doux, une suggestion — <i lang="fr"><b>Tu peux</b> goûter.</i></li>
      </ul>
      <table className="mt-3 w-full max-w-xs border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {DEVOIR_ROWS.map(([p, f]) => (
            <tr key={p} className="border-t border-[color:var(--cahier-rule)] first:border-t-0">
              <td className="p-1">{p}</td>
              <td className="p-1 font-bold text-[color:var(--gram-neutral)]">{f}</td>
              <td className="p-1 italic">+ infinitif</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr"><b>Il faut</b></span> never changes. It has no <i>je</i>, no <i>nous</i>,
        no <i>ils</i> — always <span lang="fr"><i>il faut</i></span>, whoever the advice is for.
        Say <span lang="fr"><i>je dois boire de l&rsquo;eau</i></span> or{" "}
        <span lang="fr"><i>il faut boire de l&rsquo;eau</i></span>, never{" "}
        <span lang="fr"><i>je faut</i></span>.
      </p>
    </div>
  ),
  // TIER 1 · stop 48. Three ways to advise is not three grammars — it is one
  // grammar and a choice about FORCE and AUDIENCE. The Mémo names the three;
  // the concept says what picks between them.
  concept: {
    subtitle: "Why three ways to give the same advice",
    contrast: (
      <>
        English softens advice with extra words &mdash; <i>you should probably</i>,{" "}
        <i>maybe you could</i>. French changes the <b>verb</b> instead, and the choice says
        two things at once: how hard you are pushing, and whether you mean this person or
        anyone.
      </>
    ),
    question: (
      <>
        <i lang="fr">Tu dois manger des l&eacute;gumes</i> and{" "}
        <i lang="fr">il faut manger des l&eacute;gumes</i>{" "}
        &mdash; same advice. What is
        different?
      </>
    ),
    answer: (
      <>
        Who it lands on. <i lang="fr">Tu dois</i> is aimed at you and is hard to
        refuse;{" "}
        <i lang="fr">il faut</i> is a general truth and lets nobody off, but names nobody
        either. <i lang="fr">Tu peux go&ucirc;ter</i>{" "}is the soft one &mdash; a suggestion
        you may decline.
      </>
    ),
    pitfallHeads: ["all three read as the same", "what each one does"],
    pitfall: [
      { label: <><i lang="fr">tu dois</i></>, wrong: <>a gentle nudge</>, right: <>strong, and aimed at you</> },
      { label: <><i lang="fr">il faut</i></>, wrong: <>advice to one person</>, right: <>strong, and aimed at nobody</> },
      { label: <><i lang="fr">tu peux</i></>, wrong: <>permission</>, right: <>a suggestion you may refuse</> },
    ],
    flow: [
      { depth: 0, text: "How hard are you pushing?" },
      { depth: 1, text: "gently → tu peux…" },
      { depth: 1, text: "firmly → is it about THIS person?" },
      { depth: 2, text: "yes → tu dois…" },
      { depth: 2, text: "no, it is general → il faut…" },
    ],
    check: [
      { q: <>Tell a friend, gently, to try it.</>,
        a: <><i lang="fr">Tu peux go&ucirc;ter.</i></> },
      { q: <>Why can <i lang="fr">il faut</i> feel less rude than <i lang="fr">tu dois</i>?</>,
        a: <>It names no one. The obligation is in the world rather than on the person in front of you.</> },
    ],
    remember: (
      <>
        The verb carries the force. <i lang="fr">Tu peux</i> suggests,{" "}
        <i lang="fr">tu dois</i> presses, <i lang="fr">il faut</i> presses without naming
        anyone.
      </>
    ),
  },
  dice: {
    instruction: "Give the advice — mind how strong it is, and who it is for.",
    newQuestion() {
      // The card varies the REGISTER of the advice, not the verb paradigm.
      // Choosing between "you must", "one must" and "you could" is the skill
      // SIO-048 names; conjugating three modals side by side is not.
      const a = pick(ACTIONS);
      const mode = pick(["devoir", "falloir", "pouvoir"] as const);

      if (mode === "falloir") {
        const correct = `Il faut ${a.fr}.`;
        return {
          meta: "conseil général → il faut",
          big: a.en,
          en: `general advice: ${a.en}`,
          correct,
          easyOptions: [correct, `Il faut ${a.fr} ?`, `Je faut ${a.fr}.`, `Ils faut ${a.fr}.`],
          // The blank is "faut" alone: the point is that it never agrees, so
          // the wrong options are the agreements a learner would invent.
          med: { before: "Il ", choices: ["faut", "faux", "fais", "faits"], correct: "faut", after: `${a.fr}.` },
        };
      }

      const p = mode === "devoir" ? pick(PEOPLE) : { disp: "Tu", slot: "tu" as const };
      const table = mode === "devoir" ? DEVOIR : POUVOIR;
      const form = table[p.slot];
      const wrong = others(Object.values(table).filter((v, i, s) => s.indexOf(v) === i), form, 3);
      const strength = mode === "devoir" ? "il le faut" : "une suggestion";
      const correct = `${p.disp} ${form} ${a.fr}.`;
      return {
        meta: `${p.disp.toLowerCase()} → ${strength}`,
        big: a.en,
        en: mode === "devoir" ? `must: ${a.en}` : `could: ${a.en}`,
        correct,
        easyOptions: [correct, ...wrong.map((f) => `${p.disp} ${f} ${a.fr}.`)],
        med: { before: p.disp, choices: [form, ...wrong], correct: form, after: `${a.fr}.` },
      };
    },
  },
  bonus: [
    { en: "You must eat vegetables.", fr: "Tu dois manger des légumes." },
    { en: "I must drink water.", fr: "Je dois boire de l'eau." },
    { en: "You (formal) must book a table.", fr: "Vous devez réserver une table." },
    { en: "One must drink water.", fr: "Il faut boire de l'eau." },
    { en: "One must eat in the morning.", fr: "Il faut manger le matin." },
    { en: "One must buy bread.", fr: "Il faut acheter du pain." },
    { en: "You can taste it.", fr: "Tu peux goûter." },
    { en: "She can cook.", fr: "Elle peut cuisiner." },
    { en: "We can buy fruit here.", fr: "On peut acheter des fruits ici." },
  ],
};
