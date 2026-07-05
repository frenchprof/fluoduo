"use client";

/**
 * ONE unit's SIO content — the body of a /unit/[n] page (Dan, 2026-07-05:
 * "the flaps should lead to just each unit's content"). Extracted from the
 * old one-page SioHub. Unité 0 renders its tile grid (Unit0Panel); Unités
 * 1–4 render rows of circles grouped by Situation/Atelier — a row's width is
 * however many SIOs fall under that group, NOT a fixed zigzag.
 *
 * Clicking a circle opens the shared SioModal popup (pretest inline, activity
 * flaps). Deep links work: /unit/2#SIO-023 opens that SIO's popup on mount —
 * the home learning path links here that way.
 *
 * Node states, backed by src/lib/progress.ts: done (self-marked) or active
 * (the single earliest not-done SIO site-wide — shown only when it falls in
 * this unit). Group rows stay individually collapsible (same localStorage
 * key the old hub used).
 */
import { useEffect, useState } from "react";
import { SIOS, UNIT_META, groupSiosForUnit, type Sio } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { getPretestForSio } from "@/content/pretests";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import Unit0Panel from "./Unit0Panel";
import SioModal, { popupActivityTabs } from "./SioModal";
import SioDetail from "./SioDetail";
import MarkDoneButton from "./sio/[id]/MarkDoneButton";

const STORAGE_KEY = "fluolingo:hubCollapse";

function deckAndPretestFor(sio: Sio) {
  const deck = sio.collectionId ? CURATED.find((c) => c.id === sio.collectionId) : undefined;
  const pretest = getPretestForSio(sio.id);
  // Dice fallback only where the deck actually supports dice (has letris columns).
  const pretestHref = pretest ? `/pretests/${pretest.id}` : deck?.gameConfig?.letris ? `/practice/dice/${deck.id}` : null;
  return { deck, pretestHref, pretestId: pretest?.id ?? null };
}

export default function UnitSection({
  unit,
  forceOpen,
}: {
  unit: number;
  /** The /practice/* and /lessons/* URLs render the unit page with this SIO's
   *  popup already open on an activity view — level 2 floats from every
   *  entrance, not just popup flaps (Dan, 2026-07-05). */
  forceOpen?: { sioId: string; view?: string; lessonSlug?: string };
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [openId, setOpenId] = useState<string | null>(forceOpen?.sioId ?? null);

  const sios = SIOS.filter((s) => s.unit === unit);
  const meta = UNIT_META[unit] ?? { label: `Unité ${unit}`, subtitle: "", emoji: "📚" };

  useEffect(() => {
    try {
      setCollapsed(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      // ignore — falls back to fully expanded
    }
    const refresh = () => setProgress(loadProgress());
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    // Deep link: /unit/N#SIO-0XX opens that popup (home path lands here).
    // Unit 0 popups belong to Unit0Panel (its modal carries the MCQs — this
    // generic one would open empty), so it handles its own deep links.
    if (!forceOpen && unit !== 0) {
      const hash = window.location.hash.replace("#", "");
      if (hash && SIOS.some((s) => s.id === hash && s.unit === unit)) setOpenId(hash);
    }
    return () => window.removeEventListener("fluolingo:progress-updated", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

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

  // The single "you are here" node across the whole course.
  // Earliest not-done goal across the whole course — Unit 0 included, so the
  // "you are here" marker starts at SIO-001 for a new learner (Dan, 2026-07-05).
  const activeId = SIOS.find((s) => !isSioDone(s.id, progress))?.id;
  const openSio = openId ? sios.find((s) => s.id === openId) : undefined;
  const doneCount = sios.filter((s) => isSioDone(s.id, progress)).length;
  const groups = groupSiosForUnit(unit);
  const hue = unit % 6;

  return (
    <div className={`fluo-h-${hue}`}>
      <div
        className="mb-5 flex w-full items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "var(--fluo-card-accent)" }}
      >
        <span className="text-2xl" aria-hidden>{meta.emoji}</span>
        <span className="fluo-serif text-lg font-black text-white">{meta.label}</span>
        {meta.subtitle && (
          <span lang="fr" className="hidden text-sm text-white/85 sm:inline">{meta.subtitle}</span>
        )}
        <span className="fluo-label ml-auto rounded-full bg-white/25 px-3 py-1 text-white">
          {doneCount}/{sios.length}
        </span>
      </div>

      {unit === 0 ? (
        <Unit0Panel forceOpen={forceOpen} />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => {
            const groupKey = `unit-${unit}:${group.key}`;
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
      )}

      {unit !== 0 && openSio && (() => {
        const { deck, pretestHref, pretestId } = deckAndPretestFor(openSio);
        return (
          <SioModal
            sio={openSio}
            onClose={() => {
              setOpenId(null);
              // An activity URL with its popup closed IS the unit page — make
              // the address bar agree so refresh/share land right.
              if (forceOpen) window.history.replaceState(null, "", `/unit/${unit}`);
            }}
            deck={deck}
            initialView={openSio.id === forceOpen?.sioId ? forceOpen?.view : undefined}
            lessonSlug={openSio.id === forceOpen?.sioId ? forceOpen?.lessonSlug : undefined}
            tabs={
              openSio.isProduction
                ? popupActivityTabs(deck) // atelier decks: flip/say/complete on the model lines
                : popupActivityTabs(deck, { inline: !!pretestId, href: pretestHref })
            }
          >
            <SioDetail sio={openSio} deck={deck} pretestHref={pretestHref} pretestId={pretestId} showPractice={openSio.isProduction} />
            <MarkDoneButton sioId={openSio.id} />
          </SioModal>
        );
      })()}
    </div>
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
          Continuer
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
      {sio.isProduction && sio.id !== "SIO-010" && (
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
