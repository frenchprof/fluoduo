"use client";

/**
 * The page body for a Unit-0 pre-test.
 *
 * Deliberately thin. The questions, the picker and the recording all live in
 * `components/Unit0Pretest`, which the SIO popup mounts too — so the two can
 * never answer the same question differently.
 *
 * WHAT THE PAGE ADDS that the popup could not: the can-do statement stands at
 * the top as the heading rather than as a paragraph competing with a numbered
 * path, and "Bring to class" sits under the questions where a learner who has
 * just finished will look for it.
 *
 * WHAT IT DELIBERATELY OMITS: the model dialogue, the lesson buttons, the
 * activity list. A pre-test is a COLD guess — anything that answers the
 * questions must not be on the page while they are unanswered, and on SIO-010
 * the dialogue IS the answer key. The way onward is the site bar and the map;
 * `AfterPretest` already gates the lesson chips in the popup, and this page
 * has no business offering them before the attempt.
 */
import CahierShell from "@/components/CahierShell";
import SectionBand from "@/components/SectionBand";
import { siteTabs } from "@/components/siteTabs";
import { Sio010Pretest, Unit0Questions } from "@/components/Unit0Pretest";
import { BringToClass } from "@/app/SioDetail";
import { getSio, sioStatement } from "@/content/sios";
import { SIO010_SITUATIONS, UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";

export default function Unit0PretestPage({ sioId }: { sioId: string }) {
  const sio = getSio(sioId);
  if (!sio) return null;
  // SIO-010's bank is all three audiences flattened (21), but a learner sits
  // ONE audience's seven — the picker scopes the run. Printing 21 would promise
  // three times the work they are about to do.
  const count = sioId === "SIO-010"
    ? SIO010_SITUATIONS[0].questions.length
    : (UNIT0_QUESTIONS[sioId] ?? []).length;

  return (
    <CahierShell tabs={siteTabs()} active="pretest" band={false}>
      <SectionBand family="goals" label={`🧪 ${sio.topic}`} pill={sio.id.slice(4)}>
        {/* The can-do gets the popup's own treatment — a highlighted serif
            line — not SectionBand's `gloss`, which renders inline in
            parentheses at 60% opacity and is built for a short phrase. These
            statements run to forty words; as a gloss the heading became one
            unreadable grey parenthetical. */}
        <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
          <span className="fluo-hl">{sioStatement(sio)}</span>
        </p>
        {/* SIO-010 picks its audience first: "how do you ask their name" has no
            answer until you know whether you face a student, a client or a
            group, so one shuffled pool of all 21 would be unanswerable. */}
        {sioId === "SIO-010" ? <Sio010Pretest sio={sio} /> : <Unit0Questions sio={sio} />}

        <div className="mt-4">
          <BringToClass sioId={sioId} />
        </div>

        <p className="mt-6 text-center text-xs font-bold text-[color:var(--fluo-ink-soft)]">
          {count} question{count === 1 ? "" : "s"}
          {sioId === "SIO-010" ? " per situation" : ""} · a guess before the lesson is the
          point — nothing here is scored.
        </p>
      </SectionBand>
    </CahierShell>
  );
}
