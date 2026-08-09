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

/**
 * Decks that existed, were used, and are gone. History must stay readable.
 * `name` goes in the cell; `story` goes in the tooltip, because a table column
 * is no place for a sentence but a teacher asking "what happened to this?"
 * deserves the answer within reach.
 */
const RETIRED: Record<string, { name: string; story: string }> = {
  modaux: {
    name: "Modaux",
    story: "Split into modaux-plans (SIO-047) + modaux-avis (SIO-048) on 2026-08-09.",
  },
  "les-de": {
    name: "Quantités",
    story: "Folded into SIO-042 (partitifs) on 2026-08-09.",
  },
  "manger-boire": {
    name: "Manger / boire",
    story: "Retired into ConjugaZone on 2026-08-02.",
  },
  "au-marche": {
    name: "Au marché",
    story: "Never a real deck id — a Compose bank pointed here in error, repointed to commerces.",
  },
  "directions-matching": {
    name: "Directions (matching)",
    story: "Pre-migration legacy file, deleted 2026-08-02.",
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
};

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
  ["/practice/speculearn/", "SpecuLearn"],
  ["/practice/ecoutexte", "ÉcouTexte"],
  ["/games/lexicalater/", "LexicaLater"],
  ["/games/vocabularain/", "VocabulaRain"],
  ["/games/matching/", "Matching"],
  ["/games/compose/", "Compose It"],
  ["/games/numbourse", "NumBourse"],
  ["/games/numbus", "NumBus"],
  ["/pretests/picture/", "Picture pretest"],
  ["/pretests/", "Pretest"],
  ["/lessons/", "Leçon"],
  ["/decks/", "Deck"],
  ["/conjugaison", "ConjugaZone"],
  ["/reviser", "DéjàRevu"],
  ["/tutor", "ChaTutor"],
  ["/moi", "My Progress"],
  ["/teacher", "Teacher"],
  ["/activities", "Index"],
  ["/leaderboard", "Leaderboard"],
  ["/profil", "Profile"],
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
  "complete-it": { name: "Complete It", href: (d) => (d ? `/practice/complete-it/${d}` : null) },
  "dice-practice": { name: "Dice", href: (d) => (d ? `/practice/dice/${d}` : null) },
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

let deckToSio: Map<string, string> | null = null;
function sioForDeck(deckId: string): string | undefined {
  if (!deckToSio) {
    deckToSio = new Map();
    for (const s of SIOS) if (s.collectionId) deckToSio.set(s.collectionId, s.id);
  }
  return deckToSio.get(deckId);
}

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
  if (gone) return { label: `${gone.name} (retiré)`, retired: true, note: gone.story };

  const sio = sioForDeck(id) ?? sioForDeck(id.replace(/-letris$/, ""));
  const title = deckTitle(id) ?? deckTitle(id.replace(/-letris$/, ""));
  if (sio) {
    const topic = topicOf(sio);
    return { label: `${sio} · ${title ?? topic ?? id}`, sio, topic };
  }
  // A real deck with no SIO pointing at it, or an id we simply don't know.
  return { label: title ?? id };
}

/** `activity · SIO-0NN · Topic`, or the honest fallback when nothing resolves. */
function withDeck(activity: string, tail: string): PathInfo {
  if (!tail) return { label: activity };
  const d = describeDeck(tail);
  return { ...d, label: `${activity} · ${d.label}` };
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
    return { label: topic ? `${sio} · ${topic}` : sio, sio, topic };
  }

  const unit = /^\/unit\/(\d+)/.exec(path);
  if (unit) return { label: `Unité ${unit[1]}` };
  if (path === "/") return { label: "Accueil" };

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
 * Where a labelled row should link to. Null only when there is genuinely
 * nowhere to go — which is rarer than the old `startsWith("/")` test assumed,
 * and is why key-recorded surfaces used to render as dead text.
 */
export function hrefForActivity(raw: string | null | undefined): string | null {
  if (!raw || raw === "unknown") return null;
  const id = normalizePath(raw);
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
