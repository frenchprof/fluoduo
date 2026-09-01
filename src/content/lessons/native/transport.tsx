/**
 * Native « Comment tu y vas ? » lesson — SIO-038, written 2026-09-01.
 *
 * THE LAST TIER 1 STOP WITHOUT A FILE. Colour review's handover, 31 Aug:
 * *"SIO-038 matters out of proportion to its size — it is the only Tier 1 stop
 * without a file, so it is the single thing standing between Tier 1 and
 * complete."* A concept had physically nowhere to live; this file is that place.
 * `concept` is deliberately absent — colour review writes the argument on top of
 * this Mémo, and a placeholder of mine would only have to be deleted.
 *
 * WHAT THE STOP ACTUALLY TEACHES. Not twelve nouns — three frames. The deck's
 * own letris columns already name two of them (*"en — a vehicle you sit
 * inside"*, *"à — on foot or astride"*) and its last three items add the third,
 * `prendre` + the definite article. A learner who knows all twelve nouns and
 * none of the three frames cannot say one of the deck's sentences.
 *
 * NO INVENTED FRENCH. Every French string here is either an item's `fr` or an
 * item's `example`, and « Tu y vas comment ? » is SIO-038's own `fr` field. The
 * generator's table decomposes the twelve examples and reassembles them; the
 * check holds that reassembly against transport.json rather than trusting it.
 */
import type { NativeLesson } from "./types";
import { MODES, TRANSPORT_AXES, exampleOf, transportQuestion, type Frame } from "./transport.gen";

/** The three frames, in the order the deck lists them, with the deck's own
 *  gloss for the two it glosses itself. */
const FRAMES: { frame: Frame; head: string; gloss: string; tone: string }[] = [
  // The first two glosses are the deck's own letris `choiceLabel`s, verbatim —
  // the only place in the repo where the en/à split is stated, and a game's
  // configuration reaches no card. The third frame is glossed nowhere, so this
  // is the shortest true thing that can be said about it.
  { frame: "en", head: "en", gloss: "a vehicle you sit inside", tone: "var(--gram-masc)" },
  { frame: "à", head: "à", gloss: "on foot or astride", tone: "var(--gram-fem)" },
  { frame: "prendre", head: "prendre", gloss: "name the vehicle", tone: "var(--cahier-ink)" },
];

/**
 * One frame, as a run rather than a list.
 *
 * NO ENGLISH GLOSS, AND THAT IS THE LITMUS TEST, NOT A CUT FOR SPACE. The
 * deck's own word list — all twelve with their English — is a section of THIS
 * SAME PANEL since Words moved under Forms (Dan, 31 Aug), so a second copy here
 * is text whose removal costs a learner nothing. It cost a great deal on the
 * screen: twelve glossed rows ran to 1.53 screens on a 390px phone with the
 * third frame below the fold, and two columns only turned every row into two
 * lines. Three runs fit, and a run shows the pattern a list only lists.
 *
 * The item's own `fr` is printed whole and the gap bolded inside it, so the
 * Mémo cannot drift from the deck the way a re-typed phrase can.
 */
const frameBlock = (f: (typeof FRAMES)[number]) => (
  <div key={f.frame}>
    <p className="fluo-label mb-0.5" style={{ color: f.tone }}>
      <span lang="fr">{f.head}</span> — {f.gloss}
    </p>
    <p className="text-[15px] leading-relaxed text-[color:var(--cahier-ink)]" lang="fr">
      {MODES.filter((m) => m.frame === f.frame).map((m, i) => {
        const at = m.fr.indexOf(m.gap);
        return (
          <span key={m.fr}>
            {i > 0 ? <span className="text-[color:var(--fluo-ink-soft)]"> · </span> : null}
            {m.emoji ? <span aria-hidden="true">{m.emoji} </span> : null}
            {m.fr.slice(0, at)}
            <b style={{ color: f.tone }}>{m.gap}</b>
            {m.fr.slice(at + m.gap.length)}
          </span>
        );
      })}
    </p>
  </div>
);

export const transportLesson: NativeLesson = {
  slug: "transport",

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Comment tu y vas ?
      </h2>

      <div className="space-y-2">{FRAMES.map(frameBlock)}</div>

      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b lang="fr">y</b> is the place you are going, already said once and not repeated:{" "}
        <span lang="fr">J&rsquo;<b>y</b> vais en train.</span> — <i>I go there by train.</i> It sits
        before the verb, never after it.
      </p>
    </div>
  ),

  dice: {
    instruction: "Say how you get there — mind the word in front of the mode.",
    axes: TRANSPORT_AXES,
    newQuestion: transportQuestion,
  },

  // The deck's own twelve examples, ten of them, glossed as the deck glosses
  // them. Nothing here is written for the bonus bank.
  bonus: MODES.filter((m) => m.mode !== "bateau" && m.mode !== "moto").map((m) => ({
    en: m.enFull,
    fr: exampleOf(m),
  })),
};
