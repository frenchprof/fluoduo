"use client";

/**
 * Bug-report form (Dan, 2026-07-03: "not an email — a form to submit bug
 * reports, standard bugs the user can check off, plus Other (Specify)").
 * Writes to the Firestore `feedback` collection (see firestore.rules — the
 * feedback rule must be deployed for this to persist). Works for anyone, signed
 * in or not; the uid is attached when available.
 *
 * 🐞, not 💬 (Dan, 2026-09-09) — this button used to share 💬 with the
 * Skills family door, live on screen at once on a Skills activity. A bug
 * is what this button reports, so it wears one.
 */

import { useRef, useState } from "react";
import { useDragFloat } from "@/lib/useDragFloat";
import { awardBugReport } from "@/lib/progress";
import { createPortal } from "react-dom";
import { readBugContext } from "@/lib/bugContext";
// Firebase is imported DYNAMICALLY inside send(): this button sits in the root
// layout, and a static import would ship the whole Firestore bundle (~184 KB gz)
// on every page for a form almost nobody opens.

const ISSUES = [
  "A page won't load or is blank",
  "Audio / pronunciation didn't play",
  "A question's marked answer seems wrong",
  "A French word or translation is incorrect",
  "A game or activity got stuck",
  "The layout looks broken on my screen",
];

type Status = "idle" | "sending" | "sent" | "error";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_W = 800;
      const scale = img.width > MAX_W ? MAX_W / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no ctx")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load failed")); };
    img.src = url;
  });
}

