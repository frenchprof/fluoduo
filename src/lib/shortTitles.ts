/**
 * Concise display titles (Dan, 2026-07-13: Lexicalator titles cut to a
 * glanceable length, "and do similar cuts for VocabulaRain"). Keyed by deck
 * id AND rain-set slug; full titles stay everywhere else (lessons, popups)
 * and in tooltips.
 */
const SHORT_TITLES: Record<string, string> = {
  // ── Unité 0 ──
  days: "Quel(s) jour(s)",
  colors: "La(Les) couleur(s)",
  "core-nouns": "Qui/Quoi/Un(e)",
  "numbers-0-20": "De zéro à vingt",
  // ── Unité 1 ──
  "countries-letris": "Quel(s) pays",
  countries: "Quel(s) pays",
  "countries-expert": "Pays (expert)",
  nationalities: "Quel(s) adjectif(s)",
  languages: "Quelle(s) langue(s)",
  professions: "Quelle(s) profession(s)",
  matieres: "Quelles études",
  "numbers-20-69": "De 21 à 69",
  "numbers-70-99": "De 70 à 99",
  "avoir-etats": "Être ou Avoir",
  // ── Unité 2 ──
  "objets-articles": "Un(e)/Des",
  possessives: "Mon/Ma/Mes",
  "aimer-activites": "Aimer/Détester l'/le/la",
  "faire-activites": "Faire du/de la/de l'/des",
  "aller-destinations": "Aller au/à la/à l'/aux",
  "quand-time": "Le temps qu'on a",
  // ── Unité 3 ──
  weather: "Le temps qu'il fait",
  "weather-letris": "Le temps qu'il fait",
  "lieux-letris": "Les lieux (Où ?)",
  lieux: "Les lieux (Où ?)",
  "loin-lesson": "C'est ici/devant/loin ?",
  "en-au-aux-a": "Prép.+Nom de pays",
  transport: "Tu y vas comment ?",
  // ── Unité 4 ──
  aliments: "Manger/Boire/Prendre",
  frequence: "La fréquence",
  demonstratifs: "Ce(t)(te)/Ces",
  commerces: "Les courses qu'on fait",
  // ── Rain-only sets ──
  "stress-pronouns": "Moi/Toi/Lui…",
  "tu-vous": "Tu ou Vous ?",
  salutations: "Bonjour/Au revoir",
};

export function shortTitle(id: string, fallback: string): string {
  return SHORT_TITLES[id] ?? SHORT_TITLES[id.replace(/-letris$/, "")] ?? fallback;
}
