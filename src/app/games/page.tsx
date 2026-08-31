import type { Metadata } from "next";
import FamilyHub from "@/components/FamilyHub";

export const metadata: Metadata = { title: "Games · FluOLinGo" };

/** The 🎮 slot's destination. Before this page it was /games/vocabularain —
 *  one game of four (Dan, 2026-08-30). ComposeIt lives under /games in the
 *  URL tree but belongs to Skills in the registry, so it is listed there, not
 *  here: the hub follows the family, not the path. */
export default function GamesHubPage() {
  return <FamilyHub activeKey="games" />;
}
