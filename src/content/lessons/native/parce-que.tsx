/**
 * Native « Pourquoi ? Parce que… » lesson — SIO-025, written 2026-09-01.
 *
 * Item 3 of colour review's handover. `concept` is deliberately absent — that
 * is the concepts lane's, and verify76 asserts the field stays empty so a stub
 * of mine cannot read to a learner as the real argument.
 *
 * WHAT THE STOP TEACHES: what comes AFTER « parce que ». The connector itself
 * costs a learner nothing — it is one word and it means "because". The stop's
 * competence is about the frame behind it: *"Answer Pourquoi ? with parce que
 * c'est + adjective or parce que j'aime + N for ≥3 prompts."* Every card in the
 * deck shows that frame already attached, so the choice between them is never
 * put to a learner.
 *
 * AND THE DECK KNOWS A THIRD THING ITS OWN SIO DOES NOT SAY. Five of the six
 * reasons take one of the two named frames; « Parce que je fais du sport avec
 * mes amis. » takes neither. That is not a fault in the deck — it is the true
 * general rule (parce que opens an ordinary sentence) sitting in the data with
 * nothing naming it. The Mémo names it rather than pretending the two frames
 * are the whole story, and invents nothing to do so.
 *
 * WHY THE PROMPT IS THE ENGLISH AND NOT THE DECK'S QUESTION. Six generic
 * reasons against six questions do not pair one-to-one: « Pourquoi tu aimes le
 * sport ? » is answered just as well by *amusant*, by *intéressant* and by *je
 * fais du sport avec mes amis*. A card that showed the question and graded one
 * of the three would mark two correct answers wrong. The question is the
 * context line; the English reason is the prompt, and it is what makes the card
 * answerable.
 *
 * NO AXES, ON PURPOSE. Six items across three frames means a dropdown whose
 * third option serves exactly one card — a selector that narrows the lesson to
 * a single repeated question is worse than the roll it replaces. envies-besoins
 * next door has ten items across five openers and does declare one.
 */
import type { NativeLesson } from "./types";
import { medFrom, sentence, type Slot } from "./cloze";

type Frame = "c'est" | "j'aime" | "je fais";

/**
 * The six, decomposed. `ask` is the item's own `example`, `frame` + `rest`
 * reassemble to its `fr` with « Parce que » in front, and `en` is its own
 * gloss. verify76 rebuilds all six against parce-que.json rather than trusting
 * this table — a reason filed under the wrong frame reads as ordinary code and
 * would teach the wrong opening.
 */
const REASONS: { ask: string; frame: Frame; rest: string; en: string }[] = [
  { ask: "Pourquoi tu aimes le sport ?", frame: "c'est", rest: "amusant.", en: "Because it's fun." },
  { ask: "Pourquoi tu aimes le français ?", frame: "c'est", rest: "intéressant.", en: "Because it's interesting." },
  { ask: "Pourquoi tu aimes le week-end ?", frame: "j'aime", rest: "dormir.", en: "Because I like sleeping." },
  { ask: "Pourquoi tu vas au cinéma ?", frame: "j'aime", rest: "beaucoup les films.", en: "Because I really like films." },
  { ask: "Pourquoi tu étudies à la bibliothèque ?", frame: "c'est", rest: "calme.", en: "Because it's quiet." },
  { ask: "Pourquoi tu aimes le samedi ?", frame: "je fais", rest: "du sport avec mes amis.", en: "Because I do sport with my friends." },
];

/** The three openings the deck actually uses, in the order it first uses them. */
const FRAMES: { key: Frame; gloss: string; tone: string }[] = [
  { key: "c'est", gloss: "+ an adjective", tone: "var(--gram-masc)" },
  { key: "j'aime", gloss: "+ what you like", tone: "var(--gram-fem)" },
  { key: "je fais", gloss: "+ an ordinary sentence", tone: "var(--cahier-ink)" },
];

