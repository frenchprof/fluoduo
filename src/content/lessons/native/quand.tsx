/**
 * Native "Quand ? Quel moment ?" lesson (Unité 2 · L12) — the Mémo + 🎲 dice
 * trainer + EN→FR bonus distilled from the 12-quand.html drchan import, as
 * real in-app content following the aimer.tsx template.
 *
 * Dan, 2026-07-04: time-telling is 24-hour "A heures B" ONLY (A = 0–23,
 * B = any minute 0–59, feminine — "vingt et une") — no et quart / et demie /
 * moins le quart, no midi/minuit, no du matin/du soir.
 */
import type { NativeLesson } from "./types";

/** Hour words 0–23, feminine forms (heure): une, vingt et une. */
const HOURS = [
  "zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
  "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf", "vingt", "vingt et une", "vingt-deux",
  "vingt-trois",
] as const;

/** Minute words 1–59, feminine (minute): une, vingt et une… 0 is silent. */
const TENS: Record<number, string> = { 20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante" };
function minuteWord(m: number): string {
  if (m < 20) return HOURS[m];
  const ten = Math.floor(m / 10) * 10;
  const unit = m % 10;
  if (unit === 0) return TENS[ten];
  if (unit === 1) return `${TENS[ten]} et une`;
  return `${TENS[ten]}-${HOURS[unit]}`;
}

/** "vingt heures quinze" — the part after "Il est". */
const frTime = (h: number, m: number) =>
  `${HOURS[h]} heure${h === 0 || h === 1 ? "" : "s"}${m ? ` ${minuteWord(m)}` : ""}`;

const clock = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const ampm = (h: number, m: number) => `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;

const randH = () => Math.floor(Math.random() * 24);
const randM = () => Math.floor(Math.random() * 60);

export const quandLesson: NativeLesson = {
  slug: "quand",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Quelle heure est-il ? — <em lang="fr">Il est…</em>
      </h2>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--cahier-la)]">Il est vingt heures quinze.</b> — 20:15</li>
        <li><b className="text-[color:var(--cahier-la)]">Il est huit heures.</b> — 08:00</li>
        <li><b className="text-[color:var(--cahier-la)]">Il est une heure cinq.</b> — 01:05 (<i lang="fr">une heure</i> stays singular)</li>
        <li><b className="text-[color:var(--cahier-la)]">Il est dix heures vingt et une.</b> — 10:21</li>
        <li><b className="text-[color:var(--cahier-la)]">Il est zéro heure trente.</b> — 00:30</li>
      </ul>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {["le matin", "l'après-midi", "le soir", "la nuit"].map((s) => (
          <span key={s} lang="fr" className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">{s}</span>
        ))}
      </p>
    </div>
  ),
  dice: {
    instruction: "Say the time on the clock in French.",
    newQuestion() {
      const h = randH();
      const m = randM();
      const correct = `Il est ${frTime(h, m)}.`;
      // Three distinct wrong times, biased toward near-misses (hour ±1, or
      // hour/minute digits swapped when that is a valid time).
      const wrong = new Set<string>();
      const add = (wh: number, wm: number) => {
        const f = `Il est ${frTime(wh, wm)}.`;
        if (f !== correct) wrong.add(f);
      };
      add((h + 1) % 24, m);
      add((h + 23) % 24, m);
      if (m < 24) add(m, h);
      while (wrong.size < 3) add(randH(), randM());
      const others = [...wrong].slice(0, 3);
      return {
        meta: "Quelle heure est-il ?",
        big: clock(h, m),
        en: ampm(h, m),
        correct,
        easyOptions: [correct, ...others],
        med: {
          before: "Il est",
          choices: [frTime(h, m), ...others.map((o) => o.slice("Il est ".length, -1))],
          correct: frTime(h, m),
          after: ".",
        },
      };
    },
  },
  bonus: [
    { en: "It is 8:00 am.", fr: "Il est huit heures." },
    { en: "It is 9:15 am.", fr: "Il est neuf heures quinze." },
    { en: "It is 10:30 am.", fr: "Il est dix heures trente." },
    { en: "It is 12:00.", fr: "Il est douze heures." },
    { en: "It is 2:45 pm.", fr: "Il est quatorze heures quarante-cinq." },
    { en: "It is 4:21 pm.", fr: "Il est seize heures vingt et une." },
    { en: "It is 5:47 pm.", fr: "Il est dix-sept heures quarante-sept." },
    { en: "It is 9:05 pm.", fr: "Il est vingt et une heures cinq." },
    { en: "It is 11:35 pm.", fr: "Il est vingt-trois heures trente-cinq." },
    { en: "It is 1:00 am.", fr: "Il est une heure." },
    { en: "It is 0:20 (twenty past midnight).", fr: "Il est zéro heure vingt." },
  ],
};
