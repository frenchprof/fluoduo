import { u0 } from "./u0";
import { u1 } from "./u1";
import { u2 } from "./u2";
import { u3 } from "./u3";
import { u4 } from "./u4";
import { tp } from "./tp";
import { rd } from "./rd";
import { ls } from "./ls";
import { wr } from "./wr";
import type { Section, Sheet, ThemeId } from "./types";

export const sheets: Sheet[] = [u0, u1, u2, u3, u4, tp, rd, ls, wr];

export const themes: { id: ThemeId; label: string; detail: string }[] = [
  { id: "saluer", label: "1. Greetings and names", detail: "bonjour, s'appeler, tu or vous" },
  { id: "identite", label: "2. Personal information", detail: "countries, nationality, profession, age, contact details" },
  { id: "temps", label: "3. Days and numbers", detail: "days, parts of the day, 0–20" },
  { id: "classe", label: "4. In class", detail: "instructions" },
  { id: "objets", label: "5. Objects", detail: "un, une, des · mon, ma, mes" },
  { id: "gouts", label: "6. Likes and reasons", detail: "aimer, adorer, détester · parce que" },
  { id: "sorties", label: "7. Going out", detail: "inviting, accepting, refusing, where and when" },
  { id: "meteo", label: "8. The weather", detail: "" },
  { id: "ville", label: "9. In town", detail: "places, prepositions, directions" },
  { id: "repas", label: "10. Meals and shopping", detail: "du, de la, des · shops" },
  { id: "projets", label: "11. Plans", detail: "aller + infinitive" },
  { id: "verbes", label: "12. Verbs in the present", detail: "-er, -ir, -re · être, avoir, aller, faire · prendre, partir, venir, vouloir, boire" },
  { id: "partitifs", label: "13. Partitive articles", detail: "du, de la, de l', des · pas de" },
  { id: "lieux", label: "14. Places and transport", detail: "à and en · the pronoun y" },
  { id: "adjectifs", label: "15. Adjective agreement", detail: "" },
  { id: "phrases", label: "16. Word order", detail: "est-ce que, ne… pas, adverbs" },
  { id: "conseils", label: "17. Giving advice", detail: "il faut, tu peux + infinitive" },
  { id: "lecture", label: "18. Reading", detail: "a menu, a postcard" },
  { id: "ecoute", label: "19. Listening", detail: "prepositions of place, directions, a phone call" },
  { id: "ecriture", label: "20. Writing", detail: "an informal email giving advice" },
];

export type SourcedSection = { sheet: Sheet; section: Section };

export function sectionsForTheme(theme: ThemeId): SourcedSection[] {
  return sheets.flatMap((sheet) =>
    sheet.sections.filter((s) => s.theme === theme).map((section) => ({ sheet, section })),
  );
}
