/**
 * Native « Envies et besoins » lesson — SIO-039, written 2026-09-01.
 *
 * Item 4 of colour review's handover, and the last of the three ordinary stops.
 * `concept` is deliberately absent — that is the concepts lane's, and verify76
 * asserts the field stays empty so a stub of mine cannot read to a learner as
 * the real argument.
 *
 * THE SLUG IS `wants-needs`, NOT `envies-besoins`. envies-besoins.json declares
 * `lessonSlug: "wants-needs"`, and the deck's own declaration is the name to
 * use — the same reason atelier-rencontre took its slug from atelierDecks.ts.
 * The DECK is `envies-besoins`; the lesson is what the deck says it is.
 *
 * WHAT THE STOP TEACHES: which opener, not what is wanted. Every item's English
 * carries the deck's own nuance — « (polite request) », « (wish) », "I need",
 * "I want", "I feel like" — and every French sentence shows its opener already
 * attached, so the choice between the five is never put to a learner. The
 * competence names four of them; the deck teaches five, adding « j'ai envie
 * de ». The Mémo shows the five it has.
 *
 * TWO THINGS THE DECK'S OWN `gap` COLUMN CANNOT BE USED FOR DIRECTLY, both
 * worked out in wants-needs.gen.ts: the gap is the verb alone while the SUBJECT
 * changes with it (« Je voudrais » against « J'ai besoin »), and « de » elides
 * before a vowel in this deck and not before a consonant. Both are asserted
 * against envies-besoins.json rather than trusted.
 */
import type { NativeLesson } from "./types";
import { ITEMS, WANTS_AXES, sentenceOf, wantsQuestion, type Want } from "./wants-needs.gen";

/** The five, in the order the deck first uses them, with the nuance its own
 *  English glosses give each. Nothing here is a rule invented on top. */
const WANTS: { key: Want; gloss: string; tone: string }[] = [
  { key: "voudrais", gloss: "asking politely", tone: "var(--gram-masc)" },
  { key: "aimerais", gloss: "a wish", tone: "var(--gram-fem)" },
  { key: "besoin d'", gloss: "a need", tone: "var(--cahier-ink)" },
  { key: "veux", gloss: "a plain want", tone: "var(--gram-masc)" },
  { key: "envie", gloss: "a craving", tone: "var(--gram-fem)" },
];

/** A space after the opener unless it has elided — « J'ai besoin d'un hôtel »
 *  glues, « Je voudrais un café » does not. Same rule as cloze.ts's `sentence`. */
const gap = (opener: string) => (/['’]$/.test(opener) ? "" : " ");

export const wantsNeedsLesson: NativeLesson = {
  slug: "wants-needs",

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Envies et besoins
      </h2>

      <div className="space-y-1.5">
        {WANTS.map((w) => (
          <div key={w.key}>
            <p className="fluo-label mb-0.5" style={{ color: w.tone }}>
              {w.gloss}
            </p>
            {/* The OPENER is the hero and is bold on the line itself (Dan,
                31 Aug: "the forms themselves … are not salient enough"), and it
                is REPEATED only where it changes between the two examples.
                That is one rule, not a special case, and it does both jobs: the
                craving row prints « J'ai envie d'un chocolat chaud · J'ai envie
                de dormir » so the elision is visible in the forms rather than
                only asserted under them, while the four rows whose opener never
                moves print it once and save the panel a line each. */}
            <p className="text-[15px] leading-snug text-[color:var(--cahier-ink)]" lang="fr">
              {ITEMS.filter((it) => it.want === w.key).map((it, i, group) => {
                const shifts = group.some((o) => o.opener !== group[0].opener);
                return (
                  <span key={it.rest}>
                    {i > 0 ? <span className="text-[color:var(--fluo-ink-soft)]"> · </span> : null}
                    {i === 0 || shifts ? (
                      <>
                        <b style={{ color: w.tone }}>{it.opener}</b>
                        {gap(it.opener)}
                      </>
                    ) : null}
                    {it.rest.replace(/[.]$/, "")}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        {/* One line, not four. The contrast is already ON the craving row above —
            « J'ai envie d'un chocolat chaud · J'ai envie de dormir » — so the
            worked example here was text whose removal costs a learner nothing
            (Dan's litmus test), and it cost the panel its last 0.16 of a screen. */}
        ⚠️ <span lang="fr"><b>de</b></span> becomes <span lang="fr"><b>d&rsquo;</b></span> before a
        vowel. The other three never change.
      </p>
    </div>
  ),

  dice: {
    instruction: "Ask for it the way the English asks for it.",
    axes: WANTS_AXES,
    newQuestion: wantsQuestion,
  },

  bonus: ITEMS.map((it) => ({ en: it.en, fr: sentenceOf(it) })),
};
