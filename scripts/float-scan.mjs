// float-scan — the floating 🐞 never rests on a control a learner must press.
//
// Dan, 2026-09-12, shown ConjugaZone on a phone: *"fix the ladybird one"*. Two
// measured collisions, both on arrival, both on the page a learner opens:
//
//     iPhone SE   🐞 over the 🔊 on être's « ils » row
//     iPhone 14   🐞 over the right third of « Check avoir »
//
// Dragging (2026-07-26, *"make the floating buttons movable, they are blocking
// the way"*) answered the version of this complaint where the learner has
// already noticed. It cannot answer the first screenful, which is the one that
// decides whether they find the button at all.
//
// ── WHY A BROWSER, AND WHY THE HOST ROUTE ───────────────────────────────────
// This is geometry between two boxes that never meet in any one file, and one
// of them is in a DIFFERENT DOCUMENT. Every station runs in the cahier in an
// iframe (Dan, 7 Sep); the float is rendered by the root layout, on the host.
// So the overlap is the host's fixed button against a frame's control, and a
// rect from the frame has to be translated by the frame's own position before
// the two can even be compared.
//
// That is also how the first version of the fix passed while fixing nothing.
// It called `document.querySelectorAll` in the host, found a near-empty page,
// declared itself clear — and went on covering « Check avoir » by 779px².
// Scanning /conjugaison/embed directly would have agreed with it, because
// loaded on its own that document HAS its own controls beside the button. Only
// the host route asks the real question, so only the host route is scanned.
//
// ── TWO RULES, AND THE SECOND IS THE GENERAL ONE ────────────────────────────
// 1 · On the named routes the float rests clear of every control. A LIST, not
//     a sweep: these are the surfaces the complaint was about plus a couple
//     that stand for the rest, and adding one is a line here.
// 2 · ON EVERY ROUTE the float is either clear OR on its anchor — never
//     stranded in between. This is what stops the fix becoming its own bug:
//     an early cut climbed 208px up VocabulaRain and was STILL covering three
//     tiles, which is worse than resting in the corner, where a learner can
//     scroll past it or drag it. A page that is wall-to-wall controls has no
//     clear spot and must give up rather than wander.
//
// THE GALLERIES ARE RULE 2, ON PURPOSE. VocabulaRain and LexicaLocker stack
// unit flaps edge to edge over a grid of tiles: the biggest gap anywhere in
// that column is 10px and the button is 44px tall, so no clear band exists at
// any scroll position. They are listed as DENSE with that reason rather than
// quietly dropped, because the day one of them gets a clear spot, rule 1 is
// where it belongs.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { visit } from "./lib/settle.mjs";

const OUT = "out";
const PORT = 4191;

/** Rule 1 — the float must land clear here. */
const CLEAR = new Map([
  ["/conjugaison", "ConjugaZone — the route Dan sent: « Check avoir » and a row's 🔊"],
  ["/tts", "VoixLà — a station with room, so a regression shows as movement"],
  ["/reviser", "ErroReview — ditto, on the other side of the app"],
]);

/** Rule 2 only — no clear band exists in the float's column at any scroll. */
const DENSE = new Map([
  ["/games/vocabularain", "unit flaps edge to edge over a 10px-gap tile grid"],
  ["/games/lexicalater", "the same gallery, one deck list wider"],
]);

/** The anchor the float is given when nothing is in its way. Rule 2 compares
 *  against this: a float that has moved must have moved to somewhere clear. */
const ANCHOR = 20;
const SLACK = 3;   // sub-pixel layout, and the 1px rounding in the hook

const CONTROL =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [role="link"]';

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

const server = createServer((req, res) => {
  const file = resolveFile(req.url);
  if (!file) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const exe = process.env.BAND_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });

const PASS = [], FAIL = [];
const ok = (cond, good, bad) => (cond ? PASS : FAIL).push(cond ? good : bad);

