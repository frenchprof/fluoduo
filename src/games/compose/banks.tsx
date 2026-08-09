/**
 * Compose It — phrase-bank registry. One bank per composable situation:
 * the learner builds their own sentences (solo) or their side of a scripted
 * dialogue (dialogue) by tapping categorised chips. This absorbed the former
 * Weather/Directions unit pages (dissolved 2026-07-05) — the only content
 * that survived is the directions phrase bank, ported verbatim from the
 * retired DirectionsMapGame.
 */

import { PRODUCTION_BANKS } from "./banks-production";

export type ComposeCategory = { label: string; chip: string; phrases: string[] };

/** Per-persona colourway for the dialogue chrome (bubbles, buttons, inputs).
 *  Each field maps to a CSS variable read by ComposeDialogue. */
export type DialogueTheme = {
  edge: string; // light border — persona bubble, containers, inputs
  strong: string; // accent — learner bubble border, button fills, focus ring
  deep: string; // deep shade — button lip, accent text
  personaBg: string; // persona bubble background (light tint)
  meBg: string; // learner bubble background
  ink: string; // body text colour
};

/** Dialogue banks: the AI persona the learner talks to (drives ComposeDialogue). */
export type DialogueScene = {
  opening: string; // the persona's first line
  emoji: string; // avatar on the persona's chat bubbles
  voice: "m" | "f"; // TTS voice for the persona
  /** One-line English reminder of who/where the learner is — shown above the
   *  chat for the whole session (Dan, 2026-07-19). */
  contextEn?: string;
  /** No rule-engine fallback (only the café has one). When the AI backend is
   *  absent, show a friendly "needs connection" notice rather than accepting
   *  nonsense. Every scene except the café sets this. */
  aiOnly?: boolean;
  /** Colourway; omitted → café warm-brown default. */
  theme?: DialogueTheme;
};

// Persona palettes — one hue family each, warm and legible on paper.
const THEME_CAFE: DialogueTheme = { edge: "#e8c49a", strong: "#d98e46", deep: "#b96f2e", personaBg: "#fff8ef", meBg: "#ffdcb3", ink: "#4a2c14" };
const THEME_GREEN: DialogueTheme = { edge: "#bfe0b6", strong: "#5aa657", deep: "#3d7a3d", personaBg: "#f1fbee", meBg: "#d6f0cf", ink: "#22401f" };
const THEME_PURPLE: DialogueTheme = { edge: "#cdbdea", strong: "#8b6fd0", deep: "#6247a0", personaBg: "#f5f0fc", meBg: "#e2d7f6", ink: "#2a1c4a" };
const THEME_BLUE: DialogueTheme = { edge: "#b7d4ea", strong: "#4a90c2", deep: "#33698f", personaBg: "#eef6fb", meBg: "#cfe6f5", ink: "#123650" };

export type ComposeBank = {
  id: string;
  title: string;
  emoji: string;
  unit: number;
  deckId: string; // which deck's activity rail this bank attaches to
  mode: "solo" | "dialogue";
  /** Solo banks only: offer an AI "check my work" pass (POSTs to /api/compose
   *  with scene=id). Directions used to accept anything with nothing checking
   *  the French (Dan, 2026-07-05) — this closes that gap without turning the
   *  builder into a full back-and-forth dialogue. */
  aiCheck?: boolean;
  /** Dialogue banks: the persona config for ComposeDialogue. */
  scene?: DialogueScene;
  categories: ComposeCategory[];
  /** Solo mode: a fresh prompt. Random — call only from handlers/mount effects.
   *  openingFr, when present, is a persona line that opens the scene (spoken +
   *  shown) so the Composer never starts on a blank sheet (Dan, 2026-07-19). */
  newScenario(): { instructionEn: string; headline: string; openingFr?: string };
};

