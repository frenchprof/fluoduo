"use client";

/**
 * Complete It — the writing/spelling drill. Read the English, TYPE the French.
 * For article decks (countries): graded against the full "article + noun" phrase.
 * For nationality decks: each country expands into 4 sub-questions (il est / elle
 * est / ils sont / elles sont) so all adjective forms are drilled.
 *
 * No flap/tab of its own in the current UI (folded into the Lesson unification,
 * Dan 2026-07-05) — reached only as DicedPractice's ★★ Intermédiaire level on a
 * gapless deck (see DicedPractice.tsx). The route/component still exist and are
 * embeddable directly (SioModal's "complete" key), just not linked anywhere.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { bareWord, practiceItems } from "@/lib/collections/display";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import type { Collection, Item } from "@/lib/collections/schema";

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

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c: { key: string }) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}
function frFull(article: string, fr: string): string {
  if (!article) return fr;
  return article.endsWith("'") ? `${article}${fr}` : `${article} ${fr}`;
}

const NAT_FORMS = ["ms", "fs", "mp", "fp"] as const;
type NatForm = typeof NAT_FORMS[number];
const NAT_SUBJECT: Record<NatForm, string> = { ms: "il est", fs: "elle est", mp: "ils sont", fp: "elles sont" };

type QEntry = { itemIdx: number; natForm?: NatForm };

export default function CompleteItContent({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  useActivityPlay("complete-it", collectionId);
  const deck = CURATED.find((c) => c.id === collectionId);
  const tabs = useMemo(() => (deck ? withActive(deckActivityTabs(deck.id), "complete") : []), [deck]);

  const [order, setOrder] = useState<QEntry[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const isNat = deck ? deck.items.some((it) => it.nat) : false;

  useEffect(() => {
    if (!deck) return;
    const entries: QEntry[] = [];
    practiceItems(deck).forEach((item, idx) => {
      if (item.nat) {
        NAT_FORMS.forEach((form) => entries.push({ itemIdx: idx, natForm: form }));
      } else {
        entries.push({ itemIdx: idx });
      }
    });
    setOrder(shuffle(entries));
  }, [deck]);

  useEffect(() => {
    if (result === null) inputRef.current?.focus();
    else nextRef.current?.focus(); // keep the type→Enter→Enter rhythm — no mouse needed
  }, [i, result]);

  if (!deck) {
    return <main className="p-6">No deck <code>{collectionId}</code>.</main>;
  }
  if (order === null) return null;

  const total = order.length;
  const done = i >= total;
  const entry = done ? null : order[i];
  const item = entry != null ? deck.items[entry.itemIdx] : null;
  const natForm = entry?.natForm;

  function getAnswer(): string {
    if (!item) return "";
    if (natForm && item.nat) return item.nat[natForm];
    const art = articleOf(deck!, item);
    return frFull(art, item.fr);
  }

  const answer = getAnswer();
  const isRight = result === "perfect" || result === "good";
  const art = (!natForm && item) ? articleOf(deck!, item) : "";

  function check() {
    if (result !== null || !item) return;
    const g = grade(value, answer);
    setResult(g);
    setScore((s) => ({ ok: s.ok + (g !== "wrong" ? 1 : 0), total: s.total + 1 }));
    recordItemResult(item.id, g !== "wrong", undefined, `complete-it:${collectionId}`);
    if (g !== "wrong") sfx.correct(); else sfx.wrong();
    if (g !== "wrong") speak(answer, "fr-FR");
  }
  function next() {
    if (i + 1 >= total) sfx.stage(); // run complete — the done card is about to show
    setResult(null);
    setValue("");
    setI((n) => n + 1);
  }

  function restart() {
    const entries: QEntry[] = [];
    practiceItems(deck!).forEach((it, idx) => {
      if (it.nat) NAT_FORMS.forEach((form) => entries.push({ itemIdx: idx, natForm: form }));
      else entries.push({ itemIdx: idx });
    });
    setOrder(shuffle(entries));
    setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });
  }

  const body = (
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">✏️ Complete It</h1>
        <p lang="fr" className="mt-1 mb-5 text-sm text-[color:var(--fluo-ink-soft)]">{deck.title}</p>

        {done ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
            <p className="text-lg font-black text-[color:var(--fluo-ink)]">Done · ✓ {score.ok}/{total}</p>
            <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm mt-3">Again</button>
          </div>
        ) : item ? (
          <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
            {natForm ? (
              <>
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">Write the nationality adjective</p>
                <p className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
                  {item.emoji && <span className="mr-1">{item.emoji}</span>}
                  <span className="text-[color:var(--cahier-ink-soft)] font-medium">{NAT_SUBJECT[natForm]} </span>
                  <span>{item.en}</span>
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
                  {art && <span className="text-[color:var(--cahier-ink-soft)] font-medium mr-1">{art}</span>}
                  <span>{bareWord(item.en)}{item.note ? <span className="ml-1 text-sm font-medium text-[color:var(--fluo-ink-soft)]">{item.note}</span> : null}</span>
                </p>
              </>
            )}

            <form onSubmit={(e) => { e.preventDefault(); result === null ? check() : next(); }} className="mt-4">
              <input
                ref={inputRef}
                lang="fr"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={result !== null}
                placeholder={`commence par « ${answer[0] ?? "?"} »…`}
                className={`cahier-answer w-full ${result === null ? "" : isRight ? "!border-emerald-500 !text-emerald-700" : "!border-rose-500 !text-rose-700"}`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              {result === null ? (
                <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
              ) : (
                <>
                  <div className={`mt-3 flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${isRight ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>
                    <span>{isRight ? (result === "good" ? "✅ Bien ! (accent différent)" : "✅ Parfait !") : "❌"}</span>
                    {result !== "perfect" && <span lang="fr" className="text-[color:var(--fluo-ink)]">→ {answer}</span>}
                    <button type="button" onClick={() => speak(answer, "fr-FR")} className="ml-auto text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                  </div>
                  {item.example && !natForm && (
                    <p lang="fr" className="mt-2 text-sm italic text-[color:var(--fluo-ink-soft)]">{item.example}</p>
                  )}
                  <button ref={nextRef} type="submit" className="fluo-btn mt-3 w-full">{i + 1 >= total ? "Finish" : "Next →"}</button>
                </>
              )}
            </form>
          </div>
        ) : null}
      </div>
  );
  if (embedded) return body;
  return (
    <CahierShell
      tabs={tabs}
      active="complete"
      topRight={!done ? <span className="fluo-mono text-sm font-bold">{i}/{total} · ✓ {score.ok}</span> : null}
    >
      {body}
    </CahierShell>
  );
}
