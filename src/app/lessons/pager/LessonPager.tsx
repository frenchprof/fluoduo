"use client";

/**
 * The lesson pager (patch 22) — one card at a time, full-screen, in the
 * DrillShell mold. Replaces the scrolling LessonFlow (44 tappable controls
 * before the first answer, two identical difficulty pickers, three 🎲 roll
 * buttons, a drill that never ended).
 *
 * Card order: rule cards (the Mémo, split — 3 max) → the EtuDice roll (sets
 * where you start on the ramp) → the exercise ramp (buildCards.tsx). Wrong
 * answers re-queue ONCE at the end; the progress denominator is locked when
 * the roll settles. The run ENDS: 🎉 + XP/accuracy/time + the missed items,
 * and the SIO write that finally makes the Home path react.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import DrillShell, { drillExitHref, type DrillFeedback } from "@/components/DrillShell";
import OpenFeedback from "@/components/OpenFeedback";
import SpeakZone from "@/components/SpeakZone";
import WordBank from "@/components/WordBank";
import { CURATED } from "@/content/collections";
import { SIOS } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";
import { getNativeLesson } from "@/content/lessons/native";
import { memoForDeck } from "@/content/memos";
import { buildCards, DIE_SIDES, ROLL_ENTRY, rollLabel, type Exercise } from "./buildCards";
import { gradeAnswer, gradeGap, type Grade } from "@/lib/practice/cloze";
import { loadProgress, markSioDone } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { hintsFor, revealText } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { optionGridClass } from "@/lib/optionGrid";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";

type QueuedEx = { ex: Exercise; requeued: boolean };

export default function LessonPager({
  collectionId,
  lessonSlug,
}: {
  /** The deck whose lesson this is; omitted for deckless revision lessons. */
  collectionId?: string;
  /** Which authored lesson drives the Mémo + generator; default: the deck's first. */
  lessonSlug?: string;
}) {
  const deck = collectionId ? CURATED.find((c) => c.id === collectionId) : undefined;
  const slug = lessonSlug ?? (collectionId ? lessonsForDeck(collectionId)[0]?.slug : undefined);
  const lesson = getNativeLesson(slug ?? "");
  const sio = collectionId ? SIOS.find((s) => s.collectionId === collectionId) : undefined;
  const activityKey = collectionId ?? slug ?? "lesson";
  useActivityPlay("lesson-pager", activityKey);

  const [rules, setRules] = useState<React.ReactNode[]>([]);
  const [queue, setQueue] = useState<QueuedEx[] | null>(null);
  const [i, setI] = useState(0);
  // The roll: null until the die settles; the face then names the ramp entry.
  const [face, setFace] = useState<number | null>(null);
  const [rolled, setRolled] = useState(false);
  const [rolling, setRolling] = useState(false);
  // Answer state for the current card.
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  // Track D: a wrong try that is NOT final — a hint (or the answer) opened,
  // the input stays live; MCQ strikes the wrong pick.
  const [retry, setRetry] = useState(false);
  const [struck, setStruck] = useState<string[]>([]);
  // First-attempt score only; requeued repeats never touch it.
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [misses, setMisses] = useState<Exercise[]>([]);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const startRef = useRef(0);
  const cardStartRef = useRef(0);
  const xpAtStartRef = useRef(0);
  const endWroteRef = useRef(false);
  const rollTimerRef = useRef<number | null>(null);
  const endedAtRef = useRef(0);

  // Shuffling (and the generators' Math.random) live here, never in render —
  // SSR hydration stays deterministic. Same rule as every drill.
  const build = () => {
    const { rules: r, exercises } = buildCards({
      deck,
      lesson: lesson ?? undefined,
      memo: lesson?.memo ?? (collectionId ? memoForDeck(collectionId) : undefined),
      activityKey,
    });
    setRules(r);
    setQueue(exercises.map((ex) => ({ ex, requeued: false })));
    setI(0);
    setFace(null);
    setRolled(false);
    setRolling(false);
    setSelected(null);
    setValue("");
    setResult(null);
    setScore({ ok: 0, total: 0 });
    setMisses([]);
    setXpEarned(null);
    startRef.current = Date.now();
    cardStartRef.current = Date.now();
    xpAtStartRef.current = loadProgress().xp;
    endWroteRef.current = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { build(); return () => { if (rollTimerRef.current) window.clearInterval(rollTimerRef.current); }; }, [collectionId, lessonSlug]);

  // ── where are we ──────────────────────────────────────────────────────────
  const ready = queue !== null;
  const rollAt = rules.length;
  const exStart = rules.length + 1;
  const card: "rule" | "roll" | "ex" | "end" = !ready
    ? "rule"
    : i < rules.length
      ? "rule"
      : i === rollAt
        ? "roll"
        : i - exStart < (queue?.length ?? 0)
          ? "ex"
          : "end";
  const current = card === "ex" ? queue![i - exStart] : null;
  const ex = current?.ex ?? null;

  // Denominator: rule cards + the roll + the ramp as trimmed by the roll.
  // Locked when the die settles; requeued repeats never grow it.
  const denom = rules.length + 1 + (queue?.filter((q) => !q.requeued).length ?? 0);
  const done = Math.min(i, denom);
  const end = ready && card === "end";

  // ── the roll ─────────────────────────────────────────────────────────────
  const roll = () => {
    if (rolling || rolled || !queue) return;
    setRolling(true);
    let spins = 0;
    rollTimerRef.current = window.setInterval(() => {
      const f = 1 + Math.floor(Math.random() * DIE_SIDES);
      setFace(f);
      if (++spins >= 9) {
        window.clearInterval(rollTimerRef.current!);
        rollTimerRef.current = null;
        const entry = ROLL_ENTRY[f];
        setQueue((q) => (q ? q.slice(entry) : q));
        setRolled(true);
        setRolling(false);
      }
    }, 90);
  };

  // ── commit + advance ─────────────────────────────────────────────────────
  const given = ex?.kind === "mcq" ? selected ?? "" : value;

  // The help ladder (Track D): mcq → struck picks; gap → cloze rungs;
  // build/translate → typed rungs (first letter / skeleton). Every graded
  // answer is recorded through it with the assistance actually shown.
  const ladderKind = ex?.kind === "mcq" ? "mcq" : ex?.kind === "gap" ? "cloze" : ex?.tiles ? "ordering" : "typed";
  const hints = useMemo(
    () => (ex ? hintsFor(ladderKind, { answer: ex.answer, alternates: ex.alternates, options: ex.options, example: ex.say !== ex.answer ? ex.say : undefined }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ex?.itemId, ex?.answer, ex?.kind, i],
  );
  const ladder = useHelpLadder({
    kind: ladderKind,
    itemKey: ex ? `${i}:${ex.itemId}` : null,
    itemId: ex?.itemId,
    surface: "lesson",
    hints,
    reveal: ex ? revealText({ answer: ex.answer, alternates: ex.alternates }) : "",
    enabled: card === "ex" && !!ex && !end,
  });
  const struckAll = useMemo(() => {
    const out = new Set(struck);
    for (const o of ladder.eliminated) if (o !== ex?.answer) out.add(o);
    return [...out];
  }, [struck, ladder.eliminated, ex?.answer]);

  const commit = () => {
    if (!ex || result !== null || retry || !given.trim()) return;
    let g: Grade;
    if (ex.kind === "mcq") {
      g = given === ex.answer || ex.alternates?.includes(given) ? "perfect" : "wrong";
    } else {
      const grader = ex.gapGrade ? gradeGap : gradeAnswer;
      const grades = [ex.answer, ...(ex.alternates ?? [])].map((a) => grader(given, a));
      g = grades.includes("perfect") ? "perfect" : grades.includes("good") ? "good" : "wrong";
    }
    const ok = g !== "wrong";
    const first = ladder.ladder.wrongTries === 0 && !ladder.revealed;
    if (!current!.requeued && first) {
      setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
      if (!ok) {
        setMisses((m) => [...m, ex]);
        // Wrong answers re-queue ONCE at the end of the run.
        setQueue((q) => (q ? [...q, { ex, requeued: true }] : q));
      }
    }
    const r = ladder.attempt(ok, { given, activity: ex.activity, latencyMs: Date.now() - cardStartRef.current });
    if (ok) sfx.correct(); else sfx.wrong();
    if (r.effect === "done" || (r.effect === "reveal" && ex.kind === "mcq")) {
      speak(ex.say ?? ex.answer, "fr-FR");
      setResult(g);
    } else {
      if (ex.kind === "mcq" && selected) setStruck((k) => [...k, selected]);
      setSelected(null);
      setRetry(true);
    }
  };

  const next = () => {
    ladder.skip();
    const n = i + 1;
    const total = exStart + (queue?.length ?? 0);
    if (n >= total) sfx.stage(); // run complete — the end card is about to show
    setSelected(null);
    setValue("");
    setResult(null);
    setRetry(false);
    setStruck([]);
    setI(n);
    cardStartRef.current = Date.now();
  };
  const tryAgain = () => {
    setRetry(false);
    if (ladder.revealed && ex?.kind !== "mcq") setValue("");
  };

  // The SIO write — the reason the Home path finally reacts. Once per run.
  const accuracy = score.total ? score.ok / score.total : 0;
  useEffect(() => {
    if (!end || endWroteRef.current) return;
    endWroteRef.current = true;
    endedAtRef.current = Date.now();
    if (sio) markSioDone(sio.id, accuracy);
    setXpEarned(loadProgress().xp - xpAtStartRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  // Keyboard: digits pick MCQ options; Enter is the SHELL's binding (a second
  // handler here would advance twice — same rule as every migrated drill).
  useChoiceKeys({
    count: ex?.options?.length ?? 0,
    enabled: card === "ex" && ex?.kind === "mcq" && result === null,
    onPick: (n) => { if (ex?.options?.[n] !== undefined) setSelected(ex.options[n]); },
  });

  // ── shell wiring ─────────────────────────────────────────────────────────
  const exitHref = deck ? drillExitHref(deck.id) : "/activities";
  const isLast = ready && i + 1 >= exStart + (queue?.length ?? 0);

  const cta = end
    ? null
    : card === "rule"
      ? { label: "Continue", onClick: next }
      : card === "roll"
        ? rolled
          ? { label: "Continue", onClick: next }
          : { label: "🎲 Roll", onClick: roll, disabled: rolling }
        : result === null && !retry
          ? { label: "Check", onClick: commit, disabled: !given.trim() }
          : null;

  const feedback: DrillFeedback | null =
    card === "ex" && retry && ex
      ? {
          kind: "wrong",
          body: ladder.revealed ? <b lang="fr">{ex.answer}</b> : "Not yet",
          cta: { label: ladder.revealed ? "Type it" : ex.kind === "mcq" ? "Pick again" : "Try again", onClick: tryAgain },
        }
      : card === "ex" && result !== null && ex
      ? {
          kind: result === "wrong" ? "wrong" : "correct",
          body: (
            <span className="inline-flex flex-wrap items-center gap-2">
              {result === "good" && <span className="text-xs font-bold uppercase">exact form:</span>}
              <b lang="fr">{ex.say ?? ex.answer}</b>
              <button type="button" aria-label="Listen" onClick={() => speak(ex.say ?? ex.answer, "fr-FR")}>🔊</button>
              {ex.en && <span className="text-xs italic opacity-80">{ex.en}</span>}
            </span>
          ),
          why: ex.en && ex.big ? <p><b lang="fr">{ex.say ?? ex.answer}</b><span className="ml-2 opacity-70">— {ex.en}</span></p> : undefined,
          cta: { label: isLast ? "Finish" : "Continue", onClick: next },
        }
      : null;

  const mins = Math.floor((endedAtRef.current - startRef.current) / 60000);
  const secs = Math.floor(((endedAtRef.current - startRef.current) % 60000) / 1000);
  const pct = Math.round(accuracy * 100);

  return (
    <DrillShell
      exitHref={exitHref}
      progress={end || !ready ? null : { done, total: denom }}
      right={<>✓ {score.ok}</>}
      cta={cta}
      feedback={feedback}
      help={card === "ex" && !end ? ladder.help : null}
    >
      {!ready ? null : card === "rule" ? (
        <div className="pt-2"><SpeakZone>{rules[i]}</SpeakZone></div>
      ) : card === "roll" ? (
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink)]/60">
            EtuDice — roll for your start
          </p>
          {/* A d12 has no unicode face — the die is a rotated square (the
              d12's diamond silhouette) with the face number upright inside. */}
          {face ? (
            <span
              className={`flex h-24 w-24 rotate-45 items-center justify-center rounded-2xl border-4 border-[color:var(--cahier-ink)] bg-white shadow-[4px_4px_0_var(--cahier-hl,#ffe000)] ${rolling ? "animate-bounce" : ""}`}
              aria-hidden
            >
              <span className="-rotate-45 text-5xl font-black leading-none text-[color:var(--cahier-ink)]">{face}</span>
            </span>
          ) : (
            <span className="text-8xl leading-none" aria-hidden>🎲</span>
          )}
          {rolled && face && (
            <p className="mt-2 text-sm font-bold text-[color:var(--cahier-ink)]">{rollLabel(ROLL_ENTRY[face])}</p>
          )}
        </div>
      ) : card === "ex" && ex ? (
        <ExerciseCard ex={ex} selected={selected} value={value} result={result} struck={struckAll}
          onSelect={(c) => result === null && !struckAll.includes(c) && setSelected(c)} onType={setValue} />
      ) : (
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <span className="text-6xl" aria-hidden>{pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "📖"}</span>
          <div className="flex flex-wrap justify-center gap-2 text-sm font-bold text-[color:var(--cahier-ink)]">
            {xpEarned !== null && <span className="rounded-full border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-1">⭐ +{xpEarned} XP</span>}
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-1">✓ {pct}% ({score.ok}/{score.total})</span>
            <span className="rounded-full border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-1">⏱ {mins}:{String(secs).padStart(2, "0")}</span>
          </div>
          {misses.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {misses.map((m, n) => (
                <button key={n} type="button" lang="fr" onClick={() => speak(m.say ?? m.answer, "fr-FR")}
                  className="rounded-full border-2 border-[color:var(--drill-bad-mid)] bg-white px-2.5 py-0.5 text-sm font-bold text-[color:var(--cahier-ink)]">
                  {m.answer} <span aria-hidden>🔊</span>
                </button>
              ))}
            </div>
          )}
          {/* Track D row 7 — the SIO write: one free sentence on today's
              can-do, corrected by /api/feedback (rules when offline). The
              model answer is the deck's first authored example. */}
          {sio && deck && (
            <OpenFeedback
              task="lesson-write"
              prompt={`In French: ${sio.canDo.replace(/^I can\s+/i, "")}`}
              modelAnswer={deck.items.find((it) => it.example)?.example}
              outcomeId={sio.id}
              activity={`lesson-write:${deck.id}`}
              itemId={`${sio.id}:write`}
            />
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href={exitHref} className="fluo-btn fluo-btn-lg">Continue</Link>
            <button type="button" onClick={build} className="fluo-btn fluo-btn-ghost">↻ Try again</button>
          </div>
        </div>
      )}
    </DrillShell>
  );
}

/* ── one exercise card ─────────────────────────────────────────────────────── */

function ExerciseCard({
  ex,
  selected,
  value,
  result,
  struck = [],
  onSelect,
  onType,
}: {
  ex: Exercise;
  selected: string | null;
  value: string;
  result: Grade | null;
  /** MCQ options the ladder struck out (wrong picks). */
  struck?: string[];
  onSelect: (c: string) => void;
  onType: (v: string) => void;
}) {
  const answered = result !== null;
  const isFrame = ex.before !== undefined;
  const shown = ex.kind === "mcq" ? selected : value;

  return (
    <div className="space-y-4 pt-2">
      {ex.meta && (
        <p className="text-center text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink)]/60">{ex.meta}</p>
      )}
      {ex.big && (
        <p className="text-center text-2xl font-bold leading-snug text-[color:var(--cahier-ink)]" lang={ex.kind === "translate" || ex.kind === "build" ? undefined : "fr"}>
          {ex.big}
        </p>
      )}
      {isFrame && (
        <p className="text-center text-2xl font-bold leading-snug text-[color:var(--cahier-ink)]">
          <span lang="fr">{ex.before}</span>
          <span
            className={`mx-1.5 inline-block min-w-[90px] rounded-md border-b-2 border-dashed px-2 align-baseline ${
              !answered
                ? "border-[color:var(--cahier-rule)] bg-white/70"
                : result !== "wrong"
                  ? "border-[color:var(--drill-ok)] bg-[color:var(--drill-ok-bg)]"
                  : "border-[color:var(--drill-bad)] bg-[color:var(--drill-bad-bg)] line-through"
            }`}
            lang="fr"
          >
            {shown?.trim() ? shown : "?"}
          </span>
          <span lang="fr">{ex.after}</span>
        </p>
      )}
      {ex.en && !ex.big && (
        <p className="text-center text-sm italic text-[color:var(--cahier-ink)]/70">{ex.en}</p>
      )}

      {ex.kind === "mcq" && ex.options && (
        <div className={optionGridClass(ex.options, "gap-2.5")}>
          {ex.options.map((c, n) => {
            const isPicked = (answered ? shown : selected) === c;
            const isAnswer = c === ex.answer;
            const isStruck = !answered && struck.includes(c);
            const cls = isStruck
              ? "border-[color:var(--cahier-rule)] bg-white text-[color:var(--cahier-ink)]/30 line-through"
              : !answered
              ? isPicked
                ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-ink)] text-white"
                : "border-[color:var(--cahier-rule)] bg-white text-[color:var(--cahier-ink)] hover:border-[color:var(--cahier-ink)]"
              : isAnswer
                ? "border-[color:var(--drill-ok)] bg-[color:var(--drill-ok-bg)] text-[color:var(--cahier-ink)]"
                : isPicked
                  ? "border-[color:var(--drill-bad)] bg-[color:var(--drill-bad-bg)] text-[color:var(--cahier-ink)]"
                  : "border-[color:var(--cahier-rule)] bg-white text-[color:var(--cahier-ink)]/40";
            return (
              <button
                key={`${c}-${n}`}
                type="button"
                lang="fr"
                // Answered → options stay tappable purely for their sound.
                onClick={() => (answered ? speak(c, "fr-FR") : onSelect(c))}
                disabled={isStruck}
                className={`rounded-xl border-2 px-4 py-3 text-center text-base font-bold transition ${cls}`}
              >
                {!answered && (
                  <span aria-hidden className="mr-2 text-xs font-bold opacity-50">{n + 1}</span>
                )}
                {c}
              </button>
            );
          })}
        </div>
      )}

      {ex.kind !== "mcq" && (
        <div className="mx-auto max-w-md space-y-2">
          {/* Build cards use word tiles at EVERY width; typed cards keep the
              input on sm+ and switch to tiles below (the word-bank rule). */}
          {!ex.tiles && (
            <input
              type="text"
              lang="fr"
              value={value}
              onChange={(e) => onType(e.target.value)}
              disabled={answered}
              placeholder="…"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="hidden w-full rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-center text-lg font-bold text-[color:var(--cahier-ink)] focus:border-[color:var(--cahier-ink)] focus:outline-none sm:block"
            />
          )}
          <div className={ex.tiles ? undefined : "sm:hidden"}>
            <WordBank answer={ex.answer} pool={ex.bankPool ?? []} value={value} onChange={onType} disabled={answered} />
          </div>
        </div>
      )}
    </div>
  );
}
