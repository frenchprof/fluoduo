/**
 * The design-rationale page (Dan, 2026-07-05: users "should be aware of how
 * the app is conceived, why it works better than commercial apps"). DRAFT for
 * Dan to edit down to what he'd defend in a department meeting. Deliberately
 * OFF every learner path — linked from the Guide footer only. The honest
 * framing throughout: FluOLinGo does a different job than commercial apps,
 * not the same job better.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

const COMMITMENTS: { emoji: string; title: string; hue: number; body: React.ReactNode; refs: number[] }[] = [
  {
    emoji: "🧪",
    title: "Test first, teach second",
    hue: 3,
    body: (
      <>
        Every goal starts with a Pre-Test you take <b>before</b>{" "}the topic is taught. Trying — and often failing — first
        prepares the mind for the lesson: the classroom explanation lands on questions you already own, not on a blank page.
        Commercial apps can&rsquo;t do this, because there is no Thursday class coming after them.
      </>
    ),
    refs: [1, 2, 3],
  },
  {
    emoji: "📝",
    title: "Errors are the curriculum",
    hue: 0,
    body: (
      <>
        Nothing here is graded. A wrong answer triggers a <b>WHY</b> explanation and lands on your{" "}
        <b>📝 Bring to class</b>{" "}list — your personal agenda for the next lesson. Your mistakes aren&rsquo;t the cost of
        learning; they&rsquo;re the raw material, and they travel with you into the classroom.
      </>
    ),
    refs: [4],
  },
  {
    emoji: "🎲",
    title: "Doing beats reading",
    hue: 1,
    body: (
      <>
        {/* "Memo", not "Mémo" — matches the activity's registry name (Dan,
            2026-08-23 rename, approved surface #3; chrome is English). */}
        Reading about French is the weakest way to learn it, so reading is rationed (the Memo is one card, never a
        chapter) and everything else makes you <b>produce</b>: pick, type, build the whole sentence, speak it, compose a
        dialogue where the waiter actually reacts to what you order. The activity ladder climbs from recognising to
        constructing to interacting.
      </>
    ),
    refs: [5],
  },
  {
    emoji: "🎤",
    title: "Fair to the mouth, strict to the hand",
    hue: 2,
    body: (
      <>
        When you <b>speak</b>, FluOLinGo accepts what sounds right — <i lang="fr">il s&rsquo;appelle</i> and{" "}
        <i lang="fr">ils s&rsquo;appellent</i> are the same in the mouth, and you&rsquo;re told so. When you{" "}
        <b>type</b>, the letters must be right, because spelling is what typing trains. Each modality is graded on what
        it actually teaches — difficulty is kept where it helps and removed where it only frustrates.
      </>
    ),
    refs: [6],
  },
  {
    emoji: "🏫",
    title: "A companion, not a replacement",
    hue: 5,
    body: (
      <>
        The 50 goals here are <b>your course&rsquo;s</b>{" "}can-do objectives — not an app company&rsquo;s syllabus. FluOLinGo
        prepares you before each class and consolidates after it, with reviews spaced over time (<b>🔖 DéjàRevu</b>).
        Commercial apps teach their own curriculum to nobody in particular; this one exists to make{" "}
        <b>your next lesson</b>{" "}work better. That&rsquo;s a different job — and it&rsquo;s the job that matters here.
      </>
    ),
    refs: [7],
  },
];

/** The wordmark, cut where the name cuts: FluOLinGo = Fluency On Linguistic
 *  Goals. The capitals in the house spelling already mark the seams — this
 *  only writes down what they were doing. (Dan, 2026-08-30.) */
const WORDMARK: { piece: string; word: string }[] = [
  { piece: "Flu", word: "Fluency" },
  { piece: "O", word: "On" },
  { piece: "lin", word: "Linguistic" },
  { piece: "Go", word: "Goals" },
];

/** A name that is only a noun phrase hides its verb — "fluency ——— on
 *  linguistic goals" — and the reader restores one. This one hides four, and
 *  they are a ladder, not a menu: each rung stands on the one above it, and
 *  each demands its own qualifier on the goals. Foundation first. */
const LADDER: { verb: string; qualifier: string; why: string }[] = [
  {
    verb: "built",
    qualifier: "your course’s",
    why: "The fifty goals are LAF1201’s own can-do objectives, not an app company’s syllabus. You can only build on ground someone owns.",
  },
  {
    verb: "trained",
    qualifier: "linguistic",
    why: "Every drill targets a language competence — never a streak, a daily target or a points total. You can only train a competence.",
  },
  {
    verb: "earned",
    qualifier: "one of fifty",
    why: "The pre-test, the practice and the revision all happen inside a single objective at a time. You can only earn what is countable — and countable means finishable.",
  },
  {
    verb: "measured",
    qualifier: "named",
    why: "Each goal carries a can-do statement and the competence its pre- and post-activities assess. You can only measure what is specified.",
  },
];

