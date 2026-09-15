"use client";

/**
 * /gcompris/embed — the shelf of texts, running inside the cahier.
 *
 * `/gcompris` is the page a learner opens; this is what runs in the frame it
 * holds, as every station has since 2026-09-07.
 *
 * TEN TILES AND NO FOLD. The collapse rule folds APPARATUS — a pitfall table,
 * a word list, a self-check — and this page is nothing but its own content: a
 * shelf with one tile per text. Folding the only thing on the page is the
 * *"deletion with extra steps"* the same rule warns against. What IS on each
 * tile is the count that earns its place: « 5 questions », because a learner
 * cannot see them from here.
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
              No tile carries a width of its own (the no-hard-coded-control-
              size rule, 12 Sep). */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GC_SCENES.map((s) => (
              <Link key={s.id} href={`/gcompris/${s.id}`} className="neo-key gc-tile">
                <span className="gc-tile-title" lang="fr">
                  {s.title}
                </span>
                <span className="gc-tile-setup">{s.setup}</span>
                <span className="gc-tile-foot">
                  <span>Unité {s.unit}</span>
                  <span>
                    {s.questions.length} question{s.questions.length === 1 ? "" : "s"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </SectionBand>
      </div>
    </CahierShell>
  );
}
