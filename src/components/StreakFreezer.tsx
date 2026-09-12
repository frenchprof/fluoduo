"use client";

/**
 * THE STREAK-FREEZER — bought in advance, spent silently, celebrated the
 * morning after.
 *
 * Named « Bouclier » until 2026-09-12, when Dan moved it here from the
 * profile's reward shelf and renamed it: *"we should call it streak-freezer
 * instead of bouclier (better contrast between fire and ice)"*. The streak
 * itself is 🔥 everywhere in the app; a shield had no quarrel with fire, and
 * ice does. So ❄️, and a name that says what it does to the thing it protects.
 *
 * (❄️ appears in `weather-letris.json`, but as a VOCABULARY CARD — « la
 * neige ». The one-glyph-one-meaning rule of 2026-09-09 is about the app's own
 * icons and doors, not about what a French deck teaches.)
 *
 * It lives in Settings because it is a thing you arrange in advance, like the
 * accent colour that moved here the same day — not an achievement. The copy
 * still never says what a missed day costs (Dan, 7 Sep): it is protection
 * bought on a good day, not a threat sold on a bad one.
 *
 * The gem balance is drawn once by `GemShelf`, above this and the colours —
 * see the note in AccentColours.tsx.
 */
import { SHIELD_COST, SHIELD_MAX } from "@/lib/economy";
import { buyShield, type Progress } from "@/lib/progress";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function StreakFreezer({ p, onChange }: { p: Progress; onChange: (p: Progress) => void }) {
  const held = p.shields ?? 0;
  const full = held >= SHIELD_MAX;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Content-sized, not the page's width — the standing rule. */}
      <button
        type="button"
        disabled={full || p.gems < SHIELD_COST}
        onClick={() => onChange(buyShield())}
        title={full
          ? `Streak-Freezer — holding ${held}/${SHIELD_MAX}, the pouch is full`
          : `Streak-Freezer — 💎 ${SHIELD_COST}. Held in advance; one missed day spends it and the chain holds`}
        className="flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-left text-[12px] font-bold disabled:opacity-55"
        style={{ borderColor: LINE, background: PAPER, color: INK }}
      >
        <span>❄️ Streak-Freezer {held > 0 && <b>×{held}</b>}</span>
        <span className="fluo-mono text-[11px]" style={{ color: SOFT }}>
          {full ? "✓ full" : `💎${SHIELD_COST}`}
        </span>
      </button>
    </div>
  );
}
