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
/* `where` and `fact` carry the two elements the competence names and the bank
 * could not previously produce. SIO-020 scores "all 4 elements present (name,
 * location, language, ONE CULTURAL FACT)", and the old task asked instead for
 * "why it interests you" — an opinion where the assessment wants a fact. Both
 * fields are short enough to be a chip and plain enough for Unit 1. */
const COUNTRIES = [
  { name: "Canada",   g: "m", people: "canadiens",   emoji: "🇨🇦", where: "en Amérique", lang: "le français et l'anglais",            fact: "En hiver, il fait très froid." },
  { name: "Suisse",   g: "f", people: "suisses",     emoji: "🇨🇭", where: "en Europe",   lang: "le français, l'allemand et l'italien", fact: "Il y a beaucoup de montagnes." },
  { name: "Sénégal",  g: "m", people: "sénégalais",  emoji: "🇸🇳", where: "en Afrique",  lang: "le français",                          fact: "La capitale est Dakar." },
  { name: "Belgique", g: "f", people: "belges",      emoji: "🇧🇪", where: "en Europe",   lang: "le français et le néerlandais",        fact: "On y mange des frites et du chocolat." },
  { name: "Maroc",    g: "m", people: "marocains",   emoji: "🇲🇦", where: "en Afrique",  lang: "l'arabe et le français",               fact: "La ville de Marrakech est très belle." },
  { name: "Viêt Nam", g: "m", people: "vietnamiens", emoji: "🇻🇳", where: "en Asie",     lang: "le vietnamien",                        fact: "La capitale est Hanoï." },
] as const satisfies readonly (Gram & { name: string; people: string; emoji: string; where: string; lang: string; fact: string })[];

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
    /* THE FIRST QUESTION NEEDS A FIRST CHIP. « C'est quel pays ? » is answered
       with the country's NAME, and no group carried one — a learner with no
       French had nothing to tap, on question 1 of 4. The names are generated,
       so a country added to COUNTRIES arrives with its own chip and its own
       article (« le Viêt Nam », « la Suisse ») rather than a hand-typed one. */
    { label: "Le pays", phrases: ["C'est", ...COUNTRIES.map(countryName)] },
    { label: "Situer", phrases: ["C'est", "Il est", "Elle est", "en Europe", "en Afrique", "en Asie", "en Amérique"] },
    /* THE LANGUAGES THEMSELVES, for the same reason the country names are here:
       « On y parle quelle langue ? » was answerable only as far as « On parle »
       and then stopped — the group held the frame and none of the words that go
       in it. Deduplicated because le français is spoken in more than one of
       them; generated so a country cannot arrive without its language. */
    { label: "Langues", phrases: ["On parle", "la langue officielle est", "et", "aussi", ...new Set(COUNTRIES.map((c) => c.lang))] },
    { label: "Décrire", phrases: ["C'est un pays", "grand", "petit", "magnifique", "intéressant"] },
    // Generated from COUNTRIES, so a country added without its adjective is
    // impossible rather than merely unlikely.
    { label: "Habitants", phrases: ["Les habitants sont", ...COUNTRIES.map((c) => c.people)] },
    /* THE FOURTH ELEMENT NOW HAS CHIPS. SIO-020 scores "one cultural fact" and
       the bank offered no way to state one — [Opinion] answers a different
       question ("why it interests you"), which is what the old task asked for
       instead. Generated from COUNTRIES for the same reason [Habitants] is:
       one fact per country, and the learner picks the one that belongs to
       theirs. [Opinion] stays — a sentence about why you'd visit is a fine
       fifth sentence, it just is not the element being assessed. */
    { label: "Un fait", phrases: COUNTRIES.map((c) => c.fact) },
    { label: "Opinion", phrases: ["J'aime", "J'adore", "parce que", "Je voudrais visiter"] },
  ]),
  newScenario() {
    const i = Math.floor(Date.now() / 60000) % COUNTRIES.length;
    const c = COUNTRIES[i];
    /* THE MODEL IS ALWAYS A DIFFERENT COUNTRY — the next one round the list, so
       it can never be the one the learner was given. Dan, 2026-09-12: a model
       "on another country". Same shape, different content: something to
       compare four sentences against, never something to copy. It is BUILT
       from that country's own fields rather than hand-written, so it cannot
       drift from the chips the learner is offered, and every article in it
       comes from lib/textgen/french.ts. */
    const m = COUNTRIES[(i + 1) % COUNTRIES.length];
    /* FOUR SENTENCES, ONE PER QUESTION, in the same order — so the model is a
       shape the learner can lay their own four against, line for line, and not
       a paragraph they have to take apart first. Every phrase in it is one the
       chips can build: « C'est » and « Il est » are [Le pays] and [Situer],
       « On parle » is [Langues], the fact is [Un fait]. A model that used
       French the palette cannot produce would be a wall, not a model. */
    const model = `C'est ${countryName(m)}. ${m.g === "f" ? "Elle est" : "Il est"} ${m.where}. `
      + `On parle ${m.lang}. ${m.fact}`;
    return {
      headline: `${c.emoji} ${countryName(c)}`,
      instructionEn: `Present ${countryName(c)} in four sentences — answer one question at a time.`,
      /* FOUR QUESTIONS, ONE PER SENTENCE, in the order the competence lists its
         elements: name, location, language, one cultural fact. The learner
         answers each with ✔ and the next appears. */
      prompts: [
        { ask: `Parle-moi ${ofCountry(c)} ! C'est quel pays ?`, use: "Le pays" },
        { ask: `Où est-ce ?`, use: "Situer" },
        { ask: `On y parle quelle langue ?`, use: "Langues" },
        { ask: `Et dis-moi une chose sur ce pays.`, use: "Un fait" },
      ],
      model: { label: `${m.emoji} ${countryName(m)} — un modèle`, text: model },
      openingFr: `Parle-moi ${ofCountry(c)} ! C'est quel pays ?`,
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
    /* CAPITALISED, because every one of these OPENS the card's fourth line and
       this group was the only one on the card that was not. « je visite le
       musée » came out lower-case in the middle of five properly-capitalised
       sentences — found by the model clause, which could not build « Je visite »
       out of a bank whose chip says « je visite ». « le musée » stays lower-case:
       it is a complement, never a first word. */
    { label: "Activités", phrases: ["Je visite", "On peut visiter", "Je vais à la plage", "On prend le métro", "le musée", "C'est magnifique"] },
    { label: "Finir", phrases: ["À bientôt", "Bises", "Écris-moi", "Au revoir"] },
  ]),
  newScenario() {
    /* THE BOOK'S FIVE PARTS, ASKED ONE AT A TIME. The atelier is a five-part
       card — opening formula → where you are → the weather → what you're doing
       → closing formula — and the old instruction listed all five in one
       English sentence, then asked all three questions at once in French. A
       learner who wrote two of the five had no way to know which three were
       missing. Each part is now its own question, and the group that answers it
       leads. (Dan, 2026-09-12, on the same fault in Présenter un pays: *"the
       questions followed by a model paragraph"*.)

       WHAT THIS DOES NOT DO IS MOVE THE CARD. Its subject is the weather and
       where you are — SIO-031 and SIO-032 — while its deck is SIO-040's
       itinerary atelier. That is not drift: the syllabus audit found the book's
       U3 written atelier had no home, and Dan's decision (2026-08-23) was to
       present it at stop 40 beside the itinerary with the SIOs untouched. It is
       recorded here because the mismatch looks like a bug every time someone
       reads this file. */
    const i = Math.floor(Date.now() / 60000) % TRIPS.length;
    const t = TRIPS[i];
    const m = TRIPS[(i + 1) % TRIPS.length];   // the model is never the learner's own trip
    return {
      headline: `${t.emoji} ${t.fr}`,
      instructionEn: `You are ${t.en}. Write your e-postcard to a friend, one line at a time.`,
      prompts: [
        { ask: "Commence ta carte ! Tu écris à qui ?", use: "Commencer" },
        { ask: `Et tu es où ?`, use: "Où je suis" },
        { ask: "Il fait quel temps là-bas ?", use: "La météo" },
        { ask: "Qu'est-ce que tu fais ?", use: "Activités" },
        { ask: "Et pour finir ?", use: "Finir" },
      ],
      /* Five lines for five questions, every phrase of them a chip on this
         card — verify440 fails the build if that stops being true. */
      model: {
        label: `${m.emoji} Une carte ${m.fr} — un modèle`,
        /* ONE SENTENCE PER QUESTION, and every one of them a chip EXACTLY as the
           chip is written — capital included. The first draft read « …beau mais
           c'est nuageux », which no learner can produce: the chip is « C'est
           nuageux », so joining it after « mais » puts a capital in the middle
           of their sentence. The model was quietly showing better French than
           the palette can make. */
        text: `Salut ! Je suis ${m.fr}. Il fait beau. Je visite le musée. À bientôt`,
      },
      openingFr: `Alors, c'est comment ${t.fr} ?`,
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

// ---------------------------------------------------------------------------
// Unité 2 · Présenter quelqu'un  (solo, written) — sits on goal 23's deck
//
// WHY THIS EXISTS (Dan, 2026-09-14). The written half of the course's first
// test is a third-person portrait — name, age and status, likes, sport, plans,
// one negative — built from avoir, être, aimer, faire, aller and vouloir with
// « ne … pas / ne … plus » and two connectors. Nothing on the site rehearsed
// that shape: the writing ateliers were a country (20), an e-mail (30) and a
// journey (40). Eleven of the words the test hands out belong to goal 23, so
// the scene lives there.
//
// THE PERSON ROTATES, AND THE TEST'S OWN SUBJECT IS NOT IN THE LIST. Dan,
// same day: *"we don't want to give away the fact that the question in the
// test is about my best friend … présenter qqn is the correct framing"*. So
// the learner is handed a cousin, a neighbour, a singer — eight people, on the
// same clock the country scene uses — and answers the same six questions
// whoever it is. « Un ami / une amie » is one of the eight and is never
// singled out. What is rehearsed is the shape the marking grid rewards; what
// stays hidden is the topic.
//
// THE MODEL IS ALWAYS SOMEONE ELSE — the next person round the list — and is
// built from that person's own fields, so it cannot drift from the chips.
// ---------------------------------------------------------------------------
type Person = {
  /** « ton cousin » — the person as the task names them. */
  fr: string;
  en: string;
  /** « Mon cousin » — the chip the learner opens with. */
  mine: string;
  g: "m" | "f";
  emoji: string;
  /* The model portrait's own facts. Every phrase is one the chips can build. */
  name: string;
  age: string;
  status: string;
  likes: string;
  sport: string;
  goes: string;
  wants: string;
  not: string;
};

const PEOPLE: readonly Person[] = [
  { fr: "ton cousin", en: "your cousin", mine: "Mon cousin", g: "m", emoji: "🧑", name: "Thomas", age: "20 ans", status: "est étudiant", likes: "le football et le cinéma", sport: "du football", goes: "au stade le samedi", wants: "aller au cinéma ce week-end", not: "n'aime pas la danse" },
  { fr: "ta voisine", en: "your neighbour", mine: "Ma voisine", g: "f", emoji: "👩", name: "Julie", age: "45 ans", status: "travaille", likes: "lire et la musique", sport: "de la natation", goes: "à la piscine le lundi", wants: "aller au théâtre avec moi", not: "ne fait plus de danse" },
  { fr: "un camarade de classe", en: "a classmate", mine: "Mon camarade", g: "m", emoji: "🎒", name: "Marc", age: "18 ans", status: "est étudiant", likes: "la natation et le théâtre", sport: "de la natation", goes: "à la piscine le week-end", wants: "faire du théâtre", not: "n'aime pas le football" },
  { fr: "ta colocataire", en: "your flatmate", mine: "Ma colocataire", g: "f", emoji: "🏠", name: "Léa", age: "22 ans", status: "est étudiante", likes: "la danse et la musique", sport: "de la danse", goes: "au cinéma le samedi", wants: "aller à la piscine avec moi", not: "n'aime pas lire" },
  { fr: "ton coéquipier", en: "your teammate", mine: "Mon coéquipier", g: "m", emoji: "⚽", name: "Paul", age: "25 ans", status: "travaille", likes: "le football et la natation", sport: "du football", goes: "au stade le week-end", wants: "faire de la natation ce week-end", not: "ne fait plus de théâtre" },
  { fr: "ta chanteuse préférée", en: "your favourite singer", mine: "Ma chanteuse préférée", g: "f", emoji: "🎤", name: "Marie", age: "30 ans", status: "travaille", likes: "la musique et la danse", sport: "de la danse", goes: "au théâtre le samedi", wants: "aller au cinéma avec moi", not: "n'est plus étudiante" },
  { fr: "ton grand-père", en: "your grandfather", mine: "Mon grand-père", g: "m", emoji: "👴", name: "Jean", age: "70 ans", status: "ne travaille plus", likes: "lire et le cinéma", sport: "de la natation", goes: "à la piscine le lundi", wants: "aller au théâtre avec moi", not: "n'aime pas le football" },
  { fr: "une amie", en: "a friend", mine: "Mon amie", g: "f", emoji: "🙋‍♀️", name: "Emma", age: "19 ans", status: "est étudiante", likes: "le théâtre et lire", sport: "de la danse", goes: "au théâtre le week-end", wants: "aller au cinéma ce week-end", not: "ne fait plus de natation" },
] as const;

const il = (p: Person) => (p.g === "f" ? "Elle" : "Il");

function portrait(p: Person): string {
  const S = il(p);
  const s = S.toLowerCase();
  /* ONE CHIP-SHAPED SENTENCE PER QUESTION, capital subjects, no mid-sentence
     capital — verify440 rebuilds this text from the palette, case and commas
     included, so every token here is a chip. */
  return `${p.mine} s'appelle ${p.name}. ${S} a ${p.age}. ${S} ${p.status}. `
    + `${S} aime ${p.likes}. ${S} fait ${p.sport}. ${S} va ${p.goes}. `
    + `${S} veut ${p.wants}, mais ${s} ${p.not}.`;
}

export const PRESENT_PERSON_BANK: ComposeBank = {
  id: "presenter-quelquun",
  title: "Présenter quelqu'un",
  emoji: "🧑‍🤝‍🧑",
  unit: 2,
  deckId: "aimer-activites",
  mode: "solo",
  aiCheck: true,
  /* 50–60 words is the length the portrait is asked for; the learner sees the
     count climb under the sheet and nothing else about where the target
     comes from. */
  wordGoal: { min: 50, max: 60 },
  categories: withPalette([
    // Generated from PEOPLE, so a person added without an opening chip is impossible.
    { label: "Présenter", phrases: [...PEOPLE.map((p) => p.mine), "s'appelle", "Il s'appelle", "Elle s'appelle", ...PEOPLE.map((p) => p.name)] },
    // Ages generated from PEOPLE for the same reason as the names above.
    { label: "Âge et statut", phrases: ["Il a", "Elle a", ...new Set(PEOPLE.map((p) => p.age)), "Il est étudiant", "Elle est étudiante", "Il travaille", "Elle travaille", "Il ne travaille plus", "et", "il est étudiant", "elle est étudiante", "il travaille", "elle travaille"] },
    { label: "Aimer", phrases: ["Il aime", "Elle aime", "Il adore", "Elle adore", "lire", "le football", "la natation", "la danse", "le théâtre", "le cinéma", "la musique", "et", "aussi"] },
    { label: "Faire et aller", phrases: ["Il fait", "Elle fait", "du football", "de la natation", "de la danse", "du théâtre", "Il va", "Elle va", "au stade", "à la piscine", "au cinéma", "au théâtre", "le lundi", "le samedi", "le week-end"] },
    { label: "Vouloir", phrases: ["Il veut", "Elle veut", "aller", "faire", "au cinéma", "au théâtre", "à la piscine", "avec moi", "ce week-end", ", ", "mais"] },
    /* Both cases on purpose: capitals open a sentence of their own (question
       6), lower-case follows « , mais » inside the sentence before. */
    { label: "Ne … pas / ne … plus", phrases: ["Il n'aime pas", "Elle n'aime pas", "il n'aime pas", "elle n'aime pas", "Il ne fait plus", "Elle ne fait plus", "il ne fait plus", "elle ne fait plus", "il n'est plus étudiant", "elle n'est plus étudiante", "de sport", "de danse", "de natation", "de théâtre", "la danse", "le football", "lire"] },
  ]),
  newScenario() {
    const i = Math.floor(Date.now() / 60000) % PEOPLE.length;
    const p = PEOPLE[i];
    const m = PEOPLE[(i + 1) % PEOPLE.length];
    const s = il(p);
    const et = p.g === "f" ? "étudiante" : "étudiant";
    return {
      headline: `${p.emoji} ${p.fr}`,
      instructionEn: `Present ${p.en} in six sentences — answer one question at a time. Aim for 50 to 60 words.`,
      prompts: [
        { ask: `Parle-moi de ${p.fr} ! ${s} s'appelle comment ?`, use: "Présenter" },
        { ask: `${s} a quel âge ? ${s} est ${et} ?`, use: "Âge et statut" },
        { ask: `${s} aime quoi ?`, use: "Aimer" },
        { ask: `${s} fait quel sport ? ${s} va où ?`, use: "Faire et aller" },
        { ask: `${s} veut faire quoi ce week-end ?`, use: "Vouloir" },
        { ask: `Et qu'est-ce qu'${s.toLowerCase()} n'aime pas ?`, use: "Ne … pas / ne … plus" },
      ],
      model: { label: `${m.emoji} ${m.fr} — un modèle`, text: portrait(m) },
      openingFr: `Parle-moi de ${p.fr} ! ${s} s'appelle comment ?`,
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
  PRESENT_PERSON_BANK,
  ITINERARY_BANK,
  POSTCARD_BANK,
  REVIEW_BANK,
  RESTAURANT_SCENE_BANK,
];
