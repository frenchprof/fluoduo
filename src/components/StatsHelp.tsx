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
        aria-label="Que signifient ces icônes ?"
        aria-expanded={open}
        title="Que signifient ces icônes ?"
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[color:var(--fluo-ink,#222850)]/50 bg-white/80 text-xs font-black text-[color:var(--fluo-ink,#222850)]/80 transition hover:border-[color:var(--fluo-ink,#222850)]"
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-1/2 top-full z-50 mt-1.5 w-72 max-w-[88vw] -translate-x-1/2 rounded-2xl border-2 border-[color:var(--fluo-ink,#222850)] bg-white p-3 text-left shadow-xl">
            <ul className="space-y-1.5 text-xs font-bold text-[color:var(--fluo-ink,#222850)]">
              <li>🎚️ Niveau — monte avec vos ⭐ XP.</li>
              <li>✓ — objectives marked « done », out of 50.</li>
              <li>🔥 — days in a row; ≥ 3 days → XP ×1.5, ≥ 7 → ×2.</li>
              <li>⭐ XP — earned on every answer;<br />ranks the 🏆 Classement.</li>
              <li>💎 Gemmes — paid out by 🎖️ badges;<br />spend them in the Boutique.</li>
            </ul>
          </div>
        </>
      )}
    </span>
  );
}
