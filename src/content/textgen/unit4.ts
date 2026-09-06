/**
 * Unité 4 — « À table ! ». Three scenarios built from SIO-041…050 and before:
 * meals and foods, the défini/partitif contrast, ne … jamais + de, frequency
 * adverbs after the verb, quantities with de, shops with à + article,
 * demonstratives, prices, futur proche, and the restaurant-review chunks.
 *
 * Where unité 3 hangs its texts on connectors and `y`, unité 4 hangs them on
 * its own devices: a food is introduced with the PARTITIF (je mange du pain),
 * then referred back to with the DÉFINI (j'aime le pain) or a DEMONSTRATIVE
 * (ces pommes sont délicieuses). The cohesion drill and the grammar drill are
 * the same drill.
 *
 * Plausibility is enforced by BINDING, not by hoping: a meal carries the list
 * of what is eaten and drunk at it, a shop carries what it sells. Nobody
 * buys fish at the bakery and nobody drinks soup at breakfast.
 */

import { aLe, agree, be, def, dem, indef, part, pasDe, quantity } from "../../lib/textgen/french";
import { pick, pickOther, scenario } from "../../lib/textgen/engine";
import type { Adj, Noun, UnitTextGen } from "../../lib/textgen/types";

/* ── Lexicon ─────────────────────────────────────────────────────────────── */

/** A food. `en` is the BARE English noun; `enOne` only for countables. */
type Food = Noun & {
  /** Countable singular — takes un/une, never a partitive quantity. */
  count?: boolean;
  /** English with its indefinite article, for countables only. */
  enOne?: string;
  /** Sold by weight — « un kilo de poisson », not « un peu de poisson ». */
  poids?: boolean;
};

const PAIN: Food = { fr: "pain", en: "bread", g: "m" };
const FROMAGE: Food = { poids: true, fr: "fromage", en: "cheese", g: "m" };
const POISSON: Food = { poids: true, fr: "poisson", en: "fish", g: "m" };
const POULET: Food = { poids: true, fr: "poulet", en: "chicken", g: "m" };
const RIZ: Food = { fr: "riz", en: "rice", g: "m" };
const SUCRE: Food = { fr: "sucre", en: "sugar", g: "m" };
const VIANDE: Food = { poids: true, fr: "viande", en: "meat", g: "f" };
const SALADE: Food = { fr: "salade", en: "salad", g: "f" };
const SOUPE: Food = { fr: "soupe", en: "soup", g: "f" };
const CONFITURE: Food = { fr: "confiture", en: "jam", g: "f" };
const CAFE: Food = { fr: "café", en: "coffee", g: "m" };
const LAIT: Food = { fr: "lait", en: "milk", g: "m" };
const THE: Food = { fr: "thé", en: "tea", g: "m" };
const JUS: Food = { fr: "jus d'orange", en: "orange juice", g: "m" };
const EAU: Food = { fr: "eau", en: "water", g: "f", vowel: true };
const PATES: Food = { fr: "pâtes", en: "pasta", g: "f", pl: true };
const FRITES: Food = { fr: "frites", en: "fries", g: "f", pl: true };
const LEGUMES: Food = { fr: "légumes", en: "vegetables", g: "m", pl: true };
const FRAISES: Food = { fr: "fraises", en: "strawberries", g: "f", pl: true };
const POMMES: Food = { fr: "pommes", en: "apples", g: "f", pl: true };
const OIGNONS: Food = { fr: "oignons", en: "onions", g: "m", pl: true, vowel: true };
const CHAMPIGNONS: Food = { fr: "champignons", en: "mushrooms", g: "m", pl: true };
const CROISSANTS: Food = { fr: "croissants", en: "croissants", g: "m", pl: true };
const OEUFS: Food = { fr: "œufs", en: "eggs", g: "m", pl: true, vowel: true };
const SUSHIS: Food = { fr: "sushis", en: "sushi", g: "m", pl: true };
const GATEAU: Food = { fr: "gâteau", en: "cake", g: "m", count: true, enOne: "a cake" };
const TARTE: Food = { fr: "tarte", en: "tart", g: "f", count: true, enOne: "a tart" };
const ANANAS: Food = { fr: "ananas", en: "pineapple", g: "m", vowel: true, count: true, enOne: "a pineapple" };

