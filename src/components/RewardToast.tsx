"use client";

/**
 * Global reward celebration. Listens for the `fluolingo:reward` events that the
 * economy (lib/progress) dispatches on a level-up or a newly-earned badge, and
 * shows a brief banner with confetti + fanfare (sfx.stage). Mounted once in the
 * root layout so ANY action that earns a reward — a drill answer, a café
 * conversation, marking a SIO done — celebrates, wherever the learner is.
 */
import { useEffect, useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { badgeById } from "@/lib/economy";

type Toast = { key: number; icon: string; title: string; sub: string };

export default function RewardToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let seq = 0;
    let hideTimer: number | null = null;
    const onReward = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type: string; level?: number; id?: string };
      let t: Toast | null = null;
      if (detail.type === "level" && detail.level != null) {
        t = { key: ++seq, icon: "🎚️", title: `Level ${detail.level}!`, sub: "You've ranked up" };
      } else if (detail.type === "badge" && detail.id) {
        const b = badgeById(detail.id);
        if (b) t = { key: ++seq, icon: b.icon, title: "Badge unlocked!", sub: `${b.label} · 💎 +${b.gems}` };
      }
      if (!t) return;
      setToast(t);
      sfx.stage(); // fanfare + site-wide confetti
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setToast(null), 3200);
    };
    window.addEventListener("fluolingo:reward", onReward);
    return () => {
      window.removeEventListener("fluolingo:reward", onReward);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[95] flex justify-center px-4">
      <div
        key={toast.key}
        className="flex items-center gap-3 rounded-2xl border-2 border-[color:var(--cahier-ink,#2a2e6e)] bg-white px-5 py-3 shadow-[0_8px_28px_rgba(34,40,80,0.28)]"
        style={{ animation: "reward-pop 0.35s ease-out" }}
      >
        <span className="text-3xl" aria-hidden>{toast.icon}</span>
        <div>
          <p className="text-base font-black text-[color:var(--cahier-ink,#2a2e6e)]">{toast.title}</p>
          <p className="text-xs font-bold text-[color:var(--cahier-ink-soft,#6a6e96)]">{toast.sub}</p>
        </div>
      </div>
      <style>{`@keyframes reward-pop{0%{transform:translateY(-14px) scale(.9);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}`}</style>
    </div>
  );
}
