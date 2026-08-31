"use client";

/**
 * THE SIDE RAIL, grouped (Dan, 2026-08-19: "At the side, there should be only
 * 5 tabs (Pre-Lesson, Practice, Play, Review, Skill, User), and under them the
 * individual tabs under them").
 *
 * What it replaces: one flat column of seventeen activity flaps plus five
 * Unité flaps above them — twenty-two tabs, all at the same rank, so the rail
 * ran off the bottom of a laptop screen and nothing told a learner that
 * SpecuLearn and 4Mémoire are the same kind of thing.
 *
 * Now: six family flaps, each opening to its own children. Goals holds the
 * five units (each unit page holds its ten goals — "by units and further by
 * goals"), and the other five hold their activities in registry order. The
 * Index is Practice's own door, so it is the Practice flap itself rather than
 * a twenty-third orphan.
 *
 * Open state: ONE family open at a time (Dan, 2026-08-21: "only allow one to
 * expand at any time, otherwise it looks too overwhelming") — opening a flap
 * closes the others; the choice is remembered for the session. The family
 * owning the current page opens by default.
 */
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { FAMILIES, activitiesIn, familyShort, type FamilyKey } from "@/content/activities";
import { UNIT_META } from "@/content/sios";
import { UNIT_ACCENTS } from "@/components/siteTabs";

const OPEN_KEY = "fluo.railOpen";

type Child = { key: string; label: string; emoji: string; href: string; hue?: string };

/** Goals' children are the units, not activities — the one family whose
 *  children come from the curriculum rather than the registry. */
function childrenOf(f: FamilyKey): Child[] {
  if (f === "goals") {
    return [0, 1, 2, 3, 4].map((u) => ({
      key: `unit-${u}`,
      label: UNIT_META[u]?.label ?? `Unité ${u}`,
      emoji: UNIT_META[u]?.emoji ?? "📚",
      href: `/unit/${u}`,
      hue: UNIT_ACCENTS[u],
    }));
  }
  // Same fallback as the Menu: Memo, Sorting and iComplete have no page of
  // their own — they live inside a deck, so there is no "all the Memos"
  // to land on. They go to the map, which is where a stop gets chosen
  // (Dan, 2026-08-29: "the maps should still be the front door for
  // everything"). Dan listed all five under Practice; a rail showing two of
  // them would be the drift this rail exists to end.
  return activitiesIn(f).map((a) => ({
    key: a.key,
    label: a.name,
    emoji: a.emoji,
    href: a.href ?? "/map",
    hue: a.hue,
  }));
}

/** sessionStorage as an external store, read through useSyncExternalStore —
 *  the same answer patch 24 gave the Index's URL state, and the reason neither
 *  has to call setState inside an effect. Server render sees "{}" so the
 *  markup matches the first client frame; the owning family's default open is
 *  applied at read time, not by a second render. */
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function snapshot(): string {
  try { return sessionStorage.getItem(OPEN_KEY) ?? "{}"; } catch { return "{}"; }
}
function serverSnapshot(): string {
  return "{}";
}
function writeOpen(next: Record<string, boolean>): void {
  try { sessionStorage.setItem(OPEN_KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((fn) => fn());
}

export default function RailGroups({
  activeKey,
  onNavigate,
}: {
  activeKey?: string;
  /** Close the ☰ after a child link is followed. The rail used to live on the
   *  desk, where nothing had to close; it is now inside the dropdown, and a
   *  menu that stays open over the page it just opened is a bug. */
  onNavigate?: () => void;
}) {
  const owning = FAMILIES.find((f) =>
    childrenOf(f.key).some((c) => c.key === activeKey),
  )?.key;
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  let stored: Record<string, boolean> = {};
  try { stored = JSON.parse(raw) as Record<string, boolean>; } catch {}
  const open: Record<string, boolean> = owning
    ? { ...stored, [owning]: stored[owning] ?? true }
    : stored;

  // Accordion: opening a flap closes every other one (Dan, 2026-08-21).
  // Every family is written explicitly so the owning family's default-open
  // (`?? true` above) cannot resurrect it beside the learner's choice.
  const toggle = (k: string) => {
    const next: Record<string, boolean> = {};
    FAMILIES.forEach((f) => { next[f.key] = false; });
    next[k] = !open[k];
    writeOpen(next);
  };

  return (
    <>
      {FAMILIES.map((f) => {
        const kids = childrenOf(f.key);
        const isOpen = !!open[f.key];
        // familyShort, not a local regex — this line carried its own copy of
        // the strip and silently showed "FluOLin Goals" when the prefix was
        // respelled on 31 Aug. The drift familyShort's docstring predicted.
        const label = familyShort(f);
        return (
          <div key={f.key} className="contents">
            <button
              type="button"
              onClick={() => toggle(f.key)}
              aria-expanded={isOpen}
              aria-controls={`rail-${f.key}`}
              className="cahier-tab cahier-tab--sm font-black"
              style={{ borderLeftColor: "var(--cahier-ink)" }}
            >
              <span aria-hidden>{f.emoji}</span> {label}
              <span aria-hidden className="ml-auto pl-1 text-[10px] opacity-60">{isOpen ? "▾" : "▸"}</span>
            </button>
            <div id={`rail-${f.key}`} hidden={!isOpen} className="contents">
              {isOpen &&
                kids.map((c) => (
                  <Link
                    key={c.key}
                    href={c.href}
                    aria-current={c.key === activeKey ? "page" : undefined}
                    onClick={onNavigate}
                    className="cahier-tab cahier-tab--xs cahier-tab--child"
                    style={{ borderLeftColor: c.hue }}
                  >
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </Link>
                ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
