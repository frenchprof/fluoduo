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
 *   · SIO-010 settles the audience first, because "how do you ask their name"
 *     has no answer until you know whether you face a student, a client or a
 *     group. Since 31 Aug that is a TAB rather than a one-shot picker, and all
 *     three are sat — see Sio010Pretest.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import type { Sio } from "@/content/sios";
import {
  MULTI_SEP,
  SIO010_SITUATIONS,
  YOU_LEA,
  YOU_MARC,
  sio010SituationsFor,
  UNIT0_QUESTIONS,
  unit0QuestionId,
  type Unit0Option,
  type Unit0Question,
  type YouRole,
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
  keys = true,
  onAnswered,
}: {
  sio: Sio;
  bank?: Unit0Question[];
  /** Keep the authored question order (SIO-010: the seven questions ARE the
   *  seven moves of the dialogue, in the order they are spoken). Options are
   *  still shuffled. */
  ordered?: boolean;
  /**
   * Whether the 1-N number keys answer here. SIO-010 mounts all three
   * situations at once and hides two of them, so without this every keypress
   * would be heard three times and answer a question the learner cannot see.
   */
  keys?: boolean;
  /** How many are answered so far — SIO-010's tabs wear a tick when a
   *  situation is finished, which is the only way to see which of the three
   *  are done while two of them are hidden. */
  onAnswered?: (n: number) => void;
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
  // Scoped, not `document.querySelector`: SIO-010 keeps three of these mounted
  // at once, so a global lookup for the active question would find the FIRST
  // situation's while the learner is answering the third's, and scroll the page
  // away from what they just tapped.
  const box = useRef<HTMLDivElement>(null);
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
    const answered = Object.keys(picked).length + 1;
    onAnswered?.(answered);
    // All answered → post-pretest content (lesson button) may appear.
    if (answered === questions.length && questions.length > 0) {
      window.dispatchEvent(new CustomEvent("fluolingo:pretest-complete", { detail: { id: sio.id } }));
    }
  }

  const scrollToActive = () => {
    window.setTimeout(() => {
      box.current?.querySelector("[data-u0q-active]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  };
  // A number key ANSWERS — which is wrong for a multi-answer question, where a
  // tap only toggles one of several picks. Those are mouse/touch only.
  useChoiceKeys({
    count: keys && activeIdx >= 0 && !questions[activeIdx]?.multi ? questions[activeIdx]?.options.length ?? 0 : 0,
    enabled: keys && activeIdx >= 0 && !questions[activeIdx]?.multi,
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
    <div ref={box} className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} {...(i === activeIdx ? { "data-u0q-active": true } : {})}>
          <QuizQuestion q={q} picked={picked[i] ?? null} active={i === activeIdx} onPick={(o) => doPick(i, o)} />
        </div>
      ))}
    </div>
  );
}

/**
 * SIO-010's pretest — three audiences, three tabs, all three sat.
 *
 * Dan, 2026-08-31: *"B - but as a choice (3 side by side tabs to tap on to
 * display the different relevant content)"* — B being "run all three" against
 * A, "leave it at one".
 *
 * WHAT THIS FIXES. The picker before it scoped a run: tap 🎓 A student, answer
 * seven, done. A learner met `tu` and never `vous`, or the reverse — and this
 * stop exists precisely to teach the difference between them. Seven questions
 * of a twenty-one question contrast is not a third of the lesson, it is none of
 * it, because the contrast IS the lesson.
 *
 * WHY THREE RUNS RATHER THAN ONE POOL OF 21. "How do you ask their name" has no
 * answer until you know who you are facing, so the audience has to be settled
 * before the question can be. A tab settles it and keeps it settled while the
 * seven are answered — which a shuffled pool cannot do at all, and which a
 * one-shot picker did only for whichever audience the learner happened to pick.
 *
 * ALL THREE STAY MOUNTED, hidden rather than unmounted. Switching tabs must not
 * throw away answers: someone who does the student's seven, taps Client, then
 * taps back to compare should find their seven still there — comparing is the
 * point. Unmounting on switch (which the keyed remount used to do deliberately,
 * to start a fresh run) would silently wipe them. Two consequences are handled
 * rather than hoped away: the number keys are disabled everywhere but the
 * visible tab, and each run scopes its own scroll-into-view.
 */
