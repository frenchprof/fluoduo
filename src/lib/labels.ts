/**
 * Human labels for raw paths, activity keys and deck ids — ONE definition.
 *
 * WHY: the dashboard rendered internal identifiers straight to screen —
 * `/practice/flip-it/modaux`, `say-it:possessives`, `letris · objets-articles`.
 * Dan, 2026-08-10: "a lot of the items are not labelled by the SIO no, which
 * makes it very hard to trace back what is what later." Correct, and it is the
 * same root cause as the evidence-model join table and the gap-sentence bug: an
 * id is not a label, several call sites each invented their own answer, and
 * inferring one from the other is what makes `u4-sio045-01` look like SIO-045
 * when it is SIO-043.
 *
 * Before this module there were four labellers: two hand-written
 * `labelActivity` functions (teacher/Students.tsx and moi/MoiContent.tsx, which
 * disagreed — "Composer" vs "Compose It", one knew about `mcq:` keys and the
 * other didn't) and two tables that gave up and printed the raw path. None of
 * them knew the SIO.
 *
 * Everything here resolves at READ TIME. Nothing is written, no migration is
 * needed, and every historical record picks up a label the moment this ships —
 * which is just as well, since `users/{uid}/responses` is append-only in the
 * rules and could not be backfilled even deliberately.
 *
 * RETIRED IDS ARE NOT ERRORS. A teacher looking at July sees decks that no
 * longer exist. Those views really happened; the deck was merged or split
 * afterwards. Rendering "modaux" as unknown would be a lie about the past, so
 * retired ids keep their name and gain the story of what became of them.
 *
 * A LABEL MUST NOT COST A LINK. Every id that had somewhere to go before still
 * goes there — `hrefForActivity` is the counterpart to `describeActivity`, and
 * the two share the surface table below so they cannot drift apart.
 */
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { outcomeForItem } from "@/lib/evidence";
import {
  type Journey,
  JOURNEY_APP,
  journeyForSio,
  journeyForSurface,
  journeyForUnit,
  sioForDeck,
} from "@/lib/curriculum";

/**
 * Decks that existed, were used, and are gone. History must stay readable.
 * `name` goes in the cell; `story` goes in the tooltip, because a table column
 * is no place for a sentence but a teacher asking "what happened to this?"
 * deserves the answer within reach.
 */
// CHECKED AGAINST sios.json, 2026-08-10. `directions-matching` was in this
// table and should never have been: SIO-036 points at it and learners are
// using it. Because describeDeck consults RETIRED *before* the outcome lookup,
// every one of its responses rendered "(retiré)" with no SIO. An obituary for
// something still alive is worse than no label at all — anything added here
// must be absent from CURATED and unreferenced by any SIO.
const RETIRED: Record<string, { name: string; story: string; wasSio?: string }> = {
  modaux: {
    wasSio: "SIO-047",
    name: "Modaux",
    story: "Split into modaux-plans (SIO-047) + modaux-avis (SIO-048) on 2026-08-09.",
  },
  "les-de": {
    wasSio: "SIO-042",
    name: "Quantités",
    story: "Folded into SIO-042 (partitifs) on 2026-08-09.",
  },
  "manger-boire": {
    name: "Manger / boire",
    story: "Retired into ConjugaZone on 2026-08-02.",
  },
  "au-marche": {
    wasSio: "SIO-044",
    name: "Au marché",
    story: "Never a real deck id — a Compose bank pointed here in error, repointed to commerces.",
  },
};

export type PathInfo = {
  /** What to show. */
  label: string;
  /** Curriculum outcome, when the target resolves to one. */
  sio?: string;
  topic?: string;
  /** True when the target no longer exists — `note` says what became of it. */
  retired?: boolean;
  /** Extra context for a tooltip. Never needed to understand the label. */
  note?: string;
  /** Where this sits on the learner's path, for chronological sorting. */
  journey?: Journey;
};

/** Sort key for any labelled row. Unknown positions sort last, not first. */
export function journeyKey(info: PathInfo): number {
  return info.journey?.key ?? Number.MAX_SAFE_INTEGER;
}

/**
 * The 2026-07-20 route renames split ONE exercise's history into two labels.
 * Normalising first means old and new evidence merge into a single row.
 *
 * Renames ONLY — routes that still exist are left alone. `/practice/say-it/…`
 * is deliberately absent: it reads as "WorDrill" but it is still a live route
 * with its own `[collectionId]` page, and rewriting it to `/practice/wordrill`
 * (which takes no parameter) would turn a working link into a 404.
 */
