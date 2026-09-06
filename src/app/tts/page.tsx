"use client";

/**
 * 🔊 VoixLà (Le Studio TTS) — the standalone page. The player itself now
 * lives in components/tools/VoixLaPanel (5 Sep, AMBIENT TOOLS extraction) so
 * the 🧰 in-exercise card can mount the same panel; this page passes no props
 * and keeps its shell, wall and behaviour unchanged — type freely, ▶ speaks
 * what is typed, ✏️ checks on demand. (The card runs corrects-first instead:
 * handed text is checked before anything is voiced.)
 */
import AuthGate from "@/components/AuthGate";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import VoixLaPanel from "@/components/tools/VoixLaPanel";

// Sign-in wall (Dan, 2026-07-13: close the cost exposure — MP3 generation
// spends Google/Mistral credits, so no anonymous use).
export default function TtsPage() {
  return (
    <AuthGate what="use VoixLà">
      <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="tts">
        <div className="mx-auto max-w-2xl px-3 pb-5 pt-2">
          {/* The h1 moved into the shell's heading band (variant A, 2026-08-23).
              Same warm panel as the Tutor (Dan, 2026-07-13: "adopt similar
              colors for Studio TTS just like the Tutor") — drawn by the panel. */}
          <div className="mt-3">
            <VoixLaPanel />
          </div>
        </div>
      </CahierShell>
    </AuthGate>
  );
}
