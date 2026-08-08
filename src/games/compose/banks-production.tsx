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
 * Six banks close that. Four solo (written production, aiCheck on), two
 * dialogue (interactive production). Vocabulary is drawn only from decks the
 * learner has already met at that point in the sequence, so composing is a
 * retrieval task rather than a reading-comprehension one.
 *
 * EVIDENCE NOTE: everything produced here is free production. Per PRD §7 and
 * §8, an AI check changes how the evidence should be read — assistance must be
 * tagged on the response so `independent` and `ai-checked` never collapse into
 * one mastery signal. See DATA_INTEGRITY / evidence-schema work.
 */
import type { ComposeBank, ComposeCategory, DialogueTheme } from "./banks";

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
    { label: "Épeler", phrases: ["Ça s'écrit", "Comment ça s'écrit ?", "avec un", "deux"] },
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
const COUNTRIES = [
  { fr: "le Canada", emoji: "🇨🇦", lang: "le français et l'anglais" },
  { fr: "la Suisse", emoji: "🇨🇭", lang: "le français, l'allemand et l'italien" },
  { fr: "le Sénégal", emoji: "🇸🇳", lang: "le français" },
  { fr: "la Belgique", emoji: "🇧🇪", lang: "le français et le néerlandais" },
  { fr: "le Maroc", emoji: "🇲🇦", lang: "l'arabe et le français" },
  { fr: "le Viêt Nam", emoji: "🇻🇳", lang: "le vietnamien" },
] as const;

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
    { label: "Habitants", phrases: ["Les habitants sont", "canadiens", "suisses", "sénégalais", "belges", "marocains"] },
    { label: "Opinion", phrases: ["J'aime", "J'adore", "parce que", "Je voudrais visiter"] },
  ]),
  newScenario() {
    const c = pick(COUNTRIES, Math.floor(Date.now() / 60000));
    return {
      headline: `${c.emoji} ${c.fr}`,
      instructionEn: `Write three or four sentences presenting ${c.fr}: where it is, what language is spoken, and why it interests you.`,
      openingFr: `Parle-moi de ${c.fr} ! Où est-ce ? On y parle quelle langue ?`,
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
    { label: "Souhaits", phrases: ["Bon anniversaire", "Bonne chance", "Bon courage", "Bon rétablissement", "Félicitations"] },
    { label: "Proposer", phrases: ["On peut", "Tu veux", "si tu veux", "ce week-end"] },
    { label: "Finir", phrases: ["À bientôt", "Bises", "Amitiés", "Écris-moi"] },
  ]),
  newScenario() {
    const o = pick(OCCASIONS, Math.floor(Date.now() / 60000));
    return {
      headline: `${o.emoji} ${o.fr}`,
      instructionEn: `Write a short friendly message for ${o.en}. Open it, use at least two connectors, add your good wishes, and sign off.`,
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

/** The six production banks, in curriculum order. Register these in banks.tsx's
 *  BANKS array so getComposeBank() and the SIO activity rail can find them. */
export const PRODUCTION_BANKS: ComposeBank[] = [
  FIRST_MEETING_BANK,
  PRESENT_COUNTRY_BANK,
  EMAIL_BANK,
  ITINERARY_BANK,
  REVIEW_BANK,
  RESTAURANT_SCENE_BANK,
];
