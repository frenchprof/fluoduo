import type { ReactNode } from "react";
import type { DiceConfig } from "@/games/dice/DiceTrainer";

/** A lesson converted from iframed drchan HTML to real in-app content:
 *  Mémo (the grammar reference) + 🎲 dice trainer + EN→FR bonus. */
export type NativeLesson = {
  slug: string;
  memo: ReactNode;
  dice: DiceConfig;
  bonus: { en: string; fr: string; alt?: string[] }[];
};
