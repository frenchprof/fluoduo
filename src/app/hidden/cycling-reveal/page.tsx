import type { Metadata } from "next";
import CyclingRevealDemo from "./CyclingRevealDemo";

export const metadata: Metadata = {
  title: "Cycling reveal → acronym",
  description: "Component playground: a sentence tumbles into place, then folds into its initials.",
  robots: { index: false, follow: false },
};

export default function CyclingRevealPage() {
  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--cahier-paper)" }}>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 data-demo-chrome className="cahier-display text-lg font-black" style={{ color: "var(--cahier-ink)" }}>
          Cycling reveal → acronym
        </h1>
        <CyclingRevealDemo />
      </div>
    </main>
  );
}
