/**
 * WHICH WAY THE MAP IS DRAWN — 2D or 3D — and the one place that is decided.
 *
 * Three surfaces have an opinion about it: the map's own 2D/3D control, the
 * `?view=` on any link into /map, and Home's switch. Until now only the first
 * two knew about the saved choice; Home's switch started at 2D on every visit
 * and its map link carried `?view=2d`, which /map then SAVED. So a learner who
 * had chosen 3D, went Home and came back was in 2D, and the thing that had
 * quietly changed their mind was a control that looked like it was only
 * describing the state. Dan, 2026-09-01: *"make sure the switch literally
 * takes you the map it promises to."*
 *
 * The rule is the same one `gapSentence` exists for: when several call sites
 * answer one question, they answer it in one function or they eventually
 * disagree. Reading is safe everywhere (a blocked or empty store is 2D);
 * writing never throws.
 *
 * NOT read during render. The site is statically exported, so localStorage is
 * only available after mount — every caller seeds state from a mount effect.
 */
export type MapView = "2d" | "3d";

export const MAP_VIEW_KEY = "fluo.homeMapView";

/** The saved choice, or 2D when there is none (or storage is blocked). */
export function loadMapView(): MapView {
  try {
    return window.localStorage.getItem(MAP_VIEW_KEY) === "3d" ? "3d" : "2d";
  } catch {
    return "2d";
  }
}

/** Remember the choice. Silent when storage is blocked — the view still
 *  applies for this visit, it just does not survive it. */
export function saveMapView(v: MapView): void {
  try {
    window.localStorage.setItem(MAP_VIEW_KEY, v);
  } catch {
    /* private mode / storage blocked — the choice simply does not persist */
  }
}

/** The link that opens the map already in a given view. One helper so a
 *  caller cannot spell the query differently from the one that reads it. */
export function mapHref(v: MapView): string {
  return `/map?view=${v}`;
}
