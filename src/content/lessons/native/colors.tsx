/**
 * Native "Les couleurs" lesson — SIO-005, written 2026-08-31.
 *
 * WHY THIS FILE EXISTS. Colours was one of two Tier 2 stops with a deck and no
 * lesson file, so there was physically nowhere to put a concept. Dan, shown
 * both stops on 31 Aug: "Stop 6: then just show it — OK", and for this one he
 * specified the ladder outright:
 *
 *     ★    just the colour word
 *     ★★   the colour word and the noun
 *     ★★★  writing both out
 *
 * WHAT THE CONCEPT IS, AND WHY IT IS NOT AGREEMENT. The obvious Tier 2 concept
 * for colours is agreement — vert / verte, blanc / blanche. **The deck cannot
 * teach it.** All twelve of its mnemonics are masculine (« le feu rouge », « le
 * café noir »), so a lesson about agreement would have to invent the feminine
 * forms, and inventing French that a learner reads as a model is the thing the
 * 31 Aug rule forbids.
 *
 * What the deck DOES prove, twelve times over, is POSITION: the colour follows
 * the noun, where English puts it first. Every single mnemonic is an instance,
 * and the English glosses beside them are the contrast, already written. So the
 * concept is word order, and agreement is a follow-up that needs new content
 * from Dan before it can be taught.
 *
 * Every French string below is the deck's own `example` field, verbatim. The
 * only French this file composes is the deliberately WRONG option in the MCQ
 * and the pitfall table (« le rouge feu »), which is the error the concept is
 * about — a distractor is meant to be wrong, and it is never shown as a model.
 */
import type { NativeLesson } from "./types";
import { medFrom, sentence, type Slot } from "./cloze";

/**
 * The twelve mnemonics, split into the parts the ladder withdraws.
 *
 * `art` + `noun` + `color` reassembles to the deck's `example` exactly —
 * verify66 asserts that against colors.json rather than trusting this table,
 * because a typo here would teach a wrong phrase and look fine in review.
 */
const MNEMONICS = [
  { art: "le", noun: "feu",       color: "rouge",  en: "a red traffic light" },
  { art: "le", noun: "fluo",      color: "orange", en: "an orange highlighter" },
  { art: "le", noun: "citron",    color: "jaune",  en: "a yellow lemon" },
  { art: "le", noun: "concombre", color: "vert",   en: "a green cucumber" },
  { art: "le", noun: "ciel",      color: "bleu",   en: "a blue sky" },
  { art: "le", noun: "raisin",    color: "violet", en: "a purple grape" },
  { art: "le", noun: "chocolat",  color: "marron", en: "brown chocolate" },
  { art: "le", noun: "lait",      color: "blanc",  en: "white milk" },
  { art: "le", noun: "café",      color: "noir",   en: "black coffee" },
  { art: "le", noun: "nuage",     color: "gris",   en: "a grey cloud" },
  { art: "le", noun: "flamant",   color: "rose",   en: "a pink flamingo" },
  { art: "le", noun: "sable",     color: "beige",  en: "beige sand" },
] as const;

