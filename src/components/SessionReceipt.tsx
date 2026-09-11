"use client";

/**
 * The receipt a session ends with.
 *
 * Games and the lesson pager already ended with a summary; most drill surfaces
 * just stopped (DOPAMINE_REVIEW §8). The end of a session is the moment a
 * learner decides whether that was worth doing again, and until now most of
 * the app declined to answer.
 *
 * Four things, in this order, because that is the order the question gets
 * asked: what did I earn, is my streak safe, what got better, what should I
 * fix. The last one is a route, not a scolding — it hands the misses straight
 * to ReVue.
 *
 * A flawless run dispatches `fluolingo:reward` type "perfect", which is how
 * the eighth celebration moment gets its trigger: it needs per-session
 * context, so it cannot be derived inside progress.finalize() like the rest.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { HOME_HREF } from "@/lib/routes";

export type ReceiptProps = {
  /** XP earned in this run, and how much of it the multiplier paid for. */
  xp: number;
  mult?: number;
  /** Right / asked. */
  right: number;
  total: number;
  /** Day streak after the run. */
  streak?: number;
  /** One thing that went well, in the learner's terms. */
  strength?: ReactNode;
  /** One thing to fix, plus where fixing it happens. */
  weakness?: ReactNode;
  fixHref?: string;
  /** Play again / leave. */
  againHref?: string;
  onAgain?: () => void;
  homeHref?: string;
};

export default function SessionReceipt({
  xp, mult = 1, right, total, streak,
  strength, weakness, fixHref, againHref, onAgain, homeHref = HOME_HREF,
}: ReceiptProps) {
  // A perfect run is worth saying so, once, and only when there was something
  // to be perfect at.
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || total < 3 || right !== total) return;
    fired.current = true;
    try {
      window.dispatchEvent(new CustomEvent("fluolingo:reward", {
        detail: { type: "perfect", size: "big", count: total },
      }));
    } catch {}
  }, [right, total]);

  const fromMult = mult > 1 ? Math.round(xp - xp / mult) : 0;
  const line = "flex items-baseline gap-3 border-b border-dashed border-[color:var(--cahier-line)] py-2 last:border-b-0";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <div
        className="rounded-2xl border-2 bg-[color:var(--cahier-paper-raised)] p-4"
        style={{ borderColor: "var(--cahier-ink)", boxShadow: "0 2px 0 0 var(--cahier-ink)" }}
      >
        <p className="cahier-display cahier-hand text-2xl leading-tight text-[color:var(--cahier-ink)]">
          {right === total && total >= 3 ? "Flawless." : "Nice work."}
        </p>
        <dl className="mt-2">
          <div className={line}>
            <dt className="flex-1 text-[13.5px] text-[color:var(--cahier-ink-soft)]">XP earned</dt>
            <dd className="fluo-mono text-base font-black" style={{ color: "var(--dopa-joy-ink)" }}>+{xp}</dd>
          </div>
          {fromMult > 0 && (
            <div className={line}>
              <dt className="flex-1 text-[13.5px] text-[color:var(--cahier-ink-soft)]">
                of that, the ×{String(mult).replace(".", ",")} multiplier
              </dt>
              <dd className="fluo-mono text-sm font-black" style={{ color: "var(--dopa-streak-ink)" }}>+{fromMult}</dd>
            </div>
          )}
          <div className={line}>
            <dt className="flex-1 text-[13.5px] text-[color:var(--cahier-ink-soft)]">Right</dt>
            <dd className="fluo-mono text-base font-black" style={{ color: "var(--dopa-win-ink)" }}>{right} / {total}</dd>
          </div>
          {streak != null && streak > 0 && (
            <div className={line}>
              <dt className="flex-1 text-[13.5px] text-[color:var(--cahier-ink-soft)]">Streak</dt>
              <dd className="fluo-mono text-base font-black" style={{ color: "var(--dopa-streak-ink)" }}>
                {streak} d 🔥
              </dd>
            </div>
          )}
        </dl>
      </div>

      {strength && (
        <div className="rounded-xl border-[1.5px] p-3"
             style={{ borderColor: "var(--dopa-win-ink)", background: "var(--dopa-win-wash)" }}>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.11em]" style={{ color: "var(--dopa-win-ink)" }}>
            What’s improving
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: "var(--dopa-win-ink)" }}>{strength}</p>
        </div>
      )}

      {weakness && (
        <div className="rounded-xl border-[1.5px] p-3"
             style={{ borderColor: "var(--dopa-miss-ink)", background: "var(--dopa-miss-wash)" }}>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.11em]" style={{ color: "var(--dopa-miss-ink)" }}>
            One thing to fix
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: "var(--dopa-miss-ink)" }}>{weakness}</p>
          {fixHref && (
            <Link href={fixHref} className="cahier-btn cahier-btn-sm mt-2 w-full justify-center"
                  style={{ borderColor: "var(--dopa-miss-ink)", color: "var(--dopa-miss-ink)", boxShadow: "0 2px 0 0 var(--dopa-miss-ink)" }}>
              CORRIGER MAINTENANT
            </Link>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {onAgain ? (
          <button type="button" onClick={onAgain} className="cahier-btn cahier-btn-accent flex-1">Again</button>
        ) : againHref ? (
          <Link href={againHref} className="cahier-btn cahier-btn-accent flex-1 justify-center">Again</Link>
        ) : null}
        <Link href={homeHref} className="cahier-btn flex-1 justify-center">Home</Link>
      </div>
    </div>
  );
}

/**
 * Sum the XP awarded while a drill is mounted.
 *
 * Every award passes through progress.addXp, which announces itself on
 * `fluolingo:xp` — so a drill can report exactly what the run paid without
 * re-deriving it from the economy constants (which would be wrong the moment
 * a retry, a reveal or a multiplier change enters the picture).
 */
export function useRunXp(): { xp: number; mult: number } {
  const [state, setState] = useState({ xp: 0, mult: 1 });
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail as { paid: number; mult: number };
      if (!d || typeof d.paid !== "number") return;
      setState((s) => ({ xp: s.xp + d.paid, mult: Math.max(s.mult, d.mult ?? 1) }));
    };
    window.addEventListener("fluolingo:xp", on);
    return () => window.removeEventListener("fluolingo:xp", on);
  }, []);
  return state;
}
