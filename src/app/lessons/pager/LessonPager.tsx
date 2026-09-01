"use client";

/**
 * The lesson pager (patch 22) — one card at a time, full-screen, in the
 * DrillShell mold. Replaces the scrolling LessonFlow (44 tappable controls
 * before the first answer, two identical difficulty pickers, three 🎲 roll
 * buttons, a drill that never ended).
 *
 * Card order: the exercise ramp only (buildCards.tsx) — the Mémo is NOT a
 * card any more. It lives under « Les formes » in the front-matter tabs;
 * opening the run with it showed every learner the same screen twice (Dan,
 * 2026-08-31: "it is a repeat"). Wrong answers re-queue ONCE at the end. The
 * run ENDS: 🎉 + XP/accuracy/time + the missed items, and the SIO write that
 * finally makes the Home path react.
 *
 * NO ROLL (Dan, 2026-08-25: "drop the shortcuts, learning should not allow
 * that"). A d12 used to open the ramp and its face SLICED the queue —
 * `q.slice(entry)` — so a 1 walked all twelve cards and a 12 left you the
 * lone translation. That was a run-length dial dressed as a die: a high roll
 * was less work, and because the ramp runs easy → hard it was less work at
 * the hard end. Everyone now walks the whole ramp. The die as Dan means it —
 * a different variation of the same structure — is DiceConfig.newQuestion(),
 * which the ramp already calls per card.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import DrillShell, { drillExitHref, type DrillFeedback, type DrillFinish } from "@/components/DrillShell";
import LessonTabs from "@/app/lessons/pager/LessonTabs";
import OpenFeedback from "@/components/OpenFeedback";
import WordBank from "@/components/WordBank";
import { CURATED } from "@/content/collections";
import { stopForDeck } from "@/lib/stopTag";
import { lessonsForDeck } from "@/content/lessons";
import { getNativeLesson } from "@/content/lessons/native";
import { memoForDeck } from "@/content/memos";
import { buildCards, type Exercise } from "./buildCards";
import { gradeAnswer, gradeGap, type Grade } from "@/lib/practice/cloze";
import { loadProgress, markSioDone } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { hintsFor, revealText } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { optionGridClass } from "@/lib/optionGrid";
import { saveRun, loadRun, clearRun } from "@/lib/lessonRun";
import { ENTRY_LABELS, ENTRY_LEVELS, type EntryLevel } from "@/lib/lessonEntry";
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
  const sio = stopForDeck(collectionId) ?? undefined;
  const activityKey = collectionId ?? slug ?? "lesson";
  /** Identity of THIS lesson's run — a saved place never crosses lessons. */
  const runKey = `${activityKey}::${slug ?? ""}`;
  useActivityPlay("lesson-pager", activityKey);

  const [queue, setQueue] = useState<QueuedEx[] | null>(null);
  const [i, setI] = useState(0);
  // Where the learner enters the ramp. `asked` is separate from `entry`
  // because Facile is both the default AND a real choice — a single nullable
  // level could not tell "hasn't chosen" from "chose Facile".
  const [entry, setEntry] = useState<EntryLevel>(1);
  const [asked, setAsked] = useState(false);
  const [buildTick, setBuildTick] = useState(0);
  /** Axis values pinned in the dropdowns; "" = free (the generator rolls it). */
  const [pinned, setPinned] = useState<Record<string, string>>({});
  const axes = lesson?.dice.axes ?? null;
  // Answer state for the current card.
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState("");
  /** One pick per blank, for a cloze with more than one. Empty for every
   *  other card, which is what keeps the single-blank path untouched. */
  const [picks, setPicks] = useState<string[]>([]);
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
  // How long the finished run took, in state rather than a ref. It used to be
  // `endedAtRef.current - startRef.current` computed in the render body, which
  // is a render-phase ref read — react-hooks/refs, and the reason the React
  // Compiler bailed on this whole component. Once it bails, every later
  // diagnostic is measured against a component it has given up on, which is
  // how an ordinary Date.now() inside an EFFECT came to be reported as an
  // impure call "during render". The elapsed time is known exactly once, at
  // the moment the run ends, so it is computed there and stored.
  const [elapsed, setElapsed] = useState<{ mins: number; secs: number } | null>(null);

  // Shuffling (and the generators' Math.random) live here, never in render —
  // SSR hydration stays deterministic. Same rule as every drill.
  const build = () => {
    const { exercises } = buildCards({
      deck,
      lesson: lesson ?? undefined,
      activityKey,
      entry,
      pinned,
    });
    // #5: come back to where you were. Only the shuffled queue is saved, and
    // loadRun refuses any save whose rule count no longer matches — rule
    // cards are gone, so 0 also retires every pre-rename save cleanly.
    const saved = loadRun<QueuedEx>(runKey, 0);
    // A resumed run is already at a level — asking again would pose a question
    // whose answer is then thrown away, since the saved queue is what loads.
    if (saved) setAsked(true);
    setQueue(saved ? saved.queue : exercises.map((ex) => ({ ex, requeued: false })));
    setI(saved ? saved.i : 0);
    setSelected(null);
    setValue("");
    setPicks([]);
    setResult(null);
    setScore(saved ? saved.score : { ok: 0, total: 0 });
    setMisses(saved ? (saved.misses as Exercise[]) : []);
    setXpEarned(null);
    // The clocks and the XP baseline are set by the CALLER, in the effect.
    // Reading Date.now() or writing a ref inside build() is flagged impure
    // once the compiler can reach build() from a render path, and this run's
    // start time is genuinely the effect's business, not the builder's.
    return saved;
  };
  // One effect owns the build, so build() stays a plain effect-scope function
  // (the compiler flags Date.now()/refs inside anything it can reach from a
  // render path). `buildTick` is the chooser's trigger: pressing ★ when entry
  // is already 1 changes no other dependency, and would otherwise keep the
  // mount build and silently discard the axes the learner had just pinned.
  //
  // The two suppressions below are a genuine conflict between two rules, not
  // noise. `build()` shuffles, and shuffling in render breaks SSR hydration
  // (the AGENTS rule every drill follows) — so the build MUST be an effect,
  // and an effect that builds a queue must set state. react-hooks/purity then
  // reports the effect's own Date.now() as an impure call "during render",
  // which is the compiler describing a component it has partially given up on
  // rather than a real render-phase call. Fixing the render-phase ref reads
  // this component used to have took it from six diagnostics to these two;
  // these two cannot go without moving Math.random() into render, which would
  // be the worse bug.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const saved = build();
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    startRef.current = now;
    cardStartRef.current = now;
    xpAtStartRef.current = saved ? saved.xpAtStart : loadProgress().xp;
    endWroteRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, lessonSlug, buildTick]);

  // ── where are we ──────────────────────────────────────────────────────────
  const ready = queue !== null;
  const card: "ex" | "end" = ready && i >= (queue?.length ?? 0) ? "end" : "ex";
  const current = ready && card === "ex" ? queue![i] : null;
  const ex = current?.ex ?? null;

  // Denominator: the whole ramp — no longer trimmed by anything. Requeued
  // repeats never grow it.
  const denom = queue?.filter((q) => !q.requeued).length ?? 0;
  const done = Math.min(i, denom);
  const end = ready && card === "end";

  // ── commit + advance ─────────────────────────────────────────────────────
  // A segmented cloze is graded as one string — the picks joined in reading
  // order, against `answer`, which the builder joined the same way. So both
  // graders, the help ladder and the evidence trail all keep working on a
  // two-blank card without knowing it has two blanks.
  const segs = ex?.segments;
  const blanks = segs ? segs.filter((sg) => sg.kind === "blank").length : 0;
  const given = segs
    ? (picks.length === blanks && picks.every(Boolean) ? picks.join(" ") : "")
    : ex?.kind === "mcq"
      ? selected ?? ""
      : value;

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
      setPicks([]);
      setRetry(true);
    }
  };

  const next = () => {
    ladder.skip();
    const n = i + 1;
    if (n >= (queue?.length ?? 0)) sfx.stage(); // run complete — the end card is about to show
    setSelected(null);
    setValue("");
    setPicks([]);
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

  // #5: persist the place on every move. Written after render rather than
  // inside next(), so a requeue (which lands in setQueue) is already in the
  // saved queue — saving from next() would store the position without the
  // card the wrong answer just appended.
  useEffect(() => {
    if (!ready || !queue) return;
    if (end) { clearRun(); return; }
    if (i <= 0) return;   // nothing answered yet — nothing to return to
    saveRun<QueuedEx>({
      key: runKey,
      rulesLen: 0,
      queue,
      i,
      score,
      misses,
      xpAtStart: xpAtStartRef.current,
    });
  }, [ready, queue, i, score, misses, end, runKey]);

  // The SIO write — the reason the Home path finally reacts. Once per run.
  const accuracy = score.total ? score.ok / score.total : 0;
  useEffect(() => {
    if (!end || endWroteRef.current) return;
    endWroteRef.current = true;
    const ms = Date.now() - startRef.current;
    setElapsed({ mins: Math.floor(ms / 60000), secs: Math.floor((ms % 60000) / 1000) });
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
  const exitHref = deck ? drillExitHref(deck.id) : "/map";
  const isLast = ready && i + 1 >= (queue?.length ?? 0);

  const cta = end
    ? null
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

  const { mins, secs } = elapsed ?? { mins: 0, secs: 0 };
  const pct = Math.round(accuracy * 100);

  // The finished run's footer (the approved flow, 2026-08-24): ONE primary
  // « Next › » once the SIO write has landed; ↻ Try again is the quiet
  // "Repeat". null while running — the base cta/feedback own the footer.
  const finish: DrillFinish | null = end ? { repeat: () => { clearRun(); setAsked(false); setElapsed(null); setBuildTick((t) => t + 1); } } : null;

  // Ask before the first card. Rendered from the SINGLE return below rather
  // than as an early `return <DrillShell>`: a conditional early return makes
  // the React Compiler bail on the whole component, after which it flags the
  // Date.now() and ref writes inside build() that it accepts today. Same
  // screen, one return path.
  const chooser = (
    <div className="flex flex-col items-center gap-5 pt-8 text-center">
          <p className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
            Choose your level
          </p>
          <div data-tour="entry" className="flex w-full max-w-sm flex-col gap-2.5">
            {ENTRY_LEVELS.map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => { setEntry(lv); setAsked(true); setBuildTick((t) => t + 1); }}
                className="cahier-btn cahier-btn-primary flex-col items-center gap-0.5 py-3"
              >
                <span className="text-base font-black tracking-wide">
                  {ENTRY_LABELS[lv].stars} {ENTRY_LABELS[lv].name}
                </span>
                <span className="text-xs font-bold opacity-80">{ENTRY_LABELS[lv].blurb}</span>
              </button>
            ))}
          </div>
          {/* Every level is the same number of cards — say so, because the
              die this replaces made a high roll mean LESS work and a learner
              who remembers that would reasonably expect ★★★ to be shorter. */}
          <p className="text-xs font-bold text-[color:var(--fluo-ink-soft)]">
            Same {denom} cards either way — harder, not shorter.
          </p>

          {/* The selectors from Dan's original site, restored alongside the
              die (2026-08-27: "both — dropdowns and dice"). Only lessons that
              declare their axes show this; the rest start straight away. */}
          {axes && axes.length > 0 && (
            <div data-tour="axes" className="mt-2 w-full max-w-sm border-t-2 border-[color:var(--cahier-rule)] pt-4">
              <p className="fluo-label mb-2 text-[color:var(--fluo-ink-soft)]">
                Practise something specific
              </p>
              <div className="flex flex-col gap-2">
                {axes.map((ax) => (
                  <label key={ax.key} className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-[color:var(--fluo-ink-soft)]">{ax.label}</span>
                    <select
                      value={pinned[ax.key] ?? ""}
                      onChange={(e) => setPinned((p) => ({ ...p, [ax.key]: e.target.value }))}
                      className="min-w-36 rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-2 py-1.5 font-bold text-[color:var(--cahier-ink)]"
                      lang="fr"
                    >
                      {/* "" is a real, useful value: leave it and the generator
                          rolls that axis, which is the pre-selector behaviour. */}
                      <option value="">au hasard</option>
                      {ax.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setPinned(
                    Object.fromEntries(
                      axes.map((ax) => [
                        ax.key,
                        ax.options[Math.floor(Math.random() * ax.options.length)].value,
                      ]),
                    ),
                  )
                }
                className="cahier-btn mt-3 w-full justify-center"
              >
                🎲 Roll the dice
              </button>
            </div>
          )}
        </div>
  );

  return (
    <DrillShell
      exitHref={exitHref}
      progress={end || !ready || !asked ? null : { done, total: denom }}
      right={<>✓ {score.ok}</>}
      cta={asked ? cta : null}
      feedback={asked ? feedback : null}
      help={asked && card === "ex" && !end ? ladder.help : null}
      activity="lesson"
      deck={collectionId}
      finish={asked ? finish : null}
    >
      {!ready ? null : !asked ? (
        // Dan's six tabs (2026-08-30), as FRONT MATTER only — see LessonTabs.
        // The moment a level is chosen `asked` flips, the tabs go, and the
        // one-card pager takes over untouched. Les formes shows the same Mémo
        // the run opens with: browsable here, walked there.
        <LessonTabs
          sio={sio}
          deck={deck}
          concept={lesson?.concept}
          memo={lesson?.memo ?? (collectionId ? memoForDeck(collectionId) : undefined)}
          exercise={chooser}
          // AN ATELIER OPENS ON FORMS (Dan, 2026-08-31: "Atelier's Memo is to
          // open on the range of sentences and vocabulary one is expected to
          // use or understand. Simple as that"). Forms is exactly that pair —
          // « Le modèle », the whole model dialogue with « Tout écouter », and
          // under it every word in the lesson.
          //
          // `sio.isProduction`, not a check on the deck id's shape: production
          // is the property that makes the model the point — the stop's task is
          // to PERFORM the exchange in class — and a seventh atelier added
          // later is covered without anyone remembering to name it here.
          //
          // It also stops a question a learner cannot yet answer. « Choose your
          // level » asks how hard they want material they have not seen; every
          // other stop has met its words through a pre-test, a deck or a rule
          // card first, and until 31 Aug an atelier met them in the popup —
          // which is exactly where they must NOT be, being that stop's pre-test
          // answer key (see SioDetail).
          open={sio?.isProduction ? "formes" : undefined}
        />
      ) : card === "ex" && ex ? (
        <ExerciseCard ex={ex} selected={selected} value={value} picks={picks} result={result} struck={struckAll}
          onSelect={(c) => result === null && !struckAll.includes(c) && setSelected(c)} onType={setValue}
          onPick={(n, c) => result === null && setPicks((p) => { const q = [...p]; q[n] = c; return q; })} />
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
        </div>
      )}
    </DrillShell>
  );
}

/* ── one exercise card ─────────────────────────────────────────────────────── */

/** Which blank a segment is, counting only blanks. `picks` is indexed by BLANK
 *  and not by segment, because the learner is choosing answers rather than
 *  filling in pieces of scenery. */
function blankIndex(segments: NonNullable<Exercise["segments"]>, at: number): number {
  let n = 0;
  for (let k = 0; k < at; k++) if (segments[k].kind === "blank") n++;
  return n;
}

function ExerciseCard({
  ex,
  selected,
  value,
  picks,
  result,
  struck = [],
  onSelect,
  onType,
  onPick,
}: {
  ex: Exercise;
  selected: string | null;
  picks: string[];
  value: string;
  result: Grade | null;
  /** MCQ options the ladder struck out (wrong picks). */
  struck?: string[];
  onSelect: (c: string) => void;
  onType: (v: string) => void;
  onPick: (n: number, choice: string) => void;
}) {
  const answered = result !== null;
  const isFrame = ex.before !== undefined;
  const shown = ex.kind === "mcq" ? selected : value;

  // A blank's own skin, shared by the one-blank frame and by each blank of a
  // segmented cloze, so the two cannot drift apart visually.
  const blankClass = (filled: boolean) =>
    `mx-1.5 inline-block min-w-[90px] rounded-md border-b-2 border-dashed px-2 align-baseline ${
      !answered
        ? "border-[color:var(--cahier-rule)] bg-white/70"
        : result !== "wrong"
          ? "border-[color:var(--drill-ok)] bg-[color:var(--drill-ok-bg)]"
          : `border-[color:var(--drill-bad)] bg-[color:var(--drill-bad-bg)]${filled ? " line-through" : ""}`
    }`;

  // On a TWO-blank card, each blank and its word boxes share a COLOUR (Dan,
  // 31 Aug: "i would use different shaded word boxes on top of numbers") —
  // the shading, not a numeral, says which boxes feed which blank. FULL tab
  // hues, not washes: a pale mix faded into the cream paper (Dan, same day:
  // "the color fading into the background would not do"). Teal and apricot
  // sit far apart on the common colourblind axes, reading order is the
  // redundant cue, and ink on either hue clears every contrast bar. Verdict
  // colours still take over once answered.
  const GROUP_HUES = ["var(--cahier-t1)", "var(--cahier-t2)", "var(--cahier-t0)"] as const;
  const groupWash = (b: number) => {
    const hue = GROUP_HUES[b % GROUP_HUES.length];
    return {
      background: hue,
      borderColor: `color-mix(in srgb, ${hue} 60%, var(--cahier-ink))`,
    };
  };

  return (
    <div className="space-y-4 pt-2">
      {ex.meta && (
        <p className="text-center text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink)]/60">{ex.meta}</p>
      )}
      {ex.big && (() => {
        // An EN->FR prompt is a REFERENCE to build from, not a target to read
        // aloud. Dan, 2026-08-31: "it should not be more salient than the
        // french, but still it should be of equal size (but italics non
        // bold)." So: same 2xl as the French, italic, regular weight, and one
        // step down in ink. `bigLang` also stops English going out tagged
        // lang="fr", which made the 🔊 button read it with French phonics.
        const english = ex.bigLang === "en" || ex.kind === "translate" || ex.kind === "build";
        return (
          <p
            className={`text-center text-2xl leading-snug ${
              english
                ? "font-normal italic text-[color:var(--cahier-ink)]/75"
                : "font-bold text-[color:var(--cahier-ink)]"
            }`}
            lang={english ? "en" : "fr"}
          >
            {ex.big}
          </p>
        );
      })()}
      {ex.segments && (
        <>
          <p className="text-center text-2xl font-bold leading-snug text-[color:var(--cahier-ink)]" lang="fr">
            {ex.segments.map((sg, n) =>
              sg.kind === "text" ? (
                <span key={n}>{sg.text}</span>
              ) : (
                /* Each blank wears its group's WASH, matching its word boxes
                   below — the shading says which boxes feed which blank. */
                <span
                  key={n}
                  className={blankClass(!!picks[blankIndex(ex.segments!, n)])}
                  style={!answered ? groupWash(blankIndex(ex.segments!, n)) : undefined}
                >
                  {picks[blankIndex(ex.segments!, n)] || <span className="opacity-40">?</span>}
                </span>
              ),
            )}
          </p>
          {/* The English reference. With two pieces withdrawn the French no
              longer determines the answer — « Il … … athlétisme » admits
              aime / adore / déteste — so the sentence's meaning has to come
              from somewhere the blanks cannot erase. */}
          {ex.en && (
            // Same reference styling as the single-blank card: equal size,
            // italic, unbolded (Dan, 31 Aug).
            <p lang="en" className="text-center text-2xl font-normal italic leading-snug text-[color:var(--cahier-ink)]/75">{ex.en}</p>
          )}
          {/* One row of choices per blank, in reading order. TWO ROWS IS THE
              POINT of Difficile: the verb decision and the article decision
              are made separately, and the learner can see that they are
              separate. */}
          <div className="space-y-2.5">
            {ex.segments.map((sg, n) => {
              if (sg.kind !== "blank") return null;
              const b = blankIndex(ex.segments!, n);
              return (
                <div key={n} className={optionGridClass(sg.choices, "gap-2")}>
                  {sg.choices.map((c) => {
                    const isPicked = picks[b] === c;
                    const isAnswer = c === sg.answer;
                    const cls = !answered
                      ? isPicked
                        ? "answer-picked"
                        : "hover:brightness-95"
                      : isAnswer
                        ? "border-[color:var(--drill-ok)] bg-[color:var(--drill-ok-bg)]"
                        : isPicked
                          ? "border-[color:var(--drill-bad)] bg-[color:var(--drill-bad-bg)] line-through"
                          : "border-[color:var(--cahier-rule)] bg-white opacity-50";
                    return (
                      <button
                        key={c}
                        type="button"
                        lang="fr"
                        disabled={answered}
                        onClick={() => onPick(b, c)}
                        style={!answered && !isPicked ? groupWash(b) : undefined}
                        className={`rounded-lg border-2 px-3 py-2 text-lg font-semibold text-[color:var(--cahier-ink)] transition ${cls}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
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
      {/* The segmented card renders its own reference line above the rows. */}
      {ex.en && !ex.big && !ex.segments && (
        // Equal size to the French frame above it, italic and unbolded so it
        // reads as the reference rather than competing with the target (Dan,
        // 31 Aug: "of equal size (but italics non bold)").
        <p lang="en" className="text-center text-2xl font-normal italic leading-snug text-[color:var(--cahier-ink)]/75">
          {ex.en}
        </p>
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
                ? "answer-picked"
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

      {/* A segmented cloze already IS the input — one row of choices per blank.
          Showing the typed field and the word bank underneath it as well gave
          the learner two ways to answer the same card and spelled the answer
          out in the bank's pills ("les", "films."). Seen on the card, in a
          browser; it is invisible from the code, because both halves are
          individually correct. */}
      {ex.kind !== "mcq" && !ex.segments && (
        <div className="mx-auto max-w-md space-y-2">
          {/* Build cards use word tiles at EVERY width; typed cards keep the
              input on sm+ and switch to tiles below (the word-bank rule) —
              EXCEPT a `typed` card (Difficile's withdrawn scaffold), which is
              the input at every width: on a phone the bank's three tiles are
              visually an MCQ, which is the level's whole point removed. */}
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
              className={`w-full rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-center text-lg font-bold text-[color:var(--cahier-ink)] focus:border-[color:var(--cahier-ink)] focus:outline-none ${ex.typed ? "block" : "hidden sm:block"}`}
            />
          )}
          {!ex.typed && (
            <div className={ex.tiles ? undefined : "sm:hidden"}>
              <WordBank answer={ex.answer} pool={ex.bankPool ?? []} value={value} onChange={onType} disabled={answered} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
