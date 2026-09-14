/**
 * Compose It — phrase-bank registry. One bank per composable situation:
 * the learner builds their own sentences (solo) or their side of a scripted
 * dialogue (dialogue) by tapping categorised chips. This absorbed the former
 * Weather/Directions unit pages (dissolved 2026-07-05) — the only content
 * that survived is the directions phrase bank, ported verbatim from the
 * retired DirectionsMapGame.
 */

import { PRODUCTION_BANKS } from "./banks-production";
// The chip lists below are GENERATED FROM THE DECKS THEY TEACH, not retyped
// beside them. Same doctrine as `COUNTRIES` in banks-production: a bank cannot
// offer a word its own deck does not teach, and cannot miss one it does.
import OBJETS from "@/content/collections/objets-articles.json";
import ALIMENTS from "@/content/collections/aliments.json";
import { aLe } from "@/lib/textgen/french";
import type { Requirement } from "@/lib/compose/required";

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
  mode: "solo" | "dialogue" | "unscramble";
  /** Solo banks only: offer an AI "check my work" pass (POSTs to /api/compose
   *  with scene=id). Directions used to accept anything with nothing checking
   *  the French (Dan, 2026-07-05) — this closes that gap without turning the
   *  builder into a full back-and-forth dialogue. */
  aiCheck?: boolean;
  /** Dialogue banks: the persona config for ComposeDialogue. */
  scene?: DialogueScene;
  /* ── A WRITTEN TASK WITH A WORD LIST (2026-09-14) ──────────────────────
   * A written task of the classic revision shape: *"Voici une liste de mots,
   * utilisez 10 mots minimum. N'oubliez pas de conjuguer les verbes dans la
   * liste. (50 – 60 mots)"*. Two constraints the composer had no way to
   * express — how many of a given list you used, and how long the piece is —
   * and both are what stop a learner writing only the words they already
   * know.
   *
   * A bank without these behaves exactly as before: no checklist, no counter.
   */
  /** The list the learner must draw from, and how many of it they must use. */
  required?: { words: Requirement[]; min: number };
  /** The length the task asks for, in words. */
  lengthGoal?: { min: number; max: number };
  categories: ComposeCategory[];
  /** Solo mode: a fresh prompt. Random — call only from handlers/mount effects.
   *  openingFr, when present, is a persona line that opens the scene (spoken +
   *  shown) so the Composer never starts on a blank sheet (Dan, 2026-07-19). */
  newScenario(): {
    instructionEn: string;
    headline: string;
    openingFr?: string;
    /** ONE QUESTION AT A TIME (Dan, 2026-09-12: *"ComposeIt for Vietnam would
     *  only make sense for the learner if there were a model reference text on
     *  another country. Or if the questions were asked one by one!"*).
     *
     *  SIO-020's can-do ends *"…if I can prepare"*, and the composer offered
     *  no preparation at all: a blank sheet, a country, and a pile of chips.
     *  Asking in turn is the preparation, and it also ENFORCES the four
     *  elements the competence scores — name, location, language, one cultural
     *  fact — where a single open instruction merely hoped for them.
     *
     *  The live question is `prompts[lines.length]`: the index IS the number of
     *  sentences already committed, so the sequence advances on ✔ with no state
     *  machine of its own and no way for the two to fall out of step. A bank
     *  that omits this behaves exactly as before, from `openingFr`.
     *
     *  `use` NAMES THE CHIP GROUP THAT ANSWERS THE QUESTION, and the composer
     *  floats it to the top. Dan, 2026-09-12: *"IS THE ANSWER GUIDED FOR
     *  CLUELESS LEARNER? E.G. ARE THERE PHRASES THEY CAN START WITH OR PICK
     *  FROM"* — the phrases were always there, six groups of them, but nothing
     *  tied them to the question on screen, so the learner had to work out
     *  which group was the right one before they could begin. Surfacing it
     *  needs no extra words: the group simply arrives first. */
    prompts?: { ask: string; use?: string }[];
    /** Shown once every prompt is answered — a finished paragraph about a
     *  DIFFERENT subject from the one the learner was given, so it is a shape
     *  to compare against and never an answer to copy. */
    model?: { label: string; text: string };
  };
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