/**
 * A meal, bound to what is actually eaten and drunk at it. Drawing food and
 * meal independently is what produces « au petit-déjeuner, je mange de la
 * soupe » — so they are never drawn independently.
 */
type Repas = { noun: Noun; mange: Food[]; boit: Food[] };

const REPAS: Repas[] = [
  {
    noun: { fr: "petit-déjeuner", en: "breakfast", g: "m" },
    mange: [PAIN, CROISSANTS, FROMAGE, CONFITURE, OEUFS],
    boit: [CAFE, LAIT, THE, JUS],
  },
  {
    noun: { fr: "déjeuner", en: "lunch", g: "m" },
    mange: [RIZ, PATES, POISSON, POULET, VIANDE, SALADE, FRITES, LEGUMES],
    boit: [EAU, JUS, CAFE],
  },
  {
    noun: { fr: "goûter", en: "snack time", g: "m" },
    mange: [PAIN, CROISSANTS, FRAISES, CONFITURE],
    boit: [THE, LAIT, JUS],
  },
  {
    noun: { fr: "dîner", en: "dinner", g: "m" },
    mange: [SOUPE, SALADE, POISSON, POULET, RIZ, PATES, LEGUMES, VIANDE],
    boit: [EAU, THE],
  },
];

/** Foods it is plausible to refuse outright — the ne … jamais … de beat. */
const REFUS: Food[] = [VIANDE, POISSON, FROMAGE, FRITES, OEUFS, OIGNONS, CHAMPIGNONS, SUSHIS, SUCRE];

/** Dishes one makes at home — disjoint from what the shops below sell. */
const FAITS_MAISON: Food[] = [SOUPE, SALADE, PATES, FRITES];

/** What a restaurant plausibly serves. */
const PLATS_RESTAURANT: Food[] = [POISSON, POULET, VIANDE, PATES, RIZ, FRITES, LEGUMES, SALADE, SUSHIS];

/**
 * A shop and what it actually sells — bound as a PAIR. `big` marks the shops
 * where a two-digit total (the 70–99 numbers of SIO-045) is plausible.
 */
type Commerce = { shop: Noun; vend: Food[]; big?: boolean };

const COMMERCES: Commerce[] = [
  { shop: { fr: "boulangerie", en: "the bakery", g: "f" }, vend: [PAIN, CROISSANTS] },
  { shop: { fr: "pâtisserie", en: "the pastry shop", g: "f" }, vend: [GATEAU, TARTE] },
  { shop: { fr: "boucherie", en: "the butcher's", g: "f" }, vend: [VIANDE, POULET] },
  { shop: { fr: "poissonnerie", en: "the fishmonger's", g: "f" }, vend: [POISSON] },
  { shop: { fr: "épicerie", en: "the grocery store", g: "f", vowel: true }, vend: [LAIT, SUCRE, RIZ, CONFITURE] },
  {
    shop: { fr: "marché", en: "the market", g: "m" },
    vend: [LEGUMES, FRAISES, POMMES, CHAMPIGNONS, OIGNONS, ANANAS],
    big: true,
  },
  { shop: { fr: "supermarché", en: "the supermarket", g: "m" }, vend: [PATES, FRITES, FROMAGE, OEUFS], big: true },
];

/** Frequency adverbs (deck: frequence) — placed straight after the verb. */
const FREQUENCE = [
  { fr: "toujours", en: "always" },
  { fr: "souvent", en: "often" },
  { fr: "parfois", en: "sometimes" },
  { fr: "rarement", en: "rarely" },
];

/** Quantities (deck: les-de). "un kilo" is reserved for plural headwords. */
const QUANTITES_MASSE = [
  { fr: "un peu", en: "a little" },
  { fr: "beaucoup", en: "a lot of" },
];
const KILO = { fr: "un kilo", en: "a kilo of" };

const ADJECTIFS: Adj[] = [
  { ms: "bon", fs: "bonne", mp: "bons", fp: "bonnes", en: "good" },
  { ms: "délicieux", fs: "délicieuse", mp: "délicieux", fp: "délicieuses", en: "delicious" },
  { ms: "cher", fs: "chère", mp: "chers", fp: "chères", en: "expensive" },
  { ms: "frais", fs: "fraîche", mp: "frais", fp: "fraîches", en: "fresh" },
];

