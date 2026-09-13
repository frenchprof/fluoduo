"use client";

/**
 * The messenger thread — shared by ChaTutor and ComposeIt's dialogue mode.
 *
 * Dan, 2026-09-13: *"the interface for all things chat-related ChaTutor and
 * ComposeIt please adopt the UI UX of how modern messenger works !"*
 *
 * WHY ONE COMPONENT AND NOT TWO TIDY-UPS. The two surfaces had each grown a
 * chat by hand and had already drifted in ways nobody chose: ChaTutor glued
 * the persona emoji to the front of the reply's TEXT (so it was part of what
 * you copied), ComposeIt put it in its own span; ChaTutor sent on Enter,
 * ComposeIt only on a button; neither pinned its input, so on a long
 * conversation the place you type scrolled off the bottom of the page. A
 * second hand-rolled tidy-up would have drifted again by the next session.
 *
 * WHAT THIS DOES THAT NEITHER DID:
 *   · GROUPS a run of messages from one side — the face is drawn once, the
 *     gaps tighten, and only the last bubble of the run wears a tail. That
 *     grouping is most of what makes a thread readable at a glance;
 *   · keeps the SCROLL here rather than on the page, so the composer below it
 *     never leaves the screen;
 *   · follows the newest message, but ONLY when the reader is already at the
 *     bottom — scroll up to re-read and the view stays put, with a pill
 *     offering to take you back. Yanking someone away from the line they are
 *     reading is the classic chat-UI sin;
 *   · shows waiting as three bobbing dots in a bubble instead of the word "…".
 *
 * Message bodies arrive as NODES, already rendered by the caller: ChaTutor's
 * are bilingual-coloured, ComposeIt's are plain French. That is the whole of
 * what differs between the two surfaces, which is why it is the only thing
 * this component does not decide.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ChatMessage = {
  /** Stable within a render pass; the index is fine for an append-only log. */
  key: string;
  /** Which side of the thread. "them" gets the avatar and the left tail. */
  side: "them" | "me";
  /** The rendered message. NOT a string: ChaTutor colours its French. */
  body: ReactNode;
  /** Epoch ms. Shown under the last bubble of a run; omit for no time. */
  at?: number;
  /** Controls for this message (listen, listen slowly…), shown in the meta
   *  row beside the time. Kept OUT of the bubble so the text stays copyable. */
  actions?: ReactNode;
};

/** Consecutive messages from one side become one run. */
function toRuns(messages: ChatMessage[]): ChatMessage[][] {
  const runs: ChatMessage[][] = [];
  for (const m of messages) {
    const last = runs[runs.length - 1];
    if (last && last[0].side === m.side) last.push(m);
    else runs.push([m]);
  }
  return runs;
}

const hhmm = (ms: number) =>
  new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export default function ChatThread({
  messages,
  typing = false,
  avatar,
  intro,
  className = "",
}: {
  messages: ChatMessage[];
  /** Their reply is on its way — three dots in a bubble. */
  typing?: boolean;
  /** The face for "them": an emoji, or anything that fits a round 1.75rem box. */
  avatar?: ReactNode;
  /** What this conversation is — the note a messenger shows at the head of a
   *  new thread. It scrolls WITH the thread rather than living in the header,
   *  which matters because ComposeIt's scene is four lines long and the
   *  header is one: clamping it there would have hidden part of the task, and
   *  the task is the one thing Dan's collapse rule says may never be hidden. */
  intro?: ReactNode;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  /* "At the bottom" has to be fuzzy: sub-pixel layout and a growing composer
     mean scrollTop rarely lands exactly on the maximum, and a strict compare
     would leave the pill showing forever on a thread nobody has scrolled. */
  const nearBottom = (el: HTMLElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < 48;

  const jump = (smooth = true) => {
    const el = boxRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  // Follow the newest message — but only if the reader had not scrolled up.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (nearBottom(el) || atBottom) jump();
    // `atBottom` is read, not depended on: re-running when the pill toggles
    // would scroll the reader down the instant they scrolled up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typing]);

  return (
    <div
      ref={boxRef}
      className={`msgr-thread ${className}`}
      onScroll={(e) => setAtBottom(nearBottom(e.currentTarget))}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {intro && <div className="msgr-intro">{intro}</div>}
      {toRuns(messages).map((run) => {
        const them = run[0].side === "them";
        return (
          <div key={run[0].key} className={`msgr-run ${them ? "is-them" : "is-me"}`}>
            {them && (
              <span className="msgr-avatar" aria-hidden>
                {avatar}
              </span>
            )}
            <div className="msgr-stack">
              {run.map((m, i) => {
                /* THE TIME BELONGS TO THE RUN, THE CONTROLS TO THE MESSAGE.
                   A messenger stamps a run once, at its foot — stamping every
                   bubble is what makes a hand-rolled chat look like a log
                   file. But "listen to this line" is per line and cannot be
                   hidden behind a long-press in a language app, so a message
                   that carries controls gets its own meta row wherever it
                   sits in the run. */
                const isLast = i === run.length - 1;
                const meta = m.actions || (isLast && m.at);
                return (
                  <div key={m.key} className="contents">
                    <div
                      lang="fr"
                      className={`msgr-bubble${i === 0 ? " is-first" : ""}${isLast ? " is-last" : ""}`}
                    >
                      {m.body}
                    </div>
                    {meta && (
                      <div className="msgr-meta">
                        {m.actions}
                        {isLast && m.at && <span className="msgr-time">{hhmm(m.at)}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {typing && (
        <div className="msgr-run is-them">
          <span className="msgr-avatar" aria-hidden>
            {avatar}
          </span>
          <div className="msgr-stack">
            <div className="msgr-bubble is-first is-last msgr-typing" aria-label="…">
              <i /><i /><i />
            </div>
          </div>
        </div>
      )}

      {!atBottom && (
        <button type="button" className="msgr-jump" onClick={() => jump()}>
          ↓ Newest
        </button>
      )}
    </div>
  );
}
