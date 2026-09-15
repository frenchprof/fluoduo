"use client";

/**
 * WHAT'S NEW — once, on Home, and never again.
 *
 * Dan, 2026-09-15: *"help me add a one-time pop-up on the home page : What's
 * new (15 Sep 2026) — include the latest changes"*.
 *
 * ── WHY IT IS ON /home AND NOT ON / ──────────────────────────────────────
 * The root is the welcome DOOR, and its whole point is the unobstructed map
 * horizon: *"You are COMPLETELY blocking the view of my winding road horizon,
 * which is the WHOLE POINT of this page"* (Dan, 8 Sep, sending back the
 * blurred panel that covered it). A card over that page would be the same
 * mistake with a different fill. `/home` is the dashboard a learner actually
 * arrives at, so that is where news belongs.
 *
 * ── WHAT COUNTS AS A LINE ─────────────────────────────────────────────────
 * Only changes a LEARNER can see. The outlined key, the merge order, the
 * check numbers and the lock-up in the cue's measuring loop were the bulk of
 * this week's work and none of them belongs here — nobody opens a What's New
 * to read that a regression was avoided. Dan's litmus test, applied to a
 * changelog: a line that does not change what you would DO next is redundant.
 *
 * ── THE KEY IS THE DATE, WHICH IS THE WHOLE DESIGN ────────────────────────
 * `fluolingo:whatsnew.2026-09-15`. The next edition is a new entry in `NEWS`
 * with its own date, and the pop-up comes back by itself for everybody —
 * nobody has to remember to clear anything. It also means a learner who has
 * dismissed THIS one never sees it again, which is what "one-time" has to
 * mean to be worth building.
 *
 * ── IT OPENS FROM AN EFFECT ───────────────────────────────────────────────
 * `output: "export"` prerenders every page, so localStorage does not exist
 * when this renders on the server. Starting CLOSED and opening after mount is
 * the only order that does not flash the card at a learner who dismissed it
 * last week — the same reason FirstRunHint is built this way.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** The current edition. A new one is a new object, and the date IS the key.
 *
 *  POINT FORM, AND SHORT (Dan, 2026-09-15: *"The notification is too long. Cut
 *  to the essential chase. IN point form"*). The first cut wrote a sentence or
 *  two per item — what changed AND why AND what it used to do. That is a
 *  changelog entry, not a notification: nobody opens a bell to read prose.
 *  Each line now says the thing and stops, which is Dan's own litmus test
 *  applied to news — if the rest of the sentence does not change what you
 *  would do next, it is redundant. */
const NEWS = {
  date: "2026-09-15",
  heading: "What's new",
  shown: "15 Sep 2026",
  items: [
    { emoji: "💎", text: "Free gems for every bug you report — tap the 🐞" },
    /* HELD BACK UNTIL THE WORK IS LIVE (Dan, 2026-09-15: *"can you wait to
       ship the notification about the updated Revision path"*, then *"add that
       the write segment is now the texts segmenet with the addition of
       G-Compris!"*). Both of these describe the peers lane's PR 376 — the
       Write family renamed to Texts, G-Compris! joining it, and the revision
       path rescoped to stops 1–30. This whole card therefore ships AFTER that
       merge, not before: a What's New that announces a screen a learner cannot
       find yet is worse than no What's New, because they go looking. */
    { emoji: "📖", text: "Write is now Texts — and G-Compris! joins it: read a note, a postcard, a voicemail, then answer" },
    { emoji: "🔄", text: "The revision path is rebuilt around Test 1 — stops 1 to 30 only" },
    { emoji: "🤍", text: "Heart on every coloured band — tap to save a page" },
    { emoji: "🔢", text: "NumBus has its pictures back" },
    { emoji: "📖", text: "Both guides fold — one screen each" },
    { emoji: "⬇", text: "« Next part is below » is tappable now" },
    { emoji: "✕", text: "Closing takes you back where you came from" },
    { emoji: "🇬🇧", text: "GramMarathon's last clue is the English" },
    { emoji: "🔐", text: "LexicaLocker: smaller chests, belt right under them" },
  ],
} as const;

const KEY = `fluolingo:whatsnew.${NEWS.date}`;

/** Has this edition been read? The 🔔 asks this to decide its dot, and it is
 *  the same key the card writes, so the two can never disagree. */
export function newsUnread(): boolean {
  try { return window.localStorage.getItem(KEY) !== "1"; } catch { return false; }
}

/** Fired when the card is dismissed, so the 🔔 drops its dot without a reload
 *  (`storage` does not fire in the document that wrote the value). */
export const NEWS_EVENT = "fluolingo:whatsnew";


