"use client";

/**
 * The activities of ONE stop.
 *
 * Dan, 2026-08-26: "one may access the activity through the map or through
 * the activity shortcut, if it is the latter, then go straight to the one
 * within the current stop. In other words, one must first choose the stop
 * before they can access the activity."
 *
 * That is a real change of model. The old Menu was a grid of all twenty
 * activities with no stop attached, so tapping one asked a second question
 * the learner had not been asked yet — which deck? This sheet cannot: it is
 * built from `deckActivityTabs(stop.collectionId)`, so every door in it is
 * already pointed at the stop the learner is on, and a stop that cannot run
 * an activity simply does not show it.
 *
 * Each row wears its DEMAND band (verify36) — what the activity asks of you,
 * not which menu family it files under. The name is always printed, so the
 * colour reinforces and never carries alone.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { deckActivityTabs } from "@/components/CahierShell";
import { bandOf } from "@/content/activities";

export default function StopSheet({
  stopId, topic, collectionId, onClose,
}: {
  stopId: string;
  topic: string;
  collectionId: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    // THE SHEET OWNS THE SCREEN (Dan, 2026-08-27: "why are there two sets of
    // links?", and "the pretest questions should not be sitting at the base of
    // four buttons, because it only belongs to one button"). Both are the same
    // fault seen twice: the page behind kept scrolling and reading through the
    // scrim, so the rail's activity flaps sat beside a list of activities, and
    // the pre-test's own questions ran on under the five numbered doors as
    // though they belonged to all of them. A sheet that says "do these, in
    // this order" cannot leave a competing list legible behind it.
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prev;
    };
  }, [onClose]);

  const tabs = deckActivityTabs(collectionId).filter((t) => t.href);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
      /* z-100, not 90: .cahier-bottombar is itself z-90, and on a tie the
         later element paints on top — so the bottom bar's five activity
         icons stayed lit above the scrim, which is half of "two sets of
         links" all by itself. */
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Activities at ${topic}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[color:var(--cahier-paper)] p-4 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] sm:rounded-3xl"
      >
        {/* The stop is NAMED at the top, because the whole point is that a
            stop was chosen first — the sheet is never "the activities", it is
            always "the activities HERE". */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="fluo-mono rounded-lg px-2 py-1 text-[11px] font-black text-white"
                style={{ background: "var(--dopa-focus)" }}>
            Stop {Number(stopId.slice(4, 7))}
          </span>
          <h2 className="cahier-hand min-w-0 flex-1 truncate text-xl leading-none text-[color:var(--cahier-ink)]">
            {topic}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
                  className="neo-key h-9 w-9 rounded-xl text-lg font-black text-[color:var(--cahier-ink)]">
            ✕
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {tabs.map((t) => {
            const band = bandOf(t.key);
            return (
              <li key={t.key}>
                <Link
                  href={t.href!}
                  className={`neo-key flex items-center gap-3 rounded-2xl px-3 py-3${band ? ` band-${band}` : ""}`}
                >
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl"
                        style={{ background: "var(--band, var(--cahier-paper-2))" }}>
                    {t.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-black text-[color:var(--cahier-ink)]">
                    {t.label}
                  </span>
                  <span aria-hidden className="text-lg font-black text-[color:var(--cahier-ink)]/45">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
