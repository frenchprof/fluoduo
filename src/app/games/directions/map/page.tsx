"use client";

import CahierShell, { withActive } from "@/components/CahierShell";
import DirectionsMapGame from "@/games/directions/DirectionsMapGame";
import { DIRECTIONS_TABS } from "@/games/directions/tabs";

export default function DirectionsMapPage() {
  return (
    <CahierShell tabs={withActive(DIRECTIONS_TABS, "map")} active="map" crumb="Practice map">
      <DirectionsMapGame />
    </CahierShell>
  );
}
