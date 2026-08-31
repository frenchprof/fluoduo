"use client";

/**
 * NumBus setup — "I want to practice", then one tickable English sentence per
 * kind of number, each with its own bounds as dropdowns. Defaults are the full
 * range of every type, so the learner narrows rather than builds.
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_NUMBUS_CONFIG,
  hasAnyMode,
  hoursOf,
  loadNumBusConfig,
  minutesOf,
  normalizeConfig,
  saveNumBusConfig,
  type NumBusConfig,
} from "./config";

const NUMBERS = Array.from({ length: 100 }, (_, i) => i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const CENTS = Array.from({ length: 100 }, (_, i) => i);
const TWO = (n: number) => String(n).padStart(2, "0");

export default function NumBusSetup({ onStart }: { onStart: (c: NumBusConfig) => void }) {
  const [cfg, setCfg] = useState<NumBusConfig>(DEFAULT_NUMBUS_CONFIG);

  useEffect(() => {
    // Deliberate: the saved config lives in localStorage, which cannot be
    // read during render (the site is statically exported) — this mount
    // effect has to seed it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCfg(loadNumBusConfig());
  }, []);

  const set = (patch: Partial<NumBusConfig>) => setCfg((c) => normalizeConfig({ ...c, ...patch }));

  const setTime = (which: "timeFrom" | "timeTo", h: number, m: number) =>
    set({ [which]: h * 60 + m } as Partial<NumBusConfig>);
  const setPrice = (which: "priceFrom" | "priceTo", euros: number, cents: number) =>
    set({ [which]: euros * 100 + cents } as Partial<NumBusConfig>);

  const ready = hasAnyMode(cfg);

  const start = () => {
    const c = normalizeConfig(cfg);
    saveNumBusConfig(c);
    onStart(c);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-xl font-black text-slate-800">I want to practice</h2>

      <div className="mt-3 flex flex-col gap-2">
        <Row on={cfg.numbers} onToggle={() => set({ numbers: !cfg.numbers })} emoji="🚌">
          numbers from{" "}
          <Select value={cfg.min} onChange={(v) => set({ min: v })} options={NUMBERS} label="Lowest number" />
          {" "}to{" "}
          <Select value={cfg.max} onChange={(v) => set({ max: v })} options={NUMBERS} label="Highest number" />
        </Row>

        <Row on={cfg.times} onToggle={() => set({ times: !cfg.times })} emoji="🕑">
          time from{" "}
          <Select
            value={hoursOf(cfg.timeFrom)}
            onChange={(h) => setTime("timeFrom", h, minutesOf(cfg.timeFrom))}
            options={HOURS}
            pad
            label="Earliest hour"
          />
          h
          <Select
            value={minutesOf(cfg.timeFrom)}
            onChange={(m) => setTime("timeFrom", hoursOf(cfg.timeFrom), m)}
            options={MINUTES}
            pad
            label="Earliest minute"
          />
          {" "}to{" "}
          <Select
            value={hoursOf(cfg.timeTo)}
            onChange={(h) => setTime("timeTo", h, minutesOf(cfg.timeTo))}
            options={HOURS}
            pad
            label="Latest hour"
          />
          h
          <Select
            value={minutesOf(cfg.timeTo)}
            onChange={(m) => setTime("timeTo", hoursOf(cfg.timeTo), m)}
            options={MINUTES}
            pad
            label="Latest minute"
          />
        </Row>

        <Row on={cfg.prices} onToggle={() => set({ prices: !cfg.prices })} emoji="🍔">
          prices from{" "}
          <Select
            value={Math.floor(cfg.priceFrom / 100)}
            onChange={(e) => setPrice("priceFrom", e, cfg.priceFrom % 100)}
            options={NUMBERS}
            label="Lowest price, euros"
          />
          ,
          <Select
            value={cfg.priceFrom % 100}
            onChange={(c) => setPrice("priceFrom", Math.floor(cfg.priceFrom / 100), c)}
            options={CENTS}
            pad
            label="Lowest price, centimes"
          />
          {" "}to{" "}
          <Select
            value={Math.floor(cfg.priceTo / 100)}
            onChange={(e) => setPrice("priceTo", e, cfg.priceTo % 100)}
            options={NUMBERS}
            label="Highest price, euros"
          />
          ,
          <Select
            value={cfg.priceTo % 100}
            onChange={(c) => setPrice("priceTo", Math.floor(cfg.priceTo / 100), c)}
            options={CENTS}
            pad
            label="Highest price, centimes"
          />
          {" "}euros
        </Row>

        <Row on={cfg.phones} onToggle={() => set({ phones: !cfg.phones })} emoji="📞">
          phone numbers —{" "}
          <select
            value={cfg.phoneStyle}
            onChange={(e) => set({ phoneStyle: e.target.value === "sg" ? "sg" : "fr" })}
            aria-label="Phone number length"
            className="rounded-lg border-2 border-slate-300 bg-white px-2 py-1 font-bold text-slate-800"
          >
            <option value="fr">10 digits (France)</option>
            <option value="sg">8 digits (Singapore)</option>
          </select>
        </Row>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={!ready}
        className="mt-4 w-full rounded-2xl border-2 border-b-[6px] border-[#46a302] bg-[#58cc02] py-4 text-xl font-black text-white shadow-sm transition hover:brightness-105 active:translate-y-[3px] active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ▶ Start
      </button>
    </div>
  );
}

function Row({
  on,
  onToggle,
  emoji,
  children,
}: {
  on: boolean;
  onToggle: () => void;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border-2 border-b-4 bg-white p-3 transition"
      style={{ borderColor: on ? "#e0567f" : "#e2e8f0" }}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={onToggle}
        className="mt-1 h-6 w-6 shrink-0 accent-[#e0567f]"
      />
      <span
        className={`flex flex-wrap items-center gap-x-1 gap-y-2 text-sm font-bold ${
          on ? "text-slate-800" : "text-slate-400"
        }`}
      >
        <span aria-hidden className="text-lg">
          {emoji}
        </span>
        {children}
      </span>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  pad,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  options: number[];
  pad?: boolean;
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      className="rounded-lg border-2 border-slate-300 bg-white px-1.5 py-1 font-mono font-black text-slate-800"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {pad ? TWO(o) : o}
        </option>
      ))}
    </select>
  );
}
