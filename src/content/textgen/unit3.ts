/**
 * Unité 3 — « En ville ». Three scenarios, all built from what a learner has
 * after SIO-031…040 (and everything before): places in town with à + article,
 * spatial prepositions with de + article, on peut + infinitive, the book's
 * vous-present directions (vous prenez / vous tournez — piste 66; falloir is
 * U4, so no « il faut » here), transport with the pronoun y,
 * en/au/aux/à + country, weather, and the
 * itinerary connectors d'abord / ensuite / enfin.
 *
 * Cohesion here is the unit's own grammar doing double duty: the connectors
 * sequence the steps, `y` and `c'est` refer back to the place named in the
 * first sentence, so the text hangs together without one word from beyond
 * the unit. Every headword below is traceable to a curated deck of unit ≤ 3 —
 * scripts/check-textgen.mjs fails if one drifts out.
 *
 * Two constraints shape every beat:
 *   • PLAUSIBLE — referents are drawn as bound pairs, never independently, so
 *     the weather never sends you walking in a storm and no itinerary ends
 *     where it started.
 *   • NEVER TWICE — every beat draws its wording as well as its words, so no
 *     sentence position is a constant that would repeat on the second listen.
 */

import { aLe, deLe, def } from "../../lib/textgen/french";
import { first, firstEn, pick, pickOther, scenario, then_, thenEn } from "../../lib/textgen/engine";
import type { Destination, Noun, UnitTextGen } from "../../lib/textgen/types";

/* ── Lexicon ─────────────────────────────────────────────────────────────── */

/** Places in town (deck: lieux-letris). `en` carries its English article. */
const LIEUX: Noun[] = [
  { fr: "café", en: "the café", g: "m" },
  { fr: "restaurant", en: "the restaurant", g: "m" },
  { fr: "cinéma", en: "the cinema", g: "m" },
  { fr: "musée", en: "the museum", g: "m" },
  { fr: "parc", en: "the park", g: "m" },
  { fr: "stade", en: "the stadium", g: "m" },
  { fr: "marché", en: "the market", g: "m" },
  { fr: "banque", en: "the bank", g: "f" },
  { fr: "pharmacie", en: "the pharmacy", g: "f" },
  { fr: "bibliothèque", en: "the library", g: "f" },
  { fr: "gare", en: "the train station", g: "f" },
  { fr: "poste", en: "the post office", g: "f" },
  { fr: "piscine", en: "the pool", g: "f" },
  { fr: "mairie", en: "the town hall", g: "f" },
  { fr: "hôpital", en: "the hospital", g: "m", vowel: true },
  { fr: "église", en: "the church", g: "f", vowel: true },
  { fr: "école", en: "the school", g: "f", vowel: true },
  { fr: "université", en: "the university", g: "f", vowel: true },
  { fr: "aéroport", en: "the airport", g: "m", vowel: true },
  { fr: "hôtel", en: "the hotel", g: "m", vowel: true },
  { fr: "arrêt de bus", en: "the bus stop", g: "m", vowel: true },
  { fr: "jardins publics", en: "the public gardens", g: "m", pl: true },
];

/** Spatial prepositions that take de + article (deck: loin-lesson). */
const SPATIAL = [
  { fr: "à côté", en: "next to" },
  { fr: "en face", en: "opposite" },
  { fr: "près", en: "near" },
  { fr: "loin", en: "far from" },
  { fr: "à droite", en: "to the right of" },
  { fr: "à gauche", en: "to the left of" },
];

/** Transport that shelters you — what one takes when the weather turns.
 *  `prendre` is the deck's other frame for the same mode (deck: transport). */
const TRANSPORT_ABRITE = [
  { fr: "en bus", en: "by bus", prendre: "prendre le bus", prendreEn: "take the bus" },
  { fr: "en métro", en: "by metro", prendre: "prendre le métro", prendreEn: "take the metro" },
  { fr: "en voiture", en: "by car", prendre: "prendre la voiture", prendreEn: "take the car" },
  { fr: "en train", en: "by train", prendre: "prendre le train", prendreEn: "take the train" },
];
/** Transport in the open air — only plausible in good weather. */
const TRANSPORT_OUVERT = [
  { fr: "à pied", en: "on foot" },
  { fr: "à vélo", en: "by bike" },
];
const TRANSPORT = [...TRANSPORT_ABRITE, ...TRANSPORT_OUVERT];

// Only the ordinals the directions deck actually shows — « troisième » is
// not on a card yet, so it is not in a listening text.
const ORDINALS = [
  { fr: "première", en: "first" },
  { fr: "deuxième", en: "second" },
];

const SIDES = [
  { fr: "à droite", en: "right" },
  { fr: "à gauche", en: "left" },
];

