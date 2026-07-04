/**
 * Native "Quand ? Quel moment ?" lesson (Unité 2 · L12) — the Mémo + 🎲 dice
 * trainer + EN→FR bonus distilled from the 12-quand.html drchan import, as
 * real in-app content following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";

const TIMES: { h: number; m: number; fr: string }[] = [
  { h: 8, m: 0, fr: "Il est huit heures du matin." },
  { h: 9, m: 15, fr: "Il est neuf heures et quart du matin." },
  { h: 10, m: 30, fr: "Il est dix heures et demie du matin." },
  { h: 11, m: 45, fr: "Il est midi moins le quart." },
  { h: 12, m: 0, fr: "Il est midi." },
  { h: 14, m: 0, fr: "Il est deux heures de l'après-midi." },
  { h: 15, m: 30, fr: "Il est trois heures et demie de l'après-midi." },
  { h: 17, m: 45, fr: "Il est six heures moins le quart du soir." },
  { h: 19, m: 0, fr: "Il est sept heures du soir." },
  { h: 20, m: 15, fr: "Il est huit heures et quart du soir." },
  { h: 22, m: 30, fr: "Il est dix heures et demie du soir." },
  { h: 0, m: 0, fr: "Il est minuit." },
  { h: 1, m: 0, fr: "Il est une heure du matin." },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const clock = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const ampm = (h: number, m: number) => `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
/** "Il est huit heures du matin." → "huit heures du matin" (the dropdown gap). */
const gap = (fr: string) => fr.slice("Il est ".length, -1);

export const quandLesson: NativeLesson = {
  slug: "quand",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Quelle heure est-il ? — <em lang="fr">Il est…</em>
      </h2>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--cahier-la)]">Il est deux heures.</b> — 2:00 (<i lang="fr">une heure</i> stays singular)</li>
        <li><b className="text-[color:var(--cahier-la)]">et quart</b> :15 · <b className="text-[color:var(--cahier-la)]">et demie</b> :30 · <b className="text-[color:var(--cahier-la)]">moins le quart</b> :45</li>
        <li><b className="text-[color:var(--cahier-la)]">midi</b> 12:00 · <b className="text-[color:var(--cahier-la)]">minuit</b> 00:00 — no <i lang="fr">heures</i></li>
        <li>am/pm: <b lang="fr">du matin</b> · <b lang="fr">de l&rsquo;après-midi</b> · <b lang="fr">du soir</b></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b><i lang="fr">moins le quart</i> counts back from the NEXT hour</b>: 11:45 → <span lang="fr">Il est <b>midi</b> moins le quart.</span>
      </p>
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
      const t = pick(TIMES);
      const others = TIMES.filter((x) => x !== t).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        meta: "Quelle heure est-il ?",
        big: clock(t.h, t.m),
        en: ampm(t.h, t.m),
        correct: t.fr,
        easyOptions: [t.fr, ...others.map((o) => o.fr)],
        med: { before: "Il est", choices: [gap(t.fr), ...others.map((o) => gap(o.fr))], correct: gap(t.fr), after: "." },
      };
    },
  },
  bonus: [
    { en: "It is eight o'clock in the morning.", fr: "Il est huit heures du matin." },
    { en: "It is quarter past nine in the morning.", fr: "Il est neuf heures et quart du matin." },
    { en: "It is half past ten in the morning.", fr: "Il est dix heures et demie du matin." },
    { en: "It is quarter to noon.", fr: "Il est midi moins le quart." },
    { en: "It is noon.", fr: "Il est midi." },
    { en: "It is two o'clock in the afternoon.", fr: "Il est deux heures de l'après-midi." },
    { en: "It is half past three in the afternoon.", fr: "Il est trois heures et demie de l'après-midi." },
    { en: "It is seven o'clock in the evening.", fr: "Il est sept heures du soir." },
    { en: "It is quarter past eight in the evening.", fr: "Il est huit heures et quart du soir." },
    { en: "It is midnight.", fr: "Il est minuit." },
  ],
};
