// night-plate-scan — the map's text plates must stay readable at every hour.
//
// Dan, 2026-09-08: *"a fun idea: could it land day when it's daytime and night
// when it is night time, with the fonts adapting accordingly?"*
//
// The sky already followed the clock. What did not was the two TEXT PLATES the
// scene paints — the goal's name under a standing coin (« Introductions ») and
// the tag under a scenery prop. Both were a white pill with dark ink at every
// hour, so at 23:00 they were the two brightest objects on a night map.
//
// THE FIRST FIX WAS WORSE THAN THE FAULT, and that is why this check exists.
// Crossfading BOTH the ink and the plate across `nightness` looks obviously
// right and is obviously wrong: the two colours cross each other on the way.
// Measured at 06:00 on the crossfade build, the label « Introductions » was
// ink L 0.635 sitting on plate L 0.612 — a contrast of about 1.3:1, i.e.
// invisible, on a map that looked perfect at noon and perfect at midnight. A
// check that sampled only day and night would have passed it.
//
// So this sweeps ALL TWENTY-FOUR HOURS (`?hour=` pins the clock) and measures
// what is actually painted, not what the source says it intends.
//
// TWO MEASUREMENT TRAPS, both of which produced confident wrong numbers here:
//
//   1  The computed values are `lab()` / `oklch()`, not rgb. Pulling the three
//      numbers out with a regex and treating them as R,G,B gave a constant
//      2.9:1 for every hour, and later a false 1.3:1 at night. Every colour is
//      resolved by painting it to a 1x1 canvas and reading the pixel back —
//      the browser's own conversion, with nothing to get wrong.
//
//   2  The plate is TRANSLUCENT (0.86 by day, 0.80 at night), so its painted
//      colour depends on the scene behind it — grass, tarmac, shadow, night
//      sky. Compositing over white alone flatters the day case. This composites
//      over a sweep of backdrops from black to white and keeps the WORST
//      contrast, which bounds every backdrop the map can put behind a label.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { visit, settle } from "./lib/settle.mjs";

const OUT = "out";
const PORT = 4189;
/** WCAG AAA for body text. The plates clear this by a wide margin; the point
 *  of the floor is to catch a REGRESSION, not to sit just above it. */
const MIN_CONTRAST = 7;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};
function resolveFile(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  for (const c of [join(OUT, clean), join(OUT, clean + ".html"), join(OUT, clean, "index.html")]) {
    try { if (statSync(c).isFile()) return c; } catch {}
  }
  return null;
}
const server = createServer((req, res) => {
  const f = resolveFile(req.url);
  if (!f) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(PORT, r));

// Runs in the page: find every element that reads the shared plate variables,
// and hand back its ink and plate as straight rgba, resolved by the browser.
const READ = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  /** any CSS colour -> [r,g,b,a] with a in 0..1, via the browser itself. */
  const rgba = (css) => {
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = "#000";
    cx.fillStyle = css;               // an unparseable value leaves #000 behind
    cx.globalCompositeOperation = "copy";
    cx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const out = [];
  for (const el of document.querySelectorAll('[style*="var(--m3d-plate"]')) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;      // culled or not yet laid out
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    out.push({
      text: (el.textContent || "").trim().slice(0, 24),
      ink: rgba(cs.color),
      plate: rgba(cs.backgroundColor),
    });
  }
  return out;
};

/* The browser-side condition `settle` waits on: at least one plate laid out and
   visible, in this document or any frame. Deliberately the same test READ makes
   — a scan should wait for the thing it is about to measure, not for a proxy. */
