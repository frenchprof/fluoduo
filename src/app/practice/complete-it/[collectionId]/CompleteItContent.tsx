"use client";

/**
 * Complete It — the writing/spelling drill. Read the English, TYPE the French.
 * For article decks (countries): graded against the full "article + noun" phrase.
 * For nationality decks: each country expands into 4 sub-questions (il est / elle
 * est / ils sont / elles sont) so all adjective forms are drilled.
 *
 * Reached via its /practice/complete-it route and SioModal's "complete"
 * embed key. (Its old third door — DicedPractice's ★★ Intermédiaire level on
 * a gapless deck — died with patch 22's lesson pager.)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import SessionReceipt, { useRunXp } from "@/components/SessionReceipt";
import { loadProgress } from "@/lib/progress";
import { CURATED } from "@/content/collections";
import { bareWord, practiceItems } from "@/lib/collections/display";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { hintsFor, revealText } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { SIOS } from "@/content/sios";
import WordBank from "@/components/WordBank";
import type { Collection, Item } from "@/lib/collections/schema";
import { gradeAgainst, type Grade } from "@/lib/practice/cloze";
import { shuffle } from "@/lib/shuffle";

// The private normalize/deaccent/grade trio (a byte-clone of cloze.ts) died
// in the grading unification (2026-08-11) — THE grader lives in
// lib/practice/cloze.ts and this drill now also honours item.alt, which the
// schema had been warning was "not yet wired into other graders".


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

  const [order, setOrder] = useState<QEntry[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const runXp = useRunXp();
  // A wrong try that is NOT final: the tray says "not yet", the ladder may
  // have opened a hint, and the input stays live for another go (Track D).
  const [retry, setRetry] = useState(false);
  const sioTopic = useMemo(
    () => SIOS.find((s) => s.collectionId === collectionId)?.topic,
    [collectionId],
  );
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

  // Item selection + the help ladder's hooks come BEFORE the early returns
  // (hooks must run in the same order every render).
  const total = order?.length ?? 0;
  const done = order === null || i >= total;
  const entry = done ? null : order![i];
  const item = deck && entry != null ? deck.items[entry.itemIdx] : null;
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

  // The help ladder (Track D): rule-based rungs from the item, ONE ? control
  // in the shell bar, evidence + ReVue queue handled by the hook.
  const hints = useMemo(
    () => hintsFor("typed", {
      answer,
      alternates: natForm ? [] : (item?.alt ?? []).map((a) => frFull(art, a)),
      article: art,
      pos: item?.pos,
      gender: item?.gender,
      category: deck?.title,
      topic: sioTopic,
      example: natForm ? undefined : item?.example,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answer, item?.id, natForm],
  );
  const ladder = useHelpLadder({
    kind: "typed",
    itemKey: item ? `${item.id}:${natForm ?? ""}` : null,
    itemId: item?.id,
    surface: "complete-it",
    hints,
    reveal: revealText({ answer, alternates: natForm ? [] : (item?.alt ?? []).map((a) => frFull(art, a)) }),
    enabled: !done && !!item,
  });

  if (!deck) {
    return <main className="p-6">No deck <code>{collectionId}</code>.</main>;
  }
  if (order === null) return null;

  function check() {
    if (result !== null || retry || !item) return;
    // item.alt = alternative nouns; compose each with the article exactly
    // like the main answer, so alts grade on equal footing (nat forms have
    // no alts — the four forms ARE the answer set).
    const accepted = natForm
      ? [answer]
      : [answer, ...(item.alt ?? []).map((a) => frFull(art, a))];
    const g = gradeAgainst(value, accepted);
    const ok = g !== "wrong";
    // First try counts for the score; every try is recorded (with the
    // ladder's evidence) and steps the ladder — a wrong one may open a hint
    // or, when stuck, the answer.
    if (ladder.ladder.wrongTries === 0 && !ladder.revealed) {
      setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    }
    const r = ladder.attempt(ok, { given: value, activity: `complete-it:${collectionId}` });
    if (ok) sfx.correct(); else sfx.wrong();
    if (r.effect === "done") {
      setResult(g);
      if (ok) speak(answer, "fr-FR");
    } else {
      // "hint" / "reveal" / none: not final — another go, with what opened.
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
  /** Dismiss the "not yet" tray; after a reveal the field is cleared so the
   *  answer is TYPED, not left standing. */
  function tryAgain() {
    setRetry(false);
    if (ladder.revealed) setValue("");
    inputRef.current?.focus();
  }

  function restart() {
    const entries: QEntry[] = [];
    practiceItems(deck!).forEach((it, idx) => {
      if (it.nat) NAT_FORMS.forEach((form) => entries.push({ itemIdx: idx, natForm: form }));
      else entries.push({ itemIdx: idx });
    });
    setOrder(shuffle(entries));
    setI(0); setValue(""); setResult(null); setRetry(false); setScore({ ok: 0, total: 0 });
  }

  const prompt = item ? (
    natForm ? (
      <>
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">Write the nationality adjective</p>
        <p className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
          {item.emoji && <span className="mr-1">{item.emoji}</span>}
          <span className="text-[color:var(--cahier-ink-soft)] font-medium">{NAT_SUBJECT[natForm]} </span>
          <span>{item.en}</span>
        </p>
      </>
    ) : (
      <p className="mt-1 text-xl font-black text-[color:var(--fluo-ink)]">
        {art && <span className="text-[color:var(--cahier-ink-soft)] font-medium mr-1">{art}</span>}
        <span>{bareWord(item.en)}{item.note ? <span className="ml-1 text-sm font-medium text-[color:var(--fluo-ink-soft)]">{item.note}</span> : null}</span>
      </p>
    )
  ) : null;

  // The popup form draws the rungs itself (no shell there); the shell draws
  // them from `help.shown` on the full page.
  const rungsShown = ladder.shown.length > 0 && item ? (
    <div className="mt-3 space-y-1">
      {ladder.shown.map((r, k) => (
        <p key={k} lang="fr" className="rounded-lg bg-[color:var(--cahier-hl)]/30 px-2 py-1 text-sm text-[color:var(--cahier-ink)]">
          {r.text}
        </p>
      ))}
    </div>
  ) : null;
  const why = item?.example && !natForm ? (
    <p lang="fr">
      <span className="font-bold">{item.example}</span>
      {item.exampleEn && <span className="ml-2 opacity-70">— {item.exampleEn}</span>}
    </p>
  ) : undefined;

  // Word-bank distractors: a nationality question draws the same item's
  // other three forms (chinois/chinoise/chinoises — the exact confusions
  // being drilled); everything else draws other items' full answers.
  const bankPool =
    item && natForm && item.nat
      ? NAT_FORMS.filter((f) => f !== natForm).map((f) => item.nat![f])
      : item
        ? practiceItems(deck).filter((it) => it.id !== item.id).map((it) => frFull(articleOf(deck!, it), it.fr))
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
        placeholder={`starts with « ${answer[0] ?? "?"} »…`}
        className={`cahier-answer hidden w-full sm:block ${result === null ? "" : isRight ? "!border-[color:var(--drill-ok)] !text-[color:var(--drill-ok-ink)]" : "!border-[color:var(--drill-bad-mid)] !text-[color:var(--drill-bad-ink)]"}`}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      />
      <div className="sm:hidden">
        <WordBank answer={answer} pool={bankPool} value={value} onChange={setValue} disabled={result !== null} />
      </div>
    </>
  );

  // Inside the SioModal popup the drill keeps its inline sheet — the drill
  // popup outlived patch 22 (only the LESSON left it for the pager).
  if (embedded) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        {done ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
            <p className="text-lg font-black text-[color:var(--fluo-ink)]">Done · ✓ {score.ok}/{total}</p>
            <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm mt-3">Again</button>
          </div>
        ) : item ? (
          <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
            {prompt}
            {rungsShown}
            <form onSubmit={(e) => { e.preventDefault(); retry ? tryAgain() : result === null ? check() : next(); }} className="mt-4">
              {answerInput}
              {result === null ? (
                <>
                  {retry && (
                    <p className="mt-2 text-sm font-bold text-[color:var(--drill-bad-ink)]">✗ Not yet</p>
                  )}
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
  }

  // Full page = DrillShell (patch 20–21): the shell owns progress, the CTA
  // and the feedback tray; the body is the prompt and the input, nothing else.
  return (
    <DrillShell
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
        retry
          ? {
              kind: "wrong",
              body: ladder.revealed
                ? <><span lang="fr">→ {answer}</span><button type="button" onClick={() => speak(answer, "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button></>
                : "Not yet",
              cta: { label: ladder.revealed ? "Type it" : "Try again", onClick: tryAgain },
            }
          : result === null
          ? null
          : {
              kind: isRight ? "correct" : "wrong",
              body: (
                <>
                  {isRight ? (result === "good" ? "Bien ! (accent differs)" : "Parfait !") : null}
                  {result !== "perfect" && <span lang="fr" className="ml-1">→ {answer}</span>}
                  <button type="button" onClick={() => speak(answer, "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Hear it">🔊</button>
                </>
              ),
              why,
              cta: { label: i + 1 >= total ? "Finish" : "Continue", onClick: next },
            }
      }
    >
      {done ? (
        // The run ends with a receipt, not a score (DOPAMINE_REVIEW §8): what
        // you earned, whether the multiplier paid, and — when there were
        // misses — the door straight to correcting them.
        <SessionReceipt
          xp={runXp.xp}
          mult={runXp.mult}
          right={score.ok}
          total={total}
          streak={loadProgress().streak}
          strength={score.ok === total ? <span lang="fr">{deck.title}</span> : undefined}
          weakness={score.ok < total ? `${total - score.ok} to see again` : undefined}
          fixHref={score.ok < total ? "/reviser" : undefined}
          onAgain={restart}
          homeHref={drillExitHref(collectionId)}
        />
      ) : item ? (
        <div>
          {prompt}
          <div className="mt-5">{answerInput}</div>
        </div>
      ) : null}
    </DrillShell>
  );
}
