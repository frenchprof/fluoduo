"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import NumBourse from "@/games/numbourse/NumBourse";

/** The eight-level ladder (Dan, 2026-07-28), named here rather than met blind
 *  on the trading floor. Mirrors the table in NumBourse.tsx; if that ladder
 *  changes, this list is the other half to change — it is prose about the
 *  levels, not a second source of them (the game reads its own LEVELS). */
const LADDER = [
  "1 — single digits", "2 — up to 20", "3 — up to 69",
  "4 — up to 80, the soixante-dix zone", "5 — up to 99, quatre-vingt-dix",
  "6 — up to 999", "7 — up to 99 999", "8 — up to 999 999",
];

export default function NumBoursePage() {
  const [playing, setPlaying] = useState(false);

  // NumBourse had NO landing at all — the flap dropped you straight onto the
  // trading floor (Dan, 2026-08-29: there should be "a landing page before the
  // game begins"). It has no sets to choose and no settings to set, so what
  // this page owes the learner is what they are about to be asked to do, and
  // a deliberate start.
  return (
    <AuthGate what="play">
      {playing ? (
        // The same shell the landing below already uses, so the band and the
        // spine stay put while you play; ⛶ on the game bar takes it full.
        <GameLanding activityKey="numbourse" title="NumBourse" bleed>
          <NumBourse />
        </GameLanding>
      ) : (
        <GameLanding activityKey="numbourse" title="NumBourse">
          <p className="text-sm text-[color:var(--cahier-ink)]">
            Hear a price, type the digits, lock the trade before the ticket expires.
            Eight levels, each widening the range of numbers:
          </p>
          <ol className="mt-3 grid gap-1.5 text-[13px] text-[color:var(--cahier-ink)] sm:grid-cols-2">
            {LADDER.map((l) => (
              <li key={l} className="rounded-lg border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] px-2.5 py-1.5">
                {l}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="fluo-btn mt-5 w-full py-3 text-lg font-black"
          >
            ▶ Jouer
          </button>
        </GameLanding>
      )}
    </AuthGate>
  );
}
