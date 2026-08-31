"use client";

/**
 * The Unit-0 pre-test — the questions themselves, and the SIO-010 audience picker.
 *
 * Extracted from Unit0Panel on 2026-08-31 so that the SAME questions can render
 * in two places. Dan: "what i want is for each pre-test to now have its own page
 * rather just a pop up". Units 1-4 already had pages — their pre-tests are
 * authored Pretest objects on /pretests/[id] — but Unit 0's ten banks are a
 * different shape (multi-answer picks, a highlighted phrase, SIO-010's three
 * audiences) and lived only inside the popup body. All ten of them: not one
 * Unit-0 stop resolves through getPretestForSio.
 *
 * So the questions move here and the page mounts them, exactly as the popup
 * does. Copying them into a route was the other option and is the mistake this
 * repo keeps paying for — the top bar, the ☰ dropdown and the desk rail all
 * drifted as duplicates. One definition, two mounts.
 *
 * WHAT DOES NOT CHANGE, because it is the pedagogy rather than the layout:
 *   · the pre-test is a COLD guess — no model, no lesson, before the attempt;
 *   · a miss is remembered and never scored (Dan, 2026-08-27: "remember it,
 *     but don't score it") — recordPretestAnswer, never recordItemResult;
 *   · SIO-010 asks the audience first, because "how do you ask their name" has
 *     no answer until you know whether you face a student, a client or a group.
 */
