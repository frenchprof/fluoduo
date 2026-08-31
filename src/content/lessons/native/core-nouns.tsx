/**
 * Native "Quelques noms" lesson — SIO-006, written 2026-08-31.
 *
 * DAN, 31 AUG: "Stop 6: then just show it — OK."
 *
 * THIS STOP IS A GENDER LESSON WEARING A VOCABULARY LIST, and its own SIO
 * description says so out loud: *"18 nouns whose meaning is already clear in
 * English, so the new thing to learn is the gender."* That makes it the
 * strongest Tier 2 concept case in Unit 0 — the words cost a learner nothing,
 * and the entire content of the stop is the article in front of them.
 *
 * THE PITFALL COLUMNS ARE NOT ENGLISH-VS-FRENCH HERE, and `types.ts` predicted
 * exactly this case: "a Tier 2 concept about hidden gender contrasts what the
 * ARTICLE suggests with what is true, and nothing about it is English."
 * English has no gender to be wrong about. What misleads is the WORD ITSELF —
 * its ending, and its meaning — so the columns are headed for that instead.
 *
 * Everything below is the deck's own material: the 18 nouns, their `col:m` /
 * `col:f` tags, their `gap` articles and their `q:` question frames. The
 * counterexample the concept turns on (« un groupe » ends in -e and is
 * masculine) is the deck's, not one I went looking for elsewhere.
 */
import type { NativeLesson } from "./types";
import { medFrom, sentence, type Slot } from "./cloze";

type Q = "qui" | "ou" | "quoi";

/** The eighteen, exactly as core-nouns.json tags them. verify66 holds this
 *  table to the deck rather than trusting it — a flipped gender here would
 *  teach the wrong article and read as perfectly ordinary code. */
const NOUNS: { fr: string; en: string; g: "m" | "f"; art: string; q: Q; enFull: string }[] = [
  { fr: "homme",       en: "man",           g: "m", art: "un",  q: "qui", enFull: "It's a man." },
  { fr: "femme",       en: "woman",         g: "f", art: "une", q: "qui", enFull: "It's a woman." },
  { fr: "étudiant",    en: "student (m)",   g: "m", art: "un",  q: "qui", enFull: "It's a student. (m.)" },
  { fr: "étudiante",   en: "student (f)",   g: "f", art: "une", q: "qui", enFull: "It's a student. (f.)" },
  { fr: "groupe",      en: "group",         g: "m", art: "un",  q: "qui", enFull: "It's a group." },
  { fr: "classe",      en: "classroom",     g: "f", art: "une", q: "ou", enFull: "It's a classroom." },
  { fr: "café",        en: "café",          g: "m", art: "un",  q: "ou", enFull: "It's a café." },
  { fr: "région",      en: "region",        g: "f", art: "une", q: "ou", enFull: "It's a region." },
  { fr: "province",    en: "province",      g: "f", art: "une", q: "ou", enFull: "It's a province." },
  { fr: "sport",       en: "sport",         g: "m", art: "un",  q: "quoi", enFull: "It's a sport." },
  { fr: "football",    en: "football",      g: "m", art: "le",  q: "quoi", enFull: "It's football." },
  { fr: "activité",    en: "activity",      g: "f", art: "une", q: "quoi", enFull: "It's an activity." },
  { fr: "danse",       en: "dance",         g: "f", art: "la",  q: "quoi", enFull: "It's dance." },
  { fr: "croissant",   en: "croissant",     g: "m", art: "un",  q: "quoi", enFull: "It's a croissant." },
  { fr: "macaron",     en: "macaron",       g: "m", art: "un",  q: "quoi", enFull: "It's a macaron." },
  { fr: "champagne",   en: "champagne",     g: "m", art: "le",  q: "quoi", enFull: "It's champagne." },
  { fr: "consonne",    en: "consonant",     g: "f", art: "une", q: "quoi", enFull: "It's a consonant." },
  { fr: "nationalité", en: "nationality",   g: "f", art: "une", q: "quoi", enFull: "It's a nationality." },
];

const ASK: Record<Q, string> = { qui: "C'est qui ?", ou: "C'est où ?", quoi: "C'est quoi ?" };

/** The two articles a card offers. Never mixes the un/une series with le/la —
 *  the card is about gender, and a four-way choice would smuggle in a second
 *  question (which series?) that this stop does not teach. */
