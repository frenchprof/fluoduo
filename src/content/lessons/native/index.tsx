/**
 * Registry of lessons converted to NATIVE in-app content (CahierShell + Mémo +
 * DiceTrainer) — Dan, 2026-07-03. Every lesson (all grammar lessons + the three Révision mixes) is native.
 */
import type { NativeLesson } from "./types";
import { aimerLesson } from "./aimer";
import { tuVousLesson } from "./tu-vous";
import { salutationsLesson } from "./salutations";
import { professionsLesson } from "./professions";
import { nationalitiesLesson } from "./nationalities";
import { meteoLesson } from "./meteo";
import { alimentsLesson } from "./aliments";
import { sePresenterLesson } from "./se-presenter";
import { negationLesson } from "./negation";
import { conjugaisonU1Lesson } from "./conjugaison-u1";
// Written 2026-08-28 for the three stops whose decks could not keep their
// promise: SIO-003 taught 26 letters and promised the spelling exchange,
// SIO-017 taught 19 language names and promised the country link, SIO-018
// taught 15 numerals and promised ages, prices and quantities.
import { caSecritLesson } from "./ca-secrit";
import { languesPaysLesson } from "./langues-pays";
import { nombresEchangesLesson } from "./nombres-echanges";
// SIO-011: the deck frames « c'est moi » already; what it never drilled was
// the everyday echo. Dan, 2026-08-29: no prepositions, "... aussi / non plus".
import { moiAussiLesson } from "./moi-aussi";
// Stops 4, 7, 8, 21 and 34 — the promises whose second half had nothing
// behind it (Dan, 2026-08-29: simplest possible sentences; 7 stops at ten;
// 8 gets two lines only; 34's lesson must talk about the prepositions).
import { quelJourLesson } from "./quel-jour";
import { combienLesson } from "./combien";
import { onFaitQuoiLesson } from "./on-fait-quoi";
import { quEstCeLesson } from "./qu-est-ce-que-c-est";
import { ouEstLesson } from "./ou-est";
// SIO-036: the deck gives directions and never asks for them — « Quel est le
// chemin pour … ? » is its title and appears on no card.
import { leCheminLesson } from "./le-chemin";
// Three more promises whose deck taught only the vocabulary: 13 never asks
// its own title's question, 44 is fourteen shop names against a four-act
// can-do, and 45A holds the numerals without the arithmetic that builds them.
import { quelleMatiereLesson } from "./quelle-matiere";
// SIO-005 and SIO-006 — the two Tier 2 stops that had a deck and no lesson
// file, so a concept had nowhere to live (Dan, 2026-08-31: "then just show
// it"). Colours teaches word order; Some nouns teaches that gender is stored
// with the word.
import { colorsLesson } from "./colors";
import { coreNounsLesson } from "./core-nouns";
// SIO-038 — the last Tier 1 stop whose deck had no lesson file (colour review's
// handover, 31 Aug). Its twelve items are three frames: en + a vehicle you sit
// inside, à + on foot or astride, prendre + the definite article.
import { transportLesson } from "./transport";
// SIO-010 — the first atelier with a lesson file, and the prototype for the
// other five. Its Mémo is the generated model, passed through: authoring one
// here would REPLACE the dialogue an atelier opens on (LessonPager resolves
// `lesson?.memo ?? memoForDeck(...)`).
import { atelierRencontreLesson } from "./atelier-rencontre";
import { auMarcheLesson } from "./au-marche";
import { soixanteDixLesson } from "./soixante-dix";
import { avoirEtatsLesson } from "./avoir-etats";
import { questionsOuiNonLesson } from "./questions-oui-non";
import { motsInterrogatifsLesson } from "./mots-interrogatifs";
import { articlesPaysLesson } from "./articles-pays";
import { faireLesson } from "./faire";
import { aimerInfinitifLesson } from "./aimer-infinitif";
import { allerLesson } from "./aller";
import { quandLesson } from "./quand";
import { possessifsLesson } from "./possessifs";
import { conjugaisonErLesson } from "./conjugaison-er";
import { modauxLesson } from "./modaux";
import { rendezvousLesson } from "./rendezvous";
import { prepositionsLesson } from "./prepositions";
import { prepositionsLieuxLesson } from "./prepositions-lieux";
import { partitifsLesson } from "./partitifs";
import { mangerBoireLesson } from "./manger-boire";
import { futurProcheLesson } from "./futur-proche";
import { pouvoirLesson } from "./pouvoir";
import { conseilsLesson } from "./conseils";
import { frequenceLesson } from "./frequence";
import { demonstratifsLesson } from "./demonstratifs";
import { revisionU1Lesson, revisionU3U4Lesson, revisionU4Lesson } from "./revisions";

export const NATIVE_LESSONS: Record<string, NativeLesson> = {
  "tu-vous": tuVousLesson,
  salutations: salutationsLesson,
  professions: professionsLesson,
  nationalities: nationalitiesLesson,
  meteo: meteoLesson,
  aliments: alimentsLesson,
  "se-presenter": sePresenterLesson,
  negation: negationLesson,
  "conjugaison-u1": conjugaisonU1Lesson,
  "avoir-etats": avoirEtatsLesson,
  "questions-oui-non": questionsOuiNonLesson,
  "mots-interrogatifs": motsInterrogatifsLesson,
  "articles-pays": articlesPaysLesson,
  aimer: aimerLesson,
  faire: faireLesson,
  "aimer-infinitif": aimerInfinitifLesson,
  aller: allerLesson,
  quand: quandLesson,
  possessifs: possessifsLesson,
  "conjugaison-er": conjugaisonErLesson,
  modaux: modauxLesson,
  rendezvous: rendezvousLesson,
  prepositions: prepositionsLesson,
  "prepositions-lieux": prepositionsLieuxLesson,
  partitifs: partitifsLesson,
  "manger-boire": mangerBoireLesson,
  "futur-proche": futurProcheLesson,
  "pouvoir": pouvoirLesson,
  "conseils": conseilsLesson,
  frequence: frequenceLesson,
  demonstratifs: demonstratifsLesson,
  "ca-secrit": caSecritLesson,
  "langues-pays": languesPaysLesson,
  "nombres-echanges": nombresEchangesLesson,
  "moi-aussi": moiAussiLesson,
  "quel-jour": quelJourLesson,
  combien: combienLesson,
  "on-fait-quoi": onFaitQuoiLesson,
  "qu-est-ce-que-c-est": quEstCeLesson,
  "ou-est": ouEstLesson,
  "le-chemin": leCheminLesson,
  "quelle-matiere": quelleMatiereLesson,
  "au-marche": auMarcheLesson,
  "soixante-dix": soixanteDixLesson,
  colors: colorsLesson,
  "core-nouns": coreNounsLesson,
  transport: transportLesson,
  "atelier-rencontre": atelierRencontreLesson,
  "revision-u1": revisionU1Lesson,
  "revision-u3u4": revisionU3U4Lesson,
  "revision-u4": revisionU4Lesson,
};

export function getNativeLesson(slug: string): NativeLesson | undefined {
  return NATIVE_LESSONS[slug];
}
