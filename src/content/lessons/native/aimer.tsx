/**
 * Native "Aimer + le / la / les" lesson (Unité 2) — the value-add distilled from
 * the 282KB drchan import: the Mémo + the 🎲 dice trainer + EN→FR bonus, as real
 * in-app content (Dan, 2026-07-03: "native in CahierShell"). Supersedes the
 * 08-aimer-lite.html pilot.
 */
import type { NativeLesson } from "./types";

import { AIMER_AXES, aimerQuestion } from "./aimer.gen";

export const aimerLesson: NativeLesson = {
  slug: "aimer",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aimer, adorer, détester + <em>toute la catégorie</em>
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        With verbs of preference you talk about the thing <b>in general</b> — so the article is <b>definite</b>:
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--gram-masc)]">le</b> + masculin — <i lang="fr">J&rsquo;aime le sport.</i></li>
        <li><b className="text-lg text-[color:var(--gram-fem)]">la</b> + féminin — <i lang="fr">J&rsquo;adore la musique.</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">l&rsquo;</b> + voyelle — <i lang="fr">J&rsquo;aime l&rsquo;art.</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">les</b> + pluriel — <i lang="fr">Je déteste les films d&rsquo;horreur.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Even in the negative the article stays le / la / les</b> (it does <u>not</u> become <i>de</i> — that&rsquo;s the partitive):{" "}
        <span lang="fr">J&rsquo;aime <u>le</u> sport → Je n&rsquo;aime <b>pas le</b> sport.</span>
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {["je déteste 💔", "je n'aime pas 🤍", "j'aime bien 🙂", "j'aime ❤️", "j'adore ❤️❤️"].map((s) => (
          <span key={s} className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">{s}</span>
        ))}
      </p>
    </div>
  ),
  // TIER 1 · stop 23 (Dan's L08). The Mémo already states the FACT — the
  // article survives the negative. What it cannot say is WHY, and the why is
  // what makes stop 24 predictable instead of a second thing to memorise.
  concept: {
    subtitle: "Why the article survives the negative",
    contrast: (
      <>
        English drops the article when it turns negative &mdash; <i>I like sport</i>,{" "}
        <i>I don&rsquo;t like sport</i>. French keeps it:{" "}
        <i lang="fr">J&rsquo;aime le sport</i> &rarr;{" "}
        <i lang="fr">Je n&rsquo;aime pas le sport</i>. The article is doing a job here that
        English gives to nothing at all.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je ne fais pas <b>de</b> sport</i> loses its article. So why does{" "}
        <i lang="fr">Je n&rsquo;aime pas <b>le</b> sport</i> keep one?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">aimer</i> talks about the thing <b>in general</b> &mdash; the
        whole category. Disliking a category does not make it smaller: there is still such a
        thing as sport, you simply do not like it. <i lang="fr">Faire du sport</i> is a{" "}
        <b>portion</b> of it, and once you say no there is no portion left to name. Same
        sentence shape, opposite behaviour, and the verb is what decides.
      </>
    ),
    pitfallHeads: ["the partitive habit", "what aimer does"],
    pitfall: [
      { label: <>sport</>, wrong: <><i lang="fr">Je n&rsquo;aime pas de sport</i></>, right: <><i lang="fr">Je n&rsquo;aime pas <b>le</b> sport</i></> },
      { label: <>la musique</>, wrong: <><i lang="fr">Je n&rsquo;adore pas de musique</i></>, right: <><i lang="fr">Je n&rsquo;adore pas <b>la</b> musique</i></> },
    ],
    check: [
      { q: <>You do not like horror films. Which article?</>,
        a: <><i lang="fr">Je n&rsquo;aime pas <b>les</b> films d&rsquo;horreur.</i> The category survives.</> },
      { q: <>Why is <i lang="fr">de</i> wrong after <i lang="fr">aimer</i>?</>,
        a: <>Because <i lang="fr">de</i> introduces a portion, and a preference is never about a portion.</> },
    ],
    remember: (
      <>
        A verb of preference points at the whole category, and a category is still there after
        you say you dislike it. So <i lang="fr">le</i> / <i lang="fr">la</i> /{" "}
        <i lang="fr">les</i> stay.
      </>
    ),
  },
  dice: {
    instruction: "Choose the right definite article for the thing liked.",
    newQuestion: aimerQuestion,
    axes: AIMER_AXES,
  },
  bonus: [
    { en: "I like sport.", fr: "J'aime le sport." },
    { en: "She loves music.", fr: "Elle adore la musique." },
    { en: "We hate films.", fr: "Nous détestons les films." },
    { en: "I love art.", fr: "J'adore l'art." },
    { en: "He doesn't like tennis.", fr: "Il n'aime pas le tennis." },
    { en: "They (m.) love reading.", fr: "Ils adorent la lecture." },
    { en: "You (sg.) hate boxing.", fr: "Tu détestes la boxe." },
    { en: "I don't like books.", fr: "Je n'aime pas les livres." },
    { en: "You (pl.) love the piano.", fr: "Vous adorez le piano." },
    { en: "She doesn't like athletics.", fr: "Elle n'aime pas l'athlétisme." },
  ],
};
