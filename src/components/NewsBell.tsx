"use client";

/**
 * THE 🔔 IN THE BAR — where the app's messages live.
 *
 * Dan, 2026-09-15: *"We should have a notifications icon at the top right of
 * the screen next to the volume button - for all these messages"*, said after
 * asking for the What's New card itself.
 *
 * WHY IT IS NOT JUST A SECOND WAY TO THE SAME CARD. A one-time pop-up is an
 * EVENT: it happens to you, and if you tap past it, it is gone for good — the
 * same fault the ✨ « Replay the tour » chip was deleted for on 13 Sep, from
 * the other end (that one never went away; this one never comes back). The
 * bell makes the card a PLACE. It is also what lets the card stand down
 * politely when another prompt is already on screen, because standing down no
 * longer means losing the message.
 *
 * IT IS NOT A THIRD FLOAT. Two circles already float over the app (🐞 report a
 * bug, 🛠️ Outils) and 13 Sep ruled that a control has to earn a permanent
 * place before it becomes a third. This is not one: it sits IN the bar, in the
 * icon strip, beside 🔊 — exactly where Dan put it.
 *
 * THE DOT IS THE WHOLE POINT OF A BELL. A bell with no unread mark is a button
 * nobody presses, so it reads `newsUnread()` — the same localStorage key the
 * card writes — and listens for the card's own event so the dot clears without
 * a reload. `storage` does not fire in the document that wrote the value,
 * which is why there is a custom event at all.
 */

import { useCallback, useEffect, useState } from "react";

import WhatsNew, { NEWS_EVENT, newsUnread } from "@/components/WhatsNew";

export default function NewsBell() {
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);

  const reread = useCallback(() => setUnread(newsUnread()), []);

  useEffect(() => {
    // localStorage cannot be read during render on a static export.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reread();
    window.addEventListener("storage", reread);
    window.addEventListener(NEWS_EVENT, reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener(NEWS_EVENT, reread);
    };
  }, [reread]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={unread ? "Messages — one unread" : "Messages"}
        title={unread ? "What's new" : "Messages"}
        /* The bar's own icon shape, copied from SoundControl rather than
           invented, so the strip stays one row of equal keys. `relative` is
           for the dot alone. */
        className="fluo-hit44 relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition hover:bg-[color:var(--cahier-ink)]/10 sm:h-9 sm:w-9"
      >
        <span aria-hidden>🔔</span>
        {unread && (
          /* A DOT, NOT A COUNT. There is one edition at a time, so a number
             would always read « 1 » — furniture, by the 1 Sep rule. The dot
             says the only thing that is not already on screen: unread. */
          <span
            aria-hidden
            className="absolute right-1 top-1 h-2 w-2 rounded-full border border-[color:var(--cahier-paper)]"
            /* `--dopa-reward`, NOT a raw hex and NOT `--dopa-miss`. The hex
               was a literal red behind a `--cahier-red` that does not exist, so
               the fallback was doing all the work — which verify19b's ratchet
               caught as a 54th file drifting off the palette. Of the tokens
               that do exist, `miss` means a wrong answer and would read as an
               error; an unread notice is news waiting, which is `reward`. */
            style={{ background: "var(--dopa-reward)" }}
          />
        )}
      </button>

      {/* The card itself, opened BY the bell. It also opens itself once per
          edition — unless something else is already asking (see WhatsNew). */}
      <WhatsNew openNow={open} onClose={() => setOpen(false)} />
    </>
  );
}