/** Fixed chip/header palette by category index (same hues as the original game). */
const PALETTE = [
  { header: "bg-blue-100 text-blue-900", chip: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100" },
  { header: "bg-emerald-100 text-emerald-900", chip: "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
  { header: "bg-purple-100 text-purple-900", chip: "border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100" },
  { header: "bg-amber-100 text-amber-900", chip: "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" },
  { header: "bg-rose-100 text-rose-900", chip: "border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100" },
] as const;

export function categoryHeaderClass(index: number): string {
  return PALETTE[index % PALETTE.length].header;
}

function withPalette(cats: { label: string; phrases: string[] }[]): ComposeCategory[] {
  return cats.map((c, i) => ({ ...c, chip: PALETTE[i % PALETTE.length].chip }));
}

// ---------------------------------------------------------------------------
// Directions (ported verbatim from DirectionsMapGame, retired 2026-07-05)
// ---------------------------------------------------------------------------

// `exit` is the contracted "sortir de" form — scenarios START from a place
// that has one, so step 1 « D'abord, vous sortez … » is always composable
// from the bank's chips (Dan, 2026-07-08).
const MAP_PLACES = [
  { name: "le parc", emoji: "🌳", exit: "du parc" },
  { name: "le café", emoji: "☕", exit: "du café" },
  { name: "le cinéma", emoji: "🎬" },
  { name: "le musée", emoji: "🏛️", exit: "du musée" },
  { name: "le stade", emoji: "🏟️" },
  { name: "la gare", emoji: "🚉", exit: "de la gare" },
  { name: "la banque", emoji: "🏦", exit: "de la banque" },
  { name: "la pharmacie", emoji: "💊" },
  { name: "la poste", emoji: "📮" },
  { name: "la bibliothèque", emoji: "📚" },
  { name: "l'hôtel", emoji: "🏨", exit: "de l'hôtel" },
  { name: "l'école", emoji: "🏫" },
  { name: "l'aéroport", emoji: "✈️" },
  { name: "l'hôpital", emoji: "🏥" },
  { name: "la station de métro", emoji: "🚇", exit: "de la station de métro" },
];

const DIRECTIONS_BANK: ComposeBank = {
  id: "directions",
  title: "Quel est le chemin pour … ?",
  emoji: "🧭",
  unit: 3,
  deckId: "directions-matching",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    {
      // Directions stay VOUS throughout — you give them to strangers (Dan).
      label: "Verbs (vous)",
      phrases: [
        "Vous sortez",
        "Vous allez",
        "Vous continuez",
        "Vous tournez",
        "Vous prenez",
        "Vous traversez",
        "Vous êtes",
      ],
    },
    {
      label: "D'abord : sortir de…",
      phrases: [
        "du parc",
        "du café",
        "du musée",
        "de la gare",
        "de la banque",
        "de l'hôtel",
        "de la station de métro",
      ],
    },
    {
      label: "Completions",
      phrases: [
        "tout droit",
        "jusqu'au carrefour",
        "au bout de la rue",
        "à gauche",
        "à droite",
        "la première rue à gauche",
        "la deuxième rue à droite",
        "le passage piéton",
        "le pont",
        "la place",
        "arrivé(e)",
      ],
    },
    {
      label: "Rues (streets)",
      phrases: [
        "la rue de la République",
        "l'avenue Victor-Hugo",
        "le boulevard Saint-Michel",
        "la rue du Marché",
      ],
    },
    {
      label: "Connectors",
      phrases: ["d'abord", "puis", "ensuite", ", et", "enfin", ", "],
    },
  ]),
  newScenario() {
    // Start from a place whose "sortir de" chip exists; end anywhere else.
    const starts = MAP_PLACES.filter((p) => p.exit);
    const a = starts[Math.floor(Math.random() * starts.length)];
    let b = MAP_PLACES[Math.floor(Math.random() * MAP_PLACES.length)];
    while (b.name === a.name) b = MAP_PLACES[Math.floor(Math.random() * MAP_PLACES.length)];
    // « aller à + le X » contracts: au parc / à la gare / à l'hôtel.
    const dest = b.name.startsWith("le ") ? `au ${b.name.slice(3)}` : `à ${b.name}`;
    return {
      headline: `${a.emoji} ${a.name} → ${b.emoji} ${b.name}`,
      instructionEn: `Directions from ${a.name} to ${b.name}. Start: « D'abord, vous sortez ${a.exit}… » — then street by street to ${b.name}.`,
      openingFr: `Excusez-moi, pour aller ${dest}, s'il vous plaît ?`,
    };
  },
};

// ---------------------------------------------------------------------------
// Au café (scripted waiter dialogue)
// ---------------------------------------------------------------------------

