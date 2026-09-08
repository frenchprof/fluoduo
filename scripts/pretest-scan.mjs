// pretest-scan — NO PRE-TEST STACKS ITS QUESTIONS DOWN ONE PAGE.
//
// Dan flagged this on 2026-09-08, as the last of three: a moved pre-test gives
// each question the whole screen ("1 / 6"), but Unit 0 stacked every question
// of a bank down one scroll — and it is a beginner's FIRST contact with the
// app. Measured on the built export before the fix, at 390x844:
//
//     /pretests/unit0/SIO-001      document 2602px      three screens
//     /pretests/picture/aliments   document 1023px      and 32 of the 50
//                                                        picture pages said
//                                                        "No picture pretest
//                                                        available"
//     /practice/speculearn/goal/SIO-001   one question per screen, 10 rows
//
// Both old routes now forward to the merged run, which serves the same
// questions one at a time. This scan holds that: it follows each old address
// to wherever it lands and asks the page that ANSWERS whether it is a feed.
//
// WHY DRIVEN AND NOT A GREP. The forward is a client-side `location.replace`,
// so the fact this check is about — where a learner actually ends up, and what
// shape that page is — does not exist in any file. A static check could pin
// the word `Forward` in two pages and pass while the run it forwards to had
// gone back to one long page, which is the fault itself.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4189;
/** A feed's page is the screen. Allow a modest tail — a band, a footer — but
 *  nothing like a second screenful of questions underneath. */
const MAX_OVERFLOW_RATIO = 1.35;

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
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();

async function dismissHints() {
  for (let i = 0; i < 3; i++) {
    for (const f of page.frames()) for (const l of ["Got it", "No thanks"]) {
      const e = f.getByRole("button", { name: l });
      if (await e.count().catch(() => 0)) await e.first().evaluate((x) => x.click()).catch(() => {});
    }
    await page.waitForTimeout(220);
  }
}

// The old addresses a QR sheet or a bookmark still names, and one goal page
// per unit as the control — if the merged run itself ever stops being a feed,
// this must go red too, not just the forwards.
const ROUTES = [
  "/pretests/unit0/SIO-001",
  "/pretests/unit0/SIO-010",
  "/pretests/picture/aliments",
  "/pretests/picture/aimer-activites",
  "/practice/speculearn/goal/SIO-001",
  "/practice/speculearn/goal/SIO-020",
];

const bad = [];
for (const route of ROUTES) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2600);
  await dismissHints();
  await page.waitForTimeout(500);
  const landed = new URL(page.url()).pathname;

  // The question feed runs in the cahier's iframe, so ask every frame and take
  // the one that carries the rows.
  let feed = null;
  for (const f of page.frames()) {
    const r = await f.evaluate(() => {
      const snap = [...document.querySelectorAll("*")]
        .some((e) => /mandatory|proximity/.test(getComputedStyle(e).scrollSnapType));
      return {
        rows: document.querySelectorAll("[data-row]").length,
        snap,
        docH: document.documentElement.scrollHeight,
        vh: window.innerHeight,
        empty: /No picture pretest available/.test(document.body.textContent || ""),
      };
    }).catch(() => null);
    if (r && (!feed || r.rows > feed.rows)) feed = r;
  }
  if (!feed) { bad.push(`${route}: nothing answered`); continue; }

  const ratio = +(feed.docH / feed.vh).toFixed(2);
  const ok = feed.rows > 0 && feed.snap && !feed.empty && ratio <= MAX_OVERFLOW_RATIO;
  console.log(
    `  ${ok ? "ok" : "✗ "} ${route.padEnd(36)} -> ${landed.padEnd(38)} `
    + `${String(feed.rows).padStart(3)} rows  snap ${feed.snap ? "y" : "n"}  page ${ratio}x screen`,
  );
  if (feed.empty) bad.push(`${route} still renders "No picture pretest available".`);
  else if (feed.rows === 0 || !feed.snap) {
    bad.push(
      `${route} landed on ${landed}, which is not a question feed `
      + `(${feed.rows} rows, snap ${feed.snap ? "on" : "off"}).`,
    );
  } else if (ratio > MAX_OVERFLOW_RATIO) {
    bad.push(`${route} landed on a page ${ratio}x the screen — questions are stacked again.`);
  }
}

// SIO-010 IS THE ONE THAT COULD BECOME UNANSWERABLE, so it is asked directly.
// Its bank is three audiences of seven — a student, a client, a group — and on
// 2026-08-31 the worry, written down at the time, was that "one shuffled pool
// of all 21 would be unanswerable": « how do you ask their name » has no answer
// until you know who you are facing. The stacked page settled that with three
// tabs; the merged run settles it in the questions themselves, because each
// title names its own audience ("You ask the client their name. You say:").
//
// The failure that would bring back is two prompts reading the same with
// different right answers, so that is what this measures — the prompts as
// RENDERED, not as authored.
await page.goto(`http://localhost:${PORT}/practice/speculearn/goal/SIO-010`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2600);
await dismissHints();
await page.waitForTimeout(500);
let prompts = [];
for (const f of page.frames()) {
  const r = await f.evaluate(() => [...document.querySelectorAll("[data-row]")]
    .map((e) => (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70))
    .filter(Boolean)).catch(() => []);
  if (r.length > prompts.length) prompts = r;
}
const seen = new Map();
const clashes = [];
for (const t of prompts) {
  if (seen.has(t)) clashes.push(t);
  seen.set(t, true);
}
console.log(`  ${clashes.length ? "✗ " : "ok"} SIO-010's three audiences      `
  + `${prompts.length} questions, ${seen.size} distinct prompts`);
if (clashes.length) {
  bad.push(
    `SIO-010 asks the same question twice with different audiences — ${clashes[0]}. `
    + "Each of its questions must name its own audience, or the flattened run is "
    + "unanswerable (this is what the three tabs used to solve).",
  );
}

await browser.close();
server.close();

if (bad.length) {
  console.log("\npretest-scan: a pre-test is stacking its questions again.\n");
  for (const b of bad) console.log("  ✗ " + b + "\n");
  console.log("  Every pre-test question gets the whole screen, with the magnet");
  console.log("  stopping on each — `speculearnPool` merges the three sources and");
  console.log("  `PretestFeed` runs them one at a time. The two old addresses");
  console.log("  (/pretests/unit0/*, /pretests/picture/*) forward there, because");
  console.log("  printed QR sheets still name them.");
  process.exit(1);
}
console.log("\npretest-scan: every pre-test address lands on a one-question-per-screen feed.");
