"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_NUMBUS_CONFIG,
  loadNumBusConfig,
  normalizeConfig,
  saveNumBusConfig,
  type NumBusConfig,
  type PhoneStyle,
} from "./config";

const pill =
  "rounded-xl border-2 border-b-4 px-3 py-2 text-sm font-black transition active:translate-y-[2px] active:border-b-2";

export default function NumBusSetup({ onStart }: { onStart: (c: NumBusConfig) => void }) {
  const [cfg, setCfg] = useState<NumBusConfig>(DEFAULT_NUMBUS_CONFIG);

  useEffect(() => {
    setCfg(loadNumBusConfig());
  }, []);

  const set = (patch: Partial<NumBusConfig>) => setCfg((c) => normalizeConfig({ ...c, ...patch }));

  const start = () => {
    const c = normalizeConfig(cfg);
    saveNumBusConfig(c);
    onStart(c);
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border-4 border-[#e0567f] bg-white p-5 shadow-lg">
      <h2 className="text-xl font-black text-[color:var(--cahier-ink)]">🚌 Your session</h2>

      <div className="mt-4">
        <label className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Bus numbers</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={99}
            value={cfg.min}
            onChange={(e) => set({ min: Number(e.target.value) })}
            className="w-20 rounded-xl border-2 border-slate-300 px-3 py-2 text-center font-mono text-lg font-black"
            aria-label="Minimum"
          />
          <span className="font-bold text-slate-500">→</span>
          <input
            type="number"
            min={0}
            max={99}
            value={cfg.max}
            onChange={(e) => set({ max: Number(e.target.value) })}
            className="w-20 rounded-xl border-2 border-slate-300 px-3 py-2 text-center font-mono text-lg font-black"
            aria-label="Maximum"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Toggle on={cfg.times} onClick={() => set({ times: !cfg.times })} emoji="🕑" label="Times" />
        <Toggle on={cfg.prices} onClick={() => set({ prices: !cfg.prices })} emoji="🍔" label="Prices" />
        <Toggle on={cfg.phones} onClick={() => set({ phones: !cfg.phones })} emoji="📞" label="Phones" />
      </div>

      {cfg.phones && (
        <div className="mt-3 flex gap-2">
          <PhoneBtn active={cfg.phoneStyle === "fr"} onClick={() => set({ phoneStyle: "fr" as PhoneStyle })} label="🇫🇷 10 digits" />
          <PhoneBtn active={cfg.phoneStyle === "sg"} onClick={() => set({ phoneStyle: "sg" as PhoneStyle })} label="🇸🇬 8 digits" />
        </div>
      )}

      <button
        type="button"
        onClick={start}
        className="mt-5 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-3 text-lg font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
      >
        ▶ C&apos;est parti !
      </button>
    </div>
  );
}

function Toggle({ on, onClick, emoji, label }: { on: boolean; onClick: () => void; emoji: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${pill} ${on ? "border-[#46a302] bg-[#58cc02] text-white" : "border-slate-300 bg-slate-100 text-slate-700"}`}
    >
      {emoji} {label}
    </button>
  );
}

function PhoneBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${pill} flex-1 ${active ? "border-[#546e7a] bg-[#546e7a] text-white" : "border-slate-300 bg-white text-slate-700"}`}
    >
      {label}
    </button>
  );
}
