/**
 * THE SWIPE RAIL — Dan's chain, written down once.
 *
 * Dan, 2026-09-06, after being shown what every page actually did with a
 * sideways drag: *"Every thing needs to be related somehow - which is why i am
 * asking to draw me a 'map' of which page goes where on the swiping map"*, and
 * then the chain itself:
 *
 *   Map --> jump to one of the SIO > SpecuLearn > MneMemo > MémoiRecall >
 *   Skills (ConjugaZone · ÉcouTexte · WorDrill · VoixLà · ComposeIt · ChaTutor)
 *   > Games [NumBus + NumBourse inside) · VocabulaRain · LexicaLater]
 *
 * — with 👤 User (Leaderboard · Profile) struck off it the next day: *"LEADER-
 * BOARD AND PROFILE SHOULD NOT BE INSIDE THIS CHAIN TAKE THEM OUT"*. Every
 * station on the rail is work on a goal; where you stand against the class is
 * not. The chain ends at Games.
 *
 * and the next day, closing it: *"it's a mental map, not a map to be published.
 * we just need the swipes to go the right way."* So there is no drawing in the
 * app. There is this list, and every page reads its neighbours from it.
 *
 * COLUMNS AND ROWS, which is how Dan asked for it to be conceived. A COLUMN is
 * a station on the chain below and you move between columns SIDEWAYS. A ROW is
 * one item inside a station — one goal, one question, one card — and you move
 * between rows by scrolling DOWN. That is why the vertical direction is never
 * navigation: down is the next item here, sideways is the next kind of work.
 *
 * DIRECTION. Rightwards drags the page to the right and reveals what is to its
 * LEFT, so rightwards is BACK — the same rule the lesson tabs have always had,
 * and the one a phone's own edge-swipe teaches. Leftwards is forward.
 *
 * BOTH ENDS STOP. Swiping right on the map, or left on Games, does nothing.
 * Dan has not ruled on wrapping and stopping is the reversible choice: a rail
 * that stops can be made to wrap later without anyone having learnt a wrong
 * habit, while a rail that silently teleports from the last station back to the
 * map teaches one.
 *
 * WHY EVERY STATION IS NOT DECK-SCOPED. The first five columns belong to a
 * goal — you guess THIS deck, read THIS lesson, flip THESE cards. From Skills
 * rightwards the activity is not about one goal (ChaTutor, VocabulaRain), so
 * those two columns are hubs of their own. The deck is still remembered while you
 * are away, so swiping back right from ConjugaZone returns to the flashcards
 * of the goal you left, not to a picker.
 */
import { SIOS } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";
import { isSpecuLearnReady } from "@/lib/collections/speculearnReady";
import { pretestHrefForDeck } from "@/lib/pretests/routes";
import { speculearnHrefForDeck } from "@/lib/speculearn/route";
// The deck -> stop lookup lives in ONE place (verify82). A second hand-written
// `SIOS.find(s => s.collectionId === …)` is how two copies start disagreeing.
import { stopForDeck, stopForPretestId } from "@/lib/stopTag";

export type RailStation = {
  /** Registry key where there is one, so a page can name its station without
   *  the pathname (`active` / `activity` are already threaded everywhere). */
  key: string;
  /** What a learner would call it — used for the direction hints, not chrome. */
  name: string;
  /** Where this station lives for a given goal deck (null = no goal known). */
  href: (deck: string | null) => string;
  /** Is this pathname at this station? Ordered — first match wins. */
  at: (path: string) => boolean;
  /** A station with MANY destinations is a hub, and this is its address.
   *  Dan, 2026-09-07: *"when there are multiple destinations on the right, we
   *  need the hub page, but when we return from one of those back to the left,
   *  it returns to the hub page. Hub pages are Skills and Games."* So the six
   *  skills are not six columns — they are one, and standing on any of them,
   *  BACK is the hub rather than the skill next door. */
  hub?: string;
  /** Has this station anything for this goal? A station that has not is
   *  SKIPPED rather than landed on: swiping left off a goal whose deck has no
   *  SpecuLearn should reach its lesson, not a picker asking the learner to
   *  choose the deck they are already working on. Default: always. */
  has?: (deck: string | null) => boolean;
};

