// map-fit-scan — the map fits its notebook, and fills it.
//
// Four faults found by driving /map on 8 Sep, all of them invisible in the
// source and three of them invisible on a phone.
//
//   1  THE MAP IGNORED THE DESKTOP. On a 1440 screen it was a 421px block with
//      452px of blank paper on either side, and zooming could not fix it —
//      zoom grew the discs, not the layout. The cause was `mx-auto` on the
//      frame's wrapper: the frame's <body> is `flex flex-col`, and auto side
//      margins on a flex item OVERRIDE the default cross-axis stretch, so the
//      box shrink-wrapped to five 44px discs and `max-w-3xl` never applied.
//      That is a fault no grep finds — the markup asks for 768px and reads
//      perfectly — so this measures how much of the frame the stops actually
//      span.
//
//   2  THE ZOOM WELL CUT ITS OWN LEADING DIGIT. "100" needed 58px of content
//      in a 52px field, so a desktop read « 00 » at 100% and « ?00 » at 200%.
//      A phone was fine, which is exactly why it survived: the mono face is
//      set from a smaller step there.
//
//   3  THE KIND LEGEND WAS DRAWN TWICE IN 3D. MapBody draws one under the map
//      for both views and HomeMap3D drew its own inside the scene, so the 3D
//      view printed the four kinds twice, one row under the other. You only
//      meet the pair by flipping the switch, which is why nobody had.
//
//   4  THE FRAME SCROLLED SIDEWAYS ON A SMALL PHONE. At 320px the notebook
//      leaves the frame 247px, and two things did not fit: the control row
//      (switch + bookmark + zoom, 308px on one line) and the intro sentence,
//      whose `clamp(13px, 4.3vw, 19px)` was tuned before this page ran in an
//      iframe — inside one, `vw` is the FRAME's width, and the 13px floor put
//      252px of nowrap text in 201px.
//
// EVERY ONE OF THESE IS A MEASUREMENT, so this drives the real page at four
// widths and both views rather than reading the markup.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4225;
/** The stops must span at least this share of the frame they sit in. The map
 *  was at 0.33 when Dan called it out and is at 0.66 after; 0.5 is the line
 *  between "uses the page" and "a block adrift on it". */
const MIN_FILL = 0.5;

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

const MEASURE = () => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const stops = [...document.querySelectorAll("[data-stop]")].map((e) => e.getBoundingClientRect());
  const well = document.querySelector('input[aria-label^="Zoom percent"]');
  // The legend is four kind names in a row; find the innermost element that
  // holds all four, so nesting is not counted as duplication — and count only
  // the ones a learner can SEE. The print sheet carries a legend of its own
  // and sits in the DOM at zero size on every map page; counting it would make
  // this check permanently red for a copy nobody ever looks at.
  const legends = [...document.querySelectorAll("*")].filter((e) => {
    const t = (e.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!/vocabulary/.test(t) || !/grammar/.test(t) || !/expressions/.test(t) || !/communication/.test(t)) return false;
    if (e.getBoundingClientRect().width < 1) return false;
    return ![...e.children].some((c) => {
      const s = (c.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return /vocabulary/.test(s) && /communication/.test(s);
    });
  }).length;
  // Does it REALLY scroll sideways? scrollWidth alone counts scrollbars and
  // other artefacts; setting scrollLeft and reading it back does not.
  de.scrollLeft = 9999;
  const scrolledBy = de.scrollLeft;
  de.scrollLeft = 0;
  return {
    vw,
    // Which view is actually on screen. A check that quietly measures 2D when
    // it meant to measure 3D is worse than no check: the duplicate-legend
    // fault only exists in the scene, so a failed switch would report a clean
    // pass forever.
    scene: !!document.querySelector(".home-map3d-box"),
    fill: stops.length
      ? +((Math.max(...stops.map((r) => r.right)) - Math.min(...stops.map((r) => r.left))) / vw).toFixed(2)
      : null,
    stopCount: stops.length,
    wellClipped: well ? well.scrollWidth > well.clientWidth + 1 : null,
    wellValue: well ? well.value : null,
    legends,
    scrolledBy,
  };
};

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

