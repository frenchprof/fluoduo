// band-scan — every page wears exactly ONE coloured strip at the top.
//
// Dan, 2026-09-07, over a screenshot of a pre-test that opened on bare paper:
// *"we also need to make it a point that pages never loose their coloured
// strip at the top, which means this should be illegal"*.
//
// WHY THIS IS A BROWSER SCAN AND NOT A GREP. The strip can go missing in two
// ways that look nothing alike in source, and neither is visible from the file
// that causes it:
//
//   1 · THE HOST SUPPRESSES IT.  `<CahierShell band={false}>` around an
//       EmbedFrame is correct for the five DrillShell activities — a drill's
//       band carries its own ✕, goal chip and progress, so the frame's strip
//       is the page's strip. It is WRONG when the framed page draws its band
//       with CahierShell, because `html[data-embed]` in globals.css hides a
//       CahierShell band inside a frame. Host suppressed + frame hidden = no
//       strip, and each half reads as correct on its own. That was the
//       pre-test.
//   2 · THE HOST CANNOT NAME ITSELF.  CahierShell drew no band at all when
//       `pageLabel` came back undefined — an active key with a family but no
//       flap, no registry entry and no hub. That was /moi, whose own name
//       lives under /profil because they are one page.
//
// A grep for `band={false}` flags the five correct ones and misses the second
// shape entirely. Only the rendered page knows, so this drives it: for every
// route in src/app (one instance per dynamic segment), count the VISIBLE
// .page-band elements across the top document AND every frame, and require
// exactly one. Zero is Dan's fault. Two is a page wearing two strips, which is
// the same fault from the other side and is what a careless fix produces.
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { visit, FRAMES_SETTLED, visibleSomewhere } from "./lib/settle.mjs";

const OUT = "out";
const PORT = 4183;

/* Routes that are SUPPOSED to have no band, each for a reason that is about
   the page rather than about the band. Kept as a list with reasons because an
   exemption without one is how a fault becomes a convention. */
const EXEMPT = new Map([
  // Home moved to /home on 2026-09-09 when the landing page took the root.
  ["/home", "Home keeps its hero instead of a band (CahierShell: active !== 'home')."],
  ["/map/standalone", "The deliberately BARE map for other people's pages — it draws no cahier at all."],
  // The pre-home landing page (Dan, 8 Sep). A coloured strip IS notebook
  // furniture — it names the page you are on inside the app — and this page is
  // the door in front of the app. The scene fills it edge to edge and a band
  // would be a bar laid across the sky, which is where the welcome lives.
  // verify151 is what holds this page's layout instead.
  // THE DOOR MOVED TO THE ROOT on 2026-09-09 (Dan: "the first i see must be
  // the one with Welcome to FluOLinGo in the horizon"). /welcome still exists
  // as a forward, so both addresses are exempt: the old one renders nothing
  // but a redirect, and a redirect has no band either.
  ["/", "The door: the 3D scene fills the screen and there is no cahier to label."],
  ["/welcome", "The door's old address — a forward to /, so it draws no band."],
  // THE MAP MERGED INTO HOME on 2026-09-12 (Dan: *"We have two pages doing the
  // same thing: The Home page + The Map. Can we just keep the Bienvenue one"*).
  // All three of these render a redirect and nothing else, and a redirect has
  // no band for the same reason /welcome has none — there is no page under it
  // to label. They are exempt as FORWARDS, not as map pages: if any of them
  // ever renders a real page again it will need its strip back, and it will
  // come back through this list rather than silently.
  ["/map", "Retired 12 Sep — forwards to /home, which draws the map itself."],
  ["/carte", "The map's one-day French address (21 Aug) — a forward, now straight to /home."],
  ["/unit/[unit]", "A deep link into the map since patch 25 — a forward to /home?unit=N."],
  // Both /hidden pages are `robots: noindex`, reachable only by typing the URL,
  // and exist so Dan can look at ONE thing at a size: the origin animation, and
  // the language sorter. Chrome around them is the thing being excluded. They
  // are not course surfaces and no learner meets them.
  ["/hidden/fluolingo", "A stage to watch the origin animation on — noindex, no chrome by design."],
  ["/hidden/vocabularain", "The language-sorter demo — noindex, off the course entirely."],
]);

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
  ".mp3": "audio/mpeg", ".webmanifest": "application/manifest+json",
};

