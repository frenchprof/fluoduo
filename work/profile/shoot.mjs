/**
 * Screenshot harness for the profile page (patch 30).
 *
 * Seeds a learner into localStorage — progress (done outcomes, SRS debts,
 * economy, a pinned goal) and the device activity ledger (per-outcome
 * right/wrong, which is what the signed-out accuracy picture reads) — then
 * shoots the page at the two widths the design was drawn at.
 *
 * Playwright is NOT a project dependency — the harnesses here are ad-hoc, the
 * way work/patch23 and work/patch24 were, and the app should not carry a
 * browser driver in its lockfile for a screenshot. Install it for the run:
 *
 *   npm run build
 *   python3 -m http.server 8099 --directory out &
 *   npm i --no-save playwright
 *   node work/profile/shoot.mjs
 *
 * PLAYWRIGHT_CHROMIUM=/path/to/chrome overrides the browser when the sandbox
 * ships a build whose number does not match playwright's pin.
 * The .png output is deliberately not committed — re-run to regenerate.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:8099";
const OUT = "work/profile";

// A believable week-6 learner: 28 outcomes done, strong early units, the
// partitives/frequency/time cluster falling over, a few intervals elapsed.
const ACC = {
  "SIO-001": [23, 2], "SIO-002": [21, 3], "SIO-003": [24, 1], "SIO-004": [19, 4],
  "SIO-005": [18, 5], "SIO-006": [22, 2], "SIO-007": [17, 7], "SIO-008": [20, 3],
  "SIO-009": [25, 1], "SIO-010": [18, 5], "SIO-011": [19, 4], "SIO-012": [16, 5],
  "SIO-013": [21, 3], "SIO-014": [15, 5], "SIO-015": [13, 6], "SIO-016": [14, 5],
  "SIO-017": [12, 6], "SIO-018": [17, 4], "SIO-019": [16, 5], "SIO-020": [11, 6],
  "SIO-021": [13, 6], "SIO-022": [12, 6], "SIO-023": [15, 4], "SIO-024": [11, 6],
  "SIO-025": [14, 5], "SIO-026": [10, 6], "SIO-027": [9, 8], "SIO-028": [10, 7],
  "SIO-029": [12, 6], "SIO-031": [10, 5], "SIO-032": [9, 5], "SIO-033": [11, 4],
  "SIO-034": [8, 6], "SIO-035": [11, 4], "SIO-036": [7, 6],
  "SIO-042": [7, 10], "SIO-043": [8, 9],
};

// `seed` is serialized into the page, so it closes over nothing — every
// constant it needs has to live inside it.
const seed = (accMap) => {
  const DAY = 86_400_000;
  const now = Date.now();
  const done = Object.keys(accMap).slice(0, 28);
  const itemSrs = {};
  // REAL deck item ids, so `outcomeForItem` resolves them and DUE is not
  // fiction — the first seed used invented ids, every one of which folded into
  // "unmapped" and silently produced a two-tile queue.
  const due = [
    "partitifs-01", "partitifs-04", "partitifs-07",   // SIO-042
    "quand-time-02", "quand-time-05",                  // SIO-027
    "avoir-etats-03",                                  // SIO-019
    "frequence-01", "frequence-06",                    // SIO-043
  ];
  for (const [i, item] of due.entries()) {
    itemSrs[item] = { due: now - (i + 1) * DAY, intervalDays: i % 3 === 0 ? 0 : 1 };
  }
  localStorage.setItem("fluolingo:progress", JSON.stringify({
    doneSios: done,
    gems: 45, xp: 12480, streak: 6,
    lastActiveDay: new Date(now).toISOString().slice(0, 10),
    itemSrs,
    badges: ["premier-pas", "en-route", "a-mi-chemin", "assidu-3", "en-feu", "collectionneur", "niveau-5"],
    cosmetics: { owned: ["accent-teal"], equipped: { homeAccent: "accent-teal" } },
    term: "AY2627S1",
    goal: { sio: "SIO-050", by: "2026-11-08" },
  }));
  const ledger = { "practice/flip-it": {} };
  for (const [sio, [r, w]] of Object.entries(accMap)) ledger["practice/flip-it"][sio] = { right: r, wrong: w };
  localStorage.setItem("fluolingo:activityLedger", JSON.stringify(ledger));
};

// The sandbox ships its own chromium; PLAYWRIGHT_CHROMIUM is the escape hatch
// when its build number does not match the installed playwright's pin.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
);
for (const [name, width, height] of [["phone", 390, 1400], ["wide", 1100, 1200]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/moi.html`, { waitUntil: "networkidle" });
  await page.evaluate(seed, ACC);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-redrills.png`, fullPage: true });

  // Each row open in turn — the accordion is the page, so a shut-only shot
  // proves nothing about the four sections underneath.
  for (const label of ["SKILLS", "FRILLS", "ILLS", "THRILLS"]) {
    await page.getByRole("button", { name: new RegExp(`^${label}`) }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-${label.toLowerCase()}.png`, fullPage: true });
  }
  await ctx.close();
  console.log(`shot ${name}`);
}
await browser.close();
