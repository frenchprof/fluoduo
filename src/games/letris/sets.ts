import weather from "@/content/weather-letris.json";
import countries from "@/content/countries-letris.json";
import countriesExpert from "@/content/countries-expert-letris.json";
import lieux from "@/content/lieux-letris.json";
import loinLesson from "@/content/loin-lesson.json";
import coreNouns from "@/content/core-nouns.json";
import stressPronouns from "@/content/stress-pronouns.json";
import professions from "@/content/professions.json";
import matieres from "@/content/matieres.json";
import avoirEtats from "@/content/avoir-etats.json";
import objetsArticles from "@/content/objets-articles.json";
import possessives from "@/content/possessives.json";
import faireActivites from "@/content/faire-activites.json";
import allerDestinations from "@/content/aller-destinations.json";
import quandTime from "@/content/quand-time.json";
import enAuAuxA from "@/content/en-au-aux-a.json";
import demonstratifs from "@/content/demonstratifs.json";
import commerces from "@/content/commerces.json";
import tuVous from "@/content/tu-vous.json";
import salutations from "@/content/salutations.json";
import alimentsLetris from "@/content/aliments-letris.json";
import transportLetris from "@/content/transport-letris.json";
import partitifsLetris from "@/content/partitifs-letris.json";
import modauxLetris from "@/content/modaux-letris.json";
import questionWordsLetris from "@/content/question-words-letris.json";
import daysLetris from "@/content/days-letris.json";
import alphabetLetris from "@/content/alphabet-letris.json";
import numbers020Letris from "@/content/numbers-0-20-letris.json";
import numbers2069Letris from "@/content/numbers-20-69-letris.json";
import numbers7099Letris from "@/content/numbers-70-99-letris.json";
import languagesLetris from "@/content/languages-letris.json";
import nationalitiesLetris from "@/content/nationalities-letris.json";
import aimerActivitesLetris from "@/content/aimer-activites-letris.json";
import type { LetrisSet } from "./LetrisGame";

export type LetrisSetMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  tileCount: number;
  categoryCount: number;
  emoji: string;
};

const REGISTRY: Record<string, LetrisSet> = {
  weather: weather as LetrisSet,
  countries: countries as LetrisSet,
  "countries-expert": countriesExpert as LetrisSet,
  lieux: lieux as LetrisSet,
  "loin-lesson": loinLesson as LetrisSet,
  "core-nouns": coreNouns as LetrisSet,
  "stress-pronouns": stressPronouns as LetrisSet,
  professions: professions as LetrisSet,
  matieres: matieres as LetrisSet,
  "avoir-etats": avoirEtats as LetrisSet,
  "objets-articles": objetsArticles as LetrisSet,
  possessives: possessives as LetrisSet,
  "faire-activites": faireActivites as LetrisSet,
  "aller-destinations": allerDestinations as LetrisSet,
  "quand-time": quandTime as LetrisSet,
  "en-au-aux-a": enAuAuxA as LetrisSet,
  demonstratifs: demonstratifs as LetrisSet,
  commerces: commerces as LetrisSet,
  "tu-vous": tuVous as LetrisSet,
  salutations: salutations as LetrisSet,
  // Unit 4's third rain (Dan, 2026-07-13): food GROUPS, partitives spoken.
  aliments: alimentsLetris as LetrisSet,
  // Units 3-4 expansion (Dan, 2026-07-14: "more vocabularain items for
  // units 3 and 4") — keys match the backing deck ids so the rain flap
  // appears on those decks and the gallery colors them by unit.
  transport: transportLetris as LetrisSet,
  partitifs: partitifsLetris as LetrisSet,
  modaux: modauxLetris as LetrisSet,
  "question-words": questionWordsLetris as LetrisSet,
  // Content-gap wave (2026-08-23): rain sets for the decks that had none,
  // keyed by deck id so the rails' `collectionId.replace("-letris", "")`
  // lands here. Category axes come from the syllabus: U0 jours + moments,
  // U0 alphabet pour épeler (rhyme families), U0/U1 nombres 1–10 vs 11–69
  // (« vingt et un » vs « vingt-deux »), U4 nombres (3) de 70 à 100,
  // U1 accord des adjectifs de nationalité, U1/U2 l'élision (le/l'),
  // U2 aimer + article défini vs aimer + infinitif.
  days: daysLetris as LetrisSet,
  alphabet: alphabetLetris as LetrisSet,
  "numbers-0-20": numbers020Letris as LetrisSet,
  "numbers-20-69": numbers2069Letris as LetrisSet,
  "numbers-70-99": numbers7099Letris as LetrisSet,
  languages: languagesLetris as LetrisSet,
  nationalities: nationalitiesLetris as LetrisSet,
  "aimer-activites": aimerActivitesLetris as LetrisSet,
};