export function normalizePath(id: string): string {
  return (id || "")
    .replace(/^\/games\/letris(?=\/|$)/, "/games/vocabularain")
    .replace(/^\/games\/conveyor(?=\/|$)/, "/games/lexicalater")
    .replace(/^\/practice\/devine(?=\/|$)/, "/practice/speculearn")
    .replace(/^\/practice\/oral(?=\/|$)/, "/practice/wordrill")
    .replace(/^letris:/, "vocabularain:")
    .replace(/^devine:/, "speculearn:")
    .replace(/^conveyor:/, "lexicalater:")
    .replace(/^lexicalator:/, "lexicalater:")
    .replace(/^sorting:/, "dice-practice:")
    .replace(/^dice:/, "dice-practice:")
    .replace(/^lesson-dice:/, "dice-practice:")
    .replace(/^compose-solo:/, "compose:");
}

const PATH_NAMES: Array<[string, string]> = [
  ["/practice/flip-it/", "Flip It"],
  ["/practice/grammarathon/finale", "GramMarathon Final"],
  ["/practice/grammarathon/", "GramMarathon"],
  ["/practice/complete-it/", "Complete It"],
  ["/practice/say-it/", "WorDrill"],
  ["/practice/wordrill", "WorDrill"],
  ["/practice/dice/", "Dice"],
  ["/practice/speculearn", "SpecuLearn"],
  ["/practice/ecoutexte", "ÉcouTexte"],
  ["/games/lexicalater", "LexicaLater"],
  ["/games/vocabularain", "VocabulaRain"],
  ["/games/matching/", "Matching"],
  ["/games/compose/", "Compose It"],
  ["/games/numbourse", "NumBourse"],
  ["/games/numbus", "NumBus"],
  ["/pretests/picture/", "Picture pretest"],
  ["/pretests/", "Pretest"],
  ["/lessons/", "Lesson"],
  ["/decks/", "Deck"],
  ["/conjugaison", "ConjugaZone"],
  ["/reviser", "DéjàRevu"],
  ["/tutor", "ChaTutor"],
  ["/moi", "My Progress"],
  ["/teacher", "Teacher"],
  ["/map", "Carte"],
  ["/leaderboard", "Leaderboard"],
  ["/profil", "Profile"],
  // Routes that existed in siteTabs.ts and nowhere here, so the teacher saw
  // them raw: the three galleries above (their trailing-slash forms never
  // matched the gallery route itself) plus these four.
  ["/tts", "VoixLà"],
  ["/guide", "Guide"],
  ["/about", "About"],
  ["/hidden/vocabularain", "VocabulaRain (hi-scores)"],
];

/**
 * Surfaces that record under a KEY rather than a route (`say-it:possessives`,
 * `mcq:aliments`) — the games and drills whose activityId was never a URL.
 * `href` is here rather than in a second table on purpose: a label and its
 * destination that live apart are a label and a destination that drift.
 */
const KEY_SURFACES: Record<string, { name: string; href: (deck: string) => string | null }> = {
  mcq: { name: "Deck MCQ", href: (d) => (d ? `/decks/${d}/mcq` : null) },
  grammarathon: { name: "GramMarathon", href: (d) => (d ? `/practice/grammarathon/${d}` : null) },
  finale: { name: "GramMarathon Final", href: () => "/practice/grammarathon/finale" },
  speculearn: { name: "SpecuLearn", href: (d) => (d ? `/practice/speculearn/${d}` : "/practice/speculearn") },
  "say-it": { name: "WorDrill", href: (d) => (d ? `/practice/say-it/${d}` : "/practice/wordrill") },
  wordrill: { name: "WorDrill", href: () => "/practice/wordrill" },
  // iComplete's ROUTE IS DELETED (Dan, 2026-08-31: "iComplete is to be deleted,
  // or at least converted to Intermediaire and Difficile within Memo"). The
  // conversion landed first — the Memo ladder's Moyen and Difficile ARE
  // one- and two-piece completion (#97) — so the standalone drill was the same
  // exercise under a second name, and #99 had already taken away its door.
  //
  // The NAME stays and the href goes to null. Those are separate jobs and only
  // the second one is affected by a deleted page: a learner who sat iComplete
  // in July still has those answers in their history, and "Complete It" is what
  // they were doing. A row that reads "(unlabelled)" would erase their work;
  // a row that LINKS would 404. So: labelled, not linked.
  "complete-it": { name: "Complete It", href: () => null },
  "dice-practice": { name: "Sorting", href: (d) => (d ? `/practice/dice/${d}` : null) },
  "flip-it": { name: "Flip It", href: (d) => (d ? `/practice/flip-it/${d}` : null) },
  ecoutexte: { name: "ÉcouTexte", href: () => "/practice/ecoutexte" },
  compose: { name: "Compose It", href: (d) => (d ? `/games/compose/${d}` : null) },
  vocabularain: { name: "VocabulaRain", href: (d) => (d ? `/games/vocabularain/${d}` : "/games/vocabularain") },
  lexicalater: { name: "LexicaLater", href: (d) => (d ? `/games/lexicalater/${d}` : "/games/lexicalater") },
  matching: { name: "Matching", href: (d) => (d ? `/games/matching/${d}` : null) },
  numbus: { name: "NumBus", href: () => "/games/numbus" },
  numbourse: { name: "NumBourse", href: () => "/games/numbourse" },
  conjugaison: { name: "ConjugaZone", href: () => "/conjugaison" },
  reviser: { name: "DéjàRevu", href: () => "/reviser" },
  tutor: { name: "ChaTutor", href: () => "/tutor" },
};

