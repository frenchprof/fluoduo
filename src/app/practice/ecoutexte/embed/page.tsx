"use client";

/**
 * /practice/ecoutexte/embed — ÉcouTexte, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/practice/ecoutexte` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
/**
 * ÉcouTexte — generated mini-texts to listen to. The page is the TOPIC picker
 * over src/content/textgen; the player below it owns everything else (see
 * EcouTexte.tsx). Full-screen in DrillShell (patch 20–21): the picker rides
 * the shell body as the player's header.
 *
 * Why generated and not authored: a listening scaffold is only a scaffold if
 * the learner has not met the text before, and an authored bank runs out on
 * the second sitting. Every text here is built from the unit's own vocabulary
 * and grammar, and no sentence is ever played twice.
 *
 * ── The picker (Dan, 22 Aug) ──────────────────────────────────────────────
 * It was two unit chips; Dan: "surely there will be more topics than just
 * Around town and Eating Out, so have it in a dropdown instead, and have more
 * topics, each identified with a particular unit". So: one dropdown, grouped
 * by unit, one entry per SITUATION.
 *
 * A topic is a SCENARIO, not a unit — each generator writes three (unité 3:
 * an itinerary, a place you know, a trip; unité 4: your meals, the shopping,
 * the restaurant), and `generateUnheard` now takes the id, so picking
 * "Directions" really does give you an itinerary and never a menu.
 *
 * Units 1 and 2 have no generator yet (src/content/textgen has unit3 and
 * unit4). Their situations are LISTED AND DISABLED rather than hidden: the
 * course is bigger than what is written, the dropdown says so honestly, and
 * the gap is visible work rather than a silent omission. Adding unité 2 is
 * one generator plus three ids here.
 */

import { useState } from "react";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { TEXTGENS } from "@/content/textgen";
import { UNIT_META } from "@/content/sios";
import EcouTexte from "../EcouTexte";

/** One entry per situation. `scenario` empty = no generator written yet. */
const TOPICS: { unit: number; topics: { scenario: string; label: string }[] }[] = [
  // Units 0-2 generators authored 2026-08-23 (content-gap wave, checked
  // against the Atelier unit PDFs) — the "coming soon" placeholders are gone.
  {
    unit: 0,
    topics: [
      { scenario: "la-rencontre", label: "Meeting someone" },
      { scenario: "le-premier-cours", label: "First class" },
      { scenario: "qui-est-ce", label: "Who is it?" },
    ],
  },
  {
    unit: 1,
    topics: [
      { scenario: "cest-qui", label: "Who is that?" },
      { scenario: "le-camarade", label: "A classmate" },
      { scenario: "ma-presentation", label: "Introducing yourself" },
    ],
  },
  {
    unit: 2,
    topics: [
      { scenario: "mes-loisirs", label: "What you like" },
      { scenario: "le-week-end", label: "The weekend" },
      { scenario: "l-invitation", label: "Inviting a friend" },
    ],
  },
  {
    unit: 3,
    topics: [
      { scenario: "itineraire", label: "Directions" },
      { scenario: "mon-lieu", label: "About a town" },
      { scenario: "le-voyage", label: "Travel" },
    ],
  },
  {
    unit: 4,
    topics: [
      { scenario: "mes-repas", label: "Meals" },
      { scenario: "les-courses", label: "Shopping" },
      { scenario: "au-restaurant", label: "Eating out" },
    ],
  },
];

const value = (unit: number, scenario: string) => `${unit}:${scenario}`;

export default function EcouTextePage() {
  const [pick, setPick] = useState(() => value(3, "itineraire"));
  const [unitRaw, scenarioId] = pick.split(":");
  const unit = Number(unitRaw);
  const gen = TEXTGENS.find((g) => g.unit === unit) ?? TEXTGENS[0];
  const accent = UNIT_ACCENTS[gen.unit] ?? "#8a5fd4";

  const picker = (
    <label className="flex flex-col gap-1">
      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
        Topic
      </span>
      <select
        value={pick}
        onChange={(e) => setPick(e.target.value)}
        aria-label="Topic"
        className="h-10 w-full max-w-[20rem] rounded-xl border-2 px-2 text-sm font-bold"
        style={{ borderColor: "var(--cahier-rule)", background: "var(--cahier-paper)", color: "var(--cahier-ink)" }}
      >
        {TOPICS.map((g) => (
          <optgroup key={g.unit} label={`${UNIT_META[g.unit]?.emoji ?? ""} ${UNIT_META[g.unit]?.label ?? `Unité ${g.unit}`}`}>
            {g.topics.map((t) => (
              <option key={t.label} value={value(g.unit, t.scenario)} disabled={!t.scenario}>
                {t.label}
                {t.scenario ? "" : " — coming soon"}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );

  // Remount on topic change: a new scenario is a new text, and the heard-log,
  // the blanks and the marks all belong to the text that was drawn.
  return <EcouTexte key={pick} gen={gen} accent={accent} scenarioId={scenarioId || undefined} header={picker} shell />;
}
