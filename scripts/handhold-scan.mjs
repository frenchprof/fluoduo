/**
 * Does the hand-hold point at something that is on the screen?
 *
 * Driven, not read, for the reason verify220 and verify540 both record: a
 * selector is correct or not only against a running page, and this particular
 * fault depends on the DECK — the same row, the same selector, right on 29
 * WorDrill decks and pointing at nothing on 21 of them.
 *
 * For every drill route that offers a first-run card it reports, per route:
 *   listed   the steps the card prints, in order
 *   dead     the ones naming a control that is not on the screen
 *   walk     how many steps the walk actually runs (after pressing « Show me »)
 *
 * Emits one JSON object on stdout. The check decides; this only measures.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(process.cwd(), "out");
const PORT = 4741;
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

/* THE TWO FAMILIES THAT ASK « How many …? », which is the only step in the app
   whose control is conditional on the deck. Every exported deck of each, not a
   sample: the fault was invisible on `aller-destinations`, which is the one
   route the older tour scan happens to drive. */
const decks = (dir) => {
  const p = join(ROOT, dir);
  return existsSync(p) ? readdirSync(p).filter((n) => !n.includes(".")) : [];
};
const routes = [
  ...decks("practice/say-it").map((d) => `/practice/say-it/${d}`),
  ...decks("practice/flip-it").map((d) => `/practice/flip-it/${d}`),
];

/** The selectors a step can name, read off the card's own text is impossible —
 *  so the page is asked directly for every `data-tour` hook it is showing. */
async function open(page, route) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.goto(BASE + route, { waitUntil: "load", timeout: 40000 });
      // The card opens from an effect that reads localStorage, so it is never
      // in the first paint. 6s is generous against a cold runner and still
      // returns promptly on a route that simply has no card to show.
      await page.locator('div[role="dialog"]').first()
        .waitFor({ state: "visible", timeout: 6000 }).catch(() => {});
      // AND LET THE LIST SETTLE. The card can open before the drill's mount
      // shuffle has filled its queue, and the card is honest about that — it
      // re-measures every 150ms and grows the step back when the chooser
      // arrives. Reading it in the first instant scores the app for a frame
      // no learner sees; this waits for two consecutive identical readings.
      let last = null;
      for (let k = 0; k < 20; k++) {
        const now = await page.evaluate(() =>
          [...document.querySelectorAll('div[role="dialog"] ol li')]
            .map((li) => li.textContent.trim()).join("|"));
        if (last !== null && now === last) break;
        last = now;
        await page.waitForTimeout(150);
      }
      return;
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
}

const report = [];
for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } });
  const page = await ctx.newPage();
  try {
    /* `load`, THEN WAIT FOR THE CARD — not `networkidle`, and the CI run that
       taught us is worth the line. One route in fifty timed out at 25s on a
       cold runner while every substantive clause passed, which is a flake
       reporting a fault. `networkidle` waits for a 500ms gap in requests, and
       this app polls: the prune's own 150ms measure loop, the TTS bank, the
       usher. On a slow machine that gap may simply never arrive. What the scan
       actually needs is the first-run card, so it waits for THAT, and a route
       that misses gets one more go before it counts as broken. */
    await open(page, route);
    const card = await page.evaluate(() => {
      const dlg = document.querySelector('div[role="dialog"]');
      if (!dlg) return null;
      return {
        listed: [...dlg.querySelectorAll("ol li")].map((li) => li.textContent.trim()),
        chooser: document.querySelectorAll('[data-tour="how-many"]').length > 0,
      };
    });
    if (!card) { await ctx.close(); continue; }

    const btn = page.getByRole("button", { name: "Show me" });
    let walk = null;
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1400);
      walk = await page.evaluate(() => {
        const panel = document.querySelector("[data-guided-steps]");
        if (!panel) return null;
        const t = panel.textContent || "";
        return {
          of: Number(t.match(/STEP\s+\d+\s+OF\s+(\d+)/i)?.[1] ?? 0),
          finding: /Finding it/i.test(t),
        };
      });
    }
    report.push({ route, ...card, walk });
  } catch (e) {
    report.push({ route, error: String(e).slice(0, 120) });
  }
  await ctx.close();
}

await browser.close();
server.close();
process.stdout.write(JSON.stringify({ report }, null, 1));