/** Menu prices, keyed by the exact chip phrase — summed for the waiter's bill. */
export const CAFE_PRICES: Record<string, number> = {
  "un croissant": 2,
  "un sandwich au fromage": 5,
  "une salade verte": 6,
  "une soupe à l'oignon": 7,
  "un steak-frites": 12,
  "une crêpe au chocolat": 4,
  "un café": 3,
  "un thé": 3,
  "un jus d'orange": 4,
  "une eau minérale": 3,
  "un coca": 4,
};

const CAFE_BANK: ComposeBank = {
  id: "cafe",
  title: "Au café",
  emoji: "☕",
  unit: 4,
  deckId: "aliments",
  mode: "dialogue",
  scene: { opening: "Bonsoir ! Vous désirez ?", emoji: "🤵", voice: "m", theme: THEME_CAFE, contextEn: "You're the customer at a café — order food and drink from the waiter, then ask for the bill." },
  categories: withPalette([
    { label: "Commander", phrases: ["Je voudrais", "Je prends", "Pour moi,"] },
    {
      label: "Plats",
      phrases: [
        "un croissant",
        "un sandwich au fromage",
        "une salade verte",
        "une soupe à l'oignon",
        "un steak-frites",
        "une crêpe au chocolat",
      ],
    },
    {
      label: "Boissons",
      phrases: ["un café", "un thé", "un jus d'orange", "une eau minérale", "un coca"],
    },
    { label: "Politesse", phrases: ["s'il vous plaît", "et", "aussi", "merci"] },
    { label: "Terminer", phrases: ["C'est tout", "Non, merci", "Au revoir"] },
  ]),
  newScenario() {
    return {
      headline: "☕ Au café",
      instructionEn: "Order dinner at the café — answer the waiter by tapping phrases.",
    };
  },
};

// ---------------------------------------------------------------------------
// Se saluer (AI classmate — greetings & small talk)
// ---------------------------------------------------------------------------

const GREETINGS_BANK: ComposeBank = {
  id: "greetings",
  title: "Se saluer",
  emoji: "👋",
  unit: 1,
  deckId: "salutations",
  mode: "dialogue",
  scene: { opening: "Salut ! Ça va ?", emoji: "🙋", voice: "f", aiOnly: true, theme: THEME_GREEN, contextEn: "A friend runs into you in the street — greet her, ask how she is, then say goodbye." },
  categories: withPalette([
    { label: "Saluer", phrases: ["Bonjour", "Salut", "Bonsoir", "Coucou"] },
    { label: "Ça va", phrases: ["Ça va bien", "Très bien", "Ça va, merci", "Comme ci comme ça", "Et toi ?"] },
    { label: "Se présenter", phrases: ["Je m'appelle", "Moi, c'est", "Enchanté", "Enchantée"] },
    { label: "Prendre congé", phrases: ["Au revoir", "À bientôt", "À demain", "Bonne journée", "Salut !"] },
  ]),
  newScenario() {
    return { headline: "👋 Se saluer", instructionEn: "Greet your classmate and chat — answer by tapping phrases." };
  },
};

// ---------------------------------------------------------------------------
// Prendre rendez-vous (AI friend — invite, accept, refuse, arrange)
// ---------------------------------------------------------------------------

const RENDEZVOUS_BANK: ComposeBank = {
  id: "rendezvous",
  title: "Prendre rendez-vous",
  emoji: "📅",
  unit: 2,
  deckId: "vouloir-inviter",
  mode: "dialogue",
  scene: { opening: "Tu es libre ce week-end ? Tu veux venir au cinéma ?", emoji: "🙋‍♂️", voice: "m", aiOnly: true, theme: THEME_PURPLE, contextEn: "A friend is inviting you out — accept, or suggest another day, place or time." },
  categories: withPalette([
    { label: "Accepter", phrases: ["Oui, je veux bien", "Bonne idée", "D'accord", "Avec plaisir"] },
    { label: "Refuser", phrases: ["Désolé, je ne peux pas", "Je ne suis pas libre", "Une autre fois"] },
    { label: "Proposer", phrases: ["On peut se voir samedi", "Tu es libre dimanche", "à quelle heure ?", "On se retrouve où ?"] },
    { label: "Politesse", phrases: ["merci", "s'il te plaît", "à bientôt"] },
  ]),
  newScenario() {
    return { headline: "📅 Prendre rendez-vous", instructionEn: "A friend invites you out — accept, decline, or arrange a day." };
  },
};

