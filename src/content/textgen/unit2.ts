/**
 * Unité 2 — « On fait quoi ce week-end ? ». Three scenarios, all built from
 * what a learner has after SIO-021…030 (and everything before): aimer /
 * adorer / détester + definite article or infinitive, faire + du/de la/de
 * l'/des, aller + au/à la/à l'/aux, the time expressions (le samedi, tous
 * les jours, à 8 heures), pourquoi ? / parce que, ne … pas with the pas de
 * vs pas le contrast, and the invitation chunks of vouloir (Tu veux venir ?
 * Je veux bien ! Désolé, je ne peux pas. Plutôt dimanche ?).
 *
 * Unité 2 has no connectors and no `y` yet, so cohesion is the unit's own
 * article contrast doing double duty: an activity is introduced with FAIRE +
 * partitive (je fais de la natation), then referred back to with AIMER +
 * definite (j'adore la natation) — the exact pair the negation deck drills
 * as « pas de natation » vs « pas la natation ». The invitation scenario is
 * cohesive the way SIO-029 is: invite, fix the time, answer, settle.
 *
 * Two constraints shape every beat:
 *   • PLAUSIBLE — referents are drawn as bound pairs, never independently: a
 *     place carries what one does there (nobody swims at the market), a
 *     reason fits its activity (yoga is calm, football is fun), and an
 *     invitation draws accept-or-decline ONCE, so a refusal is never
 *     followed by « avec plaisir ».
 *   • NEVER TWICE — every beat draws its wording as well as its words, so no
 *     sentence position is a constant that would repeat on the second listen.
 */

import { aLe, def, deLe, pasDe } from "../../lib/textgen/french";
import { pick, pickOther, scenario } from "../../lib/textgen/engine";
import type { Noun, UnitTextGen } from "../../lib/textgen/types";

/* ── Lexicon ─────────────────────────────────────────────────────────────── */

/**
 * An activity that lives in BOTH unit-2 frames: faire + partitive and aimer +
 * definite (decks: faire-activites, aimer-activites, negation-pas). `enDo` is
 * the English verb phrase for the faire frame ("go swimming"); `en` stays the
 * bare noun for the aimer frame ("swimming"). `calme` marks the ones you'd
 * praise with « c'est calme » rather than « c'est amusant ».
 */
type Act = Noun & { enDo: string; calme?: boolean };

const SPORT: Act = { fr: "sport", en: "sports", enDo: "do sport", g: "m" };
const TENNIS: Act = { fr: "tennis", en: "tennis", enDo: "play tennis", g: "m" };
const VELO: Act = { fr: "vélo", en: "cycling", enDo: "go cycling", g: "m" };
const JUDO: Act = { fr: "judo", en: "judo", enDo: "do judo", g: "m" };
const YOGA: Act = { fr: "yoga", en: "yoga", enDo: "do yoga", g: "m", calme: true };
const FOOTBALL: Act = { fr: "football", en: "football", enDo: "play football", g: "m" };
const BASKET: Act = { fr: "basket", en: "basketball", enDo: "play basketball", g: "m" };
const KARATE: Act = { fr: "karaté", en: "karate", enDo: "do karate", g: "m" };
const SKI: Act = { fr: "ski", en: "skiing", enDo: "go skiing", g: "m" };
const PIANO: Act = { fr: "piano", en: "the piano", enDo: "play the piano", g: "m", calme: true };
const NATATION: Act = { fr: "natation", en: "swimming", enDo: "go swimming", g: "f" };
const DANSE: Act = { fr: "danse", en: "dance", enDo: "dance", g: "f" };
const MUSIQUE: Act = { fr: "musique", en: "music", enDo: "play music", g: "f", calme: true };
const BOXE: Act = { fr: "boxe", en: "boxing", enDo: "do boxing", g: "f" };
const PEINTURE: Act = { fr: "peinture", en: "painting", enDo: "paint", g: "f", calme: true };
const PHOTOGRAPHIE: Act = { fr: "photographie", en: "photography", enDo: "do photography", g: "f", calme: true };
const EQUITATION: Act = { fr: "équitation", en: "horse riding", enDo: "go horse riding", g: "f", vowel: true };
const ESCALADE: Act = { fr: "escalade", en: "climbing", enDo: "go climbing", g: "f", vowel: true };
const ATHLETISME: Act = { fr: "athlétisme", en: "athletics", enDo: "do athletics", g: "m", vowel: true };
const RANDONNEES: Act = { fr: "randonnées", en: "hiking", enDo: "go hiking", g: "f", pl: true };
const PROMENADES: Act = { fr: "promenades", en: "walks", enDo: "go for walks", g: "f", pl: true, calme: true };
/** Errand-shaped faire activities — outings, not hobbies, so they appear
 *  only as what a SORTIE does, never as something one « adore ». */
