"use client";

/**
 * GramMarathon — the grammar-word cloze drill. The sentence is shown with ONE
 * grammar word blanked out (the item's hand-authored `gap`: du / de la / d' …);
 * the student types just that word. Everything around the blank is context, so
 * every keystroke lands on the grammar point itself — unlike ConjugaZone, where
 * the whole predicate (verb + agreement) is the target.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[-–—]/g, " ").replace(/[.,!?;:'"«»()]/g, "").replace(/\s+/g, " ").trim();
}
function deaccent(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
type Grade = "perfect" | "good" | "wrong";
function grade(typed: string, answer: string): Grade {
  const t = normalize(typed);
  const a = normalize(answer);
  if (!t) return "wrong";
  if (t === a) return "perfect";
  if (deaccent(t) === deaccent(a)) return "good";
  return "wrong";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Split `fr` around the gap occurrence, word-boundary aware so "de" never
 * matches inside "des"/"mange". A gap ending in an apostrophe elides into the
 * next word ("d'" + "eau"), so no boundary is required after it.
 */
function splitGap(fr: string, gap: string): { before: string; after: string } {
  const letter = /[a-zà-öø-ÿœæ]/i;
  for (let idx = fr.indexOf(gap); idx !== -1; idx = fr.indexOf(gap, idx + 1)) {
    const prev = fr[idx - 1];
    const next = fr[idx + gap.length];
    const okBefore = prev === undefined || !letter.test(prev);
    const okAfter = gap.endsWith("'") || next === undefined || !letter.test(next);
    if (okBefore && okAfter) return { before: fr.slice(0, idx), after: fr.slice(idx + gap.length) };
  }
  return { before: fr, after: "" };
}

export default function GramMarathonContent({ collectionId }: { collectionId: string }) {
  const deck = CURATED.find((c) => c.id === collectionId);
  const tabs = useMemo(() => (deck ? withActive(deckActivityTabs(deck.id), "grammarathon") : []), [deck]);

  const [order, setOrder] = useState<number[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Only the gapped items play — a line with no grammar word ("Oui, bonne
  // idée !") sits the game out.
  useEffect(() => {
    if (!deck) return;
    setOrder(shuffle(deck.items.map((it, idx) => (it.gap && it.fr.includes(it.gap) ? idx : -1)).filter((x) => x >= 0)));
  }, [deck]);

  useEffect(() => {
    if (result === null) inputRef.current?.focus();
    else nextRef.current?.focus(); // keep the type→Enter→Enter rhythm — no mouse needed
  }, [i, result]);

  if (!deck) return <main className="p-6">No deck <code>{collectionId}</code>.</main>;
  if (order === null) return null;

  const total = order.length;
  const done = i >= total;
  const item = done ? null : deck.items[order[i]];
  const gap = item?.gap ?? "";
  const { before, after } = item ? splitGap(item.fr, gap) : { before: "", after: "" };
  const isRight = result === "perfect" || result === "good";

  function check() {
    if (result !== null || !item) return;
    // d' IS de (elided): grade against both surface forms, keep the better.
    const alternates = [gap, ...(gap.endsWith("d'") ? [gap.slice(0, -2) + "de"] : [])];
    const grades = alternates.map((a) => grade(value, a));
    const g = grades.includes("perfect") ? "perfect" : grades.includes("good") ? "good" : "wrong";
    setResult(g);
    setScore((s) => ({ ok: s.ok + (g !== "wrong" ? 1 : 0), total: s.total + 1 }));
    recordItemResult(item.id, g !== "wrong");
    if (g !== "wrong") speak(item.fr, "fr-FR");
  }

  function next() {
    setResult(null);
    setValue("");
    setI((n) => n + 1);
  }

  function restart() {
    setOrder(shuffle(deck!.items.map((it, idx) => (it.gap && it.fr.includes(it.gap) ? idx : -1)).filter((x) => x >= 0)));
    setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });
  }

  return (
    <CahierShell
      tabs={tabs}
      active="grammarathon"
      topRight={!done ? <span className="fluo-mono text-sm font-bold">{i}/{total} · ✓ {score.ok}</span> : null}
    >
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">🏃 GramMarathon</h1>
        <p lang="fr" className="mt-1 mb-5 text-sm text-[color:var(--fluo-ink-soft)]">{deck.title}</p>

        {done ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
            <p className="text-lg font-black text-[color:var(--fluo-ink)]">Done · ✓ {score.ok}/{total}</p>
            <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm mt-3">Again</button>
          </div>
        ) : item ? (
          <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
            <p lang="fr" className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
              {before}
              <span className={`mx-0.5 inline-block min-w-[3ch] border-b-2 px-1 text-center ${result === null ? "border-[color:var(--fluo-ink)] text-[color:var(--fluo-ink-soft)]" : isRight ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700"}`}>
                {result === null ? " " : gap}
              </span>
              {after}
            </p>
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{item.en}</p>

            <form onSubmit={(e) => { e.preventDefault(); result === null ? check() : next(); }} className="mt-4">
              <input
                ref={inputRef}
                lang="fr"
                value={result === null ? value : gap}
                onChange={(e) => setValue(e.target.value)}
                disabled={result !== null}
                placeholder="le mot qui manque…"
                className={`cahier-answer w-full ${result === null ? "" : isRight ? "!border-emerald-500 !text-emerald-700" : "!border-rose-500 !text-rose-700"}`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              {result === null ? (
                <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
              ) : (
                <>
                  <div className={`mt-3 flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${isRight ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>
                    <span>{isRight ? (result === "good" ? "✅ Bien ! (accent différent)" : "✅ Parfait !") : "❌"}</span>
                    {!isRight && <span lang="fr" className="text-[color:var(--fluo-ink)]">→ {gap}</span>}
                    <button type="button" onClick={() => speak(item.fr, "fr-FR")} className="ml-auto text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                  </div>
                  {item.example && (
                    <p lang="fr" className="mt-2 text-sm italic text-[color:var(--fluo-ink-soft)]">{item.example}</p>
                  )}
                  <button ref={nextRef} type="submit" className="fluo-btn mt-3 w-full">{i + 1 >= total ? "Finish" : "Next →"}</button>
                </>
              )}
            </form>
          </div>
        ) : null}
      </div>
    </CahierShell>
  );
}