/** Prices. The 70–99 band only where a basket that size makes sense. */
const PRIX_PETIT = [
  { fr: "trois", en: "three" },
  { fr: "cinq", en: "five" },
  { fr: "huit", en: "eight" },
  { fr: "douze", en: "twelve" },
  { fr: "quinze", en: "fifteen" },
];
const PRIX_GRAND = [
  { fr: "soixante-dix", en: "seventy" },
  { fr: "soixante-quinze", en: "seventy-five" },
  { fr: "quatre-vingts", en: "eighty" },
  { fr: "quatre-vingt-deux", en: "eighty-two" },
  { fr: "quatre-vingt-dix", en: "ninety" },
  { fr: "quatre-vingt-dix-neuf", en: "ninety-nine" },
];

/** When one does the shopping (decks: days, quand-time). Kept clear of
 *  « ce soir », which the closing beat of Les courses already owns. */
const QUAND_COURSES = [
  { fr: "Le samedi", en: "On Saturdays" },
  { fr: "Le dimanche", en: "On Sundays" },
  { fr: "Le matin", en: "In the morning" },
  { fr: "Aujourd'hui", en: "Today" },
];

/** Habitual time frames — these sit with a frequency adverb, so no one-off
 *  « aujourd'hui » that would contradict « souvent ». */
const QUAND_HABITUDE = [
  { fr: "Le samedi", en: "On Saturdays" },
  { fr: "Le dimanche", en: "On Sundays" },
  { fr: "Le week-end", en: "At the weekend" },
  { fr: "Le vendredi soir", en: "On Friday evenings" },
];

const APPRECIATIONS = [
  { fr: "C'est délicieux !", en: "It's delicious!" },
  { fr: "C'est très bon.", en: "It's very good." },
  { fr: "Ce n'est pas cher.", en: "It's not expensive." },
  { fr: "Tout est frais.", en: "Everything is fresh." },
];

const SERVICES = [
  { fr: "Le service est rapide.", en: "The service is fast." },
  { fr: "Mais le service est un peu lent.", en: "But the service is a bit slow." },
  { fr: "Mais c'est un peu cher.", en: "But it's a bit expensive." },
  { fr: "Il faut réserver une table.", en: "You have to book a table." },
  { fr: "On doit réserver une table.", en: "We have to book a table." },
];

/** Where one eats out (deck: lieux-letris, unité 3). `enBare` is the noun
 *  without its article, for the demonstrative glosses ("this restaurant"). */
const SORTIES: (Noun & { enBare: string })[] = [
  { fr: "restaurant", en: "the restaurant", enBare: "restaurant", g: "m" },
  { fr: "café", en: "the café", enBare: "café", g: "m" },
];

/* ── Scenarios ───────────────────────────────────────────────────────────── */

/**
 * Mes repas — the défini/partitif contrast carrying the cohesion. Sentence 1
 * introduces a food with du/de la/des; sentence 4 refers back to the SAME
 * food with le/la/les, which is exactly the distinction SIO-042 drills.
 */
const MES_REPAS = scenario(
  "mes-repas",
  (r) => {
    const repas = pick(r, REPAS);
    const plat = pick(r, repas.mange);
    return {
      repas,
      plat,
      boisson: pick(r, repas.boit),
      frequence: pick(r, FREQUENCE),
      refus: pickOther(r, REFUS, plat),
      ceSoir: pick(r, REPAS[3].mange),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${aLe(c.repas.noun)}${c.repas.noun.fr}, je mange ${part(c.plat)}${c.plat.fr}.`,
          en: `At ${c.repas.noun.en}, I eat ${c.plat.en}.`,
        },
        {
          fr: `${aLe(c.repas.noun)}${c.repas.noun.fr}, je prends ${part(c.plat)}${c.plat.fr}.`,
          en: `At ${c.repas.noun.en}, I have ${c.plat.en}.`,
        },
        {
          fr: `Je mange ${part(c.plat)}${c.plat.fr} ${aLe(c.repas.noun)}${c.repas.noun.fr}.`,
          en: `I eat ${c.plat.en} at ${c.repas.noun.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Je bois ${c.frequence.fr} ${part(c.boisson)}${c.boisson.fr}.`,
          en: `I ${c.frequence.en} drink ${c.boisson.en}.`,
        },
        {
          fr: `Et je bois ${part(c.boisson)}${c.boisson.fr}.`,
          en: `And I drink ${c.boisson.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Mais je ne mange jamais ${pasDe(c.refus)}${c.refus.fr}.`,
          en: `But I never eat ${c.refus.en}.`,
        },
        {
          fr: `Mais je mange rarement ${part(c.refus)}${c.refus.fr}.`,
          en: `But I rarely eat ${c.refus.en}.`,
        },
        {
          fr: `Je n'aime pas ${def(c.refus)}${c.refus.fr}.`,
          en: `I don't like ${c.refus.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `J'aime beaucoup ${def(c.plat)}${c.plat.fr}.`, en: `I really like ${c.plat.en}.` },
        { fr: `J'adore ${def(c.plat)}${c.plat.fr} !`, en: `I love ${c.plat.en}!` },
        { fr: `${def(c.plat)}${c.plat.fr}, c'est très bon.`, en: `${c.plat.en} is very good.` },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Ce soir, je vais manger ${part(c.ceSoir)}${c.ceSoir.fr}.`,
          en: `Tonight, I'm going to eat ${c.ceSoir.en}.`,
        },
        {
          fr: `Ce soir, on va manger ${part(c.ceSoir)}${c.ceSoir.fr}.`,
          en: `Tonight, we're going to eat ${c.ceSoir.en}.`,
        },
        {
          fr: `Ce soir, il faut acheter ${part(c.ceSoir)}${c.ceSoir.fr}.`,
          en: `Tonight, we have to buy ${c.ceSoir.en}.`,
        },
      ]),
  ],
);

