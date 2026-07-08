"use client";

/**
 * Diced Practice — the Lesson's single "Pratique" widget (Dan, 2026-07-05):
 * every deck drills its own items through four levels in DiceTrainer chrome
 * (level cycler, 🎲 roll, ✓/streak, feedback + 🔊, 🏁 Summary).
 *
 * Gap-ready decks (pool = gappedItems):
 *   ★ Facile         — sentence with the gap blanked + en gloss, pick the gap
 *                      among 4 (distractors = other items' gaps).
 *   ★★ Intermédiaire — same frame, TYPE the gap (GramMarathon tiers: exact →
 *                      deaccented "good" → d'/de elision).
 *   ★★★ Difficile    — French-only cue: `fr` with the gap replaced by
 *                      "(lemma)" (else a blank); type the FULL sentence.
 *   ⭐ Bonus          — en prompt, type the full French sentence.
 *
 * Gapless decks keep Facile (en → pick the fr among 4), Intermédiaire
 * (Complete It, its own loop) and Bonus; Difficile hides — no French-only cue
 * exists. Every graded answer feeds recordItemResult.
 */

import { useRef, useState } from "react";
import CompleteItContent from "@/app/practice/complete-it/[collectionId]/CompleteItContent";
import { Summary } from "@/games/dice/DiceTrainer";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { CURATED } from "@/content/collections";
import { gappedItems } from "@/lib/collections/gramMarathonReady";
import type { Item } from "@/lib/collections/schema";
import { gradeAnswer, gradeGap, splitGap } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";

type Attempt = { q: string; user: string; correct: string; ok: boolean };
type Level = "facile" | "inter" | "difficile" | "bonus";

const LEVEL_LABELS: Record<Level, string> = {
  facile: "★ Facile",
  inter: "★★ Intermédiaire",
  difficile: "★★★ Difficile",
  bonus: "⭐ Bonus",
};

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

// The cloze sentence for a gapped item: its `example` when present (so a deck
// can keep `fr` as a short label for Flip It's grid while still drilling a full
// gapped sentence here — Dan, 2026-07-06), else `fr` itself. Its English gloss
// mirrors that: `exampleEn` when present — crucial for ⭐ Bonus, where "the
// café" under-specifies "Je suis au café."
const sentenceOf = (it: Item) => it.example ?? it.fr;
const sentenceEnOf = (it: Item) => it.exampleEn ?? it.en;

function Blank() {
  return <span className="mx-1 inline-block min-w-[3ch] border-b-2 border-[color:var(--cahier-ink)] align-baseline">&nbsp;</span>;
}

