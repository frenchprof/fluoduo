"use client";

/**
 * 🤖 Le Tuteur — the standalone chat page. The chat itself now lives in
 * components/tools/ChaTutorPanel (5 Sep, AMBIENT TOOLS extraction) so the
 * 🧰 in-exercise card can mount the same panel; this page passes no context
 * and keeps its shell, wall and behaviour unchanged.
 */
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import AuthGate from "@/components/AuthGate";
import ChaTutorPanel from "@/components/tools/ChaTutorPanel";

// Sign-in wall (Dan, 2026-07-13: close the cost exposure — every tutor turn
// spends API credits, so no anonymous chats). The wall guards ONLY the
// chat (audit 2026-07-19): the shell, title and description render before
// auth resolves, so the page is never a bare "Loading…" on slow wifi — and
// the compact gate sits where the conversation will appear.
export default function TutorPage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="tutor">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-3 pb-5 pt-2">
        {/* The h1 + tagline moved into the shell's heading band (variant A,
            2026-08-23) — the tagline fell to the litmus rule. */}
        <AuthGate what="talk to the tutor" compact>
          <ChaTutorPanel />
        </AuthGate>
      </div>
    </CahierShell>
  );
}
