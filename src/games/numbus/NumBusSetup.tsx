"use client";

/**
 * NumBus setup — a floor, a ceiling, and which kinds you want to hear.
 *
 * Dan, 2026-09-14, after I built more than he asked for three times running:
 * *"Look NumBourse and NumBus very simple : let the user decide what is the
 * floor and the ceiling. no need so much PLEASE"*.
 *
 * WHAT THIS SCREEN USED TO BE, measured in the built app before it was touched:
 *
 *     11 native <select> menus holding 770 <option>s
 *      4 bare <input type="checkbox">
 *        slate greys and #58cc02 — the last screen in the app that was not on
 *        the cahier tokens, and visibly another product's form
 *
 * A phone opened the OS picker wheel and asked a learner to spin through a
 * hundred entries to say « up to 69 ».
 *
 * ALL FOUR KINDS STAY (Dan, the same hour: *"So we still can have the full
 * range of activities"*, after *"each of the categories have to be selected
 * too you know (single category or multiple)"*). They are four keys, tapped on
 * and off — no tick boxes, no rows, no per-kind bounds.
 *
 * AND THE ONE RANGE REACHES ALL OF THEM (*"For time, price and phone numbers,
 * adapt the value of each double digit to the range picked. That is all"*).
 * Every two-digit part of every kind is drawn from the floor and ceiling set
 * once above: the hour and the minute, the euros and the centimes, and every
 * block of a phone number. Pick 0–20 and nothing above twenty is ever said,
 * in any shape. config.ts does that work; this screen only asks the question.
 *
 * THE 8/10 CHOICE APPEARS ONLY WITH 📞 ON, because it is the one setting that
 * belongs to a single kind, and a control for something switched off is the
 * clutter Dan has now asked three times to be rid of.
 *
 * A WELL, NOT A DROPDOWN. `.neo-well` is the app's own word for a value you
 * read and type into rather than press — the zoom field, the streak mark, the
 * goal picker's editable stop number, which is where Dan asked for this shape
 * in the first place (*"it would be good if it could appear as a depressed
 * space"*). A real <input> under it means a phone raises its digit keyboard
 * instead of a hundred-row wheel.
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_NUMBUS_CONFIG,
  loadNumBusConfig,
  normalizeConfig,
  saveNumBusConfig,
  type NumBusConfig,
} from "./config";

export default function NumBusSetup({ onStart }: { onStart: (c: NumBusConfig) => void }) {
  const [cfg, setCfg] = useState<NumBusConfig>(DEFAULT_NUMBUS_CONFIG);

  useEffect(() => {
    // Deliberate: the saved config lives in localStorage, which cannot be read
    // during render (the site is statically exported) — this mount effect has
    // to seed it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCfg(loadNumBusConfig());
  }, []);

  const set = (patch: Partial<NumBusConfig>) => setCfg((c) => normalizeConfig({ ...c, ...patch }));

  const toggle = (k: "numbers" | "times" | "prices" | "phones") =>
    set({ [k]: !cfg[k] } as Partial<NumBusConfig>);

  const ready = cfg.numbers || cfg.times || cfg.prices || cfg.phones;

  const start = () => {
    const c = normalizeConfig(cfg);
    saveNumBusConfig(c);
    onStart(c);
  };

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <h2 className="nb-setup-h">Numbers from</h2>

      <div className="nb-scope">
        <Well value={cfg.min} onChange={(v) => set({ min: v })} max={99} label="Lowest number" />
        <span className="nb-scope-lab">to</span>
        <Well value={cfg.max} onChange={(v) => set({ max: v })} max={99} label="Highest number" />
      </div>

      {/* FOUR KEYS, TAPPED ON AND OFF. The key IS the tick box — that is what
          removed the four bare checkboxes this screen used to carry. */}
      <div className="nb-kinds">
        {([
          ["numbers", "🚌", "Bus numbers"],
          ["times", "🕑", "Times"],
          ["prices", "🍔", "Prices"],
          ["phones", "📞", "Phone numbers"],
        ] as const).map(([k, emoji, name]) => (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            aria-pressed={cfg[k]}
            aria-label={name}
            title={name}
            className={`neo-key nb-kind${cfg[k] ? " is-on" : ""}`}
          >
            <span aria-hidden>{emoji}</span>
          </button>
        ))}
      </div>

      {cfg.phones && (
        <div className="nb-kinds nb-kinds-sub">
          {([8, 10] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set({ phoneDigits: d })}
              aria-pressed={cfg.phoneDigits === d}
              aria-label={`${d}-digit phone numbers`}
              className={`neo-key nb-kind nb-kind-sm${cfg.phoneDigits === d ? " is-on" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* NO CONTROL SPANS THE WIDTH (5 Sep). It was `w-full` before. */}
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={start} disabled={!ready} className="neo-key nb-start">
          ▶ Start
        </button>
      </div>
    </div>
  );
}

/** A number pressed into the paper, typed rather than spun.
 *
 *  IT HOLDS ITS OWN TEXT WHILE BEING EDITED. Clearing the field to type "7"
 *  passes through the empty string, and a control that reads that back as 0
 *  fights the caret — the zoom field in HomeMap documents the same trap. So
 *  the draft lives here, and only a well-formed in-range value is committed. */
function Well({ value, onChange, max, label }: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft ?? String(value)}
      aria-label={label}
      onChange={(e) => {
        const text = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        setDraft(text);
        const n = parseInt(text, 10);
        if (Number.isFinite(n) && n <= max) onChange(n);
      }}
      onBlur={(e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n)) onChange(Math.max(0, Math.min(max, n)));
        setDraft(null);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="neo-well nb-well"
    />
  );
}
