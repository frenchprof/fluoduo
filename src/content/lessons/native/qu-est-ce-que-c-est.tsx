/** « Qu'est-ce que c'est ? » — SIO-021's lesson (2026-08-29).
 *  The deck already answers; this teaches the asking — and, on Dan's word the
 *  same day, the pronoun that refers back to what was named: il / elle / ils /
 *  elles, on his four examples (sac, gomme, ciseaux, lunettes). */
import type { NativeLesson } from "./types";
import { QQC_AXES, quEstCeQuestion } from "./qu-est-ce-que-c-est.gen";

export const quEstCeLesson: NativeLesson = {
  slug: "qu-est-ce-que-c-est",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Qu&rsquo;est-ce que c&rsquo;est&nbsp;?
      </h2>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — C&rsquo;est un stylo.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — C&rsquo;est qui&nbsp;? — C&rsquo;est le professeur.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — <b>Ce sont</b> des ciseaux.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ One thing&nbsp;: <span lang="fr">c&rsquo;est</span>. Several&nbsp;:{" "}
        <span lang="fr">ce sont</span> — never <span lang="fr"><s>c&rsquo;est des</s></span>.
      </p>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">
          et après&nbsp;: il · elle · ils · elles
        </p>
        <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
          <tbody>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">C&rsquo;est <b>un</b> sac.</td>
              <td className="p-1 font-black">→ <b>Il</b> est là.</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">C&rsquo;est <b>une</b> gomme.</td>
              <td className="p-1 font-black">→ <b>Elle</b> est là.</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">Ce sont <b>des</b> ciseaux.</td>
              <td className="p-1 font-black">→ <b>Ils</b> sont là.</td>
            </tr>
            <tr>
              <td className="p-1">Ce sont <b>des</b> lunettes.</td>
              <td className="p-1 font-black">→ <b>Elles</b> sont là.</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          English has <i>it</i> and <i>they</i> for all four. French picks by
          gender and number — and the verb moves with it,{" "}
          <b lang="fr">est</b> → <b lang="fr">sont</b>.
        </p>
      </div>
    </div>
  ),
  dice: { instruction: "Ask, and answer.", axes: QQC_AXES, newQuestion: quEstCeQuestion },
  bonus: [
    { en: "What is it? — It's a bag.", fr: "Qu'est-ce que c'est ? — C'est un sac." },
    { en: "What is it? — It's a rubber.", fr: "Qu'est-ce que c'est ? — C'est une gomme." },
    { en: "Who is it? — It's the teacher.", fr: "C'est qui ? — C'est le professeur." },
    { en: "They're scissors.", fr: "Ce sont des ciseaux." },
    { en: "It's a bag. — It's over there.", fr: "C'est un sac. — Il est là." },
    { en: "It's a rubber. — It's over there.", fr: "C'est une gomme. — Elle est là." },
    { en: "They're scissors. — They're over there.", fr: "Ce sont des ciseaux. — Ils sont là." },
    { en: "They're glasses. — They're over there.", fr: "Ce sont des lunettes. — Elles sont là." },
  ],
};