/** MneMemo is a lesson where one exists and the deck itself where it does not
 *  — the same fallback `SioScroller.forwardHref` has always used. */
function lessonHref(deck: string | null): string {
  if (!deck) return "/practice";
  return lessonsForDeck(deck)[0] ? `/lessons/deck/${deck}` : `/decks/${deck}`;
}

export const RAIL: RailStation[] = [
  {
    key: "map",
    name: "Map",
    href: () => "/map",
    // /carte and /unit/N are the same level of the course — the map by
    // another door — so a swipe out of a unit page goes forward, not into a
    // sibling of the map nobody thinks of as a separate place.
    at: (p) => p === "/map" || p === "/carte" || p.startsWith("/unit/"),
  },
  {
    key: "goals",
    name: "Goal",
    // With no goal in hand, the first one — the scroller then carries the
    // learner anywhere in the fifty. Returning "/map" here made the map's own
    // forward swipe a no-op, which read as the rail being broken.
    href: (deck) => `/sio/${stopForDeck(deck)?.id ?? SIOS[0].id}`,
    at: (p) => p.startsWith("/sio/"),
  },
  {
    key: "speculearn",
    // SpecuLearn is ONE column with two engines behind it: the game, on the
    // nine decks that have one, and the pre-test, on the stops that have one.
    // Dan settled the merger on 2026-08-10 and moved the pre-tests' URL under
    // it on 2026-09-07; treating them as one station is the same ruling. A
    // goal with neither is stepped over rather than landed on — swiping left
    // off it should reach its lesson, not a picker asking which deck you want
    // when you are already in one.
    name: "SpecuLearn",
    // ONE ADDRESS SINCE THE MERGE (Dan, 2026-09-07: *"they CAN be and MUST NOW
    // BE MERGED AS ONE!"*). This used to try the deck run first and fall back
    // to the pre-test, which is how the rail sent a learner to one of a goal's
    // two lightbulbs while the goal card sent them to the other.
    href: (deck) => speculearnHrefForDeck(deck) ?? "/practice/speculearn",
    at: (p) => p.startsWith("/practice/speculearn") || p.startsWith("/pretests/"),
    has: (deck) => !deck || isSpecuLearnReady(deck) || !!pretestHrefForDeck(deck),
  },
  {
    key: "lesson",
    name: "MneMemo",
    href: lessonHref,
    at: (p) => p.startsWith("/lessons/") || p.startsWith("/decks/"),
  },
  {
    key: "flip",
    name: "MémoiRecall",
    href: (deck) => (deck ? `/practice/flip-it/${deck}` : "/practice/flip-it"),
    at: (p) => p.startsWith("/practice/flip-it"),
  },
  {
    key: "skills",
    name: "Skills",
    // ONE COLUMN, SIX DOORS. ConjugaZone · ÉcouTexte · WorDrill · VoixLà ·
    // ComposeIt · ChaTutor were six columns for a day, which made a sideways
    // drag on ChaTutor a walk through a list nobody thinks of as ordered —
    // and put four screens between MémoiRecall and the games.
    href: () => "/skills",
    hub: "/skills",
    at: (p) =>
      p === "/skills" ||
      p === "/conjugaison" ||
      p === "/tts" ||
      p === "/tutor" ||
      p.startsWith("/practice/ecoutexte") ||
      p.startsWith("/practice/wordrill") ||
      p.startsWith("/games/compose"),
  },
  {
    key: "svplay",
    name: "Games",
    // The same, for Numbers (NumBus + NumBourse inside it, in Dan's own
    // bracket), VocabulaRain and LexicaLater.
    href: () => "/games",
    hub: "/games",
    at: (p) =>
      p === "/games" ||
      p.startsWith("/games/numbers") ||
      p.startsWith("/games/numbus") ||
      p.startsWith("/games/numbourse") ||
      p.startsWith("/games/vocabularain") ||
      p.startsWith("/games/lexicalater") ||
      p.startsWith("/games/matching"),
  },
  // THE CHAIN ENDS AT GAMES. Dan, 2026-09-07: *"LEADERBOARD AND PROFILE SHOULD
  // NOT BE INSIDE THIS CHAIN TAKE THEM OUT"*. They were the last two columns
  // for a day and they do not belong: every station before them is WORK ON A
  // GOAL — guess it, read it, drill it, play it — and where you stand against
  // the class is not work. Swiping through the course should not end up at
  // your own profile any more than reading a book ends at the library card.
  //
  // Out of the RAIL is not out of the app: 👤 User is a family in the bottom
  // bar and the ☰, which is how both pages are reached. Off the rail they
  // simply get no horizontal swipe at all — `railIndex` returns -1 and
  // `railNeighbours` answers null in both directions, the same as Home, the
  // guide and Réglages.
];

