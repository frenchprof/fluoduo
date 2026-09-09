"use client";

/**
 * THE COURSE CHOICE — what ENTER opens on the front door.
 *
 * Dan, 2026-09-09: *"then a pop-up choice between several courses : French 1
 * (A1) / French 2 (A1) / French 3 (A2) / French 4 (A2) / ... Greyed out for
 * all except LAF1201 French 1."*
 *
 * The list lives in content/courses.ts, not here — opening French 2 is a
 * one-line edit there and this file does not change.
 *
 * IT USES THE APP'S OWN BUTTONS, and that is a lesson from the same day rather
 * than a preference. The picker pop-ups built that morning wore a `.neo-key`
 * style invented for them; Dan sent them back — *"can you make the buttons
 * like the others we have on the website"* — and the reason the fault was hard
 * to see is worth keeping: an unselected `.neo-key` is cream on a cream modal,
 * so one of the two options simply was not visible. `.fluo-btn` filled for the
 * live course, `.fluo-btn-ghost` outlined for the rest.
 *
 * A GREYED COURSE IS A REAL DISABLED BUTTON, not a div that looks like one.
 * `disabled` is what tells a screen reader it cannot be chosen and what stops
 * a keyboard reaching it; styling alone would announce four available courses
 * to someone who cannot see that three are pale.
 *
 * NO COURSE CODES ON SCREEN — Dan's answer when asked. LAF1201 is in the data,
 * out of the interface.
 */
import { COURSES, courseHref, type Course } from "@/content/courses";

export default function CoursePicker({ onClose }: { onClose: () => void }) {
  const go = (c: Course) => {
    // Read the host at CLICK time, not at render: the static export prerenders
    // this file on a build machine that knows nothing about which domain will
    // serve it.
    window.location.href = courseHref(c, window.location.hostname);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your course"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-[color:var(--cahier-ink)]/20 bg-[color:var(--cahier-paper-raised)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">
            Which course?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full px-2 text-lg leading-none text-[color:var(--cahier-ink)] opacity-60 transition hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {/* Two columns, per the standing rule that a stack of tappable rows
            never each wear the page's width. Four courses land as 2x2. */}
        <div className="grid grid-cols-2 gap-2.5">
          {COURSES.map((c) => (
            <button
              key={c.key}
              type="button"
              disabled={!c.live}
              onClick={() => c.live && go(c)}
              aria-label={c.live ? `${c.name}, level ${c.level}` : `${c.name}, level ${c.level} — not open yet`}
              className={`flex flex-col items-center gap-0.5 px-2 py-3 ${
                c.live ? "fluo-btn" : "fluo-btn-ghost cursor-not-allowed opacity-45"
              }`}
            >
              <span className="text-sm font-black">{c.name}</span>
              <span className="text-[11px] font-bold opacity-75">{c.level}</span>
            </button>
          ))}
        </div>

        {/* Says why three of the four cannot be pressed. Without it a learner
            reads the greying as a fault in the page rather than a fact about
            the course. */}
        <p className="mt-4 text-center text-[11px] font-bold text-[color:var(--cahier-ink-soft)]">
          French 2–4 open as each course is written.
        </p>
      </div>
    </div>
  );
}
