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
  frequence: frequenceLesson,
  demonstratifs: demonstratifsLesson,
  "revision-u1": revisionU1Lesson,
  "revision-u3u4": revisionU3U4Lesson,
  "revision-u4": revisionU4Lesson,
};

export function getNativeLesson(slug: string): NativeLesson | undefined {
  return NATIVE_LESSONS[slug];
}
