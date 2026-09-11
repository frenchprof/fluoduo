"use client";

/**
 * The lesson's own listening text — what runs inside the frame.
 *
 * THE DIFFERENCE FROM THE GENERAL PAGE IS THE PICKER, and that is the whole
 * point of the route. `/practice/ecoutexte` opens a dropdown over fifteen
 * scenarios and asks the learner to choose; arriving here they have already
 * chosen, by being on a lesson. `content/textgen/lessonScenario.ts` says which
 * of that unit's three texts belongs to this stop, and no header is passed, so
 * the dropdown is not drawn at all.
 *
 * A DECK WITH NO STOP KEEPS THE PICKER rather than opening on unité 0. Fifty
 * stops have a deck; the curated list is longer than that, and a deck outside
 * the course has no lesson to be the listening FOR.
 */
import { useState } from "react";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { TEXTGENS } from "@/content/textgen";
import { lessonListening } from "@/content/textgen/lessonScenario";
import { UNIT_META } from "@/content/sios";
import { stopForDeck } from "@/lib/stopTag";
import EcouTexte from "../EcouTexte";

export default function LessonListening({ collectionId }: { collectionId: string }) {
  const stop = stopForDeck(collectionId);
  const pick = stop ? lessonListening(stop.id) : null;
  // The unit the lesson sits in; its generator writes the three scenarios the
  // table above chooses between.
  const gen = TEXTGENS.find((g) => g.unit === (pick?.unit ?? -1)) ?? TEXTGENS[0];
  /* NO HEX FALLBACK HERE. The general page carries one because it is older
     than the rule; `UNIT_ACCENTS` covers units 0 to 4 and `gen.unit` can only
     be one of those (it comes from a stop, and every stop has a unit), so the
     fallback would be unreachable as well as a raw colour — verify19b counts
     both. */
  const accent = UNIT_ACCENTS[gen.unit];
  // A run is a run: the heard-log, the blanks and the marks belong to the text
  // drawn for this lesson, so the key is the lesson rather than a dropdown.
  const [run] = useState(() => `${collectionId}:${pick?.scenario ?? ""}`);

  const note = pick ? (
    <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
      {UNIT_META[gen.unit]?.label ?? `Unité ${gen.unit}`}
    </p>
  ) : undefined;

  return (
    <EcouTexte
      key={run}
      gen={gen}
      accent={accent}
      scenarioId={pick?.scenario}
      header={note}
      deck={collectionId}
      shell
    />
  );
}
