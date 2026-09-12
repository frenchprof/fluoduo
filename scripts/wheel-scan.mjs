// wheel-scan — which way the 3D map travels, per input, driven for real.
//
// Dan, 2026-09-11: "scrolling up and down the 3d map : by default it should be
// the other way around", and then, before anyone could get it wrong:
//
//   "there are two things: swipe down with finger, and scroll down with mouse.
//    don't confuse them"
//
// He was right to draw that line. The box is a native scroll container, so both
// inputs arrive as the same scrollTop — but they are not the same gesture, and
// measured from one starting point they already did OPPOSITE things:
//
//     wheel down    goals 1-14 -> 2-17     the camera travelled AWAY
//     finger down   goals 1-14 -> 1-12     the road came TOWARD you
//
// Each matched its own convention: a wheel scrolls a page, a finger drags the
// thing under it. Shown both, Dan picked: "the wheel is the wrong one". So the
// wheel is flipped and the finger is left alone.
//
// WHY THIS IS DRIVEN AND NOT GREPPED. The flip is a cancelled wheel event, and
// `preventDefault()` is IGNORED on a passive listener — which is what React
// attaches for `onWheel`. A source check would see the handler, read it as
// correct, and pass a build where the wheel had silently gone back to normal.
// Only the running page knows. The same is true of the half that must NOT
// change: nothing in the source says "the finger still works", because the
// finger works by the browser doing nothing special.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { visit } from "./lib/settle.mjs";

const OUT = "out";
const PORT = 4199;
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

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

const START = 1200;      // mid-road, so there is room to travel either way
const STEP = 500;

const read = (p) => p.evaluate(() => {
  const box = document.querySelector(".home-map3d-box");
  if (!box) return null;
  const ns = [...document.querySelectorAll(".home-map3d-box button[data-cam]")]
    .map((e) => Number((e.textContent || "").trim()))
    .filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  return { top: Math.round(box.scrollTop), lo: ns[0] ?? null, hi: ns[ns.length - 1] ?? null };
});

/* What `settle` waits for: the scrollable scene box `seat` then reaches into. */
const SCENE_READY = `!!document.querySelector(".home-map3d-box")`;

async function seat(ctx) {
  const p = await ctx.newPage();
  // WAIT FOR THE SCENE, NOT FOR THE CLOCK — this replaced a flat 2800ms sleep.
  // The waits further down stay: they follow a wheel gesture and are waiting for
  // momentum to come to rest, which the DOM cannot be asked about.
  await visit(p, `http://localhost:${PORT}/home?view=3d&hour=12`, SCENE_READY);
  const ok = await p.evaluate((y) => {
    const box = document.querySelector(".home-map3d-box");
    if (!box) return false;
    // BRING THE MAP UNDER THE POINTER (12 Sep). This scan drove /map/embed until
    // the map merged into Home, and there the scene WAS the page — the viewport
    // centre was always over it. On Home the map sits below the hero, the
    // welcome strip and the keys, so a gesture aimed at the viewport centre
    // landed on the hero and moved nothing. Every case below aims at the
    // scene's own rect instead; this puts it on screen first.
    box.scrollIntoView({ block: "center" });
    box.scrollTop = y;
    return true;
  }, START);
  await p.waitForTimeout(1000);
  return ok ? p : null;
}

/** The middle of the 3D scene, in page coordinates — where a gesture meant for
 *  the map has to be aimed now that the map is not the whole page. */
async function aim(p) {
  return p.evaluate(() => {
    const r = document.querySelector(".home-map3d-box").getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), top: Math.round(r.y), bottom: Math.round(r.bottom) };
  });
}

const bad = [];
const say = (ok, line) => console.log(`  ${ok ? "ok" : "x "} ${line}`);

// ── the wheel, at the new default ───────────────────────────────────────────
async function wheelCase(pref, label, wantBack) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 620 } });
  if (pref !== null) {
    await ctx.addInitScript((v) => {
      try { localStorage.setItem("fluolingo.ui.v1", JSON.stringify({ wheelDownComesBack: v })); } catch {}
    }, pref);
  }
  const p = await seat(ctx);
  if (!p) { bad.push(`${label}: no 3D scene on the page`); await ctx.close(); return; }
  const before = await read(p);
  const at = await aim(p);
  await p.mouse.move(at.x, at.y);
  await p.mouse.wheel(0, STEP);
  await p.waitForTimeout(1200);
  const after = await read(p);
  await ctx.close();

  const moved = after.top - before.top;
  const cameBack = moved < -50;
  const wentAway = moved > 50;
  const ok = wantBack ? cameBack : wentAway;
  if (!ok) {
    bad.push(`${label}: wheel down moved scrollTop by ${moved} (goals ${before.lo}-${before.hi} -> `
      + `${after.lo}-${after.hi}). Expected the road to come ${wantBack ? "TOWARD" : "AWAY from"} the viewer. `
      + (wantBack
        ? "The usual cause is the listener going passive — preventDefault() is ignored there, and React's own onWheel IS passive, so the flip silently stops happening."
        : "The setting is meant to hand the old behaviour back untouched."));
  }
  say(ok, `${label.padEnd(30)} scrollTop ${before.top} -> ${after.top}   goals ${before.lo}-${before.hi} -> ${after.lo}-${after.hi}`);
}

await wheelCase(null, "wheel down, default", true);
await wheelCase(false, "wheel down, setting off", false);

// ── the finger, which must be exactly as it was ─────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, hasTouch: true, isMobile: true });
  const p = await seat(ctx);
  if (!p) {
    bad.push("finger: no 3D scene on the page");
  } else {
    const before = await read(p);
    const cdp = await ctx.newCDPSession(p);
    const at = await aim(p);
    // The drag runs down the middle of the SCENE, from just inside its top edge
    // to just inside its bottom — not down the middle of the window, which on
    // Home starts above the map.
    const y0 = at.top + 24, y1 = at.bottom - 24;
    const pt = (y) => [{ x: at.x, y, radiusX: 6, radiusY: 6, force: 1 }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt(y0) });
    for (let y = y0 + 20; y <= y1; y += 30) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pt(y) });
      await p.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await p.waitForTimeout(1600);
    const after = await read(p);
    const moved = after.top - before.top;
    const ok = moved < -50;
    if (!ok) {
      bad.push(`finger down: moved scrollTop by ${moved} (goals ${before.lo}-${before.hi} -> ${after.lo}-${after.hi}). `
        + "A finger drags the road: down must bring it TOWARD the viewer. Dan drew this line himself — "
        + "\"there are two things: swipe down with finger, and scroll down with mouse. don't confuse them\" — "
        + "and flipping the scroll container rather than the wheel event is exactly how both end up flipped.");
    }
    say(ok, `${"finger down, must not change".padEnd(30)} scrollTop ${before.top} -> ${after.top}   goals ${before.lo}-${before.hi} -> ${after.lo}-${after.hi}`);
  }
  await ctx.close();
}

await browser.close();
server.close();

if (bad.length) {
  console.log("\nwheel-scan: the map travels the wrong way for an input.\n");
  for (const b of bad) console.log("  x  " + b + "\n");
  process.exit(1);
}
console.log("\nwheel-scan: the wheel comes back, the setting hands it over, and the finger is untouched.");
