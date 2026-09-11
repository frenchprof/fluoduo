"use client";

/**
 * ONE SPECULEARN PER GOAL. ONE QUESTION PER SCREEN. ONE URL.
 *
 * Dan, 2026-09-07, over a screenshot of SIO-041 with two 💡 circled in red:
 *
 *   *"the SIO page itself is now being separated from the SpecuLearn, there
 *    should no longer be any SIO at the start of SpecuLearn. it jumps into the
 *    first question, and the SpecuLearn is to be answered question by question.
 *    There are lessons with two speculearn, which must now be merged"*
 *
 * and, when the two were put to him as different engines:
 *
 *   *"it does not matter if they are different versions, but the combined pool
 *    between them consists only of MCQ, so they CAN be and MUST NOW BE MERGED
 *    AS ONE!"*
 *
 * and on how to hold a learner's place across 63 questions:
 *
 *   *"could we work with bookmarks on the same page (one url) rather than
 *    multiple pages"*
 *
 * WHY THIS FILE AND NOT A NEW ONE. The merge was first built as a second
 * runner beside this one, and that is the exact mistake this app has made
 * three times already — verify117 carries the sentence: *"two runners is how
 * the app came to have four of them under one name"*. Everything the merge
 * needed was already here and tested: the judge and the usage ledger, the
 * keyboard's own way on, the bare-item rule that stops « Hear the full
 * sentence » reading the answer aloud, the TTS toggle, the recap. So the pool
 * widened and the runner stayed.
 *
 * WHAT THE POOL IS. `lib/speculearn/pool.ts` puts the goal's authored pre-test,
 * its unit-0 bank and its deck's generated questions into one MCQ list. This
 * file renders that list and does not know which engine wrote a question,
 * beyond the one thing that differs on screen: what sits above the options —
 * a sentence with a gap, a bare prompt, or a picture.
 *
 * THE ORDER IS THE POOL'S, NOT SHUFFLED. This runner used to shuffle its
 * questions. It cannot any more and the reason is Dan's bookmark: `#q9` has to
 * be the same question tomorrow as it was today, and a shuffle at mount makes
 * the address point somewhere new on every load. Options are still shuffled
 * once per mount, which is the part a learner could otherwise memorise.
 *
 * A PRE-TEST IS STILL A COLD GUESS. No XP, no accuracy, no review queue —
 * verify40's rule for every pre-test surface, and the merge does not soften it:
 * pooling generated questions into a pre-test makes them part of the cold
 * guess, not the other way round.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CahierShell, { type ShellTab } from "@/components/CahierShell";
import SnapFeed, { type SnapFeedHandle } from "@/components/SnapFeed";
import { TAB_ICONS } from "@/content/activities";
import { speak } from "@/games/letris/speech";
import { getPretestForSio } from "@/content/pretests";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";
import { judgePretestAnswer, judgeUnit0Answer, shuffle } from "@/lib/pretests/runner";
import { buildItems } from "@/lib/speculearn/deckWords";
import { HOME_HREF } from "@/lib/routes";
import { speculearnPool, type PoolItem } from "@/lib/speculearn/pool";
import { getSio } from "@/content/sios";
import { goalNumber } from "@/lib/stopTag";
import { optionGridClass } from "@/lib/optionGrid";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import type { Pretest } from "@/lib/pretests/schema";

// A pre-test's tab rail deliberately does NOT link to Practice activities —
// the pre/post boundary (PRETEST_BLUEPRINT.md).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", ...TAB_ICONS.home, href: HOME_HREF },
  { key: "pretest", ...TAB_ICONS.pretest },
];

type Verdict = { picked: string; correct: boolean };
/** A question with its options fixed for the life of the run. */
type Row = { item: PoolItem; choices: string[] };

const TTS_KEY = "fluolingo.pretestTts.v1";

/**
 * THE POOL IS STATIC, so it is built once per goal and never again.
 *
 * Not a `useMemo`: the questions are a fact about the goal, not about a render
 * — every input is in the bundle. Memoizing in the component made `pool` a new
 * array whenever React chose to re-run the hook, and the run's shuffle effect
 * depends on it, which would re-deal a learner's options mid-run. A module
 * cache has one identity per goal for the life of the tab.
 */
