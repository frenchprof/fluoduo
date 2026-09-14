"use client";

/**
 * « UN MOT NOUVEAU — APPLIQUE LA RÈGLE. »
 *
 * One word the app has never taught, asked at the end of a run, to find out
 * whether the rule transferred. See content/transfer.ts for why this exists
 * and why the words are not in the deck.
 *
 * IT IS NOT SCORED, AND THAT IS LOAD-BEARING, not a simplification. It does
 * not touch buckets, the run's recap counters, XP, the SRS, or the review
 * queue — nothing here can reach `recordItemResult`. A learner who misses a
 * word nobody taught them has not got anything wrong, and the app must not
 * say they did. The same ruling covers SpecuLearn's pre-lesson answers
 * (verify40, "remember it, but don't score it").
 *
 * SO THE FEEDBACK IS THE RULE, NEVER A VERDICT. Right or wrong, the card
 * turns over and shows the pattern plus a word from the taught deck that
 * behaves the same way — « chinois → chinoise ». The teaching is not "you
 * were wrong"; it is "you already know this one".
 */
import { useEffect, useState, type FormEvent } from "react";

import { gradeAgainst } from "@/lib/practice/cloze";
import { transferFor, type TransferItem } from "@/content/transfer";

export default function TransferProbe({ deckId, className = "" }: {
  deckId: string;
  className?: string;
}) {
  const pool = transferFor(deckId);
  /* ONE WORD, PICKED ONCE AFTER MOUNT, AND IT MUST NOT CHANGE UNDER THE
     LEARNER.
     NOT IN A useMemo: `Math.random()` during render is impure — React may
     re-run it, and the site is statically exported, so the server's HTML and
     the first client render would disagree about which word is on screen.
     Every shuffle in this app is seeded from an effect for that reason
     (ComposeUnscramble's queue, FlipIt's rows). Deliberate: the rule reports
     the setState, and the point is that it happens once, on the client. */
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [item, setItem] = useState<TransferItem | null>(null);
  useEffect(() => {
    /* Block-disabled, not line-disabled: the rule reports only ONE of the
       setStates in a body and which one differs between the local and CI
       eslint — the same reason FirstTour and the drills use the block form. */
    /* eslint-disable react-hooks/set-state-in-effect */
    setItem(pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
    setValue("");
    setShown(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  if (!item) return null;
  const right = shown && gradeAgainst(value, [item.fs]) !== "wrong";

  function reveal(e?: FormEvent) {
    e?.preventDefault();
    setShown(true);
  }

  return (
    <section
      className={`rounded-2xl border-2 border-dashed border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] p-4 text-left ${className}`}
      aria-label="A new word — apply the rule"
    >
      <p className="fluo-mono text-[0.7rem] font-black uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
        Un mot nouveau · applique la règle
      </p>

      <p className="mt-2 text-[color:var(--cahier-ink)]">
        <span lang="fr" className="cahier-display text-xl font-black">il est {item.ms}</span>
        <span className="ml-2 text-sm text-[color:var(--cahier-ink-soft)]">{item.en}</span>
      </p>

      <form onSubmit={reveal} className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span lang="fr" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">elle est</span>
          <input
            id={`transfer-${deckId}`}
            lang="fr"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            disabled={shown}
            onChange={(e) => setValue(e.target.value)}
            placeholder="…"
            className="w-[10ch] border-0 border-b-2 border-[color:var(--cahier-ink)] bg-transparent px-1 text-lg font-black text-[color:var(--cahier-ink)] outline-none focus:bg-[color:var(--cahier-hl)]/25 disabled:opacity-100"
          />
        </label>
        {!shown && (
          <button type="submit" className="cahier-btn cahier-btn-sm" disabled={!value.trim()}>
            Vérifier
          </button>
        )}
      </form>

      {shown && (
        <div className="mt-3 border-t-2 border-[color:var(--cahier-rule)] pt-3">
          <p lang="fr" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
            <span aria-hidden>{right ? "✓" : "→"}</span> elle est {item.fs}
          </p>
          {/* THE RULE, NOT A MARK. No « faux », no red: the word was never
              taught, so the only honest thing on screen is the pattern and a
              word the learner already has that follows it. */}
          <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">
            <b className="text-[color:var(--cahier-ink)]">{item.rule}</b>
            {" — comme "}
            <span lang="fr">{item.like}</span>
          </p>
          <p className="mt-2 text-xs text-[color:var(--cahier-ink-soft)]">
            A word this deck never taught — nothing here is counted for or against you.
          </p>
        </div>
      )}
    </section>
  );
}
