/**
 * One-shot generator for the Units 0-3 deck-completion pass (2026-07-01).
 * Writes collection JSON files to src/content/collections/, matching the
 * existing schema (see nationalities.json / weather-letris.json for the
 * reference shape). Run once, then hand-wire the imports in
 * src/content/collections/index.ts and sios.json's
 * COLLECTION_BY_SIO.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "src/content/collections";
const LETRIS_OUT = "src/content"; // separate registry, see games/letris/sets.ts

const letrisSets = []; // { slug, title, subtitle, emoji, set }

function letrisDeck({ id, title, subtitle, unit, lessonNo, seq, columns, items, emoji }) {
  // The Collection-schema copy (Flip It / Match It / general Practice wiring).
  const collection = {
    id, title, subtitle, langPair: "fr-en", owner: "curated", visibility: "public",
    unit, lessonNo, lessonSlug: id, tags: [], seq,
    gameConfig: { letris: { columns } },
    items: items.map((it, i) => ({
      id: `${id}-${String(i + 1).padStart(2, "0")}`,
      fr: it.fr, en: it.en, tags: [`col:${it.col}`],
      ...(it.emoji ? { emoji: it.emoji } : {}),
    })),
  };
  // The separate LetrisSet-schema copy the actual Letris game reads (see
  // src/games/letris/sets.ts's REGISTRY — a different schema/registry than
  // the Collection system, discovered while wiring this pass).
  const set = {
    id, title, subtitle,
    categories: columns.map((c) => ({ key: c.key, label: c.label, prefix: c.prefix })),
    tiles: items.map((it) => ({
      text: it.fr.toUpperCase(), displayName: it.fr, category: it.col, meaning: it.en,
      ...(it.emoji ? { emoji: it.emoji } : {}),
    })),
  };
  letrisSets.push({ slug: id, title, subtitle, emoji: emoji ?? "🎯", set });
  return collection;
}

function matchDeck({ id, title, subtitle, unit, lessonNo, seq, items }) {
  return {
    id, title, subtitle, langPair: "fr-en", owner: "curated", visibility: "public",
    unit, lessonNo, lessonSlug: id, tags: [], seq,
    items: items.map((it, i) => ({
      id: `${id}-${String(i + 1).padStart(2, "0")}`,
      fr: it.fr, en: it.en, tags: [],
      ...(it.emoji ? { emoji: it.emoji } : {}),
    })),
  };
}

const decks = [];

/* ───────────── Unité 0 ───────────── */

decks.push(matchDeck({
  id: "days", title: "Quel jour on est ?", subtitle: "Days of the week",
  unit: 0, lessonNo: 4, seq: 4,
  items: [
    { fr: "lundi", en: "Monday" }, { fr: "mardi", en: "Tuesday" }, { fr: "mercredi", en: "Wednesday" },
    { fr: "jeudi", en: "Thursday" }, { fr: "vendredi", en: "Friday" }, { fr: "samedi", en: "Saturday" },
    { fr: "dimanche", en: "Sunday" },
  ],
}));

decks.push(matchDeck({
  id: "colors", title: "De quelle couleur ?", subtitle: "Colours",
  unit: 0, lessonNo: 5, seq: 5,
  items: [
    { fr: "rouge", en: "red" }, { fr: "orange", en: "orange" }, { fr: "jaune", en: "yellow" },
    { fr: "vert", en: "green" }, { fr: "bleu", en: "blue" }, { fr: "violet", en: "purple" },
    { fr: "marron", en: "brown" }, { fr: "blanc", en: "white" }, { fr: "noir", en: "black" },
    { fr: "gris", en: "grey" }, { fr: "rose", en: "pink" }, { fr: "beige", en: "beige" },
  ],
}));

