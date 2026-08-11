"use client";

/**
 * GramMarathon — the typed cloze drill over a deck's authored `gap`s. The
 * sentence is shown with the gap blanked out and the student types it — no
 * options. Gaps range from one grammar word (du / de la / d' …) to a whole
 * predicate (être-étudiant: "est étudiante"), which is how the former
 * ConjugaZone folded in here (Dan, 2026-07-05: "we don't even need to
 * separate out conjugazone and grammarathon anymore").
 *
 * This is the per-deck round, reached via its own "🏃 GramMarathon" flap
 * (deckActivityTabs, CahierShell.tsx) — shown only for decks with at least
 * one valid gap item (it.gap present and actually occurring inside it.fr).
 * Distinct from the Finale (FinaleContent.tsx, /practice/grammarathon/
 * finale), a separate hand-authored 437-item bank across all SIOs, always
 * reachable regardless of deck. (The lesson's own gap-fill over the same
 * data is the pager's gap tier since patch 22.)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { CURATED } from "@/content/collections";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { gradeGap, splitGap, type Grade } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { gapSentence, isPlayableGap } from "@/lib/collections/gapSentence";
import { buildLadder, shownRungs } from "@/lib/help/ladder";
import { SIOS } from "@/content/sios";
import WordBank from "@/components/WordBank";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GramMarathonContent({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  useActivityPlay("grammarathon", collectionId);
  const deck = CURATED.find((c) => c.id === collectionId);

  const [order, setOrder] = useState<number[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  // Help ladder (PRD §8). Per-deck GramMarathon had none at all — a learner
  // stuck here got a bare "wrong", while the same grammar point in Finale
  // offered four escalating clues. That asymmetry was backwards: Finale is the
  // summative surface; the lesson drill is where scaffolding belongs most.
  const [clue, setClue] = useState(0);
  const sioTopic = useMemo(
    () => SIOS.find((s) => s.collectionId === collectionId)?.topic,
    [collectionId],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Only the gapped items play — a line with no grammar word ("Oui, bonne
  // idée !") sits the game out.
  useEffect(() => {
    if (!deck) return;
    setOrder(shuffle(deck.items.map((it, idx) => (isPlayableGap(it) ? idx : -1)).filter((x) => x >= 0)));
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
  const { before, after } = item ? splitGap(gapSentence(item), gap) : { before: "", after: "" };
  const isRight = result === "perfect" || result === "good";

  /** Rungs for the current item. No `category` — per-deck items carry no
   *  hand-authored label, so this ladder opens at the lesson rung and runs one
   *  shorter than Finale's. Same shape, same ending: a reachable answer. */
  function ladderForItem() {
    return buildLadder({ answer: gap, topic: sioTopic });
  }

  function check() {
    if (result !== null || !item) return;
    const g = gradeGap(value, gap);
    setResult(g);
    setScore((s) => ({ ok: s.ok + (g !== "wrong" ? 1 : 0), total: s.total + 1 }));
    recordItemResult(item.id, g !== "wrong", undefined, `grammarathon:${collectionId}`, {
      hintsTaken: clue,
    });
    if (g !== "wrong") sfx.correct(); else sfx.wrong();
    if (g !== "wrong") speak(gapSentence(item), "fr-FR");
  }

  function next() {
    setClue(0);
    if (i + 1 >= total) sfx.stage(); // run complete — the done card is about to show
    setResult(null);
    setValue("");
    setI((n) => n + 1);
  }

  function restart() {
    setOrder(shuffle(deck!.items.map((it, idx) => (isPlayableGap(it) ? idx : -1)).filter((x) => x >= 0)));
    setI(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 }); setClue(0);
  }

  function takeHint() {
    if (!item) return;
    const rungs = ladderForItem();
    const n = Math.min(rungs.length, clue + 1);
    setClue(n);
    const rung = rungs[n - 1]?.level ?? "nudge";
    void import("@/lib/firebase/usage")
      .then((m) =>
        m.logEvent(rung === "answer" ? "answer.reveal" : "hint.tap", {
          surface: "grammarathon",
          itemId: item.id,
          deck: collectionId,
          rung,
          level: n,
        }),
      )
      .catch(() => {});
  }
  const hintLabel =
    clue === 0
      ? "💡 a hint"
      : clue >= ladderForItem().length - 1
        ? "✅ show the answer"
        : "💡 another hint";

  const sentence = item ? (
    <p lang="fr" className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
      {before}
      <span className={`mx-0.5 inline-block min-w-[3ch] border-b-2 px-1 text-center ${result === null ? "border-[color:var(--fluo-ink)] text-[color:var(--fluo-ink-soft)]" : isRight ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700"}`}>
        {result === null ? " " : gap}
      </span>
      {after}
    </p>
  ) : null;

  const rungsShown = clue > 0 && item ? (
    <div className="mt-3 space-y-1">
      {shownRungs(ladderForItem(), clue).map((r, k) => (
        <p key={k} lang="fr" className="rounded-lg bg-amber-50 px-2 py-1 text-sm text-amber-900">
          {r.text}
        </p>
      ))}
    </div>
  ) : null;

  // Word-bank distractors: the deck's OTHER gaps — the grammar words the
  // learner is actually choosing between (du / de la / des / d'…).
  const bankPool = item
    ? deck.items.filter((it) => isPlayableGap(it) && it.id !== item.id).map((it) => it.gap as string)
    : [];

  // Typing above sm; word-bank tiles below it (patch 20–21) — one `value`,
  // so grading/XP/evidence never know which surface produced the string.
  const answerInput = (
    <>
      <input
        ref={inputRef}
        lang="fr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={result !== null}
        placeholder="the missing word…"
        className={`cahier-answer hidden w-full sm:block ${result === null ? "" : isRight ? "!border-emerald-500 !text-emerald-700" : "!border-rose-500 !text-rose-700"}`}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      />
      <div className="sm:hidden">
        <WordBank answer={gap} pool={bankPool} value={value} onChange={setValue} disabled={result !== null} />
      </div>
    </>
  );

  if (!embedded) {
    // Full page = DrillShell (patch 20–21): the shell owns progress, Check,
    // the hint (as the 40/60 secondary) and the feedback tray.
    return (
      <DrillShell
        exitHref={drillExitHref(collectionId)}
        progress={done ? null : { done: i, total }}
        right={<>✓ {score.ok}</>}
        cta={
          done
            ? { label: "↻ Again", onClick: restart }
            : result === null
              ? { label: "Check", onClick: check, disabled: !value.trim() }
              : null
        }
        secondary={
          !done && result === null && item && clue < ladderForItem().length
            ? { label: hintLabel, onClick: takeHint }
            : null
        }
        feedback={
          result === null || !item
            ? null
            : {
                kind: isRight ? "correct" : "wrong",
                body: (
                  <>
                    {isRight ? (result === "good" ? "Bien ! (accent differs)" : "Parfait !") : null}
                    {result !== "perfect" && <span lang="fr" className="ml-1">→ {gap}</span>}
                    <button type="button" onClick={() => speak(gapSentence(item), "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                    {item.example && <span lang="fr" className="ml-2 font-medium italic opacity-80">{item.example}</span>}
                  </>
                ),
                cta: { label: i + 1 >= total ? "Finish" : "Continue", onClick: next },
              }
        }
      >
        {done ? (
          <div className="text-center">
            <p className="text-4xl" aria-hidden>🎉</p>
            <p className="mt-2 text-2xl font-black text-[color:var(--cahier-ink)]">✓ {score.ok}/{total}</p>
            <p lang="fr" className="mt-1 text-sm font-bold text-[color:var(--cahier-ink)]/60">{deck.title}</p>
          </div>
        ) : item ? (
          <div>
            {sentence}
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{item.en}</p>
            {rungsShown}
            <div className="mt-5">{answerInput}</div>
          </div>
        ) : null}
      </DrillShell>
    );
  }

  return (
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
            {sentence}
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{item.en}</p>
            {rungsShown}

            <form onSubmit={(e) => { e.preventDefault(); result === null ? check() : next(); }} className="mt-4">
              {answerInput}
              {result === null ? (
                <>
                  <button type="submit" className="fluo-btn mt-3 w-full">Check</button>
                  {clue < ladderForItem().length && (
                    <button
                      type="button"
                      onClick={takeHint}
                      className="mt-2 w-full rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                    >
                      {hintLabel}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className={`mt-3 flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${isRight ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>
                    <span>{isRight ? (result === "good" ? "✅ Bien ! (accent differs)" : "✅ Parfait !") : "❌"}</span>
                    {result !== "perfect" && <span lang="fr" className="text-[color:var(--fluo-ink)]">→ {gap}</span>}
                    <button type="button" onClick={() => speak(gapSentence(item), "fr-FR")} className="ml-auto text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
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
  );
}