function deckTitle(deckId: string): string | undefined {
  return CURATED.find((c) => c.id === deckId)?.title;
}

function topicOf(sio: string): string | undefined {
  return SIOS.find((s) => s.id === sio)?.topic;
}

/**
 * A deck id on its own: `partitifs` → "SIO-042 · Défini ou partitif ?".
 *
 * The `-letris` suffix is a VocabulaRain packaging detail, not a curriculum
 * one — `partitifs-letris` is the same material as `partitifs`, so it inherits
 * the outcome rather than reading as an unknown id.
 */
export function describeDeck(id: string): PathInfo {
  if (!id) return { label: "—" };
  const gone = RETIRED[id];
  // A retired deck keeps the position it taught from, so July's records still
  // sort into the week they belong to rather than piling up at the end.
  if (gone)
    return {
      label: `${gone.name} (retired)`,
      retired: true,
      note: gone.story,
      journey: journeyForSio(gone.wasSio),
    };

  // `-letris` is a VocabulaRain packaging detail, not a curriculum one, and the
  // game's ROUTE drops it again (`/games/vocabularain/weather` for the deck
  // `weather-letris`). Try the id both ways so neither spelling reads as
  // unknown — the same both-ways lookup Activities.tsx already does.
  const bare = id.replace(/-letris$/, "");
  const sio = sioForDeck(id);
  const title = deckTitle(id) ?? deckTitle(bare) ?? deckTitle(`${id}-letris`);
  if (sio) {
    const topic = topicOf(sio);
    return { label: `${sio} · ${title ?? topic ?? id}`, sio, topic, journey: journeyForSio(sio) };
  }
  // A real deck with no SIO pointing at it, or an id we simply don't know.
  return { label: title ?? id };
}

/**
 * `SIO-0NN · Activity · Topic` — the outcome FIRST.
 *
 * Dan, 2026-08-10: "every item must have the SIO at the start for everything."
 * The outcome is the thing being looked up; the activity is merely which drill
 * happened to deliver it. Leading with the SIO also puts every row's most
 * scannable token in the same column position, so thirty rows can be read down
 * the left edge instead of parsed one line at a time — and sorting the column
 * then sorts by curriculum rather than by exercise name.
 *
 * Rows with no outcome keep `Activity · deck`. There is no SIO to lead with,
 * and inventing one would be worse than a ragged edge.
 */
function withDeck(activity: string, tail: string): PathInfo {
  // No deck: the surface itself has to say where it sits (NumBus drills
  // numbers, WorDrill pronunciation, ConjugaZone spans everything).
  if (!tail) return { label: activity, journey: journeyForSurface(activity) };
  const d = describeDeck(tail);
  if (d.sio) {
    const rest = deckTitle(tail) ?? d.topic;
    return { ...d, label: `${d.sio} · ${activity}${rest ? ` · ${rest}` : ""}` };
  }
  return { ...d, label: `${activity} · ${d.label}`, journey: d.journey ?? journeyForSurface(activity) };
}

/**
 * Describe a route the learner visited. Falls back to the raw path rather than
 * inventing a name — an honest "unknown" beats a plausible wrong answer.
 */
export function describePath(raw: string): PathInfo {
  if (!raw) return { label: "—" };
  const path = normalizePath(raw);

  // /sio/SIO-021 — the outcome IS the path.
  const sioMatch = /^\/sio\/(SIO-[0-9A-Z]+)/.exec(path);
  if (sioMatch) {
    const sio = sioMatch[1];
    const topic = topicOf(sio);
    return { label: topic ? `${sio} · ${topic}` : sio, sio, topic, journey: journeyForSio(sio) };
  }

  // A unit hub sorts at the HEAD of its unit — a learner opens it before
  // anything taught inside it.
  const unit = /^\/unit\/(\d+)/.exec(path);
  if (unit) return { label: `Unité ${unit[1]}`, journey: journeyForUnit(Number(unit[1])) };
  if (path === "/") return { label: "Accueil", journey: JOURNEY_APP };

  // Longest prefix wins, so /practice/grammarathon/finale beats /practice/grammarathon/.
  let activity: string | undefined;
  let prefixLen = 0;
  for (const [prefix, name] of PATH_NAMES) {
    if (path.startsWith(prefix) && prefix.length > prefixLen) {
      activity = name;
      prefixLen = prefix.length;
    }
  }
  if (!activity) return { label: path };

  // First segment after the prefix. The leading-slash strip matters: prefixes
  // without a trailing slash (`/practice/wordrill`) would otherwise yield "".
  const tail = path.slice(prefixLen).replace(/^\/+/, "").split("/")[0];
  return withDeck(activity, tail);
}

