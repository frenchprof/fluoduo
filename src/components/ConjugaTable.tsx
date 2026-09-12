"use client";

/**
 * ConjugaZone's verb table — the page's main event, not its reward screen.
 *
 * Dan, 2026-09-11: *"The main focus of ConjugaZone should be the verb table.
 * The questions are secondary and only come after that table."* This REVERSES
 * the patch 20–21 ruling, on instruction: the table used to be what a learner
 * earned by finishing the drill. It is what they arrive at now, and the drill
 * waits underneath.
 *
 * WHAT THE TABLE DOES, in Dan's order:
 *  · at most two verbs side by side (the grid falls to one where two do not fit);
 *  · the subject pronoun immediately beside its verb — three tight columns for
 *    a reflexive verb, two for a plain one, all sharing one invisible grid;
 *  · a 🔊 after every form, reading the WHOLE Subject+Verb phrase and never
 *    the words separately — `conjSpoken` already builds exactly that string;
 *  · only the subject pronouns visible at all times once HIDE CONJUGATIONS is
 *    tapped, then one cell revealed per tap;
 *  · standard endings red on yellow, irregular forms red entire;
 *  · example sentences on a button, interleaved right under each Subject+Verb
 *    in a smaller, quieter face.
 *
 * TWO MODES, ON A SWITCH (Dan, same day: *"can we have two modes for the
 * conjugazone table: one for reveal the verb form, the other for typing it in.
 * there should be a switch to toggle between those 2"*). REVEAL is the
 * hide-and-tap flow above. TYPE IT turns each form into a field sitting in the
 * form's own place — the same GapField the drills use, for the same reason:
 * the blank belongs where the word goes.
 *
 * The layout lives in globals.css under `.conjuga-*`, because the grid, the
 * container query and the two pronoun lengths are all geometry and reading
 * them next to each other is the only way they stay consistent.
 */

import { useMemo, useState } from "react";
import GapField from "@/components/GapField";
import { PERSONS, conjSpoken, type ConjVerb } from "@/content/conjugaison";
import { shapeCell, shapeInfinitive, type FormShape } from "@/lib/practice/conjugaShape";
import { speak } from "@/games/letris/speech";
import { deaccent } from "@/lib/practice/cloze";

/** The six subject pronouns in a short form, for a card too narrow to hold
 *  « il / elle / on ». Both are rendered; the container query picks one. */
const SHORT: readonly string[] = ["je", "tu", "il", "nous", "vous", "ils"];

/** Stem + ending painted by the rule, or the whole form in red. */
function Form({ shape, verb }: { shape: FormShape; verb: string }) {
  if (!shape) return <span className="conjuga-irr">{verb}</span>;
  // A zero ending (« il vend ») is regular and has nothing to paint — the
  // stem IS the form, and painting an empty span would draw a stray yellow
  // sliver after the d.
  if (!shape.ending) return <span>{shape.stem}</span>;
  return (
    <>
      <span>{shape.stem}</span>
      <span className="conjuga-end">{shape.ending}</span>
    </>
  );
}

export type ConjugaMode = "reveal" | "type";