export default function DicedPractice({ collectionId }: { collectionId: string; embedded?: boolean }) {
  const deck = CURATED.find((c) => c.id === collectionId);
  const pool = deck ? gappedItems(deck) : [];
  const hasGaps = pool.length > 0;
  const items = hasGaps ? pool : deck?.items ?? [];
  const levels: Level[] = hasGaps ? ["facile", "inter", "difficile", "bonus"] : ["facile", "inter", "bonus"];

  const [lvlIdx, setLvlIdx] = useState(0);
  const [q, setQ] = useState<{ item: Item; options: string[] } | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; user: string }>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showSum, setShowSum] = useState(false);
  // Session order lives in a ref: randomness stays inside click handlers
  // (no Math.random during render → SSR-safe), reshuffles when exhausted.
  const orderRef = useRef<{ ids: number[]; i: number }>({ ids: [], i: 0 });

  if (!deck || items.length === 0) return null;
  const level = levels[lvlIdx % levels.length];

  function buildOptions(item: Item): string[] {
    const correct = hasGaps ? item.gap! : item.fr;
    const fromPool = items.filter((p) => p.id !== item.id).map((p) => (hasGaps ? p.gap! : p.fr));
    let distractors = shuffle([...new Set(fromPool)].filter((x) => x !== correct)).slice(0, 3);
    if (distractors.length < 3) {
      // Fewer than 3 unique gaps in the pool: pad with deck-level distractors.
      const extras = [...new Set(deck!.items.map((p) => p.fr))].filter(
        (x) => x !== correct && x !== item.fr && !distractors.includes(x),
      );
      distractors = [...distractors, ...shuffle(extras)].slice(0, 3);
    }
    return shuffle([correct, ...distractors]);
  }

  function roll() {
    const o = orderRef.current;
    if (o.i >= o.ids.length) {
      o.ids = shuffle(items.map((_, k) => k));
      o.i = 0;
    }
    const item = items[o.ids[o.i++]];
    setQ({ item, options: buildOptions(item) });
    setTyped("");
    setResult(null);
  }

  function jumpTo(i: number) {
    const next = levels[i];
    setLvlIdx(i);
    if (!hasGaps && next === "inter") {
      setQ(null);
      setTyped("");
      setResult(null);
    } else if (q) {
      roll();
    }
  }

  function grade(user: string, ok: boolean, qText: string) {
    if (!q) return;
    const item = q.item;
    setResult({ ok, user });
    setAttempts((a) => [...a, { q: qText, user, correct: sentenceOf(item), ok }]);
    setStreak((s) => (ok ? s + 1 : 0));
    recordItemResult(item.id, ok);
    if (ok) sfx.correct(); else sfx.wrong();
    speak(sentenceOf(item), "fr-FR");
  }

  const isCompleteIt = !hasGaps && level === "inter";
  const answered = result !== null;
  const okCount = attempts.filter((a) => a.ok).length;

  const item = q?.item ?? null;
  const gapSplit = item && hasGaps ? splitGap(sentenceOf(item), item.gap!) : null;
  const cue = item && gapSplit ? `${gapSplit.before}${item.lemma ? `(${item.lemma})` : "＿＿＿"}${gapSplit.after}` : "";
  const qText = !item
    ? ""
    : level === "difficile"
      ? cue
      : level === "bonus"
        ? sentenceEnOf(item)
        : level === "facile" && !hasGaps
          ? item.en
          : gapSplit
          ? `${gapSplit.before}＿＿＿${gapSplit.after}`
          : sentenceOf(item);

  function checkGapTyped() {
    if (!item || !typed.trim()) return;
    grade(typed, gradeGap(typed, item.gap!) !== "wrong", qText);
  }
  function checkFullTyped() {
    if (!item || !typed.trim()) return;
    grade(typed, gradeAnswer(typed, sentenceOf(item)) !== "wrong", qText);
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* One button per level, active inverted + doubled 3D lip (Dan,
            2026-07-08: the flat cycler didn't read as a button). */}
        <span className="flex flex-wrap gap-1.5">
          {levels.map((lv, i) => (
            <button key={lv} type="button" onClick={() => jumpTo(i)}
              aria-pressed={level === lv}
              className={`cahier-btn cahier-btn-sm text-xs !shadow-[0_4px_0_0_var(--cahier-ink)] active:!shadow-none ${level === lv ? "cahier-btn-primary !shadow-[0_4px_0_0_#191c50]" : ""}`}>
              {LEVEL_LABELS[lv]}
            </button>
          ))}
        </span>
        {!isCompleteIt && (
          <span className="fluo-mono text-xs font-bold text-[color:var(--cahier-ink-soft)]">
            ✓ {okCount}/{attempts.length} · streak {streak}
          </span>
        )}
      </div>

      {isCompleteIt ? (
        <CompleteItContent collectionId={collectionId} embedded />
      ) : (
        <>
          <div className="text-center">
            <button type="button" onClick={roll} className="cahier-btn cahier-btn-accent font-black">🎲 Nouvelle question</button>
          </div>

          {q && item && (
            <div className="space-y-3" data-item-id={item.id} data-level={level}>
              {(level === "facile" || level === "difficile" || level === "bonus") && (
                <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-4 text-center">
                  {level === "facile" && hasGaps && gapSplit ? (
                    <>
                      <p lang="fr" className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
                        {gapSplit.before}
                        <Blank />
                        {gapSplit.after}
                      </p>
                      <p className="mt-0.5 text-sm italic text-[color:var(--cahier-ink-soft)]">{sentenceEnOf(item)}</p>
                    </>
                  ) : level === "difficile" ? (
                    <p lang="fr" className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">{cue}</p>
                  ) : (
                    <p className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">{level === "bonus" ? sentenceEnOf(item) : item.en}</p>
                  )}
                </div>
              )}

              {!answered && level === "facile" && (
                <div className="mx-auto flex max-w-md flex-col gap-2">
                  {q.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      lang="fr"
                      onClick={() => grade(o, o === (hasGaps ? item.gap : item.fr), qText)}
                      className="cahier-option text-center"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {!answered && level === "inter" && gapSplit && (
                <div className="text-center">
                  <p lang="fr" className="flex flex-wrap items-baseline justify-center gap-x-2 text-lg text-[color:var(--cahier-ink)]">
                    <span>{gapSplit.before}</span>
                    <input
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") checkGapTyped(); }}
                      placeholder="…"
                      autoComplete="off" spellCheck={false} lang="fr"
                      className="!w-44 border-b-2 border-dashed text-center align-baseline text-base"
                    />
                    <span>{gapSplit.after}</span>
                  </p>
                  <p className="mt-1 text-sm italic text-[color:var(--cahier-ink-soft)]">{sentenceEnOf(item)}</p>
                  <button type="button" disabled={!typed.trim()} onClick={checkGapTyped} className="cahier-btn cahier-btn-primary mt-3 disabled:opacity-40">✅ Je vérifie</button>
                </div>
              )}

              {!answered && (level === "difficile" || level === "bonus") && (
                <div className="mx-auto max-w-md text-center">
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") checkFullTyped(); }}
                    placeholder="Écrivez la phrase complète…"
                    autoComplete="off" spellCheck={false} lang="fr"
                  />
                  <button type="button" disabled={!typed.trim()} onClick={checkFullTyped} className="cahier-btn cahier-btn-primary mt-3 disabled:opacity-40">✅ Je vérifie</button>
                </div>
              )}

              {answered && (
                <div className={`rounded-xl border-2 p-3 text-center ${result!.ok ? "border-emerald-600/50 bg-emerald-600/10" : "border-rose-600/50 bg-rose-600/10"}`}>
                  <p className="font-black text-[color:var(--cahier-ink)]">
                    {result!.ok ? "✔ Correct !" : "✘ Presque…"} <span lang="fr">{sentenceOf(item)}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => speak(sentenceOf(item), "fr-FR")} className="cahier-btn cahier-btn-sm">🔊 J&rsquo;écoute</button>
                    <button type="button" onClick={roll} className="cahier-btn cahier-btn-sm cahier-btn-accent">🎲 Nouvelle question</button>
                    <button type="button" onClick={() => { if (attempts.length > 0) sfx.stage(); setShowSum(true); }} className="cahier-btn cahier-btn-sm">🏁 Je termine</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showSum && attempts.length > 0 && <Summary title="Résumé" attempts={attempts} onClose={() => setShowSum(false)} />}
    </div>
  );
}
