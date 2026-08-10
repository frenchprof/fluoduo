"use client";

/**
 * DrillShell — ONE shell for every drill (patch 20–21).
 *
 * Before this, the same four jobs — progress, feedback, primary action, exit —
 * were re-implemented in every activity: three page shells, eight drill
 * layouts, six game HUDs. That is why Match It's Restart was off-screen, why
 * Dice's options fell below the fold, and why the app felt like six student
 * projects. The four /practice/* drill routes didn't even render a drill:
 * they rendered the whole unit map and opened a resizable popup on top of it,
 * spending 36–44% of a phone before the first question.
 *
 *   ┌────────────────────────────────────────┐  56px, static
 *   │  ✕      ▓▓▓▓▓▓▓░░░░░░░░░░      12/20   │
 *   ├────────────────────────────────────────┤
 *   │              ONE ITEM                  │  flex-1, max-w-600, centred,
 *   │         (prompt + input only)          │  never a nested scroller
 *   ├────────────────────────────────────────┤
 *   │  ✓ Correct!            [ CONTINUE ]    │  tray slides up, OVERLAYS,
 *   └────────────────────────────────────────┘  never pushes content
 *
 * RULES THE SHELL ENFORCES, so no drill can break them again:
 *   · Exactly one full-width primary button at a time. A `secondary` renders
 *     40/60 beside it. There is NO API for stacking two.
 *   · Feedback never reflows the body — the tray is absolutely positioned
 *     over the footer.
 *   · The body slot hides any <h1> a drill tries to print.
 *   · Enter (and Space, outside a text field) fire the visible CTA — the
 *     tray's when it is up, the base one otherwise. One binding, defined here.
 *
 * NO HEARTS. The audit sketch drew ♥♥♡ in the top-right, but hearts/lives
 * lockout is on the REFUSED list of the settled gamification decisions
 * (TODO.md §6) and lives were already removed from every curriculum drill.
 * The right slot carries the progress counter / score — the learner feedback
 * Dan's litmus rule keeps.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SIOS } from "@/content/sios";

export type DrillCta = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export type DrillFeedback = {
  kind: "correct" | "wrong";
  /** What to show beside the verdict — the expected answer, a 🔊, an example.
   *  Keep it to one line-ish; it must not need to scroll. */
  body?: ReactNode;
  /** The tray's own CTA (Continue / Next). While the tray is up this is THE
   *  visible primary — the base `cta` underneath is inert and hidden. */
  cta: DrillCta;
};

/** Where a drill's ✕ leads: the deck's unit on the path, or the Index for
 *  decks outside the spine. One rule, every drill. */
export function drillExitHref(collectionId: string): string {
  const sio = SIOS.find((s) => s.collectionId === collectionId);
  return sio ? `/unit/${sio.unit}` : "/activities";
}

export default function DrillShell({
  exitHref,
  progress,
  right,
  cta,
  secondary,
  feedback,
  children,
}: {
  /** The ✕. Always present — a drill you cannot leave is a trap. */
  exitHref: string;
  /** null hides the bar (e.g. on a done screen). */
  progress: { done: number; total: number } | null;
  /** Top-right slot: score counter and the like. NOT hearts — see header. */
  right?: ReactNode;
  /** The one primary action ("Check"). null = no base CTA (body owns flow,
   *  e.g. tap-an-option drills before anything is picked). */
  cta?: DrillCta | null;
  /** Optional 40/60 companion (Skip, Reveal). Renders BESIDE the primary. */
  secondary?: DrillCta | null;
  /** When set, the tray slides up over the footer. */
  feedback?: DrillFeedback | null;
  children: ReactNode;
}) {
  // ONE key binding for every drill: Enter fires the visible CTA anywhere;
  // Space fires it too, except while typing in a field (a typed space is a
  // space). The tray's CTA wins while the tray is up.
  const liveCta = feedback ? feedback.cta : cta;
  const liveRef = useRef(liveCta);
  liveRef.current = liveCta;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A body that handled the key itself (ÉcouTexte's per-word blanks mark
      // their sentence on Enter) preventDefaults it — the shell stands down.
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      const typing =
        !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key !== "Enter" && !(e.key === " " && !typing)) return;
      // Let a focused button/link keep its own native Enter/Space.
      if (!typing && t && (t.tagName === "BUTTON" || t.tagName === "A")) return;
      const c = liveRef.current;
      if (!c || c.disabled) return;
      e.preventDefault();
      c.onClick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[color:var(--cahier-paper)]">
      {/* ── the 56px bar ─────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-[color:var(--cahier-ink)]/10 px-3 sm:px-5">
        <Link
          href={exitHref}
          aria-label="Quitter"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
        >
          ✕
        </Link>
        {progress ? (
          <div
            className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[color:var(--cahier-ink)]/10"
            role="progressbar"
            aria-valuenow={progress.done}
            aria-valuemin={0}
            aria-valuemax={progress.total}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {right && (
          <div className="cahier-mono shrink-0 text-sm font-bold text-[color:var(--cahier-ink)]/70">
            {right}
          </div>
        )}
      </div>

      {/* ── one item, centred; stray <h1>s are swallowed ─────────────── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 [&_h1]:hidden">
        <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center py-4">
          {children}
        </div>
      </div>

      {/* ── footer: base CTA row, with the tray OVERLAYING it ────────── */}
      <div className="relative shrink-0 border-t-2 border-[color:var(--cahier-ink)]/10">
        <div className="mx-auto grid w-full max-w-[600px] grid-cols-5 gap-2 px-4 py-3">
          {secondary && !feedback && (
            <button
              type="button"
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className="cahier-btn col-span-2 justify-center disabled:opacity-40"
            >
              {secondary.label}
            </button>
          )}
          <button
            type="button"
            onClick={cta?.onClick}
            disabled={!cta || cta.disabled || !!feedback}
            className={`cahier-btn cahier-btn-primary justify-center disabled:opacity-40 ${secondary && !feedback ? "col-span-3" : "col-span-5"} ${!cta && !feedback ? "invisible" : ""}`}
          >
            {cta?.label ?? "…"}
          </button>
        </div>

        {feedback && (
          <div
            className={`absolute inset-x-0 bottom-0 animate-[drill-tray_.18s_ease-out] border-t-2 ${
              feedback.kind === "correct"
                ? "border-emerald-300 bg-emerald-50"
                : "border-rose-300 bg-rose-50"
            }`}
          >
            <div className="mx-auto flex w-full max-w-[600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <p
                className={`min-w-0 flex-1 text-sm font-black ${
                  feedback.kind === "correct" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                <span className="mr-1.5" aria-hidden>{feedback.kind === "correct" ? "✓" : "✗"}</span>
                {feedback.body}
              </p>
              <button
                type="button"
                onClick={feedback.cta.onClick}
                disabled={feedback.cta.disabled}
                className={`cahier-btn shrink-0 justify-center font-black ${
                  feedback.kind === "correct" ? "cahier-btn-primary" : "!border-rose-700 !bg-rose-600 !text-white"
                }`}
              >
                {feedback.cta.label}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
