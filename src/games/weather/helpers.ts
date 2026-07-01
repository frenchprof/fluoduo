import { buildSentence } from "@/games/letris/speech";
import type { LetrisSet, LetrisTile } from "@/games/letris/LetrisGame";

export type WeatherCard = {
  id: string;
  tile: LetrisTile;
  categoryLabel: string;
  sentence: string;
  meaning: string;
  emoji: string;
};

export function cardsFor(set: LetrisSet): WeatherCard[] {
  return set.tiles.map((t, i) => {
    const cat = set.categories.find((c) => c.key === t.category);
    return {
      id: `${set.id}-${i}`,
      tile: t,
      categoryLabel: cat?.label ?? "",
      sentence: cat ? buildSentence(cat, t) : t.text,
      meaning: t.meaning ?? "",
      emoji: t.emoji ?? "",
    };
  });
}

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickDistractors<T>(pool: T[], correct: T, count: number): T[] {
  const others = pool.filter((x) => x !== correct);
  return shuffle(others).slice(0, count);
}

/** Normalise typed input for fuzzy comparison: lowercase, strip accents, trim. */
export function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
