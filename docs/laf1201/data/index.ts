import { u0 } from "./u0";
import { u1 } from "./u1";
import { u2 } from "./u2";
import { u3 } from "./u3";
import { u4 } from "./u4";
import type { Section, Sheet, ThemeId } from "./types";

export const sheets: Sheet[] = [u0, u1, u2, u3, u4];

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
];

export type SourcedSection = { sheet: Sheet; section: Section };

export function sectionsForTheme(theme: ThemeId): SourcedSection[] {
  return sheets.flatMap((sheet) =>
    sheet.sections.filter((s) => s.theme === theme).map((section) => ({ sheet, section })),
  );
}
