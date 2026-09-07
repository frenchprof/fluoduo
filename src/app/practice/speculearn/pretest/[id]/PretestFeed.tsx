"use client";

/**
 * ONE QUESTION PER SCREEN. Swipe up for the next.
 *
 * Dan, 2026-09-07: *"ONE QUESTION PER PAGE!"*, *"so that we scroll down when
 * one is done"*, and then, closing the ambiguity himself: *"scroll down =
 * swipe up"*.
 *
 * WHAT CHANGED FROM THE OLD RUNNER, and why each thing went:
 *
 * · THE « Next → » BUTTON IS GONE. It was the only way past an answered
 *   question, and Dan has just named the gesture that replaces it. Keeping
 *   both would teach two answers to one question — and the button is the one
 *   that cannot be discovered by feel.
 * · A step counter in state is gone with it. The row you are on is wherever
 *   the magnet settled, which the feed reports; nothing can now disagree about
 *   which question is on screen.
 * · Every question is BUILT UP FRONT rather than one at a time, because they
 *   are all in the document at once. Options are shuffled once per question at
 *   mount, so scrolling back to a question you have answered shows it exactly
 *   as you answered it — the same rule the SpecuLearn game got on 5 Sep when
 *   its ‹ back button arrived.
 *
 * WHAT DID NOT CHANGE. The judging, the gap report and the usage ledger are
 * still `lib/pretests/runner.ts` — this engine only renders a verdict. A
 * pre-test remains barred from `recordItemResult`, `queueForReview` and
 * `awardXp` (verify40 §2): it is the cold guess BEFORE the teaching, and
 * paying it into the review system would schedule a learner's revision around
 * material they have never met.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CahierShell, { type ShellTab } from "@/components/CahierShell";
import SnapFeed, { type SnapFeedHandle } from "@/components/SnapFeed";
import { TAB_ICONS } from "@/content/activities";
import { speak } from "@/games/letris/speech";
import { getPretest } from "@/content/pretests";
import { judgePretestAnswer, shuffle, ttsTextForItem } from "@/lib/pretests/runner";
import { goalNumber, stopForPretestId } from "@/lib/stopTag";
import { optionGridClass } from "@/lib/optionGrid";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import type { Pretest, PretestItem } from "@/lib/pretests/schema";

// A pre-test's tab rail deliberately does NOT link to Practice activities —
// the pre/post boundary (PRETEST_BLUEPRINT.md).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", ...TAB_ICONS.home, href: "/" },
  { key: "pretest", ...TAB_ICONS.pretest },
];

type Verdict = { picked: string; correct: boolean };
/** A question with its options fixed for the life of the run. */
type Row = { item: PretestItem; choices: string[] };

const TTS_KEY = "fluolingo.pretestTts.v1";

export default function PretestFeed({ id }: { id: string }) {
  const pretest = getPretest(id);

  if (!pretest) {
    return (
      <CahierShell tabs={PRETEST_TABS} active="pretest">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🤷</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">No pretest found</h2>
            <p className="mt-1 text-sm text-slate-600">
              No pretest with id <code className="rounded bg-slate-100 px-1.5 py-0.5">{id}</code>.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/practice/speculearn" className="fluo-btn fluo-btn-ghost">← SpecuLearn</Link>
            </div>
          </div>
        </div>
      </CahierShell>
    );
  }

  return (
    /* The band has said « SpecuLearn » since 1 Sep — the page has simply
       caught up with it. The stop comes from the pre-test's own id, which
       encodes it. `band={false}` is NOT wanted here: the band is the frozen
       header the feed scrolls behind. */
    <CahierShell
      tabs={PRETEST_TABS}
      active="pretest"
      band={{ title: "SpecuLearn", goal: goalNumber(stopForPretestId(pretest.id)) }}
    >
      <Run pretest={pretest} />
    </CahierShell>
  );
}

/* ──────────────────────────────────────────────────────────── */

