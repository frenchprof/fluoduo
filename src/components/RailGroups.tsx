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
 * Open state: the family owning the current page is open, everything else is
 * shut, and the learner's own toggling is remembered per family for the
 * session. One family open at a time was tempting, but a learner comparing
 * Review with Skills would have to keep re-opening one of them.
 */
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { FAMILIES, activitiesIn, type FamilyKey } from "@/content/activities";
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
  // Same fallback as the Menu: xPlain, EtuDice and iComplete have no page of
  // their own (they live inside a deck), so they land on the Index with that
  // activity preselected. Dan listed all five under Practice; a rail showing
  // two of them would be the drift this rail exists to end.
  return activitiesIn(f).map((a) => ({
    key: a.key,
    label: a.name,
    emoji: a.emoji,
    href: a.href ?? `/activities?activity=${a.key}`,
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

export default function RailGroups({ activeKey }: { activeKey?: string }) {
  const owning = FAMILIES.find((f) =>
    childrenOf(f.key).some((c) => c.key === activeKey),
  )?.key;
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  let stored: Record<string, boolean> = {};
  try { stored = JSON.parse(raw) as Record<string, boolean>; } catch {}
  const open: Record<string, boolean> = owning
    ? { ...stored, [owning]: stored[owning] ?? true }
    : stored;

  const toggle = (k: string) => writeOpen({ ...open, [k]: !open[k] });

  return (
    <>
      {FAMILIES.map((f) => {
        const kids = childrenOf(f.key);
        const isOpen = !!open[f.key];
        const label = f.name.replace(/^FluOlin /, "");
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
