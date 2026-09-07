// road-scan — the map's road must land ON its stops, at every zoom.
//
// Dan has reported this fault twice. 2026-09-07, first: *"WHEN DRAGGING THE MAP
// THE LINE JOINING UP THE STOPS GET DETACHED FROM THE STOPS"*, then *"NOT A
// SCROLLER BUT PINCH GESTURE"*. It was fixed by listening to `visualViewport`.
// Later the same day, shown Home's postcard: *"The pinching issue is not solved
// right?"* — it was not, because that was the wrong pinch.
//
// THE FAULT, AND WHY IT KEEPS COMING BACK. The road is MEASURED: fifty node
// centres read from the laid-out DOM with `getBoundingClientRect`, then written
// into an SVG `<polyline points>`. Those two are not the same coordinate space
// the moment a CSS `zoom` sits anywhere above the box — the rect is POST-zoom
// CSS pixels, the polyline's points are PRE-zoom user units — so the road
// paints at `zoom x` the stop positions, compressed toward the top-left. On
// Home's postcard (`zoom: 0.44`) stop 5's centre and polyline point 4 were both
// the number 247, and that point painted at 109.
//
// THREE SURFACES CARRY A ZOOM, which is why "fixed on /map" meant nothing:
//   Home's postcard   zoom: 0.44, a fixed picture of the course
//   /map's - / + control   zoom: zoomPct / 100
//   /map's own pinch       drives that same zoomPct
// The browser's OWN pinch scales everything together and was never the case
// that broke; a session reading the old comment would fix the wrong thing again.
//
// So this measures the only thing that matters: where the polyline's points
// ACTUALLY PAINT (`getScreenCTM`) against where the stops actually paint, in
// one space, at four zooms. A wrong answer cannot look right in that space,
// which is the flaw in every check that compared the stored numbers instead.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4187;
/** A stop and its road point may differ by this much — rounding only. */
const TOLERANCE_PX = 2;

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

const CHECK = () => {
  const poly = document.querySelector("svg polyline");
  const svg = poly?.ownerSVGElement;
  const box = poly?.closest("div");
  if (!poly || !svg || !box) return { err: "no road on this page" };
  const m = svg.getScreenCTM();
  if (!m) return { err: "the road's SVG has no screen transform" };
  const pts = (poly.getAttribute("points") || "").trim().split(/\s+/).map((s) => s.split(",").map(Number));
  if (pts.length < 10) return { err: `the road has only ${pts.length} points` };
  const rows = [];
  let worst = 0;
  // Sample across the width and down the rows — a scale fault grows with
  // distance from the origin, so stop 1 alone would pass a broken road.
  for (const [id, idx] of [["SIO-001", 0], ["SIO-005", 4], ["SIO-010", 9], ["SIO-020", 19]]) {
    const el = box.querySelector(`[data-stop="${id}"]`);
    if (!el || !pts[idx]) continue;
    const r = el.getBoundingClientRect();
    const q = svg.createSVGPoint();
    [q.x, q.y] = pts[idx];
    const t = q.matrixTransform(m);
    const dx = Math.round(t.x - (r.left + r.width / 2));
    const dy = Math.round(t.y - (r.top + r.height / 2));
    worst = Math.max(worst, Math.abs(dx), Math.abs(dy));
    rows.push(`${id} off by (${dx},${dy})`);
  }
  if (!rows.length) return { err: "no stop matched a road point" };
  return { zoom: +(box.currentCSSZoom ?? 1).toFixed(2), worst, rows };
};

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

async function read() {
  for (const f of page.frames()) {
    const r = await f.evaluate(CHECK).catch(() => null);
    if (r && !r.err) return r;
  }
  return { err: "no road found in any frame" };
}
async function dismissHints() {
  for (let i = 0; i < 3; i++) {
    for (const f of page.frames()) for (const l of ["Got it", "No thanks"]) {
      const e = f.getByRole("button", { name: l });
      if (await e.count().catch(() => 0)) await e.first().evaluate((x) => x.click()).catch(() => {});
    }
    await page.waitForTimeout(250);
  }
}

const bad = [];
function judge(label, r) {
  if (r.err) { bad.push(`${label}: ${r.err}`); console.log(`  ✗ ${label} — ${r.err}`); return; }
  const ok = r.worst <= TOLERANCE_PX;
  console.log(`  ${ok ? "ok" : "✗ "} ${label.padEnd(26)} zoom ${String(r.zoom).padEnd(5)} worst ${r.worst}px`);
  if (!ok) bad.push(`${label} (zoom ${r.zoom}): the road is ${r.worst}px off its stops — ${r.rows.join("; ")}`);
}

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2600); await dismissHints(); await page.waitForTimeout(500);
judge("Home's postcard", await read());

await page.goto(`http://localhost:${PORT}/map`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2600); await dismissHints(); await page.waitForTimeout(500);
judge("/map at 100%", await read());

const frame = page.frames().find((f) => f.url().includes("/embed")) ?? page.mainFrame();
const plus = frame.getByRole("button", { name: /^\+$|zoom in/i });
if (await plus.count().catch(() => 0)) {
  for (let i = 0; i < 4; i++) { await plus.first().evaluate((e) => e.click()).catch(() => {}); await page.waitForTimeout(220); }
  await page.waitForTimeout(700);
  judge("/map after the + control", await read());
} else {
  bad.push("/map has no zoom + control — the control this fault rides on is gone");
  console.log("  ✗ /map has no zoom + control");
}

// A real two-finger pinch, which drives the same zoomPct as the + control.
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 150, y: 400 }, { x: 240, y: 400 }] });
for (let i = 1; i <= 8; i++) {
  const d = 45 + i * 8;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195 - d, y: 400 }, { x: 195 + d, y: 400 }] });
  await page.waitForTimeout(30);
}
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await page.waitForTimeout(900);
judge("/map after a pinch", await read());

await browser.close();
server.close();

if (bad.length) {
  console.log("\nroad-scan: the map's road has come away from its stops.\n");
  for (const b of bad) console.log("  ✗ " + b + "\n");
  console.log("  The road is MEASURED with getBoundingClientRect (POST-zoom CSS pixels)");
  console.log("  and drawn as SVG points (PRE-zoom user units). Under a CSS zoom those");
  console.log("  are different spaces, so Map2DGrid divides by the box's currentCSSZoom.");
  console.log("  Losing that division is the whole fault, and it is invisible at 100%.");
  process.exit(1);
}
console.log("\nroad-scan: the road lands on its stops at every zoom (postcard, 100%, + control, pinch).");