// ---------------------------------------------------------------------------
// À la papeterie (AI shopkeeper — buy objects, ask the price)
// ---------------------------------------------------------------------------

const SHOP_BANK: ComposeBank = {
  id: "magasin",
  title: "À la papeterie",
  emoji: "🛍️",
  unit: 2,
  deckId: "objets-articles",
  mode: "dialogue",
  scene: { opening: "Bonjour ! Je peux vous aider ?", emoji: "🛍️", voice: "f", aiOnly: true, theme: THEME_BLUE, contextEn: "You're at the stationery shop — ask for what you need and the price, then pay." },
  categories: withPalette([
    { label: "Demander", phrases: ["Je voudrais", "Je cherche", "Avez-vous"] },
    { label: "Objets", phrases: ["un cahier", "un stylo", "un crayon", "une trousse", "une gomme", "un sac", "des ciseaux"] },
    { label: "Quantité / prix", phrases: ["deux", "trois", "C'est combien ?", "Ça fait combien ?"] },
    { label: "Terminer", phrases: ["s'il vous plaît", "C'est tout", "merci", "Au revoir"] },
  ]),
  newScenario() {
    return { headline: "🛍️ À la papeterie", instructionEn: "Buy what you need at the stationery shop — answer the shopkeeper." };
  },
};

// ---------------------------------------------------------------------------
// Chez les commerçants (AI shopkeeper across the SIO-044/045 shops — the
// client/marchand dialogue Dan asked for on 4.5, 2026-07-15). The AI runs
// whichever shop sells what the client asks for first, redirects them to
// the right commerce when they ask the wrong one, and closes with the
// total + change — the full « Et avec ceci ? » exchange.
// ---------------------------------------------------------------------------

const THEME_MARCHE: DialogueTheme = { edge: "#f0c0a4", strong: "#d96f3f", deep: "#a84f26", personaBg: "#fdf3ec", meBg: "#f8d9c6", ink: "#4a2210" };

const MARCHE_BANK: ComposeBank = {
  id: "marche",
  title: "Chez les commerçants",
  emoji: "🧺",
  unit: 4,
  deckId: "au-marche",
  mode: "dialogue",
  scene: { opening: "Bonjour ! Vous désirez ?", emoji: "🧑‍🌾", voice: "m", aiOnly: true, theme: THEME_MARCHE, contextEn: "You're shopping at the market stall — ask for quantities and prices, then pay." },
  categories: withPalette([
    { label: "Demander", phrases: ["Bonjour", "Je voudrais", "Je vais prendre", "Vous avez", "Il me faut"] },
    {
      label: "Produits",
      phrases: [
        "une baguette",
        "un gâteau",
        "du poulet",
        "du saumon",
        "un kilo de pommes",
        "deux kilos de pommes de terre",
        "des fraises",
        "une tranche de jambon",
        "un livre",
      ],
    },
    { label: "Prix", phrases: ["Ça fait combien ?", "C'est combien ?", "C'est cher !"] },
    { label: "Payer", phrases: ["Voilà dix euros", "Voilà vingt euros"] },
    { label: "Terminer", phrases: ["s'il vous plaît", "et", "aussi", "C'est tout", "merci", "Au revoir"] },
  ]),
  newScenario() {
    return {
      headline: "🧺 Chez les commerçants",
      instructionEn: "Buy what you need — the shopkeeper runs whichever shop sells it (boulangerie, marché, boucherie…).",
    };
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const BANKS: ComposeBank[] = [DIRECTIONS_BANK, CAFE_BANK, GREETINGS_BANK, RENDEZVOUS_BANK, SHOP_BANK, MARCHE_BANK, ...PRODUCTION_BANKS];

export function listComposeBanks(): ComposeBank[] {
  return BANKS;
}

export function getComposeBank(id: string): ComposeBank | undefined {
  return BANKS.find((b) => b.id === id);
}

export function composeBankForDeck(deckId: string): ComposeBank | undefined {
  return BANKS.find((b) => b.deckId === deckId);
}
