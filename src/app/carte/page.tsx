import type { Metadata } from "next";
import SagaMap from "./SagaMap";

/** Full-bleed on purpose — no CahierShell: the map IS the page, Candy-Crush
 *  style; ← (top-left) returns to the Home hub. */
export const metadata: Metadata = { title: "La Carte — FluOlinGo" };

export default function CartePage() {
  return <SagaMap />;
}
