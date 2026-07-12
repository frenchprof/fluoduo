/**
 * Learner tutorial (Dan, 2026-07-05: "a new user might be quite lost", then
 * "way too wordy — succinct yet clear", then "needs more color"). The one
 * page where prose is allowed (the litmus rule bans it inside activities) —
 * but even here, each idea gets ONE line. Color comes from the site's six
 * unit hues (.fluo-h-*): one per step card, one per activity tile. The ✨
 * chip at the bottom left replays the guided tour.
 */
import Link from "next/link";
import GuideBody from "@/components/GuideBody";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

export default function GuidePage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "guide")} active="guide" crumb="❓ Guide">
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">❓ Guide <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· How FluoLingo works</span></h1>
        <GuideBody />
        <p className="mt-5">
          <Link href="/" className="fluo-h-1 inline-block rounded-full border-2 px-4 py-1.5 text-sm font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5" style={{ background: "var(--fluo-card-accent)", borderColor: "var(--fluo-card-accent)" }}>
            Commencez ici 🏠
          </Link>
        </p>
      </div>
    </CahierShell>
  );
}
