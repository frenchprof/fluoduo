#!/usr/bin/env node
/**
 * Record the /hidden/cycling-reveal playground to a video file.
 *
 *   npm run dev                     # in one terminal
 *   npm run record:cycling-reveal   # in another
 *
 * Writes docs/assets/cycling-reveal.webm (and a .png of the finished frame).
 * The asset is deliberately NOT in public/ — public/ is copied into the static
 * export, so a five-megabyte demo recording would be downloaded by learners who
 * will never see it.
 *
 * Playwright is not a dependency of this app; it is a tool you run by hand:
 *
 *   npm i -g playwright && npx playwright install chromium
 *
 * NOTE: the playground can also export a GIF of ONE preset by itself, with no
 * tooling at all — the Download GIF button, which films the live DOM and
 * encodes in the browser (src/lib/domFilm.ts, src/lib/gif.ts). This script is
 * for the other picture: the whole page, every preset at once, for the docs.
 *
 * For a GIF of the whole page, convert the webm with a real ffmpeg (the one
 * Playwright bundles is a stripped build with no gif muxer and no scale
 * filter):
 *
 *   ffmpeg -i docs/assets/cycling-reveal.webm \
 *     -vf "fps=8,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48[p];[b][p]paletteuse" \
 *     docs/assets/cycling-reveal.gif
 *
 * Flags: --url (default http://localhost:3000), --seconds, --width, --height.
 */
import { mkdirSync, rmSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

const URL_ = arg("url", "http://localhost:3000");
const SECONDS = Number(arg("seconds", 18));
const WIDTH = Number(arg("width", 900));
const HEIGHT = Number(arg("height", 1245));
const OUT = "docs/assets";
const TMP = join(OUT, ".record");

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  console.error(
    "playwright is not installed. It is a hand-run tool, not an app dependency:\n" +
      "  npm i -g playwright && npx playwright install chromium",
  );
  process.exit(2);
}

const res = await fetch(`${URL_}/hidden/cycling-reveal`).catch(() => null);
if (!res || !res.ok) {
  console.error(`nothing serving ${URL_} — start it with \`npm run dev\` first`);
  process.exit(2);
}

mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: { dir: TMP, size: { width: WIDTH, height: HEIGHT } },
});
const page = await ctx.newPage();
await page.goto(`${URL_}/hidden/cycling-reveal`, { waitUntil: "networkidle" });

// The recording is of the COMPONENT, so the app's own furniture goes: the
// footer, the fixed overlays the root layout mounts (feedback button, beta
// notice, install prompt, accent bar) and the playground's own heading and
// loop toggle. One CSS rule rather than a sweep of the DOM — several of those
// overlays mount well after hydration, and a rule cannot be outrun the way a
// one-shot querySelectorAll can.
await page.addStyleTag({
  content:
    "body > *:not(main){display:none!important}" +
    "[data-demo-chrome]{display:none!important}" +
    "main{padding-top:8px!important}",
});

// Every stage from the top together, so the clip is one clean pass rather than
// four presets caught at four unrelated moments.
const click = (label) =>
  page.evaluate((l) => {
    document.querySelectorAll("button").forEach((b) => b.textContent === l && b.click());
  }, label);
await click("Reset");
await page.waitForTimeout(400);
await click("Replay");
await page.waitForTimeout(SECONDS * 1000);
await page.screenshot({ path: join(OUT, "cycling-reveal.png"), fullPage: true });
await ctx.close();
await browser.close();

const [clip] = readdirSync(TMP).filter((f) => f.endsWith(".webm"));
renameSync(join(TMP, clip), join(OUT, "cycling-reveal.webm"));
rmSync(TMP, { recursive: true, force: true });
console.log(`wrote ${OUT}/cycling-reveal.webm and ${OUT}/cycling-reveal.png`);