// ---------------------------------------------------------------------------
// Les quatre repas (solo — SIO-041: say what you eat and drink at each meal)
//
// SIO-041 HAD NO EXERCISE OF ITS OWN. Its deck is `aliments`, « Les repas et
// les aliments — What I eat & drink at each meal », and the only ComposeIt bank
// on it was `Au café` — ordering from a waiter. Ordering uses the same words,
// which is why nobody noticed, but it is not the goal: the competence is
// *"Name the 4 meals and ≥2 foods/drinks each; say what I eat/drink"*, and a
// café order names no meal and says nothing about what the learner eats. It
// says what they want, once, now.
//
// So the goal gets a bank that IS the goal, and `Au café` keeps its place on
// the deck as the exchange that applies the same vocabulary — it is also the
// one ComposeIt scene with a rule-engine fallback, so retargeting it would
// have cost the only exercise that works with the backend down. (If the café
// should leave stop 41 altogether that is a one-line `deckId` move and it is
// Dan's call, because it changes what the map shows.)
//
// FOUR QUESTIONS, ONE PER MEAL, using the machinery built for Présenter un pays
// the same day: the competence counts four meals, so the exercise asks four
// times rather than hoping an open instruction produces them.
// ---------------------------------------------------------------------------

/** The four meals, as « Au petit-déjeuner » — the sentence opener, not the
 *  dictionary form. Generated from the deck's own `col:repas` items, and the
 *  preposition comes from `aLe()` rather than being typed: the app never spells
 *  a contraction by hand (see verify440's first clause, and « de le Canada »
 *  for what happens when it does). */
