/**
 * THE WINDOW WHOSE ADDRESS A LEARNER CAN SEE.
 *
 * Every station runs in an iframe inside the cahier (Dan, 2026-09-07:
 * *"EVERYTHING … MUST NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES"*), and the
 * frame's own src is `…/embed` — no query, no hash, and not the address anyone
 * is looking at. So a station that reads or writes the URL must read the one
 * OUTSIDE the frame, or it is talking to itself.
 *
 * It has now cost two features, which is why it lives here rather than in
 * either of them:
 *
 *   the pre-test's bookmark (7 Sep)  the address bar said `#q9` and the run
 *                                    opened on question one, every time
 *   ConjugaZone's lesson (11 Sep)    `/conjugaison?deck=aimer-activites` drilled
 *                                    être / avoir / aller — the frame's own src
 *                                    carries no `?deck=`, so every lesson got
 *                                    the default
 *
 * Same origin, so the parent is simply readable. Standalone, the parent IS this
 * window and the same code works unchanged — which is what makes it safe to
 * call from a component that does not know whether it is framed.
 */
export function addressWindow(): Window {
  try {
    if (window.parent !== window && window.parent.location.origin === window.location.origin) {
      return window.parent;
    }
  } catch {}
  return window;
}

/** The query a learner can see, whichever side of the frame this runs on. */
export function addressSearch(): string {
  if (typeof window === "undefined") return "";
  try {
    return addressWindow().location.search;
  } catch {
    return window.location.search;
  }
}
