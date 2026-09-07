"use client";

/**
 * ONE popup for every stop on the map — lifted out of UnitSection when the
 * unit panels retired (Dan, 2 Sep, over a screenshot of the Unité 0 tile
 * grid: "we don't need this anymore right, can we retire it … delete it").
 *
 * It reunifies the two popup call sites the panels kept apart: Unit0Panel's
 * (pre-test href gated on the UNIT-0 QUESTION BANK, not on isProduction —
 * SIO-010 is an atelier and has questions too) and UnitSection's for units
 * 1–4 (ateliers get the model-line tabs; ordinary stops get their pre-test
 * page, falling back to dice only where the deck has letris columns). The
 * body is SioDetail — the statement and nothing else, per the 31 Aug
 * collapse.
 */
import SioModal, { popupActivityTabs } from "./SioModal";
import SioDetail from "./SioDetail";
import { CURATED } from "@/content/collections";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { getPretestForSio } from "@/content/pretests";
import type { Sio } from "@/content/sios";
import { pretestHref, unit0PretestHref } from "@/lib/pretests/routes";

export default function StopPopup({ sio, onClose }: { sio: Sio; onClose: () => void }) {
  const deck = sio.collectionId ? CURATED.find((c) => c.id === sio.collectionId) : undefined;
  const unit0Bank = (UNIT0_QUESTIONS[sio.id] ?? []).length > 0;
  const pretest = getPretestForSio(sio.id);
  const guessHref = unit0Bank
    ? unit0PretestHref(sio.id)
    : pretest
      ? pretestHref(pretest.id)
      : deck?.gameConfig?.letris
        ? `/practice/dice/${deck.id}`
        : null;
  const tabs =
    sio.isProduction && !unit0Bank
      ? popupActivityTabs(deck)
      : popupActivityTabs(deck, guessHref ? { inline: false, href: guessHref } : undefined);
  return (
    <SioModal sio={sio} onClose={onClose} tabs={tabs}>
      <SioDetail sio={sio} />
    </SioModal>
  );
}