/** What the 🐞 overlaps, counting through same-origin frames. */
const probe = (page, CONTROL) =>
  page.evaluate((CONTROL) => {
    const bug = [...document.querySelectorAll("button")]
      .find((b) => (b.textContent || "").includes("🐞"));
    if (!bug) return { missing: true };
    const r = bug.getBoundingClientRect();
    const hits = [];
    const scan = (doc, ox, oy, depth) => {
      for (const el of doc.querySelectorAll(CONTROL)) {
        if (el === bug || bug.contains(el)) continue;
        const q = el.getBoundingClientRect();
        if (q.width === 0 || q.height === 0) continue;
        const ov = Math.max(0, Math.min(r.right, q.right + ox) - Math.max(r.left, q.left + ox)) *
                   Math.max(0, Math.min(r.bottom, q.bottom + oy) - Math.max(r.top, q.top + oy));
        if (ov > 1) {
          hits.push({ what: (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 24), ov: Math.round(ov) });
        }
      }
      if (depth <= 0) return;
      for (const f of doc.querySelectorAll("iframe")) {
        const fr = f.getBoundingClientRect();
        if (fr.width === 0 || fr.height === 0) continue;
        try { if (f.contentDocument) scan(f.contentDocument, ox + fr.left, oy + fr.top, depth - 1); } catch {}
      }
    };
    scan(document, 0, 0, 2);
    hits.sort((a, b) => b.ov - a.ov);
    return { fromBottom: Math.round(window.innerHeight - r.bottom), hits, onscreen: r.top >= 0 && r.bottom <= window.innerHeight };
  }, CONTROL);

// The float is placed after mount, from what it can see; `visit` waits for the
// button itself rather than a clock, then the hook's own settle pass is given
// its window. That last wait is the one thing here a condition cannot replace:
// the fix is DEFINED as "after things stop moving".
const READY = () => !![...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("🐞"));

for (const [route, why, dense] of [
  ...[...CLEAR].map(([r, w]) => [r, w, false]),
  ...[...DENSE].map(([r, w]) => [r, w, true]),
]) {
  for (const width of [320, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => {
      try { for (const k of ["gap", "tour", "first", "conjuga"]) localStorage.setItem("fluolingo:hint." + k, "1"); } catch {}
    });
    const page = await ctx.newPage();
    await visit(page, `http://localhost:${PORT}${route}`, READY, { timeout: 8000 });
    await page.waitForTimeout(2200);

    const m = await probe(page, CONTROL);
    const at = `${route} @${width}`;
    // `ok` builds BOTH messages before it picks one, so the failure text has to
    // be safe on a passing run — the first cut read hits[0] and crashed the
    // scan on its own green case.
    const worst = m.hits && m.hits[0] ? `« ${m.hits[0].what} » at ${m.hits[0].ov}px²` : "nothing";
    if (m.missing) {
      FAIL.push(`${at}: no 🐞 on the page — the float is how a learner reports a bug`);
    } else if (!m.onscreen) {
      FAIL.push(`${at}: the 🐞 has left the screen (${m.fromBottom}px from the bottom)`);
    } else if (dense) {
      // Rule 2: clear, or home. Never stranded.
      const home = Math.abs(m.fromBottom - ANCHOR) <= SLACK;
      ok(m.hits.length === 0 || home,
        `${at}: dense page — the 🐞 stayed on its anchor instead of wandering (${why})`,
        `${at}: the 🐞 moved to ${m.fromBottom}px up and is STILL covering ` +
        `${m.hits.length} control(s), worst ${worst}. ` +
        `A float stranded mid-page and still in the way is worse than one in its ` +
        `corner — when no candidate lands clear it must stay at ${ANCHOR}px.`);
    } else {
      ok(m.hits.length === 0,
        `${at}: the 🐞 rests clear of every control (${m.fromBottom}px up)`,
        `${at}: the 🐞 covers ${m.hits.length} control(s) — worst ${worst}. ` +
        `${why}. It is rendered by the root layout and the ` +
        `control is inside the cahier's iframe, so a same-document check will not ` +
        `see this: useDragFloat's avoidControls has to walk same-origin frames.`);
    }
    await ctx.close();
  }
}

await browser.close();
server.close();

console.log(PASS.map((m) => "  ok    " + m).join("\n"));
if (FAIL.length) console.log(FAIL.map((m) => "  FAIL  " + m).join("\n"));
console.log("-".repeat(70));
console.log(`  ${PASS.length} passed · ${FAIL.length} failed`);
process.exit(FAIL.length ? 1 : 0);