const COURSES: Act = { fr: "courses", en: "errands", enDo: "run errands", g: "f", pl: true };
const ACHATS: Act = { fr: "achats", en: "shopping", enDo: "go shopping", g: "m", pl: true };

/** The hobbies of Mes loisirs — every one works in both frames. */
const LOISIRS: Act[] = [
  SPORT, TENNIS, VELO, JUDO, YOGA, FOOTBALL, BASKET, KARATE, SKI, PIANO,
  NATATION, DANSE, MUSIQUE, BOXE, PEINTURE, PHOTOGRAPHIE, EQUITATION,
  ESCALADE, ATHLETISME, RANDONNEES, PROMENADES,
];

/** Aimer + infinitive (deck: aimer-activites). `evite` names the LOISIRS
 *  headword that says the same thing — drawn around, so a text never pairs
 *  « je fais de la danse » with « j'aime aussi danser ». */
type Inf = { fr: string; en: string; evite?: string };

const INFINITIFS: Inf[] = [
  { fr: "danser", en: "dancing", evite: "danse" },
  { fr: "chanter", en: "singing" },
  { fr: "lire", en: "reading" },
  { fr: "voyager", en: "travelling" },
  { fr: "cuisiner", en: "cooking" },
  { fr: "dessiner", en: "drawing", evite: "peinture" },
  { fr: "nager", en: "swimming", evite: "natation" },
  { fr: "courir", en: "running", evite: "athlétisme" },
  { fr: "dormir", en: "sleeping" },
  { fr: "sortir", en: "going out" },
  { fr: "écouter de la musique", en: "listening to music", evite: "musique" },
  { fr: "regarder la télé", en: "watching TV" },
];

/** Reasons (deck: parce-que) — split so praise fits the activity: the calm
 *  hobbies get « c'est calme », the rest « c'est amusant ». */
const RAISONS_FUN = [
  { fr: "c'est amusant", en: "it's fun" },
  { fr: "c'est intéressant", en: "it's interesting" },
];
const RAISONS_CALME = [
  { fr: "c'est calme", en: "it's quiet" },
  { fr: "c'est intéressant", en: "it's interesting" },
];

/** Habitual time frames (deck: quand-time), lower-case so they sit at either
 *  end of the sentence; cap() restores the sentence-initial capital. */
const HABITUDES = [
  { fr: "le week-end", en: "at the weekend" },
  { fr: "le samedi", en: "on Saturdays" },
  { fr: "le dimanche", en: "on Sundays" },
  { fr: "tous les jours", en: "every day" },
];

/** One-off plan frames for Le week-end and L'invitation. */
const QUAND_PLAN = [
  { fr: "ce week-end", en: "this weekend" },
  { fr: "samedi", en: "on Saturday" },
  { fr: "dimanche", en: "on Sunday" },
];

/** Who comes along (decks: possessives, aimer-activites). */
const COMPAGNIE = [
  { fr: "avec mes amis", en: "with my friends" },
  { fr: "avec ma famille", en: "with my family" },
  { fr: "avec mon frère", en: "with my brother" },
  { fr: "avec ma sœur", en: "with my sister" },
];

/** Meeting times (deck: quand-time). */
const MIDI = { fr: "à midi", en: "at noon" };
const HEURES = [
  { fr: "à 8 heures", en: "at 8 o'clock" },
  { fr: "à 10 heures", en: "at 10 o'clock" },
  MIDI,
];

/**
 * A weekend outing: the place (deck: aller-destinations) BOUND to what one
 * likes about it and what one does there — drawing them independently is
 * what produces swimming at the market, so they are never drawn
 * independently. `aime` is a ready complement for aimer (definite NP or
 * infinitive, both unit-2 frames).
 */
type Sortie = { place: Noun; aime: { fr: string; en: string }; fait: Act[] };

const SORTIES: Sortie[] = [
  {
    place: { fr: "piscine", en: "the pool", g: "f" },
    aime: { fr: "nager", en: "swimming" },
    fait: [NATATION],
  },
  {
    place: { fr: "plage", en: "the beach", g: "f" },
    aime: { fr: "nager", en: "swimming" },
    fait: [NATATION, PROMENADES],
  },
  {
    place: { fr: "parc", en: "the park", g: "m" },
    aime: { fr: "courir", en: "running" },
    fait: [PROMENADES, VELO],
  },
  {
    place: { fr: "marché", en: "the market", g: "m" },
    aime: { fr: "cuisiner", en: "cooking" },
    fait: [COURSES],
  },
  {
    place: { fr: "magasins", en: "the shops", g: "m", pl: true },
    aime: { fr: "les magasins", en: "the shops" },
    fait: [ACHATS],
  },
];

