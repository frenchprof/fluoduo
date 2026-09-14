// key-outline-scan — every raised key wears an outlined top surface.
//
// Dan, 2026-09-14, over a screenshot of the revision path: *"the buttons are
// missing the outlined top surface"*.
//
// WHY THE SOURCE SAID THE APP WAS FINE. `.neo-key`'s 3D is four shadows, and
// one of them — `inset 1px 3px 0 white 62%` — IS a lit top face. Reading the
// rule, the top surface is there. On a DARK key it reads; on a pale one it
// cannot, because a 62%-white highlight on near-white is nothing. The path's
// « ▶ Open » sits on --fam-review-wash, rgb(205,244,231), so the same class
// looked like a 3D key on the gold START and a flat pill six rows below it.
// That reads as a bug in the flat ones rather than as a rule nobody wrote.
//
// MEASURED, the way the hover floor was: eleven routes in the built app,
// **42 of 50 raised keys had no outline of any kind**. The eight that did were
// the ☰ menu's tiles, which add `border-2` themselves in familyTile.ts and
// colour it with the family's darkest rung — Dan's ruling of 11 Sep.
//
// WHAT IS PINNED
//
//   1  ZERO un-outlined keys. Not a ratchet: the app is at zero, and a ratchet
//      waves the next one through (verify540's reasoning, unchanged).
//   2  A FLOOR ON THE CENSUS — fewer than 30 keys found is a FAIL, not a pass.
//      A wall build or a route that stopped rendering would otherwise report
//      "all clear" over an empty page. verify79, verify126 and verify540 each
//      record that mistake; this is the fourth.
//
// WHAT IS DELIBERATELY NOT A KEY. `.fluo-stop` — the map's fifty stop coins —
// keeps `border: 0` by Dan's own ruling of 8 Sep, *"a coin, not a neumorphic
// pill"*, and so does the 3D map's stop NODE. The line needs no new class: a
// coin is `.fluo-stop` / `home-map3d-node` and never carries `.neo-key`, so
// this scan reads `.neo-key` and `.fluo-tile-key` and touches neither.
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4561;
const FLOOR = 30;

/* The eleven routes are chosen to reach every SHAPE of key the app has — a
   text key, an emoji key, a tile, a stepper, a switch knob, a repeated row
   key — not to be a sweep of every page. A route that renders no key at all
   is fine; the floor below is what catches a build that renders none. */
const ROUTES = [
  "/path/embed",                       // the repeated row key, on a pale wash
  "/reviser/embed",
  "/map",                              // the ± steppers and the 2D/3D knob
  "/profil",
  "/conjugaison/embed",
  "/practice/flip-it/nationalities",
  "/games/numbus",                     // emoji keys
  "/games/numbers",
  "/tts/embed",
  "/lessons/quel-prefere",             // the ☰ tiles, the original outline
  "/",
];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".woff2": "font/woff2", ".mp3": "audio/mpeg",
  ".webp": "image/webp",
};
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]);
  let f = join(OUT, u);
  if (existsSync(f) && statSync(f).isDirectory()) {
    f = existsSync(join(f, "index.html")) ? join(f, "index.html")
      : existsSync(`${f}.html`) ? `${f}.html` : f;
  } else if (!existsSync(f) && existsSync(`${f}.html`)) f = `${f}.html`;
  if (!existsSync(f) || statSync(f).isDirectory()) { r.statusCode = 404; return r.end("nf"); }
  r.setHeader("content-type", MIME[extname(f)] || "application/octet-stream");
  createReadStream(f).pipe(r);
});
await new Promise((r) => server.listen(PORT, r));

const exe = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null;
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Hints and tours are suppressed the same way every other scan here does it:
   a modal over the page hides the keys behind it and they read as absent. */
const QUIET = () => {
  try {
    const real = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      return typeof k === "string" && k.startsWith("fluolingo:hint.") ? "1" : real.call(this, k);
    };
    localStorage.setItem("fluolingo:tours.never", "1");
  } catch { /* private mode — the page must still render */ }
};

let total = 0;
const bare = [];
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  await page.addInitScript(QUIET);
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle" }).catch(() => {});
  await sleep(1800);
  /* EVERY STATION RUNS IN AN IFRAME (7 Sep), so the main frame of /map holds
     the cahier and the keys live one frame down. Reading only the main frame
     would report most routes as having no keys at all. */
  for (const frame of [page.mainFrame(), ...page.frames().filter((f) => f !== page.mainFrame())]) {
    const found = await frame.evaluate(() => {
      const keys = [...document.querySelectorAll(".neo-key, .fluo-tile-key")]
        .filter((e) => e.getBoundingClientRect().width > 8);
      const out = [];
      for (const e of keys) {
        const c = getComputedStyle(e);
        const w = parseFloat(c.borderTopWidth) || 0;
        const solid = c.borderTopStyle !== "none" && c.borderTopStyle !== "hidden";
        if (!(w >= 1 && solid)) {
          out.push((e.textContent || "").trim().slice(0, 20) || e.className.split(" ").slice(-1)[0]);
        }
      }
      return { n: keys.length, bare: out };
    }).catch(() => ({ n: 0, bare: [] }));
    total += found.n;
    for (const b of found.bare) bare.push(`${route}  « ${b} »`);
  }
  await page.close();
}
await browser.close();
server.close();

console.log(`\nthe outlined top surface (14 Sep)\n${"-".repeat(70)}`);
console.log(`  ${total} raised keys read across ${ROUTES.length} routes`);

let bad = false;
if (total < FLOOR) {
  bad = true;
  console.log(`  FAIL  only ${total} keys found, expected at least ${FLOOR}. The scan is `
    + "looking at an empty or broken build — that is a failure, never an all-clear.");
}
if (bare.length) {
  bad = true;
  console.log(`  FAIL  ${bare.length} raised keys have NO outlined top surface:`);
  for (const b of bare.slice(0, 25)) console.log(`          ${b}`);
  if (bare.length > 25) console.log(`          … and ${bare.length - 25} more`);
  console.log("        A `.neo-key` takes its edge from `--key-edge`, defaulting to the");
  console.log("        house ink. If a key must carry a different edge, set --key-edge");
  console.log("        inline beside --key-bg — do not put `border: 0` back.");
}
console.log("-".repeat(70));
if (bad) process.exit(1);
console.log(`  all ${total} raised keys are outlined`);
