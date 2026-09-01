/**
 * Native "Envies et besoins" lesson — SIO-039, written 2026-09-01.
 *
 * WHY THIS FILE EXISTS. `envies-besoins` had a deck and no lesson file, so a
 * concept had physically nowhere to live and the 💡 Idea tab read "Idea has not
 * been written for this lesson yet" (docs/HANDOVER_LESSON_FILES.md; fluoduo-main
 * split the nine-file handover on 1 Sep and gave this lane the deck-backed
 * stops). `concept` is deliberately absent — the concepts lane writes the
 * argument on top of this file. This one supplies the Mémo, the dice and the
 * bonus bank.
 *
 * WHAT THE DECK PROVES. Ten cards, five frames, two of each:
 *
 *     Je voudrais …      un café · visiter le Louvre
 *     J'aimerais …       voyager · une chambre pour deux personnes
 *     Je veux …          visiter Paris · partir en vacances
 *     J'ai besoin d' …   un hôtel · un plan
 *     J'ai envie d' …    un chocolat chaud · de dormir
 *
 * Two things every card demonstrates and no card states.
 *
 * ONE — THE SHAPE. The three verb frames take what they want BARE: « Je
 * voudrais un café », « Je veux partir ». The two `avoir` frames cannot; they
 * are built on a noun (« un besoin », « une envie ») and a noun needs **de** to
 * hang anything off it: « J'ai besoin **d'**un plan », « J'ai envie **de**
 * dormir ». Ten cards, and the split runs 6–4 exactly along that line.
 *
 * TWO — THE REGISTER, and the deck says it out loud in its own English. Two
 * cards are glossed "(polite request)" and two "(wish)"; « Je veux » is glossed
 * plainly, because it is plain — it is the one a learner should not use on a
 * stranger. The scale is already in the data; what is missing is anyone saying
 * so, and a word list cannot.
 *
 * WHAT THIS FILE REFUSES. « Je souhaiterais », « il me faut », the conditional
 * as a tense — none of it is in the deck, so teaching by it would mean inventing
 * French a learner reads as a model, which the 31 Aug rule forbids and which
 * `colors.tsx` set the standard for by declining adjective agreement outright.
 * The elision is taught only because the deck contains BOTH forms — « d'un
 * hôtel » and « de dormir » — so it can be shown rather than asserted.
 *
 * EVERY FRENCH STRING IS THE DECK'S OWN `fr`, split into frame · link · rest and
 * reassembled. The tables and the card generator live in `envies-besoins.gen.ts`
 * — JSX-free on purpose, because `node --experimental-strip-types` cannot load a
 * `.tsx`, so a generator kept in here could only ever be regex-read by a check.
 * verify76 EXECUTES it and rebuilds all ten against envies-besoins.json. The
 * only composed French is the MCQ distractor, which is the shape error the
 * lesson is about — a distractor is meant to be wrong and is never a model.
 */
import type { NativeLesson } from "./types";
import { CARDS, ENVIES_AXES, FRAMES, enviesQuestion, line } from "./envies-besoins.gen";

/** The five as speech acts, in the order the deck first uses them — the
 *  wants-needs draft's taxonomy (Dan kept it, part 2 of the 2 Sep ruling).
 *  Each act is the deck's own English gloss compressed to its act name. */
const SPEECH_ACTS: { frame: string; act: string; tone: string }[] = [
  { frame: "Je voudrais", act: "asking politely", tone: "var(--gram-masc)" },
  { frame: "J'aimerais",  act: "a wish",          tone: "var(--gram-fem)" },
  { frame: "J'ai besoin", act: "a need",          tone: "var(--cahier-ink)" },
  { frame: "Je veux",     act: "a plain want",    tone: "var(--gram-masc)" },
  { frame: "J'ai envie",  act: "a craving",       tone: "var(--gram-fem)" },
];

export const enviesBesoinsLesson: NativeLesson = {
  slug: "envies-besoins",

  /* THE GRAFT (Dan, 2 Sep, part by part against the wants-needs draft —
     "1B 2(merge: examples are always essential + add toggle for English)
     3B but remove the last sentence and give an example instead"):
     the headline stands alone (1B — the bare/de paragraph went with it; the
     concept slot is where that argument will live); the body is the draft's
     speech-act rows with the deck's French run under each, and the English
     register glosses sit behind a native <details> toggle (2); the warning
     box takes the draft's phrasing with the deck's own contrast pair as the
     example (3). The generator and its checks stay this file's (part 4 —
     with the selector relabelled, since "Formule" told Dan nothing). */
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Envies et besoins
      </h2>

      <div className="space-y-1.5">
        {SPEECH_ACTS.map((sa) => {
          const group = CARDS.filter((c) => c.frame === sa.frame);
          const shifts = group.some((c) => c.link !== group[0].link);
          return (
            <div key={sa.frame}>
              <p className="fluo-label mb-0.5" style={{ color: sa.tone }}>
                {sa.act}
              </p>
              <p className="text-[15px] leading-snug text-[color:var(--cahier-ink)]" lang="fr">
                {group.map((c, i) => (
                  <span key={c.rest}>
                    {i > 0 ? <span className="text-[color:var(--fluo-ink-soft)]"> · </span> : null}
                    {/* The opener (frame + its de/d') is the bold hero, printed
                        once — unless it changes within the row, which is only
                        the craving row, where « de dormir » against « d'un
                        chocolat chaud » IS the elision evidence. */}
                    {i === 0 || shifts ? (
                      <>
                        <b style={{ color: sa.tone }}>
                          {c.frame}
                          {c.link ? (c.link === "de" ? " de" : " d’") : ""}
                        </b>
                        {/* an elided d' glues to its noun — « d'un hôtel » */}
                        {c.link === "d'" ? "" : " "}
                      </>
                    ) : null}
                    {c.rest.replace(/[.]$/, "")}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>

      {/* The English glosses and the register scale, on demand (Dan, 2 Sep:
          "examples are always essential + add toggle for English"). Native
          details per the collapse rule; the summary says what is behind it. */}
      <details className="mt-2">
        <summary className="fluo-label cursor-pointer text-[color:var(--fluo-ink-soft)]">
          In English — and who to say it to · 5
        </summary>
        <ul className="mt-1 text-[13.5px] text-[color:var(--cahier-ink)]">
          {FRAMES.map((f) => (
            <li key={f.fr} className="mb-0.5">
              <span lang="fr" className="font-bold">{f.fr}{f.de ? " de…" : "…"}</span>
              <span className="text-[color:var(--fluo-ink-soft)]"> — {f.en} · {f.note}</span>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-2 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr">de</span> becomes <span lang="fr"><b>d&rsquo;</b></span> before a
        vowel: <span lang="fr"><b>J&rsquo;ai envie de dormir</b></span> but{" "}
        <span lang="fr"><b>J&rsquo;ai envie d&rsquo;un chocolat chaud</b></span>.
      </p>
    </div>
  ),

  dice: {
    instruction: "Say it in French — mind whether the frame needs « de ».",
    // The generator lives in envies-besoins.gen.ts, JSX-free, so verify76 can
    // EXECUTE it rather than re-implement its elision rule in Python — which
    // is precisely the mistake the first draft of that check made.
    newQuestion: enviesQuestion,
    // One dropdown: practise a single frame rather than one card in five.
    axes: ENVIES_AXES,
  },

  // DERIVED, not retyped: every line is the deck's own `fr` rebuilt from the
  // table above, so a bonus card and a dice card can never disagree about the
  // same sentence.
  bonus: CARDS.map((c) => ({ en: c.en, fr: line(c) })),
};
