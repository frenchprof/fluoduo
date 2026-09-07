import type { Metadata } from "next";
import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";
import { FAMILIES, familyShort } from "@/content/activities";

export const metadata: Metadata = { title: "Games · FluOLinGo" };

/** The 🎮 slot's destination, hosting the hub in a frame since 2026-09-07.
 *  ComposeIt lives under /games in the URL tree but belongs to Skills in the
 *  registry, so it is listed there, not here: the hub follows the family, not
 *  the path. */
export default function GamesHubPage() {
  return (
    <CahierShell active="games" band={{ title: familyShort(FAMILIES.find((f) => f.key === "svplay")!) }}>
      <EmbedFrame src="/games/embed" title="Games" />
    </CahierShell>
  );
}
