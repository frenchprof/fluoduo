"use client";

/**
 * The generic 🎲 dice sentence-trainer — the value-add piece extracted from the
 * frenchwithdrchan lessons (Dan, 2026-07-03: native in-CahierShell, not iframed
 * HTML). A lesson supplies `newQuestion()` (a fresh randomized prompt + its
 * correct sentence + per-difficulty scaffolding) and this renders the three
 * tiers — Facile (pick the sentence), Intermédiaire (dropdown in a frame),
 * Difficile (type it) — with TTS, score/streak and a summary. Randomness stays
 * inside click handlers (no Math.random during render → SSR-safe).
 */

import { useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";

function StepLabel({ n, label }: { n: number; label: string }) {
  // Big, bold, contrasting (Dan, 2026-07-05: steps were "not salient enough
  // for the users to notice what to do where").
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cahier-ink)] text-base font-black text-white shadow-[2px_2px_0_var(--cahier-hl,#ffe000)]">{n}</span>
      <span className="cahier-hl rounded-sm px-1.5 text-base font-black uppercase tracking-wide text-[color:var(--cahier-ink)]">{label}</span>
      <div className="h-[2px] flex-1 bg-[color:var(--cahier-ink)]/25" />
    </div>
  );
}

export type DiceQuestion = {
  /** Small context line above the prompt, e.g. "J'aime … (like)". */
  meta: string;
  /** The big prompt (the thing to build the sentence around). */
  big: string;
  /** Muted gloss under the prompt. */
  en?: string;
  /** The full correct sentence (graded + spoken). */
  correct: string;
  /** Other fully-correct phrasings accepted when TYPING (e.g. the in-situ
   *  question order "Tu t'appelles comment ?") — displayed form stays
   *  `correct`. */
  alternates?: string[];
  /** Facile: full-sentence options (must include `correct`). */
  easyOptions: string[];
  /** Intermédiaire: frame with a dropdown gap. */
  med: { before: string; choices: string[]; correct: string; after: string };
};

export type DiceConfig = {
  instruction: string;
  newQuestion: () => DiceQuestion;
};

type Attempt = { q: string; user: string; correct: string; ok: boolean };

const DIFF_LABELS = ["★ Facile", "★★ Intermédiaire", "★★★ Difficile"] as const;

function norm(s: string): string {
  return s.toLowerCase().replace(/[.,!?]/g, "").replace(/’/g, "'").replace(/\s+/g, " ").trim();
}

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

export function Summary({ title, attempts, onClose }: { title: string; attempts: Attempt[]; onClose: () => void }) {
  const ok = attempts.filter((a) => a.ok).length;
  const pct = attempts.length ? Math.round((ok / attempts.length) * 100) : 0;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[color:var(--cahier-ink)]/45 p-4" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-auto rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper)] p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="cahier-display mb-3 text-xl font-black text-[color:var(--cahier-ink)]">{title} · {pct}% ({ok}/{attempts.length})</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {attempts.map((a, i) => (
              <tr key={i} className={a.ok ? "bg-emerald-600/10" : "bg-rose-600/10"}>
                <td className="p-1.5 font-bold">{a.ok ? "✔" : "✘"}</td>
                <td className="p-1.5 italic">{a.user || "—"}</td>
                <td className="p-1.5 font-bold" lang="fr">{a.correct}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={onClose} className="cahier-btn mt-4 w-full">Fermer</button>
      </div>
    </div>
  );
}

