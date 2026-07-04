"use client";

/**
 * A brief credits splash shown for ~3s when a game first opens, then it steps
 * aside and the game begins (Dan, 2026-07-03). Tap to skip. `onDone` fires
 * once, when the splash clears — games use it to hold off starting until the
 * credits have shown.
 */

import { useEffect, useRef, useState } from "react";

export default function CreditsSplash({
  game,
  emoji,
  onDone,
}: {
  game: string;
  emoji: string;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(true);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setShow(false);
    onDone?.();
  }

  useEffect(() => {
    const t = window.setTimeout(finish, 3000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <div
      onClick={finish}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 px-6 text-center backdrop-blur-sm"
    >
      <style>{`@keyframes csIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}`}</style>
      <div
        className="max-w-sm rounded-3xl border border-white/15 bg-slate-900/95 px-7 py-8 shadow-2xl"
        style={{ animation: "csIn .45s ease both" }}
      >
        <div className="text-4xl" aria-hidden>{emoji}</div>
        <p className="mt-3 text-lg font-black leading-snug text-white">
          <span style={{ color: "#ffd34d" }}>{game}</span> is an original concept by{" "}
          <span className="whitespace-nowrap">Dr&nbsp;Daniel&nbsp;Chan</span>
        </p>
        <p className="mt-2 text-sm text-white/80">Mechanics and Music created using Claude</p>
        <p className="mt-3 text-xs text-white/50">© June 2027 — All rights reserved</p>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">tap to skip</p>
      </div>
    </div>
  );
}