/**
 * Les courses — the shop and its goods are drawn as one pair, so the text
 * never buys fish at the bakery. The bought food comes back as a
 * demonstrative in sentences 3 and 5: second mention IS the grammar point.
 */
const LES_COURSES = scenario(
  "les-courses",
  (r) => {
    const commerce = pick(r, COMMERCES);
    const achat = pick(r, commerce.vend);
    return {
      commerce,
      achat,
      quand: pick(r, QUAND_COURSES),
      quantite: achat.pl || achat.poids ? KILO : pick(r, QUANTITES_MASSE),
      adjectif: pick(r, ADJECTIFS),
      prix: pick(r, commerce.big ? PRIX_GRAND : PRIX_PETIT),
      prixKilo: pick(r, PRIX_PETIT),
      plat: pick(r, FAITS_MAISON),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${c.quand.fr}, je vais ${aLe(c.commerce.shop)}${c.commerce.shop.fr}.`,
          en: `${c.quand.en}, I go to ${c.commerce.shop.en}.`,
        },
        {
          fr: `${c.quand.fr}, on va ${aLe(c.commerce.shop)}${c.commerce.shop.fr}.`,
          en: `${c.quand.en}, we go to ${c.commerce.shop.en}.`,
        },
        {
          fr: `${c.quand.fr}, il faut aller ${aLe(c.commerce.shop)}${c.commerce.shop.fr}.`,
          en: `${c.quand.en}, we have to go to ${c.commerce.shop.en}.`,
        },
      ]),
    (c, _p, r) => {
      const what = c.achat.count ? `${indef(c.achat)}${c.achat.fr}` : quantity(c.quantite, c.achat);
      const whatEn = c.achat.count ? c.achat.enOne! : `${c.quantite.en} ${c.achat.en}`;
      return pick(r, [
        { fr: `J'achète ${what}.`, en: `I buy ${whatEn}.` },
        { fr: `Je voudrais ${what}, s'il vous plaît.`, en: `I'd like ${whatEn}, please.` },
        { fr: `Je vais prendre ${what}.`, en: `I'll take ${whatEn}.` },
      ]);
    },
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${dem(c.achat)}${c.achat.fr} ${be(c.achat)} ${agree(c.adjectif, c.achat)}.`,
          en: `${c.achat.pl ? "These" : "This"} ${c.achat.en} ${c.achat.pl ? "are" : "is"} ${c.adjectif.en}.`,
        },
        {
          fr: `${dem(c.achat)}${c.achat.fr} ${be(c.achat)} très ${agree(c.adjectif, c.achat)}.`,
          en: `${c.achat.pl ? "These" : "This"} ${c.achat.en} ${c.achat.pl ? "are" : "is"} very ${c.adjectif.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(
        r,
        c.achat.pl
          ? [
              { fr: `Ça fait ${c.prix.fr} euros.`, en: `That comes to ${c.prix.en} euros.` },
              { fr: `C'est ${c.prixKilo.fr} euros le kilo.`, en: `It's ${c.prixKilo.en} euros a kilo.` },
            ]
          : [
              { fr: `Ça fait ${c.prix.fr} euros.`, en: `That comes to ${c.prix.en} euros.` },
              { fr: `C'est ${c.prix.fr} euros.`, en: `It's ${c.prix.en} euros.` },
            ],
      ),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Ce soir, je vais faire ${part(c.plat)}${c.plat.fr} avec ${dem(c.achat)}${c.achat.fr}.`,
          en: `Tonight, I'm going to make ${c.plat.en} with ${c.achat.pl ? "these" : "this"} ${c.achat.en}.`,
        },
        {
          fr: `On va manger ${dem(c.achat)}${c.achat.fr} ce soir.`,
          en: `We're going to eat ${c.achat.pl ? "these" : "this"} ${c.achat.en} tonight.`,
        },
      ]),
  ],
);

