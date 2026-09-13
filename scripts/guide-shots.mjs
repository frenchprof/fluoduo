/**
 * Screenshots for the learner manual (docs/guide). Serves the static export in
 * out/ and drives it in Chromium at phone width (390x844, 2x), a few at desktop.
 *
 *   NEXT_PUBLIC_OPEN_APP=1 npx next build
 *   node scripts/guide-shots.mjs <dir>          # PNGs land in <dir>
 *   node scripts/guide-webp.mjs <dir> docs/guide/img
 *   python3 scripts/build-guide.py
 *
 * First-run tours, hints, the beta notice and the install prompt are pre-seeded
 * as dismissed, so every picture shows the screen a returning learner sees.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { visit, FRAMES_SETTLED } from "./lib/settle.mjs";

const OUT = "out"; const PORT = 4173; const DIR = process.argv[2] ?? "/tmp/guide-shots";
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".webp":"image/webp", ".gif":"image/gif", ".mp3":"audio/mpeg", ".txt":"text/plain", ".ico":"image/x-icon", ".webmanifest":"application/manifest+json" };
function resolve(u) {
  const clean = decodeURIComponent(u.split("?")[0].split("#")[0]).replace(/\/+$/, "") || "/index";
  for (const c of [join(OUT, clean), join(OUT, clean + ".html"), join(OUT, clean, "index.html")]) if (existsSync(c) && statSync(c).isFile()) return c;
  return join(OUT, "404.html");
}
const server = createServer((req, res) => { const f = resolve(req.url); res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f)); });
await new Promise((r) => server.listen(PORT, r));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const SEED = `try{localStorage.setItem("fluolingo:tours.never","1");localStorage.setItem("fluolingo:beta-notice.v1","1");localStorage.setItem("fluolingo:install-prompt.v1","never");
for(const k of ["speculearn","flip","lesson","grammarathon","conjugaison","wordrill","ecoutexte","reviser","vocabularain","lexicalator","compose","numbers","numbus","numbourse","tts","tutor","home","map","index","unit","say"])localStorage.setItem("fluolingo:hint."+k,"1");}catch{}`;

async function shot(name, path, { w = 390, h = 844, act, wait = 1000 } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: "en-GB" });
  await ctx.addInitScript(SEED);
  const p = await ctx.newPage();
  try {
    await visit(p, `http://localhost:${PORT}${path}`, FRAMES_SETTLED, { timeout: 8000 });
    await p.waitForTimeout(wait);
    if (act) await act(p);
    await p.screenshot({ path: `${DIR}/${name}.png` });
    console.log("ok ", name);
  } catch (e) { console.log("ERR", name, String(e.message).split("\n")[0]); }
  await ctx.close();
}
const frame = (p) => p.frames().find((f) => f !== p.mainFrame()) ?? p.mainFrame();
/** Click the first of these texts found in any frame (host or the station's iframe). */
const clickText = async (p, texts, wait = 900) => {
  for (const t of texts) for (const f of p.frames()) {
    const el = await f.$(`text=${t}`);
    if (el) { try { await el.click({ timeout: 2000 }); await p.waitForTimeout(wait); return true; } catch {} }
  }
  return false;
};
const skipSplash = (p) => clickText(p, ["TAP TO SKIP"]);
const openMenu = async (p) => { await p.click('button[aria-label^="Navigation"]'); await p.waitForTimeout(700); };
const pickFirstOption = async (p) => {
  const f = frame(p);
  for (const el of await f.$$("button")) {
    const t = (await el.innerText()).trim(); const box = await el.boundingBox();
    if (box && box.y > 250 && t.length > 0 && t.length < 40 && !/skip|🔊|🔇|✕|why/i.test(t)) { await el.click(); await p.waitForTimeout(700); return; }
  }
};

await shot("door", "/", { wait: 1500 });
await shot("home-3d", "/home?view=3d", { wait: 2500 });
await shot("home-2d", "/home?view=2d", { wait: 1500 });
await shot("home-desktop", "/home?view=3d", { w: 1280, h: 800, wait: 2500 });
await shot("menu", "/home?view=2d", { h: 900, act: openMenu });
await shot("menu-desktop", "/home?view=2d", { w: 1280, h: 900, act: openMenu });
await shot("goal", "/sio/SIO-005", { wait: 1200 });
await shot("speculearn-landing", "/practice/speculearn");
await shot("speculearn", "/practice/speculearn/goal/SIO-005", { wait: 1200 });
await shot("speculearn-answered", "/practice/speculearn/goal/SIO-005", { wait: 1200, act: pickFirstOption });
await shot("mnemo", "/lessons/deck/colors", { wait: 1200 });
await shot("flip", "/practice/flip-it/colors", { wait: 1200 });
await shot("grammarathon", "/practice/grammarathon/aller-destinations", { wait: 1500 });
await shot("conjugazone", "/conjugaison", { wait: 1200 });
await shot("erroreview", "/reviser", { wait: 1200 });
await shot("vocabularain-gallery", "/games/vocabularain");
await shot("vocabularain-study", "/games/vocabularain/days", { wait: 2500, act: skipSplash });
await shot("vocabularain", "/games/vocabularain/days", { wait: 2500, act: async (p) => { await skipSplash(p); await clickText(p, ["Let’s go!", "Let's go!"], 2500); } });
await shot("numbers", "/games/numbers");
await shot("numbus", "/games/numbus", { wait: 1200 });
await shot("numbus-game", "/games/numbus", { wait: 1500, act: async (p) => { await clickText(p, ["Jouer", "Play", "Start"], 1500); await skipSplash(p); await clickText(p, ["Got it"], 2500); } });
await shot("numbourse", "/games/numbourse", { wait: 1500, act: skipSplash });
await shot("lexicalocker-gallery", "/games/lexicalater");
await shot("lexicalocker", "/games/lexicalater/aliments", { wait: 2000, act: async (p) => { await skipSplash(p); await clickText(p, ["Got it"], 1200); } });
await shot("wordrill", "/practice/wordrill", { wait: 1200 });
await shot("wordrill-card", "/practice/say-it/colors", { wait: 1200 });
await shot("ecoutexte", "/practice/ecoutexte", { wait: 1200 });
await shot("voixla", "/tts", { wait: 1200 });
await shot("chatutor", "/tutor", { wait: 1200 });
await shot("composeit-gallery", "/games/compose");
await shot("composeit", "/games/compose/cafe", { wait: 1500 });
await shot("profile", "/profil", { wait: 1200 });
await shot("leaderboard", "/leaderboard", { wait: 1200 });
await shot("settings", "/reglages", { wait: 1200 });
await shot("favourites", "/favourites");
await shot("help", "/guide");
await b.close(); server.close();
