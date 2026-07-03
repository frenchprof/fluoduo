"use client";

/**
 * Complete It — the writing/spelling drill. Read the English, TYPE the French.
 * Universal (every deck has fr/en), so it fills the ✏️ slot that used to say
 * "coming soon". Grading is accent-tolerant (a missing accent is "close", not
 * wrong) — same normalise/deaccent as Say It — so a learner without an accent
 * keyboard isn't punished, but the correct spelling is always shown. Each answer
 * feeds recordItemResult, so completing here reschedules the item like any
 * other practice, and the Reviser/XP see it.
 *
 * Order shuffles in a mount effect (never during render) for deterministic SSR.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { bareWord } from "@/lib/collections/display";
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

export default function CompleteItContent({ collectionId }: { collectionId: string }) {
  const deck = CURATED.find((c) => c.id === collectionId);
  const tabs = useMemo(() => (deck ? withActive(deckActivityTabs(deck.id), "complete") : []), [deck]);

  const [order, setOrder] = useState<number[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (deck) setOrder(shuffle(deck.items.map((_, idx) => idx)));
  }, [deck]);

  useEffect(() => {
    if (result === null) inputRef.current?.focus();
  }, [i, result]);

  if (!deck) {
    return <main className="p-6">No deck <code>{collectionId}</code>.</main>;
  }
  if (order === null) return null; // pre-mount

  const total = order.length;
  const done = i >= total;
  const item = done ? null : deck.items[order[i]];
  const isRight = result === "perfect" || result === "good";

  function check() {
    if (result !== null || !item) return;
    const g = grade(value, item.fr);
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

  return (
    <CahierShell
      tabs={tabs}
      active="complete"
      crumb={<Link href="/" className="fluo-hl font-black">← FluoLingo</Link>}
      topRight={!done ? <span className="fluo-mono text-sm font-bold">{i}/{total} · ✓ {score.ok}</span> : null}
    >
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">✏️ Complete It</h1>
        <p lang="fr" className="mt-1 mb-5 text-sm text-[color:var(--fluo-ink-soft)]">{deck.title}</p>

        {done ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
            <p className="text-lg font-black text-[color:var(--fluo-ink)]">Done · ✓ {score.ok}/{total}</p>
            <button type="button" onClick={() => { setOrder(shuffle(deck.items.map((_, idx) => idx))); setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 }); }}
              className="fluo-btn fluo-btn-sm mt-3">Again</button>
          </div>
        ) : item ? (
          <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
            {/* the clue: English meaning; write the French */}
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">Write in French</p>
            <p className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
              {bareWord(item.en)}{item.note ? <span className="ml-1 text-sm font-medium text-[color:var(--fluo-ink-soft)]">{item.note}</span> : null}
            </p>

            <form onSubmit={(e) => { e.preventDefault(); result === null ? check() : next(); }} className="mt-4">
              <input
                ref={inputRef}
                lang="fr"
                value={result === null ? value : item.fr}
                onChange={(e) => setValue(e.target.value)}
                disabled={result !== null}
                placeholder={`commence par « ${item.fr[0]} »…`}
                className={`cahier-answer w-full ${result === null ? "" : isRight ? "!border-emerald-500 !text-emerald-700" : "!border-rose-500 !text-rose-700"}`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              {result === null ? (
                <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
              ) : (
                <>
                  <div className={`mt-3 flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${isRight ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>
                    <span>{isRight ? (result === "good" ? "✅ Bien ! (accent différent)" : "✅ Parfait !") : "❌"}</span>
                    {!isRight && <span lang="fr" className="text-[color:var(--fluo-ink)]">→ {item.fr}</span>}
                    <button type="button" onClick={() => speak(item.fr, "fr-FR")} className="ml-auto text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                  </div>
                  {item.example && (
                    <p lang="fr" className="mt-2 text-sm italic text-[color:var(--fluo-ink-soft)]">{item.example}</p>
                  )}
                  <button type="submit" className="fluo-btn mt-3 w-full">{i + 1 >= total ? "Finish" : "Next →"}</button>
                </>
              )}
            </form>
          </div>
        ) : null}
      </div>
    </CahierShell>
  );
}