const PAIR: Record<string, [string, string]> = {
  un: ["un", "une"], une: ["un", "une"],
  le: ["le", "la"],  la: ["le", "la"],
};

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function others<T>(pool: readonly T[], not: T, n: number): T[] {
  const rest = pool.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export const coreNounsLesson: NativeLesson = {
  slug: "core-nouns",

  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. The list shows
  // eighteen articles; it cannot say why they are not predictable, which is
  // the only thing a learner actually needs to be told here.
  concept: {
    subtitle: "Why the article has to be learned with the word",
    contrast: (
      <>
        In English a noun is just a noun — <i>a group</i>, <i>a classroom</i>, and nothing
        else to remember. In French every noun is already masculine or feminine before you
        say anything about it, and <b>you cannot hear it, see it, or work it out from the
        meaning</b>. <i lang="fr">Un groupe</i> and <i lang="fr">une classe</i> both name a
        set of people and take different articles.
      </>
    ),
    question: (
      <>
        If <i lang="fr">groupe</i> ends in <b>-e</b>, why is it <i lang="fr">un groupe</i>{" "}
        and not <i lang="fr">une groupe</i>?
      </>
    ),
    answer: (
      <>
        Because the ending is a hint, not a rule — and <i lang="fr">groupe</i> is the word on
        this list that breaks it. Gender is a fact stored <b>with</b> the noun, the way its
        spelling is. So the thing to memorise is never <i lang="fr">café</i>; it is{" "}
        <i lang="fr">un café</i>. One ending on this list is reliable:{" "}
        <b>-ité is always feminine</b> — <i lang="fr">une activité</i>,{" "}
        <i lang="fr">une nationalité</i>.
      </>
    ),
    pitfallHeads: ["What the word suggests", "What it actually is"],
    pitfall: [
      {
        label: <><i lang="fr">groupe</i> ends in <b>-e</b></>,
        wrong: <i lang="fr">une groupe</i>,
        right: <i lang="fr">un groupe</i>,
      },
      {
        label: <>a sport <i>is</i> an activity</>,
        wrong: <i lang="fr">une sport</i>,
        right: <i lang="fr">un sport</i>,
      },
      {
        label: <><i lang="fr">café</i> and <i lang="fr">activité</i> both end in <b>-é</b></>,
        wrong: <i lang="fr">une café</i>,
        right: <i lang="fr">un café</i>,
      },
    ],
    flow: [
      { depth: 0, text: "Does it end in -ité ?" },
      { depth: 1, text: "yes → une (activité, nationalité)" },
      { depth: 1, text: "no  → the word will not tell you" },
      { depth: 0, text: "So learn it with its article" },
      { depth: 1, text: "un café · une classe · un groupe" },
    ],
    check: [
      {
        q: <><i lang="fr">Groupe</i> and <i lang="fr">classe</i> both name a set of people. Same article?</>,
        a: (
          <>
            No — <i lang="fr">un groupe</i>, <i lang="fr">une classe</i>. Meaning does not
            decide gender, which is the whole reason this has to be memorised.
          </>
        ),
      },
      {
        q: <>You meet a new noun ending in <b>-ité</b>. Which article?</>,
        a: <><i lang="fr">une</i> — it is the one ending on this list you can trust.</>,
      },
    ],
    inShort: (
      <>
        Learn <i lang="fr">un café</i>, never <i lang="fr">café</i>
      </>
    ),
    remember: (
      <>
        The article is part of the word. Store them together, or you have stored neither.
      </>
    ),
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Quelques noms — <em>c&rsquo;est qui ? c&rsquo;est où ? c&rsquo;est quoi ?</em>
      </h2>
      <p className="mb-2 text-[15px] text-[color:var(--cahier-ink)]">
        You already know what these eighteen words mean. The new thing is the article.
      </p>
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <div>
          <p className="fluo-label mb-1 text-[color:var(--gram-masc)]">masculin</p>
          <ul className="space-y-0.5 text-[15px] text-[color:var(--cahier-ink)]">
            {NOUNS.filter((n) => n.g === "m").map((n) => (
              <li key={n.fr}>
                <span lang="fr"><b className="text-[color:var(--gram-masc)]">{n.art}</b> {n.fr}</span>
                <span className="text-[color:var(--fluo-ink-soft)]"> — {n.en}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 sm:mt-0">
          <p className="fluo-label mb-1 text-[color:var(--gram-fem)]">féminin</p>
          <ul className="space-y-0.5 text-[15px] text-[color:var(--cahier-ink)]">
            {NOUNS.filter((n) => n.g === "f").map((n) => (
              <li key={n.fr}>
                <span lang="fr"><b className="text-[color:var(--gram-fem)]">{n.art}</b> {n.fr}</span>
                <span className="text-[color:var(--fluo-ink-soft)]"> — {n.en}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr"><b>un</b> groupe</span> ends in <b>-e</b> and is still masculine.
        The ending is a hint, not a rule — only <b>-ité</b> is reliable:{" "}
        <span lang="fr"><b>une</b> activité</span>, <span lang="fr"><b>une</b> nationalité</span>.
      </p>
    </div>
  ),

  dice: {
    instruction: "Answer the question with the right article.",
    newQuestion() {
      const n = pick(NOUNS);
      const [a1, a2] = PAIR[n.art];

      // Reading order: C'est · ARTICLE · NOUN. The article is already the
      // leftmost blankable slot, so ★ withdraws it with no `first` flag needed
      // — which is Dan's vocabulary ladder: ★ the article, ★★ article + noun.
      const slots: Slot[] = [
        { text: "C'est" },
        { key: "article", text: n.art, choices: [a1, a2] },
        {
          key: "noun",
          text: `${n.fr}.`,
          choices: [`${n.fr}.`, ...others(NOUNS.filter((o) => o.art === n.art), n, 3).map((o) => `${o.fr}.`)],
        },
      ];

      const correct = sentence(slots);
      const wrongArt = n.art === a1 ? a2 : a1;
      const decoys = others(NOUNS, n, 2).map((o) => `C'est ${o.art} ${o.fr}.`);

      return {
        // The deck's own question frame. It names neither the article nor the
        // noun, so it stays honest at ★★ where both are blanked.
        meta: ASK[n.q],
        big: n.enFull,
        correct,
        easyOptions: [correct, `C'est ${wrongArt} ${n.fr}.`, ...decoys],
        slots,
        med: medFrom(slots, "article"),
      };
    },
  },

  bonus: [
    { en: "It's a man.", fr: "C'est un homme." },
    { en: "It's a woman.", fr: "C'est une femme." },
    { en: "It's a group.", fr: "C'est un groupe." },
    { en: "It's a classroom.", fr: "C'est une classe." },
    { en: "It's a café.", fr: "C'est un café." },
    { en: "It's a region.", fr: "C'est une région." },
    { en: "It's a sport.", fr: "C'est un sport." },
    { en: "It's an activity.", fr: "C'est une activité." },
    { en: "It's a croissant.", fr: "C'est un croissant." },
    { en: "It's a nationality.", fr: "C'est une nationalité." },
  ],
};