const COLORS = MNEMONICS.map((m) => m.color);
const NOUNS = MNEMONICS.map((m) => m.noun);

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/** Three wrong options that are not each other and not the answer. */
function others<T>(pool: readonly T[], not: T, n: number): T[] {
  const rest = pool.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export const colorsLesson: NativeLesson = {
  slug: "colors",

  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Knowing all
  // twelve colour words leaves the ORDER unknown, and the order is the one
  // thing every mnemonic on the list silently demonstrates.
  concept: {
    subtitle: "Why the colour comes after the thing it colours",
    contrast: (
      <>
        English puts the colour first — <i>a <b>red</b> traffic light</i>, <i>a{" "}
        <b>pink</b> flamingo</i>. French puts it second, always:{" "}
        <i lang="fr">le feu <b>rouge</b></i>, <i lang="fr">le flamant <b>rose</b></i>.
        The two languages run the phrase in opposite directions, and every colour on
        this list behaves the same way.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">le feu rouge</i>, and never <i lang="fr">le rouge feu</i>?
      </>
    ),
    answer: (
      <>
        Because a colour in French <b>describes something that has already been
        named</b>. You say the thing, then you say what colour it is — so{" "}
        <i lang="fr">le café</i> comes first and <i lang="fr">noir</i> follows it:{" "}
        <i lang="fr">le café noir</i>. Reading it as English word order is what
        produces <i lang="fr">le noir café</i>, which no French speaker says.
      </>
    ),
    pitfallHeads: ["English order", "French order"],
    pitfall: [
      { label: <>a red traffic light</>, wrong: <i lang="fr">le rouge feu</i>, right: <i lang="fr">le feu rouge</i> },
      { label: <>black coffee</>, wrong: <i lang="fr">le noir café</i>, right: <i lang="fr">le café noir</i> },
      { label: <>a pink flamingo</>, wrong: <i lang="fr">le rose flamant</i>, right: <i lang="fr">le flamant rose</i> },
    ],
    flow: [
      { depth: 0, text: "Name the thing first" },
      { depth: 1, text: "le café …" },
      { depth: 0, text: "Then add the colour" },
      { depth: 1, text: "le café noir" },
    ],
    check: [
      {
        q: <>How do you say <i>a green cucumber</i>?</>,
        a: <><i lang="fr">le concombre vert</i> — the cucumber, then its colour.</>,
      },
      {
        q: <>On its own, what does <i lang="fr">le rouge</i> mean?</>,
        a: (
          <>
            The colour red itself. With <i lang="fr">le</i> in front and no noun after it,
            a colour is a thing you can name — <i lang="fr">le bleu</i>, <i lang="fr">le
            vert</i>. That is how the word list gives them to you.
          </>
        ),
      },
    ],
    inShort: (
      <>
        <i lang="fr">le</i> + thing + colour — <i lang="fr">le nuage gris</i>
      </>
    ),
    remember: <>The thing, then its colour. Never the other way round.</>,
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les couleurs — <em>le feu rouge, le café noir</em>
      </h2>
      <p className="mb-2 text-[15px] text-[color:var(--cahier-ink)]">
        Twelve colours, each with a thing that is always that colour. Say the thing,
        then the colour.
      </p>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-[15px] text-[color:var(--cahier-ink)] sm:grid-cols-2">
        {MNEMONICS.map((m) => (
          <li key={m.color}>
            <span lang="fr">
              {m.art} {m.noun} <b>{m.color}</b>
            </span>
            <span className="text-[color:var(--fluo-ink-soft)]"> — {m.en}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ The colour goes <b>after</b> the noun: <span lang="fr"><b>le citron jaune</b></span>,
        not <span lang="fr">le jaune citron</span>. On its own,{" "}
        <span lang="fr"><i>le jaune</i></span> means the colour yellow.
      </p>
    </div>
  ),

  dice: {
    instruction: "Name the thing, then its colour.",
    newQuestion() {
      const m = pick(MNEMONICS);

      // Reading order: le · NOUN · COLOUR. `first` puts ★ on the colour, which
      // is Dan's ladder — without it ★ would blank the leftmost gap (the noun)
      // and ask the wrong question entirely.
      const slots: Slot[] = [
        { text: m.art },
        { key: "noun", text: m.noun, choices: [m.noun, ...others(NOUNS, m.noun, 3)] },
        { key: "color", text: m.color, choices: [m.color, ...others(COLORS, m.color, 3)], first: true },
      ];

      const correct = sentence(slots);

      // The one composed string in this file, and it is the ERROR the concept
      // is about: English word order applied to French.
      //
      // SUPPRESSED WHEN IT WOULD ALSO BREAK ELISION, which is only « orange »
      // among the twelve. Found by opening the card: the option read « le
      // orange fluo », wrong twice over, and a learner rejects it on the
      // elision without ever having to think about the word order — which is
      // the single thing the card exists to test. A distractor must be wrong
      // in exactly ONE way, or it stops measuring what it claims to.
      const swapped = /^[aeiouéèêîôû]/i.test(m.color) ? null : `${m.art} ${m.color} ${m.noun}`;
      const decoys = others(MNEMONICS, m, swapped ? 2 : 3)
        .map((o) => `${o.art} ${o.noun} ${o.color}`);

      return {
        // No colour word here — `big` is English, and the meta names the task,
        // not the answer. metaLeaksAnswer would fire on either at ★★.
        meta: "thing + colour",
        big: m.en,
        correct,
        easyOptions: swapped ? [correct, swapped, ...decoys] : [correct, ...decoys],
        slots,
        med: medFrom(slots, "color"),
      };
    },
  },

  bonus: [
    { en: "a red traffic light", fr: "le feu rouge" },
    { en: "a yellow lemon", fr: "le citron jaune" },
    { en: "a green cucumber", fr: "le concombre vert" },
    { en: "a blue sky", fr: "le ciel bleu" },
    { en: "a purple grape", fr: "le raisin violet" },
    { en: "white milk", fr: "le lait blanc" },
    { en: "black coffee", fr: "le café noir" },
    { en: "a grey cloud", fr: "le nuage gris" },
    { en: "a pink flamingo", fr: "le flamant rose" },
    { en: "beige sand", fr: "le sable beige" },
  ],
};
