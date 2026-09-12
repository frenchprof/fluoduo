// sheet-scan — ONE sheet of paper per page, and the coils run up to the band.
//
// Dan, 2026-09-11, sent two screens: *"Profiles, ChaTutor page looks
// doubleframed"*, then, shown a game's top-left corner: *"coils up to the band
// and also the corresponding vertical strip"*. Two faults in the same corner,
// and neither is visible from any one file.
//
// ── 1 · ONE SHEET ───────────────────────────────────────────────────────────
// A station runs inside the cahier in an iframe (Dan, 7 Sep). The page draws
// the notebook; the station must not draw a second one. `html[data-embed]`
// hides the shell's FURNITURE in a framed document — site bar, band, coils,
// shadow, radius, family spine — and that was long taken for "nothing is
// left". Two things were left, and they are precisely the two that make a
// sheet look like a sheet: `.cahier-page`'s paper and its 32px ruling, and
// `.cahier-foolscap`'s 28px ruling. So a framed CahierShell laid a SECOND
// sheet on the page's own, starting 48px in — the well's gutter, where the
// coils are — and the join showed as ruled lines that stop dead at the frame's
// edge and restart at a different height.
//
// A GREP CANNOT SEE IT. `import CahierShell` in an embed route is the cause,
// but the same import is harmless where the shell is what draws the page's
// only sheet, and a station could grow the fault without importing anything
// (any opaque full-height root does it). Only the rendered pair knows, so this
// drives both documents and counts SHEETS: a root that paints paper — an
// opaque background or a background image — and stands taller than 200px.
//
// IT IS A LIST, NOT A SWEEP. Dan asked for Profile and ChaTutor; the other
// fifteen framed stations still draw their own sheet and were left alone on
// purpose (widening is his call, not this branch's). Adding a route to the fix
// is one line here, which is the point of a list — the next ruling will not be
// about these two.
//
// ── 2 · THE COILS REACH THE BAND ────────────────────────────────────────────
// The binding used to open BELOW the band, so a page's left edge was a 6px
// family spine beside the bar and the band and a 30px coil strip under it — it
// changed width halfway down the screen. Home has no band and so started its
// coils at its hero, and Dan met the step by putting the two side by side.
// Both shells open the binding region above the band now. Measured, not
// grepped, because the fact is a geometric one about two boxes and it survives
// any amount of correct-looking markup: the binding's top must be at or above
// the band's, and the band's own content must start clear of the coils or the
// rings cross the ✕ — the one control every band has to keep.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4187;

/* The stations whose framed half draws NO sheet of its own (Dan, 11 Sep).
   Each entry is a HOST route — the page a learner opens — and the reason. */
const ONE_SHEET = new Map([
  ["/profil", "Profile — /profil/embed renders ProfileContent and no shell."],
  ["/tutor", "ChaTutor — /tutor/embed renders the panel and no shell."],
]);

/* Routes to measure the corner on: both shells, framed and unframed, plus the
   two above so a fix to one fault cannot quietly undo the other. */
const CORNER = [
  "/profil", "/tutor", "/map", "/reviser", "/tts",
  "/games/vocabularain", "/sio/SIO-041",
  "/practice/grammarathon/salutations", "/decks/salutations",
  /* ADDED 2026-09-12, AND THE LIST WAS USELESS FOR SECTION 3 WITHOUT THEM.
     Every route above draws its band in the HOST document, so the strip-reaches-
     the-rings check could not fail on any of them: restoring the fault and
     re-running left it green. These three draw their band INSIDE the frame,
     which is the only place the fault lives — a check whose subject is absent
     from its own list reports safety.
     `/conjugaison` and the lesson are DrillShell-in-a-frame; `/practice/say-it`
     is a third shape of the same thing. */
  "/conjugaison", "/lessons/deck/salutations", "/practice/say-it/salutations",
];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
  ".mp3": "audio/mpeg", ".webmanifest": "application/manifest+json",
};

