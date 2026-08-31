"use client";

/**
 * ONE unit's SIO content — the body of a /unit/[n] page (Dan, 2026-07-05:
 * "the flaps should lead to just each unit's content"). Extracted from the
 * old one-page SioHub. Unité 0 renders its tile grid (Unit0Panel); Unités
 * 1–4 render rows of circles grouped by Situation/Atelier — a row's width is
 * however many SIOs fall under that group, NOT a fixed zigzag.
 *
 * Clicking a circle opens the shared SioModal popup (pretest inline, activity
 * flaps). Deep links work: /#SIO-023 (or the legacy /unit/2#SIO-023, which
 * redirects) opens that SIO's popup on mount; Home's map passes `openSioId`
 * for taps after mount (patch 25: the unit page is a deep link into Home).
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
import { nextSioId } from "@/lib/continuer";
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
  openSioId,
  onSioClosed,
}: {
  unit: number;
  /** Home's map: open this SIO's popup (patch 25); `onSioClosed` clears it. */
  openSioId?: string | null;
  onSioClosed?: () => void;
}) {
  // (The forceOpen prop died with patch 22: the /lessons/* URLs render the
  // full-screen pager now, so no route needs the popup pre-opened for it.)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [openId, setOpenId] = useState<string | null>(null);

  const sios = SIOS.filter((s) => s.unit === unit);
  const meta = UNIT_META[unit] ?? { label: `Unité ${unit}`, subtitle: "", emoji: "📚" };

  useEffect(() => {
    try {
      // localStorage and the URL hash do not exist on the server, so neither
      // the collapse state nor a deep link can be read during render. On mount
      // is the only place they can be read at all.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage, see above
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
    if (unit !== 0) {
      const hash = window.location.hash.replace("#", "");
      if (hash && SIOS.some((s) => s.id === hash && s.unit === unit)) setOpenId(hash);
    }
    return () => window.removeEventListener("fluolingo:progress-updated", refresh);
  }, [unit]);

  // Home's map taps a stop → open that SIO here without a navigation
  // (patch 25: /unit/N is a deep link into Home now, the map is the page).
  useEffect(() => {
    // The map taps a stop AFTER mount (patch 25) — mirroring a prop the parent
    // changes later is what an effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount prop, see above
    if (unit !== 0 && openSioId && sios.some((s) => s.id === openSioId)) setOpenId(openSioId);
  }, [openSioId, unit, sios]);

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

  // The single "you are here" node across the whole course — the first
  // not-done goal after the furthest « done » (see lib/continuer).
  const activeId = nextSioId(progress);
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
        <Unit0Panel openSioId={openSioId} onSioClosed={onSioClosed} />
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
                  <div className="grid grid-cols-3 gap-2.5 py-1 sm:grid-cols-5 sm:gap-3">
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
        const { deck, pretestHref } = deckAndPretestFor(openSio);
        return (
          <SioModal
            sio={openSio}
            onClose={() => {
              setOpenId(null);
              onSioClosed?.();
            }}
            tabs={
              openSio.isProduction
                ? popupActivityTabs(deck) // atelier decks: flip/say/complete on the model lines
                // `inline` is always false now: an authored pre-test opens its
                // own page, as every pre-test in the course does since #98.
                : popupActivityTabs(deck, { inline: false, href: pretestHref })
            }
            footer={<MarkDoneButton sioId={openSio.id} />}
          >
            {/* The statement only. SioDetail's tiles, chips and inline quiz
                went with the collapse — the links below say what the stop has,
                and saying it twice was the whole problem. */}
            <SioDetail sio={openSio} deck={deck} pretestHref={pretestHref} showPractice={false} />
          </SioModal>
        );
      })()}
    </div>
  );
}

/** One SIO as a Unit-0-style TILE (Dan, 2026-07-08: units 1–4 adopt Unit 0's
 *  look) — same card, circle, "atelier" label and topic as Unit0Panel's grid,
 *  with the 1–4 progress semantics kept: ✓ circle when done, Continuer badge +
 *  highlight when it's the course's active node. */
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
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-[var(--fluo-card)] p-3 text-center transition hover:-translate-y-0.5"
      style={{ borderColor: "var(--fluo-card-accent)", background: active ? "var(--fluo-hl)" : undefined }}
    >
      {active && (
        <span className="fluo-mono rounded-full bg-[var(--fluo-danger)] px-2 py-0.5 text-[10px] font-bold text-white">
          Continue
        </span>
      )}
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black"
        style={{
          background: done ? "var(--fluo-card-accent)" : "var(--fluo-card-tint)",
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