/**
 * ONE SHAPE FOR A PATH before anything is matched against it.
 *
 * The site is a static export, so every route exists on disk as a file and
 * `/conjugaison.html` is as real a URL as `/conjugaison` — a learner who
 * bookmarks one or a host that serves one is not off the rail. A trailing
 * slash is the same story from the other direction. Without this the five
 * stations matched by an exact `===` (ConjugaZone, VoixLà, ChaTutor, the
 * leaderboard, the profile) fell off the rail at those URLs while the ones
 * matched by `startsWith` did not — measured, not reasoned about.
 */
function normalise(path: string): string {
  const p = path
    .replace(/\.html$/, "")
    // Trailing slashes come off FIRST. `/map/embed/` is how a static host
    // serves that page, and testing for `/embed$` before the slash is gone
    // matches nothing — measured, the framed map fell off the rail entirely.
    .replace(/\/+$/, "")
    // An embedded station is the same station: `/map/embed` sits in the map's
    // column, not off the rail (Dan, 7 Sep — everything runs in a frame now).
    .replace(/\/embed$/, "");
  return p === "" ? "/" : p;
}

/** Which column this path is in, or -1 for a page off the rail (Home, the
 *  guide, Réglages). Off-rail pages get no horizontal swipe at all rather
 *  than a guessed one. */
export function railIndex(path: string): number {
  const p = normalise(path);
  return RAIL.findIndex((s) => s.at(p));
}

/** The deck a path is working on, read off the path itself. */
export function deckFromPath(path: string): string | null {
  const p = normalise(path);
  const seg = p.split("/").filter(Boolean);
  const after = (...prefix: string[]) => {
    for (let i = 0; i < prefix.length; i++) if (seg[i] !== prefix[i]) return null;
    return seg[prefix.length] ?? null;
  };
  // A PRE-TEST IS NOT A DECK. `/practice/speculearn/pretest/<id>` has the same
  // shape as `/practice/speculearn/<deck>`, so reading the third segment as a
  // deck turned every pre-test into a deck called "pretest" — measured, and it
  // sent the forward swipe to `/decks/pretest`. The pre-test's id encodes its
  // stop, which is where the real deck comes from.
  if (seg[0] === "practice" && seg[1] === "speculearn" && seg[2] === "pretest") {
    return stopForPretestId(seg[3])?.collectionId ?? null;
  }
  return (
    after("practice", "speculearn") ??
    after("practice", "flip-it") ??
    after("lessons", "deck") ??
    after("decks") ??
    (p.startsWith("/sio/") ? SIOS.find((s) => s.id === seg[1])?.collectionId ?? null : null)
  );
}

const DECK_KEY = "fluolingo:railDeck";

