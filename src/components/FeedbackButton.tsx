"use client";

/**
 * Bug-report form (Dan, 2026-07-03: "not an email — a form to submit bug
 * reports, standard bugs the user can check off, plus Other (Specify)").
 * Writes to the Firestore `feedback` collection (see firestore.rules — the
 * feedback rule must be deployed for this to persist). Works for anyone, signed
 * in or not; the uid is attached when available.
 */

import { useRef, useState } from "react";
import { useDragFloat } from "@/lib/useDragFloat";
import { createPortal } from "react-dom";
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
      await addDoc(collection(db, "feedback"), {
        categories,
        details: details.trim().slice(0, 2000),
        url: typeof window !== "undefined" ? window.location.pathname : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : "",
        uid: auth.currentUser?.uid ?? null,
        createdAt: serverTimestamp(),
        ...(screenshot ? { screenshot } : {}),
      });
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
        💬
      </button>

      {open && (
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-5" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="cahier-sheet w-full max-w-sm rounded-2xl p-5 shadow-2xl ring-1 ring-black/10">
            {status === "sent" ? (
              <div className="text-center">
                <p className="fluo-serif text-lg font-bold text-[color:var(--fluo-ink)]">Thanks! 🙌</p>
                <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">Your report was sent.</p>
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
