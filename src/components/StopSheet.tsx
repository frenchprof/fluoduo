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
 * Each row wears its FAMILY's colour (11 Sep, with the strips and the ☰ and
 * the goal card's doors) — not what the activity demands, which is what it used
 * to say. The name is always printed, so the colour reinforces and never
 * carries alone.
 *
 * NOTHING RENDERS THIS TODAY, and verify37 believes otherwise. Its note says
 * "StopSheet.tsx itself stays for /map's deep-link popup path"; grepped on
 * 11 Sep, no file imports this one — the goal CARD (components/GoalCard.tsx)
 * is what a learner meets, and it draws the same doors. Recorded rather than
 * acted on: whether the file goes is a decision for whoever owns the map's
 * popup, not for a colour change. It is moved with the others rather than
 * left behind, because a dead file on the old axis is how the old axis comes
 * back the day someone revives it.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { deckActivityTabs } from "@/components/CahierShell";
import ActivityIcon from "@/components/ActivityIcon";
import { familyOf } from "@/content/activities";
import { SIOS } from "@/content/sios";

export default function StopSheet({
  stopId, topic, collectionId, onClose,
}: {
  stopId: string;
  topic: string;
  collectionId: string;
  onClose: () => void;
}) {
  // THE SIO IN FULL (Dan, 2026-08-29: the stop should open to "(1) the SIO in
  // full, (2) the app icons. that's all"). The sheet already had the icons and
  // the English topic; the objective itself was missing, so the learner saw
  // six doors and no statement of what the stop is FOR.
  //
  // What "in full" is, and what it is not: the French title (`fr`) and the
  // can-do, which are the learner's own words for the goal. NOT `competence`
  // — that is the grading wording (">=8/10 situations"), which has never been
  // shown to a learner and is not going to start here.
  const sio = SIOS.find((x) => x.id === stopId);
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
            Goal {Number(stopId.slice(4, 7))}
          </span>
          <h2 className="cahier-hand min-w-0 flex-1 truncate text-xl leading-none text-[color:var(--cahier-ink)]"
              lang={sio?.fr ? "fr" : undefined}>
            {sio?.fr ?? topic}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
                  className="neo-key h-9 w-9 rounded-xl text-lg font-black text-[color:var(--cahier-ink)]">
            ✕
          </button>
        </div>

        {/* The English map label rides under the French one, small, the way
            the pre-lesson list prints the pair — and the can-do under that.
            `topic` is the fallback heading when a stop has no `fr`, so it is
            only repeated here when it is NOT already the heading. */}
        {sio && (
          <div className="mb-3">
            {sio.fr && (
              <p className="cahier-hand text-[13px] leading-tight text-[color:var(--cahier-ink)]/55">
                {sio.short}
              </p>
            )}
            <p className="mt-1.5 border-t border-[color:var(--cahier-rule)] pt-2 text-[13.5px] leading-snug text-[color:var(--cahier-ink)]">
              {sio.canDo}
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {tabs.map((t) => {
            const fam = familyOf(t.key);
            return (
              <li key={t.key}>
                <Link
                  href={t.href!}
                  className={`neo-key flex items-center gap-3 rounded-2xl px-3 py-3${fam ? ` fam-${fam}` : ""}`}
                >
                  <ActivityIcon activityKey={t.key} emoji={t.emoji} />
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
