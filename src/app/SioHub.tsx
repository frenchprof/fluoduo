"use client";

/**
 * The home hub: all 50 SIOs (Specific Instructional Objectives) for French 1.
 * Unité 0 gets its own special treatment (Unit0Panel) — see that file. Unités
 * 1–4 render as rows of circles grouped by Situation/Atelier (see
 * groupSiosForUnit) — a row's width is however many SIOs actually fall under
 * that group (2, 3, 4…), NOT a fixed alternating left-right zigzag.
 * Circle captions use the readable .fluo-readable font (Roboto), not the
 * mono label font — Dan: the mono font was "much much" too hard to read
 * there.
 *
 * Clicking a Units-1-4 circle opens the SAME popup pattern Unit 0 uses (Dan,
 * 2026-07-01: "We should adopt what we did for Unit 0 for the Units 1 to 4
 * too") — SioModal + SioDetail (merged Can-Do+competence sentence, no section
 * labels, then Pre-Test Prep / Post-Class Practice tiles). No MCQs here —
 * those only exist for Unité 0. The old /sio/[id] route still works for
 * direct links; it's just no longer the primary click target.
 *
 * Unités 3 and 4 are TEMPORARILY LOCKED (Dan, 2026-07-01: "we won't have
 * time to confirm the details by today") — a coarse, whole-unit "not ready
 * yet" gate, distinct from (and NOT a reintroduction of) the earlier
 * per-SIO sequential unlock that was explicitly reverted. Remove
 * LOCKED_UNITS once Dan confirms those units' content.
 *
 * Node states, backed by src/lib/progress.ts: done (learner self-marked it on
 * the SIO page) or active (the single earliest not-done SIO in an unlocked
 * unit — the "you are here" node). No SIO is ever individually locked.
 *
 * Client component: unit + group rows are individually collapsible, and the
 * collapse state persists in localStorage. Server render always starts fully
 * expanded — a mount effect then restores real state, same hydration pattern
 * used elsewhere in the app (build deterministic, adjust after mount).
 */
import { useEffect, useState } from "react";
import { SIOS, UNIT_META, unitNumbers, groupSiosForUnit, type Sio } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { getPretestForSio } from "@/content/pretests";
import { defaultProgress, loadProgress, isSioDone, MAX_HEARTS, type Progress } from "@/lib/progress";
import Unit0Panel from "./Unit0Panel";
import SioModal, { popupActivityTabs } from "./SioModal";
import SioDetail from "./SioDetail";
import MarkDoneButton from "./sio/[id]/MarkDoneButton";

const STORAGE_KEY = "fluolingo:hubCollapse";
const LOCKED_UNITS = new Set([4]); // Unité 3 unlocked 2026-07-01; Unité 4 still pending confirmation

function deckAndPretestFor(sio: Sio) {
  const deck = sio.collectionId ? CURATED.find((c) => c.id === sio.collectionId) : undefined;
  const pretest = getPretestForSio(sio.id);
  const pretestHref = pretest ? `/pretests/${pretest.id}` : deck ? `/games/practice/${deck.id}` : null;
  return { deck, pretestHref, pretestId: pretest?.id ?? null };
}

