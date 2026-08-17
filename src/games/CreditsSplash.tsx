"use client";

/**
 * A brief credits splash (Dan, 2026-07-03) — shown ONCE PER BROWSER, not
 * once per launch (patch 23; audit: "the 3-second copyright interstitial
 * before every single game, every reload, forever … the first thing your app
 * says is © All rights reserved"). The first game a browser ever opens shows
 * it for ~3 s (tap to skip); every game after that starts at once. The gate
 * is `fluolingo:credits.seen` in localStorage — clear it to see the splash
 * again. `onDone` still fires exactly once either way, so games that hold
 * their first tile until the credits clear keep working unchanged.
 */

import { useEffect, useRef, useState } from "react";

export const CREDITS_SEEN_KEY = "fluolingo:credits.seen";

function seenBefore(): boolean {
  try {
    return window.localStorage.getItem(CREDITS_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(CREDITS_SEEN_KEY, "1");
  } catch {}
}

export default function CreditsSplash({
  game,
  emoji,
  onDone,
}: {
  game: string;
  emoji: string;
  onDone?: () => void;
}) {
  // null = not decided yet (prerender + first client paint agree: nothing).
  const [show, setShow] = useState<boolean | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    markSeen();
    setShow(false);
    onDoneRef.current?.();
  }

  useEffect(() => {
    // Decided after mount (localStorage): seen in this browser → no splash,
    // the game starts now; else show it, and clear it in ~3 s.
    const t = window.setTimeout(seenBefore() ? finish : () => setShow(true), 0);
    const t2 = window.setTimeout(finish, 3000);
    return () => { window.clearTimeout(t); window.clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <div
      onClick={finish}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:var(--cahier-ink)]/85 px-6 text-center backdrop-blur-sm"
    >
      <style>{`@keyframes csIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}`}</style>
      <div
        className="max-w-sm rounded-3xl border border-white/15 bg-[color:var(--cahier-ink)] px-7 py-8 shadow-2xl"
        style={{ animation: "csIn .45s ease both" }}
      >
        <div className="text-4xl" aria-hidden>{emoji}</div>
        <p className="mt-3 text-lg font-black leading-snug text-white">
          <span style={{ color: "var(--cahier-gold)" }}>{game}</span> is an original concept by{" "}
          <span className="whitespace-nowrap">Dr&nbsp;Daniel&nbsp;Chan</span>
        </p>
        <p className="mt-2 text-sm text-white/80">Mechanics and Music created using Claude</p>
        <p className="mt-3 text-xs text-white/50">© June 2026 — All rights reserved</p>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">tap to skip</p>
      </div>
    </div>
  );
}
