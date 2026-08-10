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

const KEY = "fluolingo.ui.v1";

export type UiPrefs = {
  /** Dan, 2026-08-10: "We can allow users to toggle back the words under
   *  User (Moi) Settings." Off by default — Duolingo's bar has no words. */
  showNavLabels: boolean;
};

export const DEFAULTS: UiPrefs = { showNavLabels: false };

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