export default function DiceTrainer({ config }: { config: DiceConfig }) {
  const [diff, setDiff] = useState(0);
  const [q, setQ] = useState<DiceQuestion | null>(null);
  const [easyOpts, setEasyOpts] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null); // easy pick
  const [medTyped, setMedTyped] = useState("");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; user: string }>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showSum, setShowSum] = useState(false);

  function roll() {
    const nq = config.newQuestion();
    setQ(nq);
    setEasyOpts(shuffle(nq.easyOptions));
    setPicked(null); setMedTyped(""); setTyped(""); setResult(null);
  }

  function grade(user: string, ok: boolean) {
    if (!q) return;
    setResult({ ok, user });
    setAttempts((a) => [...a, { q: q.big, user, correct: q.correct, ok }]);
    setStreak((s) => (ok ? s + 1 : 0));
    if (ok) sfx.correct(); else sfx.wrong();
    speak(q.correct, "fr-FR");
  }

  const answered = result !== null;
  const okCount = attempts.filter((a) => a.ok).length;
  const step4Labels = ["Check answer", "Type the missing part", "Write the full answer"] as const;

  return (
    <div className="space-y-3 rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <StepLabel n={2} label="Select difficulty" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[color:var(--cahier-ink)]">🎲 {config.instruction}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setDiff((d) => (d + 1) % 3); if (q) roll(); }} className="cahier-btn cahier-btn-sm text-xs">
            {DIFF_LABELS[diff]} — change
          </button>
          <span className="fluo-mono text-xs font-bold text-[color:var(--cahier-ink-soft)]">✓ {okCount}/{attempts.length} · streak {streak}</span>
        </div>
      </div>

      <StepLabel n={3} label="Roll the dice" />
      <div className="text-center">
        <button type="button" onClick={roll} className="cahier-btn cahier-btn-accent font-black">🎲 Nouvelle question</button>
      </div>

      {q && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-4 text-center">
            <p className="text-xs font-bold text-[color:var(--cahier-ink-soft)]">{q.meta}</p>
            <p lang="fr" className="cahier-display mt-1 text-2xl font-black text-[color:var(--cahier-ink)]">{q.big}</p>
            {q.en && <p className="mt-0.5 text-sm italic text-[color:var(--cahier-ink-soft)]">{q.en}</p>}
          </div>

          {!answered && <StepLabel n={4} label={step4Labels[diff]} />}

          {!answered && diff === 0 && (
            <div className="mx-auto mt-3 flex max-w-md flex-col gap-2">
              {easyOpts.map((o) => (
                <button key={o} type="button" lang="fr" onClick={() => { setPicked(o); grade(o, o === q.correct); }}
                  className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2.5 text-[color:var(--cahier-ink)] transition hover:border-[color:var(--cahier-gold)]">
                  {o}
                </button>
              ))}
            </div>
          )}

          {/* ★★: the frame is shown, the missing part is TYPED — no options.
              A dropdown here read as a twin of ★ Facile (Dan, 2026-07-05:
              "Facile and Intermédiaire look the same to me"); typing makes
              the middle rung real cued production. */}
          {!answered && diff === 1 && (
            <div className="mt-3 text-center">
              <p lang="fr" className="flex flex-wrap items-baseline justify-center gap-x-2 text-lg text-[color:var(--cahier-ink)]">
                <span>{q.med.before}</span>
                <input
                  value={medTyped}
                  onChange={(e) => setMedTyped(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && medTyped.trim()) grade(`${q.med.before} ${medTyped} ${q.med.after}`.trim(), norm(medTyped) === norm(q.med.correct)); }}
                  placeholder="…"
                  autoComplete="off" spellCheck={false} lang="fr"
                  className="!w-44 border-b-2 border-dashed text-center align-baseline text-base"
                />
                <span>{q.med.after}</span>
              </p>
              <button type="button" disabled={!medTyped.trim()} onClick={() => grade(`${q.med.before} ${medTyped} ${q.med.after}`.trim(), norm(medTyped) === norm(q.med.correct))}
                className="cahier-btn cahier-btn-primary mt-3 disabled:opacity-40">✅ Je vérifie</button>
            </div>
          )}

          {!answered && diff === 2 && (
            <div className="mx-auto mt-3 max-w-md text-center">
              <input value={typed} onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && typed.trim()) grade(typed, [q.correct, ...(q.alternates ?? [])].some((a) => norm(typed) === norm(a))); }}
                placeholder="Écrivez la phrase complète…" autoComplete="off" spellCheck={false} lang="fr" />
              <button type="button" disabled={!typed.trim()} onClick={() => grade(typed, [q.correct, ...(q.alternates ?? [])].some((a) => norm(typed) === norm(a)))}
                className="cahier-btn cahier-btn-primary mt-3 disabled:opacity-40">✅ Je vérifie</button>
            </div>
          )}

          {answered && (
            <div className={`mt-3 rounded-xl border-2 p-3 text-center ${result!.ok ? "border-emerald-600/50 bg-emerald-600/10" : "border-rose-600/50 bg-rose-600/10"}`}>
              <p className="font-black text-[color:var(--cahier-ink)]">
                {result!.ok ? "✔ Correct !" : "✘ Presque…"}{" "}
                <span lang="fr" className={picked === null ? "" : ""}>{q.correct}</span>
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => speak(q.correct, "fr-FR")} className="cahier-btn cahier-btn-sm">🔊 J&rsquo;écoute</button>
                <button type="button" onClick={roll} className="cahier-btn cahier-btn-sm cahier-btn-accent">🎲 Nouvelle question</button>
                <button type="button" onClick={() => { if (attempts.length > 0) sfx.stage(); setShowSum(true); }} className="cahier-btn cahier-btn-sm">🏁 Je termine</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSum && attempts.length > 0 && <Summary title="Résumé" attempts={attempts} onClose={() => setShowSum(false)} />}
    </div>
  );
}

