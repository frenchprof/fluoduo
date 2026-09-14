"use client";

/**
 * REMETTRE DANS L'ORDRE — the words of a sentence, shuffled, tapped back into
 * order.
 *
 * WHY IT IS HERE AND NOT ANYWHERE ELSE. Word order is the first thing a
 * learner loses and the last thing any activity rehearses: every drill in the
 * app asks for a WORD — a gap, a form, an article — and none of them asks
 * where the words go. A learner can know « ne », « pas » and « fait » and
 * still not produce « il ne fait pas de sport ».
 *
 * THE MECHANIC WAS ALREADY BUILT, and this file is short because of it.
 * `components/WordBank.tsx` exists so a phone user can tap an answer instead
 * of typing accents: it splits the expected answer on whitespace, shuffles
 * those tokens together with up to four distractors drawn from `pool`, and
 * emits the tapped words joined by spaces. Hand it a whole sentence and an
 * EMPTY POOL and it is a pure reorder — no distractors, nothing to change in
 * that component at all. Measured before writing a line of this.
 *
 * THE SENTENCES COME FROM THE DECK, NEVER FROM A LIST HERE. Any item whose
 * French ends in terminal punctuation and runs to four words or more. That is
 * what makes the exercise general rather than a fixture: a deck that gains a
 * sentence gains a question, and no sentence has to be authored twice.
 *
 * WHAT IS DELIBERATELY NOT DONE. The tokens keep their capital and their full
 * stop, so the first and last words are findable. At A1 that is the right
 * trade: the exercise is about where « ne », « pas », « y » and the adverbs
 * go, not about guessing which word opens the line — and a paper exercise
 * gives the same help by printing the capital.
 */
import { useEffect, useMemo, useState } from "react";

import GameFrame from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import WordBank from "@/components/WordBank";
import { drillExitHref } from "@/components/DrillShell";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { CURATED } from "@/content/collections";
import { logEvent } from "@/lib/firebase/usage";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { gradeAnswer } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { cap, offer, type SessionLength } from "@/lib/sessionLength";
import HowManyQuestions from "@/components/HowManyQuestions";
import type { ComposeBank } from "@/games/compose/banks";
import type { Collection, Item } from "@/lib/collections/schema";

/** A sentence worth scrambling: ends in . ! ? … and has enough words that the
 *  order is a real question. Three words can only go one way. */
export function scrambleable(deck: Collection | undefined): Item[] {
  if (!deck) return [];
  return (deck.items ?? []).filter((i) => {
    const fr = (i.fr ?? "").trim();
    return /[.!?…]$/.test(fr) && fr.split(/\s+/).length >= 4;
  });
}

