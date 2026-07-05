/**
 * Compose It — phrase-bank registry. One bank per composable situation:
 * the learner builds their own sentences (solo) or their side of a scripted
 * dialogue (dialogue) by tapping categorised chips. This absorbed the former
 * Weather/Directions unit pages (dissolved 2026-07-05) — the only content
 * that survived is the directions phrase bank, ported verbatim from the
 * retired DirectionsMapGame.
 */

export type ComposeCategory = { label: string; chip: string; phrases: string[] };

/** Dialogue banks: the AI persona the learner talks to (drives ComposeDialogue). */
export type DialogueScene = {
  opening: string; // the persona's first line
  emoji: string; // avatar on the persona's chat bubbles
  voice: "m" | "f"; // TTS voice for the persona
  /** No rule-engine fallback (only the café has one). When the AI backend is
   *  absent, show a friendly "needs connection" notice rather than accepting
   *  nonsense. Every scene except the café sets this. */
  aiOnly?: boolean;
};

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
  /** Solo mode: a fresh prompt. Random — call only from handlers/mount effects. */
  newScenario(): { instructionEn: string; headline: string };
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

const MAP_PLACES = [
  { name: "le parc", emoji: "🌳" },
  { name: "le café", emoji: "☕" },
  { name: "le cinéma", emoji: "🎬" },
  { name: "le musée", emoji: "🏛️" },
  { name: "le stade", emoji: "🏟️" },
  { name: "la gare", emoji: "🚉" },
  { name: "la banque", emoji: "🏦" },
  { name: "la pharmacie", emoji: "💊" },
  { name: "la poste", emoji: "📮" },
  { name: "la bibliothèque", emoji: "📚" },
  { name: "l'hôtel", emoji: "🏨" },
  { name: "l'école", emoji: "🏫" },
  { name: "l'aéroport", emoji: "✈️" },
  { name: "l'hôpital", emoji: "🏥" },
];

function pickRandomPair<T>(arr: T[]): [T, T] {
  const a = arr[Math.floor(Math.random() * arr.length)];
  let b = a;
  while (b === a) b = arr[Math.floor(Math.random() * arr.length)];
  return [a, b];
}

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
      label: "Verbs",
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
      label: "Completions",
      phrases: [
        "du parc",
        "de la station de métro",
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
      label: "Connectors",
      phrases: ["puis", "ensuite", ", et", "d'abord", "enfin", ", "],
    },
  ]),
  newScenario() {
    const [a, b] = pickRandomPair(MAP_PLACES);
    return {
      headline: `${a.emoji} ${a.name} → ${b.emoji} ${b.name}`,
      instructionEn: `Give directions from ${a.name} to ${b.name} — tap phrases to build each sentence.`,
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
  scene: { opening: "Bonsoir ! Vous désirez ?", emoji: "🤵", voice: "m" },
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
  scene: { opening: "Salut ! Ça va ?", emoji: "🙋", voice: "f", aiOnly: true },
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
  scene: { opening: "Tu es libre ce week-end ? Tu veux venir au cinéma ?", emoji: "🙋‍♂️", voice: "m", aiOnly: true },
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
  scene: { opening: "Bonjour ! Je peux vous aider ?", emoji: "🛍️", voice: "f", aiOnly: true },
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
// Registry
// ---------------------------------------------------------------------------

const BANKS: ComposeBank[] = [DIRECTIONS_BANK, CAFE_BANK, GREETINGS_BANK, RENDEZVOUS_BANK, SHOP_BANK];

export function listComposeBanks(): ComposeBank[] {
  return BANKS;
}

export function getComposeBank(id: string): ComposeBank | undefined {
  return BANKS.find((b) => b.id === id);
}

export function composeBankForDeck(deckId: string): ComposeBank | undefined {
  return BANKS.find((b) => b.deckId === deckId);
}
