"use client";

/**
 * Playground for CyclingRevealAcronym.
 *
 * Three presets with nothing in common — different copy, different letter
 * counts, different type, different colours, different timing — because the
 * only claim worth demonstrating is that the component carries none of that
 * itself. The sliders drive the same props a caller would pass.
 *
 * The preset palettes are written out as literal oklch: they are stand-ins for
 * whatever a host page's colours happen to be, which is the point, so they must
 * NOT read the Cahier tokens. The playground's own chrome does, like every
 * other surface here.
 */

import { useRef, useState } from "react";
import CyclingRevealAcronym, {
  type CyclingRevealHandle,
  type CyclingPhase,
  type CyclingSlot,
  type CyclingTiming,
} from "@/components/CyclingRevealAcronym";

type Preset = {
  id: string;
  name: string;
  template: string;
  slots: CyclingSlot[];
  separator: string;
  scale: number;
  /** Everything visual lives out here, in the caller. */
  paper: string;
  ink: string;
  type: string;
  timing: Partial<CyclingTiming>;
};

const PRESETS: Preset[] = [
  {
    id: "fluo",
    name: "FLUO",
    template: "{} {} {} {}",
    slots: [
      { words: ["Fast", "Fearless", "Faithful", "Fluent"] },
      { words: ["Listening", "Lessons", "Learners"] },
      { words: ["Unlock", "Uncover", "Understand"] },
      { words: ["Others", "Opinions", "Ordinary"] },
    ],
    separator: "",
    scale: 1.9,
    paper: "oklch(19% 0.017 250)",
    ink: "oklch(96% 0.012 85)",
    type: "font-black tracking-tight text-[clamp(22px,5.4vw,44px)]",
    timing: {},
  },
  {
    id: "scuba",
    name: "SCUBA",
    template: "{} {} {} {} {}",
    slots: [
      { words: ["Simple", "Sealed", "Self"] },
      { words: ["Cooled", "Compact", "Contained"] },
      { words: ["Undersea", "Universal", "Underwater"] },
      { words: ["Buoyancy", "Breathable", "Breathing"] },
      { words: ["Assembly", "Aid", "Apparatus"] },
    ],
    separator: "",
    scale: 1.6,
    paper: "oklch(95% 0.025 215)",
    ink: "oklch(43% 0.075 215)",
    type: "font-semibold tracking-tight text-[clamp(18px,4.2vw,34px)]",
    timing: { cycleMs: 62, staggerMs: 180, settleHoldMs: 1500, collapseMs: 1000 },
  },
  {
    id: "asap",
    name: "A.S.A.P.",
    template: "get it done {} {} {} {}",
    slots: [
      { words: ["All", "Almost", "As"] },
      { words: ["Slowly", "Surely", "Soon"] },
      { words: ["Anyone", "Anybody", "As"] },
      { words: ["Practical", "Painless", "Possible"] },
    ],
    separator: ".",
    scale: 1.7,
    paper: "oklch(96.5% 0.04 88)",
    ink: "oklch(46% 0.1 70)",
    type: "font-serif italic text-[clamp(18px,4.4vw,34px)]",
    timing: { cycleMs: 110, finalCycleMs: 520, staggerMs: 320, spins: 2 },
  },
];

const SLIDERS: { key: keyof CyclingTiming; label: string; min: number; max: number; step: number }[] = [
  { key: "cycleMs", label: "cycle", min: 30, max: 260, step: 5 },
  { key: "staggerMs", label: "stagger", min: 0, max: 700, step: 20 },
  { key: "settleHoldMs", label: "settled hold", min: 200, max: 4000, step: 100 },
  { key: "collapseMs", label: "collapse", min: 200, max: 2500, step: 50 },
];

/** Mirrors the component's own defaults, for the slider start positions. */
const DEFAULTS: Record<string, number> = {
  cycleMs: 80,
  staggerMs: 260,
  settleHoldMs: 1300,
  collapseMs: 900,
};

const BTN = "rounded-full px-3 py-1 text-xs font-bold";

function Stage({ preset, loop }: { preset: Preset; loop: boolean }) {
  const ref = useRef<CyclingRevealHandle>(null);
  const [phase, setPhase] = useState<CyclingPhase>("idle");
  const [timing, setTiming] = useState<Partial<CyclingTiming>>(preset.timing);
  const value = (k: keyof CyclingTiming) => timing[k] ?? preset.timing[k] ?? DEFAULTS[k];

  return (
    <section
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--cahier-line)" }}
    >
      <div className="px-5 py-10 sm:px-8 sm:py-14" style={{ background: preset.paper, color: preset.ink }}>
        <CyclingRevealAcronym
          key={`${preset.id}:${loop}`}
          ref={ref}
          template={preset.template}
          slots={preset.slots}
          timing={timing}
          loop={loop}
          acronymScale={preset.scale}
          acronymSeparator={preset.separator}
          onPhaseChange={setPhase}
          className={`${preset.type} text-center`}
        />
      </div>

      <div
        className="flex flex-wrap items-center gap-2 border-t px-4 py-3"
        style={{ borderColor: "var(--cahier-line)", background: "var(--cahier-paper-raised)" }}
      >
        <span
          className="mr-1 font-mono text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--cahier-ink-faint)" }}
        >
          {preset.name}
        </span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[11px]"
          style={{ background: "var(--cahier-paper-2)", color: "var(--cahier-ink-soft)" }}
        >
          {phase}
        </span>
        <button
          type="button"
          onClick={() => ref.current?.play()}
          className={BTN}
          style={{ background: "var(--cahier-ink)", color: "var(--cahier-paper)" }}
        >
          Replay
        </button>
        {(["skip", "reset"] as const).map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => ref.current?.[action]()}
            className={`${BTN} border`}
            style={{ borderColor: "var(--cahier-line-strong)", color: "var(--cahier-ink)" }}
          >
            {action === "skip" ? "Skip" : "Reset"}
          </button>
        ))}

        <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1">
          {SLIDERS.map((s) => (
            <label
              key={s.key}
              className="flex items-center gap-1.5 font-mono text-[11px]"
              style={{ color: "var(--cahier-ink-soft)" }}
            >
              {s.label}
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={value(s.key)}
                onChange={(e) => setTiming((t) => ({ ...t, [s.key]: Number(e.target.value) }))}
                className="w-20"
                style={{ accentColor: "var(--cahier-ink)" }}
              />
              <b className="w-9 text-right tabular-nums" style={{ color: "var(--cahier-ink)" }}>
                {value(s.key)}
              </b>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CyclingRevealDemo() {
  const [loop, setLoop] = useState(true);

  return (
    <div className="space-y-6">
      <label
        className="flex w-fit cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
        style={{
          borderColor: "var(--cahier-line-strong)",
          background: "var(--cahier-paper-raised)",
          color: "var(--cahier-ink)",
        }}
      >
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
          style={{ accentColor: "var(--cahier-ink)" }}
        />
        loop
      </label>

      {PRESETS.map((p) => (
        <Stage key={p.id} preset={p} loop={loop} />
      ))}
    </div>
  );
}
