"use client";

/**
 * G-COMPRIS! — one document, read, then questioned.
 *
 * Dan, 2026-09-15: *"Call the reading exercises : G-Compris!"*.
 *
 * ── THE TEXT NEVER LEAVES THE SCREEN ──────────────────────────────────────
 * It is the only copy of the thing the learner needs to answer the question
 * in front of them, and the collapse rule names that case explicitly:
 * *"Never collapse the only copy of something a learner needs to answer the
 * question in front of them. Collapsing is for reference, never for the
 * prompt, the options, or the feedback."* So the document sits above the
 * question, open, on every question, and scrolls with it rather than being
 * folded away once the drill starts.
 *
 * ── THE WHY IS THE RULE, NOT THE LINE ─────────────────────────────────────
 * Every question's explanation names the GRAMMAR it turned on — « son agrees
 * with the thing owned, not the owner » — and never merely points back at the
 * sentence it came from. Pointing back teaches the text; naming the rule
 * teaches the next text. It rides DrillShell's `why`, so it is behind the WHY
 * button and never inline (the litmus test, 2 Jul).
 *
 * ── A TYPED ANSWER IS GRADED THE WAY EVERY OTHER TYPED ANSWER IS ──────────
 * `gradeAgainst` over the answer plus its `also` spellings, which is what
 * lets « 19 » and « dix-neuf » both stand for the same age. Accent strictness
 * is DERIVED there and not set here: an answer that carries an accent demands
 * it (« française », not « francaise ») and one that does not, forgives —
 * Dan, 2026-09-14: *"français (pls don't accept francais)"*.
 *
 * ── IT BELONGS TO NO STOP, AND THAT IS WHY IT CAN TICK ────────────────────
 * A scene is not a deck, so `usherFor` has no compass to compute and returns
 * null. `ActivityUsher` draws `<PathNext />` BEFORE its own null-guard, which
 * is the whole reason a curated path can walk through a screen like this one
 * — the trap that silently stopped the path at step 2 on 14 Sep.
 */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

import ActivityUsher from "@/components/ActivityUsher";
import DrillShell from "@/components/DrillShell";
import { GC_SCENES, type GCScene } from "@/content/gcompris";
import { sfx } from "@/games/audio/sfx";
import { gradeAgainst } from "@/lib/practice/cloze";
import { shuffle } from "@/lib/shuffle";
import { usherFor } from "@/lib/usher";

/** The document itself. A `<pre>`-free paragraph split so the text stays
 *  selectable, wraps at any width, and carries no markup of its own. */
function Document({ scene }: { scene: GCScene }) {
  return (
    <article className="gc-doc" lang="fr">
      {scene.text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j, all) => (
            <span key={j}>
              {line}
              {j < all.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </article>
  );
}

export default function GComprisScene({ id }: { id: string }) {
  const scene = GC_SCENES.find((s) => s.id === id);

  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const qs = scene?.questions ?? [];
  const q = qs[i];
  const done = !!scene && i >= qs.length;

  /* THE OPTIONS ARE SHUFFLED ONCE PER QUESTION, PER RUN — not authored in a
     fixed order. Vrai/Faux is the exception and keeps its order: a learner
     reads « Vrai · Faux » as a pair, and swapping the two halves of a binary
     is not variety, it is a trap. `round` is in the key so Play again really
     re-deals. */
  const options = useMemo(() => {
    if (!q?.options) return null;
    if (q.options.length === 2 && q.options[0] === "Vrai") return q.options;
    return shuffle(q.options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id, round]);

  if (!scene) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-2xl font-black text-[color:var(--cahier-ink)]">No such text</p>
        <Link href="/gcompris" className="neo-key mt-4 inline-block px-4 py-2 font-bold">
          ← All texts
        </Link>
      </div>
    );
  }

  const answered = result !== null;
  const canCheck = q?.options ? picked !== null : typed.trim().length > 0;

  function check() {
    if (!q || answered) return;
    const given = q.options ? (picked ?? "") : typed;
    const right = gradeAgainst(given, [q.answer, ...(q.also ?? [])]) !== "wrong";
    if (right) {
      sfx.correct();
      setScore((n) => n + 1);
    } else {
      sfx.wrong();
    }
    setResult(right ? "right" : "wrong");
  }

  function next() {
    // COMPLETING the run, never starting or abandoning one — the fanfare rule
    // (13 Sep). It is reached from the drill's own flow, not from an onClick.
    if (i + 1 >= qs.length) sfx.stage();
    setResult(null);
    setPicked(null);
    setTyped("");
    setI((n) => n + 1);
  }

  function restart() {
    setI(0);
    setResult(null);
    setPicked(null);
    setTyped("");
    setScore(0);
    setRound((n) => n + 1);
  }

  const usher = usherFor("gcompris", {});

  return (
    <DrillShell
      activity="gcompris"
      exitHref="/gcompris"
      progress={done ? null : { done: i, total: qs.length }}
      right={done ? null : <>✓ {score}</>}
      cta={done || answered || !q ? null : { label: "Check", onClick: check, disabled: !canCheck }}
      feedback={
        !answered || !q
          ? null
          : {
              kind: result === "right" ? "correct" : "wrong",
              body:
                result === "right" ? (
                  "Bravo !"
                ) : (
                  <span lang="fr">→ {q.answer}</span>
                ),
              why: q.why,
              cta: { label: i + 1 >= qs.length ? "Finish" : "Continue", onClick: next },
            }
      }
    >
      {done ? (
        <div className="text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <p className="mt-2 text-2xl font-black text-[color:var(--cahier-ink)]">
            ✓ {score}/{qs.length}
          </p>
          <p lang="fr" className="mt-1 text-sm font-bold text-[color:var(--cahier-ink)]/60">
            {scene.title}
          </p>
          <ActivityUsher usher={usher} onRedo={restart} className="mt-5" />
          <Link
            href="/gcompris"
            className="neo-key mt-4 inline-block px-4 py-2 text-sm font-bold"
          >
            📖 Another text
          </Link>
        </div>
      ) : (
        <div>
          <Document scene={scene} />

          {q && (
            <div className="gc-question">
              <p className="gc-q">{q.q}</p>

              {options ? (
                /* TWO COLUMNS, NEVER ONE FULL-WIDTH ROW EACH (rule, 5 Sep).
                   A Vrai/Faux pair is two cells side by side; four options
                   are a 2×2. The grid counts the room rather than being told
                   a width, so nothing here is nailed to a pixel. */
                <div className="gc-options" data-n={options.length}>
                  {options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      lang={o === "Vrai" || o === "Faux" ? "fr" : undefined}
                      disabled={answered}
                      aria-pressed={picked === o}
                      onClick={() => setPicked(o)}
                      className={`neo-key gc-option ${picked === o ? "is-picked" : ""}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  ref={inputRef}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canCheck && !answered) check();
                  }}
                  disabled={answered}
                  lang="fr"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label={q.q}
                  className="gc-input"
                />
              )}
            </div>
          )}
        </div>
      )}
    </DrillShell>
  );
}