function resolveFile(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  for (const c of [join(OUT, clean), join(OUT, clean + ".html"), join(OUT, clean, "index.html")]) {
    try { if (statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url);
  if (!file) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const exe = process.env.BAND_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();

/* A SHEET is a shell root that paints paper. Transparent roots do not count —
   that is exactly what a station inside a frame is supposed to be now. */
const sheets = (f) =>
  f.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(".cahier-page, .cahier-surface, .cahier-drill")) {
      const r = el.getBoundingClientRect();
      if (r.height < 200 || r.width < 100) continue;
      const cs = getComputedStyle(el);
      const opaque = cs.backgroundImage !== "none" ||
        !/^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(cs.backgroundColor);
      if (!opaque) continue;
      // One element can wear both class names; count the BOX, not the label.
      if (out.some((o) => o.el === el)) continue;
      out.push({ el, w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out.map(({ w, h }) => ({ w, h }));
  });

const corner = (f) =>
  f.evaluate(() => {
    const b = document.querySelector(".cahier-binding");
    /* THE SHELL'S BAND, which is the one the coils run past — the same
       `.cahier-binding ~ .page-band` the stylesheet keys its clearance on. A
       band drawn INSIDE a content well is a different animal: /decks/[id]
       suppresses the shell's and heads its table with one of its own
       (CuratedDeckTable.tsx), 47px down the paper and already clear of the
       coils. Measuring that one against the binding reported a fault that is
       not there, which is how this probe learned to name what it means. */
    const band = b && [...b.parentElement.children].find(
      (e) => e.classList.contains("page-band") && getComputedStyle(e).display !== "none");
    if (!b || !band) return null;
    const br = b.getBoundingClientRect(), ar = band.getBoundingClientRect();
    // Where the band's first control actually starts.
    const lead = band.firstElementChild;
    const lr = lead ? lead.getBoundingClientRect() : null;
    return {
      bindTop: Math.round(br.top), bandTop: Math.round(ar.top),
      bindRight: Math.round(br.right), leadLeft: lr ? Math.round(lr.left) : null,
      z: getComputedStyle(b).zIndex,
    };
  });

const bad = [];
for (const [route] of ONE_SHEET) {
  const url = resolveFile(route) ? route : null;
  if (!url) { bad.push(`${route}: not exported — the list names a route that does not exist.`); continue; }
  await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  let total = 0;
  const per = [];
  for (const f of page.frames()) {
    const s = await sheets(f).catch(() => []);
    total += s.length;
    per.push(`${f === page.mainFrame() ? "page" : "frame"}:${s.length}`);
  }
  if (total !== 1) bad.push(`${route}: ${total} sheets (${per.join(" ")}) — ${ONE_SHEET.get(route)}`);
  else process.stdout.write(`  one sheet  ${route}\n`);
}

for (const route of CORNER) {
  if (!resolveFile(route)) continue;
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  let seen = false;
  for (const f of page.frames()) {
    const c = await corner(f).catch(() => null);
    if (!c) continue;
    seen = true;
    if (c.bindTop > c.bandTop + 1) {
      bad.push(`${route}: the coils start ${c.bindTop - c.bandTop}px BELOW the band — ` +
        "the page's left edge changes width halfway down. Open the binding region above the band.");
    }
    if (c.z === "auto" || Number(c.z) < 3) {
      bad.push(`${route}: .cahier-binding z-index is ${c.z} — the band (z-index 2) paints over ` +
        "the rings, so moving them up changes nothing a learner can see.");
    }
    if (c.leadLeft !== null && c.leadLeft < c.bindRight) {
      bad.push(`${route}: the band's ✕ starts at ${c.leadLeft}px, inside the coils (they end at ` +
        `${c.bindRight}px) — the rings cross the one control every band must keep.`);
    }
  }
  process.stdout.write(`  corner     ${route}${seen ? "" : "   (no shell band — its heading is inside the well)"}\n`);
}

/* ── 3 · THE STRIP REACHES THE RINGS, IN EVERY DOCUMENT ──────────────────────
 *
 * Dan, 2026-09-12, with the Goals page beside MneMemo: *"solve this issue of
 * colored strips that seems to end (1) before they reach the ring binds, and
 * (2) where the X is so far away from the left. The Goals page serves as the
 * benchmark standard"*.
 *
 * Section 2 above cannot see this, and the reason is the whole point of this
 * one: it measures a band and the coils WITHIN ONE DOCUMENT. A framed station
 * draws its band inside the frame, where `.cahier-binding` is hidden and
 * therefore zero-wide — so every assertion up there passed while the strip
 * started 64px to the right of the rings with a band of paper showing between.
 *
 * Measured at 1280px before the fix, against Goals, whose band the host draws:
 *
 *                  coils      band starts      the ✕
 *     Goals        20..82     44   (behind)    88
 *     MneMemo      20..82     108  (26 clear)  152
 *
 * So: find the coils in the HOST document and the band wherever it really is,
 * put both in the same coordinates, and require the strip to run behind the
 * rings and the ✕ to clear them. One measurement, both of Dan's complaints.
 */
for (const route of CORNER) {
  if (!resolveFile(route)) continue;
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const host = await page.evaluate(() => {
    const b = document.querySelector(".cahier-binding");
    const fr = document.querySelector("iframe");
    return {
      bindRight: b ? Math.round(b.getBoundingClientRect().right) : null,
      frameLeft: fr ? Math.round(fr.getBoundingClientRect().left) : 0,
    };
  });
  if (host.bindRight === null) { process.stdout.write(`  reach      ${route}   (no coils)\n`); continue; }

  // The band, in HOST coordinates wherever it is drawn.
  let band = null;
  for (const f of page.frames()) {
    const dx = f === page.mainFrame() ? 0 : host.frameLeft;
    const got = await f.evaluate((d) => {
      const el = [...document.querySelectorAll(".page-band")]
        .find((e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const lead = el.firstElementChild?.getBoundingClientRect();
      return { left: Math.round(r.left + d), x: lead ? Math.round(lead.left + d) : null };
    }, dx).catch(() => null);
    if (got) { band = got; break; }
  }
  if (!band) { process.stdout.write(`  reach      ${route}   (no shell band)\n`); continue; }

  if (band.left >= host.bindRight) {
    bad.push(`${route}: the coloured strip starts at ${band.left}px and the coils end at ` +
      `${host.bindRight}px — it stops ${band.left - host.bindRight}px SHORT of the binding, with ` +
      "the page's own paper showing between them. Goals runs its strip behind the rings; a framed " +
      "station must too, which means the well gives the frame its left gutter as well as the rest.");
  }
  if (band.x !== null && band.x - host.bindRight > 24) {
    bad.push(`${route}: the band's ✕ is ${band.x - host.bindRight}px clear of the coils — it is ` +
      "measured from the band's own left edge, so a strip that starts late carries the ✕ out with " +
      "it. On Goals the gap is 6px.");
  }
  process.stdout.write(`  reach      ${route}   strip ${band.left} · coils end ${host.bindRight}` +
    `${band.x === null ? "" : ` · ✕ ${band.x}`}\n`);
}

await browser.close();
server.close();

if (bad.length) {
  console.log("\nsheet-scan: one sheet of paper per page, and the coils run up to the band.\n");
  for (const b of bad) console.log("  ✗ " + b);
  process.exit(1);
}
console.log(`\nsheet-scan: ${ONE_SHEET.size} one-sheet stations, ${CORNER.length} corners — all clean.`);