function resolveFile(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  for (const c of [join(OUT, clean), join(OUT, clean + ".html"), join(OUT, clean, "index.html")]) {
    try { if (statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

/* Every route in the app, as a PATTERN — /sio/[id], /games/compose, … */
function routePatterns(dir = "src/app", prefix = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "page.tsx") { out.push(prefix || "/"); continue; }
    if (!statSync(full).isDirectory()) continue;
    // Route groups `(x)` do not appear in the URL; `_private` folders are not routes.
    if (name.startsWith("_")) continue;
    const seg = name.startsWith("(") && name.endsWith(")") ? "" : "/" + name;
    out.push(...routePatterns(full, prefix + seg));
  }
  return out;
}

/* Concrete URLs for a pattern: the FIRST AND LAST exported instance of each
   dynamic segment. Two, not one, because one instance does not represent the
   route — /games/lexicalater/[deckId] renders a "being prepared" screen for a
   deck that is not syllabified yet and the game itself for one that is, and
   only the second has the fault. Two samples catch a branch; every instance
   would mean 90 pre-tests, 59 lessons and 50 stops.
   A pattern with no instance in out/ is skipped rather than failed — that is a
   build-coverage question, and verify-wiring owns it. */
function instances(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => !n.startsWith("__next") && !n.startsWith("."))
    .map((n) => n.replace(/\.(html|txt)$/, ""))
    .filter((n, i, a) => a.indexOf(n) === i)
    .filter((n) => existsSync(join(dir, n + ".html")) || existsSync(join(dir, n, "index.html")))
    .sort();
}

function concrete(pattern) {
  let paths = [""];
  for (const seg of pattern.split("/").filter(Boolean)) {
    const next = [];
    for (const p of paths) {
      if (!seg.startsWith("[")) { next.push(p + "/" + seg); continue; }
      const kids = instances(join(OUT, p));
      for (const kid of [kids[0], kids[kids.length - 1]]) if (kid) next.push(p + "/" + kid);
    }
    paths = [...new Set(next)];
  }
  return paths.filter((u) => u && resolveFile(u));
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url);
  if (!file) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const patterns = routePatterns()
  .filter((p) => !p.endsWith("/embed"))   // the framed half is measured through its host
  .sort();

// Same resolution as jam-scan.mjs: a dev container carries a Playwright
// chromium, CI's ubuntu runner ships Google Chrome. BAND_BROWSER overrides.
const exe = process.env.BAND_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();

const probe = (f) =>
  f.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(".page-band")) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || r.height < 1) continue;
      out.push({ h: Math.round(r.height), text: (el.textContent || "").trim().slice(0, 40) });
    }
    return out;
  });

const bad = [];
let scanned = 0, skipped = 0;
for (const pattern of patterns) {
  if (EXEMPT.has(pattern)) { skipped++; continue; }
  const urls = concrete(pattern);
  if (!urls.length) { skipped++; continue; }
  let note = "";
  for (const url of urls) {
    // WAIT FOR THE STRIP, NOT FOR THE CLOCK. This replaced a flat 1400ms sleep on
    // every one of the 77 URLs — 108 of this scan's 115 seconds. What the sleep was
    // buying is spelled out here instead: the frame of a framed station has loaded
    // and stamped `html[data-embed]` (which is what decides its band's display),
    // AND a strip is actually painted. Waiting for the strip itself, rather than
    // only for the frames, is load-bearing: /games/lexicalater/[deckId] and
    // /decks/[id]/study build theirs after their deck data arrives, and a version
    // that waited only for frames disagreed with itself between runs.
    await visit(page, `http://localhost:${PORT}${url}`,
      `${FRAMES_SETTLED} && ${visibleSomewhere(".page-band")}`);
    const seen = [];
    for (const f of page.frames()) {
      const r = await probe(f).catch(() => []);
      for (const b of r) seen.push({ where: f === page.mainFrame() ? "page" : "frame", ...b });
    }
    if (seen.length !== 1) { bad.push({ pattern, url, seen }); note += `  <-- ${url}: ${seen.length} strips`; }
  }
  scanned++;
  process.stdout.write(`  ${String(scanned).padStart(2)}/${patterns.length} ${pattern}${note}\n`);
}

await browser.close();
server.close();

if (bad.length) {
  console.log("\nband-scan: a page must wear exactly ONE coloured strip at the top.\n");
  for (const b of bad) {
    if (b.seen.length === 0) {
      console.log(`  ✗ ${b.pattern}  (${b.url}) has NO strip.`);
      console.log("      Either the host passes band={false} while the framed page draws its");
      console.log("      band with CahierShell (hidden by html[data-embed]), or the host's");
      console.log("      active key resolves to no title. Give the HOST a band={{ title }}.");
    } else {
      console.log(`  ✗ ${b.pattern}  (${b.url}) has ${b.seen.length} strips: ` +
        b.seen.map((s) => `${s.where} "${s.text}"`).join(" + "));
      console.log("      Two strips is the same fault from the other side: the host and the");
      console.log("      framed page are both drawing one. Only one of them should.");
    }
  }
  process.exit(1);
}
console.log(`\nband-scan: ${scanned} routes, every one wearing exactly one coloured strip (${skipped} exempt or not exported).`);
