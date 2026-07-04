import type { Metadata } from "next";
import LetrisGame from "@/games/letris/LetrisGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";

export const metadata: Metadata = {
  title: "Vocabularain · Language Sorter",
  description: "Sort French–English–Chinese cognates into the right language column.",
  robots: { index: false, follow: false },
};

/** 18 tiles (6 cognate sets × 3 languages). Player sorts each dropping word
 *  into the correct language column — spotting Français vs English is the fun
 *  part; 中文 is visually distinct but anchors the set conceptually. */
const COGNATES: LetrisSet = {
  id: "hidden-multilang",
  title: "Language Sorter · 语言分类",
  subtitle: "Can you tell Français from English? Sort each word into the right column.",
  language: "fr",
  categories: [
    { key: "en", label: "English 🇬🇧" },
    { key: "fr", label: "Français 🇫🇷" },
    { key: "zh", label: "中文 🇨🇳" },
  ],
  tiles: [
    { text: "cinema",      category: "en" },
    { text: "cinéma",      category: "fr" },
    { text: "电影院",      category: "zh" },
    { text: "music",       category: "en" },
    { text: "musique",     category: "fr" },
    { text: "音乐",        category: "zh" },
    { text: "theatre",     category: "en" },
    { text: "théâtre",     category: "fr" },
    { text: "剧院",        category: "zh" },
    { text: "hospital",    category: "en" },
    { text: "hôpital",     category: "fr" },
    { text: "医院",        category: "zh" },
    { text: "pharmacy",    category: "en" },
    { text: "pharmacie",   category: "fr" },
    { text: "药店",        category: "zh" },
    { text: "university",  category: "en" },
    { text: "université",  category: "fr" },
    { text: "大学",        category: "zh" },
  ],
};

const LEGEND = [
  { fr: "cinéma",      en: "cinema",      zh: "电影院", py: "diànyǐngyuàn" },
  { fr: "musique",     en: "music",       zh: "音乐",   py: "yīnyuè" },
  { fr: "théâtre",     en: "theatre",     zh: "剧院",   py: "jùyuàn" },
  { fr: "hôpital",     en: "hospital",    zh: "医院",   py: "yīyuàn" },
  { fr: "pharmacie",   en: "pharmacy",    zh: "药店",   py: "yàodiàn" },
  { fr: "université",  en: "university",  zh: "大学",   py: "dàxué" },
];

export default function VocabularainHidden() {
  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* header */}
        <div className="rounded-2xl border-2 border-sky-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-sky-700 px-5 py-4">
            <h1 className="text-xl font-black text-white">🌧️ Vocabularain · Language Sorter</h1>
            <p className="mt-0.5 text-sm text-sky-200">
              18 words drop from the sky — spot which language each one belongs to, then steer it into the right column.
            </p>
          </div>

          {/* legend table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-sky-100 bg-sky-50 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left text-sky-600">🇫🇷 Français</th>
                  <th className="px-4 py-2.5 text-left text-sky-600">🇬🇧 English</th>
                  <th className="px-4 py-2.5 text-left text-sky-600">🇨🇳 中文</th>
                  <th className="px-4 py-2.5 text-left text-sky-400">Pīnyīn</th>
                </tr>
              </thead>
              <tbody>
                {LEGEND.map((row, i) => (
                  <tr key={row.fr} className={`border-b border-sky-50 ${i % 2 === 0 ? "bg-white" : "bg-sky-50/50"}`}>
                    <td className="px-4 py-2 font-bold text-sky-900" lang="fr">{row.fr}</td>
                    <td className="px-4 py-2 text-slate-700" lang="en">{row.en}</td>
                    <td className="px-4 py-2 font-medium text-sky-800" lang="zh">{row.zh}</td>
                    <td className="px-4 py-2 text-slate-400 text-xs italic">{row.py}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="px-5 py-3 text-xs text-sky-600 border-t border-sky-100">
            <b>How to play:</b> use ← → to steer the falling word, ↓ to nudge, Space to drop instantly. Tap a column on mobile.
            The tricky part: <em>cinéma</em> (FR) vs <em>cinema</em> (EN) — spot the accent!
          </p>
        </div>

        {/* game */}
        <LetrisGame set={COGNATES} />
      </div>
    </main>
  );
}