const POOLS = new Map<string, PoolItem[]>();

function poolFor(sioId: string): PoolItem[] {
  const cached = POOLS.get(sioId);
  if (cached) return cached;
  const deck = getSio(sioId)?.collectionId;
  // Only a deck on the ready list contributes generated questions; the rest
  // have no vetted visuals, which is what that list is for.
  const words =
    deck && (SPECULEARN_READY as readonly string[]).includes(deck)
      ? buildItems(deck).items.map((it) => ({ w: it.w, img: it.img, emoji: it.emoji }))
      : [];
  const built = speculearnPool(sioId, words);
  POOLS.set(sioId, built);
  return built;
}

/**
 * THE WINDOW WHOSE ADDRESS A LEARNER CAN SEE.
 *
 * This run lives in an iframe inside the cahier (Dan, 2026-09-07: *"EVERYTHING
 * … MUST NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES"*), and a frame's own src
 * is `…/embed` with no hash on it — so a bookmark written here would be
 * written on a URL nobody can see, and read back as empty. Measured: the
 * address bar said `#q9` and the run opened on question one, every time.
 *
 * Same origin, so the parent is simply readable; standalone, the parent IS
 * this window and the same code works unchanged.
 */
function addressWindow(): Window {
  try {
    if (window.parent !== window && window.parent.location.origin === window.location.origin) {
      return window.parent;
    }
  } catch {}
  return window;
}

/** Which question the address is pointing at. 1-based for a human reading it;
 *  `#q1` is the first, which is what a learner would guess. */