/** Au restaurant — the SIO-049 review, generated. `y` refers to the opener. */
const AU_RESTAURANT = scenario(
  "au-restaurant",
  (r) => ({
    sortie: pick(r, SORTIES),
    plat: pick(r, PLATS_RESTAURANT),
    quand: pick(r, QUAND_HABITUDE),
    frequence: pick(r, FREQUENCE),
    adjectif: pick(r, ADJECTIFS),
    appreciation: pick(r, APPRECIATIONS),
    service: pick(r, SERVICES),
  }),
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${c.quand.fr}, je vais ${c.frequence.fr} ${aLe(c.sortie)}${c.sortie.fr}.`,
          en: `${c.quand.en}, I ${c.frequence.en} go to ${c.sortie.en}.`,
        },
        {
          fr: `J'aime beaucoup ${dem(c.sortie)}${c.sortie.fr}.`,
          en: `I really like this ${c.sortie.enBare}.`,
        },
        {
          fr: `${dem(c.sortie)}${c.sortie.fr} est très bon.`,
          en: `This ${c.sortie.enBare} is very good.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `On y mange ${c.frequence.fr} ${part(c.plat)}${c.plat.fr}.`,
          en: `You ${c.frequence.en} eat ${c.plat.en} there.`,
        },
        {
          fr: `J'y mange ${c.frequence.fr} ${part(c.plat)}${c.plat.fr}.`,
          en: `I ${c.frequence.en} eat ${c.plat.en} there.`,
        },
        {
          fr: `Je vais y manger ${part(c.plat)}${c.plat.fr}.`,
          en: `I'm going to eat ${c.plat.en} there.`,
        },
      ]),
    // The appreciation names the dish from the previous sentence rather than
    // floating free — the adjective agrees with it, so praise is also a
    // gender/number drill.
    (c, _p, r) =>
      pick(r, [
        c.appreciation,
        {
          fr: `${def(c.plat)}${c.plat.fr} ${be(c.plat)} ${agree(c.adjectif, c.plat)}.`,
          en: `The ${c.plat.en} ${c.plat.pl ? "are" : "is"} ${c.adjectif.en}.`,
        },
        {
          fr: `${def(c.plat)}${c.plat.fr} ${be(c.plat)} très ${agree(c.adjectif, c.plat)}.`,
          en: `The ${c.plat.en} ${c.plat.pl ? "are" : "is"} very ${c.adjectif.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        c.service,
        { fr: `${c.quand.fr}, ${c.service.fr.charAt(0).toLowerCase()}${c.service.fr.slice(1)}`, en: `${c.quand.en}, ${c.service.en.charAt(0).toLowerCase()}${c.service.en.slice(1)}` },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Je recommande ${dem(c.sortie)}${c.sortie.fr} !`,
          en: `I recommend this ${c.sortie.enBare}!`,
        },
        { fr: `Il faut y aller !`, en: `You have to go!` },
        { fr: `Vous devez y aller !`, en: `You must go!` },
        { fr: `On peut y aller ce soir.`, en: `We can go there this evening.` },
        { fr: `${c.quand.fr}, on peut y aller.`, en: `${c.quand.en}, we can go there.` },
        {
          fr: `Vous devez goûter ${def(c.plat)}${c.plat.fr} !`,
          en: `You must try the ${c.plat.en}!`,
        },
      ]),
  ],
);

export const UNIT4: UnitTextGen = {
  unit: 4,
  title: "À table !",
  scenarios: [MES_REPAS, LES_COURSES, AU_RESTAURANT],
};