const bad = [];
async function run(label, width, height, view, checks) {
  const page = await browser.newPage({ viewport: { width, height } });
  // THE VIEW IS SEEDED, NOT CLICKED. `?view=3d` on /map never reaches the map:
  // the outer page frames /map/embed with no query, and the frame reads its
  // OWN search. Clicking the switch inside the frame was tried and did not
  // flip it, which the scene guard below caught — so this writes the same
  // localStorage key `loadMapView()` reads, before any script runs.
  await page.addInitScript((v) => {
    try { window.localStorage.setItem("fluo.homeMapView", v); } catch {}
  }, view);
  // Through /map, not straight to the embed: the notebook around the frame is
  // what narrows it, and every one of these faults is about that width.
  await page.goto(`http://localhost:${PORT}/map`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2600);
  for (const l of ["Got it", "No thanks"]) {
    for (const f of page.frames()) {
      const e = f.getByRole("button", { name: l });
      if (await e.count().catch(() => 0)) await e.first().evaluate((x) => x.click()).catch(() => {});
    }
  }
  await page.waitForTimeout(300);
  const frame = page.frames().find((f) => f.url().includes("/map/embed"));
  if (!frame) { bad.push(`${label}: /map has no map frame`); await page.close(); return; }
  const m = await frame.evaluate(MEASURE);
  await page.close();

  const notes = [];
  if (view === "3d" && !m.scene) {
    bad.push(`${label}: the 2D/3D switch did not put the scene on screen, so this row measured the plan instead — the check went blind rather than red`);
  }
  if (checks.fill) {
    if (m.fill === null) bad.push(`${label}: no stops on the map at all`);
    else if (m.fill < MIN_FILL) bad.push(`${label}: the stops span ${Math.round(m.fill * 100)}% of the ${m.vw}px frame — the map is a block adrift on the page again, not a map that uses it. The classic cause is auto side margins on a flex item, which override the stretch and shrink-wrap the box`);
    notes.push(`fill ${Math.round((m.fill ?? 0) * 100)}%`);
  }
  if (m.wellClipped === null) bad.push(`${label}: the zoom well is gone from the map's control row`);
  else if (m.wellClipped) bad.push(`${label}: the zoom well clips its own value — « ${m.wellValue} » does not fit the field, so a learner reads a truncated number`);
  notes.push(`well "${m.wellValue}"${m.wellClipped ? " CLIPPED" : ""}`);
  if (m.legends !== 1) bad.push(`${label}: ${m.legends} kind legend(s) on the page — the host draws one for both views, so a second is the 3D scene drawing its own again`);
  notes.push(`${m.legends} legend`);
  if (m.scrolledBy > 1) bad.push(`${label}: the map frame scrolls ${m.scrolledBy}px sideways in a ${m.vw}px well`);
  notes.push(`sideways ${m.scrolledBy}px`);

  const ok = !bad.length || !bad[bad.length - 1].startsWith(label);
  console.log(`  ${ok ? "ok" : "x "} ${label.padEnd(22)} ${notes.join("  ")}`);
}

await run("desktop 1440 · 2D", 1440, 900, "2d", { fill: true });
await run("desktop 1440 · 3D", 1440, 900, "3d", { fill: false });
await run("phone 390 · 2D", 390, 844, "2d", { fill: true });
await run("phone 320 · 2D", 320, 700, "2d", { fill: true });

await browser.close();
server.close();

if (bad.length) {
  console.log("\nmap-fit-scan: the map does not fit its notebook.\n");
  for (const b of bad) console.log("  x  " + b + "\n");
  process.exit(1);
}
console.log("\nmap-fit-scan: the map fills its well at every width, shows its zoom whole, draws one legend, and never scrolls sideways.");
