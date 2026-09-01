/**
 * « Où est la banque ? » — SIO-035's lesson (written 2026-08-29).
 *
 * The deck sorts sixteen prepositions into the three groups that matter and
 * its letris columns teach which take `de`. What it never did was put two
 * places in one sentence, which is the stop's promise. Dan: "34's lesson must
 * talk about them — content to be expanded".
 *
 * Data and generator live in ./ou-est.gen.ts so a check can execute them.
 */
import type { NativeLesson } from "./types";
import { AVEC_DE, OU_EST_AXES, SANS_DE, TOUT_SEUL, ouEstQuestion } from "./ou-est.gen";

const Row = ({ label, words, tint }: { label: string; words: readonly string[]; tint?: boolean }) => (
  <div
    className="rounded-xl border-2 p-2.5"
    style={{
      borderColor: tint ? "var(--gram-neutral)" : "var(--cahier-rule)",
      background: tint ? "color-mix(in srgb, var(--cahier-hl) 25%, transparent)" : "#fff",
    }}
  >
    <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">{label}</p>
    <p lang="fr" className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
      {words.join(" · ")}
    </p>
  </div>
);

export const ouEstLesson: NativeLesson = {
  slug: "ou-est",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Où est&nbsp;? — deux lieux, une phrase
      </h2>

      <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
        La banque est <b>à côté de la</b> poste.
      </p>
      <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
        The bank is next to the post office.
      </p>

      <div className="mt-3 space-y-2">
        <Row label="+ de + lieu" words={AVEC_DE} tint />
        <Row label="+ lieu (sans de)" words={SANS_DE} />
        <Row label="tout seuls — pas de lieu" words={TOUT_SEUL} />
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">de + article</p>
        <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
          <tbody>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">de + <b>le</b> parc</td>
              <td className="p-1 font-black">→ <b>du</b> parc</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">de + <b>les</b> toilettes</td>
              <td className="p-1 font-black">→ <b>des</b> toilettes</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">de + <b>la</b> poste</td>
              <td className="p-1">→ de la poste</td>
            </tr>
            <tr>
              <td className="p-1">de + <b>l&rsquo;</b>hôtel</td>
              <td className="p-1">→ de l&rsquo;hôtel</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          Only <b lang="fr">le</b> and <b lang="fr">les</b> change. Never{" "}
          <span lang="fr"><s>de le parc</s></span>.
        </p>
      </div>
    </div>
  ),
  // TIER 1 · stop 35. Deliberately the mirror of stop 26: the same two articles
  // fuse, with `de` instead of `à`. A learner who has met du in the partitives
  // meets it here as a PLACE word and should recognise it, not relearn it.
  concept: {
    subtitle: "Why du turns up again, far from any food",
    contrast: (
      <>
        You have already met <i lang="fr">du</i> and <i lang="fr">des</i>{" "} in front of food.
        Here they are in front of buildings &mdash; <i lang="fr">&agrave; c&ocirc;t&eacute; du
        parc</i>. Same two words, because it is the same fusion:{" "}
        <i lang="fr">de</i> + <i lang="fr">le</i>, <i lang="fr">de</i> +{" "}
        <i lang="fr">les</i>.
      </>
    ),
    question: (
      <>
        <i lang="fr">&Agrave; c&ocirc;t&eacute; de la poste</i> but{" "}
        <i lang="fr">&agrave; c&ocirc;t&eacute; du parc</i>. Why not{" "}
        <i lang="fr">de le parc</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">de</i> + <i lang="fr">le</i> is always{" "}
        <i lang="fr">du</i> &mdash; in a bakery or on a map. Only{" "}
        <i lang="fr">le</i> and <i lang="fr">les</i> change;{" "}
        <i lang="fr">la</i> and <i lang="fr">l&rsquo;</i> stay as they are.
      </>
    ),
    pitfallHeads: ["written out", "what French says"],
    pitfall: [
      { label: <><i lang="fr">de</i> + <i lang="fr">le</i> parc</>, wrong: <><i lang="fr">de le parc</i></>, right: <><i lang="fr">du parc</i></> },
      { label: <><i lang="fr">de</i> + <i lang="fr">les</i> toilettes</>, wrong: <><i lang="fr">de les toilettes</i></>, right: <><i lang="fr">des toilettes</i></> },
      { label: <><i lang="fr">de</i> + <i lang="fr">l&rsquo;</i> h&ocirc;tel</>, wrong: <><i lang="fr">du h&ocirc;tel</i></>, right: <><i lang="fr">de l&rsquo;h&ocirc;tel</i></> },
    ],
    check: [
      { q: <>The bank is next to the post office.</>,
        a: <><i lang="fr">La banque est &agrave; c&ocirc;t&eacute; de la poste.</i></> },
      { q: <>Where else have you seen <i lang="fr">du</i> and <i lang="fr">des</i>?</>,
        a: <>After <i lang="fr">faire</i> and in front of food. One fusion, three lessons.</> },
    ],
    remember: (
      <>
        <i lang="fr">Du</i> and <i lang="fr">des</i> are never about food. They are{" "}
        <i lang="fr">de</i> plus an article, wherever they appear.
      </>
    ),
  },
  dice: {
    instruction: "Say where it is — and mind the de.",
    axes: OU_EST_AXES,
    newQuestion: ouEstQuestion,
  },
  bonus: [
    { en: "The bank is next to the post office.", fr: "La banque est à côté de la poste." },
    { en: "The café is opposite the hotel.", fr: "Le café est en face de l'hôtel." },
    { en: "The station is far from the park.", fr: "La gare est loin du parc." },
    { en: "The chemist is near the school.", fr: "La pharmacie est près de l'école." },
    { en: "The museum is behind the cinema.", fr: "Le musée est derrière le cinéma." },
    { en: "The car is in front of the station.", fr: "La voiture est devant la gare." },
    { en: "Where is the post office? — It's over there.", fr: "Où est la poste ? — Elle est là-bas." },
    { en: "The toilets are to the right of the café.", fr: "Les toilettes sont à droite du café." },
  ],
};
