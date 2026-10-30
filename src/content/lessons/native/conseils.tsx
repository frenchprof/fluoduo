/**
 * Native "Donner un conseil" lesson (Unité 4, SIO-048).
 *
 * Why this file exists (2026-08-27). SIO-048's promise is « I can give simple
 * advice about food, health and daily life », and the stop served `modaux` —
 * the same three-verb paradigm table SIO-037 opened. Two different goals, one
 * identical screen, and neither of them about advice. `modaux-avis.json` had
 * asked for a lesson of its own all along; it was never written.
 *
 * ONE objective, two registers of it — exactly the two Atelier A1's Unit 4
 * box teaches. The grammar is not the point here and a conjugation drill
 * would miss the goal entirely: a learner giving advice has to choose HOW
 * STRONGLY to give it, so the lesson varies
 *
 *     il faut + inf              ·  firm, general     "one must"
 *     tu peux / vous pouvez + inf ·  gentle, a suggestion "you can / you could"
 *
 * over one shared pool of food, health and daily-life actions — all of them
 * from the deck, so the Mémo teaches the French the stop then tests.
 *
 * Devoir (« tu dois ») is NOT here on purpose: the book teaches it in Unit 6,
 * and nothing a learner is scored on may go past Unit 4 (Dan, 2026-10-30).
 *
 * « Il faut » is the one form worth a warning: it is impersonal and never
 * changes, and a learner who has just met pouvoir will reach for « je faut ».
 */
import type { NativeLesson } from "./types";

const POUVOIR: Record<string, string> = {
  je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent",
};

/** The three a suggestion is made to — the Unit 4 box's tu / vous / on. */
const PEOPLE = [
  { disp: "Tu", slot: "tu" }, { disp: "Vous", slot: "vous" }, { disp: "On", slot: "il" },
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

const POUVOIR_ROWS = [
  ["je", "peux"], ["tu", "peux"], ["il / elle / on", "peut"],
  ["nous", "pouvons"], ["vous", "pouvez"], ["ils / elles", "peuvent"],
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
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Donner un conseil — deux façons
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Fort, en général — <i lang="fr"><b>Il faut</b> boire de l&rsquo;eau.</i></li>
        <li>Doux, une suggestion — <i lang="fr"><b>Tu peux</b> goûter.</i>{" "}
          <i lang="fr"><b>Vous pouvez</b> réserver une table.</i></li>
      </ul>
      <table className="mt-3 w-full max-w-xs border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {POUVOIR_ROWS.map(([p, f]) => (
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
        Say <span lang="fr"><i>il faut boire de l&rsquo;eau</i></span> or{" "}
        <span lang="fr"><i>tu peux boire de l&rsquo;eau</i></span>, never{" "}
        <span lang="fr"><i>je faut</i></span>.
      </p>
    </div>
  ),
  // TIER 1 · stop 48. Two ways to advise is not two grammars — it is one
  // grammar and a choice about FORCE. The Mémo names the two; the concept
  // says what picks between them.
  concept: {
    subtitle: "Why two ways to give the same advice",
    contrast: (
      <>
        English softens advice with extra words &mdash; <i>you should probably</i>,{" "}
        <i>maybe you could</i>. French changes the <b>verb</b> instead, and the choice says
        how hard you are pushing.
      </>
    ),
    question: (
      <>
        <i lang="fr">Il faut manger des l&eacute;gumes</i> and{" "}
        <i lang="fr">tu peux manger des l&eacute;gumes</i>{" "}
        &mdash; same advice. What is
        different?
      </>
    ),
    answer: (
      <>
        How hard it pushes. <i lang="fr">Il faut</i> is a general rule and lets nobody
        off, but names nobody either. <i lang="fr">Tu peux</i>{" "}is the soft one &mdash;
        a suggestion you may decline.
      </>
    ),
    pitfallHeads: ["all three read as the same", "what each one does"],
    pitfall: [
      { label: <><i lang="fr">il faut</i></>, wrong: <>advice to one person</>, right: <>strong, and aimed at nobody</> },
      { label: <><i lang="fr">tu peux</i></>, wrong: <>permission</>, right: <>a suggestion you may refuse</> },
    ],
    flow: [
      { depth: 0, text: "How hard are you pushing?" },
      { depth: 1, text: "gently → tu peux… / vous pouvez…" },
      { depth: 1, text: "firmly, as a general rule → il faut…" },
    ],
    check: [
      { q: <>Tell a friend, gently, to try it.</>,
        a: <><i lang="fr">Tu peux go&ucirc;ter.</i></> },
      { q: <>Why can <i lang="fr">il faut</i> sound firm without sounding rude?</>,
        a: <>It names no one. The obligation is in the world rather than on the person in front of you.</> },
    ],
    remember: (
      <>
        The verb carries the force. <i lang="fr">Tu peux</i> suggests,{" "}
        <i lang="fr">il faut</i> presses without naming anyone.
      </>
    ),
  },
  dice: {
    instruction: "Give the advice — mind how strong it is, and who it is for.",
    newQuestion() {
      // The card varies the REGISTER of the advice, not the verb paradigm.
      // Choosing between "one must" and "you could" is the skill SIO-048
      // names; conjugating modals side by side is not.
      const a = pick(ACTIONS);
      const mode = pick(["falloir", "pouvoir"] as const);

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

      const p = pick(PEOPLE);
      const form = POUVOIR[p.slot];
      const wrong = others(Object.values(POUVOIR).filter((v, i, s) => s.indexOf(v) === i), form, 3);
      const correct = `${p.disp} ${form} ${a.fr}.`;
      return {
        meta: `${p.disp.toLowerCase()} → une suggestion`,
        big: a.en,
        en: `could: ${a.en}`,
        correct,
        easyOptions: [correct, ...wrong.map((f) => `${p.disp} ${f} ${a.fr}.`)],
        med: { before: p.disp, choices: [form, ...wrong], correct: form, after: `${a.fr}.` },
      };
    },
  },
  bonus: [
    { en: "One must eat vegetables.", fr: "Il faut manger des légumes." },
    { en: "You can drink water.", fr: "Tu peux boire de l'eau." },
    { en: "You (formal) can book a table.", fr: "Vous pouvez réserver une table." },
    { en: "One must drink water.", fr: "Il faut boire de l'eau." },
    { en: "One must eat in the morning.", fr: "Il faut manger le matin." },
    { en: "One must buy bread.", fr: "Il faut acheter du pain." },
    { en: "You can taste it.", fr: "Tu peux goûter." },
    { en: "She can cook.", fr: "Elle peut cuisiner." },
    { en: "We can buy fruit here.", fr: "On peut acheter des fruits ici." },
  ],
};
