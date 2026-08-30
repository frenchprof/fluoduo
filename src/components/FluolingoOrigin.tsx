"use client";

/**
 * Where the name comes from (Dan's spec, 2026-08-30).
 *
 *   Fluency {achieved} on {customisable} linguistic goals  ->  Fluolingo
 *
 * A mount point, and nothing else. The stages, beats and layout arithmetic are
 * in `src/lib/fluolingoOrigin.ts`; the renderer is `fluolingoOriginRender.ts`,
 * which is plain DOM so the same code can be compiled into a standalone page
 * (`scripts/build-origin-html.mjs`). Keep it that way: an animation this fussy
 * would drift inside a week if it were written twice.
 */

import { useEffect, useRef } from "react";
import { STAGES, stageText } from "@/lib/fluolingoOrigin";
import { mountOrigin, type OriginHandle, type OriginOptions } from "@/lib/fluolingoOriginRender";

export type FluolingoOriginProps = OriginOptions & { className?: string };

export default function FluolingoOrigin({
  className = "",
  growth = 0.07,
  maxSize = 68,
  loop = true,
}: FluolingoOriginProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handle = useRef<OriginHandle | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const h = mountOrigin(host, { growth, maxSize, loop });
    handle.current = h;
    return () => {
      h.destroy();
      handle.current = null;
    };
  }, [growth, maxSize, loop]);

  return (
    <div
      ref={hostRef}
      onClick={() => handle.current?.replay()}
      role="img"
      aria-label={`${stageText(STAGES[0])} — ${stageText(STAGES[4])}`}
      className={`fluo-serif relative w-full overflow-hidden font-black ${className}`}
      style={{
        background: "var(--fluo-origin-ground)",
        color: "var(--fluo-ink)",
        contain: "layout paint",
      }}
    />
  );
}