/** Where one invites a friend (deck: aller-destinations), bound to the thing
 *  the accepter can enthuse about — films at the cinema, never at the pool.
 *  `heures` narrows the meeting time where only one is plausible: a
 *  restaurant date is at noon, not at 8 in the morning. */
type Invite = { place: Noun; aime: { fr: string; en: string }; heures?: typeof HEURES };

const INVITES: Invite[] = [
  { place: { fr: "cinéma", en: "the cinema", g: "m" }, aime: { fr: "les films", en: "films" } },
  { place: { fr: "restaurant", en: "the restaurant", g: "m" }, aime: { fr: "manger", en: "eating" }, heures: [MIDI] },
  { place: { fr: "piscine", en: "the pool", g: "f" }, aime: { fr: "nager", en: "swimming" } },
  { place: { fr: "plage", en: "the beach", g: "f" }, aime: { fr: "la plage", en: "the beach" } },
  { place: { fr: "parc", en: "the park", g: "m" }, aime: { fr: "courir", en: "running" } },
];

/** When the invitation is for (deck: vouloir-inviter — « Tu es libre
 *  dimanche ? », « Désolé, je suis occupé ce soir. »). */
const JOURS_INVITATION = [
  { fr: "samedi", en: "on Saturday" },
  { fr: "dimanche", en: "on Sunday" },
  { fr: "ce soir", en: "tonight" },
];

/* ── Scenarios ───────────────────────────────────────────────────────────── */

/**
 * Mes loisirs — the SIO-023/024 self-portrait. Sentence 1 introduces the
 * hobby with faire + partitive; sentence 2 refers back to it with aimer +
 * definite; the close flips one frame into ne … pas — the negation deck's
 * « pas de tennis » vs « pas le tennis » contrast, heard in context.
 */
const MES_LOISIRS = scenario(
  "mes-loisirs",
  (r) => {
    const act = pick(r, LOISIRS);
    const quand = pick(r, HABITUDES);
    const compagnie = pick(r, COMPAGNIE);
    const raison = pick(r, act.calme ? RAISONS_CALME : RAISONS_FUN);
    const inf = pick(
      r,
      INFINITIFS.filter((i) => i.evite !== act.fr),
    );
    const refus = pickOther(r, LOISIRS, act);
    const refusInf = pick(
      r,
      INFINITIFS.filter((i) => i !== inf && i.evite !== act.fr && i.evite !== refus.fr),
    );
    return { act, quand, compagnie, raison, inf, refus, refusInf };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${c.quand.fr}, je fais ${deLe(c.act)}${c.act.fr}.`,
          en: `${c.quand.en}, I ${c.act.enDo}.`,
        },
        {
          fr: `Je fais ${deLe(c.act)}${c.act.fr} ${c.quand.fr}.`,
          en: `I ${c.act.enDo} ${c.quand.en}.`,
        },
        {
          fr: `${c.quand.fr}, je fais ${deLe(c.act)}${c.act.fr} ${c.compagnie.fr}.`,
          en: `${c.quand.en}, I ${c.act.enDo} ${c.compagnie.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `J'aime beaucoup ${def(c.act)}${c.act.fr}.`,
          en: `I really like ${c.act.en}.`,
        },
        {
          fr: `J'adore ${def(c.act)}${c.act.fr} !`,
          en: `I love ${c.act.en}!`,
        },
        {
          fr: `Moi, j'aime ${def(c.act)}${c.act.fr}.`,
          en: `As for me, I like ${c.act.en}.`,
        },
        {
          fr: `J'aime bien ${def(c.act)}${c.act.fr}.`,
          en: `I quite like ${c.act.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Pourquoi ? Parce que ${c.raison.fr}.`,
          en: `Why? Because ${c.raison.en}.`,
        },
        {
          fr: `Parce que ${c.raison.fr}.`,
          en: `Because ${c.raison.en}.`,
        },
        {
          fr: `${c.raison.fr} !`,
          en: `${c.raison.en}!`,
        },
        {
          fr: `${def(c.act)}${c.act.fr}, ${c.raison.fr}.`,
          en: `${c.act.en} — ${c.raison.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `J'aime aussi ${c.inf.fr}.`, en: `I also like ${c.inf.en}.` },
        { fr: `Et j'adore ${c.inf.fr}.`, en: `And I love ${c.inf.en}.` },
        {
          fr: `${c.compagnie.fr}, j'aime ${c.inf.fr}.`,
          en: `${c.compagnie.en}, I like ${c.inf.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Mais je ne fais pas ${pasDe(c.refus)}${c.refus.fr}.`,
          en: `But I don't ${c.refus.enDo}.`,
        },
        {
          fr: `Mais je n'aime pas ${def(c.refus)}${c.refus.fr}.`,
          en: `But I don't like ${c.refus.en}.`,
        },
        {
          fr: `Je déteste ${c.refusInf.fr} !`,
          en: `I hate ${c.refusInf.en}!`,
        },
        {
          fr: `Et toi, qu'est-ce que tu fais ${c.quand.fr} ?`,
          en: `And you, what do you do ${c.quand.en}?`,
        },
        {
          fr: `Et toi, tu fais quoi ${c.quand.fr} ?`,
          en: `And you, what do you do ${c.quand.en}?`,
        },
      ]),
  ],
);

