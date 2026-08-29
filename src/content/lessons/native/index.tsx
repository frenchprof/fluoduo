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
import { epelerLesson } from "./epeler";
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
  epeler: epelerLesson,
  "langues-pays": languesPaysLesson,
  "nombres-echanges": nombresEchangesLesson,
  "moi-aussi": moiAussiLesson,
  "quel-jour": quelJourLesson,
  combien: combienLesson,
  "on-fait-quoi": onFaitQuoiLesson,
  "qu-est-ce-que-c-est": quEstCeLesson,
  "ou-est": ouEstLesson,
  "revision-u1": revisionU1Lesson,
  "revision-u3u4": revisionU3U4Lesson,
  "revision-u4": revisionU4Lesson,
};

export function getNativeLesson(slug: string): NativeLesson | undefined {
  return NATIVE_LESSONS[slug];
}
