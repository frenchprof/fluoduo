"use client";

/**
 * Global reward celebration. Listens for the `fluolingo:reward` events that the
 * economy (lib/progress) dispatches and shows a brief banner. Mounted once in
 * the root layout so ANY action that earns a reward — a drill answer, a café
 * conversation, marking a SIO done — celebrates, wherever the learner is.
 *
 * THE LADDER (2026-08-21). The pipeline used to fire on 2 of the 8 moments the
 * app already tracked, and every one of them got the full fanfare. Both halves
 * were wrong: crossing into a ×1.5 multiplier — the biggest single improvement
 * a learner can earn — showed nothing at all, while mastering one word got the
 * same confetti as finishing a unit.
 *
 * So each event carries a `size`, and the ladder is:
 *
 *   chime  a tick of acknowledgement — no banner at all, just a sound.
 *          (A word reaching the spacing ladder happens dozens of times an
 *          hour; a banner for it would be a nuisance, not a reward.)
 *   small  the banner, no sound, short.
 *   big    the banner, held longer, with the correct/level chime.
 *   full   banner + fanfare + site-wide confetti. Reserved for a finished
 *          unit, so the fanfare keeps meaning something.
 *
 * Colours come from the seven-role palette: each moment takes the role that
 * MEANS it (reward / streak / win / joy), never a decorative rotation.
 */
import { useEffect, useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { badgeById } from "@/lib/economy";
import type { RewardDetail, RewardSize } from "@/lib/progress";

type Toast = {
  key: number;
  icon: string;
  title: string;
  sub: string;
  size: RewardSize;
  /** The role token this moment means. */
  role: string;
};

const HOLD: Record<RewardSize, number> = { chime: 0, small: 2200, big: 3200, full: 4200 };

/** Turn one event into a toast — or null, when it is a chime and wants no banner. */
function toToast(d: RewardDetail, seq: number): Toast | null {
  const base = { key: seq, size: d.size };
  switch (d.type) {
    case "level":
      return { ...base, icon: "🎚️", role: "reward", title: `Level ${d.level}!`, sub: "You've ranked up" };
    case "badge": {
      const b = badgeById(d.id);
      return b ? { ...base, icon: b.icon, role: "reward", title: "Badge unlocked!", sub: `${b.label} · 💎 +${b.gems}` } : null;
    }
    // "1 days in a row" (Dan, 2026-08-27) — and day one is exactly when
    // every learner meets this toast, so the one broken case was the one
    // everybody saw.
    case "streak":
      return { ...base, icon: "🔥", role: "streak", title: `${d.streak} ${d.streak === 1 ? "day" : "days"} in a row`, sub: d.mult > 1 ? `Everything earns ×${d.mult}` : "Come back tomorrow to keep it" };
    case "multiplier":
      return { ...base, icon: "🔥", role: "streak", title: `×${d.mult} XP, from now on`, sub: `${d.streak} days running — everything you do earns more` };
    case "sio":
      return { ...base, icon: "✅", role: "win", title: "Objective done", sub: "It's on your map" };
    case "unit":
      return { ...base, icon: "🏔️", role: "reward", title: `Unit ${d.unit} complete!`, sub: `All ${d.count} objectives done` };
    case "perfect":
      return { ...base, icon: "🎯", role: "joy", title: "Perfect run", sub: `${d.count} out of ${d.count}` };
    // The lucky find — the one moment in the app the learner cannot predict.
    // It says the AMOUNT and nothing else: a find that explained itself
    // ("you were due one", "1 answer in 8") would stop being a surprise the
    // first time anyone read it.
    //
    // FLOW, AND NOT ONE OF THE OTHER THREE (Dan, 6 Sep). It shipped in `joy`
    // for a day, which was wrong on the rule this whole palette exists to
    // enforce — one colour, one meaning:
    //
    //   joy     is already XP. It is the +20 float and the receipt's XP line
    //           (XpFloat.tsx). A find pays GEMS, so the same amber would have
    //           been two currencies.
    //   streak  is already the fire.
    //   reward / miss are reds, and a find often lands on a WRONG answer —
    //           the reward would flash in the failure colour at the moment
    //           that reads worst.
    //
    // Flow is the only role not already spoken for, and the 💎 is blue, so
    // the icon sits inside its disc instead of fighting it.
    case "find":
      return { ...base, icon: "💎", role: "flow", title: `You found 💎 ${d.gems}`, sub: "Lucky" };
    case "mastery":
      return null; // a chime, deliberately silent on screen
  }
}

export default function RewardToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let seq = 0;
    let hideTimer: number | null = null;
    const onReward = (e: Event) => {
      const d = (e as CustomEvent).detail as RewardDetail;
      if (!d?.type) return;

      // The sound fires for every size, banner or not.
      if (d.size === "full") sfx.stage();
      else if (d.size === "big" || d.size === "chime") sfx.correct();

      const t = toToast(d, ++seq);
      if (!t) return;
      setToast(t);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setToast(null), HOLD[t.size]);
    };
    window.addEventListener("fluolingo:reward", onReward);
    return () => {
      window.removeEventListener("fluolingo:reward", onReward);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!toast) return null;
  const fill = `var(--dopa-${toast.role})`;
  const ink = `var(--dopa-${toast.role}-ink)`;
  const wash = `var(--dopa-${toast.role}-wash)`;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[95] flex justify-center px-4">
      <div
        key={toast.key}
        className="flex max-w-[min(26rem,92vw)] items-center gap-3 rounded-2xl border-2 bg-white px-5 py-3 shadow-[0_8px_28px_rgba(34,40,80,0.28)]"
        // The role's fill is the border and the icon's disc; the text stays
        // ink on white, so the banner is legible at every size. The four light
        // fills never carry text — that is the palette's own rule.
        style={{ borderColor: ink, animation: "reward-pop 0.35s ease-out" }}
        role="status"
        aria-live="polite"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl"
          style={{ background: toast.size === "full" ? fill : wash }}
          aria-hidden
        >
          {toast.icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-black" style={{ color: ink }}>{toast.title}</p>
          <p className="truncate text-xs font-bold text-[color:var(--cahier-ink-soft)]">{toast.sub}</p>
        </div>
      </div>
      <style>{`@keyframes reward-pop{0%{transform:translateY(-14px) scale(.9);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){[style*="reward-pop"]{animation:none!important}}`}</style>
    </div>
  );
}
