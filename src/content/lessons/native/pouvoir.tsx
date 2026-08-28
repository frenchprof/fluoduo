/**
 * Native "Pouvoir + infinitif" lesson (Unité 3, SIO-037).
 *
 * Why this file exists (2026-08-27). SIO-037's promise is « I can say what is
 * possible or allowed in a place and ask for permission », and until now the
 * stop served `modaux` — a three-verb paradigm table for vouloir/pouvoir/
 * devoir. So did SIO-048, whose promise is giving advice: two different goals
 * opening the same screen. The deck has said what it wanted all along
 * (`pouvoir.json` declares lessonSlug "pouvoir"); the lesson was never written.
 *
 * ONE verb, because the objective is one thing (Dan, 2026-08-27: "the original
 * intention … is to have the objectives broken down into bitesized
 * objectives"). vouloir belongs to SIO-029, devoir to SIO-048; neither appears
 * here. What varies instead is what the learner DOES with pouvoir — state a
 * possibility, ask permission, say something is not allowed — which is the
 * three-part shape of the SIO's own can-do.
 *
 * The vocabulary is the deck's, not invented: every action and place below is
 * drawn from pouvoir.json, so the Mémo and the drill teach the same French the
 * stop then tests.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je", q: true },
  { disp: "Tu", slot: "tu", q: false },
  { disp: "Il", slot: "il", q: false },
  { disp: "Elle", slot: "il", q: false },
  { disp: "On", slot: "il", q: true },
  { disp: "Nous", slot: "nous", q: false },
  { disp: "Vous", slot: "vous", q: true },
  { disp: "Ils", slot: "ils", q: false },
  { disp: "Elles", slot: "ils", q: false },
] as const;

const POUVOIR: Record<string, string> = {
  je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent",
};
const FORMS = ["peux", "peut", "pouvons", "pouvez", "peuvent"];

/** Straight from pouvoir.json — what one may do, and where. */
const ACTIONS = [
  { fr: "manger ici", en: "eat here" },
  { fr: "visiter le musée", en: "visit the museum" },
  { fr: "se garer là", en: "park there" },
  { fr: "acheter les billets ici", en: "buy the tickets here" },
  { fr: "se promener", en: "walk around" },
  // Third parties only: « Nous pouvons venir avec nous » is nonsense, and a
  // generator that pairs every subject with every action will produce it.
  { fr: "venir avec nous", en: "come with us", not: ["je", "nous"] },
  { fr: "attendre ici", en: "wait here" },
  { fr: "fumer ici", en: "smoke here" },
] as const;

const MEMO_ROWS = [
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
/** A reflexive infinitive changes its pronoun with the subject: on peut SE
 *  promener, but je peux ME promener. Kept honest rather than quietly wrong. */
const REFLEXIVE: Record<string, string> = { je: "me", tu: "te", il: "se", nous: "nous", vous: "vous", ils: "se" };
const infFor = (slot: string, fr: string) =>
  fr.startsWith("se ") ? `${REFLEXIVE[slot]} ${fr.slice(3)}` : fr;

export const pouvoirLesson: NativeLesson = {
  slug: "pouvoir",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        <em>Pouvoir</em> + infinitif — ce qui est possible
      </h2>
      <table className="w-full max-w-xs border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {MEMO_ROWS.map(([p, f]) => (
            <tr key={p} className="border-t border-[color:var(--cahier-rule)] first:border-t-0">
              <td className="p-1">{p}</td>
              <td className="p-1 font-bold text-[color:var(--gram-neutral)]">{f}</td>
              <td className="p-1 italic">+ infinitif</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-3 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Dire ce qui est possible — <i lang="fr">On <b>peut</b> visiter le musée.</i></li>
        <li>Demander la permission — <i lang="fr"><b>Je peux</b> manger ici ?</i></li>
        <li>Dire que c&rsquo;est interdit — <i lang="fr">On <b>ne peut pas</b> fumer ici.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The negation wraps <i>pouvoir</i></b>, never the infinitive:{" "}
        <span lang="fr">On <b>ne</b> peut <b>pas</b> fumer ici.</span> And the second verb always
        stays an infinitive — <span lang="fr"><i>je peux manger</i></span>, never{" "}
        <span lang="fr"><i>je peux mange</i></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Say what is possible, ask permission, or say it is not allowed.",
    newQuestion() {
      // One verb, three uses — the SIO's own three-part can-do, not three
      // different verbs. A permission question only makes sense from a subject
      // that could be asking, so `q` gates it rather than producing
      // « Ils peuvent attendre ici ? » as a request.
      const s = pick(SUBJECTS);
      const a = pick(ACTIONS.filter((x) => !("not" in x && (x.not as readonly string[]).includes(s.slot))));
      const form = POUVOIR[s.slot];
      const inf = infFor(s.slot, a.fr);
      const wrong = others(FORMS, form, 3);

      const mode = s.q && Math.random() < 0.4 ? "ask" : Math.random() < 0.25 ? "no" : "yes";

      if (mode === "ask") {
        const correct = `${s.disp} ${form} ${inf} ?`;
        return {
          meta: `${s.disp.toLowerCase()} → demander la permission`,
          big: `${a.en}?`,
          en: `ask permission: ${a.en}`,
          correct,
          alternates: [`Est-ce que ${s.disp.toLowerCase()} ${form} ${inf} ?`],
          easyOptions: [correct, ...wrong.map((f) => `${s.disp} ${f} ${inf} ?`)],
          med: { before: s.disp, choices: [form, ...wrong], correct: form, after: `${inf} ?` },
        };
      }

      if (mode === "no") {
        const correct = `${s.disp} ne ${form} pas ${inf}.`;
        return {
          meta: `${s.disp.toLowerCase()} → ce qui est interdit`,
          big: `🚫 ${a.en}`,
          en: `not allowed: ${a.en}`,
          correct,
          easyOptions: [
            correct,
            `${s.disp} ${form} pas ${inf}.`,
            `${s.disp} ne ${form} ${inf} pas.`,
            `${s.disp} ne pas ${form} ${inf}.`,
          ],
          // No padding spaces: the blank span carries mx-1.5, so a trailing
          // space here renders as a double gap around the answer.
          med: { before: `${s.disp} ne`, choices: [form, ...wrong], correct: form, after: `pas ${inf}.` },
        };
      }

      const correct = `${s.disp} ${form} ${inf}.`;
      return {
        meta: `${s.disp.toLowerCase()} → ce qui est possible`,
        big: a.en,
        en: `possible: ${a.en}`,
        correct,
        easyOptions: [correct, ...wrong.map((f) => `${s.disp} ${f} ${inf}.`)],
        med: { before: s.disp, choices: [form, ...wrong], correct: form, after: `${inf}.` },
      };
    },
  },
  bonus: [
    { en: "Can I eat here?", fr: "Je peux manger ici ?", alt: ["Est-ce que je peux manger ici ?"] },
    { en: "We can visit the museum.", fr: "On peut visiter le musée." },
    { en: "You can park there.", fr: "Tu peux te garer là." },
    { en: "You (formal) can buy the tickets here.", fr: "Vous pouvez acheter les billets ici." },
    { en: "We can walk around.", fr: "On peut se promener." },
    { en: "She can come with us.", fr: "Elle peut venir avec nous." },
    { en: "They can wait here.", fr: "Ils peuvent attendre ici." },
    { en: "You can't smoke here.", fr: "On ne peut pas fumer ici." },
  ],
};
