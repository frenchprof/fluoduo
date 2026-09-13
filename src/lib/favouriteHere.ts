/**
 * WHAT PAGE AM I ON — the naming half of Favourites.
 *
 * Dan starred everything (*"i can't think of anything that should not be able
 * to star"*), which is the easy half. The hard half is that a list of rows all
 * reading "FluOLinGo" is a list nobody uses, and he took the option that spells
 * out where a row sits: « WorDrill · goal 22 », not « WorDrill ».
 *
 * FOUR SOURCES, IN ORDER, and the order is the whole design:
 *
 *   0  THE SHELL'S OWN `active` KEY.  `CahierShell` is already told which page
 *      this is, and passes it to `SiteTopBar`, which is where the ★ lives — so
 *      the star can ASK rather than guess. Found by driving the built app:
 *      guessing from the path named `/practice/say-it/aimer-activites`
 *      « FluOLinGo », because WorDrill's registry href is `/practice/wordrill`
 *      while its deck route is `/practice/say-it/…`. The route and the door
 *      are different strings for the same activity, and no amount of prefix
 *      matching fixes that — the key does.
 *   1  THE REGISTRY BY PATH.  `ACTIVITIES` holds the one name and the one
 *      emoji for every activity (« VoixLà » 📣, « ComposeIt » 🧩). Longest
 *      matching href wins, the same rule `activityLedger`'s PREFIX_TO_KEY
 *      uses — `/practice/say-it/aimer-activites` must resolve to Say It and
 *      not to `/practice`.
 *   2  THE SPINE.  If what follows is a deck a stop owns, the row can say
 *      which stop: `SIOS` maps a `collectionId` to a number, so
 *      `/practice/say-it/aimer-activites` becomes « goal 4 ». A stop id in
 *      the path (`/sio/SIO-022`) resolves the same way.
 *   3  THE PAGE'S OWN TITLE.  Anything unregistered — the Guide, a custom
 *      deck, a page built after this file — falls back to `document.title`
 *      with the site suffix trimmed. It is never left blank and never
 *      invents a name.
 *
 * WHY `where` MAY BE NULL AND IS NOT FAKED. The map, the Guide and Settings
 * belong to no stop. Printing « goal 22 » on them because 22 happens to be
 * where the learner is would be a label that lies the moment they move on.
 */

import { ACTIVITIES, activity } from "@/content/activities";
import { LESSONS } from "@/content/lessons";
import { SIOS } from "@/content/sios";
import { stopForDeck } from "@/lib/stopTag";

/** The root layout's title. A page that sets none inherits it, and a row
 *  wearing it names the site rather than the page. */
const SITE_NAME = "FluOLinGo";

export type HereEntry = {
  href: string;
  auto: string;
  emoji: string;
  where: string | null;
};

/** Query strings and hashes are dropped: `/profil?tab=board` and
 *  `/profil?tab=settings` are one page as far as a learner's star is
 *  concerned, and keeping them apart would fill the list with near-duplicates.
 *  The ONE exception is the User page's own tabs, which really are four
 *  different screens — so `tab` alone survives. */
export function canonicalHref(pathname: string, search: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  const tab = new URLSearchParams(search).get("tab");
  return tab ? `${path}?tab=${tab}` : path;
}

/** The registry entry whose href is the longest prefix of this path. */
function activityForPath(path: string) {
  let best: (typeof ACTIVITIES)[number] | undefined;
  for (const a of ACTIVITIES) {
    const href = a.href;
    if (typeof href !== "string" || href === "/") continue;
    if (path === href || path.startsWith(href.endsWith("/") ? href : `${href}/`)) {
      if (!best || String(best.href).length < href.length) best = a;
    }
  }
  return best;
}