/** Middle-of-the-itinerary moves (deck: directions-matching), in the on-form
 *  SIO-036 teaches — the syllabus gives directions without the imperative. */
const ETAPES = [
  { fr: "on va tout droit jusqu'au carrefour", en: "you go straight ahead as far as the intersection" },
  { fr: "on continue tout droit", en: "you carry straight on" },
  { fr: "on traverse la place", en: "you cross the square" },
  { fr: "on traverse le pont", en: "you cross the bridge" },
  { fr: "on traverse le passage piéton", en: "you cross at the crosswalk" },
];

/** What one can do somewhere (decks: pouvoir, lieux-letris). */
const ACTIVITES = [
  { fr: "se promener", en: "walk around" },
  { fr: "visiter le musée", en: "visit the museum" },
  { fr: "prendre un café", en: "have a coffee" },
  { fr: "regarder un film", en: "watch a film" },
  { fr: "acheter les billets", en: "buy the tickets" },
  { fr: "manger", en: "eat" },
];

/** Weather, lower-case so it embeds mid-sentence (deck: weather-letris).
 *  `beau` marks the conditions you'd willingly walk or cycle in. */
const METEO = [
  { fr: "il fait beau", en: "the weather is nice", beau: true },
  { fr: "il fait chaud", en: "the weather is hot", beau: true },
  { fr: "il y a du soleil", en: "there is sunshine", beau: true },
  { fr: "il fait froid", en: "the weather is cold", beau: false },
  { fr: "il y a du vent", en: "there is wind", beau: false },
  { fr: "il pleut", en: "it is raining", beau: false },
];

/** Countries and cities with their fixed preposition (deck: en-au-aux-a). */
/** `proche` = reachable overland from France, so the text can offer a train
 *  or a bus. Everything else only ever gets a plane or a boat — the bound
 *  draw is what keeps « on peut prendre le bus » out of a trip to China. */
const DESTINATIONS: (Destination & { proche?: boolean })[] = [
  { fr: "France", en: "France", prep: "en ", enPrep: "to ", proche: true },
  { fr: "Italie", en: "Italy", prep: "en ", enPrep: "to ", proche: true },
  { fr: "Espagne", en: "Spain", prep: "en ", enPrep: "to ", proche: true },
  { fr: "Chine", en: "China", prep: "en ", enPrep: "to " },
  { fr: "Inde", en: "India", prep: "en ", enPrep: "to " },
  { fr: "Japon", en: "Japan", prep: "au ", enPrep: "to " },
  { fr: "Canada", en: "Canada", prep: "au ", enPrep: "to " },
  { fr: "Portugal", en: "Portugal", prep: "au ", enPrep: "to ", proche: true },
  { fr: "Brésil", en: "Brazil", prep: "au ", enPrep: "to " },
  { fr: "États-Unis", en: "the United States", prep: "aux ", enPrep: "to " },
  { fr: "Pays-Bas", en: "the Netherlands", prep: "aux ", enPrep: "to ", proche: true },
  { fr: "Philippines", en: "the Philippines", prep: "aux ", enPrep: "to " },
  { fr: "Paris", en: "Paris", prep: "à ", enPrep: "to ", proche: true },
  { fr: "Tokyo", en: "Tokyo", prep: "à ", enPrep: "to " },
  { fr: "Londres", en: "London", prep: "à ", enPrep: "to ", proche: true },
  { fr: "Singapour", en: "Singapore", prep: "à ", enPrep: "to " },
];

/** What a trip needs (deck: envies-besoins). All start with a vowel sound,
 *  so « j'ai besoin d' » is always elided. */
const BESOINS = [
  { fr: "un hôtel", en: "a hotel" },
  { fr: "un plan", en: "a map" },
  { fr: "un billet", en: "a ticket" },
  { fr: "une chambre pour deux personnes", en: "a room for two" },
];

/** Long-haul transport for the travel scenario, with the deck's prendre
 *  frame alongside the en/à frame (deck: transport). */
const VOYAGE_LOIN = [
  { fr: "en avion", en: "by plane", prendre: "prendre l'avion", prendreEn: "take the plane" },
  { fr: "en bateau", en: "by boat", prendre: "prendre le bateau", prendreEn: "take the boat" },
];
const VOYAGE_PROCHE = [
  { fr: "en train", en: "by train", prendre: "prendre le train", prendreEn: "take the train" },
  { fr: "en bus", en: "by bus", prendre: "prendre le bus", prendreEn: "take the bus" },
  { fr: "en voiture", en: "by car", prendre: "prendre la voiture", prendreEn: "take the car" },
  { fr: "en avion", en: "by plane", prendre: "prendre l'avion", prendreEn: "take the plane" },
];

/* ── Scenarios ───────────────────────────────────────────────────────────── */

