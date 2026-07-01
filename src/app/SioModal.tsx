"use client";

/**
 * The shared popup chrome for a SIO — used by every unit now (Dan, 2026-07-01:
 * "We should adopt what we did for Unit 0 for the Units 1 to 4 too"). Just a
 * header (id + topic + close) and a body slot; callers decide what goes in
 * the body (MCQs for Unit 0, Pre-Test Prep / Post-Class Practice buttons for
 * Units 1-4).
 */
import type { ReactNode } from "react";
import type { Sio } from "@/content/sios";

export default function SioModal({
  sio,
  onClose,
  children,
}: {
  sio: Sio;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 bg-[var(--fluo-card)] p-5"
        style={{ borderColor: "var(--fluo-card-accent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="fluo-mono rounded-md bg-[var(--fluo-card-tint)] px-2 py-0.5 text-xs font-bold text-[color:var(--fluo-ink)]">
              {sio.id}
            </span>
            <h2 className="fluo-readable mt-1 text-xl font-bold text-[color:var(--fluo-ink)]">{sio.topic}</h2>
          </div>
          <button type="button" onClick={onClose} className="fluo-btn fluo-btn-sm" aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
