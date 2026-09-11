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
import { lessonHasVerbs } from "@/content/lessonVerbs";
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
    key: "wordrill",
    name: "WorDrill",
    /* THE THREE SKILLS ARE THREE COLUMNS AGAIN, IN DAN'S ORDER (2026-09-08).
       He wrote the whole chain out station by station — "MémoiRecall … swipe
       left for ConjugaZone", then corrected himself an hour later: *"can you
       swap the WorDrill (comes first) and ConjugaZone (last)"*. So the tail is
       WorDrill → ÉcouTexte → ConjugaZone, and it ENDS there ("[end of left
       swipe]").

       This reverses the 7 Sep hub, and the reversal is narrower than it looks
       rather than a decision taken twice. That day six skills became one
       column because a sideways drag through ChaTutor, VoixLà and ComposeIt
       was "a walk through a list nobody thinks of as ordered". These three ARE
       ordered — say it, hear it, conjugate it, on one lesson — and the other
       three are not in the chain at all. Skills stays a hub PAGE for the ☰ and
       the bottom bar; what it is no longer is a station.

       WorDrill's per-lesson address already exists: `/practice/say-it/<deck>`
       is the same engine the unit-picker page compiles. */
    href: (deck) => (deck ? `/practice/say-it/${deck}` : "/practice/wordrill"),
    at: (p) => p.startsWith("/practice/wordrill") || p.startsWith("/practice/say-it"),
  },
  {
    key: "ecoutexte",
    name: "ÉcouTexte",
    /* PER-LESSON SINCE 2026-09-08. ÉcouTexte builds its mini-texts from a UNIT,
       not a deck, and offers fifteen scenarios through a dropdown — three per
       unit — so this column used to land a learner on whatever the picker
       happened to be showing. `content/textgen/lessonScenario.ts` says which of
       a unit's three texts belongs to each stop, and the lesson route opens on
       it with no dropdown at all: arriving from a lesson, the choice is already
       made. The general page keeps its picker. */
    href: (deck) => (deck ? `/practice/ecoutexte/${deck}` : "/practice/ecoutexte"),
    at: (p) => p.startsWith("/practice/ecoutexte"),
  },
  {
    key: "conjugaison",
    name: "ConjugaZone",
    /* ONE PAGE, THE LESSON IN ITS ADDRESS (Dan, 2026-09-08: *"ConjugaZone page
       would land on the same single conjugazone page but land on the particular
       verbs that we have assigned for that lesson"*, and then the question that
       decides the shape of it — *"will it be able to return via the swipe right
       way from ConjugaZone back through the entire chain?"*).

       It can only do that if the lesson is IN THE URL. All fifty lessons share
       `/conjugaison`, so a right swipe has nothing to read; `?v=` alone cannot
       stand in for it, because two lessons can share a verb. The remembered
       deck cannot either — open this page from a bookmark, a link sent to a
       student, or after the phone dropped the tab, and there is no memory to
       read, so the swipe would land on somebody else's lesson or on a picker.
       `?deck=` survives all three.

       THE VERBS ARE NOT IN THE ADDRESS, and that is on purpose. `?deck=` is
       already the whole answer — content/lessonVerbs.ts turns a lesson into its
       verbs, and the page reads it there. Spelling them out as well would put
       the same fact in two places, and the copy in a bookmarked URL would be
       the stale one the day a verb moves. `?v=` still works, and still means
       what it always did: drill exactly these, whatever lesson you came from.

       AND A LESSON WITH NO VERBS IS STEPPED OVER. Ten of the fifty conjugate
       nothing — alphabet, colours, numbers, nouns — so `has` sends a learner
       swiping left off ÉcouTexte on SIO-003 to the end of the chain rather
       than into an empty drill. Same rule as SpecuLearn's, one column along. */
    href: (deck) => (deck ? `/conjugaison?deck=${deck}` : "/conjugaison"),
    at: (p) => p === "/conjugaison",
    has: (deck) => {
      const stop = stopForDeck(deck);
      return !deck || !stop || lessonHasVerbs(stop.id);
    },
  },
  /* THE CHAIN ENDS AT CONJUGAZONE (Dan, 2026-09-08, closing his own list:
     "[end of left swipe]"). GAMES WAS THE LAST COLUMN AND IS NOT ANY MORE.

     It goes for the reason Leaderboard and Profile went on 7 Sep — "LEADERBOARD
     AND PROFILE SHOULD NOT BE INSIDE THIS CHAIN TAKE THEM OUT" — and the reason
     generalises rather than being about those two pages: every station in this
     list is WORK ON ONE GOAL, guessed, read, drilled, said, heard, conjugated.
     A game is not about a goal; NumBus, VocabulaRain and LexicaLater each stand
     on their own and none of them takes a deck from the lesson you just left.

     Out of the RAIL is not out of the app: 🎮 Games is a family in the bottom
     bar and in the ☰, which is how all four are reached. Off the rail they
     simply get no horizontal swipe — `railIndex` answers -1 and
     `railNeighbours` answers null both ways, the same as Home, the guide,
     Réglages, and now Skills. */
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
    // THE QUERY IS NOT PART OF THE COLUMN (2026-09-08). ConjugaZone carries its
    // lesson in `?deck=` — one page, fifty lessons — so `/conjugaison?deck=aimer`
    // and `/conjugaison` are the same station and must both match `at`. The deck
    // itself is read by `deckFromPath` below, before this strips it.
    .replace(/[?#].*$/, "")
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
  /* THE LESSON MAY BE IN THE QUERY, and on exactly one station it always is.
     Dan asked whether a single-page ConjugaZone could still swipe right through
     the whole chain (2026-09-08); it can only do so if the page says which
     lesson it is showing, and `?deck=` is that. Read it BEFORE `normalise`
     throws the query away, and accept it only on the station that issues it —
     a `?deck=` bolted onto any other address would be a second way of saying
     what that address already says, and the two would drift. */
  const q = path.match(/[?&]deck=([^&#]+)/);
  if (q && normalise(path) === "/conjugaison") return decodeURIComponent(q[1]);
  const p = normalise(path);
  const seg = p.split("/").filter(Boolean);
  const after = (...prefix: string[]) => {
    for (let i = 0; i < prefix.length; i++) if (seg[i] !== prefix[i]) return null;
    return seg[prefix.length] ?? null;
  };
  /* A ROUTE UNDER SPECULEARN IS NOT A DECK, and this has now cost the same bug
     twice. `/practice/speculearn/<deck>` and `/practice/speculearn/pretest/<id>`
     have the same shape, so reading the third segment as a deck turned every
     pre-test into a deck called "pretest" and sent the forward swipe to
     `/decks/pretest`. The merged SpecuLearn (7 Sep) added
     `/practice/speculearn/goal/<SIO>` and did it again: measured on the built
     export, scrolling off the end of goal 41 landed on `/decks/goal`.

     So the sub-routes are named ONCE, here, and each says where its real deck
     comes from. verify140 reads the route folders off disk and fails if a new
     one is added without a line in this map — the third time is not going to be
     found by hand either. */
  if (seg[0] === "practice" && seg[1] === "speculearn") {
    if (seg[2] === "pretest") return stopForPretestId(seg[3])?.collectionId ?? null;
    if (seg[2] === "goal") return SIOS.find((s) => s.id === seg[3])?.collectionId ?? null;
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
/**
 * THE OTHER AXIS: the same station, one GOAL along.
 *
 * Dan laid the whole thing out on 2026-09-08, and said the same sentence about
 * every station in the list: *"swipe up and down to the next or previous SIO —
 * swipe left for [the next activity] … swipes down to the next SIO (newURL), up
 * to the previous SIO"*.
 *
 * So the app is a GRID, not a line. Across is the activity; down is the course:
 *
 *              SIO      SpecuLearn   MneMemo   MémoiRecall   WorDrill   …
 *     goal 22   ·            ·          ·           ·           ·
 *     goal 23   ·            ·          ·  YOU       ·           ·
 *     goal 24   ·            ·          ·           ·           ·
 *
 * and moving down from MémoiRecall on goal 23 lands on MémoiRecall for goal 24
 * — the same activity, the next goal, its own URL. That last part is the whole
 * reason this cannot be a scroll inside one page: Dan asked for a new address
 * each time, so a reload, a bookmark and a link all keep their place.
 *
 * THIS REPLACES WHAT THE END OF A SCROLL USED TO DO. On 7 Sep, reaching the
 * bottom carried a learner to the next STATION — the last question of a
 * pre-test landed on the lesson. Under the grid that is the LEFT swipe's job
 * and downwards belongs to the course, so the two gestures stop meaning the
 * same thing. One finger, one meaning, per direction.
 *
 * A STATION WITH NOTHING FOR THE NEXT GOAL IS STEPPED OVER, exactly as an empty
 * column is stepped over going sideways: SpecuLearn skips a goal that has no
 * questions rather than landing a learner on an empty run.
 */
export function sioNeighbours(path: string, deck: string | null): { up: RailMove; down: RailMove } {
  const here = normalise(path);
  const i = railIndex(here);
  if (i < 0) return { up: null, down: null };
  const station = RAIL[i];
  /* WHICH GOAL AM I ON? The address answers it on the goals scroller
     (`/sio/SIO-023`); everywhere else the deck does. A station standing on no
     goal at all — ÉcouTexte's general page, WorDrill's unit picker — has no
     place in the column to move from, so it offers no vertical move rather
     than guessing at goal 1. */
  const fromPath = here.startsWith("/sio/") ? here.slice(5) : null;
  const stop = fromPath ? SIOS.find((s) => s.id === fromPath) : stopForDeck(deck);
  if (!stop) return { up: null, down: null };
  const at = SIOS.findIndex((s) => s.id === stop.id);
  if (at < 0) return { up: null, down: null };

  const move = (step: -1 | 1): RailMove => {
    for (let j = at + step; j >= 0 && j < SIOS.length; j += step) {
      const s = SIOS[j];
      const d = s.collectionId ?? null;
      if (station.has && !station.has(d)) continue;
      const href = station.key === "goals" ? `/sio/${s.id}` : station.href(d);
      if (normalise(href) === here) continue;
      return { href, name: `${station.name} · goal ${s.num}` };
    }
    return null;
  };
  return { up: move(-1), down: move(1) };
}

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
