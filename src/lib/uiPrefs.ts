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
   *  User (Moi) Settings." ON by default since 2026-09-11 — see DEFAULTS. */
  showNavLabels: boolean;
  /** Which families get a slot on the phone's bottom bar. Dan, 2026-09-05:
   *  "the bottom bar is optional and users can opt to remove it or to
   *  replace the items there (but there should be some defaults)."
   *  Membership only — the order on the bar is always FAMILIES order.
   *  Empty means no bar at all. */
  bottomNav: FamilyKey[];
  /**
   * WHICH WAY IS "DOWN" ON THE 3D MAP (Dan, 2026-09-11: *"scrolling up and
   * down the 3d map : by default it should be the other way around, At the
   * same time we also want the user to decide IN THE SETTINGS which way is
   * more naturel for him"*).
   *
   * THE WHEEL ONLY, and Dan drew that line himself: *"there are two things:
   * swipe down with finger, and scroll down with mouse. don't confuse them"*.
   * Measured on the built app from one starting point, goals 1–14 on screen:
   *
   *     wheel down    -> goals 2–17   the camera travels AWAY, up the road
   *     finger down   -> goals 1–12   the road comes TOWARD you
   *
   * They are already mirror images, and each matched its own convention: a
   * wheel scrolls a page, a finger drags the thing under it. Shown both, Dan
   * picked: *"the wheel is the wrong one"*. So the wheel is flipped and the
   * finger is untouched — flipping both would have broken the half that was
   * right.
   *
   * `true` = wheel down brings the road toward you, which is the new default.
   */
  wheelDownComesBack: boolean;
};

export const DEFAULTS: UiPrefs = {
  // ON (Dan, 2026-09-11, looking at a goal card's five activity tiles): *"it
  // would help to add the name of each activity below the tile by default) we
  // can allow users to remove it in the settings"*.
  //
  // It was false — "Duolingo's bar has no words" — and the goal card's names
  // were cut under the litmus test on 7 Sep, on the reasoning that « MémoiRecall »
  // repeats what the icon and its colour already carry. Dan has now judged the
  // other way for the tiles, and the difference is worth naming: the bottom
  // bar's five icons are a fixed set a learner meets on every page and learns
  // once, while a goal's tiles are a DIFFERENT five each time and are the only
  // thing on them — there is nothing else on the tile to carry the meaning.
  //
  // ONE SWITCH, NOT TWO. Réglages' existing "Icon labels" row is this, and it
  // now governs both places rather than gaining a near-identical neighbour. A
  // learner who has opted into the bottom bar will see words under it too;
  // that is the same switch saying the same thing, and one tap undoes it.
  showNavLabels: true,
  // OFF BY DEFAULT (Dan, 6 Sep: "can we remove the bottom nav menu") —
  // superseding his 5 Sep default-five. The bar still exists as the
  // learner's opt-in: tick any tab in Réglages and it appears; the Revise
  // due count rides the ☰ badge while the bar is away. FAMILIES import
  // stays for the type and Réglages' rebuild order.
  bottomNav: [],
  // The flip Dan asked for is the DEFAULT, not an opt-in — he asked for the
  // behaviour changed and a setting to change it back, in that order.
  wheelDownComesBack: true,
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