const REFERENCES: string[] = [
  "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.",
  "Kapur, M. (2008). Productive failure. Cognition and Instruction, 26(3), 379–424.",
  "Richland, L. E., Kornell, N., & Kao, L. S. (2009). The pretesting effect: Do unsuccessful retrieval attempts enhance learning? Journal of Experimental Psychology: Applied, 15(3), 243–257.",
  "Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.",
  "Chi, M. T. H., & Wylie, R. (2014). The ICAP framework: Linking cognitive engagement to active learning outcomes. Educational Psychologist, 49(4), 219–243.",
  "Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In M. A. Gernsbacher et al. (Eds.), Psychology and the real world (pp. 56–64). Worth.",
  "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.",
];

export default function AboutPage() {
  return (
    // « About », not « Guide ». This page shares the `guide` key with /guide
    // — which is why it had no band of its own to be wrong in. Named here
    // rather than by borrowing its sibling's flap.
    <CahierShell tabs={tabsWithActive(siteTabs(), "guide")} active="guide" band={{ title: "About" }}>
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">
          💡 Why <span className="cahier-hl px-1">FluOLinGo</span> is built this way
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
          FluOLinGo was designed by your instructor around five commitments from the learning sciences. None of them are
          decoration — each one shapes what you see (and don&rsquo;t see) on every page.
        </p>

        <ol className="mt-5 space-y-3">
          {COMMITMENTS.map((c) => (
            <li
              key={c.title}
              className={`fluo-h-${c.hue} rounded-xl border-2 p-4`}
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
            >
              <p className="text-base font-black text-[color:var(--cahier-ink)]">
                {c.emoji} {c.title}
                <span className="ml-1.5 align-super text-[0.6rem] font-bold text-[color:var(--cahier-ink-soft)]">
                  {c.refs.map((r) => `[${r}]`).join(" ")}
                </span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--cahier-ink)]">{c.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-7">
          <h2 className="cahier-section rounded-md px-3 py-1.5">The name</h2>

          <div
            className="fluo-h-3 mt-3 flex flex-wrap items-end justify-center gap-x-2 gap-y-2 rounded-xl border-2 p-4"
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            {WORDMARK.map((w) => (
              <span key={w.word} className="text-center">
                <span className="cahier-display block text-2xl font-black text-[color:var(--cahier-ink)]">{w.piece}</span>
                <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-[color:var(--cahier-ink-soft)]">
                  {w.word}
                </span>
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            The middle word is the one doing the work. Commercial apps promise fluency <i>in French</i> — unbounded,
            unmeasurable, always one more subscription away. This one promises fluency <b>on</b> fifty named goals:
            finite, checkable, and finishable. A name that is only a noun phrase hides its verb, and this one hides
            four — each standing on the one above it.
          </p>

          <ol className="mt-3 space-y-2">
            {LADDER.map((r, i) => (
              <li
                key={r.verb}
                className={`fluo-h-${i} rounded-xl border-l-8 p-3`}
                style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
              >
                <p className="text-sm font-black text-[color:var(--cahier-ink)]">
                  Fluency <span className="cahier-hl px-1">{r.verb}</span> on <b>{r.qualifier}</b> goals
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--cahier-ink)]">{r.why}</p>
              </li>
            ))}
          </ol>

          <p className="mt-3 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            Take a rung away and the ones above it lose their footing: fluency measured on goals nobody built on is an
            audit with no building under it, and fluency earned on goals never trained is a badge. All four verbs take
            the same preposition — build <b>on</b>, train <b>on</b>, earn <b>on</b>, measure <b>on</b> — so the name
            keeps that one word and lets you read whichever rung you are standing on.
          </p>
        </section>

        <section className="mt-7">
          <h2 className="cahier-section rounded-md px-3 py-1.5">References</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-6">
            {REFERENCES.map((r) => (
              <li key={r} className="text-xs leading-relaxed text-[color:var(--cahier-ink-soft)]">{r}</li>
            ))}
          </ol>
        </section>

        <p className="mt-6 text-sm font-bold text-[color:var(--cahier-ink)]">
          <Link href="/guide" className="underline">← Back to the Guide</Link>
          {" · "}
          <Link href="/" className="underline">Start here 🏠</Link>
        </p>
      </div>
    </CahierShell>
  );
}