const REPAS: string[] = ALIMENTS.items
  .filter((i) => i.tags?.includes("col:repas"))
  .map((i) => {
    const bare = i.fr.replace(/^(le |la |les |l')/, "");
    const at = aLe({ g: i.gender === "f" ? "f" : "m", vowel: /^l'/.test(i.fr) });
    return at.charAt(0).toUpperCase() + at.slice(1) + bare;
  });

/** The drinks, straight off the deck's own `col:boissons` tag — the deck
 *  already carries each one's partitive (« du café », « de l'eau »), so the
 *  chip is literally what the deck teaches. */
const BOISSONS_REPAS: string[] = ALIMENTS.items
  .filter((i) => i.tags?.includes("col:boissons"))
  .map((i) => i.fr);

/** The food a learner needs to answer four times over. A NAMED SUBSET, not the
 *  whole deck: `aliments` carries forty-two entries including de la farine, du
 *  sel and de l'huile — ingredients, not meals — and a forty-chip group is a
 *  wall rather than a palette. Every entry here must exist in the deck, which
 *  verify440 checks; the check is what makes a hand-written list safe. */
const ALIMENTS_REPAS: string[] = [
  "du pain", "du beurre", "de la confiture", "un croissant", "un œuf",
  "du fromage", "du jambon", "du poulet", "du poisson", "du riz",
  "des pâtes", "de la salade", "de la soupe", "des frites", "un sandwich",
  "une pomme", "une banane", "un gâteau", "du chocolat", "une glace",
];

const MEALS_BANK: ComposeBank = {
  id: "repas",
  title: "Les quatre repas",
  emoji: "🥣",
  unit: 4,
  deckId: "aliments",
  mode: "solo",
  aiCheck: true,
  categories: withPalette([
    { label: "Le repas", phrases: REPAS },
    /* THE COMMA IS A CHIP, because the sentence needs one and the learner has
       no keyboard here: « Au petit-déjeuner, je mange… ». The composer already
       knows how to render it (`", "` prints as «,  (comma)») and how to join it
       without a space in front — `directions` has carried one since it was
       ported. Its absence was found by the model clause, which could not build
       its own model out of this bank's chips. */
    { label: "Manger et boire", phrases: ["je mange", "je prends", "je bois", "et", "avec", ", ", "je ne mange rien"] },
    { label: "À manger", phrases: ALIMENTS_REPAS },
    { label: "À boire", phrases: BOISSONS_REPAS },
  ]),
  newScenario() {
    return {
      headline: "🥣 Une journée de repas",
      instructionEn: "Say what you eat and drink at each of the four meals — one meal at a time.",
      /* Each answer OPENS with the meal, which is why all four point at the
         same group: the competence scores naming the four meals, and a learner
         who answers « je mange du pain » has said nothing the goal counts. */
      prompts: [
        { ask: "Alors, qu'est-ce que tu prends le matin ?", use: "Le repas" },
        { ask: "Et à midi ?", use: "Le repas" },
        { ask: "Tu prends quelque chose vers quatre heures ?", use: "Le repas" },
        { ask: "Et le soir, qu'est-ce que tu manges ?", use: "Le repas" },
      ],
      /* Somebody else's day, shown only once the learner's four are written.
         Every phrase in it is a chip they were given — verify440 fails the
         build if that ever stops being true. */
      model: {
        label: "🇫🇷 La journée de Léa — un modèle",
        text: "Au petit-déjeuner, je mange du pain et je bois du café. "
          + "Au déjeuner, je prends du riz avec du poulet. "
          + "Au goûter, je mange un gâteau. "
          + "Au dîner, je prends de la soupe et du fromage.",
      },
    };
  },
};

const CAFE_BANK: ComposeBank = {
  id: "cafe",
  title: "Au café",
  emoji: "☕",
  unit: 4,
  deckId: "aliments",
  mode: "dialogue",
  scene: { opening: "Bonsoir ! Vous désirez ?", emoji: "🤵", voice: "m", theme: THEME_CAFE, /* "then ask for the bill" was wrong, and reading the rule engine is what
     showed it (2026-09-12). ComposeDialogue's café flow presents the bill the
     moment the learner CLOSES the order — « C'est tout » or « Non, merci » —
     and its `pay` stage then accepts any polite close, « merci » or
     « Au revoir ». The learner never asks, and there is no chip to ask with.
     Nothing is missing from the bank; the sentence was describing a different
     café. It is now what actually happens. */
  contextEn: "You're the customer at a café — order food and drink from the waiter, say when you've finished, and close politely when he brings the bill." },
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
      instructionEn: "Order at the café — answer the waiter by tapping phrases, then close politely.",
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
  /* THE SCENE IS A FIRST MEETING, not a friend in the street (Dan, 2026-09-12).
   *
   * It used to say "A friend runs into you" and open « Salut ! Ça va ? », while
   * handing the learner [Se présenter] — « Je m'appelle », « Enchanté ». You do
   * not tell a friend your name, and « Enchanté » means "delighted to MEET
   * you": it exists only at a first meeting. The persona is AI-driven, so it
   * followed the learner's lead — offered an introduction, it asked for a name,
   * and Dan watched a friend ask a friend what she was called.
   *
   * THE DECK HAD ALREADY DECIDED THIS. `salutations.json`, the deck this bank
   * attaches to, teaches « Enchanté ! — Nice to meet you! » as one of its
   * fourteen items. The scene was contradicting its own vocabulary list; the
   * chips were right and the situation was wrong, which is why the fix is here
   * and not in the chips.
   *
   * It does not collide with `premiere-rencontre` (Unit 0), which is also a
   * first meeting: that one is the first day of CLASS and its subject is
   * SPELLING your name aloud (« Ça s'écrit… »). This one is the salutations
   * deck's own subject — picking the right greeting and the right way to leave.
   * Léa, not Camille, so nobody reads them as the same person. */
  scene: { opening: "Bonjour ! Moi, c'est Léa. Enchantée !", emoji: "🙋", voice: "f", aiOnly: true, theme: THEME_GREEN, contextEn: "You are meeting Léa for the first time — greet her, say your name, ask how she is, then say goodbye." },
  categories: withPalette([
    { label: "Saluer", phrases: ["Bonjour", "Salut", "Bonsoir", "Coucou"] },
    { label: "Ça va", phrases: ["Ça va bien", "Très bien", "Ça va, merci", "Comme ci comme ça", "Et toi ?"] },
    { label: "Se présenter", phrases: ["Je m'appelle", "Moi, c'est", "Enchanté", "Enchantée"] },
    { label: "Prendre congé", phrases: ["Au revoir", "À bientôt", "À demain", "Bonne journée", "Salut !"] },
  ]),
  newScenario() {
    // "classmate" is gone with the friend: the old line said classmate while
    // the context said friend — two relationships in one lesson.
    return { headline: "👋 Se saluer", instructionEn: "Meet someone new — greet her, give your name, ask how she is, then say goodbye." };
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
// Aux objets trouvés (AI clerk — SIO-021: name objects, ask what something is)
//
// THIS WAS « À la papeterie » AND THE SHOP WAS THE PROBLEM (Dan, 2026-09-12:
// *"what matters is the SIO attached. we need to think of scenarios in which
// those SIOs are applied strictly, no distraction and irrelevant deviation
// with payment and what not"*).
//
// SIO-021's can-do is "I can point out and name objects and people and ask what
// something is", and its competence scores « c'est + un/une », « ce sont + des »
// and « C'est quoi ? ». A shop is a TRANSACTION: « Je voudrais », « Avez-vous »,
// a price, a goodbye — none of which the goal contains, and two of which the
// app already trains properly elsewhere (`marche` on SIO-044, `au-restaurant`
// on SIO-050). Three shopping scenes, one of them standing where a naming
// exercise should be.
//
// AND THE VOCABULARY GAVE IT AWAY. The deck is « Un, une ou des ? » and five of
// its twenty items — un passeport, une carte d'identité, un portefeuille, des
// lunettes, une clé — are not sold in a stationery shop by anybody. They ARE
// exactly what turns up at a lost-property desk, along with all the rest of it.
// The clerk lays things on the counter and asks what they are; the learner
// names them and asks « C'est quoi ? » for the ones they don't know. That is
// the goal, said out loud, with nothing else in the room.
//
// The KEY and the ROUTE stay `magasin` — the Memo-rename precedent: a display
// rename never moves a URL someone may have bookmarked.
// ---------------------------------------------------------------------------

/** The deck's twenty objects, BARE — « sac », not « un sac ». The article is
 *  the learner's decision and it is the whole of what SIO-021 scores, so the
 *  chips must not make it for them. (A learner who picks « une sac » has made
 *  the mistake this exercise exists to train out — Dan, 2026-09-01: a wrong
 *  answer is allowed to be wrong French.) */
const OBJET_NOMS: string[] = OBJETS.items.map((o) => o.fr);

const SHOP_BANK: ComposeBank = {
  id: "magasin",
  title: "Aux objets trouvés",
  emoji: "🧳",
  unit: 2,
  deckId: "objets-articles",
  mode: "dialogue",
  scene: {
    opening: "Bureau des objets trouvés, bonjour ! Regardez ce que j'ai ici… Qu'est-ce que c'est ?",
    emoji: "🧳",
    voice: "f",
    aiOnly: true,
    theme: THEME_BLUE,
    contextEn: "You're at the lost-property desk — the clerk holds things up one by one. Say what each one is, and ask what it is when you don't know the word.",
  },
  categories: withPalette([
    { label: "Identifier", phrases: ["C'est", "Ce sont", "Ce n'est pas"] },
    // SEPARATE FROM THE NOUNS ON PURPOSE — see OBJET_NOMS above.
    { label: "Un, une ou des ?", phrases: ["un", "une", "des"] },
    { label: "Les objets", phrases: OBJET_NOMS },
    { label: "Demander", phrases: ["C'est quoi ?", "Qu'est-ce que c'est ?", "Je ne sais pas", "Comment ça s'écrit ?"] },
    { label: "Réclamer", phrases: ["C'est à moi", "Ce n'est pas à moi", "Bonjour", "merci", "Au revoir"] },
  ]),
  newScenario() {
    return {
      headline: "🧳 Aux objets trouvés",
      instructionEn: "Name each thing the clerk holds up — c'est un…, c'est une…, ce sont des… — and ask « C'est quoi ? » when you don't know the word.",
    };
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
  // au-marche merged into commerces (content-gap audit, 2026-08-23) — the
  // bank pointed at the retired id and never showed on any rail.
  deckId: "commerces",
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

// MEALS_BANK BEFORE CAFE_BANK, and the order is load-bearing: both sit on
// `aliments`, and composeBanksForDeck() gives the deck's rail flap to the
// FIRST bank it finds. The goal's own exercise takes that slot.
const BANKS: ComposeBank[] = [DIRECTIONS_BANK, MEALS_BANK, CAFE_BANK, GREETINGS_BANK, RENDEZVOUS_BANK, SHOP_BANK, MARCHE_BANK, ...PRODUCTION_BANKS];

export function listComposeBanks(): ComposeBank[] {
  return BANKS;
}

export function getComposeBank(id: string): ComposeBank | undefined {
  return BANKS.find((b) => b.id === id);
}

/** Every bank attached to one deck's activity rail, in BANKS order. Most decks
 *  carry at most one; atelier-sio-040 carries two since the book's U3 written
 *  atelier landed (Dan, 2026-08-23): the itinerary AND « L'e-carte postale »
 *  are both presented at stop 40, with the SIOs untouched. */
export function composeBanksForDeck(deckId: string): ComposeBank[] {
  return BANKS.filter((b) => b.deckId === deckId);
}
