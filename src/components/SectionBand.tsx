"use client";

/**
 * A colour-coded section — the site's second colour axis, made reusable.
 *
 * The `--dopa-*` roles say what a thing MEANS. This says WHERE YOU ARE: a
 * stack of these reads as a set of distinct worlds rather than one undivided
 * field of paper, and a learner knows which section they are in before they
 * read the label.
 *
 * Lifted from ProfileContent on pm/profile-learner-model, which is where the
 * pattern was proven, and corrected on the way out. Four intensities of one
 * hue, each with a job:
 *
 *     spine   7px --fam-ink     the identity marker
 *     band    --fam-wash        the header field, near-black label on it
 *     pill    --fam-ink         the status figure, paper label on it
 *     body    6% of --fam       the field the content sits on
 *
 * The correction: the reference filled the spine and the pill with the FULL
 * hue and put paper text on them — 1.99:1 on gold, 2.27 on teal. Both now take
 * `--fam-ink`, which keeps the identity and clears 4.5:1 on the pill and 3:1
 * on the spine. The full hue survives as decoration only.
 *
 * Colour is never the only cue: every band has its label, and the pill its
 * figure. Switch the family and nothing but the hue changes.
 */
import type { ReactNode } from "react";

// Skills retired 2026-09-09, split into Oral and Tools — see FamilyKey in
// content/activities.ts, which this duplicates rather than imports (a
// server/client boundary reason lost to history — kept in sync by hand,
// which is exactly how it drifted here).
export type Family = "goals" | "practice" | "svplay" | "review" | "oral" | "tools" | "user" | "none";

export default function SectionBand({
  family,
  label,
  gloss,
  pill,
  trailing,
  open = true,
  onToggle,
  children,
}: {
  family: Family;
  /** The section's name. Always present — colour never carries this alone. */
  label: string;
  /** A parenthetical in the reference's voice: "(rewards)", "(problems noted)". */
  gloss?: string;
  /** The figure on the right: "50 SIOS", "0 / 3", "EMPTY". */
  pill?: ReactNode;
  trailing?: ReactNode;
  /** Omit onToggle for a static band. */
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
}) {
  const spine = "7px solid var(--fam-ink)";
  const head = (
    <>
      <span
        className="fluo-mono text-[11px] font-black tracking-[0.08em]"
        style={{ color: "var(--cahier-ink)" }}
      >
        {label}
        {gloss && <span className="opacity-60"> ({gloss})</span>}
      </span>
      {pill !== undefined && pill !== null && (
        <span
          className="fluo-mono ml-auto shrink-0 rounded-[5px] px-1.5 py-1 text-[11px] font-black"
          style={{ background: "var(--fam-ink)", color: "var(--cahier-paper)" }}
        >
          {pill}
        </span>
      )}
      {trailing}
      {onToggle && (
        <span aria-hidden className="w-3.5 shrink-0 text-center text-sm" style={{ color: "var(--cahier-ink)" }}>
          {open ? "▾" : "▸"}
        </span>
      )}
    </>
  );

  return (
    <div className={`fam-${family}`}>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-h-[56px] w-full items-center gap-2.5 px-3.5 py-3 text-left"
          style={{
            background: "var(--fam-wash)",
            borderLeft: spine,
            borderBottom: "1px solid var(--cahier-line)",
          }}
        >
          {head}
        </button>
      ) : (
        <div
          className="flex min-h-[56px] w-full items-center gap-2.5 px-3.5 py-3"
          style={{
            background: "var(--fam-wash)",
            borderLeft: spine,
            borderBottom: "1px solid var(--cahier-line)",
          }}
        >
          {head}
        </div>
      )}
      {open && children && (
        <div
          className="px-3.5 py-3.5"
          /* NO SPINE ON THE BODY (Dan, 2026-09-07, on SpecuLearn: *"pls remove
             redundant extra brown vertical line"*). The head band above still
             carries the 7px --fam-ink edge, and that is the identity marker;
             repeating it down the open body drew a second brown rule the whole
             height of the list — on SpecuLearn, 975px of it, four columns in
             from the page's own family spine. Two lines saying the same thing,
             which is the litmus test applied to a border rather than to text. */
          style={{
            background: "color-mix(in oklab, var(--fam) 6%, transparent)",
            borderBottom: "1px solid var(--cahier-line)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
