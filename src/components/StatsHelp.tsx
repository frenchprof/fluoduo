"use client";

/**
 * The « ? » beside the stat pills (Dan, 2026-07-08: "we need a question mark
 * at certain places, e.g. where the fires, gems etc. appear to help user
 * understand what it means"). Tap → a small popover naming each icon.
 */
import { useState } from "react";

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
          {/* NO BORDERS, A COLUMN OF ICONS, THE SHORTEST PHRASE (Dan, 7 Sep:
              "WHY DO WE NEED THE BORDERS AND CAN'T WE JUST HAVE A COLUMN OF
              ICONS AND THEN ROWS OF SUPER CONCISE MEANING"). The sheet floats
              on its shadow alone; each row is icon | meaning, litmus-trimmed. */}
          <div className="absolute left-1/2 top-full z-50 mt-1.5 w-64 max-w-[88vw] -translate-x-1/2 rounded-2xl bg-white p-3 text-left shadow-xl">
            {/* In the house hand (Dan: "The content of ? NEEDS TO BE WRITTEN
                IN FLUOLINGO FONT PLEASE"), one line per icon — nothing wraps
                below (Dan: "WE DON'T NEED THOSE WORDS BELOW THE ICONS"). */}
            <div className="card-hand grid grid-cols-[auto_1fr] items-baseline gap-x-2.5 gap-y-1 text-sm text-[color:var(--fluo-ink,#222850)]">
              <span aria-hidden>🎚️</span><span>rises with ⭐</span>
              <span aria-hidden>✓</span><span>goals done</span>
              <span aria-hidden>🔥</span><span>days in a row</span>
              <span aria-hidden>⭐</span><span>earned every answer</span>
              <span aria-hidden>💎</span><span>spend in the Shop</span>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