function Run({ pretest }: { pretest: Pretest }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [at, setAt] = useState(0);
  const [ttsOn, setTtsOn] = useState(true);
  const [run, setRun] = useState(0); // bumped by Retry — remounts the feed
  const feed = useRef<SnapFeedHandle>(null);

  useEffect(() => {
    // Shuffled AFTER mount on purpose: a pre-test is a static page, so
    // shuffling during render would give the server one order and the first
    // client render another, and the hydration mismatch would swap the options
    // under the learner's finger.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR determinism, see above
    setRows(shuffle(pretest.items).map((item) => ({
      item,
      choices: shuffle([item.answer, ...item.distractors]),
    })));
    setVerdicts({});
  }, [pretest, run]);

  useEffect(() => {
    try {
      // localStorage does not exist on the server, so this preference cannot be
      // read during render; on mount is the only place it can be read at all.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage, see above
      if (localStorage.getItem(TTS_KEY) === "0") setTtsOn(false);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(TTS_KEY, ttsOn ? "1" : "0"); } catch {}
  }, [ttsOn]);

  const total = rows.length;
  const answered = Object.keys(verdicts).length;
  const score = useMemo(
    () => Object.values(verdicts).filter((v) => v.correct).length,
    [verdicts],
  );

  function pick(i: number, choice: string) {
    const row = rows[i];
    if (!row || verdicts[i]) return;
    // The judge + gap report + usage ledger live in the shared runner — this
    // engine only renders the verdict.
    const correct = judgePretestAnswer(pretest.id, row.item, choice);
    setVerdicts((v) => ({ ...v, [i]: { picked: choice, correct } }));
    // Hearing the CORRECT sentence is the feedback, not the lonely answer word.
    if (correct && ttsOn) speak(ttsTextForItem(row.item), "fr-FR");
  }

  const onIndex = useCallback((i: number) => setAt(i), []);

  /* THE KEYBOARD STILL ANSWERS, and it needs its own way on.
     "The way on is the swipe" is true of a finger and false of a laptop — a
     keyboard has no swipe, so ↵ scrolls the feed instead of drawing a button
     nobody with a finger should meet. The keys act on the row the MAGNET has
     settled on, which is the only definition of "the current question" now
     that there is no step counter to disagree with it.

     The speak key is gated on a bare item exactly as the button is: with no
     sentence around the blank, `ttsTextForItem` IS the answer, and reading it
     aloud before the pick hands the question away (verify63 §6). */
  const here = rows[at];
  const submitted = here ? verdicts[at] ?? null : null;
  useChoiceKeys({
    count: here?.choices.length ?? 0,
    // `enabled` covers the WHOLE handler, Enter included — gating it on
    // "not yet answered" tore the listener down the instant a question was
    // answered, so ↵ never advanced and a keyboard run stopped dead on
    // question one. Measured by driving ten questions and arriving back at
    // 1 / 10. `pick` refuses a second answer on its own.
    enabled: !!here,
    onPick: (i) => { const c = here?.choices[i]; if (c !== undefined) pick(at, c); },
    onNext: () => { if (submitted) feed.current?.scrollToRow(at + 1); },
    onSpeak: () => {
      if (!here || !ttsOn) return;
      const bare = !here.item.sentenceBefore.trim() && !here.item.sentenceAfter.trim();
      if (bare && !submitted) return;
      speak(ttsTextForItem(here.item), "fr-FR");
    },
  });

  if (!total) return null;

  return (
    <div className="speculearn-stage mx-auto max-w-3xl">
      {/* THE COUNTER COMES FIRST, RIGHT UNDER THE COLOURED STRIP (Dan, 5 Sep:
          "i think the counter should appear first, after the colore strip").
          One row, because everything below it is now a full screen: the count,
          the score, and the two controls that were a separate header before —
          a header a learner reads once and then scrolls past forever costs a
          question its screen. */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {Math.min(at + 1, total)} / {total}
          <span className="ml-2 normal-case tracking-normal">Score {score}/{total}</span>
        </p>
        <button
          type="button"
          onClick={() => setTtsOn((v) => !v)}
          title={ttsOn ? "TTS on — tap to mute" : "TTS muted — tap to enable"}
          className={`rounded-full border-2 px-2.5 py-1 text-[11px] font-bold transition ${
            ttsOn ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          {ttsOn ? "🔊" : "🔇"}
        </button>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.round((answered / total) * 100)}%`, background: "var(--fluo-primary)" }}
        />
      </div>

      <SnapFeed key={run} ref={feed} onIndex={onIndex} sectionClassName="justify-center px-0.5 py-2">
        {rows.map((row, i) => (
          <ItemCard
            key={`${run}-${i}`}
            item={row.item}
            choices={row.choices}
            submitted={verdicts[i] ?? null}
            onPick={(c) => pick(i, c)}
            onSpeak={() => ttsOn && speak(ttsTextForItem(row.item), "fr-FR")}
          />
        ))}
        <Recap
          pretest={pretest}
          score={score}
          answered={answered}
          total={total}
          onRestart={() => setRun((r) => r + 1)}
        />
      </SnapFeed>
    </div>
  );
}

