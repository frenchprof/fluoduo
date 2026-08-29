"use client";

/**
 * SessionMap — one dot per word in the run (patch 31).
 *
 * Dan's pain #1 on the design handoff: "No sense of progress or streak during
 * a run." A progress bar answers HOW FAR and structurally cannot answer HOW IT
 * WENT — three greens then two reds is the shape a learner needs to see, and a
 * bar renders it identically to five greens. So: filled dot per answered word
 * in the tier colours the rest of the app already uses for "how you did"
 * (/moi, the Index, the teacher matrix), hollow for what is still ahead.
 *
 * CAP. The design drew 30 dots for a 30-word run. WorDrill's widest scope is
 * 612 words, where 612 dots is a wall, not a signal — so the map shows at most
 * CAP, windowed to the end once the run passes it: what you just did stays
 * visible, and the hollow tail always means "still ahead".
 */

export type Mark = "ok" | "shaky" | "bad";

const CAP = 40;

const FILL: Record<Mark, string> = {
  ok: "var(--tier-good)",
  shaky: "var(--tier-medium)",
  bad: "var(--tier-weak)",
};

export default function SessionMap({
  marks,
  total,
  size = 9,
  className = "",
}: {
  /** Outcomes so far, oldest first. */
  marks: Mark[];
  /** Words in the run — the hollow dots make up the difference. */
  total: number;
  size?: number;
  className?: string;
}) {
  const slots = Math.min(total, CAP);
  // Once the run is longer than the cap, slide the window so the newest mark
  // is always the last filled dot.
  const shown = marks.length > slots ? marks.slice(marks.length - slots) : marks;
  const done = shown.length;

  return (
    <div
      className={`flex flex-wrap justify-center gap-1 ${className}`}
      role="img"
      aria-label={`${marks.length} of ${total} said · ${marks.filter((m) => m === "ok").length} right`}
    >
      {Array.from({ length: slots }, (_, i) => {
        const m = i < done ? shown[i] : null;
        return (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: size,
              height: size,
              background: m ? FILL[m] : "transparent",
              boxShadow: m ? "none" : "inset 0 0 0 1.5px rgba(42,46,110,.22)",
            }}
          />
        );
      })}
    </div>
  );
}