/** « goal 22 », or null when this page belongs to no stop. */
export function whereFor(path: string): string | null {
  const segs = path.split("/").filter(Boolean);
  for (const seg of [...segs].reverse()) {
    const byId = SIOS.find((s) => s.id === seg);
    if (byId) return `goal ${byId.num}`;
    // THE DECK -> STOP LOOKUP LIVES IN ONE PLACE (`lib/stopTag.ts`), and
    // verify82 fails a second copy of it. This file wrote its own and was
    // caught by that check on the first full run — which is the check working:
    // two copies of one question is how they start disagreeing.
    const byDeck = stopForDeck(seg);
    if (byDeck) return `goal ${byDeck.num}`;
  }
  // `/unit/3` names a place rather than a stop — say so rather than nothing.
  const u = segs[0] === "unit" ? Number(segs[1]) : NaN;
  return Number.isInteger(u) ? `unit ${u}` : null;
}

/**
 * Resolve the page a learner is looking at. `title` is the caller's
 * `document.title` — passed in rather than read here so this function stays
 * pure and testable, which is what lets a check run it in node.
 */
export function describeHere(
  pathname: string,
  search: string,
  title: string,
  activeKey?: string,
): HereEntry {
  const href = canonicalHref(pathname, search);
  const path = href.split("?")[0];
  const where = whereFor(path);

  // A LESSON IS CALLED WHAT IT CALLS ITSELF. Dan, shown what the rows would
  // otherwise say: *"what should they be called then?"* — and the answer was
  // already in the repo. All 59 rows of `LESSONS` carry a real French title
  // (« Comment ça s'écrit ? », « Moi aussi, moi non plus »), and nothing was
  // reading them here, so a starred lesson fell all the way through to the
  // registry's prefix match and came out « MneMemo » — the same name for every
  // lesson in the course — or, before that, « FluOLinGo ».
  //
  // THIS RUNS BEFORE THE KEY, and that is the whole point. `activeKey` is the
  // ACTIVITY (« MneMemo », the reader), which is right for a deck route and
  // wrong here: fifty lessons share one reader, so the activity cannot tell
  // two of them apart. The lesson's own title can.
  const lesson = path.startsWith("/lessons/") ? LESSONS[path.split("/")[2]] : undefined;
  if (lesson) return { href, auto: lesson.title, emoji: "📖", where };

  const byKey = activeKey ? activity(activeKey) : undefined;
  if (byKey) return { href, auto: byKey.name, emoji: byKey.emoji, where };

  const a = activityForPath(path);
  if (a) return { href, auto: a.name, emoji: a.emoji, where };

  // Home is the one path every unmatched page would otherwise swallow, so it
  // is named here rather than left to the title.
  if (path === "/" || path === "/home") return { href, auto: "Home", emoji: "🏠", where: null };

  // THE TITLE IS A TRAIL, NOT A NAME. `/map` announces itself as
  // « Map of FluOLinGo-land — FluOLinGo · FluOLinGo » — the page, then the
  // site, then the site again. A learner wants the first part. Everything
  // from the first dash on is the trail, so it goes.
  const clean = title.split(/\s[—–]\s/)[0].replace(/\s*·.*$/, "").trim();

  // ...AND SOMETIMES THE TRAIL IS ALL THERE IS. Found by starring nine real
  // pages and looking at the list: every one of the ~50 `/lessons/*` routes
  // and `/guide` set no title of their own, so they inherit the root layout's
  // and the row reads « FluOLinGo ». Star five lessons and you get five
  // identical rows — precisely the list-nobody-uses this file exists to
  // prevent, and invisible until the page has something in it.
  //
  // The ADDRESS is the honest fallback: it is the page's own name, not an
  // invention, and it is never the site's. « /lessons/atelier-avis-resto »
  // reads « Atelier avis resto ».
  if (!clean || clean === SITE_NAME) {
    const last = path.split("/").filter(Boolean).pop();
    const fromPath = last
      ? last.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase())
      : "";
    return { href, auto: fromPath || path, emoji: "📄", where };
  }

  return { href, auto: clean, emoji: "📄", where };
}
