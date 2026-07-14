"use client";

/**
 * The Quick Guide popup. NO LONGER auto-shows on first visit (Dan,
 * 2026-07-14: "don't make the guide pop up by default anymore") — it opens
 * on demand from the inverted QuickGuide button in the tab rail
 * (CahierShell). ▶ Continue or a backdrop tap closes it; closing announces
 * the stage is clear so the home hero can run its FluoLingo animation.
 */
import GuideBody from "@/components/GuideBody";

export default function GuideSplash({ onClose }: { onClose: () => void }) {
  const close = () => {
    onClose();
    try { window.dispatchEvent(new Event("fluolingo:guide-splash-closed")); } catch {}
  };
  return (
    <div className="fixed inset-0 z-[85] bg-black/35 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Quick Guide" onClick={close}>
      <div
        className="mx-auto mt-[4vh] max-h-[88vh] w-[min(94vw,42rem)] overflow-y-auto rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-[color:var(--cahier-paper,#fdfbf4)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">Quick Guide</h2>
        <GuideBody onContinue={close} />
      </div>
    </div>
  );
}