decks.push(letrisDeck({
  id: "core-nouns", title: "Un ou une ?", subtitle: "People, identity & classroom objects",
  unit: 0, lessonNo: 6, seq: 6,
  columns: [{ key: "un", label: "UN", prefix: "un " }, { key: "une", label: "une ", prefix: "une " }],
  items: [
    { fr: "prénom", en: "first name", col: "un" }, { fr: "nom", en: "surname", col: "un" },
    { fr: "femme", en: "woman", col: "une" }, { fr: "fille", en: "girl", col: "une" },
    { fr: "dame", en: "lady", col: "une" }, { fr: "homme", en: "man", col: "un" },
    { fr: "étudiant", en: "student (m)", col: "un" }, { fr: "étudiante", en: "student (f)", col: "une" },
    { fr: "professeur", en: "teacher (m)", col: "un" }, { fr: "professeure", en: "teacher (f)", col: "une" },
    { fr: "salle de classe", en: "classroom", col: "une" }, { fr: "tableau", en: "board", col: "un" },
    { fr: "livre", en: "book", col: "un" }, { fr: "crayon", en: "pencil", col: "un" },
    { fr: "cahier", en: "exercise book", col: "un" }, { fr: "casque", en: "headphones", col: "un" },
    { fr: "micro", en: "microphone", col: "un" },
  ],
}));

decks.push(matchDeck({
  id: "numbers-0-20", title: "0 à 20", subtitle: "Numbers 0-20",
  unit: 0, lessonNo: 7, seq: 7,
  items: [
    { fr: "zéro", en: "0" }, { fr: "un", en: "1" }, { fr: "deux", en: "2" }, { fr: "trois", en: "3" },
    { fr: "quatre", en: "4" }, { fr: "cinq", en: "5" }, { fr: "six", en: "6" }, { fr: "sept", en: "7" },
    { fr: "huit", en: "8" }, { fr: "neuf", en: "9" }, { fr: "dix", en: "10" }, { fr: "onze", en: "11" },
    { fr: "douze", en: "12" }, { fr: "treize", en: "13" }, { fr: "quatorze", en: "14" },
    { fr: "quinze", en: "15" }, { fr: "seize", en: "16" }, { fr: "dix-sept", en: "17" },
    { fr: "dix-huit", en: "18" }, { fr: "dix-neuf", en: "19" }, { fr: "vingt", en: "20" },
  ],
}));

/* ───────────── Unité 1 ───────────── */

decks.push(letrisDeck({
  id: "stress-pronouns", title: "Moi, toi, lui...", subtitle: "Subject-only, stress-only, or either",
  unit: 1, lessonNo: 11, seq: 111,
  columns: [
    { key: "subject", label: "SUJET SEULEMENT", prefix: "" },
    { key: "stress", label: "TONIQUE SEULEMENT", prefix: "" },
    { key: "either", label: "LES DEUX", prefix: "" },
  ],
  items: [
    { fr: "je", en: "I (subject only)", col: "subject" }, { fr: "moi", en: "me (stress only)", col: "stress" },
    { fr: "tu", en: "you sg. (subject only)", col: "subject" }, { fr: "toi", en: "you sg. (stress only)", col: "stress" },
    { fr: "il", en: "he (subject only)", col: "subject" }, { fr: "lui", en: "him (stress only)", col: "stress" },
    { fr: "elle", en: "she / her (either)", col: "either" },
    { fr: "nous", en: "we / us (either)", col: "either" },
    { fr: "vous", en: "you pl. (either)", col: "either" },
    { fr: "ils", en: "they m. (subject only)", col: "subject" }, { fr: "eux", en: "them m. (stress only)", col: "stress" },
    { fr: "elles", en: "they / them f. (either)", col: "either" },
  ],
}));

decks.push(letrisDeck({
  id: "professions", title: "Quelle profession ?", subtitle: "Il est / elle est …",
  unit: 1, lessonNo: 12, seq: 112,
  columns: [{ key: "m", label: "IL EST", prefix: "il est " }, { key: "f", label: "ELLE EST", prefix: "elle est " }],
  items: [
    { fr: "architecte", en: "architect (m)", col: "m" }, { fr: "architecte", en: "architect (f)", col: "f" },
    { fr: "acteur", en: "actor", col: "m" }, { fr: "actrice", en: "actress", col: "f" },
    { fr: "chanteur", en: "singer (m)", col: "m" }, { fr: "chanteuse", en: "singer (f)", col: "f" },
    { fr: "boulanger", en: "baker (m)", col: "m" }, { fr: "boulangère", en: "baker (f)", col: "f" },
    { fr: "médecin", en: "doctor (m)", col: "m" }, { fr: "médecin", en: "doctor (f)", col: "f" },
    { fr: "ingénieur", en: "engineer (m)", col: "m" }, { fr: "ingénieure", en: "engineer (f)", col: "f" },
    { fr: "avocat", en: "lawyer (m)", col: "m" }, { fr: "avocate", en: "lawyer (f)", col: "f" },
    { fr: "infirmier", en: "nurse (m)", col: "m" }, { fr: "infirmière", en: "nurse (f)", col: "f" },
    { fr: "coiffeur", en: "hairdresser (m)", col: "m" }, { fr: "coiffeuse", en: "hairdresser (f)", col: "f" },
    { fr: "professeur", en: "teacher (m)", col: "m" }, { fr: "professeure", en: "teacher (f)", col: "f" },
  ],
}));

