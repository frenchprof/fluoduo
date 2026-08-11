"use client";

/**
 * 🎯 OBJECTIF — the stop's full Specific Instructional Objective, on demand.
 * Follows the WHY-pill convention (Dan's litmus rule, 2026-07-02: detail text
 * lives behind a small pill, never inline by default): the SIO popup keeps its
 * one merged Can-Do sentence, and this pill reveals the precise observable
 * behaviour + criterion for learners (or Dan) who want the fine print.
 * Rendered by SioDetail and Unit0Panel, right under the merged sentence.
 */
import { useState, type ReactNode } from "react";
import { SIO_OBJECTIVES } from "@/content/sios/objectives";

/** The doc keeps markdown *italics* around French examples — honour them. */
function withItalics(text: string): ReactNode[] {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <i key={i} lang="fr">
        {part}
      </i>
    ) : (
      part
    ),
  );
}

export default function SioObjective({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const text = SIO_OBJECTIVES[id];
  if (!text) return null;
  return (
    <div className="-mt-3 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`rounded-full border-2 px-2 py-0.5 text-[0.6rem] font-black tracking-wider transition ${
          open
            ? "border-[color:var(--fluo-ink)] bg-[var(--fluo-ink)] text-white"
            : "border-[color:var(--fluo-ink)] bg-white text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
        }`}
      >
        🎯 OBJECTIF
      </button>
      {open && (
        <p
          className="fluo-readable mt-1.5 rounded-xl border-2 border-dashed p-2.5 text-xs leading-snug text-[color:var(--fluo-ink-soft)]"
          style={{ borderColor: "var(--fluo-card-accent)" }}
        >
          {withItalics(text)}
        </p>
      )}
    </div>
  );
}
