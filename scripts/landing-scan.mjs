// landing-scan — the landing page (`/`) shows the road, and asks one thing.
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
// Twelve viewports, because the fault is a geometry fault: a desktop, a phone,
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
// THE LANDING PAGE LIFTS ITS OWN HORIZON (8 Sep). The scene is rendered into a
// box WELCOME_SKY_LIFT times the window's height, so the sky takes about the
// top third — Dan: "i actually extended the sky to show more sky", "so it
// lands now roughly 1/3 sky, and 2/3 land". The band this scan protects has to
// travel with it, or it would guard empty sky and leave the real horizon open.
// Read, not typed in twice, for the same reason the two below are.
const SKY_LIFT = num("WELCOME_SKY_LIFT", 1);
const SKYLINE_Y = num("SKYLINE_Y", 0.29) * SKY_LIFT;
const HORIZON_Y = num("HORIZON_Y", 0.34) * SKY_LIFT;
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
  // THE NEAR GROUND. Nature sprites carry a French title ("de l'herbe", "un
  // arbre", …) — that is what marks a piece of scenery apart from a goal, a
  // gate or a prop. Binned by where each one's FOOT lands down the frame.
  const NAT = /herbe|arbre|sapin|buisson/;
  const nature = map ? [...map.querySelectorAll("[title]")].filter((e) => NAT.test(e.getAttribute("title") || "")) : [];
  const mapRect = map ? map.getBoundingClientRect() : null;
  const nearGround = mapRect
    ? nature.filter((e) => (e.getBoundingClientRect().bottom - mapRect.top) >= mapRect.height * 0.67).length
    : 0;
  const actions = [...(main ? main.querySelectorAll("a[href], button") : [])]
    .filter((el) => !(map && map.contains(el)))
    .map((el) => { const r = el.getBoundingClientRect(); return {
      text: (el.textContent || "").trim().slice(0, 40),
      width: Math.round(r.width),
      // Position too, since 12 Sep — see the CTA clearance rule below.
      top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height),
    }; });
  return {
    vw, vh,
    mapBox: map ? { w: Math.round(map.getBoundingClientRect().width), h: Math.round(map.getBoundingClientRect().height) } : null,
    intruders: over.filter((o) => o.bottom > top && o.top < bottom),
    nature: nature.length, nearGround,
    over, actions,
    scrollW: document.documentElement.scrollWidth,
  };
};

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

// TWELVE SHAPES, NOT THREE — 12 Sep. Three was enough to catch the fault Dan
// reported and not enough to catch the next one: a SMALL phone (320x568) had
// the welcome text sitting 19px over the horizon in production, for weeks,
// because no scan had ever opened that size. The list below is deliberately
// awkward — a very short landscape window, a square, an ultrawide — since the
// faults this page has produced were all geometry, and geometry only breaks at
// shapes nobody pictured.
//
// `ground` is off wherever the frame is under ~480px tall: the bottom third is
// then a sliver of near road with barely any ground in it to judge, which is a
// fact about the camera and not a thing to assert.
const VIEWS = [
  ["desktop 1440x900", { width: 1440, height: 900 }, { ground: true }],
  ["monitor 1920x1080", { width: 1920, height: 1080 }, { ground: true }],
  ["ultrawide 2560x1080", { width: 2560, height: 1080 }, { ground: true }],
  ["tablet 1024x768", { width: 1024, height: 768 }, { ground: true }],
  ["tablet upright 768x1024", { width: 768, height: 1024 }, { ground: true }],
  ["square 800x800", { width: 800, height: 800 }, { ground: true }],
  ["phone 390x844", { width: 390, height: 844 }, { ground: true }],
  ["phone tall 360x1180", { width: 360, height: 1180 }, { ground: true }],
  ["phone small 320x568", { width: 320, height: 568 }, { ground: true }],
  ["phone sideways 844x390", { width: 844, height: 390 }, { ground: false }],
  ["phone sideways small 667x375", { width: 667, height: 375 }, { ground: false }],
  ["very short 1024x320", { width: 1024, height: 320 }, { ground: false }],
];
const bad = [];

