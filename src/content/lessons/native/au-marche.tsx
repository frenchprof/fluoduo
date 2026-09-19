/**
 * « Je voudrais un kilo de tomates. » — SIO-044's lesson.
 *
 * The deck is fourteen shop names sorted by article; the can-do names four
 * acts, none of which a name teaches. This is the exchange, from both sides of
 * the stall, because the can-do says "on either side".
 *
 * Data and generator live in ./au-marche.gen.ts so a check can execute them.
 */
import type { NativeLesson } from "./types";
import { MARCHE_AXES, marcheQuestion } from "./au-marche.gen";

export const auMarcheLesson: NativeLesson = {
  slug: "au-marche",
  formLayout: "list",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Lifted from the
  // Mémo below; no grammar introduced that it does not teach. DRAFTED —
  // `contrast` and `remember` are the pedagogical claim and go to Dan first.
  concept: {
    subtitle: "Why a quantity is followed by bare « de »",
    contrast: (
      <>
        English says <i>a kilo <b>of</b> tomatoes</i> and keeps the same little word
        everywhere. French drops the article entirely after a quantity:{" "}
        <i lang="fr">un kilo de tomates</i>, never{" "}
        <i lang="fr">un kilo des tomates</i>.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">un kilo de tomates</i> and not{" "}
        <i lang="fr">un kilo des tomates</i>?
      </>
    ),
    answer: (
      <>
        Because the quantity has already done the counting. Once{" "}
        <i lang="fr">un kilo</i> or <i lang="fr">une douzaine</i> has said how much,
        the noun needs no article of its own — only <i lang="fr">de</i> to join them.
      </>
    ),
    pitfall: [
      { label: <>a quantity</>, wrong: <i lang="fr">un kilo des tomates</i>, right: <i lang="fr">un kilo de tomates</i> },
      { label: <>before a vowel</>, wrong: <i lang="fr">une douzaine de œufs</i>, right: <i lang="fr">une douzaine d&rsquo;œufs</i> },
      { label: <>asking politely</>, wrong: <i lang="fr">je veux un kilo</i>, right: <i lang="fr">je voudrais un kilo</i> },
    ],
    check: [
      {
        q: <>Why <i lang="fr">je voudrais</i> rather than <i lang="fr">je veux</i>?</>,
        a: (
          <>
            <i lang="fr">Je veux</i> is blunt — what a child says. The conditional{" "}
            <i lang="fr">je voudrais</i> is the request form an adult uses.
          </>
        ),
      },
      {
        q: <>How would you ask for half a kilo of strawberries?</>,
        a: <><i lang="fr">Je voudrais un demi-kilo de fraises</i> — bare <i lang="fr">de</i> again.</>,
      },
    ],
    inShort: (
      <>
        quantity + <i lang="fr">de</i> + noun, no article ·{" "}
        <i lang="fr">je voudrais</i> to ask
      </>
    ),
    remember: <>After a quantity, <i lang="fr">de</i> stands alone.</>,
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Au marché — les deux côtés
      </h2>

      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">le client</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Je voudrais <b>un kilo de</b> tomates.
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Ça fait combien&nbsp;?
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">le vendeur</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Ça fait quatre euros soixante-quinze.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
          <b lang="fr">Je voudrais</b>, not <b lang="fr">je veux</b>.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          <span lang="fr">Je veux</span> is what a child says. The polite form is
          the request.
        </p>
        <p className="mt-2 text-[14px] font-bold text-[color:var(--cahier-ink)]">
          A quantity takes bare <b lang="fr">de</b>.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          <b lang="fr">un kilo de tomates</b> · <b lang="fr">une douzaine d&rsquo;œufs</b> — never{" "}
          <span lang="fr"><s>un kilo des tomates</s></span>.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Play both sides of the stall.",
    axes: MARCHE_AXES,
    newQuestion: marcheQuestion,
  },
  bonus: [
    { en: "I'd like a kilo of tomatoes.", fr: "Je voudrais un kilo de tomates." },
    { en: "I'd like a dozen eggs.", fr: "Je voudrais une douzaine d'œufs." },
    { en: "How much is that?", fr: "Ça fait combien ?" },
    { en: "That's four euros seventy-five.", fr: "Ça fait quatre euros soixante-quinze." },
    { en: "That's five euros eighty.", fr: "Ça fait cinq euros quatre-vingts." },
    { en: "Anything else?", fr: "Et avec ça ?" },
    { en: "That's all, thank you.", fr: "C'est tout, merci." },
    { en: "I'd like a punnet of strawberries.", fr: "Je voudrais une barquette de fraises." },
  ],
};
