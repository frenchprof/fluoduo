// user-pages-scan — photograph every page in the 👤 User family, as a real
// mid-course learner sees it. Dan: the User pages are counter-intuitive and he
// would not know how to navigate them. Before redesigning, look at them.
import { createServer } from "node:http";
import { readFileSync, statSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out", PORT = 4231;
const SHOTS = process.argv[2] || "shots";
mkdirSync(SHOTS, { recursive: true });

const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css",
  ".json":"application/json", ".txt":"text/plain", ".svg":"image/svg+xml",
  ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp",
  ".woff2":"font/woff2", ".otf":"font/otf", ".webmanifest":"application/manifest+json" };
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

// A learner 21 stops in: a real streak, real XP, badges earned, some cosmetics.
// Nothing here is aspirational — it is what week 6 of the course looks like.
const SEED = () => {
  const day = new Date().toISOString().slice(0, 10);
  const done = Array.from({ length: 21 }, (_, i) => `SIO-${String(i + 1).padStart(3, "0")}`);
  const srs = {};
  for (const s of done.slice(0, 12)) for (let k = 0; k < 4; k++)
    srs[`${s}:item${k}`] = { ease: 2.3, interval: 3 + k, due: day, reps: 2 + k, lapses: k % 2 };
  try {
    window.localStorage.setItem("fluolingo:progress", JSON.stringify({
      doneSios: done, gems: 340, xp: 4820, streak: 12, weekXp: 610,
      weekKey: null, prevWeekXp: 480, prevWeekKey: null,
      lastActiveDay: day, itemSrs: srs,
      badges: ["first-step", "streak-7", "unit-0", "unit-1", "graduate"],
      cosmetics: { owned: ["beige", "emeraude"], equipped: { livery: "beige" } },
      shields: 2, findDay: day, findGems: 2, findDry: 5,
      goal: { sio: "SIO-022", by: null },
    }));
  } catch {}
};

const PAGES = [
  ["me",        "/profil",            "Me"],
  ["board",     "/profil?tab=board",  "Board"],
  ["history",   "/profil?tab=history","History"],
  ["settings",  "/profil?tab=settings","Settings"],
];
const VIEWPORTS = [["phone", 390, 844], ["desktop", 1280, 900]];

// The repo's playwright-core wants a browser build this container does not
// carry; CHROME_PATH points it at the pre-installed Chromium instead.
const EXE = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ args: ["--no-sandbox"], executablePath: EXE });
for (const [vp, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  await ctx.addInitScript(SEED);
  const page = await ctx.newPage();
  for (const [slug, route, label] of PAGES) {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    // Dismiss any first-run coach mark so we photograph the page, not a hint.
    for (const t of ["Got it", "No thanks", "Skip", "Fermer"]) {
      const b = page.getByRole("button", { name: t });
      if (await b.count().catch(() => 0)) await b.first().click().catch(() => {});
    }
    await page.waitForTimeout(300);
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: `${SHOTS}/${vp}-${slug}.png`, fullPage: true });
    console.log(`  ${vp.padEnd(8)} ${route.padEnd(18)} ${label.padEnd(12)} page is ${full}px tall (viewport ${height}px) -> ${Math.round(full / height * 10) / 10} screens`);
  }
  await ctx.close();
}
await browser.close();
server.close();
