"use client";

/**
 * /gcompris/embed — the shelf of texts, running inside the cahier.
 *
 * `/gcompris` is the page a learner opens; this is what runs in the frame it
 * holds, as every station has since 2026-09-07.
 *
 * TEN ROWS, EACH FOLDED (Dan, 2026-09-15: *"collapse the texts within each
 * number"*). Ten tiles carrying a title, a description and a footer made a
 * shelf three screens long, and *"a page a learner has to scroll past the fold
 * has stopped showing them where they are"*.
 *
 * WHAT STAYS OPEN IS WHAT CHOOSES: the text's own name, its unit and how many
 * questions it asks — all three on the closed summary, because that is the
 * half of the rule people forget (*"a collapsed section with no count is a
 * section nobody opens"*). What folds is the sentence describing the
 * situation, which tells a learner what kind of document it is once they are
 * already interested.
 *
 * WHY A `<details>` AND NOT A LINK. A disclosure cannot live inside an `<a>`,
 * so the row is the fold and the door is a key INSIDE it. That costs a second
 * tap and buys the whole shelf on one screen; it also means the ▶ key is a
 * real control with a real hover, rather than a whole card being tappable.
 */

import Link from "next/link";

import CahierShell from "@/components/CahierShell";
import SectionBand from "@/components/SectionBand";
import { iconFor } from "@/content/activities";
import { GC_SCENES } from "@/content/gcompris";

const TABS = [{ key: "gcompris", ...iconFor("gcompris")! }];

export default function Page() {
  return (
    <CahierShell active="gcompris" tabs={TABS}>
      <div className="mx-auto w-full max-w-[46rem] px-4 pb-10">
        <SectionBand
          family="tools"
          label="READ IT, THEN ANSWER"
          pill={`${GC_SCENES.length} texts`}
        >
          <p className="mt-2 text-[calc(0.85rem+var(--fs-step)*0.85)] text-[color:var(--cahier-ink-soft)]">
            Ordinary things people write to each other — a note, a postcard, a voicemail.
            The text stays on screen while you answer.
          </p>

          {/* The grid counts the room: one column on a phone, two from `sm`.
              No row carries a width of its own (the no-hard-coded-control-
              size rule, 12 Sep). */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {GC_SCENES.map((s) => (
              <details key={s.id} className="gc-row">
                <summary>
                  <span className="gc-row-title" lang="fr">
                    {s.title}
                  </span>
                  <span className="gc-row-foot">
                    Unité {s.unit} · {s.questions.length} question
                    {s.questions.length === 1 ? "" : "s"}
                  </span>
                </summary>
                <p className="gc-row-setup">{s.setup}</p>
                <Link
                  href={`/gcompris/${s.id}`}
                  target="_top"
                  className="neo-key gc-row-go"
                  style={{
                    "--key-bg": "var(--fam-tools-wash)",
                    "--key-edge": "var(--fam-tools-ink)",
                  } as React.CSSProperties}
                >
                  ▶ Read it
                </Link>
              </details>
            ))}
          </div>
        </SectionBand>
      </div>
    </CahierShell>
  );
}
