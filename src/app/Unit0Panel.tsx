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
import Link from "next/link";
import { SIOS, sioStatement } from "@/content/sios";
import { lessonsForSio } from "@/content/lessons";
import { CURATED } from "@/content/collections";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { getAtelier } from "@/content/ateliers";
import AuthGate from "@/components/AuthGate";
import SioModal, { popupActivityTabs } from "./SioModal";
import { AfterPretest, BringToClass } from "./SioDetail";
import DialoguePlayer from "./DialoguePlayer";
import MarkDoneButton from "./sio/[id]/MarkDoneButton";
import { Sio010Pretest, Unit0Questions } from "@/components/Unit0Pretest";

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
          deck={openSio.collectionId ? CURATED.find((c) => c.id === openSio.collectionId) : undefined}
          tabs={popupActivityTabs(
            openSio.collectionId ? CURATED.find((c) => c.id === openSio.collectionId) : undefined,
            // Unit-0 questions render inline right here → Pre-Test is the
            // popup's active flap, matching the Units 1-4 popups. Gated on the
            // BANK, not on isProduction: SIO-010 is an atelier and now has
            // questions too (Dan, 2026-08-28).
            (UNIT0_QUESTIONS[openSio.id] ?? []).length > 0
              ? { inline: true, href: null }
              : undefined,
          )}
        >
          <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
            <span className="fluo-hl">{sioStatement(openSio)}</span>
          </p>

          {openSio.id === "SIO-010" ? (
            <>
              <AuthGate what="try these" compact>
                <Sio010Pretest sio={openSio} />
              </AuthGate>
              {/* The model dialogue IS the answer key — it waits for the
                  attempt (Dan's pretesting rule: never front-load the model). */}
              <AfterPretest>
                <div className="mt-4">
                  <DialoguePlayer lines={getAtelier(openSio.id) ?? []} />
                </div>
              </AfterPretest>
            </>
          ) : openSio.isProduction ? (
            <div className="rounded-xl border-2 border-dashed p-3" style={{ borderColor: "var(--fluo-card-accent)" }}>
              <p className="text-sm text-[color:var(--fluo-ink-soft)]">
                🗣️ A mini-oral simulation done in class with your instructor — no online questions here.
              </p>
            </div>
          ) : (
            <AuthGate what="try these" compact>
              <Unit0Questions sio={openSio} />
            </AuthGate>
          )}

          {/* Units 1-4 get this from SioDetail's pretest branch; Unit 0 draws
              its own popup body, so without this line the misses recorded above
              would have had no reader — written and never shown. */}
          <div className="mt-3">
            <BringToClass sioId={openSio.id} />
          </div>

          {/* Lesson buttons: bottom only, and (for question SIOs) only after
              every question is answered — pretest first (Dan, 2026-07-05). */}
          {lessonsForSio(openSio.id).length > 0 && (() => {
            const chips = (
              <div className="mt-4 flex flex-wrap gap-2">
                {lessonsForSio(openSio.id).map((l) => (
                  <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm inline-flex">
                    🎲 {l.title}
                  </Link>
                ))}
              </div>
            );
            return openSio.isProduction ? chips : <AfterPretest>{chips}</AfterPretest>;
          })()}

          {/* Mark-as-done — Unit 0 popups were missing it while Units 1-4
              (UnitSection) had it, so Unit-0 goals could never be completed
              (Dan, 2026-07-05). */}
          <MarkDoneButton sioId={openSio.id} />
        </SioModal>
      )}
    </div>
  );
}