decks.push(letrisDeck({
  id: "matieres", title: "Quelle matière ?", subtitle: "Academic subjects, sorted by article",
  unit: 1, lessonNo: 13, seq: 113,
  columns: [
    { key: "le", label: "LE", prefix: "le " }, { key: "la", label: "LA", prefix: "la " },
    { key: "l_apos", label: "L'", prefix: "l'" }, { key: "les", label: "LES", prefix: "les " },
  ],
  items: [
    { fr: "français", en: "French", col: "le" }, { fr: "dessin", en: "art", col: "le" },
    { fr: "géographie", en: "geography", col: "la" }, { fr: "biologie", en: "biology", col: "la" },
    { fr: "anglais", en: "English", col: "l_apos" }, { fr: "histoire", en: "history", col: "l_apos" },
    { fr: "informatique", en: "computer science", col: "l_apos" },
    { fr: "mathématiques", en: "maths", col: "les" }, { fr: "sciences", en: "science", col: "les" },
    { fr: "langues", en: "languages", col: "les" },
  ],
}));

decks.push(matchDeck({
  id: "numbers-20-69", title: "20 à 69", subtitle: "Numbers 20-69",
  unit: 1, lessonNo: 18, seq: 118,
  items: [
    { fr: "vingt", en: "20" }, { fr: "vingt et un", en: "21" }, { fr: "vingt-deux", en: "22" },
    { fr: "trente", en: "30" }, { fr: "trente et un", en: "31" }, { fr: "trente-cinq", en: "35" },
    { fr: "quarante", en: "40" }, { fr: "quarante et un", en: "41" }, { fr: "quarante-sept", en: "47" },
    { fr: "cinquante", en: "50" }, { fr: "cinquante et un", en: "51" }, { fr: "cinquante-huit", en: "58" },
    { fr: "soixante", en: "60" }, { fr: "soixante et un", en: "61" }, { fr: "soixante-neuf", en: "69" },
  ],
}));

decks.push(letrisDeck({
  id: "avoir-etats", title: "Avoir ou être ?", subtitle: "Sort each state by its verb",
  unit: 1, lessonNo: 19, seq: 119,
  columns: [{ key: "avoir", label: "J'AI", prefix: "j'ai " }, { key: "etre", label: "JE SUIS", prefix: "je suis " }],
  items: [
    { fr: "faim", en: "hungry", col: "avoir" }, { fr: "soif", en: "thirsty", col: "avoir" },
    { fr: "froid", en: "cold", col: "avoir" }, { fr: "chaud", en: "hot", col: "avoir" },
    { fr: "fatigué(e)", en: "tired", col: "etre" }, { fr: "content(e)", en: "happy", col: "etre" },
  ],
}));

/* ───────────── Unité 2 ───────────── */

decks.push(letrisDeck({
  id: "objets-articles", title: "Un, une ou des ?", subtitle: "Everyday objects, sorted by article",
  unit: 2, lessonNo: 21, seq: 221,
  columns: [
    { key: "un", label: "UN", prefix: "un " }, { key: "une", label: "UNE", prefix: "une " },
    { key: "des", label: "DES", prefix: "des " },
  ],
  items: [
    { fr: "sac", en: "bag", col: "un" }, { fr: "livre", en: "book", col: "un" },
    { fr: "cahier", en: "exercise book", col: "un" }, { fr: "téléphone", en: "phone", col: "un" },
    { fr: "stylo", en: "pen", col: "un" }, { fr: "crayon", en: "pencil", col: "un" },
    { fr: "passeport", en: "passport", col: "un" }, { fr: "carte d'identité", en: "ID card", col: "une" },
    { fr: "trousse", en: "pencil case", col: "une" }, { fr: "ciseaux", en: "scissors", col: "des" },
    { fr: "gomme", en: "eraser", col: "une" }, { fr: "portefeuille", en: "wallet", col: "un" },
    { fr: "lunettes", en: "glasses", col: "des" }, { fr: "clé", en: "key", col: "une" },
  ],
}));

