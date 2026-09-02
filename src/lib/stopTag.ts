/**
 * WHICH STOP AM I ON? — the one answer, for every surface that has one.
 *
 * Dan, 2026-09-01, closing a four-part chrome audit: *"there are pages where
 * there is no identity tag regarding which stop it belongs to."* He was right
 * about the whole app. A learner deep in Flip It, a deck's MCQ or a pre-test
 * had nothing on screen saying which of the fifty stops the work belonged to —
 * the page named the ACTIVITY and the DECK and never the position, so the only
 * way back to "where am I on the course" was the map.
 *
 * WHY A SHARED FILE. `SIOS.find((s) => s.collectionId === …)` was already
 * written out twice — DrillShell (for the ✕'s exit) and CahierShell (for a
 * deck's pre-test link) — and this adds a third caller and a second lookup
 * shape (a pre-test's id, which encodes its stop rather than carrying it). Two
 * copies of a lookup is how `gapSentence` came to exist; three is not a thing
 * to let happen twice in one day.
 *
 * THE TAG IS DATA, NOT DESCRIPTION. It reads « GOAL 39/50 · Envies et besoins »
 * and says nothing a learner could have guessed from the activity name beside
 * it — which is where it now sits, on the same single line (Dan, 1 Sep).
 */
import { SIOS } from "@/content/sios";

type Sio = (typeof SIOS)[number];

/** The stop a deck belongs to, or null for a deck outside the study path. */
export function stopForDeck(collectionId: string | undefined | null): Sio | null {
  if (!collectionId) return null;
  return SIOS.find((s) => s.collectionId === collectionId) ?? null;
}

/**
 * The stop a pre-test belongs to. A pre-test carries no stop id — the id
 * ENCODES it ("u3-sio039" → SIO-039), which is the only place that string is
 * decoded, so the pattern lives here rather than in each page that needs it.
 * Unit-0 pre-tests are keyed by the stop directly ("SIO-010").
 */
export function stopForPretestId(id: string | undefined | null): Sio | null {
  if (!id) return null;
  const m = /sio-?(\d{2,3})/i.exec(id);
  if (!m) return null;
  const wanted = `SIO-${m[1].padStart(3, "0")}`;
  return SIOS.find((s) => s.id === wanted) ?? null;
}

/**
 * The band's inline tag: where this page sits on the course.
 *
 *     GOAL 39/50 · Envies et besoins
 *
 * THE WORD IS « GOAL » (Dan, 2026-09-01: *"on the website, the words 'stop'
 * before the stop number should also be replaced with goal"*). The brand is
 * Fluency On Linguistic GOALS and the family that holds the path is 🎯 Goals,
 * so « stop » was the one place the course called its own unit something the
 * rest of the app does not. `SIO` stays in the content and the ids; this is
 * the learner-facing word.
 *
 * THE POSITION, not the id: `SIO-039` means nothing to a learner, and "39/50"
 * is the figure Home already shows in its counter well, so the two surfaces
 * agree about where you are without anyone translating.
 *
 * THE NAME IS `short`, not `topic`. The band is ONE LINE and the tag sits
 * after the activity's name on it; `topic` runs to 55 characters ("en / au /
 * aux / à — prepositions for cities & countries") and would be an ellipsis on
 * every phone. `short` is the curriculum's own compact name, capped at 14
 * characters by check:short, and it is what the map labels each goal with — so
 * a learner reads the same words here and there.
 *
 * The UNIT is gone from the tag: it was a third figure on a line that now has
 * to hold an activity name too, and the position already implies it.
 */
export function stopTag(sio: Sio | null): string | undefined {
  if (!sio) return undefined;
  const n = SIOS.indexOf(sio) + 1;
  return `GOAL ${n}/${SIOS.length} · ${sio.short}`;
}

/** Shorthand for the common case: a deck id straight to its band tag. */
export function stopTagForDeck(collectionId: string | undefined | null): string | undefined {
  return stopTag(stopForDeck(collectionId));
}