export default function WhatsNew({ openNow, onClose }: { openNow?: boolean; onClose?: () => void } = {}) {
  /* TWO WAYS IN, ONE STATE, AND IT IS DERIVED RATHER THAN MIRRORED.
     `selfOpen` is the once-per-edition arrival; `openNow` is the 🔔. The first
     version copied `openNow` into state from an effect, which is the classic
     prop-mirror: it renders once closed, then again open, and the two can
     drift the moment anything else touches the state. An `||` cannot drift. */
  const [selfOpen, setSelfOpen] = useState(false);
  const open = openNow || selfOpen;
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // DECLARED BEFORE THE EFFECT THAT USES IT. The Escape handler below closes
  // over this, and a `const` arrow read from an effect defined above it is a
  // use-before-declaration the linter is right to refuse.
  const dismiss = useCallback(() => {
    setSelfOpen(false);
    try { window.localStorage.setItem(KEY, "1"); } catch { /* nothing to remember it with */ }
    window.dispatchEvent(new Event(NEWS_EVENT));
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    /* IT OPENS ITSELF ON HOME AND NOWHERE ELSE (Dan, 2026-09-15: *"a one-time
       pop-up on the home page"*). The 🔔 that carries this card lives in the
       SITE BAR, which is on every page — so without this line the card let
       itself into the middle of a drill. Driven on the built app it covered
       « Show me » on four activity routes and verify220 went red for precisely
       the reason that check exists: two prompts, one screen.

       The BELL stays everywhere; that is what a bell is for. Only the
       arriving-unbidden belongs to Home. */
    if (window.location.pathname.replace(/\/$/, "") !== "/home") return;

    // localStorage cannot be read during render on a static export, so whether
    // this opens is not knowable until after mount. The accepted resolution in
    // this repo, with the reason written out (AGENTS.md).
    //
    // Showing it is the SAFER failure when storage throws (private mode, site
    // data blocked): the news once a visit beats the news never.
    let show = true;
    try { show = window.localStorage.getItem(KEY) !== "1"; } catch { show = true; }

    /* AND IT STANDS DOWN IF SOMETHING ELSE IS ALREADY ASKING. Driven on the
       built app, the first version of this card opened ON TOP of « ✨ First
       time here? Quick tour! » — two prompts, from two systems, on one cold
       arrival. That is the exact fault verify220 was written for on 11 Sep,
       committed again by the component announcing that it had been fixed.

       Nothing is lost when it stands down: the unread dot stays on the 🔔, so
       the news is one tap away instead of in the learner's face on the one
       screen where they are already being asked something. */
    if (!show) return;

    /* AND IT WATCHES A WINDOW, RATHER THAN LOOKING ONCE — which is the second
       version of this guard, because the first one did not work and looked as
       though it did. Every other prompt on this screen opens from ITS OWN
       mount effect after reading localStorage, so at the instant this effect
       runs there is no dialog in the document yet. Checking once found nothing,
       stood up, and the card opened on top of « ✨ First time here? Quick
       tour! » exactly as before. Driven on the built app at 430x860.

       It is the same mistake as the hand-hold prune made on 14 Sep, for the
       same reason: a question about what ELSE is on screen cannot be answered
       in the first frame. So this waits a beat, and only opens if the screen
       is still clear — and standing down costs nothing now, because the 🔔
       keeps its unread dot. */
    const t = window.setTimeout(() => {
      if (!document.querySelector('div[role="dialog"], [data-prompt]')) setSelfOpen(true);
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  // A card with no keyboard way out is a trap, and the close key is where the
  // focus belongs the moment it appears.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  /* PORTALLED TO <body>, and this is a trap the repo already documents. An
     ancestor with a transform or a filter becomes the containing block for
     `position: fixed`, so a modal rendered inline inside the shell is centred
     against THAT box instead of the screen. Measured on the built app at
     430x860: the card's top was cut off above the viewport and it scrolled
     with the page. AGENTS.md records exactly this for ActivityGoalPicker —
     *"opened centred against the wrong box and appeared scrolled half off the
     top"* — and the fix is the one ToolSummon and BottomSheet already use.
     The bell lives in the site bar, which is inside that shell, so this was
     always going to happen here. */
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--cahier-ink) 45%, transparent)" }}
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsnew-title"
        onClick={(e) => e.stopPropagation()}
        /* CONTENT-SIZED AND CENTRED, not a sheet pinned to an edge — the shape
           Dan asked the activity picker for on 9 Sep: *"the pop up must only
           occupy the middle of the page, just sufficient space"*. The list is
           seven lines, so it is capped and scrolls rather than growing past a
           phone. */
        /* AN OPAQUE GROUND, STATED HERE. `.cahier-surface` paints the notebook's
           paper TEXTURE, not a solid fill, so over Home's illustrated hero the
           first build of this card was seeable straight through — the map's
           trees and coins read right through the words. Measured on the built
           app at 430x860 before this line existed. */
        style={{ background: "var(--cahier-paper)" }}
        className="flex max-h-[80dvh] w-full max-w-[34rem] flex-col overflow-hidden rounded-2xl border-2 border-[color:var(--cahier-ink)] shadow-[var(--shadow-card)]"
      >
        <div className="flex shrink-0 items-baseline justify-between gap-3 border-b-2 border-[color:var(--cahier-line)] px-5 py-3">
          <h2
            id="whatsnew-title"
            className="text-[calc(1.125rem+var(--fs-step)*1.13)] font-black text-[color:var(--cahier-ink)]"
          >
            ✨ {NEWS.heading}
          </h2>
          {/* THE DATE IS NOT FURNITURE. It is the one thing that tells a
              learner whether they have read this before, which is exactly the
              1 Sep test: a number earns its place when it says something you
              cannot otherwise see. */}
          <span className="shrink-0 text-[calc(0.75rem+var(--fs-step)*0.75)] text-[color:var(--cahier-ink-soft)]">
            {NEWS.shown}
          </span>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {NEWS.items.map((it) => (
            <li key={it.text} className="mb-3 flex gap-3 last:mb-0">
              <span aria-hidden className="shrink-0 text-[calc(1.15rem+var(--fs-step)*1.15)] leading-tight">
                {it.emoji}
              </span>
              <span className="text-[calc(0.9375rem+var(--fs-step)*0.94)] leading-snug text-[color:var(--cahier-ink)]">
                {it.text}
              </span>
            </li>
          ))}
        </ul>

        {/* NO CONTROL SPANS THE WIDTH (Dan, 5 Sep). One content-sized key,
            right-aligned where a dismissal belongs. */}
        <div className="flex shrink-0 justify-end border-t-2 border-[color:var(--cahier-line)] px-5 py-3">
          <button ref={closeRef} type="button" onClick={dismiss} className="neo-key px-5 py-2 font-black">
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}