decks.push(letrisDeck({
  id: "possessives", title: "Mon, ma ou mes ?", subtitle: "Sort each noun by the matching possessive",
  unit: 2, lessonNo: 22, seq: 222,
  columns: [{ key: "mon", label: "MON", prefix: "mon " }, { key: "ma", label: "MA", prefix: "ma " }, { key: "mes", label: "MES", prefix: "mes " }],
  items: [
    { fr: "livre", en: "book (m)", col: "mon" }, { fr: "stylo", en: "pen (m)", col: "mon" },
    { fr: "téléphone", en: "phone (m)", col: "mon" }, { fr: "pomme", en: "apple (f)", col: "ma" },
    { fr: "sœur", en: "sister (f)", col: "ma" }, { fr: "maison", en: "house (f)", col: "ma" },
    { fr: "amis", en: "friends (pl)", col: "mes" }, { fr: "parents", en: "parents (pl)", col: "mes" },
    { fr: "clés", en: "keys (pl)", col: "mes" },
  ],
}));

decks.push(matchDeck({
  id: "aimer-activites", title: "J'aime...", subtitle: "Things and activities I like",
  unit: 2, lessonNo: 23, seq: 223,
  items: [
    { fr: "le sport", en: "sports" }, { fr: "la musique", en: "music" }, { fr: "le cinéma", en: "cinema" },
    { fr: "la lecture", en: "reading" }, { fr: "les jeux vidéo", en: "video games" }, { fr: "la danse", en: "dance" },
    { fr: "voyager", en: "to travel" }, { fr: "cuisiner", en: "to cook" }, { fr: "dessiner", en: "to draw" },
    { fr: "chanter", en: "to sing" },
  ],
}));

decks.push(letrisDeck({
  id: "faire-activites", title: "Faire du, de la, de l' ou des ?", subtitle: "Sort each activity by its contraction",
  unit: 2, lessonNo: 24, seq: 224,
  columns: [
    { key: "du", label: "DU", prefix: "du " }, { key: "de_la", label: "DE LA", prefix: "de la " },
    { key: "de_l", label: "DE L'", prefix: "de l'" }, { key: "des", label: "DES", prefix: "des " },
  ],
  items: [
    { fr: "sport", en: "sport", col: "du" }, { fr: "vélo", en: "cycling", col: "du" },
    { fr: "natation", en: "swimming", col: "de_la" }, { fr: "photographie", en: "photography", col: "de_la" },
    { fr: "équitation", en: "horse riding", col: "de_l" }, { fr: "athlétisme", en: "athletics", col: "de_l" },
    { fr: "courses", en: "errands", col: "des" }, { fr: "randonnées", en: "hikes", col: "des" },
  ],
}));

decks.push(letrisDeck({
  id: "aller-destinations", title: "Aller au, à la, à l' ou aux ?", subtitle: "Sort each destination by its contraction",
  unit: 2, lessonNo: 26, seq: 226,
  columns: [
    { key: "au", label: "AU", prefix: "au " }, { key: "a_la", label: "À LA", prefix: "à la " },
    { key: "a_l", label: "À L'", prefix: "à l'" }, { key: "aux", label: "AUX", prefix: "aux " },
  ],
  items: [
    { fr: "cinéma", en: "cinema", col: "au" }, { fr: "marché", en: "market", col: "au" },
    { fr: "piscine", en: "swimming pool", col: "a_la" }, { fr: "plage", en: "beach", col: "a_la" },
    { fr: "école", en: "school", col: "a_l" }, { fr: "hôpital", en: "hospital", col: "a_l" },
    { fr: "toilettes", en: "toilets", col: "aux" }, { fr: "magasins", en: "shops", col: "aux" },
  ],
}));

