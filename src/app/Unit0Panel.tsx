"use client";

/**
 * Unit 0's special home-page treatment — two even rows of 5 tiles (no
 * Situations 1/2/3 exist for Unit 0). Clicking a tile opens the shared
 * SioModal, body = one merged Can-Do+competence sentence (no section
 * labels, per Dan 2026-07-01: "STICK TO THE ESSENTIALS. SHORT AND SWEET.
 * EFFICIENT") followed by that SIO's MCQs.
 *
 * SIO-010 (the role-play) is the one that reads differently: the learner picks
 * an audience (student / client / group) and sits that audience's seven lines,
 * and only then does the model dialogue appear. Showing the dialogue first
 * would have handed over every answer — a pretest is a COLD guess.
 *
 * "Also try" game chips (Letris/Match It) show if a deck exists for the SIO
 * — Dan asked for Days/Numbers/Colors → Match It and the un/une article SIO
 * → Letris specifically, but none of those 4 have a wired deck yet (that's
 * new content to author, not a quick fix) — DEFERRED, flagged in the
 * handoff doc, not silently dropped.
 */
import { useEffect, useState } from "react";
import { SIOS, sioStatement } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import SioModal, { popupActivityTabs } from "./SioModal";
import MarkDoneButton from "./sio/[id]/MarkDoneButton";

const UNIT0_SIOS = SIOS.filter((s) => s.unit === 0);


export default function Unit0Panel({ openSioId, onSioClosed }: { openSioId?: string | null; onSioClosed?: () => void } = {}) {
  // (The forceOpen prop died with patch 22 — no route pre-opens this popup
  // any more; the lesson URLs render the full-screen pager instead.)
  const [openId, setOpenId] = useState<string | null>(null);
  const openSio = openId ? UNIT0_SIOS.find((s) => s.id === openId) : undefined;

  // Deep link: /unit/0#SIO-00X opens that popup — the home learning path links
  // Unit-0 SIOs this way. UnitSection's generic popup body has no Unit-0 MCQs
  // (that popup opened EMPTY, Dan's 2026-07-05 bug report), so unit 0's hash
  // handling lives here where the questions are.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    // The URL hash does not exist on the server, so a deep link cannot be read
    // during render — on mount is the only place it can be read at all.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window.location, see above
    if (hash && UNIT0_SIOS.some((s) => s.id === hash)) setOpenId(hash);
  }, []);
  // Home's map taps a Unit-0 stop after mount (patch 25).
  useEffect(() => {
    // The map taps a stop AFTER mount (patch 25) — this mirrors a prop the
    // parent changes later, which is what an effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount prop, see above
    if (openSioId && UNIT0_SIOS.some((s) => s.id === openSioId)) setOpenId(openSioId);
  }, [openSioId]);

  // The pink "Unité 0" header + done-counter is rendered by SioHub's collapse
  // header (same as Units 1–4); this panel is just the tile grid — no second
  // header of its own.
  return (
    <div className="fluo-h-0">
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {UNIT0_SIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setOpenId(s.id)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-[var(--fluo-card)] p-3 text-center transition hover:-translate-y-0.5"
            style={{ borderColor: "var(--fluo-card-accent)" }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black text-[color:var(--fluo-ink)]"
              style={{ background: "var(--fluo-card-tint)", borderColor: "var(--fluo-card-accent)" }}
            >
              {String(s.num).padStart(2, "0")}
            </span>
            {s.isProduction && s.id !== "SIO-010" && (
              <span className="fluo-label text-[9px]" style={{ color: "var(--fluo-card-accent)" }}>
                atelier
              </span>
            )}
            <span className="fluo-readable line-clamp-2 text-xs font-bold leading-tight text-[color:var(--fluo-ink)]">{s.topic}</span>
          </button>
        ))}
      </div>

      {openSio && (
        <SioModal
          sio={openSio}
          onClose={() => {
            setOpenId(null);
            onSioClosed?.();
          }}
          tabs={popupActivityTabs(
            openSio.collectionId ? CURATED.find((c) => c.id === openSio.collectionId) : undefined,
            // The Unit-0 questions used to render INLINE in this body, which is
            // why this said `inline: true`. They have their own page since #98,
            // so the Pre-Test is a link like every other row. Gated on the BANK,
            // not on isProduction: SIO-010 is an atelier and has questions too.
            (UNIT0_QUESTIONS[openSio.id] ?? []).length > 0
              ? { inline: false, href: `/pretests/unit0/${openSio.id}` }
              : undefined,
          )}
          footer={<MarkDoneButton sioId={openSio.id} />}
        >
          {/* The SIO, spelled out fully — and then the links, which SioModal
              draws. Everything else that used to stack up here went with the
              collapse (Dan, 2026-08-31: "THAT IS IT"): the inline questions
              are a page now, the model dialogue and the lesson chips would
              answer the pre-test before it is taken, and Bring-to-class reads
              best under the questions it came from, which is where the
              pre-test page puts it. */}
          <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
            <span className="fluo-hl">{sioStatement(openSio)}</span>
          </p>

        </SioModal>
      )}
    </div>
  );
}
