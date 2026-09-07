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
 *   > Games [NumBus + NumBourse inside) · VocabulaRain · LexicaLater] >
 *   👤 User (Leaderboard · Profile)
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
 * BOTH ENDS STOP. Swiping right on the map, or left on Profile, does nothing.
 * Dan has not ruled on wrapping and stopping is the reversible choice: a rail
 * that stops can be made to wrap later without anyone having learnt a wrong
 * habit, while a rail that silently teleports from the last station back to the
 * map teaches one.
 *
 * WHY EVERY STATION IS NOT DECK-SCOPED. The first five columns belong to a
 * goal — you guess THIS deck, read THIS lesson, flip THESE cards. From Skills
 * rightwards the activity is not about one goal (ChaTutor, the leaderboard),
 * so those columns are their own hub. The deck is still remembered while you
 * are away, so swiping back right from ConjugaZone returns to the flashcards
 * of the goal you left, not to a picker.
 */
import { SIOS } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";
import { isSpecuLearnReady } from "@/lib/collections/speculearnReady";
import { pretestHrefForDeck } from "@/lib/pretests/routes";
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
    href: (deck) =>
      (deck && isSpecuLearnReady(deck) && `/practice/speculearn/${deck}`) ||
      (deck && pretestHrefForDeck(deck)) ||
      "/practice/speculearn",
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
  { key: "conjugaison", name: "ConjugaZone", href: () => "/conjugaison", at: (p) => p === "/conjugaison" },
  { key: "ecoutexte", name: "ÉcouTexte", href: () => "/practice/ecoutexte", at: (p) => p.startsWith("/practice/ecoutexte") },
  { key: "wordrill", name: "WorDrill", href: () => "/practice/wordrill", at: (p) => p.startsWith("/practice/wordrill") },
  { key: "tts", name: "VoixLà", href: () => "/tts", at: (p) => p === "/tts" },
  { key: "compose", name: "ComposeIt", href: () => "/games/compose", at: (p) => p.startsWith("/games/compose") },
  { key: "tutor", name: "ChaTutor", href: () => "/tutor", at: (p) => p === "/tutor" },
  {
    key: "numbers",
    name: "Numbers",
    href: () => "/games/numbers",
    // NumBus and NumBourse are inside Numbers, in Dan's own bracket — they are
    // rows of this column, not columns of their own.
    at: (p) => p.startsWith("/games/numbers") || p.startsWith("/games/numbus") || p.startsWith("/games/numbourse"),
  },
  { key: "vocabularain", name: "VocabulaRain", href: () => "/games/vocabularain", at: (p) => p.startsWith("/games/vocabularain") },
  { key: "lexicalator", name: "LexicaLater", href: () => "/games/lexicalater", at: (p) => p.startsWith("/games/lexicalater") },
  { key: "leaderboard", name: "Leaderboard", href: () => "/leaderboard", at: (p) => p === "/leaderboard" },
  { key: "profil", name: "Profile", href: () => "/profil", at: (p) => p === "/profil" || p.startsWith("/moi") },
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
  const p = path.replace(/\.html$/, "").replace(/\/+$/, "");
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
  return { back: move(-1), forward: move(1) };
}
