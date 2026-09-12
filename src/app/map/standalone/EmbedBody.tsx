"use client";

/**
 * The embeddable map's body. Deliberately thin: it reads progress, picks the
 * current stop, and hands both to Map2DGrid — the same component /map uses.
 *
 * A STOP OPENS THE REAL APP. Inside the app a stop opens the goal's page; here
 * there is no app around it, so a tap leaves with the stop's hash, and
 * `target="_top"` breaks out of the iframe rather than loading FluOLinGo
 * inside a 620px box on someone else's page.
 *
 * IT LIVES BESIDE /map/standalone SINCE 2026-09-12, having sat in /map/embed
 * since it was written. That folder went when Home and the map merged and /map
 * stopped framing anything — and this file, the one thing in it with a
 * consumer left, went with it and broke the build. Moved rather than restored:
 * /map/standalone is its only importer and always was, so the two now sit
 * together instead of pointing at each other across a retired route.
 */
import { useEffect, useState } from "react";
import Map2DGrid from "@/components/Map2DGrid";
import { KindLegend } from "@/components/HomeMap";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";
import { HOME_HREF } from "@/lib/routes";

export default function EmbedBody() {
  // Progress lives in localStorage, which the prerender must not read — an
  // export baked with one learner's ticks would ship them to everyone.
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress());
    const sync = () => setProgress(loadProgress());
    window.addEventListener("fluolingo:progress-updated", sync);
    return () => window.removeEventListener("fluolingo:progress-updated", sync);
  }, []);

  const activeId = nextSioId(progress);

  return (
    // .fluo-embed is what tells the body to hide FluOLinGo's own furniture —
    // footer, feedback button, beta notice, install prompt. See globals.css.
    <main className="fluo-embed cahier-paper min-h-screen p-3">
      <div className="mx-auto max-w-3xl">
        <Map2DGrid
          progress={progress}
          activeId={activeId}
          accent={equippedAccent(progress)}
          onOpenSio={(_unit, id) => {
            // Out of the frame, into the app.
            window.open(`${HOME_HREF}#${id}`, "_top");
          }}
        />
        <div className="mt-2.5">
          <KindLegend />
        </div>
      </div>
    </main>
  );
}
