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
      //
      // READ IT FROM THE TOUR, NOT FROM THE PAGE. `document.body.innerText`
      // also carries the learner's own progress — Home prints « 0/10 » beside
      // the path — and a bare \d+/\d+ match picked that up instead, reporting
      // the home tour as sitting on step 0 of 10.
      const readCounter = () => page.evaluate(() => {
        const el = [...document.querySelectorAll("div,p,span")]
          .filter((n) => /^\s*\d+\/\d+\s*$/.test(n.textContent || ""))
          .filter((n) => n.closest(".fixed") && !n.querySelector("div,p,span"))
          .pop();
        const m = el?.textContent?.match(/(\d+)\/(\d+)/);
        return m ? { at: +m[1], of: +m[2] } : null;
      });
      const counter = await readCounter();
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
      } else {
        // NO STEP MAY BE SKIPPED, and this is the assertion the earlier one
        // was too weak to make. "Did it open on the last step" only catches a
        // tour where EVERY spotlight is dead. The home tour had two live steps
        // and one dead one, so it passed — while a learner watched the counter
        // go « 1/3 » then « 3/3 » and got two thirds of a tour.
        //
        // A skipped step is FirstTour working as designed (a conditional
        // target that is absent is meant to be stepped over), so the only
        // honest test is to walk the whole thing and see which numbers come
        // up. Dan, 11 Sep: *"the current tour is broken"* — this is what it
        // takes to have the build say that first.
        const seen = [counter.at];
        for (let n = 0; n < counter.of + 2; n += 1) {
          const next = page.getByRole("button", { name: /^(Next|Done|Finish)/i });
          if (!(await next.count())) break;
          await next.first().click();
          await page.waitForTimeout(450);
          const c = await readCounter();
          if (!c) break;
          if (c.at === seen[seen.length - 1]) break;
          seen.push(c.at);
        }
        const want = Array.from({ length: counter.of }, (_, n) => n + 1);
        const missing = want.filter((n) => !seen.includes(n));
        if (missing.length) {
          fail.push(`${r.path}: the "${r.tour}" tour SKIPS step(s) ${missing.join(", ")} of ` +
                    `${counter.of} — it ran ${seen.join(" -> ")}. A step whose selector matches ` +
                    `nothing is stepped over in silence, so the learner is taught ` +
                    `${seen.length} of ${counter.of} things and watches the counter jump. Either ` +
                    `the control moved (check for an /embed) or it is gone — the bottom bar this ` +
                    `tour used to teach was removed on 6 Sep and nothing said so for five days.`);
        }
      }
    }
  } else if (tourOffer) {
    fail.push(`${r.path}: a page tour is being offered here, and this route is listed as having ` +
              `none. If a tour was added, give it a key above so its spotlights are checked too.`);
  }

  await page.close();
}

/**
 * EVERY GUIDED ACTIVITY MUST ACTUALLY FIND ITS FIRST CONTROL.
 *
 * verify212 checks that a step's `data-tour` anchor exists somewhere under
 * src/. That is worth having and it is NOT this: an anchor can exist, spelled
 * correctly, in a real component, and still be unreachable — because it is in
 * a different DOCUMENT from the card that opens the walk. Three activities hit
 * exactly that in one day:
 *
 *     VoixLà      card on /tts                     controls in /tts/embed
 *     the lesson  page tour outside the frame      targets inside it
 *     SpecuLearn  card on /practice/speculearn/…   63 options in its /embed
 *
 * Every one of them passed a static check and lit nothing. The learner's
 * symptom is a step that sits saying "Finding it…" on the single run that was
 * meant to teach the activity — no error, no log, nothing to report.
 *
 * So: open each guided activity cold, press its « Show me », and require the
 * spotlight to land on something. A row must be listed here to be guided at
 * all — adding selectors without a route means this scan never sees it, so the
 * absent entry fails rather than passing quietly.
 */
const GUIDED_ROUTES = {
  flip: "/practice/flip-it/aller-destinations",
  grammarathon: "/practice/grammarathon/aller-destinations",
  wordrill: "/practice/say-it/aller-destinations",
  lesson: "/lessons/deck/aliments",
  conjugaison: "/conjugaison",
  ecoutexte: "/practice/ecoutexte",
};

const hintsSrc = readFileSync(join(process.cwd(), "src/content/hints.ts"), "utf8");
const guidedKeys = [];
for (const [, key, body] of hintsSrc.matchAll(/^ {2}(\w+): \{([\s\S]*?)^ {2}\},/gm)) {
  if (/selector:\s*'/.test(body)) guidedKeys.push(key);
}

for (const key of guidedKeys) {
  const route = GUIDED_ROUTES[key];
  if (!route) {
    fail.push(`hints.ts row "${key}" carries guided steps but names no route in ` +
              `scripts/tour-scan.mjs. Add one: a walk nothing drives is a walk nobody ` +
              `knows is broken — three activities shipped pointing into another document ` +
              `on 11 Sep, and every one passed the static check.`);
    continue;
  }
  const page = await fresh(route);
  // The card and the controls may be in different documents — that is the
  // whole point — so look for the button in every frame, and then watch the
  // frame it was found in.
  let host = null;
  for (const f of page.frames()) {
    try {
      if (await f.getByRole("button", { name: "Show me" }).count()) { host = f; break; }
    } catch {}
  }
  if (!host) {
    fail.push(`${route}: "${key}" is a guided row but no « Show me » button appeared on a ` +
              `cold arrival — the first-run card is not being mounted for this key.`);
    await page.close();
    continue;
  }
  await host.getByRole("button", { name: "Show me" }).click();
  await page.waitForTimeout(1200);
  const state = await host.evaluate(() => {
    const panel = document.querySelector("[data-guided-steps]");
    if (!panel) return { walking: false };
    const ring = panel.querySelector("[aria-hidden]");
    const r = ring?.getBoundingClientRect();
    return {
      walking: true,
      finding: (panel.textContent || "").includes("Finding it"),
      w: r ? Math.round(r.width) : 0,
      h: r ? Math.round(r.height) : 0,
    };
  });
  if (!state.walking) {
    fail.push(`${route}: pressing « Show me » on "${key}" started no walk at all`);
  } else if (state.finding || state.w < 2 || state.h < 2) {
    fail.push(`${route}: "${key}" step 1 found nothing to light — the walk opens on ` +
              `"Finding it…". The anchor exists in src/ (verify212 is green) but not in the ` +
              `document this walk runs in. Check whether the control moved into an /embed.`);
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
console.log(`  ok   ${guidedKeys.length} guided activities open their walk on a real control: ` +
            guidedKeys.join(", "));
console.log(`  ok   ${ROUTES.length} routes: never two prompts at once on a cold arrival`);
console.log(`  ok   every page tour not pinned as broken still lights one of its own targets`);
if (pinned) {
  console.log(`  ok   ${pinned} tour(s) pinned dead above and still dead — listed as notes, ` +
              `awaiting Dan's call on retiring them`);
}
