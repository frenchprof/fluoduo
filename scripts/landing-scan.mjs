// landing-scan — /welcome shows the road, and asks one thing.
//
// Dan sent the first build of this page back in one sentence:
//
//   "then we reduce the load of the blurred mirror: All we wanted was Start my
//    journey now on the glass… You are COMPLETELY blocking the view of my
//    winding road horizon, which is the WHOLE POINT of this page"
//
// A frosted panel across the middle is the obvious way to put words over a
// picture, it is what the page had, and it covered the one thing the page
// exists to show. Nothing in the source says "panel" — a panel is just a div
// with a width — so this is measured on the painted page instead: every piece
// of overlay furniture is asked WHERE IT IS, and the horizon band has to come
// back empty.
//
// THE BAND IS READ FROM THE PROJECTION, not typed in twice. The scene puts its
// true skyline at SKYLINE_Y and the ground's crest at HORIZON_Y (0.29 and 0.34
// of the box height today); the protected band runs from a little above the
// first to well below the second, so it covers the horizon and the stretch of
// road running down from it. If those constants move, this moves with them.
//
// It also holds two things that are rules rather than judgement calls:
//   · the CTA is content-sized. "No control spans the whole width" is a
//     standing rule, and on THIS page a full-width bar would also be a wall
//     laid across the road.
//   · one action. A landing page answers "what is this" and "how do I start";
//     a second button is a second answer to the second question.
//
// Three viewports, because the fault is a geometry fault: a desktop, a phone,
// and a phone held sideways — where the whole page is 390px tall and anything
// mispositioned lands on the horizon by default.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4197;

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

// The band to keep clear, as fractions of the viewport height. Read off the
// projection so the two cannot drift: a little above the skyline, down to
// comfortably below the crest.
const proj = readFileSync("src/lib/map3d/projection.ts", "utf-8");
const num = (name, fallback) => {
  const m = proj.match(new RegExp(`export const ${name}\\s*=\\s*([0-9.]+)`));
  return m ? Number(m[1]) : fallback;
};
const SKYLINE_Y = num("SKYLINE_Y", 0.29);
const HORIZON_Y = num("HORIZON_Y", 0.34);
// The sky IS the place for the welcome, so the band starts exactly where the
// sky stops. Text that ends above the skyline is the design; text that crosses
// it is standing on the land.
const BAND_TOP = SKYLINE_Y;
const BAND_BOTTOM = HORIZON_Y + 0.18;

const MEASURE = (band) => {
  const vh = window.innerHeight, vw = window.innerWidth;
  const top = vh * band[0], bottom = vh * band[1];
  const main = document.querySelector("main");
  const map = document.querySelector(".home-map3d-box");
  // Overlay furniture = anything in the page that is NOT part of the scene.
  const over = [];
  for (const el of main ? main.querySelectorAll("*") : []) {
    if (map && map.contains(el)) continue;          // the scene itself
    if (el.contains(map)) continue;                 // the scene's own wrappers
    if (el.getAttribute("aria-hidden") === "true" && !el.textContent.trim()) continue; // scrims
    const t = (el.textContent || "").trim();
    const isLeaf = ![...el.children].some((c) => (c.textContent || "").trim() === t && t);
    if (!t && !el.matches("a,button")) continue;
    if (!isLeaf) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    over.push({ tag: el.tagName.toLowerCase(), text: t.slice(0, 40), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) });
  }
  const actions = [...(main ? main.querySelectorAll("a[href], button") : [])]
    .filter((el) => !(map && map.contains(el)))
    .map((el) => { const r = el.getBoundingClientRect(); return { text: (el.textContent || "").trim().slice(0, 40), width: Math.round(r.width) }; });
  return {
    vw, vh,
    mapBox: map ? { w: Math.round(map.getBoundingClientRect().width), h: Math.round(map.getBoundingClientRect().height) } : null,
    intruders: over.filter((o) => o.bottom > top && o.top < bottom),
    over, actions,
    scrollW: document.documentElement.scrollWidth,
  };
};

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

const VIEWS = [
  ["desktop 1440x900", { width: 1440, height: 900 }],
  ["phone 390x844", { width: 390, height: 844 }],
  ["phone sideways 844x390", { width: 844, height: 390 }],
];
const bad = [];

for (const [label, viewport] of VIEWS) {
  const page = await browser.newPage({ viewport });
  await page.goto(`http://localhost:${PORT}/welcome`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2600);
  const m = await page.evaluate(MEASURE, [BAND_TOP, BAND_BOTTOM]);
  await page.close();

  if (!m.mapBox) {
    bad.push(`${label}: no scene on the page at all — /welcome IS the map, and without it this is a headline on a blank screen`);
    console.log(`  x  ${label}: no scene`);
    continue;
  }
  const fills = m.mapBox.w >= m.vw - 1 && m.mapBox.h >= m.vh - 1;
  if (!fills) bad.push(`${label}: the scene is ${m.mapBox.w}x${m.mapBox.h} in a ${m.vw}x${m.vh} viewport — it is a card on the page again, not the page`);

  if (m.intruders.length) {
    bad.push(`${label}: ${m.intruders.length} thing(s) sit across the horizon band `
      + `(y ${Math.round(m.vh * BAND_TOP)}–${Math.round(m.vh * BAND_BOTTOM)}): `
      + m.intruders.map((i) => `<${i.tag}> "${i.text}" at ${i.top}–${i.bottom}`).join("; "));
  }
  const wide = m.actions.filter((a) => a.width > m.vw * 0.6);
  if (wide.length) {
    bad.push(`${label}: ${wide.map((a) => `"${a.text}" is ${a.width}px of a ${m.vw}px page`).join("; ")} — no single control wears the page's width`);
  }
  if (m.actions.length !== 1) {
    bad.push(`${label}: the page offers ${m.actions.length} actions (${m.actions.map((a) => `"${a.text}"`).join(", ") || "none"}) — a door has one`);
  }
  if (m.scrollW > m.vw + 1) bad.push(`${label}: the page scrolls sideways (${m.scrollW}px of content in ${m.vw}px)`);

  const ok = fills && !m.intruders.length && !wide.length && m.actions.length === 1 && m.scrollW <= m.vw + 1;
  console.log(`  ${ok ? "ok" : "x "} ${label.padEnd(24)} scene ${m.mapBox.w}x${m.mapBox.h}  horizon band clear: ${m.intruders.length === 0}  actions: ${m.actions.length}  cta ${m.actions[0]?.width ?? "-"}px`);
}

await browser.close();
server.close();

if (bad.length) {
  console.log("\nlanding-scan: /welcome is not showing the road.\n");
  for (const b of bad) console.log("  x  " + b + "\n");
  console.log("  Dan, on the first build: \"You are COMPLETELY blocking the view of my");
  console.log("  winding road horizon, which is the WHOLE POINT of this page.\" The sky");
  console.log("  carries the welcome, the near ground carries the button, and the band");
  console.log("  between them carries nothing.");
  process.exit(1);
}
console.log(`\nlanding-scan: the scene fills all three viewports, the horizon band is clear, and there is one content-sized way in.`);