/**
 * L'itinéraire — the model text of SIO-040, generated. Sentence 1 names the
 * destination; every later sentence points back at it with `c'est` or `y`,
 * so the destination is said once and referred to four times.
 */
const ITINERAIRE = scenario(
  "itineraire",
  (r) => {
    const dest = pick(r, LIEUX);
    return {
      dest,
      landmark: pickOther(r, LIEUX, dest),
      spatial: pick(r, SPATIAL),
      ord: pick(r, ORDINALS),
      side: pick(r, SIDES),
      etape: pick(r, ETAPES),
      etapeCible: pickOther(r, LIEUX, dest),
      transport: pick(r, TRANSPORT),
      transportAbrite: pick(r, TRANSPORT_ABRITE),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Pour aller ${aLe(c.dest)}${c.dest.fr}, c'est facile.`,
          en: `To get to ${c.dest.en}, it's easy.`,
        },
        {
          fr: `Vous voulez aller ${aLe(c.dest)}${c.dest.fr} ?`,
          en: `You want to go to ${c.dest.en}?`,
        },
        {
          fr: `${def(c.dest)}${c.dest.fr}, ce n'est pas loin.`,
          en: `${c.dest.en} isn't far.`,
        },
      ]),
    (c, p, r) =>
      pick(r, [
        {
          fr: `${first(p)}vous prenez la ${c.ord.fr} rue ${c.side.fr}.`,
          en: `${firstEn(p)}you take the ${c.ord.en} street on the ${c.side.en}.`,
        },
        {
          fr: `${first(p)}on prend la ${c.ord.fr} rue ${c.side.fr}.`,
          en: `${firstEn(p)}you take the ${c.ord.en} street on the ${c.side.en}.`,
        },
        {
          fr: `${first(p)}vous tournez ${c.side.fr} au carrefour.`,
          en: `${firstEn(p)}you turn ${c.side.en} at the intersection.`,
        },
        {
          fr: `${first(p)}on tourne ${c.side.fr} ${aLe(c.landmark)}${c.landmark.fr}.`,
          en: `${firstEn(p)}you turn ${c.side.en} at ${c.landmark.en}.`,
        },
      ]),
    (c, p, r) =>
      pick(r, [
        { fr: `${then_(p)}${c.etape.fr}.`, en: `${thenEn(p)}${c.etape.en}.` },
        {
          fr: `${then_(p)}${c.etape.fr} jusqu'${aLe(c.etapeCible)}${c.etapeCible.fr}.`,
          en: `${thenEn(p)}${c.etape.en} as far as ${c.etapeCible.en}.`,
        },
      ]),
    (c, p) => ({
      fr: `${p.last ? "Enfin, " : ""}c'est ${c.spatial.fr} ${deLe(c.landmark)}${c.landmark.fr}.`,
      en: `${p.last ? "Finally, " : ""}it's ${c.spatial.en} ${c.landmark.en}.`,
    }),
    (c, p, r) =>
      pick(r, [
        {
          fr: `${then_(p)}on peut aussi y aller ${c.transport.fr}.`,
          en: `${thenEn(p)}you can also get there ${c.transport.en}.`,
        },
        {
          fr: `${then_(p)}on y va ${c.transport.fr} : c'est facile.`,
          en: `${thenEn(p)}you get there ${c.transport.en}: it's easy.`,
        },
        {
          fr: `${then_(p)}on peut aussi ${c.transportAbrite.prendre}.`,
          en: `${thenEn(p)}you can also ${c.transportAbrite.prendreEn}.`,
        },
      ]),
  ],
);

/**
 * Mon lieu préféré — a place presented, located, reached, used. The closing
 * beat picks its transport FROM THE WEATHER (open-air only when it's fine),
 * which is the plausibility rule doing visible work.
 */
