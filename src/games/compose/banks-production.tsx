/**
 * Compose banks for the six ◆ Communication outcomes.
 *
 * WHY THIS FILE EXISTS (activity→outcome audit, 2026-08-08):
 * SIO-010, 020, 030, 040, 049 and 050 are the curriculum's integrative
 * performance outcomes — the ones defined by *doing something with an
 * interlocutor or audience*, where the task can succeed or fail. All six are
 * `isProduction: true` in sios.json and correctly carry no deck: they are not
 * drillable.
 *
 * But nothing had replaced the deck. Each of the six had exactly ONE activity
 * attached — GramMarathon Finale cloze — so "I can get by in a restaurant from
 * arrival to paying" was being evidenced by typing single words into gapped
 * sentences. PRD §7 ranks independent production above recognition, and §6
 * Goal 2 measures "success on free-production tasks", so the outcomes that most
 * demand production had the least production evidence in the product.
 *
 * Six banks closed that — four solo (written production, aiCheck on), two
 * dialogue (interactive production). A seventh, « L'e-carte postale », joined
 * on 2026-08-23: the book's U3 written atelier had no app counterpart
 * (syllabus audit row 3.1), and Dan's decision presents it at stop 40 beside
 * the itinerary, SIOs untouched. Vocabulary is drawn only from decks the
 * learner has already met at that point in the sequence, so composing is a
 * retrieval task rather than a reading-comprehension one.
 *
 * EVIDENCE NOTE: everything produced here is free production. Per PRD §7 and
 * §8, an AI check changes how the evidence should be read — assistance must be
 * tagged on the response so `independent` and `ai-checked` never collapse into
 * one mastery signal. See DATA_INTEGRITY / evidence-schema work.
 */
import type { ComposeBank, ComposeCategory, DialogueTheme } from "./banks";
// The app's one source of French morphology — see its header: every article in
// a generated text comes from here, so a lexicon entry never hand-types "du".
import { def, deLe } from "@/lib/textgen/french";
import type { Gram } from "@/lib/textgen/types";

const THEME_ROSE: DialogueTheme = { edge: "#eec4cc", strong: "#c9677f", deep: "#a04a60", personaBg: "#fdf1f3", meBg: "#f8d9df", ink: "#4a1c28" };
const THEME_SAND: DialogueTheme = { edge: "#e3d4b0", strong: "#b99a52", deep: "#8f7538", personaBg: "#fdfaf1", meBg: "#f0e4c6", ink: "#403418" };

