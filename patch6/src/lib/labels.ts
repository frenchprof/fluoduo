/**
 * Human labels for raw paths and activity ids — ONE definition.
 *
 * WHY: the teacher dashboard renders internal identifiers straight to screen —
 * `/practice/flip-it/modaux`, `lieux-letris`, `u4-sio045-01`. Dan, 2026-08-10:
 * "a lot of the items are not labelled by the SIO no, which makes it very hard
 * to trace back what is what later." Correct, and it is the same root cause as
 * the evidence-model join table and the gap-sentence bug: an id is not a label,
 * several call sites each invented their own answer, and inferring one from the
 * other is what makes `u4-sio045-01` look like SIO-045 when it is SIO-043.
 *
 * Before this module there were FOUR labellers: two hand-rolled `labelActivity`
 * functions (teacher/Students.tsx and moi/MoiContent.tsx, which disagreed —
 * "Composer" vs "Compose It", one knew about `mcq:` and the other didn't), and
 * two tables that gave up and printed the raw path. None of them knew the SIO.
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
 * Normalising first means old and new evidence merge into a single row — this
 * used to live privately inside teacher/Students.tsx, where /moi could not see
 * it, which is why the two surfaces disagreed about July.
 */
export function normalizePath(id: string): string {
  return (id || "")
    .replace(/^\/games\/letris(?=\/|$)/, "/games/vocabularain")
    .replace(/^\/games\/conveyor(?=\/|$)/, "/games/lexicalater")
    .replace(/^\/practice\/devine(?=\/|$)/, "/practice/speculearn")
    .replace(/^\/practice\/oral(?=\/|$)/, "/practice/wordrill")
    .replace(/^\/practice\/say-it(?=\/|$)/, "/practice/wordrill")
    .replace(/^letris:/, "vocabularain:")
    .replace(/^devine:/, "speculearn:");
}

const ACTIVITY_NAMES: Array<[string, string]> = [
  ["/practice/flip-it/", "Flip It"],
  ["/practice/grammarathon/finale", "GramMarathon Final"],
  ["/practice/grammarathon/", "GramMarathon"],
  ["/practice/complete-it/", "Complete It"],
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
  ["/sio/", "SIO"],
  ["/conjugaison", "ConjugaZone"],
  ["/reviser", "DéjàRevu"],
  ["/tutor", "ChaTutor"],
  ["/moi", "My Progress"],
  ["/teacher", "Teacher"],
  ["/activities", "Index"],
  ["/leaderboard", "Leaderboard"],
  ["/profil", "Profile"],
];

/** Non-path activity keys: `mcq:aliments`, `grammarathon:partitifs`, … */
const KEY_NAMES: Array<[string, string]> = [
  ["mcq:", "Deck MCQ"],
  ["grammarathon:", "GramMarathon"],
  ["vocabularain:", "VocabulaRain"],
  ["speculearn:", "SpecuLearn"],
  ["numbus:", "NumBus"],
  ["finale:", "GramMarathon Final"],
];

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
 * A deck id on its own: `partitifs` → "SIO-042 · Partitifs".
 *
 * Retired ids keep their name and gain their obituary — see the module note.
 */
export function describeDeck(id: string): PathInfo {
  if (!id) return { label: "—" };
  const gone = RETIRED[id];
  if (gone) return { label: `${gone.name} (retiré)`, retired: true, note: gone.story };
  const sio = sioForDeck(id);
  const title = deckTitle(id);
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
  for (const [prefix, name] of ACTIVITY_NAMES) {
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

/**
 * Describe an `activityId` from a response document. Most are pathnames — those
 * go straight to describePath — but a handful are prefix keys written by
 * surfaces that have no route of their own (`mcq:aliments`).
 */
export function describeActivity(raw: string | null | undefined): PathInfo {
  if (!raw) return { label: "(unlabelled)" };
  const id = normalizePath(raw);
  if (id.startsWith("/")) return describePath(id);
  for (const [prefix, name] of KEY_NAMES) {
    if (id.startsWith(prefix)) return withDeck(name, id.slice(prefix.length).split("/")[0]);
  }
  return { label: id };
}

/** Where a label should link to. Null when the target no longer exists. */
export function hrefForActivity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const id = normalizePath(raw);
  if (id.startsWith("/")) return id;
  if (id.startsWith("mcq:")) return `/decks/${id.slice(4)}`;
  if (id.startsWith("grammarathon:")) return `/practice/grammarathon/${id.slice(13)}`;
  if (id.startsWith("vocabularain:")) return "/games/vocabularain";
  if (id.startsWith("speculearn:")) return `/practice/speculearn/${id.slice(11)}`;
  if (id.startsWith("numbus:")) return "/games/numbus";
  if (id.startsWith("finale:")) return "/practice/grammarathon/finale";
  return null;
}