const PLATE_READY = `
  (() => {
    const lit = (d) => {
      for (const el of d.querySelectorAll('[style*="var(--m3d-plate"]')) {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        return true;
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

const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = ([r, g, b, a], back) => [
  r * a + back * (1 - a), g * a + back * (1 - a), b * a + back * (1 - a),
];
/** The worst contrast this ink/plate pair can reach over any backdrop. */
function worstContrast(ink, plate) {
  let worst = Infinity;
  for (let i = 0; i <= 20; i++) {
    const back = (255 * i) / 20;
    worst = Math.min(worst, ratio(over(ink, back), over(plate, back)));
  }
  return worst;
}

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 620 } });
const page = await ctx.newPage();

async function dismissHints() {
  for (let i = 0; i < 3; i++) {
    for (const f of page.frames()) for (const l of ["Got it", "No thanks"]) {
      const e = f.getByRole("button", { name: l });
      if (await e.count().catch(() => 0)) await e.first().evaluate((x) => x.click()).catch(() => {});
    }
    await page.waitForTimeout(200);
  }
}
async function readAll() {
  for (const f of page.frames()) {
    const r = await f.evaluate(READ).catch(() => null);
    if (r && r.length) return r;
  }
  return [];
}

const bad = [];
let seenDark = false, seenLight = false, minSeen = Infinity;

for (let hour = 0; hour < 24; hour++) {
  // /home SINCE 12 SEP — Dan merged the map into Home and /map now forwards
  // there, taking its embed twin with it. The scene reads `?hour=`
  // off its OWN search, which the outer page's query string never reaches; and
  // the 2D plan is the saved default, so `view=3d` is what puts the scene — and
  // its labels — on the screen at all.
  // WAIT FOR A PLATE, NOT FOR THE CLOCK. This replaced a flat 2400+400ms sleep on
  // each of the 24 hours — 67 of this scan's 70 seconds. The condition is the same
  // one READ applies below: a label plate that is laid out and big enough to be
  // real. The scene builds itself in the frame, so a plate on screen IS the scene
  // having rendered; nothing else here needs waiting for.
  await visit(page, `http://localhost:${PORT}/home?view=3d&hour=${hour}`, PLATE_READY);
  if (hour === 0) { await dismissHints(); await settle(page, PLATE_READY); }
  const plates = await readAll();
  if (!plates.length) {
    bad.push(`hour ${hour}: no element reads --m3d-plate — the shared plate is gone, so each label is on its own again`);
    console.log(`  x  ${String(hour).padStart(2, "0")}:00  no plate found`);
    continue;
  }
  let worst = Infinity, worstOne = plates[0];
  for (const p of plates) {
    const c = worstContrast(p.ink, p.plate);
    if (c < worst) { worst = c; worstOne = p; }
  }
  minSeen = Math.min(minSeen, worst);
  const pl = lum(over(worstOne.plate, 255));
  if (pl < 0.35) seenDark = true; else seenLight = true;
  const ok = worst >= MIN_CONTRAST;
  console.log(`  ${ok ? "ok" : "x "} ${String(hour).padStart(2, "0")}:00  ${plates.length} plate(s)  worst ${worst.toFixed(1)}:1  ${pl < 0.35 ? "dark" : "light"} plate`);
  if (!ok) {
    bad.push(`hour ${hour}: « ${worstOne.text} » is ${worst.toFixed(1)}:1 against its own plate `
      + `(ink rgba(${worstOne.ink.map((n) => Math.round(n * 100) / 100).join(",")}), `
      + `plate rgba(${worstOne.plate.map((n) => Math.round(n * 100) / 100).join(",")}))`);
  }
}

// The plate must actually TURN OVER. Twenty-four passing hours with one plate
// colour is the pre-fix app: readable, and not what Dan asked for.
if (!seenDark) bad.push("no hour of the day gives the labels a dark plate — the map's text no longer follows the clock");
if (!seenLight) bad.push("no hour of the day gives the labels a light plate — the map's text no longer follows the clock");

await browser.close();
server.close();

if (bad.length) {
  console.log("\nnight-plate-scan: the map's text does not survive the clock.\n");
  for (const b of bad) console.log("  x  " + b + "\n");
  console.log("  Both plates read --m3d-plate / --m3d-plate-ink, set once on the scene box");
  console.log("  from nightness(hour). They must SWITCH at a threshold, not crossfade:");
  console.log("  fading ink and plate past each other put them at 1.3:1 at 06:00.");
  process.exit(1);
}
console.log(`\nnight-plate-scan: readable at all 24 hours, worst ${minSeen.toFixed(1)}:1, and the plate turns over between day and night.`);
