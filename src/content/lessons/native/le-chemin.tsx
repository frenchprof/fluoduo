/**
 * « Quel est le chemin pour aller à la gare ? » — SIO-036's lesson.
 *
 * The deck gives directions well and never asks for them: « Quel est le chemin
 * pour … ? » is its title and appears on no card. This is the question half,
 * with the deck's own phrases shown only as the reply.
 *
 * Data and generator live in ./le-chemin.gen.ts so a check can execute them.
 */
import type { NativeLesson } from "./types";
import { CHEMIN_AXES, REPLIES, cheminQuestion } from "./le-chemin.gen";

export const leCheminLesson: NativeLesson = {
  slug: "le-chemin",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Demander son chemin
      </h2>

      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">demander</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Quel est le chemin pour aller <b>à la</b> gare&nbsp;?
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Comment on va <b>au</b> musée&nbsp;?
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Pardon, je cherche la poste.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">répondre</p>
          <p lang="fr" className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
            {REPLIES.join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">à + article</p>
        <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
          <tbody>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">à + <b>le</b> musée</td>
              <td className="p-1 font-black">→ <b>au</b> musée</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">à + <b>les</b> toilettes</td>
              <td className="p-1 font-black">→ <b>aux</b> toilettes</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">à + <b>la</b> gare</td>
              <td className="p-1">→ à la gare</td>
            </tr>
            <tr>
              <td className="p-1">à + <b>l&rsquo;</b>hôpital</td>
              <td className="p-1">→ à l&rsquo;hôpital</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          Same rule as <b lang="fr">de</b> next door: only <b lang="fr">le</b> and{" "}
          <b lang="fr">les</b> change. Never <span lang="fr"><s>à le musée</s></span>.
        </p>
      </div>
    </div>
  ),
  // TIER 3 · stop 36. TRANSPARENT, and the same fusion the partitives concept
  // teaches: only `le` and `les` merge with the preposition. Deliberately echoes
  // stop 42 so the learner meets one rule twice, not two rules once.
  concept: {
    subtitle: "Why au but à la",
    contrast: (
      <>
        English uses one word for all of them &mdash; <i>to the station</i>,{" "}
        <i>to the museum</i>. French keeps <i lang="fr">à</i> and the article separate, then
        merges with two of the four: <i lang="fr">à</i> + <i lang="fr">le</i> ={" "}
        <i lang="fr">au</i>, <i lang="fr">à</i> + <i lang="fr">les</i> ={" "}
        <i lang="fr">aux</i>.
      </>
    ),
    question: (
      <>
        <i lang="fr">Au mus&eacute;e</i> is one word and{" "}
        <i lang="fr">&agrave; la gare</i> is two. Why the difference?
      </>
    ),
    answer: (
      <>
        Only <i lang="fr">le</i> and <i lang="fr">les</i> fuse with{" "}
        <i lang="fr">&agrave;</i>. <i lang="fr">La</i> and <i lang="fr">l&rsquo;</i> never do,
        so they simply stand there. It is the same rule you already met with{" "}
        <i lang="fr">de</i>: <i lang="fr">du pain</i> but <i lang="fr">de la viande</i>.
      </>
    ),
    pitfallHeads: ["written out", "what French says"],
    pitfall: [
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">le</i> mus&eacute;e</>, wrong: <><i lang="fr">&agrave; le mus&eacute;e</i></>, right: <><i lang="fr">au mus&eacute;e</i></> },
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">les</i> toilettes</>, wrong: <><i lang="fr">&agrave; les toilettes</i></>, right: <><i lang="fr">aux toilettes</i></> },
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">la</i> gare</>, wrong: <>&mdash;</>, right: <><i lang="fr">&agrave; la gare</i>, no fusion</> },
    ],
    check: [
      { q: <>You are looking for the hospital &mdash; <i lang="fr">l&rsquo;h&ocirc;pital</i>.</>,
        a: <><i lang="fr">&agrave; l&rsquo;h&ocirc;pital</i> &mdash; <i lang="fr">l&rsquo;</i> does not fuse.</> },
      { q: <>Where have you met this fusion before?</>,
        a: <>With <i lang="fr">de</i>: <i lang="fr">du</i> and <i lang="fr">des</i> are the same two merged forms.</> },
    ],
    remember: (
      <>
        <i lang="fr">Le</i> and <i lang="fr">les</i> merge; <i lang="fr">la</i> and{" "}
        <i lang="fr">l&rsquo;</i> never do. One rule, and it works for{" "}
        <i lang="fr">&agrave;</i> and <i lang="fr">de</i> alike.
      </>
    ),
  },
  dice: {
    instruction: "Ask the way — and mind the à.",
    axes: CHEMIN_AXES,
    newQuestion: cheminQuestion,
  },
  bonus: [
    { en: "What is the way to the station?", fr: "Quel est le chemin pour aller à la gare ?" },
    { en: "How do you get to the museum?", fr: "Comment on va au musée ?" },
    { en: "Excuse me, I'm looking for the post office.", fr: "Pardon, je cherche la poste." },
    { en: "How do you get to the toilets?", fr: "Comment on va aux toilettes ?" },
    { en: "You go straight on.", fr: "Vous allez tout droit." },
    { en: "You turn left.", fr: "Vous tournez à gauche." },
    { en: "You take the second street on the right.", fr: "Vous prenez la deuxième rue à droite." },
    { en: "Is it far?", fr: "C'est loin ?" },
  ],
};
