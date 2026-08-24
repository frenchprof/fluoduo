"use client";

/**
 * THE MENU (Dan, 2026-08-19: "the help pop up — should be more appropriately
 * renamed as menu showing just a grid of tiles in 4x5 or 5x4").
 *
 * It replaces the Quick Guide popup, which opened on the same button and
 * spent its space explaining the app in numbered steps. What a learner
 * reached for that button to do was GO somewhere; the prose was furniture
 * (Dan's litmus test — text you can delete without stopping anyone finding
 * the answer). The long-form guide still exists at /guide for anyone who
 * wants it.
 *
 * Tiles run in FAMILIES order — Goals, Practice, Play, Review, Skills, User —
 * so the grid reads in the same order as the rail.
 *
 * Exactly twenty tiles, because the registry holds exactly twenty activities
 * — four across by five down on a phone, five across by four down from sm.
 * No group headings: a tile carries its own emoji, name and family colour,
 * and twenty tiles read faster as one field than as six labelled shelves.
 *
 * The three per-deck activities (Memo, EtuDice, iComplete) have no page of
 * their own — they live inside a deck — so their tile lands on the Index with
 * that activity preselected rather than being left out. A menu missing three
 * of its twenty would be the thing a learner notices.
 */
import Link from "next/link";
import { activitiesInFamilyOrder, FAMILIES } from "@/content/activities";

export default function MenuSplash({ onClose }: { onClose: () => void }) {
  const close = () => {
    onClose();
    try { window.dispatchEvent(new Event("fluolingo:guide-splash-closed")); } catch {}
  };
  return (
    <div
      className="fixed inset-0 z-[85] bg-black/35 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onClick={close}
    >
      <div
        className="mx-auto mt-[4vh] max-h-[88vh] w-[min(94vw,42rem)] overflow-y-auto rounded-2xl border-2 bg-[color:var(--cahier-paper,#fdfbf4)] p-4 shadow-2xl"
        style={{ borderColor: "var(--cahier-ink, #222850)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">Menu</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black transition hover:-translate-y-0.5"
            style={{ borderColor: "var(--cahier-ink)", color: "var(--cahier-ink)" }}
          >
            ✕
          </button>
        </div>

        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {activitiesInFamilyOrder().map((a) => {
            const family = FAMILIES.find((f) => f.key === a.family);
            return (
              <li key={a.key}>
                <Link
                  href={a.href ?? `/activities?activity=${a.key}`}
                  onClick={close}
                  title={`${a.name} — ${a.blurb}`}
                  className="flex h-full flex-col items-center justify-start gap-1 rounded-xl border-2 px-1 py-2 text-center shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                  style={{ borderColor: a.hue, background: "var(--cahier-paper-raised)" }}
                >
                  <span aria-hidden className="text-xl leading-none">{a.emoji}</span>
                  <span className="fluo-mono text-[10px] font-black leading-tight text-[color:var(--cahier-ink)]">
                    {a.name}
                  </span>
                  <span className="sr-only">{family?.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
