// hover-scan — every control answers the pointer.
//
// Dan, 2026-09-13: *"The mouseover effects are not everywhere. are they. they
// should be"* — the third time, after *"those hero buttons have a mouseover
// behaviours though that we want to replicate throughout the site"* and *"even
// for depressed spaces (e.g. buttons in the depressed states) there needs to be
// some mouseover effect and activating effect"*.
//
// WHY THIS IS A BROWSER SCAN AND NOT A GREP. globals.css holds thirty-two
// `:hover` rules, so grepping for them says the app is covered. It was not:
// 122 of 264 controls changed nothing. What a grep cannot see is which rule
// actually WINS on a given element, or that a control was built out of Tailwind
// utilities and matches no rule at all — `a.heat-cell`, the fifty cells of the
// profile's activity strip, or the deck table's row tick boxes, which are bare
// `<input type="checkbox">`.
//
// HOW THE STATE IS FORCED, AND WHY IT MATTERS. The first version of this scan
// moved a real mouse to each control's centre and reported 377 of 541 dead —
// wrong, and wrong in the direction that invents work. Hovering the centre of a
// control that happens to sit under something else lands on the cover, and the
// control reads as unresponsive. This uses the browser's own
// `CSS.forcePseudoState` over CDP: the element is put into :hover by the engine,
// so occlusion, scroll position and z-order cannot affect the answer.
//
// AND AN ELEMENT THAT IS ALREADY MOVING IS INCONCLUSIVE, NOT A PASS.
// `.fluo-edge-beat` pulses its opacity on a 4s loop, so two reads taken a moment
// apart differ by themselves and the probe scored the pointer for it. Every
// element is read twice at rest first; the ones that move on their own are
// counted separately and never counted as covered.
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4188;

/* The routes to walk. EMBED ROUTES, not their hosts, wherever a station has
   one: every station runs in an iframe (7 Sep) and the controls live in the
   framed half, so /tts would hand back the chrome and nothing else. */
const ROUTES = [
  "/home", "/map/embed", "/decks/salutations", "/practice/flip-it/salutations/embed",
  "/sio/SIO-001", "/reviser/embed", "/profil/embed", "/tts/embed", "/tutor/embed",
  "/practice/speculearn/embed", "/practice/grammarathon/salutations/embed",
  "/games/vocabularain", "/conjugaison/embed", "/moi", "/welcome", "/favourites",
];

/* What "answers the pointer" means, measured. Any one of these changing is
   enough — the floor in globals.css uses filter and box-shadow, a link uses its
   underline, a tick box uses its outline, and the designed hovers move
   transform. */
