"use client";

/**
 * The +XP that rises off an answer.
 *
 * `XP_CORRECT = 60`, multiplied by the fire streak, was awarded on every right
 * answer and shown NOWHERE at the time (DOPAMINE_REVIEW §4). The learner met
 * their XP only as a static number on Home. So the multiplier — the entire
 * reason a streak is worth keeping — was never once seen doing its job.
 *
 * This listens for `fluolingo:xp` (dispatched from progress.addXp, the single
 * funnel every award passes through) and floats the figure. When a multiplier
 * is live it shows the arithmetic — `40 × 1,5` under a big `+60` — because
 * "you earned 60" and "your streak turned 40 into 60" are different messages
 * and only the second one rewards the streak.
 *
 * Deliberately NOT anchored to the answer element: it is mounted once in the
 * root layout and floats bottom-centre, above the drill tray. Anchoring would
 * mean every drill wiring up a ref, and a miss would be silent.
 *
 * Rapid answers stack rather than replace, so a fast run reads as a run.
 */
import { useEffect, useState } from "react";

type Float = { key: number; paid: number; base: number; mult: number };

export default function XpFloat() {
  const [floats, setFloats] = useState<Float[]>([]);

  useEffect(() => {
    let seq = 0;
    const timers: number[] = [];
    const onXp = (e: Event) => {
      const d = (e as CustomEvent).detail as { base: number; mult: number; paid: number };
      if (!d || typeof d.paid !== "number" || d.paid <= 0) return;
      const key = ++seq;
      setFloats((f) => [...f.slice(-3), { key, paid: d.paid, base: d.base, mult: d.mult }]);
      timers.push(window.setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 1500));
    };
    window.addEventListener("fluolingo:xp", onXp);
    return () => {
      window.removeEventListener("fluolingo:xp", onXp);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  if (floats.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-28 z-[92] flex flex-col items-center gap-1"
      aria-hidden
    >
      {floats.map((f) => (
        <span key={f.key} className="xp-float flex flex-col items-center gap-0.5">
          <b
            className="text-[28px] font-black leading-none tracking-tight"
            style={{ color: "var(--dopa-joy-ink)", textShadow: "0 1px 0 var(--cahier-paper-raised)" }}
          >
            +{f.paid}
          </b>
          {f.mult > 1 && (
            <span
              className="rounded-full border-[1.5px] px-2 text-[11px] font-extrabold leading-tight"
              style={{
                color: "var(--dopa-streak-ink)",
                borderColor: "var(--dopa-streak-ink)",
                background: "var(--dopa-streak-wash)",
              }}
            >
              {f.base} × {String(f.mult).replace(".", ",")}
            </span>
          )}
        </span>
      ))}
      <style>{`
        @keyframes xp-rise {
          0%   { transform: translateY(14px); opacity: 0 }
          18%  { opacity: 1 }
          72%  { opacity: 1 }
          100% { transform: translateY(-46px); opacity: 0 }
        }
        .xp-float { animation: xp-rise 1.5s cubic-bezier(.22,.7,.3,1) forwards }
        @media (prefers-reduced-motion: reduce) {
          .xp-float { animation: none; opacity: 1 }
        }
      `}</style>
    </div>
  );
}
