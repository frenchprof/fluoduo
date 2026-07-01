"use client";

import { useState } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  function send() {
    const subject = encodeURIComponent("FluoLingo feedback");
    const body = encodeURIComponent(msg.trim() || "(no message)");
    window.open(`mailto:dan@chank.wang?subject=${subject}&body=${body}`);
    setMsg("");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Send feedback or report a bug"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 rounded-full bg-[var(--fluo-hl)] px-3.5 py-2 text-sm font-bold text-[color:var(--fluo-ink)] shadow-lg hover:brightness-95 active:scale-95 transition-transform"
      >
        💬 Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="cahier-sheet w-full max-w-sm rounded-2xl p-5 shadow-2xl ring-1 ring-black/10">
            <h2 className="fluo-serif mb-1 text-lg font-bold text-[color:var(--fluo-ink)]">
              Report a bug · Suggest something
            </h2>
            <p className="mb-3 text-xs text-[color:var(--fluo-ink-soft)]">
              Describe what happened or what you'd like to see — opens your email app with the message ready to send.
            </p>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              placeholder="What went wrong? What should change?"
              className="w-full rounded-lg border border-[color:var(--cahier-rule)] bg-white/60 p-2.5 text-sm text-[color:var(--fluo-ink)] placeholder:text-[color:var(--fluo-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--fluo-hl)] resize-none"
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={send} className="fluo-btn flex-1">
                Open in email
              </button>
              <button type="button" onClick={() => setOpen(false)} className="fluo-btn fluo-btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
