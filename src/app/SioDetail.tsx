"use client";

/**
 * The body of a SIO popup: the can-do statement. That is the whole of it.
 *
 * Dan, 2026-07-01: "STICK TO THE ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no
 * "Statement of SIO" / "Measurable Language Competency" headers, one merged
 * sentence via sioStatement(). Then 2026-08-31: "collapse the interfaces to
 * ONLY reveal the SIO spelled out fully, then the links to the relevant items
 * within the stop. THAT IS IT."
 *
 * THE ATELIERS ESCAPED THAT COLLAPSE (#99), and this closes it. The collapse
 * emptied three of this file's four branches; the fourth fired only when
 * `sio.isProduction`, so the six atelier stops kept printing their whole model
 * dialogue — six to ten lines of French and English, with play buttons — above
 * the link list. Nobody saw it because no other stop takes that branch.
 *
 * That is not just duplication. THE MODEL DIALOGUE IS THE PRE-TEST'S ANSWER
 * KEY. An atelier pre-test asks "which French line says « The flag has two
 * colours: red and white »?" and offers four lines OF THAT DIALOGUE
 * (content/pretests/ateliers.gen.ts) — all of which were printed on screen,
 * immediately above the button that starts it. A cold guess was impossible to
 * make, so the one thing the pre-test measures could not be measured.
 *
 * The dialogue is not lost and does not need a new page: it is the atelier
 * deck's Mémo — « Le modèle », built from the same ATELIER_DIALOGUES so it
 * cannot drift (content/memos.tsx) — which is link ② in the very list this
 * body sits above. Read it when you choose to, not before the guess.
 *
 * Dan, 2026-08-31: "i would rather the SIO and the items (however few) not be
 * lumped into the same space anymore."
 */
import { useEffect, useState } from "react";
import { sioStatement, type Sio } from "@/content/sios";
import { missesForSio, PRETEST_RECORD_EVENT } from "@/lib/pretestRecord";

export default function SioDetail({ sio }: { sio: Sio }) {
  return (
    <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
      <span className="fluo-hl">{sioStatement(sio)}</span>
    </p>
  );
}

/* AfterPretest is gone with the chips it gated. It hid the lesson buttons
 * until the popup's inline pre-test fired `fluolingo:pretest-complete`, so a
 * learner could not be tempted away mid-guess (Dan, 2026-07-05: pre-test
 * first, lesson after). Neither the inline pre-test nor the chips render here
 * any more — the rule it enforced is now structural rather than conditional:
 * the popup shows no lesson at all, only a link to one. PretestQuiz still
 * fires the event; the pre-test PAGE is what listens.
 */

/** The learner's gap report (PRIME "bring to class"): items whose LAST attempt
 *  was wrong. Reads localStorage on mount (so a reopened popup shows the
 *  latest attempt) and refreshes on every recorded answer while mounted. */
export function BringToClass({ sioId }: { sioId: string }) {
  const [misses, setMisses] = useState<ReturnType<typeof missesForSio>>([]);
  useEffect(() => {
    const read = () => setMisses(missesForSio(sioId));
    read();
    window.addEventListener(PRETEST_RECORD_EVENT, read);
    return () => window.removeEventListener(PRETEST_RECORD_EVENT, read);
  }, [sioId]);

  if (misses.length === 0) return null;
  const shown = misses.slice(0, 6);
  const extra = misses.length - shown.length;
  return (
    <div className="rounded-xl border-2 p-3" style={{ borderColor: "#e8a13a" }}>
      <p className="fluo-label mb-2" style={{ color: "#b06e10" }}>📝 Bring to class</p>
      <ul className="space-y-1">
        {shown.map((m) => (
          <li key={m.itemId} className="text-xs leading-snug text-[color:var(--fluo-ink)]">
            <span lang="fr">{m.stem}</span>
            <span aria-hidden> → </span>
            <span lang="fr" className="font-bold">{m.answer}</span>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <p className="mt-1 text-[0.65rem] font-bold text-[color:var(--fluo-ink-soft)]">
          +{extra} more
        </p>
      )}
    </div>
  );
}

/* PracticeChips is gone with the "Post-Class Practice" tile it filled. It
 * derived its chips from deckActivityTabs so they could not drift from the
 * popup's own links — which is the same list the popup now draws directly, one
 * copy instead of two. Deriving both from one source was the right fix for
 * 2026-08-02; showing one of them is the right fix for the collapse.
 */