/** Split `say-it:possessives` / `numbus` into surface and deck. */
function splitKey(id: string): { surface?: { name: string; href: (d: string) => string | null }; deck: string } {
  const colon = id.indexOf(":");
  const head = colon >= 0 ? id.slice(0, colon) : id;
  const deck = colon >= 0 ? id.slice(colon + 1).split("/")[0] : "";
  return { surface: KEY_SURFACES[head], deck };
}

/**
 * Describe an `activityId` from a response document. Most are pathnames — those
 * go to describePath — but a handful are keys written by surfaces that have no
 * route of their own (`mcq:aliments`, `numbus`).
 */
export function describeActivity(raw: string | null | undefined): PathInfo {
  if (!raw || raw === "unknown") return { label: "(unlabelled)" };
  const id = normalizePath(raw);
  if (id.startsWith("/")) return describePath(id);
  const { surface, deck } = splitKey(id);
  if (surface) return withDeck(surface.name, deck);
  return { label: id };
}

/**
 * Routes that no longer exist, whose answers are still in people's histories.
 *
 * A path-shaped activityId is normally its own href — that is what makes a
 * history row clickable without a table. But `/practice/complete-it/aliments`
 * is a real id sitting in real response documents and, since the route was
 * deleted on 31 Aug, a 404. Naming the prefix here is the whole fix: the row
 * keeps its label from PATH_NAMES and simply stops being a link.
 *
 * Prefixes, not exact paths, because the deck id is on the end of every one.
 */
const RETIRED_ROUTES = ["/practice/complete-it/"];

/**
 * Where a labelled row should link to. Null only when there is genuinely
 * nowhere to go — which is rarer than the old `startsWith("/")` test assumed,
 * and is why key-recorded surfaces used to render as dead text.
 */
export function hrefForActivity(raw: string | null | undefined): string | null {
  if (!raw || raw === "unknown") return null;
  const id = normalizePath(raw);
  if (RETIRED_ROUTES.some((p) => id.startsWith(p))) return null;
  if (id.startsWith("/")) return id;
  const { surface, deck } = splitKey(id);
  return surface ? surface.href(deck) : null;
}

/**
 * The Activities panel keys its games `"<game> · <collectionId>"` (built from
 * the event payload, not from a route). Same surfaces, different separator.
 */
function gameKeyToActivityId(key: string): string {
  const [game, deck] = key.split(" · ");
  return deck ? `${game}:${deck}` : game;
}

export function describeGame(key: string): PathInfo {
  return describeActivity(gameKeyToActivityId(key));
}

/** The old table linked to `/games/<key>`, which was never a real route. */
export function hrefForGame(key: string): string | null {
  return hrefForActivity(gameKeyToActivityId(key));
}

/**
 * An ITEM id, SIO first: `lieux-letris-21-aeroport` → "SIO-033 · lieux-letris-21-aeroport".
 *
 * The item id itself is kept, not replaced — it is the only handle on the exact
 * question that was answered, and two items under one outcome need to stay
 * distinguishable. The SIO goes in front so the column scans (Dan, 2026-08-10:
 * "every item must have the SIO at the start for everything").
 *
 * Resolved through the join table in @/lib/evidence, never by parsing the id:
 * after the 2026-07-14 re-cut the pretest files kept their old names, so
 * `u4-sio045-01` is SIO-043 content and the id lies about itself.
 */
export function describeItem(itemId: string): PathInfo {
  if (!itemId) return { label: "—" };
  const sio = outcomeForItem(itemId);
  if (!sio) return { label: itemId };
  return { label: `${sio} · ${itemId}`, sio, topic: topicOf(sio), journey: journeyForSio(sio) };
}

/**
 * The tooltip for a labelled cell: the raw id, plus the obituary when the
 * target is retired. The raw id must always be one hover away — a label that
 * cannot be traced back to what was actually recorded is the problem this
 * module exists to solve, not a second instance of it.
 */
export function titleFor(raw: string | null | undefined): string {
  if (!raw) return "";
  const info = describeActivity(raw);
  return info.note ? `${raw} — ${info.note}` : raw;
}