/** Remember the goal you are working on, so the deck survives a trip out to
 *  Skills and back. sessionStorage, not local: it is a where-was-I, not a
 *  preference, and it should die with the tab. */
export function rememberRailDeck(deck: string | null): void {
  if (!deck) return;
  try { window.sessionStorage.setItem(DECK_KEY, deck); } catch {}
}

export function recalledRailDeck(): string | null {
  try { return window.sessionStorage.getItem(DECK_KEY); } catch { return null; }
}

/** What a FRAMED station posts to the cahier page around it when a swipe
 *  should move the whole app. A finger inside an iframe is a touch in another
 *  document, so the rail's listener out there never sees it — see
 *  components/EmbedFrame.tsx. */
export const RAIL_MESSAGE = "fluolingo:rail";
export type RailMessage = { type: typeof RAIL_MESSAGE; href: string };

/** What a framed station posts when its OWN address changed but the station
 *  did not — the goals scroller rewriting `/sio/SIO-0NN` as the magnet moves.
 *
 *  Dan, 2026-09-07, pointing at a news site: *"when u scroll to the end of this
 *  page, it automatically goes into the NEW URL"*. The address bar is half of
 *  what he is describing, and ours could not follow: since 7 Sep the goals run
 *  inside the cahier's iframe, so `history.replaceState` in there rewrites the
 *  FRAME's address, which nobody can see. A learner could flick through all
 *  fifty goals and the bar still said `/sio/SIO-001` — reload and you are back
 *  where you started, and Share sends the wrong goal.
 *
 *  Deliberately NOT `RAIL_MESSAGE`: that one calls `router.push` and re-hosts
 *  the frame. Doing that per goal would be fifty reloads in one flick. This
 *  moves the address and nothing else. */
export const RAIL_URL_MESSAGE = "fluolingo:rail-url";
export type RailUrlMessage = { type: typeof RAIL_URL_MESSAGE; href: string };

/** Move the address to `href` — this document's, and the page's around it.
 *
 *  A feed that rewrites its own URL as it scrolls must call THIS rather than
 *  `history.replaceState` directly. `usePathname()` does not observe a raw
 *  replaceState, so the effect in useRailSwipe that forwards a same-station
 *  change never fires for one; the scroller is the only thing that knows the
 *  address moved, so the scroller is what says so. */
export function syncScrollUrl(href: string): void {
  try { window.history.replaceState(null, "", href); } catch {}
  try {
    if (window.self !== window.top) {
      window.parent.postMessage({ type: RAIL_URL_MESSAGE, href }, window.location.origin);
    }
  } catch {}
}

export type RailMove = { href: string; name: string } | null;

/** Where a sideways drag goes from here. `back` is rightwards, `forward` is
 *  leftwards. Either is null at the end of the rail, or off it. */
export function railNeighbours(path: string, deck: string | null): { back: RailMove; forward: RailMove } {
  const here = normalise(path);
  const i = railIndex(here);
  if (i < 0) return { back: null, forward: null };
  /** Walk outwards until a station has something for this goal, or the rail
   *  runs out. An empty column is stepped over, never landed on. */
  const move = (step: -1 | 1): RailMove => {
    for (let j = i + step; j >= 0 && j < RAIL.length; j += step) {
      const s = RAIL[j];
      if (s.has && !s.has(deck)) continue;
      const href = s.href(deck);
      // A station that can only offer the page you are already on is not a move.
      if (normalise(href) === here) continue;
      return { href, name: s.name };
    }
    return null;
  };
  /* INSIDE A HUB, BACK IS THE HUB (Dan, 2026-09-07). Standing on ChaTutor,
     rightwards is « Skills », not « ComposeIt » — the six are doors off one
     page, not a row of stations, and the way out of a door is back through it.
     Forward still leaves the column, so the chain never dead-ends. */
  const hub = RAIL[i].hub;
  const back = hub && normalise(hub) !== here ? { href: hub, name: RAIL[i].name } : move(-1);
  return { back, forward: move(1) };
}
