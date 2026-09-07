"use client";

/**
 * The « ? » beside the stat pills (Dan, 2026-07-08: "we need a question mark
 * at certain places, e.g. where the fires, gems etc. appear to help user
 * understand what it means"). Tap → a small popover naming each icon.
 */
import { useState } from "react";
import { FIRE_LADDER } from "@/lib/economy";

export default function StatsHelp() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="What do these icons mean?"
        aria-expanded={open}
        title="What do these icons mean?"
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[color:var(--fluo-ink,#222850)]/50 bg-white/80 text-xs font-black text-[color:var(--fluo-ink,#222850)]/80 transition hover:border-[color:var(--fluo-ink,#222850)]"
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-1/2 top-full z-50 mt-1.5 w-72 max-w-[88vw] -translate-x-1/2 rounded-2xl border-2 border-[color:var(--fluo-ink,#222850)] bg-white p-3 text-left shadow-xl">
            {/* IN THE HOUSE HAND (Dan, 7 Sep: "The content of ? NEEDS TO BE
                WRITTEN IN FLUOLINGO FONT PLEASE") — card-hand is the app's
                FluOLinGo Hand class; a step up in size because the hand face
                runs narrower than the body face at the same box. The fire
                line renders FROM the ladder itself so this card can never
                teach rungs the economy stopped paying (it still said "≥ 7 →
                ×2" a day after day 14 and day 30 shipped). */}
            <ul className="card-hand space-y-1.5 text-sm text-[color:var(--fluo-ink,#222850)]">
              <li>🎚️ Level — rises with your ⭐ XP.</li>
              <li>✓ — objectives marked « done », out of 50.</li>
              <li>🔥 — days in a row; {FIRE_LADDER.map((r) => `day ${r.day} pays ×${String(r.mult).replace(".", ",")}`).join(" · ")}.</li>
              <li>⭐ XP — earned on every answer;<br />ranks the 🏆 Leaderboard.</li>
              <li>💎 Gemmes — paid out by 🎖️ badges;<br />spend them in the Shop.</li>
            </ul>
          </div>
        </>
      )}
    </span>
  );
}
