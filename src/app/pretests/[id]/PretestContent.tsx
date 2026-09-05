"use client";

import { useEffect, useMemo, useState } from "react";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import Link from "next/link";
import { getPretest } from "@/content/pretests";
import { speak } from "@/games/letris/speech";
import { judgePretestAnswer, shuffle, ttsTextForItem } from "@/lib/pretests/runner";
import { goalNumber, stopForPretestId } from "@/lib/stopTag";
import { BringToClass } from "@/app/SioDetail";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import type { Pretest, PretestItem } from "@/lib/pretests/schema";
import { optionGridClass } from "@/lib/optionGrid";

// The Pretest is a cold pre-lesson diagnostic — its tab rail deliberately does
// NOT link to Practice activities (pre/post boundary, see PRETEST_BLUEPRINT.md).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", label: "Home", emoji: "🏠", href: "/" },
  { key: "pretest", label: "SpecuLearn", emoji: "🧪" },
];

type Verdict = { picked: string; correct: boolean };

const TTS_KEY = "fluolingo.pretestTts.v1";

export default function PretestPage({ id }: { id: string }) {
  const pretest = getPretest(id);

  if (!pretest) {
    return (
      <CahierShell tabs={PRETEST_TABS} active="pretest">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🤷</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">
              No pretest found
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              No pretest with id <code className="rounded bg-slate-100 px-1.5 py-0.5">{id}</code>.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/" className="fluo-btn fluo-btn-ghost">← Home</Link>
            </div>
          </div>
        </div>
      </CahierShell>
    );
  }

  return (
    /* Title and STOP, both (Dan, 1 Sep). Before this the page had no family
       at all — `pretest` was missing from SITE_FAMILY while `pretests` was
       there — so it drew no spine and no band, and its name sat as a bare
       <h1> 58px lower than every other page's title. The stop comes from the
       pre-test's own id, which encodes it. */
    <CahierShell
      tabs={PRETEST_TABS}
      active="pretest"
      band={{ title: "SpecuLearn", goal: goalNumber(stopForPretestId(pretest.id)) }}
    >
      <PretestRunner pretest={pretest} />
    </CahierShell>
  );
}

/* ──────────────────────────────────────────────────────────── */

