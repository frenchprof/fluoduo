"use client";

/**
 * ÉcouTexte — generated mini-texts to listen to, one generator per unité.
 * The page is a unit picker over src/content/textgen; the player below it
 * owns everything else (see EcouTexte.tsx).
 *
 * Why generated and not authored: a listening scaffold is only a scaffold if
 * the learner has not met the text before, and an authored bank runs out on
 * the second sitting. Every text here is built from the unit's own vocabulary
 * and grammar, and no sentence is ever played twice.
 */

import { useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, toolTabs, tabsWithActive, UNIT_ACCENTS } from "@/components/siteTabs";
import { TEXTGENS } from "@/content/textgen";
import { UNIT_META } from "@/content/sios";
import EcouTexte from "./EcouTexte";

export default function EcouTextePage() {
  const [unit, setUnit] = useState(TEXTGENS[0].unit);
  const gen = TEXTGENS.find((g) => g.unit === unit) ?? TEXTGENS[0];
  const accent = UNIT_ACCENTS[gen.unit] ?? "#8a5fd4";

  return (
    <CahierShell
      tabs={tabsWithActive([...siteTabs(), ...toolTabs()], "ecoutexte")}
      active="ecoutexte"
    >
      <div className="mx-auto max-w-2xl px-1 py-2">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TEXTGENS.map((g) => {
            const on = g.unit === unit;
            const hue = UNIT_ACCENTS[g.unit] ?? "#8a5fd4";
            return (
              <button
                key={g.unit}
                type="button"
                onClick={() => setUnit(g.unit)}
                aria-pressed={on}
                className={`fluo-btn fluo-btn-sm ${on ? "" : "fluo-btn-ghost"}`}
                style={on ? { background: hue, color: "#fff", boxShadow: `0 4px 0 0 ${hue}99` } : undefined}
              >
                <span lang="fr">
                  {UNIT_META[g.unit]?.emoji} {g.title}
                </span>
              </button>
            );
          })}
        </div>

        <EcouTexte key={gen.unit} gen={gen} accent={accent} />
      </div>
    </CahierShell>
  );
}
