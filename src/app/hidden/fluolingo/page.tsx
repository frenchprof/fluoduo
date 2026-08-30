/**
 * A stage for the name-origin animation, off every learner path (2026-08-30).
 *
 * It lives under /hidden for the same reason /hidden/vocabularain does: the
 * animation is a piece of brand furniture, and it needs somewhere to be
 * watched, resized and argued about before anyone decides which surface it
 * belongs on. Mounting it elsewhere is one import and one tag.
 */
import type { Metadata } from "next";
import FluolingoOrigin from "@/components/FluolingoOrigin";

export const metadata: Metadata = {
  title: "Fluolingo · where the name comes from",
  description: "Fluency achieved on customisable linguistic goals.",
  robots: { index: false, follow: false },
};

export default function FluolingoOriginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[color:var(--fluo-bg)] p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-[color:var(--fluo-ink)] shadow-[0_6px_0_0_var(--fluo-ink)]">
        <FluolingoOrigin />
      </div>
    </main>
  );
}