/** EN→FR type-in bonus — the drchan lessons' ⭐ tab, as a compact card. */
export function BonusTrainer({ items }: { items: { en: string; fr: string; alt?: string[] }[] }) {
  const [cur, setCur] = useState<{ en: string; fr: string; alt?: string[] } | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showSum, setShowSum] = useState(false);

  function roll() {
    setCur(items[Math.floor(Math.random() * items.length)]);
    setTyped(""); setResult(null);
  }
  function check() {
    if (!cur || !typed.trim()) return;
    const ok = [cur.fr, ...(cur.alt ?? [])].some((a) => norm(typed) === norm(a));
    setResult(ok);
    setAttempts((a) => [...a, { q: cur.en, user: typed, correct: cur.fr, ok }]);
    if (ok) sfx.correct(); else sfx.wrong();
    speak(cur.fr, "fr-FR");
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <StepLabel n={5} label="Bonus: Translate into French" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[color:var(--cahier-ink)]">⭐ Traduisez en français.</p>
        <button type="button" onClick={roll} className="cahier-btn cahier-btn-sm cahier-btn-accent">🎲 Nouvelle question</button>
      </div>
      {cur && (
        <div className="mt-3 text-center">
          <p className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">{cur.en}</p>
          {result === null ? (
            <div className="mx-auto mt-2 max-w-md">
              <input value={typed} onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") check(); }}
                placeholder="Écrivez en français…" autoComplete="off" spellCheck={false} lang="fr" />
              <button type="button" disabled={!typed.trim()} onClick={check} className="cahier-btn cahier-btn-primary mt-2 disabled:opacity-40">✅ Je vérifie</button>
            </div>
          ) : (
            <div className={`mt-2 rounded-xl border-2 p-3 ${result ? "border-emerald-600/50 bg-emerald-600/10" : "border-rose-600/50 bg-rose-600/10"}`}>
              <p className="font-black text-[color:var(--cahier-ink)]">{result ? "✔ Correct !" : "✘ Presque…"} <span lang="fr">{cur.fr}</span></p>
              <div className="mt-2 flex justify-center gap-2">
                <button type="button" onClick={() => speak(cur.fr, "fr-FR")} className="cahier-btn cahier-btn-sm">🔊</button>
                <button type="button" onClick={roll} className="cahier-btn cahier-btn-sm cahier-btn-accent">🎲</button>
                <button type="button" onClick={() => { if (attempts.length > 0) sfx.stage(); setShowSum(true); }} className="cahier-btn cahier-btn-sm">🏁</button>
              </div>
            </div>
          )}
        </div>
      )}
      {showSum && attempts.length > 0 && <Summary title="Résumé — Bonus" attempts={attempts} onClose={() => setShowSum(false)} />}
    </div>
  );
}