/**
 * Le week-end — the SIO-030 weekend plan, generated: aller + contraction
 * names the place, aimer says why, faire + partitive says what, and the plan
 * ends the way unit-2 plans do — by inviting the listener and fixing the
 * time. Place and activity travel as one bound Sortie.
 */
const LE_WEEK_END = scenario(
  "le-week-end",
  (r) => {
    const sortie = pick(r, SORTIES);
    return {
      sortie,
      fait: pick(r, sortie.fait),
      quand: pick(r, QUAND_PLAN),
      compagnie: pick(r, COMPAGNIE),
      heure: pick(r, HEURES),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${c.quand.fr}, je vais ${aLe(c.sortie.place)}${c.sortie.place.fr} ${c.compagnie.fr}.`,
          en: `${c.quand.en}, I'm going to ${c.sortie.place.en} ${c.compagnie.en}.`,
        },
        {
          fr: `${c.quand.fr}, on va ${aLe(c.sortie.place)}${c.sortie.place.fr}.`,
          en: `${c.quand.en}, we're going to ${c.sortie.place.en}.`,
        },
        {
          fr: `Je vais ${aLe(c.sortie.place)}${c.sortie.place.fr} ${c.quand.fr}.`,
          en: `I'm going to ${c.sortie.place.en} ${c.quand.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `J'aime beaucoup ${c.sortie.aime.fr}.`,
          en: `I really like ${c.sortie.aime.en}.`,
        },
        {
          fr: `J'adore ${c.sortie.aime.fr} !`,
          en: `I love ${c.sortie.aime.en}!`,
        },
        {
          fr: `Parce que j'aime ${c.sortie.aime.fr}.`,
          en: `Because I like ${c.sortie.aime.en}.`,
        },
        {
          fr: `J'aime bien ${c.sortie.aime.fr}.`,
          en: `I quite like ${c.sortie.aime.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `On fait ${deLe(c.fait)}${c.fait.fr}.`,
          en: `We ${c.fait.enDo}.`,
        },
        {
          fr: `Là, on fait ${deLe(c.fait)}${c.fait.fr}.`,
          en: `There, we ${c.fait.enDo}.`,
        },
        {
          fr: `Je veux faire ${deLe(c.fait)}${c.fait.fr}.`,
          en: `I want to ${c.fait.enDo}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `Tu veux venir avec nous ?`, en: `Do you want to come with us?` },
        {
          fr: `Tu veux venir ${aLe(c.sortie.place)}${c.sortie.place.fr} ?`,
          en: `Do you want to come to ${c.sortie.place.en}?`,
        },
        {
          fr: `Tu veux venir ${aLe(c.sortie.place)}${c.sortie.place.fr} avec nous ?`,
          en: `Do you want to come to ${c.sortie.place.en} with us?`,
        },
        { fr: `Tu es libre ?`, en: `Are you free?` },
        { fr: `Tu es libre ${c.quand.fr} ?`, en: `Are you free ${c.quand.en}?` },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `On se retrouve ${c.heure.fr}.`,
          en: `We're meeting ${c.heure.en}.`,
        },
        {
          fr: `On se retrouve ${aLe(c.sortie.place)}${c.sortie.place.fr} ${c.heure.fr}.`,
          en: `We're meeting at ${c.sortie.place.en} ${c.heure.en}.`,
        },
        {
          fr: `On se retrouve ${c.heure.fr}, d'accord ?`,
          en: `We're meeting ${c.heure.en}, okay?`,
        },
      ]),
  ],
);

