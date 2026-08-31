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
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { gapSentence, gapSentenceEn, isPlayableGap } from "@/lib/collections/gapSentence";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { SIOS } from "@/content/sios";
import WordBank from "@/components/WordBank";

import { shuffle } from "@/lib/shuffle";
import { cap, offer, type SessionLength } from "@/lib/sessionLength";
import HowManyQuestions from "@/components/HowManyQuestions";

export default function GramMarathonContent({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  useActivityPlay("grammarathon", collectionId);
  const deck = CURATED.find((c) => c.id === collectionId);

  // The FULL shuffled queue, and the length the learner picked off it (Dan,
  // 2026-08-25). `order` stays whole so a replay can re-cut it; `chosen` is
  // null until answered, and `offer()` returns null on a short deck, which is
  // what lets those decks skip the question. Same shape as CompleteIt.
  const [order, setOrder] = useState<number[] | null>(null);
  const [chosen, setChosen] = useState<SessionLength | null>(null);
  const [asked, setAsked] = useState(false);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  // A wrong try that is NOT final (Track D): "not yet", maybe a hint, and
  // the input stays live.
  const [retry, setRetry] = useState(false);
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
    const full = shuffle(deck.items.map((it, idx) => (isPlayableGap(it) ? idx : -1)).filter((x) => x >= 0));
    // The shuffle must happen after mount so SSR and the first client render
    // agree (the AGENTS rule every drill follows) — so this effect has to
    // seed state; there is no render-time home for it.
    setOrder(full);
    // Short enough not to need asking → answered for the learner.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAsked(offer(full.length) === null);
  }, [deck]);

  useEffect(() => {
    if (result === null) inputRef.current?.focus();
    else nextRef.current?.focus(); // keep the type→Enter→Enter rhythm — no mouse needed
  }, [i, result]);

  // Item selection + the ladder's hooks come BEFORE the early returns.
  // The RUN is the chosen slice: `total` drives the progress denominator, the
  // done card and next(), so capping here caps all three.
  const run = useMemo(() => (order === null ? null : cap(order, chosen)), [order, chosen]);
  const total = run?.length ?? 0;
  const done = run === null || i >= total;
  const item = done || !deck ? null : deck.items[run![i]];
  const gap = item?.gap ?? "";
  const { before, after } = item ? splitGap(gapSentence(item), gap) : { before: "", after: "" };
  const isRight = result === "perfect" || result === "good";

  // The help ladder (Track D): cloze rungs from the item (lemma as the
  // nudge, first letter, skeleton), ONE ? control in the shell bar.
  const hints = useMemo(
    () => hintsFor("cloze", { answer: gap, pos: item?.lemma ? `← ${item.lemma}` : undefined, topic: sioTopic, example: item?.example }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gap, item?.id],
  );
  const ladder = useHelpLadder({
    kind: "cloze",
    itemKey: item?.id ?? null,
    itemId: item?.id,
    surface: "grammarathon",
    hints,
    reveal: gap,
    enabled: !done && !!item,
  });

  if (!deck) return <main className="p-6">No deck <code>{collectionId}</code>.</main>;
  if (order === null) return null;

  // HOW LONG? — asked once, before any French, and only on a queue long
  // enough for the answer to matter. Bare when embedded in a SIO popup; the
  // full drill frame only on its own page.
  if (!asked) {
    const body = (
      <HowManyQuestions
        lengths={offer(order.length)!}
        total={order.length}
        onPick={(n) => { setChosen(n); setAsked(true); }}
      />
    );
    return embedded ? body : (
      <DrillShell
        activity="grammarathon"
        deck={collectionId}
        exitHref={drillExitHref(collectionId)}
        progress={null}
        cta={null}
      >
        {body}
      </DrillShell>
    );
  }

  function check() {
    if (result !== null || retry || !item) return;
    const g = gradeGap(value, gap);
    const ok = g !== "wrong";
    if (ladder.ladder.wrongTries === 0 && !ladder.revealed) {
      setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    }
    const r = ladder.attempt(ok, { given: value, activity: `grammarathon:${collectionId}` });
    if (ok) sfx.correct(); else sfx.wrong();
    if (r.effect === "done") {
      setResult(g);
      if (ok) speak(gapSentence(item), "fr-FR");
    } else {
      setRetry(true);
    }
  }

  function next() {
    if (i + 1 >= total) sfx.stage(); // run complete — the done card is about to show
    setResult(null);
    setRetry(false);
    setValue("");
    setI((n) => n + 1);
  }
  function tryAgain() {
    setRetry(false);
    if (ladder.revealed) setValue("");
    inputRef.current?.focus();
  }

  function restart() {
    // A replay reshuffles and asks again — someone who did ten may want
    // twenty-five next, and re-asking costs one tap. A short deck still skips.
    const full = shuffle(deck!.items.map((it, idx) => (isPlayableGap(it) ? idx : -1)).filter((x) => x >= 0));
    setOrder(full);
    setChosen(null);
    setAsked(offer(full.length) === null);
    setI(0); setValue(""); setResult(null); setRetry(false); setScore({ ok: 0, total: 0 });
  }

  const sentence = item ? (
    <p lang="fr" className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
      {before}
      <span className={`mx-0.5 inline-block min-w-[3ch] border-b-2 px-1 text-center ${result === null ? "border-[color:var(--fluo-ink)] text-[color:var(--fluo-ink-soft)]" : isRight ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700"}`}>
        {result === null ? " " : gap}
      </span>
      {after}
    </p>
  ) : null;

  // The popup form draws the rungs itself; the shell draws them on the page.
  const rungsShown = ladder.shown.length > 0 && item ? (
    <div className="mt-3 space-y-1">
      {ladder.shown.map((r, k) => (
        <p key={k} lang="fr" className="rounded-lg bg-[color:var(--cahier-hl)]/30 px-2 py-1 text-sm text-[color:var(--cahier-ink)]">
          {r.text}
        </p>
      ))}
    </div>
  ) : null;
  const why = item?.example ? (
    <p lang="fr"><span className="font-bold">{item.example}</span>{item.exampleEn && <span className="ml-2 opacity-70">— {item.exampleEn}</span>}</p>
  ) : undefined;

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
        activity="grammarathon"
        deck={collectionId}
        exitHref={drillExitHref(collectionId)}
        progress={done ? null : { done: i, total }}
        right={<>✓ {score.ok}</>}
        cta={
          done
            ? { label: "↻ Again", onClick: restart }
            : result === null && !retry
              ? { label: "Check", onClick: check, disabled: !value.trim() }
              : null
        }
        help={done ? null : ladder.help}
        feedback={
          retry && item
            ? {
                kind: "wrong",
                body: ladder.revealed
                  ? <><span lang="fr">→ {gap}</span><button type="button" onClick={() => speak(gapSentence(item), "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button></>
                  : "Not yet",
                cta: { label: ladder.revealed ? "Type it" : "Try again", onClick: tryAgain },
              }
            : result === null || !item
            ? null
            : {
                kind: isRight ? "correct" : "wrong",
                body: (
                  <>
                    {isRight ? (result === "good" ? "Bien ! (accent differs)" : "Parfait !") : null}
                    {result !== "perfect" && <span lang="fr" className="ml-1">→ {gap}</span>}
                    <button type="button" onClick={() => speak(gapSentence(item), "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                  </>
                ),
                why,
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
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{gapSentenceEn(item)}</p>
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
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">{gapSentenceEn(item)}</p>
            {rungsShown}

            <form onSubmit={(e) => { e.preventDefault(); if (retry) tryAgain(); else if (result === null) check(); else next(); }} className="mt-4">
              {answerInput}
              {result === null ? (
                <>
                  {retry && <p className="mt-2 text-sm font-bold text-[color:var(--drill-bad-ink)]">✗ Not yet</p>}
                  <button type="submit" className="fluo-btn mt-3 w-full">{retry ? "Try again" : "Check"}</button>
                  {ladder.help?.label && (
                    <button
                      type="button"
                      onClick={ladder.climb}
                      disabled={ladder.help.disabled}
                      className="mt-2 w-full rounded-full border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-1.5 text-xs font-bold text-[color:var(--cahier-ink)] disabled:opacity-40"
                    >
                      ? {ladder.help.label}
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
