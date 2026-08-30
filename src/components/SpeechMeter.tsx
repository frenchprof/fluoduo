"use client";

/**
 * SpeechMeter — the live level meter under the mic (patch 31).
 *
 * WHY IT READS THE MIC. The design drew this as CSS keyframes: bars that
 * wiggle on a fixed timer whenever the recognizer is open. That animates
 * identically whether the learner is speaking, mumbling or silent, which is
 * the one thing a meter must not do — it would say "I hear you" while the
 * recognizer heard nothing, and the "(nothing heard)" verdict a moment later
 * would contradict it. So the bars are a rolling history of real RMS from a
 * parallel getUserMedia stream: flat means flat.
 *
 * The stream is opened only while `active` and released the moment it goes
 * false — SpeechRecognition holds its own capture, and two open streams past
 * the end of a turn is how a browser ends up with a permanently lit mic
 * indicator. If getUserMedia is unavailable or refused, the meter renders its
 * idle bars and says nothing: a silent honest meter beats a lying lively one.
 */

import { useEffect, useRef, useState } from "react";

const BARS = 21;
/** ~30fps — enough to read as live, a third of the renders of a rAF loop. */
const FRAME_MS = 33;
const IDLE: number[] = Array(BARS).fill(0);

export default function SpeechMeter({
  active,
  className = "",
  barWidth = 4,
  height = 26,
}: {
  active: boolean;
  className?: string;
  barWidth?: number;
  height?: number;
}) {
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  // The rolling buffer lives in a ref: it is written every frame and only
  // published to state at FRAME_MS, so a dropped frame costs nothing.
  const buf = useRef<number[]>(Array(BARS).fill(0));

  useEffect(() => {
    // No setState on the inactive path — the idle bars are DERIVED below, so
    // going quiet costs a render nobody scheduled (react-hooks/set-state-in-
    // effect, patch 24's rule).
    if (!active) return;

    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let stopped = false;
    let last = 0;

    const stop = () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close().catch(() => {});
      stream = null;
      ctx = null;
      buf.current = Array(BARS).fill(0);
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }

        const AC: typeof AudioContext =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);

        const tick = (t: number) => {
          if (stopped) return;
          raf = requestAnimationFrame(tick);
          if (t - last < FRAME_MS) return;
          last = t;
          analyser.getByteTimeDomainData(data);
          // RMS around the 128 midpoint, normalised to roughly 0..1. The ×4
          // gain puts ordinary speech near the top of the bar without
          // clipping every syllable flat.
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          const level = Math.min(1, rms * 4);
          buf.current = [...buf.current.slice(1), level];
          setLevels(buf.current);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        // Refused, busy, or unsupported — the idle bars stay. Nothing to say.
      }
    })();

    return stop;
  }, [active]);

  // Idle is derived, never stored: the moment `active` goes false the bars
  // are flat on the very next render, with no reset pass through state.
  const shown = active ? levels : IDLE;

  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      style={{ height }}
      aria-hidden
    >
      {shown.map((v, i) => (
        <span
          key={i}
          className="block rounded-[2px] transition-[transform,background-color] duration-75"
          style={{
            width: barWidth,
            height,
            transformOrigin: "center",
            // 0.18 is the resting sliver — a bar with no height at all reads
            // as a broken component rather than as silence.
            transform: `scaleY(${Math.max(0.18, v)})`,
            background: active ? "var(--drill-bad-mid)" : "var(--cahier-ink)",
            opacity: active ? 1 : 0.16,
          }}
        />
      ))}
    </div>
  );
}