function rowFromHash(): number {
  if (typeof window === "undefined") return 0;
  const m = addressWindow().location.hash.match(/^#q(\d+)$/);
  const n = m ? Number(m[1]) - 1 : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function PretestFeed({ sioId }: { sioId: string }) {
  const sio = getSio(sioId);
  const pretest = getPretestForSio(sioId) ?? null;
  const pool = poolFor(sioId);

  if (pool.length === 0) {
    return (
      <CahierShell tabs={PRETEST_TABS} active="pretest">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🤷</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">Nothing to guess at yet</h2>
            <p className="mt-1 text-sm text-slate-600">
              No SpecuLearn questions for <code className="rounded bg-slate-100 px-1.5 py-0.5">{sioId}</code>.
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
       caught up with it. `band={false}` is NOT wanted here: the band is the
       frozen header the feed scrolls behind. */
    <CahierShell
      tabs={PRETEST_TABS}
      active="pretest"
      band={{ title: "SpecuLearn", goal: sio ? goalNumber(sio) : undefined }}
    >
      <Run pool={pool} pretest={pretest} sioId={sioId} deck={sio?.collectionId ?? sioId} />
    </CahierShell>
  );
}

/* ──────────────────────────────────────────────────────────── */

function Run({ pool, pretest, sioId, deck }: {
  pool: PoolItem[];
  pretest: Pretest | null;
  /** The goal this run belongs to — the key a unit-0 answer is recorded under. */
  sioId: string;
  /** …and the DECK id the evidence ledger is keyed by. `activityLedger`
   *  resolves a stop by taking the tail after the last colon and asking
   *  `sioForDeck`, so a SIO id there silently no-ops. Traced rather than
   *  assumed, because a no-op looks identical to success from the call site. */
  deck: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [at, setAt] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const [ttsOn, setTtsOn] = useState(true);
  const [run, setRun] = useState(0); // bumped by Retry — remounts the feed
  const feed = useRef<SnapFeedHandle>(null);

  useEffect(() => {
    // Options shuffled AFTER mount on purpose: this is a static page, so
    // shuffling during render would give the server one order and the first
    // client render another, and the hydration mismatch would swap the options
    // under the learner's finger. The QUESTIONS keep the pool's order — see
    // the note at the top: the bookmark is what depends on it.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR determinism, see above
    setRows(pool.map((item) => ({ item, choices: shuffle(item.options) })));
    setVerdicts({});
  }, [pool, run]);

  useEffect(() => {
    // Where the address says to open. A hash is never sent to the server, so
    // reading it during render would disagree with the prerendered HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only value, see above
    setStartAt(rowFromHash());
  }, []);

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
    // engine only renders the verdict. THREE SOURCES, THREE ANSWERS about what
    // is written: an authored item goes through the runner, a unit-0 item is
    // recorded here, a generated one is not recorded at all.
    let correct: boolean;
    if (row.item.authored && pretest) {
      correct = judgePretestAnswer(pretest.id, row.item.authored, choice);
    } else if (row.item.unit0) {
      /* A UNIT-0 QUESTION IS REMEMBERED TOO — and through the runner, like the
         authored one beside it. Dan, 2026-08-27: *"remember it, but don't score
         it"*. The write used to live in the stacked page; that page became a
         forward on 8 Sep, so from the 7 Sep merge until then a Unit-0 miss
         reached no record at all. It belongs in the runner and not here because
         an engine that writes its own ledger is exactly what the runner was
         extracted to stop (verify22). */
      correct = judgeUnit0Answer(sioId, deck, row.item.unit0, row.item.answer, choice);
    } else {
      // A GENERATED question has no ledger entry to write: it is not part of
      // the authored pre-test the teacher's dashboard reports on, and
      // inventing one would put questions in that report that no pre-test
      // contains.
      correct = choice === row.item.answer;
    }
    setVerdicts((v) => ({ ...v, [i]: { picked: choice, correct } }));
    // Hearing the CORRECT sentence is the feedback, not the lonely answer word.
    if (correct && ttsOn && row.item.speak) speak(row.item.speak, "fr-FR");
  }

  /* KEEP THE ADDRESS HONEST as the magnet settles. This is the bookmark:
     `replaceState`, never `push` — scrolling is not navigation, and 63 Back
     steps would make the Back button useless. */
  const onIndex = useCallback((i: number) => {
    setAt(i);
    if (typeof window === "undefined") return;
    const w = addressWindow();
    const want = `#q${i + 1}`;
    if (w.location.hash === want) return;
    try { w.history.replaceState(null, "", w.location.pathname + want); } catch {}
  }, []);

  /* THE KEYBOARD STILL ANSWERS, and it needs its own way on.
     "The way on is the swipe" is true of a finger and false of a laptop — a
     keyboard has no swipe, so ↵ scrolls the feed instead of drawing a button
     nobody with a finger should meet. The keys act on the row the MAGNET has
     settled on, which is the only definition of "the current question" now
     that there is no step counter to disagree with it.

     The speak key is gated on a bare item exactly as the button is: with no
     sentence around the blank, what there is to speak IS the answer, and
     reading it aloud before the pick hands the question away (verify63 §6). */
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
      if (!here || !ttsOn || !here.item.speak) return;
      const bare = isBare(here.item);
      if (bare && !submitted) return;
      speak(here.item.speak, "fr-FR");
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
        <div className="flex items-center gap-2">
        {/* A LEARNER MAY ALWAYS DECLINE THE GUESS. It is a cold guess before
            the lesson, not an exam, and Dan has held that line since the
            pre-tests were built — the stacked Unit-0 page carried a « Skip
            pretest » pill for exactly this reason. That page became a forward
            to this run on 2026-09-08, and the control had to come with it or
            the ten Unit-0 stops would have lost the only way out of a
            diagnostic they never asked for. (verify93 pins it.)

            It jumps to the recap rather than navigating: the recap is the row
            after the questions and already holds the two doors onward, so
            declining lands a learner where finishing lands them, and the
            second control here stays content-sized beside the 🔊 — two small
            pills, never a button wearing the page's width. */}
        <button
          type="button"
          onClick={() => feed.current?.scrollToRow(total)}
          title="Skip pretest — a guess before the lesson is optional"
          className="rounded-full border-2 border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500"
        >
          Skip pretest
        </button>
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
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.round((answered / total) * 100)}%`, background: "var(--fluo-primary)" }}
        />
      </div>

      {/* NOTHING PRECEDES QUESTION ONE. The feed's first row IS the first
          question — Dan circled the goal card that used to sit here. The
          recap is the one row after them, which is where a score belongs. */}
      <SnapFeed
        key={run}
        ref={feed}
        onIndex={onIndex}
        startAt={startAt}
        sectionClassName="justify-center px-0.5 py-2"
      >
        {rows.map((row, i) => (
          <ItemCard
            key={`${run}-${i}`}
            item={row.item}
            choices={row.choices}
            submitted={verdicts[i] ?? null}
            onPick={(c) => pick(i, c)}
            onSpeak={() => ttsOn && row.item.speak && speak(row.item.speak, "fr-FR")}
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

/**
 * A BARE item has no sentence around the blank: the whole French line IS the
 * answer, and whatever is above it is the entire question. The atelier
 * pre-tests are all like this, and so is every generated picture question.
 * Two things right for a gapfill are wrong for it, and both are silent faults:
 * the dashed "?" pill promises a sentence with a hole in it when there is no
 * sentence, and "hear the full sentence" reads the correct line aloud before
 * the learner has picked.
 */
function isBare(item: PoolItem): boolean {
  const before = item.sentenceBefore ?? "";
  const after = item.sentenceAfter ?? "";
  return !before.trim() && !after.trim();
}

function ItemCard({
  item,
  choices,
  submitted,
  onPick,
  onSpeak,
}: {
  item: PoolItem;
  choices: string[];
  submitted: Verdict | null;
  onPick: (c: string) => void;
  onSpeak: () => void;
}) {
  const bare = isBare(item);
  const hasSentence = item.sentenceBefore !== undefined;
  return (
    <article className="fluo-card speculearn-card fluo-h-1" data-hue={1}>
      {/* WHAT SITS ABOVE THE OPTIONS is the one place the three sources
          differ, so it is the one branch on this card. */}
      {item.img ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export: next/image needs a loader this app does not ship, and the deck photos are already sized
        <img src={item.img} alt="" className="mx-auto mb-2 block max-h-44 w-auto rounded-xl" />
      ) : item.emoji && !hasSentence ? (
        <div className="mb-1 text-center text-6xl" aria-hidden>{item.emoji}</div>
      ) : null}

      {item.prompt && (
        <p className="text-center text-sm font-bold text-slate-500">{item.prompt}</p>
      )}

      {hasSentence && (!bare || submitted) && (
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

      {/* The English is a REFERENCE and never outsizes the French (AGENTS.md,
          1 Sep) — it is sized against the French on THIS card, which is why
          the answered state drops to `text-sm` beside `text-2xl` options. */}
      {item.en && item.transFirst && !submitted ? (
        <p className="mx-auto mt-1 w-fit rounded-lg border-l-4 border-[color:var(--fluo-hl)] bg-[color:var(--fluo-hl)]/20 px-3 py-1.5 text-center text-base font-bold text-[color:var(--fluo-ink)]">
          🎯 {item.en}
        </p>
      ) : item.en && submitted ? (
        <p className="text-center text-sm italic text-slate-500">{item.en}</p>
      ) : null}

      {item.speak && (!bare || submitted) && (
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

      {/* WHY, on demand and only for the wrong choice the learner actually
          made — never inline, never explaining a correct answer (AGENTS.md
          litmus test; Dan, 2026-07-02). */}
      {submitted && !submitted.correct && item.whyWrong?.[submitted.picked] && (
        <details className="mt-3 rounded-lg border-2 border-slate-200 bg-white p-2.5">
          <summary className="cursor-pointer text-sm font-black text-slate-700">WHY</summary>
          <p className="mt-2 text-sm text-slate-700">{item.whyWrong[submitted.picked]}</p>
        </details>
      )}

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
  pretest: Pretest | null;
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

      {pretest?.recap && pretest.recap.length > 0 && (
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
