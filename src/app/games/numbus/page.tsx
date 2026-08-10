"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import NumBus from "@/games/numbus/NumBus";
import NumBusSetup from "@/games/numbus/NumBusSetup";
import type { NumBusConfig } from "@/games/numbus/config";
import GameBar from "@/components/GameBar";

export default function NumBusClient() {
  const [config, setConfig] = useState<NumBusConfig | null>(null);

  return (
    <AuthGate what="play">
      <main
        className="min-h-screen"
        style={{ background: "linear-gradient(180deg,#cfe9fb 0%,#eaf6ff 45%,#f7fcff 100%)" }}
      >
        <GameBar title="🚌 NumBus" />

        {!config ? (
          <div className="mx-auto max-w-3xl px-4 py-6">
            <h1 className="cahier-display cahier-hand mb-4 text-center text-3xl font-normal text-[color:var(--cahier-ink)]">
              🚌 NumBus
            </h1>
            <NumBusSetup onStart={setConfig} />
          </div>
        ) : (
          <NumBus config={config} onQuit={() => setConfig(null)} />
        )}
      </main>
    </AuthGate>
  );
}