/** The full answer, exactly as parce-que.json writes it. */
export const answerOf = (r: (typeof REASONS)[number]): string =>
  sentence([{ text: "Parce que" }, { text: r.frame }, { text: r.rest }]);

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function others<T>(pool: readonly T[], not: T, n: number): T[] {
  const rest = pool.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export const parceQueLesson: NativeLesson = {
  slug: "parce-que",

  // TIER 3 · SIO-025, drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md and
  // pasted in unchanged once this file landed. Every French line is a deck
  // card.
  concept: {
    subtitle: "Why « parce que » introduces a whole clause",
    contrast: (
      <>
        English answers a <i>why</i> with a fragment all the time &mdash;{" "}
        <i>Why do you like it?</i> <i>Fun.</i> <i>The people.</i> French cannot:
        after <i lang="fr">parce que</i> a whole sentence has to follow, subject and
        verb included.
      </>
    ),
    question: (
      <>
        The Mémo names three frames, and then the sixth reason &mdash;{" "}
        <i lang="fr">Parce que je fais du sport avec mes amis</i>{" "}
        &mdash; uses none of
        them. Is that an exception?
      </>
    ),
    answer: (
      <>
        No &mdash; it is the rule the three frames were hiding. Look at what every
        reason starts with: <i lang="fr">c&rsquo;</i>est,{" "}
        <i lang="fr">j&rsquo;</i>aime, <i lang="fr">je</i> fais. All six carry a{" "}
        <b>subject</b>, because <i lang="fr">parce que</i> introduces a sentence and a
        French sentence must have one. The three frames are simply the three sentences
        you need most often; any sentence works, which is why the sixth needs no
        special permission.
      </>
    ),
    pitfallHeads: ["answering as English does", "answering with a sentence"],
    pitfall: [
      {
        label: <>an adjective alone</>,
        wrong: <i lang="fr">Parce que amusant.</i>,
        right: (
          <>
            <i lang="fr">Parce que c&rsquo;est amusant.</i>{" "}
            &mdash; something has to be fun
          </>
        ),
      },
      {
        label: <>the subject dropped</>,
        wrong: <i lang="fr">Parce que aime dormir.</i>,
        right: (
          <>
            <i lang="fr">Parce que j&rsquo;aime dormir.</i>{" "}
            &mdash; someone has to do the liking
          </>
        ),
      },
      {
        label: <>a noun alone</>,
        wrong: <i lang="fr">Parce que le sport.</i>,
        right: (
          <>
            <i lang="fr">Parce que je fais du sport avec mes amis.</i>{" "}
            &mdash; say what you do with it
          </>
        ),
      },
      {
        label: <>two frames at once</>,
        wrong: <i lang="fr">Parce que c&rsquo;est j&rsquo;aime les films.</i>,
        right: (
          <>
            <i lang="fr">Parce que j&rsquo;aime beaucoup les films.</i>{" "}
            &mdash; one subject, one verb
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Say « Parce que », then a whole sentence." },
      { depth: 1, text: "Describing the thing? c'est + adjective — c'est calme." },
      { depth: 1, text: "Saying what you like? j'aime + it — j'aime dormir." },
      { depth: 1, text: "Saying what you do? je fais + it — je fais du sport." },
      { depth: 0, text: "Anything else you could say on its own works too." },
    ],
    check: [
      {
        q: (
          <>
            Can you answer <i lang="fr">Pourquoi ?</i> with{" "}
            <i lang="fr">Parce que amusant</i>?
          </>
        ),
        a: (
          <>
            No. <i lang="fr">Amusant</i> describes something, and nothing has been
            named yet: <i lang="fr">Parce que c&rsquo;est amusant.</i>
          </>
        ),
      },
      {
        q: (
          <>
            <i lang="fr">Parce que je fais du sport avec mes amis</i> matches none of
            the three frames. Is it wrong?
          </>
        ),
        a: (
          <>
            It is the most ordinary sentence in the deck. The frames were never the
            rule &mdash; a subject and a verb are.
          </>
        ),
      },
    ],
    remember: (
      <>
        <b>« Parce que » opens a sentence, not a word.</b> Whatever you could say on
        its own, say that after it.
      </>
    ),
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Pourquoi ? — <em lang="fr">Parce que…</em>
      </h2>

      <div className="space-y-2">
        {FRAMES.map((f) => (
          <div key={f.key}>
            <p className="fluo-label mb-0.5" style={{ color: f.tone }}>
              <span lang="fr">parce que {f.key}</span> {f.gloss}
            </p>
            <p className="text-[15px] leading-relaxed text-[color:var(--cahier-ink)]" lang="fr">
              {REASONS.filter((r) => r.frame === f.key).map((r, i) => (
                <span key={r.rest}>
                  {i > 0 ? <span className="text-[color:var(--fluo-ink-soft)]"> · </span> : null}
                  Parce que <b style={{ color: f.tone }}>{f.key}</b> {r.rest}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        {/* The "not limited to two openings" half is shown by the third row
            existing, so only the rule that the rows cannot state stays. */}
        ⚠️ Whatever follows <span lang="fr"><b>parce que</b></span> needs a{" "}
        <b>subject and a verb</b> — never a bare word.
      </p>
    </div>
  ),

  dice: {
    instruction: "Answer the question with that reason, in French.",
    newQuestion() {
      const r = pick(REASONS);

      // Reading order is withdrawal order: « Parce que » is the scaffolding a
      // learner always sees, the FRAME is the first gap, and Difficile takes
      // the frame and the reason together.
      const slots: Slot[] = [
        { text: "Parce que" },
        { key: "frame", text: r.frame, choices: FRAMES.map((f) => f.key) },
        { key: "rest", text: r.rest, choices: [r.rest, ...others(REASONS, r, 3).map((o) => o.rest)] },
      ];

      const correct = sentence(slots);
      return {
        // The deck's own question. It is the situation, not the answer: six
        // generic reasons do not pair one-to-one with six questions, which is
        // why it is the context and the English is the prompt.
        meta: r.ask,
        big: r.en,
        bigLang: "en" as const,
        correct,
        // Whole reasons. The unit of choice here is the reason, not a word
        // inside it — a frame swapped into someone else's reason (« Parce que
        // j'aime amusant. ») is rejectable on sound and teaches nothing.
        easyOptions: [correct, ...others(REASONS, r, 3).map((o) => answerOf(o))],
        slots,
        med: medFrom(slots, "frame"),
      };
    },
  },

  bonus: REASONS.map((r) => ({ en: r.en, fr: answerOf(r) })),
};