const WATCH = ["transform", "boxShadow", "backgroundColor", "filter", "borderColor",
  "opacity", "color", "translate", "scale", "textDecorationLine", "backgroundImage",
  "borderRadius", "outlineWidth"];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = join(OUT, url);
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = existsSync(join(file, "index.html")) ? join(file, "index.html")
      : existsSync(`${file}.html`) ? `${file}.html` : file;
  } else if (!existsSync(file) && existsSync(`${file}.html`)) {
    file = `${file}.html`;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) { res.statusCode = 404; return res.end("nf"); }
  res.setHeader("content-type", MIME[extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

/* Tag every visible, enabled control and remember what it looks like at rest.
   Capped at 80 a page: the deck table alone can render hundreds of identical
   rows, and the 81st tick box tests nothing the 3rd did not. */
const tagAll = () => {
  const KEEP = (c) => c && !/^(flex|grid|items-|justify-|gap-|p[xytblr]?-|m[xytblr]?-|w-|h-|min-|max-|text-|font-|leading-|tracking-|rounded|border$|absolute|relative|inline|block|shrink|grow|overflow|z-|top-|left-|right-|bottom-|select-|whitespace|truncate|hidden|space-|order-|cursor|transition|duration|aspect|object|self-|place-|content-|basis|col-|row-|sm:|md:|lg:|xl:)/.test(c);
  const els = [...document.querySelectorAll(
    'button, a[href], [role="button"], input[type="checkbox"], input[type="radio"], select, summary, label[for]')];
  const out = [];
  let i = 0;
  for (const e of els) {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    if (r.width < 4 || r.height < 4) continue;
    if (cs.visibility === "hidden" || cs.display === "none" || cs.pointerEvents === "none") continue;
    if (e.disabled) continue;
    const id = `hv${i++}`;
    e.setAttribute("data-hv", id);
    out.push({
      id,
      tag: e.tagName.toLowerCase(),
      cls: (e.className?.toString?.() ?? "").split(/\s+/).filter(KEEP).slice(0, 3).join(" "),
      label: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 26),
    });
    if (i >= 80) break;
  }
  return out;
};

/* THE ELEMENT AND ITS SUBTREE. A hover effect does not have to land on the
   control itself — `.home-map3d-node:hover .home-map3d-cap` lifts the CAP, and
   reading only the node reported the map's stops as dead. What a learner sees
   change is the button plus everything inside it, and its two pseudo-elements. */
const readStyle = ([id, W]) => {
  const e = document.querySelector(`[data-hv="${id}"]`);
  if (!e) return null;
  const one = (n) => { const s = getComputedStyle(n); return W.map((k) => s[k]).join(","); };
  const parts = [one(e)];
  for (const n of e.querySelectorAll("*")) { parts.push(one(n)); if (parts.length > 24) break; }
  for (const ps of ["::before", "::after"]) {
    const s = getComputedStyle(e, ps);
    parts.push(W.map((k) => s[k]).join(",") + s.content);
  }
  return parts.join("|");
};

/* The same launch line sheet-scan.mjs uses, for the same reason: the sandbox
   ships Chromium at a fixed path and PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD stops npm
   from fetching the build playwright-core would otherwise expect, so a bare
   launch() looks for a browser that was never downloaded. CI falls back to the
   runner's own Chrome. */
const exe = process.env.BAND_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");

const dead = new Map();
let total = 0, live = 0, animated = 0;

for (const route of ROUTES) {
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 25000 });
  } catch {
    process.stdout.write(`  hover      ${route}   (did not load — skipped)\n`);
    continue;
  }
  await page.waitForTimeout(800);
  let list = [];
  try { list = await page.evaluate(tagAll); } catch { /* nothing to tag */ }
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  for (const m of list) {
    let nodeId;
    try {
      ({ nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-hv="${m.id}"]` }));
    } catch { continue; }
    if (!nodeId) continue;
    const read = () => page.evaluate(readStyle, [m.id, WATCH]);
    const rest = await read();
    await page.waitForTimeout(130);
    if (rest !== await read()) { animated++; continue; }
    await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] });
    const hovered = await read();
    await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
    if (rest === null || hovered === null) continue;
    total++;
    if (hovered !== rest) { live++; continue; }
    const sig = `${m.tag}.${m.cls || "(no class)"}`;
    if (!dead.has(sig)) dead.set(sig, { count: 0, routes: new Set(), sample: m.label });
    const d = dead.get(sig);
    d.count++;
    d.routes.add(route);
    if (!d.sample && m.label) d.sample = m.label;
  }
  process.stdout.write(`  hover      ${route}   ${list.length} controls\n`);
}

await browser.close();
server.close();

process.stdout.write(`\nhover-scan: ${live} of ${total} controls answer the pointer` +
  `${animated ? ` (${animated} self-animating, inconclusive)` : ""}\n`);

if (total < 150) {
  process.stdout.write("\n  FAIL  the scan found only " + total + " controls to test. It measured 264 " +
    "when it was written; a number this low means the routes stopped rendering their controls " +
    "(a wall build, a route that 404s, a shell that no longer mounts) and a green result here " +
    "would mean nothing.\n");
  process.exit(1);
}
if (dead.size) {
  process.stdout.write(`\n  FAIL  ${total - live} control(s) change NOTHING under the pointer:\n`);
  for (const [sig, d] of [...dead.entries()].sort((a, b) => b[1].count - a[1].count)) {
    process.stdout.write(`        ${String(d.count).padStart(4)}  ${sig}   e.g. "${d.sample}"  ` +
      `[${[...d.routes].slice(0, 2).join(", ")}]\n`);
  }
  process.stdout.write("\n        The floor in globals.css (\"THE HOVER FLOOR\") is written with " +
    ":where(), which carries no specificity, so ANY rule on the control beats it — a Tailwind " +
    "utility setting `filter` or `box-shadow` on the base state will cancel it silently. Give " +
    "that control a hover of its own, the way .heat-cell and .cahier-switch have one.\n");
  process.exit(1);
}
process.stdout.write("  every control answers the pointer.\n");
