// course-scan — the address decides the course (11 Sep 2026).
//
// Dan: "do the wiring so f1 to f4 mean different courses". One static export
// serves every address, so which course a page is running as exists in no
// file: it is decided in the browser from the hostname. That is why this is
// driven rather than read.
//
// Chromium resolves every `*.localhost` name to the machine itself, so the
// export served on one port can be opened as three different hosts:
//
//   http://localhost:4198/        names no course  -> the app, no course tag
//   http://f1.localhost:4198/     French 1, live   -> the app, « French 1 · A1 »
//   http://f2.localhost:4198/     French 2, closed -> the closed door, on the
//                                                    welcome page AND on /home
//
// Prints one JSON line per host; verify195 reads them. With SHOT=dir set it
// also writes a screenshot of each, for the show-don't-describe rule.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4198;
const SHOT = process.env.SHOT || "";

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
if (SHOT) mkdirSync(SHOT, { recursive: true });

const READ = () => {
  const closed = document.querySelector("[data-course-closed]");
  const tag = document.querySelector("[data-course-tag]");
  const enter = [...document.querySelectorAll("a[href]")].find((a) => /^enter$/i.test((a.textContent || "").trim()));
  const go = closed ? [...closed.querySelectorAll("a[href]")].map((a) => ({ text: (a.textContent || "").trim(), href: a.href, width: Math.round(a.getBoundingClientRect().width) })) : [];
  return {
    course: document.documentElement.dataset.course ?? null,
    closed: closed ? closed.getAttribute("data-course-closed") : null,
    closedTitle: closed ? (closed.querySelector("h1")?.textContent || "").trim() : null,
    tag: tag ? (tag.textContent || "").trim() : null,
    enter: !!enter,
    map: !!document.querySelector(".home-map3d-box"),
    go,
    vw: window.innerWidth,
    footer: !!document.querySelector("footer"),
  };
};

const CASES = [
  ["localhost", "/", { width: 1280, height: 800 }],
  ["f1.localhost", "/", { width: 1280, height: 800 }],
  ["f2.localhost", "/", { width: 1280, height: 800 }],
  ["f2.localhost", "/home", { width: 1280, height: 800 }],
  ["f3.localhost", "/map", { width: 390, height: 844 }],
];

for (const [host, path, viewport] of CASES) {
  const page = await browser.newPage({ viewport });
  await page.goto(`http://${host}:${PORT}${path}`, { waitUntil: "domcontentloaded" });
  // The gate decides after mount; give hydration a beat, then read.
  await page.waitForFunction(() => document.documentElement.dataset.course !== undefined, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
  const r = await page.evaluate(READ);
  if (SHOT) await page.screenshot({ path: join(SHOT, `${host}${path.replace(/\//g, "_") || "_"}.png`) });
  console.log(JSON.stringify({ host, path, ...r }));
  await page.close();
}

await browser.close();
server.close();