const PALETTE = [
  { header: "bg-blue-100 text-blue-900", chip: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100" },
  { header: "bg-emerald-100 text-emerald-900", chip: "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
  { header: "bg-purple-100 text-purple-900", chip: "border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100" },
  { header: "bg-amber-100 text-amber-900", chip: "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" },
  { header: "bg-rose-100 text-rose-900", chip: "border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100" },
] as const;

function withPalette(cats: { label: string; phrases: string[] }[]): ComposeCategory[] {
  return cats.map((c, i) => ({ ...c, chip: PALETTE[i % PALETTE.length].chip }));
}

const pick = <T,>(xs: readonly T[], i: number): T => xs[i % xs.length];

// ---------------------------------------------------------------------------
// SIO-010 · Unité 0 · First meeting role-play  (dialogue)
// ---------------------------------------------------------------------------
export const FIRST_MEETING_BANK: ComposeBank = {
  id: "premiere-rencontre",
  title: "Première rencontre",
  emoji: "🤝",
  unit: 0,
  deckId: "atelier-sio-010",
  mode: "dialogue",
  scene: {
    opening: "Bonjour ! Moi, c'est Camille. Et toi, comment tu t'appelles ?",
    emoji: "🙋‍♀️",
    voice: "f",
    aiOnly: true,
    theme: THEME_ROSE,
    contextEn: "First day of class. A classmate introduces herself — greet her, give your name, spell it, and say goodbye.",
  },
  categories: withPalette([
    { label: "Saluer", phrases: ["Bonjour", "Salut", "Bonsoir"] },
    { label: "Se présenter", phrases: ["Je m'appelle", "Moi, c'est", "Et toi ?", "Enchanté", "Enchantée"] },
    { label: "Ça s'écrit", phrases: ["Ça s'écrit", "Comment ça s'écrit ?", "avec un", "deux"] },
    { label: "Politesse", phrases: ["s'il te plaît", "merci", "de rien"] },
    { label: "Partir", phrases: ["Au revoir", "À bientôt", "À demain", "Bonne journée"] },
  ]),
  newScenario() {
    return {
      headline: "🤝 Première rencontre",
      instructionEn: "Meet a new classmate: greet her, introduce yourself, spell your name, and say goodbye.",
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-020 · Unité 1 · Mini-text: present a country  (solo, written)
// ---------------------------------------------------------------------------
/* THE ARTICLE IS COMPUTED, NEVER TYPED (2026-09-12).
 *
 * These entries used to carry the article in the string — `fr: "le Canada"` —
 * and the opening line was built by joining: `"Parle-moi de " + c.fr`. French
 * does not allow that: `de + le` contracts to `du`. FOUR OF THE SIX COUNTRIES
 * therefore opened the scene in broken French, from the app's own mouth:
 *
 *     « Parle-moi de le Canada ! »     « Parle-moi de le Sénégal ! »
 *     « Parle-moi de le Maroc ! »      « Parle-moi de le Viêt Nam ! »
 *
 * That is the fault the 1 Sep ruling draws a line at. A LEARNER's wrong
 * contraction is a legitimate distractor — "could a learner have made this?" —
 * but « Bon chance » was cut from the atelier cards because the FRAME printed
 * it. Same here: nobody chose « de le ».
 *
 * So the entry carries its FEATURES and `lib/textgen/french.ts` builds every
 * article, which is that module's own stated doctrine: "a lexicon entry only
 * ever carries its features — never a hand-typed du". Reusing it also means
 * this bank cannot drift from the rest of the app's morphology.
 *
 * `people` is here for the same reason the article is: the [Habitants] chip
 * list used to be hand-typed and had FIVE adjectives for SIX countries, so a
 * learner who drew Viêt Nam could not finish "Les habitants sont …". The
 * chips are generated from this array below, so the two can never disagree
 * again. */
const COUNTRIES = [
  { name: "Canada",   g: "m", people: "canadiens",   emoji: "🇨🇦", lang: "le français et l'anglais" },
  { name: "Suisse",   g: "f", people: "suisses",     emoji: "🇨🇭", lang: "le français, l'allemand et l'italien" },
  { name: "Sénégal",  g: "m", people: "sénégalais",  emoji: "🇸🇳", lang: "le français" },
  { name: "Belgique", g: "f", people: "belges",      emoji: "🇧🇪", lang: "le français et le néerlandais" },
  { name: "Maroc",    g: "m", people: "marocains",   emoji: "🇲🇦", lang: "l'arabe et le français" },
  { name: "Viêt Nam", g: "m", people: "vietnamiens", emoji: "🇻🇳", lang: "le vietnamien" },
] as const satisfies readonly (Gram & { name: string; people: string; emoji: string; lang: string })[];

/** « le Canada » / « la Suisse » — the name as it is spoken about. */
const countryName = (c: (typeof COUNTRIES)[number]) => `${def(c)}${c.name}`;
/** « du Canada » / « de la Suisse » — after `parler de`, `près de`, … */
const ofCountry = (c: (typeof COUNTRIES)[number]) => `${deLe(c)}${c.name}`;

export const PRESENT_COUNTRY_BANK: ComposeBank = {
  id: "presenter-pays",
  title: "Présenter un pays",
  emoji: "🌍",
  unit: 1,
  deckId: "atelier-sio-020",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Situer", phrases: ["C'est", "Il est", "Elle est", "en Europe", "en Afrique", "en Asie", "en Amérique"] },
    { label: "Langues", phrases: ["On parle", "la langue officielle est", "et", "aussi"] },
    { label: "Décrire", phrases: ["C'est un pays", "grand", "petit", "magnifique", "intéressant"] },
    // Generated from COUNTRIES, so a country added without its adjective is
    // impossible rather than merely unlikely.
    { label: "Habitants", phrases: ["Les habitants sont", ...COUNTRIES.map((c) => c.people)] },
    { label: "Opinion", phrases: ["J'aime", "J'adore", "parce que", "Je voudrais visiter"] },
  ]),
  newScenario() {
    const c = pick(COUNTRIES, Math.floor(Date.now() / 60000));
    return {
      headline: `${c.emoji} ${countryName(c)}`,
      instructionEn: `Write three or four sentences presenting ${countryName(c)}: where it is, what language is spoken, and why it interests you.`,
      openingFr: `Parle-moi ${ofCountry(c)} ! Où est-ce ? On y parle quelle langue ?`,
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-030 · Unité 2 · Well wishes + connectors, a short email  (solo, written)
// ---------------------------------------------------------------------------
const OCCASIONS = [
  { en: "a friend's birthday", fr: "l'anniversaire d'un ami", emoji: "🎂" },
  { en: "a classmate's exam tomorrow", fr: "l'examen d'un camarade", emoji: "📝" },
  { en: "a friend who is ill", fr: "un ami malade", emoji: "🤒" },
  { en: "a friend moving to a new flat", fr: "un déménagement", emoji: "📦" },
  // Washed-down e-carte flavour (Dan, 2026-08-23): the same short email can
  // read as a mini holiday note — where you are + what you enjoy, with the
  // Unité-2 chips below. NO weather here (Unité 3): the FULL « L'e-carte
  // postale » atelier is POSTCARD_BANK, presented at stop 40.
  {
    en: "a friend back home — a quick hello from your trip",
    fr: "un petit bonjour de voyage",
    emoji: "🏖️",
    task: "Open it, say where you are and what you enjoy there, and sign off.",
  },
] as const;

export const EMAIL_BANK: ComposeBank = {
  id: "petit-message",
  title: "Un petit message",
  emoji: "✉️",
  unit: 2,
  deckId: "atelier-sio-030",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Commencer", phrases: ["Salut", "Cher", "Chère", "Bonjour"] },
    { label: "Connecteurs", phrases: ["d'abord", "et puis", "aussi", "mais", "alors", "enfin"] },
    { label: "Souhaits", phrases: ["Bon anniversaire", "Bonne chance", "Bon voyage", "Bonne année", "Bonne fête", "Bon courage", "Bon rétablissement", "Félicitations"] },
    { label: "Où je suis", phrases: ["Je suis à", "Paris", "Nice", "Singapour"] },
    { label: "Raconter", phrases: ["J'aime", "je fais du sport", "je vais à la plage", "C'est super"] },
    { label: "Proposer", phrases: ["On peut", "Tu veux", "si tu veux", "ce week-end"] },
    { label: "Finir", phrases: ["À bientôt", "Bises", "Amitiés", "Écris-moi"] },
  ]),
  newScenario() {
    const o = pick(OCCASIONS, Math.floor(Date.now() / 60000));
    return {
      headline: `${o.emoji} ${o.fr}`,
      instructionEn: `Write a short friendly message for ${o.en}. ${"task" in o ? o.task : "Open it, use at least two connectors, add your good wishes, and sign off."}`,
      openingFr: "Écris-lui un petit message — quelques phrases suffisent.",
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-040 · Unité 3 · Describe itinerary steps with connectors  (solo, written)
//
// Distinct from the `directions` bank (SIO-036), which is about ASKING for and
// GIVING directions. This one is about SEQUENCING a journey you already know —
// the connectors carry the load, not the prepositions.
// ---------------------------------------------------------------------------
const JOURNEYS = [
  { en: "from home to the university", fr: "de chez toi à l'université", emoji: "🎓" },
  { en: "from the station to the museum", fr: "de la gare au musée", emoji: "🏛️" },
  { en: "from your flat to the market", fr: "de ton appartement au marché", emoji: "🧺" },
  { en: "from the airport to the hotel", fr: "de l'aéroport à l'hôtel", emoji: "🏨" },
] as const;

export const ITINERARY_BANK: ComposeBank = {
  id: "itineraire",
  title: "Mon itinéraire",
  emoji: "🗺️",
  unit: 3,
  deckId: "atelier-sio-040",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Ordre", phrases: ["D'abord", "Ensuite", "Puis", "Après", "Enfin"] },
    { label: "Partir / arriver", phrases: ["je sors de", "je pars de", "j'arrive à", "je vais à", "je continue"] },
    { label: "Transport", phrases: ["à pied", "en bus", "en métro", "en train", "à vélo"] },
    { label: "Durée", phrases: ["ça prend", "dix minutes", "un quart d'heure", "une demi-heure", "environ"] },
    { label: "Repères", phrases: ["tout droit", "à gauche", "à droite", "en face de", "à côté de"] },
  ]),
  newScenario() {
    const j = pick(JOURNEYS, Math.floor(Date.now() / 60000));
    return {
      headline: `${j.emoji} ${j.fr}`,
      instructionEn: `Explain your journey ${j.en}, step by step. Use at least three ordering connectors and say how you travel.`,
      openingFr: `Comment tu fais pour aller ${j.fr} ? Raconte-moi étape par étape.`,
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-040 · Unité 3 · « L'e-carte postale » — the book's U3 written atelier
//
// The guide closes Unité 3 with a written e-postcard (A1U3 livre p. 55, guide
// p. 111): opening formula → where you are → the weather → what you're doing →
// closing formula. Model card: « Cher Majed, Maintenant, je suis à Nairobi.
// C'est nuageux mais il fait chaud. […] À bientôt, Taher ». The syllabus audit
// (row 3.1) found no app counterpart; Dan's decision (2026-08-23): present the
// full atelier at stop 40 next to the itinerary, SIOs untouched — so this bank
// shares deckId atelier-sio-040 and deckActivityTabs gives each bank on a deck
// its own flap. The paper checklist (timbre, code postal…) is print-only and
// stays out: this is the E-carte. Weather chips are the weather-letris family,
// incl. the nuageux/ensoleillé items added 2026-08-23.
// ---------------------------------------------------------------------------
const TRIPS = [
  { en: "in Paris", fr: "à Paris", emoji: "🗼" },
  { en: "in the Philippines", fr: "aux Philippines", emoji: "🏝️" },
  { en: "in Canada", fr: "au Canada", emoji: "🇨🇦" },
  { en: "in Japan", fr: "au Japon", emoji: "🗾" },
] as const;

export const POSTCARD_BANK: ComposeBank = {
  id: "e-carte-postale",
  title: "L'e-carte postale",
  emoji: "🏖️",
  unit: 3,
  deckId: "atelier-sio-040",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Commencer", phrases: ["Salut", "Cher", "Chère", "Bonjour"] },
    { label: "Où je suis", phrases: ["Je suis", "On est", "à Paris", "aux Philippines", "au Canada", "au Japon"] },
    { label: "La météo", phrases: ["Il fait beau", "Il fait chaud", "C'est ensoleillé", "C'est nuageux", "Il y a des nuages", "Il pleut", "mais"] },
    { label: "Activités", phrases: ["je visite", "on peut visiter", "je vais à la plage", "on prend le métro", "le musée", "C'est magnifique"] },
    { label: "Finir", phrases: ["À bientôt", "Bises", "Écris-moi", "Au revoir"] },
  ]),
  newScenario() {
    const t = pick(TRIPS, Math.floor(Date.now() / 60000));
    return {
      headline: `${t.emoji} ${t.fr}`,
      instructionEn: `You are ${t.en}. Write your e-postcard to a friend: open it, say where you are, give the weather, tell what you are doing, and sign off.`,
      openingFr: `Alors, c'est comment ${t.fr} ? Quel temps fait-il ? Qu'est-ce que tu fais ?`,
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-049 · Unité 4 · Reviewing a restaurant  (solo, written)
// ---------------------------------------------------------------------------
const VENUES = [
  { fr: "Chez Marcel", emoji: "🍽️", kind: "un petit restaurant de quartier" },
  { fr: "Le Bistro du Coin", emoji: "🥖", kind: "un bistro" },
  { fr: "La Crêperie Bretonne", emoji: "🥞", kind: "une crêperie" },
  { fr: "Le Café des Arts", emoji: "☕", kind: "un café" },
] as const;

export const REVIEW_BANK: ComposeBank = {
  id: "avis-restaurant",
  title: "Mon avis",
  emoji: "⭐",
  unit: 4,
  deckId: "atelier-sio-049",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Positif", phrases: ["J'aime", "J'adore", "C'est très bon", "délicieux", "excellent", "pas cher"] },
    { label: "Négatif", phrases: ["Je n'aime pas", "C'est trop cher", "trop salé", "trop long", "pas assez"] },
    { label: "Nuancer", phrases: ["mais", "par contre", "un peu", "assez", "très", "vraiment"] },
    { label: "Détails", phrases: ["le service", "l'ambiance", "les plats", "le dessert", "l'addition"] },
    { label: "Conclure", phrases: ["Je recommande", "Je ne recommande pas", "J'y retourne", "En général"] },
  ]),
  newScenario() {
    const v = pick(VENUES, Math.floor(Date.now() / 60000));
    return {
      headline: `${v.emoji} ${v.fr}`,
      instructionEn: `Write a short review of ${v.fr}, ${v.kind}. Give one good point and one bad point, and say whether you recommend it.`,
      openingFr: `Alors, ${v.fr} — c'était comment ? Dis-moi ce qui était bien et ce qui était moins bien.`,
    };
  },
};

// ---------------------------------------------------------------------------
// SIO-050 · Unité 4 · Role-play: restaurant scene  (dialogue)
//
// The full arc — arrive, order, eat, ask for the bill, pay, leave. Deliberately
// broader than the `cafe` bank (SIO-041), which stops at ordering.
// ---------------------------------------------------------------------------
export const RESTAURANT_SCENE_BANK: ComposeBank = {
  id: "au-restaurant",
  title: "Au restaurant",
  emoji: "🍽️",
  unit: 4,
  deckId: "atelier-sio-050",
  mode: "dialogue",
  scene: {
    opening: "Bonsoir ! Vous avez réservé ? Une table pour combien de personnes ?",
    emoji: "🧑‍🍳",
    voice: "f",
    aiOnly: true,
    theme: THEME_SAND,
    contextEn: "You're arriving at a restaurant for dinner. Get a table, order a full meal, ask for the bill, pay, and leave politely.",
  },
  categories: withPalette([
    { label: "Arriver", phrases: ["Bonsoir", "une table pour deux", "J'ai réservé", "au nom de", "près de la fenêtre"] },
    { label: "Commander", phrases: ["Je voudrais", "Comme entrée", "Comme plat", "Comme dessert", "Et pour boire"] },
    { label: "Demander", phrases: ["Qu'est-ce que vous recommandez ?", "C'est quoi", "Il y a", "sans", "avec"] },
    { label: "Pendant le repas", phrases: ["C'est délicieux", "encore un peu", "de l'eau, s'il vous plaît", "Tout va bien"] },
    { label: "Payer et partir", phrases: ["L'addition, s'il vous plaît", "par carte", "en espèces", "Merci beaucoup", "Bonne soirée"] },
  ]),
  newScenario() {
    return {
      headline: "🍽️ Au restaurant",
      instructionEn: "Dinner from arrival to departure: get your table, order a starter, main and dessert, then ask for the bill and pay.",
    };
  },
};

/** The production banks, in curriculum order. Register these in banks.tsx's
 *  BANKS array so getComposeBank() and the SIO activity rail can find them.
 *  ORDER MATTERS on a shared deck: the FIRST bank with a deckId is the rail's
 *  registry-chrome ComposeIt flap and the Index's compose cell — the itinerary
 *  keeps that slot on atelier-sio-040; the e-carte rides behind it. */
export const PRODUCTION_BANKS: ComposeBank[] = [
  FIRST_MEETING_BANK,
  PRESENT_COUNTRY_BANK,
  EMAIL_BANK,
  ITINERARY_BANK,
  POSTCARD_BANK,
  REVIEW_BANK,
  RESTAURANT_SCENE_BANK,
];