export default function ComposeUnscramble({ bank }: { bank: ComposeBank }) {
  useActivityPlay("compose", bank.id);
  const deck = CURATED.find((c) => c.id === bank.deckId);
  const pool = useMemo(() => scrambleable(deck), [deck]);

  /* THE RUN IS SHUFFLED ONCE, AFTER MOUNT. Shuffling during render makes the
     server's HTML and the first client render disagree; every drill in this
     app seeds its queue from an effect for that reason. */
  const [queue, setQueue] = useState<Item[] | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setQueue(shuffle(pool)); }, [pool]);

  const [chosen, setChosen] = useState<SessionLength | null>(null);
  const [asked, setAsked] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setAsked(offer(pool.length) === null); }, [pool.length]);

  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<null | "right" | "wrong">(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  /* THE MISSES ARE THE POINT OF THE END CARD, not a tally: GameOver turns
     them into ReVue rows, so a sentence whose order went wrong comes back. */
  const [misses, setMisses] = useState<GameMiss[]>([]);

  const run = useMemo(() => (queue === null ? null : cap(queue, chosen)), [queue, chosen]);
  const total = run?.length ?? 0;
  const done = run !== null && i >= total;
  const item = done || !run ? null : run[i];
  const answer = (item?.fr ?? "").trim();

  const exitHref = drillExitHref(bank.deckId);

  if (!deck || pool.length === 0) return null; // the route gates on this too

  function check() {
    if (!item) return;
    /* ORDER-SENSITIVE BY CONSTRUCTION. gradeAnswer normalises accents, case
       and punctuation but compares the STRING — so the same tokens in the
       wrong order do not match, which is the entire exercise. */
    const ok = gradeAnswer(value, answer) !== "wrong";
    setVerdict(ok ? "right" : "wrong");
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) sfx.correct(); else sfx.wrong();
    // The sentence is read back either way — hearing the right order is half
    // of learning it.
    speak(answer, "fr-FR");
    recordItemResult(item.id, ok, undefined, `unscramble:${bank.deckId}`);
    if (!ok) {
      setMisses((m) => [...m, {
        itemId: item.id, deckId: bank.deckId,
        prompt: item.en ?? "", expected: answer, given: value.trim(),
      }]);
    }
  }

  function next() {
    setValue("");
    setVerdict(null);
    if (i + 1 >= total) {
      sfx.stage(); // the run is complete — the card follows
      void logEvent("game.end", { game: "unscramble", collectionId: bank.deckId, score: score.ok });
    }
    setI((n) => n + 1);
  }

  function restart() {
    setQueue(shuffle(pool));
    setI(0); setValue(""); setVerdict(null); setScore({ ok: 0, total: 0 }); setMisses([]);
    setChosen(null);
    setAsked(offer(pool.length) === null);
  }

  if (!asked) {
    return (
      <GameFrame title={`${bank.emoji} ${bank.title}`} exitHref={exitHref} progress={null} hintKey="unscramble">
        <div className="mx-auto flex h-full max-w-lg flex-col justify-center px-4">
          {/* « How many SENTENCES? » — this drill deals one whole sentence at
              a time, scrambled, and asks for it back in order. It asks no
              questions and shows no cards, so it is exactly the fourth drill
              PR 366's required `noun` was written to catch: a default of
              "questions" is how the wrong word reached WorDrill and
              MémoiRecall, each call site simply inheriting it. */}
          <HowManyQuestions
            lengths={offer(pool.length) ?? []}
            total={pool.length}
            noun="sentences"
            onPick={(n) => { setChosen(n); setAsked(true); }}
          />
        </div>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      title={`${bank.emoji} ${bank.title}`}
      exitHref={exitHref}
      progress={done ? null : { done: i, total }}
      score={score.total > 0 ? <>✓ {score.ok}/{score.total}</> : undefined}
      hintKey="unscramble"
      help={<p>Tap the words into the right order, then Vérifier. Tap a word you have placed to take it back.</p>}
      menu={[{ label: "↻ Recommencer", onClick: restart }]}
    >
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto px-4 py-4 text-[color:var(--cahier-ink)]">
        {done ? (
          <GameOver
            emoji="🧩"
            title="Fini !"
            score={<>✓ {score.ok}/{score.total}</>}
            won={score.ok >= Math.ceil(score.total / 2)}
            misses={misses}
            deckId={bank.deckId}
            activityKey="compose"
            onReplay={restart}
            exitHref={exitHref}
          />
        ) : item ? (
          <>
            {/* THE ENGLISH IS THE PROMPT, and it is the only prompt: printing
                the French would be printing the answer. */}
            <p className="text-center text-lg text-[color:var(--cahier-ink-soft)]">{item.en}</p>

            <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] p-4">
              <WordBank
                answer={answer}
                /* EMPTY — no distractor words. WordBank draws up to four from
                   this list, and a reorder must offer exactly the sentence's
                   own words or it stops being a reorder. */
                pool={[]}
                value={value}
                onChange={setValue}
                disabled={verdict !== null}
              />
            </div>

            {verdict === null ? (
              <button
                type="button"
                onClick={check}
                disabled={!value.trim()}
                className="cahier-btn cahier-btn-primary justify-center disabled:opacity-40"
              >
                Vérifier
              </button>
            ) : (
              <div
                className="rounded-2xl border-2 p-4 text-center"
                style={{ borderColor: verdict === "right" ? "var(--tier-good)" : "var(--tier-weak)" }}
              >
                <p lang="fr" className="cahier-display text-lg font-black">
                  <span aria-hidden>{verdict === "right" ? "✓" : "→"}</span> {answer}
                </p>
                <button type="button" onClick={next} className="cahier-btn cahier-btn-primary mt-3 justify-center">
                  {i + 1 >= total ? "Terminer" : "Continuer"}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </GameFrame>
  );
}
