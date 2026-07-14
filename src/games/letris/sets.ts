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
};

// Out-of-syllabus pools — reachable by slug, but hidden from the default lesson
// list; surfaced only once an Expert-mode toggle is wired up.
const EXPERT_ONLY = new Set<string>(["countries-expert"]);

export function getLetrisSet(slug: string): LetrisSet | null {
  return REGISTRY[slug] ?? null;
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
