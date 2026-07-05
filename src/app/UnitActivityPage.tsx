"use client";

/**
 * A level-2 activity URL rendered the floating way (Dan, 2026-07-05: "try to
 * go to those pages from flip it, it does not have that floating effect at
 * all"): the deck's unit page, with the SIO popup already open on the
 * requested activity view. Every entrance — popup flap, page rail, direct
 * link — now shows the identical floating presentation.
 *
 * Decks that belong to no SIO fall back to the classic standalone page.
 */
import type { ReactNode } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { SIOS, UNIT_META } from "@/content/sios";
import UnitSection from "./UnitSection";

export default function UnitActivityPage({
  collectionId,
  view,
  lessonSlug,
  fallback,
}: {
  collectionId: string;
  view: string;
  /** For view="lesson": which of the deck's lessons to show. */
  lessonSlug?: string;
  fallback: ReactNode;
}) {
  const sio = SIOS.find((s) => s.collectionId === collectionId);
  if (!sio) return <>{fallback}</>;
  const key = `unit-${sio.unit}`;
  const meta = UNIT_META[sio.unit];
  return (
    <CahierShell
      tabs={tabsWithActive(siteTabs(), key)}
      active={key}
      crumb={`${meta?.emoji ?? ""} ${meta?.label ?? `Unité ${sio.unit}`}`}
    >
      <div className="mx-auto max-w-3xl px-1 py-2">
        <UnitSection unit={sio.unit} forceOpen={{ sioId: sio.id, view, lessonSlug }} />
      </div>
    </CahierShell>
  );
}
