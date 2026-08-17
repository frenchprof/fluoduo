"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import GameFrame from "@/components/GameFrame";
import NumBus from "@/games/numbus/NumBus";
import NumBusSetup from "@/games/numbus/NumBusSetup";
import type { NumBusConfig } from "@/games/numbus/config";

export default function NumBusClient() {
  const [config, setConfig] = useState<NumBusConfig | null>(null);

  // The setup step wears the same frame as the game (patch 23): one ✕, one
  // ⋯, no page header — the title lives in the ⋯ sheet, not over the form.
  return (
    <AuthGate what="play">
      {!config ? (
        <GameFrame title="🚌 NumBus" exitHref="/" progress={null}>
          <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-4">
            <NumBusSetup onStart={setConfig} />
          </div>
        </GameFrame>
      ) : (
        <NumBus config={config} onQuit={() => setConfig(null)} />
      )}
    </AuthGate>
  );
}