const META: Record<string, { emoji: string }> = {
  weather: { emoji: "🌦️" },
  countries: { emoji: "🌍" },
  "countries-expert": { emoji: "🌐" },
  lieux: { emoji: "🏙️" },
  "loin-lesson": { emoji: "📍" },
  "core-nouns": { emoji: "🏫" },
  "stress-pronouns": { emoji: "🙋" },
  professions: { emoji: "💼" },
  matieres: { emoji: "📚" },
  "avoir-etats": { emoji: "🥱" },
  "objets-articles": { emoji: "🎒" },
  possessives: { emoji: "🔑" },
  "faire-activites": { emoji: "🏃" },
  "aller-destinations": { emoji: "🚏" },
  "quand-time": { emoji: "⏰" },
  "en-au-aux-a": { emoji: "🗺️" },
  demonstratifs: { emoji: "👉" },
  commerces: { emoji: "🛍️" },
  "tu-vous": { emoji: "🤝" },
  salutations: { emoji: "👋" },
  aliments: { emoji: "🍽️" },
  transport: { emoji: "🚌" },
  partitifs: { emoji: "🥖" },
  modaux: { emoji: "🚦" },
  "question-words": { emoji: "🗨️" },
  days: { emoji: "📅" },
  alphabet: { emoji: "🔤" },
  "numbers-0-20": { emoji: "🔢" },
  "numbers-20-69": { emoji: "🧮" },
  "numbers-70-99": { emoji: "💯" },
  languages: { emoji: "🗣️" },
  nationalities: { emoji: "🪪" },
  "aimer-activites": { emoji: "❤️" },
};

// Out-of-syllabus pools — reachable by slug, but hidden from the default lesson
// list; surfaced only once an Expert-mode toggle is wired up.
const EXPERT_ONLY = new Set<string>(["countries-expert"]);

// Deck-id → set-slug aliases: the modaux set serves BOTH modaux decks, but
// the rails derive the slug from the deck id (`collectionId.replace("-letris",
// "")`), which matched no registry key — the set was reachable from the rain
// gallery and from neither deck (content-gap audit, 2026-08-23). One shared
// entry in the gallery, two doors from the rails.
const DECK_SLUG_ALIASES: Record<string, string> = {
  "modaux-plans": "modaux",
  "modaux-avis": "modaux",
};

export function getLetrisSet(slug: string): LetrisSet | null {
  return REGISTRY[slug] ?? REGISTRY[DECK_SLUG_ALIASES[slug] ?? ""] ?? null;
}

export function listLetrisSets({ includeExpert = false } = {}): LetrisSetMeta[] {
  return Object.entries(REGISTRY)
    .filter(([slug]) => includeExpert || !EXPERT_ONLY.has(slug))
    .map(([slug, set]) => ({
    slug,
    title: set.title,
    subtitle: set.subtitle,
    tileCount: set.tiles.length,
    categoryCount: set.categories.length,
    emoji: META[slug]?.emoji ?? "🎯",
  }));
}
