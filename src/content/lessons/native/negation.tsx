/**
 * Native "La négation" lesson (Unité 1) — distilled from 02-negation.html:
 * the ne…pas sandwich Mémo + the 🎲 dice trainer (affirmative → negative,
 * with generated near-miss options) + EN→FR bonus.
 */
import type { NativeLesson } from "./types";

/** Negative = s + join(ne, v) + " pas " + tail (tail already in negative form for il y a). */
const ITEMS = [
  { aff: "Je suis français.", en: "I am French. (m.)", s: "Je", ne: "ne", v: "suis", tail: "français." },
  { aff: "Je suis française.", en: "I am French. (f.)", s: "Je", ne: "ne", v: "suis", tail: "française." },
  { aff: "J'ai quinze ans.", en: "I am fifteen.", s: "Je", ne: "n'", v: "ai", tail: "quinze ans." },
  { aff: "J'ai seize ans.", en: "I am sixteen.", s: "Je", ne: "n'", v: "ai", tail: "seize ans." },
  { aff: "Je m'appelle Thomas.", en: "My name is Thomas.", s: "Je", ne: "ne", v: "m'appelle", tail: "Thomas." },
  { aff: "Je m'appelle Emma.", en: "My name is Emma.", s: "Je", ne: "ne", v: "m'appelle", tail: "Emma." },
  { aff: "Il y a un chat dans ma famille.", en: "There is a cat in my family.", s: "Il", ne: "n'", v: "y a", tail: "de chat dans ma famille." },
  { aff: "Tu es anglais.", en: "You are English. (m.)", s: "Tu", ne: "n'", v: "es", tail: "anglais." },
  { aff: "Tu es anglaise.", en: "You are English. (f.)", s: "Tu", ne: "n'", v: "es", tail: "anglaise." },
  { aff: "Elle a seize ans.", en: "She is sixteen.", s: "Elle", ne: "n'", v: "a", tail: "seize ans." },
  { aff: "Il s'appelle Hugo.", en: "His name is Hugo.", s: "Il", ne: "ne", v: "s'appelle", tail: "Hugo." },
  { aff: "Nous sommes français.", en: "We are French.", s: "Nous", ne: "ne", v: "sommes", tail: "français." },
  { aff: "Elle est chinoise.", en: "She is Chinese.", s: "Elle", ne: "n'", v: "est", tail: "chinoise." },
  { aff: "Il est japonais.", en: "He is Japanese.", s: "Il", ne: "n'", v: "est", tail: "japonais." },
  { aff: "Tu t'appelles Léa.", en: "Your name is Léa.", s: "Tu", ne: "ne", v: "t'appelles", tail: "Léa." },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const join = (ne: string, v: string) => (ne === "n'" ? `n'${v}` : `ne ${v}`);
/** Je + voyelle → J' (for the dropped-ne distractor). */
const merge = (s: string, v: string) => (s === "Je" && /^[aeiouéèêh]/i.test(v) ? `J'${v}` : `${s} ${v}`);

export const negationLesson: NativeLesson = {
  slug: "negation",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        La négation : <em>ne … pas</em> · <em>ne … plus</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">ne</b> + verbe + <b className="text-[color:var(--gram-neutral)]">pas</b> — <i lang="fr">Je <b>ne</b> suis <b>pas</b> français.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">n&rsquo;</b> + voyelle — <i lang="fr">Je <b>n&rsquo;</b>ai <b>pas</b> quinze ans.</i></li>
        <li>Verbe réfléchi : <i>ne</i> avant <i>me/te/se</i> — <i lang="fr">Je <b>ne</b> m&rsquo;appelle <b>pas</b> Marie.</i></li>
        <li><i lang="fr">Il y a</i> → <i lang="fr">Il <b>n&rsquo;</b>y a <b>pas</b></i> — <i lang="fr">Il n&rsquo;y a pas de chat.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">ne</b> + verbe + <b className="text-[color:var(--gram-neutral)]">plus</b> = not any more — <i lang="fr">Le stylo <b>n&rsquo;</b>est <b>plus</b> sur la table.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ After <i lang="fr">il n&rsquo;y a pas</i>, <b>un / une / des → de</b>:{" "}
        <span lang="fr">Il y a <u>un</u> chat → Il n&rsquo;y a pas <b>de</b> chat.</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 28. The Mémo lists five placements. What it never states is
  // the single principle underneath them: `ne` goes before EVERYTHING attached
  // to the verb, not before the verb.
  concept: {
    subtitle: "Where ne goes when the verb is not alone",
    contrast: (
      <>
        English negates with one word dropped in after the verb &mdash; <i>I am not</i>. French
        wraps the verb in two, <i lang="fr">ne</i> &hellip; <i lang="fr">pas</i>, and the
        difficulty is never <i lang="fr">pas</i>. It is knowing how far left{" "}
        <i lang="fr">ne</i> has to go.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je m&rsquo;appelle Marie.</i> Make it negative. Does{" "}
        <i lang="fr">ne</i> come before <i lang="fr">m&rsquo;</i> or after it?
      </>
    ),
    answer: (
      <>
        Before: <i lang="fr">Je <b>ne</b> m&rsquo;appelle <b>pas</b> Marie.</i>{" "}
        <i lang="fr">M&rsquo;appelle</i>{" "} is one unit &mdash; the little pronoun belongs to the
        verb, not to you &mdash; so <i lang="fr">ne</i> goes in front of the whole unit. Same
        with <i lang="fr">il y a</i>: <i lang="fr">il <b>n&rsquo;</b>y a <b>pas</b></i>, because{" "}
        <i lang="fr">y a</i> is the unit.
      </>
    ),
    pitfall: [
      { label: <><i lang="fr">je m&rsquo;appelle</i></>, wrong: <><i lang="fr">Je me ne appelle pas</i></>, right: <><i lang="fr">Je <b>ne</b> m&rsquo;appelle pas</i></> },
      { label: <><i lang="fr">il y a</i></>, wrong: <><i lang="fr">Il y ne a pas</i></>, right: <><i lang="fr">Il <b>n&rsquo;</b>y a pas</i></> },
    ],
    // Lines kept short enough to fit 390px without the box scrolling sideways.
    // "Find the verb and anything glued to it." measured 304px in a 296px box —
    // a decision rule the learner had to drag to finish reading.
    flow: [
      { depth: 0, text: "Find the verb —" },
      { depth: 1, text: "me · te · se · y are part of it" },
      { depth: 0, text: "ne goes before that whole unit" },
      { depth: 1, text: "n' before a vowel" },
      { depth: 0, text: "pas goes after the verb" },
    ],
    check: [
      { q: <>Negate <i lang="fr">Tu t&rsquo;appelles L&eacute;a.</i></>,
        a: <><i lang="fr">Tu <b>ne</b> t&rsquo;appelles <b>pas</b> L&eacute;a.</i></> },
      { q: <>Negate <i lang="fr">J&rsquo;ai quinze ans.</i></>,
        a: <><i lang="fr">Je <b>n&rsquo;</b>ai <b>pas</b> quinze ans.</i> Vowel, so <i lang="fr">n&rsquo;</i>.</> },
    ],
    remember: (
      <>
        <i lang="fr">Ne</i> does not go before the verb &mdash; it goes before the verb{" "}
        <b>and everything stuck to it</b>.
      </>
    ),
  },
  dice: {
    instruction: "Put the sentence in the negative.",
    newQuestion() {
      const it = pick(ITEMS);
      const correct = `${it.s} ${join(it.ne, it.v)} pas ${it.tail}`;
      const swapNe = `${it.s} ${join(it.ne === "n'" ? "ne" : "n'", it.v)} pas ${it.tail}`;
      const wrongs =
        it.v === "y a"
          ? [swapNe, correct.replace(" pas de ", " pas un "), `${it.s} y a pas ${it.tail}`]
          : [swapNe, `${merge(it.s, it.v)} pas ${it.tail}`, `${it.s} ${join(it.ne, it.v)} ${it.tail.slice(0, -1)} pas.`];
      return {
        meta: "Mettez à la forme négative",
        big: it.aff,
        en: it.en,
        correct,
        easyOptions: [correct, ...wrongs],
        med: { before: it.s, choices: ["ne", "n'"], correct: it.ne, after: `${it.v} pas ${it.tail}` },
      };
    },
  },
  bonus: [
    { en: "I am not French. (boy)", fr: "Je ne suis pas français." },
    { en: "I am not fifteen years old.", fr: "Je n'ai pas quinze ans." },
    { en: "My name is not Thomas.", fr: "Je ne m'appelle pas Thomas." },
    { en: "She is not English.", fr: "Elle n'est pas anglaise." },
    { en: "He is not Japanese.", fr: "Il n'est pas japonais." },
    { en: "You are not Spanish. (boy)", fr: "Tu n'es pas espagnol." },
    { en: "There is no cat in my family.", fr: "Il n'y a pas de chat dans ma famille." },
    { en: "We are not German.", fr: "Nous ne sommes pas allemands." },
    { en: "Her name is not Chloé.", fr: "Elle ne s'appelle pas Chloé." },
    { en: "He is not fourteen years old.", fr: "Il n'a pas quatorze ans." },
  ],
};