decks.push(letrisDeck({
  id: "quand-time", title: "Jour, fréquence ou heure ?", subtitle: "Sort each time expression",
  unit: 2, lessonNo: 27, seq: 227,
  columns: [
    { key: "jour", label: "JOUR", prefix: "" }, { key: "frequence", label: "FRÉQUENCE", prefix: "" },
    { key: "heure", label: "HEURE", prefix: "" },
  ],
  items: [
    { fr: "le lundi", en: "on Mondays", col: "jour" }, { fr: "le week-end", en: "on weekends", col: "jour" },
    { fr: "tous les jours", en: "every day", col: "frequence" }, { fr: "tous les matins", en: "every morning", col: "frequence" },
    { fr: "à 8 heures", en: "at 8 o'clock", col: "heure" }, { fr: "à midi", en: "at noon", col: "heure" },
  ],
}));

decks.push(matchDeck({
  id: "avec-qui", title: "Avec qui ?", subtitle: "Who I do things with",
  unit: 2, lessonNo: 28, seq: 228,
  items: [
    { fr: "avec moi", en: "with me" }, { fr: "avec toi", en: "with you" }, { fr: "avec lui", en: "with him" },
    { fr: "avec elle", en: "with her" }, { fr: "avec nous", en: "with us" }, { fr: "avec vous", en: "with you (pl.)" },
    { fr: "avec eux", en: "with them (m)" }, { fr: "avec elles", en: "with them (f)" }, { fr: "seul(e)", en: "alone" },
  ],
}));

/* ───────────── Unité 3 ───────────── */

decks.push(letrisDeck({
  id: "en-au-aux-a", title: "En, au, aux ou à ?", subtitle: "Sort each place by its preposition",
  unit: 3, lessonNo: 32, seq: 332,
  columns: [
    { key: "en", label: "EN", prefix: "en " }, { key: "au", label: "AU", prefix: "au " },
    { key: "aux", label: "AUX", prefix: "aux " }, { key: "a", label: "À", prefix: "à " },
  ],
  items: [
    { fr: "France", en: "France (f. country)", col: "en" }, { fr: "Italie", en: "Italy (f. country)", col: "en" },
    { fr: "Japon", en: "Japan (m. country)", col: "au" }, { fr: "Canada", en: "Canada (m. country)", col: "au" },
    { fr: "États-Unis", en: "United States (pl. country)", col: "aux" }, { fr: "Pays-Bas", en: "Netherlands (pl. country)", col: "aux" },
    { fr: "Paris", en: "Paris (city)", col: "a" }, { fr: "Tokyo", en: "Tokyo (city)", col: "a" },
  ],
}));

decks.push(matchDeck({
  id: "question-words", title: "Quel mot interrogatif ?", subtitle: "The 7 core question words",
  unit: 3, lessonNo: 35, seq: 335,
  items: [
    { fr: "où", en: "where" }, { fr: "quand", en: "when" }, { fr: "combien", en: "how much / many" },
    { fr: "comment", en: "how" }, { fr: "quoi", en: "what" }, { fr: "qui", en: "who" }, { fr: "pourquoi", en: "why" },
  ],
}));

decks.push(matchDeck({
  id: "transport", title: "Comment tu y vas ?", subtitle: "Modes of transport",
  unit: 3, lessonNo: 38, seq: 338,
  items: [
    { fr: "le train", en: "train" }, { fr: "le bus", en: "bus" }, { fr: "le métro", en: "metro" },
    { fr: "la voiture", en: "car" }, { fr: "le vélo", en: "bike" }, { fr: "l'avion", en: "plane" },
    { fr: "le bateau", en: "boat" }, { fr: "à pied", en: "on foot" },
  ],
}));

for (const d of decks) {
  writeFileSync(join(OUT, `${d.id}.json`), JSON.stringify(d, null, 2) + "\n");
}
for (const { slug, set } of letrisSets) {
  writeFileSync(join(LETRIS_OUT, `${slug}.json`), JSON.stringify(set, null, 2) + "\n");
}
console.log(`Wrote ${decks.length} collection decks:`, decks.map((d) => d.id).join(", "));
console.log(`Wrote ${letrisSets.length} Letris-registry sets:`, letrisSets.map((s) => s.slug).join(", "));
console.log("\n--- paste into src/games/letris/sets.ts ---");
console.log("REGISTRY imports:");
for (const s of letrisSets) console.log(`import ${s.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())} from "@/content/${s.slug}.json";`);
console.log("\nREGISTRY entries:");
for (const s of letrisSets) console.log(`  "${s.slug}": ${s.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())} as LetrisSet,`);
console.log("\nMETA entries:");
for (const s of letrisSets) console.log(`  "${s.slug}": { emoji: "${s.emoji}" },`);