export default function SioHub() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {
      // ignore — falls back to fully expanded
    }
    setProgress(loadProgress());
  }, []);

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — collapse still works for this session
      }
      return next;
    });
  }

  // The single "you are here" node: earliest not-done SIO in an unlocked unit.
  const activeId = SIOS.find((s) => s.unit > 0 && !LOCKED_UNITS.has(s.unit) && !isSioDone(s.id, progress))?.id;
  const openSio = openId ? SIOS.find((s) => s.id === openId) : undefined;

  return (
    <>
      <div className="mb-6 flex items-center justify-end gap-4 px-1">
        <span className="fluo-mono flex items-center gap-1 text-sm font-bold text-[color:var(--fluo-ink)]">
          🔥 {progress.streak}
        </span>
        <span className="fluo-mono flex items-center gap-1 text-sm font-bold text-[color:var(--fluo-ink)]">
          💎 {progress.gems}
        </span>
        <span className="fluo-mono flex items-center gap-1 text-sm font-bold text-[color:var(--fluo-ink)]">
          {"❤️".repeat(progress.hearts)}
          {"🤍".repeat(Math.max(0, MAX_HEARTS - progress.hearts))}
        </span>
      </div>

      <div id="unit-0">
        <Unit0Panel />
      </div>

      {unitNumbers()
        .filter((unit) => unit > 0)
        .map((unit) => {
          const sios = SIOS.filter((s) => s.unit === unit);
          const meta = UNIT_META[unit] ?? { label: `Unité ${unit}`, subtitle: "", emoji: "📚" };
          const unitKey = `unit-${unit}`;
          const locked = LOCKED_UNITS.has(unit);
          const unitCollapsed = locked || !!collapsed[unitKey];
          const groups = groupSiosForUnit(unit);
          const hue = unit % 6;
          const doneCount = sios.filter((s) => isSioDone(s.id, progress)).length;

          return (
            <section key={unit} id={`unit-${unit}`} className={`fluo-h-${hue} mb-8`}>
              <button
                type="button"
                onClick={() => !locked && toggle(unitKey)}
                disabled={locked}
                aria-expanded={!unitCollapsed}
                className={`mb-5 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${locked ? "opacity-70" : ""}`}
                style={{ background: "var(--fluo-card-accent)" }}
              >
                <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                <span className="fluo-serif text-lg font-black text-white">{meta.label}</span>
                {meta.subtitle && (
                  <span lang="fr" className="hidden text-sm text-white/85 sm:inline">{meta.subtitle}</span>
                )}
                <span className="fluo-label ml-auto rounded-full bg-white/25 px-3 py-1 text-white">
                  {locked ? "🔒 Coming soon" : `${doneCount}/${sios.length} ${unitCollapsed ? "▸" : "▾"}`}
                </span>
              </button>

              {locked ? (
                <p className="fluo-readable px-1 text-sm text-[color:var(--fluo-ink-soft)]">
                  This unit's content is still being finalized — check back soon.
                </p>
              ) : (
                !unitCollapsed && (
                  <div className="space-y-5">
                    {groups.map((group) => {
                      const groupKey = `${unitKey}:${group.key}`;
                      const groupCollapsed = !!collapsed[groupKey];
                      return (
                        <div key={group.key}>
                          <button
                            type="button"
                            onClick={() => toggle(groupKey)}
                            className="mb-2 flex w-full items-center gap-2 text-left"
                            aria-expanded={!groupCollapsed}
                          >
                            <span className="fluo-mono text-xs font-black uppercase tracking-wide text-[color:var(--fluo-ink)]">
                              {groupCollapsed ? "▸" : "▾"} {group.label}
                            </span>
                            {groupCollapsed && (
                              <span className="flex gap-1">
                                {group.sios.map((s) => (
                                  <span
                                    key={s.id}
                                    aria-hidden
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: isSioDone(s.id, progress) ? "var(--fluo-card-accent)" : "#cbb7a8" }}
                                  />
                                ))}
                              </span>
                            )}
                          </button>
                          {!groupCollapsed && (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 py-1">
                              {group.sios.map((s) => (
                                <SioNode
                                  key={s.id}
                                  sio={s}
                                  done={isSioDone(s.id, progress)}
                                  active={s.id === activeId}
                                  onOpen={() => setOpenId(s.id)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </section>
          );
        })}

      {openSio && (() => {
        const { deck, pretestHref, pretestId } = deckAndPretestFor(openSio);
        return (
          <SioModal
            sio={openSio}
            onClose={() => setOpenId(null)}
            tabs={openSio.isProduction ? undefined : popupActivityTabs(deck)}
          >
            <SioDetail sio={openSio} deck={deck} pretestHref={pretestHref} pretestId={pretestId} showPractice={openSio.isProduction} />
            <MarkDoneButton sioId={openSio.id} />
          </SioModal>
        );
      })()}
    </>
  );
}

function SioNode({
  sio,
  done,
  active,
  onOpen,
}: {
  sio: Sio;
  done: boolean;
  active: boolean;
  onOpen: () => void;
}) {
  const circleCls = `flex items-center justify-center rounded-full border-2 font-black transition group-hover:-translate-y-0.5 group-hover:shadow-[2px_3px_0_var(--fluo-card-accent)] ${
    active ? "h-16 w-16 text-xl" : "h-12 w-12 text-base"
  }`;

  return (
    <button type="button" onClick={onOpen} className="group flex w-20 flex-col items-center gap-1 text-center">
      {active && (
        <span className="fluo-mono mb-0.5 rounded-full bg-[var(--fluo-danger)] px-2 py-0.5 text-[10px] font-bold text-white">
          Commencer
        </span>
      )}
      <span
        className={circleCls}
        style={{
          background: done ? "var(--fluo-card-accent)" : active ? "var(--fluo-hl)" : "var(--fluo-card-tint)",
          borderColor: "var(--fluo-card-accent)",
          color: done ? "#fff" : "var(--fluo-ink)",
        }}
      >
        {done ? "✓" : String(sio.num).padStart(2, "0")}
      </span>
      {sio.isProduction && (
        <span className="fluo-label text-[9px]" style={{ color: "var(--fluo-card-accent)" }}>
          atelier
        </span>
      )}
      <span className="fluo-readable line-clamp-2 text-xs font-bold leading-tight text-[color:var(--fluo-ink)]">
        {sio.topic}
      </span>
    </button>
  );
}
