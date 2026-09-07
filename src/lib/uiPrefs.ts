/**
 * Small, boring UI preferences that survive a reload.
 *
 * One key, one shape, one place. The app already had four separate ad-hoc
 * localStorage keys for drill settings (`fluolingo.practiceTts.v1` and
 * friends); this is not a fifth pattern, it is where the next one should go.
 *
 * Reads are SSR-safe: `output: "export"` prerenders every page, so anything
 * touching `window` at module scope breaks the build.
 */

import { type FamilyKey } from "@/content/activities";

const KEY = "fluolingo.ui.v1";

export type UiPrefs = {
  /** Dan, 2026-08-10: "We can allow users to toggle back the words under
   *  User (Moi) Settings." Off by default — Duolingo's bar has no words. */
  showNavLabels: boolean;
  /** Which families get a slot on the phone's bottom bar. Dan, 2026-09-05:
   *  "the bottom bar is optional and users can opt to remove it or to
   *  replace the items there (but there should be some defaults)."
   *  Membership only — the order on the bar is always FAMILIES order.
   *  Empty means no bar at all. */
  bottomNav: FamilyKey[];
};

export const DEFAULTS: UiPrefs = {
  showNavLabels: false,
  // OFF BY DEFAULT (Dan, 6 Sep: "can we remove the bottom nav menu") —
  // superseding his 5 Sep default-five. The bar still exists as the
  // learner's opt-in: tick any tab in Réglages and it appears; the Revise
  // due count rides the ☰ badge while the bar is away. FAMILIES import
  // stays for the type and Réglages' rebuild order.
  bottomNav: [],
};

export function readUiPrefs(): UiPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UiPrefs>) };
  } catch {
    return DEFAULTS;
  }
}

export function writeUiPrefs(next: Partial<UiPrefs>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...readUiPrefs(), ...next }));
    window.dispatchEvent(new Event("fluolingo:uiprefs"));
  } catch {
    /* private mode, quota — a preference is not worth throwing over */
  }
}
