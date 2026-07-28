"use client";

/**
 * NumBus setup — pick the range, pick what you want to hear, go.
 * Every choice shows a sample of the French it will produce, so the learner
 * can tell what a card does without a paragraph explaining it.
 */

import { useEffect, useState } from "react";
import { frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";
import {
  DEFAULT_NUMBUS_CONFIG,
  loadNumBusConfig,
  normalizeConfig,
  saveNumBusConfig,
  type NumBusConfig,
} from "./config";

const PRESETS = [
  { min: 0, max: 20 },
  { min: 0, max: 69 },
  { min: 0, max: 99 },
];

export default function NumBusSetup({ onStart }: { onStart: (c: NumBusConfig) => void }) {
  const [cfg, setCfg] = useState<NumBusConfig>(DEFAULT_NUMBUS_CONFIG);

  useEffect(() => {
    setCfg(loadNumBusConfig());
  }, []);

  const set = (patch: Partial<NumBusConfig>) => setCfg((c) => normalizeConfig({ ...c, ...patch }));

  /** Sliders push the other end rather than swapping under the thumb. */
  const setMin = (v: number) => setCfg((c) => normalizeConfig({ ...c, min: v, max: Math.max(v, c.max) }));
  const setMax = (v: number) => setCfg((c) => normalizeConfig({ ...c, max: v, min: Math.min(v, c.min) }));

  const start = () => {
    const c = normalizeConfig(cfg);
    saveNumBusConfig(c);
    onStart(c);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <section className="rounded-3xl border-2 border-b-[6px] border-[#e0567f] bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-black text-slate-800">🚌 Les bus</span>
          <span className="font-mono text-2xl font-black text-[#e0567f]">
            {cfg.min}–{cfg.max}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          {PRESETS.map((p) => {
            const on = cfg.min === p.min && cfg.max === p.max;
            return (
              <button
                key={`${p.min}-${p.max}`}
                type="button"
                onClick={() => set(p)}
                className={`flex-1 rounded-xl border-2 border-b-4 py-2 font-mono text-sm font-black transition active:translate-y-[2px] active:border-b-2 ${
                  on
                    ? "border-[#c94070] bg-[#e0567f] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                }`}
              >
                {p.min}–{p.max}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[2rem_1fr] items-center gap-x-3 gap-y-2">
          <label htmlFor="nb-min" className="text-sm font-bold text-slate-500">
            de
          </label>
          <input
            id="nb-min"
            type="range"
            min={0}
            max={99}
            value={cfg.min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full accent-[#e0567f]"
          />
          <label htmlFor="nb-max" className="text-sm font-bold text-slate-500">
            à
          </label>
          <input
            id="nb-max"
            type="range"
            min={0}
            max={99}
            value={cfg.max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full accent-[#e0567f]"
          />
        </div>

        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-600" lang="fr">
          🔊 « le bus numéro {frenchNumber(cfg.max)} »
        </p>
      </section>

      <div className="flex flex-col gap-2">
        <Card
          on={cfg.times}
          onClick={() => set({ times: !cfg.times })}
          emoji="🕑"
          title="L'heure"
          sample={`« départ à ${frenchTime(14, 35)} »`}
          hue="#546e7a"
        />
        <Card
          on={cfg.prices}
          onClick={() => set({ prices: !cfg.prices })}
          emoji="🍔"
          title="Les prix"
          sample={`« ça fait ${frenchPrice(1250)} »`}
          hue="#e65100"
        />
        <Card
          on={cfg.phones}
          onClick={() => set({ phones: !cfg.phones })}
          emoji="📞"
          title="Les numéros de téléphone"
          sample={
            cfg.phoneStyle === "sg"
              ? `« ${frenchPhone("91234567")} »`
              : `« ${frenchPhone("0612345678")} »`
          }
          hue="#1565c0"
        >
          <div className="mt-3 flex gap-2">
            <StyleBtn
              active={cfg.phoneStyle === "fr"}
              onClick={() => set({ phoneStyle: "fr" })}
              label="🇫🇷 France"
              hint="06 12 34 56 78"
            />
            <StyleBtn
              active={cfg.phoneStyle === "sg"}
              onClick={() => set({ phoneStyle: "sg" })}
              label="🇸🇬 Singapour"
              hint="9123 4567"
            />
          </div>
        </Card>
      </div>

      <button
        type="button"
        onClick={start}
        className="rounded-2xl border-2 border-b-[6px] border-[#46a302] bg-[#58cc02] py-4 text-xl font-black text-white shadow-sm transition hover:brightness-105 active:translate-y-[3px] active:border-b-2"
      >
        ▶ C&apos;est parti !
      </button>
    </div>
  );
}

function Card({
  on,
  onClick,
  emoji,
  title,
  sample,
  hue,
  children,
}: {
  on: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  sample: string;
  hue: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border-2 border-b-4 bg-white p-3 shadow-sm transition"
      style={{ borderColor: on ? hue : "#e2e8f0" }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="text-2xl" aria-hidden>
          {emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-slate-800">{title}</span>
          <span className="block truncate text-xs font-bold text-slate-500" lang="fr">
            {sample}
          </span>
        </span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black text-white transition"
          style={{
            borderColor: on ? hue : "#cbd5e1",
            background: on ? hue : "transparent",
          }}
        >
          {on ? "✓" : ""}
        </span>
      </button>
      {on && children}
    </div>
  );
}

function StyleBtn({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-xl border-2 border-b-4 px-2 py-2 text-center transition active:translate-y-[2px] active:border-b-2 ${
        active ? "border-[#0d47a1] bg-[#1565c0] text-white" : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className="block text-xs font-black">{label}</span>
      <span className="block font-mono text-[11px] font-bold opacity-80">{hint}</span>
    </button>
  );
}
