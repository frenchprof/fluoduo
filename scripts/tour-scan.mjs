/**
 * Drive every surviving page tour, and every route that offers help on arrival.
 *
 * TWO QUESTIONS, BOTH OF WHICH ONLY THE RUNNING PAGE CAN ANSWER.
 *
 * 1. DOES THE TOUR STILL POINT AT ANYTHING? FirstTour measures with
 *    `document.querySelectorAll` and SKIPS a step whose target it cannot find.
 *    That skip is the right behaviour for a step that is merely conditional,
 *    and it is also why three tours in this file rotted for weeks without a
 *    single error: when a surface moves, the tour does not follow it, it goes
 *    quiet. The lesson tour was the third — on 7 Sep the lesson moved into a
 *    frame, and from then on « Quick tour! » opened on its LAST step with both
 *    spotlights skipped. A source check cannot see this: the selectors are
 *    still there, still spelled correctly, and still name real markup. They
 *    just name it in another document.
 *
 * 2. IS MORE THAN ONE THING OFFERING HELP AT ONCE? Dan, 11 Sep, looking at
 *    MneMemo: two prompts arrived together — the activity's own instruction
 *    card and the page tour's « ✨ First time here? ». They are drawn by
 *    different components, mounted by different shells, in different documents,
 *    so nothing in the source puts them near each other.
 *
 * THE EXPORT MUST BE OPEN, for the reason verify79 states — a signed-out build
 * shows the auth wall instead of the activity, and every assertion below would
 * pass by finding nothing.
 *
 * Run from the repo root, after NEXT_PUBLIC_OPEN_APP=1 npm run build.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(process.cwd(), "out");
const PORT = 4733;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".txt": "text/plain", ".mp3": "audio/mpeg",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon" };

function resolveFile(url) {
  const p = decodeURIComponent(url.split("?")[0]);
  let f = join(ROOT, p);
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

const exe = process.env.ROAD_BROWSER
  ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } });

const fail = [];
const note = [];

/** Every route a learner can arrive at cold and be offered something. The
 *  lesson route is here because it is the one that went wrong; the others are
 *  here so the next one to go wrong is not found by a person. */
/**
 * `broken` PINS A TOUR THAT IS KNOWN TO BE DEAD AND NOT YET DAN'S TO BURY.
 *
 * Retiring a tour takes the ✨ chip off that page with it, and that is a call
 * for Dan rather than a tidy-up. Two tours were found dead on 11 Sep by this
 * scan's first run, both for the frame reason above, and both are listed here
 * with what was measured. The state is pinned in BOTH directions: a pinned
 * tour that starts working also fails, so the day one is fixed the exemption
 * is removed in the same patch instead of quietly outliving the problem.
 */
const ROUTES = [
  { path: "/home", tour: "home" },
  { path: "/lessons/deck/aliments", tour: null },
  {
    path: "/map",
    tour: "map",
    broken: "BOTH targets moved into /map/embed on 7 Sep — measured outer=0, inner=1 for "
      + "[data-tour=\"map-view\"] and [data-tour=\"map\"]. Awaiting Dan: retiring it takes the "
      + "✨ chip off the map with it.",
  },
  {
    path: "/unit/1",
    tour: "map",
    broken: "/unit/N forwards to /map?unit=1, so usePathname() reads \"/map\" and the UNIT tour "
      + "can never be reached at all — the map's is served instead, and that one is dead for "
      + "the reason above. Measured: the unit tour's own first target is 0 in every document.",
  },
];

async function fresh(path) {
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  return page;
}

/** Text anywhere on the page OR in any frame of it — the whole point is that
 *  two prompts can live in two documents and still share a screen. */
async function textEverywhere(page) {
  const parts = [];
  for (const f of page.frames()) {
    try { parts.push(await f.evaluate(() => document.body.innerText)); } catch {}
  }
  return parts.join("\n");
}

for (const r of ROUTES) {
  const page = await fresh(r.path);
  const all = await textEverywhere(page);

  // ── one prompt at a time ────────────────────────────────────────────────
  const tourOffer = all.includes("First time here");
  // The activity first-run card always carries this checkbox (FirstRunHint).
  const activityCard = all.includes("Do not show me again");
  if (tourOffer && activityCard) {
    fail.push(`${r.path}: TWO prompts on arrival — the page tour's "✨ First time here?" AND ` +
              `an activity's own instruction card. A learner meeting a screen for the first ` +
              `time is asked twice, by two systems, which is what Dan reported on MneMemo.`);
  }

  // ── the tour still points at something ──────────────────────────────────
  if (r.tour) {
    if (!tourOffer) {
      fail.push(`${r.path}: expected the "${r.tour}" page tour to be offered on a cold ` +
                `arrival and it was not. Either tourFor stopped matching this path or the ` +
                `offer is being suppressed — both silently remove the tour.`);
    } else {
      await page.getByRole("button", { name: "Quick tour!" }).click();
      await page.waitForTimeout(700);
      // The step counter FirstTour prints ("1/3"). Landing on the last step
      // immediately means every spotlight before it skipped.
      const counter = await page.evaluate(() => {
        const m = document.body.innerText.match(/\b(\d+)\/(\d+)\b/);
        return m ? { at: +m[1], of: +m[2] } : null;
      });
      const litSomething = await page.evaluate(() =>
        !!document.querySelector('[data-tour], nav.cahier-bottombar, a[title^="Continue"]'));
      const dead = !counter
        || (counter.of > 1 && counter.at === counter.of)
        || !litSomething;
      const where = counter ? `${counter.at}/${counter.of}` : "no step counter";

      if (dead && !r.broken) {
        fail.push(`${r.path}: the "${r.tour}" tour opened on ${where} — its last step. Every ` +
                  `spotlight before it skipped, so the tour is a sentence in a box. This is what ` +
                  `a tour looks like after the screen it teaches moves into a frame: the ` +
                  `selectors are still correct, just in another document.`);
      } else if (dead) {
        note.push(`${r.path}: "${r.tour}" opens on ${where} — still dead, as pinned. ${r.broken}`);
      } else if (r.broken) {
        fail.push(`${r.path}: the "${r.tour}" tour WORKS now (opened on ${where}), but it is still ` +
                  `pinned as broken in scripts/tour-scan.mjs. Remove the \`broken\` note in the ` +
                  `same patch that fixed it — an exemption that outlives its problem is how the ` +
                  `next dead tour gets waved through.`);
      }
    }
  } else if (tourOffer) {
    fail.push(`${r.path}: a page tour is being offered here, and this route is listed as having ` +
              `none. If a tour was added, give it a key above so its spotlights are checked too.`);
  }

  await page.close();
}

await browser.close();
server.close();

for (const n of note) console.log(`  note ${n}`);
for (const m of fail) console.log(`  FAIL ${m}\n`);
if (fail.length) {
  console.log(`${fail.length} failed`);
  process.exit(1);
}
const pinned = ROUTES.filter((r) => r.broken).length;
console.log(`  ok   ${ROUTES.length} routes: never two prompts at once on a cold arrival`);
console.log(`  ok   every page tour not pinned as broken still lights one of its own targets`);
if (pinned) {
  console.log(`  ok   ${pinned} tour(s) pinned dead above and still dead — listed as notes, ` +
              `awaiting Dan's call on retiring them`);
}