export default function FeedbackButton() {
  const drag = useDragFloat("fl.float.chat", { right: 20, bottom: 20 });
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [other, setOther] = useState(false);
  const [details, setDetails] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  /** Gems this report earned — 0 once today's two paid reports are spent. */
  const [paid, setPaid] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...ISSUES.filter((i) => checked[i]), ...(other ? ["Other"] : [])];
  const canSend = categories.length > 0 || details.trim().length > 0;

  function reset() {
    setChecked({}); setOther(false); setDetails(""); setScreenshot(null); setStatus("idle");
  }
  function close() { setOpen(false); reset(); }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      setScreenshot(await compressImage(file));
    } catch {
      // ignore compression failure silently
    }
  }

  async function send() {
    if (!canSend || status === "sending") return;
    setStatus("sending");
    try {
      const [{ addDoc, collection, serverTimestamp }, { db, auth }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/db").then(async (m) => ({ db: m.db, auth: (await import("@/lib/firebase/client")).auth })),
      ]);
      const report = {
        categories,
        details: details.trim().slice(0, 2000),
        url: typeof window !== "undefined" ? window.location.pathname : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : "",
        uid: auth.currentUser?.uid ?? null,
        createdAt: serverTimestamp(),
        ...(screenshot ? { screenshot } : {}),
      };
      // WHAT WAS ON SCREEN — the card's own id and prompt, written by the
      // drill that drew it (lib/bugContext). The learner types nothing extra;
      // the report just arrives knowing which card it is about.
      const context = readBugContext();
      try {
        await addDoc(collection(db, "feedback"), context ? { ...report, context } : report);
      } catch (e) {
        // THE RULE IS DEPLOYED BY HAND, and this client may ship first. The
        // live `feedback` rule lists every allowed key (`hasOnly`), so until
        // the console carries `context` a report that includes it is refused
        // outright — and a refused bug report is the one outcome worse than a
        // report without its card. So: once, without it. Nothing is lost
        // either way, and the day the rule lands, contexts start arriving.
        const denied = (e as { code?: string })?.code === "permission-denied";
        if (!context || !denied) throw e;
        await addDoc(collection(db, "feedback"), report);
      }
      // PAID ONLY ON A SUCCESSFUL WRITE (Dan, 2026-09-14: "we also want to
      // reward bug reporters"). Inside the try, after addDoc resolves: a report
      // that never reached Firestore is not a report, and paying for one would
      // make an offline tap worth 5 gems.
      setPaid(awardBugReport());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        {...drag.handlers}
        style={drag.style}
        onClick={() => { if (drag.consumeClick()) return; setOpen(true); }}
        title="Feedback — report a bug"
        aria-label="Feedback"
        className="fixed z-50 flex items-center justify-center rounded-full bg-[var(--fluo-hl)] px-3 py-2 text-base font-bold text-[color:var(--fluo-ink)] shadow-lg hover:brightness-95 active:scale-95 transition-transform"
      >
        🐞
      </button>

      {open && (
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-5" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="cahier-sheet w-full max-w-sm rounded-2xl p-5 shadow-2xl ring-1 ring-black/10">
            {status === "sent" ? (
              <div className="text-center">
                <p className="fluo-serif text-lg font-bold text-[color:var(--fluo-ink)]">Thanks! 🙌</p>
                <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">Your report was sent.</p>
                {/* The 33%, and ONLY the 33%. The rest of the bounty rides on
                    Dan judging the bug major, and saying so here would spend
                    the surprise in advance — and promise a payment the app
                    cannot yet make. A capped-out report says so plainly rather
                    than paying nothing in silence. */}
                {paid > 0 ? (
                  <p className="cahier-mono mt-2 text-base font-black" style={{ color: "var(--dopa-win)" }}>
                    +{paid} 💎 for finding it
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[color:var(--fluo-ink-soft)]">
                    Gems for reports are capped for today — the report still counts.
                  </p>
                )}
                <button type="button" onClick={close} className="fluo-btn fluo-btn-sm mt-4">Close</button>
              </div>
            ) : (
              <>
                <h2 className="fluo-serif mb-1 text-lg font-bold text-[color:var(--fluo-ink)]">Report a bug</h2>
                <p className="mb-3 text-xs text-[color:var(--fluo-ink-soft)]">Tick anything that went wrong — add details if you like.</p>

                <div className="space-y-1.5">
                  {ISSUES.map((issue) => (
                    <label key={issue} className="flex cursor-pointer items-start gap-2 text-sm text-[color:var(--fluo-ink)]">
                      <input type="checkbox" checked={!!checked[issue]} onChange={(e) => setChecked((c) => ({ ...c, [issue]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 accent-[var(--fluo-card-accent)]" />
                      <span>{issue}</span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-start gap-2 text-sm font-bold text-[color:var(--fluo-ink)]">
                    <input type="checkbox" checked={other} onChange={(e) => setOther(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--fluo-card-accent)]" />
                    <span>Other (specify below)</span>
                  </label>
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder={other ? "Please describe the issue…" : "Anything else? (optional)"}
                  className="mt-3 w-full resize-none rounded-lg border border-[color:var(--cahier-rule)] bg-white/60 p-2.5 text-sm text-[color:var(--fluo-ink)] placeholder:text-[color:var(--fluo-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--fluo-hl)]"
                />

                <div className="mt-1.5 flex items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[color:var(--fluo-ink-soft)] underline underline-offset-2 hover:text-[color:var(--fluo-ink)]">
                    📎 {screenshot ? "Change screenshot" : "Attach screenshot"}
                  </button>
                  {screenshot && (
                    <>
                      <span className="text-xs font-bold text-emerald-600">✔ attached</span>
                      <button type="button" onClick={() => setScreenshot(null)} className="text-xs text-rose-500 hover:text-rose-700">✕</button>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />

                {status === "error" && (
                  <p className="mt-2 text-xs font-bold text-rose-600">Couldn&rsquo;t send — check your connection and try again.</p>
                )}

                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={send} disabled={!canSend || status === "sending"}
                    className="fluo-btn flex-1 disabled:opacity-50">
                    {status === "sending" ? "Sending…" : "Send report"}
                  </button>
                  <button type="button" onClick={close} className="fluo-btn fluo-btn-ghost">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body)
      )}
    </>
  );
}