for (const [label, viewport, checks] of VIEWS) {
  const page = await browser.newPage({ viewport });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
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
  // THE WAY IN IS REACHABLE, AT EVERY SHAPE (Dan, 12 Sep: *"can we ensure that
  // the ENTER button is always visible at the base of the screen no matter what
  // the screen size or shape"*).
  //
  // Measured across twelve shapes before writing this, the coin was never
  // actually CUT — it is bottom-anchored inside a 100dvh frame, so it is on
  // screen everywhere. What it had was 4px of clearance on a phone, and a
  // handset spends that on its own browser bar or home indicator: on screen in
  // a desktop viewport, under someone's thumb rail in real life. So the rule is
  // a GAP, not mere presence, and it is asserted rather than assumed because
  // "it is at bottom: 0.5%" reads fine in a diff at every size.
  const CTA_GAP = 10;
  for (const a of m.actions) {
    if (a.height < 20) continue;               // not the coin
    if (a.top < 0 || a.bottom > m.vh) {
      bad.push(`${label}: "${a.text}" runs off the screen (y ${a.top}–${a.bottom} in a ${m.vh}px frame) — the one way in has to be on the page`);
    } else if (m.vh - a.bottom < CTA_GAP) {
      bad.push(`${label}: "${a.text}" sits ${m.vh - a.bottom}px from the bottom edge — under a phone's own browser bar. It needs at least ${CTA_GAP}px`);
    }
  }
  const wide = m.actions.filter((a) => a.width > m.vw * 0.6);
  if (wide.length) {
    bad.push(`${label}: ${wide.map((a) => `"${a.text}" is ${a.width}px of a ${m.vw}px page`).join("; ")} — no single control wears the page's width`);
  }
  // THE NEAR FOREGROUND IS NOT BARE (8 Sep). Every scenery pass used to start
  // at z ≈ 0.15 — the start of the COURSE — while the camera sits about 1.16
  // stops behind goal 1 and can be dragged further back still. So the nearest
  // stretch of ground, the bottom fifth of the frame where the picture is
  // biggest, had nothing planted in it at all. Measured on this page before:
  // 196 sprites, 116 of them packed in one band at the horizon, SIX in the
  // bottom third and none below 80%. After: 278 and 55. The floor is set well
  // under that — this is here to catch the near ground going empty again, not
  // to pin a density.
  if (checks.ground && m.nearGround < 12) {
    bad.push(`${label}: only ${m.nearGround} of ${m.nature} pieces of scenery stand in the bottom third of the frame — the near ground is bare again. The usual cause is the scenery starting at z ≈ 0 while the camera starts behind it`);
  }
  if (m.actions.length !== 1) {
    bad.push(`${label}: the page offers ${m.actions.length} actions (${m.actions.map((a) => `"${a.text}"`).join(", ") || "none"}) — a door has one`);
  }
  if (m.scrollW > m.vw + 1) bad.push(`${label}: the page scrolls sideways (${m.scrollW}px of content in ${m.vw}px)`);

  const ok = fills && !m.intruders.length && !wide.length && m.actions.length === 1 && m.scrollW <= m.vw + 1 && (!checks.ground || m.nearGround >= 12);
  console.log(`  ${ok ? "ok" : "x "} ${label.padEnd(24)} scene ${m.mapBox.w}x${m.mapBox.h}  horizon clear: ${m.intruders.length === 0}  actions: ${m.actions.length}  cta ${m.actions[0]?.width ?? "-"}px  ${checks.ground ? `near ground ${m.nearGround}/${m.nature}` : ""}`);
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
console.log(`\nlanding-scan: the scene fills all ${VIEWS.length} viewports, the horizon band is clear, the way in keeps its distance from the bottom edge, and it is content-sized.`);