/**
 * L'invitation — SIO-029 as one exchange: invite, fix the time, answer,
 * settle. Accept-or-decline is drawn ONCE with the cast, so the whole back
 * half of the text agrees with itself: a yes leads to enthusiasm and «  à
 * samedi », a no leads to « plutôt dimanche ? » and the counter-offer
 * accepted.
 */
const L_INVITATION = scenario(
  "l-invitation",
  (r) => {
    const invite = pick(r, INVITES);
    const jour = pick(r, JOURS_INVITATION);
    return {
      invite,
      jour,
      autreJour: pickOther(r, JOURS_INVITATION, jour),
      heure: pick(r, invite.heures ?? HEURES),
      accepte: r() < 0.5,
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Tu veux venir ${aLe(c.invite.place)}${c.invite.place.fr} ${c.jour.fr} ?`,
          en: `Do you want to come to ${c.invite.place.en} ${c.jour.en}?`,
        },
        {
          fr: `Tu veux aller ${aLe(c.invite.place)}${c.invite.place.fr} ${c.jour.fr} ?`,
          en: `Do you want to go to ${c.invite.place.en} ${c.jour.en}?`,
        },
        {
          fr: `Tu veux venir ${aLe(c.invite.place)}${c.invite.place.fr} avec nous ${c.jour.fr} ?`,
          en: `Do you want to come to ${c.invite.place.en} with us ${c.jour.en}?`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `On se retrouve ${c.heure.fr} ?`,
          en: `Shall we meet ${c.heure.en}?`,
        },
        {
          fr: `On se retrouve ${aLe(c.invite.place)}${c.invite.place.fr} ${c.heure.fr} ?`,
          en: `Shall we meet at ${c.invite.place.en} ${c.heure.en}?`,
        },
      ]),
    (c, _p, r) =>
      pick(
        r,
        c.accepte
          ? [
              { fr: `Je veux bien !`, en: `I'd love to!` },
              { fr: `Je veux bien, oui !`, en: `Yes, I'd love to!` },
              { fr: `Oui, bonne idée !`, en: `Yes, good idea!` },
              { fr: `Avec plaisir !`, en: `With pleasure!` },
            ]
          : [
              { fr: `Désolé, je ne peux pas.`, en: `Sorry, I can't.` },
              { fr: `Merci, mais je ne suis pas libre.`, en: `Thanks, but I'm not free.` },
              { fr: `Désolé, je ne peux pas ${c.jour.fr}.`, en: `Sorry, I can't ${c.jour.en}.` },
              { fr: `Je ne suis pas libre ${c.jour.fr}.`, en: `I'm not free ${c.jour.en}.` },
            ],
      ),
    (c, _p, r) =>
      pick(
        r,
        c.accepte
          ? [
              { fr: `J'adore ${c.invite.aime.fr} !`, en: `I love ${c.invite.aime.en}!` },
              { fr: `J'aime beaucoup ${c.invite.aime.fr}.`, en: `I really like ${c.invite.aime.en}.` },
            ]
          : [
              { fr: `On peut se voir ${c.autreJour.fr} ?`, en: `Can we meet ${c.autreJour.en}?` },
              { fr: `Plutôt ${c.autreJour.fr} ?`, en: `${c.autreJour.en} instead?` },
              { fr: `Tu es libre ${c.autreJour.fr} ?`, en: `Are you free ${c.autreJour.en}?` },
            ],
      ),
    (c, _p, r) =>
      pick(
        r,
        c.accepte
          ? [
              { fr: `D'accord ! À bientôt !`, en: `Okay! See you soon!` },
              { fr: `À ${c.jour.fr}, alors !`, en: `See you ${c.jour.en}, then!` },
              { fr: `Ça me convient. À ${c.jour.fr} !`, en: `That works for me. See you ${c.jour.en}!` },
            ]
          : [
              { fr: `D'accord ! Ça me convient.`, en: `Okay! That works for me.` },
              { fr: `D'accord ! On se retrouve ${c.autreJour.fr}.`, en: `Okay! We're meeting ${c.autreJour.en}.` },
              { fr: `Oui, bonne idée !`, en: `Yes, good idea!` },
            ],
      ),
  ],
);

export const UNIT2: UnitTextGen = {
  unit: 2,
  title: "On fait quoi ce week-end ?",
  scenarios: [MES_LOISIRS, LE_WEEK_END, L_INVITATION],
};