function ItemCard({
  item,
  choices,
  submitted,
  onPick,
  onSpeak,
}: {
  item: PretestItem;
  choices: string[];
  submitted: Verdict | null;
  onPick: (c: string) => void;
  onSpeak: () => void;
}) {
  // A BARE item has no sentence around the blank: the whole French line IS the
  // answer, and the English above is the entire question. The atelier
  // pre-tests are all like this. Two things right for a gapfill are wrong for
  // it, and both are silent faults: the dashed "?" pill promises a sentence
  // with a hole in it when there is no sentence, and "hear the full sentence"
  // reads the correct line aloud before the learner has picked. So a bare item
  // shows neither until it has been answered.
  const bare = !item.sentenceBefore.trim() && !item.sentenceAfter.trim();
  return (
    <article className="fluo-card speculearn-card fluo-h-1" data-hue={1}>
      {(!bare || submitted) && (
        <p className="my-3 text-center text-2xl font-bold leading-snug text-slate-900">
          <span lang="fr">{item.sentenceBefore}</span>
          <span
            className="mx-1.5 inline-block min-w-[110px] rounded-md border-b-2 border-dashed px-3 py-0.5 align-baseline"
            style={{
              borderColor: submitted ? (submitted.correct ? "var(--fluo-primary)" : "var(--fluo-danger)") : "var(--fluo-secondary)",
              background: submitted ? (submitted.correct ? "var(--fluo-primary-soft)" : "#ffe1e1") : "#eaf6ff",
              color: submitted ? (submitted.correct ? "#2f6c00" : "#7a1010") : "var(--fluo-secondary)",
            }}
          >
            {submitted ? submitted.picked : "?"}
          </span>
          <span lang="fr">{item.sentenceAfter}</span>
        </p>
      )}
      {item.sentenceTrans && item.transFirst && !submitted ? (
        <p className="mx-auto mt-1 w-fit rounded-lg border-l-4 border-[color:var(--fluo-hl)] bg-[color:var(--fluo-hl)]/20 px-3 py-1.5 text-center text-base font-bold text-[color:var(--fluo-ink)]">
          🎯 {item.sentenceTrans}
        </p>
      ) : item.sentenceTrans && submitted ? (
        <p className="text-center text-sm italic text-slate-500">{item.sentenceTrans}</p>
      ) : null}

      {(!bare || submitted) && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onSpeak}
            title="Hear the FULL sentence read aloud"
            className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            🔊 Hear the full sentence
          </button>
        </div>
      )}

      <div className={`speculearn-options mt-5 ${optionGridClass(choices, "gap-2.5")}`}>
        {choices.map((c) => {
          const isPicked = submitted?.picked === c;
          const isAnswer = c === item.answer;
          let cls = "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (submitted) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked) cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={c}
              type="button"
              // Once answered, every option stays tappable purely for its sound
              // (Dan, 2026-07-04) — same pattern as the Unit-0 alphabet quiz.
              onClick={() => (submitted ? speak(c, "fr-FR") : onPick(c))}
              lang="fr"
              className={`rounded-xl border-2 px-4 py-3 text-center text-base font-bold transition ${cls}`}
            >
              {c}
              {submitted && isAnswer && <span className="ml-2" aria-hidden>✓</span>}
              {submitted && isPicked && !isAnswer && <span className="ml-2" aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {/* THE WAY ON IS THE GESTURE, so what marks it is a glyph and not a
          button (Dan: *"scroll down = swipe up"*). A « Next → » here would be a
          second answer to the question the swipe already answers, and the one
          a learner cannot find by feel. The number keys are gone with it: they
          picked an option and then advanced, and advancing is not this card's
          any more. */}
      {submitted && (
        <p className="mt-4 text-center text-xl leading-none text-[color:var(--fluo-ink-soft)]" aria-hidden>⌄</p>
      )}
    </article>
  );
}

function Recap({
  pretest,
  score,
  answered,
  total,
  onRestart,
}: {
  pretest: Pretest;
  score: number;
  answered: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  // A feed lets a learner reach the end without answering everything, which
  // the old one-at-a-time runner could not. Saying so is not decoration: a
  // « 3 / 12 » recap that reads like a score would be a lie about the run.
  const left = total - answered;
  return (
    <article className="fluo-card fluo-h-5" data-hue={5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {left > 0 ? "👀" : pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "📖"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">{score} / {total} correct</h2>
        <p className="text-slate-600">
          {left > 0
            ? `${left} still unanswered — swipe back up for them.`
            : pct === 100
              ? "Sans-faute !"
              : pct >= 75
                ? "Solid grasp — drill the missed ones once more."
                : pct >= 50
                  ? "Halfway there — check the recap, then go again."
                  : "Read the recap, then try again."}
        </p>
      </div>

      {pretest.recap && pretest.recap.length > 0 && (
        /* COLLAPSED, and it is the case the rule was written for (2026-08-31):
           the recap table is reference, the score is the argument, and on a
           screen that holds exactly one item the table would push the score
           off it. The summary carries its count, so a closed fold is not
           deletion with extra steps. */
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-black text-slate-700">
            {pretest.recap.length} forms
          </summary>
          <div className="mt-2 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Form</th>
                  <th className="px-3 py-2 text-left">Example</th>
                  <th className="px-3 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {pretest.recap.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-900" lang="fr">{r.form}</td>
                    <td className="px-3 py-2 italic text-slate-700" lang="fr">{r.example}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* TWO COLUMNS, NOT A STACK (Dan, 2026-09-05: "IT HAS BEEN MADE A RULE
          THAT WE NEVER WANT TO HAVE A SINGLE BUTTON OCCUPYING THE ENTIRE
          WIDTH"). `flex-wrap` was the old row and it is the trap: on a phone
          the two `fluo-btn-lg` controls do not fit side by side, so they wrap
          — and a wrapped row is a stack of two full-width buttons, which is
          the shape the rule forbids, arrived at by accident at the one width
          that matters. A grid cannot wrap. */}
      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-2">
        <button type="button" onClick={onRestart} className="fluo-btn">↻ Retry</button>
        <Link href="/practice/speculearn" className="fluo-btn fluo-btn-ghost text-center">← SpecuLearn</Link>
      </div>
    </article>
  );
}