export function Sio010Pretest({ sio }: { sio: Sio }) {
  const [key, setKey] = useState(SIO010_SITUATIONS[0].key);
  // Answered-so-far per situation. A tick on a tab is the ONLY way to see that
  // a hidden situation is finished — and a progress signal is the one kind of
  // text Dan's litmus test keeps ("progress counters are useful learner
  // feedback — keep").
  const [done, setDone] = useState<Record<string, number>>({});
  // Who YOU are. Enchanté(e) agrees with this person. Default Léa — the
  // scripted speaker. Marc is the masculine path: same seven moves, Enchanté
  // keyed. Switching remounts the run (new keys, new answers).
  const [you, setYou] = useState<YouRole>(YOU_LEA);
  const sits = useMemo(() => sio010SituationsFor(you), [you]);
  return (
    <div className="space-y-3">
      <YouAreCue you={you} onPick={(next) => { setYou(next); setDone({}); }} />
      <div role="tablist" aria-label="Situation" className="grid grid-cols-3 gap-1.5">
        {SIO010_SITUATIONS.map((s) => {
          const on = s.key === key;
          const finished = (done[s.key] ?? 0) >= s.questions.length;
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={s.label}
              onClick={() => setKey(s.key)}
              className={`rounded-xl border-2 px-2 py-2 text-center transition ${
                on
                  ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
                  : "border-[color:var(--fluo-line)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
              }`}
            >
              <span className="block text-sm font-black leading-tight">
                {s.who}
                {finished && <span className="ml-1" aria-hidden>✓</span>}
              </span>
              {/* The register, not a subtitle: tu-or-vous decides every answer
                  from Q2 on, so it stays on screen while they are answered. On
                  the unselected tabs it is dimmed rather than dropped — three
                  tabs that differ only by a noun would not say what the choice
                  is between. */}
              <span className={`block text-[0.6rem] font-bold leading-tight ${on ? "opacity-80" : "text-[color:var(--fluo-ink-soft)]"}`}>
                {s.register}
              </span>
            </button>
          );
        })}
      </div>
      {/* Hidden, not unmounted — the class as well as the attribute, so a future
          display utility on this wrapper cannot un-hide it. */}
      {SIO010_SITUATIONS.map((s) => (
        <div key={s.key} hidden={s.key !== key} className={s.key === key ? undefined : "hidden"}>
          <Unit0Questions
            key={you.gender}
            sio={sio}
            bank={sits.find((x) => x.key === s.key)?.questions ?? s.questions}
            ordered
            keys={s.key === key}
            onAnswered={(n) => setDone((prev) => ({ ...prev, [s.key]: n }))}
          />
        </div>
      ))}
    </div>
  );
}

/** EN role cue — name · pronoun + a small gram mark. Never FR-only gender. */
function YouAreCue({
  you,
  onPick,
}: {
  you: YouRole;
  onPick?: (next: YouRole) => void;
}) {
  const roles = [YOU_LEA, YOU_MARC];
  return (
    <div role="group" aria-label="You are" className="flex flex-wrap items-center gap-1.5">
      <span className="text-[0.65rem] font-black uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">
        You are
      </span>
      {roles.map((role) => {
        const on = role.gender === you.gender;
        const hue = role.gender === "f" ? "var(--gram-fem)" : "var(--gram-masc)";
        return (
          <button
            key={role.gender}
            type="button"
            aria-pressed={on}
            aria-label={`${role.name} · ${role.pronoun}`}
            onClick={() => onPick?.(role)}
            className={`inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-bold transition ${
              on
                ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
                : "border-[color:var(--fluo-line)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
            }`}
          >
            <span aria-hidden>{role.emoji}</span>
            <span>{role.name} · {role.pronoun}</span>
            <span
              aria-hidden
              className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded px-0.5 text-[9px] font-black text-white"
              style={{ background: hue }}
            >
              {role.gender}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RoleCue({ you }: { you: YouRole }) {
  const hue = you.gender === "f" ? "var(--gram-fem)" : "var(--gram-masc)";
  const full = you.gender === "f" ? "feminine" : "masculine";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--fluo-line)] bg-white px-2 py-0.5 text-xs font-bold text-[color:var(--fluo-ink)]">
      <span aria-hidden>{you.emoji}</span>
      <span>{you.name} · {you.pronoun}</span>
      <span
        className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded px-0.5 text-[9px] font-black text-white"
        style={{ background: hue }}
        aria-label={full}
      >
        {you.gender}
      </span>
    </span>
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
  onPick: (o: Unit0Option) => void;
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
    // IN ITS SENTENCE, NEVER ALONE (Dan, 2026-09-13: *"once a blank is
    // correctly filled (either via MCQ or whatever means) it must read out the
    // entire sentence - with possibility to repeat"*).
    //
    // `ttsFor(q, v)` already puts a value back into `q.stem` — it is what the
    // CORRECT answer reads. This tap had its own bare `speak(o.v)`, so the
    // answer spoke a sentence and every replay after it spoke a fragment. One
    // function for both now, so the two cannot drift: whatever is tapped is
    // heard where it belongs, and the option doubles as the repeat button.
    if (done) { speak(ttsFor(q, o.v), "fr-FR"); return; }
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
        {q.you && <RoleCue you={q.you} />}
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
                  ? o.mark
                    ? "border-[color:var(--dopa-miss-ink)] bg-[color:var(--dopa-miss)] text-[color:var(--dopa-miss-on)] line-through decoration-2"
                    : "border-[color:var(--drill-bad-ink)] bg-[color:var(--drill-bad-ink)] text-white"
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
                {showResult && o.ok && o.mark ? (
                  <span
                    className="cahier-hl px-0.5"
                    style={{ color: o.mark === "f" ? "var(--gram-fem)" : "var(--gram-masc)" }}
                  >
                    {o.v}
                  </span>
                ) : (
                  o.v
                )}
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
