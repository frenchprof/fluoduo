/**
 * Does a framed page's own link draw a second notebook inside the first?
 *
 * Every station runs in an iframe since 7 Sep, so a hub rendered from an
 * `/embed` route IS the framed document. A plain link there navigates the
 * FRAME, and a whole page loaded into it brings its own site bar, coils and
 * band — inside the band that is still wrapped around it.
 *
 * For each (hub, link) pair it opens the hub, clicks the link, and reports how
 * many documents are left and what band each is showing. Emits one JSON object
 * on stdout; the check decides.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(process.cwd(), "out");
/* PORT 0 — THE OS PICKS ONE. A fixed port made two of these scans
   collide when they ran at the same time, and the failure reads as the
   fault the check is for rather than as a busy socket. Nothing outside
   this file needs to know the number. */
const PORT = 0;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".txt": "text/plain", ".mp3": "audio/mpeg",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon" };

function resolveFile(url) {
  const p = decodeURIComponent(url.split("?")[0]);
  const f = join(ROOT, p);
  if (existsSync(f) && !statSync(f).isDirectory()) return f;
  if (existsSync(f + ".html")) return f + ".html";
  if (existsSync(join(f, "index.html"))) return join(f, "index.html");
  return null;
}
const server = createServer((req, res) => {
  const f = resolveFile(req.url);
  if (!f) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(PORT, r));
const BASE = `http://localhost:${server.address().port}`;

const exe = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null;
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

/* THE HUBS THAT HOLD DOORS TO WHOLE PAGES, and one door each to walk through.
   Named rather than crawled: a crawl would have to decide which of a page's
   links is a "door" and which is chrome, and it would answer wrongly for the
   ☰ menu, which lives in the OUTER document and is not this fault. */
const WALKS = [
  { hub: "/games/numbers", link: /NumBus$/ },
  { hub: "/games/lexicalater", link: /^▶ Play/ },
  { hub: "/games/vocabularain", link: /^▶ Play/ },
  { hub: "/path", link: /^▶ Continue/ },
];

const report = [];
for (const { hub, link } of WALKS) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + hub, { waitUntil: "load", timeout: 40000 });
    await page.waitForTimeout(1400);

    let clicked = false;
    for (const f of page.frames()) {
      try {
        const l = f.getByRole("link", { name: link });
        if (await l.count()) { await l.first().click(); clicked = true; break; }
      } catch { /* not in this frame */ }
    }
    if (!clicked) { report.push({ hub, clicked: false }); await ctx.close(); continue; }
    await page.waitForTimeout(2200);

    const bands = [];
    for (const f of page.frames()) {
      const b = await f.evaluate(() => {
        const el = document.querySelector(".page-band");
        return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : null;
      }).catch(() => null);
      if (b) bands.push(b);
    }
    const nested = await page.evaluate(() => document.querySelectorAll("iframe").length);
    report.push({ hub, clicked: true, landed: new URL(page.url()).pathname, bands, nested });
  } catch (e) {
    report.push({ hub, error: String(e).slice(0, 120) });
  }
  await ctx.close();
}

await browser.close();
server.close();
process.stdout.write(JSON.stringify({ report }, null, 1));
