"use client";

/**
 * THE ACCENT COLOURS — the gem shop's colours, living in Settings.
 *
 * Dan, 2026-09-12: *"As for the 'payable' colors, move them into Settings
 * instead"*, said in the same breath as stripping THRILLS back to what a
 * learner has actually achieved. A colour you have not bought is not an
 * achievement, and a colour you have is a PREFERENCE — which is what Settings
 * is for. The badges stay on the profile; the paint moves here.
 *
 * IT DOES NOT DRAW THE GEM BALANCE. `GemShelf` does, once, above both this
 * and the Streak-Freezer — the first build printed « 💎 340 » twice, forty
 * pixels apart, which is the litmus test's own example of text you can delete
 * without anyone losing their way. `GemShelf` owns the progress state so one
 * balance still moves the moment either of them is spent.
 */
import { COSMETICS, DEFAULT_ACCENT } from "@/lib/economy";
import { buyCosmetic, equipCosmetic, type Progress } from "@/lib/progress";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function AccentColours({ p, onChange }: { p: Progress; onChange: (p: Progress) => void }) {
  const equipped = p.cosmetics.equipped.homeAccent ?? null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <SwatchButton
        swatch={DEFAULT_ACCENT}
        label="Default"
        state={equipped === null ? "equipped" : "owned"}
        onClick={() => onChange(equipCosmetic(null))}
      />
      {COSMETICS.map((c) => {
        const owned = p.cosmetics.owned.includes(c.id);
        const state = equipped === c.id ? "equipped" : owned ? "owned" : p.gems >= c.cost ? "buyable" : "locked";
        return (
          <SwatchButton
            key={c.id}
            swatch={c.swatch}
            label={c.label}
            cost={owned ? undefined : c.cost}
            state={state}
            onClick={() => onChange(owned ? equipCosmetic(c.id) : buyCosmetic(c.id))}
          />
        );
      })}
    </div>
  );
}

function SwatchButton({
  swatch, label, cost, state, onClick,
}: {
  swatch: string;
  label: string;
  cost?: number;
  state: "equipped" | "owned" | "buyable" | "locked";
  onClick: () => void;
}) {
  const title = state === "equipped" ? `${label} — equipped`
    : state === "locked" ? `${label} — 💎 ${cost}, not enough gems`
    : state === "buyable" ? `${label} — buy for 💎 ${cost}`
    : `${label} — equip`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "locked" || state === "equipped"}
      aria-label={title}
      title={title}
      /* `.fluo-tap` — the 44px touch FLOOR, ported here from the subdomains
         lane's edit to the copy of this button that used to live in
         Rewards.tsx. A floor is not a size: it must not grow with the
         ramp, because a finger does not. This was min-h-[40px], under the
         floor it should have been on. */
      className="flex fluo-tap items-center gap-1.5 rounded-md border-2 px-2 py-1 disabled:cursor-default"
      style={{
        borderColor: state === "equipped" ? INK : LINE,
        background: PAPER,
        opacity: state === "locked" ? 0.45 : 1,
      }}
    >
      <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border-2" style={{ background: swatch, borderColor: INK }} />
      {cost !== undefined && <span className="fluo-mono text-[10px] font-bold" style={{ color: SOFT }}>💎{cost}</span>}
      {state === "equipped" && <span aria-hidden className="fluo-mono text-[10px] font-black" style={{ color: INK }}>✓</span>}
    </button>
  );
}
