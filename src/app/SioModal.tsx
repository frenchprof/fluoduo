"use client";

/**
 * The shared popup chrome for a SIO: the outcome spelled out, then the links.
 *
 * Dan, 2026-08-31: *"collapse the interfaces to ONLY reveal the SIO spelled out
 * fully, then the links to the relevant items within the stop. THAT IS IT."*
 *
 * WHAT THIS REPLACED, and why it had to go. One stop stacked the same activity
 * list THREE times — a numbered path in the body, flaps off the right edge on
 * wide screens, and the same flaps again as a row under the header on narrow
 * ones. Worse, four of those activities (WorDrill, iComplete, Sorting,
 * GramMarathon) RENDERED INSIDE the popup while the rest navigated away, so two
 * identical-looking rows did two different things depending which you tapped.
 * The popup was a menu and a container at once, and only the container half was
 * ever load-bearing.
 *
 * Now: one list, every row a link, nothing opens in here.
 *
 * THE LIST IS DERIVED, never authored. `popupActivityTabs` is
 * `deckActivityTabs` — the same set every other surface reads — so a stop shows
 * what it actually has. That is what made the Sorting cut (#93) free: an
 * activity leaves this list by leaving the registry, with no edit here. The
 * ✓ / › state comes from the device ledger, the same read the landings use.
 *
 * WHAT THE COLLAPSE DEPENDED ON. Every pre-test needed a page first, or the ten
 * Unit-0 stops whose questions rendered in this body would have lost them
 * outright (#98).
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Sio } from "@/content/sios";
import type { Collection } from "@/lib/collections/schema";
import { deckActivityTabs } from "@/components/CahierShell";
import { activity } from "@/content/activities";
import { accuracyFor, activityKeyFor, loadLedger, LEDGER_EVENT, type Ledger } from "@/lib/activityLedger";

export type PopupTab = { key: string; label: string; emoji: string; href?: string; active?: boolean; hint?: string };


/**
 * The popup renders EXACTLY the deck's unified activity list
 * (deckActivityTabs — same set the activity pages' rail shows, so leaving
 * via a flap never changes the flaps). The Pre-Test flap becomes the ACTIVE
 * (current-view) flap when the pretest questions render inline in this
 * popup's body; a pretest with no deck still gets its lone flap.
 */
export function popupActivityTabs(
  deck?: Collection,
  pretest?: { inline: boolean; href: string | null },
): PopupTab[] | undefined {
  // `short ?? name`: the popup's buttons are a two-column grid, so a cell is
  // about 168px on a phone. The registry's short form is used HERE and only
  // here — every surface with room still spells the activity out.
  const base: PopupTab[] = deck
    ? deckActivityTabs(deck.id).map((t) => ({
        key: t.key,
        label: activity(t.key)?.short ?? t.label,
        emoji: t.emoji ?? "",
        href: t.href,
        hint: t.hint,
      }))
    : [];
  if (pretest && (pretest.inline || pretest.href)) {
    const tab: PopupTab = pretest.inline
      ? { key: "pretest", label: "Pre-Test", emoji: "🧪", active: true, hint: "try it first" }
      : { key: "pretest", label: "Pre-Test", emoji: "🧪", href: pretest.href ?? undefined, hint: "try it first" };
    const i = base.findIndex((t) => t.key === "pretest");
    if (i >= 0) base[i] = tab;
    else base.unshift(tab);
  }
  return base.length ? base : undefined;
}

export default function SioModal({
  sio,
  onClose,
  tabs,
  children,
  footer,
}: {
  sio: Sio;
  onClose: () => void;
  tabs?: PopupTab[];
  /** The SIO spelled out fully — the caller supplies it. */
  children: ReactNode;
  /** Rendered BELOW the links. Temporary, and holds exactly one thing: the
   *  Mark-as-done button, which Dan has ruled goes when done-ness becomes
   *  derived from this very list. Until that rule exists, removing it would
   *  leave no way to complete a stop at all — but it must not sit between the
   *  statement and the links, which are the two things the popup is now for.
   *  This slot dies with the button. */
  footer?: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // This device's tally — refreshed live so a link earns its ✓ while the popup
  // is still open (a pre-test taken on its own page fires the same event).
  const [ledger, setLedger] = useState<Ledger>(() => loadLedger());
  useEffect(() => {
    const refresh = () => setLedger(loadLedger());
    window.addEventListener(LEDGER_EVENT, refresh);
    return () => window.removeEventListener(LEDGER_EVENT, refresh);
  }, []);

  // THE WHOLE LIST, in authored order, rendered ONCE. `tabs` is
  // popupActivityTabs(), which is deckActivityTabs() — derived per stop, so a
  // stop shows what it actually has. That is what makes the Sorting cut (#93)
  // free here: an activity leaves this list by leaving the registry.
  const links = tabs ?? [];
  const done = (t: PopupTab) => {
    const k = activityKeyFor(t.href) ?? (t.key === "pretest" ? "speculearn" : t.key);
    return !!k && accuracyFor(ledger, k, sio.id) !== null;
  };
  const nextKey = links.find((t) => !done(t))?.key;

  // Dialog keyboard basics: Escape closes; focus starts on the ✕ so keyboard
  // and screen-reader users land inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-full" onClick={(e) => e.stopPropagation()}>
        <div
          className="overflow-auto rounded-2xl border-2 bg-[var(--fluo-card)] p-5"
          style={{
            borderColor: "var(--fluo-card-accent)",
            width: "32rem",
            maxWidth: "90vw",
            minHeight: "10rem",
            maxHeight: "88vh",
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <span className="fluo-mono rounded-md bg-[var(--fluo-card-tint)] px-2 py-0.5 text-xs font-bold text-[color:var(--fluo-ink)]">
                {sio.id}
              </span>
              <h2 className="fluo-readable mt-1 text-xl font-bold text-[color:var(--fluo-ink)]">{sio.topic}</h2>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="fluo-btn fluo-btn-sm" aria-label="Close">
              ✕
            </button>
          </div>

          {/* The SIO, spelled out fully. The caller supplies it. */}
          {children}

          {/* …then the links. One list, no second copy. */}
          {links.length > 0 && (
            <ol className="sio-path" aria-label="What this goal has">
              {links.map((t, i) => {
                const isDone = done(t);
                const here = t.key === nextKey;
                const cls = `sio-step${isDone ? " is-done" : ""}${here ? " is-here" : ""}`;
                const inner = (
                  <>
                    <span className="sio-step-num" aria-hidden>{i + 1}</span>
                    <span className="sio-step-emoji" aria-hidden>{t.emoji}</span>
                    <span className="sio-step-name">{t.label}</span>
                    {isDone ? (
                      <span className="sio-step-end">✓</span>
                    ) : here ? (
                      <span className="sio-step-end" aria-hidden>›</span>
                    ) : null}
                  </>
                );
                // Every row is a link now. Nothing opens inside this popup:
                // the four activities that used to (WorDrill, iComplete,
                // Sorting, GramMarathon) navigate like the rest, so one row
                // cannot mean two different things.
                return (
                  <li key={t.key}>
                    {t.href ? (
                      <Link href={t.href} className={cls}>{inner}</Link>
                    ) : (
                      <span className={cls} aria-disabled>{inner}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {footer}
        </div>
      </div>
    </div>
  );
}
