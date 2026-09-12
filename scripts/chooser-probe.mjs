/* chooser-probe — ask the app's OWN functions what the stop chooser offers.
 *
 * WHY THIS EXISTS. `verify200-chooser-no-dead-stops.py` has to walk every
 * activity x every stop the pop-up offers, and it must do it with the SAME
 * functions the pop-up calls — a Python re-implementation of six activities'
 * readiness rules is precisely the "second opinion" that
 * `lib/collections/gapSentence.ts` was written to stop.
 *
 * It used to get that by writing a throwaway page into src/app and running
 * `npm run build` to render it. That worked and was honest about its cost —
 * "roughly a minute in CI", said its own docstring — but it meant the app was
 * compiled THREE times a run: the closed build, the open rebuild, and this.
 * Measured on run #755: 54s + 56s + 55s of a 7m33s run.
 *
 * Nothing here needs a build. `playableStops`, `stopHref` and the six item
 * functions are plain TypeScript over plain data — no React, no request, no
 * browser. `jiti` loads TypeScript directly, so the same functions answer the
 * same question in about two seconds instead of fifty-five.
 *
 * THE SOURCE OF TRUTH IS UNCHANGED, WHICH IS THE WHOLE POINT: these are the
 * same modules by the same paths. What went away is the compiler in between.
 * verify200 proves it by comparing this output against the build-rendered
 * answer it replaces — see that file's header.
 *
 * Prints one JSON object on stdout: { [activityKey]: [{stop, href, items}] }.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createJiti } from "jiti";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// `@/…` is the tsconfig path alias; jiti does not read tsconfig, so say it here.
const jiti = createJiti(import.meta.url, { alias: { "@": join(ROOT, "src") } });
// THE SPECIFIERS ARE THE PAGE'S OWN, character for character. Not a convenience:
// `@/content/sios` is a directory with an index, `@/games/compose/banks` is a
// .tsx, and spelling either as a file path by hand is how this stops being the
// same import the app makes.
const { playableStops, stopHref } = await jiti.import("@/lib/activityStops");
const { SIOS } = await jiti.import("@/content/sios");
const { CURATED } = await jiti.import("@/content/collections");
const { gappedItems } = await jiti.import("@/lib/collections/gramMarathonReady");
const { lexReadyItems } = await jiti.import("@/lib/collections/lexReady");
const { letrisSlugForDeck, getLetrisSet } = await jiti.import("@/games/letris/sets");
const { composeBanksForDeck } = await jiti.import("@/games/compose/banks");

const KEYS = ["flip", "grammarathon", "wordrill", "lexicalator", "vocabularain", "compose"];

/** HOW MANY THINGS WOULD THE GAME ACTUALLY HAVE TO PLAY at this stop, counted
 *  with the activity's OWN item function — deliberately a different function
 *  from the gate, so a check built on this catches a gate that has been removed
 *  or loosened. "The page exists" cannot catch that: GramMarathon and
 *  LexicaLocker export a page for all fifty and open empty. */
function playableItems(key, stop) {
  const deck = SIOS[stop - 1]?.collectionId ?? "";
  const c = CURATED.find((x) => x.id === deck);
  if (key === "grammarathon") return c ? gappedItems(c).length : 0;
  if (key === "lexicalator") return c ? lexReadyItems(c).length : 0;
  if (key === "flip" || key === "wordrill") return c ? c.items.length : 0;
  if (key === "vocabularain") {
    const slug = letrisSlugForDeck(deck);
    return slug ? (getLetrisSet(slug)?.tiles.length ?? 0) : 0;
  }
  if (key === "compose") return composeBanksForDeck(deck).length;
  return 0;
}

const out = {};
for (const k of KEYS) {
  out[k] = playableStops(k).map((n) => ({ stop: n, href: stopHref(k, n), items: playableItems(k, n) }));
}
process.stdout.write(JSON.stringify(out));
