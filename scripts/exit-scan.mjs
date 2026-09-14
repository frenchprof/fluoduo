/**
 * Where does the ✕ go, on every page that has one?
 *
 * Driven, not read: `exitHref` is threaded through GameLanding -> CahierShell
 * -> PageBand with a default at each hop, so which one wins on a given route
 * is a question only the rendered page can answer. Reading any one of the
 * three files tells you what that file would do, not what the learner gets.
 *
 * Emits one JSON object on stdout: `{ exits: { route: href|null } }`. The
 * check decides; this only measures.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(process.cwd(), "out");
const PORT = 4743;
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
const BASE = `http://localhost:${PORT}`;

const exe = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null;
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

const games = existsSync(join(ROOT, "games"))
  ? readdirSync(join(ROOT, "games")).filter((n) => !n.includes("."))
  : [];
const routes = [
  ...games.map((g) => `/games/${g}`),
  "/tts", "/tutor", "/reviser", "/conjugaison",
  "/practice/speculearn", "/practice/wordrill", "/practice/ecoutexte",
  "/profil", "/guide", "/path",
];

const exits = {};
for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } });
  const page = await ctx.newPage();
  try {
    // `load` and a retry, not `networkidle` — see handhold-scan.mjs for the
    // CI run that made the difference. This app polls, so the 500ms quiet gap
    // networkidle waits for may never arrive on a cold runner.
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await page.goto(BASE + route, { waitUntil: "load", timeout: 40000 }); break; }
      catch (e) { if (attempt === 1) throw e; }
    }
    await page.waitForTimeout(400);
    // The band may be in the host document or in the station's frame.
    let href = null;
    for (const f of page.frames()) {
      try {
        const h = await f.locator('a[aria-label="Exit"], .page-band a').first()
          .getAttribute("href", { timeout: 900 });
        if (h) { href = h; break; }
      } catch { /* not in this frame */ }
    }
    exits[route] = href;
  } catch (e) {
    exits[route] = `ERROR ${String(e).slice(0, 80)}`;
  }
  await ctx.close();
}

await browser.close();
server.close();
process.stdout.write(JSON.stringify({ exits }, null, 1));