import { useEffect, useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import type { Sio } from "@/content/sios";
import {
  MULTI_SEP,
  SIO010_SITUATIONS,
  UNIT0_QUESTIONS,
  unit0QuestionId,
  type Unit0Question,
} from "@/content/sios/unit0-questions";
import { recordPretestAnswer } from "@/lib/pretestRecord";
import { recordPretestEvidence } from "@/lib/pretests/runner";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { shuffle } from "@/lib/shuffle";

/** Whether this stop has Unit-0 questions at all. */
export function hasUnit0Bank(sioId: string): boolean {
  return (UNIT0_QUESTIONS[sioId] ?? []).length > 0;
}

export function Unit0Questions({
  sio,
  bank,
  ordered = false,
}: {
  sio: Sio;
  bank?: Unit0Question[];
  /** Keep the authored question order (SIO-010: the seven questions ARE the
   *  seven moves of the dialogue, in the order they are spoken). Options are
   *  still shuffled. */
  ordered?: boolean;
}) {
  // Fresh random question AND option order on every popup open (this
  // component mounts per open) — never the authored order. Activity modes
  // live on the popup's flap tabs, not in the body. Answers are held HERE
  // (not per-question) so the 1-N keys can answer the first unanswered
  // question and its options can wear the numeral chips — same behaviour
  // as the Units 1-4 pretest popup (Dan, 2026-07-16: "does not seem to be
  // the case in Unit 0").
  const [questions, setQuestions] = useState<Unit0Question[]>([]);
  const [picked, setPicked] = useState<Record<number, string>>({});
  useEffect(() => {
    const base = bank ?? UNIT0_QUESTIONS[sio.id] ?? [];
    // Shuffled AFTER mount on purpose: a pre-test page is statically exported,
    // so shuffling during render would give the server one order and the first
    // client render another, and the hydration mismatch would swap the options
    // under the learner's finger.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR determinism, see above
    setQuestions((ordered ? base : shuffle(base)).map((q) => ({ ...q, options: shuffle(q.options) })));
    setPicked({});
  }, [sio.id, bank, ordered]);

  const activeIdx = questions.findIndex((_, i) => picked[i] === undefined);

  function doPick(i: number, o: { v: string; ok: boolean }) {
    if (picked[i] !== undefined) return;
    const q = questions[i];
    setPicked((prev) => ({ ...prev, [i]: o.v }));
    if (o.ok) sfx.correct(); else sfx.wrong();
    if (o.ok) speak(ttsFor(q, o.v), "fr-FR");
    // Unit 0 graded and then forgot: these questions gate the lesson button
    // above (line ~123, "pretest first"), so a Unit-0 learner sits them BEFORE
    // the lesson exactly as Units 1-4 sit theirs — but nothing was written, so
    // their misses never reached "Bring to class" while every other unit's did.
    // Same store, same shape as the runner (lib/pretests/runner.ts).
    //
    // Not recordItemResult, by the same rule as the other two engines: a
    // pre-lesson miss is remembered, never scored — no XP, no accuracy, no
    // review queue (Dan, 2026-08-27: "remember it, but don't score it").
    // AND the response store, which is where the activity ledger is written
    // (recordResponse calls noteAttempt before its uid check). Unit 0 wrote the
    // gap record and nothing else, so its pre-tests were invisible to the
    // ledger: the popup's Pre-Test ✓ never lit on a Unit-0 stop, and under the
    // derived-done rule those ten stops could never have completed at all.
    // Units 1-4 have always done this through the runner; `xpPaid: 0` is what
    // keeps Dan's "remember it, but don't score it" true either way.
    // The activity id must END in the stop's DECK id: activityLedger resolves
    // the stop by taking the tail after the last colon and asking sioForDeck,
    // which maps deck ids — a SIO id there resolves to nothing and the ledger
    // write silently no-ops. Traced rather than assumed, because a no-op here
    // looks identical to success from the call site.
    recordPretestEvidence(sio.collectionId ?? sio.id, unit0QuestionId(q), o.ok, o.v);
    recordPretestAnswer({
      pretestId: `unit0:${sio.id}`,
      sioId: sio.id,
      itemId: unit0QuestionId(q),
      correct: o.ok,
      picked: o.v,
      answer: q.multi
        ? q.options.filter((x) => x.ok).map((x) => x.v).join(MULTI_SEP)
        : q.options.find((x) => x.ok)?.v ?? "",
      stem: (q.stem ?? q.title ?? q.emoji ?? "").replace(/\s+/g, " ").trim(),
    });
    // All answered → post-pretest content (lesson button) may appear.
    if (Object.keys(picked).length + 1 === questions.length && questions.length > 0) {
      window.dispatchEvent(new CustomEvent("fluolingo:pretest-complete", { detail: { id: sio.id } }));
    }
  }

  const scrollToActive = () => {
    window.setTimeout(() => {
      document.querySelector("[data-u0q-active]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  };
  // A number key ANSWERS — which is wrong for a multi-answer question, where a
  // tap only toggles one of several picks. Those are mouse/touch only.
  useChoiceKeys({
    count: activeIdx >= 0 && !questions[activeIdx]?.multi ? questions[activeIdx]?.options.length ?? 0 : 0,
    enabled: activeIdx >= 0 && !questions[activeIdx]?.multi,
    onPick: (k) => {
      const q = questions[activeIdx];
      if (q && q.options[k]) {
        doPick(activeIdx, q.options[k]);
        scrollToActive();
      }
    },
    onNext: scrollToActive,
  });

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} {...(i === activeIdx ? { "data-u0q-active": true } : {})}>
          <QuizQuestion q={q} picked={picked[i] ?? null} active={i === activeIdx} onPick={(o) => doPick(i, o)} />
        </div>
      ))}
    </div>
  );
}

/**
 * SIO-010's pretest — pick the audience, then sit that audience's seven lines.
 * The situation is NOT decoration: "how do you ask for their name" has no
 * answer until you know whether you're facing one student, a client or a
 * group, so a single shuffled pool of all 21 would be unanswerable. Each run
 * remounts (keyed on the situation), so switching audiences starts clean.
 */
export function Sio010Pretest({ sio }: { sio: Sio }) {
  const [key, setKey] = useState<string | null>(null);
  const sit = SIO010_SITUATIONS.find((s) => s.key === key);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SIO010_SITUATIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setKey(s.key)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
              s.key === key
                ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
                : "border-[color:var(--fluo-ink)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sit && <Unit0Questions key={sit.key} sio={sio} bank={sit.questions} ordered />}
    </div>
  );
}

