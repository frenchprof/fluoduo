/**
 * Native "Rendez-vous : proposer, refuser, négocier, accepter" lesson
 * (Unité 2, L16) — Mémo + 🎲 dice trainer + EN→FR bonus distilled from the
 * 16-rendezvous-revision.html drchan import.
 */
import type { NativeLesson } from "./types";

const DAYS = [
  { fr: "lundi", en: "Monday" }, { fr: "mardi", en: "Tuesday" }, { fr: "mercredi", en: "Wednesday" },
  { fr: "jeudi", en: "Thursday" }, { fr: "vendredi", en: "Friday" }, { fr: "samedi", en: "Saturday" },
  { fr: "dimanche", en: "Sunday" },
] as const;
const MOMENTS = [
  { fr: "matin", en: "morning" }, { fr: "après-midi", en: "afternoon" }, { fr: "soir", en: "evening" },
] as const;

const PROPOSERS = [
  { pre: "On se retrouve", post: "?", en: (w: string) => `Shall we meet up ${w}?` },
  { pre: "Tu es libre", post: "?", en: (w: string) => `Are you free ${w}?` },
  { pre: "On peut se voir", post: "?", en: (w: string) => `Can we see each other ${w}?` },
] as const;
const NEGOS = [
  { pre: "Et", post: "alors ?", en: (w: string) => `What about ${w} then?` },
  { pre: "Plutôt", post: "?", en: (w: string) => `${w} instead?` },
  { pre: "On peut se retrouver", post: "?", en: (w: string) => `Can we meet ${w}?` },
] as const;
const REFUSALS = [
  { fr: "Désolé, je suis occupé.", en: "Sorry, I'm busy.",
    med: { before: "Désolé, je suis", choices: ["occupé", "libre", "possible"], correct: "occupé", after: "." } },
  { fr: "Non, je ne suis pas libre.", en: "No, I'm not free.",
    med: { before: "Non, je ne suis pas", choices: ["libre", "occupé", "d'accord"], correct: "libre", after: "." } },
  { fr: "Désolé, je ne peux pas.", en: "Sorry, I can't.",
    med: { before: "Désolé, je ne", choices: ["peux", "veux", "suis"], correct: "peux", after: "pas." } },
  { fr: "Ce n'est pas possible.", en: "It's not possible.",
    med: { before: "Ce n'est pas", choices: ["possible", "libre", "occupé"], correct: "possible", after: "." } },
] as const;
const ACCEPTS = [
  { fr: "Oui, avec plaisir !", en: "Yes, with pleasure!",
    med: { before: "Oui, avec", choices: ["plaisir", "possible", "moment"], correct: "plaisir", after: "!" } },
  { fr: "Ça me convient.", en: "That suits me.",
    med: { before: "Ça me", choices: ["convient", "retrouve", "regrette"], correct: "convient", after: "." } },
  { fr: "Oui, je suis libre !", en: "Yes, I'm free!",
    med: { before: "Oui, je suis", choices: ["libre", "occupé", "désolé"], correct: "libre", after: "!" } },
  { fr: "C'est une bonne idée !", en: "That's a good idea!",
    med: { before: "C'est une bonne", choices: ["idée", "heure", "chose"], correct: "idée", after: "!" } },
] as const;
const STEPS = ["proposer", "refuser", "négocier", "accepter"] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const rendezvousLesson: NativeLesson = {
  slug: "rendezvous",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Le rendez-vous : proposer → refuser → négocier → accepter
      </h2>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]">
        <tbody>
          <tr>
            <td className="p-1 align-top font-bold text-[color:var(--gram-neutral)]">① proposer</td>
            <td className="p-1" lang="fr"><i>On se retrouve samedi soir ? · Tu es libre… ? · On peut se voir… ?</i></td>
          </tr>
          <tr>
            <td className="p-1 align-top font-bold text-[color:var(--gram-neutral)]">② refuser</td>
            <td className="p-1" lang="fr"><i>Désolé, je suis occupé. · Non, je ne suis pas libre. · Ce n&rsquo;est pas possible.</i></td>
          </tr>
          <tr>
            <td className="p-1 align-top font-bold text-[color:var(--gram-neutral)]">③ négocier</td>
            <td className="p-1" lang="fr"><i>Et dimanche alors ? · Plutôt samedi matin ? · On peut se retrouver plus tard ?</i></td>
          </tr>
          <tr>
            <td className="p-1 align-top font-bold text-[color:var(--gram-neutral)]">④ accepter</td>
            <td className="p-1" lang="fr"><i>Oui, avec plaisir ! · D&rsquo;accord ! · Ça me convient. · C&rsquo;est une bonne idée !</i></td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Négocier comes after a refusal</b> (a new day/time:{" "}
        <i lang="fr">Et… alors ? / Plutôt… ?</i>); once agreed, ask for details:{" "}
        <i lang="fr">On se retrouve à quelle heure ?</i>
      </p>
    </div>
  ),
  // TIER 3 · stop 29. OPAQUE blocks, and the claim is about the SEQUENCE: the
  // Mémo lists four groups, which reads as four equal choices. Three of them
  // are, and one is conditional — négocier exists only after a refusal.
  concept: {
    subtitle: "Why you can only negotiate after a no",
    contrast: (
      <>
        A list of phrases makes the four moves look like four options you pick from. They are
        not: <b>propose</b>, then either <b>accept</b> or <b>refuse</b>{" "}&mdash; and only after
        a refusal does <b>negotiate</b> exist at all. There is nothing to negotiate until
        someone has said no.
      </>
    ),
    question: (
      <>
        Your friend says <i lang="fr">D&eacute;sol&eacute;, je suis occup&eacute;.</i> What can
        you say next that you could not have said before?
      </>
    ),
    answer: (
      <>
        <i lang="fr">Et dimanche alors&nbsp;?</i> or <i lang="fr">Plut&ocirc;t samedi
        matin&nbsp;?</i> &mdash; a <b>new day or time</b>. Opening with that would be strange,
        because nothing has been turned down yet. And once you agree, the exchange is not
        over: <i lang="fr">On se retrouve &agrave; quelle heure&nbsp;?</i>
      </>
    ),
    pitfallHeads: ["what the list suggests", "what the exchange does"],
    pitfall: [
      { label: <>opening move</>, wrong: <><i lang="fr">Et dimanche alors&nbsp;?</i></>, right: <><i lang="fr">On se retrouve samedi soir&nbsp;?</i></> },
      { label: <>after a yes</>, wrong: <>stop there</>, right: <><i lang="fr">&Agrave; quelle heure&nbsp;?</i></> },
    ],
    flow: [
      { depth: 0, text: "① propose — On se retrouve samedi ?" },
      { depth: 1, text: "yes → ④ accept, then ask the time" },
      { depth: 1, text: "no → ② refuse" },
      { depth: 2, text: "③ negotiate — a NEW day or time" },
    ],
    check: [
      { q: <>They accept. Are you finished?</>,
        a: <>No &mdash; agree the details: <i lang="fr">On se retrouve &agrave; quelle heure&nbsp;?</i></> },
      { q: <>Why does <i lang="fr">Plut&ocirc;t samedi matin&nbsp;?</i> not work as an opener?</>,
        a: <><i lang="fr">Plut&ocirc;t</i> offers an alternative, and nothing has been proposed yet to be an alternative to.</> },
    ],
    remember: (
      <>
        The four moves are an order, not a menu. Negotiating is what you do{" "}
        <b>after</b> a no.
      </>
    ),
  },
  dice: {
    instruction: "Give the line that plays the highlighted role in the dialogue.",
    newQuestion() {
      // One coherent mini-dialogue: propose slot 1 → refuse → negotiate slot 2 → accept.
      const d1 = pick(DAYS), m1 = pick(MOMENTS);
      let d2 = pick(DAYS);
      while (d2.fr === d1.fr) d2 = pick(DAYS);
      const m2 = pick(MOMENTS);
      const w1 = `${d1.fr} ${m1.fr}`, w1en = `${d1.en} ${m1.en}`;
      const w2 = `${d2.fr} ${m2.fr}`, w2en = `${d2.en} ${m2.en}`;

      const p = pick(PROPOSERS), r = pick(REFUSALS), n = pick(NEGOS), a = pick(ACCEPTS);
      const pLine = `${p.pre} ${w1} ${p.post}`;
      const nLine = `${n.pre} ${w2} ${n.post}`;
      const easyOptions = [pLine, r.fr, nLine, a.fr];

      // Distractor slot for the day-moment dropdowns.
      let d3 = pick(DAYS);
      while (d3.fr === d1.fr || d3.fr === d2.fr) d3 = pick(DAYS);
      const w3 = `${d3.fr} ${pick(MOMENTS).fr}`;

      const step = pick(STEPS);
      if (step === "proposer") {
        return {
          meta: "Tu commences le dialogue.",
          big: "proposer",
          en: p.en(w1en),
          correct: pLine,
          easyOptions,
          med: { before: p.pre, choices: [w1, w2, w3], correct: w1, after: p.post },
        };
      }
      if (step === "refuser") {
        return {
          meta: `— ${pLine}`,
          big: "refuser",
          en: r.en,
          correct: r.fr,
          easyOptions,
          med: { ...r.med, choices: [...r.med.choices] },
        };
      }
      if (step === "négocier") {
        return {
          meta: `— ${r.fr}`,
          big: "négocier",
          en: n.en(w2en),
          correct: nLine,
          easyOptions,
          med: { before: n.pre, choices: [w2, w1, w3], correct: w2, after: n.post },
        };
      }
      return {
        meta: `— ${nLine}`,
        big: "accepter",
        en: a.en,
        correct: a.fr,
        easyOptions,
        med: { ...a.med, choices: [...a.med.choices] },
      };
    },
  },
  bonus: [
    { en: "Shall we meet up Saturday afternoon?", fr: "On se retrouve samedi après-midi ?" },
    { en: "Yes, with pleasure!", fr: "Oui, avec plaisir !" },
    { en: "Sorry, I'm busy.", fr: "Désolé, je suis occupé." },
    { en: "Sunday instead?", fr: "Plutôt dimanche ?" },
    { en: "What time shall we meet?", fr: "On se retrouve à quelle heure ?" },
    { en: "That suits me.", fr: "Ça me convient." },
    { en: "It's not possible.", fr: "Ce n'est pas possible." },
    { en: "Can we meet later?", fr: "On peut se retrouver plus tard ?" },
    { en: "Are you (pl.) free Friday evening?", fr: "Vous êtes libres vendredi soir ?" },
    { en: "We are free on Sunday.", fr: "Nous sommes libres dimanche." },
  ],
};
