"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import NumBourse from "@/games/numbourse/NumBourse";

/** NumBourse's landing — A FLOOR AND A CEILING (Dan, 2026-09-14: *"the same
 *  for NumBourse also ok : let user decide the floor and ceiling"*).
 *
 *  WHAT WENT: a table of eight level names — « 4 — up to 80, the soixante-dix
 *  zone » — that a learner had to read before playing and could not act on,
 *  since the game always started at level 1 regardless. It was prose about the
 *  levels, kept in step with the game's own LEVELS by hand.
 *
 *  THE LADDER ITSELF STAYS, because it is the CLOCK and not the range: each
 *  rung carries the seconds a learner gets to type, and six digits need longer
 *  than one. The rung is now picked FROM the ceiling — the first that covers
 *  it — while the value is drawn from the learner's own floor..ceiling. One
 *  setting, and the timing still fits the numbers it is timing.
 */
export default function NumBoursePage() {
  // A FLOOR AND A CEILING (Dan, 2026-09-14: *"let the user decide what is the
  // floor and the ceiling. no need so much PLEASE"*). The eight-level ladder
  // is still in the game and still runs the clock; it is simply no longer
  // something a learner has to read a table about before playing.
  const [floor, setFloor] = useState(0);
  const [ceiling, setCeiling] = useState(99);
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
          <NumBourse floor={floor} ceiling={ceiling} />
        </GameLanding>
      ) : (
        <GameLanding activityKey="numbourse" title="NumBourse">
          <p className="text-sm text-[color:var(--cahier-ink)]">
            Hear a price, type the digits, lock the trade before the ticket expires.
          </p>

          <div className="nb-scope">
            <span className="nb-scope-lab">from</span>
            <Well value={floor} onChange={setFloor} label="Lowest price" />
            <span className="nb-scope-lab">to</span>
            <Well value={ceiling} onChange={setCeiling} label="Highest price" />
            <span className="nb-scope-lab">€</span>
          </div>

          {/* NO CONTROL SPANS THE WIDTH (5 Sep). It was `w-full py-3`. */}
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setPlaying(true)} className="neo-key nb-start">
              ▶ Jouer
            </button>
          </div>
        </GameLanding>
      )}
    </AuthGate>
  );
}

/** Same well as NumBus's, and deliberately so: two games asking one question
 *  should not ask it in two shapes. Six digits, because NumBourse's ladder
 *  reaches 999 999 where NumBus stops at 99. */
function Well({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const MAX = 999999;
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft ?? String(value)}
      aria-label={label}
      onChange={(e) => {
        const text = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
        setDraft(text);
        const n = parseInt(text, 10);
        if (Number.isFinite(n) && n <= MAX) onChange(n);
      }}
      onBlur={(e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n)) onChange(Math.max(0, Math.min(MAX, n)));
        setDraft(null);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="neo-well nb-well nb-well-wide"
    />
  );
}