/** The prompt, with the one span Dan asked to highlight worn as a marker
 *  ("around 7pm"). Stems keep their own bracket framing untouched. */
function promptNodes(q: Unit0Question) {
  const text = q.stem ?? q.title ?? "";
  const i = q.stem || !q.hl ? -1 : text.indexOf(q.hl);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="fluo-hl">{q.hl}</span>
      {text.slice(i + q.hl!.length)}
    </>
  );
}

/** The French to SPEAK on a correct pick: the question's own tts (colour
 *  mnemonics like "le feu rouge"), else the completed stem (bracketed framing
 *  stripped), else the bare option (letters say their French names). */
function ttsFor(q: Unit0Question, v: string): string {
  if (q.tts) return q.tts;
  // A multi-answer pick lands as "Salut ! · Bonjour !" — read the greetings,
  // not the separator.
  if (q.multi) return q.options.filter((o) => o.ok).map((o) => o.v).join(", ");
  if (q.stem) return q.stem.replace(/\[[^\]]*\]\s*/g, "").replace("___", v);
  return v;
}

function QuizQuestion({
  q,
  picked,
  active = false,
  onPick,
}: {
  q: Unit0Question;
  picked: string | null;
  /** The first unanswered question — the one the 1-N keys answer; only IT
   *  wears the numeral chips. */
  active?: boolean;
  onPick: (o: { v: string; ok: boolean }) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showExample, setShowExample] = useState(false);
  // Multi-answer questions collect taps here until the learner confirms; a
  // single-answer question never touches this.
  const [sel, setSel] = useState<string[]>([]);
  const answered = picked !== null;
  // WHY appears only on a WRONG pick, and explains only why THAT choice is
  // wrong (Dan, 2026-07-02) — the why lives on the wrong option itself. A
  // multi-answer pick is stored as the joined set, so every wrongly-ticked
  // option gets its say.
  const pickedVals = picked === null ? [] : picked.split(MULTI_SEP);
  const whyText =
    q.options
      .filter((o) => !o.ok && o.why && pickedVals.includes(o.v))
      .map((o) => o.why)
      .join(" ") || undefined;
  const correctVals = q.options.filter((o) => o.ok).map((o) => o.v);
  const confirmMulti = () =>
    onPick({
      // Option order, not tap order — the record must not depend on which the
      // learner happened to tick first.
      v: q.options.filter((o) => sel.includes(o.v)).map((o) => o.v).join(MULTI_SEP),
      ok: sel.length === correctVals.length && sel.every((v) => correctVals.includes(v)),
    });

  // First click = the answer (speaks the completed form when correct). Once
  // answered, every option stays playable: clicking any of them — including
  // the one already picked — speaks it (Dan, 2026-07-02: all letters
  // playable; a click reveals that letter's name).
  function tap(o: { v: string; ok: boolean }, done: boolean) {
    if (done) { speak(o.v, "fr-FR"); return; }
    if (q.multi) {
      setSel((prev) => (prev.includes(o.v) ? prev.filter((v) => v !== o.v) : [...prev, o.v]));
      return;
    }
    onPick(o);
  }

  // The "exemple" button appears once attempted (the mnemonic contains the
  // answer). Clicking reveals "le feu rouge — red traffic light" and speaks
  // the French phrase.
  const showExampleBtn = picked !== null && !!q.example;
  const pillCls = (on: boolean) =>
    `rounded-full border-2 px-2 py-0.5 text-[0.6rem] font-black tracking-wider transition ${
      on
        ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
        : "border-[color:var(--fluo-ink)] bg-white text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
    }`;

  return (
    <div className="relative rounded-xl border-2 bg-[var(--fluo-card)] p-3" style={{ borderColor: "var(--fluo-line)" }}>
      {(whyText || showExampleBtn) && (
        <div className="absolute right-2 top-2 flex gap-1.5">
          {showExampleBtn && (
            <button
              type="button"
              onClick={() => { setShowExample((v) => !v); speak(q.example!.fr, "fr-FR"); }}
              className={pillCls(showExample)}
            >
              EXEMPLE
            </button>
          )}
          {whyText && (
            <button type="button" onClick={() => setShowWhy((v) => !v)} className={pillCls(showWhy)}>
              WHY
            </button>
          )}
        </div>
      )}
      {/* Question and options share one row where they fit (Dan, 2026-07-02);
          the options travel as ONE group, so they wrap below the question as
          a unit instead of splitting across lines. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-9">
        {(q.stem || q.title || q.emoji) && (
          <span className="inline-flex items-center gap-1.5">
            {q.emoji && <span className="text-3xl leading-none" aria-hidden>{q.emoji}</span>}
            {(q.stem || q.title) && (
              <span
                className={`${q.stem ? "fluo-serif text-base" : "text-sm"} font-bold text-[color:var(--fluo-ink)]`}
                style={q.hue ? { color: q.hue, textShadow: "0 0 2px rgba(0,0,0,.45)" } : undefined}
              >
                {promptNodes(q)}
                {/* the reveal appears only once attempted — shown first it
                    leaks single-answer questions (Dan, 2026-07-02) */}
                {q.en && picked && (
                  <span className="ml-2 text-xs font-normal text-[color:var(--fluo-ink-soft)]" style={q.hue ? { textShadow: "none" } : undefined}>
                    ({q.en})
                  </span>
                )}
              </span>
            )}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-2">
          {q.options.map((o, oi) => {
            const isPicked = pickedVals.includes(o.v);
            const showResult = picked !== null;
            // Strong, solid-fill contrast (Dan: "i cannot tell what is what if
            // everything is of the same color") — correct/wrong get a bold
            // fill + white text, not a pale tint on a similar border.
            const cls = !showResult
              ? sel.includes(o.v)
                // Ticked, not yet graded — multi-answer only.
                ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
                : "border-[color:var(--fluo-ink)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
              // The verdict colours are the app's own ok/bad tokens, not the
              // two hex literals this carried out of Unit0Panel. `-ink` rather
              // than the base: white sits on #047857 / #be123c at 7.4:1 and
              // 6.4:1, where the old #178a4d was 4.4:1 — under AA for the
              // 14px option text. Same job DrillShell's tray already does.
              : o.ok
                ? "border-[color:var(--drill-ok-ink)] bg-[color:var(--drill-ok-ink)] text-white"
                : isPicked
                  ? "border-[color:var(--drill-bad-ink)] bg-[color:var(--drill-bad-ink)] text-white"
                  : "border-[color:var(--fluo-line)] bg-transparent text-[color:var(--fluo-ink-soft)] opacity-40";
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => tap(o, showResult)}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${cls}`}
              >
                {active && !q.multi && !showResult && oi < 9 && (
                  <span aria-hidden className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--fluo-ink)] text-[10px] font-black text-white">
                    {oi + 1}
                  </span>
                )}
                {o.v}
              </button>
            );
          })}
        </span>
        {q.multi && !answered && (
          <button
            type="button"
            disabled={sel.length === 0}
            onClick={confirmMulti}
            className="rounded-full border-2 border-[color:var(--fluo-ink)] bg-[var(--fluo-hl)] px-3 py-1.5 text-sm font-black text-[color:var(--fluo-ink)] transition disabled:opacity-40"
          >
            OK
          </button>
        )}
      </div>
      {showExample && q.example && (
        <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs text-[color:var(--fluo-ink)]">
          <span lang="fr" className="font-bold">{q.example.fr}</span>
          <span className="ml-1.5 text-[color:var(--fluo-ink-soft)]">— {q.example.en}</span>
        </p>
      )}
      {showWhy && whyText && (
        <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs text-[color:var(--fluo-ink)]">{whyText}</p>
      )}
    </div>
  );
}
