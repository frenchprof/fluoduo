/* WAIT FOR THE CONDITION, NOT THE CLOCK — 11 Sep 2026.
 *
 * Every browser-driven scan in scripts/ used to load a page and then sleep a
 * flat 1.4-2.8 seconds by `page.waitForTimeout(...)`, not for anything in
 * particular but long enough that whatever it wanted had surely happened. That
 * is most of what CI's ten and a half minutes WAS. Measured on run #745:
 *
 *     verify126-band-strip   115s total   108s of it asleep   (77 pages x 1.4s)
 *     verify150-night-plates  70s total    67s of it asleep   (24 hours x 2.8s)
 *     verify171-pretest-feeds 29s total    19s of it asleep   (6 routes x 3.1s)
 *
 * 118 of the 129 checks finish in 30 seconds between them, and launching
 * Chromium costs 0.14s, so neither fewer workflow steps nor a shared browser is
 * where the time is. The sleeps are.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE. Wait for the thing the check is about
 * to measure — not for a proxy, and not for a number of milliseconds. A first
 * cut of the band scan waited only for the page's frames to finish loading,
 * which sounds equivalent and is not: /games/lexicalater/[deckId] and
 * /decks/[id]/study build their strip after their deck data arrives, so two
 * runs of the SAME commit disagreed about whether they had one. A check that
 * fails at random is worse than a check that is slow. Waiting for the strip
 * itself — the same question the probe then asks — is what made it steady.
 *
 * AND IT CANNOT TURN A PASS INTO A FAILURE THE SLEEP WOULD HAVE MISSED. If the
 * condition is never met, `settle` falls through after its own timeout and the
 * scan probes whatever is on the page — which is exactly what the flat sleep
 * did. The timeout is the old budget, generously rounded up; the point is that
 * the common case no longer pays it.
 */

/**
 * Load `url` and wait until the page is ready to be measured.
 *
 * @param page    a Playwright page
 * @param url     the address to load
 * @param ready   a function evaluated IN THE BROWSER, returning true when the
 *                thing being measured is on screen and has stopped changing.
 *                It sees the top document; reach into same-origin frames with
 *                `f.contentDocument` (see `FRAMES_SETTLED` below).
 * @param opts.timeout  how long to allow the condition, in ms (default 6000 —
 *                      comfortably more than the sleeps this replaces)
 */
export async function visit(page, url, ready, opts = {}) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await settle(page, ready, opts);
}

export async function settle(page, ready, { timeout = 6000, tries = 3 } = {}) {
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      await page.waitForLoadState("load", { timeout });
      if (ready) await page.waitForFunction(ready, null, { timeout });
      // One settled frame for the layout pass that positions what we just
      // waited for, rather than a flat second and a half.
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      return;
    } catch (err) {
      // ONLY A NAVIGATION IS WORTH RETRYING. A client-side redirect (/about
      // forwards) destroys the execution context mid-wait; that is not a failure,
      // it is a second page to settle, and the old flat sleep absorbed it
      // silently. A TIMEOUT is the opposite: the condition was asked and did not
      // come true, so asking again just spends the budget again. That matters on
      // a red run — retrying a genuine failure three times over 24 pages turns a
      // six-second wait into three minutes — so a timeout falls straight through
      // and the scan probes whatever is on the page, which is what the flat sleep
      // did anyway.
      const moved = /context was destroyed|Execution context|navigat/i.test(String(err && err.message));
      if (!moved || attempt === tries - 1) return;
      await page.waitForTimeout(150);
    }
  }
}

/* Browser-side helpers, for composing into a `ready` function.
 * These are stringified into the page, so they may not close over anything. */

/** True once every same-origin frame has loaded and stamped `data-embed`. */
export const FRAMES_SETTLED = `
  (() => {
    for (const f of document.querySelectorAll("iframe")) {
      let d = null;
      try { d = f.contentDocument; } catch { return true; }   // cross-origin: not ours to wait for
      if (!d || d.readyState !== "complete") return false;
      if (!d.documentElement.hasAttribute("data-embed")) return false;
    }
    return true;
  })()`;

/** True once `sel` matches something laid out and visible, in the page or any frame. */
export const visibleSomewhere = (sel) => `
  (() => {
    const lit = (d) => {
      for (const el of d.querySelectorAll(${JSON.stringify(sel)})) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (el.getBoundingClientRect().height >= 1) return true;
      }
      return false;
    };
    if (lit(document)) return true;
    for (const f of document.querySelectorAll("iframe")) {
      let d = null;
      try { d = f.contentDocument; } catch { continue; }
      if (d && lit(d)) return true;
    }
    return false;
  })()`;
