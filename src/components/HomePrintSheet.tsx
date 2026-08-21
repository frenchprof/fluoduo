"use client";

/**
 * The printable course map (patch 25, 2026-08-17): the 50 stops on ONE A4
 * portrait page — one row per region/unit, a QR per unit that opens that
 * unit on the phone (`/?unit=N`), each stop as a small kind-coloured ring
 * with its number (✓ when done) and short label, the 🏁 final last.
 *
 * Screen: nothing (display none). Print: this is the only thing on the page —
 * globals.css hides every other child of <body> under @media print, which is
 * why the sheet portals straight into <body>. Colours are the same KIND_COLOR
 * tokens as the map; `print-color-adjust: exact` keeps them on paper.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SIOS, UNIT_META } from "@/content/sios";
import { CHAPTERS } from "@/content/chapters";
import { sioKind } from "@/content/sioKinds";
import { isSioDone, type Progress } from "@/lib/progress";
import { qrEncode, qrPath } from "@/lib/qr";
import { KIND_COLOR, REGIONS, KindLegend } from "@/components/HomeMap";

function Qr({ text, size }: { text: string; size: number }) {
  const m = useMemo(() => qrEncode(text), [text]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${m.size} ${m.size}`} role="img" aria-label={text} shapeRendering="crispEdges">
      <path d={qrPath(m)} fill="currentColor" />
    </svg>
  );
}

export default function HomePrintSheet({ progress }: { progress: Progress }) {
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => {
    // The QR must point at THIS deployment (fluolingo.com in production, a
    // preview URL on a preview) — read it, do not hard-code it.
    setOrigin(window.location.origin);
  }, []);
  if (!origin) return null;

  return createPortal(
    <div className="home-print" aria-hidden>
      <div className="flex items-baseline justify-between border-b pb-1" style={{ borderColor: "var(--cahier-line-strong)" }}>
        <span className="fluo-serif text-base font-black">FluOlinGo · French A1 · course map</span>
        <span className="text-[9px]" style={{ color: "var(--cahier-ink-soft)" }}>{origin.replace(/^https?:\/\//, "")}</span>
      </div>
      {REGIONS.map((r) => {
        const sios = SIOS.filter((s) => s.unit === r.unit);
        const done = sios.filter((s) => isSioDone(s.id, progress)).length;
        return (
          <div key={r.unit} className="mt-2 flex items-start gap-3 rounded-xl px-2 py-1.5" style={{ background: `var(--region-${r.key}-band)`, breakInside: "avoid" }}>
            <div className="flex w-[82px] shrink-0 flex-col items-center">
              <Qr text={`${origin}/carte?unit=${r.unit}`} size={78} />
              <span className="fluo-mono mt-0.5 text-[8px] font-bold">{UNIT_META[r.unit].label} · {done}/{sios.length}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5 text-[13px] font-black">
                <span className="grid h-4 w-4 place-items-center rounded-full" style={{ background: "var(--cahier-paper-raised)" }}>{r.icon(13)}</span>
                {r.place}
                <span lang="fr" className="font-bold" style={{ color: "var(--cahier-ink-soft)" }}>· {CHAPTERS[r.unit].scenario}</span>
              </div>
              <div className="grid grid-cols-5 gap-x-1.5 gap-y-1">
                {sios.map((s) => {
                  const d = isSioDone(s.id, progress);
                  const c = KIND_COLOR[sioKind(s.id)];
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 text-[9px] font-black" style={{ borderColor: c, background: d ? c : "var(--cahier-paper-raised)", color: d ? "var(--cahier-paper-raised)" : "var(--cahier-ink)" }}>
                        {d ? "✓" : s.num}
                      </span>
                      <span className="truncate text-[10px] font-bold leading-tight">{s.short}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div className="mt-2 flex items-center gap-3 rounded-xl px-2 py-1.5" style={{ background: "var(--cahier-line)" }}>
        <div className="flex w-[82px] shrink-0 flex-col items-center">
          <Qr text={`${origin}/practice/grammarathon/finale`} size={78} />
          <span className="fluo-mono mt-0.5 text-[8px] font-bold">🏁 Final</span>
        </div>
        <span className="text-[13px] font-black">GramMarathon Arena</span>
      </div>
      <KindLegend />
    </div>,
    document.body,
  );
}