export default function ConjugaTable({
  verbs,
  examples,
  mode,
  hidden,
}: {
  /** At most two — the caller slices; this renders what it is given so a
   *  lesson deep-link asking for three gets a readable page rather than a
   *  silent drop. */
  verbs: ConjVerb[];
  /** verbId → one sentence per person, or null/absent for "not drawn yet". */
  examples: Record<string, string[] | null>;
  mode: ConjugaMode;
  /** REVEAL mode only: the forms start covered and are tapped open. */
  hidden: boolean;
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, boolean>>({});

  // A new set of verbs is a new table: a key built from the verb ids means a
  // stale reveal or a stale answer cannot survive into it.
  const runKey = useMemo(() => verbs.map((v) => v.id).join("|"), [verbs]);
  const [lastKey, setLastKey] = useState(runKey);
  if (lastKey !== runKey) {
    setLastKey(runKey);
    setRevealed(new Set());
    setTyped({});
    setGraded({});
  }

  const say = (i: number, raw: string) => speak(conjSpoken(i, raw), "fr-FR");

  return (
    <div className="conjuga-verbs">
      {verbs.map((v) => {
        const inf = shapeInfinitive(v);
        const bare = v.inf.replace(/^(s[e']\s*)/i, "");
        const lead = v.inf.slice(0, v.inf.length - bare.length); // « s' » or ""
        const rows = examples[v.id] ?? null;

        return (
          <div key={v.id} className="conjuga-card">
            <p lang="fr" className="conjuga-inf text-[color:var(--cahier-ink)]">
              {lead}
              {inf ? <Form shape={inf} verb={bare} /> : <span className="conjuga-irr">{bare}</span>}
            </p>
            <p className="conjuga-gloss">{v.en}</p>

            <div className="conjuga-tbl">
              {PERSONS.map((person, i) => {
                const { rp, verb, shape, missing } = shapeCell(v, i);
                const key = `${v.id}:${i}`;
                const open = !hidden || revealed.has(key);

                const pronoun = (
                  <span className="conjuga-pron conjuga-cell" lang="fr">
                    <span className="conjuga-pron-long">{person}</span>
                    <span className="conjuga-pron-short">{SHORT[i]}</span>
                  </span>
                );

                // A person this verb does not have (falloir outside « il
                // faut ») is drawn absent, never covered and never typed:
                // there is nothing behind it to recall.
                if (missing) {
                  return (
                    <div key={key} className="contents">
                      {pronoun}
                      <span />
                      <span className="conjuga-cell conjuga-missing">—</span>
                      <span />
                      <span />
                    </div>
                  );
                }

                const formCell =
                  mode === "type" ? (
                    <span className="conjuga-cell conjuga-form">
                      <GapField
                        answer={verb}
                        value={typed[key] ?? ""}
                        onChange={(val) => {
                          setTyped((m) => ({ ...m, [key]: val }));
                          setGraded((m) => {
                            if (!(key in m)) return m;
                            const next = { ...m };
                            delete next[key];
                            return next;
                          });
                        }}
                        state={key in graded ? (graded[key] ? "right" : "wrong") : "idle"}
                      />
                    </span>
                  ) : (
                    <span
                      className={`conjuga-cell conjuga-form ${open ? "" : "conjuga-hidden"}`}
                      onClick={open ? undefined : () => setRevealed((s) => new Set(s).add(key))}
                    >
                      <Form shape={shape} verb={verb} />
                    </span>
                  );

                return (
                  <div key={key} className="contents">
                    {pronoun}
                    {rp ? (
                      mode === "type" ? (
                        // In TYPE mode the reflexive pronoun is GIVEN, not
                        // asked: the learner is being tested on the verb, and
                        // « m' » is the same word in every paradigm.
                        <span className={`conjuga-cell conjuga-rp${rp.endsWith("'") ? "" : " conjuga-rp-word"}`} lang="fr">
                          {rp}
                        </span>
                      ) : (
                        <span
                          className={`conjuga-cell conjuga-rp${rp.endsWith("'") ? "" : " conjuga-rp-word"} ${open ? "" : "conjuga-hidden"}`}
                          onClick={open ? undefined : () => setRevealed((s) => new Set(s).add(key))}
                          lang="fr"
                        >
                          {rp}
                        </span>
                      )
                    ) : (
                      <span />
                    )}
                    {formCell}
                    <button
                      type="button"
                      className="conjuga-tts"
                      // THE WHOLE PHRASE, NEVER THE WORDS SEPARATELY (Dan:
                      // *"reads the entire Subject-Verb phrase (do not
                      // separately read the individual words!)"*). conjSpoken
                      // builds « je m'appelle », elision and all, and is given
                      // the RAW stored form so a reflexive verb keeps its
                      // pronoun.
                      onClick={() => say(i, v.forms[i])}
                      title={`Hear ${conjSpoken(i, v.forms[i])}`}
                      aria-label={`Hear ${conjSpoken(i, v.forms[i])}`}
                    >
                      🔊
                    </button>
                    <span />
                    {rows?.[i] ? <span lang="fr" className="conjuga-ex">{rows[i]}</span> : null}
                  </div>
                );
              })}
            </div>

            {mode === "type" && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="cahier-btn cahier-btn-sm"
                  onClick={() =>
                    setGraded(
                      Object.fromEntries(
                        PERSONS.map((_, i) => {
                          const { verb, missing } = shapeCell(v, i);
                          const key = `${v.id}:${i}`;
                          if (missing) return null;
                          const given = (typed[key] ?? "").trim();
                          if (!given) return null;
                          // Accent-lenient, like every other typed surface in
                          // the app — the graders exist because typing accents
                          // on a phone is miserable, and this is no different.
                          return [key, deaccent(given.toLowerCase()) === deaccent(verb.toLowerCase())];
                        }).filter(Boolean) as [string, boolean][],
                      ),
                    )
                  }
                >
                  Check {v.inf}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
