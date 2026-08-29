/**
 * The generator engine: a seeded RNG, the scenario factory, the connector
 * helpers that make a text of ANY length end properly, and the no-repeat draw.
 *
 * Determinism matters twice over. It makes a text shareable (a seed IS the
 * text, so a teacher can put one on the board), and it gives the prefix
 * property for free: the cast is drawn before any beat renders, and beats
 * draw in order, so asking for 4 sentences yields exactly the 3-sentence
 * text plus one more.
 *
 * A beat returns BOTH languages from one call (not an fr fn and an en fn),
 * so a beat that draws its own wording draws once and the gloss can never
 * drift out of step with the French.
 */

import { cap, tidy, tidyEn } from "./french";
import { MAX_SENTENCES, type MiniText, type Pos, type Rng, type Scenario, type Sentence, type UnitTextGen } from "./types";

/** mulberry32 — small, fast, well-distributed, no dependency. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: Rng, xs: readonly T[]): T {
  return xs[Math.floor(rng() * xs.length) % xs.length];
}

/** Pick one item that isn't `not` — a landmark distinct from the target. */
export function pickOther<T>(rng: Rng, xs: readonly T[], not: T): T {
  const rest = xs.filter((x) => x !== not);
  return rest.length ? pick(rng, rest) : not;
}

/* ── Connectors ───────────────────────────────────────────────────────────
 * A two-sentence text needs no signposting; a longer one needs its steps
 * marked AND its last step marked as last. These helpers are what let a
 * single beat list read correctly at every length from 1 to 5.
 */

/** "D'abord, " on the first step of a text long enough to have steps. */
export function first(p: Pos): string {
  return p.n <= 2 ? "" : "D'abord, ";
}

/** `mid` normally, "Enfin, " when this beat closes the text. */
export function then_(p: Pos, mid = "Ensuite, "): string {
  if (p.n <= 2) return "";
  return p.last ? "Enfin, " : mid;
}

export function firstEn(p: Pos): string {
  return p.n <= 2 ? "" : "First, ";
}

export function thenEn(p: Pos, mid = "Then, "): string {
  if (p.n <= 2) return "";
  return p.last ? "Finally, " : mid;
}

/* ── Scenario factory ────────────────────────────────────────────────────── */

/** One sentence of a scenario, in both languages, drawn in a single call. */
export type Beat<C> = (c: C, p: Pos, rng: Rng) => Sentence;

/**
 * Build a scenario from a cast-drawing function and exactly MAX_SENTENCES
 * beats. The cast type stays local to the definition — the returned Scenario
 * has it erased, so a unit can hold scenarios with unrelated casts.
 */
export function scenario<C>(id: string, cast: (rng: Rng) => C, beats: Beat<C>[]): Scenario {
  if (beats.length !== MAX_SENTENCES) {
    throw new Error(`scenario ${id}: expected ${MAX_SENTENCES} beats, got ${beats.length}`);
  }
  return {
    id,
    write(rng: Rng, n: number): Sentence[] {
      const count = Math.max(1, Math.min(MAX_SENTENCES, Math.floor(n)));
      const c = cast(rng);
      const out: Sentence[] = [];
      for (let i = 0; i < count; i++) {
        const p: Pos = { i, n: count, last: i === count - 1 };
        const s = beats[i](c, p, rng);
        out.push({ fr: tidy(cap(s.fr)), en: tidyEn(cap(s.en)) });
      }
      return out;
    },
  };
}

/* ── Generation ──────────────────────────────────────────────────────────── */

export type GenerateOpts = {
  /** 1–5. Anything outside is clamped. */
  sentences: number;
  seed: number;
  /** Force a scenario instead of drawing one. */
  scenarioId?: string;
};

export function generateText(gen: UnitTextGen, opts: GenerateOpts): MiniText {
  const rng = makeRng(opts.seed);
  const chosen =
    (opts.scenarioId && gen.scenarios.find((s) => s.id === opts.scenarioId)) || pick(rng, gen.scenarios);
  return {
    unit: gen.unit,
    scenario: chosen.id,
    seed: opts.seed,
    sentences: chosen.write(rng, opts.sentences),
  };
}

/** The fingerprint a sentence is deduplicated by — French only, punctuation
 *  and case folded, so "C'est délicieux !" and "C'est délicieux!" are one. */
export function fingerprint(fr: string): string {
  return fr
    .toLocaleLowerCase("fr-FR")
    .replace(/[.!?;:,«»"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type FreshResult = {
  text: MiniText;
  /** False when the draw gave up and reused a sentence the learner has heard. */
  fresh: boolean;
  /** How many candidates were rejected — useful for spotting an exhausted set. */
  rejected: number;
};

export type FreshOpts = {
  sentences: number;
  /** Fingerprints already heard. Not mutated — the caller decides what to keep. */
  heard: ReadonlySet<string>;
  /** Seed source; defaults to Math.random. Injectable so tests stay pure. */
  nextSeed?: () => number;
  /** How many candidate texts to try before giving up. */
  tries?: number;
  /** Force a scenario instead of drawing one — the topic picker's choice
   *  (2026-08-22). Undefined keeps the old behaviour: any of the unit's. */
  scenarioId?: string;
};

/**
 * Draw a text none of whose sentences the learner has heard before.
 *
 * Rejection sampling, not enumeration: the space is far too large to
 * enumerate (see scripts/check-textgen.mjs, which measures it), but any
 * single beat's variant set is small enough that a few hundred tries find a
 * free combination whenever one exists. When the set really is exhausted the
 * draw returns its least-repetitive candidate with `fresh: false`, and the
 * caller is expected to offer a reset rather than silently repeat.
 */
export function generateUnheard(gen: UnitTextGen, opts: FreshOpts): FreshResult {
  const nextSeed = opts.nextSeed ?? (() => Math.floor(Math.random() * 0x7fffffff));
  const tries = opts.tries ?? 300;
  let best: MiniText | null = null;
  let bestRepeats = Infinity;

  for (let attempt = 0; attempt < tries; attempt++) {
    const text = generateText(gen, { sentences: opts.sentences, seed: nextSeed(), scenarioId: opts.scenarioId });
    const repeats = text.sentences.filter((s) => opts.heard.has(fingerprint(s.fr))).length;
    if (repeats === 0) return { text, fresh: true, rejected: attempt };
    if (repeats < bestRepeats) {
      best = text;
      bestRepeats = repeats;
    }
  }
  return { text: best!, fresh: false, rejected: tries };
}
