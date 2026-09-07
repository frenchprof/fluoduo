"use client";

import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import NumBus from "@/games/numbus/NumBus";
import NumBusSetup from "@/games/numbus/NumBusSetup";
import type { NumBusConfig } from "@/games/numbus/config";

export default function NumBusClient() {
  const [config, setConfig] = useState<NumBusConfig | null>(null);

  // The setup step is a PAGE now, not a frame of the game (Dan, 2026-08-29:
  // "even if they do not have 50-stop list, it should still have a landing
  // page before the game begins, e.g. for settings and so on"). Patch 23 had
  // put it inside GameFrame — "no page header" — which left the only two
  // activities in the app with no coloured strip and nothing on screen naming
  // them. The GAME still wears GameFrame; only the settings step moved out.
  return (
    <AuthGate what="play">
      {!config ? (
        <GameLanding activityKey="numbus" title="NumBus">
          <NumBusSetup onStart={setConfig} />
        </GameLanding>
      ) : (
        // The same shell the setup step above already uses, so the band and
        // the spine stay put while you play; ⛶ on the game bar takes it full.
        <GameLanding activityKey="numbus" title="NumBus" bleed>
          <NumBus config={config} onQuit={() => setConfig(null)} />
        </GameLanding>
      )}
    </AuthGate>
  );
}
