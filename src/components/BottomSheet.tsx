"use client";

/**
 * BottomSheet — the one sheet (patch 23).
 *
 * A panel that slides up from the bottom edge, over whatever is on screen,
 * and closes on ✕, on a tap outside, or on Escape. Games use it for the ⋯
 * menu and for Help; the game galleries use it for « Choisir un autre »
 * (audit: "Replace each gallery with one card … plus Choisir un autre opening
 * the grid as a bottom sheet").
 *
 * WHY A SHEET, NOT A CENTRED MODAL: on a phone the thumb lives at the bottom.
 * A sheet's close affordance and its first rows sit where the thumb already
 * is; a centred dialog asks for a reach. On a desktop the same sheet is a
 * centred card pinned to the bottom third — one component, one behaviour.
 *
 * Tokens only (verify19b ratchet).
 */

import { useEffect, type ReactNode } from "react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** One short line, or nothing — the sheet's content is its own title. */
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[color:var(--cahier-ink)]/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="game-sheet flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-2xl border-2 border-b-0 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] shadow-[var(--shadow-card)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), var(--bottombar-floor, 0px))" }}
      >
        <div className="flex shrink-0 items-center gap-2 px-4 pt-2">
          {/* the grab handle — a sheet's visual signature */}
          <span aria-hidden className="mx-auto mb-1 block h-1.5 w-10 rounded-full bg-[color:var(--cahier-line-strong)]" />
        </div>
        <div className="flex shrink-0 items-center gap-2 px-4 pb-2">
          {title ? (
            <p className="min-w-0 flex-1 truncate text-sm font-black text-[color:var(--cahier-ink)]">{title}</p>
          ) : (
            <span className="flex-1" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