function PretestRunner({ pretest }: { pretest: Pretest }) {
  // Question order AND option order re-randomise on every activation (mount
  // and Restart) — never a fixed or per-item-seeded sequence. Shuffling lives
  // in mount/reset paths, not render, so SSR hydration stays deterministic.
  const [items, setItems] = useState<PretestItem[]>([]);
  const [step, setStep] = useState(0); // 0..total-1 = item; total = recap
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [submitted, setSubmitted] = useState<Verdict | null>(null);
  const [ttsOn, setTtsOn] = useState(true);

  useEffect(() => {
    // Shuffled AFTER mount on purpose: a pre-test is a static page, so
    // shuffling during render would give the server one order and the first
    // client render another, and the hydration mismatch would swap the options
    // under the learner's finger.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR determinism, see above
    setItems(shuffle(pretest.items));
  }, [pretest]);
  const total = items.length;

  useEffect(() => {
    try {
      const t = localStorage.getItem(TTS_KEY);
      // localStorage does not exist on the server, so this preference cannot be
      // read during render; on mount is the only place it can be read at all.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage, see above
      if (t === "0") setTtsOn(false);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(TTS_KEY, ttsOn ? "1" : "0");
    } catch {}
  }, [ttsOn]);

  const item = items[step];
  const choices = useMemo(
    () => (item ? shuffle([item.answer, ...item.distractors]) : []),
    [item],
  );

  // Auto-speak full sentence the moment the learner submits, so they hear the
  // CORRECT sentence (not the lonely answer word) as feedback arrives.
  useEffect(() => {
    if (submitted && submitted.correct && ttsOn && item) {
      speak(ttsTextForItem(item), "fr-FR");
    }
  }, [submitted, ttsOn, item]);

  const score = verdicts.filter((v) => v.correct).length;
  const done = total > 0 && step >= total;

  useChoiceKeys({
    count: choices.length,
    enabled: !!item && !done,
    onPick: (i) => { if (choices[i] !== undefined) pick(choices[i]); },
    onNext: () => { if (submitted) next(); },
    // Same leak, through the keyboard: on a BARE item (no sentence around the
    // blank — see ItemCard) the "full sentence" IS the answer, so the speak key
    // must not work until the pick is in.
    onSpeak: () => {
      if (!item || !ttsOn) return;
      const bare = !item.sentenceBefore.trim() && !item.sentenceAfter.trim();
      if (bare && !submitted) return;
      speak(ttsTextForItem(item), "fr-FR");
    },
  });

  function pick(choice: string) {
    if (submitted || !item) return;
    // The judge + gap-report + usage ledger live in the shared runner
    // (patch 22) — this engine only renders the verdict.
    const correct = judgePretestAnswer(pretest.id, item, choice);
    setSubmitted({ picked: choice, correct });
  }
  function next() {
    if (!submitted || !item) return;
    setVerdicts([...verdicts, submitted]);
    setSubmitted(null);
    setStep(step + 1);
  }
  function restart() {
    setItems(shuffle(pretest.items));
    setStep(0);
    setVerdicts([]);
    setSubmitted(null);
  }
  function skipPretest() {
    setSubmitted(null);
    setStep(Math.max(total, items.length || pretest.items.length));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {/* The title moved to the band (1 Sep); the subtitle stays, because
              the band's sub-line carries the STOP and a band may hold one
              sub-line, not two. */}
          {pretest.subtitle && (
            <p className="mt-1 text-base text-slate-600">{pretest.subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!done && (
            <button
              type="button"
              onClick={skipPretest}
              className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500"
            >
              Skip pretest
            </button>
          )}
          <button
            type="button"
            onClick={() => setTtsOn((v) => !v)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              ttsOn
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
            title={ttsOn ? "TTS on — click to mute" : "TTS muted — click to enable"}
          >
            {ttsOn ? "🔊 TTS on" : "🔇 TTS off"}
          </button>
        </div>
      </header>

      <ProgressBar current={Math.min(step, total)} total={total} score={score} />

      {!done && item && (
        <ItemCard
          item={item}
          choices={choices}
          submitted={submitted}
          onPick={pick}
          onNext={next}
          onSpeak={() => ttsOn && speak(ttsTextForItem(item), "fr-FR")}
          isLast={step === total - 1}
        />
      )}

      {done && (
        <Recap pretest={pretest} score={score} total={total} onRestart={restart} />
      )}
    </div>
  );
}

function ProgressBar({
  current,
  total,
  score,
}: {
  current: number;
  total: number;
  score: number;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          {Math.min(current + (current < total ? 1 : 0), total)} / {total}
        </span>
        <span>
          Score {score}/{total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--fluo-primary)" }}
        />
      </div>
    </div>
  );
}

function ItemCard({
  item,
  choices,
  submitted,
  onPick,
  onNext,
  onSpeak,
  isLast,
}: {
  item: PretestItem;
  choices: string[];
  submitted: Verdict | null;
  onPick: (c: string) => void;
  onNext: () => void;
  onSpeak: () => void;
  isLast: boolean;
}) {
  // Minimalist per Dan: gapped sentence, TTS, English meaning, choices — only.
  //
  // A BARE item has no sentence around the blank: the whole French line IS the
  // answer, and the English above is the entire question ("which of these four
  // lines says this?"). The atelier pre-tests are all like this.
  //
  // Two things that are right for a gapfill are wrong for a bare item, and both
  // are silent faults rather than visible ones:
  //   · The dashed "?" pill promises a sentence with a hole in it. There is no
  //     sentence. It is an empty frame around nothing.
  //   · "Hear the full sentence" speaks `ttsTextForItem`, which for a bare item
  //     is the answer and nothing else. The button reads the correct line aloud
  //     before the learner has picked — it hands over the answer.
  // So a bare item shows neither until it has been answered, at which point the
  // pill carries the verdict and hearing the line is feedback, exactly like the
  // auto-speak that already fires on a correct pick.
  const bare = !item.sentenceBefore.trim() && !item.sentenceAfter.trim();
  return (
    <article className="fluo-card fluo-h-1" data-hue={1}>
      {(!bare || submitted) && (
      <p className="my-3 text-center text-2xl font-bold leading-snug text-slate-900">
        <span lang="fr">{item.sentenceBefore}</span>
        <span
          className="mx-1.5 inline-block min-w-[110px] rounded-md border-b-2 border-dashed px-3 py-0.5 align-baseline"
          style={{
            borderColor: submitted
              ? submitted.correct
                ? "var(--fluo-primary)"
                : "var(--fluo-danger)"
              : "var(--fluo-secondary)",
            background: submitted
              ? submitted.correct
                ? "var(--fluo-primary-soft)"
                : "#ffe1e1"
              : "#eaf6ff",
            color: submitted
              ? submitted.correct
                ? "#2f6c00"
                : "#7a1010"
              : "var(--fluo-secondary)",
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
        <p className="text-center text-sm italic text-slate-500">
          {item.sentenceTrans}
        </p>
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

      <div className={`mt-5 ${optionGridClass(choices, "gap-2.5")}`}>
        {choices.map((c, i) => {
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
              {/* 1-4 answer by keyboard (useChoiceKeys) — show the keys
                  (Dan, 2026-07-16). Hidden once answered. */}
              {!submitted && <span aria-hidden className="mr-2 text-xs font-bold opacity-50">{i + 1}</span>}
              {c}
              {submitted && isAnswer && <span className="ml-2" aria-hidden>✓</span>}
              {submitted && isPicked && !isAnswer && <span className="ml-2" aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onNext} className="fluo-btn fluo-btn-lg">
            {isLast ? "🏁 See recap" : "Next →"}
          </button>
        </div>
      )}
    </article>
  );
}

function Recap({
  pretest,
  score,
  total,
  onRestart,
}: {
  pretest: Pretest;
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const sioId = stopForPretestId(pretest.id)?.id;
  return (
    <article className="fluo-card fluo-h-5" data-hue={5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "📖"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {score} / {total} correct
        </h2>
        <p className="text-slate-600">
          {pct === 100
            ? "Sans-faute !"
            : pct >= 75
              ? "Solid grasp — drill the missed ones once more."
              : pct >= 50
                ? "Halfway there — check the recap, then go again."
                : "Read the recap, then try again."}
        </p>
      </div>

      {pretest.recap && pretest.recap.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border-2 border-slate-200 bg-white">
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
      )}

      {/* Done-nudge (Dan, 2026-07-08): finishing a pretest should prompt the
          mark-as-done — and explain that ▶ Continuer only advances past
          objectives MARKED done. */}
      {/* The "mark this done?" prompt went with the button on 2026-08-31. It was
          the sharpest case for removing it: finishing the PRE-TEST offered to
          complete the stop, when a pre-test is the cold guess BEFORE the
          teaching. A stop now ticks when everything at it has been attempted —
          see lib/doneness.ts. */}

      {sioId && (
        <div className="mt-5 text-left">
          <BringToClass sioId={sioId} showEmpty />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="fluo-btn fluo-btn-lg">
          ↻ Retry pretest
        </button>
        <Link href="/" className="fluo-btn fluo-btn-ghost">
          ← Back to lessons
        </Link>
      </div>
    </article>
  );
}