const MON_LIEU = scenario(
  "mon-lieu",
  (r) => {
    const place = pick(r, LIEUX);
    const meteo = pick(r, METEO);
    return {
      place,
      landmark: pickOther(r, LIEUX, place),
      spatial: pick(r, SPATIAL),
      transport: pick(r, TRANSPORT),
      activite: pick(r, ACTIVITES),
      meteo,
      meteoTransport: pick(r, meteo.beau ? TRANSPORT_OUVERT : TRANSPORT_ABRITE),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Mon lieu préféré, c'est ${def(c.place)}${c.place.fr}.`,
          en: `My favourite place is ${c.place.en}.`,
        },
        {
          fr: `J'aime beaucoup ${def(c.place)}${c.place.fr}.`,
          en: `I really like ${c.place.en}.`,
        },
        {
          fr: `${def(c.place)}${c.place.fr}, c'est mon lieu préféré.`,
          en: `${c.place.en} — that's my favourite place.`,
        },
      ]),
    (c) => ({
      fr: `c'est ${c.spatial.fr} ${deLe(c.landmark)}${c.landmark.fr}.`,
      en: `it's ${c.spatial.en} ${c.landmark.en}.`,
    }),
    (c, p, r) =>
      pick(r, [
        { fr: `${p.last ? "Enfin, " : ""}j'y vais ${c.transport.fr}.`, en: `${p.last ? "Finally, " : ""}I go there ${c.transport.en}.` },
        { fr: `${p.last ? "Enfin, " : ""}on y va ${c.transport.fr}.`, en: `${p.last ? "Finally, " : ""}we go there ${c.transport.en}.` },
        { fr: `${p.last ? "Enfin, " : ""}nous y allons ${c.transport.fr}.`, en: `${p.last ? "Finally, " : ""}we go there ${c.transport.en}.` },
      ]),
    (c, p, r) =>
      pick(r, [
        {
          fr: `${p.last ? "Enfin, " : ""}on peut ${c.activite.fr}.`,
          en: `${p.last ? "Finally, " : ""}you can ${c.activite.en}.`,
        },
        {
          fr: `${p.last ? "Enfin, " : ""}ici, on peut ${c.activite.fr}.`,
          en: `${p.last ? "Finally, " : ""}here, you can ${c.activite.en}.`,
        },
        {
          fr: `${p.last ? "Enfin, " : ""}on y va pour ${c.activite.fr}.`,
          en: `${p.last ? "Finally, " : ""}we go there to ${c.activite.en}.`,
        },
      ]),
    (c, p) => ({
      fr: `${p.last ? "Enfin, " : ""}quand ${c.meteo.fr}, j'y vais ${c.meteoTransport.fr}.`,
      en: `${p.last ? "Finally, " : ""}when ${c.meteo.en}, I go there ${c.meteoTransport.en}.`,
    }),
  ],
);

/** Le voyage — en/au/aux/à + country, wants and needs, weather over there. */
const LE_VOYAGE = scenario(
  "le-voyage",
  (r) => {
    const dest = pick(r, DESTINATIONS);
    return {
      dest,
      besoin: pick(r, BESOINS),
      transport: pick(r, dest.proche ? VOYAGE_PROCHE : VOYAGE_LOIN),
      meteo: pick(r, METEO),
      activite: pick(r, ACTIVITES),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Je voudrais aller ${c.dest.prep}${c.dest.fr}.`,
          en: `I would like to go ${c.dest.enPrep}${c.dest.en}.`,
        },
        {
          fr: `J'ai envie d'aller ${c.dest.prep}${c.dest.fr}.`,
          en: `I feel like going ${c.dest.enPrep}${c.dest.en}.`,
        },
        {
          fr: `En été, je vais ${c.dest.prep}${c.dest.fr}.`,
          en: `In summer I go ${c.dest.enPrep}${c.dest.en}.`,
        },
      ]),
    (c, p, r) =>
      pick(r, [
        { fr: `${first(p)}j'ai besoin d'${c.besoin.fr}.`, en: `${firstEn(p)}I need ${c.besoin.en}.` },
        { fr: `${first(p)}je voudrais ${c.besoin.fr}.`, en: `${firstEn(p)}I'd like ${c.besoin.en}.` },
        { fr: `${first(p)}j'aimerais ${c.besoin.fr}.`, en: `${firstEn(p)}I'd love ${c.besoin.en}.` },
      ]),
    (c, p, r) =>
      pick(r, [
        { fr: `${then_(p)}j'y vais ${c.transport.fr}.`, en: `${thenEn(p)}I'm going there ${c.transport.en}.` },
        { fr: `${then_(p)}on y va ${c.transport.fr}.`, en: `${thenEn(p)}we're going there ${c.transport.en}.` },
        { fr: `${then_(p)}on peut ${c.transport.prendre}.`, en: `${thenEn(p)}you can ${c.transport.prendreEn}.` },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `Là-bas, ${c.meteo.fr}.`, en: `Over there, ${c.meteo.en}.` },
        { fr: `${c.meteo.fr} là-bas.`, en: `${c.meteo.en} over there.` },
      ]),
    (c, p, r) =>
      pick(r, [
        { fr: `${then_(p)}on peut ${c.activite.fr}.`, en: `${thenEn(p)}you can ${c.activite.en}.` },
        { fr: `${then_(p)}je voudrais ${c.activite.fr}.`, en: `${thenEn(p)}I'd like to ${c.activite.en}.` },
      ]),
  ],
);

export const UNIT3: UnitTextGen = {
  unit: 3,
  title: "En ville",
  scenarios: [ITINERAIRE, MON_LIEU, LE_VOYAGE],
};
