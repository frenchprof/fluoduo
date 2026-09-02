// jam-scan — walk every lesson's RENDERED DOM for a word butted against the
// next across an inline element edge. This is the browser half verify72's
// docstring promises: the static shape check catches the newline case only,
// and all twelve of the 31 Aug jams were found by driving the page, four of
// them after they had shipped to main (Dan, 1 Sep: "The jam sweep should be
// in CI. It's the only instrument that catches that class").
//
// Run by verify79-jam-scan.py against an OPEN export (NEXT_PUBLIC_OPEN_APP=1
// npm run build) — the wall build renders "Checking your sign-in…" where the
// lesson should be, and a scan of that would pass while guarding nothing.
//
// WHAT COUNTS AS A JAM, and why the rule has three conditions rather than
// one. A junction is flagged when an inline element's LAST letter touches a
// letter immediately after its close tag — but only when the element opens
// at a word boundary and holds at least two characters. The narrowing is
// load-bearing, not caution:
//   parl<b>er</b>        — letter before the open edge: mid-word styling,
//                          which is how every conjugation lesson bolds its
//                          endings. Skipped.
//   la <b>F</b>rance     — one character inside: the deliberate single-letter
//                          highlight. Skipped.
//   <b>n&rsquo;</b>aime  — apostrophe against letter, not letter against
//                          letter. Skipped.
//   <i>des</i>in front   — a whole word butted into the next. FLAGGED.
// The cost, stated plainly: a jam at the OPEN edge of a whole word
// (`word<i>des</i>`) is structurally identical to a bolded stem and is NOT
// flagged. All twelve shipped faults were close-edge; if an open-edge one
// ever ships, this comment is where to start.
//
// Tabs and panes render conditionally (verify67 pins the pane guards), so
// the scan clicks through all four tabs and every Idea pane before judging a
// lesson. <details> folds need no clicks — closed details are still in the
// DOM. The top bar and bottom rail are excluded: the wordmark renders one
// span per letter BY DESIGN (the Kallang wave), and it would light up every
// page.
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const OUT = "out";
const PORT = 4179;
const TABS = ["Path", "Idea", "Forms", "Pract."]; // pinned by verify68
const PANES = ["The idea", "Q&A", "Traps", "Steps", "Check", "Sum up"];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml",
  ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

function resolvePath(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  for (const c of [join(OUT, clean), join(OUT, clean + ".html"), join(OUT, clean, "index.html")]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

const server = createServer((req, res) => {
  const p = resolvePath(req.url);
  if (!p) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(PORT, r));

const slugs = readdirSync(join(OUT, "lessons"))
  .filter(f => f.endsWith(".html")).map(f => f.replace(/\.html$/, "")).sort();
if (slugs.length < 30) {
  console.error(`only ${slugs.length} lesson pages in out/lessons — the export is broken or partial`);
  process.exit(2);
}

// Local dev containers carry a Playwright chromium; CI's ubuntu runner ships
// Google Chrome. Try in that order — JAM_BROWSER overrides both.
const exe = process.env.JAM_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// WALK AS A RETURNING LEARNER, not a brand-new one. From 2026-09-02 every
// activity opens on a first-run instruction (components/FirstRunHint.tsx) that
// covers the page until it is dismissed — correct for a learner, fatal for a
// scan whose whole job is to click every tab and measure the text underneath.
// Setting the flags the popup itself writes is the same state a second visit
// has; clicking « Got it » on each page would be a second, drifting copy of
// that logic. The popup's own behaviour is checked by verify87.
await page.addInitScript(() => {
  try {
    for (const k of ["lesson", "flip", "speculearn", "pretest", "grammarathon", "conjugaison", "ecoutexte", "wordrill"]) {
      window.localStorage.setItem(`fluolingo:hint.${k}`, "1");
    }
  } catch {
    // storage blocked — the scan will simply meet the popup and say so
  }
});

const scan = () => page.evaluate(() => {
  const L = /\p{L}/u;
  const hits = [];
  // The tag list alone lied twice on the first run of this scan: a SPAN
  // styled `block` sits on its own line (the level buttons), and the
  // wordmark's decorative double is positioned out of flow. Only an element
  // that actually RENDERS inline, in flow, can butt against its neighbour.
  const inFlow = el => {
    const s = getComputedStyle(el);
    return s.display.startsWith("inline") && (s.position === "static" || s.position === "relative");
  };
  for (const el of document.querySelectorAll("i,em,b,strong,u,code,abbr,small,span")) {
    if (el.closest('header, nav, [data-jam-ok], [aria-hidden="true"]')) continue;
    if (!inFlow(el)) continue;
    const t = el.textContent ?? "";
    if (t.length < 2 || !L.test(t.at(-1))) continue;
    const edge = n => !n ? null
      : n.nodeType === 3 ? n.textContent
      : n.nodeType === 1 && inFlow(n) && n.getAttribute("aria-hidden") !== "true" ? n.textContent
      : null;
    const after = edge(el.nextSibling), before = edge(el.previousSibling);
    if (!after || !L.test(after[0] ?? "")) continue;           // close edge not jammed
    if (before !== null && before !== "" && L.test(before.at(-1))) continue; // mid-word styling
    hits.push(`…${(before ?? "").slice(-16)}[${t.slice(0, 30)}]${after.slice(0, 24)}…`);
  }
  return hits;
});

const faults = new Map(); // slug -> Set of junction strings
let pages = 0;
for (const slug of slugs) {
  await page.goto(`http://localhost:${PORT}/lessons/${slug}`, { waitUntil: "networkidle" });
  // WAIT for the strip, don't glance at it. The first CI run of this scan on
  // main died here: `aimer` (alphabetically first, so the cold page) had not
  // hydrated when an instant count() looked, and the scan called an open
  // build a wall build. networkidle is when the network went quiet, not when
  // React finished.
  const strip = page.getByRole("tab", { name: "Pract." });
  try {
    await strip.first().waitFor({ timeout: 20000 });
  } catch {
    const walled = await page.getByText("Checking your sign-in").count();
    console.error(walled
      ? `${slug}: the sign-in wall rendered — this is NOT an open build. Rebuild: NEXT_PUBLIC_OPEN_APP=1 npm run build`
      : `${slug}: no tab strip after 20s — the lesson page did not hydrate`);
    process.exit(2);
  }
  pages++;
  const record = h => {
    if (!h.length) return; // an empty entry here once made 52 clean pages report as jammed
    if (!faults.has(slug)) faults.set(slug, new Set());
    h.forEach(x => faults.get(slug).add(x));
  };
  record(await scan());
  for (const tab of TABS) {
    await page.getByRole("tab", { name: tab }).first().click();
    await page.waitForTimeout(60);
    record(await scan());
    if (tab !== "Idea") continue;
    // Pane names are not exact: a pane button may carry its count ("Traps 3").
    for (const pane of PANES) {
      const b = page.getByRole("button", { name: pane });
      if (await b.count()) {
        await b.first().click();
        await page.waitForTimeout(60);
        record(await scan());
      }
    }
  }
}

await browser.close();
server.close();

if (faults.size) {
  console.error(`JAMMED — ${[...faults.values()].reduce((n, s) => n + s.size, 0)} junction(s) on ${faults.size} page(s):`);
  for (const [slug, set] of faults) for (const h of set) console.error(`  ${slug}: ${h}`);
  console.error('The fix is {" "} at the element edge; a deliberate junction takes data-jam-ok on the element.');
  process.exit(1);
}
console.log(`jam-scan: ${pages} lesson pages, every tab and pane — no word butts against the next`);
